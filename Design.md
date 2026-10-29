# Carbon — Enterprise System

## Direction and authority

Restore the Carbon design used before the OmniStack reference. This document is the current visual specification for the landing page, subject folders, quiz creation, question runner, and results. The OmniStack document and unused theme stylesheet are historical references.

Preserve the existing page structure, responsive behavior, interactions, and animations. The default landing page uses the original section layout; earlier UI variations remain opt-in development previews.

## North Star: Productive Clarity

Clean, systematic, and accessible. Every element helps students choose a subject, practice, take an exam, or understand an answer. Keep academically focused copy and realistic product previews.

## Colors

- Primary: IBM Blue `#0f62fe` for actions, links, selection, and focus. Hover `#0353e9`; active `#002d9c`.
- Page background: `#ffffff`. Layer surface: `#f4f4f4`. Nested content: white. Hover surface: `#e8e8e8`.
- Primary text: `#161616`. Secondary text: `#525252`. Helper text: `#6f6f6f`. Text on primary buttons: white.
- Dividers: `#e0e0e0`. Strong control borders: `#8d8d8d`.
- Success: `#198038`, with `#defbe6` feedback surfaces. Danger: `#da1e28`, with `#fff1f1` feedback surfaces. Information surface: `#edf5ff`.
- Use semantic roles strictly. Correctness colors appear only when evaluation is permitted and always include text or icons.

## Typography

- Use locally served **IBM Plex Sans** throughout, including labels, timers, counts, and scores. Keep its license alongside the font asset.
- Use weights 300 for introductory headings, 400 for body text, and 600 for emphasis.
- Body: 14px / 20px. Labels and helper text: 12px / 16px. Headings: 20px / 28px, 24px / 32px, or 32px / 40px.
- Use weight and spacing to establish hierarchy. Keep long questions and answers readable and allow natural wrapping.

## Layout and elevation

- Follow an 8px spacing grid for layout: 8, 16, 24, 32, 40, 48, 64, and 80px. Use 2px increments only for small alignment details.
- Preserve existing container widths, grids, section order, breakpoints, and sticky quiz panels.
- Cards use `#f4f4f4`, square corners, and 16px base padding. Nested white surfaces separate content where needed.
- Prefer gray background shifts and `border-bottom: 1px solid #e0e0e0` to separate sections.
- Minimize shadows. Level 1: `0 2px 6px rgba(0,0,0,0.1)`. Level 2: `0 4px 12px rgba(0,0,0,0.12)`. Reserve elevation for meaningful overlays.
- Avoid decorative gradients, stock education photography, and unnecessary ornament. Keep information dense but readable.

## Components

- Buttons: solid blue primary, outlined secondary, and text-only ghost. Use square corners, consistent alignment, and a minimum 48px touch target. Keep labels and hover/focus states legible.
- Inputs: gray background, bottom-border treatment, and 40px visible height. Keep persistent labels, clear errors, and adequate interaction areas.
- Use Phosphor icons for new or updated interface icon sets, following `AGENTS.md`. Icons clarify actions and states; icon-only controls need accessible names.
- Answer options: distinguish neutral, selected, correct, and incorrect states through text, icons, and color. Retain native single-choice, multiple-answer, and true/false behavior.
- Progress and navigation: display actual counts and distinguish current, answered, and flagged questions. Let students fold the question navigation into a compact desktop rail or a compact mobile panel. Keep its toggle, current question count, and leave action available; folding must preserve answers, flags, and position. Keep timers readable with tabular numerals.
- Data tables: aligned headers and zebra striping with alternating `#f4f4f4` rows. Charts show actual topic counts and accuracy rather than unsupported mastery claims.
- Dialogs: preserve native modal semantics, focus management, Escape behavior, and confirmation actions. Use square light panels and readable labels.

## Product and page contracts

- Landing `/`: original hero, subject library, mode comparison, interactive question preview, results sample, optional-account section, and final CTA. **Start Practicing** leads to `/subjects/itcs217`; **Explore Subjects** leads to the subject library.
- Subject library `/subjects`: show the ITCS217 subject folder. `/subjects/itcs217` lists lecture folders. `/subjects/itcs217/lectures/lecture-9` contains only the four curated quizzes. The original/saved quiz library and author import tools are hidden while quiz creation is frozen; retain their implementation and stored data for future work. Navigation follows ITCS217 → Lecture 9 → quizzes. `/quizzes` redirects to this lecture folder; existing runner links and saved quiz/attempt IDs remain valid.
- Quiz creation and JSON import are frozen. Do not expose creation controls, author tools, or the original/saved quiz section. Preserve existing stored quizzes and attempts; `/create-quiz` continues redirecting to the curated lecture folder.
- The custom builder and lecture/variation presets are on hold. `/create-quiz` redirects to the Lecture 9 folder. Exclude the 86 variation questions from the active bank without deleting their source files.
- Current quizzes use their complete selected question list in order with untimed Practice feedback. Topic, mode, difficulty, and question-type configuration remain on hold. Existing session/grade logic may remain for legacy attempts.
- Runner `/question-runner`: retain question navigation, flagging, timer, answer controls, submission dialogs, and results. Practice evaluates after checking; Exam evaluates only after submission or timer expiry.
- All questions come from the curated bank. Do not dynamically generate questions or duplicate questions to fill unavailable quotas.
- Guest attempts remain temporary and tab-scoped. Explicitly created quizzes are saved in this browser; explain that they do not synchronize across devices. Do not present future account history or progress tracking as implemented.
- Results include score, accuracy, responses, explanations, and topic performance. Clearly label illustrative landing-page data.

## Motion and accessibility

- Preserve current animation and transition declarations, timing, easing, transforms, and reduced-motion support. This restoration does not introduce motion.
- Meet WCAG AA contrast. Use visible blue focus rings, keyboard-operable controls, semantic landmarks, a skip link, persistent labels, and textual validation.
- Convey correctness through text and icons as well as color. Keep exam answers ungraded until submission.
- Support mobile, tablet, and desktop layouts from 320px upward without page-level horizontal overflow. Do not hide overflow to mask inaccessible content.

## Implementation and verification

- Shared Carbon styles live in `app/carbon.css`; landing-specific styles live in `app/landing.css`. Global defaults remain in `app/globals.css`.
- Do not import `app/omnistack-theme.css` into the active application layout. Preserve quiz logic, question-bank additions, and the education-level removal when changing appearance.
- Verify the landing page, folders, quiz creation/import, local persistence, runner, feedback, results, responsive layouts, keyboard interaction, and browser errors. Run relevant lint, TypeScript checks, and the production build.
