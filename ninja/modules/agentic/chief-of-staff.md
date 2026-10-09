---
id: modules/agentic/chief-of-staff
kind: module
title: Chief of staff
lead: command-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: [agents/chief-of-staff, skills/write-the-brief, routines/monday-brief]
crew: [run-lead, business-analyst, experience-designer, copywriter, builder, automation-engineer, code-reviewer, qa-lead, scribe]
specialists: []
level: 1
version: 1
---

# Chief of staff

Section: Agentic.

**The job it takes off your plate:** being the only one who holds the whole business in mind. Your chief of staff is one agent with a name you chose, a charter it works from and a page of its own. Every prompt in your command center opens with its name, it writes your week up for you, and at Mastery it passes each department's work to that department's lead.

**What you still decide:** its name, what it may never do without you, and every decision it brings you. It reports and suggests. It never sends a message to a customer, moves money or changes a record.

You start it from the Chief of staff page in the Agents group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one turns the chief of staff role into a working member of your business. Its part, the [Chief of staff agent](../../agents/chief-of-staff.md), writes the role's charter in `key/agents/chief-of-staff/charter.md` and its row on the roster. This entry builds everything around that file:

- **One name, everywhere.** The name you give your chief of staff opens every prompt you copy or open from the command center, and the same save keeps the roster and the charter's first line in step, so Claude and the page always agree on who it is.
- **Its page.** The Chief of staff page shows the name, what the role does and never does, the skills and routines that are its work, and, at Complete, the latest Monday brief it wrote.
- **Its week.** At Complete, the [Monday brief](../../routines/monday-brief.md) and the skill it runs, [Write the brief](../../skills/write-the-brief.md), are installed as parts, with your chief of staff named as the role that runs them.
- **Its hand-offs.** At Mastery, your chief of staff passes each department's work to the [lead for that department](department-leads.md), and keeps for you only what a lead cannot decide.

It is the first agent on [Your team](agents.md), and every lead and specialist you add later reports to it.

**How it runs today.** The name works everywhere at once. The Monday brief runs on your own computer when you ask, "Run the Monday brief", until your Foundation can run a routine on its own schedule.

**What you do by hand.** Choose the name and the limits. Read the brief and decide its suggestion. At Mastery, decide what a lead brings back to you.

## The bar

The world-class version is the chief of staff a founder would hire if they could: it knows the business from the owner's own words, keeps every summary to one screen, never guesses a number, and hands every decision back with one clear suggestion. Its test is the fresh conversation. Opened with the Claude button, it answers by its name, says in two or three sentences what the business is and what its role is, and the owner agrees with every word. The name the owner chose is the name in every prompt, on every page and in every file, without one place out of step. And the week it writes lands every Monday whether or not the owner remembered to ask.

## Depth tiers

**Essentials.** Your chief of staff's page, its name in every prompt, and the name kept in step in the roster and the charter by the one save that sets it.

Adds: the charter from its part, one code file for the page and the command, the Key write that keeps the name in step, the page, and their tests.

**Complete.** Adds the Monday brief, written by your chief of staff, with the latest brief on its page.

Adds: Write the brief and the Monday brief as parts, in their own runs, and the brief panel on the page. The `briefs` table belongs to the Monday brief.

**Mastery.** Adds hand-offs. Each department with a lead gets its work from your chief of staff first, and the page shows each lead with what is waiting in its department.

Adds: the hand-off panel, the chief's standing tasks from its part's Mastery tier, and the hand-off line in the charter. No new table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. The part, [Chief of staff](../../agents/chief-of-staff.md), asks the name and who the role answers to in its own run, and those answers hold for this one. Before the first question, the run reads the profile, the roster and the charter, and says in one or two sentences what it found, such as "Your chief of staff is Avery, on the roster since October 5, and every prompt opens with Avery."

1. **Its limits.** "Your chief of staff never sends a message to a customer, moves money or changes a record without you. Is there anything else it should never do without asking?" The default is those three. Each answer becomes one line under the charter's `## What I never do`.
2. **Your Monday.** At Complete. "Shall your chief of staff write you a brief every Monday at 8:00, in your time zone?" The default is yes. A different day or time is passed to the Monday brief's own run, which asks it there.
3. **Hand-offs.** At Mastery. "When something belongs to a department that has a lead, should your chief of staff pass it to that lead first, or bring it straight to you with the lead's note?" The default is straight to you with the lead's note, the lower rung. Your answer becomes the hand-off line in the charter.
4. **Your tools.** "Do you already talk to an assistant about your business somewhere else, such as a Claude Project, and is there anything there your chief of staff should know?" The default is none. With your yes, you paste what matters into the chat, and each fact you confirm becomes one `context:` line in the charter's Memory. Nothing is read without your yes.

Everything from here on is the build plan your assistant follows.

## Parts

Installed in this order, before the entry. When a part is not installed yet, [install](../../runner/verbs/install.md) installs it first, as its own run, with its own `installed` row.

1. [Chief of staff](../../agents/chief-of-staff.md) (`agents/chief-of-staff`): the roster row and the charter.
2. At Complete, [Write the brief](../../skills/write-the-brief.md) (`skills/write-the-brief`): the skill the brief runs, with `agent: chief-of-staff`.
3. At Complete, [Monday brief](../../routines/monday-brief.md) (`routines/monday-brief`): the routine, with `agent: chief-of-staff`.

`uses` lists every part at any tier. A part marked At Complete installs only when the run's tier is Complete or deeper, and an upgrade to Complete installs it then.

## Crew

The command lead directs this entry when the owner has the Master Agent Library. It reviews the charter against the owner's answers and rejects any line that lets the role decide money, a promise to a customer or a person's role or pay.

- **Run lead:** owns the ten stages, the merged plan and the gates, and is the only one who commits.
- **Business analyst:** reads the profile, roster and charter, asks the four questions, and drafts the charter lines they add.
- **Experience designer:** the Chief of staff page and its three panels, every state, on a laptop and on a phone.
- **Copywriter:** the page's words, and the charter lines from questions 1, 3 and 4, in the owner's plain words.
- **Builder:** `src/lib/agents/chief.ts`, the Key write, the page and their tests, written test first.
- **Automation engineer:** at Mastery, the hand-off step and the chief's standing tasks.
- **Code reviewer:** that the name lives in one place and the one save writes every copy Claude reads, and that the role can send, pay and change nothing.
- **QA lead:** the proof, the fresh conversation and the rename.
- **Scribe:** the origin in `installed`, the run brief and the build log entries.

## Data

No app and no table of its own. The role lives in the Key, the name lives in your profile, and the briefs live in the Monday brief's table.

**Source of truth.** Each fact about your chief of staff lives in one place:

- **The name:** `chief_name` in your business profile, the one field the name lives in. The chief of staff card on Your team and `npm run chief` save it through `setChiefName`, Settings, Preferences saves it through `saveProfile`, both in `src/lib/data/profile.ts`, and all three check it with `cleanChiefName`. Empty means Claude.
- **What it does and never does:** the charter, `key/agents/chief-of-staff/charter.md`.
- **Its work:** the skills and routines in `key/key.yaml` whose `agent` is `chief-of-staff`.
- **Its briefs:** at Complete, the `briefs` table, one row per week, owned by the Monday brief.
- **Who reports to it:** at Mastery, each roster row whose `reports_to` is `chief-of-staff`, which [Department leads](department-leads.md) writes.

Three files carry the name for Claude to read: `key/knowledge/context-block.yaml`, the roster row's `persona`, and the charter's first line. All three are written by the save that writes the profile, and by nothing else, so they are the name's echo and never a second source. The Key write is local only: it happens where the save can reach your Foundation folder, which is your own computer, so a rename on a deployed command center saves to your database at once and reaches the Key at your next save on your computer. `--clear` writes the empty name to the profile and the context block and leaves the roster's `persona` and the charter's first line as they are, because a roster row always carries a name. The Key test compares the roster's `persona` with the context block's `chief_name` only when `chief_name` is set, and fails when they differ.

What the entry builds at Essentials:

- **Code:** `src/lib/agents/chief.ts`, with `readChief(root, db)`, which returns the name, the charter's sections, its work and, at Complete, the latest brief. Both doors call it. `src/lib/key/write.ts` gains `writeChiefPersona(root, name)`, which sets the roster row's `persona` and the charter's first line, and does nothing for an empty name.
- **Shared edits named in the plan:** the Settings action in `src/app/admin/(console)/system/settings/actions.ts` and `scripts/chief.ts` each call `writeChiefPersona` right after `writeContextBlock`. `scripts/chief.ts` gains `--status`, which prints what `readChief` returns. The `chief-of-staff` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`.
- **The page:** `src/app/admin/(console)/agentic/[page]/ChiefPage.tsx`, shown when the page is `chief-of-staff`.
- **Tests:** `tests/unit/chief.test.ts`, which renames the chief through `setChiefName` on a fixture and checks the profile, the context block, the roster row and the charter's first line all carry the new name, and that `--clear` leaves the roster row's name in place, and `tests/e2e/chief.spec.ts`, which signs in through the PIN gate, renames the chief on Your team and finds the new name on the Chief of staff page and in the page's prompt, at phone width and at desktop width.

The roster row after a rename to Morgan, for Harbor Studio, the sample business whose context block is in [the Ninja home](../../foundation/ninja-home.md):

```yaml
roster:
  - persona: Morgan
    role: chief-of-staff
    charter: agents/chief-of-staff/charter.md
    added: 2026-10-05
    version: 1
```

The role stays `chief-of-staff` forever, because every skill and routine finds the agent by it. Only the `persona` and the charter's first line, "# Morgan, chief of staff at Harbor Studio", move with the name.

## Screens and panels

**Chief of staff** (`/admin/agentic/chief-of-staff`), the second page in the Agents group of Agentic, replaces its coming soon state with three panels, each with its empty and error states:

- **Who it is.** The name, large, with "Every prompt you copy opens with this name" beneath it and a link to change it on [Your team](agents.md). Then the charter's Role line, Who I serve, and every line of What I never do, read from the file on every load. A charter that has lost a heading shows what is missing and the Copy line that repairs it.
- **Its work.** Each skill and routine whose `agent` is `chief-of-staff`, by name, with when each routine runs. With none: "Your chief of staff has no work of its own yet. Give it the Monday brief.", with that install line.
- **This week.** At Complete, the latest brief from `briefs`, its week and its first three lines, with a link to its card in **Handle what needs you**. With none yet: "No brief yet. The first is written the next time the Monday brief runs." On a deployed command center on a hosted database, the panel says the briefs are on your own computer.

At Mastery a fourth panel, **Its leads**, lists each lead that reports to the chief, its department, and the number of open cards from that department's routines, each linked to the lead's card on [Department leads](department-leads.md).

## Routines and Inbox cards

Not part of this entry. The Monday brief, a part at Complete, brings its own routine and its own brief card. At Mastery, the hand-off is one step inside each department lead's own review, which [Department leads](department-leads.md) installs.

## Connections

Not part of this entry. Your chief of staff reads only what is installed in your Foundation, and each connection it reports on belongs to the entry that made it.

## Autopilot

**What runs on its own.** The name. Every prompt in the command center, every page's Open in and Copy line and the Claude button open with it, read from the profile as the prompt is built, so a rename reaches every prompt with no other change. At Complete, the Monday brief writes your week on its schedule and puts it in your Inbox as one card. At Mastery, each department's work goes to its lead first, and only what the lead cannot decide comes to you.

**The trigger.** The name is read each time a prompt is built. The brief is triggered by its schedule, Monday at 8:00, which waits on a routine runner, so until then the owner starts it by asking, "Run the Monday brief". Hand-offs run inside each lead's review.

**The rung.** Drafts for approval. The chief writes the brief and suggests one next step, and every decision reaches you as a card.

**The next rung.** Acts within policy, for hand-offs. Once a lead's notes have been the right call for a month, the owner changes the charter's hand-off line from "bring it to me with the lead's note" to "pass it to the lead first", and from then on the lead handles what its policy covers and reports it in the brief.

**What stays with the owner.** The name. Every line of What I never do. Any message to a customer, any payment and any change to a record. Any change to a person's role or pay.

## Proof

### Essentials

**Setup.** The charter is written, the command center is running, and the owner is signed in.

**The fresh conversation.** The owner presses the Claude button in the top bar, which opens their default door on the Foundation with "<the name>, read CLAUDE.md and ninja/library.md..." already typed. The owner checks the repository or folder and presses Enter, then asks: "<the name>, tell me what you know about <the business> and what your role is." The owner comes back to the run's chat and says what the answer was, and the run waits until they do.

**The rename, through both doors.** With the owner's yes, the QA lead stops the command center and runs `npm run chief -- "<a test name>"`, starts it again and checks: the Chief of staff page shows the test name, the page's prompt opens with it, and the roster row and the charter's first line carry it. Then the owner saves their real name back on the chief of staff card on Your team, and `npm run chief -- --status` prints, for Harbor Studio:

```text
Your chief of staff is Avery.
Role: Keeps the owner's week in view.
Never: sends a message to a customer, moves money, changes a record.
Work: none yet.
```

**The completion test.** All of these pass:

1. The answer in the fresh conversation came by name, matched the context block and the charter, and the owner agreed with it.
2. After each save, the profile, the context block, the roster row and the charter's first line all carry the same name.
3. `npm test` passes, including `tests/unit/chief.test.ts` and the Key test that compares the roster with the context block when a name is set, and `npm run e2e` passes, including `tests/e2e/chief.spec.ts`.

### Complete

**The run.** The Monday brief's own proof runs, the routine's steps run end to end with no one stepping in between them, and the proof names the week it used. The completion test: This week shows that brief, the card is in the Inbox, and Its work lists the brief and the skill.

### Mastery

**The run.** With one lead installed, its review runs on the owner's data, and a card from its department reaches the owner with the lead's note, as the hand-off line says. The completion test: Its leads lists each lead with its open cards, and the charter's hand-off line matches the owner's answer to question 3.

## Complete when

**Fitted.** passes when the name, every line of What I never do, the brief's day and the hand-off line all come from the owner's answers.

**Autopiloted.** passes when the name reaches every prompt with no edit, the brief runs from its routine alone, and no step is left to the owner except deciding the cards.

**Visible.** passes when the Chief of staff page shows who it is, its work and, from Complete, this week's brief, each with its empty state.

**Connected.** passes when everything the chief produces reaches the owner as an Inbox card, and the role itself sends, pays and changes nothing.

**Recorded.** passes when the entry's `installed` row names its tier, version and `code`, each part has its own row, and the build log has each run's entries.

**Tested.** passes when the tests in `tests/unit/chief.test.ts` and `tests/e2e/chief.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when the chief answered by its name in a fresh conversation, and a rename through each door showed through the other.

**Coherent.** passes when both doors meet the same chief: a name saved on the card is the name `npm run chief` prints, the roster and the charter carry, and the next prompt opens with, and a charter changed through Claude shows on the page at the next load.

**Reversible.** passes when remove takes out the page and its code, the name stays in the profile, the charter and its part stay unless the owner removes them too, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the chief does and what they decide, such as "Avery opens every prompt, writes my week up on Monday, and I decide what to act on."

**One name.** passes when the profile's `chief_name` is the only place the name is chosen, and every file that carries it was written by the one save.

## Changing it

**What modify may change.**

| Change | Where | What changes |
|---|---|---|
| The name | The card on Your team, Settings, Preferences, or `npm run chief` | The profile, then the context block, the roster's `persona` and the charter's first line, in the one save. |
| What it never does | `key/agents/chief-of-staff/charter.md` | One line under `## What I never do`. |
| What it remembers | The same charter | One typed line under `## Memory`, such as "preference: numbers first". |
| The hand-off line | The same charter | Under `## How I work`: bring it to me with the lead's note, or pass it to the lead first. |
| The brief's day or time | The Monday brief | Its own modify, which changes its schedule and every charter line that names it. |

The role `chief-of-staff`, the charter's path and its eight headings stay, because everything finds the agent by them.

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder, with the command center stopped, because the chief command opens the local database:

- `npm run chief` prints the name every prompt opens with.
- `npm run chief -- "Name"` changes it through `setChiefName`, the same save as the card, and writes the context block, the roster's `persona` and the charter's first line.
- `npm run chief -- --clear` goes back to Claude, and leaves the roster's `persona` as it is.
- `npm run chief -- --status` prints the name, the Role line, What I never do, its work and, at Complete, the latest brief's week.

The charter is a file, so Claude edits its other lines directly when the owner asks, such as "Avery should never book a meeting on a Friday", and `npm test` checks its shape. The name is the one thing Claude never edits by hand in the charter: it changes through the save, so every copy moves together.

**What upgrade adds, tier by tier.** Upgrading this entry upgrades its parts first, each to the same tier, in its own run, [Chief of staff](../../agents/chief-of-staff.md) first. Then this entry's run compares each file in its row's `code` three ways, the original from the commit that added the entry's newest install or upgrade brief.

- **To Complete:** Write the brief and the Monday brief installed as parts, `chief.ts` reads the latest row of `briefs`, and `ChiefPage.tsx` gains This week.
- **To Mastery:** `chief.ts` reads the leads that report to the chief and their open cards, `ChiefPage.tsx` gains Its leads, and the charter gains the hand-off line and the standing tasks, written from the owner's answers.

**What remove exports first.** Nothing of its own, because the briefs belong to the Monday brief, which exports them when it is removed. Remove takes out `chief.ts`, `ChiefPage.tsx`, `writeChiefPersona` and its two calls, `--status`, and the tests, and sets the page back to coming soon. The name stays in the profile and still opens every prompt.

## How it is done

**How the hand-off reads.** At Mastery, each department lead's review collects that department's open cards. With the hand-off line at "bring it to me with the lead's note", each card reaches the owner with one line from the lead: what it would do and why. At "pass it to the lead first", the lead acts within the `## Policy` in its department's plan and reports what it did in the brief. The hand-off line is this entry's: [Department leads](department-leads.md) reads it and never writes it. Your chief of staff holds the whole picture either way: the brief names every department's moves in one screen.

**The first run of this entry.** The part runs first. After the plan is approved in plan mode, tests come first and fail, then the code, the fresh conversation and the rename, and one work commit with its log entry, [the runner](../../runner/run.md)'s way.

## Next

- Give your chief of staff its first leads, starting with the department that costs you the most hours: "Install Department leads for Sales." See [Department leads](department-leads.md).
- Install the [Monday brief](../../routines/monday-brief.md), so your chief of staff writes your week every Monday: "Install the Monday brief."
- See your whole team, the chief at the top, on [Your team](agents.md).
- [Upgrade](../../runner/verbs/upgrade.md) to Mastery once you have leads, so your chief of staff passes each department's work to its lead: "Upgrade Chief of staff to Mastery."
