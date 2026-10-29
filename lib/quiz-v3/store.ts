"use client";

import {
  attemptSchema,
  parseAttempts,
  updateAttempt,
  type Attempt,
  type AttemptAction,
} from "./attempt";
import { quizBundleSchema, type QuizBundle } from "./contract";
import { z } from "zod";

const attemptKey = "solo.quiz-v3.attempts";
const bankKey = "solo.quiz-v3.author-banks";
const changeEvent = "solo-quiz-v3-change";
export function subscribe(listener: () => void) {
  window.addEventListener(changeEvent, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(changeEvent, listener);
    window.removeEventListener("storage", listener);
  };
}
export const serverSnapshot = () => null;
function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return "storage-unavailable";
  }
}
export const attemptsSnapshot = () => read(attemptKey);
export const banksSnapshot = () => read(bankKey);
const banksSchema = z
  .array(quizBundleSchema)
  .max(50)
  .superRefine((bundles, ctx) => {
    if (new Set(bundles.map((b) => b.quiz.id)).size !== bundles.length)
      ctx.addIssue({
        code: "custom",
        message: "Author quiz IDs must be unique.",
      });
    if (bundles.some((b) => b.quiz.contentKind === "published"))
      ctx.addIssue({
        code: "custom",
        message: "Browser imports cannot publish content.",
      });
  });
export function parseAuthorBanks(raw: string | null): QuizBundle[] {
  if (!raw) return [];
  try {
    return banksSchema.parse(JSON.parse(raw));
  } catch {
    throw new Error(
      "Saved author quizzes could not be read. Existing data has been left intact.",
    );
  }
}
export function saveAttempt(attempt: Attempt) {
  const checked = attemptSchema.parse(attempt);
  const latest = parseAttempts(window.localStorage.getItem(attemptKey));
  const next = latest.some((a) => a.id === checked.id)
    ? latest.map((a) => (a.id === checked.id ? checked : a))
    : [...latest, checked];
  if (next.length > 200)
    throw new Error(
      "This browser holds 200 attempts. Back up and reset a selected quiz before starting another.",
    );
  window.localStorage.setItem(attemptKey, JSON.stringify(next));
  window.dispatchEvent(new Event(changeEvent));
}
export function actOnAttempt(id: string, action: AttemptAction) {
  const latest = parseAttempts(window.localStorage.getItem(attemptKey)).find(
    (a) => a.id === id,
  );
  if (!latest)
    throw new Error("This attempt is unavailable. Return to quiz selection.");
  saveAttempt(updateAttempt(latest, action));
}
export function resetQuiz(quizId: string) {
  const latest = parseAttempts(window.localStorage.getItem(attemptKey));
  window.localStorage.setItem(
    attemptKey,
    JSON.stringify(latest.filter((a) => a.bundle.quiz.id !== quizId)),
  );
  window.dispatchEvent(new Event(changeEvent));
}
export function saveAuthorBank(bundle: QuizBundle) {
  if (
    bundle.quiz.contentKind === "published" ||
    !bundle.quiz.id.startsWith("author-")
  )
    throw new Error(
      "Import into an author quiz; browser imports cannot publish content.",
    );
  const latest = parseAuthorBanks(window.localStorage.getItem(bankKey));
  const next = banksSchema.parse([...latest, bundle]);
  window.localStorage.setItem(bankKey, JSON.stringify(next));
  window.dispatchEvent(new Event(changeEvent));
}
