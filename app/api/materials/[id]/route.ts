import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { learningMaterials } from "@/db/schema";
import { ownedSet } from "@/lib/study-library";
import { MATERIAL_CATEGORIES } from "@/lib/material-processing";
import { isCrossOriginMutation, materialDetail, materialError, ownedMaterial, privateHeaders } from "@/lib/material-store";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401, headers: privateHeaders });
  try {
    const row = await ownedMaterial((await context.params).id, user.userId);
    if (!row || row.archived) return Response.json({ error: "Material not found." }, { status: 404, headers: privateHeaders });
    return Response.json({ material: await materialDetail(row) }, { headers: privateHeaders });
  } catch (e) { return materialError(e); }
}

export async function PATCH(request: Request, context: Context) {
  if (isCrossOriginMutation(request)) return Response.json({ error: "Update from Solo Studying directly." }, { status: 403, headers: privateHeaders });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401, headers: privateHeaders });
  if (Number(request.headers.get("content-length") ?? 0) > 16000) return Response.json({ error: "Request too large." }, { status: 413, headers: privateHeaders });
  let payload;
  try {
    const body = await request.text();
    if (body.length > 16000) return Response.json({ error: "Request too large." }, { status: 413, headers: privateHeaders });
    payload = z.object({ setId: z.string().min(1).max(100).nullable().optional(), approvedConceptIds: z.array(z.string().max(80)).max(60).optional(), archived: z.boolean().optional(), location: z.object({ year: z.number().int().min(1).max(4), semester: z.number().int().min(1).max(2), course: z.string().trim().min(1).max(120), category: z.enum(MATERIAL_CATEGORIES) }).strict().optional() }).strict().parse(JSON.parse(body));
  }
  catch { return Response.json({ error: "Invalid material changes." }, { status: 400, headers: privateHeaders }); }
  try {
    const row = await ownedMaterial((await context.params).id, user.userId);
    if (!row) return Response.json({ error: "Material not found." }, { status: 404, headers: privateHeaders });
    const detail = await materialDetail(row);
    if (payload.approvedConceptIds?.some(id => !detail.concepts.some(c => c.id === id))) return Response.json({ error: "A selected concept does not belong to this material." }, { status: 400, headers: privateHeaders });
    if (payload.location && payload.setId !== undefined) return Response.json({ error: "Move to a study set or a legacy location, one at a time." }, { status: 400, headers: privateHeaders });
    if (payload.setId) {
      if (!await ownedSet(payload.setId, user.userId)) return Response.json({ error: "Study set not found." }, { status: 404, headers: privateHeaders });
      const duplicate = (await getDb().select({ id: learningMaterials.id }).from(learningMaterials).where(and(eq(learningMaterials.ownerId, user.userId), eq(learningMaterials.setId, payload.setId), eq(learningMaterials.sourceHash, row.sourceHash), eq(learningMaterials.optionsKey, row.optionsKey))).limit(1))[0];
      if (duplicate && duplicate.id !== row.id) return Response.json({ error: "This material already exists in that study set." }, { status: 409, headers: privateHeaders });
    }
    if (payload.location) {
      const l = payload.location;
      const duplicate = (await getDb().select().from(learningMaterials).where(and(eq(learningMaterials.ownerId, user.userId), isNull(learningMaterials.setId), eq(learningMaterials.course, l.course), eq(learningMaterials.year, l.year), eq(learningMaterials.semester, l.semester), eq(learningMaterials.category, l.category), eq(learningMaterials.sourceHash, row.sourceHash), eq(learningMaterials.optionsKey, row.optionsKey))).limit(1))[0];
      if (duplicate && duplicate.id !== row.id) return Response.json({ error: "This material already exists in that location." }, { status: 409, headers: privateHeaders });
    }
    await getDb().update(learningMaterials).set({
      ...payload.location,
      ...(payload.location ? { setId: null } : payload.setId !== undefined ? { setId: payload.setId } : {}),
      ...(payload.approvedConceptIds ? { approvedConceptIds: JSON.stringify([...new Set(payload.approvedConceptIds)]) } : {}),
      ...(payload.archived !== undefined ? { archived: payload.archived } : {}),
    }).where(and(eq(learningMaterials.id, row.id), eq(learningMaterials.ownerId, user.userId)));
    return Response.json({ material: { ...detail, ...(payload.approvedConceptIds ? { approvedConceptIds: [...new Set(payload.approvedConceptIds)] } : {}), ...(payload.archived !== undefined ? { archived: payload.archived } : {}), ...payload.location, ...(payload.location ? { setId: null } : payload.setId !== undefined ? { setId: payload.setId } : {}) } }, { headers: privateHeaders });
  } catch (e) { return materialError(e); }
}
