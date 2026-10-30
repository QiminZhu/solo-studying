import { cp, mkdir, rm, symlink, writeFile, readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Stage a separate app so the account-backed Cloudflare target stays intact.
const root = fileURLToPath(new URL('../', import.meta.url));
const stage = path.join(root, '.sites-runtime/static');
const basePath = process.env.SOLO_BASE_PATH || '';
if (basePath && !/^\/[a-zA-Z0-9_-]+$/.test(basePath)) throw new Error('Invalid SOLO_BASE_PATH');
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
for (const entry of ['app', 'components', 'hooks', 'lib', 'vendor', 'db', 'cloudflare-env.d.ts', 'public', 'postcss.config.mjs', 'tsconfig.json', 'package.json']) {
  await cp(path.join(root, entry), path.join(stage, entry), { recursive: true });
}
for (const entry of ['api', 'chatgpt-auth.ts', 'dashboard', 'preview']) {
  await rm(path.join(stage, 'app', entry), { recursive: true, force: true });
}
await symlink(path.join(root, 'node_modules'), path.join(stage, 'node_modules'), 'dir');
await writeFile(path.join(stage, 'next.config.mjs'), `export default { output: 'export', basePath: ${JSON.stringify(basePath)}, trailingSlash: true, images: { unoptimized: true }, experimental: { cpus: 2 } };\n`);
await writeFile(path.join(stage, 'app/page.tsx'), `import { LandingPage } from '@/components/landing/landing-page';
import './landing.css';
import '@/components/landing/prototype/landing-prototype.css';
export default function Page() { return <LandingPage />; }\n`);
// The runner preview is a dev-only comparison. Keep it out of the guest site.
await writeFile(path.join(stage, 'app/quizzes/run/page.tsx'), `import { Suspense } from "react";
import type { Metadata } from "next";
import { SixFormatRunner } from "@/components/quiz/v3/quiz-runner";
export const metadata: Metadata = { title: "Quiz attempt — Solo Studying" };
export default function QuizAttemptPage() {
  return (
    <Suspense fallback={<p role="status">Loading quiz…</p>}>
      <SixFormatRunner />
    </Suspense>
  );
}
`);
// Static hosts cannot execute redirects; preserve earlier bookmarks in the browser.
for (const route of ['create-quiz', 'quizzes', 'dashboard']) {
  await mkdir(path.join(stage, 'app', route), { recursive: true });
  await writeFile(path.join(stage, 'app', route, 'page.tsx'), `"use client";
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { lectureFolder } from '@/lib/quiz-navigation';
export default function Page() {
  const router = useRouter();
  useEffect(() => { router.replace(lectureFolder.href); }, [router]);
  return <main><p>Opening the guest quiz library…</p><Link href={lectureFolder.href}>Continue to quizzes</Link></main>;
}\n`);
}
// Next prefixes navigation URLs; raw public asset URLs also need the repository path.
async function prefixAssets(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await prefixAssets(file);
    else if (/\.(tsx?|css)$/.test(entry.name)) {
      const source = await readFile(file, 'utf8');
      await writeFile(file, source.replace(/(["'`])\/(?!\/)([^"'`\s]*\.(?:svg|png|jpg|webp|ttf|woff2?|json|html))(?=["'`])/g,
        (_, quote, asset) => `${quote}${basePath}/${asset}`));
    }
  }
}
if (basePath) for (const directory of ['app', 'components', 'lib']) await prefixAssets(path.join(stage, directory));
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build', '--webpack'], { cwd: stage, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
await rm(path.join(root, 'out'), { recursive: true, force: true });
await cp(path.join(stage, 'out'), path.join(root, 'out'), { recursive: true });
await writeFile(path.join(root, 'out/.nojekyll'), '');
console.log(`Static site ready in out/. Configured base path: ${basePath || '/'}.`);
