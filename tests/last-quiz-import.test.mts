import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lastQuizTest } from "../lib/quiz-v3/last-quiz.ts";
import { parseBank } from "../lib/quiz-v3/contract.ts";
import { gradeQuestion, type Response } from "../lib/quiz-v3/grading.ts";
import { lectureFolderForBank } from "../lib/quiz-navigation.ts";

test("The Last Quiz imports lectures 11 through 13", () => {
  const source: unknown = JSON.parse(
    readFileSync(
      new URL("../lib/quiz-v3/last-quiz-bank.json", import.meta.url),
      "utf8",
    ),
  );
  const bank = parseBank(source);
  assert.equal(bank.length, 54);
  assert.equal(lastQuizTest.length, 1);
  const bundle = lastQuizTest[0]!;
  assert.equal(bundle.quiz.id, "itcs217-last-quiz-test");
  assert.equal(bundle.quiz.title, "The Last Quiz");
  assert.equal(bundle.quiz.bankId, "itcs217-last-quiz");
  assert.equal(bundle.quiz.feedbackMode, "immediate");
  assert.equal(bundle.quiz.contentKind, "draft");
  assert.equal(bundle.quiz.iconAsset, "/quiz-icons/the-last-quiz.png");
  assert.equal(
    lectureFolderForBank(bundle.quiz.bankId).href,
    "/subjects/itcs217/lectures/the-last-quiz",
  );
  assert.deepEqual(
    bundle.questions.map((q) => q.id),
    bank.map((q) => q.id),
  );
  assert.deepEqual(
    bundle.questions.slice(0, 10).map((q) => q.id),
    Array.from({ length: 10 }, (_, n) => `l11-test-q${String(n + 1).padStart(2, "0")}`),
  );

  for (const q of bundle.questions) {
    assert.equal(q.subject, "ITCS217 Computer Data Communications");
    assert.equal(q.status, "approved");
    assert.match(q.explanation, /\S/);
    if (q.type === "single" || q.type === "multiple" || q.type === "boolean") {
      assert.equal(q.optionExplanations.length, q.answers.length);
      for (const explanation of q.optionExplanations)
        assert.ok(explanation.length > 40, q.id);
    }
    if (q.type === "fill_blank") {
      assert.match(q.prompt, /Formula:/);
      assert.match(q.prompt, /Rounding: none/);
      for (const blank of q.blanks) {
        assert.equal(blank.kind, "number");
        assert.match(blank.explanation, /Formula:/);
        assert.match(q.prompt, new RegExp(blank.unit));
      }
    }
    let response: Response;
    let wrong: Response;
    switch (q.type) {
      case "single":
      case "multiple":
      case "boolean":
        response = { kind: "choice", selected: [...q.correct] };
        wrong = {
          kind: "choice",
          selected: [q.answers.findIndex((_, j) => !q.correct.includes(j))],
        };
        break;
      case "matching":
        response = {
          kind: "matching",
          selected: Object.fromEntries(q.matches),
        };
        wrong = {
          kind: "matching",
          selected: Object.fromEntries(
            q.matches.map(([left, right], index) => [
              left,
              index === 0 ? (right + 1) % q.rightItems.length : right,
            ]),
          ),
        };
        break;
      case "fill_blank":
        response = {
          kind: "blanks",
          values: Object.fromEntries(
            q.blanks.map((b) => [
              b.id,
              b.kind === "number" ? String(b.value) : b.acceptedAnswers[0],
            ]),
          ),
        };
        wrong = {
          kind: "blanks",
          values: Object.fromEntries(q.blanks.map((b) => [b.id, "0"])),
        };
        break;
      default:
        throw new Error(`Unexpected type ${q.type}`);
    }
    assert.equal(gradeQuestion(q, response).score, 1, q.id);
    assert.equal(gradeQuestion(q, wrong).score, 0, q.id);
  }

  const parity = bundle.questions.find((q) => q.id === "l11-test-q04");
  assert.equal(parity?.type, "single");
  if (parity?.type === "single")
    assert.equal(parity.answers[parity.correct[0]!], "11010010 10010000 11101101");
  const length = bundle.questions.find((q) => q.id === "l11-test-q03");
  assert.equal(length?.type, "fill_blank");
  if (length?.type === "fill_blank" && length.blanks[0]?.kind === "number")
    assert.equal(length.blanks[0].value, 10);

  const crc = bundle.questions.find((q) => q.id === "l11p2-q01");
  assert.equal(crc?.type, "fill_blank");
  if (crc?.type === "fill_blank") {
    assert.deepEqual(
      crc.blanks.map((blank) => (blank.kind === "number" ? blank.value : null)),
      [17, 16, 16],
    );
  }
  const persistence = bundle.questions.find((q) => q.id === "l12p1-q05");
  assert.equal(persistence?.type, "multiple");
  if (persistence?.type === "multiple")
    assert.deepEqual(persistence.correct, [0, 3]);
  const chips = bundle.questions.find((q) => q.id === "l12p2-q09");
  assert.equal(chips?.type, "single");
  if (chips?.type === "single") {
    assert.match(chips.answers[chips.correct[0]!], /-1,-1,\+1,-3/);
    assert.match(chips.answers[chips.correct[0]!], /\+1,-1,\+1,-1/);
  }
  const throughput = bundle.questions.find((q) => q.id === "l13p2-q07");
  assert.equal(throughput?.type, "fill_blank");
  if (throughput?.type === "fill_blank") {
    assert.deepEqual(
      throughput.blanks.map((blank) =>
        blank.kind === "number" ? blank.value : null,
      ),
      [5, 10, 10],
    );
  }
  const learned = bundle.questions.find((q) => q.id === "l13p2-q09");
  assert.equal(learned?.type, "multiple");
  if (learned?.type === "multiple") assert.deepEqual(learned.correct, [2, 4]);
});
