import { z } from "zod";
import {
  questionBank,
  questionTypes,
  type BankQuestion,
  type QuestionType,
} from "./quiz-bank.ts";
import {
  subjectFolder,
  subjectQuizSchema,
  type SubjectQuiz,
} from "./subject-quizzes.ts";

export const configSchema = z.object({
  subject: z.string(),
  topics: z.array(z.string()).max(250),
  quizId: z.string().optional(),
  mode: z.enum(["practice", "exam"]),
  difficulty: z.enum(["Mixed", "Easy", "Medium", "Hard"]),
  timeLimit: z.number().int().min(0).max(180),
  counts: z.object({
    single: z.number().int().min(0).max(200),
    multiple: z.number().int().min(0).max(200),
    boolean: z.number().int().min(0).max(200),
  }),
});
export type QuizConfig = z.infer<typeof configSchema>;

export function eligibleQuestions(
  config: QuizConfig,
  bank: readonly BankQuestion[] = questionBank,
) {
  return bank.filter(
    (q) =>
      q.subject === config.subject &&
      config.topics.includes(q.topic) &&
      (config.difficulty === "Mixed" || q.difficulty === config.difficulty),
  );
}

export function typeAvailability(
  config: QuizConfig,
  bank: readonly BankQuestion[] = questionBank,
): Record<QuestionType, number> {
  const eligible = eligibleQuestions(config, bank);
  return {
    single: eligible.filter((q) => q.type === "single").length,
    multiple: eligible.filter((q) => q.type === "multiple").length,
    boolean: eligible.filter((q) => q.type === "boolean").length,
  };
}

export function defaultQuizConfig(subject = "Biology"): QuizConfig {
  const config: QuizConfig = {
    subject,
    topics: [
      ...new Set(
        questionBank.filter((q) => q.subject === subject).map((q) => q.topic),
      ),
    ],
    mode: "practice",
    difficulty: "Mixed",
    timeLimit: 0,
    counts: { single: 2, multiple: 2, boolean: 2 },
  };
  return clampConfigCounts(config);
}

export function clampConfigCounts(config: QuizConfig): QuizConfig {
  const available = typeAvailability(config);
  return {
    ...config,
    counts: {
      single: Math.min(config.counts.single, available.single),
      multiple: Math.min(config.counts.multiple, available.multiple),
      boolean: Math.min(config.counts.boolean, available.boolean),
    },
  };
}

export function totalQuestions(config: QuizConfig) {
  return Object.values(config.counts).reduce((sum, count) => sum + count, 0);
}

export function configErrors(
  config: QuizConfig,
  bank: readonly BankQuestion[] = questionBank,
): string[] {
  const parsed = configSchema.safeParse(config);
  if (!parsed.success)
    return [
      "Use whole question counts from 0 to 200 and a time limit from 0 to 180 minutes.",
    ];
  const errors: string[] = [];
  if (!config.topics.length) errors.push("Select at least one topic.");
  const available = typeAvailability(config, bank);
  if (!eligibleQuestions(config, bank).length)
    errors.push(
      "No curated questions match these settings. Choose another topic or difficulty.",
    );
  const total = totalQuestions(config);
  if (total < 1) errors.push("Choose at least one question.");
  if (total > 250) errors.push("A quiz can contain at most 250 questions.");
  for (const type of questionTypes)
    if (config.counts[type.id] > available[type.id])
      errors.push(
        `${type.label}: only ${available[type.id]} questions match your settings.`,
      );
  return errors;
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** First maximize distinct topic coverage under the type quotas, then balance the remaining picks. */
export function selectQuizQuestions(
  config: QuizConfig,
  random = Math.random,
  bank: readonly BankQuestion[] = questionBank,
): BankQuestion[] {
  const errors = configErrors(config, bank);
  if (errors.length) throw new Error(errors.join(" "));
  const pool = shuffled(eligibleQuestions(config, bank), random);
  const topics = shuffled([...new Set(pool.map((q) => q.topic))], random);
  const slots = questionTypes.flatMap((type) =>
    Array<QuestionType>(config.counts[type.id]).fill(type.id),
  );
  const assignments: (string | undefined)[] = Array(slots.length).fill(
    undefined,
  );
  function match(topic: string, visited: Set<number>): boolean {
    for (let i = 0; i < slots.length; i++) {
      if (
        visited.has(i) ||
        !pool.some((q) => q.topic === topic && q.type === slots[i])
      )
        continue;
      visited.add(i);
      if (assignments[i] === undefined || match(assignments[i]!, visited)) {
        assignments[i] = topic;
        return true;
      }
    }
    return false;
  }
  for (const topic of topics) match(topic, new Set());
  const picked: BankQuestion[] = [];
  const topicCounts = new Map<string, number>();
  const remaining = { ...config.counts };
  assignments.forEach((topic, i) => {
    if (!topic) return;
    const candidate = pool.find(
      (q) =>
        q.topic === topic &&
        q.type === slots[i] &&
        !picked.some((p) => p.id === q.id),
    )!;
    picked.push(candidate);
    remaining[candidate.type]--;
    topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
  });
  while (picked.length < slots.length) {
    const candidates = pool.filter(
      (q) => remaining[q.type] > 0 && !picked.some((p) => p.id === q.id),
    );
    candidates.sort(
      (a, b) =>
        (topicCounts.get(a.topic) ?? 0) - (topicCounts.get(b.topic) ?? 0),
    );
    const candidate = candidates[0];
    if (!candidate)
      throw new Error("The selected question bank cannot fulfill this quiz.");
    picked.push(candidate);
    remaining[candidate.type]--;
    topicCounts.set(
      candidate.topic,
      (topicCounts.get(candidate.topic) ?? 0) + 1,
    );
  }
  return shuffled(picked, random);
}

export function isAnswerCorrect(
  question: BankQuestion,
  answers: readonly number[],
) {
  return (
    answers.length === question.correct.length &&
    question.correct.every((answer) => answers.includes(answer))
  );
}

export const sessionSchema = z.object({
  version: z.literal(1),
  config: configSchema,
  quizSnapshot: subjectQuizSchema.optional(),
  questionIds: z.array(z.string()).min(1).max(250),
  answers: z.record(z.array(z.number().int().min(0))),
  checked: z.array(z.string()),
  flagged: z.array(z.string()),
  index: z.number().int().min(0),
  createdAt: z.number().nonnegative(),
  expiresAt: z.number().nonnegative().nullable(),
  submittedAt: z.number().nonnegative().nullable(),
});
export type QuizSession = z.infer<typeof sessionSchema>;

export function createQuizSession(
  config: QuizConfig,
  now = Date.now(),
  random = Math.random,
  bank: readonly BankQuestion[] = questionBank,
): QuizSession {
  return {
    version: 1,
    config,
    questionIds: selectQuizQuestions(config, random, bank).map((q) => q.id),
    answers: {},
    checked: [],
    flagged: [],
    index: 0,
    createdAt: now,
    expiresAt:
      config.mode === "exam" && config.timeLimit > 0
        ? now + config.timeLimit * 60000
        : null,
    submittedAt: null,
  };
}

function subjectQuizConfig(quiz: SubjectQuiz): QuizConfig {
  return {
    quizId: quiz.id,
    subject: subjectFolder.subject,
    topics: [...new Set(quiz.questions.map((question) => question.topic))],
    mode: "practice",
    difficulty: "Mixed",
    timeLimit: 0,
    counts: {
      single: quiz.questions.filter((question) => question.type === "single")
        .length,
      multiple: quiz.questions.filter(
        (question) => question.type === "multiple",
      ).length,
      boolean: quiz.questions.filter((question) => question.type === "boolean")
        .length,
    },
  };
}

/** Store a question snapshot so a guest attempt survives later library changes. */
export function createSubjectQuizSession(
  quiz: SubjectQuiz,
  now = Date.now(),
): QuizSession {
  const snapshot = subjectQuizSchema.parse(quiz);
  const session = createQuizSession(
    subjectQuizConfig(snapshot),
    now,
    Math.random,
    snapshot.questions,
  );
  return {
    ...session,
    questionIds: snapshot.questions.map((question) => question.id),
    quizSnapshot: snapshot,
  };
}

export function sessionQuestions(session: QuizSession): BankQuestion[] {
  const bank = session.quizSnapshot?.questions ?? questionBank;
  return session.questionIds.map((id) => {
    const question = bank.find((item) => item.id === id);
    if (!question)
      throw new Error("A question in this session is unavailable.");
    return question;
  });
}

export function parseQuizSession(raw: string | null): QuizSession | null {
  if (!raw) return null;
  try {
    const parsed = sessionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const session = parsed.data;
    const bank = session.quizSnapshot?.questions ?? questionBank;
    if (session.config.quizId && !session.quizSnapshot) return null;
    if (session.quizSnapshot) {
      const fixed = subjectQuizConfig(session.quizSnapshot);
      if (
        session.config.quizId !== session.quizSnapshot.id ||
        session.config.subject !== fixed.subject ||
        session.config.mode !== "practice" ||
        session.config.difficulty !== "Mixed" ||
        session.config.timeLimit !== 0 ||
        session.expiresAt !== null ||
        session.config.topics.length !== fixed.topics.length ||
        new Set(session.config.topics).size !== fixed.topics.length ||
        !fixed.topics.every((topic) => session.config.topics.includes(topic)) ||
        session.questionIds.length !== session.quizSnapshot.questions.length ||
        session.quizSnapshot.questions.some(
          (question, index) => question.id !== session.questionIds[index],
        )
      )
        return null;
    }
    if (
      configErrors(session.config, bank).length ||
      session.index >= session.questionIds.length ||
      session.questionIds.length !== totalQuestions(session.config) ||
      new Set(session.questionIds).size !== session.questionIds.length
    )
      return null;
    const eligible = eligibleQuestions(session.config, bank);
    const questions = session.questionIds.map((id) =>
      eligible.find((q) => q.id === id),
    );
    if (questions.some((q) => !q)) return null;
    if (
      questionTypes.some(
        (type) =>
          questions.filter((q) => q?.type === type.id).length !==
          session.config.counts[type.id],
      )
    )
      return null;
    for (const [id, answers] of Object.entries(session.answers)) {
      const question = questions.find((q) => q?.id === id);
      if (
        !question ||
        answers.some((answer) => answer >= question.answers.length) ||
        new Set(answers).size !== answers.length ||
        (question.type !== "multiple" && answers.length > 1)
      )
        return null;
    }
    if (
      [...session.checked, ...session.flagged].some(
        (id) => !session.questionIds.includes(id),
      )
    )
      return null;
    return session;
  } catch {
    return null;
  }
}

export function sessionResults(session: QuizSession) {
  const questions = sessionQuestions(session);
  const correct = questions.filter((q) =>
    isAnswerCorrect(q, session.answers[q.id] ?? []),
  ).length;
  const topics = [...new Set(questions.map((q) => q.topic))].map((topic) => {
    const subset = questions.filter((q) => q.topic === topic);
    return {
      topic,
      total: subset.length,
      answered: subset.filter((q) => session.answers[q.id]?.length).length,
      correct: subset.filter((q) =>
        isAnswerCorrect(q, session.answers[q.id] ?? []),
      ).length,
    };
  });
  return {
    total: questions.length,
    correct,
    incorrect: questions.length - correct,
    answered: questions.filter((q) => session.answers[q.id]?.length).length,
    accuracy: Math.round((correct / questions.length) * 100),
    topics,
  };
}
