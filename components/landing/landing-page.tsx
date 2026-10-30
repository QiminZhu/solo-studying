import Link from "next/link";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { CheckIcon as Check } from "@phosphor-icons/react/dist/ssr/Check";
import { PlatformShell } from "@/components/quiz/platform-shell";
import { QuestionPreview } from "./question-preview";
import { SubjectExplorer } from "./subject-explorer";
import { sampleTopicResults } from "@/lib/landing-data";
import { originalTestQuiz, subjectFolder } from "@/lib/subject-quizzes";
import { LandingPrototype } from "./prototype/landing-variants";
import { LandingPrototypeSwitcher } from "./prototype/prototype-switcher";
import type { LandingPrototypeView } from "./prototype/prototype-types";

export function LandingPage({
  prototypeVariant,
}: {
  prototypeVariant?: LandingPrototypeView;
}) {
  return (
    <PlatformShell>
      <main id="page-content" className="carbon-container carbon-landing">
        <section className="carbon-landing-intro">
          <div>
            <p className="carbon-label">Student quiz & examination platform</p>
            <h1>
              Understand the subject.
              <br />
              Prepare with confidence.
            </h1>
            <p>
              Keep quizzes in subject folders, practice original questions, and
              learn from every answer. Start with ITCS217 as a guest.
            </p>
            <div className="landing-actions">
              <Link className="carbon-button primary" href={subjectFolder.href}>
                Start Practicing <ArrowRight size={16} />
              </Link>
              <a className="carbon-button secondary" href="#subjects">
                Explore Subjects <ArrowRight size={16} />
              </a>
            </div>
            <p className="guest-caption">
              <Check size={16} /> No account required to start practicing.
            </p>
          </div>
          <div className="landing-session-card">
            <p className="carbon-label">Choose how you learn</p>
            <Link href={subjectFolder.href}>
              <span>
                <strong>Practice Mode</strong>
                <small>Immediate feedback. Detailed explanations.</small>
              </span>
              <ArrowRight size={20} />
            </Link>
            <Link href={subjectFolder.href}>
              <span>
                <strong>Create a quiz</strong>
                <small>Add original questions or import a JSON file.</small>
              </span>
              <ArrowRight size={20} />
            </Link>
            <div>
              {originalTestQuiz.questions.length} original ITCS217 questions
              available as a test quiz.
            </div>
          </div>
        </section>
        {prototypeVariant && prototypeVariant !== "original" ? (
          <LandingPrototype variant={prototypeVariant} />
        ) : (
          <>
            <div className="landing-principles">
              <div>
                <strong>A curated question bank</strong>
                <p>
                  Predefined questions with checked answers and explanations.
                </p>
              </div>
              <div>
                <strong>Your pace, your settings</strong>
                <p>Choose a saved quiz and work through it at your own pace.</p>
              </div>
              <div>
                <strong>Learning without barriers</strong>
                <p>Browse, practice, and review results as a guest.</p>
              </div>
            </div>
            <SubjectExplorer />
            <section className="carbon-landing-section" id="how-it-works">
              <div className="section-title-row">
                <div>
                  <p className="carbon-label">Practice & preparation</p>
                  <h2>Practice now. More modes later.</h2>
                  <p>Build understanding, then assess what you know.</p>
                </div>
              </div>
              <div className="carbon-mode-grid">
                <article>
                  <h3>Practice Mode</h3>
                  <p>
                    Open a saved quiz. Check each answer when you’re ready and
                    use the explanation to understand the reasoning.
                  </p>
                  <ul>
                    <li>Saved quizzes inside subject folders</li>
                    <li>Feedback after checking each answer</li>
                    <li>Review correct answers and mistakes</li>
                  </ul>
                  <Link className="carbon-text-link" href={subjectFolder.href}>
                    Set up practice <ArrowRight size={16} />
                  </Link>
                </article>
                <article>
                  <h3>Exam Mode · On hold</h3>
                  <p>
                    Custom quiz setup and exam configuration are on hold for
                    this MVP. The current experience uses saved quizzes with
                    Practice feedback.
                  </p>
                  <ul>
                    <li>Planned: question count and optional timer</li>
                    <li>Planned: evaluation after submission</li>
                    <li>Score, explanations, and a topic breakdown</li>
                  </ul>
                  <Link className="carbon-text-link" href={subjectFolder.href}>
                    Browse available quizzes <ArrowRight size={16} />
                  </Link>
                </article>
              </div>
            </section>
            <section
              className="carbon-landing-section demo-section"
              aria-labelledby="demo-heading"
            >
              <div className="section-title-row">
                <div>
                  <p className="carbon-label">Interactive preview</p>
                  <h2 id="demo-heading">
                    Try a question. Understand the answer.
                  </h2>
                  <p>Three sample Biology questions. No setup needed.</p>
                </div>
                <Link className="carbon-text-link" href={subjectFolder.href}>
                  Create your own quiz <ArrowRight size={16} />
                </Link>
              </div>
              <QuestionPreview />
            </section>
            <section
              className="carbon-landing-section landing-insights"
              id="insights"
            >
              <div>
                <p className="carbon-label">Results & explanations</p>
                <h2>A score is the starting point.</h2>
                <p>
                  See every correct, incorrect, and unanswered response.
                  Explanations and topic-level results help you decide what to
                  revisit.
                </p>
                <Link className="carbon-text-link" href={subjectFolder.href}>
                  Open ITCS217 quizzes <ArrowRight size={16} />
                </Link>
              </div>
              <div className="landing-result-sample">
                <div className="result-sample-heading">
                  <h3>Biology results</h3>
                  <span className="neutral-status">Illustrative results</span>
                </div>
                <div className="sample-score">
                  <strong>80%</strong>
                  <span>16 correct out of 20 questions</span>
                </div>
                <table className="carbon-table">
                  <caption className="sr-only">
                    Illustrative Biology topic results
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Topic</th>
                      <th scope="col">Correct / total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleTopicResults.map((item) => (
                      <tr key={item.topic}>
                        <th scope="row">{item.topic}</th>
                        <td>
                          {item.correct} / {item.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section
              className="carbon-landing-section landing-account"
              id="your-progress"
            >
              <div>
                <p className="carbon-label">Guest access & student accounts</p>
                <h2>Start learning. Save progress when you’re ready.</h2>
                <p>
                  Guest quizzes are saved in this browser and do not
                  synchronize across devices. Optional accounts are the next
                  step for persistent quiz history, saved results, topic
                  progress, and revisiting missed questions.
                </p>
                <p className="carbon-helper">
                  Account progress features are planned. The existing student
                  workspace remains accessible separately.
                </p>
              </div>
              <Link href="/dashboard" className="carbon-button secondary">
                Open student space <ArrowRight size={16} />
              </Link>
            </section>
            <section className="landing-final">
              <div>
                <h2>Your next step starts with a question.</h2>
                <p>
                  Choose a subject and build a practice session. No registration
                  required.
                </p>
              </div>
              <Link href={subjectFolder.href} className="carbon-button primary">
                Start Practicing <ArrowRight size={16} />
              </Link>
            </section>
          </>
        )}
        {prototypeVariant && (
          <LandingPrototypeSwitcher current={prototypeVariant} />
        )}
      </main>
    </PlatformShell>
  );
}
