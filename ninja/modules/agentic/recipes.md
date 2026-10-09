---
id: modules/agentic/recipes
kind: module
title: Library
lead: system-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, experience-designer, copywriter, builder, code-reviewer, qa-lead, scribe]
specialists: []
level: 1
version: 1
---

# Library

Section: Agentic.

**The job it takes off your plate:** knowing what your command center can do next. Every entry in the dictionary your Foundation carries shows on one page, by department and job, with whether you already have it, what it takes off your plate, and the one line that installs it. A command lists the same from Claude, so the Library is always the first place you and your agents look before anything is built from scratch.

**What you still decide:** what to install, when, and how deep. The Library shows and copies lines. It installs nothing on its own, and every install still runs through one plan you approve.

You start it from the Library page in the Recipes group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one turns the dictionary in your `ninja/` folder into a catalog you can browse. A recipe, in this group, is an install you can run: an entry of the dictionary, a [Quick win](quick-wins.md) picked for this week, a [Department kit](department-kits.md) that sets up a whole department, or one of [Your recipes](your-recipes.md), a finished run saved to run again.

The page reads three files on every load and keeps no copy of any of them:

- **What the dictionary holds:** `ninja/index.md`, the front page of the dictionary, where every entry is listed with its title, its link and one line, and each entry's own file in `ninja/`, for its tiers, its parts and its version.
- **Where each entry sits:** `ninja/foundation/numbers.yaml`, the map of numbers that the command center's pages show, which places each entry at its department and job, and names the jobs whose entry is still coming.
- **What you already have:** the `installed` list in `key/key.yaml`, one row per entry you installed, with its tier, its version and the date.

From those three it shows five groups:

- **Ready to install.** Entries whose file ships in your `ninja/` folder and that `installed` does not name, outside the path, each with its install line.
- **Installed.** Entries `installed` names, each with its tier and the line that takes it one tier deeper.
- **Coming.** Jobs the map lists with no entry yet, such as Capture leads, each with the line that plans it with you the dictionary's way, as [the library](../../library.md) describes.
- **The path.** The framework entries that brought you here, such as Prep and Foundation, each with its line to learn it again. They never show as ready to install.
- **Add-ons.** The Master Agent Library, when an `installed` row has `from: master-agent-library@<version>`, with the agent files that row names. A file in `.claude/agents/` counts as the add-on only when such a row names it.

Two doors reach the same catalog: the page reads the files on every load, and `npm run recipes` prints the same groups.

**How it runs today.** The page reads the files where it runs. Your deployed command center carries `key/` and `ninja/` with every build, so an install made on your computer shows live once it is deployed.

**What you do by hand.** Answer three questions, then choose what to install.

## The bar

The world-class version is a good hardware store's catalog: every part sorted the way the customer thinks, each with what it fixes, and a clerk who says "you already have that one" before you pay twice. Its test is the first look. When the owner wonders "can my system send review requests yet?", the Library answers in one search: installed, ready to install, or coming, with the line that acts on it. Every entry on the page ships in `ninja/`, and every entry in `ninja/index.md` is on the page. An installed entry never shows as ready, and a coming job never shows an install line that would fail. The search answers as you type, on a phone too.

## Depth tiers

**Essentials.** The Library page lists every entry in its groups, by department and job, each with its one line and its install or upgrade line, with a search in plain words. `npm run recipes` lists the same.

Adds: one code file that reads the catalog, one command, the page and their tests. No table and no Key file.

**Complete.** Adds each entry's detail one tap away: its tiers and what each adds, the parts installed first, its own page online, and, for an installed entry, its `installed` row and whether the dictionary holds a newer version.

Adds: the detail view on the page and `npm run recipes -- show <entry>`. No new table.

**Mastery.** Adds the library check. It names anything out of place: an installed entry the dictionary no longer ships, an installed entry whose parts are not installed, a numbered job whose entry file is missing, and an installed entry behind the dictionary's version. The page shows each with the line that repairs it.

Adds: `npm run recipes -- check`, and the check inside `npm test`. No new table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads `ninja/index.md`, the map and `installed`, and reflects back what it found, such as "You have installed the Monday brief and Write the brief, twelve entries are ready, and most department jobs are still coming."

1. **How to sort.** "When you open the Library, do you want it sorted by department, or by what you have and what you do not?" The default is by department. It sets the page's first view, and the other is one tap away.
2. **What to show first.** "Which department should sit at the top?" The default is the department with the most entries ready to install. It sets the order of the departments on the page.
3. **Your tools.** "Do you keep a list of things you want to set up, such as a note on your phone, a doc or a board?" The default is none. Each item you name is matched to an entry in the receipt, as ready, installed or coming, and anything with no entry is listed as a job to plan. Nothing is read without your yes.

Everything from here on is the build plan your assistant follows.

## Parts

Not part of this entry. The page reads the dictionary and the Key, which every Foundation has from setup, so it installs on its own.

## Crew

The system lead directs this entry when the owner has the Master Agent Library, the paid set of section leads and specialists, and sends back any build that keeps a copy of the catalog.

- **Run lead:** the stages, the plan and the gates, and every commit.
- **Business analyst:** the read, the three questions, and the receipt's list matched to entries.
- **Experience designer:** the groups, the search, the detail and every state, phone and laptop.
- **Copywriter:** every label, empty state and copied line, in plain words.
- **Builder:** `src/lib/recipes/library.ts`, the command, the page and their tests, written test first.
- **Code reviewer:** that every file is read fresh, nothing is copied into the database, and both doors call one function.
- **QA lead:** the proof, on the owner's own Foundation.
- **Scribe:** the origin in `installed`, the run brief and the build log entries.

## Data

No app and no table. The catalog is files, and this entry reads them.

**Source of truth.** Each fact on the page lives in one place, and the page keeps no copy:

- **Which entries the dictionary offers, and the one line for each:** `ninja/index.md`. Every list line that links a title to a file in an entry folder (`frameworks`, `blueprints`, `modules`, `agents`, `skills`, `routines` or `connections`), followed by a colon and one line, is an entry. Crew pages and the Foundation's own documents are not.
- **Each entry's tiers, parts, version and target:** the entry's own front matter in `ninja/<entry id>.md`, read through `parseFrontMatter`.
- **What each entry takes off your plate:** the entry's first bold line, "The job it takes off your plate".
- **Each entry's number, department and job:** its row in `ninja/foundation/numbers.yaml`. A row with no entry is a coming job.
- **Each entry's page online:** its row in `ninja/foundation/links.yaml`, when the entry is published.
- **What is installed, at which tier and version:** the `installed` list in `key/key.yaml`.

What the entry builds at Essentials:

- **Code:** `src/lib/recipes/library.ts`, with `readLibrary(root)`, which reads the index, each entry's front matter, the map, the links and `installed`, and returns the groups, each item's id, title, one line, number, section, department and job, tiers, parts, version, installed row and any problem found. Both doors call it, and the other entries in the Recipes group build on it.
- **The command:** `src/lib/recipes/recipes-command.ts`, run as `npm run recipes`, with its `prerecipes` line generating the build secret first, as every command does. The other three entries in the Recipes group each add their own word to this one command.
- **The page:** `src/app/admin/(console)/agentic/[page]/LibraryPage.tsx`, passed as the page's `above` when the page is `recipes`, the way Your team passes its chief of staff card.
- **Tests:** `tests/unit/library.test.ts`, which builds a fixture Foundation with an index of three entries, a map with one coming job, one installed row and one add-on row, and checks every group, and `tests/e2e/library.spec.ts`, which signs in through the PIN gate, finds each group and searches for one entry, at phone width and at desktop width.
- **Shared edits named in the plan:** `package.json` gains `"prerecipes": "node scripts/gen-build-secret.mjs"` and `"recipes": "tsx --conditions=react-server src/lib/recipes/recipes-command.ts"`, the way the Monday brief's command runs. `src/lib/dictionary/prompt.ts` gains `installPrompt`, beside `dictionaryPrompt`, so an install line and a page's copied prompt are written by one file. The `recipes` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`. `next.config.ts` needs no change: its tracing already includes `./key/**/*` and `./ninja/**/*`.

One item, as `readLibrary` returns it, for Harbor Studio, the sample business whose context block is in [the Ninja home](../../foundation/ninja-home.md):

```json
{"group": "ready", "id": "modules/agentic/research", "title": "Research", "line": "answers to your questions about your market, every finding kept with its source.", "section": "Agentic", "page": "agentic/research", "tiers": ["essentials", "complete", "mastery"], "parts": [], "version": 1, "installed": null, "link": "https://lb-share.lightbrands.ai/s/<its address>", "install": "Avery, install Research from the Ninja dictionary. In this project it is ninja/modules/agentic/research.md.", "problems": []}
```

- `line` is the entry's line in `ninja/index.md`, after the colon.
- `section` comes from the entry's number through `sectionLabel` in `src/lib/dictionary/numbers.ts`, and an entry with no number, such as Write the brief, sits under its kind, such as Skills.
- `install` opens with the chief of staff's name, read from `chief_name` in `key/knowledge/context-block.yaml`, so the command never opens the database. For a coming job, the line is the page's own copied prompt from `pagePrompt`, so the Library and the job's page always copy the same words.
- `problems` lists plain lines, such as "The index names this entry, and its file is missing."

## Screens and panels

**Library** (`/admin/agentic/recipes`), the first page in the Recipes group of Agentic, keeps its title and its Open in line, and adds the catalog above it, with every state:

- **The search.** One field at the top: "What do you want your system to do?" It matches as you type against each title, one line, department and job, and shows the groups with only what matches. With no match: "Nothing in your dictionary matches that yet." with the line that plans the job with you.
- **Ready to install.** One card per entry, sorted by the department the owner chose, each with its title, its one line, its number when it has one, and its install line to copy or open. An entry whose parts are not installed says which come first, such as "Installs Department leads first."
- **Installed.** One card per installed entry, with its tier and the date, and the line that takes it one tier deeper, such as "Upgrade Your skills to Complete." An entry at Mastery shows no line. A link to Add capabilities in Settings, where What you have built tells the story of each.
- **Coming.** One quiet row per job with no entry yet, such as "Capture leads, in a coming update", with its copied prompt.
- **The path.** Prep, Home, Foundation and Work with Claude, marked done, each with its Learn line.
- **Add-ons.** The Master Agent Library when its row exists, with the number of agents it placed. With no row, nothing shows.
- **A problem.** An entry the index names whose file is missing, or an `installed` row the Key checker flags, shows in place with a Copy line that repairs it, such as "Avery, repair the Library entry <title>." The rest of the page renders as normal.

At Complete, tapping a card opens its detail. At Mastery, the check's problems sit at the top of the page, each with its repair line.

Every Open in line waits for your Enter, as [Work with Claude](../../frameworks/work-with-claude.md) teaches.

## Routines and Inbox cards

Not part of this entry.

## Connections

Not part of this entry. A connection's own entry shows in the Library like any other, and is made on the Connect your tools page in Settings.

## Autopilot

**What runs on its own.** The catalog keeps itself current. Every load of the page and every `npm run recipes` reads the index, the map, the links and `installed` fresh, so an install, a removal or a dictionary update shows at once, with no list kept by hand. At Mastery, every `npm test`, which every run makes before it commits, runs the library check, so an installed entry whose parts are missing stops a commit.

**The trigger.** The page load and the command read the files as they run. The check runs at every run's stage 8 checks in [the runner](../../runner/run.md), and whenever the owner runs `npm test`.

**The rung.** Runs and reports. The page and the command keep the catalog current with no one starting them, and report anything out of place in plain words, without fixing it.

**The next rung.** There is none above Runs and reports. What goes deeper is [Quick wins](quick-wins.md), which picks the next install for you each week, and [Department kits](department-kits.md), which installs a whole department from its plan.

**What stays with the owner.** Every install, upgrade and removal, each through its own plan and its own yes.

## Proof

### Essentials

**Setup.** The Foundation carries the dictionary in `ninja/`, and the owner has installed at least one entry, such as the Monday brief.

**The run, the way it will run.** The QA lead opens the Library and checks each group against the files: every entry line in `ninja/index.md` has a card, every `installed` row shows as installed and never as ready, and every map row with no entry shows as coming. It searches "brief" and finds Write the brief and the Monday brief. Then, through Claude, it copies the install line of one ready entry the owner chose, runs the install to its close, and loads the page again: the entry has moved to Installed with its tier, with no edit to any list. Then it runs `npm run recipes`, which prints, for Harbor Studio:

```text
Ready to install (12)
  Agentic: Your team, Chief of staff, Department leads, Specialists, Build crew, ...
Installed (3)
  Monday brief, essentials, 2026-10-05
  Write the brief, essentials, 2026-10-05
  Research, essentials, 2026-10-09
Coming (43)
Add-ons (0)
```

**The completion test.** All of these pass:

1. Every entry in `ninja/index.md` has exactly one card, and the page shows nothing that is not in `ninja/`.
2. Every `installed` row shows in Installed, and no installed entry shows in Ready to install.
3. A fixture index that names a missing file shows that entry as a problem with its repair line, and the rest of the page still renders.
4. `npm test` passes, including `tests/unit/library.test.ts`, and `npm run e2e` passes, including `tests/e2e/library.spec.ts`.

### Complete

**The run.** The QA lead opens the detail of one installed entry and checks its tiers against the entry file's Depth tiers, its parts against `uses`, and its row against `installed`. In a fixture with the entry's `version` one ahead of the row, the detail shows "A newer version is in your dictionary" and the upgrade line. The completion test: the detail and `npm run recipes -- show <entry>` print the same tiers, parts and row.

### Mastery

**The run.** The QA lead removes a fixture entry's parts from `installed` and runs `npm run recipes -- check`, which names the entry and the missing part and exits with a failure. The completion test: the check passes on the owner's real Key, and `npm test` fails on the fixture and passes again once it is removed.

## Complete when

**Fitted.** passes when the page opens in the sort the owner chose, with the department they named at the top, and every item from their own list is matched in the receipt.

**Autopiloted.** passes when the page and the command read the catalog fresh on every use, with no list kept by hand, and, from Mastery, a broken install stops `npm test` before any commit.

**Visible.** passes when the Library shows Ready to install, Installed, Coming, The path, Add-ons, the search and any problem, each with its empty state, on a phone and on a laptop.

**Connected.** passes when every card links to what acts on it: the install or upgrade line, the job's own page for a coming job, What you have built for an installed entry, and the repair line for a problem.

**Recorded.** passes when the entry's `installed` row names its tier, version and `code`, the build log has the run's entries, and `key/knowledge/system.md` is current through `npm run key:sync`.

**Tested.** passes when the tests in `tests/unit/library.test.ts` and `tests/e2e/library.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when a real install chosen from the Library, made through Claude, moved its card from Ready to install to Installed through both doors.

**Coherent.** passes when both doors meet the same catalog: an install shows on the page at the next load, and the groups `npm run recipes` prints are the groups the page shows.

**Reversible.** passes when remove takes out the catalog, the command and their tests, the page returns to its Open in line alone, `installed` and `ninja/` stay as they are, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the page shows and where it comes from, such as "The Library shows everything my dictionary can install, what I already have, and the line that adds the next thing."

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| How the page sorts | `src/app/admin/(console)/agentic/[page]/LibraryPage.tsx` | The first view, from question 1. |
| Which department sits first | `src/app/admin/(console)/agentic/[page]/LibraryPage.tsx` | The order of the departments, from question 2. |
| The search's wording | `LibraryPage.tsx` | The prompt in the field and the empty state. |

Adding an entry to the catalog is a dictionary update from Light Brands, never an edit to this page or to `ninja/`.

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder, the recipes command reads the same files the page does, with nothing to stop first, because it reads files and never opens the database:

- `npm run recipes` lists Ready to install, Installed, Coming, The path and Add-ons, in the order the page shows them.
- `npm run recipes -- find <words>` prints the entries that match, the same way the search does.
- `npm run recipes -- show <entry>`, at Complete, prints one entry's tiers, parts, link and `installed` row, and says when the dictionary has a newer version.
- `npm run recipes -- check`, at Mastery, prints each problem and exits with a failure when there is one, so a run can stop on it.

Your agents use the same door: before any build, the runner and every section lead look in the Library first, through `npm run recipes -- find`, as [the library](../../library.md) asks.

**What upgrade adds, tier by tier.** This entry has no part. Its run compares each file in its row's `code` three ways, the original from the commit that added the entry's newest install or upgrade brief, as [upgrade](../../runner/verbs/upgrade.md) describes.

- **To Complete:** `library.ts` reads each entry's Depth tiers and compares the row's `version` with the entry's, `recipes-command.ts` gains `show`, and `LibraryPage.tsx` gains the detail view, with their tests.
- **To Mastery:** `library.ts` gains `checkLibrary`, `recipes-command.ts` gains `check`, the Key checker's test calls `checkLibrary`, and `LibraryPage.tsx` shows the check's problems first, with their tests.

**What remove exports first.** Nothing, because the page holds no records. Remove takes out `src/lib/recipes/library.ts`, `LibraryPage.tsx`, their tests and the page's catalog, and sets the page back to coming soon. When no other entry in the Recipes group is installed, it takes out `src/lib/recipes/recipes-command.ts` and its two `package.json` lines too. Remove of this entry waits while another entry in the group is installed, because each of them reads through `readLibrary`, and says which to remove first.

## How it is done

**How `readLibrary` reads.** It reads `ninja/index.md` line by line and keeps each link into an entry folder, in the index's order, with the title and the line after the colon. For each, it reads the entry's front matter for `tiers`, `uses`, `version` and `target`, and the entry's first bold line. It places every framework entry under The path, because the Foundation is past that step, and leaves out any entry whose `target` is `ninja-home`. It reads `ninja/foundation/numbers.yaml` and skips retired rows, joining each live row to its entry, and keeps each row with no entry as a coming job. It reads `ninja/foundation/links.yaml` for each entry's page online, and `key/key.yaml` for `installed`. It never writes, and it never throws on a bad file: a file it cannot read becomes a problem line on that item, so one broken file never blanks the page.

**Why three files and no copy.** The dictionary is ours to update and the Key is yours. A copy in the database would be a second answer, and after a dictionary update the page would show what was there before.

**Why one command for the Recipes group.** One command, `npm run recipes`, with one word per page, means the owner learns one door, the same way `npm run skills` serves the Skills group.

**The Library and Add capabilities.** Add capabilities, in Settings, tells the story of what you have built. The Library looks forward. Both read `installed`, so they agree.

**The first run of this entry.** The plan, shown in plan mode, lists the code file, the command, the page change, the prompt helper, the tests and the shared edits. After the owner's yes, tests come first and fail, then the code, the proof on the owner's own Foundation, and one work commit with its log entry, [the runner](../../runner/run.md)'s way.

## Next

- See the installs worth doing first, fitted to your answers, on [Quick wins](quick-wins.md): "Install Quick wins."
- Set up a whole department from its lead's plan, on [Department kits](department-kits.md): "Install Department kits."
- Save a finished run to run again, on [Your recipes](your-recipes.md): "Install Your recipes."
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so each entry's tiers and parts are one tap away: "Upgrade Library to Complete."
