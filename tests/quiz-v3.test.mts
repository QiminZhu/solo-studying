import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fixtureQuizzes } from "../lib/quiz-v3/fixtures.ts";
import {
  bankQuestionSchema,
  parseBank,
  importBank,
  responseUnits,
  workloadIssues,
  defaultWorkloadPolicy,
  publicationIssues,
  type BankQuestionV3,
} from "../lib/quiz-v3/contract.ts";
import {
  acceptsNumber,
  gradeQuestion,
  isAnswered,
  normalizeText,
  responseErrors,
  validNumeric,
  validResponse,
  type Response,
} from "../lib/quiz-v3/grading.ts";
import {
  createAttempt,
  updateAttempt,
  parseAttempts,
  attemptSummary,
  canReveal,
  contentIdentity,
  missedGuidance,
} from "../lib/quiz-v3/attempt.ts";
import { lecture9Questions } from "../lib/question-banks/itcs217-lecture9.ts";
import {
  publicationEvidenceIssues,
  canonicalHash,
} from "../lib/quiz-v3/publication.ts";

const qs = fixtureQuizzes.flatMap((b) => b.questions);
function find(id: string): BankQuestionV3 {
  return qs.find((q) => q.id === `fixture-${id}`)!;
}
function answer(q: BankQuestionV3): Response {
  switch (q.type) {
    case "single":
    case "multiple":
    case "boolean":
      return { kind: "choice", selected: [...q.correct] };
    case "matching":
      return {
        kind: "matching",
        selected: Object.fromEntries(q.matches.map(([l, r]) => [l, r])),
      };
    case "ordering":
      return { kind: "ordering", order: [...q.correctOrder], confirmed: true };
    case "fill_blank":
      return {
        kind: "blanks",
        values: Object.fromEntries(
          q.blanks.map((b) => [
            b.id,
            b.kind === "text" ? b.acceptedAnswers[0] : String(b.value),
          ]),
        ),
      };
  }
}

test("fixtures cover six v3 formats, stay draft, use variable quiz sizes, and cite an actual fixture specification", () => {
  assert.equal(new Set(qs.map((q) => q.type)).size, 6);
  assert.deepEqual(
    fixtureQuizzes.map((b) => b.questions.length),
    [3, 2, 1, 6],
  );
  assert.ok(
    qs.every(
      (q) => q.status === "draft" && q.tags?.includes("software-fixture"),
    ),
  );
  assert.deepEqual(
    JSON.parse(
      readFileSync(
        new URL("../public/quiz-v3-example.json", import.meta.url),
        "utf8",
      ),
    ),
    JSON.parse(
      readFileSync(
        new URL("../lib/quiz-v3/fixture-bank.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  assert.ok(
    readFileSync(
      new URL("../public/quiz-fixture-source.html", import.meta.url),
      "utf8",
    ).includes("Software fixture specification"),
  );
  assert.equal(fixtureQuizzes[3].quiz.title, "The Memory Eater");
  assert.ok(
    !fixtureQuizzes[3].questions.some((q) =>
      fixtureQuizzes
        .slice(0, 3)
        .flatMap((b) => b.questions)
        .some((other) => other.id === q.id),
    ),
  );
});
test("every fixture format earns exactly one question point and zero when unanswered", () => {
  for (const q of qs) {
    const grade = gradeQuestion(q, answer(q));
    assert.equal(grade.score, 1, q.id);
    assert.ok(
      grade.parts.every((p) => p.status === "correct" && p.explanation),
    );
    const blank = gradeQuestion(q);
    assert.equal(blank.score, 0);
    assert.equal(blank.unanswered, true);
    assert.ok(blank.parts.every((p) => p.status === "unanswered"));
  }
});
test("single and boolean grading reject incorrect choices and duplicated or invalid responses", () => {
  for (const q of [find("single"), find("boolean")]) {
    assert.equal(gradeQuestion(q, { kind: "choice", selected: [0] }).score, 0);
    assert.equal(validResponse(q, { kind: "choice", selected: [1, 1] }), false);
    assert.equal(validResponse(q, { kind: "choice", selected: [-1] }), false);
    assert.equal(validResponse(q, { kind: "choice", selected: [9] }), false);
  }
});
test("select-all supports three correct choices, order-independent exact sets, and every option diagnostic", () => {
  const q = find("multiple");
  assert.equal(
    gradeQuestion(q, { kind: "choice", selected: [3, 0, 1] }).score,
    1,
  );
  for (const selected of [[0, 1], [0, 1, 2, 3], [0], []])
    assert.equal(gradeQuestion(q, { kind: "choice", selected }).score, 0);
  const grade = gradeQuestion(q, { kind: "choice", selected: [0, 1] });
  assert.equal(grade.parts.length, 4);
  assert.equal(grade.parts[3].status, "incorrect");
});
test("matching grades keyed pairs independently of key order, with explicit reuse policy", () => {
  const q = find("matching");
  assert.equal(
    gradeQuestion(q, { kind: "matching", selected: { 2: 0, 0: 1, 1: 2 } })
      .score,
    1,
  );
  const partial = gradeQuestion(q, { kind: "matching", selected: { 0: 2 } });
  assert.equal(
    partial.parts.filter((p) => p.status === "unanswered").length,
    2,
  );
  assert.equal(partial.score, 0);
  assert.equal(
    validResponse(q, { kind: "matching", selected: { 0: 1, 1: 1 } }),
    false,
  );
  assert.equal(
    gradeQuestion(find("memory-matching"), {
      kind: "matching",
      selected: { 0: 1, 1: 1 },
    }).score,
    1,
  );
});
test("ordering grades the exact final sequence and treats untouched unconfirmed order as unanswered", () => {
  const q = find("ordering");
  assert.equal(
    gradeQuestion(q, { kind: "ordering", order: [0, 1, 2], confirmed: true })
      .score,
    0,
  );
  assert.equal(
    isAnswered(q, { kind: "ordering", order: [0, 1, 2], confirmed: false }),
    false,
  );
  assert.equal(
    validResponse(q, { kind: "ordering", order: [1, 1, 0], confirmed: true }),
    false,
  );
});
test("text normalization applies only declared trim, whitespace collapse, Unicode casefold, and exact variants", () => {
  const q = find("blanks");
  if (q.type !== "fill_blank") throw new Error("fixture");
  const rule = q.blanks[0];
  if (rule.kind !== "text") throw new Error("fixture");
  assert.equal(normalizeText("  BLUE \t SKY  ", rule), "blue sky");
  assert.equal(normalizeText("Straße Σς", rule), "strasse σσ");
  for (const text of ["  BLUE \t SKY  ", "AZURE"])
    assert.equal(
      gradeQuestion(q, { kind: "blanks", values: { 1: text, 2: "2.50" } })
        .score,
      1,
    );
  for (const text of ["blue sky!", "sky", "blue skies", " "])
    assert.equal(
      gradeQuestion(q, { kind: "blanks", values: { 1: text, 2: "2.50" } })
        .score,
      0,
    );
  assert.equal(
    normalizeText(" A  B ", {
      ...rule,
      caseSensitive: true,
      trim: false,
      collapseWhitespace: false,
    }),
    " A  B ",
  );
});
test("numeric acceptance is inclusive at decimal boundaries, preserves units, and rejects invalid complete input", () => {
  const q = find("blanks");
  if (q.type !== "fill_blank") throw new Error("fixture");
  const rule = q.blanks[1];
  if (rule.kind !== "number") throw new Error("fixture");
  assert.equal(rule.unit, "kg");
  assert.equal(rule.rounding, "2 decimal places");
  for (const value of ["2.49", "2.51", "2.5", "+2.50", "2.5e0"])
    assert.equal(acceptsNumber(value, rule), true, value);
  for (const value of [
    "2.489999",
    "2.510001",
    "",
    " ",
    "NaN",
    "Infinity",
    "2.5kg",
    "2.5x",
    "0x2",
    "1e9999",
    "--2",
    "2,5",
  ])
    assert.equal(acceptsNumber(value, rule), false, value);
  assert.equal(validNumeric("0"), true);
  assert.equal(validNumeric("-0.1"), true);
  assert.ok(
    responseErrors(q, { kind: "blanks", values: { 1: "blue sky", 2: "2.5kg" } })
      .length,
  );
  assert.equal(
    acceptsNumber("4.500000000000001", {
      ...rule,
      value: 4.5,
      absoluteTolerance: 0,
    }),
    false,
  );
});
test("malformed contracts yield author paths and reject incompatible keys, missing explanations, bad references, keys, and policies", () => {
  const single = find("single"),
    multi = find("multiple"),
    match = find("matching"),
    order = find("ordering"),
    blanks = find("blanks");
  for (const bad of [
    { ...single, optionExplanations: ["Only one"] },
    { ...single, version: 0 },
    { ...single, sourceRefs: [{ file: "x", page: 0 }] },
    { ...multi, correct: [0] },
    { ...multi, correct: [0, 1, 2, 3] },
    { ...single, correct: [99] },
    { ...single, answers: ["A", "a"] },
    { ...single, objectiveIds: ["other"] },
    { ...single, levels: ["university"] },
    {
      ...match,
      matches: [
        [0, 0],
        [0, 1],
        [2, 2],
      ],
    },
    { ...match, answers: ["foreign"] },
    {
      ...match,
      matches: [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      reuseRight: false,
    },
    { ...order, correctOrder: [0, 1, 2] },
    { ...order, correctOrder: [1, 1, 0] },
    { ...blanks, prompt: "Missing markers" },
    {
      ...blanks,
      blanks: [
        {
          id: "1",
          kind: "number",
          value: 2,
          absoluteTolerance: -1,
          unit: "kg",
          rounding: "none",
          explanation: "x",
        },
      ],
    },
  ])
    assert.throws(() => parseBank([bad]), /Question data/);
  assert.throws(() => parseBank([single, single]), /unique/);
  assert.throws(() => importBank("broken"), /not valid JSON/);
  assert.throws(() => importBank(" ".repeat(1_000_001)), /1 MB/);
  assert.throws(() =>
    workloadIssues([single], { ...defaultWorkloadPolicy, maxQuestions: 0 }),
  );
});
test("workload follows the actual Quiz Master accounting and flags each configured cap", () => {
  assert.deepEqual(
    ["single", "multiple", "boolean", "matching", "ordering", "blanks"].map(
      (id) => responseUnits(find(id)),
    ),
    [1, 4, 1, 3, 3, 2],
  );
  assert.ok(fixtureQuizzes.every((b) => !workloadIssues(b.questions).length));
  assert.ok(
    workloadIssues(
      Array.from({ length: 21 }, (_, i) => ({
        ...find("single"),
        id: `q${i}`,
      })),
    ).some((s) => s.includes("question objects")),
  );
  assert.ok(
    workloadIssues(
      Array.from({ length: 13 }, (_, i) => ({
        ...find("multiple"),
        id: `q${i}`,
      })),
    ).some((s) => s.includes("52 response units")),
  );
  for (const field of [
    "maxMatchingPairs",
    "maxOrderingItems",
    "maxBlanks",
    "maxChoiceOptions",
  ] as const)
    assert.ok(
      workloadIssues(qs, {
        ...defaultWorkloadPolicy,
        maxQuestions: 100,
        maxResponseUnits: 100,
        [field]: 1,
      }).length,
    );
});
test("existing rich choice questions remain compatible without changing content; old incomplete questions need explicit author metadata", () => {
  const parsed = parseBank(lecture9Questions);
  assert.deepEqual(parsed, lecture9Questions);
  assert.equal(parsed.length, 30);
  assert.ok(workloadIssues(parsed).length); // Legacy runner intentionally retains its existing 30-item quiz.
  const old = { ...find("single"), objectiveId: undefined };
  assert.equal(bankQuestionSchema.safeParse(old).success, false);
});
test("first checked responses survive retries, refresh, and final submission; attempts remain isolated", () => {
  const bundle = fixtureQuizzes[0],
    id = bundle.quiz.questionIds[0];
  let a = createAttempt(bundle, "first", 100);
  a = updateAttempt(a, {
    type: "answer",
    questionId: id,
    response: { kind: "choice", selected: [0] },
  });
  assert.equal(canReveal(a, id), false);
  a = updateAttempt(a, { type: "check", questionId: id });
  assert.equal(canReveal(a, id), true);
  a = updateAttempt(a, { type: "retry", questionId: id });
  a = updateAttempt(a, {
    type: "answer",
    questionId: id,
    response: { kind: "choice", selected: [1] },
  });
  a = updateAttempt(a, { type: "check", questionId: id });
  a = updateAttempt(a, { type: "navigate", index: 1 });
  a = updateAttempt(a, { type: "flag", questionId: id });
  const [restored] = parseAttempts(JSON.stringify([a]));
  assert.deepEqual(restored, a);
  const completed = updateAttempt(a, {
    type: "submit",
    confirmUnanswered: true,
    now: 200,
  });
  assert.equal(attemptSummary(completed).score, 1);
  assert.equal(attemptSummary(completed).firstScore, 0);
  assert.equal(completed.index, 1);
  assert.deepEqual(completed.flagged, [id]);
  const retry = createAttempt(bundle, "second", 300, completed.id);
  const other = createAttempt(fixtureQuizzes[1], "other", 400);
  const history = parseAttempts(JSON.stringify([completed, retry, other]));
  assert.equal(history[0].submittedAt, 200);
  assert.deepEqual(history[1].answers, {});
  assert.equal(history[2].bundle.quiz.id, "webweaver");
});
test("The Memory Eater permits revision and navigation without any reveal or summary grade before explicit submission", () => {
  const bundle = fixtureQuizzes[3];
  let a = createAttempt(bundle, "memory", 100);
  for (const q of bundle.questions) {
    a = updateAttempt(a, {
      type: "answer",
      questionId: q.id,
      response: answer(q),
    });
    a = updateAttempt(a, { type: "check", questionId: q.id });
    assert.equal(canReveal(a, q.id), false);
  }
  assert.equal(attemptSummary(a).score, null);
  assert.equal(attemptSummary(a).firstScore, null);
  assert.deepEqual(a.firstResponses, {});
  assert.deepEqual(missedGuidance(a), []);
  const id = bundle.quiz.questionIds[0];
  a = updateAttempt(a, {
    type: "answer",
    questionId: id,
    response: { kind: "choice", selected: [0] },
  });
  a = updateAttempt(a, { type: "navigate", index: 2 });
  [a] = parseAttempts(JSON.stringify([a]));
  assert.deepEqual(a.answers[id], { kind: "choice", selected: [0] });
  const completed = updateAttempt(a, {
    type: "submit",
    confirmUnanswered: false,
    now: 200,
  });
  assert.equal(attemptSummary(completed).score, 5);
  assert.equal(attemptSummary(completed).firstScore, 5);
  assert.ok(bundle.questions.every((q) => canReveal(completed, q.id)));
  assert.equal(
    updateAttempt(completed, {
      type: "submit",
      confirmUnanswered: true,
      now: 999,
    }),
    completed,
  );
  assert.equal(
    updateAttempt(completed, {
      type: "answer",
      questionId: id,
      response: { kind: "choice", selected: [2] },
    }),
    completed,
  );
});
test("unanswered confirmation, invalid numeric submission, missing guidance, and part scoring remain separate", () => {
  let a = createAttempt(fixtureQuizzes[2], "blank", 100);
  assert.throws(
    () =>
      updateAttempt(a, { type: "submit", confirmUnanswered: false, now: 200 }),
    /unanswered/,
  );
  a = updateAttempt(a, {
    type: "answer",
    questionId: "fixture-blanks",
    response: { kind: "blanks", values: { 1: "blue sky", 2: "2kg" } },
  });
  assert.throws(
    () =>
      updateAttempt(a, { type: "submit", confirmUnanswered: true, now: 200 }),
    /finite number/,
  );
  a = updateAttempt(a, {
    type: "answer",
    questionId: "fixture-blanks",
    response: { kind: "blanks", values: { 1: "blue sky", 2: "" } },
  });
  a = updateAttempt(a, { type: "submit", confirmUnanswered: true, now: 200 });
  assert.equal(attemptSummary(a).score, 0);
  assert.equal(attemptSummary(a).answered, 0);
  const grade = gradeQuestion(find("blanks"), a.answers["fixture-blanks"]);
  assert.deepEqual(
    grade.parts.map((p) => p.status),
    ["correct", "unanswered"],
  );
  assert.equal(grade.parts.length, 2);
  assert.equal(attemptSummary(a).total, 1);
});
test("changed question content cannot silently inherit saved grades and malformed storage is retained", () => {
  const a = createAttempt(fixtureQuizzes[0], "versioned", 100);
  const changed = structuredClone(a);
  changed.bundle.questions[0].prompt = "Edited prompt";
  assert.throws(() => parseAttempts(JSON.stringify([changed])), /left intact/);
  assert.equal(
    a.bundle.questions[0].prompt,
    fixtureQuizzes[0].questions[0].prompt,
  );
  const changedVersion = structuredClone(a);
  changedVersion.bundle.questions[0].version++;
  assert.throws(
    () => parseAttempts(JSON.stringify([changedVersion])),
    /left intact/,
  );
  for (const raw of [
    "broken",
    "{}",
    JSON.stringify([{ ...a, index: 99 }]),
    JSON.stringify([a, a]),
  ])
    assert.throws(() => parseAttempts(raw), /left intact/);
  assert.equal(
    contentIdentity({ a: 1, b: 2 }),
    contentIdentity({ b: 2, a: 1 }),
  );
});
test("publication rejects fixtures, drafts, missing reviews and stale exact-version approval bindings", async () => {
  assert.ok(publicationIssues(fixtureQuizzes[0]).length);
  const bundle = structuredClone(fixtureQuizzes[0]);
  bundle.quiz.contentKind = "published";
  bundle.questions = bundle.questions.map((q) => ({
    ...q,
    status: "approved",
  }));
  assert.ok((await publicationEvidenceIssues(bundle, undefined)).length);
  const canonical = '{"a":1,"z":"λ"}';
  assert.equal(
    await canonicalHash({ z: "λ", a: 1 }),
    createHash("sha256").update(canonical).digest("hex"),
  );
  // Synthetic evidence exercises the gate only; this does not approve the shipped draft fixtures.
  bundle.questions = bundle.questions.map((q) => ({
    ...q,
    tags: ["synthetic-gate-test"],
  }));
  const reports = await Promise.all(
    bundle.questions.map(async (q) => ({
      questionId: q.id,
      questionVersion: q.version,
      contentHash: await canonicalHash(q),
      decision: "approved",
      checks: Object.fromEntries(
        [
          "schema",
          "independentAnswer",
          "overallExplanation",
          "sourceGrounding",
          "objectiveAlignment",
          "ambiguity",
          "distractors",
          "difficulty",
          "cognitiveLevel",
          "coverageMappings",
          "optionExplanations",
        ].map((key) => [key, "pass"]),
      ),
      issues: [],
    })),
  );
  const evidence = {
    questionReports: reports,
    coverageReport: {
      complete: true,
      fullLectureCoverage: true,
      problems: [],
      eligibleQuestionIds: bundle.quiz.questionIds,
      objectives: [{ objectiveId: "fixture-choice", status: "adequate" }],
      workload: { questionObjects: 3, responseUnits: 6 },
    },
  };
  assert.deepEqual(await publicationEvidenceIssues(bundle, evidence), []);
  bundle.questions[0].explanation = "Changed after independent review";
  assert.ok(
    (await publicationEvidenceIssues(bundle, evidence)).some((s) =>
      s.includes("different content"),
    ),
  );
  bundle.questions[0].version++;
  assert.ok((await publicationEvidenceIssues(bundle, evidence)).length);
});

test("numeric blanks accept natural no-rounding wording only for none", () => {
  const q = structuredClone(find("blanks"));
  assert.equal(q.type, "fill_blank");
  if (q.type !== "fill_blank") return;
  q.blanks = [{ id: "1", kind: "number", value: 53, absoluteTolerance: 0, unit: "bytes", rounding: "none", explanation: "Header plus payload." }];
  q.prompt = "Size is {{1}} bytes. No rounding is required.";
  assert.equal(bankQuestionSchema.safeParse(q).success, true);
  q.prompt = "Size is {{1}} bytes.";
  assert.equal(bankQuestionSchema.safeParse(q).success, false);
  q.prompt = "Size is {{1}} bytes. No rounding is required.";
  if (q.blanks[0].kind === "number") q.blanks[0].rounding = "nearest integer";
  assert.equal(bankQuestionSchema.safeParse(q).success, false);
});
