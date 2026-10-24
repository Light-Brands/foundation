# The Foundation primer

Read this before you act on a Foundation. A Foundation is one business's command center: a Next.js app the owner opens in a browser, plus the Key, the folder that holds everything that makes the system theirs. The owner builds it out by asking. You are the builder. Every run follows [the runner](../runner/run.md) and obeys [the rules](rules.md).

When the business has a Ninja home and no Foundation yet, read [the Ninja home](ninja-home.md) instead. It uses the same Key shape without the app.

## Departments and jobs

Everything in a Foundation belongs to one of eleven categories, and each category has its sub-categories. The dictionary calls a category a department and a sub-category a job, because those are the words a founder uses. The ids never change: code, the Key and every folder use them.

| Department | Category id | Jobs (sub-category id) |
|---|---|---|
| Command center | `command` | See your day (`home`), Handle what needs you (`inbox`), Get alerted (`alerts`) |
| Marketing | `attract` | Create content (`content`), Post on social (`social`), Run ads (`ads`), Get referrals (`referrals`), Host events (`events`) |
| Sales | `sell` | Capture leads (`leads`), Follow up and close (`pipeline`), Send proposals (`proposals`), Take payment (`checkout`), Sign contracts (`contracts`) |
| Delivery | `deliver` | Book appointments (`booking`), Run projects (`projects`), Run programs (`programs`), Fulfill orders (`orders`) |
| Customer care | `keep` | Answer customers (`support`), Keep clients happy (`client-success`), Run a community (`community`), Collect reviews (`reviews`) |
| Finance | `money` | Invoice and collect (`invoicing`), Keep the books (`books`), Pay bills (`bills`), Prepare payroll (`pay-prep`) |
| People | `team` | Manage your team (`people`), Hire (`hiring`), Assign work (`tasks`) |
| Leadership | `plan` | Track your numbers (`scorecard`), Set priorities (`priorities`), Get reports (`reports`) |
| Operations | `vendors` | Manage suppliers (`vendors`), Track stock (`stock`), Maintain equipment (`equipment`) |
| Protection | `risk` | Stay compliant (`compliance`), Control access (`access`), Back up your data (`backups`) |
| Settings | `system` | Connect your tools (`connections`), Add capabilities (`modules`), Set up (`setup`), Users (`users`), Preferences (`settings`), Requests (`requests`) |

The list lives in `src/lib/layout/categories.ts`, and the navigation is generated from it. Never add a category or a sub-category. Place every new screen in an existing one. Built screens are listed in `CORE_SCREENS` in `src/lib/layout/registry.ts`. Every other job shows a "ready to set up" page. The same list, with labels, is [departments.yaml](departments.yaml).

## The Key

The Key is the `key/` folder. It holds the business's knowledge, roles, skills, routines and apps. It never holds customer details, business records or secrets. Business records live in the database. Secrets live in the environment: `.env.local` on the owner's computer, and the hosting environment when deployed.

| Folder or file | What it holds |
|---|---|
| `key/key.yaml` | The ring: the list of everything the Key holds |
| `key/CLAUDE.md` | One line telling the assistant to read `knowledge/context-block.yaml` and `knowledge/system.md` first, because they are the business and everything built for it so far |
| `key/knowledge/` | `context-block.yaml` (the business facts), `system.md` (the plain-words record of what is built) and, once [Story and voice](../modules/brand/story.md) is installed, `voice.md` (the voice guide every draft is written and checked against, shown on the Story and voice page in the Brand group of Context). Once [Numbers](../modules/agentic/numbers.md) is installed, `numbers.yaml` (each number defined once, with the one read-only query that counts it), and once [Research](../modules/agentic/research.md) is installed, `research/` (one note per question, every finding with its source, and at Complete `watch.yaml`). Once [Quick wins](../modules/agentic/quick-wins.md) is installed, `quick-wins.yaml` (the owner's `focus`, `limit` and `skip` rows) |
| `key/agents/<role>/charter.md` | One charter per role, eight sections. A department lead's role is `lead-<department id>`, and no role starts with `crew-` or `own-` |
| `key/skills/<slug>/SKILL.md` | One skill per folder: front matter, then Input, Steps, Output, Check. Once [Tools](../modules/agentic/tools.md) is installed, the front matter may name the services the skill uses, as `connections` |
| `key/connections/<service>.yaml` | A service's file, when it has a webhook, a sender or, once [Tools](../modules/agentic/tools.md) is installed, `actions`: what agents may read or draft with it. Tools writes the file and its first `actions` for a catalog row whose own entry did not |
| `key/routines/<slug>.md` | One routine per file: front matter with a trigger and, once [Department leads](../modules/agentic/department-leads.md) is installed, a `rung:`, checked when present to name one of the three rungs, then Goal, Steps, Expected output, Check, When blocked |
| `key/knowledge/plans/<department id>.md` | Once [Department leads](../modules/agentic/department-leads.md) is installed, one plan per department with a lead, under fixed headings |
| `key/build-roles/<name>.md` | Once [Build crew](../modules/agentic/build-crew.md) is at Complete, one source per build role of the owner's own, placed for Claude Code as its twin `.claude/agents/own-<name>.md` |
| `key/recipes/<slug>.md` | Once [Your recipes](../modules/agentic/your-recipes.md) is installed, one recipe per file: front matter with `name`, `description`, `made` and either `runs` (finished run briefs in `key/runs/`, in order) or `steps` (for a recipe shared in), then When to use, Asked again, Check |
| `key/apps/<app>/` | `definition.yaml` and `migrations/` for each data app |
| `key/runs/` | One run brief per run of this dictionary, named `<YYYY-MM-DD>-<verb>-<entry with each / as ->.md`, so a stopped run can resume |
| `key/log/<YYYY-MM>.md` | The monthly build log, one entry for each thing built |

`key.yaml` carries these lists:

- `roster`: every role, with its `persona`, `role`, `charter`, `added` and `version`, and for a lead or specialist its `reports_to`, the role it answers to.
- `build_roles`: each build role of the owner's own, with its `slug`, `path` and `when` (`named`, `screens` or `every`), once [Build crew](../modules/agentic/build-crew.md) is at Complete.
- `skills`: every skill, with its `slug`, `path` and `agent`.
- `apps`: every app, with its `slug`, `definition` and `category`.
- `recipes`: each recipe, with its `slug` and `path`, once [Your recipes](../modules/agentic/your-recipes.md) is installed.
- `routines`: every routine, with its `slug`, `path`, `agent` and `category`.
- `runs`: a list every `key.yaml` carries, empty in a new Foundation. The run briefs themselves are files in `key/runs/`, one per run of this dictionary, in the format `docs/standards/key.md` defines.
- `installed`: every entry installed from this dictionary, with `entry`, `from` (such as `dictionary@0.1.0`), `tier`, `version` (the `version` in the entry's front matter), `files` (paths relative to `key/`), `code` (the app files the entry created, as paths from the repository root under `src/` or `modules/`, left out when there are none) and `installed` (the date). A row written by a department master, such as [Marketing](../modules/attract.md), also carries `piece` (the id of the piece it built) and `label` (the piece's name), and one department may hold many such rows. This is how `upgrade` keeps the owner's own edits, and how `check` knows an entry has a newer version. The Master Agent Library's install writes an `installed` row too, with `from: master-agent-library@<version>` and the `.claude/agents/<id>.md` files it placed, and a file there is the add-on only when such a row names it.

Names are slugs: lowercase letters and digits joined by single hyphens. A role's slug is its key everywhere. Every file `key.yaml` names must exist. A Key that still says `workflows` is told to rename it to `routines`.

The Settings save is the only writer of `key/knowledge/context-block.yaml`. Never edit it by hand. `npm run key:sync` rebuilds the inventory in `system.md` and writes nothing else. The full formats, each with an example, are in `docs/standards/key.md`.

## The one data shape

An app's tables are stored exactly as its `definition.yaml` describes them. The table name is the entity key, each column is a field key, and each column's type is the SQL form of the field type. Every app table also has `id`, `created_at` and `updated_at`. One shape means nothing is ever translated, and a test catches any drift.

Field types are `text`, `number`, `date`, `select`, `multi_select`, `checkbox`, `user`, `multi_user`, `url`, `email` and `attachment`. An app's migrations live in `key/apps/<app>/migrations/`, named `NNNN_<app>_<what>.sql`. The tables every business has (contacts, the Inbox cards and the business profile) live in `core/db/migrations/`. Never edit an applied migration. Add a new one. Never add a foreign key across an app boundary. The details are in `docs/standards/data.md`.

## The app

- **Next.js 16.** Several APIs changed. The request gate is `src/proxy.ts`. `params` and `searchParams` are promises. Read `node_modules/next/dist/docs/` before using an API you are unsure of.
- **Data through `getDb()`** from `src/lib/db`. On the owner's computer it is PGlite, real Postgres stored in `.data/`.
- **On Vercel with no database,** the app runs as a preview that does not save. Connecting the owner's own Neon database from Setup makes it save there. Never run a local database container.
- **The PIN gate.** The app sits behind a PIN of 6 to 12 digits. Visitors without a session are sent to the sign in page at `/admin/login`. The command center lives under `/admin`, and the public pages, such as the welcome page at `/` and the contact page at `/contact`, are open to anyone. After five wrong tries in ten minutes, the gate refuses further tries for ten minutes. Every server action behind the gate calls `hasSession()` first. The one public action is the form action shared by the contact page and every public form at `/f/<form>`, and it only adds a declared form's message. The webhook receiver at `/api/hooks/<connection>` and the unsubscribe link at `/u/<token>` are public too, and each verifies its signature or token before it writes anything. The owner sets the PIN in their own terminal with `npm run setup -- --name "<business>" --pin-prompt`.

## The standards

`docs/standards/` holds the rules every builder follows, each with its reason: `stack`, `layout`, `glossary`, `key`, `data`, `security`, `testing`, `copy`, `prompts`, `commits`, `log` and `privacy`. Read the file for your topic before you change anything in it. Every change follows them. A standard changes only in the same pull request as the code or test that enforces it.

## The commands

| Command | What it does |
|---|---|
| `npm test` | Unit tests, including the checks on every file in `key/` |
| `npm run typecheck` | TypeScript checks |
| `npm run lint` | Lint |
| `npm run build` | The production build |
| `npm run e2e` | End-to-end tests through the PIN gate. Delete `.data/e2e` and `.data/e2e-key` first for a clean run |
| `npm run key:sync` | Rebuilds the inventory in `system.md` from `key.yaml` |
| `npm run log:sync` | Adds a build log entry for any recent commit that has none |

Always run the tools through npm. The build secret is generated before `dev`, `build`, `test` and `typecheck`, and calling the tools directly skips that step and fails.

Before you commit: `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` all pass, and `npm run e2e` too when the run changes a screen or app code. Each run works on its own branch, `run/<date>-<verb>-<entry>`, made from `main` once the plan is approved. When the checks pass: run `npm run key:sync`, make the run's one work commit, then add a build log entry in its own log-only commit that names the work commit's id and carries the line `- Entry: <entry id>`. A preview is a push of that branch. Going live is merging it into `main` and pushing `main`, only on the owner's yes at that moment, as [the runner](../runner/run.md) describes.
