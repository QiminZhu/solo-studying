import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { learningMaterials, studySets } from "@/db/schema";
import { materialError, materialRecord, privateHeaders } from "@/lib/material-store";
import { publicSet } from "@/lib/study-library";
export const dynamic = "force-dynamic";
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in to view your library." }, { status: 401, headers: privateHeaders });
  try {
    const db = getDb();
    const [sets, materials] = await Promise.all([
      db.select().from(studySets).where(eq(studySets.ownerId, user.userId)),
      db.select().from(learningMaterials).where(and(eq(learningMaterials.ownerId, user.userId), eq(learningMaterials.archived, false))),
    ]);
    return Response.json({ sets: sets.map(publicSet), materials: materials.map(materialRecord) }, { headers: privateHeaders });
  } catch (e) { return materialError(e); }
}
