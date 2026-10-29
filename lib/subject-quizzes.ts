import { z } from "zod";
import { lecture9Questions } from "./question-banks/itcs217-lecture9.ts";
import type { BankQuestion } from "./quiz-bank.ts";

export const subjectFolder = {
  id: "itcs217",
  code: "ITCS217",
  name: "Computer Data Communication",
  subject: "ITCS217_Computer Data Communication",
  href: "/subjects/itcs217",
} as const;

export const quizQuestionSchema = z
  .object({
    id: z.string().trim().min(1).max(160),
    subject: z.string().trim().min(1).max(200),
    topic: z.string().trim().min(1).max(200),
    type: z.enum(["single", "multiple", "boolean"]),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    prompt: z.string().trim().min(1).max(10000),
    answers: z.array(z.string().trim().min(1).max(5000)).min(2).max(20),
    correct: z.array(z.number().int().min(0)).min(1).max(20),
    explanation: z.string().trim().min(1).max(20000),
    lecture: z.string().max(200).optional(),
    objectiveId: z.string().max(200).optional(),
    cognitiveLevel: z.string().max(200).optional(),
    optionExplanations: z.array(z.string().max(20000)).max(20).optional(),
    sourceRefs: z
      .array(
        z.object({
          file: z.string().min(1).max(500),
          page: z.number().int().positive(),
        }),
      )
      .max(100)
      .optional(),
    status: z.enum(["pending_review", "draft"]).optional(),
    version: z.number().int().positive().optional(),
    tags: z.array(z.string().max(200)).max(100).optional(),
  })
  .superRefine((question, ctx) => {
    if (new Set(question.answers).size !== question.answers.length)
      ctx.addIssue({
        code: "custom",
        message: "Answer options must be distinct.",
      });
    if (
      new Set(question.correct).size !== question.correct.length ||
      question.correct.some((index) => index >= question.answers.length)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Correct answer indexes must be unique and refer to existing options.",
      });
    if (question.type !== "multiple" && question.correct.length !== 1)
      ctx.addIssue({
        code: "custom",
        message:
          "Single-choice and true/false questions need exactly one correct answer.",
      });
    if (
      question.type === "boolean" &&
      (question.answers.length !== 2 ||
        question.answers[0] !== "True" ||
        question.answers[1] !== "False")
    )
      ctx.addIssue({
        code: "custom",
        message: 'True/false answers must be ["True", "False"].',
      });
    if (
      question.optionExplanations &&
      question.optionExplanations.length !== question.answers.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Provide one option explanation for each answer.",
      });
  });

const quizQuestionsSchema = z
  .array(quizQuestionSchema)
  .min(1)
  .max(250)
  .superRefine((questions, ctx) => {
    if (
      new Set(questions.map((question) => question.id)).size !==
      questions.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Every question must have a unique ID within the quiz.",
      });
    for (const type of ["single", "multiple", "boolean"])
      if (questions.filter((question) => question.type === type).length > 200)
        ctx.addIssue({
          code: "custom",
          message: "A quiz can contain at most 200 questions of each type.",
        });
  });

export const subjectQuizSchema = z
  .object({
    id: z.string().min(1).max(160),
    subjectId: z.literal(subjectFolder.id),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(1000),
    createdAt: z.number().int().nonnegative(),
    questions: quizQuestionsSchema,
  })
  .superRefine((quiz, ctx) => {
    if (
      quiz.questions.some(
        (question) => question.subject !== subjectFolder.subject,
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "Questions must belong to this subject folder.",
      });
  });
export type SubjectQuiz = z.infer<typeof subjectQuizSchema>;

export const originalTestQuiz: SubjectQuiz = subjectQuizSchema.parse({
  id: "itcs217-original-test",
  subjectId: subjectFolder.id,
  title: "Lecture 9 — Original questions",
  description:
    "Test quiz with the original 30 ITCS217 questions. Includes multiple choice, multiple answer, and true/false. Questions remain pending review.",
  createdAt: 0,
  questions: lecture9Questions,
});

export function createSubjectQuiz(
  input: {
    title: string;
    description: string;
    questions: readonly BankQuestion[];
  },
  id: string,
  now = Date.now(),
): SubjectQuiz {
  return subjectQuizSchema.parse({
    ...input,
    id,
    subjectId: subjectFolder.id,
    createdAt: now,
    questions: input.questions.map((question) => ({
      ...question,
      subject: subjectFolder.subject,
    })),
  });
}

/** Import data only. Unknown fields are stripped; source text is never executed. */
export function importQuizQuestions(raw: string): BankQuestion[] {
  if (new TextEncoder().encode(raw).length > 1_000_000)
    throw new Error("Use a JSON file smaller than 1 MB.");
  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  const container = z.object({ questions: z.unknown() }).safeParse(input);
  const parsed = quizQuestionsSchema.safeParse(
    container.success ? container.data.questions : input,
  );
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(
      `Check question data${issue.path.length ? ` at ${issue.path.join(".")}` : ""}: ${issue.message}`,
    );
  }
  return parsed.data.map((question) => ({
    ...question,
    subject: subjectFolder.subject,
    status: question.status ?? "draft",
  }));
}

export function parseSubjectQuizzes(raw: string | null): SubjectQuiz[] {
  if (!raw) return [originalTestQuiz];
  const librarySchema = z
    .array(subjectQuizSchema)
    .max(50)
    .superRefine((quizzes, ctx) => {
      if (new Set(quizzes.map((quiz) => quiz.id)).size !== quizzes.length)
        ctx.addIssue({ code: "custom", message: "Quiz IDs must be unique." });
    });
  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    throw new Error(
      "Saved quizzes could not be read. Existing browser data has been left intact.",
    );
  }
  const parsed = librarySchema.safeParse(input);
  if (!parsed.success)
    throw new Error(
      "Saved quizzes could not be read. Existing browser data has been left intact.",
    );
  return parsed.data;
}

export function appendSubjectQuiz(
  quizzes: readonly SubjectQuiz[],
  quiz: SubjectQuiz,
): SubjectQuiz[] {
  if (quizzes.length >= 50)
    throw new Error("This browser folder can hold up to 50 quizzes.");
  if (quizzes.some((existing) => existing.id === quiz.id))
    throw new Error("This quiz ID already exists.");
  return [...quizzes, subjectQuizSchema.parse(quiz)];
}
