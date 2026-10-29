import { Suspense } from "react";
import type { Metadata } from "next";
import { SixFormatRunner } from "@/components/quiz/v3/quiz-runner";
export const metadata: Metadata = { title: "Quiz attempt — Solo Studying" };
export default function QuizAttemptPage() {
  return (
    <Suspense fallback={<p role="status">Loading quiz…</p>}>
      <SixFormatRunner />
    </Suspense>
  );
}
