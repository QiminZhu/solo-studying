export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_TEXT_CHARS = 1_000_000;
export const MATERIAL_COURSES = ["CS 204", "MATH 218", "STAT 201"] as const;
export const MATERIAL_CATEGORIES = ["Lectures", "Activities", "Projects", "Resources"] as const;
export type MaterialCategory = typeof MATERIAL_CATEGORIES[number];
export type SourcePage = { number: number; label: string; text: string };
export type MaterialOptions = { notes: "summarized" | "in-depth" | "comprehensive"; split: "page" | "headings" };
export type SourceChunk = { id: string; page: number; locator: string; text: string };
export type ConceptProposal = { id: string; name: string; chunkId: string; locator: string };
export type StudyNote = { text: string; chunkId: string; locator: string };
export type ProcessedMaterial = {
  pages: SourcePage[]; chunks: SourceChunk[]; concepts: ConceptProposal[];
  notes: StudyNote[]; warnings: string[]; options: MaterialOptions;
};
export type MaterialRecord = {
  setId: string | null;
  year: number | null; semester: number | null; category: MaterialCategory;
  id: string; name: string; course: string; kind: string; size: number;
  pageCount: number; chunkCount: number; createdAt: string;
  approvedConceptIds: string[]; archived: boolean;
};
export type MaterialDetail = MaterialRecord & ProcessedMaterial;

export function normalizeText(text: string) {
  return text.replace(/\r\n?/g, "\n").replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function validatePages(input: unknown): SourcePage[] {
  if (!Array.isArray(input) || !input.length || input.length > 1000) throw new Error("Use a material with 1–1,000 pages or sections.");
  let total = 0;
  return input.map((value, i) => {
    if (!value || typeof value.text !== "string" || value.number !== i + 1 || typeof value.label !== "string" || value.label.length > 120) {
      throw new Error("The extracted source locations are invalid. Please process the file again.");
    }
    total += value.text.length;
    if (total > MAX_TEXT_CHARS) throw new Error("This material contains too much text. Split it into smaller files (up to one million characters each).");
    return { number: i + 1, label: value.label, text: normalizeText(value.text) };
  });
}

function isHeading(line: string) {
  const t = line.trim();
  return t.length >= 4 && t.length <= 100 && t.split(/\s+/).length <= 12 &&
    !/[.!?;,]$/.test(t) && /\p{L}/u.test(t) && !/^(page|slide)\s+\d+$/i.test(t);
}

export function processMaterial(pages: SourcePage[], options: MaterialOptions): ProcessedMaterial {
  pages = validatePages(pages);
  if (pages.reduce((n, p) => n + p.text.length, 0) < 60) throw new Error("Not enough readable text was found. Scanned or image-only files need OCR, which is not enabled yet.");
  const chunks: SourceChunk[] = [];
  for (const page of pages) {
    if (!page.text) continue;
    const groups = options.split === "headings"
      ? page.text.split(/\n(?=#{1,6}\s|\d+[.)]\s)/)
      : [page.text];
    for (const group of groups) {
      let remaining = group.trim();
      while (remaining) {
        let end = Math.min(1500, remaining.length);
        if (remaining.length > end) {
          const boundary = Math.max(remaining.lastIndexOf("\n", end), remaining.lastIndexOf(" ", end));
          if (boundary > 700) end = boundary;
        }
        chunks.push({ id: `chunk-${chunks.length + 1}`, page: page.number, locator: page.label, text: remaining.slice(0, end).trim() });
        remaining = remaining.slice(end).trim();
      }
    }
  }
  const concepts: ConceptProposal[] = [];
  const seen = new Set<string>();
  for (const chunk of chunks) {
    for (const line of chunk.text.split("\n")) {
      const name = line.replace(/^\s*(?:#{1,6}\s*|\d+[.)]\s*)/, "").trim();
      if (!isHeading(name) || seen.has(name.toLocaleLowerCase())) continue;
      seen.add(name.toLocaleLowerCase());
      concepts.push({ id: `concept-${concepts.length + 1}`, name, chunkId: chunk.id, locator: chunk.locator });
      if (concepts.length === 60) break;
    }
    if (concepts.length === 60) break;
  }
  // Extractive notes retain the source wording; they are never presented as AI summaries.
  const sentenceCount = options.notes === "summarized" ? 1 : options.notes === "in-depth" ? 3 : Infinity;
  const notes = chunks.map(chunk => ({
    text: sentenceCount === Infinity ? chunk.text : chunk.text.split(/(?<=[.!?])\s+/).slice(0, sentenceCount).join(" "),
    chunkId: chunk.id, locator: chunk.locator,
  }));
  const warnings = [];
  const blank = pages.filter(p => !p.text).length;
  if (blank) warnings.push(`${blank} page(s) or section(s) had no readable text. Images, diagrams, and handwriting are not interpreted.`);
  if (!concepts.length) warnings.push("No clear headings were found. You can still read, search, and study the extracted material.");
  return { pages, chunks, concepts, notes, warnings, options };
}

export function searchChunks(chunks: SourceChunk[], query: string) {
  const terms = [...new Set(query.toLocaleLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? [])].slice(0, 20);
  if (!terms.length) return [];
  return chunks.map(chunk => {
    const text = chunk.text.toLocaleLowerCase();
    return { ...chunk, score: terms.reduce((n, term) => n + (text.includes(term) ? 1 : 0), 0) };
  }).filter(c => c.score > 0).sort((a, b) => b.score - a.score).slice(0, 12);
}
