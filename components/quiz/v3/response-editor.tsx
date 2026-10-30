"use client";

import { ArrowUpIcon } from "@phosphor-icons/react/dist/csr/ArrowUp";
import { ArrowDownIcon } from "@phosphor-icons/react/dist/csr/ArrowDown";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import type { BankQuestionV3 } from "@/lib/quiz-v3/contract";
import { emptyResponse, type Response } from "@/lib/quiz-v3/grading";

export function ResponseEditor({
  question: q,
  response,
  disabled,
  markCorrect = false,
  onChange,
}: {
  question: BankQuestionV3;
  response?: Response;
  disabled: boolean;
  markCorrect?: boolean;
  onChange: (response: Response) => void;
}) {
  const r =
    !response || response.kind === "unanswered" ? emptyResponse(q) : response;
  if (
    (q.type === "single" || q.type === "multiple" || q.type === "boolean") &&
    r.kind === "choice"
  )
    return (
      <fieldset disabled={disabled} className="v3-responses">
        <legend>
          {q.type === "multiple"
            ? "Select all that apply."
            : "Choose one answer."}
        </legend>
        {q.answers.map((answer, i) => {
          const showCorrect =
            markCorrect && r.selected.includes(i) && q.correct.includes(i);
          return (
            <label
              key={i}
              className={`runner-answer${showCorrect ? " correct" : r.selected.includes(i) ? " selected" : ""}`}
            >
              <input
                type={q.type === "multiple" ? "checkbox" : "radio"}
                name={`answer-${q.id}`}
                checked={r.selected.includes(i)}
                onChange={() =>
                  onChange({
                    kind: "choice",
                    selected:
                      q.type === "multiple"
                        ? r.selected.includes(i)
                          ? r.selected.filter((v) => v !== i)
                          : [...r.selected, i]
                        : [i],
                  })
                }
              />
              <span>{answer}</span>
              {showCorrect && (
                <span className="answer-status">
                  <CheckIcon size={16} aria-hidden="true" /> Correct
                </span>
              )}
            </label>
          );
        })}
      </fieldset>
    );
  if (q.type === "matching" && r.kind === "matching") {
    const matched = Object.keys(r.selected).length;
    return (
      <fieldset disabled={disabled} className="v3-responses">
        <legend>Match each item.</legend>
        <p>
          {q.reuseRight
            ? "A right option may be used more than once."
            : "Each right option can be used once. Chosen options are marked already used."}
        </p>
        <p role="status">
          {matched} of {q.leftItems.length} matched.
        </p>
        {q.leftItems.map((left, i) => {
          return (
            <div key={i} className="carbon-field v3-match-row">
              <span>{left}</span>
              <select
                aria-label={left}
                value={r.selected[i] ?? ""}
                onChange={(e) => {
                  const next = { ...r.selected };
                  if (e.target.value === "") delete next[i];
                  else next[i] = Number(e.target.value);
                  onChange({ kind: "matching", selected: next });
                }}
              >
                <option value="">Choose a match</option>
                {q.rightItems.map((right, j) => {
                  const used =
                    !q.reuseRight &&
                    Object.entries(r.selected).some(
                      ([l, v]) => Number(l) !== i && v === j,
                    );
                  return (
                    <option key={j} value={j} disabled={used}>
                      {used ? `${right} (already used)` : right}
                    </option>
                  );
                })}
              </select>
              {markCorrect && r.selected[i] !== undefined && (
                <p className="v3-pair-note correct">Correct</p>
              )}
            </div>
          );
        })}
      </fieldset>
    );
  }
  if (q.type === "ordering" && r.kind === "ordering") {
    function move(position: number, offset: number) {
      const order = r.kind === "ordering" ? [...r.order] : [];
      [order[position], order[position + offset]] = [
        order[position + offset],
        order[position],
      ];
      onChange({ kind: "ordering", order, confirmed: true });
    }
    return (
      <fieldset disabled={disabled} className="v3-responses">
        <legend>Arrange the items in the requested sequence.</legend>
        <p>
          Use the move buttons with Tab and Enter, or focus an item and press
          Alt + Arrow Up / Down.
        </p>
        <ol className="v3-order-list">
          {r.order.map((item, position) => (
            <li
              key={item}
              tabIndex={disabled ? undefined : 0}
              aria-label={`${q.items[item]}, position ${position + 1}`}
              onKeyDown={(e) => {
                if (
                  !disabled &&
                  e.altKey &&
                  ((e.key === "ArrowUp" && position > 0) ||
                    (e.key === "ArrowDown" && position < r.order.length - 1))
                ) {
                  e.preventDefault();
                  move(position, e.key === "ArrowUp" ? -1 : 1);
                }
              }}
            >
              <span>
                {position + 1}. {q.items[item]}
              </span>
              <div>
                <button
                  type="button"
                  className="carbon-icon-button"
                  disabled={disabled || position === 0}
                  aria-label={`Move ${q.items[item]} up`}
                  onClick={() => move(position, -1)}
                >
                  <ArrowUpIcon size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="carbon-icon-button"
                  disabled={disabled || position === r.order.length - 1}
                  aria-label={`Move ${q.items[item]} down`}
                  onClick={() => move(position, 1)}
                >
                  <ArrowDownIcon size={18} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
        <label className="check-row">
          <input
            type="checkbox"
            checked={r.confirmed}
            onChange={(e) => onChange({ ...r, confirmed: e.target.checked })}
          />
          Use this sequence as my answer
        </label>
        <p role="status" className="carbon-helper">
          {r.confirmed
            ? `Current sequence: ${r.order.map((i) => q.items[i]).join(", ")}`
            : "No sequence submitted yet."}
        </p>
      </fieldset>
    );
  }
  if (q.type === "fill_blank" && r.kind === "blanks")
    return (
      <fieldset disabled={disabled} className="v3-responses">
        <legend>Complete each numbered blank.</legend>
        {q.blanks.map((blank) => (
          <label key={blank.id} className="carbon-field">
            <span>
              Blank {blank.id}
              {blank.kind === "number" && blank.unit ? ` (${blank.unit})` : ""}
            </span>
            <input
              aria-label={`Blank ${blank.id}${blank.kind === "number" && blank.unit ? ` (${blank.unit})` : ""}`}
              type="text"
              inputMode={blank.kind === "number" ? "decimal" : "text"}
              autoComplete="off"
              maxLength={1000}
              value={r.values[blank.id] ?? ""}
              onChange={(e) =>
                onChange({
                  kind: "blanks",
                  values: { ...r.values, [blank.id]: e.target.value },
                })
              }
              aria-describedby={`blank-help-${q.id}-${blank.id}`}
            />
            <small id={`blank-help-${q.id}-${blank.id}`}>
              {blank.kind === "number"
                ? `Enter a number only. Unit: ${blank.unit || "dimensionless"}. Rounding: ${blank.rounding}.`
                : `Text entry. ${blank.caseSensitive ? "Case sensitive." : "Case is ignored."} ${blank.trim ? "Outer spaces are ignored." : "Outer spaces count."} ${blank.collapseWhitespace ? "Repeated whitespace is collapsed." : "Inner whitespace is preserved."}`}
            </small>
          </label>
        ))}
      </fieldset>
    );
  return (
    <p role="alert">
      This response cannot be displayed. Return to quiz selection to resume the
      saved attempt.
    </p>
  );
}
