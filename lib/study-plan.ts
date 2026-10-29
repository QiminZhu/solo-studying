import { z } from "zod";
import type { MaterialDetail } from "./material-processing";

const topicId = z.string().min(1).max(1200);
export const planSchema = z.object({
  mode: z.enum(["comprehensive", "standard", "cram"]).default("comprehensive"),
  sort: z.enum(["recommended", "materials", "exam", "syllabus", "custom"]).default("recommended"),
  priorities: z.record(z.enum(["essential", "standard", "extra"])).refine(v => Object.keys(v).length <= 1000 && Object.keys(v).every(k => k.length <= 1200)).default({}),
  covered: z.array(topicId).max(1000).default([]),
  customOrder: z.array(topicId).max(1000).default([]),
  exams: z.array(z.object({ id: z.string().max(80), title: z.string().trim().min(1).max(120), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => { const d = new Date(value); return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === value; }), topicIds: z.array(topicId).max(1000) })).max(30).default([]),
  syllabus: z.array(z.object({ id: z.string().max(80), title: z.string().trim().min(1).max(160), topicIds: z.array(topicId).max(1000) })).max(52).default([]),
  recalls: z.record(z.string().max(5000)).refine(v => Object.keys(v).length <= 200 && Object.keys(v).every(k => k.length <= 1200)).default({}),
}).strict();
export type StudyPlan = z.infer<typeof planSchema>;
export type StudyTopic = { id: string; title: string; approved: boolean; sources: { materialId: string; materialName: string; chunkId: string; locator: string; text: string }[] };
export function readPlan(value: string): StudyPlan {
  try { return planSchema.parse(JSON.parse(value)); } catch { return planSchema.parse({}); }
}
export function buildTopics(materials: MaterialDetail[]): StudyTopic[] {
  const topics = new Map<string, StudyTopic>();
  for (const material of materials) for (const concept of material.concepts) {
    const normalized = concept.name.normalize("NFKC").toLocaleLowerCase("en").replace(/\s+/g, " ").trim();
    const id = `topic-${encodeURIComponent(normalized)}`;
    let topic = topics.get(id);
    if (!topic) { topic = { id, title: concept.name, approved: false, sources: [] }; topics.set(id, topic); }
    topic.approved ||= material.approvedConceptIds.includes(concept.id);
    const chunk = material.chunks.find(c => c.id === concept.chunkId);
    if (!topic.sources.some(s => s.materialId === material.id && s.chunkId === concept.chunkId)) topic.sources.push({ materialId: material.id, materialName: material.name, chunkId: concept.chunkId, locator: concept.locator, text: chunk?.text ?? "" });
  }
  return [...topics.values()];
}
export function visibleTopics(topics: StudyTopic[], plan: StudyPlan) {
  return topics.filter(t => plan.mode === "comprehensive" || (plan.mode === "standard" ? plan.priorities[t.id] !== "extra" : plan.priorities[t.id] === "essential"));
}
