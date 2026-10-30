"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { PlatformShell } from "../platform-shell";
import { lectureFolders } from "@/lib/quiz-navigation";
import {
  createAttempt,
  parseAttempts,
  attemptSummary,
} from "@/lib/quiz-v3/attempt";
import type { QuizBundle } from "@/lib/quiz-v3/contract";
import {
  attemptsSnapshot,
  resetQuiz,
  saveAttempt,
  serverSnapshot,
  subscribe,
} from "@/lib/quiz-v3/store";

export function QuizSelection({
  lecture,
  bundles,
}: {
  lecture: (typeof lectureFolders)[number];
  bundles: readonly QuizBundle[];
}) {
  const raw = useSyncExternalStore(subscribe, attemptsSnapshot, serverSnapshot);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const library = useMemo(() => {
    try {
      return {
        attempts: parseAttempts(raw),
        bundles,
        error: "",
      };
    } catch (e) {
      return {
        attempts: [],
        bundles,
        error:
          e instanceof Error ? e.message : "Saved quizzes are unavailable.",
      };
    }
  }, [raw, bundles]);
  const router = useRouter();
  const [error, setError] = useState("");
  const [resetId, setResetId] = useState("");
  const resetDialog = useRef<HTMLDialogElement>(null);
  const resetTrigger = useRef<HTMLButtonElement | null>(null);

  function start(bundle: QuizBundle, practiceOf?: string) {
    try {
      const attempt = createAttempt(
        bundle,
        crypto.randomUUID(),
        undefined,
        practiceOf,
      );
      saveAttempt(attempt);
      router.push(`/quizzes/run?attempt=${encodeURIComponent(attempt.id)}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "This quiz could not start. Check browser storage.",
      );
    }
  }
  return (
    <PlatformShell active="quizzes">
      <main id="page-content" className="carbon-container v3-page">
        <div className="page-context">
          <nav aria-label="Breadcrumb">
            <Link href="/subjects">Subjects</Link> /{" "}
            <Link href={lecture.subjectHref}>ITCS217</Link> /{" "}
            <span aria-current="page">{lecture.title}</span>
          </nav>
          <span className="neutral-status">
            Guest access · saved on this device
          </span>
        </div>
        <div className="v3-heading">
          <p className="carbon-label">ITCS217 / Lecture folder</p>
          <h1>{lecture.title}</h1>
          <p>
            Choose one of four progressive {lecture.title} quizzes with curated
            questions.
          </p>
        </div>
        <div className="carbon-notice v3-notice">
          <strong>{lecture.title} publication is pending.</strong> The imported
          bank retains its supplied review statuses. These quizzes are available
          as author previews; independent publication evidence has not been
          supplied.
        </div>
        <p className="carbon-helper">
          Answers, position, checks, and submissions survive refresh in this
          browser. They do not synchronize across devices. Restart creates a
          separate attempt; reset clears only the selected quiz’s attempts.
        </p>
        {(library.error || error) && (
          <p className="carbon-error" role="alert">
            {library.error || error}
          </p>
        )}
        {!ready && <p role="status">Loading saved progress…</p>}
        <section
          className="subject-quiz-grid v3-quiz-grid"
          aria-label="Available quizzes"
        >
          {library.bundles.map((bundle) => {
            const { quiz, questions } = bundle;
            const history = library.attempts.filter(
              (a) => a.bundle.quiz.id === quiz.id,
            );
            const current = history
              .filter((a) => a.submittedAt === null)
              .at(-1);
            const latest = history.at(-1);
            const original = history.find(
              (a) => a.submittedAt !== null && !a.practiceOf,
            );
            const summary = current
              ? attemptSummary(current)
              : latest
                ? attemptSummary(latest)
                : null;
            return (
              <article key={quiz.id} className="subject-quiz-card v3-quiz-card">
                <div
                  className={
                    quiz.iconAsset
                      ? "v3-eye-frame"
                      : "v3-eye-frame v3-eye-frame-pending"
                  }
                >
                  {quiz.iconAsset ? (
                    <Image
                      src={quiz.iconAsset}
                      alt=""
                      fill
                      sizes="(max-width: 600px) 100vw, 33vw"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center 42%",
                      }}
                    />
                  ) : (
                    <p className="v3-eye-pending">Artwork pending</p>
                  )}
                  <h2 className="v3-eye-title">{quiz.title}</h2>
                </div>
                <p className="carbon-label">
                  {quiz.contentKind === "fixture"
                    ? "Software fixture · not lecture content"
                    : "Author preview · unverified"}
                </p>
                <p>{quiz.description}</p>
                <p>
                  {questions.length}{" "}
                  {questions.length === 1 ? "question" : "questions"} ·{" "}
                  {quiz.feedbackMode === "immediate"
                    ? "Feedback after checking"
                    : "Feedback after submission"}
                </p>
                <div className="v3-progress">
                  <progress
                    max={questions.length}
                    value={summary?.answered ?? 0}
                    aria-label={`${quiz.title} answered progress`}
                  />
                  <p>
                    {summary
                      ? `${summary.answered} / ${summary.total} answered${latest?.submittedAt !== null && !current ? " · Completed" : ""}`
                      : "Not started"}
                  </p>
                </div>
                {original && (
                  <p className="carbon-helper">
                    First completed assessment:{" "}
                    {attemptSummary(original).firstScore} /{" "}
                    {original.bundle.questions.length}. Later attempts are
                    practice progress.
                  </p>
                )}
                <div className="v3-actions">
                  <button
                    disabled={!ready || Boolean(library.error)}
                    className="carbon-button primary"
                    onClick={() =>
                      current
                        ? router.push(
                            `/quizzes/run?attempt=${encodeURIComponent(current.id)}`,
                          )
                        : start(bundle, latest?.id)
                    }
                  >
                    {current
                      ? "Resume quiz"
                      : latest
                        ? "New practice attempt"
                        : "Start quiz"}
                    <ArrowRightIcon size={16} aria-hidden="true" />
                  </button>
                  {latest && (
                    <>
                      <Link
                        className="carbon-button secondary"
                        href={`/quizzes/run?attempt=${encodeURIComponent(latest.id)}`}
                      >
                        {latest.submittedAt !== null
                          ? "Review results"
                          : "Open attempt"}
                      </Link>
                      <button
                        className="carbon-button ghost"
                        onClick={() => start(bundle, latest.id)}
                      >
                        Restart in new attempt
                      </button>
                      <button
                        className="carbon-button ghost"
                        onClick={(e) => {
                          resetTrigger.current = e.currentTarget;
                          setResetId(quiz.id);
                          resetDialog.current?.showModal();
                        }}
                      >
                        Reset this quiz
                      </button>
                    </>
                  )}
                </div>
                {history.length > 1 && (
                  <details>
                    <summary>Attempt history ({history.length})</summary>
                    <ul>
                      {history.map((a, i) => (
                        <li key={a.id}>
                          <Link
                            href={`/quizzes/run?attempt=${encodeURIComponent(a.id)}`}
                          >
                            Attempt {i + 1}
                            {a.practiceOf
                              ? " · practice progress"
                              : " · first assessment"}{" "}
                            ·{" "}
                            {a.submittedAt === null
                              ? "In progress"
                              : `${attemptSummary(a).score} / ${a.bundle.questions.length}`}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </article>
            );
          })}
        </section>
        <dialog
          ref={resetDialog}
          className="carbon-dialog"
          aria-labelledby="reset-title"
          onClose={() => resetTrigger.current?.focus()}
        >
          <h2 id="reset-title">Reset this quiz’s progress?</h2>
          <p>
            This clears all answers, positions, submissions, and first-attempt
            results for{" "}
            {library.bundles.find((b) => b.quiz.id === resetId)?.quiz.title}.
            The quiz and other quizzes’ attempts stay saved. This cannot be
            undone.
          </p>
          <div className="v3-actions">
            <button
              className="carbon-button secondary"
              onClick={() => resetDialog.current?.close()}
            >
              Keep progress
            </button>
            <button
              className="carbon-button primary"
              onClick={() => {
                try {
                  resetQuiz(resetId);
                  resetDialog.current?.close();
                } catch (e) {
                  resetDialog.current?.close();
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Progress could not be reset.",
                  );
                }
              }}
            >
              Clear this quiz’s attempts
            </button>
          </div>
        </dialog>
      </main>
    </PlatformShell>
  );
}
