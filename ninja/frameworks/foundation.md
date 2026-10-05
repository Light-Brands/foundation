---
id: frameworks/foundation
kind: framework
title: Foundation
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

Your command center, live: one place to run your business, opened in a browser behind your own PIN, laid out as your departments and the jobs in each. It deploys in minutes, runs on your own computer when you want it to save, and takes your Ninja home in as it is. The Ninja framework dictionary is already inside it, so from here you build the business out by asking.

The job it takes off your plate: hosting, the app, the layout of the business and the place every later build lands. What you still decide: your PIN, which you type yourself and never tell anyone, where it runs, its address, and when anything goes live.

The weekly Level 1 workshop runs this entry live: a Foundation set up from the Dojo link.

## The bar

The command center is live on its own link and opens only with the owner's PIN. "See your day" greets the business by its name. The PIN is typed by the owner in a place only they see: the hosting dashboard, or their own terminal. Nothing is asked for in the chat that belongs in a dashboard. When the owner has a Ninja home, every role, skill and run in it keeps its name, its slug and its history inside the Foundation, and the Key checks pass.

## Depth tiers

- **Essentials.** The command center deployed with the Deploy button on its own Vercel link, behind your PIN, with your business name on "See your day". About two minutes of building. Without a database it runs as a preview that does not save yet.
- **Complete.** Adds the command center running on your own computer and saving everything: your business profile saved in Preferences, a test message from your contact page in your Inbox, your Ninja home moved into the Key, and the first session, which names the three parts of your business that give you the most time back.
- **Mastery.** Adds your own address, such as command.yourbusiness.com, and a first "Check my system" that reads everything installed and ranks your next moves.

## Questions

After the shared questionnaire, one per message:

1. "Have you already pressed Deploy my Foundation in the Dojo?" Default: no, and the run starts there.
2. "Shall your command center run on Vercel, on your own computer, or both?" Default: Vercel at Essentials, both at Complete and Mastery.
3. "What is your business name, exactly as customers see it?" Default: the name in your Ninja home's context block, when there is one.
4. At Complete: "What is the address of the GitHub repository for your command center?" Default: the repository the Deploy button made, named command-center unless you chose another name. Then: "Which folder shall I put it in on your computer?" Default: `~/code`.
5. At Complete, when a Ninja home is found: "Shall I move your Ninja home into your Foundation now? Every role, skill and run keeps its name and its history." Default: yes.
6. At Mastery: "Which domain do you own, and where did you buy it?" The suggested address is the subdomain `command.`, so your main website stays as it is.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Finds where the owner is on the path, holds the gates, and makes every commit with its build log entry.
- **Business analyst.** Asks the questions and drafts the run brief.
- **Integrations engineer.** GitHub and Vercel at Essentials, the domain's DNS record at Mastery, each signed in or entered by the owner.
- **Release engineer.** The Deploy button path, the business name on Vercel and the redeploy, and the address at Mastery.
- **QA lead.** The local run, the checks after the home moves in, and the proof.
- **Scribe.** The build log entries, the Key moved into place, and the receipt.
- **Guide.** The first session's three parts, the receipt and the next move.

## Data

- **The database.** Every business has three tables from the start: contacts, the Inbox cards and the business profile, in `core/db/migrations/`. On the owner's computer they live in PGlite, real Postgres stored in `.data/`. On Vercel without a database the app runs as a preview that does not save. Supabase, the cloud database, arrives as an update from Light Brands.
- **The Key.** `key/key.yaml` says `home: repo` and carries `roster`, `skills`, `apps`, `routines`, `runs` and `installed`. The business facts are in `key/knowledge/context-block.yaml`, and the Preferences save is its only writer.
- **The environment.** `FOUNDATION_PIN` and `FOUNDATION_BUSINESS_NAME` on Vercel, and `.env.local` on the owner's computer, written by the setup command. Secrets never go in the Key.

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

Each connection has two doors: the owner connects their own account, or Light Brands builds it custom. This entry uses the first door every time.

- **GitHub.** Vercel signs the owner in with GitHub and makes the command center's repository in their account.
- **Vercel.** The hosting. The Deploy button asks for the PIN and the business name, and the owner types both into Vercel themselves.
- **The domain** (Mastery). The owner adds the full subdomain in Vercel, Settings, Domains, then adds the DNS record Vercel shows at their domain provider. On Cloudflare, the record's proxy status is DNS only.

## Proof

The command center opens behind the PIN, and "See your day" shows the business name.

- **Complete adds:** on the owner's computer at http://localhost:3000, the PIN opens the command center, Settings, Preferences says "Saved" after Save, and a test message sent from http://localhost:3000/contact arrives in Handle what needs you. When a home moved in, `npm test` passes, with the Key checks reading every file.
- **Mastery adds:** the owner's own address shows Valid Configuration in Vercel, and opens behind the PIN.

## Changing it

- **Modify.** Change the PIN: on Vercel in Settings, Environment Variables, then a redeploy from the Deployments tab, or on the owner's computer with `npm run setup -- --pin-prompt --force` in their own terminal. Changing the PIN signs everyone out. On Vercel, the business name changes the same way: edit `FOUNDATION_BUSINESS_NAME` in the project's Settings, Environment Variables, then redeploy. Business facts change in Settings, Preferences, with Save, which saves only when the command center runs on the owner's own computer. On Vercel without a database, a save says "Your live site is not saving yet".
- **Upgrade.** Foundation leaves no row of its own in `installed`. To go deeper, ask for Foundation again at the next tier: the run skips what is already done, then adds what the new tier lists. A newer dictionary arrives as an update from Light Brands for the owner to accept, and it replaces only the `ninja/` folder, never the Key.
- **Remove.** The records live in the database, so remove exports the business profile, contacts and Inbox first, to a file inside the folder, outside `key/` and never committed. The repository, the Vercel project and the domain belong to the owner, who deletes them in their own dashboards. The run never deletes them.

## How it is done

**What a Foundation is.** One business's command center: a Next.js app the owner opens in a browser, plus the Key, the `key/` folder that holds everything that makes the system theirs. Everything in it belongs to one of eleven departments, each a set of jobs, and every later install lands in one of them. [The Foundation primer](../foundation/primer.md) describes it in full.

**The Deploy button path (Essentials).**

1. On dojo.lightbrands.ai, the owner presses Deploy my Foundation.
2. Vercel asks them to sign in with GitHub and to name the project. The suggested name is fine.
3. Vercel asks for `FOUNDATION_PIN` and `FOUNDATION_BUSINESS_NAME`. The owner chooses a PIN of 6 to 12 digits and types it there, and types the business name as they want it shown. The assistant never asks for the PIN.
4. Vercel builds for about two minutes. At Congratulations: Continue to Dashboard, then Visit.
5. The owner enters the PIN and sees the business name on "See your day". To change the name later, the owner edits `FOUNDATION_BUSINESS_NAME` in the Vercel project settings and redeploys.

On Vercel the command center runs as a preview with no database, so nothing saves there yet, Preferences included. Saving starts when it runs on the owner's own computer, at Complete.

Pressing Deploy is the owner's own yes to going live at that moment. If any step shows an error, the owner pastes the error text and the run fixes it before moving on.

**The run locally path (Complete).**

1. Node.js 20.9 or later and Git are installed. Prep at Mastery sets both up.
2. The command center's repository is cloned into the folder the owner chose, and opened there.
3. `npm install`.
4. The owner runs `npm run setup -- --name "<business name>" --pin-prompt` in their own terminal, in that folder, and types the PIN there, privately.
5. `npm run dev`, then http://localhost:3000. The PIN opens the command center.
6. Settings, Preferences: the owner fills in the business profile and presses Save, and sees "Saved".
7. A test message from http://localhost:3000/contact, sent to themselves, arrives in Handle what needs you.

Always run the tools through npm, because the build secret is made before `dev`, `build`, `test` and `typecheck`.

**Moving the Ninja home in (Complete).** The home moves in without being redone, because a home path is the same path under `key/`.

1. Copy `knowledge/context-block.yaml`, `agents/` and `skills/`, when there is one, into `key/`, at the same paths. The home's `key.yaml` is merged into the Foundation's `key/key.yaml` at step 3, never copied over it.
2. Read the copied `key/knowledge/context-block.yaml` and compare it with the Foundation's fields: `business`, `short_name`, `what_we_do`, `who_we_serve`, `how_we_sound`, `website`, `email`, `phone`, `city`, `timezone`, `owner` (`name`, `first`, `role`), `stated_by` and `recorded`. A home built by the original Ninja framework session holds only `business`, `what_we_do`, `who_we_serve`, `how_we_sound`, `website`, `owner` (`name`, `role`), `stated_by` and `recorded`. Ask for each missing field, one per message, with a default the owner confirms: `short_name` from the business name, `owner.first` from `owner.name`, and the time zone from the city. Then write the full shape, before the save in Settings, Preferences. Every value the old block holds is kept as it is.
3. Merge the home's `key.yaml` into `key/key.yaml`. Take the home's `roster`, `skills`, `runs` and `installed` as they are, and the home's `provenance` fields `stated_by`, `recorded` and `guide`. Keep the Foundation's own `client`, `home: repo`, `apps`, `routines` and `provenance.base`, the commit setup recorded, where the build log starts.
4. A skill file begins with its front matter. A path comment above the opening `---` moves below the front matter.
5. The owner enters the business facts from the home's context block in Settings, Preferences, and presses Save, because that save is the only writer of the Foundation's context block.
6. The home's `CLAUDE.md` and starter kit stay with the home folder, because the Foundation has its own `CLAUDE.md` and the kit is a view of the home.
7. `npm test` reads every file and names anything to fix. Then `npm run key:sync`, the move-in's own work commit on `main`, and its build log entry, `Kind: setup`, in its own log-only commit.

[The Ninja home](../foundation/ninja-home.md) has the same steps with their reasons.

**The first session (Complete).** In Claude Code inside the command center folder, or Claude Desktop with the folder open, the assistant reads `CLAUDE.md`, then says in plain words what is running today, which setup step is next and what it gives the business, and, after asking about the business one question at a time, which three parts of it would give the most time back first. From here the dictionary is inside the Foundation, in its `ninja/` folder, so any request in that folder works without naming the Dojo.

**Your own address (Mastery).** The owner adds a subdomain such as command.yourbusiness.com in Vercel, Settings, Domains. Vercel shows a DNS record: its type, name and value, read back in plain words. The owner adds it at their domain provider, waits a few minutes, and presses Refresh in Vercel until it shows Valid Configuration.

**The record.** The Deploy path alone leaves no folder on the owner's computer, so it makes no commits and no build log entry. The record starts at Complete, once the repository is cloned. Setting up the command center is the Foundation's own work, done by its own steps and its own setup prompts, so each step keeps its own commits on `main`, and none of them makes a run branch: setup's changes are saved as "chore: set up <business>", a Preferences save as "chore: business facts", and the move-in and each setup prompt end with `npm run key:sync`, a work commit, then a build log entry in `key/log/` with `Kind: setup`, in its own log-only commit naming the work commit. Pressing Deploy was already the owner's yes to going live. Every dictionary run after this entry, from the first install on, works the runner's way: one work commit and its log-only commit on its own run branch, and `main` only on the owner's yes. The request's run brief is written to `key/runs/` once setup has run on the owner's computer, kept current through these steps, and committed alone as the closing commit once the proof has passed. This entry adds no row of its own to `installed`: the app and its files ship with the Foundation, and the home's files keep the `installed` rows the home already has.

**Why the PIN never enters the chat.** A chat keeps everything typed into it. The PIN goes where only the owner types it: Vercel's field, or their own terminal.

## Next

Install your first entry. The first session named the three parts of your business that would give you the most time back. Installs for those department jobs, such as Capture leads in Sales, arrive in coming updates of the dictionary. Today, start with the Monday brief, so your week lands in your Inbox on one screen: say "Install the Monday brief." When a job you want is not in the dictionary yet, the runner names the closest entry that exists and offers it. To see where everything stands first, say "Check my system."
