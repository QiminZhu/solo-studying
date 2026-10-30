import { Suspense } from "react";
import type { Metadata } from "next";
import { SixFormatRunner } from "@/components/quiz/v3/quiz-runner";
import type { RunnerPrototypeView } from "@/components/quiz/v3/prototype/prototype-types";

export const metadata: Metadata = { title: "Quiz attempt — Solo Studying" };

function selectedVariant(variant: string): RunnerPrototypeView {
  if (variant === "B" || variant === "C" || variant === "original")
    return variant;
  return "A";
}

export default async function QuizAttemptPage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  if (process.env.NODE_ENV !== "production") {
    const { variant } = await searchParams;
    if (variant && ["A", "B", "C", "original"].includes(variant)) {
      const { RunnerPrototype } = await import(
        "@/components/quiz/v3/prototype/runner-prototype"
      );
      return (
        <Suspense fallback={<p role="status">Loading preview…</p>}>
          <RunnerPrototype variant={selectedVariant(variant)} />
        </Suspense>
      );
    }
  }
  return (
    <Suspense fallback={<p role="status">Loading quiz…</p>}>
      <SixFormatRunner />
    </Suspense>
  );
}
