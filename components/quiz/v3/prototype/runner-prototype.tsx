"use client";

// Three runner layouts plus the current page, switchable via ?variant=.
// Dev only. Reads nothing and writes nothing.

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { FlagIcon } from "@phosphor-icons/react/dist/csr/Flag";
import { lectureFolder } from "@/lib/quiz-navigation";
import { PlatformShell } from "../../platform-shell";
import {
  runnerVariants,
  type RunnerPrototypeView,
} from "./prototype-types";
import "./runner-prototype.css";

type SampleQuestion = {
  id: string;
  topic: string;
  objectiveId: string;
  prompt: string;
  answers: string[];
  correct: number;
  explanation: string;
  optionExplanations: string[];
  sources: string[];
};

type LocalAnswer = { selected: number | null; revealed: boolean };

const QUESTIONS: SampleQuestion[] = [
  {
    id: "itcs217-l09-o01-q101",
    topic: "Link communication",
    objectiveId: "itcs217-l09-o01",
    prompt: "What does a link connect in the lecture’s network model?",
    answers: [
      "Two neighboring nodes",
      "All hosts that use the same application",
      "Every router on an end-to-end route at once",
      "Only two hosts using identical physical media",
    ],
    correct: 0,
    explanation:
      "A link is a local connection between two nodes. Several links can form an end-to-end path.",
    optionExplanations: [
      "A link is a connection between neighboring nodes.",
      "Application membership does not define a local link.",
      "An end-to-end route can contain several distinct links.",
      "Links along a route can use different media; identical media are not the defining condition.",
    ],
    sources: ["ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026.pdf · page 4"],
  },
  {
    id: "itcs217-l09-o05-q102",
    topic: "Link communication",
    objectiveId: "itcs217-l09-o05",
    prompt:
      "Why does a router normally remove an incoming data-link frame and create an outgoing frame?",
    answers: [
      "Every router must replace the original application message.",
      "The incoming frame is valid only if every later link has the same technology.",
      "A frame is suited to its current local link; the next link needs suitable framing.",
      "The frame’s trailer permanently replaces the network-layer datagram.",
    ],
    correct: 2,
    explanation:
      "A router forwards the datagram using a frame appropriate to its outgoing link; the incoming frame does not span the entire route.",
    optionExplanations: [
      "Routing does not require replacing the original application message.",
      "A route may combine different link technologies.",
      "Framing is local to the current link, so outgoing encapsulation serves the next link.",
      "The datagram remains the encapsulated network-layer unit; the trailer does not replace it.",
    ],
    sources: [
      "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026.pdf · page 6",
      "ITCS217-Lecture 9-Intro-to Data-Link-Layer-2026.pdf · page 18",
    ],
  },
];

const MAP_SIZE = 20;

type Model = {
  qi: number;
  question: SampleQuestion;
  selected: number | null;
  revealed: boolean;
  flagged: boolean;
  correct: boolean;
  answeredCount: number;
  notice: string;
  navigationOpen: boolean;
  answers: LocalAnswer[];
  flags: boolean[];
  select: (index: number) => void;
  check: () => void;
  retry: () => void;
  clear: () => void;
  flag: () => void;
  finish: () => void;
  go: (index: number) => void;
  setNavigationOpen: (open: boolean) => void;
};

function usePreviewModel(): Model {
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<LocalAnswer[]>([
    { selected: 0, revealed: true },
    { selected: null, revealed: false },
  ]);
  const [flags, setFlags] = useState([false, false]);
  const [notice, setNotice] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(true);
  const question = QUESTIONS[qi];
  const local = answers[qi];
  const selected = local.selected;
  const revealed = local.revealed;

  function patch(next: Partial<LocalAnswer>) {
    setAnswers((current) =>
      current.map((answer, index) =>
        index === qi ? { ...answer, ...next } : answer,
      ),
    );
  }

  return {
    qi,
    question,
    selected,
    revealed,
    flagged: flags[qi],
    correct: selected === question.correct,
    answeredCount: answers.filter(
      (answer) => answer.revealed && answer.selected !== null,
    ).length,
    notice,
    navigationOpen,
    answers,
    flags,
    select: (index) => {
      if (!revealed) patch({ selected: index });
    },
    check: () => {
      if (selected !== null) patch({ revealed: true });
    },
    retry: () => patch({ selected: null, revealed: false }),
    clear: () => patch({ selected: null }),
    flag: () =>
      setFlags((current) =>
        current.map((flagged, index) => (index === qi ? !flagged : flagged)),
      ),
    finish: () =>
      setNotice("Submit stays on the real quiz. This preview does not save."),
    go: (index) => {
      if (index >= 0 && index < QUESTIONS.length) {
        setQi(index);
        setNotice("");
      }
    },
    setNavigationOpen,
  };
}

export function RunnerPrototype({
  variant,
}: {
  variant: RunnerPrototypeView;
}) {
  const model = usePreviewModel();
  const active = runnerVariants.find((item) => item.key === variant);
  const stateLine = `Q${model.qi + 1} · ${
    model.revealed
      ? model.correct
        ? "correct"
        : "incorrect"
      : model.selected === null
        ? "unanswered"
        : "selected"
  } · ${model.answeredCount} answered · read-only`;

  useEffect(() => {
    const previous = document.title;
    document.title = `Preview · ${active?.name ?? "Current runner"} — Solo Studying`;
    return () => {
      document.title = previous;
    };
  }, [active?.name]);

  return (
    <PlatformShell active="runner">
      <main
        id="page-content"
        className={`carbon-container v3-page runner-prototype rp-${variant === "original" ? "original" : variant.toLowerCase()}`}
      >
        {variant === "original" ? (
          <OriginalLayout model={model} />
        ) : variant === "A" ? (
          <ReadingColumn model={model} />
        ) : variant === "B" ? (
          <QuestionFirst model={model} />
        ) : (
          <SplitDesk model={model} />
        )}
      </main>
      <PrototypeSwitcher
        current={variant}
        stateLine={stateLine}
        focus={
          active?.focus ??
          "Title 32px · question 24px · answers 14px · full-width options"
        }
      />
    </PlatformShell>
  );
}

function Crumb({ current }: { current: string }) {
  return (
    <div className="page-context">
      <nav aria-label="Breadcrumb">
        <Link href="/subjects">Subjects</Link> /{" "}
        <Link href={lectureFolder.subjectHref}>ITCS217</Link> /{" "}
        <Link href={lectureFolder.href}>{lectureFolder.title}</Link> /{" "}
        <span aria-current="page">{current}</span>
      </nav>
    </div>
  );
}

function OptionList({ model }: { model: Model }) {
  const { question, selected, revealed, select } = model;
  return (
    <fieldset disabled={revealed} className="v3-responses">
      <legend>Choose one answer.</legend>
      {question.answers.map((answer, index) => (
        <label
          key={answer}
          className={`runner-answer ${selected === index ? "selected" : ""}`}
        >
          <input
            type="radio"
            name={`preview-${question.id}`}
            checked={selected === index}
            onChange={() => select(index)}
          />
          <span>{answer}</span>
        </label>
      ))}
    </fieldset>
  );
}

function QuestionMap({ model }: { model: Model }) {
  return (
    <div>
      <div className="question-nav-grid">
        {Array.from({ length: MAP_SIZE }, (_, index) => {
          const inSample = index < QUESTIONS.length;
          const answer = inSample ? model.answers[index] : undefined;
          const answered = Boolean(
            answer?.revealed && answer.selected !== null,
          );
          const flagged = inSample && model.flags[index];
          return (
            <button
              key={index}
              type="button"
              disabled={!inSample}
              className={`${index === model.qi ? "current" : ""} ${answered ? "answered" : ""}`}
              aria-current={index === model.qi ? "step" : undefined}
              aria-label={
                inSample
                  ? `Question ${index + 1}`
                  : `Question ${index + 1}, not in this preview`
              }
              onClick={() => model.go(index)}
            >
              {index + 1}
              {(answered || flagged) && (
                <span className="v3-nav-marks" aria-hidden="true">
                  {answered && <CheckIcon size={12} />}
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
          <i className="answered" /> Answered
        </span>
        <span>
          <i className="current" /> Current
        </span>
      </div>
      <p className="carbon-helper">
        Questions 3–20 show the real map size. This preview has text for 1 and
        2.
      </p>
    </div>
  );
}

function CompactFeedback({ model }: { model: Model }) {
  const { question, selected, correct } = model;
  if (selected === null) return null;
  return (
    <section className="rp-feedback" aria-label="Answer feedback">
      <p className={`rp-score ${correct ? "correct" : "incorrect"}`}>
        {correct ? "Correct" : "Incorrect"} · {correct ? "1" : "0"} / 1 point
      </p>
      <p className="rp-explanation">
        <strong>Overall explanation:</strong> {question.explanation}
      </p>
      <div className={`v3-part ${correct ? "correct" : "incorrect"}`}>
        <strong>
          {question.answers[selected]} · Your answer ·{" "}
          {correct ? "Correct" : "Incorrect"}
        </strong>
        <p>{question.optionExplanations[selected]}</p>
      </div>
      <p className="carbon-helper">
        First check: {correct ? "1" : "0"} / 1. This result is preserved if you
        try again.
      </p>
      <details className="v3-option-explanations">
        <summary>
          {correct
            ? "Why are the other options incorrect?"
            : "Review the other options"}
        </summary>
        <ul className="v3-part-list">
          {question.answers.map((answer, index) =>
            index === selected ? null : (
              <li key={answer} className="v3-part">
                <strong>
                  {answer} ·{" "}
                  {index === question.correct
                    ? "Correct answer"
                    : "Incorrect option"}
                </strong>
                <p>{question.optionExplanations[index]}</p>
              </li>
            ),
          )}
        </ul>
      </details>
      <div className="v3-sources">
        <strong>Source references</strong>
        <ul>
          {question.sources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
        <p className="carbon-helper">
          Objective: {question.objectiveId} · Question version 1 · Approved
          version
        </p>
      </div>
    </section>
  );
}

function FullFeedback({ model }: { model: Model }) {
  const { question, selected, correct } = model;
  if (selected === null) return null;
  const others = question.answers
    .map((answer, index) => ({ answer, index }))
    .filter((item) => item.index !== selected);
  return (
    <section className="v3-feedback" aria-label="Answer feedback">
      <p className={correct ? "v3-correct" : "v3-incorrect"}>
        <strong>
          {correct ? "Correct" : "Incorrect"} · {correct ? "1" : "0"} / 1 point
        </strong>
      </p>
      <p>
        <strong>Overall explanation:</strong> {question.explanation}
      </p>
      <ul className="v3-part-list">
        <li className={`v3-part ${correct ? "correct" : "incorrect"}`}>
          <strong>
            {question.answers[selected]} · Your answer ·{" "}
            {correct ? "Correct" : "Incorrect"}
          </strong>
          <p>{question.optionExplanations[selected]}</p>
        </li>
        {others.map((item) => (
          <li key={item.answer} className="v3-part">
            <strong>
              {item.answer} ·{" "}
              {item.index === question.correct
                ? "Correct answer · Not selected"
                : "Not selected"}
            </strong>
          </li>
        ))}
      </ul>
      <details className="v3-option-explanations">
        <summary>
          {correct
            ? "Why are the other options incorrect?"
            : "Review the other options"}
        </summary>
        <ul className="v3-part-list">
          {others.map((item) => (
            <li key={item.answer} className="v3-part">
              <strong>
                {item.answer} ·{" "}
                {item.index === question.correct
                  ? "Correct answer"
                  : "Incorrect option"}
              </strong>
              <p>{question.optionExplanations[item.index]}</p>
            </li>
          ))}
        </ul>
      </details>
      <div className="v3-sources">
        <strong>Source references</strong>
        <ul>
          {question.sources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
        <p className="carbon-helper">
          Objective: {question.objectiveId} · Question version 1 · Approved
          version
        </p>
      </div>
    </section>
  );
}

function ActionRow({ model }: { model: Model }) {
  const { qi, revealed, selected, flagged } = model;
  const onLast = qi === QUESTIONS.length - 1;
  return (
    <div className="rp-actions">
      <button
        type="button"
        className="carbon-button ghost"
        disabled={qi === 0}
        onClick={() => model.go(qi - 1)}
      >
        <ArrowLeftIcon size={16} aria-hidden="true" />
        Previous
      </button>
      <button
        type="button"
        className="carbon-button ghost"
        aria-pressed={flagged}
        onClick={model.flag}
      >
        <FlagIcon size={18} aria-hidden="true" />
        {flagged ? "Flagged" : "Flag for review"}
      </button>
      {!(revealed && onLast) && (
        <button type="button" className="carbon-button ghost" onClick={model.finish}>
          Finish quiz
        </button>
      )}
      <div className="rp-actions-primary">
        {revealed && (
          <button
            type="button"
            className="carbon-button secondary"
            onClick={model.retry}
          >
            Try again
          </button>
        )}
        {!revealed && selected !== null && (
          <button type="button" className="carbon-button ghost" onClick={model.clear}>
            Clear response
          </button>
        )}
        {!revealed ? (
          <button
            type="button"
            className="carbon-button primary"
            disabled={selected === null}
            onClick={model.check}
          >
            Check answer
          </button>
        ) : onLast ? (
          <button type="button" className="carbon-button primary" onClick={model.finish}>
            Review and submit
          </button>
        ) : (
          <button
            type="button"
            className="carbon-button primary"
            onClick={() => model.go(qi + 1)}
          >
            Next question
            <ArrowRightIcon size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="rp-note" role="status">
        {model.notice || "Preview only. Nothing is saved."}
      </p>
    </div>
  );
}

function OriginalLayout({ model }: { model: Model }) {
  const { question, qi, answeredCount, revealed, navigationOpen } = model;
  return (
    <>
      <Crumb current="Quiz attempt" />
      <div className="v3-heading">
        <p className="carbon-label">Checked as you go</p>
        <h1>The Slimekeeper’s Cellar</h1>
        <p>
          Question {qi + 1} of {MAP_SIZE} · {answeredCount} answered
        </p>
      </div>
      <details className="v3-quiz-details">
        <summary>Quiz details</summary>
        <p>
          First assessment attempt. Select or enter a response, then check it.
          The first check is the one that counts.
        </p>
        <p>Author preview — importing does not independently validate answers.</p>
      </details>
      <div
        className={`runner-grid ${navigationOpen ? "" : "navigation-collapsed"}`}
      >
        <section className="runner-main" aria-labelledby="preview-question">
          <div className="runner-progress">
            <span>
              Question {qi + 1} of {MAP_SIZE}
            </span>
            <span>Single choice</span>
          </div>
          <p className="carbon-label">{question.topic}</p>
          <h2 id="preview-question">{question.prompt}</h2>
          <div className="v3-nav-launcher">
            <details>
              <summary className="carbon-button secondary">
                Questions · {qi + 1}/{MAP_SIZE}
              </summary>
              <QuestionMap model={model} />
            </details>
          </div>
          <OptionList model={model} />
          {revealed && <FullFeedback model={model} />}
          {revealed && (
            <p className="carbon-helper">
              First check: {model.correct ? "1" : "0"} / 1. This result is
              preserved if you try again.
            </p>
          )}
          <div className="v3-actions">
            {!revealed && (
              <button
                type="button"
                className="carbon-button primary"
                disabled={model.selected === null}
                onClick={model.check}
              >
                Check answer
              </button>
            )}
            {revealed && qi < QUESTIONS.length - 1 && (
              <button
                type="button"
                className="carbon-button primary"
                onClick={() => model.go(qi + 1)}
              >
                Next question
                <ArrowRightIcon size={16} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className={`carbon-button ${qi === QUESTIONS.length - 1 && revealed ? "primary" : "ghost"}`}
              onClick={model.finish}
            >
              {qi === QUESTIONS.length - 1 ? "Review and submit" : "Finish quiz"}
            </button>
            {revealed && (
              <button
                type="button"
                className="carbon-button secondary"
                onClick={model.retry}
              >
                Try again
              </button>
            )}
            {!revealed && model.selected !== null && (
              <button
                type="button"
                className="carbon-button ghost"
                onClick={model.clear}
              >
                Clear response
              </button>
            )}
            <button
              type="button"
              className="carbon-button ghost"
              aria-pressed={model.flagged}
              onClick={model.flag}
            >
              <FlagIcon size={18} aria-hidden="true" />
              {model.flagged ? "Flagged" : "Flag for review"}
            </button>
          </div>
          <div className="v3-actions">
            <button
              type="button"
              className="carbon-button ghost"
              disabled={qi === 0}
              onClick={() => model.go(qi - 1)}
            >
              <ArrowLeftIcon size={16} aria-hidden="true" />
              Previous
            </button>
            {!(revealed && qi < QUESTIONS.length - 1) && (
              <button
                type="button"
                className="carbon-button ghost"
                disabled={qi === QUESTIONS.length - 1}
                onClick={() => model.go(qi + 1)}
              >
                Next question
                <ArrowRightIcon size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          <p role="status" className="carbon-helper">
            {model.notice || "Response saved in this browser."}
          </p>
        </section>
        <aside className="runner-sidebar" aria-label="Question navigation">
          <div className="runner-navigation-header">
            <h2>Questions</h2>
            <button
              type="button"
              className="carbon-button ghost"
              aria-expanded={navigationOpen}
              onClick={() => model.setNavigationOpen(!navigationOpen)}
            >
              {navigationOpen ? "Hide questions" : "Show questions"}
            </button>
          </div>
          <p>
            {qi + 1} / {MAP_SIZE}
          </p>
          {navigationOpen && <QuestionMap model={model} />}
          <Link href={lectureFolder.href} className="carbon-button secondary">
            Save & return
          </Link>
          <p className="carbon-helper">
            Resume depends on this browser on this device.
          </p>
        </aside>
      </div>
    </>
  );
}

function ReadingColumn({ model }: { model: Model }) {
  const { question, qi, answeredCount, revealed } = model;
  return (
    <>
      <Crumb current="Quiz attempt" />
      <header className="rp-titlebar">
        <h1>The Slimekeeper’s Cellar</h1>
        <p className="rp-progress">
          Question {qi + 1} of {MAP_SIZE} · {answeredCount} answered
        </p>
      </header>
      <div className="runner-grid">
        <section className="runner-main rp-reading" aria-labelledby="preview-question">
          <details className="rp-launcher">
            <summary className="carbon-button secondary">
              Questions · {qi + 1}/{MAP_SIZE}
            </summary>
            <QuestionMap model={model} />
          </details>
          <p className="carbon-label">
            {question.topic} · Single choice
          </p>
          <h2 id="preview-question">{question.prompt}</h2>
          <OptionList model={model} />
          {revealed && <CompactFeedback model={model} />}
          <ActionRow model={model} />
        </section>
        <aside className="runner-sidebar" aria-label="Question navigation">
          <div className="runner-navigation-header">
            <h2>Questions</h2>
          </div>
          <p>
            {qi + 1} / {MAP_SIZE}
          </p>
          <QuestionMap model={model} />
          <Link href={lectureFolder.href} className="carbon-button secondary">
            Save & return
          </Link>
          <p className="carbon-helper">
            Resume depends on this browser on this device.
          </p>
        </aside>
      </div>
    </>
  );
}

function QuestionFirst({ model }: { model: Model }) {
  const { question, qi, revealed } = model;
  return (
    <>
      <Crumb current="The Slimekeeper’s Cellar" />
      <div className="rp-strip" role="navigation" aria-label="Question navigation">
        {Array.from({ length: MAP_SIZE }, (_, index) => {
          const inSample = index < QUESTIONS.length;
          const answer = inSample ? model.answers[index] : undefined;
          const answered = Boolean(answer?.revealed && answer.selected !== null);
          return (
            <button
              key={index}
              type="button"
              disabled={!inSample}
              className={`${index === qi ? "current" : ""} ${answered ? "answered" : ""}`}
              aria-current={index === qi ? "step" : undefined}
              aria-label={
                inSample
                  ? `Question ${index + 1}`
                  : `Question ${index + 1}, not in this preview`
              }
              onClick={() => model.go(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <p className="rp-strip-note">
        Question {qi + 1} of {MAP_SIZE}. Questions 3–20 show the real count;
        only 1 and 2 have text in this preview.
      </p>
      <div className="rp-reading">
        <p className="carbon-label">
          {question.topic} · Single choice
        </p>
        <h1>{question.prompt}</h1>
        <OptionList model={model} />
        <ActionRow model={model} />
        {revealed && <CompactFeedback model={model} />}
      </div>
    </>
  );
}

function SplitDesk({ model }: { model: Model }) {
  const { question, qi, answeredCount, revealed, selected } = model;
  return (
    <>
      <Crumb current="Quiz attempt" />
      <header className="rp-titlebar">
        <h1>The Slimekeeper’s Cellar</h1>
        <p className="rp-progress">
          Question {qi + 1} of {MAP_SIZE} · {answeredCount} answered
        </p>
      </header>
      <div className="rp-desk">
        <section className="rp-task" aria-labelledby="preview-question">
          <p className="carbon-label">
            {question.topic} · Single choice
          </p>
          <h2 id="preview-question">{question.prompt}</h2>
          <OptionList model={model} />
          <ActionRow model={model} />
        </section>
        <aside className="rp-desk-side" aria-label="Explanation and question navigation">
          {revealed && selected !== null ? (
            <CompactFeedback model={model} />
          ) : (
            <p className="rp-waiting">
              Check an answer to read the explanation here.
            </p>
          )}
          <QuestionMap model={model} />
        </aside>
      </div>
    </>
  );
}

function PrototypeSwitcher({
  current,
  stateLine,
  focus,
}: {
  current: RunnerPrototypeView;
  stateLine: string;
  focus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const currentIndex = runnerVariants.findIndex((item) => item.key === current);
  const active = runnerVariants.find((item) => item.key === current);

  function show(key: string) {
    const next = new URLSearchParams(search.toString());
    next.set("variant", key);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  function move(direction: number) {
    const index =
      currentIndex < 0
        ? direction > 0
          ? 0
          : runnerVariants.length - 1
        : (currentIndex + direction + runnerVariants.length) %
          runnerVariants.length;
    show(runnerVariants[index].key);
  }

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        (target instanceof Element &&
          target.closest(
            "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox'], dialog[open]",
          ))
      )
        return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const index =
        currentIndex < 0
          ? event.key === "ArrowRight"
            ? 0
            : runnerVariants.length - 1
          : (currentIndex +
              (event.key === "ArrowRight" ? 1 : -1) +
              runnerVariants.length) %
            runnerVariants.length;
      const next = new URLSearchParams(search.toString());
      next.set("variant", runnerVariants[index].key);
      router.replace(`${pathname}?${next}`, { scroll: false });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, pathname, router, search]);

  if (process.env.NODE_ENV === "production") return null;
  return (
    <nav className="runner-prototype-switcher" aria-label="Runner preview layouts">
      <button type="button" onClick={() => move(-1)} aria-label="Previous layout">
        <ArrowLeftIcon size={19} aria-hidden="true" />
      </button>
      <div className="prototype-switcher-label" aria-live="polite" aria-atomic="true">
        <span>
          UI PREVIEW <span>{active ? `${active.key} / 3` : "CURRENT"}</span>
        </span>
        <strong>{active?.name ?? "Current runner"}</strong>
        <small>{focus}</small>
        <small>{stateLine}</small>
      </div>
      <button type="button" onClick={() => move(1)} aria-label="Next layout">
        <ArrowRightIcon size={19} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="prototype-original-button"
        aria-pressed={current === "original"}
        onClick={() => show("original")}
      >
        Current
      </button>
    </nav>
  );
}
