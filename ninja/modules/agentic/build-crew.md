---
id: modules/agentic/build-crew
kind: module
title: Build crew
lead: system-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, experience-designer, copywriter, builder, code-reviewer, security-reviewer, qa-lead, scribe]
specialists: []
level: 2
version: 1
---

# Build crew

Section: Agentic.

**The job it takes off your plate:** knowing who builds your business, and making sure they build it the same careful way every time. The build crew are the roles Claude calls on in every run of this dictionary: the run lead who holds the plan, the designers, the builders, the four reviewers, the QA lead who proves the work, and the scribe who records it. This page shows each of them, what they do and when, and lets you add a build role of your own.

**What you still decide:** whether to add your own roles, what each one checks, and whether it takes part in every run or only when a plan names it. The crew builds what you approve. Every plan still waits for your yes.

You start it from the Build crew page in the Agents group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one makes the crew visible and lets you extend it.

The crew comes with the dictionary. Each role is one page in `ninja/crew/`, and the same file sits in `.claude/agents/` as `crew-<role>.md`, which is where Claude Code finds the agents it can call on. When you open a prompt from your command center, through the door [Work with Claude](../../frameworks/work-with-claude.md) set up, and ask for an install, [the runner](../../runner/run.md) acts as the run lead and calls each crew role as a subagent for its slice, several at once where a stage runs in parallel.

The crew builds your business. [Your team](agents.md), your chief of staff, your leads and your specialists, runs it. They live in different folders on purpose: every dictionary update replaces the `crew-` files with the newest crew, and never touches a file with any other name.

This entry builds three things:

- **The Build crew page,** reading every build role on disk: the crew, any Master Agent Library roles you have added, and your own.
- **Your own build roles,** at Complete: a role for build work no crew role covers, such as a brand reviewer, kept in your Key at `key/build-roles/<name>.md` and placed for Claude Code as its twin `.claude/agents/own-<name>.md`, where updates never reach it.
- **When your own roles take part,** at Mastery: a reviewer of your own that every run must pass, set by the `when` of its row in the `build_roles` list in `key/key.yaml`.

**What you do by hand.** Answer a few questions, and approve each own role's file.

## The bar

The world-class version is the crew board a well-run agency keeps on its wall: every role, what it owns, when it steps in, and what it refuses to let through. Its test is predictability. Any run, on any day, uses the same crew in the same order, and the owner can point to the role responsible for any line of the plan. Every role on the page is a file Claude actually calls. A crew file edited by hand is caught before the next update silently replaces it. A role the owner adds survives every update, and takes part exactly when the owner said it would.

## Depth tiers

**Essentials.** The Build crew page lists every build role on disk, grouped by when it works in a run, with `npm run agents -- crew` listing the same, and the crew check in `npm test`.

Adds: one code file that reads and checks the crew, the page, the command and their tests. No table and no Key file.

**Complete.** Adds your own build role: one file, written from your answers, that Claude can call on in any run, shown on the page as yours.

Adds: per role, `key/build-roles/<name>.md`, its row in `build_roles` in `key/key.yaml`, and its twin `.claude/agents/own-<name>.md`. The twin check and the sync command join the code.

**Mastery.** Adds required roles: an own reviewer that every run changing a screen, or every run at all, must pass, set by its row's `when`, and shown on the page with the runs it reviewed.

Adds: `when` set to `screens` or `every` on the role's row, and the page's record of which runs each own role took part in, read from the run briefs in `key/runs/`. No new table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads `.claude/agents/` and `ninja/crew/`, and reflects back in two or three sentences how many crew roles are in place, whether any crew file differs from the dictionary's, and any other build role it found.

1. **What the reviewers miss.** "Every run passes four reviewers: security, compliance, experience and code. Is there anything a reviewer should always check in your business that those four would not know, such as your brand's look, a rule in your industry, or your prices?" The default is nothing more. At Essentials the answer is kept for the receipt, as the first own role to add at Complete.
2. **Work no crew role covers.** At Complete. "Is there build work you ask for often that none of the crew does well, such as editing photos for your site?" The default is the answer to question 1, as a reviewer. Each answer becomes one own role, named for its work, such as `brand-reviewer`, with its twin `own-brand-reviewer`.
3. **When it takes part.** At Mastery. "Should <your role> review every run that changes a screen, every run, or only when a plan names it?" The default is only when a plan names it. The answer is the row's `when`: `named`, `screens` or `every`.
4. **Your tools.** "Do you already have build helpers somewhere else, such as Claude Code agents in another project?" The default is none. With your yes, you point the run at the file, it reads it, and it rewrites it as an own role here, with your approval. Nothing is read without your yes.

Everything from here on is the build plan your assistant follows.

## Parts

Not part of this entry. The crew itself arrives with the dictionary, and [Work with Claude](../../frameworks/work-with-claude.md) is the habit every run starts from.

## Crew

The system lead directs this entry when the owner has the Master Agent Library. It reviews every own role against how the crew works, and rejects one that could write outside the Foundation, ask for a secret, or approve its own work.

- **Run lead:** the stages, the plan and the gates, and every commit.
- **Business analyst:** the questions, and that no own role repeats a crew role's job.
- **Experience designer:** the Build crew page, every state, on a laptop and on a phone.
- **Copywriter:** each own role's file, in the owner's words, and the page's labels.
- **Builder:** `src/lib/agents/crew.ts`, the page, the command and their tests, written test first.
- **Security reviewer:** that no own role is given tools beyond its job, and that none can write outside the Foundation or reach a secret.
- **Code reviewer:** fresh reads, and a crew check that catches a hand edit.
- **QA lead:** the proof.
- **Scribe:** the origin in `installed`, the run brief and the log.

## Data

No app and no table. The crew is files, and this entry reads them.

**Source of truth.** Each build role lives in one place:

- **The crew:** the dictionary's `ninja/crew/<role>.md`. Its twin, `.claude/agents/crew-<role>.md`, is the same file placed where Claude Code finds its agents, written only by a dictionary update, and the crew check fails when the two differ.
- **Master Agent Library roles:** the add-on is any file an `installed` row in `key/key.yaml` names, where the row has `from: master-agent-library@<version>` and lists its `.claude/agents/<id>.md` files, as the library's install writes it. A filename alone never makes a file the add-on. `docs/standards/key.md` gains that `installed` form as a shared edit, with `checkInstalled` accepting it, test first, and the canon primer names it.
- **Your own build roles:** `key/build-roles/<name>.md`, with its row in the `build_roles` list in `key/key.yaml`. Its twin, `.claude/agents/own-<name>.md`, is the same file placed where Claude Code finds it, written only by `npm run agents -- crew --sync`, and the twin check fails when the two differ.
- **When your own roles take part:** the `when` on each role's row: `named`, `screens` or `every`. [The runner](../../runner/run.md) reads it at stage 4.
- **Any other agent of yours:** any other file in `.claude/agents/` is yours, as the Foundation's `CLAUDE.md` allows. The page shows it under Yours, used when you ask for it by name.
- **Which entries call on each crew role:** the `crew` lists in the dictionary's entries in `ninja/`, read, never copied.

What the entry builds at Essentials:

- **Code:** `src/lib/agents/crew.ts`, with `readCrew(root)`, which reads `.claude/agents/` and sorts each file: `crew-` for the crew, `own-` for your build roles, the add-on by its `installed` row, and any other for yours, and returns each role's name, one line, the stage it works in, and the entries that call on it. `checkCrew(root)` compares each `crew-` file with its page in `ninja/crew/` and each `own-` twin with its source in `key/build-roles/`, byte for byte, and checks that no role folder in `key/agents/` starts with `crew-` or `own-`. Both doors call them. When [Your team](agents.md) is installed, its `readTeam` calls `readCrew` for its crew group, so the two pages never disagree.
- **The page:** `src/app/admin/(console)/agentic/[page]/CrewPage.tsx`, shown when the page is `build-crew`.
- **Tests:** `tests/unit/crew.test.ts`, which fails on a fixture crew file edited by hand, a missing crew file, an `own-` twin that differs from its source, and an owner's role named `crew-` anything, and the Key checker's test calling `checkCrew` on the real Foundation, and `tests/e2e/crew.spec.ts`, which signs in through the PIN gate and finds the crew in its groups, at phone width and at desktop width.
- **Shared edits named in the plan:** the `build-crew` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`. `next.config.ts` adds `./.claude/agents/**/*` to `outputFileTracingIncludes` when Your team has not. `src/lib/agents/agents-command.ts` gains `crew`, and when Your team is not installed, this entry adds that file and its `package.json` lines, `"preagents": "node scripts/gen-build-secret.mjs"` and `"agents": "tsx --conditions=react-server src/lib/agents/agents-command.ts"`. `docs/standards/key.md` gains `key/build-roles/`, the `build_roles` list with `when`, and the `crew-` and `own-` prefixes, with `checkKeyYaml` checking each row names a file that exists and a `when` of the three, its test written first. The dictionary's [primer](../../foundation/primer.md) lists the same in its Key table.

An own role's source, `key/build-roles/brand-reviewer.md`, as the copywriter writes it at Complete for Harbor Studio, the sample business whose context block is in [the Ninja home](../../foundation/ninja-home.md):

```markdown
---
name: own-brand-reviewer
description: Use when a run changes a screen, a page or an email the studio's customers will see, so every color, photo and line matches the studio's look before the plan is approved.
tools: Read, Grep, Glob
model: sonnet
---

# Brand reviewer

## Role
Checks that what customers see looks and sounds like Harbor Studio.

## How I work
I read the plan and the changed files, hold each against key/knowledge/voice.md and the studio's colors, and return findings to the run lead.

## What I never do
I never write a file, approve my own findings, or ask for a secret.
```

- `name` always starts with `own-`, the twin's file name, so no update replaces it and the page knows it is yours.
- `description` starts "Use when", which is how Claude Code decides when to call it.
- `tools` lists only what the job needs. A reviewer reads, and never writes.
- Its row in `key/key.yaml`: `{slug: brand-reviewer, path: build-roles/brand-reviewer.md, when: screens}`. At Complete the `when` is `named`.

## Screens and panels

**Build crew** (`/admin/agentic/build-crew`), the fifth page in the Agents group of Agentic, replaces its coming soon state with the crew in the order a run uses them, each group with its empty and error states:

- **Leads the run.** The run lead, with the stages it owns.
- **Asks and maps.** The business analyst, who asks the questions and maps what can run on its own.
- **Designs.** The solution architect, the experience designer, the copywriter, the automation engineer and the integrations engineer.
- **Builds.** The builder.
- **Reviews.** The security, compliance, experience and code reviewers.
- **Proves and ships.** The QA lead and the release engineer.
- **Records and teaches.** The scribe and the guide.
- **The bench.** The eight specialists a run calls in when an entry names them, such as finance operations.
- **The add-on.** Any Master Agent Library roles installed, marked as the add-on.
- **Yours.** At Complete, each own build role, its one line, and when it takes part, then any other agent of yours in `.claude/agents/`. With none: "Add a role of your own for work the crew does not cover.", with that install line.

Each role shows its one line from its file and, one tap away, its full page and the entries that call on it. A crew file that differs from the dictionary's shows a plain warning in place: "This file was changed by hand, and the next dictionary update will replace it. Move the change into a role of your own.", with the Copy line that does it. An `own-` twin that differs from its source shows the same way, with the line that runs the sync. At Mastery, each own role shows the runs it took part in.

## Routines and Inbox cards

Not part of this entry. The crew works inside runs, which the owner starts.

## Connections

Not part of this entry. The crew reaches a connected service only through the entry being built, and an own role's `tools` never includes one.

## Autopilot

**What runs on its own.** The crew keeps itself current. Every dictionary update replaces the `crew-` files with the newest crew, so a better reviewer or a sharper builder reaches every future run with no step from the owner. The page and the command read the files fresh on every use. The crew check runs inside every `npm test`, which every run makes before it commits, so a hand edit to a crew file is caught before an update replaces it. At Mastery, each required own role takes part in every run its `when` names, with no one remembering to ask.

**The trigger.** A dictionary update replaces the crew. The page load and the command read it. Every run's checks at stage 8 trigger the crew check, and the owner can run it with `npm test` at any time.

**The rung.** Runs and reports. The crew updates itself and the check reports a problem in plain words, without fixing it.

**The next rung.** There is none above Runs and reports. What the owner adds is more of the crew: an own role at Complete, and a required one at Mastery.

**What stays with the owner.** Every plan, every own role and when it takes part, going live, and anything outside the Foundation.

## Proof

### Essentials

**Setup.** The Foundation has its dictionary in `ninja/` and its crew in `.claude/agents/`.

**The run.** The QA lead opens Build crew and checks every group against the files: each `crew-` file has a row, and each row's one line matches its file. Then it runs `npm run agents -- crew`, which prints the same groups, and `npm run agents -- crew --check`, which prints, on a Foundation with the crew untouched:

```text
Crew: 24 roles, all matching the dictionary.
Yours: none yet.
Add-on: none.
```

Then, in a fixture copy, it changes one line of `crew-builder.md` and runs `npm test`, which fails and names the file, and the page shows the warning.

**The completion test.** All of these pass:

1. Every `crew-` file is on the page and in the command, in its group, and nothing is shown that is not on disk.
2. The crew check fails on a hand edit and on an owner's agent named `crew-` anything, and passes on the owner's real Foundation.
3. `npm test` and `npm run e2e` pass, including `tests/unit/crew.test.ts` and `tests/e2e/crew.spec.ts`.

### Complete

**The run.** With the own role written, the owner opens a fresh session with the Claude button and asks for a small change it covers, such as "Make the welcome page's heading warmer, and have my brand reviewer check it before you show me the plan." The run's plan names `own-brand-reviewer`, and its findings come back with the plan. The completion test: the page shows the role under Yours, it survives a dictionary update in a fixture, and its file passes the security reviewer.

### Mastery

**The run.** With the role's `when` set to `screens`, the next run that changes a screen names the own role in its plan at stage 4 with no one asking. The completion test: the page shows that run under the role, a run that changes no screen leaves it out, and `npm test` passes with the twin matching its source.

## Complete when

**Fitted.** passes when each own role does the work the owner named, and takes part when the owner said it would.

**Autopiloted.** passes when dictionary updates replace the crew with no step from the owner, the page reads the files fresh, the crew check runs inside every `npm test`, and required roles join their runs without being asked.

**Visible.** passes when Build crew shows every group, the add-on and yours, each with its empty state, and any crew file changed by hand shows its warning.

**Connected.** passes when each role links to its full page and the entries that call on it, and each warning carries the line that fixes it.

**Recorded.** passes when `build_roles` in `key/key.yaml` lists each own role with its `when`, the entry's `installed` row names its tier, version, `code` and each role's source in `files`, and the build log has each run's entries.

**Tested.** passes when the tests in `tests/unit/crew.test.ts` and `tests/e2e/crew.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when the crew on the page matched the files, and from Complete an own role took part in a real run.

**Coherent.** passes when both doors meet the same crew: an own role changed through Claude shows on the page at the next load, Your team and Build crew show the same crew, each twin matches its source, and the row's `when` is the one place that says when an own role takes part.

**Reversible.** passes when remove takes out the page and its code, keeps every own role unless the owner says to delete it, leaves the crew as the dictionary placed it, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the crew is and what they decide, such as "The crew builds every change I approve, the same way each time, and my own brand reviewer checks anything customers see."

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| Add an own role | `key/build-roles/<name>.md` and `key/key.yaml` | One role, through question 2, its row, and its twin by the sync. |
| What an own role does | `key/build-roles/<name>.md` | Its description, its sections, and its `tools`, which the security reviewer checks again, then the sync. |
| When it takes part | `key/key.yaml` | Its row's `when`: `named`, `screens` or `every`. |
| A crew role | Nothing in the Foundation | Crew files belong to the dictionary. Put the change in an own role instead, or ask Light Brands to change the crew. |

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder, with nothing to stop, because the command reads files and never opens the database:

- `npm run agents -- crew` prints every build role in its group, with its one line.
- `npm run agents -- crew --check` prints whether every crew file matches the dictionary and every twin its source, and each own and add-on role, and exits with a failure when one differs.
- `npm run agents -- crew --sync` writes each `own-` twin from its source in `key/build-roles/`, the twin's one writer.
- `npm run agents -- show <role>` prints one role's file, when Your team is installed.

An own role is a file in your Key, so Claude edits its source when the owner asks, such as "Have my brand reviewer also check photos are at least 1200 pixels wide", then runs the sync, and the page shows the change at the next load.

**What upgrade adds, tier by tier.** This entry's run compares each file in its row's `files` and `code` three ways, the original from the commit that added the entry's newest install or upgrade brief. Each own role's source in `key/build-roles/` is compared the same way, so every line the owner wrote stays, and the sync then rewrites its twin.

- **To Complete:** the own roles from question 2, their rows in `build_roles`, their twins, the sync and the twin check, and the Yours group on the page.
- **To Mastery:** the `when` values from question 3, and `crew.ts` reading `key/runs/` for the runs each own role took part in, with its test.

**What remove exports first.** Nothing, because the page holds no records. Remove takes out `crew.ts`, `CrewPage.tsx`, the command and the tests, and sets the page back to coming soon. Each own role's source, its row and its twin stay unless the owner says to delete them, because they are the owner's own work, and then all three go together. The crew stays, because it belongs to the dictionary.

## How it is done

**How a run calls on the crew.** The run lead dispatches each role in the entry's `crew` list that has a slice, from its file in `.claude/agents/`, several at once where a stage allows. The crew's order never changes: design, one plan, build, four reviews, tests, proof, record.

**How an own role joins a run.** At stage 4, [the runner](../../runner/run.md) reads `build_roles` in `key/key.yaml` and adds each role whose `when` matches the run to its plan, dispatched from its twin, so the owner approves it with the plan like every other role. A role at `named` joins when the owner asks for it or the run lead proposes it.

**Why the names carry a prefix.** `crew-` is the dictionary's and `own-` the owner's, so an update knows which files it may replace. Your build roles keep their source in the Key, where your work lives, and the twin is only how Claude Code finds them. Your business agents in `key/agents/` take neither prefix, because they run the business and are never called as builders.

**The first run of this entry.** The plan, shown in plan mode, lists the code, the page, the command, the tests and, at Complete, each own role's file in full. After the owner's yes, tests come first and fail, then the code, the proof, and one work commit with its log entry, [the runner](../../runner/run.md)'s way.

## Next

- [Upgrade](../../runner/verbs/upgrade.md) to Complete and add a role of your own for what the reviewers miss: "Upgrade Build crew to Complete."
- See the crew beside the team that runs your business, on [Your team](agents.md).
- Read [the runner](../../runner/run.md) to see each stage the crew works through, or ask: "Learn how the crew builds an entry."
- Open your next install through [Work with Claude](../../frameworks/work-with-claude.md), and watch the crew's roles named in its plan.
- Save a finished run as a recipe the crew can run again the same way, on [Your recipes](your-recipes.md).
