"use client";

import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { PlatformShell } from "../platform-shell";
import {
  initialPreview,
  previewChoices,
  previewCorrectIndex,
  previewExplanation,
  previewSteps,
  reducePreview,
  type PreviewModel,
} from "@/lib/quiz-v3/practice-preview";

export function PracticeFeedbackPreview() {
  const [state, setState] = useState<PreviewModel>(initialPreview);
  const answered = state.selected !== null;
  const checkDisabled = state.phase !== "answering" || !answered;
  const correctRow = state.phase === "correct";

  function dispatch(action: Parameters<typeof reducePreview>[1]) {
    setState((current) => reducePreview(current, action));
  }

  return (
    <PlatformShell active="runner">
      <main id="page-content" className="carbon-container v3-page practice-preview">
        <p className="carbon-label">Design preview · not a saved attempt</p>
        <h1>Practice feedback</h1>
        <p>
          A wrong check keeps the choice and records the first result. The
          correct option stays unmarked until you choose it. Lecture questions
          have one explanation, not a multi-step hint ladder.
        </p>
        <div className="practice-preview-steps" role="group" aria-label="Preview steps">
          {previewSteps.map((step, index) => {
            const active =
              step.state.selected === state.selected &&
              step.state.phase === state.phase &&
              step.state.explanationOpen === state.explanationOpen &&
              step.state.firstCheck === state.firstCheck &&
              step.state.movedOn === state.movedOn;
            return (
              <button
                key={step.id}
                type="button"
                className="carbon-button ghost"
                aria-pressed={active}
                onClick={() => dispatch({ type: "jump", state: step.state })}
              >
                {index + 1}. {step.label}
              </button>
            );
          })}
        </div>
        <article className="practice-preview-card" aria-labelledby="preview-question">
          <p className="carbon-label">Checked as you go</p>
          <p className="practice-preview-progress">
            <span>Question 2 of 15</span>
            <span>
              First check:{" "}
              {state.firstCheck === "unrecorded"
                ? "not yet"
                : state.firstCheck}
            </span>
          </p>
          <h2 id="preview-question">
            A host has a valid IP configuration and wants to send to an
            off-network destination. Which device is its initial local next hop?
          </h2>
          <fieldset
            className="runner-answer-list"
            disabled={correctRow || state.movedOn}
          >
            <legend>Choose one answer.</legend>
            {previewChoices.map((choice, index) => {
              const selected = state.selected === index;
              const showCorrect = correctRow && index === previewCorrectIndex;
              return (
                <label
                  key={choice}
                  className={`runner-answer${selected && !showCorrect ? " selected" : ""}${showCorrect ? " correct" : ""}`}
                >
                  <input
                    type="radio"
                    name="preview-answer"
                    checked={selected}
                    onChange={() => dispatch({ type: "select", index })}
                  />
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{choice}</span>
                  {showCorrect && (
                    <span className="answer-status">
                      <CheckIcon size={16} aria-hidden="true" /> Correct
                    </span>
                  )}
                </label>
              );
            })}
          </fieldset>
          {state.phase === "wrong" && (
            <p className="carbon-notice" role="status">
              <strong>Not quite yet.</strong> Give it another try. This first
              check stays incorrect, and the correct option is not marked.
            </p>
          )}
          {state.explanationOpen && (
            <section className="practice-preview-explanation" aria-label="Explanation">
              <h3>Explanation</h3>
              <p>{previewExplanation}</p>
            </section>
          )}
          {state.phase === "correct" && (
            <p className="practice-preview-success" role="status">
              <CheckIcon size={16} aria-hidden="true" />
              <span>
                {state.firstCheck === "correct"
                  ? "Correct. This first check is the assessment."
                  : "This try is correct. The first check remains incorrect."}
              </span>
            </p>
          )}
          {state.movedOn && (
            <p className="carbon-helper">
              Next question would open question 3. The first check stays on
              the record.
            </p>
          )}
          <div className="practice-preview-bar">
            <p>Question 2 of 15</p>
            <div className="v3-actions">
              {state.phase === "answering" && (
                <button
                  type="button"
                  className="carbon-button primary"
                  disabled={checkDisabled}
                  onClick={() => dispatch({ type: "check" })}
                >
                  Check answer
                </button>
              )}
              {state.phase === "wrong" && (
                <>
                  <button
                    type="button"
                    className="carbon-button secondary"
                    aria-expanded={state.explanationOpen}
                    onClick={() => dispatch({ type: "toggle-explanation" })}
                  >
                    {state.explanationOpen
                      ? "Hide the explanation"
                      : "Show the explanation"}
                  </button>
                  <button
                    type="button"
                    className="carbon-button primary"
                    onClick={() => dispatch({ type: "try-again" })}
                  >
                    Try again
                  </button>
                </>
              )}
              {state.phase === "correct" && (
                <>
                  <button
                    type="button"
                    className="carbon-button secondary"
                    aria-expanded={state.explanationOpen}
                    onClick={() => dispatch({ type: "toggle-explanation" })}
                  >
                    {state.explanationOpen
                      ? "Hide the explanation"
                      : "Show the explanation"}
                  </button>
                  <button
                    type="button"
                    className="carbon-button primary"
                    disabled={state.movedOn}
                    onClick={() => dispatch({ type: "next" })}
                  >
                    Next question <ArrowRightIcon size={16} aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </div>
        </article>
      </main>
    </PlatformShell>
  );
}
