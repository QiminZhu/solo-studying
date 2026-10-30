import data from "./lecture10-bank.json" with { type: "json" };
import {
  defaultWorkloadPolicy,
  parseBank,
  quizBundleSchema,
  workloadIssues,
} from "./contract.ts";

const bank = parseBank(data);
// Quiz 1 is the authored 30-question set. The shared 20-question cap stays in place for other banks.
const lecture10Workload = { ...defaultWorkloadPolicy, maxQuestions: 30 };
const quizzes = [
  {
    title: "Green Dragon · Emerald Awakening",
    description: "Lecture 10 · Know the Concepts.",
    feedbackMode: "immediate" as const,
    iconAsset: "/quiz-icons/green-dragon.png",
  },
  {
    title: "Blue Dragon · Azure Trials",
    description: "Lecture 10 · Connect the Ideas.",
    feedbackMode: "immediate" as const,
    iconAsset: "/quiz-icons/blue-dragon.png",
  },
  {
    title: "Red Dragon · Crimson Crucible",
    description: "Lecture 10 · Apply Your Knowledge.",
    feedbackMode: "immediate" as const,
    iconAsset: "/quiz-icons/red-dragon.png",
  },
  {
    title: "Black Dragon · Obsidian Dominion",
    description: "Lecture 10 · Solve the Mystery.",
    feedbackMode: "deferred" as const,
    iconAsset: "/quiz-icons/black-dragon.png",
  },
];

// Imported review statuses are retained; publication needs separate review evidence.
export const lecture10Quizzes = quizzes.map((quiz, i) => {
  const questions = bank.filter((q) =>
    q.tags?.includes(`quiz:l10-level-${i + 1}`),
  );
  const issues = workloadIssues(questions, lecture10Workload);
  const expectedCount = [30, 12, 8, 12][i];
  if (questions.length !== expectedCount || issues.length)
    throw new Error(
      `Invalid Lecture 10 quiz workload: ${quiz.title}: ${issues.join(" ")}`,
    );
  return quizBundleSchema.parse({
    quiz: {
      id: `itcs217-l10-dragon-level-${i + 1}`,
      title: quiz.title,
      description: quiz.description,
      bankId: "itcs217-lecture-10-dragon",
      bankVersion: 1,
      questionIds: questions.map((q) => q.id),
      feedbackMode: quiz.feedbackMode,
      contentKind: "draft",
      iconAsset: quiz.iconAsset,
    },
    questions,
  });
});
