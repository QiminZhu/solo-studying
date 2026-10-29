import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { studySets } from "@/db/schema";

export const setSchema = z.object({ title: z.string().trim().min(1).max(120), description: z.string().trim().max(2000).default(""), color: z.enum(["mint", "lavender", "peach", "sky"]).default("mint") }).strict();
export async function ownedSet(id: string, ownerId: string) {
  return (await getDb().select().from(studySets).where(and(eq(studySets.id, id), eq(studySets.ownerId, ownerId))).limit(1))[0];
}
export function publicSet(row: typeof studySets.$inferSelect) {
  return { id: row.id, title: row.title, description: row.description, color: row.color, hasCover: !!row.coverKey, createdAt: row.createdAt, updatedAt: row.updatedAt, lastAccessedAt: row.lastAccessedAt };
}
