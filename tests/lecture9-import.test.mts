import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lecture9Quizzes } from "../lib/quiz-v3/lecture9.ts";
import { parseBank } from "../lib/quiz-v3/contract.ts";
import { gradeQuestion, type Response } from "../lib/quiz-v3/grading.ts";
import { createAttempt, updateAttempt, canReveal } from "../lib/quiz-v3/attempt.ts";

test("Lecture 9 import preserves all data, tag membership, grading and feedback timing", () => {
  const source: unknown = JSON.parse(readFileSync(new URL("../lib/quiz-v3/lecture9-bank.json", import.meta.url), "utf8"));
  const bank = parseBank(source);
  assert.equal(bank.length, 94);
  assert.deepEqual(lecture9Quizzes.flatMap(b => b.questions), bank.filter(q => q.tags?.some(t => /^quiz:l09-level-[1-4]$/.test(t))));
  assert.equal(bank.filter(q => q.tags?.includes("practice:l09-reinforcement")).length, 42);
  assert.equal(lecture9Quizzes.length, 4);
  for (const [i, bundle] of lecture9Quizzes.entries()) {
    assert.equal(bundle.questions.length, [20, 12, 8, 12][i]);
    assert.equal(bundle.quiz.id, `itcs217-l09-progressive-level-${i + 1}`);
    assert.deepEqual(bundle.questions, bank.filter(q => q.tags?.includes(`quiz:l09-level-${i + 1}`)));
    assert.equal(bundle.quiz.iconAsset, undefined);
    assert.equal(bundle.quiz.feedbackMode, i === 3 ? "deferred" : "immediate");
    let attempt = createAttempt(bundle, `verify-${i}`, 0);
    for (const q of bundle.questions) {
      assert.ok(q.tags?.includes(`quiz:l09-level-${i + 1}`));
      let response: Response;
      let wrong: Response;
      switch (q.type) {
        case "single": case "multiple": case "boolean":
          response = {kind:"choice", selected:[...q.correct]};
          wrong = {kind:"choice",selected:[q.answers.findIndex((_,j)=>!q.correct.includes(j))]}; break;
        case "matching":
          response = {kind:"matching",selected:Object.fromEntries(q.matches)};
          wrong = {kind:"matching",selected:Object.fromEntries(q.matches.map(([l,r],j)=>[l,q.matches[(j+1)%q.matches.length][1] ?? r]))}; break;
        case "ordering":
          response = {kind:"ordering",order:[...q.correctOrder],confirmed:true};
          wrong = {kind:"ordering",order:[...q.correctOrder].reverse(),confirmed:true}; break;
        case "fill_blank":
          response = {kind:"blanks",values:Object.fromEntries(q.blanks.map(b=>[b.id,b.kind === "number" ? String(b.value):b.acceptedAnswers[0]]))};
          wrong = {kind:"blanks",values:Object.fromEntries(q.blanks.map(b=>[b.id,"-99999"]))}; break;
      }
      assert.equal(gradeQuestion(q,response).score,1,q.id);
      assert.equal(gradeQuestion(q,wrong).score,0,q.id);
      assert.equal(gradeQuestion(q).score,0,q.id);
      attempt = updateAttempt(attempt,{type:"answer",questionId:q.id,response});
      assert.equal(canReveal(attempt,q.id),false);
      attempt = updateAttempt(attempt,{type:"check",questionId:q.id});
      assert.equal(canReveal(attempt,q.id),i !== 3);
    }
    attempt = updateAttempt(attempt,{type:"submit",now:1,confirmUnanswered:false});
    for(const q of bundle.questions) assert.equal(canReveal(attempt,q.id),true);
  }
});
