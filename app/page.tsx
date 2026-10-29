import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import "./landing.css";
import "@/components/landing/prototype/landing-prototype.css";

export const metadata: Metadata = {
  icons: { icon: "/solo-mark.svg", shortcut: "/solo-mark.svg" },
  title: "Solo Studying — Understand. Practice. Prepare.",
  description:
    "Practice your subjects, prepare for exams, and understand every answer. Explore Solo Studying’s curated quiz experience. No account needed to try the preview.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  if (process.env.NODE_ENV === "production") return <LandingPage />;
  const { variant } = await searchParams;
  if (!variant || !["A", "B", "C", "original"].includes(variant)) {
    return <LandingPage />;
  }
  const selected =
    variant === "original"
      ? "original"
      : variant === "B"
        ? "B"
        : variant === "C"
          ? "C"
          : "A";
  return <LandingPage prototypeVariant={selected} />;
}
