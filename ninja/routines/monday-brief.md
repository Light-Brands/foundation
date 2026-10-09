---
id: routines/monday-brief
kind: routine
title: Monday brief
lead: null
state: live
target: foundation
tiers: [essentials, complete, mastery]
uses: [agents/chief-of-staff, skills/write-the-brief]
crew: [run-lead, automation-engineer, builder, code-reviewer, qa-lead, scribe]
specialists: []
level: 1
version: 1
---

# Monday brief

Department: Command center. Job: See your day.

**The job it takes off your plate:** gathering the week. One short brief lands in your Inbox: new leads, open deals, bookings, money in and out, and anything waiting for you, drawn from whatever you have installed.

**What you still decide:** what to do about it. The brief reports and suggests. It never sends a message to a customer, moves money or changes a record.

## What it is

A routine, which is a written job an agent runs on a schedule. It reads the numbers from everything installed in your Foundation, writes them up as a brief that fits on one screen, keeps a copy, and puts it in your Inbox as one card. Its schedule is every Monday at 8:00 in your time zone.

**How it runs today.** Today the brief runs on your own computer, when you ask for it ("Run the Monday brief"), with the Foundation closed, because only one program can open the local database at a time. The Monday 8:00 schedule takes effect once your Foundation has a routine runner that runs a routine on its own schedule, since the Foundation's only scheduled job today is the daily checks. The brief command opens the local database, so the brief shows on your own computer, and a deployed copy on a hosted database shows no brief yet.

## The bar

The world-class version is the note a great chief of staff leaves on your desk before you arrive: one screen, read in under a minute, every number true, nothing you have to go and look up, and one clear suggestion for where to start. It reports only what is installed, and it says plainly what it cannot see yet. It never invents a number. It never repeats itself: one brief per week, however many times it runs.

## Depth tiers

**Essentials.** A one-screen brief of the last seven days from whatever is installed, as a card in your Inbox.

Adds: the chief of staff role, then the brief-writing skill, each installed first in its own run. Then the routine, the `briefs` app that keeps one brief per week, and the brief command, which is two code files: `src/lib/data/briefs.ts` (the numbers, the save and the counts) and `src/lib/data/briefs-command.ts` (the command `npm run brief` runs, with its `numbers`, `save`, `check` and `blocked` options), with their tests in `tests/unit/briefs.test.ts`.

**Complete.** Adds a "since last week" comparison beside every number, and an email copy of the brief drafted for you each week.

Adds: the week's numbers stored with each brief, so the next brief can compare against them, and the email copy, drafted into the brief's row in `briefs` each time a brief is saved, addressed to the business email in your context block. The copy is kept in that row and is never put in the outbox, so nothing is sent. Sending it is the next rung, in Autopilot.

**Mastery.** Adds a short plan for the week and flags anything off track.

Adds: a target for each number you choose, an "Off track" mark on every number that misses its target, the count of off-track numbers in the card's title, and three suggested moves for the week.

## Questions

Asked after [the questionnaire](../runner/questionnaire.md), one at a time, each with its default.

1. **Who runs it?** "Which of your roles should run the Monday brief? I suggest your chief of staff." The default is `chief-of-staff`. When it is not on the roster yet, [Chief of staff](../agents/chief-of-staff.md) installs it first as a part, in its own run, and that run asks the role's name, with a default the owner can accept with a yes. The owner can instead choose any role already on the roster, and then the routine's row and the skill's row name that role.
2. **The time zone.** "Your brief is dated and counted in <the time zone in your context block>. Is that right?" When the context block has no time zone, the answer goes in Settings, then Preferences, and the owner presses Save. After setup, that save is the one writer of the context block, so the run never sets it by hand.
3. **How it runs today.** Say it plainly before the plan, with the day and time read from the routine as it is now: its `cron` line and Goal when the routine is installed, and Monday at 8:00 on a first install. "For now, your brief runs on this computer when you ask for it, with the Foundation closed. The <day> <time> schedule starts once your Foundation can run a routine on its own schedule. Shall we go ahead?"
4. **Your tools.** "Which calendar, inbox and accounting tools do you use today?" The default is none yet. Each tool you name is listed in the receipt as a connection to make next, and its numbers join the brief once the entry that reads it is installed.
5. **Complete only. Where the email copy is addressed.** "The email copy is addressed to <the email in your context block>. Is that the right address?" A different address is entered the same way, in Settings, then Preferences.
6. **Mastery only. The targets.** "What does a good week look like? For each number, tell me the target, or skip it." For example: "5 new leads, 8 bookings."

## Parts

Installed in this order, before the routine. When a part is not installed yet, [install](../runner/verbs/install.md) installs it first, as its own run, with its own `installed` row.

1. [Chief of staff](../agents/chief-of-staff.md) (`agents/chief-of-staff`): the role that runs the routine and the skill, with its roster row and charter.
2. [Write the brief](../skills/write-the-brief.md) (`skills/write-the-brief`): turns the numbers into the one-screen brief. The routine gathers the numbers and saves the result. The skill does the writing.

## Crew

- **Run lead:** owns the ten stages, the merged plan and the gates, and is the only one who commits.
- **Automation engineer:** the routine file, its schedule and its steps, and the skill the routine runs.
- **Builder:** the `briefs` app definition and its migrations, the two code files with the `numbers`, `save`, `check` and `blocked` options, and their tests, written test first.
- **Code reviewer:** the one-shape rule between definition and migrations, the single statement that saves a brief and its card together, that a second run in the same week writes nothing, and that the week and the window follow the business's time zone.
- **QA lead:** the proof with the seeded data, and the completion test.
- **Scribe:** the `key.yaml` rows, the origin in `installed` with its `files` and `code`, the run brief and the build log entries.

## Data

One app, `briefs`, in the Command center. Its table keeps one row per week. The brief is a business record, so it lives in the database, and nothing about it is written into the Key.

**Source of truth.** Each piece of the Monday brief lives in one place, and nothing keeps a second copy:

- **The briefs:** the `briefs` table, one row per week, with the week, the brief and the date it was written. At Complete the same row also holds the week's counts and the drafted email copy.
- **Each brief's card:** the core table `inbox_items`, one row per brief, written in the same statement as the brief's row.
- **The schedule, the steps and the role that runs it:** the Key file `key/routines/monday-brief.md`, and the routine's row in `key/key.yaml`.
- **How the brief is written:** the Key file `key/skills/write-the-brief/SKILL.md`.
- **The time zone:** Settings, Preferences, whose Save is, after setup, the one writer of the business profile and of `key/knowledge/context-block.yaml`. The routine carries no time zone of its own.

`key/apps/briefs/definition.yaml`, as the builder writes it at Essentials:

```yaml
app: briefs
name: Briefs
category: command
runtime: custom_app
entities:
  - key: briefs
    name: Brief
    fields:
      - { key: week, name: Week, type: date }
      - { key: body, name: Body, type: text }
      - { key: sent_at, name: Written, type: date }
    views: [table]
migrations: migrations/
```

`key/apps/briefs/migrations/0001_briefs_create.sql`, the matching table, with the three system columns every app table has:

```sql
create table if not exists briefs (
  id uuid primary key default gen_random_uuid(),
  week date not null unique,
  body text not null,
  sent_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

- `week` is the date of the Monday of the week the brief runs in, in the business's time zone. It is unique, so a week has one brief at most.
- `body` is the brief as written.
- `sent_at` is the date the brief was written and its card put in the Inbox, in the business's time zone. The owner sees it labeled "Written", because nothing is sent. The field keeps its name, `sent_at`.

The Inbox cards live in the core table `inbox_items`, which every Foundation has. The brief adds no column to it. Each brief card is one row with `kind` set to `brief`, `category` to `command`, `subcategory` to `home`, the card's title in `title` and the brief in `body`.

The entries in `key.yaml` after an Essentials install of all three entries, for runs on October 5, 2026 from dictionary 0.1.1, with the chief of staff's default name:

```yaml
roster:
  - persona: Avery
    role: chief-of-staff
    charter: agents/chief-of-staff/charter.md
    added: 2026-10-05
    version: 1
skills:
  - slug: write-the-brief
    path: skills/write-the-brief/SKILL.md
    agent: chief-of-staff
apps:
  - slug: briefs
    definition: apps/briefs/definition.yaml
    category: command
routines:
  - slug: monday-brief
    path: routines/monday-brief.md
    agent: chief-of-staff
    category: command
installed:
  - entry: agents/chief-of-staff
    from: dictionary@0.1.1
    tier: essentials
    version: 1
    files: [agents/chief-of-staff/charter.md]
    installed: 2026-10-05
  - entry: skills/write-the-brief
    from: dictionary@0.1.1
    tier: essentials
    version: 1
    files: [skills/write-the-brief/SKILL.md]
    installed: 2026-10-05
  - entry: routines/monday-brief
    from: dictionary@0.1.1
    tier: essentials
    version: 1
    files: [routines/monday-brief.md, apps/briefs/definition.yaml, apps/briefs/migrations/0001_briefs_create.sql]
    code: [src/lib/data/briefs.ts, src/lib/data/briefs-command.ts]
    installed: 2026-10-05
```

- `files` are paths relative to `key/`. `code` is the app code the entry put in place, as paths from the root of the repository, under `src/` or `modules/` only, never with `..`, a leading `/` or a backslash. The tests in `tests/unit/briefs.test.ts` are named in the plan, and stay out of `code`.
- The role is the one chosen at question 1. The chief of staff's roster row and charter belong to its own entry, so the charter is in the `agents/chief-of-staff` row's `files` and never in the routine's.
- The version in `from` is the dictionary version the run used, read from `ninja/VERSION`.

The plan also names one shared edit to `package.json`: the script lines `"prebrief": "node scripts/gen-build-secret.mjs"` and `"brief": "tsx --conditions=react-server src/lib/data/briefs-command.ts"`. The file belongs to the whole Foundation, so it is never in `code`.

## Screens and panels

No new screen. The brief appears where the Foundation already shows the Inbox:

- **Handle what needs you** (`/admin/command/inbox`), the Inbox screen, lists every card newest first, with its title, its time and its full text. The brief is the card titled "Your week of" and the month and day of the week's Monday, such as "Your week of October 5".
- **See your day** (`/admin`), Today, the first screen after you sign in, shows the titles of up to five of the newest new cards in its What needs you panel, so the brief's title is on the first screen you open.
- The navigation's badge on Handle what needs you counts the cards that are new, and the brief counts as one.

All three show the brief on your own computer today, because the brief command writes to the local database. A deployed copy on a hosted database shows no brief yet.

## Routines and Inbox cards

`key/routines/monday-brief.md`, as the automation engineer writes it at Essentials:

```markdown
---
name: Monday brief
agent: chief-of-staff
category: command
trigger: cron
cron: "0 8 * * 1"
---

## Goal
Every Monday at 8:00 in the business's time zone, the owner finds a one-screen brief of the last seven days in the Inbox.

## Steps
1. Run `npm run brief -- numbers` and read the week and the numbers for the seven days ending now, in the business's time zone, from everything installed.
2. Write the brief with the write-the-brief skill, using those numbers and nothing else.
3. Run `npm run brief -- save --week <the week step 1 printed>` with the brief on standard input. It keeps the brief in briefs and puts it in the Inbox as one card.

## Expected output
One row in briefs for the week, and one Inbox card titled "Your week of <month and day of the week's Monday>".

## Check
`npm run brief -- check --week <the week>` prints 1 brief and 1 card, and every number in the card matches what step 1 read.

## When blocked
Write no brief. Run `npm run brief -- blocked --step <the step that stopped> --reason "<what it printed>"`, which puts one card in the Inbox titled with the day this routine runs, such as "The Monday brief did not run", saying which step stopped, what it printed and the fix to try. Tell the owner the same. When the database itself cannot be opened, no card can be written: tell the owner to close the Foundation and ask for the brief again.
```

**The schedule.** The `cron` line reads minute 0, hour 8, any day of the month, any month, day 1 of the week, which is Monday. The Foundation's Key checker requires a `cron` line for a `cron` trigger and validates it: five fields, each within its own range, minute 0 to 59, hour 0 to 23, day of the month 1 to 31, month 1 to 12 and day of the week 0 to 7, where 0 and 7 are both Sunday. The time zone is the `timezone` in `key/knowledge/context-block.yaml`, the same value as the business profile's `timezone`, so the routine carries no time zone of its own.

**The week and the window.** The week is the Monday of the current week in the business's time zone, at the moment the brief runs. A brief that runs late on a Sunday belongs to the week that began the Monday before. The numbers count the seven days ending at the moment the brief runs, in the business's time zone, so a brief at 8:00 on a Monday counts from 8:00 the Monday before.

**When it runs.** The Foundation's only scheduled job today is the daily checks, so the routine runs when the owner asks, on their own computer, with the Foundation closed: the local database lives in `.data/` and only one program can open it at a time. The Monday 8:00 schedule takes effect once the Foundation has a routine runner that runs a routine on its own schedule.

**The card.** One card per brief, written in the same statement as the brief's row, so the two land together or not at all. A second run in the same week finds the week already taken and writes neither. The card's title is "Your week of" and the Monday's month and day. A blocked run writes no brief and one card of its own, with `kind` set to `brief-blocked`, so the owner finds out from the Inbox, never from silence. Its title names the day in the routine's `cron` line, so a brief moved to Tuesdays reports "The Tuesday brief did not run".

## Connections

Essentials uses none. Complete and Mastery use email sending, with its two doors: connect your own, or Light Brands builds it custom. Complete drafts the copy into the brief's row and never puts it in the outbox, so nothing is sent, even when email sending is connected on the Connect your tools page. The receipt says the copy is drafted and waiting.

## Autopilot

**What runs on its own.** The whole brief: reading the week's numbers, writing the brief, saving it and putting its card in the Inbox. No one approves it before it lands.

**The trigger.** The weekly schedule, the `cron` line in `key/routines/monday-brief.md`: every Monday at 8:00 in the business's time zone. The schedule waits on a routine runner that runs a routine on its own schedule, since the Foundation's only scheduled job today is the daily checks. Until that runner exists, the owner starts the same three steps by asking, "Run the Monday brief", on their own computer with the Foundation closed.

**The rung.** Runs and reports. The brief is written and delivered on its own, and the owner reads it. A run that stops reports too, as a card of its own, so a missed week shows up in the Inbox.

**The next rung.** The brief itself is already on the top rung, so the next climb belongs to its email copy at Complete. Today the copy is drafted and waits, which is Drafts for approval. Once email sending is connected on the Connect your tools page, a standing rule the owner sets, such as sending the copy to their own address every week, moves it to Acts within policy. That climb also puts the copy in the outbox, which a later version of this entry adds.

**What stays with the owner.** What to do about the brief. It reports and suggests, and it never sends a message to a customer, moves money or changes a record.

## Proof

### Essentials

**Setup.** The owner sets the time zone first, in Settings, then Preferences, and presses Save. With `npm run dev` running, the QA lead seeds one real item the way a customer would: one message through the public contact page at `/contact`, from an invented name such as a Harbor Studio test client. That message creates one contact and one Inbox card. Then the QA lead stops `npm run dev`, so the brief command can open the local database.

**The run.** The QA lead runs the routine's three steps, and the proof names the week it used. When a request runs across the start of a new week, each proof names its own week. The week is always stated relative to the day the proof runs: the Monday of that day's week, in the business's time zone. A proof run on Monday, October 5, 2026 in Portland has the week 2026-10-05. The same proof run at 11:00 at night on Sunday, October 4 in Portland has the week 2026-09-28, which is just as right. For a proof run on Monday, October 5, 2026, step 1 prints:

```json
{"week": "2026-10-05", "timezone": "America/Los_Angeles", "contacts_added": 1, "inbox_waiting": 1, "apps": []}
```

Compare what step 1 prints with this by value. The command may print the JSON compact or spaced, and either matches. `contacts_added` counts the seven days ending when step 1 runs. `inbox_waiting` counts the Inbox cards with status `new`, other than brief cards. Step 2 writes the brief from those numbers, and step 3 saves it. With `npm run dev` started again, the Inbox shows a new card titled "Your week of" and the month and day of the week's Monday. For the run on October 5, that is "Your week of October 5":

```text
Your week, October 5

New in the last seven days
- 1 new contact, through your contact page.

Waiting for you
- 1 card in your Inbox.

Not tracked yet
- Leads, deals, bookings and money show here once you install them.

Next: install Capture leads, so every inquiry is counted here.
```

**The completion test.** All of these pass:

1. With `npm run dev` stopped, `npm run brief -- check --week <the week step 1 printed>` prints one brief and one card for the week. For the run on October 5, that is `{"week": "2026-10-05", "briefs": 1, "cards": 1}`, compared by value.
2. Every number in the card matches the numbers from step 1, and the card fits in 12 lines of text, blank lines not counted.
3. Running step 3 again for the same week adds no row and no card: `check` prints the same counts.
4. `npm test` passes, which includes the unit tests in `tests/unit/briefs.test.ts`, the Key checker on the new definition, migration, routine and skill, and the one-shape test between the definition and its table.
5. The card shows on Handle what needs you, and its title shows in the What needs you panel on See your day.

### Complete

**Setup.** The Essentials setup, then last week's numbers, through the same command, on the owner's real data. Last week is the Monday before this week: for a proof run on Monday, October 5, 2026, it is `2026-09-28`.

- **When last week has no brief,** the QA lead seeds one with its numbers: `npm run brief -- save --week <last week> --numbers '{"contacts_added": 0, "inbox_waiting": 0, "apps": []}'` with a one-line brief on standard input. That adds last week's row and its card.
- **When last week already has a brief,** as it does once the routine has run at Essentials, that brief is used as it is. The QA lead reads its counts from its own lines, a count it leaves out being 0, and stores them: `npm run brief -- save --week <last week> --numbers '<those counts>'` with nothing on standard input. That fills in the numbers on last week's row and adds no row and no card.

**The run.** Step 1, now `npm run brief -- numbers --compare`, prints this week's numbers and last week's beside them, and `last_week` matches by value what the setup stored. For the run on October 5 with the seeded week, compared by value:

```json
{"week": "2026-10-05", "timezone": "America/Los_Angeles", "contacts_added": 1, "inbox_waiting": 1, "apps": [], "last_week": {"contacts_added": 0, "inbox_waiting": 0, "apps": []}}
```

The brief's lines now carry the change:

```text
New in the last seven days
- 1 new contact, through your contact page, up 1 since last week.

Waiting for you
- 1 card in your Inbox, up 1 since last week.
```

Step 3 saves the brief with this week's numbers, and the save drafts the email copy into the same row. For Harbor Studio, the sample business whose context block is in [the Ninja home](../foundation/ninja-home.md), it reads as below. For the owner's business, it carries their own email and week:

```text
To: hello@harborstudio.example
Subject: Your week of October 5

Your week, October 5
(the brief, line for line)
```

**The completion test.** All of these pass:

1. This week's row in `briefs` holds the counts from step 1 in `numbers`, in the same shape as `last_week`, without the week and the time zone, and the email copy in `email_copy`, addressed to the email in the context block.
2. Every "since last week" change equals this week's number less last week's.
3. Nothing was sent: the copy is kept in the row and is not in the outbox, and the receipt says the copy is waiting.
4. Running step 3 again for the same week changes nothing: `npm run brief -- check --week <this week>` prints the same counts.
5. `npm test` passes, including the one-shape test on the definition with its two new fields and migration 0002.

## Complete when

**Fitted.** passes when every answer shows in what was built: the role from question 1 is the routine's `agent`, the time zone from question 2 sets the week, the tools from question 4 are in the receipt, and at Complete and Mastery the address and the targets are in the row and the routine.

**Autopiloted.** passes when the routine's three steps run from its file alone, at Runs and reports, with no step left for the owner, triggered by the Monday schedule once the Foundation can run a routine on its own schedule, and by the owner's request until then.

**Visible.** passes when the brief's card shows on Handle what needs you, its title shows in the What needs you panel on See your day, and, once the Routines page is built, the brief shows there with its last run.

**Connected.** passes when each brief reaches the owner as exactly one Inbox card, and a run that stops as one card of its own.

**Recorded.** passes when `key.yaml` lists the role, the skill, the `briefs` app and the routine, each part and the routine with its own `installed` row naming its tier, version and the dictionary it came from, and the build log has each run's entries.

**Tested.** passes when the tests in `tests/unit/briefs.test.ts` failed before the code that passes them existed, and `npm test` passes.

**Proven.** passes when the Proof's run on the owner's own data gives a brief whose every number matches what step 1 printed.

**Coherent.** passes when both doors meet the same rows in the local database, the one the brief command opens today: a brief saved with `npm run brief -- save` shows as its card in the Inbox once the Foundation is open again, and a card the owner handles in the Inbox is one fewer waiting in the next `npm run brief -- numbers`.

**Reversible.** passes when remove exports every row of `briefs` to `.data/exports/` before it takes the routine out, and `npm test` stays green afterward.

**Explained.** passes when the owner can say in one sentence what runs, when, and what they decide, such as "Every Monday at 8:00 my brief lands in my Inbox, and I decide what to act on."

**One brief a week.** passes when running step 3 again for the same week adds no row and no card.

## Changing it

**What modify may change.** Each change lives in as few files as it can, so the owner's edits stay easy to keep at upgrade.

| Change | File | What changes |
|---|---|---|
| The day | `key/routines/monday-brief.md` | The last field of the `cron` line, 0 for Sunday through 6 for Saturday, and the day named in Goal. Tuesday is `cron: "0 8 * * 2"` and "Every Tuesday at 8:00". |
| The time | `key/routines/monday-brief.md` | The first two fields of the `cron` line, the minute and the hour, and the time named in Goal. 7:30 is `cron: "30 7 * * 1"`. |
| The day and the time | `key/routines/monday-brief.md` | Both, in one edit. Tuesday at 7:00 is `cron: "0 7 * * 2"` and "Every Tuesday at 7:00". |
| The schedule where the role names it | `key/agents/chief-of-staff/charter.md`, or the charter of the role that runs it | Every line that names the brief's day or time, such as its Role or a Memory line, changes with the day or the time in the same run, so the charter stays true. |
| The name | `key/routines/monday-brief.md` | The `name` line, such as "Tuesday brief". The slug `monday-brief` and the entry id stay. |
| The sections | `key/skills/write-the-brief/SKILL.md` | Steps 2 to 5 of the skill: add, remove, rename or reorder the sections. The skill's Output and Check keep the 12 line limit and the rule that every number is real. |
| Who runs it | `key/routines/monday-brief.md` and `key/key.yaml` | The `agent` line, and the `agent` of the routine's and the skill's rows in `key.yaml`. |

The week still starts on Monday whatever day the brief arrives, so `week` stays the Monday's date. Anything beyond the table is an upgrade or a different entry: the comparison, the email copy, the plan and the flags are deeper tiers, and changing the `briefs` table or the code is an upgrade.

**From the command line.** In Claude Code or Claude Desktop, with the Foundation closed, the brief command reads and writes the same rows the command center shows on your own computer. It opens the local database only, so a hosted database is out of its reach today:

- `npm run brief -- numbers` reads this week's numbers. At Complete, `--compare` adds last week's beside them.
- `npm run brief -- check --week <the week>` reads what is saved for a week: its brief and its card.
- `npm run brief -- save --week <the week>` writes a week's brief and its card together, with the brief on standard input.

The day, the time, the name, the sections and who runs it change the way the table above says: Claude edits the Key file it names, and `npm test` checks the edit. The command center shows each brief where the owner already looks. Its card on Handle what needs you is read from `inbox_items`, so a brief saved from the command line is there on the next load once the Foundation is open again, and its title is in the What needs you panel on See your day. The command center's Routines page, in Agentic, is marked coming soon, so for now the schedule is read and changed in `key/routines/monday-brief.md`, and a run that stops names the day from that file in its card's title.

**What upgrade adds, tier by tier.** Upgrading the routine upgrades its parts first, each to the routine's tier, in its own run, with its own `installed` row: [Chief of staff](../agents/chief-of-staff.md), then [Write the brief](../skills/write-the-brief.md). Each part's file is listed and compared under its own run, as its own entry describes. A Monday brief installed from dictionary 0.1.0 lists the chief of staff's charter in the routine's row: the chief of staff's run takes the charter into its own row, and the routine's run drops it from the routine's row, as [upgrade](../runner/verbs/upgrade.md) describes. Then the routine's run compares each file in its row's `files` and `code` three ways, the original from the commit that added the routine's newest install or upgrade brief, and the migrations already applied stay as they are.

To Complete, the two part runs first, then the routine's run:

- `key/routines/monday-brief.md`: step 1 becomes `npm run brief -- numbers --compare`, which also reads last week's numbers. Step 3 gains "with `--numbers` set to the counts step 1 printed. The save keeps them and drafts the email copy." Goal, the name and the `cron` line are untouched, so a day or time the owner changed is kept with no conflict.
- `key/apps/briefs/definition.yaml`: two fields, `{ key: numbers, name: Numbers, type: text }` for the week's counts, and `{ key: email_copy, name: Email copy, type: text }` for the drafted email.
- `key/apps/briefs/migrations/0002_briefs_numbers.sql`, new, and added to the row's `files`: `alter table briefs add column if not exists numbers text, add column if not exists email_copy text`. The first migration is never edited.
- `src/lib/data/briefs.ts`: `weekNumbers` reads last week's row for the comparison. Every save that writes a brief keeps its counts in `numbers` and drafts `email_copy` from the business email in the business profile and the brief. A save with `--numbers` for a week that already has a brief with no numbers stores the numbers in that row and writes nothing else.
- `src/lib/data/briefs-command.ts`: the `--compare` option for `numbers` and the `--numbers` option for `save`.
- `tests/unit/briefs.test.ts`, named in the plan: the comparison, the stored numbers and the drafted copy.

To Mastery, from Complete, the two part runs first, the chief of staff's and then the skill's, then the routine's run. Every part moves to Mastery with the routine, so all three rows record the same tier:

- `key/routines/monday-brief.md`: inside the Steps section, after the numbered steps, a Targets list with one line per number the owner chose at question 6, such as "- new leads: 5". Step 3 passes `--title "Your week of <month and day>: <count> off track"` when anything is off track.
- No data change. Mastery creates no code file and changes none, because `save` takes `--title` from Essentials on.

**What remove exports first.** Every row of `briefs`, the week and the brief, into one file the owner keeps, inside the Foundation folder, outside `key/` and never committed. The brief cards stay in the Inbox. It goes in `.data/exports/`, which git ignores. Remove then takes out the routine, the two code files in `code`, the unit tests in `tests/unit/briefs.test.ts` and the `prebrief` and `brief` script lines in `package.json`, so `npm test` stays green, and the `briefs` table is kept unless the owner says to drop it, which is a new migration. The skill and the chief of staff stay unless the owner removes them too.

## How it is done

**Why a routine, a skill and an app.** The routine owns when and in what order. The skill owns how the brief is written, so the owner can reshape the brief without touching the schedule. The app owns the history, so a week has one brief and the next brief can compare against the last. Each part changes on its own, which is what keeps modify and upgrade clean.

**Where it runs, and when.** Today the brief runs on the owner's own computer, when the owner asks, with the Foundation closed. The Foundation keeps its local database in `.data/`, and only one program can open that database at a time, so `npm run dev` must be stopped while the brief command runs. The Foundation's only scheduled job today is the daily checks. The Monday 8:00 schedule in the routine's `cron` line takes effect once the Foundation has a routine runner that runs a routine on its own schedule.

**The brief command.** `npm run brief` runs `src/lib/data/briefs-command.ts` with `tsx --conditions=react-server`, after a `prebrief` hook that writes the build secret, the way `npm run draft`, `npm run person` and `npm run connection:set` run theirs. It opens the database with `openScriptDb` from `src/lib/db/script.ts`, which reads the environment through `readEnv` and opens the local database through the same lock the command center takes. The logic lives in `src/lib/data/briefs.ts` as functions that take the database and the date as arguments, as `docs/standards/testing.md` asks, so `tests/unit/briefs.test.ts` runs in milliseconds.

- `numbers` reads the time zone from the business profile, works out the Monday of this week in that time zone, and prints one line of JSON for the seven days ending now, in that time zone: the week, the time zone, contacts added, the Inbox cards with status `new` other than briefs, and for every app listed in `key.yaml` except `briefs`, each entity's records added and in all. An entity with a `select` field keyed `status` also gets a count per status, which is how open deals appear. An entity with a `number` field keyed `amount` also gets the total for the last seven days, which is how money in and out appear. With no time zone set, it uses UTC and says so.
- `save --week <date>` reads the brief from standard input and runs one statement: insert the row into `briefs`, skipping the insert when the week already has one, and insert the card into `inbox_items` only when the row went in. It sets `sent_at` to today's date in the business's time zone. `--title` replaces the card's title.
- `check --week <YYYY-MM-DD>` prints one line of JSON with the week, the count of rows in `briefs` for it, and the count of cards with `kind` `brief` written with that row. One statement writes the row and its card, so they share the same `created_at`, which is how `check` pairs them. It writes nothing, so the QA lead and the routine's Check use it with the Foundation closed.
- `blocked --step <n> --reason <text>` writes one Inbox card with `kind` `brief-blocked`, `category` `command`, `subcategory` `home`, the title "The <day> brief did not run", the day read from the last field of the `cron` line in `key/routines/monday-brief.md`, and a body naming the step, what it printed and the fix to try. It writes nothing to `briefs`.

**The one data shape.** The table is named after the entity key and each column after a field key, with the SQL type of its field type: `date` for `week` and `sent_at`, `text` for `body`. `compareDefinition` in `src/lib/key/schema.ts` fails `npm test` if the two drift. The `unique` on `week` is a constraint, and the shape check reads only names and types.

**Going deeper.** Ask to [learn](../runner/verbs/learn.md) how routines run on a schedule, how the Inbox works, or how the three-way comparison keeps your changes.

## Next

- [Modify](../runner/verbs/modify.md) it to your week: "Modify my Monday brief to arrive on Tuesdays."
- [Upgrade](../runner/verbs/upgrade.md) it to Complete for the comparison with last week and the drafted email copy: "Upgrade my Monday brief to Complete."
- [Check](../runner/verbs/check.md) your system to see what the brief can report next.
- Install Capture leads when it arrives in the dictionary, so every inquiry shows in the brief.
- Give the chief of staff who writes it a page of its own, with this week's brief on it: "Install Chief of staff." See [Chief of staff](../modules/agentic/chief-of-staff.md).
- Add [Department leads](../modules/agentic/department-leads.md), so each department adds its own line to the brief every week: "Install Department leads."
- Define the numbers that matter once, so the brief lists them every week, on [Numbers](../modules/agentic/numbers.md): "Install Numbers."
