import type { BankQuestion } from "@/lib/quiz-bank";

export function QuestionSourceDetails({
  question,
}: {
  question: BankQuestion;
}) {
  if (!question.optionExplanations?.length && !question.sourceRefs?.length)
    return null;
  return (
    <details className="question-source-details">
      <summary>Option explanations & sources</summary>
      {question.optionExplanations?.length ? (
        <ol type="A">
          {question.optionExplanations.map((explanation, index) => (
            <li key={index}>
              <strong>{question.answers[index]}</strong> — {explanation}
            </li>
          ))}
        </ol>
      ) : null}
      {question.sourceRefs?.length ? (
        <ul aria-label="Source references">
          {question.sourceRefs.map((source, index) => (
            <li key={index}>
              {source.file} · PDF page {source.page}
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}
