"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { BookOpenIcon as BookOpen } from "@phosphor-icons/react/dist/csr/BookOpen";
import { ListIcon as Menu } from "@phosphor-icons/react/dist/csr/List";
import { XIcon as X } from "@phosphor-icons/react/dist/csr/X";

export function PlatformShell({
  children,
  active = "home",
}: {
  children: React.ReactNode;
  active?: "home" | "subjects" | "quizzes" | "runner";
}) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <div className="carbon-app">
      <a className="carbon-skip" href="#page-content">
        Skip to content
      </a>
      <header className="carbon-header">
        <nav
          aria-label="Main navigation"
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              setOpen(false);
              toggle.current?.focus();
            }
          }}
        >
          <Link className="carbon-brand" href="/">
            <BookOpen size={22} aria-hidden="true" />
            <span>
              Solo <strong>Studying</strong>
            </span>
          </Link>
          <div className={`carbon-nav-links ${open ? "is-open" : ""}`}>
            <Link
              href="/subjects"
              aria-current={
                active === "subjects" || active === "quizzes"
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              Subjects
            </Link>
            <Link href="/#how-it-works" onClick={() => setOpen(false)}>
              How it works
            </Link>
          </div>
          <div className="carbon-header-actions">
            <Link className="carbon-button primary" href="/subjects/itcs217">
              Start Practicing <ArrowRight size={16} />
            </Link>
            <button
              ref={toggle}
              className="carbon-icon-button menu-toggle"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>
      {children}
      <footer className="carbon-footer">
        <span>© {new Date().getFullYear()} Solo Studying</span>
        <div>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#your-progress">Guest access & accounts</Link>
          <Link href="/dashboard">Student space</Link>
        </div>
        <span>Curated questions. Clear explanations.</span>
      </footer>
    </div>
  );
}
