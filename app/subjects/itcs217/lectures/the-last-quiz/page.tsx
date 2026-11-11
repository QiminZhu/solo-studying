import type { Metadata } from "next";
import { QuizSelection } from "@/components/quiz/v3/quiz-selection";
import { lectureFolders } from "@/lib/quiz-navigation";
import { lastQuizTest } from "@/lib/quiz-v3/last-quiz";

export const metadata: Metadata = {
  title: "The Last Quiz — ITCS217 — Solo Studying",
  description:
    "Practice the Lectures 11–13 quiz in ITCS217.",
};

export default function LastQuizPage() {
  return <QuizSelection lecture={lectureFolders[2]} bundles={lastQuizTest} />;
}
