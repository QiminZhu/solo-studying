"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function LibraryDialog({ title, description, busy = false, wide = false, onClose, children }: { title: string; description?: string; busy?: boolean; wide?: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("button, input, select, textarea")?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 p-4 backdrop-blur-sm" onKeyDown={e => {
    if (e.key === "Escape" && !busy) onClose();
    if (e.key !== "Tab") return;
    const elements = ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]');
    if (!elements?.length) { e.preventDefault(); return; }
    const first = elements[0], last = elements[elements.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }}><div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} className={`mx-auto my-8 ${wide ? "max-w-6xl" : "max-w-2xl"} rounded-3xl border border-stone-200 bg-[#f8f7f1] p-6 text-stone-900 shadow-xl dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 sm:p-8`}><div className="flex items-start justify-between gap-4"><div><h2 id={titleId} className="text-2xl font-semibold">{title}</h2>{description && <p id={descriptionId} className="mt-2 text-sm text-stone-500 dark:text-neutral-400">{description}</p>}</div><button type="button" disabled={busy} aria-label="Close dialog" className="rounded-lg p-1 disabled:opacity-40" onClick={onClose}><X className="size-6" /></button></div>{children}</div></div>;
}
