import assert from "node:assert/strict";
import test from "node:test";
import {
  initialPreview,
  previewCorrectIndex,
  reducePreview,
} from "../lib/quiz-v3/practice-preview.ts";

test("check stays idle until a choice, then a wrong check hides the key", () => {
  const idle = reducePreview(initialPreview, { type: "check" });
  assert.deepEqual(idle, initialPreview);

  const selected = reducePreview(initialPreview, { type: "select", index: 0 });
  assert.equal(selected.phase, "answering");
  assert.equal(selected.firstCheck, "unrecorded");

  const wrong = reducePreview(selected, { type: "check" });
  assert.equal(wrong.phase, "wrong");
  assert.equal(wrong.selected, 0);
  assert.equal(wrong.explanationOpen, false);
  assert.equal(wrong.firstCheck, "incorrect");
  assert.notEqual(wrong.selected, previewCorrectIndex);
});

test("a later correct try does not replace the first check", () => {
  let state = reducePreview(initialPreview, { type: "select", index: 0 });
  state = reducePreview(state, { type: "check" });
  state = reducePreview(state, { type: "try-again" });
  state = reducePreview(state, {
    type: "select",
    index: previewCorrectIndex,
  });
  state = reducePreview(state, { type: "check" });
  assert.equal(state.phase, "correct");
  assert.equal(state.firstCheck, "incorrect");
  assert.equal(reducePreview(state, { type: "next" }).movedOn, true);
});

test("the explanation opens only after a check and does not mark the answer", () => {
  const answering = reducePreview(initialPreview, { type: "select", index: 0 });
  assert.equal(
    reducePreview(answering, { type: "toggle-explanation" }).explanationOpen,
    false,
  );
  const wrong = reducePreview(answering, { type: "check" });
  const open = reducePreview(wrong, { type: "toggle-explanation" });
  assert.equal(open.explanationOpen, true);
  assert.equal(open.phase, "wrong");
  assert.equal(open.selected, 0);
});
