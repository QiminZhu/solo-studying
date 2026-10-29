import assert from "node:assert/strict";
import test from "node:test";
import { questionBank, type BankQuestion } from "../lib/quiz-bank.ts";
import {
  configErrors,
  createQuizSession,
  defaultQuizConfig,
  isAnswerCorrect,
  parseQuizSession,
  selectQuizQuestions,
  sessionResults,
  type QuizConfig,
} from "../lib/quiz-session.ts";

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test("the curated bank has unique ids, valid answers, and an explanation for every format", () => {
  assert.equal(questionBank.length, 100);
  assert.equal(
    new Set(questionBank.map((q) => q.id)).size,
    questionBank.length,
  );
  for (const q of questionBank) {
    assert.ok(q.correct.length > 0 && q.explanation.trim().length > 0);
    assert.equal(new Set(q.correct).size, q.correct.length);
    assert.ok(q.correct.every((i) => i >= 0 && i < q.answers.length));
    if (q.type !== "multiple") assert.equal(q.correct.length, 1);
    if (q.type === "boolean") assert.deepEqual(q.answers, ["True", "False"]);
  }
});

test("random selection meets exact type quotas, avoids repeats, and covers all eligible topics", () => {
  for (let seed = 1; seed <= 60; seed++) {
    const config = defaultQuizConfig("Biology");
    const chosen = selectQuizQuestions(config, seeded(seed));
    assert.equal(chosen.length, 6);
    assert.equal(new Set(chosen.map((q) => q.id)).size, 6);
    assert.equal(new Set(chosen.map((q) => q.topic)).size, 4);
    for (const type of ["single", "multiple", "boolean"] as const)
      assert.equal(
        chosen.filter((q) => q.type === type).length,
        config.counts[type],
      );
  }
});

test("short exams cover as many topics as the exam length permits", () => {
  const config = {
    ...defaultQuizConfig(),
    counts: { single: 1, multiple: 1, boolean: 0 },
  };
  assert.equal(
    new Set(selectQuizQuestions(config, seeded(17)).map((q) => q.topic)).size,
    2,
  );
});

test("topic matching preserves scarce type capacity instead of greedily losing coverage", () => {
  const template = questionBank[0];
  const bank: BankQuestion[] = [
    {
      ...template,
      id: "a-single",
      subject: "Fixture",
      topic: "A",
      type: "single",
    },
    {
      ...template,
      id: "a-bool",
      subject: "Fixture",
      topic: "A",
      type: "boolean",
    },
    {
      ...template,
      id: "b-single",
      subject: "Fixture",
      topic: "B",
      type: "single",
    },
  ];
  const config: QuizConfig = {
    ...defaultQuizConfig(),
    subject: "Fixture",
    topics: ["A", "B"],
    counts: { single: 1, multiple: 0, boolean: 1 },
  };
  const chosen = selectQuizQuestions(config, seeded(7), bank);
  assert.deepEqual(new Set(chosen.map((q) => q.topic)), new Set(["A", "B"]));
});

test("selection respects subject, topic, and difficulty", () => {
  const config: QuizConfig = {
    ...defaultQuizConfig("Mathematics"),
    topics: ["Algebra", "Geometry"],
    difficulty: "Easy",
    counts: { single: 2, multiple: 0, boolean: 0 },
  };
  const chosen = selectQuizQuestions(config, seeded(3));
  assert.ok(
    chosen.every(
      (q) =>
        q.subject === "Mathematics" &&
        q.difficulty === "Easy" &&
        config.topics.includes(q.topic),
    ),
  );
});

test("empty, unavailable, fractional, oversized, and over-capacity setups fail validation", () => {
  const base = defaultQuizConfig();
  for (const config of [
    { ...base, topics: [] },
    { ...base, counts: { single: 0, multiple: 0, boolean: 0 } },
    { ...base, counts: { single: 5, multiple: 0, boolean: 0 } },
    { ...base, counts: { single: 1.5, multiple: 0, boolean: 0 } },
    { ...base, counts: { single: 201, multiple: 0, boolean: 0 } },
    { ...base, counts: { single: 100, multiple: 100, boolean: 100 } },
  ]) {
    assert.ok(configErrors(config).length > 0);
    assert.throws(() => selectQuizQuestions(config));
  }
});

test("multiple-answer grading is exact, order independent, and rejects partial answers", () => {
  const q = questionBank.find((q) => q.id === "bio-structures")!;
  assert.equal(isAnswerCorrect(q, [2, 0]), true);
  for (const answer of [[], [0], [2], [0, 1, 2], [0, 0]])
    assert.equal(isAnswerCorrect(q, answer), false);
});

test("guest sessions round-trip and timers apply only to timed exams", () => {
  const practice = createQuizSession(
    { ...defaultQuizConfig(), timeLimit: 5 },
    1000,
    seeded(4),
  );
  assert.equal(practice.expiresAt, null);
  assert.deepEqual(parseQuizSession(JSON.stringify(practice)), practice);
  const exam = createQuizSession(
    { ...defaultQuizConfig(), mode: "exam", timeLimit: 5 },
    1000,
    seeded(4),
  );
  assert.equal(exam.expiresAt, 301000);
  assert.equal(exam.submittedAt, null);
});

test("invalid guest snapshots recover without accepting forged ids or malformed answers", () => {
  const session = createQuizSession(defaultQuizConfig(), 1000, seeded(8));
  assert.equal(parseQuizSession(null), null);
  assert.equal(parseQuizSession("not-json"), null);
  assert.equal(
    parseQuizSession(JSON.stringify({ ...session, index: 99 })),
    null,
  );
  assert.equal(
    parseQuizSession(JSON.stringify({ ...session, questionIds: ["unknown"] })),
    null,
  );
  assert.equal(
    parseQuizSession(
      JSON.stringify({
        ...session,
        answers: { [session.questionIds[0]]: [99] },
      }),
    ),
    null,
  );
  assert.equal(
    parseQuizSession(JSON.stringify({ ...session, checked: ["unknown"] })),
    null,
  );
});

test("results reconcile with topic totals and count unanswered responses as incorrect", () => {
  const session = createQuizSession(defaultQuizConfig(), 1000, seeded(2));
  const q = questionBank.find((q) => q.id === session.questionIds[0])!;
  session.answers[q.id] = [...q.correct];
  session.submittedAt = 2000;
  const result = sessionResults(session);
  assert.equal(result.correct, 1);
  assert.equal(result.incorrect, 5);
  assert.equal(result.answered, 1);
  assert.equal(result.accuracy, 17);
  assert.equal(
    result.topics.reduce((sum, t) => sum + t.total, 0),
    result.total,
  );
  assert.equal(
    result.topics.reduce((sum, t) => sum + t.correct, 0),
    result.correct,
  );
});

test("education level is omitted and legacy sessions retain their answers when decoded", () => {
  const config = defaultQuizConfig();
  assert.equal("level" in config, false);
  assert.ok(questionBank.every((question) => !("levels" in question)));
  const session = createQuizSession(config, 1000, seeded(11));
  const question = questionBank.find((q) => q.id === session.questionIds[0])!;
  session.answers[question.id] = [...question.correct];
  const legacy = {
    ...session,
    config: { ...session.config, level: "University" },
  };
  const restored = parseQuizSession(JSON.stringify(legacy));
  assert.deepEqual(restored, session);
  assert.equal("level" in restored!.config, false);
});

test("Lecture 9 imports all formats and supports grading, filtering, results, and reload", () => {
  const subject = "ITCS217_Computer Data Communication";
  const imported = questionBank.filter(
    (q) => q.subject === subject && q.id.startsWith("dll-l09-"),
  );
  assert.equal(imported.length, 30);
  assert.equal(new Set(imported.map((q) => q.topic)).size, 8);
  for (const q of imported) {
    assert.equal(q.lecture, "Lecture 9");
    assert.ok(q.topic.startsWith("Lecture 9 · "));
    assert.equal(q.optionExplanations?.length, q.answers.length);
    assert.ok(q.sourceRefs?.every((ref) => ref.file && ref.page > 0));
    assert.equal(q.status, "pending_review");
    assert.equal(isAnswerCorrect(q, [...q.correct]), true);
    assert.equal(isAnswerCorrect(q, []), false);
    assert.equal(
      isAnswerCorrect(
        q,
        q.answers.map((_, i) => i).filter((i) => !q.correct.includes(i)),
      ),
      false,
    );
  }
  const config = {
    ...defaultQuizConfig(subject),
    topics: [...new Set(imported.map((q) => q.topic))],
    counts: { single: 10, multiple: 10, boolean: 10 },
  };
  assert.deepEqual(configErrors(config), []);
  for (const mode of ["practice", "exam"] as const) {
    const session = createQuizSession(
      { ...config, mode, timeLimit: 5 },
      1000,
      seeded(9),
    );
    assert.equal(session.questionIds.length, 30);
    assert.equal(new Set(session.questionIds).size, 30);
    for (const q of questionBank.filter((question) =>
      session.questionIds.includes(question.id),
    ))
      session.answers[q.id] = [...q.correct];
    assert.deepEqual(parseQuizSession(JSON.stringify(session)), session);
    session.submittedAt = 2000;
    assert.equal(sessionResults(session).correct, 30);
    assert.equal(sessionResults(session).accuracy, 100);
  }
  for (const difficulty of ["Easy", "Medium", "Hard"] as const) {
    const filtered = {
      ...defaultQuizConfig(subject),
      difficulty,
      counts: { single: 1, multiple: 0, boolean: 0 },
    };
    // Hard questions in this lecture are multiple-answer questions.
    if (difficulty === "Hard")
      filtered.counts = { single: 0, multiple: 1, boolean: 0 };
    assert.ok(
      selectQuizQuestions(filtered, seeded(4)).every(
        (q) => q.subject === subject && q.difficulty === difficulty,
      ),
    );
  }
  const topicConfig = {
    ...defaultQuizConfig(subject),
    topics: [imported[0].topic],
    counts: { single: 1, multiple: 1, boolean: 1 },
  };
  assert.ok(
    selectQuizQuestions(topicConfig, seeded(5)).every(
      (q) => q.topic === imported[0].topic,
    ),
  );
});

test("test subject imports all ten questions and runs independently of the existing lecture", () => {
  const imported = questionBank.filter((q) => q.subject === "test");
  assert.equal(imported.length, 10);
  assert.deepEqual(
    ["single", "multiple", "boolean"].map(
      (type) => imported.filter((q) => q.type === type).length,
    ),
    [7, 2, 1],
  );
  for (const q of imported) {
    assert.equal(q.lecture, "Lecture 9");
    assert.equal(q.status, "draft");
    assert.equal(q.optionExplanations?.length, q.answers.length);
    assert.ok(q.sourceRefs?.length);
    assert.ok(
      q.sourceRefs?.every(
        (source) =>
          source.file && Number.isInteger(source.page) && source.page > 0,
      ),
    );
    assert.equal(isAnswerCorrect(q, [...q.correct]), true);
    assert.equal(isAnswerCorrect(q, []), false);
  }
  assert.deepEqual(defaultQuizConfig("test").counts, {
    single: 2,
    multiple: 2,
    boolean: 1,
  });
  const config = {
    ...defaultQuizConfig("test"),
    counts: { single: 7, multiple: 2, boolean: 1 },
  };
  assert.deepEqual(configErrors(config), []);
  for (const mode of ["practice", "exam"] as const) {
    const session = createQuizSession({ ...config, mode }, 1000, seeded(21));
    assert.deepEqual(
      new Set(session.questionIds),
      new Set(imported.map((q) => q.id)),
    );
    for (const q of imported) session.answers[q.id] = [...q.correct];
    assert.deepEqual(parseQuizSession(JSON.stringify(session)), session);
    session.submittedAt = 2000;
    assert.equal(sessionResults(session).correct, 10);
    assert.equal(sessionResults(session).accuracy, 100);
  }
});
