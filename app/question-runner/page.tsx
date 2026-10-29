import type { Metadata } from "next";
import { QuestionRunner } from "@/components/quiz/question-runner";

export const metadata: Metadata = {
  title: "Question runner — Solo Studying",
  description:
    "Practice with explanations or take a focused exam from a curated question bank.",
};
export default function QuestionRunnerPage() {
  return <QuestionRunner />;
}
