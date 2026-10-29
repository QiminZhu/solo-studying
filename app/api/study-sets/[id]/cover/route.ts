import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { studySets } from "@/db/schema";
import { isCrossOriginMutation, materialBucket, materialError, privateHeaders } from "@/lib/material-store";
import { ownedSet } from "@/lib/study-library";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  const user = await getChatGPTUser();
  if (!user) return new Response(null, { status: 401, headers: privateHeaders });
  try {
    const row = await ownedSet((await context.params).id, user.userId);
    if (!row?.coverKey) return new Response(null, { status: 404, headers: privateHeaders });
    const object = await materialBucket().get(row.coverKey);
    if (!object) return new Response(null, { status: 404, headers: privateHeaders });
    return new Response(object.body, { headers: { ...privateHeaders, "Content-Type": object.httpMetadata?.contentType ?? "image/png" } });
  } catch (e) { return materialError(e); }
}
export async function PUT(request: Request, context: Context) {
  if (isCrossOriginMutation(request)) return Response.json({ error: "Upload from Solo Studying directly." }, { status: 403, headers: privateHeaders });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401, headers: privateHeaders });
  try {
    const row = await ownedSet((await context.params).id, user.userId);
    if (!row) return Response.json({ error: "Study set not found." }, { status: 404, headers: privateHeaders });
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: "Choose an image." }, { status: 400, headers: privateHeaders });
    const parts: Uint8Array[] = []; let size = 0;
    while (true) { const result = await reader.read(); if (result.done) break; size += result.value.length; if (size > 5 * 1024 * 1024) { await reader.cancel(); return Response.json({ error: "Use an image up to 5 MB." }, { status: 413, headers: privateHeaders }); } parts.push(result.value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const part of parts) { bytes.set(part, offset); offset += part.length; }
    const signature = new TextDecoder().decode(bytes.slice(0, 6));
    const type = bytes.length >= 8 && bytes[0] === 137 && signature.slice(1,4) === "PNG" && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10 ? "image/png" : bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? "image/jpeg" : ["GIF87a", "GIF89a"].includes(signature) ? "image/gif" : null;
    if (!type) return Response.json({ error: "Choose a PNG, JPG, or GIF image." }, { status: 400, headers: privateHeaders });
    const key = `${user.userId}/study-sets/${row.id}/cover-${crypto.randomUUID()}`;
    await materialBucket().put(key, bytes, { httpMetadata: { contentType: type } });
    const updatedAt = new Date().toISOString();
    try { await getDb().update(studySets).set({ coverKey: key, updatedAt }).where(and(eq(studySets.id, row.id), eq(studySets.ownerId, user.userId))); }
    catch (e) { await materialBucket().delete(key).catch(() => undefined); throw e; }
    if (row.coverKey) await materialBucket().delete(row.coverKey).catch(() => undefined);
    return Response.json({ saved: true, updatedAt }, { headers: privateHeaders });
  } catch (e) { return materialError(e); }
}
