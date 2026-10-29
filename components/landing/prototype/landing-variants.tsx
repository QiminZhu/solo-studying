"use client";

// Three below-hero layouts on the existing / route, switchable via ?variant=A|B|C.
import Link from "next/link";
import { useState } from "react";
import type { Icon } from "@phosphor-icons/react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { CalculatorIcon } from "@phosphor-icons/react/dist/csr/Calculator";
import { DnaIcon } from "@phosphor-icons/react/dist/csr/Dna";
import { AtomIcon } from "@phosphor-icons/react/dist/csr/Atom";
import { CodeIcon } from "@phosphor-icons/react/dist/csr/Code";
import { FlaskIcon } from "@phosphor-icons/react/dist/csr/Flask";
import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen";
import { BookBookmarkIcon } from "@phosphor-icons/react/dist/csr/BookBookmark";
import { TimerIcon } from "@phosphor-icons/react/dist/csr/Timer";
import { TargetIcon } from "@phosphor-icons/react/dist/csr/Target";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";
import { subjectLibrary, sampleTopicResults } from "@/lib/landing-data";
import { questionBank, questionTypes } from "@/lib/quiz-bank";
import { QuestionPreview } from "../question-preview";
import type { LandingVariant } from "./prototype-types";

const subjectIcons: Record<string, Icon> = {
  Mathematics: CalculatorIcon,
  Biology: DnaIcon,
  Physics: AtomIcon,
  "Computer Science": CodeIcon,
  Chemistry: FlaskIcon,
  English: BookOpenIcon,
};
const subjectCount = (name: string) =>
  questionBank.filter((question) => question.subject === name).length;
const featuredQuestionCount = subjectLibrary.reduce(
  (total, subject) => total + subjectCount(subject.name),
  0,
);
const quizPath = (subject: string, mode = "practice") =>
  `/create-quiz?subject=${encodeURIComponent(subject)}&mode=${mode}`;
const resultTotal = sampleTopicResults.reduce(
  (total, result) => total + result.total,
  0,
);
const resultCorrect = sampleTopicResults.reduce(
  (total, result) => total + result.correct,
  0,
);

function SubjectMark({ name, size = 25 }: { name: string; size?: number }) {
  const SubjectIcon = subjectIcons[name];
  return <SubjectIcon size={size} weight="regular" aria-hidden="true" />;
}
function PrototypeLabel({ children }: { children: React.ReactNode }) {
  return <p className="proto-eyebrow">{children}</p>;
}
function QuizPreview({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="proto-demo" aria-labelledby="proto-demo-title">
      <div className="proto-section-title">
        <div>
          <PrototypeLabel>See it in action</PrototypeLabel>
          <h2 id="proto-demo-title">{title}</h2>
          <p>{description}</p>
        </div>
        <Link href="/create-quiz" className="proto-link">
          Build your own session{" "}
          <ArrowUpRightIcon size={18} weight="regular" aria-hidden="true" />
        </Link>
      </div>
      <QuestionPreview />
    </section>
  );
}
function TopicResults({
  presentation = "table",
}: {
  presentation?: "table" | "bars";
}) {
  return (
    <div className={`proto-results proto-results-${presentation}`}>
      <div className="proto-results-heading">
        <span>
          <ChartBarIcon size={19} weight="regular" aria-hidden="true" /> Biology
          results
        </span>
        <small>Illustrative results</small>
      </div>
      <div className="proto-score">
        <strong>
          {Math.round((resultCorrect / resultTotal) * 100)}
          <span>%</span>
        </strong>
        <div>
          <b>
            {resultCorrect} of {resultTotal} correct
          </b>
          <span>A foundation to build on.</span>
        </div>
      </div>
      {presentation === "table" ? (
        <table>
          <caption className="sr-only">
            Illustrative Biology topic performance
          </caption>
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Correct / total</th>
            </tr>
          </thead>
          <tbody>
            {sampleTopicResults.map((result) => (
              <tr key={result.topic}>
                <th scope="row">{result.topic}</th>
                <td>
                  {result.correct} / {result.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="proto-topic-bars">
          {sampleTopicResults.map((result) => (
            <div key={result.topic}>
              <div>
                <span>{result.topic}</span>
                <strong>
                  {result.correct} / {result.total}
                </strong>
              </div>
              <progress
                max={result.total}
                value={result.correct}
                aria-label={`${result.topic}: ${result.correct} of ${result.total} correct`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function AccountCopy() {
  return (
    <>
      <PrototypeLabel>Progress on your terms</PrototypeLabel>
      <h2>
        Begin as a guest.
        <br />
        Make room for what’s next.
      </h2>
      <p>
        Your current quiz stays in this browser tab. Optional accounts are the
        future home for quiz history, saved results, and topic progress.
      </p>
      <span className="proto-caption">
        Account progress features are planned. The existing student workspace is
        available separately.
      </span>
    </>
  );
}
function ClosingAction() {
  return (
    <section className="proto-closing">
      <div>
        <h2>One question is a good place to start.</h2>
        <p>
          No registration. A curated question bank. A little more understanding.
        </p>
      </div>
      <Link href="/create-quiz" className="carbon-button primary">
        Start Practicing{" "}
        <ArrowRightIcon size={18} weight="regular" aria-hidden="true" />
      </Link>
    </section>
  );
}

export function VariantA() {
  const [search, setSearch] = useState("");
  const filtered = subjectLibrary.filter((subject) =>
    `${subject.name} ${subject.topics.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="landing-prototype variant-a" data-prototype-variant="A">
      <div className="atlas-value-strip">
        <span>
          <ShieldCheckIcon size={19} weight="regular" aria-hidden="true" />{" "}
          Curated, explained questions
        </span>
        <span>
          <ListChecksIcon size={19} weight="regular" aria-hidden="true" /> Three
          ways to answer
        </span>
        <span>
          <UserCircleIcon size={19} weight="regular" aria-hidden="true" /> Guest
          access from the start
        </span>
      </div>
      <section
        className="atlas-discovery"
        id="subjects"
        aria-labelledby="atlas-subjects-title"
      >
        <div className="atlas-directory">
          <div className="atlas-title">
            <div>
              <PrototypeLabel>Your subject atlas</PrototypeLabel>
              <h2 id="atlas-subjects-title">What are you working on?</h2>
              <p>Follow a subject. Find a topic. Start making connections.</p>
            </div>
            <span className="atlas-library-count">
              {subjectLibrary.length} subjects
              <br />
              <strong>{featuredQuestionCount} questions</strong>
            </span>
          </div>
          <label className="proto-search">
            <MagnifyingGlassIcon
              size={20}
              weight="regular"
              aria-hidden="true"
            />
            <span className="sr-only">Search subjects or topics</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a subject or topic"
            />
            {search && (
              <button
                aria-label="Clear subject search"
                onClick={() => setSearch("")}
              >
                <XIcon size={18} weight="regular" aria-hidden="true" />
              </button>
            )}
          </label>
          <div className="atlas-subject-list" aria-live="polite">
            {filtered.map((subject) => (
              <article key={subject.name}>
                <span className="atlas-subject-icon">
                  <SubjectMark name={subject.name} />
                </span>
                <div>
                  <h3>{subject.name}</h3>
                  <p>{subject.topics.join(" · ")}</p>
                  <span>{subjectCount(subject.name)} curated questions</span>
                </div>
                <Link
                  href={quizPath(subject.name)}
                  aria-label={`Practice ${subject.name}`}
                >
                  <ArrowUpRightIcon
                    size={22}
                    weight="regular"
                    aria-hidden="true"
                  />
                </Link>
              </article>
            ))}
            {!filtered.length && (
              <p className="atlas-empty">
                No matching subjects. Try a different subject or topic.
              </p>
            )}
          </div>
        </div>
        <aside
          className="atlas-mode-guide"
          id="how-it-works"
          aria-labelledby="atlas-modes-title"
        >
          <PrototypeLabel>Choose your approach</PrototypeLabel>
          <h2 id="atlas-modes-title">
            A way to learn.
            <br />A way to know.
          </h2>
          <article>
            <span className="proto-mode-icon">
              <BookBookmarkIcon size={25} weight="regular" aria-hidden="true" />
            </span>
            <h3>Practice Mode</h3>
            <p>
              Focus on the topics you choose. Get feedback and the reasoning
              behind every checked answer.
            </p>
            <ul>
              <li>Pick topics and difficulty</li>
              <li>Check answers at your pace</li>
              <li>Learn from clear explanations</li>
            </ul>
            <Link
              href="/create-quiz?mode=practice"
              className="proto-panel-link"
            >
              Set up practice{" "}
              <ArrowRightIcon size={18} weight="regular" aria-hidden="true" />
            </Link>
          </article>
          <article>
            <span className="proto-mode-icon">
              <TimerIcon size={25} weight="regular" aria-hidden="true" />
            </span>
            <h3>Exam Mode</h3>
            <p>
              Bring your knowledge together. Review the full picture after
              submitting.
            </p>
            <ul>
              <li>Balanced topic selection when possible</li>
              <li>Choose an optional time limit</li>
              <li>See results after submission</li>
            </ul>
            <Link href="/create-quiz?mode=exam" className="proto-panel-link">
              Set up an exam{" "}
              <ArrowRightIcon size={18} weight="regular" aria-hidden="true" />
            </Link>
          </article>
        </aside>
      </section>
      <QuizPreview
        title="Make room for an “aha” moment."
        description="Try three Biology questions and see what useful feedback feels like."
      />
      <section className="atlas-insights" id="insights">
        <div>
          <PrototypeLabel>More than a score</PrototypeLabel>
          <h2>
            Understand the result.
            <br />
            Know your next move.
          </h2>
          <p>
            Review every answer, see the explanation, and find the topics that
            deserve another look.
          </p>
          <div className="atlas-insight-point">
            <CheckCircleIcon size={23} weight="regular" aria-hidden="true" />
            <div>
              <h3>Every answer has a why.</h3>
              <p>Correct answers and mistakes both teach you something.</p>
            </div>
          </div>
          <div className="atlas-insight-point">
            <TargetIcon size={23} weight="regular" aria-hidden="true" />
            <div>
              <h3>Your next step is visible.</h3>
              <p>Topic results show where practice can help.</p>
            </div>
          </div>
        </div>
        <TopicResults />
      </section>
      <section className="atlas-account" id="your-progress">
        <div>
          <AccountCopy />
        </div>
        <Link href="/dashboard" className="carbon-button secondary">
          Open student space{" "}
          <ArrowUpRightIcon size={18} weight="regular" aria-hidden="true" />
        </Link>
      </section>
      <ClosingAction />
    </div>
  );
}

export function VariantB() {
  const [subjectIndex, setSubjectIndex] = useState(1);
  const subject = subjectLibrary[subjectIndex];
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  return (
    <div className="landing-prototype variant-b" data-prototype-variant="B">
      <section
        className="workspace-mode-section"
        id="how-it-works"
        aria-labelledby="workspace-mode-title"
      >
        <div className="workspace-mode-intro">
          <PrototypeLabel>One subject. Two ways forward.</PrototypeLabel>
          <h2 id="workspace-mode-title">
            Learn it.
            <br />
            Then put it to the test.
          </h2>
          <p>Choose the session that fits what you need today.</p>
        </div>
        <div className="workspace-comparison">
          <table>
            <caption className="sr-only">
              Practice Mode and Exam Mode comparison
            </caption>
            <thead>
              <tr>
                <th scope="col">Your session</th>
                <th scope="col">
                  <BookBookmarkIcon
                    size={21}
                    weight="regular"
                    aria-hidden="true"
                  />{" "}
                  Practice
                </th>
                <th scope="col">
                  <TimerIcon size={21} weight="regular" aria-hidden="true" />{" "}
                  Exam
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Answer feedback</th>
                <td>After each checked answer</td>
                <td>After submitting</td>
              </tr>
              <tr>
                <th scope="row">Topic selection</th>
                <td>One or several topics</td>
                <td>Balanced where available</td>
              </tr>
              <tr>
                <th scope="row">Time limit</th>
                <td>At your own pace</td>
                <td>Optional timer</td>
              </tr>
              <tr>
                <th scope="row">What you learn</th>
                <td>Why an answer is correct</td>
                <td>Your score and topic results</td>
              </tr>
            </tbody>
          </table>
          <div className="workspace-comparison-actions">
            <Link href="/create-quiz?mode=practice">
              Start with practice{" "}
              <ArrowRightIcon size={17} weight="regular" aria-hidden="true" />
            </Link>
            <Link href="/create-quiz?mode=exam">
              Try an examination{" "}
              <ArrowRightIcon size={17} weight="regular" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section
        className="workspace-library"
        id="subjects"
        aria-labelledby="workspace-library-title"
      >
        <div className="proto-section-title">
          <div>
            <PrototypeLabel>Your study workspace</PrototypeLabel>
            <h2 id="workspace-library-title">Choose where to focus.</h2>
            <p>A structured library. A session that fits you.</p>
          </div>
          <span className="proto-mono">
            {featuredQuestionCount} curated questions / {subjectLibrary.length}{" "}
            subjects
          </span>
        </div>
        <div className="workspace-browser">
          <nav className="workspace-subject-tabs" aria-label="Choose a subject">
            {subjectLibrary.map((item, index) => (
              <button
                key={item.name}
                aria-pressed={index === subjectIndex}
                onClick={() => setSubjectIndex(index)}
              >
                <SubjectMark name={item.name} size={21} />
                <span>{item.name}</span>
                <small>{subjectCount(item.name)}</small>
              </button>
            ))}
          </nav>
          <div className="workspace-topic-panel" aria-live="polite">
            <div className="workspace-subject-title">
              <SubjectMark name={subject.name} size={32} />
              <div>
                <span>{subject.category}</span>
                <h3>{subject.name}</h3>
              </div>
            </div>
            <p>{subject.description}</p>
            <div className="workspace-topic-list">
              <h4>Topics in this subject</h4>
              {subject.topics.map((topic, index) => (
                <div key={topic}>
                  <span className="workspace-topic-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{topic}</span>
                  <small>
                    {
                      questionBank.filter(
                        (q) => q.subject === subject.name && q.topic === topic,
                      ).length
                    }{" "}
                    questions
                  </small>
                </div>
              ))}
            </div>
            <p className="workspace-format-note">
              {questionTypes.map((type) => type.label).join(" · ")}
            </p>
          </div>
          <aside className="workspace-launcher">
            <PrototypeLabel>Build a session</PrototypeLabel>
            <h3>
              Your subject.
              <br />
              Your settings.
            </h3>
            <div
              className="workspace-mode-control"
              role="group"
              aria-label="Choose a learning mode"
            >
              <button
                aria-pressed={mode === "practice"}
                onClick={() => setMode("practice")}
              >
                Practice
              </button>
              <button
                aria-pressed={mode === "exam"}
                onClick={() => setMode("exam")}
              >
                Exam
              </button>
            </div>
            <dl>
              <div>
                <dt>Subject</dt>
                <dd>{subject.name}</dd>
              </div>
              <div>
                <dt>Available topics</dt>
                <dd>{subject.topics.length}</dd>
              </div>
              <div>
                <dt>Curated questions</dt>
                <dd>{subjectCount(subject.name)}</dd>
              </div>
            </dl>
            <p>
              {mode === "practice"
                ? "Choose topics, question types, and difficulty in setup. Get feedback after each checked answer."
                : "Choose question types, difficulty, and an optional timer in setup. Review all answers after submission."}
            </p>
            <Link
              href={quizPath(subject.name, mode)}
              className="proto-launch-button"
            >
              Configure {mode === "practice" ? "practice" : "exam"}{" "}
              <ArrowRightIcon size={18} weight="regular" aria-hidden="true" />
            </Link>
            <span>
              <ShieldCheckIcon size={15} weight="regular" aria-hidden="true" />{" "}
              No account required
            </span>
          </aside>
        </div>
        <p className="proto-prototype-state">
          Preview selection: {subject.name} /{" "}
          {mode === "practice" ? "Practice Mode" : "Exam Mode"}. Full session
          settings are configured on the next page.
        </p>
      </section>
      <QuizPreview
        title="A focused space to think."
        description="Explore the same three-question Biology preview before building your own session."
      />
      <section className="workspace-results-band" id="insights">
        <TopicResults presentation="bars" />
        <div className="workspace-results-copy">
          <PrototypeLabel>Review → understand → repeat</PrototypeLabel>
          <h2>
            Turn the result into
            <br />a useful plan.
          </h2>
          <p>
            Your score is a snapshot. Every explanation and topic breakdown
            makes the next study session more purposeful.
          </p>
          <ul>
            <li>
              <CheckCircleIcon size={20} weight="regular" aria-hidden="true" />{" "}
              See correct, incorrect, and unanswered questions.
            </li>
            <li>
              <BookOpenIcon size={20} weight="regular" aria-hidden="true" />{" "}
              Read the reasoning behind every answer.
            </li>
            <li>
              <TargetIcon size={20} weight="regular" aria-hidden="true" />{" "}
              Choose the topics you want to revisit.
            </li>
          </ul>
          <Link href="/create-quiz" className="proto-link">
            Build your next session{" "}
            <ArrowRightIcon size={18} weight="regular" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className="workspace-account-band" id="your-progress">
        <div className="workspace-account-icon">
          <UserCircleIcon size={37} weight="regular" aria-hidden="true" />
        </div>
        <div>
          <AccountCopy />
        </div>
        <Link href="/dashboard" className="carbon-button secondary">
          Student space{" "}
          <ArrowUpRightIcon size={18} weight="regular" aria-hidden="true" />
        </Link>
      </section>
      <ClosingAction />
    </div>
  );
}

export function VariantC() {
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  const subject = subjectLibrary[subjectIndex];
  return (
    <div className="landing-prototype variant-c" data-prototype-variant="C">
      <div className="journey-introduction">
        <PrototypeLabel>
          A little more understanding, one step at a time
        </PrototypeLabel>
        <h2>
          You don’t have to know it all.
          <br />
          Just know where to begin.
        </h2>
        <p>
          Four simple steps from a subject on your mind to a clearer picture of
          what you know.
        </p>
      </div>
      <div className="journey-layout">
        <nav className="journey-rail" aria-label="Learning journey">
          <a href="#subjects">
            <span>01</span> Find your subject
          </a>
          <a href="#how-it-works">
            <span>02</span> Choose your pace
          </a>
          <a href="#journey-try">
            <span>03</span> Make it click
          </a>
          <a href="#insights">
            <span>04</span> See what’s next
          </a>
        </nav>
        <div className="journey-chapters">
          <section
            className="journey-chapter"
            id="subjects"
            aria-labelledby="journey-subjects-title"
          >
            <div className="journey-chapter-heading">
              <span>01</span>
              <div>
                <PrototypeLabel>Start with curiosity</PrototypeLabel>
                <h2 id="journey-subjects-title">Every subject has a way in.</h2>
                <p>
                  Find the one you’re studying. Break it into topics you can
                  work with.
                </p>
              </div>
            </div>
            <div
              className="journey-subject-picker"
              role="group"
              aria-label="Choose a subject"
            >
              {subjectLibrary.map((item, index) => (
                <button
                  key={item.name}
                  aria-pressed={subjectIndex === index}
                  onClick={() => setSubjectIndex(index)}
                >
                  <SubjectMark name={item.name} size={22} />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
            <div className="journey-subject-detail" aria-live="polite">
              <div>
                <h3>{subject.name}</h3>
                <p>{subject.description}</p>
                <span>{subjectCount(subject.name)} curated questions</span>
              </div>
              <ul>
                {subject.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
              <Link
                href={quizPath(subject.name)}
                aria-label={`Explore ${subject.name}`}
              >
                <ArrowUpRightIcon
                  size={24}
                  weight="regular"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </section>
          <section
            className="journey-chapter"
            id="how-it-works"
            aria-labelledby="journey-mode-title"
          >
            <div className="journey-chapter-heading">
              <span>02</span>
              <div>
                <PrototypeLabel>Make it work for you</PrototypeLabel>
                <h2 id="journey-mode-title">
                  Learn at your pace.
                  <br />
                  Test when you’re ready.
                </h2>
              </div>
            </div>
            <div
              className="journey-mode-options"
              role="group"
              aria-label="Choose your approach"
            >
              <button
                aria-pressed={mode === "practice"}
                onClick={() => setMode("practice")}
              >
                <BookBookmarkIcon
                  size={25}
                  weight="regular"
                  aria-hidden="true"
                />
                <span>
                  <strong>Practice Mode</strong>
                  <small>Understand as you go.</small>
                </span>
                <span className="journey-radio" />
              </button>
              <button
                aria-pressed={mode === "exam"}
                onClick={() => setMode("exam")}
              >
                <TimerIcon size={25} weight="regular" aria-hidden="true" />
                <span>
                  <strong>Exam Mode</strong>
                  <small>Find out where you stand.</small>
                </span>
                <span className="journey-radio" />
              </button>
            </div>
            <div className="journey-mode-description" aria-live="polite">
              <h3>
                {mode === "practice"
                  ? "Feedback while the question is still fresh."
                  : "A focused examination, with the full picture afterward."}
              </h3>
              <p>
                {mode === "practice"
                  ? "Choose one or several topics, configure question count and difficulty, then check each answer to reveal a detailed explanation. Take the time you need."
                  : "Configure question count, difficulty, and an optional timer. The bank is sampled to cover eligible topics as fully as your settings permit. Answers stay unevaluated until you submit."}
              </p>
              <Link className="proto-link" href={quizPath(subject.name, mode)}>
                Set up {mode === "practice" ? "practice" : "an exam"} in{" "}
                {subject.name}{" "}
                <ArrowRightIcon size={18} weight="regular" aria-hidden="true" />
              </Link>
            </div>
          </section>
          <section
            className="journey-chapter journey-preview-chapter"
            id="journey-try"
            aria-labelledby="journey-preview-title"
          >
            <div className="journey-chapter-heading">
              <span>03</span>
              <div>
                <PrototypeLabel>One question at a time</PrototypeLabel>
                <h2 id="journey-preview-title">
                  That moment when it makes sense.
                </h2>
                <p>
                  Try three sample Biology questions. Make a choice, then see
                  the reasoning.
                </p>
              </div>
            </div>
            <QuestionPreview />
          </section>
          <section
            className="journey-chapter"
            id="insights"
            aria-labelledby="journey-results-title"
          >
            <div className="journey-chapter-heading">
              <span>04</span>
              <div>
                <PrototypeLabel>Make the next step clearer</PrototypeLabel>
                <h2 id="journey-results-title">
                  Keep what you’ve learned.
                  <br />
                  See what needs another look.
                </h2>
              </div>
            </div>
            <div className="journey-results-layout">
              <TopicResults presentation="bars" />
              <div>
                <BookOpenIcon size={28} weight="regular" aria-hidden="true" />
                <h3>
                  The explanation matters
                  <br />
                  as much as the answer.
                </h3>
                <p>
                  See how you did across topics. Review correct answers and
                  mistakes, and use the reasoning to build understanding.
                </p>
                <Link href="/create-quiz" className="proto-link">
                  Take your next step{" "}
                  <ArrowRightIcon
                    size={18}
                    weight="regular"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </section>
          <section className="journey-save-note" id="your-progress">
            <div>
              <AccountCopy />
            </div>
            <Link href="/dashboard" className="proto-link">
              Open student space{" "}
              <ArrowUpRightIcon size={18} weight="regular" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
      <ClosingAction />
      <p className="proto-prototype-state">
        Your preview path: {subject.name} →{" "}
        {mode === "practice" ? "Practice" : "Exam"} → review. Selection is
        temporary.
      </p>
    </div>
  );
}

export function LandingPrototype({ variant }: { variant: LandingVariant }) {
  if (variant === "B") return <VariantB />;
  if (variant === "C") return <VariantC />;
  return <VariantA />;
}
