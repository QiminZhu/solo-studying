import type { Metadata } from "next";
import { QuizSelection } from "@/components/quiz/v3/quiz-selection";
import { lectureFolder } from "@/lib/quiz-navigation";
import { lecture9Quizzes } from "@/lib/quiz-v3/lecture9";

export const metadata: Metadata = {
  title: "Lecture 9 quizzes — ITCS217 — Solo Studying",
  description:
    "Practice the four curated Lecture 9 quizzes in ITCS217.",
};
export default function Lecture9Page() {
  return <QuizSelection lecture={lectureFolder} bundles={lecture9Quizzes} />;
}
