import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { learningMaterials } from "@/db/schema";
import type { MaterialCategory, MaterialDetail, MaterialRecord, ProcessedMaterial } from "./material-processing";

export function materialRecord(row: typeof learningMaterials.$inferSelect): MaterialRecord {
  return { setId: row.setId, id: row.id, name: row.name, course: row.course, year: row.year, semester: row.semester, category: row.category as MaterialCategory, kind: row.kind, size: row.size,
    pageCount: row.pageCount, chunkCount: row.chunkCount, createdAt: row.createdAt,
    archived: row.archived, approvedConceptIds: JSON.parse(row.approvedConceptIds) };
}

export function materialBucket() {
  if (!env.BUCKET) throw new Error("Material storage is unavailable. Please try again later.");
  return env.BUCKET;
}

export async function ownedMaterial(id: string, ownerId: string) {
  return (await getDb().select().from(learningMaterials).where(and(eq(learningMaterials.id, id), eq(learningMaterials.ownerId, ownerId))).limit(1))[0];
}

export async function materialDetail(row: typeof learningMaterials.$inferSelect): Promise<MaterialDetail> {
  const object = await materialBucket().get(row.processedKey);
  if (!object) throw new Error("The extracted material could not be loaded. Your original file is still retained.");
  return { ...materialRecord(row), ...await object.json<ProcessedMaterial>() };
}

export const privateHeaders = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
export function isCrossOriginMutation(request: Request) {
  const origin = request.headers.get("origin");
  return request.headers.get("sec-fetch-site") === "cross-site" || (!!origin && origin !== new URL(request.url).origin);
}
export function materialError(error: unknown) {
  console.error("Material request failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json({ error: "The material could not be saved or loaded. Please retry; your existing materials are unchanged." }, { status: 503, headers: privateHeaders });
}
