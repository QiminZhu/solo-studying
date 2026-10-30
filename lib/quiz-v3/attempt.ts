import { z } from "zod";
import { quizBundleSchema, type QuizBundle } from "./contract.ts";
import {
  emptyResponse,
  gradeQuestion,
  isAnswered,
  responseErrors,
  responseSchema,
  validResponse,
  type Response,
} from "./grading.ts";

/** Full canonical payload comparison avoids hash collisions when deciding whether grades may be reused. */
export function contentIdentity(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(contentIdentity).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b, "en"))
      .map(([k, v]) => `${JSON.stringify(k)}:${contentIdentity(v)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "null";
}
export const attemptSchema = z
  .object({
    schemaVersion: z.literal(3),
    id: z.string().min(1),
    bundle: quizBundleSchema,
    contentIdentity: z.string(),
    createdAt: z.number().finite().nonnegative(),
    submittedAt: z.number().finite().nonnegative().nullable(),
    index: z.number().int().nonnegative(),
    answers: z.record(responseSchema),
    firstResponses: z.record(responseSchema),
    checked: z.array(z.string()),
    flagged: z.array(z.string()),
    practiceOf: z.string().optional(),
  })
  .strict()
  .superRefine((a, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    const ids = a.bundle.quiz.questionIds;
    if (a.contentIdentity !== contentIdentity(a.bundle))
      fail(
        "Saved question content changed. Retain this attempt separately and start a new version.",
      );
    if (a.index >= ids.length) fail("Saved question position is invalid.");
    if (a.submittedAt !== null && a.submittedAt < a.createdAt)
      fail("Submission predates the attempt.");
    for (const responses of [a.answers, a.firstResponses])
      for (const [id, r] of Object.entries(responses)) {
        const q = a.bundle.questions.find((q) => q.id === id);
        if (!q || !validResponse(q, r))
          fail(`Invalid saved response for ${id}.`);
      }
    for (const list of [a.checked, a.flagged])
      if (
        new Set(list).size !== list.length ||
        list.some((id) => !ids.includes(id))
      )
        fail("Invalid saved navigation state.");
    if (
      a.bundle.quiz.feedbackMode === "deferred" &&
      a.submittedAt === null &&
      (a.checked.length || Object.keys(a.firstResponses).length)
    )
      fail("Deferred attempts must not contain feedback before submission.");
    if (a.checked.some((id) => !a.firstResponses[id]))
      fail("Checked questions must retain their original response.");
    if (a.submittedAt !== null && ids.some((id) => !a.firstResponses[id]))
      fail(
        "Submitted attempts must retain a first response for every question.",
      );
  });
export type Attempt = z.infer<typeof attemptSchema>;
export function createAttempt(
  bundle: QuizBundle,
  id: string,
  now = Date.now(),
  practiceOf?: string,
): Attempt {
  const snapshot = quizBundleSchema.parse(bundle);
  return attemptSchema.parse({
    schemaVersion: 3,
    id,
    bundle: snapshot,
    contentIdentity: contentIdentity(snapshot),
    createdAt: now,
    submittedAt: null,
    index: 0,
    answers: {},
    firstResponses: {},
    checked: [],
    flagged: [],
    ...(practiceOf ? { practiceOf } : {}),
  });
}
function questionFor(a: Attempt, id: string) {
  const q = a.bundle.questions.find((q) => q.id === id);
  if (!q)
    throw new Error("This question is unavailable in the current attempt.");
  return q;
}
export type AttemptAction =
  | { type: "answer"; questionId: string; response: Response }
  | { type: "check" | "retry" | "flag"; questionId: string }
  | { type: "navigate"; index: number }
  | { type: "submit"; confirmUnanswered: boolean; now: number };
/** All grading/reveal transitions share one guarded state boundary. Double submissions are idempotent. */
export function updateAttempt(a: Attempt, action: AttemptAction): Attempt {
  if (action.type === "navigate")
    return {
      ...a,
      index: Math.max(
        0,
        Math.min(a.bundle.quiz.questionIds.length - 1, action.index),
      ),
    };
  if (a.submittedAt !== null) return a;
  if (action.type === "submit") {
    const qs = a.bundle.questions;
    if (
      !action.confirmUnanswered &&
      qs.some((q) => !isAnswered(q, a.answers[q.id]))
    )
      throw new Error(
        "Some questions are unanswered. Return to them or confirm submission with unanswered items.",
      );
    for (const q of qs) {
      const errors = responseErrors(q, a.answers[q.id] ?? emptyResponse(q));
      if (errors.length) throw new Error(errors.join(" "));
    }
    const firstResponses = { ...a.firstResponses };
    for (const q of qs)
      firstResponses[q.id] ??= a.answers[q.id] ?? { kind: "unanswered" };
    return {
      ...a,
      submittedAt: Math.max(a.createdAt, action.now),
      firstResponses,
    };
  }
  const q = questionFor(a, action.questionId);
  if (action.type === "flag")
    return {
      ...a,
      flagged: a.flagged.includes(q.id)
        ? a.flagged.filter((id) => id !== q.id)
        : [...a.flagged, q.id],
    };
  if (action.type === "answer") {
    if (a.checked.includes(q.id)) return a;
    const r = responseSchema.parse(action.response);
    if (!validResponse(q, r))
      throw new Error(
        "Choose valid responses for this question. Right options cannot be reused here.",
      );
    return { ...a, answers: { ...a.answers, [q.id]: r } };
  }
  if (a.bundle.quiz.feedbackMode === "deferred") return a;
  if (action.type === "retry")
    return { ...a, checked: a.checked.filter((id) => id !== q.id) };
  if (a.checked.includes(q.id)) return a;
  const response = a.answers[q.id] ?? { kind: "unanswered" };
  const errors = responseErrors(q, response);
  if (errors.length) throw new Error(errors.join(" "));
  if (!isAnswered(q, response))
    throw new Error("Complete the response before checking it.");
  return {
    ...a,
    checked: [...a.checked, q.id],
    firstResponses: {
      ...a.firstResponses,
      [q.id]: a.firstResponses[q.id] ?? response,
    },
  };
}
export function canReveal(a: Attempt, id: string): boolean {
  return (
    a.submittedAt !== null ||
    (a.bundle.quiz.feedbackMode === "immediate" && a.checked.includes(id))
  );
}
export function attemptSummary(a: Attempt) {
  const qs = a.bundle.questions;
  return {
    total: qs.length,
    answered: qs.filter((q) => isAnswered(q, a.answers[q.id])).length,
    // An unfinished deferred attempt has no scores, including through exported summary helpers.
    score:
      a.submittedAt !== null
        ? qs.reduce((n, q) => n + gradeQuestion(q, a.answers[q.id]).score, 0)
        : null,
    firstScore:
      a.submittedAt !== null
        ? qs.reduce(
            (n, q) => n + gradeQuestion(q, a.firstResponses[q.id]).score,
            0,
          )
        : null,
  };
}
/** Topic totals follow the preserved first check, the same basis as missed-question practice. */
export function topicScores(a: Attempt) {
  const questions = a.bundle.quiz.questionIds.map(
    (id) => a.bundle.questions.find((question) => question.id === id)!,
  );
  return [...new Set(questions.map((question) => question.topic))].map(
    (topic) => {
      const items = questions.filter((question) => question.topic === topic);
      return {
        topic,
        score: items.reduce(
          (total, question) =>
            total + gradeQuestion(question, a.firstResponses[question.id]).score,
          0,
        ),
        total: items.length,
      };
    },
  );
}
export function missedGuidance(a: Attempt) {
  if (a.submittedAt === null) return [];
  const ids = new Set(
    a.bundle.questions
      .filter((q) => gradeQuestion(q, a.firstResponses[q.id]).score === 0)
      .flatMap((q) => q.objectiveIds ?? [q.objectiveId]),
  );
  return [...ids].map((id) => {
    const guidance = Object.hasOwn(a.bundle.quiz.revisionGuidance, id)
      ? a.bundle.quiz.revisionGuidance[id]
      : undefined;
    return { id, ...guidance, supplied: Boolean(guidance) };
  });
}
export const attemptLibrarySchema = z
  .array(attemptSchema)
  .max(200)
  .superRefine((attempts, ctx) => {
    if (new Set(attempts.map((a) => a.id)).size !== attempts.length)
      ctx.addIssue({
        code: "custom",
        message: "Attempt IDs must be distinct.",
      });
  });
export function parseAttempts(raw: string | null): Attempt[] {
  if (!raw) return [];
  try {
    return attemptLibrarySchema.parse(JSON.parse(raw));
  } catch {
    throw new Error(
      "Saved attempts could not be read. Your stored data has been left intact.",
    );
  }
}
