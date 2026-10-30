import type { Metadata } from "next";
import { QuizSelection } from "@/components/quiz/v3/quiz-selection";
import { lectureFolders } from "@/lib/quiz-navigation";
import { lecture10Quizzes } from "@/lib/quiz-v3/lecture10";

export const metadata: Metadata = {
  title: "Lecture 10 quizzes — ITCS217 — Solo Studying",
  description:
    "Practice the four curated Lecture 10 quizzes in ITCS217.",
};
export default function Lecture10Page() {
  return (
    <QuizSelection
      lecture={lectureFolders[1]}
      bundles={lecture10Quizzes}
    />
  );
}
