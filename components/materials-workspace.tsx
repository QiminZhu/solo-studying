"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, BookOpen, Check, Download, FileText, LoaderCircle, Search, Upload, X } from "lucide-react";
import { extractMaterial } from "@/lib/extract-material";
import { MATERIAL_CATEGORIES, MAX_FILE_BYTES, searchChunks, type MaterialDetail, type MaterialOptions, type MaterialRecord } from "@/lib/material-processing";

const panel = "rounded-2xl border border-slate-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800";
const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-neutral-600 dark:bg-neutral-900";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const data: unknown = await response.json().catch(() => ({ error: "The server response was interrupted. Please retry." }));
  if (!response.ok) throw new Error(data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "The request failed. Please retry.");
  return data as T;
}

function ErrorNotice({ message }: { message: string }) {
  return <div role="alert" className="my-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"><AlertCircle className="mt-0.5 size-4 shrink-0" />{message}</div>;
}

export function MaterialUploadDialog({ studySet, onClose, onSaved }: { studySet: { id: string; title: string }; onClose: () => void; onSaved: (id: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [pasted, setPasted] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(MATERIAL_CATEGORIES[0]);
  const [notes, setNotes] = useState<MaterialOptions["notes"]>("summarized");
  const [split, setSplit] = useState<MaterialOptions["split"]>("page");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);

  function chooseFile(next?: File) {
    setError("");
    if (!next) return;
    if (next.size > MAX_FILE_BYTES || !next.size) { setError("Choose a non-empty file up to 25 MB."); return; }
    if (!/\.(pdf|docx|pptx|txt|md)$/i.test(next.name)) { setError("Supported files: PDF, DOCX, PPTX, TXT, and Markdown."); return; }
    setFile(next);
  }

  async function process() {
    if (busy) return;
    headingRef.current?.focus();
    setBusy(true); setError("");
    try {
      const original = pasteMode ? new File([pasted], `${name.trim() || "Pasted notes"}.txt`, { type: "text/plain" }) : file;
      if (!original) throw new Error("Choose a material first.");
      const pages = await extractMaterial(original, setStage);
      setStage("Saving the original and building source-linked notes…");
      const body = new FormData();
      body.set("file", original); body.set("setId", studySet.id); body.set("category", category);
      body.set("pages", JSON.stringify(pages)); body.set("options", JSON.stringify({ notes, split }));
      const data = await api<{ material: MaterialDetail }>("/api/materials", { method: "POST", body });
      onSaved(data.material.id);
    } catch (e) { setError(e instanceof Error ? e.message : "Processing failed. Please retry."); }
    finally { setBusy(false); setStage(""); }
  }

  return <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm" onKeyDown={event => {
    if (event.key === "Escape" && !busy) onClose();
    if (event.key === "Tab") {
      const elements = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]');
      if (!elements?.length) { event.preventDefault(); return; }
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="upload-heading" aria-describedby="upload-description" className="mx-auto my-6 w-full max-w-2xl rounded-3xl bg-white p-6 text-slate-900 dark:bg-neutral-800 dark:text-neutral-100">
      <div className="flex justify-between gap-4"><div><span className="tag">Learning material</span><h2 ref={headingRef} tabIndex={-1} id="upload-heading" className="mt-3 text-xl font-semibold">Add learning material</h2><p id="upload-description" className="mt-2 text-sm text-slate-500 dark:text-neutral-400">Keep the original, extract readable text, and review proposed concepts before using them.</p></div><button ref={closeRef} onClick={onClose} disabled={busy} aria-label="Close upload" className="self-start rounded-lg p-2 disabled:opacity-30"><X className="size-5" /></button></div>
      <div className="mt-5 flex gap-2" role="group" aria-label="Material input"><button disabled={busy} aria-pressed={!pasteMode} onClick={() => { setPasteMode(false); setError(""); }} className={!pasteMode ? "primary-button" : "secondary-button"}>Upload file</button><button disabled={busy} aria-pressed={pasteMode} onClick={() => { setPasteMode(true); setError(""); }} className={pasteMode ? "primary-button" : "secondary-button"}>Paste notes</button></div>
      <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Study set: {studySet.title}</p>
      <label className="mt-4 block text-sm">Material type<select value={category} onChange={e => setCategory(e.target.value)} disabled={busy} className={`${inputClass} mt-2`}>{MATERIAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
      {pasteMode ? <div className="mt-4 space-y-3"><label className="block text-sm">Material name<input className={`${inputClass} mt-2`} disabled={busy} value={name} onChange={e => setName(e.target.value)} maxLength={180} placeholder="Lecture 5 notes" /></label><label className="block text-sm">Your notes<textarea className={`${inputClass} mt-2 min-h-36`} disabled={busy} value={pasted} onChange={e => setPasted(e.target.value)} maxLength={1_000_000} placeholder="Paste the source text here…" /></label></div>
        : <label onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!busy) chooseFile(e.dataTransfer.files[0]); }} className="mt-5 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 px-5 py-8 text-center dark:border-neutral-600"><Upload className="size-6 text-emerald-600" /><strong className="mt-3 break-all text-sm">{file?.name || "Choose a file or drop it here"}</strong><span className="mt-2 text-xs text-slate-500 dark:text-neutral-400">PDF, DOCX, PPTX, TXT, MD · Up to 25 MB</span><input type="file" disabled={busy} accept=".pdf,.docx,.pptx,.txt,.md" className="mt-4 max-w-full text-xs" onChange={e => chooseFile(e.target.files?.[0])} /></label>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm">Extractive notes<select disabled={busy} value={notes} onChange={e => setNotes(e.target.value as MaterialOptions["notes"])} className={`${inputClass} mt-2`}><option value="summarized">Brief excerpts</option><option value="in-depth">Detailed excerpts</option><option value="comprehensive">Full extracted text</option></select></label><label className="text-sm">Split content by<select disabled={busy} value={split} onChange={e => setSplit(e.target.value as MaterialOptions["split"])} className={`${inputClass} mt-2`}><option value="page">Page / slide / section</option><option value="headings">Numbered or Markdown headings</option></select></label></div>
      <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-neutral-400">Text extraction only. Scanned pages, diagrams, handwriting, audio, and video are not interpreted. Notes quote your source; AI rewriting is not enabled.</p>
      {error && <ErrorNotice message={error} />}
      {busy && <p role="status" aria-live="polite" className="mt-5 flex items-center gap-2 text-sm"><LoaderCircle className="size-4 animate-spin" />{stage || "Preparing material…"}</p>}
      <div className="mt-6 flex justify-end gap-2"><button disabled={busy} onClick={onClose} className="secondary-button">Cancel</button><button disabled={busy || (pasteMode ? !pasted.trim() : !file)} onClick={process} className="primary-button disabled:opacity-40">{busy ? "Processing…" : "Process and save"}</button></div>
    </div>
  </div>;
}

function MaterialLocation({ material, onSaved }: { material: MaterialDetail; onSaved: (material: MaterialDetail) => void }) {
  const [editing, setEditing] = useState(false);
  const [sets, setSets] = useState<{ id: string; title: string }[]>([]);
  const [setId, setSetId] = useState(material.setId ?? "");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    setLoading(true);
    api<{ sets: { id: string; title: string }[] }>("/api/library").then(data => { if (!cancelled) { setSets(data.sets); setError(""); } }).catch(e => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [editing]);
  async function save() {
    setBusy(true); setError("");
    try {
      const data = await api<{ material: MaterialDetail }>(`/api/materials/${material.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ setId: setId || null }) });
      onSaved(data.material); setEditing(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not move this material."); }
    finally { setBusy(false); }
  }
  if (!editing) return <button onClick={() => setEditing(true)} className="secondary-button mt-4">Move to study set</button>;
  return <div className={`${panel} mt-4`}><label className="block text-sm">Study set<select disabled={busy || loading} className={`${inputClass} mt-2`} value={setId} onChange={e => setSetId(e.target.value)}><option value="">Unsorted materials</option>{sets.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>{error && <ErrorNotice message={error} />}<div className="mt-4 flex gap-2"><button disabled={busy || loading} className="primary-button" onClick={save}>{busy ? "Saving…" : "Save location"}</button><button disabled={busy} className="secondary-button" onClick={() => setEditing(false)}>Cancel</button></div></div>;
}

export function MaterialReader({ id, onBack }: { id: string; onBack: () => void }) {
  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"source" | "notes" | "concepts" | "study">("source");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [revealed, setRevealed] = useState<string[]>([]);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    api<{ material: MaterialDetail }>(`/api/materials/${id}`).then(data => { if (!cancelled) { setMaterial(data.material); setSelectedIds(data.material.approvedConceptIds); setError(""); } }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [id, retry]);
  useEffect(() => {
    if (focused && tab === "source") document.getElementById(focused)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focused, tab]);
  const found = useMemo(() => material ? searchChunks(material.chunks, query) : [], [material, query]);

  async function saveConcepts() {
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await api<{ material: MaterialDetail }>(`/api/materials/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approvedConceptIds: selectedIds }) });
      setMaterial(result.material); setNotice("Concept selection saved. Accepted concepts are now available in Study prompts.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save concepts."); }
    finally { setBusy(false); }
  }

  function source(chunkId: string) { setQuery(""); setFocused(chunkId); setTab("source"); }

  return <div><button onClick={onBack} className="secondary-button mb-5"><ArrowLeft className="size-4" />Back to library</button>
    {error && <><ErrorNotice message={error} />{!material && <button className="secondary-button" onClick={() => setRetry(n => n + 1)}>Retry</button>}</>}
    {!material ? !error && <p role="status">Loading source…</p> : <>
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold text-emerald-600">{material.year ? `Year ${material.year} → Semester ${material.semester} → ` : "Unfiled → "}{material.course} → {material.category} · {material.pageCount} source sections</p><h1 className="mt-2 break-all text-2xl font-semibold tracking-tight">{material.name}</h1><p className="mt-2 text-sm text-slate-500 dark:text-neutral-400">{material.chunkCount} passages · {material.approvedConceptIds.length} accepted concepts</p></div><a href={`/api/materials/${id}/original`} className="secondary-button"><Download className="size-4" />Original file</a></div>
      <MaterialLocation material={material} onSaved={setMaterial} />
      {material.warnings.map(w => <p key={w} className="mt-4 rounded-xl border border-amber-300 p-3 text-sm text-amber-800 dark:text-amber-200">{w}</p>)}
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Material view">{(["source", "notes", "concepts", "study"] as const).map(t => <button key={t} aria-pressed={tab === t} onClick={() => { setTab(t); setNotice(""); }} className={tab === t ? "primary-button" : "secondary-button"}>{t === "source" ? "Source & search" : t === "notes" ? "Study notes" : t === "concepts" ? "Review concepts" : "Study prompts"}</button>)}</div>
      {notice && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-emerald-600"><Check className="size-4" />{notice}</p>}
      {tab === "source" && <><label className="relative mt-6 block"><span className="mb-2 block text-sm">Find passages in this material</span><div className="relative"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input value={query} onChange={e => { setQuery(e.target.value); setFocused(""); }} className={`${inputClass} pl-10`} placeholder="Search words from a concept or question…" maxLength={200} /></div></label><p className="mt-2 text-xs text-slate-500 dark:text-neutral-400">Keyword search of your source text; results are quotations, not AI answers.</p>
        {query.trim() && <p role="status" className="mt-4 text-sm">{found.length ? `${found.length} matching passages` : "No matching passages. Try a word used in the original material."}</p>}
        <div className="mt-5 space-y-4">{(query.trim() ? found : material.chunks).map(chunk => <article key={chunk.id} id={chunk.id} className={`${panel} ${focused === chunk.id ? "ring-2 ring-emerald-500" : ""}`}><p className="text-xs font-semibold text-emerald-600">{chunk.locator} · Passage {chunk.id.replace("chunk-", "")}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{chunk.text}</p></article>)}</div></>}
      {tab === "notes" && <><p className="mt-5 text-sm text-slate-500 dark:text-neutral-400">Source excerpts in your chosen detail level. These retain the original wording and are not AI-written summaries.</p><div className="mt-5 space-y-4">{material.notes.map((note, i) => <article key={i} className={panel}><p className="whitespace-pre-wrap text-sm leading-7">{note.text}</p><button onClick={() => source(note.chunkId)} className="mt-3 text-xs font-semibold text-emerald-600">View {note.locator} · {note.chunkId}</button></article>)}</div></>}
      {tab === "concepts" && <div className={`${panel} mt-5`}><h2 className="text-lg font-semibold">Review extracted headings</h2><p className="mt-2 text-sm text-slate-500 dark:text-neutral-400">Headings are candidate concepts, not an AI-validated concept map. Accept only teachable ideas. No prerequisites or mastery are inferred.</p>
        {!material.concepts.length ? <p className="mt-4 text-sm">No clear headings were found. Source reading and search are available; use a structured document to propose concepts.</p> : <><div className="mt-4 flex gap-4 text-xs"><button disabled={busy} onClick={() => setSelectedIds(material.concepts.map(c => c.id))}>Select all</button><button disabled={busy} onClick={() => setSelectedIds([])}>Clear selection</button></div><div className="mt-3 divide-y divide-slate-100 dark:divide-neutral-700">{material.concepts.map(c => <div key={c.id} className="flex items-start justify-between gap-3 py-3"><label className="flex items-start gap-3 text-sm"><input type="checkbox" disabled={busy} checked={selectedIds.includes(c.id)} onChange={e => setSelectedIds(ids => e.target.checked ? [...ids, c.id] : ids.filter(x => x !== c.id))} className="mt-1 accent-emerald-600" />{c.name}</label><button onClick={() => source(c.chunkId)} className="shrink-0 text-xs text-emerald-600">{c.locator}</button></div>)}</div><button onClick={saveConcepts} disabled={busy} className="primary-button mt-4 disabled:opacity-40">{busy ? "Saving…" : `Save ${selectedIds.length} accepted concepts`}</button></>}
      </div>}
      {tab === "study" && <><p className="mt-5 text-sm text-slate-500 dark:text-neutral-400">Ungraded recall prompts from accepted concepts. Write a response before checking the source. Responses stay in this open view; this activity does not change mastery.</p>{!material.approvedConceptIds.length ? <div className={`${panel} mt-5`}><p>Accept concepts in Review concepts to create study prompts.</p><button className="secondary-button mt-4" onClick={() => setTab("concepts")}>Review concepts</button></div> : <div className="mt-5 space-y-4">{material.concepts.filter(c => material.approvedConceptIds.includes(c.id)).map(c => <article key={c.id} className={panel}><h2 className="font-semibold">Explain {c.name} in your own words.</h2><label className="mt-4 block text-sm">Your response<textarea value={draftAnswers[c.id] ?? ""} onChange={e => setDraftAnswers(a => ({ ...a, [c.id]: e.target.value }))} className={`${inputClass} mt-2 min-h-24`} /></label><button className="secondary-button mt-4" onClick={() => setRevealed(ids => ids.includes(c.id) ? ids.filter(x => x !== c.id) : [...ids, c.id])}>{revealed.includes(c.id) ? "Hide source" : "Check source"}</button>{revealed.includes(c.id) && <div className="mt-4 border-l-2 border-emerald-500 pl-4"><p className="whitespace-pre-wrap text-sm leading-7">{material.chunks.find(p => p.id === c.chunkId)?.text}</p><button className="mt-2 text-xs text-emerald-600" onClick={() => source(c.chunkId)}>View {c.locator}</button></div>}</article>)}</div>}</>}
    </>}
  </div>;
}
