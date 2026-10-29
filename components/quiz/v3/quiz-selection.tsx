"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { PlatformShell } from "../platform-shell";
import { LectureQuizLibrary } from "../lecture-quiz-library";
import { lectureFolder } from "@/lib/quiz-navigation";
import {
  createAttempt,
  parseAttempts,
  attemptSummary,
} from "@/lib/quiz-v3/attempt";
import {
  importBank,
  quizBundleSchema,
  responseUnits,
  workloadIssues,
  type QuizBundle,
} from "@/lib/quiz-v3/contract";
import { lecture9Quizzes } from "@/lib/quiz-v3/lecture9";
import {
  attemptsSnapshot,
  banksSnapshot,
  parseAuthorBanks,
  resetQuiz,
  saveAttempt,
  saveAuthorBank,
  serverSnapshot,
  subscribe,
} from "@/lib/quiz-v3/store";

export function QuizSelection() {
  const raw = useSyncExternalStore(subscribe, attemptsSnapshot, serverSnapshot);
  const banksRaw = useSyncExternalStore(
    subscribe,
    banksSnapshot,
    serverSnapshot,
  );
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const library = useMemo(() => {
    try {
      return {
        attempts: parseAttempts(raw),
        bundles: [...lecture9Quizzes, ...parseAuthorBanks(banksRaw)],
        error: "",
      };
    } catch (e) {
      return {
        attempts: [],
        bundles: lecture9Quizzes,
        error:
          e instanceof Error ? e.message : "Saved quizzes are unavailable.",
      };
    }
  }, [raw, banksRaw]);
  const router = useRouter();
  const [error, setError] = useState("");
  const [resetId, setResetId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deferred, setDeferred] = useState(false);
  const [imported, setImported] = useState<QuizBundle["questions"]>([]);
  const [reading, setReading] = useState(false);
  const [importNotice, setImportNotice] = useState("");
  const resetDialog = useRef<HTMLDialogElement>(null);
  const resetTrigger = useRef<HTMLButtonElement | null>(null);
  const fileVersion = useRef(0);
  const workload = workloadIssues(imported);

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
            <Link href={lectureFolder.subjectHref}>ITCS217</Link> /{" "}
            <span aria-current="page">{lectureFolder.title}</span>
          </nav>
          <span className="neutral-status">
            Guest access · saved on this device
          </span>
        </div>
        <div className="v3-heading">
          <p className="carbon-label">ITCS217 / Lecture folder</p>
          <h1>{lectureFolder.title}</h1>
          <p>
            Choose one of four Lecture 9 quizzes. Each contains 15 curated questions.
          </p>
        </div>
        <div className="carbon-notice v3-notice">
          <strong>Lecture 9 publication is pending.</strong> The imported bank retains its supplied review statuses. These quizzes are
          available as author previews; independent publication evidence has not been supplied.
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
                  className="v3-monster-placeholder"
                  aria-label={
                    quiz.iconAsset
                      ? "Custom monster artwork"
                      : "Monster artwork placeholder"
                  }
                >
                  {quiz.iconAsset ? (
                    <Image src={quiz.iconAsset} width={80} height={80} alt="" />
                  ) : (
                    <span>Artwork pending</span>
                  )}
                </div>
                <p className="carbon-label">
                  {quiz.contentKind === "fixture"
                    ? "Software fixture · not lecture content"
                    : "Author preview · unverified"}
                </p>
                <h2>{quiz.title}</h2>
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
        <LectureQuizLibrary />
        <details className="v3-author-panel">
          <summary>Author tools: import a six-format JSON bank</summary>
          <p>
            Imports create an unverified author preview, never a published
            Lecture 9 quiz. Existing question IDs, versions, keys, explanations,
            and source references are preserved.
          </p>
          <p>
            <a href="/quiz-v3-example.json" download>
              Download the labeled v3 fixture example
            </a>{" "}
            ·{" "}
            <a href="/quiz-v3-contract.html">
              Read the import and workload guide
            </a>
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!imported.length || workload.length || reading) return;
              try {
                const id = `author-${crypto.randomUUID()}`;
                const bundle = quizBundleSchema.parse({
                  quiz: {
                    id,
                    title,
                    description,
                    bankId: id,
                    bankVersion: 1,
                    questionIds: imported.map((q) => q.id),
                    feedbackMode: deferred ? "deferred" : "immediate",
                    contentKind: "draft",
                    revisionGuidance: {},
                  },
                  questions: imported,
                });
                saveAuthorBank(bundle);
                setImported([]);
                setImportNotice(`“${title}” saved as an author preview.`);
                setTitle("");
                setError("");
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "Import could not be saved.",
                );
              }
            }}
          >
            <label className="carbon-field">
              <span>Quiz title</span>
              <input
                value={title}
                maxLength={120}
                required
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="carbon-field">
              <span>Description (optional)</span>
              <textarea
                value={description}
                maxLength={1000}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="carbon-field">
              <span>BankQuestion v3 JSON array (maximum 1 MB)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={async (e) => {
                  const version = ++fileVersion.current;
                  const file = e.target.files?.[0];
                  setImported([]);
                  setImportNotice("");
                  setError("");
                  if (!file) return;
                  if (file.size > 1_000_000) {
                    setError("Use a JSON file smaller than 1 MB.");
                    return;
                  }
                  setReading(true);
                  try {
                    const questions = importBank(await file.text());
                    if (version === fileVersion.current) setImported(questions);
                  } catch (e) {
                    if (version === fileVersion.current)
                      setError(
                        e instanceof Error
                          ? e.message
                          : "This file could not be read.",
                      );
                  } finally {
                    if (version === fileVersion.current) setReading(false);
                  }
                }}
              />
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={deferred}
                onChange={(e) => setDeferred(e.target.checked)}
              />
              Reveal feedback only after final submission
            </label>
            <p className="carbon-helper">
              Default authoring policy: 20 questions, 50 response units; 4
              matching pairs, 6 ordering items, 3 blanks, 6 choice options.
              These configurable limits are workload policies, not proven
              learning thresholds.
            </p>
            <div role="status">
              {reading
                ? "Reading bank…"
                : imported.length
                  ? `${imported.length} questions · ${imported.reduce((n, q) => n + responseUnits(q), 0)} response units`
                  : importNotice || "No bank loaded."}
            </div>
            {workload.length > 0 && (
              <div className="carbon-error" role="alert">
                <p>
                  Split this quiz or have the author explicitly revise the
                  workload policy:
                </p>
                <ul>
                  {workload.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              className="carbon-button primary"
              disabled={
                !ready ||
                reading ||
                !title.trim() ||
                !imported.length ||
                workload.length > 0 ||
                Boolean(library.error)
              }
            >
              Save author preview
            </button>
          </form>
        </details>
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
