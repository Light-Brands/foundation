---
id: modules/agentic/quick-wins
kind: module
title: Quick wins
lead: system-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: [modules/agentic/recipes, agents/chief-of-staff]
crew: [run-lead, business-analyst, experience-designer, copywriter, builder, automation-engineer, code-reviewer, qa-lead, scribe]
specialists: []
level: 1
version: 1
---

# Quick wins

Section: Agentic.

**The job it takes off your plate:** deciding what to set up next. Out of everything your dictionary can install, Quick wins picks the few that need nothing first, connect no new service, and stay clear of money, contracts and people, fitted to the parts of the business you said matter most. Each comes with what it takes off your plate and the one line that installs it.

**What you still decide:** which quick win to install, and when. The page and its weekly card suggest. Nothing installs until you open the line and approve its plan.

You start it from the Quick wins page in the Recipes group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one is a short list drawn from the [Library](recipes.md), which holds every entry your dictionary can install. Quick wins reads the same catalog through the same code and keeps only the entries that pass one rule:

- **Ready to install.** The entry's file ships in your `ninja/` folder, `installed` in `key/key.yaml` does not name it, and it is a job to install, outside the frameworks of the path.
- **Nothing first.** Every part it uses is installed already, so the run installs one entry and no other.
- **No new connection.** Its Connections section says "Not part of this entry", so nothing waits on a login or a key.
- **Never the owner's own ground.** It sits outside Finance, Sign contracts, Manage your team and Hire, the jobs the Key checker keeps for the owner alone. Those come through their [Department kit](department-kits.md), or by name.
- **At Essentials.** Each quick win installs at its first tier, the shortest run an entry has.

What passes is sorted by your answers: the parts of your business you chose first, then the simplest entries, then the dictionary's own order. The page shows the first few, three by default, and a list of what you installed from it in the last thirty days.

Under an hour is what the rule aims for: one entry, one run of the ten stages, no part and no connection to wait on. The page never shows a time it did not measure.

**How it runs today.** The page reads the files where it runs, everywhere. At Complete, a weekly pick writes one card with this week's quick win. It runs on your own computer when you ask, such as "Pick this week's quick win", until your Foundation can run a routine on its own schedule.

**What you do by hand.** Answer three questions, then choose which win to install.

## The bar

The world-class version is the advisor who walks into a busy owner's week and says "do this one thing today, it takes an hour and you will feel it by Friday", and is right. Its test is the follow through: an owner who installs the top quick win each week for a month has four more jobs off their plate and never once waited on a part, a login or a decision about money. Every quick win on the page passes the rule, and every entry that passes and fits the owner's focus is on the page or one tap away. A quick win the owner set aside stays set aside until the date they chose.

## Depth tiers

**Essentials.** The Quick wins page shows the top few entries that pass the rule, sorted by the owner's focus, each with its job line and install line, plus the ones installed from it in the last thirty days. `npm run recipes -- quick` prints the same.

Adds: one code file that applies the rule, one Key file for the owner's answers, the page, the word on the recipes command and their tests. No table.

**Complete.** Adds the weekly pick: one Inbox card each week with the top quick win and its line.

Adds: one routine file, its handler and its two card kinds. No table.

**Mastery.** Adds the next step from what you just did: an entry named in the Next section of an entry you installed, or in a department lead's plan, ranks first when it passes the rule, and its card says why.

Adds: the ranking step in the code and the reason on each card. No table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads what the Library reads, applies the rule, and reflects back what it found, such as "Five entries pass: Your team, Your skills, Research, Numbers and Write the brief. All five sit in Agentic."

1. **Your focus.** "Which parts of your business should your quick wins come from first? You can name departments, such as Sales, or Context or Agentic." The default is the parts with the most entries that pass. It becomes `focus` in `key/knowledge/quick-wins.yaml`, as category ids and `context` or `agentic`.
2. **How many.** "How many quick wins should the page show at once?" The default is three. It becomes `limit`.
3. **Your tools.** "Is there a small thing you keep meaning to set up, written down somewhere, such as a note or a sticky?" The default is none. Each one you name is matched to an entry in the receipt, as a quick win, a bigger install or a coming job. Nothing is read without your yes.

At Complete, one more:

4. **When the pick arrives.** "Which day and time should this week's quick win reach your Inbox?" The default is Friday at 14:00, so you can plan it into Monday. It becomes the routine's `cron` line.

Everything from here on is the build plan your assistant follows.

## Parts

Installed in this order, before the entry. When a part is not installed yet, [install](../../runner/verbs/install.md) installs it first, as its own run, with its own `installed` row.

1. [Library](recipes.md) (`modules/agentic/recipes`): the catalog and the `npm run recipes` command this page reads through.
2. At Complete, [Chief of staff](../../agents/chief-of-staff.md) (`agents/chief-of-staff`): the role that owns the weekly pick.

`uses` lists every part at any tier. A part marked At Complete installs only when the run's tier is Complete or deeper, and an upgrade to Complete installs it then.

## Crew

The system lead directs this entry when the owner has the Master Agent Library, and sends back any pick that breaks the rule.

- **Run lead:** the stages, the plan and the gates, and every commit.
- **Business analyst:** the read, the questions and the receipt's matches.
- **Experience designer:** the short list, the recent list and every state, on a phone and on a laptop.
- **Copywriter:** each label, empty state and card, in plain words.
- **Builder:** `src/lib/recipes/quick-wins.ts`, the page, the command word and their tests, written test first.
- **Automation engineer:** at Complete, the routine, its handler and its two card kinds.
- **Code reviewer:** that the rule is applied in one function, the Library's reading is reused and never copied, and no quick win sits in an owner-only job.
- **QA lead:** the proof.
- **Scribe:** the origin in `installed`, the run brief and the log.

## Data

No app and no table. The list is worked out from files on every read, and the weekly card is a row in the core Inbox table.

**Source of truth.** Each fact lives in one place:

- **What can be installed, and where each entry sits:** what the Library reads, through `readLibrary` in `src/lib/recipes/library.ts`: `ninja/index.md`, each entry's front matter, `ninja/foundation/numbers.yaml` and `installed`.
- **Whether an entry needs a connection:** the entry's own Connections section, read from its file.
- **Which jobs belong to the owner alone:** `OWNER_ONLY_JOBS` in `src/lib/key/declarations.ts`, the list the Key checker uses for `always_human` card kinds, imported, never written again.
- **The owner's focus, how many to show, and what was set aside:** `key/knowledge/quick-wins.yaml`.
- **This week's pick:** one card in the core table `inbox_items`, at Complete.
- **When the pick runs and its steps:** the Key file `key/routines/quick-win-pick.md` and its row in `key/key.yaml`, at Complete.

The answers file, the shape the business analyst writes, for Harbor Studio:

```yaml
focus: [agentic, keep]
limit: 3
skip:
  - entry: modules/agentic/numbers
    until: 2026-11-02
```

- `focus` lists category ids and `context` or `agentic`, in order, each at most once.
- `limit` is a whole number from one to ten.
- `skip` lists an entry the owner set aside, with the date it may return. After that date the row is ignored, and the next change to the file drops it.

What the entry builds at Essentials:

- **Key file:** `key/knowledge/quick-wins.yaml`.
- **Code:** `src/lib/recipes/quick-wins.ts`, with `readQuickWins(root)`, which calls `readLibrary`, applies the rule, sorts by the answers file and returns the picks, each with the job line read from its entry, plus the recent installs from `installed`. Both doors call it.
- **The page:** `src/app/admin/(console)/agentic/[page]/QuickWinsPage.tsx`, passed as the page's `above` when the page is `quick-wins`.
- **The command word:** `src/lib/recipes/recipes-command.ts` gains `quick`.
- **Tests:** `tests/unit/quick-wins.test.ts`, which builds a fixture dictionary with one entry for each rule it must fail and two that pass, and checks the picks and their order, and `tests/e2e/quick-wins.spec.ts`, which signs in through the PIN gate and finds the picks, at phone width and at desktop width.
- **Shared edits named in the plan:** `docs/standards/key.md` gains `key/knowledge/quick-wins.yaml` and its three fields, with `checkQuickWins` in `src/lib/key/formats.ts`, called by `checkKeyFolder`, rejecting an unknown focus, a `limit` outside one to ten and a `skip` row with no real date, its test written first. The dictionary's [primer](../../foundation/primer.md) lists the same in its Key table. The `quick-wins` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`.

One pick, as `readQuickWins` returns it:

```json
{"id": "modules/agentic/skills", "title": "Your skills", "job": "knowing what your agents know how to do.", "section": "Agentic", "reason": "focus", "install": "Avery, install Your skills from the Ninja dictionary. In this project it is ninja/modules/agentic/skills.md."}
```

## Screens and panels

**Quick wins** (`/admin/agentic/quick-wins`), the second page in the Recipes group of Agentic, keeps its title and its Open in line, and adds above it, with every state:

- **This week's wins.** The first picks, up to the limit, each as a card with its title, the job it takes off the owner's plate, its section, and its install line to copy or open. Below each card, a quiet line: "Not now? Tell Avery: not now for <title>."
- **More that pass.** A one tap list of every other entry that passes the rule, in the same order.
- **Done lately.** Each entry installed in the last thirty days that passed the rule, with its date, and the upgrade line for its next tier.
- **Nothing passes.** "Everything quick is already installed. The next installs need a part or a connection first, and the Library shows each one.", with a link to the [Library](recipes.md).
- **A problem.** A broken answers file shows what is wrong and the Copy line that repairs it, and the page falls back to the default order.

At Complete, the card of this week's pick is marked "In your Inbox", linked to **Handle what needs you**. On a hosted database, it says the card is on your own computer. At Mastery, a card picked for a reason shows it, such as "Next after Department leads".

Every Open in line waits for your Enter, as [Work with Claude](../../frameworks/work-with-claude.md) teaches.

## Routines and Inbox cards

At Complete, `key/routines/quick-win-pick.md`, with `agent: chief-of-staff`, `category: system`, `rung: Runs and reports` and a `cron` trigger, Friday at 14:00 by default. It declares its handler under `draft`, `src/lib/recipes/quick-win-pick.ts`, with the steps `pick`, `status` and `blocked`, and its card kinds:

- **Quick win this week** (`quick-win`, subcategory `modules`, `decide: done`, `expires_days: 7`, `on_lapse: closes`): one per week, with the title, the job line, the reason and the install line. Its run key, `quick-win:<week>`, means a second pick in the same week adds no card.
- **The pick did not run** (`quick-win-blocked`, subcategory `modules`, `decide: done`): a pick that stopped, such as on a broken answers file, with the step and the fix to try.

Its steps:

1. **Read.** `readQuickWins` reads the catalog and the answers file.
2. **Pick.** Run `npm run draft -- quick-win-pick pick`, which writes one card for the top pick, or none when nothing passes.
3. **Stop cleanly.** When a step fails, run `npm run draft -- quick-win-pick blocked` with the step and the reason.

The card is a suggestion. Done closes it, and the install itself starts only when the owner opens its line.

## Connections

Not part of this entry. A quick win never needs a new one, by its rule.

## Autopilot

**What runs on its own.** The list keeps itself current, read fresh on every load, so a win installed today leaves the list at the next load and the next one rises. At Complete, the pick reads the list every week and puts the top win in the Inbox. At Mastery, the pick ranks first the next step after what the owner just installed, and says why.

**The trigger.** The page and the command read as they run. The pick runs on its `cron` line, which waits on a routine runner, so until then the owner asks, "Pick this week's quick win", on their own computer with the command center stopped.

**The rung.** Runs and reports. The list and the pick run with no one starting them and report one suggestion, and install nothing.

**The next rung.** There is none above Runs and reports. Every install waits for its own plan's yes, at every rung, because an install writes into the owner's Foundation.

**What stays with the owner.** Which win to install and when, what to set aside, and every install's plan.

## Proof

### Essentials

**Setup.** The Library is installed, and the owner has answered the questions.

**The run.** The QA lead opens Quick wins and checks each pick against the rule, one by one: its file ships, it is not in `installed`, it is no framework, its parts are installed, its Connections section skips, its job is not the owner's alone. It checks the order against `focus`. Then, through Claude, it installs the top pick on the owner's yes, loads the page again, and finds that entry under Done lately and the next one risen. `npm run recipes -- quick` prints, for Harbor Studio:

```text
This week's wins (3)
  Your skills: knowing what your agents know how to do.
  Research: finding things out properly.
  Your team: keeping track of who works for your business.
Done lately (1)
  Write the brief, 2026-10-05
```

**The completion test.** All of these pass:

1. Every pick passes all five parts of the rule, and an entry in a fixture Finance job never appears.
2. The order follows `focus`, and a `skip` row hides its entry until its date and no longer.
3. Installing the top pick moves it to Done lately at the next load, with no edit to any list.
4. `npm test` and `npm run e2e` pass, including `tests/unit/quick-wins.test.ts`, `tests/e2e/quick-wins.spec.ts` and the `checkQuickWins` test.

### Complete

**The run.** The QA lead runs the pick's steps on the owner's own Foundation, with no one stepping in between them, triggered by asking because the schedule waits on a routine runner, and the proof says so. For a run on Friday, October 9, 2026, `status` prints, such as:

```json
{"week": "2026-10-05", "pick": "modules/agentic/skills", "cards": 1}
```

The completion test: the card is in the Inbox with the install line, and running the pick again for the same week adds no card.

### Mastery

**The run.** The owner installs Department leads, whose Next names Specialists. The next pick ranks Specialists first when it passes the rule, and its card says "Next after Department leads". The completion test: an entry named in a Next section that fails the rule, such as one that needs a connection, never ranks.

## Complete when

**Fitted.** passes when the order follows the owner's focus, the page shows the number they chose, and every item from their own list is matched in the receipt.

**Autopiloted.** passes when the list is worked out fresh on every read, the weekly pick runs from its routine file alone, and the owner's only step is choosing.

**Visible.** passes when Quick wins shows the picks, More that pass, Done lately, Nothing passes and any problem, each with its empty state, on a phone and on a laptop.

**Connected.** passes when every pick carries its install line, Done lately carries each upgrade line, Nothing passes links to the Library, and from Complete each week's pick reaches the Inbox as exactly one card.

**Recorded.** passes when the entry's `installed` row names its tier, version, `files` and `code`, the build log has the run's entries, and `key/knowledge/system.md` is current.

**Tested.** passes when the tests in `tests/unit/quick-wins.test.ts` and `tests/e2e/quick-wins.spec.ts` and the `checkQuickWins` test failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when the owner installed a real pick through its line and saw the list move, and from Complete, a pick ran on the owner's own Foundation.

**Coherent.** passes when both doors meet the same picks: the page and `npm run recipes -- quick` print the same list in the same order, and a change to the answers file shows in both at the next read.

**Reversible.** passes when remove takes out the page's list, the code, the command word, the routine and their tests, keeps the answers file unless the owner says to delete it, leaves past cards in the Inbox, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the page does, such as "Quick wins shows the few things I can set up this week with nothing to wait on, starting where I said it matters."

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| Your focus | `key/knowledge/quick-wins.yaml` | `focus`, in order. |
| How many show | `key/knowledge/quick-wins.yaml` | `limit`. |
| Set a win aside | `key/knowledge/quick-wins.yaml` | One `skip` row with its date. "Not now for Research, until December." |
| The pick's day or time | `key/routines/quick-win-pick.md` | The `cron` line. Monday at 08:00 is `cron: "0 8 * * 1"`. |

The rule itself is the dictionary's, so modify never loosens it: a win that needs a part or a connection is a bigger install, and the Library holds it.

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder. Reading the list needs nothing stopped. The pick opens the local database, so stop the command center first:

- `npm run recipes -- quick` prints this week's wins, more that pass, and done lately.
- `npm run recipes -- quick --why <entry>` prints which part of the rule an entry passes or fails, such as "Needs Department leads first."
- `npm run draft -- quick-win-pick pick` writes this week's card, at Complete.
- `npm run draft -- quick-win-pick status --week <YYYY-MM-DD>` reads a week's pick.

The answers file is a file, so Claude edits it directly when the owner asks, such as "Put Sales first in my quick wins", and `npm test` checks its shape.

**What upgrade adds, tier by tier.** Parts upgrade first, each in its own run. Then each file in the row's `files` and `code` is compared three ways, the original from the commit that added the entry's newest install or upgrade brief, and every line the owner wrote stays.

- **To Complete:** the routine, its handler `src/lib/recipes/quick-win-pick.ts` with `pick`, `status` and `blocked`, its two card kinds, and question 4, with their tests.
- **To Mastery:** the ranking step in `quick-wins.ts`, which reads each installed entry's Next section and, when they exist, the `## Next` lines in `key/knowledge/plans/`, and the reason on each pick, with their tests.

**What remove exports first.** Nothing, because the list holds no records and past cards stay in the Inbox. Remove takes out the routine and its row, the handler, `quick-wins.ts`, the page's list, the `quick` word and their tests, and sets the page back to coming soon. The answers file stays unless the owner says to delete it.

## How it is done

**Why a rule and no list.** A list of quick wins written by hand would go stale the day the owner installed one or a dictionary update arrived. The rule reads what is true now, so the list is right on every load, and a new entry that passes shows up on its own.

**Why money, contracts and people are never quick.** A run there touches what only the owner may decide, and the Key checker already marks those jobs for the owner alone. Calling one quick would invite an install without the care it needs, so those arrive through their [Department kit](department-kits.md), where the lead's plan says what stays with the owner.

**How the ranking reads Next.** At Mastery, `quick-wins.ts` reads the Next section of each installed entry, from its file in `ninja/`, and keeps every entry linked there. When [Department leads](department-leads.md) is installed, it reads each plan's `## Next` lines too. An entry found either way ranks first when it passes the rule, so the list follows what the owner just built.

**The first run of this entry.** The part runs first. The plan, shown in plan mode, lists the answers file, the code, the page, the command word, the tests and the shared edits. After the owner's yes, tests come first and fail, then the code, the proof on the owner's own Foundation, and one work commit with its log entry, [the runner](../../runner/run.md)'s way.

## Next

- Browse everything your dictionary can install, ready, installed and coming, in the [Library](recipes.md).
- Set up a whole department from its lead's plan, including the jobs that stay with you, on [Department kits](department-kits.md): "Install Department kits."
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so this week's quick win reaches your Inbox: "Upgrade Quick wins to Complete."
