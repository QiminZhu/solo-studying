import data from "./last-quiz-bank.json" with { type: "json" };
import {
  defaultWorkloadPolicy,
  parseBank,
  quizBundleSchema,
  workloadIssues,
} from "./contract.ts";

const bank = parseBank(data);
const questions = bank.filter((q) => q.tags?.includes("quiz:last"));
// This one quiz holds lectures 11–13. The shared 20-question cap stays in place for other banks.
const lastQuizWorkload = {
  ...defaultWorkloadPolicy,
  maxQuestions: 54,
  maxResponseUnits: 77,
};
const issues = workloadIssues(questions, lastQuizWorkload);
if (questions.length !== 54 || questions.length !== bank.length || issues.length)
  throw new Error(
    `Invalid Last Quiz workload: ${issues.join(" ") || questions.length}`,
  );

/** Lectures 11–13: error detection, media access, and Ethernet. */
export const lastQuizTest = [
  quizBundleSchema.parse({
    quiz: {
      id: "itcs217-last-quiz-test",
      title: "The Last Quiz",
      description: "Lectures 11–13. Error detection, media access, and Ethernet.",
      bankId: "itcs217-last-quiz",
      bankVersion: 2,
      questionIds: questions.map((q) => q.id),
      feedbackMode: "immediate",
      contentKind: "draft",
      iconAsset: "/quiz-icons/the-last-quiz.png",
    },
    questions,
  }),
];
