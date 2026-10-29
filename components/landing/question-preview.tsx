"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  FlaskConical,
  Flower2,
  GraduationCap,
  LayoutGrid,
  RotateCcw,
  X,
} from "lucide-react";
import { isPreviewAnswerCorrect, previewQuestions } from "@/lib/landing-data";

export function QuestionPreview() {
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[][]>(
    previewQuestions.map(() => []),
  );
  const [checked, setChecked] = useState<boolean[]>(
    previewQuestions.map(() => false),
  );
  const [finished, setFinished] = useState(false);
  const [timed, setTimed] = useState(false);
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(false);
  const summaryRef = useRef<HTMLHeadingElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const previousIndex = useRef(index);
  const question = previewQuestions[index];
  const selected = answers[index];
  const revealed = mode === "practice" ? checked[index] : finished;
  const score = previewQuestions.filter((q, i) =>
    isPreviewAnswerCorrect(q, answers[i]),
  ).length;
  const answered = answers.filter((answer) => answer.length > 0).length;

  useEffect(() => {
    if (!running || finished || mode !== "exam" || !timed) return;
    const expiresAt = Date.now() + 90 * 1000;
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) {
        setFinished(true);
        setRunning(false);
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [running, finished, mode, timed]);

  useEffect(() => {
    if (finished) summaryRef.current?.focus();
  }, [finished]);

  useEffect(() => {
    if (previousIndex.current !== index) {
      questionRef.current?.focus();
      previousIndex.current = index;
    }
  }, [index]);

  function reset(nextMode = mode) {
    setMode(nextMode);
    setIndex(0);
    setAnswers(previewQuestions.map(() => []));
    setChecked(previewQuestions.map(() => false));
    setFinished(false);
    setSeconds(90);
    setRunning(false);
  }

  function selectAnswer(value: number) {
    if (revealed) return;
    if (mode === "exam" && timed) setRunning(true);
    const next =
      question.type === "multiple"
        ? selected.includes(value)
          ? selected.filter((answer) => answer !== value)
          : [...selected, value]
        : [value];
    setAnswers((previous) =>
      previous.map((answer, i) => (i === index ? next : answer)),
    );
  }

  return (
    <section
      id="try-it"
      className="solo-preview-section"
      aria-label="Interactive quiz preview"
    >
      <div className="preview-caption">
        <span className="status-dot" /> A little look inside{" "}
        <span>Try it. Your next “aha” starts here.</span>
        <ArrowDown size={15} />
      </div>
      <div className="product-window">
        <div className="window-top">
          <div className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span>solo.studying / practice</span>
          <span className="preview-label">Interactive preview</span>
        </div>
        <div className="product-body">
          <aside className="product-sidebar" aria-label="Preview context">
            <div className="mini-brand">
              <GraduationCap size={22} /> Your study space
            </div>
            <div className="sidebar-link">
              <LayoutGrid size={17} /> Subject library
            </div>
            <div className="sidebar-link selected">
              <BookOpen size={17} /> Practice & exams
              <ChevronRight size={15} />
            </div>
            <div className="sidebar-divider" />
            <p className="sidebar-caption">YOUR SUBJECT</p>
            <div className="sidebar-subject">
              <span>
                <FlaskConical size={19} />
              </span>
              <div>
                Biology<small>Cell biology</small>
              </div>
            </div>
            <div className="sidebar-topics">
              <span className={index < 2 ? "active" : ""}>Cell biology</span>
              <span className={index === 2 ? "active" : ""}>Genetics</span>
            </div>
            <div className="sidebar-note">
              <div className="note-flower" aria-hidden="true">
                <Flower2 size={32} strokeWidth={1} />
              </div>
              <p>
                Small steps.
                <br />
                <strong>Stronger understanding.</strong>
              </p>
              <span>Just you and your next breakthrough.</span>
            </div>
            <div className="guest-profile">
              <span>Y</span>
              <div>
                You’re a guest<small>No account needed</small>
              </div>
              <span className="status-dot" />
            </div>
          </aside>
          <div className="question-workspace">
            <div className="workspace-breadcrumb">
              Biology <ChevronRight size={13} /> {question.topic}
              <span className="curated-mark">
                <CircleCheck size={13} /> Curated question bank
              </span>
            </div>
            <div className="workspace-header">
              <h2>Let’s make it click.</h2>
              <div className="mode-switch" aria-label="Preview mode">
                <button
                  onClick={() => reset("practice")}
                  aria-pressed={mode === "practice"}
                >
                  Practice
                </button>
                <button
                  onClick={() => reset("exam")}
                  aria-pressed={mode === "exam"}
                >
                  Exam
                </button>
              </div>
            </div>
            <div className="question-meta">
              <span>
                {mode === "practice"
                  ? "Learn at your own pace"
                  : "Answers stay hidden until submission"}
              </span>
              <span>
                {mode === "exam" && timed ? (
                  <>
                    <Clock3 size={13} /> {Math.floor(seconds / 60)}:
                    {String(seconds % 60).padStart(2, "0")}
                  </>
                ) : (
                  "No time pressure"
                )}
              </span>
            </div>
            <div className="question-progress">
              <span
                style={{ width: `${((finished ? 3 : index + 1) / 3) * 100}%` }}
              />
            </div>
            {finished ? (
              <div className="preview-complete">
                <div className="complete-icon">
                  <CircleCheck size={29} />
                </div>
                <p className="section-eyebrow">PREVIEW COMPLETE</p>
                <h3 ref={summaryRef} tabIndex={-1}>
                  {score === 3
                    ? "That’s understanding in action."
                    : "Every answer is a starting point."}
                </h3>
                <p>
                  You got <strong>{score} out of 3</strong> correct ·{" "}
                  {Math.round((score / 3) * 100)}% accuracy
                </p>
                <div className="review-list">
                  {previewQuestions.map((q, i) => (
                    <details key={q.id}>
                      <summary>
                        <span
                          className={
                            isPreviewAnswerCorrect(q, answers[i])
                              ? "review-correct"
                              : "review-incorrect"
                          }
                        >
                          {isPreviewAnswerCorrect(q, answers[i]) ? (
                            <Check size={15} />
                          ) : (
                            <X size={15} />
                          )}
                        </span>
                        {q.topic}
                        <ChevronRight size={14} />
                      </summary>
                      <p>{q.prompt}</p>
                      <p>
                        Your answer:{" "}
                        {answers[i].map((a) => q.answers[a]).join(", ") ||
                          "Unanswered"}
                      </p>
                      <p>
                        <strong>Correct answer:</strong>{" "}
                        {q.correct.map((a) => q.answers[a]).join(", ")}
                      </p>
                      <p>{q.explanation}</p>
                    </details>
                  ))}
                </div>
                <button
                  className="solo-button solo-button-dark small"
                  onClick={() => reset()}
                >
                  <RotateCcw size={14} /> Try again
                </button>
              </div>
            ) : (
              <>
                <div className="question-type">
                  <span>
                    {question.type === "multiple"
                      ? "Select all that apply"
                      : question.type === "boolean"
                        ? "True or false"
                        : "Choose one answer"}
                  </span>
                  <span>
                    {index + 1} of {previewQuestions.length}
                  </span>
                </div>
                <h3 ref={questionRef} tabIndex={-1} className="question-prompt">
                  {question.prompt}
                </h3>
                <div
                  className="answer-list"
                  role="group"
                  aria-label={question.prompt}
                >
                  {question.answers.map((answer, i) => {
                    const isCorrect = revealed && question.correct.includes(i);
                    const isWrong =
                      revealed &&
                      selected.includes(i) &&
                      !question.correct.includes(i);
                    return (
                      <button
                        key={answer}
                        className={`answer-option ${selected.includes(i) ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
                        onClick={() => selectAnswer(i)}
                        disabled={revealed}
                        aria-pressed={selected.includes(i)}
                      >
                        <span
                          className={`answer-letter ${question.type === "multiple" ? "square" : ""}`}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{answer}</span>
                        {isCorrect ? (
                          <CircleCheck size={18} />
                        ) : isWrong ? (
                          <X size={18} />
                        ) : (
                          <span className="answer-radio" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div aria-live="polite">
                  {revealed && (
                    <div
                      className={`answer-explanation ${isPreviewAnswerCorrect(question, selected) ? "correct" : "incorrect"}`}
                    >
                      <strong>
                        {isPreviewAnswerCorrect(question, selected) ? (
                          <>
                            <CircleCheck size={16} /> Exactly right. Here’s why.
                          </>
                        ) : (
                          <>
                            <BookOpen size={16} /> A good moment to learn.
                          </>
                        )}
                      </strong>
                      <p>{question.explanation}</p>
                    </div>
                  )}
                </div>
                {mode === "exam" && (
                  <label className="timer-setting">
                    <input
                      type="checkbox"
                      checked={timed}
                      disabled={running}
                      onChange={(event) => {
                        setTimed(event.target.checked);
                        setSeconds(90);
                      }}
                    />{" "}
                    Optional 90-second timer{" "}
                    <span>Starts with your first answer</span>
                  </label>
                )}
                <div className="question-actions">
                  <button
                    className="text-action"
                    disabled={index === 0}
                    onClick={() => setIndex((i) => i - 1)}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <span>Make room for a little progress.</span>
                  {mode === "practice" && !revealed ? (
                    <button
                      className="solo-button solo-button-dark small"
                      disabled={!selected.length}
                      onClick={() =>
                        setChecked((previous) =>
                          previous.map((value, i) =>
                            i === index ? true : value,
                          ),
                        )
                      }
                    >
                      Check answer <ArrowRight size={14} />
                    </button>
                  ) : index < 2 ? (
                    <button
                      className="solo-button solo-button-dark small"
                      onClick={() => setIndex((i) => i + 1)}
                    >
                      Next question <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      className="solo-button solo-button-dark small"
                      onClick={() => {
                        setFinished(true);
                        setRunning(false);
                      }}
                    >
                      {mode === "exam" ? "Submit exam" : "See results"}
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          <aside className="preview-rail" aria-label="Preview progress">
            <div className="rail-icon">
              <BookOpen size={18} />
            </div>
            <h3>
              Your pace.
              <br />
              Your progress.
            </h3>
            <p>
              {mode === "practice"
                ? "Understanding comes one question at a time."
                : "A focused space to put your knowledge to the test."}
            </p>
            <div className="rail-navigation" aria-label="Question navigation">
              {previewQuestions.map((q, i) => (
                <button
                  key={q.id}
                  aria-label={`Go to question ${i + 1}`}
                  aria-current={index === i ? "step" : undefined}
                  disabled={finished}
                  className={
                    index === i
                      ? "current"
                      : answers[i].length
                        ? "answered"
                        : ""
                  }
                  onClick={() => setIndex(i)}
                >
                  {mode === "practice" && checked[i] ? (
                    <Check size={15} />
                  ) : (
                    i + 1
                  )}
                </button>
              ))}
            </div>
            <div className="rail-divider" />
            <span className="rail-count">
              {answered}
              <span> / 3</span>
            </span>
            <small>questions answered</small>
            <div className="rail-bottom">
              <Check size={14} />{" "}
              {mode === "practice"
                ? "Instant explanations"
                : "Review after submission"}
            </div>
          </aside>
        </div>
        <div className="window-bottom">
          <span>
            <span className="status-dot" /> Guest session · nothing to sign up
            for
          </span>
          <span>3 sample questions · Preview answers aren’t saved</span>
        </div>
      </div>
    </section>
  );
}
