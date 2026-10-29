import type { BankQuestionV3 } from "@/lib/quiz-v3/contract";
import { gradeQuestion, type Response } from "@/lib/quiz-v3/grading";

/** Mount only after the attempt's reveal gate has passed. */
export function QuestionFeedback({
  question,
  response,
}: {
  question: BankQuestionV3;
  response?: Response;
}) {
  const grade = gradeQuestion(question, response);
  return (
    <section className="v3-feedback" aria-label="Answer feedback">
      <p className={grade.score ? "v3-correct" : "v3-incorrect"}>
        <strong>
          {grade.unanswered
            ? "Unanswered or incomplete"
            : grade.score
              ? "Correct"
              : "Incorrect"}{" "}
          · {grade.score} / 1 point
        </strong>
      </p>
      <p>
        <strong>Overall explanation:</strong> {question.explanation}
      </p>
      <p className="carbon-helper">
        Every response part is shown below. Parts are diagnostic; this question
        is worth one point.
      </p>
      <ul className="v3-part-list">
        {grade.parts.map((part) => (
          <li key={part.id} className={`v3-part ${part.status}`}>
            <strong>
              {part.label} ·{" "}
              {part.status === "correct"
                ? "Correct"
                : part.status === "incorrect"
                  ? "Incorrect"
                  : "Unanswered"}
            </strong>
            <p>Your response: {part.submitted}</p>
            <p>Answer key: {part.expected}</p>
            <p>{part.explanation}</p>
          </li>
        ))}
      </ul>
      <div className="v3-sources">
        <strong>
          {question.tags?.includes("software-fixture")
            ? "Fixture references (not lecture content)"
            : "Source references"}
        </strong>
        <ul>
          {question.sourceRefs.map((ref, i) => (
            <li key={i}>
              {ref.file === "quiz-fixture-source.html" ? (
                <a
                  href="/quiz-fixture-source.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  Fixture specification
                </a>
              ) : (
                ref.file
              )}
              {ref.page ? ` · page ${ref.page}` : " · page not supplied"}
            </li>
          ))}
        </ul>
        <p className="carbon-helper">
          Objective: {question.objectiveId} · Question version{" "}
          {question.version} ·{" "}
          {question.status === "approved"
            ? "Approved version"
            : "Not approved lecture content"}
        </p>
      </div>
    </section>
  );
}
