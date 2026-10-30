"use client";

import Link from "next/link";
import { lectureFolder, lectureFolderForBank } from "@/lib/quiz-navigation";
import {
  lecture10Scenarios,
  scenarioFor,
} from "@/lib/quiz-v3/lecture10-scenarios";
import {
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useEffect,
  type RefObject,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { FlagIcon } from "@phosphor-icons/react/dist/csr/Flag";
import { PlatformShell } from "../platform-shell";
import { ResponseEditor } from "./response-editor";
import { QuestionFeedback } from "./question-feedback";
import {
  createAttempt,
  parseAttempts,
  attemptSummary,
  contentIdentity,
  missedGuidance,
  practicePhase,
  topicScores,
  type Attempt,
  type AttemptAction,
  type PracticePhase,
} from "@/lib/quiz-v3/attempt";
import {
  gradeQuestion,
  emptyResponse,
  isAnswered,
  responseErrors,
  responseProgress,
  type ResponseProgress,
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
  const [reviewMissed, setReviewMissed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const submitDialog = useRef<HTMLDialogElement>(null);
  const submitTrigger = useRef<HTMLButtonElement>(null);
  const questionStrip = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { quiz, questions } = a.bundle;
  const folder = lectureFolderForBank(quiz.bankId);
  const ordered = quiz.questionIds.map((id) =>
    questions.find((q) => q.id === id)!,
  );
  const q = ordered[a.index];
  const stored = a.answers[q.id];
  const r =
    !stored || stored.kind === "unanswered" ? emptyResponse(q) : stored;
  const finished = a.submittedAt !== null;
  const phase = practicePhase(a, q.id);
  const summary = attemptSummary(a);
  const unanswered = summary.total - summary.answered;
  const errors = responseErrors(q, r);
  const progress = responseProgress(q, a.answers[q.id]);
  const onLast = a.index === ordered.length - 1;
  const immediate = quiz.feedbackMode === "immediate";
  const practicing = immediate && phase === "answering";
  const nextIsPrimary = !onLast && !practicing && phase !== "withheld";
  const reviewIsPrimary = onLast && !practicing && phase !== "withheld";
  const explanationKey = `${q.id}:${phase}`;
  const [explanationState, setExplanationState] = useState({
    key: explanationKey,
    open: false,
  });
  if (explanationState.key !== explanationKey)
    setExplanationState({ key: explanationKey, open: false });
  const explanationOpen =
    explanationState.key === explanationKey && explanationState.open;
  const flaggedCount = a.flagged.length;
  const resultRef = useRef<HTMLElement>(null);
  const checkButton = useRef<HTMLButtonElement>(null);
  const previousPosition = useRef(a.index);
  const previousFinished = useRef(finished);
  const previousPhase = useRef({ phase, id: q.id });
  useEffect(() => {
    if (
      previousPosition.current !== a.index ||
      previousFinished.current !== finished
    )
      heading.current?.focus();
    previousPosition.current = a.index;
    previousFinished.current = finished;
  }, [a.index, finished]);
  useEffect(() => {
    const previous = previousPhase.current;
    if (previous.id === q.id) {
      if (previous.phase === "answering" && phase !== "answering")
        resultRef.current?.focus();
      if (previous.phase === "withheld" && phase === "answering")
        checkButton.current?.focus();
    }
    previousPhase.current = { phase, id: q.id };
  }, [phase, q.id]);
  useEffect(() => {
    const strip = questionStrip.current;
    const current = strip?.querySelector<HTMLButtonElement>("[aria-current='step']");
    if (!strip || !current) return;
    const left =
      current.offsetLeft - strip.clientWidth / 2 + current.clientWidth / 2;
    strip.scrollTo({ left: Math.max(0, left) });
  }, [a.index]);

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
  function goTo(index: number) {
    act({ type: "navigate", index });
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
          <Link href={folder.subjectHref}>ITCS217</Link> /{" "}
          <Link href={folder.href}>{folder.title}</Link> /{" "}
          <span aria-current="page">
            {finished ? "Results" : quiz.title}
          </span>
        </nav>
      </div>
      {finished && (
        <div className="v3-heading">
          <p className="carbon-label">
            {quiz.feedbackMode === "deferred"
              ? "Graded at the end"
              : "Checked as you go"}
          </p>
          <h1 ref={heading} tabIndex={-1}>
            {quiz.title} — Results
          </h1>
        </div>
      )}
      <details className="v3-quiz-details">
        <summary>Quiz details</summary>
        <p>
          {`${
            a.practiceOf
              ? "Repeated practice progress"
              : "First assessment attempt"
          }. ${
            quiz.feedbackMode === "deferred"
              ? "Save and revise answers freely. Correctness, keys, explanations, sources, and revision guidance appear after final submission."
              : "Select or enter a response, then check it. A wrong check does not mark the answer key. The first check is the one that counts."
          }`}
        </p>
        <p>
          {quiz.contentKind === "fixture"
            ? "Software test fixture — not approved lecture content."
            : quiz.contentKind === "draft"
              ? "Author preview — importing does not independently validate answers."
              : "Published quiz."}
        </p>
        {changed && (
          <p>
            This saved attempt uses its original question versions. Current
            content has changed; start a new attempt from quiz selection to use
            the current bank.
          </p>
        )}
        {a.practiceOf && (
          <p>
            Previously seen questions measure practice progress. Fresh cumulative
            questions provide stronger evidence of understanding.
          </p>
        )}
        {finished && (
          <p>
            These scores describe this attempt. They do not establish complete
            lecture understanding.
          </p>
        )}
      </details>
      {error && (
        <p className="carbon-error" role="alert">
          {error}
        </p>
      )}
      {finished ? (
        <>
          <section className="v3-score-grid" aria-label="Attempt results">
            <div>
              <span>First-check score</span>
              <strong>
                {summary.firstScore} / {summary.total}
              </strong>
              <small>
                This is the assessment. The first checked answer is kept.
              </small>
            </div>
            <div>
              <span>Score after retries</span>
              <strong>
                {summary.score} / {summary.total}
              </strong>
              <small>
                {Math.round(((summary.score ?? 0) / summary.total) * 100)}%
                from the latest answers · one point per question
              </small>
            </div>
            <div>
              <span>Unanswered / incomplete</span>
              <strong>{unanswered}</strong>
              <small>Included in the question total</small>
            </div>
          </section>
          <p>
            The first-check score is the assessment for this attempt. Score
            after retries includes later answers and does not replace that
            first check.
          </p>
          {original && original.id !== a.id && (
            <p>
              Original assessment:{" "}
              {original.submittedAt === null
                ? "Still in progress; no final score."
                : `${attemptSummary(original).firstScore} / ${original.bundle.questions.length}.`}{" "}
              This attempt is recorded separately as practice progress.
            </p>
          )}
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
            <Link href={folder.href} className="carbon-button secondary">
              Return to quiz selection
            </Link>
          </div>
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
              {topicScores(a).map(({ topic, score, total }) => (
                <li key={topic}>
                  {topic}: {score} / {total} on the first check (
                  {Math.round((score / total) * 100)}%)
                </li>
              ))}
            </ul>
          </section>
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
                  <ScenarioLabel tags={question.tags} />
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
          <QuestionMap
            stripRef={questionStrip}
            ordered={ordered}
            attempt={a}
            onNavigate={goTo}
          />
          <p className="v3-qstrip-note">
            {immediate ? "Checked as you go" : "Graded at the end"} · Question{" "}
            {a.index + 1} of {summary.total} · {summary.answered} answered
            {immediate && a.firstResponses[q.id]
              ? ` · First check: ${
                  gradeQuestion(q, a.firstResponses[q.id]).score
                    ? "correct"
                    : "incorrect"
                }`
              : ""}
          </p>
          <div className="v3-qstrip-tools">
            <Link href={folder.href} className="carbon-button ghost">
              Save & return
            </Link>
            <p className="carbon-helper">
              Resume depends on this browser on this device.
            </p>
          </div>
          <section
            className="v3-question-first"
            aria-labelledby="v3-question-heading"
          >
            <ScenarioLabel tags={q.tags} />
            <p className="carbon-label">
              {q.topic} · {formatLabel(q.type)}
            </p>
            <h1 id="v3-question-heading" ref={heading} tabIndex={-1}>
              {readablePrompt(q.prompt)}
            </h1>
            <ResponseEditor
              question={q}
              response={r}
              disabled={phase !== "answering"}
              markCorrect={phase === "correct"}
              onChange={(response) =>
                act({ type: "answer", questionId: q.id, response })
              }
            />
            {errors.length > 0 && (
              <div role="alert" className="carbon-error">
                {errors.join(" ")}
              </div>
            )}
            <div className="v3-q-actions">
              <button
                className="carbon-button ghost"
                disabled={a.index === 0}
                onClick={() => goTo(a.index - 1)}
              >
                <ArrowLeftIcon size={16} aria-hidden="true" />
                Previous
              </button>
              <button
                className="carbon-button ghost"
                aria-pressed={a.flagged.includes(q.id)}
                onClick={() => act({ type: "flag", questionId: q.id })}
              >
                <FlagIcon size={18} aria-hidden="true" />
                {a.flagged.includes(q.id) ? "Flagged" : "Flag for review"}
              </button>
              {!reviewIsPrimary && (
                <button
                  ref={submitTrigger}
                  className={`carbon-button ${onLast ? "secondary" : "ghost"}`}
                  onClick={() => submitDialog.current?.showModal()}
                >
                  {onLast ? "Review and submit" : "Finish quiz"}
                </button>
              )}
              <div className="v3-q-actions-primary">
                {phase === "answering" && progress !== "empty" && (
                  <button
                    className="carbon-button ghost"
                    onClick={() =>
                      act({
                        type: "answer",
                        questionId: q.id,
                        response: { kind: "unanswered" },
                      })
                    }
                  >
                    Clear response
                  </button>
                )}
                {(phase === "withheld" || phase === "correct") && (
                  <button
                    type="button"
                    className="carbon-button secondary"
                    aria-expanded={explanationOpen}
                    onClick={() =>
                      setExplanationState((current) => ({
                        key: explanationKey,
                        open: !current.open,
                      }))
                    }
                  >
                    {explanationOpen
                      ? "Hide the explanation"
                      : "Show the explanation"}
                  </button>
                )}
                {practicing && (
                  <button
                    ref={checkButton}
                    className="carbon-button primary"
                    disabled={!isAnswered(q, r) || errors.length > 0}
                    onClick={() => act({ type: "check", questionId: q.id })}
                  >
                    Check answer
                  </button>
                )}
                {phase === "withheld" && (
                  <button
                    className="carbon-button primary"
                    onClick={() => act({ type: "retry", questionId: q.id })}
                  >
                    Try again
                  </button>
                )}
                {nextIsPrimary ? (
                  <button
                    className="carbon-button primary"
                    onClick={() => goTo(a.index + 1)}
                  >
                    Next question
                    <ArrowRightIcon size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    className="carbon-button ghost"
                    disabled={onLast}
                    onClick={() => goTo(a.index + 1)}
                  >
                    Next question
                    <ArrowRightIcon size={16} aria-hidden="true" />
                  </button>
                )}
                {reviewIsPrimary && (
                  <button
                    ref={submitTrigger}
                    className="carbon-button primary"
                    onClick={() => submitDialog.current?.showModal()}
                  >
                    Review and submit
                  </button>
                )}
              </div>
            </div>
            {(phase === "withheld" || phase === "correct") && (
              <PracticeCheckResult
                resultRef={resultRef}
                phase={phase}
                question={q}
                firstCorrect={
                  gradeQuestion(q, a.firstResponses[q.id]).score === 1
                }
                explanationOpen={explanationOpen}
              />
            )}
            <p role="status" className="carbon-helper">
              {a.answers[q.id]?.kind === "unanswered"
                ? "Cleared. You can enter a response. Saved in this browser."
                : progress === "complete"
                  ? "Response saved in this browser."
                  : progress === "partial"
                    ? "Response incomplete. Changes are saved in this browser."
                    : "Answers are saved in this browser on this device."}
            </p>
          </section>
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
              {summary.answered} answered · {unanswered} unanswered / incomplete
              · {flaggedCount} flagged.
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
function PracticeCheckResult({
  resultRef,
  phase,
  question,
  firstCorrect,
  explanationOpen,
}: {
  resultRef: RefObject<HTMLElement | null>;
  phase: Exclude<PracticePhase, "answering">;
  question: Attempt["bundle"]["questions"][number];
  firstCorrect: boolean;
  explanationOpen: boolean;
}) {
  const choice = ["single", "multiple", "boolean"].includes(question.type);
  return (
    <section ref={resultRef} tabIndex={-1} aria-label="Check result">
      {phase === "withheld" && (
        <p className="carbon-notice" role="status">
          <strong>Not quite yet.</strong> Give it another try.{" "}
          {choice
            ? "This first check stays incorrect, and the correct option is not marked."
            : "This first check stays incorrect, and the answer key stays hidden."}
        </p>
      )}
      {explanationOpen && (
        <section className="v3-explanation" aria-label="Explanation">
          <h3>Explanation</h3>
          <p>{question.explanation}</p>
        </section>
      )}
      {phase === "correct" && (
        <p className="v3-attempt-success" role="status">
          <CheckIcon size={16} aria-hidden="true" />
          <span>
            {firstCorrect
              ? "Correct. This first check is the assessment."
              : "This try is correct. The first check remains incorrect."}
          </span>
        </p>
      )}
    </section>
  );
}
function QuestionMap({
  stripRef,
  ordered,
  attempt,
  onNavigate,
}: {
  stripRef: RefObject<HTMLDivElement | null>;
  ordered: Attempt["bundle"]["questions"];
  attempt: Attempt;
  onNavigate: (index: number) => void;
}) {
  return (
    <div className="v3-qstrip-block">
      <div
        ref={stripRef}
        className="v3-qstrip"
        role="navigation"
        aria-label="Question navigation"
      >
        {ordered.map((item, i) => {
          const state = responseProgress(item, attempt.answers[item.id]);
          const checked = attempt.checked.includes(item.id);
          const flagged = attempt.flagged.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`${attempt.index === i ? "current" : ""} ${state === "complete" ? "answered" : ""} ${state === "partial" ? "partial" : ""}`}
              aria-current={attempt.index === i ? "step" : undefined}
              aria-label={`Question ${i + 1}, ${progressName(state)}${checked ? ", checked" : ""}${flagged ? ", flagged" : ""}`}
              onClick={() => onNavigate(i)}
            >
              {i + 1}
              {(checked || flagged) && (
                <span className="v3-nav-marks" aria-hidden="true">
                  {checked && <CheckIcon size={12} />}
                  {flagged && <FlagIcon size={12} />}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="nav-legend">
        <span>
          <i /> Unanswered
        </span>
        <span>
          <i className="partial" /> Partial
        </span>
        <span>
          <i className="answered" /> Answered
        </span>
        <span>
          <i className="current" /> Current
        </span>
      </div>
      <p>Check marks and flags are reminders, not grades.</p>
    </div>
  );
}
function progressName(state: ResponseProgress) {
  return state === "complete"
    ? "answered"
    : state === "partial"
      ? "partly answered"
      : "unanswered";
}
function ScenarioLabel({ tags }: { tags?: readonly string[] }) {
  const scenario = scenarioFor(tags);
  if (!scenario) return null;
  return (
    <p className="carbon-label">
      Scenario {scenario.order} of {lecture10Scenarios.length} · {scenario.title}
    </p>
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
