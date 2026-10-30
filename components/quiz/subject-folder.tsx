import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { FolderOpenIcon } from "@phosphor-icons/react/dist/ssr/FolderOpen";
import { PlatformShell } from "./platform-shell";
import { subjectFolder } from "@/lib/subject-quizzes";
import { lectureFolders } from "@/lib/quiz-navigation";

export function SubjectFolder() {
  return (
    <PlatformShell active="subjects">
      <main id="page-content" className="carbon-container subject-folder-page">
        <div className="page-context">
          <span>
            <Link href="/subjects">Subjects</Link> / {subjectFolder.code}
          </span>
          <span className="neutral-status">Guest access</span>
        </div>
        <div className="subject-folder-heading">
          <div>
            <p className="carbon-label">Subject folder</p>
            <h1>
              <FolderOpenIcon size={32} aria-hidden="true" />{" "}
              {subjectFolder.code}
            </h1>
            <p>{subjectFolder.name}</p>
          </div>
        </div>
        <div className="subject-folder-description">
          <p>
            Open a lecture folder to find its quizzes, continue an attempt, or
            review your results.
          </p>
        </div>
        <section aria-labelledby="lectures-heading">
          <div className="subject-quizzes-title">
            <h2 id="lectures-heading">Lectures</h2>
            <span>{lectureFolders.length} lectures</span>
          </div>
          <div className="subject-quiz-grid">
            {lectureFolders.map((folder) => (
              <Link
                key={folder.id}
                href={folder.href}
                className="subject-folder-card"
                aria-label={`Open ${folder.title}`}
              >
                <FolderOpenIcon size={32} aria-hidden="true" />
                <h3>{folder.title}</h3>
                <p>{folder.summary}</p>
                <span>
                  Open lecture folder{" "}
                  <ArrowRightIcon size={16} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </PlatformShell>
  );
}
