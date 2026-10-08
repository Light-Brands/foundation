# This is a Dojo Foundation command center

A Next.js 16 app that runs one business. The owner builds it out with prompts; you are the builder. Read this file before changing anything.

## How it is organized

Everything belongs to one of eleven categories (a founder reads them as departments, and each sub-category as a job), in this order: Command center, Marketing, Sales, Delivery, Customer care, Finance, People, Leadership, Operations, Protection, Settings. The list lives in `src/lib/layout/categories.ts`, and the categories stay the source of every job. The navigation groups the departments into six sections (Command center, Brand, Agentic, Grow, Serve, Run, plus Settings), set in `src/lib/layout/sections.ts`. Never add a category. Place every new screen in an existing category and sub-category, and its section follows from its department.

- The command center lives under `/admin`: a job's screen is `/admin/<category>/<job>` (`hrefFor` in `src/lib/layout/registry.ts` builds it), and sign-in is `/admin/login`. The public pages are `/`, `/contact`, each form at `/f/<form>` and the unsubscribe links at `/u/<token>`; everything else is behind the PIN.
- Built screens are listed in `CORE_SCREENS` in `src/lib/layout/registry.ts`.
- Every other sub-category is a "ready to set up" page with three doors (`src/components/Doors.tsx`).
- Data goes through `getDb()` from `src/lib/db`. Locally it is PGlite (real Postgres in `.data/`); on Vercel without a database it returns null and the app runs in preview. Only one program opens the local database at a time: a second program that opens it, such as a script while `npm run dev` is running, stops with "Another program has the local database open (the command center or a command such as npm run brief). Close it, then run this again. If nothing is open, delete .data/pglite.lock."
- Schema changes are new files in `core/db/migrations/` (Key apps keep theirs in `key/apps/<app>/migrations/`), numbered in order. Never edit an applied migration.
- Member-facing steps each have a prompt in `prompts/`.

## Rules

- Work one step at a time with the owner and say what they should see.
- Never ask the owner for a password, PIN, key or token in the chat. Tell them where to enter it themselves.
- Never move money, sign anything, send a customer message, or delete records without the owner's approval.
- Keep copy in US English, using commas, colons and periods with no long or short dashes, stating what things are.
- This app runs Next.js 16. Before using a Next.js API you are unsure of, read the guides in node_modules/next/dist/docs/, because Next 16 changed several APIs (for example, middleware is now src/proxy.ts).
- When the Ninja framework runner does the work, a run makes one work commit on its run branch, `run/<date>-<verb>-<entry with / as ->`, with npm run key:sync run first so key/knowledge/system.md rides in it. Then it makes one log-only commit with an entry in key/log/ (format in docs/standards/log.md) naming the work commit's id. The run goes live only by merging into `main` on the owner's yes. Work done by hand outside the runner keeps small commits in the same order: npm run key:sync, then the work commit, then the log-only commit. At the end of a build session, run prompts/update-system-docs.md.
- In the first session, before any other work, commit setup's own changes as one commit named `chore: set up <business>`, with the business name, once the owner says yes. Setup writes key/key.yaml, key/knowledge/context-block.yaml and key/knowledge/system.md, and the Preferences save writes key/key.yaml and key/knowledge/context-block.yaml. Commit every later Preferences save as one commit named `chore: business facts`. Stage each changed file by name. `next dev` never rewrites AGENTS.md or CLAUDE.md, because next.config.ts sets `agentRules: false`.
- Before you finish: run `npm test`, `npm run typecheck` and `npm run build`, and fix anything that fails.

## The Key

`key/` holds everything that makes this business's system yours: agents, skills, routines and apps, plus `key/knowledge/` (the context block and `system.md`, the plain-words record of what is built) and `key/log/` (the monthly build log). The build log stays in this repository. `system.md` goes only to your own workspace, when you connect one later. Neither holds customer details, business records or secrets. `docs/standards/key.md` has the formats.

The profile saves are the only writers of `key/knowledge/context-block.yaml`: the Preferences save, the chief of staff card on the Agents page and `npm run chief`. Each also sets `name` in `key/key.yaml` to the business name.

To rename your chief of staff from Claude Code, run `npm run chief -- "Name"`. Business facts change through Settings, Preferences or their npm commands, never by editing key/knowledge/context-block.yaml, which is rewritten on every save. `npm run key:sync` rebuilds the inventory in `system.md` and nothing else. A member upgrading from an earlier version opens Settings, then Preferences, and presses Save once, so the Key holds the business details.

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

## The Ninja framework

`ninja/` is the Ninja framework dictionary. It ships from Light Brands and is never edited here. Read `ninja/library.md` first, before building anything for this business: it is where every answer about how to build something starts, locally in `ninja/` and then online in the Dojo Dictionary at https://lb-share.lightbrands.ai/s/dvsaxjofhnyr9bb6/raw (fetch any page it links by adding `/raw`). Until a dictionary update brings `ninja/library.md`, start from that address directly. Read `ninja/guide.md` for how to ask: the sentences an owner uses to install, change, upgrade, check, remove, learn or weave anything. Read `ninja/runner/run.md` for how runs work, and follow it for every one of those requests. The crew lives in `.claude/agents/crew-*.md`, which is reserved for the dictionary's build crew and replaced on every dictionary update: a member's own agents use any other name. Your own work lives in `key/`.

## Commands

- `npm run setup -- --name "<business>" --pin-prompt`: create `.env.local`
- `npm run dev`: run locally at http://localhost:3000
- `npm test` · `npm run typecheck` · `npm run lint` · `npm run e2e` (delete .data/e2e first for a clean run)
- `npm run chief -- "<name>"`: name the chief of staff, the name every copied prompt opens with (`--clear` goes back to Claude, no name says the current one)
- `npm run auth:unlock`: the owner's way in when sign-in is waiting after many wrong PINs

## What is coming

Dictionary updates from Light Brands bring department installs and connections: every page carries its number from `ninja/foundation/numbers.yaml`, and its copied prompt points at that numbered entry once the dictionary ships it, and until then plans the job with the owner. Supabase and owner accounts arrive as updates too. Each update opens as a change for the owner to accept.
