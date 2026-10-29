# Static guest launch

The GitHub Pages target is separate from the existing Vinext/Cloudflare app. It includes the landing page, subject and lecture folders, guest quizzes and runners. Account-backed APIs, uploads and the academic dashboard remain on the Cloudflare target. In the static target, old dashboard links open the guest quiz library.

Run `npm ci`, `npm run lint:static`, `npm run typecheck`, `npm run test:quiz`, and `npm run build:static` from this directory. The static build stages a copy in ignored `.sites-runtime/static` and writes the deployable files to ignored `out/`. It reads the latest question banks each time; it does not edit them. Never commit the staged app or build output.

## Hosting

Repository subpaths are supported. The workflow reads the Pages base path and passes it to `build:static`; local builds can set `SOLO_BASE_PATH=/solo-studying`. Navigation and public asset URLs use this prefix in the staged app.

Push this app directory as the repository root, including its lockfile and `.github/workflows/github-pages.yml`. If publishing the larger workspace instead, adapt the workflow working directory, lockfile cache path and artifact path first.

In repository Settings → Pages, select GitHub Actions. When ready to publish, manually run “Publish static guest site”; enter the custom domain if applicable. Configure its DNS and enforce HTTPS in Pages settings. The workflow intentionally does not deploy on every push while quiz content is being finalized.

## Final release checks

- Confirm permission to publish lecture-derived questions and attached source details.
- Review final answer keys, explanations and question counts.
- Test fresh guest sessions, browser storage, practice feedback, exam submission, timer expiry and result totals against the final banks.
- Serve `out/` locally and check direct route loads and refreshes, phone/tablet/desktop layouts and keyboard interaction.
- Explain that browser-local attempts are device-specific and can be lost when browser data is cleared. All shipped question answers are inspectable; this is a practice platform, not a secure assessment service.
- Inspect tracked and untracked files before the first commit; omit private source materials, local data, credentials and publication archives.

Preparation alone does not publish the site. A successful static build does not certify question correctness or browser behavior.

The full `npm run lint` currently reports existing errors in legacy dashboard/library components and generated PDF assets. The publishing workflow checks the guest surface separately with `lint:static`; it still runs full TypeScript checking and the quiz tests.

## Preparation verification (2026-10-29)

- Static export and existing Cloudflare production build passed.
- Full TypeScript check, guest-surface lint, and 43 quiz tests passed.
- Chrome smoke checks passed for five exported routes at 390, 768 and 1440px: no horizontal overflow or page errors, reduced-motion preference enabled, and the landing skip link reachable by keyboard.
- The old `quiz-v3.browser.mjs` exercises synthetic fixture answers and no longer matches the lecture-backed collection. The current collection is verified by `lecture9-import.browser.mjs`: all 60 questions, keyboard answers, immediate/deferred feedback, four 15/15 results and 320/768/1280px layouts passed against the final static export.
- Rebuild after finalizing questions; the current export is a snapshot of content at build time.
