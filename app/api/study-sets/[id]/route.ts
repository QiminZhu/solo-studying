import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { learningMaterials, studySets } from "@/db/schema";
import { isCrossOriginMutation, materialBucket, materialError, privateHeaders } from "@/lib/material-store";
import { ownedSet, publicSet, setSchema } from "@/lib/study-library";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  if (isCrossOriginMutation(request)) return Response.json({ error: "Update from Solo Studying directly." }, { status: 403, headers: privateHeaders });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401, headers: privateHeaders });
  let data;
  try {
    const body = await request.text(); if (body.length > 8000) throw new Error();
    const parsed = JSON.parse(body);
    data = parsed && Object.keys(parsed).length === 1 && parsed.accessed === true ? { accessed: true as const } : setSchema.parse(parsed);
  } catch { return Response.json({ error: "Invalid study set changes." }, { status: 400, headers: privateHeaders }); }
  try {
    const row = await ownedSet((await context.params).id, user.userId);
    if (!row) return Response.json({ error: "Study set not found." }, { status: 404, headers: privateHeaders });
    const changes = "accessed" in data ? { lastAccessedAt: new Date().toISOString() } : { ...data, updatedAt: new Date().toISOString() };
    await getDb().update(studySets).set(changes).where(and(eq(studySets.id, row.id), eq(studySets.ownerId, user.userId)));
    return Response.json({ set: publicSet({ ...row, ...changes }) }, { headers: privateHeaders });
  } catch (e) { return materialError(e); }
}
export async function DELETE(request: Request, context: Context) {
  if (isCrossOriginMutation(request)) return Response.json({ error: "Delete from Solo Studying directly." }, { status: 403, headers: privateHeaders });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401, headers: privateHeaders });
  try {
    const row = await ownedSet((await context.params).id, user.userId);
    if (!row) return Response.json({ error: "Study set not found." }, { status: 404, headers: privateHeaders });
    await getDb().batch([
      getDb().update(learningMaterials).set({ setId: null }).where(and(eq(learningMaterials.setId, row.id), eq(learningMaterials.ownerId, user.userId))),
      getDb().delete(studySets).where(and(eq(studySets.id, row.id), eq(studySets.ownerId, user.userId))),
    ]);
    if (row.coverKey) await materialBucket().delete(row.coverKey).catch(() => undefined);
    return Response.json({ deleted: true }, { headers: privateHeaders });
  } catch (e) { return materialError(e); }
}
