---
id: modules/agentic/department-kits
kind: module
title: Department kits
lead: system-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: [modules/agentic/recipes, modules/agentic/department-leads]
crew: [run-lead, business-analyst, experience-designer, copywriter, builder, automation-engineer, compliance-reviewer, code-reviewer, qa-lead, scribe]
specialists: []
level: 2
version: 1
---

# Department kits

Section: Agentic.

**The job it takes off your plate:** setting up a whole department one job at a time. A department kit is every job in one department, in the order its lead's plan puts them, each with the dictionary entry that does it. One request installs the kit: every entry that is ready, one after another, each at the rung the plan aims for, with the jobs that belong to you kept with you.

**What you still decide:** which kit to install, how deep, and every plan inside it. Each install in a kit still shows you its own plan and waits for your yes. Money, contracts, people and anything said in your name for the first time stay with you, whatever the kit says.

You start it from the Department kits page in the Recipes group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one turns each department's plan into an install you can run.

Each department you run has a lead, from [Department leads](department-leads.md), and each lead holds its department's plan: the jobs in the order that matters to you, the rung each should reach, and what stays with you. That plan is the kit. The lead owns it, and this entry reads it against the dictionary:

- **The jobs,** from the Foundation's list of departments and jobs, the same one the navigation uses.
- **The entry for each job,** from `ninja/foundation/numbers.yaml`, the map the [Library](recipes.md) reads. A job whose row names no entry is coming.
- **What is installed, and how far it runs today,** from `installed` in `key/key.yaml` and each routine's `rung:` field.
- **The order, the target rungs and what stays with you,** from the lead's plan in `key/knowledge/plans/<department id>.md`.

There is no kit file. A kit is the lead's plan read against the dictionary, so changing a kit is changing the plan, and a dictionary update that adds a job's entry adds it to the kit at once.

The Department kits page shows one card per department: its lead, each job with its entry and its two marks, how far it runs today and the rung the plan aims for, and the kit line that installs every ready job in order.

**How it runs today.** The page and the kit request work everywhere you run Claude Code. Today the dictionary holds no entries for the department jobs, such as Capture leads, so every kit shows its jobs as coming and says so plainly. Each kit fills as those entries arrive in coming updates, with no change on your side.

**What you do by hand.** Answer, approve each plan in the kit, and decide what stays with you.

## The bar

The world-class version is the playbook a franchise hands a new location: every function in order, each with its tested setup, and a clear line on which calls the owner always makes. Its test is a second department. An owner who has installed the Sales kit asks for the Customer care kit and finds the same shape: the lead's plan, one request, each job proven before the next, nothing about money or people decided without them. The page never shows a job as installable when its entry is coming, never orders a kit any way but the plan's, and never sets an owner-only job above Drafts for approval.

## Depth tiers

**Essentials.** The Department kits page shows each department's kit from its lead's plan, and one request installs every ready entry in a kit, in order, each as a full run with its own proof. `npm run recipes -- kits` prints the same kits.

Adds: one code file that reads the kits, the page, the word on the recipes command and their tests. No table and no Key file.

**Complete.** Adds the kit step to each lead's weekly review: the lead proposes the next ready entry in its kit as one Plan update card, and its Lead report names any job a dictionary update made ready.

Adds: one step in each lead's review routine and its handler. No new card kind and no table.

**Mastery.** Adds the kit check: each installed job running below its plan's rung, with the line that takes it there, reported in the lead's review. A finished kit can be saved as one recipe on [Your recipes](your-recipes.md), so a second location sets up the same department the same way.

Adds: `npm run recipes -- kits --check` and the check step in each review. No table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads each plan, the map and `installed`, and reflects back what it found, such as "Your Sales lead's plan starts with Capture leads and Follow up and close. Neither has an entry yet, so the Sales kit is waiting on coming updates."

1. **Which kit first.** "Which department's kit should we set up first?" The default is the department whose plan's first Next line names an entry that is ready, else the department of your first lead.
2. **How deep.** "Should each install in a kit stop at Essentials, or go to the tier its plan's rung needs?" The default is Essentials, with the plan's rung named as the next step. It is asked again at each kit request.
3. **Your tools.** "Which tools does this department run on today?" The default is the tools its plan's Next already names. Each tool becomes a connection to make on the Connect your tools page in Settings, before the first install that needs it. Nothing is read without your yes.

What stays with you is never asked here. It is the plan's `## Stays with the owner`, which the lead holds and you set in [Department leads](department-leads.md).

Everything from here on is the build plan your assistant follows.

## Parts

Installed in this order, before the entry. When a part is not installed yet, [install](../../runner/verbs/install.md) installs it first, as its own run, with its own `installed` row.

1. [Library](recipes.md) (`modules/agentic/recipes`): the catalog and the `npm run recipes` command.
2. [Department leads](department-leads.md) (`modules/agentic/department-leads`), with at least one lead: the plans every kit is read from. At Complete, Department leads at Complete, whose weekly review the kit step joins.

`uses` lists every part at any tier. A part marked At Complete installs only when the run's tier is Complete or deeper, and an upgrade to Complete installs it then.

## Crew

The system lead directs this entry when the owner has the Master Agent Library, and each department's own lead in `key/agents/` holds the plan its kit follows.

- **Run lead:** the stages, the plan and the gates, every commit, and in a kit request, the order of the runs.
- **Business analyst:** the read, the questions, and each kit's receipt.
- **Experience designer:** one card per department, every state, phone and laptop.
- **Copywriter:** each label, empty state and kit line, in plain words.
- **Builder:** `src/lib/recipes/kits.ts`, the page, the command word and their tests, written test first.
- **Automation engineer:** at Complete, the kit step in each lead's review.
- **Compliance reviewer:** that no job in Finance, Sign contracts, Manage your team or Hire is set above Drafts for approval, and each of their decisions stays an owner card.
- **Code reviewer:** that the kit is read from the plan and the map every time, and no kit list is stored.
- **QA lead:** the proof.
- **Scribe:** the origin in `installed`, the run brief and the log.

## Data

No app, no table and no Key file. A kit is read from files that already exist.

**Source of truth.** Each fact lives in one place:

- **Each department's jobs:** `CATEGORIES` in `src/lib/layout/categories.ts`, the Foundation's own list.
- **Which entry does each job:** its row in `ninja/foundation/numbers.yaml`, the row whose `page` is `<department id>/<job id>`, read through `readLibrary` in `src/lib/recipes/library.ts`.
- **Who leads the department:** the roster row with `role: lead-<department id>` in `key/key.yaml`.
- **The kit's order, its target rungs and what stays with the owner:** the lead's plan, `key/knowledge/plans/<department id>.md`, read through `readPlans` in `src/lib/agents/plans.ts`.
- **What is installed and how far it runs today:** `installed` and each routine's `rung:` field, read through the same `readPlans`.
- **Which jobs belong to the owner alone:** `OWNER_ONLY_JOBS` in `src/lib/key/declarations.ts`, imported.

What the entry builds at Essentials:

- **Code:** `src/lib/recipes/kits.ts`, with `readKits(root)`, which calls `readLibrary` and `readPlans` and returns, for each department, its lead, its jobs in the plan's order with each job's entry, state, rung today and target rung, and the ready entries in install order. Both doors call it.
- **The page:** `src/app/admin/(console)/agentic/[page]/KitsPage.tsx`, passed as the page's `above` when the page is `department-kits`.
- **The command word:** `src/lib/recipes/recipes-command.ts` gains `kits`.
- **Tests:** `tests/unit/kits.test.ts`, which builds a fixture Foundation with two leads, a plan that reorders the jobs, a dictionary with one ready job entry and one coming, and a Finance job whose plan asks for Runs and reports, and checks the order, the states and that the Finance job's target stays at Drafts for approval, and `tests/e2e/kits.spec.ts`, which signs in through the PIN gate and finds one kit, at phone width and at desktop width.
- **Shared edits named in the plan:** the `department-kits` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`. The page links each lead to its card on the Department leads page.

One kit, as `readKits` returns it, for Harbor Studio's Sales lead, today:

```json
{"department": "sell", "label": "Sales", "lead": "lead-sell", "leadName": "Sales lead", "jobs": [{"job": "leads", "title": "Capture leads", "entry": null, "state": "coming", "today": "By hand today", "target": "Runs and reports", "ownerOnly": false}, {"job": "contracts", "title": "Sign contracts", "entry": null, "state": "coming", "today": "By hand today", "target": "Drafts for approval", "ownerOnly": true}], "ready": [], "line": null}
```

- `jobs` follows the plan's `## Priorities`, then any job the plan leaves out, in the Foundation's order.
- `target` is the plan's rung, capped at Drafts for approval for an owner-only job, so the kit never asks a lead to act alone on money, contracts or people.
- `ready` lists the entries that would install now, in order, and `line` is the kit line, or null when nothing is ready.

## Screens and panels

**Department kits** (`/admin/agentic/department-kits`), the third page in the Recipes group of Agentic, replaces its coming soon state with one card per department the owner runs, each with its states:

- **The kit.** The department and its lead by name, then each job in the plan's order with its two marks, such as "By hand today, aims for Runs and reports", and a lock beside each owner-only job: "Stays with you".
- **Ready.** When at least one job's entry is ready, the kit line to copy or open: "Avery, install the Sales kit from Department kits." with how many installs it runs.
- **Coming.** When none is: "Nothing in the Sales kit can be installed yet. Its jobs arrive in coming updates." with a link to the [Library](recipes.md), where coming jobs are listed.
- **Done.** When every job with an entry is installed at its target rung: "Your Sales kit is in place." with the date of its last install.
- **No lead.** A department with no lead shows an open seat and the line "Add a lead for <department>.", because a kit follows a plan.
- **A problem.** A plan that has lost a fixed heading shows what is missing and the Copy line that repairs it, the same line Department leads shows.

At Complete, each card shows the lead's last Plan update that names a kit entry. At Mastery, a job below its target rung shows its upgrade or modify line.

Every Open in line waits for your Enter, as [Work with Claude](../../frameworks/work-with-claude.md) teaches.

## Routines and Inbox cards

Not part of this entry at Essentials. A kit request is one request the owner starts.

At Complete, each lead's review routine, `key/routines/lead-<department id>-review.md`, gains the kit step, a shared edit to the routine and to its handler, `src/lib/agents/lead-command.ts`:

1. **Read the kit.** After the plan, the review reads its kit through `readKits`.
2. **Propose the next kit entry.** When the kit has a ready entry not yet in the plan's `## Next`, one of the review's two weekly Plan update cards proposes it: "Install Capture leads, the next job in your Sales kit", with the hours the plan says it returns. On Approve, `apply` adds it to `## Next`.
3. **Report what became ready.** The Lead report names any job whose entry arrived in a dictionary update since the last review.

The cards are the lead's own kinds, Plan update and Lead report, declared by [Department leads](department-leads.md). The kit adds none. A Plan update about a job in Finance, Sign contracts, Manage your team or Hire is decided by the owner alone, as the Key checker already requires of those jobs.

## Connections

Not part of this entry. Each job's entry makes its own connections, on the Connect your tools page in Settings, before it is built.

## Autopilot

**What runs on its own.** Each kit keeps itself current, read fresh on every load from the plan, the map and what is installed. In a kit request, the run lead carries the kit from one install to the next with no step from the owner but each plan's yes. At Complete, each lead proposes its next kit entry every Friday and reports what became ready. At Mastery, each lead reports any job below its plan's rung.

**The trigger.** The page reads on every load. A kit request starts when the owner opens the kit line. Each review runs on its `cron` line, which waits on a routine runner, so until then the owner asks, "Run my Sales lead's review", on their own computer with the command center stopped.

**The rung.** Drafts for approval. The lead proposes the next kit entry, and every install in a kit waits for its own plan's yes.

**The next rung.** Acts within policy, through the lead: once Department leads is at Mastery, a lead's `## Policy` may let it put the next kit entry into `## Next` without a card. Every install itself still waits for its plan's yes, at every rung.

**What stays with the owner.** Which kit, how deep, every plan inside it, and every job in Finance, Sign contracts, Manage your team and Hire, at every rung.

## Proof

### Essentials

**Setup.** At least one lead is on the roster with a plan, and the Library is installed.

**The run.** The QA lead opens Department kits and checks each kit against its plan, the map and `installed`: the order follows `## Priorities`, every job with no entry shows as coming, and every owner-only job shows "Stays with you" at Drafts for approval. Today every job is coming, so the proof says so and the kit request is proven in the fixture: a fixture dictionary with one ready job entry, where "Install the Sales kit from Department kits." runs that one install to its close, with its own plan, proof and `installed` row, and the kit card shows Done at the next load.

**The completion test.** All of these pass:

1. Every kit's order matches its plan, and moving a priority in the plan moves the job on the page at the next load.
2. No owner-only job shows a target above Drafts for approval, even when its plan asks for one.
3. A job whose entry is coming never shows a kit line, and a kit with no ready job shows the coming state.
4. `npm test` and `npm run e2e` pass, including `tests/unit/kits.test.ts` and `tests/e2e/kits.spec.ts`.

### Complete

**The run.** In the fixture with one ready job entry, the QA lead runs one lead's review on its data, triggered by asking because the schedule waits on a routine runner. The review proposes the ready kit entry as one Plan update card. The completion test: approving it and running `apply` adds the line to the plan's `## Next`, and a second review in the same week adds no card.

### Mastery

**The run.** With one kit job installed at Drafts for approval and its plan aiming for Runs and reports, `npm run recipes -- kits --check` names the job and the line that takes it there. The completion test: the next Lead report names the same gap, and an owner-only job is never named as below its rung.

## Complete when

**Fitted.** passes when every kit follows its own lead's plan: its order, its rungs and what stays with the owner, from the owner's answers in Department leads.

**Autopiloted.** passes when each kit is read fresh on every load, a kit request carries itself from install to install, and the owner's only steps are choosing the kit and approving each plan.

**Visible.** passes when Department kits shows each department's kit, its two marks per job, Ready, Coming, Done, No lead and any problem, each with its empty state.

**Connected.** passes when each kit links to its lead's card on Department leads and to the Library, each ready kit carries its kit line, and from Complete each next kit entry reaches the owner as exactly one Plan update card.

**Recorded.** passes when each install in a kit has its own `installed` row and log entry, and the kit request's one run brief names every entry and which are done.

**Tested.** passes when the tests in `tests/unit/kits.test.ts` and `tests/e2e/kits.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when a kit request installed a ready entry to its close in the fixture, and on the owner's own Foundation once a job entry ships.

**Coherent.** passes when both doors meet the same kits: the page and `npm run recipes -- kits` print the same jobs in the same order, and a plan changed through Claude shows in both at the next read.

**Reversible.** passes when remove takes out the page's kits, the code, the command word, the kit step and their tests, leaves every plan and every installed entry as they are, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what a kit is, such as "A kit is my lead's plan for a department, installed one job at a time, with money and people kept for me."

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| A kit's order | `key/knowledge/plans/<department id>.md` | `## Priorities`, through Department leads. "Move Take payment to the top of the Sales plan." |
| A job's target rung | `key/knowledge/plans/<department id>.md` | `## Rungs`. An owner-only job stays at Drafts for approval. |
| What stays with you | `key/knowledge/plans/<department id>.md` | `## Stays with the owner`. |
| The default depth | `src/lib/recipes/kits.ts` | Essentials or the plan's rung, from question 2. |

A kit has no file of its own, so every change to a kit is a change to its lead's plan, and the lead owns it.

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder. Reading kits needs nothing stopped:

- `npm run recipes -- kits` prints every department's kit, its jobs in order with their two marks, and its kit line.
- `npm run recipes -- kits <department id>` prints one kit and the installs a kit request would run, in order.
- `npm run recipes -- kits --check`, at Mastery, prints each job below its plan's rung and exits with a failure only on a broken plan.

A kit request runs in Claude Code: "Install the Sales kit from Department kits." Stopping between installs is fine, and "Continue the Sales kit" picks it up from its run brief.

**What upgrade adds, tier by tier.** Parts upgrade first, each in its own run. Then each file in the row's `code` is compared three ways, the original from the commit that added the entry's newest install or upgrade brief, and every line the owner wrote stays.

- **To Complete:** the kit step in each lead's review routine and in `lead-command.ts`, with their tests.
- **To Mastery:** `kits.ts` gains `checkKits`, the command gains `--check`, and each review's check step reports gaps, with their tests.

**What remove exports first.** Nothing, because a kit holds no records. Remove takes out `kits.ts`, the page's kits, the `kits` word, the kit step in each review and their tests, and sets the page back to coming soon. Every plan and every entry a kit installed stay, each removed only by its own remove.

## How it is done

**How a kit request runs.** The run lead reads the kit through `readKits` and runs each ready entry in order as a full install, the way [the runner](../../runner/run.md) runs Install the Ninja framework: one run brief for the whole request, whose `# Brief` names every entry in the kit and which are done, the tier and each consent asked once, each entry's own questions asked with the plan's answers skipped, and each entry's own plan, proof, work commit and `installed` row. An entry already installed is skipped and named. An entry whose parts are not installed installs them first, as install always does. Each install takes the plan's target rung, except an owner-only job, which installs at Drafts for approval with its decisions as owner cards.

**Why the plan is the kit.** The lead already holds the department's order, its target rungs and what stays with the owner. A separate kit file would be a second plan, and the day the two differed, the kit would install in an order the lead no longer holds.

**Why money, contracts and people stay with the owner in every kit.** A kit runs many installs in one request, which is exactly when a careless setup could let a lead approve a refund or a hire. The cap is in the code, and the Key checker already refuses an approval card in those jobs that the owner does not decide.

**The first run of this entry.** The parts run first. The plan, shown in plan mode, lists the code, the page, the command word, the tests and the shared edits. After the owner's yes, tests come first and fail, then the code, the proof, and one work commit with its log entry.

## Next

- Give the department a lead and a plan first, on [Department leads](department-leads.md): "Add a lead for Customer care."
- Browse each job's entry, ready or coming, in the [Library](recipes.md).
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so each lead proposes its next kit entry on Fridays: "Upgrade Department kits to Complete."
- Save a finished kit as one recipe for your next location, on [Your recipes](your-recipes.md).
