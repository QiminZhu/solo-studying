import type { Metadata } from "next";
import { SubjectFolder } from "@/components/quiz/subject-folder";

export const metadata: Metadata = {
  title: "ITCS217 — Solo Studying",
  description:
    "Open a lecture folder to find Computer Data Communication quizzes in ITCS217.",
};
export default function ITCS217Page() {
  return <SubjectFolder />;
}
