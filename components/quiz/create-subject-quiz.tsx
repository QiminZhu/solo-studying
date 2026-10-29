"use client";

import { useEffect, useRef, useState } from "react";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import {
  createSubjectQuiz,
  importQuizQuestions,
  originalTestQuiz,
  type SubjectQuiz,
} from "@/lib/subject-quizzes";
import type { BankQuestion } from "@/lib/quiz-bank";
import { lectureFolder } from "@/lib/quiz-navigation";
import { saveSubjectQuiz } from "@/lib/subject-quiz-store";

export function CreateSubjectQuiz({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (quiz: SubjectQuiz) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileVersion = useRef(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState<"original" | "import">("original");
  const [selected, setSelected] = useState<string[]>([]);
  const [imported, setImported] = useState<BankQuestion[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const questions =
    source === "original"
      ? originalTestQuiz.questions.filter((question) =>
          selected.includes(question.id),
        )
      : imported;

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      fileVersion.current = -1;
    };
  }, []);

  function dismiss() {
    dialog.current?.close();
    onClose();
  }

  async function readFile(file: File | undefined) {
    const version = ++fileVersion.current;
    setLoading(false);
    setImported([]);
    setFileName("");
    setError("");
    if (!file) return;
    if (file.size > 1_000_000) {
      setError("Use a JSON file smaller than 1 MB.");
      return;
    }
    setLoading(true);
    try {
      const parsed = importQuizQuestions(await file.text());
      if (version !== fileVersion.current) return;
      setImported(parsed);
      setFileName(file.name);
    } catch (cause) {
      if (version === fileVersion.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "The question file could not be read.",
        );
    } finally {
      if (version === fileVersion.current) setLoading(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="carbon-dialog create-quiz-dialog"
      aria-labelledby="create-quiz-title"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          if (!questions.length) {
            setError("Add at least one question to your quiz.");
            return;
          }
          try {
            const quiz = createSubjectQuiz(
              { title, description, questions },
              crypto.randomUUID(),
            );
            saveSubjectQuiz(quiz);
            dialog.current?.close();
            onCreated(quiz);
          } catch (cause) {
            setError(
              cause instanceof Error && cause.name !== "ZodError"
                ? cause.message
                : "The quiz could not be saved. Check the title and questions, and allow browser storage.",
            );
          }
        }}
      >
        <p className="carbon-label">ITCS217 / Lecture 9 / New quiz</p>
        <h2 id="create-quiz-title">Create a quiz</h2>
        <p>
          Name your quiz and add questions. It will be saved in this browser’s
          Lecture 9 folder.
        </p>
        <label className="carbon-field">
          <span>Quiz name</span>
          <input
            autoFocus
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Data link layer review"
          />
        </label>
        <label className="carbon-field">
          <span>Description (optional)</span>
          <textarea
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
          />
        </label>
        <fieldset className="quiz-source-options">
          <legend>Question source</legend>
          {(
            [
              ["original", "Original ITCS217 questions"],
              ["import", "Import JSON"],
            ] as const
          ).map(([value, label]) => (
            <label className="check-row" key={value}>
              <input
                type="radio"
                name="question-source"
                value={value}
                checked={source === value}
                onChange={() => {
                  setSource(value);
                  setError("");
                }}
              />
              {label}
            </label>
          ))}
        </fieldset>
        {source === "original" ? (
          <fieldset className="quiz-question-picker">
            <legend>Original questions · {selected.length} selected</legend>
            <label className="check-row">
              <input
                type="checkbox"
                checked={selected.length === originalTestQuiz.questions.length}
                onChange={(event) =>
                  setSelected(
                    event.target.checked
                      ? originalTestQuiz.questions.map(
                          (question) => question.id,
                        )
                      : [],
                  )
                }
              />
              Select all 30 questions
            </label>
            <div className="quiz-question-options">
              {originalTestQuiz.questions.map((question, index) => (
                <label className="check-row" key={question.id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(question.id)}
                    onChange={(event) =>
                      setSelected((current) =>
                        event.target.checked
                          ? [...current, question.id]
                          : current.filter((id) => id !== question.id),
                      )
                    }
                  />
                  <span>
                    <strong>
                      {index + 1}. {question.prompt}
                    </strong>
                    <small>
                      {question.type === "single"
                        ? "Multiple choice"
                        : question.type === "multiple"
                          ? "Multiple answer"
                          : "True / false"}{" "}
                      · {question.difficulty}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className="quiz-import">
            <label className="carbon-field">
              <span>
                <UploadSimpleIcon size={16} aria-hidden="true" /> Question JSON
                file
              </span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(event) => void readFile(event.target.files?.[0])}
                aria-describedby="quiz-import-help"
              />
            </label>
            <p id="quiz-import-help">
              Import an array of questions, or an object containing a questions
              array. Maximum 250 questions, 200 per type, and 1 MB.
            </p>
            <p>
              For matching, ordering, or fill-in-the-blank banks, use the{" "}
              <a href={lectureFolder.href}>six-format author importer</a>. This
              legacy importer keeps existing choice quizzes compatible.
            </p>
            <a href="/quiz-question-template.json" download>
              Download the question JSON example
            </a>
            <p role="status">
              {loading
                ? "Reading questions…"
                : fileName
                  ? `${fileName} · ${imported.length} questions ready`
                  : "No file imported."}
            </p>
          </div>
        )}
        <p className="carbon-helper">
          Quizzes use untimed Practice. Topic, mode, and question-type
          configuration are on hold. Imported answers are used as supplied;
          importing does not independently verify them.
        </p>
        {error && (
          <p className="carbon-error" role="alert">
            {error}
          </p>
        )}
        <div className="subject-quiz-form-actions">
          <button
            type="button"
            className="carbon-button secondary"
            onClick={dismiss}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="carbon-button primary"
            disabled={loading || !title.trim()}
          >
            Create quiz <PlusIcon size={16} aria-hidden="true" />
          </button>
        </div>
      </form>
    </dialog>
  );
}
