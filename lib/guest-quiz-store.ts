"use client";

import type { QuizSession } from "./quiz-session";

const key = "solo.quiz-session.v1";
const event = "solo-quiz-change";
export function guestSnapshot(): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
export function subscribeGuestQuiz(listener: () => void) {
  window.addEventListener(event, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(event, listener);
    window.removeEventListener("storage", listener);
  };
}
export function saveGuestQuiz(session: QuizSession) {
  window.sessionStorage.setItem(key, JSON.stringify(session));
  window.dispatchEvent(new Event(event));
}
export function clearGuestQuiz() {
  window.sessionStorage.removeItem(key);
  window.dispatchEvent(new Event(event));
}

/** Apply user actions at the storage boundary so late clicks cannot extend an exam. */
export function patchGuestQuiz(
  session: QuizSession,
  patch: Partial<QuizSession>,
) {
  const expired = session.expiresAt !== null && Date.now() >= session.expiresAt;
  saveGuestQuiz(
    expired
      ? { ...session, submittedAt: session.expiresAt }
      : { ...session, ...patch },
  );
}

export function finishGuestQuiz(session: QuizSession) {
  patchGuestQuiz(session, { submittedAt: Date.now() });
}
