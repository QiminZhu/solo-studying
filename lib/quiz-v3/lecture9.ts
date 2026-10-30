import data from "./lecture9-bank.json" with { type: "json" };
import { parseBank, quizBundleSchema, workloadIssues } from "./contract.ts";

const bank = parseBank(data);
const titles = [
  "The Slimekeeper’s Cellar",
  "The Webweaver’s Labyrinth",
  "The Golem’s Proving Grounds",
  "The Memory Eater",
];

// Imported review statuses are retained; publication needs separate review evidence.
export const lecture9Quizzes = titles.map((title, i) => {
  const questions = bank.filter((q) => q.tags?.includes(`quiz:l09-level-${i + 1}`));
  if (questions.length === 0 || workloadIssues(questions).length)
    throw new Error(`Invalid Lecture 9 quiz workload: ${title}`);
  return quizBundleSchema.parse({
    quiz: {
      id: `itcs217-l09-progressive-level-${i + 1}`,
      title,
      description: `Lecture 9 · Quiz ${i + 1}`,
      bankId: "itcs217-lecture-09-progressive",
      bankVersion: 1,
      questionIds: questions.map((q) => q.id),
      feedbackMode: i === 3 ? "deferred" : "immediate",
      contentKind: "draft",
    },
    questions,
  });
});
