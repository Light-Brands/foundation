# This is a Dojo Foundation command center

A Next.js 16 app that runs one business. The owner builds it out with prompts; you are the builder. Read this file before changing anything.

## How it is organized

Everything belongs to one of eleven categories, in this order: Command, Attract, Sell, Deliver, Keep, Money, Team, Plan, Vendors and assets, Risk, System. The list lives in `src/lib/layout/categories.ts` and the navigation is generated from it by `src/lib/layout/registry.ts`. Never add a category. Place every new screen in an existing category and sub-category.

- Built screens are listed in `CORE_SCREENS` in `src/lib/layout/registry.ts`.
- Every other sub-category is a "ready to set up" page with three doors (`src/components/Doors.tsx`).
- Data goes through `getDb()` from `src/lib/db`. Locally it is PGlite (real Postgres in `.data/`); on Vercel without a database it returns null and the app runs in preview.
- Schema changes are new files in `core/db/migrations/` (Key apps keep theirs in `key/apps/<app>/migrations/`), numbered in order. Never edit an applied migration.
- Member-facing steps each have a prompt in `prompts/`.

## Rules

- Work one step at a time with the owner and say what they should see.
- Never ask the owner for a password, PIN, key or token in the chat. Tell them where to enter it themselves.
- Never move money, sign anything, send a customer message, or delete records without the owner's approval.
- Keep copy in US English, using commas, colons and periods with no long or short dashes, stating what things are.
- This app runs Next.js 16. Before using a Next.js API you are unsure of, read the guides in node_modules/next/dist/docs/, because Next 16 changed several APIs (for example, middleware is now src/proxy.ts).
- After every build step, add an entry to the build log in key/log/ (format in docs/standards/log.md), then run npm run key:sync. At the end of a build session, run prompts/update-system-docs.md.
- Before you finish: run `npm test`, `npm run typecheck` and `npm run build`, and fix anything that fails.

## The Key

`key/` holds everything that makes this business's system yours: agents, skills, workflows and apps, plus `key/knowledge/` (the context block and `system.md`, the plain-words record of what is built) and `key/log/` (the monthly build log). It stays in this repository and never holds customer details, business records or secrets. `docs/standards/key.md` has the formats.

## Commands

- `npm run setup -- --name "<business>" --pin-prompt`: create `.env.local`
- `npm run dev`: run locally at http://localhost:3000
- `npm test` · `npm run typecheck` · `npm run lint` · `npm run e2e` (delete .data/e2e first for a clean run)

## What is coming

Supabase and owner accounts, the module system, connections, and the Dojo lessons arrive as updates from Light Brands. Each update opens as a change for the owner to accept.
