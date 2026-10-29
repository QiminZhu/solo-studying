import { z } from "zod";
import { casefold } from "./casefold.ts";

const text = z
  .string()
  .min(1)
  .max(20000)
  .refine((s) => s.trim().length > 0, "Must not be blank.");
const labels = z.array(text).min(2).max(100);
const index = z.number().int().nonnegative();
const common = {
  id: text.refine(
    (id) => !Object.prototype.hasOwnProperty.call(Object.prototype, id),
    "Use a question ID that is not a reserved JavaScript object property.",
  ),
  subject: text,
  topic: text,
  objectiveId: text,
  objectiveIds: z.array(text).min(1).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  cognitiveLevel: z.enum([
    "Remember",
    "Understand",
    "Apply",
    "Analyze",
    "Evaluate",
    "Create",
  ]),
  prompt: text,
  explanation: text,
  sourceRefs: z
    .array(
      z
        .object({ file: text, page: z.number().int().positive().optional() })
        .strict(),
    )
    .min(1)
    .max(100),
  status: z.enum(["draft", "pending_review", "approved", "rejected"]),
  version: z.number().int().positive(),
  tags: z.array(text).optional(),
  // Accepted legacy extension; sourceRefs retain the actual file/page evidence.
  lecture: text.optional(),
};
const choice = {
  answers: labels,
  correct: z.array(index).min(1),
  optionExplanations: z.array(text).min(2),
};
const blankSchema = z.discriminatedUnion("kind", [
  z
    .object({
      id: text,
      kind: z.literal("text"),
      acceptedAnswers: z.array(text).min(1),
      caseSensitive: z.boolean(),
      trim: z.boolean(),
      collapseWhitespace: z.boolean(),
      explanation: text,
    })
    .strict(),
  z
    .object({
      id: text,
      kind: z.literal("number"),
      value: z.number().finite(),
      absoluteTolerance: z.number().finite().nonnegative(),
      unit: z.string().max(200),
      rounding: text,
      explanation: text,
    })
    .strict(),
]);

export const bankQuestionSchema = z
  .discriminatedUnion("type", [
    z.object({ ...common, type: z.literal("single"), ...choice }).strict(),
    z.object({ ...common, type: z.literal("multiple"), ...choice }).strict(),
    z.object({ ...common, type: z.literal("boolean"), ...choice }).strict(),
    z
      .object({
        ...common,
        type: z.literal("matching"),
        leftItems: labels,
        rightItems: labels,
        reuseRight: z.boolean().default(false),
        matches: z.array(z.tuple([index, index])).min(2),
        pairExplanations: z.array(text).min(2),
      })
      .strict(),
    z
      .object({
        ...common,
        type: z.literal("ordering"),
        items: labels.min(3),
        correctOrder: z.array(index).min(3),
        stepExplanations: z.array(text).min(3),
      })
      .strict(),
    z
      .object({
        ...common,
        type: z.literal("fill_blank"),
        blanks: z.array(blankSchema).min(1).max(100),
      })
      .strict(),
  ])
  .superRefine((q, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message: `${q.id}: ${message}` });
    const unique = (values: readonly string[]) =>
      new Set(values.map((s) => casefold(s.trim()))).size === values.length;
    if (
      q.objectiveIds &&
      (new Set(q.objectiveIds).size !== q.objectiveIds.length ||
        !q.objectiveIds.includes(q.objectiveId))
    )
      issue("objectiveIds must be distinct and include objectiveId.");
    if (q.type === "single" || q.type === "multiple" || q.type === "boolean") {
      if (!unique(q.answers)) issue("Answer labels must be distinct.");
      if (
        new Set(q.correct).size !== q.correct.length ||
        q.correct.some((i) => i >= q.answers.length)
      )
        issue(
          "Correct indexes must be distinct and refer to existing options.",
        );
      if (q.optionExplanations.length !== q.answers.length)
        issue("Explain every option in option order.");
      if (
        q.type === "multiple"
          ? q.correct.length < 2 || q.correct.length >= q.answers.length
          : q.correct.length !== 1
      )
        issue(
          "Select-all requires at least two correct and one incorrect option; single/boolean require one correct option.",
        );
      if (
        q.type === "boolean" &&
        JSON.stringify(q.answers) !== '["True","False"]'
      )
        issue('Boolean answers must be ["True", "False"].');
    } else if (q.type === "matching") {
      if (!unique(q.leftItems) || !unique(q.rightItems))
        issue("Labels must be distinct within each matching side.");
      if (
        q.matches.length !== q.leftItems.length ||
        new Set(q.matches.map(([l]) => l)).size !== q.leftItems.length ||
        q.matches.some(
          ([l, r]) => l >= q.leftItems.length || r >= q.rightItems.length,
        )
      )
        issue("Key every left item exactly once with valid indexes.");
      if (
        !q.reuseRight &&
        new Set(q.matches.map(([, r]) => r)).size !== q.matches.length
      )
        issue("Right options cannot be reused unless reuseRight is true.");
      if (q.pairExplanations.length !== q.matches.length)
        issue("Explain every pair in matches order.");
      if (q.reuseRight && !/reus|more than once/i.test(q.prompt))
        issue(
          "State explicitly in the prompt that right options may be reused.",
        );
    } else if (q.type === "ordering") {
      if (!unique(q.items)) issue("Ordering items must be distinct.");
      if (
        q.correctOrder.length !== q.items.length ||
        new Set(q.correctOrder).size !== q.items.length ||
        q.correctOrder.some((i) => i >= q.items.length)
      )
        issue("correctOrder must be a permutation of every item index.");
      if (q.correctOrder.every((item, i) => item === i))
        issue("Present ordering items out of the keyed sequence.");
      if (q.stepExplanations.length !== q.items.length)
        issue("Explain every position in correctOrder order.");
    } else {
      const markers = [...q.prompt.matchAll(/\{\{([^{}]+)\}\}/g)].map(
        (m) => m[1],
      );
      if (
        markers.length !== q.blanks.length ||
        q.blanks.some((b, i) => b.id !== String(i + 1) || markers[i] !== b.id)
      )
        issue(
          "Use each numbered {{1}}, {{2}}, … marker exactly once, in blank order.",
        );
      for (const b of q.blanks)
        if (
          b.kind === "number" &&
          ((b.unit && !q.prompt.includes(b.unit)) ||
            !(q.prompt.includes(b.rounding) ||
              (b.rounding === "none" && /\bNo rounding is required\b/i.test(q.prompt))))
        )
          issue(
            `Blank ${b.id}: state units and rounding instructions in the prompt (including 'none' if applicable).`,
          );
    }
  });
export type BankQuestionV3 = z.infer<typeof bankQuestionSchema>;
export type Blank = z.infer<typeof blankSchema>;
export const bankSchema = z
  .array(bankQuestionSchema)
  .min(1)
  .max(250)
  .superRefine((qs, ctx) => {
    if (new Set(qs.map((q) => q.id)).size !== qs.length)
      ctx.addIssue({
        code: "custom",
        message: "Question IDs must be unique within a bank.",
      });
  });

export const workloadPolicySchema = z
  .object({
    maxQuestions: z.number().int().positive(),
    maxResponseUnits: z.number().int().positive(),
    maxMatchingPairs: z.number().int().positive(),
    maxOrderingItems: z.number().int().positive(),
    maxBlanks: z.number().int().positive(),
    maxChoiceOptions: z.number().int().positive(),
  })
  .strict();
export const defaultWorkloadPolicy = {
  maxQuestions: 20,
  maxResponseUnits: 50,
  maxMatchingPairs: 4,
  maxOrderingItems: 6,
  maxBlanks: 3,
  maxChoiceOptions: 6,
};
export type WorkloadPolicy = z.infer<typeof workloadPolicySchema>;
export function responseUnits(q: BankQuestionV3): number {
  switch (q.type) {
    case "single":
    case "boolean":
      return 1;
    case "multiple":
      return q.answers.length;
    case "matching":
      return q.matches.length;
    case "ordering":
      return q.items.length;
    case "fill_blank":
      return q.blanks.length;
  }
}
export function workloadIssues(
  qs: readonly BankQuestionV3[],
  policy: WorkloadPolicy = defaultWorkloadPolicy,
): string[] {
  const p = workloadPolicySchema.parse(policy);
  const issues: string[] = [];
  if (qs.length > p.maxQuestions)
    issues.push(
      `${qs.length} question objects exceed the policy limit of ${p.maxQuestions}.`,
    );
  const units = qs.reduce((n, q) => n + responseUnits(q), 0);
  if (units > p.maxResponseUnits)
    issues.push(
      `${units} response units exceed the policy limit of ${p.maxResponseUnits}.`,
    );
  for (const q of qs) {
    const [count, cap, part] =
      q.type === "matching"
        ? [q.matches.length, p.maxMatchingPairs, "matching pairs"]
        : q.type === "ordering"
          ? [q.items.length, p.maxOrderingItems, "ordering items"]
          : q.type === "fill_blank"
            ? [q.blanks.length, p.maxBlanks, "blanks"]
            : [q.answers.length, p.maxChoiceOptions, "options"];
    if (count > cap)
      issues.push(
        `${q.id}: ${count} ${part} exceed the policy limit of ${cap}.`,
      );
  }
  return issues;
}
export function parseBank(input: unknown): BankQuestionV3[] {
  const parsed = bankSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(
      parsed.error.issues
        .map(
          (i) => `Question data at ${i.path.join(".") || "bank"}: ${i.message}`,
        )
        .join("\n"),
    );
  return parsed.data;
}
export function importBank(raw: string): BankQuestionV3[] {
  if (new TextEncoder().encode(raw).length > 1_000_000)
    throw new Error("Use a JSON file smaller than 1 MB.");
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  return parseBank(value);
}

export const quizDefinitionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,100}$/),
    title: text,
    description: z.string().max(1000),
    bankId: text,
    bankVersion: z.number().int().positive(),
    questionIds: z.array(text).min(1).max(250),
    feedbackMode: z.enum(["immediate", "deferred"]),
    contentKind: z.enum(["fixture", "draft", "published"]),
    iconAsset: z
      .string()
      .regex(/^\/quiz-icons\/[a-zA-Z0-9_-]+\.(svg|png|webp)$/)
      .optional(),
    revisionGuidance: z
      .record(z.object({ topic: text, guidance: text }).strict())
      .default({}),
  })
  .strict()
  .superRefine((q, ctx) => {
    if (new Set(q.questionIds).size !== q.questionIds.length)
      ctx.addIssue({
        code: "custom",
        message: "Quiz question IDs must be distinct.",
      });
  });
export type QuizDefinition = z.infer<typeof quizDefinitionSchema>;
export const quizBundleSchema = z
  .object({ quiz: quizDefinitionSchema, questions: bankSchema })
  .strict()
  .superRefine(({ quiz, questions }, ctx) => {
    if (
      quiz.questionIds.length !== questions.length ||
      !quiz.questionIds.every((id) => questions.some((q) => q.id === id))
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Quiz questionIds must identify exactly the supplied bank subset.",
      });
  });
export type QuizBundle = z.infer<typeof quizBundleSchema>;

/** A build-time publication gate. Approval artifacts are produced by independent review, never browser import. */
export function publicationIssues(bundle: QuizBundle): string[] {
  const issues = workloadIssues(bundle.questions);
  if (bundle.quiz.contentKind !== "published")
    issues.push("Fixtures and drafts cannot be published.");
  for (const q of bundle.questions) {
    if (q.tags?.includes("software-fixture"))
      issues.push(
        `${q.id}: software fixtures cannot become published lecture content.`,
      );
    if (q.status !== "approved")
      issues.push(
        `${q.id}@${q.version}: only approved versions can be published.`,
      );
    if (q.sourceRefs.some((r) => !r.page))
      issues.push(
        `${q.id}: lecture page references are required for publication.`,
      );
  }
  return issues;
}
