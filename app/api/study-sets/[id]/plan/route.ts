import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { learningMaterials, studySets } from "@/db/schema";
import { isCrossOriginMutation, materialDetail, materialError, privateHeaders } from "@/lib/material-store";
import { ownedSet } from "@/lib/study-library";
import { buildTopics, planSchema, readPlan, type StudyTopic } from "@/lib/study-plan";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401, headers: privateHeaders });
  try {
    const set = await ownedSet((await context.params).id, user.userId);
    if (!set) return Response.json({ error: "Study set not found." }, { status: 404, headers: privateHeaders });
    const rows = await getDb().select().from(learningMaterials).where(and(eq(learningMaterials.ownerId, user.userId), eq(learningMaterials.setId, set.id), eq(learningMaterials.archived, false)));
    // Keep extraction reads bounded in flight for Workers.
    const topics = new Map<string, StudyTopic>();
    for (let offset = 0; offset < rows.length; offset += 5) {
      const details = await Promise.all(rows.slice(offset, offset + 5).map(materialDetail));
      for (const topic of buildTopics(details)) {
        const existing = topics.get(topic.id);
        if (existing) { existing.approved ||= topic.approved; existing.sources.push(...topic.sources); }
        else topics.set(topic.id, topic);
      }
    }
    return Response.json({ topics: [...topics.values()], plan: readPlan(set.plan) }, { headers: privateHeaders });
  } catch (e) { return materialError(e); }
}
export async function PUT(request: Request, context: Context) {
  if (isCrossOriginMutation(request)) return Response.json({ error: "Update from Solo Studying directly." }, { status: 403, headers: privateHeaders });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401, headers: privateHeaders });
  let plan;
  try { const body = await request.text(); if (body.length > 250000) throw new Error(); plan = planSchema.parse(JSON.parse(body)); }
  catch { return Response.json({ error: "Invalid study plan. Check your settings and try again." }, { status: 400, headers: privateHeaders }); }
  try {
    const set = await ownedSet((await context.params).id, user.userId);
    if (!set) return Response.json({ error: "Study set not found." }, { status: 404, headers: privateHeaders });
    await getDb().update(studySets).set({ plan: JSON.stringify(plan), updatedAt: new Date().toISOString() }).where(and(eq(studySets.id, set.id), eq(studySets.ownerId, user.userId)));
    return Response.json({ plan }, { headers: privateHeaders });
  } catch (e) { return materialError(e); }
}
