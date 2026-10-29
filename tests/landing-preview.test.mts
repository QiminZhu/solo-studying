import assert from "node:assert/strict";
import test from "node:test";
import {
  isPreviewAnswerCorrect,
  previewQuestions,
  sampleTopicResults,
} from "../lib/landing-data.ts";

test("single-choice and true/false grading require the exact verified answer", () => {
  for (const question of previewQuestions.filter(
    (q) => q.type !== "multiple",
  )) {
    assert.equal(isPreviewAnswerCorrect(question, question.correct), true);
    assert.equal(isPreviewAnswerCorrect(question, []), false);
    assert.equal(isPreviewAnswerCorrect(question, [99]), false);
    assert.equal(
      isPreviewAnswerCorrect(question, [...question.correct, 99]),
      false,
    );
  }
});

test("multiple-answer grading accepts either order and rejects partial or extra answers", () => {
  const question = previewQuestions.find((q) => q.type === "multiple")!;
  assert.equal(isPreviewAnswerCorrect(question, [2, 0]), true);
  for (const answers of [[], [0], [2], [0, 1, 2], [0, 0]]) {
    assert.equal(isPreviewAnswerCorrect(question, answers), false);
  }
});

test("the topic preview agrees with the displayed 16/20 and 80% result", () => {
  const correct = sampleTopicResults.reduce(
    (sum, item) => sum + item.correct,
    0,
  );
  const total = sampleTopicResults.reduce((sum, item) => sum + item.total, 0);
  assert.equal(correct, 16);
  assert.equal(total, 20);
  assert.equal(correct / total, 0.8);
});
