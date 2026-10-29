# Solo Studying handoff — 2026-10-29

## Repository and synchronization

Public repository: https://github.com/QiminZhu/solo-studying ; branch: main.
Prepared from the existing publishing checkout, based on 633bf46. Remote fetch confirmed main was synchronized before this documentation checkpoint. The separate original working checkout and all uncommitted work remain untouched. Application source comparisons found no differences apart from documentation, local tooling/configuration and supporting workspace files. Do not copy the original workspace wholesale into this public repository.

## Current implementation and decisions

Carbon guest landing, ITCS217 subject/lecture folders, four curated Lecture 9 quizzes, question runner and results are implemented. Quiz creation/import and legacy saved-library controls are frozen by Design.md; preserved implementations and browser data must survive. Practice checks answers individually; exam evaluation is deferred. Guest attempts use sessionStorage; saved quizzes use localStorage and do not synchronize across devices/accounts. Legacy Cloudflare dashboard/materials code remains separate from the static guest build.

Important files: Design.md; app/page.tsx; app/carbon.css; app/landing.css; app/subjects/; app/question-runner/; components/quiz/; lib/quiz-v3/; lib/question-banks/; tests/; scripts/build-static.mjs; .github/workflows/github-pages.yml; docs/static-launch.md. README.md contains portable commands and tool/service requirements.

## Unfinished work and known issues

Account-backed guest history, cross-device progress and configurable quiz creation remain future scope. Existing README text in older workspace copies predates the creation freeze; use this checkout and Design.md. Older synthetic browser tests may not match the final lecture collection; the lecture9-import browser suite targets current content. Full lint has previously reported legacy errors; do not interpret guest-only lint as full lint success.

The original MIT LICENSE is unchanged. Font and vendor notices remain intact. Lecture-derived educational content is already in the public repository, but redistribution permission is not documented here. No question/source material is newly uploaded by this checkpoint; obtain rights confirmation before adding or republishing affected material. Private uploads, original lecture files, account databases, browser storage, local environment files, dependencies, runtime state and build outputs are not part of this handoff.

## Verification

This checkpoint changes documentation only: reviewed changed files, relative links, npm scripts, ignore coverage and tracked file names. No app build or browser run is required for these edits. Historical launch notes report passing static/full builds, types, guest lint, 43 quiz tests and responsive browser checks; these are historical results, not rerun for this checkpoint. Current application behavior should be reverified before the next release.

## Recommended next task

Run npm ci, guest lint, typecheck and quiz tests from a fresh clone, then inspect current lecture quizzes in the browser. Reconcile older documentation with Design.md and resolve educational-content rights/answer review before any further publication. Continue feature work only within the current creation freeze unless the user changes scope.
