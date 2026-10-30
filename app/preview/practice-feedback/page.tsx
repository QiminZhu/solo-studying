import type { Metadata } from "next";
import { PracticeFeedbackPreview } from "@/components/quiz/v3/practice-feedback-preview";

export const metadata: Metadata = {
  title: "Practice feedback preview — Solo Studying",
};

export default function PracticeFeedbackPreviewPage() {
  return <PracticeFeedbackPreview />;
}
