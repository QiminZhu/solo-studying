import data from "./lecture9-bank.json" with { type: "json" };
import { parseBank, quizBundleSchema, workloadIssues } from "./contract.ts";

const bank = parseBank(data);
const quizzes = [
  { title: "The Slimekeeper’s Cellar", iconAsset: "/quiz-icons/slimekeeper.png" },
  { title: "The Webweaver’s Labyrinth", iconAsset: "/quiz-icons/webweaver.png" },
  { title: "The Golem’s Proving Grounds", iconAsset: "/quiz-icons/golem.png" },
  { title: "The Memory Eater", iconAsset: "/quiz-icons/memory-eater.png" },
];

// Imported review statuses are retained; publication needs separate review evidence.
export const lecture9Quizzes = quizzes.map((quiz, i) => {
  const questions = bank.filter((q) => q.tags?.includes(`quiz:l09-level-${i + 1}`));
  if (questions.length === 0 || workloadIssues(questions).length)
    throw new Error(`Invalid Lecture 9 quiz workload: ${quiz.title}`);
  return quizBundleSchema.parse({
    quiz: {
      id: `itcs217-l09-progressive-level-${i + 1}`,
      title: quiz.title,
      description: `Lecture 9 · Quiz ${i + 1}`,
      bankId: "itcs217-lecture-09-progressive",
      bankVersion: 1,
      questionIds: questions.map((q) => q.id),
      feedbackMode: i === 3 ? "deferred" : "immediate",
      contentKind: "draft",
      iconAsset: quiz.iconAsset,
    },
    questions,
  });
});
