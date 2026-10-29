import { z } from "zod";
import type { BankQuestionV3, Blank } from "./contract.ts";
import { casefold } from "./casefold.ts";

export const responseSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("choice"),
      selected: z.array(z.number().int().nonnegative()),
    })
    .strict(),
  z
    .object({
      kind: z.literal("matching"),
      selected: z.record(z.number().int().nonnegative()),
    })
    .strict(),
  z
    .object({
      kind: z.literal("ordering"),
      order: z.array(z.number().int().nonnegative()),
      confirmed: z.boolean(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("blanks"),
      values: z.record(z.string().max(1000)),
    })
    .strict(),
  z.object({ kind: z.literal("unanswered") }).strict(),
]);
export type Response = z.infer<typeof responseSchema>;
export type PartResult = {
  id: string;
  label: string;
  submitted: string;
  expected: string;
  status: "correct" | "incorrect" | "unanswered";
  explanation: string;
};
export type Grade = { score: 0 | 1; unanswered: boolean; parts: PartResult[] };

export function emptyResponse(q: BankQuestionV3): Response {
  switch (q.type) {
    case "single":
    case "multiple":
    case "boolean":
      return { kind: "choice", selected: [] };
    case "matching":
      return { kind: "matching", selected: {} };
    case "ordering":
      return {
        kind: "ordering",
        order: q.items.map((_, i) => i),
        confirmed: false,
      };
    case "fill_blank":
      return { kind: "blanks", values: {} };
  }
}
export function validResponse(q: BankQuestionV3, r: Response): boolean {
  if (!responseSchema.safeParse(r).success) return false;
  if (r.kind === "unanswered") return true;
  switch (q.type) {
    case "single":
    case "multiple":
    case "boolean":
      return (
        r.kind === "choice" &&
        new Set(r.selected).size === r.selected.length &&
        r.selected.every((i) => i < q.answers.length) &&
        (q.type === "multiple" || r.selected.length <= 1)
      );
    case "matching":
      return (
        r.kind === "matching" &&
        Object.entries(r.selected).every(
          ([l, v]) =>
            /^(0|[1-9]\d*)$/.test(l) &&
            Number(l) < q.leftItems.length &&
            v < q.rightItems.length,
        ) &&
        (q.reuseRight ||
          new Set(Object.values(r.selected)).size ===
            Object.values(r.selected).length)
      );
    case "ordering":
      return (
        r.kind === "ordering" &&
        r.order.length === q.items.length &&
        new Set(r.order).size === q.items.length &&
        r.order.every((i) => i < q.items.length)
      );
    case "fill_blank":
      return (
        r.kind === "blanks" &&
        Object.keys(r.values).every((id) => q.blanks.some((b) => b.id === id))
      );
  }
}
export function normalizeText(
  value: string,
  rule: Extract<Blank, { kind: "text" }>,
): string {
  let normalized = rule.trim ? value.trim() : value;
  if (rule.collapseWhitespace) normalized = normalized.replace(/\s+/gu, " ");
  return rule.caseSensitive ? normalized : casefold(normalized);
}
export function validNumeric(value: string): boolean {
  return (
    value.length <= 1000 &&
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value.trim()) &&
    Number.isFinite(Number(value)) &&
    value.trim() !== ""
  );
}
// Compare decimal quantities exactly so inclusive tolerance boundaries do not fail through binary rounding.
function decimal(value: string): { n: bigint; scale: number } {
  const [mantissa, exponent = "0"] = value.trim().toLowerCase().split("e");
  const fraction = mantissa.split(".")[1]?.length ?? 0;
  return {
    n: BigInt(mantissa.replace(".", "").replace(/^\+/, "")),
    scale: fraction - Number(exponent),
  };
}
export function acceptsNumber(
  value: string,
  rule: Extract<Blank, { kind: "number" }>,
): boolean {
  if (!validNumeric(value)) return false;
  // Inputs outside the finite decimal range are rejected before exponentiation.
  const a = decimal(value),
    b = decimal(String(rule.value)),
    t = decimal(String(rule.absoluteTolerance));
  if (![a.scale, b.scale, t.scale].every((s) => Math.abs(s) <= 2000))
    return false;
  const scale = Math.max(a.scale, b.scale, t.scale);
  const difference =
    a.n * BigInt(10) ** BigInt(scale - a.scale) -
    b.n * BigInt(10) ** BigInt(scale - b.scale);
  return (
    (difference < BigInt(0) ? -difference : difference) <=
    t.n * BigInt(10) ** BigInt(scale - t.scale)
  );
}
export function isAnswered(q: BankQuestionV3, r?: Response): boolean {
  if (!r || !validResponse(q, r) || r.kind === "unanswered") return false;
  switch (r.kind) {
    case "choice":
      return r.selected.length > 0;
    case "matching":
      return (
        q.type === "matching" &&
        Object.keys(r.selected).length === q.leftItems.length
      );
    case "ordering":
      return r.confirmed;
    case "blanks":
      return (
        q.type === "fill_blank" &&
        q.blanks.every((b) =>
          b.kind === "number"
            ? validNumeric(r.values[b.id] ?? "")
            : Boolean(r.values[b.id]?.trim()),
        )
      );
  }
}
export function responseErrors(q: BankQuestionV3, r: Response): string[] {
  if (!validResponse(q, r))
    return ["Choose valid, distinct responses for this question."];
  if (q.type !== "fill_blank" || r.kind !== "blanks") return [];
  return q.blanks.flatMap((b) =>
    b.kind === "number" &&
    r.values[b.id]?.trim() &&
    !validNumeric(r.values[b.id])
      ? [
          `Blank ${b.id}: enter a finite number only; units are shown beside the field.`,
        ]
      : [],
  );
}
export function gradeQuestion(q: BankQuestionV3, response?: Response): Grade {
  const r =
    response && validResponse(q, response)
      ? response
      : ({ kind: "unanswered" } as const);
  const part = (
    id: string,
    label: string,
    submitted: string | undefined,
    expected: string,
    correct: boolean,
    explanation: string,
  ): PartResult => ({
    id,
    label,
    submitted: submitted || "Unanswered",
    expected,
    status: !submitted ? "unanswered" : correct ? "correct" : "incorrect",
    explanation,
  });
  let parts: PartResult[];
  switch (q.type) {
    case "single":
    case "multiple":
    case "boolean": {
      const chosen = r.kind === "choice" ? r.selected : [];
      parts = q.answers.map((a, i) =>
        part(
          `option:${i}`,
          a,
          chosen.length
            ? chosen.includes(i)
              ? "Selected"
              : "Not selected"
            : undefined,
          q.correct.includes(i) ? "Select" : "Do not select",
          chosen.includes(i) === q.correct.includes(i),
          q.optionExplanations[i],
        ),
      );
      break;
    }
    case "matching":
      parts = q.matches.map(([l, target], i) => {
        const actual = r.kind === "matching" ? r.selected[l] : undefined;
        return part(
          `pair:${i}`,
          q.leftItems[l],
          actual === undefined ? undefined : q.rightItems[actual],
          q.rightItems[target],
          actual === target,
          q.pairExplanations[i],
        );
      });
      break;
    case "ordering":
      parts = q.correctOrder.map((target, i) =>
        part(
          `position:${i}`,
          `Position ${i + 1}`,
          r.kind === "ordering" && r.confirmed
            ? q.items[r.order[i]]
            : undefined,
          q.items[target],
          r.kind === "ordering" && r.order[i] === target,
          q.stepExplanations[i],
        ),
      );
      break;
    case "fill_blank":
      parts = q.blanks.map((b) => {
        const actual = r.kind === "blanks" ? r.values[b.id] : undefined;
        const correct =
          Boolean(actual?.trim()) &&
          (b.kind === "text"
            ? b.acceptedAnswers.some(
                (a) => normalizeText(a, b) === normalizeText(actual ?? "", b),
              )
            : acceptsNumber(actual ?? "", b));
        return part(
          `blank:${b.id}`,
          `Blank ${b.id}`,
          actual?.trim() ? actual : undefined,
          b.kind === "text"
            ? b.acceptedAnswers.join(" / ")
            : `${b.value} ${b.unit} (±${b.absoluteTolerance}; rounding: ${b.rounding})`,
          correct,
          b.explanation,
        );
      });
      break;
  }
  return {
    score: parts.every((p) => p.status === "correct") ? 1 : 0,
    unanswered: !isAnswered(q, response),
    parts,
  };
}
