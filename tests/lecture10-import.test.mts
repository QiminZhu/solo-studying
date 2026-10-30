import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lecture9Quizzes } from "../lib/quiz-v3/lecture9.ts";
import { lecture10Quizzes } from "../lib/quiz-v3/lecture10.ts";
import { scenarioFor } from "../lib/quiz-v3/lecture10-scenarios.ts";
import { parseBank } from "../lib/quiz-v3/contract.ts";
import { gradeQuestion, type Response } from "../lib/quiz-v3/grading.ts";
import { createAttempt, updateAttempt, canReveal } from "../lib/quiz-v3/attempt.ts";
import { lectureFolderForBank } from "../lib/quiz-navigation.ts";

const titles = [
  "Green Dragon · Emerald Awakening",
  "Blue Dragon · Azure Trials",
  "Red Dragon · Crimson Crucible",
  "Black Dragon · Obsidian Dominion",
];
const scenarioIds = [
  "l10-mystery-1",
  "l10-mystery-2",
  "l10-mystery-3",
  "l10-mystery-4",
];

test("Lecture 10 import preserves four quizzes, keys, order, and feedback timing", () => {
  const source: unknown = JSON.parse(
    readFileSync(
      new URL("../lib/quiz-v3/lecture10-bank.json", import.meta.url),
      "utf8",
    ),
  );
  const bank = parseBank(source);
  assert.equal(bank.length, 62);
  assert.equal(lecture10Quizzes.length, 4);
  const lecture9Ids = new Set(
    lecture9Quizzes.flatMap((bundle) => bundle.questions.map((q) => q.id)),
  );
  for (const [i, bundle] of lecture10Quizzes.entries()) {
    const tagged = bank.filter((q) =>
      q.tags?.includes(`quiz:l10-level-${i + 1}`),
    );
    assert.equal(bundle.quiz.title, titles[i]);
    assert.equal(bundle.quiz.id, `itcs217-l10-dragon-level-${i + 1}`);
    assert.equal(bundle.quiz.bankId, "itcs217-lecture-10-dragon");
    assert.equal(bundle.questions.length, [30, 12, 8, 12][i]);
    assert.deepEqual(bundle.questions, tagged);
    assert.equal(
      bundle.quiz.feedbackMode,
      i === 3 ? "deferred" : "immediate",
    );
    assert.equal(
      lectureFolderForBank(bundle.quiz.bankId).href,
      "/subjects/itcs217/lectures/lecture-10",
    );
    assert.equal(
      bundle.quiz.iconAsset,
      [
        "/quiz-icons/green-dragon.png",
        "/quiz-icons/blue-dragon.png",
        "/quiz-icons/red-dragon.png",
        "/quiz-icons/black-dragon.png",
      ][i],
    );
    assert.equal(
      bundle.quiz.description,
      `Lecture 10 · ${["Know the Concepts.", "Connect the Ideas.", "Apply Your Knowledge.", "Solve the Mystery."][i]}`,
    );
    let attempt = createAttempt(bundle, `verify-l10-${i}`, 0);
    for (const q of bundle.questions) {
      assert.equal(lecture9Ids.has(q.id), false);
      assert.equal(q.status, "approved");
      let response: Response;
      let wrong: Response;
      switch (q.type) {
        case "single":
        case "multiple":
        case "boolean":
          response = { kind: "choice", selected: [...q.correct] };
          wrong = {
            kind: "choice",
            selected: [
              q.answers.findIndex((_, j) => !q.correct.includes(j)),
            ],
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
              q.matches.map(([l, r], j) => [
                l,
                q.matches[(j + 1) % q.matches.length]![1] ?? r,
              ]),
            ),
          };
          break;
        case "ordering":
          response = {
            kind: "ordering",
            order: [...q.correctOrder],
            confirmed: true,
          };
          wrong = {
            kind: "ordering",
            order: [...q.correctOrder].reverse(),
            confirmed: true,
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
            values: Object.fromEntries(q.blanks.map((b) => [b.id, "-99999"])),
          };
          break;
      }
      assert.equal(gradeQuestion(q, response).score, 1, q.id);
      assert.equal(gradeQuestion(q, wrong).score, 0, q.id);
      assert.equal(gradeQuestion(q).score, 0, q.id);
      attempt = updateAttempt(attempt, {
        type: "answer",
        questionId: q.id,
        response,
      });
      assert.equal(canReveal(attempt, q.id), false);
      attempt = updateAttempt(attempt, { type: "check", questionId: q.id });
      assert.equal(canReveal(attempt, q.id), i !== 3);
    }
    attempt = updateAttempt(attempt, {
      type: "submit",
      now: 1,
      confirmUnanswered: false,
    });
    for (const q of bundle.questions) assert.equal(canReveal(attempt, q.id), true);
  }

  const mystery = lecture10Quizzes[3]!;
  assert.deepEqual(
    mystery.questions.map((q) => q.id),
    Array.from({ length: 12 }, (_, n) => `l10-l4-q${String(n + 1).padStart(2, "0")}`),
  );
  for (const [index, question] of mystery.questions.entries()) {
    const scenario = scenarioFor(question.tags);
    assert.equal(scenario?.id, scenarioIds[Math.floor(index / 3)]);
    assert.equal(scenario?.order, Math.floor(index / 3) + 1);
  }

  const trace = bank.find((q) => q.id === "l10-l3-q05");
  assert.equal(trace?.type, "fill_blank");
  if (trace?.type === "fill_blank") {
    assert.deepEqual(
      trace.blanks.map((blank) =>
        blank.kind === "number" ? blank.value : blank.id,
      ),
      [1, 1, 3],
    );
    assert.match(trace.prompt, /sequence number/);
    assert.match(trace.prompt, /Rounding: none/);
  }
});
