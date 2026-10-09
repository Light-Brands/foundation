---
id: modules/agentic/numbers
kind: module
title: Numbers
lead: command-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, solution-architect, experience-designer, copywriter, builder, automation-engineer, code-reviewer, security-reviewer, qa-lead, scribe]
specialists: []
level: 2
version: 1
---

# Numbers

Section: Agentic.

**The job it takes off your plate:** reading your own records and saying what changed and why. The numbers that matter to your business are each written down once, with exactly how they are counted, and your agents read them straight from your records, compare them with last week, and explain each change in a sentence you can check.

**What you still decide:** which numbers matter, which way is good for each, the targets you set, and what you do about what they say. The numbers read your records and change none.

You start it from the Numbers page in the Skills group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one gives your Foundation one place where each number is defined and one way to read it. Each number is one row in your Key, in `key/knowledge/numbers.yaml`: its name, which way is good, the tables it reads, and the one read-only query that counts it. The skill `explain-numbers`, kept at `key/skills/explain-numbers/SKILL.md`, reads those numbers and writes what changed and why, every sentence traced to a number it was given.

The definitions are the meaning. Everything that shows a number reads it through the same definitions:

- **The Numbers page** in the Skills group of Agentic shows each number this week, and at Complete beside last week, with the explanation.
- **The [Monday brief](../../routines/monday-brief.md)**, when it is installed, lists your numbers in its brief, read through the same definitions, so the brief and the page always agree.
- **The Track your numbers page** in the Leadership department, once it is installed, keeps each number's weekly value as your scorecard, and reads what each number means from this file.

**How it runs today.** The numbers are read from your database wherever the page runs: on your computer, and on a deployed command center once its own database is connected. The command line opens the local database, so on your own computer it runs with the command center stopped. An explanation is written when you ask, such as "Avery, explain this week's numbers", or by the Monday brief.

**What you do by hand.** Answer four questions. Choose your numbers and, at Mastery, their targets.

## The bar

The world-class version is the weekly numbers review a good finance lead runs: a short list of numbers that matter, each defined once and counted the same way every week, compared with last week, with a plain sentence on why each moved. Its test is agreement. The page, the brief and the scorecard show the same value for the same number in the same week, because there is one definition. A number the system cannot count yet says so, and a number never rounds into a different one.

## Depth tiers

**Essentials.** Your numbers defined once in the Key, read live from your records for the last seven days, shown on the Numbers page, and explained by the skill when you ask.

Adds: the definitions file, the skill, one code file, the page, the command and their tests, and one shared change so the read-only runner that holds checks to reading serves numbers too. No table.

**Complete.** Adds last week beside every number and the explanation of each change: for a number with a breakdown, such as cards waiting by the job they belong to, the skill names the largest part or the part that moved most.

Adds: the comparison, an optional breakdown query per number, and the change step in the skill. No table.

**Mastery.** Adds targets and the numbers watch. Each number may carry a target. Every Monday before the brief, a routine reads the numbers and brings each one that misses its target to you as one card, with the explanation.

Adds: `target` on a number, the routine and its card kind. No table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads the apps installed and their tables, the Monday brief when there is one, and the roster, and reflects back in two or three sentences what it can count today, such as "Your Foundation keeps contacts and Inbox cards, and the briefs app. I can count new contacts and cards waiting today."

1. **Which numbers matter.** "Which numbers do you want to watch every week? I suggest new contacts and cards waiting, plus one for each app you have installed." The default is those. Each one the owner names that no installed table can count is listed in the receipt as "not tracked yet", with the entry that would track it, and is never estimated.
2. **Which way is good.** "For each number, is up good or down good?" The default is up for a count of new things and down for things waiting. It sets `better` on each row, which colors the change on the page.
3. **Who explains.** "Which of your agents should own the numbers skill? I suggest your chief of staff." The default is the chief of staff. When the roster has no chief of staff, the skill's row leaves `agent` out until it does.
4. **Your tools.** "Where do your numbers live today: a spreadsheet, your payment provider, your bookkeeping?" The default is none known. Each one named is listed in the receipt as a connection to make on the Connect your tools page in Settings, through the entry that brings its records into a table. This entry reads only your own tables, so a number from an outside service arrives once its records do.

Everything from here on is the build plan your assistant follows.

## Parts

Not part of this entry. The Monday brief, when installed, gains the numbers through a shared edit, and Numbers installs without it.

## Crew

The command lead directs this entry when the owner has the Master Agent Library.

- **Run lead:** the stages, the plan and the gates, and every commit.
- **Business analyst:** the read, the questions, and what each number means in the owner's words.
- **Solution architect:** the split of the read-only runner, so checks and numbers share one boundary.
- **Experience designer:** the page, every state, on a phone and on a laptop.
- **Copywriter:** labels, the skill's steps and every empty state.
- **Builder:** `src/lib/numbers/numbers.ts`, the definitions check, the page, the command and their tests, written test first.
- **Automation engineer:** the skill, the Monday brief's change, and at Mastery the routine and its card.
- **Code reviewer:** that every number is read through one function, the page keeps no copy, and the brief's numbers come from the same call.
- **Security reviewer:** that every query is checked and run as a declared check is.
- **QA lead:** the proof, on the owner's own records.
- **Scribe:** the rows, the origin in `installed`, the run brief and the build log.

## Data

No app and no table. The definitions are a file in the Key, and the values are read live from the tables that already hold the records.

**Source of truth.** Each fact lives in one place:

- **What each number means and how it is counted:** its row in `key/knowledge/numbers.yaml`, with `key`, `label`, `unit` (`count` or `money`), `measure` (`flow`, counted over the window, or `level`, as it stands now), `better` (`up` or `down`), `reads` and `sql`, and at Complete an optional `by`, and at Mastery an optional `target`.
- **The value:** the records themselves, in the tables `reads` names, counted when asked. Nothing stores a value at Essentials.
- **Last week's value,** at Complete: for a `flow` number, the same query over the seven days before, read live. For a `level` number, the counts the Monday brief saved with last week's brief, when it is installed at Complete. Otherwise, "no comparison yet".
- **How changes are explained:** the skill, `key/skills/explain-numbers/SKILL.md`.
- **Each target,** at Mastery: the number's `target`, which only the owner sets.
- **Each missed target,** at Mastery: one card in the core table `inbox_items`.

A number's query follows the rules of a declared check in `docs/standards/key.md`: one read-only `select`, reading only core check tables and the tables of installed apps, listed in `reads`, calling only the allowed functions. It returns one row with one column, `value`. It may use the two parameters a check uses, `$1::date`, today in the business's time zone, and `$2::timestamptz`, the end of the window. A `flow` number counts from `$2::timestamptz - make_interval(days => 7)` up to `$2::timestamptz`, the seven days ending now, the window the Monday brief counts. For last week, `readNumbers` passes the earlier window's end.

What the entry builds at Essentials:

- **Key files:** `key/knowledge/numbers.yaml` and the skill, with the skill's row in `key/key.yaml`.
- **Code:** `src/lib/numbers/numbers.ts`, with `readNumbers(db, root, now)`, which reads the definitions and runs each query, returning each number's label, value, unit and any problem, and `checkNumbers(file, text, tables)`, which checks each row with `checkSqlProblems` from `src/lib/key/declarations.ts`. The page, the command and the Monday brief all call `readNumbers`.
- **The page:** `src/app/admin/(console)/agentic/[page]/NumbersPage.tsx`, shown when the page is `numbers`.
- **Tests:** `tests/unit/numbers.test.ts`, which fails on a query that writes, reads a table outside `reads` or returns two rows, and checks the values against seeded records, and `tests/e2e/numbers.spec.ts`, which signs in through the PIN gate and finds each number with its value, at phone width and at desktop width.
- **Shared edits named in the plan:**
  - `src/lib/checks/runner.ts` gains `runReadOnly(db, { sql, reads, may_read }, params)`, the plan check, the read-only transaction and the rollback that `readCheck` uses today, and `readCheck` calls it, so checks and numbers share one boundary. The checks' existing tests must pass unchanged, and a new test proves a number's query cannot write.
  - `checkKeyFolder` in `src/lib/key/formats.ts` calls `checkNumbers` on `key/knowledge/numbers.yaml`, its test written first. `docs/standards/key.md` gains the numbers format, and the dictionary's [primer](../../foundation/primer.md) lists the file in its Key table.
  - The `numbers` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`.
  - `src/lib/skills/skills-command.ts` gains the word `numbers`, and when [Your skills](skills.md) is not installed, this entry adds that file and its two `package.json` lines.
  - When the Monday brief is installed, `weekNumbers` in `src/lib/data/briefs.ts` adds a `tracked` list from `readNumbers`, and the write-the-brief skill's Input gains "and the tracked numbers, each by its label". Its New in the last seven days section lists them.

`key/knowledge/numbers.yaml` for Harbor Studio, the sample business whose context block is in [the Ninja home](../../foundation/ninja-home.md), at Essentials:

```yaml
numbers:
  - key: new-contacts
    label: New contacts
    unit: count
    measure: flow
    better: up
    reads: [contacts]
    sql: |
      select count(*) as value from contacts
       where created_at >= $2::timestamptz - make_interval(days => 7)
         and created_at < $2::timestamptz
  - key: cards-waiting
    label: Cards waiting for you
    unit: count
    measure: level
    better: down
    reads: [inbox_items]
    sql: |
      select count(*) as value from inbox_items where status = 'new'
```

## Screens and panels

**Numbers** (`/admin/agentic/numbers`), the fourth page in the Skills group of Agentic, replaces its coming soon state with three parts, each with its empty and error states:

- **Your numbers.** One row per number, in the file's order: the label, this week's value, and the window it counts, such as "the seven days to Thursday, October 8". A `money` number shows its value only when `allows` in `src/lib/auth/roles.ts` lets the viewer into `money`: the owner, or a team member whose departments include Finance. Anyone else sees its label and "Shown to the owner and Finance". With no database: "Your numbers show once your command center has its database."
- **Not tracked yet.** Each number the owner named that nothing installed can count, with the entry that would count it.
- **A problem.** A number whose query the checker refuses or whose run failed shows in place with the plain reason and its repair line, and the other numbers still show.

At Complete, each row gains last week's value and the change, colored by `better`, and the latest explanation sits under the list, with the date it was written. At Mastery, each number with a target shows it, and one that misses is marked Off track.

Every Open in line waits for your Enter, as [Work with Claude](../../frameworks/work-with-claude.md) teaches.

## Routines and Inbox cards

Essentials and Complete add no routine. The skill runs when the owner asks and, once the Monday brief carries the tracked numbers, every Monday as part of the brief.

At Mastery, `key/routines/numbers-watch.md`, with `agent` set to the skill's owner, `category: plan`, a `cron` trigger, Mondays at 7:30 so it runs before the brief, a handler `src/lib/numbers/command.ts` under `draft` with the steps `read`, `flag` and `blocked`, and its card kinds:

- **A number is off track** (`number-off-track`, subcategory `scorecard`, `decide: done`, `expires_days: 7`, `on_lapse: closes`): one per number that misses its target this week, with the value, the target and the skill's explanation. Its run key, `number-off-track:<key>:<week>`, means a second run adds none.
- **The numbers watch did not run** (`numbers-watch-blocked`, subcategory `scorecard`, `decide: done`).

Its steps: read the numbers with `read`, explain each one off track with the explain-numbers skill, and write the cards with `flag`, the explanations on standard input.

## Connections

Not part of this entry. A number counts only what is in your own tables. A number from an outside service, such as payments or bookings, arrives once the entry that connects that service brings its records into a table, through the Connect your tools page in Settings and [Tools](tools.md).

## Autopilot

**What runs on its own.** Every number is read live from your records whenever the page, the command or the brief asks, so no one updates a number by hand. At Complete, each change is compared and explained. At Mastery, every Monday the watch reads your numbers before your brief and brings each one off target to you with its explanation.

**The trigger.** The page load, the command and the Monday brief read the numbers as they run. At Mastery, the watch's schedule, the `cron` line in `key/routines/numbers-watch.md`, which waits on a routine runner. Until then the owner starts it by asking, "Run my numbers watch", on their own computer with the command center stopped.

**The rung.** Runs and reports. The numbers and their explanations are read and reported with no one starting them, and nothing is changed.

**The next rung.** There is none above Runs and reports for reading. What a number leads to belongs to the entry that owns that job.

**What stays with the owner.** Which numbers matter, which way is good, every target, and every decision a number leads to. Money numbers inform and never advise: a finance, legal or tax question a number raises is named plainly, with the suggestion to ask a qualified professional.

## Proof

### Essentials

**Setup.** The definitions and the skill are in the Key, and the command center is stopped on the owner's computer.

**The run, the way it will run.** The QA lead runs `npm run skills -- numbers` on the owner's own records, then counts each number by hand in a second way, such as listing the contacts added in the window and counting the rows. For Harbor Studio at 9:00 on Thursday, October 8, 2026:

```json
{"window": {"from": "2026-10-01T09:00:00-07:00", "to": "2026-10-08T09:00:00-07:00"}, "numbers": [{"key": "new-contacts", "label": "New contacts", "value": 1}, {"key": "cards-waiting", "label": "Cards waiting for you", "value": 1}]}
```

Then the owner opens the command center again and finds the same values on the Numbers page, and asks, "Avery, explain this week's numbers." The skill writes one line per number, each naming its value.

**The completion test.** All of these pass:

1. Each value equals the count made the second way.
2. The page and the command show the same values for the same window.
3. A fixture query that writes, or reads a table outside `reads`, is refused by the Key checker and by `runReadOnly`, and the other numbers still show.
4. `npm test` and `npm run e2e` pass, including `tests/unit/numbers.test.ts` and `tests/e2e/numbers.spec.ts`, and the checks' existing tests pass unchanged.

### Complete

**The run.** The QA lead seeds two weeks of contacts and cards waiting in two jobs, gives cards waiting a breakdown by `subcategory`, and runs `npm run skills -- numbers --compare` and the skill. The completion test: last week's new contacts equals the count over the seven days before, the change equals this week less last week, and the explanation names the job with the most cards waiting, with its numbers.

### Mastery

**The run.** With a target on new contacts above this week's value, the QA lead runs the watch. The completion test: one A number is off track card arrives with the value, the target and the explanation, and a second run in the same week adds none.

## Complete when

**Fitted.** passes when the numbers, which way is good for each, and the skill's owner come from the owner's answers, and every number nothing can count yet is listed as not tracked, never estimated.

**Autopiloted.** passes when every number is read live through one function, with no value kept by hand, and from Mastery the watch runs from its file alone.

**Visible.** passes when Numbers shows the numbers, not tracked yet and any problem, each with its empty state, on a phone and on a laptop.

**Connected.** passes when the Monday brief, when installed, lists the same values the page shows, and from Mastery every missed target reaches the owner as exactly one card.

**Recorded.** passes when the skill's row and the entry's `installed` row with its files and `code` are in `key/key.yaml`, and the build log has the run's entries.

**Tested.** passes when the tests in `tests/unit/numbers.test.ts` and `tests/e2e/numbers.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when each number on the owner's own records matched a count made a second way.

**Coherent.** passes when both doors meet the same numbers: a definition Claude changes shows on the page at the next load, and the command and the page read the same value for the same window.

**Reversible.** passes when remove takes out the definitions only after the brief's tracked list is taken out, keeps every card in the Inbox, keeps `runReadOnly`, which the checks use, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the numbers are and what they decide, such as "My numbers are each defined once and read from my records, the brief and the page always agree, and I choose the targets."

**True numbers.** passes when every value shown is the query's result for its window, never rounded into a different number, and every explanation names only numbers it was given.

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| Add a number | `key/knowledge/numbers.yaml` | One row, checked by `npm test`, such as bookings this week once Book appointments is installed. |
| Its name or which way is good | The same file | The row's `label` or `better`. |
| How it is counted | The same file | The row's `sql` and `reads`, checked as a declared check is. |
| A breakdown, at Complete | The same file | The row's `by`, a query that returns `label` and `value` rows for the window. |
| A target, at Mastery | The same file | The row's `target`, set only on the owner's word. |
| When the watch runs, at Mastery | `key/routines/numbers-watch.md` | The `cron` line. |

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder. The numbers command opens the local database, so stop the command center first:

- `npm run skills -- numbers` prints each number's value for the seven days ending now, as one JSON object.
- `npm run skills -- numbers --compare`, at Complete, adds last week's value and the change beside each.
- `npm run skills -- numbers why <key>`, at Complete, prints the number's breakdown for both weeks.
- `npm run skills -- numbers --check` checks the definitions file alone, with nothing stopped, because it reads the file and opens no database.

The definitions are a file, so Claude edits them when the owner asks, such as "Count only contacts from the website form", and `npm test` checks each query.

**What upgrade adds, tier by tier.** This entry has no part. Its run compares each file in its row's `files` and `code` three ways, the original from the commit that added the entry's newest install or upgrade brief. Every number the owner added or changed stays as it is.

- **To Complete:** `readNumbers` gains the comparison and `by`, the command gains `--compare` and `why`, the skill gains a step, "For each number that changed, name the change and, when it has a breakdown, the part that moved most", and the page gains last week and the explanation.
- **To Mastery:** `target` on a row, the routine, its handler and card kind, and the target line on the page.

**What remove exports first.** Nothing, because the values live in the records. Remove first takes the tracked list out of the Monday brief and its skill, then the definitions, the skill, the code, the page and the tests, and sets the page back to coming soon. `runReadOnly` stays, because the checks use it.

## How it is done

**Why one definition per number.** Three places that each count new contacts their own way will, one week, show three different numbers. One row read by every place that shows it means they cannot disagree.

**Why the queries follow the check rules.** A number's query runs against the owner's records, the same as a check's, so it gets the same boundary: the Key checker warns early, Postgres plans the statement, the plan may touch only the tables in `reads`, and the statement runs inside a read-only transaction that is always rolled back. Splitting that boundary into `runReadOnly` gives numbers the protection checks already have, with one copy of the code.

**Why values are read live.** A stored value goes stale. Reading the records each time gives the true value now, and a `flow` number's last week is the same query over the week before. A `level` number cannot be read for a past moment, so its last week comes from what the brief saved then, or the page says plainly there is no comparison yet.

**How the skill explains.** It is given the numbers and, at Complete, the breakdowns, and nothing else. It writes one line per number that changed: the change, then the part that moved most, in plain words. It never names a cause it was not given, such as the weather or the market, and says "no breakdown yet" where there is none.

**The first run of this entry.** The run lead asks the questions and shows the plan in plan mode. With the owner's yes, the tests come first and fail, then the code, the proof on the owner's own records, and one work commit with its log entry, [the runner](../../runner/run.md)'s way.

## Next

- Read your numbers in your week every Monday, in the [Monday brief](../../routines/monday-brief.md): "Install the Monday brief."
- Keep each number's weekly value as a scorecard with the Track your numbers page in the Leadership department, when it arrives in the dictionary, reading what each number means from your definitions.
- Give your Finance lead a bookkeeper who reads the same numbers, on [Specialists](specialists.md).
- See every skill your agents have on [Your skills](skills.md).
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so every change is compared and explained: "Upgrade Numbers to Complete."
