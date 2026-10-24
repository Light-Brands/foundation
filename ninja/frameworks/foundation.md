---
id: frameworks/foundation
kind: framework
title: Foundation
lead: null
state: live
target: any
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, integrations-engineer, release-engineer, qa-lead, scribe, guide]
specialists: []
level: 1
version: 1
---
# Foundation

## What it is

Your command center, live: one place to run your business, opened in a browser behind your own PIN, laid out as your departments and the jobs in each. You set it up yourself in Claude Desktop, one copied prompt per step, and you end with it live on Vercel, saving to your own database, and with Claude connected to your GitHub, your Vercel and your database, so from then on you build and deploy by asking. The Ninja framework dictionary is already inside it.

The job it takes off your plate: hosting, the app, the layout of the business and the place every later build lands. What you still decide: your PIN, which you type yourself and never tell anyone, the accounts it lives in, its address, and when anything goes live.

The nine steps, each on its own page, each working in a new chat:

1. [Get Claude Desktop](foundation-setup/get-claude-desktop.md)
2. [Bring in your Foundation](foundation-setup/bring-in-your-foundation.md)
3. [Connect GitHub](foundation-setup/connect-github.md)
4. [Connect Vercel and choose your PIN](foundation-setup/connect-vercel.md)
5. [Connect your database](foundation-setup/connect-your-database.md)
6. [Go live](foundation-setup/go-live.md)
7. [Change my PIN](foundation-setup/change-my-pin.md), any time
8. [Update my Foundation](foundation-setup/update-my-foundation.md), any time
9. [Put it on my own domain](foundation-setup/own-domain.md), any time

## The bar

The command center is live on its own address, opens only with the owner's PIN, and saves to the owner's own database. "See your day" greets the business by its name. The repository, the Vercel project and the database are the owner's own, private, and share one name, `foundation-command-center`. The PIN is typed by the owner only in their own Terminal window, into Vercel, and nothing secret is ever asked for in the chat. Every step explains each command in one plain sentence and works through a real error with the owner before moving on. When the owner has a Ninja home, every role, skill and run in it keeps its name, its slug and its history inside the Foundation, and the Key checks pass.

## Depth tiers

- **Essentials.** The first six steps: Claude Desktop, the Foundation in the owner's folder, their own private GitHub repository, their own Vercel project with their PIN and business name, their own Neon database, and the command center live and saving, with a test message from the contact page in the Inbox. Claude Pro is needed, about $20 a month.
- **Complete.** Adds the command center running on the owner's own computer too, with the same PIN and data, the Ninja home moved into the Key, and the first session, which names the three parts of the business that give the most time back.
- **Mastery.** Adds the owner's own address, such as command.yourbusiness.com, and a first "Check my system" that reads everything installed and ranks the next moves.

## Questions

After the shared questionnaire, one per message:

1. "Which setup step are you on?" Default: the first step whose check does not pass yet, starting at Get Claude Desktop. Each step asks its own questions, such as the business name in Connect Vercel and choose your PIN.
2. At Complete, when a Ninja home is found: "Shall I move your Ninja home into your Foundation now? Every role, skill and run keeps its name and its history." Default: yes.
3. At Mastery: "Which domain do you own, and where did you buy it?" The suggested address is the subdomain `command.`, so your main website stays as it is.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Finds where the owner is on the path by running each step's check, holds the gates, and makes every commit with its build log entry.
- **Business analyst.** Asks the questions and drafts the run brief.
- **Integrations engineer.** GitHub, Vercel and Neon, each signed in or confirmed by the owner, and the domain's DNS record at Mastery.
- **Release engineer.** The Vercel project, its settings, the deploys, and the address at Mastery.
- **QA lead.** The proof of each step, the checks after the home moves in, and the local run.
- **Scribe.** The build log entries, the Key moved into place, and the receipt.
- **Guide.** Explains each command, the first session's three parts, the receipt and the next move.

## Data

- **The database.** The owner's own Neon database, added through Vercel and named `foundation-command-center`. Every business has three tables from the start: contacts, the Inbox cards and the business profile, in `core/db/migrations/`, made the first time the command center opens. The app reads the address Neon sets on the project, `DATABASE_URL`, then `POSTGRES_URL`, and a `FOUNDATION_DATABASE_URL`, when there is one, always wins. Run without Vercel, on the owner's computer alone, the tables live in PGlite, real Postgres stored in `.data/`.
- **The Key.** `key/key.yaml` says `home: repo` and carries `roster`, `skills`, `apps`, `routines`, `runs` and `installed`. The business facts are in `key/knowledge/context-block.yaml`, and after setup, the Preferences save is its one writer.
- **The environment.** `FOUNDATION_PIN` and `FOUNDATION_BUSINESS_NAME` on the Vercel project, beside the database address Neon adds. `.env.local` on the owner's computer is pulled from the project with `vercel env pull`, so there is one PIN. Secrets never go in the Key.

## Screens and panels

- **The gate.** Every page sits behind the PIN. The public contact page is the one page anyone can open.
- **Command center, See your day.** The business name, how many setup steps are live and which is next, the latest Inbox items, and every department with its jobs.
- **Command center, Handle what needs you.** The Inbox.
- **Settings, Set up.** The setup steps, live or next.
- **Settings, Preferences.** The business profile, saved with Save.
- **Settings, Add capabilities.** "What you have built."
- **Every other job.** A "ready to set up" page with its doors, until something is installed there.

## Routines and Inbox cards

A message sent from the public contact page lands in the Inbox as a card, "<name> sent a message". The Foundation starts with no routines: `routines: []` in `key/key.yaml`.

## Connections

Each connection has two doors: the owner connects their own account, or Light Brands builds it custom. This entry uses the first door every time, and Claude works each one from the command line in the owner's folder.

- **Claude.** Claude Desktop's Code tab, on the owner's Claude Pro or Max plan.
- **GitHub.** The GitHub CLI, signed in with `gh auth login` in the owner's own Terminal window. The command center's repository is the owner's own, private, with Light Brands' Foundation kept as `upstream` for updates.
- **Vercel.** The Vercel CLI, signed in with `vercel login` in the owner's own Terminal window. The project is connected to the repository, so every push deploys.
- **Neon.** Added through Vercel with `vercel integration add neon`, or from the project's Storage tab, confirmed by the owner in the browser.
- **The domain** (Mastery). The owner adds the full subdomain in Vercel, Settings, Domains, then adds the DNS record Vercel shows at their domain provider. On Cloudflare, the record's proxy status is DNS only.

## Autopilot

A message sent from the public contact page lands in the Inbox as a card on its own, and every routine installed later runs inside the Foundation, starting with the Monday brief.

## Proof

On the live address, the PIN opens the command center, "See your day" shows the business name, Settings, Preferences says "Saved" after Save, and a test message sent from the address's `/contact` page arrives in Handle what needs you.

- **Complete adds:** the same at http://localhost:3000 on the owner's computer, with the same PIN. When a home moved in, `npm test` passes, with the Key checks reading every file.
- **Mastery adds:** the owner's own address shows Valid Configuration in Vercel, and opens behind the PIN.

## Complete when

**Fitted.** passes when the business name, the accounts it lives in and, at Mastery, the address are the ones the owner gave.

**Autopiloted.** passes when a message sent from the public contact page lands in the Inbox as a card with no step taken by hand.

**Visible.** passes when "See your day" greets the business by its name behind the owner's PIN.

**Connected.** passes when a test message sent from the contact page arrives in Handle what needs you as one card.

**Recorded.** passes when each setup step that changed the folder has its work commit on `main` and its build log entry with `Kind: setup`, pushed to the owner's repository, and the run brief is committed last.

**Tested.** passes, from Complete, when `npm test` passes on the owner's computer, with the Key checks reading every file the home brought in.

**Proven.** passes when the command center opens behind the owner's own PIN, shows their business, and Preferences says "Saved" on the live site.

**Coherent.** passes when, after setup, the Preferences save is the one writer of the business facts, so what the owner saves in the command center is what `key/knowledge/context-block.yaml` holds for Claude to read next.

**Reversible.** passes when remove exports the business profile, contacts and Inbox to a file outside `key/` first, and the repository, the Vercel project and the domain stay the owner's to delete.

**Explained.** passes when the owner can say in one sentence where their command center runs, what it saves, and what they decide.

**Private PIN.** passes when the PIN was typed only into the owner's own Terminal window and the sign in page, and never into the chat.

## Changing it

- **Modify.** Change the PIN with [Change my PIN](foundation-setup/change-my-pin.md): Claude removes the old one, the owner types the new one into Vercel in their own Terminal window, and Claude redeploys. Changing the PIN signs everyone out. The business name changes the same way, on `FOUNDATION_BUSINESS_NAME`. Business facts change in Settings, Preferences, with Save.
- **Upgrade.** Light Brands' newer Foundation comes in with [Update my Foundation](foundation-setup/update-my-foundation.md), which keeps `key/`, the owner's settings and their own files, and puts it live on the owner's yes. A newer dictionary arrives the same way, in the `ninja/` folder, never touching the Key. To go deeper, ask for Foundation again at the next tier: the run skips what is already done, then adds what the new tier lists.
- **Remove.** The records live in the database, so remove exports the business profile, contacts and Inbox first, to a file inside the folder, outside `key/` and never committed. The repository, the Vercel project, the database and the domain belong to the owner, who deletes them in their own dashboards. The run never deletes them.

## How it is done

**What a Foundation is.** One business's command center: a Next.js app the owner opens in a browser, plus the Key, the `key/` folder that holds everything that makes the system theirs. Everything in it belongs to one of eleven departments, each a set of jobs, and every later install lands in one of them. [The Foundation primer](../foundation/primer.md) describes it in full.

**The setup path (Essentials).** Each step is its own page with four parts: a check that the steps before it are done, naming the step to return to when one is not; the actions, one at a time, each confirmed before the next; the proof the owner should see; and the next step with its prompt. Every page works cold, in a new Claude Desktop chat. The owner copies a step's prompt into the Code tab, with the `foundation-command-center` folder open, and Claude follows it.

1. [Get Claude Desktop](foundation-setup/get-claude-desktop.md): Claude Pro first, then Claude Desktop, its Code tab, and an empty folder named `foundation-command-center`.
2. [Bring in your Foundation](foundation-setup/bring-in-your-foundation.md): Node.js 20.9 or later and Git, the Foundation cloned into the folder with Light Brands' copy as `upstream`, and `npm install`.
3. [Connect GitHub](foundation-setup/connect-github.md): `gh auth login` in the owner's own Terminal window, then their own private repository, pushed.
4. [Connect Vercel and choose your PIN](foundation-setup/connect-vercel.md): `vercel login`, the project linked and connected to the repository, the PIN typed by the owner in their own Terminal window, and the business name.
5. [Connect your database](foundation-setup/connect-your-database.md): Neon through Vercel, then the project's settings pulled to the computer.
6. [Go live](foundation-setup/go-live.md): the deploy, the sign in, the Preferences save and the test message, and the local run when wanted.

Then, any time: [Change my PIN](foundation-setup/change-my-pin.md), [Update my Foundation](foundation-setup/update-my-foundation.md) and [Put it on my own domain](foundation-setup/own-domain.md).

Rules every step keeps: the owner signs in, pays and types every secret in their own browser or their own Terminal window, and Claude never asks for a password, PIN, key or code in the chat. Every new repository, project and database is the owner's own, private, named `foundation-command-center`, or `foundation-command-center-2` when that is taken, said aloud. Claude explains each command in one plain sentence before running it, and when a step fails, reads the real error, explains it plainly and works the fix with the owner.

**Moving the Ninja home in (Complete).** The home moves in without being redone, because a home path is the same path under `key/`.

1. Copy `knowledge/context-block.yaml`, `agents/` and `skills/`, when there is one, into `key/`, at the same paths. The home's `key.yaml` is merged into the Foundation's `key/key.yaml` at step 3, never copied over it.
2. Read the copied `key/knowledge/context-block.yaml` and compare it with the Foundation's fields: `business`, `short_name`, `what_we_do`, `who_we_serve`, `how_we_sound`, `website`, `email`, `phone`, `city`, `timezone`, `owner` (`name`, `first`, `role`), `stated_by` and `recorded`. A home built by the original Ninja framework session holds only `business`, `what_we_do`, `who_we_serve`, `how_we_sound`, `website`, `owner` (`name`, `role`), `stated_by` and `recorded`. Ask for each missing field, one per message, with a default the owner confirms: `short_name` from the business name, `owner.first` from `owner.name`, and the time zone from the city. Then write the full shape, before the save in Settings, Preferences. Every value the old block holds is kept as it is.
3. Merge the home's `key.yaml` into `key/key.yaml`. Take the home's `roster`, `skills`, `runs` and `installed` as they are, and the home's `provenance` fields `stated_by`, `recorded` and `guide`. Keep the Foundation's own `client`, `home: repo`, `apps`, `routines` and `provenance.base`, the commit setup recorded, where the build log starts.
4. A skill file begins with its front matter. A path comment above the opening `---` moves below the front matter.
5. The owner enters the business facts from the home's context block in Settings, Preferences, and presses Save, because after setup, that save is the one writer of the Foundation's context block.
6. The home's `CLAUDE.md` and starter kit stay with the home folder, because the Foundation has its own `CLAUDE.md` and the kit is a view of the home.
7. `npm test` reads every file and names anything to fix. Then `npm run key:sync`, the move-in's own work commit on `main`, and its build log entry, `Kind: setup`, in its own log-only commit.

[The Ninja home](../foundation/ninja-home.md) has the same steps with their reasons.

**The first session (Complete).** In Claude Code inside the command center folder, or Claude Desktop with the folder open, the assistant reads `CLAUDE.md`, then says in plain words what is running today, which setup step is next and what it gives the business, and, after asking about the business one question at a time, which three parts of it would give the most time back first. From here the dictionary is inside the Foundation, in its `ninja/` folder, so any request in that folder works without naming the Dojo.

**Your own address (Mastery).** [Put it on my own domain](foundation-setup/own-domain.md): the owner adds a subdomain such as command.yourbusiness.com in Vercel, Settings, Domains, adds the DNS record Vercel shows at their domain provider, and presses Refresh until it shows Valid Configuration.

**The record.** The record starts once the Foundation is cloned into the owner's folder. Setting up the command center is the Foundation's own work, done by its own steps, so each step that changes the folder keeps its own commits on `main`, and none of them makes a run branch: each step's prompt ends with `npm run key:sync`, a work commit, then a build log entry in `key/log/` with `Kind: setup`, in its own log-only commit naming the work commit. A step that changes only Vercel or GitHub settings changes no file and makes no commit. Every dictionary run after this entry, from the first install on, works the runner's way: one work commit and its log-only commit on its own run branch, and `main` only on the owner's yes. The request's run brief is written to `key/runs/`, kept current through these steps, and committed alone as the closing commit once the proof has passed. This entry adds no row of its own to `installed`: the app and its files ship with the Foundation, and the home's files keep the `installed` rows the home already has.

**Why the PIN never enters the chat.** A chat keeps everything typed into it. The PIN goes where only the owner types it: their own Terminal window, into Vercel, and the sign in page.

## Next

Install your first entry. The first session named the three parts of your business that would give you the most time back. Installs for those department jobs, such as Capture leads in Sales, arrive in coming updates of the dictionary. Today, start with the Monday brief, so your week lands in your Inbox on one screen: say "Install the Monday brief." When a job you want is not in the dictionary yet, the runner names the closest entry that exists and offers it. To see where everything stands first, say "Check my system."
