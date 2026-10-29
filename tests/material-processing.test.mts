import test from "node:test";
import assert from "node:assert/strict";
import { processMaterial, searchChunks, validatePages, MAX_TEXT_CHARS } from "../lib/material-processing.ts";

const pages = [
  { number: 1, label: "Page 1", text: "# Binary Search\nBinary search repeatedly halves a sorted search interval. Ordering is required to eliminate the other half safely.\n\n# Complexity\nEach comparison removes half the remaining candidates." },
  { number: 2, label: "Page 2", text: "# Linked Lists\nA linked list stores a sequence of nodes with references. Random access requires traversal rather than indexing." },
];
const options = { notes: "summarized", split: "headings" } as const;

test("source locations survive extraction, notes, concept proposal, and retrieval", () => {
  const result = processMaterial(pages, options);
  assert.ok(result.concepts.some(c => c.name === "Binary Search"));
  for (const note of result.notes) {
    const source = result.chunks.find(c => c.id === note.chunkId);
    assert.ok(source?.text.includes(note.text));
    assert.equal(note.locator, source?.locator);
  }
  const found = searchChunks(result.chunks, "linked nodes");
  assert.equal(found[0].locator, "Page 2");
  assert.deepEqual(searchChunks(result.chunks, "quartz"), []);
});

test("long source passages remain bounded without dropping content", () => {
  const text = Array.from({ length: 1600 }, (_, i) => `word${i}`).join(" ");
  const result = processMaterial([{ number: 1, label: "Slide 4", text }], { notes: "comprehensive", split: "page" });
  assert.ok(result.chunks.length > 1);
  assert.ok(result.chunks.every(c => c.text.length <= 1500 && c.locator === "Slide 4"));
  assert.equal(result.chunks.map(c => c.text).join(" "), text);
});

test("image-only files fail while mixed PDFs retain readable pages and warnings", () => {
  assert.throws(() => processMaterial([{ number: 1, label: "Page 1", text: "" }], options), /OCR/);
  const result = processMaterial([...pages, { number: 3, label: "Page 3", text: "" }], options);
  assert.ok(result.warnings.some(w => w.includes("1 page")));
  assert.equal(result.pages.length, 3);
  assert.equal(result.chunks.some(c => c.page === 3), false);
});

test("rejects excessive extracted text and invalid source sequences", () => {
  assert.throws(() => validatePages([{ number: 7, label: "Page 7", text: "a" }]), /locations/);
  assert.throws(() => validatePages([{ number: 1, label: "Page 1", text: "a".repeat(MAX_TEXT_CHARS + 1) }]), /too much text/);
  assert.throws(() => validatePages([]), /1–1,000/);
});

test("processing never fabricates prerequisite or mastery evidence", () => {
  const result = processMaterial(pages, options);
  assert.equal("mastery" in result, false);
  assert.equal("prerequisites" in result, false);
  assert.ok(result.concepts.every(c => result.chunks.some(s => s.id === c.chunkId && s.text.includes(c.name))));
});
