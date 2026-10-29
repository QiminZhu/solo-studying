import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpenIcon } from "@phosphor-icons/react/dist/ssr/FolderOpen";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { PlatformShell } from "@/components/quiz/platform-shell";
import { subjectFolder } from "@/lib/subject-quizzes";

export const metadata: Metadata = {
  title: "Subjects — Solo Studying",
  description: "Open a subject folder to create and practice quizzes.",
};

export default function SubjectsPage() {
  return (
    <PlatformShell active="subjects">
      <main id="page-content" className="carbon-container subject-folder-page">
        <p className="carbon-label">Quiz library</p>
        <h1>Subject folders</h1>
        <p className="subject-folder-intro">
          Open a subject, choose a lecture, then select a quiz.
        </p>
        <div className="subject-quiz-grid">
          <Link className="subject-folder-card" href={subjectFolder.href}>
            <FolderOpenIcon size={32} aria-hidden="true" />
            <h2>{subjectFolder.code}</h2>
            <p>{subjectFolder.name}</p>
            <span>
              Open subject folder{" "}
              <ArrowRightIcon size={16} aria-hidden="true" />
            </span>
          </Link>
        </div>
        <p className="carbon-helper subject-folder-intro">
          Guest access · Quizzes saved in this browser · No account required
        </p>
      </main>
    </PlatformShell>
  );
}
