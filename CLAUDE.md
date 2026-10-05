# This is a Dojo Foundation command center

A Next.js 16 app that runs one business. The owner builds it out with prompts; you are the builder. Read this file before changing anything.

## How it is organized

Everything belongs to one of eleven categories (a founder reads them as departments, and each sub-category as a job), in this order: Command center, Marketing, Sales, Delivery, Customer care, Finance, People, Leadership, Operations, Protection, Settings. The list lives in `src/lib/layout/categories.ts` and the navigation is generated from it by `src/lib/layout/registry.ts`. Never add a category. Place every new screen in an existing category and sub-category.

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
- After every build step, make the work commit, then add an entry to the build log in key/log/ (format in docs/standards/log.md) in its own log-only commit made right after it, naming the work commit's id, then run npm run key:sync. At the end of a build session, run prompts/update-system-docs.md.
- Before you finish: run `npm test`, `npm run typecheck` and `npm run build`, and fix anything that fails.

## The Key

`key/` holds everything that makes this business's system yours: agents, skills, routines and apps, plus `key/knowledge/` (the context block and `system.md`, the plain-words record of what is built) and `key/log/` (the monthly build log). The build log stays in this repository. `system.md` goes only to your own workspace, when you connect one later. Neither holds customer details, business records or secrets. `docs/standards/key.md` has the formats.

The Settings save is the only writer of `key/knowledge/context-block.yaml`, and it also sets `name` in `key/key.yaml` to the business name. `npm run key:sync` rebuilds the inventory in `system.md` and nothing else. A member upgrading from an earlier version opens System, then Settings, and presses Save once, so the Key holds the business details.

## Standards

The rules every builder follows, each with its reason, live in `docs/standards/`. Read the file for your topic before you change code in it, and change a standard only in a pull request that also changes the code or test that enforces it.

- `docs/standards/README.md`: the index and how to change a standard.
- `docs/standards/stack.md`: versions, Next.js 16 specifics, npm scripts, no Docker.
- `docs/standards/layout.md`: what each folder holds and what never goes there.
- `docs/standards/glossary.md`: one meaning for each project word.
- `docs/standards/key.md`: the Key formats, with an example of each.
- `docs/standards/data.md`: migrations, the one-shape rule, field types.
- `docs/standards/security.md`: sessions, redirects, secrets, limits and writes.
- `docs/standards/testing.md`: tests that can fail, and what runs when.
- `docs/standards/copy.md`: the words and punctuation we use.
- `docs/standards/prompts.md`: how member prompts are written.
- `docs/standards/commits.md`: commits and the checks before a push.
- `docs/standards/log.md`: the build log and the system document.
- `docs/standards/privacy.md`: what stays in the repository, what travels with a connected workspace and what is never written down.

## Commands

- `npm run setup -- --name "<business>" --pin-prompt`: create `.env.local`
- `npm run dev`: run locally at http://localhost:3000
- `npm test` · `npm run typecheck` · `npm run lint` · `npm run e2e` (delete .data/e2e first for a clean run)

## What is coming

Supabase and owner accounts, the module system, connections, and the Dojo lessons arrive as updates from Light Brands. Each update opens as a change for the owner to accept.
