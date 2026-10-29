export type CognitiveType =
  | "recall"
  | "conceptual"
  | "application"
  | "calculation"
  | "tracing";

export type AnswerFormat =
  | "single_choice"
  | "short_answer"
  | "numeric"
  | "sequence";

export type Confidence = "low" | "medium" | "high";

export type Question = {
  schemaVersion: 1;
  id: string;
  conceptIds: string[];
  cognitiveType: CognitiveType;
  answerFormat: AnswerFormat;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  options?: { id: string; label: string }[];
  correctAnswer: string;
  explanation: string;
  source: { documentId: string; locator: string };
  status: "draft" | "validated" | "rejected";
  approvalStatus: "pending" | "approved" | "rejected";
};

export type Attempt = {
  questionId: string;
  response: string;
  confidence: Confidence;
  hintsUsed: number;
  score: number;
  isCorrect: boolean;
  assisted: boolean;
  submittedAt: string;
};

export type ConceptState = {
  id: string;
  name: string;
  masteryScore: number;
  masteryStatus: "developing" | "proficient" | "mastered";
  activeMisconceptions: string[];
  nextReviewAt: string | null;
  consecutiveIndependentSuccesses: number;
};

export function gradeSingleChoice(question: Question, response: string) {
  const isCorrect = response === question.correctAnswer;
  return {
    score: isCorrect ? 1 : 0,
    isCorrect,
    feedback: isCorrect
      ? `Correct. ${question.explanation}`
      : `Not quite. ${question.explanation}`,
  };
}

export function updateMastery(
  current: number,
  score: number,
  assisted: boolean,
) {
  const weight = assisted ? 0.05 : 0.2;
  return clamp(current * (1 - weight) + score * weight, 0, 1);
}

export function masteryStatus(score: number): ConceptState["masteryStatus"] {
  if (score >= 0.75) return "mastered";
  if (score >= 0.4) return "proficient";
  return "developing";
}

export function nextReviewDate(
  consecutiveIndependentSuccesses: number,
  from = new Date(),
) {
  const intervals = [1, 1, 3, 7, 14, 30];
  const days = intervals[Math.min(consecutiveIndependentSuccesses, intervals.length - 1)];
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export function effectiveMastery(
  rawMastery: number,
  nextReviewAt: string | null,
  decayEnabled: boolean,
  now = new Date(),
) {
  if (!decayEnabled || !nextReviewAt) return rawMastery;
  const due = new Date(nextReviewAt);
  if (now <= due) return rawMastery;
  const overdueDays = (now.getTime() - due.getTime()) / 86_400_000;
  return clamp(rawMastery * Math.pow(0.5, overdueDays / 7), 0, 1);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export const demoQuestion: Question = {
  schemaVersion: 1,
  id: "algo-binary-search-001",
  conceptIds: ["algorithms.binary-search"],
  cognitiveType: "conceptual",
  answerFormat: "single_choice",
  difficulty: "medium",
  prompt:
    "Why does binary search require the input collection to be sorted?",
  options: [
    {
      id: "a",
      label: "So each comparison can eliminate a predictable half of the search space",
    },
    { id: "b", label: "So the algorithm can visit every value exactly once" },
    { id: "c", label: "So equal values are automatically removed" },
    { id: "d", label: "So the array uses less memory" },
  ],
  correctAnswer: "a",
  explanation:
    "Ordering tells us which half cannot contain the target, allowing the search interval to be halved after each comparison.",
  source: { documentId: "lecture-04", locator: "Page 18" },
  status: "validated",
  approvalStatus: "approved",
};
