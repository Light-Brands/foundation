# Stack

- **Use Node 20.9 or newer.** Next 16 needs it. Why: older versions fail to build in ways that look unrelated.
- **Use these versions: Next 16.3, React 19.3, Tailwind 4, TypeScript, PGlite 0.5, Vitest and Playwright.** Move one only with a pull request that also fixes what breaks. Why: the whole app and its guides are written against this set.
- **Read `node_modules/next/dist/docs/` before you use a Next.js API you are unsure of.** Next 16 changed several APIs and older examples online are wrong for it. Why: a remembered API that no longer exists wastes a build.
- **Name the request gate `src/proxy.ts` and export a function called `proxy`.** The old `middleware.ts` name no longer applies. Why: the gate (see `security.md`) only runs under the Next 16 name.
- **Treat `params` and `searchParams` as promises and `await` them.** This holds in pages, layouts and route handlers. Why: reading them directly returns a promise, not the values.
- **Write form saves as server actions, in an `actions.ts` file marked `"use server"`.** Each one checks the session first (see `security.md`). Why: one pattern for saves keeps the checks in one place.
- **List `@electric-sql/pglite` in `serverExternalPackages` in `next.config.ts`.** Why: the bundler breaks PGlite's files if it tries to bundle them.
- **List every folder the running app reads from disk in `outputFileTracingIncludes`: `prompts/`, `core/db/migrations/` and `key/`.** When you add another folder the app reads at run time, add it there. Why: a folder that is not traced is missing on Vercel even though it works locally.
- **Run everything through npm scripts: `npm run dev`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run e2e`.** The scripts run `scripts/gen-build-secret.mjs` first as a pre-hook, which `src/lib/env.ts` needs. Why: calling `vitest`, `tsc` or `next` directly skips the hook and fails with a confusing error.
- **Never use Docker.** Local data is PGlite. The cloud database is hosted Supabase only: never run `supabase start` or any container stack. Tests run directly with Node and Playwright. Why: one way to run the project keeps setup short for a business owner and keeps every machine the same.
- **Keep dependencies few.** Add a package only when it saves more code than it adds to the install. Why: every package is something the owner's repository has to keep updated.
