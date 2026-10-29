# Solo Studying agent guidance

Read README.md, HANDOFF.md, and Design.md before making changes. This checkout has the application at its root; run npm commands here.

Design.md is authoritative: Carbon styling, curated guest quizzes, quiz creation/import frozen. Preserve stored quizzes and attempts and legacy account infrastructure. Use Phosphor for updated component icon sets. Keep TypeScript strict and use existing UI primitives.

Preserve user changes. Application changes require relevant behavior tests, lint, typecheck and production build. Documentation-only changes require inspection and diff checks. Keep credentials, browser data, dependencies and generated output out of Git. Deployment and repository settings require explicit authorization.

Guest browser storage is device-specific. Cloudflare account features require platform identity headers, D1 and R2; public static hosting excludes them. Do not trust client-supplied identity headers in production.
