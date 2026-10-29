"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Check, FileText, ImagePlus, LoaderCircle, LockKeyhole, MoreHorizontal, Plus, Search, Settings, Trash2 } from "lucide-react";
import { StudySetPage } from "@/components/study-set-page";
import { LibraryDialog } from "@/components/library-dialog";
import { MaterialReader, MaterialUploadDialog } from "@/components/materials-workspace";
import type { MaterialRecord } from "@/lib/material-processing";

export type StudySet = { id: string; title: string; description: string; color: string; hasCover: boolean; createdAt: string; updatedAt: string; lastAccessedAt: string | null };
type Library = { sets: StudySet[]; materials: MaterialRecord[] };
const field = "mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-neutral-600 dark:bg-neutral-900 dark:focus:ring-emerald-950";
const button = "inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-medium transition hover:bg-stone-50 disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700";
const primary = "inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200";
const card = "rounded-3xl border border-stone-200 bg-white dark:border-neutral-700 dark:bg-neutral-800";
const muted = "text-stone-500 dark:text-neutral-400";
const colors: Record<string, string> = { mint: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200", lavender: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200", peach: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200", sky: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200" };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const data = await response.json().catch(() => ({ error: "The request was interrupted. Please retry." })) as { error?: string };
  if (!response.ok) throw new Error(data.error || "Could not save your changes. Please retry.");
  return data as T;
}
function json(method: string, body: unknown): RequestInit { return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }; }
function ErrorMessage({ text }: { text: string }) { return text ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{text}</p> : null; }
function SetCover({ set, large = false }: { set: StudySet; large?: boolean }) {
  const size = large ? "size-24" : "size-16";
  // Authenticated cover URLs intentionally use the browser's same-origin image request.
  return <div className={`${size} ${colors[set.color] || colors.mint} flex shrink-0 items-center justify-center overflow-hidden rounded-2xl`}>{set.hasCover ? <img src={`/api/study-sets/${set.id}/cover?v=${encodeURIComponent(set.updatedAt)}`} alt="" className="size-full object-cover" /> : <BookOpen strokeWidth={1.4} className={large ? "size-12" : "size-8"} />}</div>;
}

function SetEditor({ set, onClose, onSaved }: { set?: StudySet; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(set?.title ?? "");
  const [description, setDescription] = useState(set?.description ?? "");
  const [color, setColor] = useState(set?.color ?? "mint");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [tab, setTab] = useState<"general" | "delete">("general");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const savedId = useRef(set?.id ?? "");
  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  async function save() {
    setBusy(true); setError("");
    try {
      const body = { title, description, color };
      const data = await request<{ set: StudySet }>(savedId.current ? `/api/study-sets/${savedId.current}` : "/api/study-sets", json(savedId.current ? "PATCH" : "POST", body));
      savedId.current = data.set.id;
      if (image) {
        try { await request(`/api/study-sets/${data.set.id}/cover`, { method: "PUT", body: image, headers: { "Content-Type": image.type } }); }
        catch (e) { throw new Error(`Study set saved. Cover image failed: ${e instanceof Error ? e.message : "Please retry."}`); }
      }
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save study set."); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!set || !confirmed) return;
    setBusy(true); setError("");
    try { await request(`/api/study-sets/${set.id}`, { method: "DELETE" }); onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete study set."); }
    finally { setBusy(false); }
  }
  return <LibraryDialog title={set ? "Edit Study Set" : "Create Study Set"} description={set ? "Update the basics and keep your materials organized." : "A focused space for a lecture, project, or anything you want to learn."} busy={busy} onClose={onClose}>
    {set && <div className="mt-6 flex gap-3 border-b border-stone-200 pb-5 dark:border-neutral-600"><button disabled={busy} onClick={() => setTab("general")} aria-pressed={tab === "general"} className={`${button} ${tab === "general" ? "bg-stone-100 dark:bg-neutral-700" : ""}`}><Settings className="size-4" />General</button><button disabled={busy} onClick={() => setTab("delete")} aria-pressed={tab === "delete"} className={`${button} text-red-600`}><Trash2 className="size-4" />Delete</button></div>}
    {tab === "general" ? <form onSubmit={e => { e.preventDefault(); if (!busy) void save(); }}>
      <label className="mt-6 block text-sm font-medium">Cover image</label><div className="mt-3 flex items-center gap-4"><div className={`flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${colors[color]}`}>{preview ? <img src={preview} alt="Cover preview" className="size-full object-cover" /> : set?.hasCover ? <SetCover set={{ ...set, color }} large /> : <BookOpen className="size-12" strokeWidth={1.4} />}</div><label className={`${button} cursor-pointer`}><ImagePlus className="size-4" />Upload image<input type="file" className="sr-only" accept="image/png,image/jpeg,image/gif" disabled={busy} onChange={e => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 5 * 1024 * 1024 || !["image/png", "image/jpeg", "image/gif"].includes(f.type)) { setError("Choose a PNG, JPG, or GIF up to 5 MB."); return; } setImage(f); setError(""); }} /></label></div><p className={`mt-2 text-xs ${muted}`}>PNG, JPG, or GIF. 5 MB max.</p>
      <div className="mt-4 flex gap-2" role="group" aria-label="Cover color">{Object.keys(colors).map(c => <button key={c} type="button" aria-label={c} aria-pressed={color === c} disabled={busy} onClick={() => setColor(c)} className={`grid size-9 place-items-center rounded-full ${colors[c]} ${color === c ? "ring-2 ring-stone-400 ring-offset-2 dark:ring-offset-neutral-800" : ""}`}>{color === c && <Check className="size-4" />}</button>)}</div>
      <label className="mt-6 block text-sm font-medium">Title<input required autoComplete="off" disabled={busy} value={title} onChange={e => setTitle(e.target.value)} maxLength={120} className={field} placeholder="e.g. Lecture 9" /></label>
      <label className="mt-5 block text-sm font-medium">Description<textarea disabled={busy} value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} rows={4} className={field} placeholder="What will you learn in this study set?" /></label>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-stone-200 p-4 text-sm dark:border-neutral-600"><LockKeyhole className="size-4" /><span>Private · Only you have access</span></div>
      <ErrorMessage text={error} /><div className="mt-7 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className={button}>Cancel</button><button disabled={busy || !title.trim()} className={primary}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : null}{busy ? "Saving…" : set ? "Save Changes" : "Create Study Set"}</button></div>
    </form> : <div className="mt-6"><h3 className="text-lg font-semibold">Delete “{set?.title}”?</h3><p className={`mt-3 text-sm leading-6 ${muted}`}>The study set will be removed. Its uploaded materials and accepted concepts are kept under Unsorted materials.</p><label className="mt-5 flex items-center gap-3 text-sm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />I want to delete this study set.</label><ErrorMessage text={error} /><div className="mt-6 flex justify-end gap-2"><button className={button} disabled={busy} onClick={onClose}>Cancel</button><button disabled={busy || !confirmed} onClick={remove} className="rounded-full bg-red-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-40">{busy ? "Deleting…" : "Delete Study Set"}</button></div></div>}
  </LibraryDialog>;
}

export function StudyLibrary() {
  const [data, setData] = useState<Library>({ sets: [], materials: [] });
  const [setId, setSetId] = useState<string | null>(null);
  const [materialId, setMaterialId] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("accessed");
  const [materialsView, setMaterialsView] = useState(false);
  const [unsortedOnly, setUnsortedOnly] = useState(false);
  const [setEditor, setSetEditor] = useState<StudySet | "new" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [addingExisting, setAddingExisting] = useState(false);
  const [busyMaterial, setBusyMaterial] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const activeSet = data.sets.find(s => s.id === setId);
  const unsorted = data.materials.filter(m => !m.setId);
  useEffect(() => {
    let cancelled = false;
    request<Library>("/api/library").then(result => { if (!cancelled) { setData(result); setSetId(current => current && result.sets.some(s => s.id === current) ? current : null); setError(""); } }).catch(e => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reload]);
  const refresh = () => { setReload(n => n + 1); };
  const saved = () => { setSetEditor(null); refresh(); };
  async function openSet(set: StudySet) {
    setSetId(set.id); setMaterialsView(false); setQuery(""); setError("");
    try { const result = await request<{ set: StudySet }>(`/api/study-sets/${set.id}`, json("PATCH", { accessed: true })); setData(current => ({ ...current, sets: current.sets.map(s => s.id === set.id ? result.set : s) })); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not update last accessed time."); }
  }
  async function addMaterial(id: string) {
    if (!activeSet || busyMaterial) return;
    setBusyMaterial(id); setError("");
    try {
      const result = await request<{ material: MaterialRecord }>(`/api/materials/${id}`, json("PATCH", { setId: activeSet.id }));
      setData(current => ({ ...current, materials: current.materials.map(m => m.id === id ? result.material : m) })); refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not move material."); }
    finally { setBusyMaterial(""); }
  }
  const match = (s: string) => s.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  const shownSets = data.sets.filter(s => match(`${s.title} ${s.description}`)).sort((a,b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "newest" ? b.createdAt.localeCompare(a.createdAt) : (b.lastAccessedAt ?? b.createdAt).localeCompare(a.lastAccessedAt ?? a.createdAt));
  const shownMaterials = data.materials.filter(m => (!unsortedOnly || !m.setId) && match(m.name));
  if (materialId) return <MaterialReader id={materialId} key={materialId} onBack={() => { setMaterialId(""); refresh(); }} />;
  return <div className="rounded-3xl bg-[#f8f7f1] p-4 text-stone-900 dark:bg-neutral-900 dark:text-neutral-100 sm:p-6 lg:p-8">
    {activeSet ? <StudySetPage key={activeSet.id} studySet={activeSet} materials={data.materials.filter(m => m.setId === activeSet.id)} revision={reload} onBack={() => { setSetId(null); refresh(); }} onEdit={() => setSetEditor(activeSet)} onUpload={() => setUploading(true)} onAddExisting={() => setAddingExisting(true)} onOpenMaterial={setMaterialId} /> : <>
      <p className="text-xs font-medium uppercase tracking-widest text-purple-700 dark:text-purple-300">Your study space</p><h1 className="mt-2 font-serif text-4xl tracking-tight">{materialsView ? unsortedOnly ? "Unsorted materials" : "Your materials" : "Study Sets"}</h1><p className={`mt-3 text-sm ${muted}`}>Create a study set, add your sources, and build your learning path.</p>
      <div className="mt-7 flex flex-wrap items-center gap-3"><label className="relative min-w-48 flex-1"><Search className={`absolute left-4 top-4 size-5 ${muted}`} /><input aria-label={materialsView ? "Search materials" : "Search study sets"} placeholder={materialsView ? "Search materials…" : "Search study sets…"} value={query} onChange={e => setQuery(e.target.value)} className={`${field} !mt-0 !py-3.5 !pl-12`} /></label><label><span className="sr-only">Sort study sets</span><select value={sort} onChange={e => setSort(e.target.value)} className={button}><option value="accessed">Last Accessed</option><option value="newest">Newest First</option><option value="title">Title A–Z</option></select></label><button className={button} onClick={() => { setMaterialsView(v => !v); setUnsortedOnly(false); setQuery(""); }}><FileText className="size-4" />{materialsView ? "Study Sets" : "Materials"}</button><button className={primary} onClick={() => setSetEditor("new")}><Plus className="size-5" />Create Study Set</button></div>
      <ErrorMessage text={error} />{error && <button className={`${button} mt-3`} onClick={() => { setLoading(true); refresh(); }}>Retry loading</button>}
      {loading ? <p role="status" className={`mt-10 text-sm ${muted}`}>Loading your study sets…</p> : materialsView ? <div className="mt-6 space-y-3">{!shownMaterials.length && <p className={`py-10 text-center text-sm ${muted}`}>No materials here yet. Open a study set to upload a source.</p>}{shownMaterials.map(m => <button key={m.id} onClick={() => setMaterialId(m.id)} className={`${card} flex w-full items-center gap-4 p-5 text-left`}><FileText className="size-5 shrink-0" /><div className="min-w-0 flex-1"><h2 className="break-words text-sm font-semibold">{m.name}</h2><p className={`mt-1 text-xs ${muted}`}>{m.setId ? data.sets.find(s => s.id === m.setId)?.title : "Unsorted"} · {m.pageCount} source sections</p></div><ArrowRight className="size-4 shrink-0" /></button>)}</div> : <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><button onClick={() => setSetEditor("new")} className="flex min-h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-300 px-6 py-8 text-center hover:border-purple-400 dark:border-neutral-600"><span className="grid size-14 place-items-center rounded-full bg-stone-200/60 dark:bg-neutral-800"><Plus className="size-7" strokeWidth={1.2} /></span><h2 className="mt-5 text-lg font-semibold">Create Study Set</h2><p className={`mt-3 text-sm leading-6 ${muted}`}>One space for your materials, topics, and study plan.</p></button>{shownSets.map(s => {
        const materials = data.materials.filter(m => m.setId === s.id);
        return <div key={s.id} className={`${card} relative min-h-64`}><button aria-label={`Edit study set ${s.title}`} onClick={() => setSetEditor(s)} className={`absolute right-4 top-4 rounded-lg p-2 ${muted}`}><MoreHorizontal className="size-5" /></button><button onClick={() => void openSet(s)} className="flex size-full min-h-64 flex-col p-6 text-left"><div className="flex w-full items-center gap-4 pr-5"><SetCover set={s} /><h2 className="min-w-0 break-words text-lg font-semibold">{s.title}</h2></div><p className={`mt-5 text-xs ${muted}`}>{materials.length} materials</p><p className={`mt-4 line-clamp-2 text-sm leading-6 ${muted}`}>{s.description || "Open your study plan and explore your topics."}</p><p className={`mt-auto flex w-full items-center justify-between gap-2 pt-5 text-xs ${muted}`}><span>{s.lastAccessedAt ? `Opened ${new Date(s.lastAccessedAt).toLocaleDateString()}` : "Not opened yet"}</span><ArrowRight className="size-4" /></p></button></div>;
      })}</div>}
      {!materialsView && !loading && query && !shownSets.length && <p role="status" className={`mt-5 text-sm ${muted}`}>No study sets match “{query}”.</p>}
      {!materialsView && unsorted.length > 0 && <div className={`${card} mt-7 flex flex-wrap items-center justify-between gap-3 p-5`}><div><h2 className="font-semibold">Unsorted materials</h2><p className={`mt-1 text-sm ${muted}`}>{unsorted.length} existing sources ready to add to a study set.</p></div><button className={button} onClick={() => { setMaterialsView(true); setUnsortedOnly(true); setQuery(""); }}>Browse materials<ArrowRight className="size-4" /></button></div>}
    </>}
    {setEditor && <SetEditor set={setEditor === "new" ? undefined : setEditor} onClose={() => { setSetEditor(null); refresh(); }} onSaved={saved} />}
    {uploading && activeSet && <MaterialUploadDialog studySet={activeSet} onClose={() => setUploading(false)} onSaved={() => { setUploading(false); refresh(); }} />}
    {addingExisting && activeSet && <LibraryDialog title="Add existing materials" description={`Move unsorted materials into ${activeSet.title}.`} busy={!!busyMaterial} onClose={() => setAddingExisting(false)}><ErrorMessage text={error} /><div className="mt-5 max-h-80 space-y-2 overflow-y-auto">{!unsorted.length ? <p className={`text-sm ${muted}`}>No unsorted materials remain. Use Upload material to add a new source.</p> : unsorted.map(m => <div key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-neutral-600 dark:bg-neutral-900"><span className="min-w-0 break-words text-sm">{m.name}</span><button disabled={!!busyMaterial} className={button} onClick={() => void addMaterial(m.id)}>{busyMaterial === m.id ? "Moving…" : "Add"}</button></div>)}</div><div className="mt-6 flex justify-end"><button className={primary} disabled={!!busyMaterial} onClick={() => setAddingExisting(false)}>Done</button></div></LibraryDialog>}
  </div>;
}
