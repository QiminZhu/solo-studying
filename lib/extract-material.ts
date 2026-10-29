import { MAX_FILE_BYTES, MAX_TEXT_CHARS, normalizeText, type SourcePage } from "./material-processing";

function xmlText(xml: string, type: "word" | "slide") {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("This Office file contains malformed content.");
  const paragraphs = Array.from(doc.getElementsByTagNameNS("*", "p"));
  return normalizeText(paragraphs.map(p => Array.from(p.getElementsByTagNameNS("*", "t")).map(t => t.textContent ?? "").join(type === "slide" ? " " : "")).join("\n"));
}

export async function extractMaterial(file: File, progress: (message: string) => void): Promise<SourcePage[]> {
  if (!file.size || file.size > MAX_FILE_BYTES) throw new Error("Choose a non-empty file up to 25 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["pdf", "txt", "md", "docx", "pptx"].includes(extension ?? "")) throw new Error("Use PDF, DOCX, PPTX, TXT, or Markdown. Audio, video, images, and legacy Office formats are not supported yet.");
  progress("Reading the original file…");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pages: SourcePage[] = [];
  if (extension === "pdf") {
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw new Error("This is not a valid PDF file.");
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const task = pdfjs.getDocument({ data: bytes, cMapUrl: "/pdfjs/cmaps/", cMapPacked: true, standardFontDataUrl: "/pdfjs/standard_fonts/", wasmUrl: "/pdfjs/wasm/" });
    try {
      const doc = await task.promise;
      if (doc.numPages > 1000) throw new Error("Split PDFs larger than 1,000 pages before uploading.");
      let total = 0;
      for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
        progress(`Extracting PDF page ${pageNum} of ${doc.numPages}…`);
        const page = await doc.getPage(pageNum);
        const content = await page.getTextContent();
        const text = normalizeText(content.items.map(item => "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "").join(""));
        total += text.length;
        if (total > MAX_TEXT_CHARS) throw new Error("This PDF has too much text. Split it into smaller files.");
        pages.push({ number: pageNum, label: `Page ${pageNum}`, text });
        page.cleanup();
      }
    } catch (e) {
      if (e instanceof Error && e.name === "PasswordException") throw new Error("Password-protected PDFs are not supported. Upload an unlocked copy.");
      throw e;
    } finally { await task.destroy(); }
  } else if (extension === "docx" || extension === "pptx") {
    progress("Extracting Office text…");
    const { unzipSync } = await import("fflate");
    let expanded = 0;
    const files = unzipSync(bytes, { filter: entry => {
      const wanted = extension === "docx" ? entry.name === "word/document.xml" : /^ppt\/slides\/slide\d+\.xml$/.test(entry.name);
      if (!wanted) return false;
      expanded += entry.originalSize;
      if (expanded > 12 * 1024 * 1024) throw new Error("This Office file expands beyond the safe processing limit. Split it into smaller files.");
      return true;
    } });
    if (extension === "docx") {
      if (!files["word/document.xml"]) throw new Error("This is not a readable DOCX file.");
      const text = xmlText(new TextDecoder().decode(files["word/document.xml"]), "word");
      // Word has no stable pagination without rendering: use explicit text-section locators.
      for (let i = 0; i < text.length; i += 12000) pages.push({ number: pages.length + 1, label: `Text section ${pages.length + 1}`, text: text.slice(i, i + 12000) });
    } else {
      const names = Object.keys(files).sort((a, b) => Number(a.match(/slide(\d+)/)?.[1]) - Number(b.match(/slide(\d+)/)?.[1]));
      names.forEach((name, i) => pages.push({ number: i + 1, label: `Slide ${Number(name.match(/slide(\d+)/)?.[1])}`, text: xmlText(new TextDecoder().decode(files[name]), "slide") }));
    }
  } else {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (text.includes("\0")) throw new Error("This file appears to be binary. Use a UTF-8 text file.");
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 80) pages.push({ number: pages.length + 1, label: `Lines ${i + 1}–${Math.min(i + 80, lines.length)}`, text: normalizeText(lines.slice(i, i + 80).join("\n")) });
  }
  if (pages.reduce((n, p) => n + p.text.length, 0) > MAX_TEXT_CHARS) throw new Error("This material has too much text. Split it into smaller files.");
  if (pages.length > 1000) throw new Error("Split this material into fewer than 1,000 sections.");
  return pages;
}
