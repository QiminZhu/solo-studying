import { z } from "zod";
import { publicationIssues, type QuizBundle } from "./contract.ts";

const reportSchema = z.object({
  questionId: z.string(),
  questionVersion: z.number().int().positive(),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/),
  decision: z.literal("approved"),
  checks: z.record(z.enum(["pass", "fail", "unverified"])),
  issues: z.array(z.unknown()).length(0),
});
// This is the actual check_coverage.py output shape; obtain it from the independent offline workflow.
const evidenceSchema = z.object({
  questionReports: z.array(reportSchema),
  coverageReport: z.object({
    complete: z.literal(true),
    fullLectureCoverage: z.boolean(),
    problems: z.array(z.string()).length(0),
    eligibleQuestionIds: z.array(z.string()),
    objectives: z
      .array(
        z.object({
          objectiveId: z.string(),
          status: z.enum(["adequate", "excluded"]),
        }),
      )
      .min(1),
    workload: z.object({
      questionObjects: z.number().int().positive(),
      responseUnits: z.number().int().positive(),
    }),
  }),
});
function canonicalJSON(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonicalJSON(v)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "null";
}
export async function canonicalHash(value: unknown): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonicalJSON(value)),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
/** Build-time only: never accept review artifacts or a publication request from a browser import. */
export async function publicationEvidenceIssues(
  bundle: QuizBundle,
  evidence: unknown,
): Promise<string[]> {
  const issues = publicationIssues(bundle);
  const parsed = evidenceSchema.safeParse(evidence);
  if (!parsed.success)
    return [
      ...issues,
      "Complete source, approved catalog, coverage blueprint, independent exact-version question reports, and a successful offline coverage gate are required before publication.",
    ];
  const { questionReports, coverageReport } = parsed.data;
  if (
    new Set(questionReports.map((r) => r.questionId)).size !==
    questionReports.length
  )
    issues.push("Question review reports must be unique.");
  for (const q of bundle.questions) {
    const report = questionReports.find((r) => r.questionId === q.id);
    const checks = [
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
      q.type === "single" || q.type === "multiple" || q.type === "boolean"
        ? "optionExplanations"
        : "responseExplanations",
    ];
    if (
      !report ||
      report.questionVersion !== q.version ||
      report.contentHash !== (await canonicalHash(q)) ||
      checks.some((key) => report.checks[key] !== "pass")
    )
      issues.push(
        `${q.id}@${q.version}: independent approval is missing, incomplete, or bound to different content.`,
      );
    if (!coverageReport.eligibleQuestionIds.includes(q.id))
      issues.push(
        `${q.id}: absent from the independently checked coverage bank.`,
      );
    for (const objectiveId of q.objectiveIds ?? [q.objectiveId])
      if (
        !coverageReport.objectives.some(
          (o) => o.objectiveId === objectiveId && o.status === "adequate",
        )
      )
        issues.push(
          `${q.id}: objective ${objectiveId} lacks validated response evidence.`,
        );
  }
  return issues;
}
