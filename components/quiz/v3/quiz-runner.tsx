"use client";

import Link from "next/link";
import { lectureFolder } from "@/lib/quiz-navigation";
import {
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useEffect,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { FlagIcon } from "@phosphor-icons/react/dist/csr/Flag";
import { PlatformShell } from "../platform-shell";
import { ResponseEditor } from "./response-editor";
import { QuestionFeedback } from "./question-feedback";
import {
  canReveal,
  createAttempt,
  parseAttempts,
  attemptSummary,
  contentIdentity,
  missedGuidance,
  type Attempt,
  type AttemptAction,
} from "@/lib/quiz-v3/attempt";
import {
  gradeQuestion,
  emptyResponse,
  isAnswered,
  responseErrors,
} from "@/lib/quiz-v3/grading";
import { fixtureQuizzes } from "@/lib/quiz-v3/fixtures";
import {
  actOnAttempt,
  attemptsSnapshot,
  banksSnapshot,
  parseAuthorBanks,
  saveAttempt,
  serverSnapshot,
  subscribe,
} from "@/lib/quiz-v3/store";

export function SixFormatRunner() {
  const params = useSearchParams();
  const id = params.get("attempt");
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
  const state = useMemo(() => {
    try {
      const attempts = parseAttempts(raw);
      const a = attempts.find((a) => a.id === id);
      const currentBundle =
        a &&
        [...fixtureQuizzes, ...parseAuthorBanks(banksRaw)].find(
          (b) => b.quiz.id === a.bundle.quiz.id,
        );
      return {
        attempt: a,
        original:
          a &&
          attempts.find(
            (other) =>
              other.bundle.quiz.id === a.bundle.quiz.id && !other.practiceOf,
          ),
        changed: Boolean(
          a &&
          currentBundle &&
          a.contentIdentity !== contentIdentity(currentBundle) &&
          !a.practiceOf,
        ),
        error: "",
      };
    } catch (e) {
      return {
        attempt: undefined,
        original: undefined,
        changed: false,
        error: e instanceof Error ? e.message : "Saved attempt unavailable.",
      };
    }
  }, [raw, banksRaw, id]);
  return (
    <PlatformShell active="runner">
      <main id="page-content" className="carbon-container v3-page">
        {!ready ? (
          <p role="status">Loading your saved attempt…</p>
        ) : !state.attempt ? (
          <div className="v3-heading">
            <h1>Open a quiz to begin.</h1>
            {state.error && (
              <p className="carbon-error" role="alert">
                {state.error}
              </p>
            )}
            <Link href={lectureFolder.href} className="carbon-button primary">
              Return to quiz selection
            </Link>
          </div>
        ) : (
          <ActiveAttempt
            key={state.attempt.id}
            attempt={state.attempt}
            original={state.original}
            changed={state.changed}
          />
        )}
      </main>
    </PlatformShell>
  );
}

function ActiveAttempt({
  attempt: a,
  original,
  changed,
}: {
  attempt: Attempt;
  original?: Attempt;
  changed: boolean;
}) {
  const [error, setError] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [reviewMissed, setReviewMissed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const submitDialog = useRef<HTMLDialogElement>(null);
  const submitTrigger = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { quiz, questions } = a.bundle;
  const ordered = quiz.questionIds.map((id) =>
    questions.find((q) => q.id === id)!,
  );
  const q = ordered[a.index];
  const r = a.answers[q.id] ?? emptyResponse(q);
  const finished = a.submittedAt !== null;
  const reveal = canReveal(a, q.id);
  const summary = attemptSummary(a);
  const unanswered = summary.total - summary.answered;
  const errors = responseErrors(q, r);
  const previousPosition = useRef(a.index);
  const previousFinished = useRef(finished);
  useEffect(() => {
    if (
      previousPosition.current !== a.index ||
      previousFinished.current !== finished
    )
      heading.current?.focus();
    previousPosition.current = a.index;
    previousFinished.current = finished;
  }, [a.index, finished]);

  function act(action: AttemptAction) {
    try {
      actOnAttempt(a.id, action);
      setError("");
      return true;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your changes could not be saved. Check browser storage and try again.",
      );
      return false;
    }
  }
  function submit() {
    if (
      act({
        type: "submit",
        confirmUnanswered: unanswered > 0,
        now: Date.now(),
      })
    )
      submitDialog.current?.close();
  }
  function practice(missedOnly: boolean) {
    try {
      const ids = missedOnly
        ? ordered
            .filter(
              (item) => !gradeQuestion(item, a.firstResponses[item.id]).score,
            )
            .map((item) => item.id)
        : quiz.questionIds;
      if (!ids.length) return;
      // These are explicitly practice attempts, including when reviewing the deferred quiz's previously seen items.
      const next = createAttempt(
        {
          quiz: { ...quiz, questionIds: ids },
          questions: ids.map((id) => questions.find((q) => q.id === id)!),
        },
        crypto.randomUUID(),
        undefined,
        a.id,
      );
      saveAttempt(next);
      router.push(`/quizzes/run?attempt=${encodeURIComponent(next.id)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Practice could not start.");
    }
  }
  return (
    <>
      <div className="page-context">
        <nav aria-label="Breadcrumb">
          <Link href="/subjects">Subjects</Link> /{" "}
          <Link href={lectureFolder.subjectHref}>ITCS217</Link> /{" "}
          <Link href={lectureFolder.href}>{lectureFolder.title}</Link> /{" "}
          <span aria-current="page">
            {finished ? "Results" : "Quiz attempt"}
          </span>
        </nav>
        <span className="neutral-status">
          {quiz.contentKind === "fixture"
            ? "Software test fixture"
            : quiz.contentKind === "draft"
              ? "Unverified author preview"
              : "Published quiz"}
        </span>
      </div>
      <div className="v3-heading">
        <p className="carbon-label">
          {a.practiceOf
            ? "Repeated practice progress"
            : "First assessment attempt"}{" "}
          ·{" "}
          {quiz.feedbackMode === "deferred"
            ? "Feedback after final submission"
            : "Feedback after checking"}
        </p>
        <h1 ref={finished ? heading : undefined} tabIndex={-1}>
          {quiz.title}
          {finished ? " — Results" : ""}
        </h1>
        <p>
          {finished
            ? "A score describes this attempt. It does not establish complete lecture understanding."
            : quiz.feedbackMode === "deferred"
              ? "Save and revise answers freely. Correctness, keys, explanations, sources, and revision guidance appear after final submission."
              : "Select or enter a response, then explicitly check your answer. Your first check is preserved if you retry."}
        </p>
      </div>
      {quiz.contentKind !== "published" && (
        <p className="carbon-notice">
          {quiz.contentKind === "fixture"
            ? "Software test fixture — not approved lecture content."
            : "Author preview — importing does not independently validate answers."}
        </p>
      )}
      {changed && (
        <p className="carbon-notice">
          This saved attempt uses its original question versions. Current
          content has changed; start a new attempt from quiz selection to use
          the current bank.
        </p>
      )}
      {a.practiceOf && (
        <p className="carbon-helper">
          Previously seen questions measure practice progress. Fresh cumulative
          questions provide stronger evidence of understanding.
        </p>
      )}
      {error && (
        <p className="carbon-error" role="alert">
          {error}
        </p>
      )}
      {finished ? (
        <>
          <section className="v3-score-grid" aria-label="Attempt results">
            <div>
              <span>Score</span>
              <strong>
                {summary.score} / {summary.total}
              </strong>
              <small>
                {Math.round(((summary.score ?? 0) / summary.total) * 100)}%
                accuracy · one point per question
              </small>
            </div>
            <div>
              <span>Unanswered / incomplete</span>
              <strong>{unanswered}</strong>
              <small>Included in the question total</small>
            </div>
            <div>
              <span>First-check performance in this attempt</span>
              <strong>
                {summary.firstScore} / {summary.total}
              </strong>
              <small>Retries do not replace the first response</small>
            </div>
          </section>
          {original && original.id !== a.id && (
            <p>
              Original assessment:{" "}
              {original.submittedAt === null
                ? "Still in progress; no final score."
                : `${attemptSummary(original).firstScore} / ${original.bundle.questions.length}.`}{" "}
              This attempt is recorded separately as practice progress.
            </p>
          )}
          <section className="v3-revision" aria-label="Revision guidance">
            <h2>Revision by missed objective</h2>
            <p>
              Based on first responses in this attempt. Coverage and mastery are
              separate; these results cannot establish full lecture coverage.
            </p>
            {missedGuidance(a).length ? (
              <ul>
                {missedGuidance(a).map((g) => (
                  <li key={g.id}>
                    <strong>{g.topic ?? g.id}:</strong>{" "}
                    {g.supplied
                      ? g.guidance
                      : "No approved revision guidance was supplied for this objective. Use the question’s supplied source references; no lecture advice has been inferred."}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No missed objectives on this attempt. Repeating these items is
                practice progress.
              </p>
            )}
          </section>
          <section className="v3-revision" aria-label="Performance by topic">
            <h2>Performance by topic</h2>
            <ul>
              {[...new Set(ordered.map((q) => q.topic))].map((topic) => {
                const qs = ordered.filter((q) => q.topic === topic);
                const score = qs.reduce(
                  (n, q) => n + gradeQuestion(q, a.answers[q.id]).score,
                  0,
                );
                return (
                  <li key={topic}>
                    {topic}: {score} / {qs.length} correct (
                    {Math.round((score / qs.length) * 100)}%)
                  </li>
                );
              })}
            </ul>
          </section>
          <div className="v3-actions">
            <button
              className="carbon-button primary"
              onClick={() => practice(false)}
            >
              Begin a new practice attempt
            </button>
            <button
              className="carbon-button secondary"
              disabled={!missedGuidance(a).length}
              onClick={() => practice(true)}
            >
              Practice missed questions
            </button>
            <button
              className="carbon-button ghost"
              aria-pressed={reviewMissed}
              onClick={() => setReviewMissed(!reviewMissed)}
            >
              {reviewMissed
                ? "Review every question"
                : "Revisit missed questions"}
            </button>
            <Link href={lectureFolder.href} className="carbon-button secondary">
              Return to quiz selection
            </Link>
          </div>
          <section
            className="v3-review"
            aria-label="Question-by-question review"
          >
            <h2>
              {reviewMissed
                ? "Missed questions"
                : "Question-by-question review"}
            </h2>
            {ordered
              .filter(
                (q) =>
                  !reviewMissed ||
                  !gradeQuestion(q, a.firstResponses[q.id]).score,
              )
              .map((question) => (
                <article key={question.id}>
                  <h3>
                    {ordered.indexOf(question) + 1}.{" "}
                    {readablePrompt(question.prompt)}
                  </h3>
                  <QuestionFeedback
                    question={question}
                    response={a.answers[question.id]}
                  />
                  {contentIdentity(a.firstResponses[question.id]) !==
                    contentIdentity(
                      a.answers[question.id] ?? { kind: "unanswered" },
                    ) && (
                    <details>
                      <summary>Original response before retries</summary>
                      <QuestionFeedback
                        question={question}
                        response={a.firstResponses[question.id]}
                      />
                    </details>
                  )}
                </article>
              ))}
          </section>
        </>
      ) : (
        <>
          <div className="v3-attempt-toolbar">
            <p>
              {summary.answered} answered · {unanswered} unanswered / incomplete
              · {summary.total} questions
            </p>
            <button
              ref={submitTrigger}
              className="carbon-button primary"
              onClick={() => submitDialog.current?.showModal()}
            >
              Final submission
            </button>
          </div>
          <div
            className={`runner-grid ${navigationOpen ? "" : "navigation-collapsed"}`}
          >
            <section
              className="runner-main"
              aria-labelledby="v3-question-heading"
            >
              <div className="runner-progress">
                <span>
                  Question {a.index + 1} of {summary.total}
                </span>
                <span>{formatLabel(q.type)}</span>
              </div>
              <p className="carbon-label">{q.topic}</p>
              <h2 id="v3-question-heading" ref={heading} tabIndex={-1}>
                {readablePrompt(q.prompt)}
              </h2>
              <ResponseEditor
                question={q}
                response={r}
                disabled={reveal}
                onChange={(response) =>
                  act({ type: "answer", questionId: q.id, response })
                }
              />
              {errors.length > 0 && (
                <div role="alert" className="carbon-error">
                  {errors.join(" ")}
                </div>
              )}
              <div aria-live="polite" aria-atomic="false">
                {reveal && (
                  <QuestionFeedback question={q} response={a.answers[q.id]} />
                )}
              </div>
              {reveal && a.firstResponses[q.id] && (
                <p className="carbon-helper">
                  First check: {gradeQuestion(q, a.firstResponses[q.id]).score}{" "}
                  / 1. This result is preserved if you retry.
                </p>
              )}
              <div className="v3-actions">
                {quiz.feedbackMode === "immediate" && (
                  <button
                    className="carbon-button primary"
                    disabled={errors.length > 0}
                    onClick={() =>
                      act({
                        type: reveal ? "retry" : "check",
                        questionId: q.id,
                      })
                    }
                  >
                    {reveal ? "Retry (first result kept)" : "Check answer"}
                  </button>
                )}
                {!reveal && (
                  <button
                    className="carbon-button secondary"
                    onClick={() =>
                      act({
                        type: "answer",
                        questionId: q.id,
                        response: { kind: "unanswered" },
                      })
                    }
                  >
                    I don’t know — leave unanswered
                  </button>
                )}
                <button
                  className="carbon-button ghost"
                  aria-pressed={a.flagged.includes(q.id)}
                  onClick={() => act({ type: "flag", questionId: q.id })}
                >
                  <FlagIcon size={18} aria-hidden="true" />
                  {a.flagged.includes(q.id) ? "Flagged" : "Flag for review"}
                </button>
              </div>
              <div className="v3-actions">
                <button
                  className="carbon-button ghost"
                  disabled={a.index === 0}
                  onClick={() => act({ type: "navigate", index: a.index - 1 })}
                >
                  <ArrowLeftIcon size={16} aria-hidden="true" />
                  Previous
                </button>
                <button
                  className="carbon-button secondary"
                  disabled={a.index === ordered.length - 1}
                  onClick={() => act({ type: "navigate", index: a.index + 1 })}
                >
                  Next question
                  <ArrowRightIcon size={16} aria-hidden="true" />
                </button>
              </div>
              <p role="status" className="carbon-helper">
                {a.answers[q.id]?.kind === "unanswered"
                  ? "Marked unanswered. You can still enter a response."
                  : isAnswered(q, a.answers[q.id])
                    ? "Response saved on this device."
                    : "Response incomplete. Changes are saved as you enter them."}
              </p>
            </section>
            <aside className="runner-sidebar" aria-label="Question navigation">
              <div className="runner-navigation-header">
                <h2>Questions</h2>
                <button
                  className="carbon-button ghost"
                  aria-expanded={navigationOpen}
                  aria-controls="v3-navigation"
                  onClick={() => setNavigationOpen(!navigationOpen)}
                >
                  {navigationOpen ? "Fold" : "Expand"}
                </button>
              </div>
              <p>
                {a.index + 1} / {ordered.length}
              </p>
              <div id="v3-navigation" hidden={!navigationOpen}>
                <div className="question-nav-grid">
                  {ordered.map((item, i) => (
                    <button
                      key={item.id}
                      className={`${a.index === i ? "current" : ""} ${isAnswered(item, a.answers[item.id]) ? "answered" : ""}`}
                      aria-current={a.index === i ? "step" : undefined}
                      aria-label={`Question ${i + 1}, ${isAnswered(item, a.answers[item.id]) ? "answered" : "unanswered"}${a.flagged.includes(item.id) ? ", flagged" : ""}`}
                      onClick={() => act({ type: "navigate", index: i })}
                    >
                      {i + 1}
                      {a.flagged.includes(item.id) && (
                        <FlagIcon size={12} aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
                <p>Flags are reminders, not grades.</p>
              </div>
              <Link
                href={lectureFolder.href}
                className="carbon-button secondary"
              >
                Save & return
              </Link>
            </aside>
          </div>
          <dialog
            ref={submitDialog}
            className="carbon-dialog"
            aria-labelledby="v3-submit-title"
            onClose={() => {
              if (!finished) submitTrigger.current?.focus();
            }}
          >
            <h2 id="v3-submit-title">Submit this attempt?</h2>
            <p>
              {summary.answered} answered · {unanswered} unanswered /
              incomplete.
            </p>
            <p>
              {unanswered
                ? "Unanswered or incomplete questions earn zero points. You can return to them or submit with those items unanswered."
                : "This locks your answers and opens the full results and explanations."}
            </p>
            <div className="v3-actions">
              <button
                className="carbon-button secondary"
                onClick={() => {
                  submitDialog.current?.close();
                  const first = ordered.findIndex(
                    (q) => !isAnswered(q, a.answers[q.id]),
                  );
                  if (first >= 0) act({ type: "navigate", index: first });
                }}
              >
                {unanswered
                  ? "Return to unanswered questions"
                  : "Keep reviewing"}
              </button>
              <button className="carbon-button primary" onClick={submit}>
                {unanswered ? "Submit with unanswered items" : "Submit attempt"}
              </button>
            </div>
            {error && (
              <p role="alert" className="carbon-error">
                {error}
              </p>
            )}
          </dialog>
        </>
      )}
    </>
  );
}
function readablePrompt(prompt: string) {
  return prompt.replace(/\{\{([^{}]+)\}\}/g, "[blank $1]");
}
function formatLabel(type: string) {
  return (
    {
      single: "Single choice",
      multiple: "Select all that apply",
      boolean: "True / false",
      matching: "Matching",
      ordering: "Ordering",
      fill_blank: "Fill in the blank",
    }[type] ?? type
  );
}
