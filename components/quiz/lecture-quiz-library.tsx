"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { CreateSubjectQuiz } from "./create-subject-quiz";
import {
  originalTestQuiz,
  parseSubjectQuizzes,
  type SubjectQuiz,
} from "@/lib/subject-quizzes";
import {
  subjectQuizSnapshot,
  subscribeSubjectQuizzes,
} from "@/lib/subject-quiz-store";
import { createSubjectQuizSession } from "@/lib/quiz-session";
import { saveGuestQuiz } from "@/lib/guest-quiz-store";

const serverSnapshot = () => null;

export function LectureQuizLibrary() {
  const router = useRouter();
  const raw = useSyncExternalStore(
    subscribeSubjectQuizzes,
    subjectQuizSnapshot,
    serverSnapshot,
  );
  const library = useMemo(() => {
    try {
      return { quizzes: parseSubjectQuizzes(raw), error: "" };
    } catch {
      return {
        quizzes: [originalTestQuiz],
        error:
          "Saved quizzes are unavailable. Existing browser data has been left intact. Check that browser storage is enabled.",
      };
    }
  }, [raw]);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const createButton = useRef<HTMLButtonElement>(null);
  function close() {
    setCreating(false);
    createButton.current?.focus();
  }
  function start(quiz: SubjectQuiz) {
    try {
      saveGuestQuiz(createSubjectQuizSession(quiz));
      router.push("/question-runner");
    } catch {
      setError(
        "The quiz could not start. Allow browser storage and try again.",
      );
    }
  }
  return (
    <section
      className="lecture-saved-quizzes"
      aria-label="Original and saved quizzes"
    >
      <div className="subject-folder-heading">
        <div>
          <p className="carbon-label">Lecture 9 / Existing quizzes</p>
          <h2>Original and saved quizzes</h2>
          <p>
            Your existing quiz content stays available in this lecture folder.
          </p>
        </div>
        <button
          ref={createButton}
          className="carbon-button primary"
          onClick={() => setCreating(true)}
          disabled={Boolean(library.error)}
        >
          Create quiz <PlusIcon size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="carbon-helper">
        The original 30-question set is included for testing. Created quizzes
        stay on this device; these legacy quiz attempts stay in the current tab.
      </p>
      <div aria-live="polite">
        {notice && <p className="carbon-notice">{notice}</p>}
      </div>
      {(library.error || error) && (
        <p className="carbon-error" role="alert">
          {library.error || error}
        </p>
      )}
      <section aria-labelledby="folder-quizzes-heading">
        <div className="subject-quizzes-title">
          <h3 id="folder-quizzes-heading">Saved quiz library</h3>
          <span>
            {library.quizzes.length}{" "}
            {library.quizzes.length === 1 ? "quiz" : "quizzes"}
          </span>
        </div>
        <div className="subject-quiz-grid">
          {library.quizzes.map((quiz) => (
            <article className="subject-quiz-card" key={quiz.id}>
              <p className="carbon-label">
                {quiz.id === "itcs217-original-test"
                  ? "Original test quiz"
                  : "Your quiz"}
              </p>
              <h3>{quiz.title}</h3>
              {quiz.description && <p>{quiz.description}</p>}
              <p className="subject-quiz-counts">
                {quiz.questions.length} questions · Practice · No time limit
              </p>
              <p className="carbon-helper">
                {quiz.questions.some((question) => question.status === "draft")
                  ? "Contains imported draft questions"
                  : quiz.questions.some(
                        (question) => question.status === "pending_review",
                      )
                    ? "Questions pending review"
                    : "Answers supplied with the quiz"}
              </p>
              <button
                className="carbon-button secondary"
                onClick={() => start(quiz)}
                aria-label={`Open quiz: ${quiz.title}`}
              >
                Open quiz <ArrowRightIcon size={16} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
        {!library.quizzes.length && !library.error && (
          <p className="carbon-notice">
            No quizzes yet. Create your first quiz in this folder.
          </p>
        )}
      </section>
      {creating && (
        <CreateSubjectQuiz
          onClose={close}
          onCreated={(quiz) => {
            close();
            setNotice(`“${quiz.title}” was created in Lecture 9.`);
          }}
        />
      )}
    </section>
  );
}
