---
id: modules/agentic/specialists
kind: module
title: Specialists
lead: command-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: [modules/agentic/department-leads]
crew: [run-lead, business-analyst, experience-designer, copywriter, builder, automation-engineer, code-reviewer, qa-lead, scribe]
specialists: []
level: 2
version: 1
---

# Specialists

Section: Agentic.

**The job it takes off your plate:** doing the one job in a department that needs real depth, the way your best person would do it. A specialist is an agent named for that one job, such as a bookkeeper or a proposal writer, with a charter, a skill that spells out how the job is done well, and a lead it works for. Its lead calls it in, and its work reaches you as a draft.

**What you still decide:** which jobs get a specialist, what good work looks like for each, and every draft it hands you. A specialist drafts. It never sends, pays or changes a record without your yes.

You start it from the Specialists page in the Agents group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one adds specialists to [Your team](agents.md), one at a time. Each one works for a [department lead](department-leads.md), who holds the department's plan and calls the specialist in when a job needs depth. The lead decides what comes next. The specialist does that one job well.

Each specialist is three things in your Foundation:

- **Its charter,** `key/agents/<role>/charter.md`, the same eight sections every charter has, with the one job in its Role.
- **Its roster row,** in `key/key.yaml`, with `reports_to` naming its lead.
- **Its skill,** the procedure it follows every time, at `key/skills/<skill>/SKILL.md`, named in `key/key.yaml` with the specialist as its `agent`. A skill is the job written down the way your best employee would explain it, in the four sections every skill has: Input (what it reads, and when to use it), Steps (how the job is done), Output (the draft it hands back) and Check (what good looks like, and what it never does). [Write the brief](../../skills/write-the-brief.md) is the shape every skill takes.

The Specialists page shows every specialist grouped under its lead, with its one job, its skill and what it last drafted. At Complete, each specialist works on its own schedule and brings you each draft as one card. At Mastery, each draft is checked against the examples of good work you gave it.

**How it runs today.** The page works on your computer and on a deployed command center. A specialist's routine runs on your own computer when you ask, such as "Run my bookkeeper's week", with the command center stopped, until your Foundation can run a routine on its own schedule. Its cards show on your own computer, where it runs.

**What you do by hand.** Choose the job, give one example of it done well, and approve or decline each draft.

## The bar

The world-class version is the specialist a small business brings in once a job outgrows the generalist doing it: someone who does one thing with real craft, works from a written method, and hands back work the owner would sign without rewriting. Its test is the draft. Given a real week of the owner's own work, the specialist produces a draft the owner would use with at most a line changed, and its skill explains every step it took. Each specialist has exactly one job and one lead, its name says what it does, and nothing it does is outside what its skill describes.

## Depth tiers

**Essentials.** One specialist, with its charter, its roster row reporting to its lead, and its skill, shown on the Specialists page.

Adds: per specialist, a charter and a skill in the Key. For the entry, one code file, the page and their tests. No table.

**Complete.** Adds the specialist's own routine, which runs its skill on the schedule you choose and brings each draft to you as one card through its lead.

Adds: per specialist, one routine file, and for the entry, one card kind. No table.

**Mastery.** Adds the quality check: each draft is marked against the examples of good work you gave, and a draft that misses arrives with the lines that missed. Each "no" you give becomes a feedback line in the specialist's memory.

Adds: an `## Examples` section in each skill and the marking step in each routine. No table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads the roster, each lead's plan and the skills installed, and reflects back in two or three sentences which leads have specialists and which plan priority has no one doing it in depth.

1. **For which lead.** "Which of your leads should get a specialist? I suggest <the lead whose top priority has nothing installed>." The default is that lead. When the owner has no lead yet, the run offers to install [Department leads](department-leads.md) first, as a part.
2. **The one job.** "What is the one job this specialist should do better than anyone in <department>?" The default is the lead's top priority. The answer becomes the charter's Role and the skill's purpose, and names the role, such as `bookkeeper` or `proposal-writer`.
3. **The name.** "What would you like to call your <job> specialist?" The default is the job itself, such as "Bookkeeper". The name is the roster row's `persona`, and the owner can change it with [modify](../../runner/verbs/modify.md). The role never changes.
4. **What good looks like.** "Show me one example of this job done well, from your own business, or tell me what makes it good." The default is none, and then the skill's check is drafted from the lead's plan and each line is marked **Proposed** until the owner confirms it. An example never holds a customer's name or record: the run strips them before anything is written.
5. **Your tools.** "Which tool does this job happen in today?" The default is none known. Each tool named becomes a line in the lead's plan under `## Next`, as a connection to make on the Connect your tools page in Settings. Nothing is read without your yes.

Everything from here on is the build plan your assistant follows.

## Parts

Installed in this order, before the entry. When a part is not installed yet, [install](../../runner/verbs/install.md) installs it first, as its own run, with its own `installed` row.

1. [Department leads](department-leads.md) (`modules/agentic/department-leads`), with a lead for the specialist's department: the role it reports to, and the plan its job comes from.

When the dictionary has an entry for the skill the job needs, such as [Voice and writing](voice-and-writing.md), [Research](research.md), [Numbers](numbers.md) or [Tools](tools.md) in the Skills group of Agentic, that entry is installed as a part too, in its own run, with the specialist as its `agent`. Otherwise the copywriter writes the skill for this specialist from the owner's answers.

## Crew

The command lead directs this entry when the owner has the Master Agent Library, and the section lead for the specialist's department reviews its skill when that lead is installed. Library specialists in `.claude/agents/` help build. The specialists this entry adds, in `key/agents/`, run the job.

- **Run lead:** owns the ten stages, the merged plan and the gates, and is the only one who commits.
- **Business analyst:** reads the plans and the roster, asks the five questions, and checks the job has no specialist already.
- **Experience designer:** the Specialists page, grouped by lead, every state, on a laptop and on a phone.
- **Copywriter:** the charter, the skill's steps and check in the owner's words, and the card title.
- **Builder:** `src/lib/agents/specialists.ts`, the page, the command and their tests, written test first.
- **Automation engineer:** at Complete, each specialist's routine and its card kind, and at Mastery the marking step.
- **Code reviewer:** that each specialist has exactly one lead and one job, that its skill names it as `agent`, and that nothing it does reaches a customer without the owner's yes.
- **QA lead:** the proof, a real draft from the owner's own week.
- **Scribe:** the roster row, the skill's row, the origin in `installed` with the files, the run brief and the build log entries.

## Data

No app and no table. Each specialist is files in the Key, and its drafts are cards in the core Inbox table.

**Source of truth.** Each fact lives in one place:

- **Who the specialist is and who it works for:** its roster row, with `role`, `persona` and `reports_to`.
- **Its one job and what it never does:** its charter, `key/agents/<role>/charter.md`.
- **How it does the job:** its skill, `key/skills/<skill>/SKILL.md`, with the sections every skill has: Input, Steps, Output and Check, and at Mastery `## Examples`.
- **Which skills are its:** the `skills` list in `key/key.yaml`, each with its `agent`.
- **When it works:** at Complete, its routine, `key/routines/<role>-week.md`, and its row in `key/key.yaml`.
- **Each draft:** one card in the core table `inbox_items`.

What the entry builds at Essentials:

- **Key files, per specialist:** its charter and its skill, with the roster row and the skill's row.
- **Code:** `src/lib/agents/specialists.ts`, with `readSpecialists(root)`, which groups the roster's specialists under their leads and returns each one's job, its skills and any problem found, and `checkSpecialist(role, root)`, which checks the naming rule below. Both doors call it.
- **The page:** `src/app/admin/(console)/agentic/[page]/SpecialistsPage.tsx`, shown when the page is `specialists`.
- **Tests:** `tests/unit/specialists.test.ts`, which fails on a specialist with no lead, two leads, a role that starts with `crew-` or `lead-`, or a role a crew member already has, and `tests/e2e/specialists.spec.ts`, which signs in through the PIN gate and finds one specialist under its lead, at phone width and at desktop width.
- **Shared edits named in the plan:** the `specialists` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`. `src/lib/agents/agents-command.ts` gains `specialists`, and when Your team is not installed, this entry adds that file and its `package.json` lines, `"preagents": "node scripts/gen-build-secret.mjs"` and `"agents": "tsx --conditions=react-server src/lib/agents/agents-command.ts"`. `docs/standards/key.md` gains the naming rule below and a specialist's `reports_to`, which must name a `lead-` role, with `checkKeyYaml` checking both, its test written first. The dictionary's [primer](../../foundation/primer.md) lists the same in its Key table.

**The naming rule.** A specialist's role names its job in plain words, as a lowercase slug, such as `bookkeeper` or `proposal-writer`. It never starts with `crew-` or `lead-`, and never matches a crew role in `ninja/crew/` or a file an `installed` row with `from: master-agent-library@<version>` names. So `copywriter`, which the crew already has, becomes `content-writer`.

Harbor Studio's bookkeeper, the sample business whose context block is in [the Ninja home](../../foundation/ninja-home.md), as its roster row and skill row:

```yaml
roster:
  - persona: Bookkeeper
    role: bookkeeper
    charter: agents/bookkeeper/charter.md
    reports_to: lead-money
    added: 2026-10-12
    version: 1
skills:
  - slug: weekly-books
    path: skills/weekly-books/SKILL.md
    agent: bookkeeper
```

And the skill's Check, as the copywriter writes it from the owner's answer at question 4:

```markdown
## Check
- Every payment in the week is in exactly one category, and the totals match the bank's for the same dates.
- A payment the skill cannot place is listed for the owner, never guessed.
- No amount is rounded.
- Proposed: class pass sales are split from private sessions.
```

## Screens and panels

**Specialists** (`/admin/agentic/specialists`), the fourth page in the Agents group of Agentic, replaces its coming soon state with one group per lead, each with its empty and error states:

- **The lead.** Its name and department, linked to its card on [Department leads](department-leads.md).
- **Its specialists.** One card each: the name, the one job, the skill by name, and, at Complete, when its routine last ran and how many of its drafts are waiting. A lead with none: "<Lead name> works without specialists for now."
- **Ready to add.** For each lead, its plan's top priority with no specialist, with the install line: "Add a <job> specialist for <lead name>."
- **A problem.** A specialist with no lead, a lead that is gone, or a skill whose `agent` is missing shows in place with its repair line.

At Mastery, each card also shows how its last five drafts were marked, and the feedback lines its memory has gained.

## Routines and Inbox cards

At Complete, each specialist gets one routine, `key/routines/<role>-week.md`, with `agent` set to the specialist and the lead's department as its `category`. Its schedule is the one the owner chooses, weekly by default, Monday at 7:00, so its draft is ready before the brief. Its steps:

1. **Gather.** Read what its skill's Input names, from what is installed and connected.
2. **Draft.** Run the skill's Steps.
3. **Check.** Hold the draft against the skill's Check, and at Mastery mark it against `## Examples`.
4. **Hand over.** One **Specialist draft** card, titled "<Name> drafted <the job> for <the week>", carrying the draft, the check's result and the lead's one line, with Use and Send back.

One card kind, **Specialist draft**. A second run in the same week adds no card. Send back asks the owner for one line on why, which at Mastery becomes a `feedback:` line in the specialist's Memory.

## Connections

Not part of this entry. A specialist reads a tool only through the connection its own entry made on the Connect your tools page in Settings, and its skill's Input names which.

## Autopilot

**What runs on its own.** At Complete, each specialist does its job on its schedule: it gathers, drafts, checks its own work and hands the draft to you through its lead as one card, with no one starting it. At Mastery, each draft is marked against your examples before you see it, and every reason you give for sending one back is remembered.

**The trigger.** Its schedule, the `cron` line in its routine file, which waits on a routine runner. Until then the owner starts it by asking, "Run my bookkeeper's week", on their own computer with the command center stopped. Its lead's review can also name it, and then the lead's card says so.

**The rung.** Drafts for approval. The specialist drafts, and you use it or send it back.

**The next rung.** Acts within policy, when its lead's plan has a `## Policy` line that covers the specialist's draft, such as "File the week's categories when every payment is placed." From then on a draft that passes its check is filed and listed in the brief, and only one that misses reaches you.

**What stays with the owner.** Every payment, every message to a customer and every change to a record. Which jobs get a specialist. What good looks like.

## Proof

### Essentials

**Setup.** The lead is on the roster, and the specialist's charter and skill are written.

**The run.** The owner opens a fresh conversation with the Claude button and asks: "<Specialist name>, do <the job> for <a real item from this week>." The specialist follows its skill on the owner's own data and returns a draft, naming each step it took. The owner comes back to the run's chat and says whether they would use it, and the run waits until they do. For Harbor Studio's bookkeeper, the item is the week of October 5, 2026.

**The completion test.** All of these pass:

1. The roster row names exactly one lead, the role passes the naming rule, and the skill's row names the specialist as `agent`.
2. The owner would use the draft with at most a line changed. When they would not, the skill's steps or check are fixed with them and the run asks again.
3. Specialists shows the specialist under its lead, with its job and its skill.
4. `npm test` and `npm run e2e` pass, including `tests/unit/specialists.test.ts` and `tests/e2e/specialists.spec.ts`.

### Complete

**The run.** The QA lead runs the routine's steps on the owner's own data, with no one stepping in between them, triggered by asking because the schedule waits on a routine runner, and the proof says so. The completion test: one Specialist draft card arrives, running again for the same week adds none, and Send back records the owner's line.

### Mastery

**The run.** The routine marks a real draft against `## Examples`. The completion test: a draft that misses arrives with the lines that missed, and a Send back adds one `feedback:` line to the specialist's Memory.

## Complete when

**Fitted.** passes when the lead, the job, the name and the skill's check all come from the owner's answers, and every line the owner has not confirmed is marked Proposed.

**Autopiloted.** passes when, from Complete, the routine runs from its file alone and no step is left for the owner except using or sending back the draft.

**Visible.** passes when Specialists shows each specialist under its lead, ready to add and any problem, each with its empty state.

**Connected.** passes when every draft reaches the owner as exactly one Specialist draft card, through the lead it reports to.

**Recorded.** passes when the roster row, the skill's row and the entry's `installed` row with the specialist's files are in `key/key.yaml`, and the build log has the run's entries.

**Tested.** passes when the tests in `tests/unit/specialists.test.ts` and `tests/e2e/specialists.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when the specialist drafted its job on a real item from the owner's own week, and the owner would use it.

**Coherent.** passes when both doors meet the same specialist: a skill changed through Claude shows on the page at the next load, and a Send back given in the command center is in the specialist's memory the next time it drafts.

**Reversible.** passes when removing a specialist removes or reassigns its skill and routine first, keeps its cards in the Inbox, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the specialist does and what they decide, such as "My bookkeeper sorts the week's payments every Monday, and I approve the draft."

**One job.** passes when each specialist has exactly one job, one lead and at least one skill, and no two specialists do the same job.

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| Add a specialist | The roster, a charter and a skill | One more specialist, asked through questions 1 to 5. "Add a proposal writer for my Sales lead." |
| Its name | `key/key.yaml` and its charter | The roster row's `persona` and the charter's first line, together. |
| How it does the job | `key/skills/<skill>/SKILL.md` | The Steps or the Check. |
| Its examples | The same skill, at Mastery | One example under `## Examples`, with no customer's name or record. |
| When it works | `key/routines/<role>-week.md` | The `cron` line. Fridays at 9:00 is `cron: "0 9 * * 5"`. |
| Its lead | `key/key.yaml` | The roster row's `reports_to`, and the routine's `category` with it. |

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder. Reading needs nothing stopped. The routine opens the local database, so stop the command center first:

- `npm run agents -- specialists` prints every specialist under its lead, with its job, its skill and any problem.
- `npm run agents -- specialists --check <role>` checks a proposed role against the naming rule before it is written.
- `npm run draft -- <role>-week status --week <YYYY-MM-DD>` reads a week's draft and its result.

A skill is a file, so Claude edits it directly when the owner asks, such as "Tell my bookkeeper to list refunds on their own line", and `npm test` checks its shape.

**What upgrade adds, tier by tier.** Upgrading this entry upgrades its part first, in its own run. Then this entry's run compares each file in its row's `files` and `code` three ways, the original from the commit that added the entry's newest install or upgrade brief. Every line the owner wrote in a charter or a skill stays as it is.

- **To Complete:** one routine per specialist and the Specialist draft card kind, with their tests.
- **To Mastery:** `## Examples` in each skill, the marking step in each routine, and the feedback line on Send back.

**What remove exports first.** Nothing, because a specialist holds no records and its cards stay in the Inbox. Remove first moves or removes every skill and routine whose `agent` is the specialist, then takes out its roster row and charter. Removing the entry takes out every specialist that way, then the code and the tests, and sets the page back to coming soon.

## How it is done

**Why one job each.** A specialist with two jobs needs two methods, and a draft from it can follow the wrong one. One job means one skill, one check and one clear name, and a second job is a second specialist.

**Why the skill holds the craft.** The charter says who the specialist is. The skill says how the work is done, step by step, with a test of good work and a line on what it never does. A skill that only restates what any model knows teaches nothing, so the copywriter writes it from the owner's own example and the lead's plan, and the system lead's review rejects one with no steps or no check.

**Why the lead stays in the middle.** Every draft reaches the owner through the lead the specialist reports to, so the department's plan stays in one hand and the owner sees one voice per department. At Mastery, when the lead's policy covers a draft, the lead files it and the owner sees it in the brief.

**The first run of this entry.** The part runs first when the lead is missing. Then the run lead reads the plans, asks the questions and shows the plan in plan mode: the charter, the skill, the roster row, the code and the tests. With the owner's yes, the builder writes the tests first and sees them fail, then the code. The QA lead runs the proof on the owner's own week, the scribe records the origin, and the run makes its one work commit and its log entry, [the runner](../../runner/run.md)'s way.

## Next

- Add the next specialist on your busiest lead's plan: "Add a proposal writer for my Sales lead."
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so each specialist works on its own schedule: "Upgrade Specialists to Complete."
- See every specialist in its place on the team map, on [Your team](agents.md).
- See every skill your specialists use on [Your skills](skills.md).
