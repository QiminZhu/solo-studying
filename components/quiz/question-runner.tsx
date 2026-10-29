"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon as ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CheckIcon as Check } from "@phosphor-icons/react/dist/csr/Check";
import { CheckCircleIcon as CircleCheck } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClockIcon as Clock3 } from "@phosphor-icons/react/dist/csr/Clock";
import { FlagIcon as Flag } from "@phosphor-icons/react/dist/csr/Flag";
import { SignOutIcon as LogOut } from "@phosphor-icons/react/dist/csr/SignOut";
import { XIcon as X } from "@phosphor-icons/react/dist/csr/X";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { PlatformShell } from "./platform-shell";
import { QuestionSourceDetails } from "./question-source-details";
import { lectureFolder } from "@/lib/quiz-navigation";
import { questionTypes } from "@/lib/quiz-bank";
import {
  isAnswerCorrect,
  parseQuizSession,
  sessionResults,
  sessionQuestions,
  type QuizSession,
} from "@/lib/quiz-session";
import {
  clearGuestQuiz,
  guestSnapshot,
  saveGuestQuiz,
  patchGuestQuiz,
  finishGuestQuiz,
  subscribeGuestQuiz,
} from "@/lib/guest-quiz-store";

const serverSnapshot = () => null;
const serverReady = () => false;
const clientReady = () => true;

export function QuestionRunner() {
  const raw = useSyncExternalStore(
    subscribeGuestQuiz,
    guestSnapshot,
    serverSnapshot,
  );
  const ready = useSyncExternalStore(
    subscribeGuestQuiz,
    clientReady,
    serverReady,
  );
  const session = useMemo(() => parseQuizSession(raw), [raw]);
  return (
    <PlatformShell active="runner">
      <main id="page-content" className="runner-page carbon-container">
        {!ready ? (
          <div className="empty-session" role="status">
            <h1>Loading your quiz…</h1>
          </div>
        ) : !session ? (
          <div className="empty-session">
            <p className="carbon-label">Question runner</p>
            <h1>No active quiz.</h1>
            <p>
              Open a quiz from your lecture folder to begin. Guest sessions stay
              in the browser tab where you start them.
            </p>
            <Link href={lectureFolder.href} className="carbon-button primary">
              Open Lecture 9 <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <ActiveRunner session={session} />
        )}
      </main>
    </PlatformShell>
  );
}

function ActiveRunner({ session }: { session: QuizSession }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [now, setNow] = useState(Date.now);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const previousIndex = useRef(session.index);
  const submitDialog = useRef<HTMLDialogElement>(null);
  const leaveDialog = useRef<HTMLDialogElement>(null);
  const questions = sessionQuestions(session);
  const question = questions[session.index];
  const selected = session.answers[question.id] ?? [];
  const finished = session.submittedAt !== null;
  const exam = session.config.mode === "exam";
  const quiz = session.quizSnapshot;
  const revealed = !exam && session.checked.includes(question.id);
  const answered = questions.filter(
    (q) => session.answers[q.id]?.length,
  ).length;
  const seconds = session.expiresAt
    ? Math.max(0, Math.ceil((session.expiresAt - now) / 1000))
    : null;

  useEffect(() => {
    if (finished || !session.expiresAt) return;
    const interval = window.setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= session.expiresAt!) {
        try {
          saveGuestQuiz({ ...session, submittedAt: time });
        } catch {
          setError(
            "The browser could not store your submission. Keep this tab open and try submitting again.",
          );
        }
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [session, finished]);

  useEffect(() => {
    if (finished) {
      submitDialog.current?.close();
      leaveDialog.current?.close();
      resultsHeading.current?.focus();
    } else if (previousIndex.current !== session.index) {
      questionHeading.current?.focus();
      previousIndex.current = session.index;
    }
  }, [session.index, finished]);

  function persist(patch: Partial<QuizSession>) {
    try {
      patchGuestQuiz(session, patch);
      setError("");
    } catch {
      setError(
        "This browser could not save your response. Allow storage for this site and try again.",
      );
    }
  }
  function select(value: number) {
    if (revealed || finished) return;
    const next =
      question.type === "multiple"
        ? selected.includes(value)
          ? selected.filter((answer) => answer !== value)
          : [...selected, value]
        : [value];
    persist({ answers: { ...session.answers, [question.id]: next } });
  }
  function submit() {
    submitDialog.current?.close();
    try {
      finishGuestQuiz(session);
      setError("");
    } catch {
      setError("The submission could not be stored. Try submitting again.");
    }
  }
  function leave() {
    try {
      clearGuestQuiz();
      router.push(lectureFolder.href);
    } catch {
      setError(
        "Could not clear the guest session. You can return to the lecture folder using the navigation.",
      );
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
            {finished ? "Results" : exam ? "Exam Mode" : "Practice Mode"}
          </span>
        </nav>
        <span className="neutral-status">Guest session</span>
      </div>
      {error && (
        <p className="carbon-error" role="alert">
          {error}
        </p>
      )}
      {finished ? (
        <QuizResults session={session} headingRef={resultsHeading} />
      ) : (
        <>
          <div className="runner-heading">
            <div>
              <p className="carbon-label">
                {session.config.difficulty} difficulty
              </p>
              <h1>
                {quiz?.title ??
                  `${session.config.subject} ${exam ? "examination" : "practice"}`}
              </h1>
              <p>
                {exam
                  ? "Your answers are evaluated after submission."
                  : "Check each answer to see feedback and a detailed explanation."}
              </p>
              {quiz && (
                <p className="runner-preset-label">
                  ITCS217 · {quiz.questions.length} questions · Saved quiz
                </p>
              )}
            </div>
            <div className="runner-heading-actions">
              {seconds !== null && (
                <div
                  className={`exam-timer ${seconds <= 60 ? "time-low" : ""}`}
                  role="timer"
                  aria-label={`${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds remaining`}
                >
                  <Clock3 size={18} />
                  <span>
                    {Math.floor(seconds / 60)}:
                    {String(seconds % 60).padStart(2, "0")}
                  </span>
                  <small>remaining</small>
                </div>
              )}
              <button
                className="carbon-button secondary"
                onClick={() => submitDialog.current?.showModal()}
              >
                {exam ? "Submit exam" : "Finish practice"}{" "}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div
            className={`runner-grid ${navigationOpen ? "" : "navigation-collapsed"}`}
          >
            <section className="runner-main" aria-labelledby="question-heading">
              <div className="runner-progress">
                <span>
                  Question {session.index + 1} of {questions.length}
                </span>
                <span>{answered} answered</span>
              </div>
              <progress
                max={questions.length}
                value={answered}
                aria-label={`${answered} of ${questions.length} questions answered`}
              />
              <div className="runner-question-meta">
                <span>{question.topic}</span>
                <span>
                  {
                    questionTypes.find((type) => type.id === question.type)
                      ?.label
                  }{" "}
                  · {question.difficulty}
                </span>
              </div>
              <h2 ref={questionHeading} tabIndex={-1} id="question-heading">
                {question.prompt}
              </h2>
              <p className="answer-instruction">
                {question.type === "multiple"
                  ? "Select all that apply. Every correct option must be selected."
                  : question.type === "boolean"
                    ? "Choose true or false."
                    : "Choose one answer."}
              </p>
              <fieldset className="runner-answer-list">
                <legend className="sr-only">Your answer</legend>
                {question.answers.map((answer, index) => (
                  <label
                    key={answer}
                    className={`runner-answer ${selected.includes(index) ? "selected" : ""} ${revealed && selected.includes(index) && question.correct.includes(index) ? "correct" : ""} ${revealed && selected.includes(index) && !question.correct.includes(index) ? "incorrect" : ""}`}
                  >
                    <input
                      type={question.type === "multiple" ? "checkbox" : "radio"}
                      name={`answer-${question.id}`}
                      checked={selected.includes(index)}
                      disabled={revealed}
                      onChange={() => select(index)}
                    />
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{answer}</span>
                    {revealed && question.correct.includes(index) && (
                      <span className="answer-status">
                        <Check size={16} /> {selected.includes(index) ? "Your answer · Correct" : "Correct answer · Not selected"}
                      </span>
                    )}
                    {revealed &&
                      selected.includes(index) &&
                      !question.correct.includes(index) && (
                        <span className="answer-status">
                          <X size={16} /> Your answer · Incorrect
                        </span>
                      )}
                  </label>
                ))}
              </fieldset>
              <div aria-live="polite">
                {revealed && (
                  <div
                    className={`runner-feedback ${isAnswerCorrect(question, selected) ? "success" : "error"}`}
                  >
                    <strong>
                      {isAnswerCorrect(question, selected) ? (
                        <>
                          <CircleCheck size={18} /> Correct answer
                        </>
                      ) : (
                        <>
                          <X size={18} /> Not quite. Review the explanation.
                        </>
                      )}
                    </strong>
                    <p>{question.explanation}</p>
                    <QuestionSourceDetails question={question} />
                    {!isAnswerCorrect(question, selected) && (
                      <p>
                        <strong>Correct answer:</strong>{" "}
                        {question.correct
                          .map((answer) => question.answers[answer])
                          .join("; ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="runner-question-actions">
                <button
                  className="carbon-button ghost"
                  disabled={session.index === 0}
                  onClick={() => persist({ index: session.index - 1 })}
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                <button
                  className="carbon-button ghost flag-action"
                  aria-pressed={session.flagged.includes(question.id)}
                  onClick={() =>
                    persist({
                      flagged: session.flagged.includes(question.id)
                        ? session.flagged.filter((id) => id !== question.id)
                        : [...session.flagged, question.id],
                    })
                  }
                >
                  <Flag size={16} />{" "}
                  {session.flagged.includes(question.id)
                    ? "Flagged for review"
                    : "Flag for review"}
                </button>
                {!exam && !revealed ? (
                  <button
                    className="carbon-button primary"
                    disabled={!selected.length}
                    onClick={() =>
                      persist({ checked: [...session.checked, question.id] })
                    }
                  >
                    Check answer <Check size={16} />
                  </button>
                ) : (
                  <button
                    className="carbon-button primary"
                    onClick={() =>
                      session.index < questions.length - 1
                        ? persist({ index: session.index + 1 })
                        : submitDialog.current?.showModal()
                    }
                  >
                    {session.index < questions.length - 1
                      ? "Next question"
                      : "Review & finish"}
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </section>
            <aside className="runner-sidebar" aria-label="Question navigation">
              <div className="runner-navigation-header">
                <h2>Question navigation</h2>
                <button
                  className="carbon-icon-button runner-navigation-toggle"
                  aria-expanded={navigationOpen}
                  aria-controls="runner-navigation-content"
                  aria-label={
                    navigationOpen
                      ? "Hide question navigation"
                      : "Show question navigation"
                  }
                  title={
                    navigationOpen
                      ? "Hide question navigation"
                      : "Show question navigation"
                  }
                  onClick={() => setNavigationOpen((open) => !open)}
                >
                  {navigationOpen ? (
                    <CaretRightIcon size={20} aria-hidden="true" />
                  ) : (
                    <CaretLeftIcon size={20} aria-hidden="true" />
                  )}
                </button>
              </div>
              {!navigationOpen && (
                <p
                  className="runner-navigation-compact"
                  aria-label={`Question ${session.index + 1} of ${questions.length}`}
                >
                  {session.index + 1} / {questions.length}
                </p>
              )}
              <div
                id="runner-navigation-content"
                className="runner-navigation-content"
                hidden={!navigationOpen}
              >
                <p>Move between questions at any time.</p>
                <div
                  className="question-nav-grid"
                  aria-label="Question navigation"
                >
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      className={`${session.index === index ? "current" : ""} ${session.answers[q.id]?.length ? "answered" : ""}`}
                      aria-current={
                        session.index === index ? "step" : undefined
                      }
                      aria-label={`Question ${index + 1}, ${session.answers[q.id]?.length ? "answered" : "unanswered"}${session.flagged.includes(q.id) ? ", flagged" : ""}`}
                      onClick={() => persist({ index })}
                    >
                      {index + 1}
                      {session.flagged.includes(q.id) && <Flag size={10} />}
                    </button>
                  ))}
                </div>
                <div className="nav-legend">
                  <span>
                    <i className="current" /> Current
                  </span>
                  <span>
                    <i className="answered" /> Answered
                  </span>
                  <span>
                    <i /> Unanswered
                  </span>
                  <span>
                    <Flag size={12} /> Flagged
                  </span>
                </div>
                <dl className="session-details">
                  <div>
                    <dt>Answered</dt>
                    <dd>
                      {answered} / {questions.length}
                    </dd>
                  </div>
                  <div>
                    <dt>Flagged</dt>
                    <dd>{session.flagged.length}</dd>
                  </div>
                  <div>
                    <dt>Selected topics</dt>
                    <dd>{session.config.topics.length}</dd>
                  </div>
                </dl>
                <p className="runner-side-note">
                  {exam
                    ? "Answers stay hidden until you submit. Unanswered questions earn no points."
                    : "Use explanations to understand each answer. Checked answers are locked for this session."}
                </p>
              </div>
              <button
                className="carbon-button ghost leave-action"
                aria-label="Leave quiz"
                title="Leave quiz"
                onClick={() => leaveDialog.current?.showModal()}
              >
                <LogOut size={16} aria-hidden="true" />{" "}
                <span className="runner-leave-label">Leave quiz</span>
              </button>
            </aside>
          </div>
        </>
      )}
      <dialog
        ref={submitDialog}
        className="carbon-dialog"
        aria-labelledby="submit-title"
      >
        <h2 id="submit-title">
          {exam ? "Submit your exam?" : "Finish this practice session?"}
        </h2>
        <p>
          You have answered {answered} of {questions.length} questions.
          {answered < questions.length
            ? ` ${questions.length - answered} unanswered questions will earn no points.`
            : " Your answers are ready to review."}
        </p>
        <p>
          After submission, answers are locked and all explanations become
          available.
        </p>
        <div>
          <button
            className="carbon-button secondary"
            onClick={() => submitDialog.current?.close()}
          >
            Keep working
          </button>
          <button className="carbon-button primary" onClick={submit}>
            Submit & view results <ArrowRight size={16} />
          </button>
        </div>
      </dialog>
      <dialog
        ref={leaveDialog}
        className="carbon-dialog"
        aria-labelledby="leave-title"
      >
        <h2 id="leave-title">Leave this quiz?</h2>
        <p>
          This clears the current guest session and its answers. You can create
          a new quiz afterward.
        </p>
        <div>
          <button
            className="carbon-button secondary"
            onClick={() => leaveDialog.current?.close()}
          >
            Keep working
          </button>
          <button className="carbon-button danger" onClick={leave}>
            Leave quiz <LogOut size={16} />
          </button>
        </div>
      </dialog>
    </>
  );
}

function QuizResults({
  session,
  headingRef,
}: {
  session: QuizSession;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const results = sessionResults(session);
  const quiz = session.quizSnapshot;
  const questions = sessionQuestions(session);
  const elapsed = Math.max(
    0,
    Math.round(
      (Math.min(session.submittedAt!, session.expiresAt ?? Infinity) -
        session.createdAt) /
        1000,
    ),
  );
  return (
    <section className="quiz-results">
      <div className="results-title">
        <div>
          <p className="carbon-label">
            {session.config.subject} ·{" "}
            {session.config.mode === "exam" ? "Exam" : "Practice"} complete
          </p>
          {quiz && <p className="runner-preset-label">{quiz.title}</p>}
          <h1 ref={headingRef} tabIndex={-1}>
            Your results.
          </h1>
          <p>
            {session.expiresAt && session.submittedAt! >= session.expiresAt
              ? "Time is up. Your answers were submitted automatically."
              : "Review what you know and choose what to practice next."}
          </p>
        </div>
        <Link href={lectureFolder.href} className="carbon-button primary">
          Back to Lecture 9 <ArrowRight size={16} />
        </Link>
      </div>
      <div className="result-metrics">
        <div>
          <span>Score</span>
          <strong>
            {results.correct}
            <small> / {results.total}</small>
          </strong>
        </div>
        <div>
          <span>Accuracy</span>
          <strong>{results.accuracy}%</strong>
        </div>
        <div>
          <span>Correct / incorrect</span>
          <strong>
            {results.correct}
            <small> / {results.incorrect}</small>
          </strong>
        </div>
        <div>
          <span>Time spent</span>
          <strong>
            {Math.floor(elapsed / 60)}
            <small>m {elapsed % 60}s</small>
          </strong>
        </div>
      </div>
      <div className="result-topic-panel">
        <h2>Performance by topic</h2>
        <p>
          Correct answers out of all questions in each topic. Unanswered
          questions count as incorrect.
        </p>
        <table className="carbon-table">
          <caption className="sr-only">Topic performance</caption>
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Correct / total</th>
              <th scope="col">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {results.topics.map((topic) => (
              <tr key={topic.topic}>
                <th scope="row">{topic.topic}</th>
                <td>
                  {topic.correct} / {topic.total}
                </td>
                <td>
                  <div className="result-topic-accuracy">
                    <span>
                      {Math.round((topic.correct / topic.total) * 100)}%
                    </span>
                    <progress
                      max={topic.total}
                      value={topic.correct}
                      aria-label={`${topic.topic}: ${topic.correct} of ${topic.total} correct`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="answer-review" aria-labelledby="review-heading">
        <h2 id="review-heading">Review every answer</h2>
        <p>
          One point per correct answer. Multiple-answer questions require an
          exact match.
        </p>
        {questions.map((question, index) => {
          const answer = session.answers[question.id] ?? [];
          const correct = isAnswerCorrect(question, answer);
          return (
            <details key={question.id}>
              <summary>
                <span
                  className={`review-result ${correct ? "correct" : "incorrect"}`}
                >
                  {correct ? <CircleCheck size={18} /> : <X size={18} />}
                  <span>
                    {correct
                      ? "Correct"
                      : answer.length
                        ? "Incorrect"
                        : "Unanswered"}
                  </span>
                </span>
                <span>
                  <small>
                    {index + 1}. {question.topic}
                    {session.flagged.includes(question.id) ? " · Flagged" : ""}
                  </small>
                  {question.prompt}
                </span>
                <span className="review-expand">
                  Review <ArrowRight size={16} />
                </span>
              </summary>
              <div className="review-answer-body">
                <p>
                  <strong>Your answer:</strong>{" "}
                  {answer.length
                    ? answer.map((a) => question.answers[a]).join("; ")
                    : "Not answered"}
                </p>
                <p>
                  <strong>Correct answer:</strong>{" "}
                  {question.correct.map((a) => question.answers[a]).join("; ")}
                </p>
                <p>
                  <strong>Explanation:</strong> {question.explanation}
                </p>
                <QuestionSourceDetails question={question} />
              </div>
            </details>
          );
        })}
      </section>
      <div className="carbon-notice">
        These results remain in this browser tab. They are not saved to an
        account. Create a new quiz to start a fresh session.
      </div>
    </section>
  );
}
