export type PromptSegment =
  | { kind: "text"; text: string }
  | { kind: "blank"; id: string };

/** Split a stored prompt into the question, a formula line, and a rounding note. */
export function splitQuestionPrompt(prompt: string): {
  segments: PromptSegment[];
  formula: string;
  note: string;
} {
  const rounding = prompt.match(/^(.*)\s+(Rounding:[^.]*\.)\s*$/);
  const withFormula = (rounding ? rounding[1] : prompt).trim();
  const note = rounding ? rounding[2] : "";
  const formulaMatch = withFormula.match(
    /\s+Formula:\s*([\s\S]+?)(?=\s+\{\{|$)/,
  );
  const formulaStart = formulaMatch?.index;
  const formula = formulaMatch?.[1]?.trim() ?? "";
  const body = (
    formulaMatch && formulaStart !== undefined
      ? `${withFormula.slice(0, formulaStart)}${withFormula.slice(
          formulaStart + formulaMatch[0].length,
        )}`
      : withFormula
  )
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  const segments: PromptSegment[] = [];
  const pattern = /\{\{([^{}]+)\}\}/g;
  let cursor = 0;
  for (const match of body.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      segments.push({ kind: "text", text: body.slice(cursor, index) });
    }
    segments.push({ kind: "blank", id: match[1] });
    cursor = index + match[0].length;
  }
  if (cursor < body.length) {
    segments.push({ kind: "text", text: body.slice(cursor) });
  }
  return { segments, formula, note };
}

/** Shown in the question sentence where a fill-in answer belongs. */
export const blankMark = "_____";

/** Accessible question text, with blank marks and without the rounding note. */
export function visibleQuestionText(prompt: string) {
  return splitQuestionPrompt(prompt)
    .segments.map((segment) =>
      segment.kind === "blank" ? blankMark : segment.text,
    )
    .join("");
}
