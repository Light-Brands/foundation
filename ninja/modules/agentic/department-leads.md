---
id: modules/agentic/department-leads
kind: module
title: Department leads
lead: command-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: [agents/chief-of-staff, modules/agentic/chief-of-staff]
crew: [run-lead, business-analyst, experience-designer, copywriter, builder, automation-engineer, code-reviewer, qa-lead, scribe]
specialists: []
level: 2
version: 1
---

# Department leads

Section: Agentic.

**The job it takes off your plate:** keeping every department moving when you can only look at one. Each department you run gets one lead, an agent with its own name and charter, holding that department's plan: which jobs matter most, how far each runs on its own, and what to build next. Each lead reports to your chief of staff, and every week it tells you what moved and proposes the next step.

**What you still decide:** which departments get a lead, what each plan says, and every change a lead proposes. A lead proposes and you approve. It never moves money, makes a promise to a customer, or changes a person's role or pay.

You start it from the Department leads page in the Agents group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one adds a layer to [Your team](agents.md): between your [chief of staff](chief-of-staff.md), who holds the whole business, and the [specialists](specialists.md) who each do one job well, sit your department leads, one per department you run.

Each lead is two files in your Key:

- **Its charter,** `key/agents/lead-<department>/charter.md`, with the eight sections every charter has.
- **Its department's plan,** `key/knowledge/plans/<department>.md`: the jobs in the order that matters to you, the rung each should reach, what stays with you, and the next entry to install.

The Department leads page shows every department you run with its lead, its plan, how far each job runs on its own today, and what the lead proposes next. At Complete, each lead reviews its department once a week and brings you one card for each change it proposes, plus one Lead report card with what moved, which your chief of staff's Monday brief reads into one line per lead.

**How it runs today.** The plans and the page work everywhere. The weekly reviews run on your own computer when you ask, such as "Run my Sales lead's review", until your Foundation can run a routine on its own schedule. Their cards show there.

**What you do by hand.** Name each department, answer, and decide each card.

## The bar

The world-class version is the department head a growing business promotes once the owner can no longer run every department: someone who knows the priorities cold, knows which jobs still land on the owner's desk, and walks in each Monday with one clear proposal. Its test is the plan: read cold, it tells a new hire or a fresh Claude session what the department is trying to do this quarter and what comes next. Every proposal names the entry that does it, the hours it returns and what stays with the owner.

## Depth tiers

**Essentials.** One lead for each department you name, each with its charter, its roster row reporting to your chief of staff, and its department's plan, shown on the Department leads page.

Adds: per lead, a charter and a plan in the Key. For the entry, `reports_to` on the roster, one code file for plans, the page and their tests. No table.

**Complete.** Adds each lead's weekly review, which proposes changes to its plan as Inbox cards and writes its weekly report as one card the Monday brief reads.

Adds: per lead, one routine file, and for the entry, the review command and its three card kinds. No table.

**Mastery.** Adds each lead's policy: the decisions in its department it may take on its own, written in its plan, with what it did reported in the brief. Your chief of staff passes each department's cards to its lead first.

Adds: a `## Policy` section in each plan and the policy step in each review. The hand-off itself is set by the hand-off line in the chief of staff's charter, which [Chief of staff](chief-of-staff.md) owns at Mastery. No table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. First, the run reads `installed` and the roster and reflects back which departments have entries, which have a lead, and which looks busiest.

1. **Which department.** "Which department should get a lead first? I suggest the one that costs you the most hours each week." The default is the department with the most entries installed. Questions 2 to 5 are asked once for each department the owner names, one department at a time.
2. **The name.** "What would you like to call your <department> lead?" The default is "<department> lead", such as "Sales lead". The name is the roster row's `persona`, and the owner can change it at any time with [modify](../../runner/verbs/modify.md). The role, `lead-<department id>`, never changes.
3. **What matters most.** "Here are <department>'s jobs: <the jobs>. Which matters most this quarter, and how far should each run on its own?" The default is the listed order, each at Drafts for approval. It becomes `## Priorities` and `## Rungs`.
4. **What stays with you.** "What in <department> should always come to you, whatever the lead thinks?" The default is money, promises to customers, a person's role or pay, and anything said in your name for the first time. It becomes `## Stays with the owner` and the charter's What I never do.
5. **Your tools.** "Which tools does <department> run on today?" The default is none known. Each tool named becomes a line in the plan's `## Next`, as a connection to make on the Connect your tools page in Settings, before anything is built. Nothing is read without your yes.

Everything from here on is the build plan your assistant follows.

## Parts

Installed in this order, before the entry. When a part is not installed yet, [install](../../runner/verbs/install.md) installs it first, as its own run, with its own `installed` row.

1. [Chief of staff](../../agents/chief-of-staff.md) (`agents/chief-of-staff`): the role every lead reports to.
2. At Complete, [Chief of staff](chief-of-staff.md) (`modules/agentic/chief-of-staff`) at Complete: the page and the Monday brief that read each lead's weekly report.

`uses` lists every part at any tier. A part marked At Complete installs only when the run's tier is Complete or deeper, and an upgrade to Complete installs it then.

## Crew

The command lead directs this entry when the owner has the Master Agent Library. Library leads in `.claude/agents/` direct builds. Your department leads in `key/agents/` run their department.

- **Run lead:** the stages, the plan and the gates, and every commit.
- **Business analyst:** the questions, and each plan's draft.
- **Experience designer:** one card per department, every state, phone and laptop.
- **Copywriter:** charters, plans and card titles, in the owner's words.
- **Builder:** the code and checks, test first.
- **Automation engineer:** each routine, its card kinds, and the brief's reading step.
- **Code reviewer:** no status stored in a plan, no second card in a week, and nothing kept for the owner decided by a lead.
- **QA lead:** the proof.
- **Scribe:** the roster rows, the origin in `installed`, the run brief and the log.

## Data

No app and no table. Each lead is files in the Key, and its cards are rows in the core Inbox table.

**Source of truth.** Each fact lives in one place:

- **Who leads each department:** the roster row with `role: lead-<department id>`, and its `reports_to: chief-of-staff`.
- **What the lead does and never does:** its charter, `key/agents/lead-<department id>/charter.md`.
- **The department's priorities, target rungs, what stays with the owner and what comes next:** its plan, `key/knowledge/plans/<department id>.md`.
- **What is installed in the department, and how far it runs today:** the `installed` list in `key/key.yaml` and each routine's `rung:` field in its front matter, one of the three rung names, read every time. The plan never copies them. A routine installed before the field existed shows its rung as not stated, with the line that sets it.
- **Each proposed change:** one card in the core table `inbox_items`.
- **When the review runs and its steps:** at Complete, the Key file `key/routines/lead-<department id>-review.md` and its row in `key/key.yaml`.

What the entry builds at Essentials:

- **Key files, per lead:** `key/agents/lead-<department id>/charter.md` and `key/knowledge/plans/<department id>.md`, with the roster row.
- **Code:** `src/lib/agents/plans.ts`, with `readPlans(root)`, which reads each plan's fixed headings and joins them with `installed` and the routines to give each job's state and rung today. Both doors call it.
- **The page:** `src/app/admin/(console)/agentic/[page]/LeadsPage.tsx`, shown when the page is `department-leads`.
- **Tests:** `tests/unit/plans.test.ts`, which reads the real plans and fails on a broken shape, and `tests/e2e/leads.spec.ts`, which signs in through the PIN gate and finds one lead's card with a fixture plan, at phone width and at desktop width.
- **Shared edits named in the plan:** `checkKeyYaml` in `src/lib/key/formats.ts` checks that every `reports_to` names a role on the roster, with its test written first. The `department-leads` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`. `src/lib/agents/agents-command.ts` gains `plans`, and when Your team is not installed, this entry adds that file and its `package.json` lines, `"preagents": "node scripts/gen-build-secret.mjs"` and `"agents": "tsx --conditions=react-server src/lib/agents/agents-command.ts"`. `docs/standards/key.md` gains the roster's `reports_to`, the `lead-<department id>` role, `key/knowledge/plans/` and the routine's `rung:` field, with `checkRoutine` in `src/lib/key/formats.ts` checking that `rung:`, when present, names one of the three rungs, its test written first. `docs/standards/commits.md` gains the owner commit "chore: department plans, <week>". The dictionary's [primer](../../foundation/primer.md) lists the same in its Key table.

A plan, the shape the copywriter writes, for Harbor Studio's Sales lead. The headings are fixed, because `plans.ts` reads them:

```markdown
# Sales plan

## Priorities
1. Capture leads: every trial class booking becomes a lead the same day.
2. Follow up and close: no trial student waits more than a day for a reply.
3. Take payment
4. Send proposals
5. Sign contracts

## Rungs
- Capture leads: Runs and reports
- Follow up and close: Drafts for approval

## Stays with the owner
- Any discount or refund.
- Any promise about a class that is not on the schedule.

## Next
- Connect the booking tool on the Connect your tools page.
- Install Capture leads at Essentials.
```

- `## Priorities` lists the department's jobs by their names, the first two with one line on why. A job missing from it sits at the end.
- `## Rungs` lists the rung each job should reach. What it runs at today is read from the job's routine, so the page shows both, and the gap between them is the lead's work.
- `## Next` holds at most three lines, each a connection to make or an entry to install, in order.
- No customer's name or record appears in a plan, because the Key travels with the repository.

## Screens and panels

**Department leads** (`/admin/agentic/department-leads`), the third page in the Agents group of Agentic, replaces its coming soon state with one card per department the owner runs, each with its empty and error states:

- **The lead.** Its name and its department. A department with no lead shows an open seat and its install line: "Add a lead for <department>."
- **The plan.** The top two priorities, then each job with two marks: how far it runs today, read from what is installed, and the rung the plan aims for. A job with nothing installed reads "By hand today".
- **Next.** The plan's first line under `## Next`, with its install or connect line to copy or open.
- **Waiting for you.** At Complete, the lead's open cards, linked to **Handle what needs you**, and when its review last ran. On a hosted database, it says the cards are on your own computer.

A plan that has lost one of its fixed headings shows what is missing and the Copy line that repairs it, such as "<Lead name>, repair the Sales plan." Each card links to the lead's detail on [Your team](agents.md), and once Specialists is installed, to its specialists on [Specialists](specialists.md).

## Routines and Inbox cards

At Complete, each lead gets one routine, `key/routines/lead-<department id>-review.md`, with `agent: lead-<department id>`, its department's `category` and `rung: Drafts for approval`. Its schedule is Friday at 15:00 in the owner's time zone, so the week's moves are ready for Monday's brief. Its steps:

1. **Read.** `plans.ts` reads the plan, what is installed in the department, each job's rung today, and the department's open cards.
2. **Compare.** For each job, the gap between the rung today and the plan's rung, and the hours the plan says it costs.
3. **Propose.** At most two changes a week, each as one **Plan update** card: an entry to install, a rung to climb, or a priority to move, each with the entry that does it, the hours it returns and what stays with the owner.
4. **Report.** One **Lead report** card: what moved this week and the one next step.

Three card kinds, declared in the routine's front matter:

- **Plan update.** One proposed change, with Approve and Decline. On Approve, `apply` writes the change into the plan.
- **Lead report.** One per lead per week, with what moved and the next step, and Got it. The Monday brief reads the latest Lead report per lead into one line, and closes it once the line is in the brief.
- **Lead needs you.** One per review that stops, such as a plan that has lost a heading, with the line that repairs it.

A second review in the same week adds no card. Two shared edits, named in the plan: the Monday brief's routine, `key/routines/monday-brief.md`, and its skill, `key/skills/write-the-brief/SKILL.md`, each gain the step that reads the latest Lead report per lead from `inbox_items` and writes one line each.

## Connections

Not part of this entry. Each tool a plan names is connected by its own entry, on the Connect your tools page in Settings.

## Autopilot

**What runs on its own.** Each plan's status keeps itself current, read fresh on every load. At Complete, each lead's review reads its department every Friday, proposes the next change as a card, and writes its Lead report for the Monday brief. At Mastery, each lead acts within its written policy and reports what it did.

**The trigger.** The page reads on every load. Each review runs on its `cron` line, which waits on a routine runner, so until then the owner asks, "Run my Sales lead's review", on their own computer with the command center stopped.

**The rung.** Drafts for approval. Each lead proposes, and nothing in its plan changes until the owner approves the card.

**The next rung.** Acts within policy. At Mastery the plan gains a `## Policy` section, such as "Approve a reply to a trial student that only confirms the schedule", and from then on the lead takes those decisions itself and lists them in the brief. Changes to the plan itself stay on Drafts for approval at every rung.

**What stays with the owner.** Which departments get a lead, every change to a plan, and every line under `## Stays with the owner`, at every rung.

## Proof

### Essentials

**Setup.** The chief of staff is on the roster, and the owner has named at least one department.

**The run.** The QA lead checks the lead's card against the plan and `installed`, then asks, in a fresh conversation started with the Claude button: "<Lead name>, what is your department trying to do this quarter, and what is next?" The answer names the plan's top priority and its first Next line, and the owner agrees with it.

**The completion test.** All of these pass:

1. The roster has one `lead-<department id>` row per department named, each with `reports_to: chief-of-staff`, and `npm test` fails on a fixture whose `reports_to` names a missing role.
2. Each plan has its fixed headings, and every job on the page shows its mark today read from `installed`.
3. Installing or removing an entry in the department changes its mark on the next load, with no edit to the plan.
4. `npm test` and `npm run e2e` pass, including `tests/unit/plans.test.ts` and `tests/e2e/leads.spec.ts`.

### Complete

**The run.** The QA lead runs one lead's review steps on the owner's own data, with no one stepping in between them, triggered by asking because the schedule waits on a routine runner, and the proof says so. For a run on Friday, October 9, 2026, `status` prints, such as:

```json
{"lead": "lead-sell", "week": "2026-10-05", "proposals": 1, "cards": 1, "applied": 0, "report": "Capture leads is ready to install. It returns about two hours a week."}
```

The completion test: running the review again for the same week adds no card, approving the card and running `apply` writes the change into the plan, the Lead report card is in the Inbox, and the next Monday brief carries its line.

### Mastery

**The run.** With a policy line in the plan, one card that the policy covers is handled by the lead and listed in the brief, and one card it does not cover reaches the owner. The completion test: nothing under `## Stays with the owner` was decided by the lead.

## Complete when

**Fitted.** passes when every lead's name, plan priorities, rungs, kept decisions and Next lines come from the owner's answers for that department.

**Autopiloted.** passes when each plan's status is read fresh from what is installed, each review runs from its routine file alone, and no step is left for the owner except deciding the cards.

**Visible.** passes when Department leads shows each department's lead or open seat, its plan, each job's two marks, Next and the cards waiting, each with its empty state.

**Connected.** passes when every proposed change reaches the owner as exactly one Plan update card, and each lead's week reaches the owner as one Lead report card that the Monday brief reads.

**Recorded.** passes when the roster has each lead's row, `installed` has the entry's row with every lead's files, and the build log has each run's entries.

**Tested.** passes when the tests in `tests/unit/plans.test.ts` and `tests/e2e/leads.spec.ts` and the `reports_to` check failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when a lead answered for its department in a fresh conversation, and, from Complete, its review ran on the owner's own data.

**Coherent.** passes when both doors meet the same plan: a plan changed through Claude shows on the page at the next load, and a card approved in the command center is in the plan after `apply`.

**Reversible.** passes when removing a lead moves or removes every skill and routine whose `agent` is that lead first, keeps its plan unless the owner says to delete it, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the leads do, such as "Each department has a lead that holds its plan, tells me on Friday what moved, and proposes the next step for me to approve."

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| Add a lead | The roster, a charter and a plan | One more department, asked through questions 2 to 5. "Add a lead for Finance." |
| A lead's name | `key/key.yaml` and its charter | The roster row's `persona` and the charter's first line, together. |
| Priorities, rungs, kept decisions, Next | `key/knowledge/plans/<department id>.md` | The lines under their fixed headings. |
| The review's day or time | `key/routines/lead-<department id>-review.md` | The `cron` line. Thursday at 16:00 is `cron: "0 16 * * 4"`. |
| What the lead may decide | The plan's `## Policy`, at Mastery | One line per decision. |

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder. Reading the plans needs nothing stopped. The review commands open the local database, so stop the command center first:

- `npm run agents -- plans` prints every department with its lead, its top priorities, each job's rung today and the plan's rung, and its Next.
- `npm run draft -- lead-<department id>-review plan` prints one plan joined with what is installed.
- `npm run draft -- lead-<department id>-review apply` writes every approved Plan update into the plan and prints what changed.
- `npm run draft -- lead-<department id>-review status --week <YYYY-MM-DD>` reads a week's proposals, cards and changes applied.

A plan is a file, so Claude edits it directly when the owner asks, such as "Move Take payment to the top of the Sales plan", and `npm test` checks its shape. A change written by `apply` is saved as its own commit, staged by name, as "chore: department plans, <week>".

**What upgrade adds, tier by tier.** Parts upgrade first, each in its own run. Then each file in the row's `files` and `code` is compared three ways, the original from the commit that added the entry's newest install or upgrade brief, and every line the owner wrote stays.

- **To Complete:** one routine per lead, `src/lib/agents/lead-command.ts` with the steps `plan`, `propose`, `apply`, `status` and `blocked`, the three card kinds, and the Monday brief's reading step, with their tests.
- **To Mastery:** a `## Policy` section in each plan and the policy step in each review. The hand-off line stays the chief of staff's, set by its own upgrade.

**What remove exports first.** Nothing, because plans and charters hold no records and the cards stay in the Inbox. Remove first lists every skill and routine whose `agent` is a lead, and each moves to another role or is removed, because every `agent` must name a role on the roster. Then it takes out the leads' routines, the roster rows, the charters, the code and the tests, and sets the page back to coming soon. Each plan stays in `key/knowledge/plans/` unless the owner says to delete it.

## How it is done

**Why one lead per department, and why the role is `lead-<department id>`.** A department's jobs are fixed in the Foundation's list, so a lead knows exactly what it owns. The role uses the department's id, such as `lead-money` for Finance, so it never collides with a `crew-` file or a Master Agent Library lead. The command center department belongs to your chief of staff, and Settings belongs to you, so neither gets a lead.

**Why the plan never stores a status.** A plan that said "Capture leads: done" would be wrong the day it was removed. So the plan holds only judgment, the order, the target and the next step, and the page reads the facts.

**How a lead and its specialists divide the work.** The lead holds the plan. When a job needs depth, such as keeping the books, the lead calls in a [specialist](specialists.md), whose roster row names the lead in its `reports_to`.

**The first run of this entry.** The part runs first. The plan, shown in plan mode, lists each charter, plan and roster row, the code and the tests. After the owner's yes, tests come first and fail, then the code, the proof, and one work commit with its log entry, [the runner](../../runner/run.md)'s way.

## Next

- Give a lead its first specialist, for the job that needs the most depth: "Install Specialists for my Finance lead." See [Specialists](specialists.md).
- Install the first entry in a lead's Next, such as "Install Capture leads at Essentials."
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so each lead reviews its department on Fridays and reports into the [Monday brief](../../routines/monday-brief.md): "Upgrade Department leads to Complete."
- Your [chief of staff](chief-of-staff.md) at Mastery passes each department's cards to its lead first.
- Install a whole department from its plan in one request, on [Department kits](department-kits.md).
