import assert from "node:assert/strict";
import test from "node:test";
import { questionBank } from "../lib/quiz-bank.ts";
import {
  appendSubjectQuiz,
  createSubjectQuiz,
  importQuizQuestions,
  originalTestQuiz,
  parseSubjectQuizzes,
  subjectFolder,
} from "../lib/subject-quizzes.ts";
import {
  createSubjectQuizSession,
  parseQuizSession,
  sessionQuestions,
  sessionResults,
} from "../lib/quiz-session.ts";

const fixture = originalTestQuiz.questions;

test("ITCS217 contains the original 30-question test quiz without variation presets", () => {
  assert.equal(originalTestQuiz.subjectId, "itcs217");
  assert.equal(fixture.length, 30);
  assert.deepEqual(
    ["single", "multiple", "boolean"].map(
      (type) => fixture.filter((question) => question.type === type).length,
    ),
    [10, 10, 10],
  );
  assert.ok(
    fixture.every(
      (question) =>
        question.id.startsWith("dll-l09-") &&
        question.status === "pending_review",
    ),
  );
  assert.ok(!questionBank.some((question) => /^L\d+-/.test(question.id)));
  assert.deepEqual(parseSubjectQuizzes(null), [originalTestQuiz]);
  assert.deepEqual(parseSubjectQuizzes("[]"), []);
});

test("quizzes retain their names, descriptions, selected order, and explanations after saving", () => {
  const selected = [fixture[0], fixture[10], fixture[20]];
  const quiz = createSubjectQuiz(
    {
      title: "  My review  ",
      description: " Chapter recap ",
      questions: selected,
    },
    "my-quiz",
    1000,
  );
  assert.equal(quiz.title, "My review");
  assert.equal(quiz.description, "Chapter recap");
  assert.equal(quiz.subjectId, subjectFolder.id);
  assert.deepEqual(quiz.questions, selected);
  const library = appendSubjectQuiz(parseSubjectQuizzes(null), quiz);
  assert.deepEqual(parseSubjectQuizzes(JSON.stringify(library)), library);
  assert.throws(() => appendSubjectQuiz(library, quiz), /already exists/);
});

test("creation rejects blank names, empty questions, duplicate IDs, and excessive counts", () => {
  const good = { title: "Review", description: "", questions: [fixture[0]] };
  assert.throws(() => createSubjectQuiz({ ...good, title: "   " }, "bad"));
  assert.throws(() => createSubjectQuiz({ ...good, questions: [] }, "bad"));
  assert.throws(() =>
    createSubjectQuiz({ ...good, questions: [fixture[0], fixture[0]] }, "bad"),
  );
  const tooManySingle = Array.from({ length: 201 }, (_, index) => ({
    ...fixture[0],
    id: `single-${index}`,
  }));
  assert.throws(() =>
    createSubjectQuiz({ ...good, questions: tooManySingle }, "bad"),
  );
  const quizzes = Array.from({ length: 50 }, (_, index) => ({
    ...originalTestQuiz,
    id: `quiz-${index}`,
  }));
  assert.throws(
    () => appendSubjectQuiz(quizzes, { ...originalTestQuiz, id: "extra" }),
    /50 quizzes/,
  );
});

test("JSON arrays and question containers import all formats and normalize the subject", () => {
  const source = [fixture[0], fixture[10], fixture[20]].map((question) => ({
    ...question,
    subject: "Uploaded course",
    status: undefined,
  }));
  for (const value of [
    source,
    { title: "Ignored metadata", questions: source },
  ]) {
    const questions = importQuizQuestions(JSON.stringify(value));
    assert.equal(questions.length, 3);
    assert.ok(
      questions.every(
        (question) =>
          question.subject === subjectFolder.subject &&
          question.status === "draft",
      ),
    );
    assert.deepEqual(
      questions.map((question) => question.correct),
      source.map((question) => question.correct),
    );
  }
});

test("malformed imports cannot produce ungradeable quizzes", () => {
  for (const value of [
    "not json",
    "[]",
    "{}",
    JSON.stringify([fixture[0], fixture[0]]),
    JSON.stringify([{ ...fixture[0], correct: [99] }]),
    JSON.stringify([{ ...fixture[0], correct: [0, 1] }]),
    JSON.stringify([{ ...fixture[20], answers: ["Yes", "No"] }]),
    JSON.stringify([
      { ...fixture[0], optionExplanations: ["missing options"] },
    ]),
    JSON.stringify([{ ...fixture[0], explanation: "" }]),
    JSON.stringify([{ ...fixture[0], type: "essay" }]),
  ])
    assert.throws(() => importQuizQuestions(value));
  assert.throws(() => importQuizQuestions(" ".repeat(1_000_001)), /1 MB/);
});

test("corrupt storage is reported instead of being replaced by seed data", () => {
  for (const raw of [
    "malformed",
    "{}",
    JSON.stringify([{ ...originalTestQuiz, subjectId: "other" }]),
    JSON.stringify([originalTestQuiz, originalTestQuiz]),
  ])
    assert.throws(() => parseSubjectQuizzes(raw), /left intact/);
});

test("original questions are runnable, gradeable, and recoverable as a saved quiz", () => {
  const session = createSubjectQuizSession(originalTestQuiz, 1000);
  assert.deepEqual(
    session.questionIds,
    fixture.map((question) => question.id),
  );
  assert.equal(session.config.mode, "practice");
  assert.equal(session.expiresAt, null);
  for (const question of fixture)
    session.answers[question.id] = [...question.correct];
  session.checked = [...session.questionIds];
  session.flagged = [fixture[0].id];
  session.submittedAt = 2000;
  assert.deepEqual(parseQuizSession(JSON.stringify(session)), session);
  const results = sessionResults(session);
  assert.equal(results.total, 30);
  assert.equal(results.correct, 30);
  assert.equal(results.accuracy, 100);
  assert.equal(
    results.topics.reduce((total, topic) => total + topic.total, 0),
    30,
  );
});

test("imported quiz snapshots remain independent of global question IDs and library changes", () => {
  const imported = importQuizQuestions(
    JSON.stringify([
      {
        ...fixture[0],
        id: "bio-atp",
        prompt: "Imported question",
        correct: [0],
      },
    ]),
  );
  const quiz = createSubjectQuiz(
    { title: "Import", description: "", questions: imported },
    "import",
    1000,
  );
  const session = createSubjectQuizSession(quiz, 1000);
  quiz.questions[0].prompt = "Edited library question";
  assert.equal(sessionQuestions(session)[0].prompt, "Imported question");
  session.answers["bio-atp"] = [0];
  assert.equal(sessionResults(session).accuracy, 100);
  assert.deepEqual(parseQuizSession(JSON.stringify(session)), session);
});

test("saved quiz recovery rejects missing snapshots, changed order, settings, and invalid answers", () => {
  const session = createSubjectQuizSession(originalTestQuiz, 1000);
  for (const changed of [
    { ...session, quizSnapshot: undefined },
    { ...session, questionIds: [...session.questionIds].reverse() },
    { ...session, config: { ...session.config, mode: "exam" } },
    { ...session, config: { ...session.config, quizId: "another" } },
    { ...session, config: { ...session.config, topics: [] } },
    { ...session, answers: { [session.questionIds[0]]: [99] } },
  ])
    assert.equal(parseQuizSession(JSON.stringify(changed)), null);
});
