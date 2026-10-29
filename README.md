# Solo Studying

Guest quiz practice for ITCS217. Attempts and custom quizzes are saved in this browser and do not synchronize across devices.

## Development

Use Node.js 22.13 or newer. Run `npm ci`, then `npm run build:static`. Set `SOLO_BASE_PATH=/solo-studying` for the GitHub Pages path. Serve `out/` with a static web server.

The manual GitHub Pages workflow runs lint, TypeScript checks, quiz tests, and the static export before deployment. See [launch notes](docs/static-launch.md).

The original Cloudflare application is preserved in the source; account-backed routes are excluded from the static deployment.

## License

Project code is available under the [MIT License](LICENSE). Third-party dependencies, fonts and externally sourced educational material retain their respective licenses and rights.

## Continue on another device or AI app

Clone https://github.com/QiminZhu/solo-studying.git and enter `solo-studying`.
Read [HANDOFF.md](HANDOFF.md), [AGENTS.md](AGENTS.md) and [Design.md](Design.md).
The repository root is the app root (the original local workspace nested it under `sites/solo-studying`).

Required: Git, Node.js >=22.13.0 and npm (use the npm supplied with Node; package-lock.json is authoritative). Install with `npm ci`. No AI plugin is required.

- Local development: `npm run dev` (portable default, port 5173).
- Guest lint: `npm run lint:static`; complete legacy lint: `npm run lint`.
- Types: `npm run typecheck`.
- Tests: `npm run test:quiz` and `npm run test:materials`.
- Static production build: `npm run build:static`; output: `out/`.
- Full Cloudflare build: `npm run build`; local built Worker: `npm run start`.

No secrets or environment variables are required for the static guest app. Optional `SOLO_BASE_PATH` sets the static hosting prefix. Internal tooling may set `SITES_RUNTIME_ROOT`, `SITES_INSTALL_REPORT_PATH`, `WRANGLER_LOG_PATH`, `WRANGLER_REGISTRY_PATH`, `MINIFLARE_REGISTRY_PATH`, `SHARP_IGNORE_GLOBAL_LIBVIPS`, and `CODEX_SANDBOX`; leave these unset for ordinary portable development. `SITES_BUILD_TIMEOUT` applies to managed Linux builds. Store any local secrets only in ignored `.env*` or `.dev.vars*` files.

Cloudflare features require separately provisioned `DB` (D1) and `BUCKET` (R2) Worker bindings and trusted Sites identity headers. These are not environment-file credentials. Data, bindings, platform sign-in and production configuration do not transfer with Git. See scripts and drizzle migrations before configuring a full-stack preview; do not replay migrations blindly.

Optional AI tools: Codex and the Sites plugin assist editing, preview and hosting; install and sign in separately if desired. GitHub connectors or the GitHub CLI require separate sign-in for writes; public cloning needs none. Figma/design tools and educational quiz-generation skills are optional and are not runtime dependencies. This machine's skills, plugins, API connections and browser storage do not transfer automatically. Use the checked-in source and design specification in any editor. Publishing uses the existing manual GitHub Actions workflow and needs repository permissions; a push alone does not deploy.
