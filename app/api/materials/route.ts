import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { courseFolders, learningMaterials } from "@/db/schema";
import { MATERIAL_CATEGORIES, MAX_FILE_BYTES, processMaterial, validatePages } from "@/lib/material-processing";
import { ownedSet } from "@/lib/study-library";
import { isCrossOriginMutation, materialBucket, materialDetail, materialError, materialRecord, privateHeaders } from "@/lib/material-store";

export const dynamic = "force-dynamic";
const optionsSchema = z.object({ notes: z.enum(["summarized", "in-depth", "comprehensive"]), split: z.enum(["page", "headings"]) });

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in to view your learning materials." }, { status: 401, headers: privateHeaders });
  try {
    const course = new URL(request.url).searchParams.get("course");
    const rows = await getDb().select().from(learningMaterials).where(and(eq(learningMaterials.ownerId, user.userId), eq(learningMaterials.archived, false), course ? eq(learningMaterials.course, course) : undefined)).orderBy(desc(learningMaterials.createdAt)).limit(200);
    return Response.json({ materials: rows.map(materialRecord) }, { headers: privateHeaders });
  } catch (e) { return materialError(e); }
}

export async function POST(request: Request) {
  if (isCrossOriginMutation(request)) return Response.json({ error: "Upload from Solo Studying directly." }, { status: 403, headers: privateHeaders });
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in to save learning materials." }, { status: 401, headers: privateHeaders });
  const bad = (error: string, status = 400) => Response.json({ error }, { status, headers: privateHeaders });
  // Bound the multipart body before parsing, rather than trusting Content-Length.
  if (!request.body) return bad("Choose a file to process.");
  const reader = request.body.getReader();
  const parts: Uint8Array[] = [];
  let bytesRead = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > MAX_FILE_BYTES + 7 * 1024 * 1024) { await reader.cancel(); return bad("The upload is too large. Use a file under 25 MB with fewer text sections.", 413); }
    parts.push(value);
  }
  let form: FormData;
  try { form = await new Response(new Blob(parts as BlobPart[]), { headers: { "Content-Type": request.headers.get("Content-Type") ?? "" } }).formData(); }
  catch { return bad("The upload was interrupted. Choose the file and retry."); }
  const file = form.get("file");
  const setId = String(form.get("setId") ?? "") || null;
  let setLocation: { course: string; year: number; semester: number } | null = null;
  if (setId) {
    try {
      const set = await ownedSet(setId, user.userId);
      if (!set) return bad("Study set not found.", 404);
      setLocation = { course: set.title, year: 1, semester: 1 };
    } catch (e) { return materialError(e); }
  }
  const course = setLocation?.course ?? String(form.get("course") ?? "").trim();
  const location = z.object({ year: z.coerce.number().int().min(1).max(4), semester: z.coerce.number().int().min(1).max(2), category: z.enum(MATERIAL_CATEGORIES) }).safeParse({ year: setLocation?.year ?? form.get("year"), semester: setLocation?.semester ?? form.get("semester"), category: form.get("category") ?? "Lectures" });
  if (!location.success) return bad("Choose Year 1–4, Semester 1 or 2, and a material category.");
  const { year, semester, category } = location.data;
  if (!(file instanceof File) || !file.size || file.size > MAX_FILE_BYTES) return bad("Choose a non-empty file up to 25 MB.");
  if (!course || course.length > 120) return bad("Enter a subject name up to 120 characters.");
  const kind = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!["pdf", "txt", "md", "docx", "pptx"].includes(kind)) return bad("This file type is not supported.");
  let processed;
  try {
    const options = optionsSchema.parse(JSON.parse(String(form.get("options"))));
    processed = processMaterial(validatePages(JSON.parse(String(form.get("pages")))), options);
  } catch (e) { return bad(e instanceof z.ZodError || e instanceof SyntaxError ? "The processing settings or extracted text are invalid." : e instanceof Error ? e.message : "The extracted content is invalid."); }
  try {
    const db = getDb();
    const folder = (await db.select({ id: courseFolders.id }).from(courseFolders).where(and(eq(courseFolders.ownerId, user.userId), eq(courseFolders.year, year), eq(courseFolders.semester, semester), eq(courseFolders.course, course))).limit(1))[0];
    const existing = folder ? true : (await db.select({ id: learningMaterials.id }).from(learningMaterials).where(and(eq(learningMaterials.ownerId, user.userId), eq(learningMaterials.year, year), eq(learningMaterials.semester, semester), eq(learningMaterials.course, course), eq(learningMaterials.archived, false))).limit(1))[0];
    if (!setId && !existing) return bad("Create or open a course folder before uploading material.");
    const bytes = await file.arrayBuffer();
    const signature = new Uint8Array(bytes.slice(0, 5));
    if (kind === "pdf" && new TextDecoder().decode(signature) !== "%PDF-") return bad("This is not a PDF file.");
    if (["docx", "pptx"].includes(kind) && (signature[0] !== 80 || signature[1] !== 75)) return bad("This is not an Office file.");
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map(n => n.toString(16).padStart(2, "0")).join("");
    const optionsKey = `${processed.options.notes}:${processed.options.split}`;
    const duplicate = (await getDb().select().from(learningMaterials).where(and(eq(learningMaterials.ownerId, user.userId), ...(setId ? [eq(learningMaterials.setId, setId)] : [isNull(learningMaterials.setId), eq(learningMaterials.course, course), eq(learningMaterials.year, year), eq(learningMaterials.semester, semester), eq(learningMaterials.category, category)]), eq(learningMaterials.sourceHash, hash), eq(learningMaterials.optionsKey, optionsKey))).limit(1))[0];
    if (duplicate) {
      if (duplicate.archived) await getDb().update(learningMaterials).set({ archived: false }).where(eq(learningMaterials.id, duplicate.id));
      return Response.json({ material: { ...await materialDetail(duplicate), archived: false }, duplicate: true }, { headers: privateHeaders });
    }
    const id = crypto.randomUUID();
    const originalKey = `${user.userId}/materials/${id}/original`;
    const processedKey = `${user.userId}/materials/${id}/processed.json`;
    const row = { id, setId, ownerId: user.userId, name: file.name.slice(0, 255), course, year, semester, category, kind, size: file.size, sourceHash: hash, optionsKey, originalKey, processedKey,
      pageCount: processed.pages.length, chunkCount: processed.chunks.length, approvedConceptIds: "[]", archived: false, createdAt: new Date().toISOString() };
    const bucket = materialBucket();
    try {
      await bucket.put(originalKey, bytes, { httpMetadata: { contentType: "application/octet-stream" } });
      await bucket.put(processedKey, JSON.stringify(processed), { httpMetadata: { contentType: "application/json" } });
      await getDb().insert(learningMaterials).values(row);
    } catch (e) {
      await bucket.delete([originalKey, processedKey]).catch(() => undefined);
      throw e;
    }
    return Response.json({ material: { ...materialRecord(row), ...processed } }, { status: 201, headers: privateHeaders });
  } catch (e) { return materialError(e); }
}
