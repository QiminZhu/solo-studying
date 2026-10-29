import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { studySets } from "@/db/schema";
import { isCrossOriginMutation, materialError, privateHeaders } from "@/lib/material-store";
import { publicSet, setSchema } from "@/lib/study-library";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (isCrossOriginMutation(request)) return Response.json({ error: "Create study sets from Solo Studying directly." }, { status: 403, headers: privateHeaders });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401, headers: privateHeaders });
  let data;
  try { const body = await request.text(); if (body.length > 8000) throw new Error(); data = setSchema.parse(JSON.parse(body)); }
  catch { return Response.json({ error: "Enter a title up to 120 characters and a description up to 2,000 characters." }, { status: 400, headers: privateHeaders }); }
  try {
    const now = new Date().toISOString();
    const row = { id: crypto.randomUUID(), ownerId: user.userId, ...data, folderId: null, plan: "{}", coverKey: null, createdAt: now, updatedAt: now, lastAccessedAt: null };
    await getDb().insert(studySets).values(row);
    return Response.json({ set: publicSet(row) }, { status: 201, headers: privateHeaders });
  } catch (e) { return materialError(e); }
}
