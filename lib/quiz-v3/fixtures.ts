import fixtureData from "./fixture-bank.json" with { type: "json" };
import { parseBank, quizBundleSchema, type QuizBundle } from "./contract.ts";

const bank = parseBank(fixtureData);
const guidance = {
  "fixture-choice": {
    topic: "Fixture rules",
    guidance:
      "Use the literal label and the stated equality or containment rule. These are software tests, not lecture revision.",
  },
  "fixture-matching": {
    topic: "Fixture relationships",
    guidance:
      "Read the matching criterion and reuse policy, then check each left item.",
  },
  "fixture-ordering": {
    topic: "Fixture sequence",
    guidance:
      "Revisit the requested smallest-to-largest direction and check each position.",
  },
  "fixture-blanks": {
    topic: "Fixture normalization",
    guidance:
      "Read the declared label rule, units, and rounding instructions. Recalculate the fixture quotient.",
  },
};
const configs = [
  {
    id: "slimekeeper",
    title: "The Slimekeeper’s Cellar",
    description:
      "Test single choice, select-all, and true/false with immediate feedback.",
    ids: ["fixture-single", "fixture-multiple", "fixture-boolean"],
  },
  {
    id: "webweaver",
    title: "The Webweaver’s Labyrinth",
    description:
      "Test accessible matching and ordering, with feedback after checking.",
    ids: ["fixture-matching", "fixture-ordering"],
  },
  {
    id: "golem",
    title: "The Golem’s Proving Grounds",
    description: "Test accepted text variants, units, and numeric tolerance.",
    ids: ["fixture-blanks"],
  },
  {
    id: "memory-eater",
    title: "The Memory Eater",
    description:
      "Test all six formats with fresh fixture questions. Feedback follows final submission.",
    ids: bank
      .filter((q) => q.id.startsWith("fixture-memory-"))
      .map((q) => q.id),
  },
];
export const fixtureQuizzes: QuizBundle[] = configs.map((c) =>
  quizBundleSchema.parse({
    quiz: {
      id: c.id,
      title: c.title,
      description: c.description,
      bankId: "software-fixtures",
      bankVersion: 1,
      questionIds: c.ids,
      feedbackMode: c.id === "memory-eater" ? "deferred" : "immediate",
      contentKind: "fixture",
      revisionGuidance: guidance,
    },
    questions: c.ids.map((id) => bank.find((q) => q.id === id)),
  }),
);
