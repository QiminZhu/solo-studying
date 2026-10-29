"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { MagnifyingGlassIcon as Search } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { XIcon as X } from "@phosphor-icons/react/dist/csr/X";
import { originalTestQuiz, subjectFolder } from "@/lib/subject-quizzes";
const subjectLibrary = [
  {
    name: subjectFolder.code,
    category: "Technology",
    description: subjectFolder.name,
    topics: [
      ...new Set(
        originalTestQuiz.questions.map((question) =>
          question.topic.replace(/^Lecture 9 · /, ""),
        ),
      ),
    ].slice(0, 4),
  },
];

export function SubjectExplorer() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All subjects");
  const filtered = subjectLibrary.filter(
    (subject) =>
      (category === "All subjects" || category === subject.category) &&
      `${subject.name} ${subject.topics.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <section
      className="carbon-landing-section"
      id="subjects"
      aria-labelledby="subjects-heading"
    >
      <div className="section-title-row">
        <div>
          <p className="carbon-label">Subject library</p>
          <h2 id="subjects-heading">Find your starting point.</h2>
          <p>Open a subject folder to find your quizzes or create a new one.</p>
        </div>
        <label className="carbon-search">
          <Search size={18} />
          <span className="sr-only">Search subjects or topics</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search subjects or topics"
          />
          {search && (
            <button
              aria-label="Clear search"
              className="carbon-icon-button"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </button>
          )}
        </label>
      </div>
      <div className="library-filters" aria-label="Filter subjects">
        {["All subjects", "Technology"].map((name) => (
          <button
            key={name}
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="carbon-subject-grid" aria-live="polite">
        {filtered.length ? (
          filtered.map((subject) => (
            <article key={subject.name}>
              <div className="subject-card-meta">
                <span>{subject.category}</span>
                <span>{originalTestQuiz.questions.length} questions</span>
              </div>
              <h3>{subject.name}</h3>
              <p>{subject.description}</p>
              <ul>
                {subject.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
              <Link href={subjectFolder.href} className="carbon-text-link">
                Open {subject.name} <ArrowRight size={16} />
              </Link>
            </article>
          ))
        ) : (
          <div className="library-empty">
            <h3>No matching subjects.</h3>
            <p>Try another subject or topic.</p>
            <button
              className="carbon-button ghost"
              onClick={() => {
                setSearch("");
                setCategory("All subjects");
              }}
            >
              Clear filters <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
      <p className="carbon-helper">
        Original test questions · Multiple choice, multiple answer, and
        true/false · No registration required
      </p>
    </section>
  );
}
