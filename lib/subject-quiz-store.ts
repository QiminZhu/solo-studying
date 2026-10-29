"use client";

import {
  appendSubjectQuiz,
  parseSubjectQuizzes,
  type SubjectQuiz,
} from "./subject-quizzes";

const key = "solo.subject-quizzes.v1";
const event = "solo-subject-quizzes-change";

export function subjectQuizSnapshot() {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return "storage-unavailable";
  }
}

export function subscribeSubjectQuizzes(listener: () => void) {
  window.addEventListener(event, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(event, listener);
    window.removeEventListener("storage", listener);
  };
}

/** Re-read before appending so a stale page cannot overwrite another saved quiz. */
export function saveSubjectQuiz(quiz: SubjectQuiz) {
  const latest = parseSubjectQuizzes(window.localStorage.getItem(key));
  const next = appendSubjectQuiz(latest, quiz);
  window.localStorage.setItem(key, JSON.stringify(next));
  window.dispatchEvent(new Event(event));
}
