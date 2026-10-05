---
id: routines/monday-brief
kind: routine
title: Monday brief
target: foundation
tiers: [essentials, complete, mastery]
uses: [skills/write-the-brief]
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

**How it runs today.** Today the brief runs on your own computer, when you ask for it ("Run the Monday brief"), with the Foundation closed, because only one program can open the local database at a time. The Monday 8:00 schedule takes effect once your Foundation has a hosted database. Until then, the deployed copy of your Foundation shows no brief, because it has no database to keep one in.

## The bar

The world-class version is the note a great chief of staff leaves on your desk before you arrive: one screen, read in under a minute, every number true, nothing you have to go and look up, and one clear suggestion for where to start. It reports only what is installed, and it says plainly what it cannot see yet. It never invents a number. It never repeats itself: one brief per week, however many times it runs.

## Depth tiers

**Essentials.** A one-screen brief of the last seven days from whatever is installed, as a card in your Inbox.

Adds: the routine, the brief-writing skill (installed first, in its own run), the `briefs` app that keeps one brief per week, and the brief command, which is two code files: `src/lib/data/briefs.ts` (the numbers and the save) and `src/lib/data/briefs-command.ts` (the command `npm run brief` runs), with their tests in `tests/unit/briefs.test.ts`.

**Complete.** Adds a "since last week" comparison beside every number, and an email copy of the brief drafted for you each week.

Adds: the week's numbers stored with each brief, so the next brief can compare against them, and the email copy, drafted into the brief's row in `briefs`, addressed to the business email in your context block. Sending waits until the Foundation can send email. Until then the copy is drafted and kept, and nothing is sent.

**Mastery.** Adds a short plan for the week and flags anything off track.

Adds: a target for each number you choose, an "Off track" mark on every number that misses its target, the count of off-track numbers in the card's title, and three suggested moves for the week.

## Questions

Asked after [the questionnaire](../runner/questionnaire.md), one at a time, each with its default.

1. **Who runs it?** "Which of your roles should run the Monday brief? I suggest <the first role in your roster>." When the roster is empty, the default is a new role, `chief-of-staff`, and the next question is "What would you like to call your chief of staff?", because every role needs a name.
2. **The time zone.** "Your brief is dated and counted in <the time zone in your context block>. Is that right?" When the context block has no time zone, the answer goes in Settings, then Preferences, and the owner presses Save. That save is the only writer of the context block, so the run never sets it by hand.
3. **How it runs today.** Say it plainly before the plan: "For now, your brief runs on this computer when you ask for it, with the Foundation closed. The Monday 8:00 schedule starts once your Foundation has a hosted database. Shall we go ahead?"
4. **Complete only. Where the email copy is addressed.** "The email copy is addressed to <the email in your context block>. Is that the right address?" A different address is entered the same way, in Settings, then Preferences.
5. **Mastery only. The targets.** "What does a good week look like? For each number, tell me the target, or skip it." For example: "5 new leads, 8 bookings."

## Parts

- [Write the brief](../skills/write-the-brief.md) (`skills/write-the-brief`): turns the numbers into the one-screen brief. The routine gathers the numbers and saves the result. The skill does the writing. When the skill is not installed yet, [install](../runner/verbs/install.md) installs it first, as its own run, with its own `installed` row.

## Crew

- **Run lead:** owns the ten stages, the merged plan and the gates, and is the only one who commits.
- **Automation engineer:** the routine file, its schedule and its steps, and the skill the routine runs.
- **Builder:** the `briefs` app definition and its migrations, the two code files and their tests, written test first.
- **Code reviewer:** the one-shape rule between definition and migrations, the single statement that saves a brief and its card together, and that a second run in the same week writes nothing.
- **QA lead:** the proof with the seeded data, and the completion test.
- **Scribe:** the `key.yaml` rows, the origin in `installed` with its `files` and `code`, the run brief and the build log entries.

## Data

One app, `briefs`, in the Command center. Its table keeps one row per week. The brief is a business record, so it lives in the database, and nothing about it is written into the Key.

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
      - { key: sent_at, name: Sent, type: date }
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
)
```

- `week` is the date of the Monday that starts the week the brief runs in. It is unique, so a week has one brief at most.
- `body` is the brief as written.
- `sent_at` is the date the brief's card was put in the Inbox, in the business's time zone.

The Inbox cards live in the core table `inbox_items`, which every Foundation has. The brief adds no column to it. Each brief card is one row with `kind` set to `brief`, `category` to `command`, `subcategory` to `home`, the card's title in `title` and the brief in `body`.

The entries in `key.yaml` after an Essentials install:

```yaml
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
  - entry: skills/write-the-brief
    from: dictionary@0.1.0
    tier: essentials
    files: [skills/write-the-brief/SKILL.md]
    installed: 2026-10-06
  - entry: routines/monday-brief
    from: dictionary@0.1.0
    tier: essentials
    files: [routines/monday-brief.md, apps/briefs/definition.yaml, apps/briefs/migrations/0001_briefs_create.sql]
    code: [src/lib/data/briefs.ts, src/lib/data/briefs-command.ts]
    installed: 2026-10-06
```

- `files` are paths relative to `key/`. `code` is the app code the entry put in place, as paths from the root of the repository, under `src/` or `modules/` only, never with `..`, a leading `/` or a backslash. The tests in `tests/unit/briefs.test.ts` are named in the plan, and stay out of `code`.
- The role is the one chosen at question 1. When the run added `chief-of-staff`, the roster gains its row and `agents/chief-of-staff/charter.md` joins the routine's `files`.
- The version in `from` is the dictionary version the run used, read from `ninja/VERSION`.

The plan also names one shared edit to `package.json`: the script line `"brief": "tsx src/lib/data/briefs-command.ts"`. The file belongs to the whole Foundation, so it is never in `code`.

## Screens and panels

No new screen. The brief appears where the Foundation already shows the Inbox:

- **Handle what needs you** (`/command/inbox`), the Inbox screen, lists every card newest first, with its title, its time and its full text. The brief is the card titled "Your week of October 5".
- **See your day** (`/`), the home screen, shows the titles of the three newest cards in its Inbox panel, so the brief's title is on the first screen you open.
- The navigation's badge on Handle what needs you counts the cards that are new, and the brief counts as one.

All three show the brief on your own computer today. The deployed copy shows it once the Foundation has a hosted database.

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
1. Run `npm run brief -- numbers` and read the numbers for the last seven days from everything installed.
2. Write the brief with the write-the-brief skill, using those numbers and nothing else.
3. Run `npm run brief -- save --week <the Monday that starts this week>` with the brief on standard input. It keeps the brief in briefs and puts it in the Inbox as one card.

## Expected output
One row in briefs for the week, and one Inbox card titled "Your week of <month and day>".

## Check
The Inbox holds exactly one brief card for the week, and every number in it matches what step 1 read.

## When blocked
Write nothing. Tell the owner which step stopped and what it printed, and suggest the fix.
```

**The schedule.** The `cron` line reads minute 0, hour 8, any day of the month, any month, day 1 of the week, which is Monday. The Foundation's Key checker requires a `cron` line for a `cron` trigger and nothing more. The time zone is the `timezone` in `key/knowledge/context-block.yaml`, the same value as the business profile's `timezone`, so the routine carries no time zone of its own.

**When it runs.** Today the Foundation has no scheduler, so the routine runs when the owner asks, on their own computer, with the Foundation closed: the local database lives in `.data/` and only one program can open it at a time. The Monday 8:00 schedule takes effect once the Foundation has a hosted database. Until then the deployed copy has no database and shows no brief.

**The card.** One card per brief, written in the same statement as the brief's row, so the two land together or not at all. A second run in the same week finds the week already taken and writes neither. The card's title is "Your week of" and the Monday's month and day.

## Connections

Essentials uses none. Complete and Mastery use email sending, with its two doors: connect your own, or Light Brands builds it custom. Today the Foundation cannot send email, so Complete drafts the copy into the brief's row and sends nothing. The receipt says the copy is drafted and waiting.

## Proof

### Essentials

**Setup.** The owner sets the time zone first, in Settings, then Preferences, and presses Save. With `npm run dev` running, the QA lead seeds one real item the way a customer would: one message through the public contact page at `/contact`, from an invented name such as a Harbor Studio test client. That message creates one contact and one Inbox card. Then the QA lead stops `npm run dev`, so the brief command can open the local database.

**The run.** The QA lead runs the routine's three steps. The week is the Monday of the week the proof runs. For a proof run in the week of October 5, 2026, step 1 prints:

```json
{"week": "2026-10-05", "timezone": "America/Los_Angeles", "contacts_added": 1, "inbox_waiting": 1, "apps": []}
```

`contacts_added` counts the last seven days. Step 2 writes the brief from those numbers, and step 3 saves it. With `npm run dev` started again, the Inbox shows a new card, "Your week of October 5":

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

1. `briefs` has exactly one row for the week, and the Inbox has exactly one card with `kind` `brief` for it.
2. Every number in the card matches the numbers from step 1, and the card fits in 12 lines.
3. Running step 3 again for the same week adds no row and no card.
4. `npm test` passes, which includes the unit tests in `tests/unit/briefs.test.ts`, the Key checker on the new definition, migration, routine and skill, and the one-shape test between the definition and its table.
5. The card shows on Handle what needs you, and its title shows in the Inbox panel on See your day.

### Complete

**Setup.** The Essentials setup, then the QA lead seeds last week's brief with its numbers, through the same command: `npm run brief -- save --week 2026-09-28 --numbers '{"contacts_added": 0, "inbox_waiting": 0, "apps": []}'` with a one-line brief on standard input. That adds last week's row and its card.

**The run.** Step 1, now `npm run brief -- numbers --compare`, prints this week's numbers and last week's beside them:

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

Step 3 saves the brief with this week's numbers, and drafts the email copy into the same row:

```text
To: hello@harborstudio.example
Subject: Your week of October 5

Your week, October 5
(the brief, line for line)
```

**The completion test.** All of these pass:

1. This week's row in `briefs` holds the numbers from step 1 in `numbers`, and the email copy in `email_copy`, addressed to the email in the context block.
2. Every "since last week" change equals this week's number less last week's.
3. Nothing was sent: the Foundation has no way to send email yet, and the receipt says the copy is waiting.
4. Running step 3 again for the same week changes nothing.
5. `npm test` passes, including the one-shape test on the definition with its two new fields and migration 0002.

## Changing it

**What modify may change.** Each change lives in one file, so the owner's edits stay easy to keep at upgrade.

| Change | File | What changes |
|---|---|---|
| The day | `key/routines/monday-brief.md` | The last field of the `cron` line, 0 for Sunday through 6 for Saturday, and the day named in Goal. Tuesday is `cron: "0 8 * * 2"` and "Every Tuesday at 8:00". |
| The time | `key/routines/monday-brief.md` | The first two fields of the `cron` line, the minute and the hour, and the time named in Goal. 7:30 is `cron: "30 7 * * 1"`. |
| The name | `key/routines/monday-brief.md` | The `name` line, such as "Tuesday brief". The slug `monday-brief` and the entry id stay. |
| The sections | `key/skills/write-the-brief/SKILL.md` | Steps 2 to 5 of the skill: add, remove, rename or reorder the sections. The skill's Output and Check keep the 12 line limit and the rule that every number is real. |
| Who runs it | `key/routines/monday-brief.md` and `key/key.yaml` | The `agent` line, and the `agent` of the routine's and the skill's rows in `key.yaml`. |

The week still starts on Monday whatever day the brief arrives, so `week` stays the Monday's date. Anything beyond the table is an upgrade or a different entry: the comparison, the email copy, the plan and the flags are deeper tiers, and changing the `briefs` table or the code is an upgrade.

**What upgrade adds, tier by tier.** Upgrading the routine upgrades its parts first: `skills/write-the-brief` goes to the same tier in its own run, with its own `installed` row, and its file, `key/skills/write-the-brief/SKILL.md`, is listed and compared under that run, as its own entry describes. Then the routine's run compares each file in its row's `files` and `code` three ways, against the version this entry published at the row's `tier`.

To Complete, the skill's run first, then the routine's run:

- `key/routines/monday-brief.md`: step 1 becomes `npm run brief -- numbers --compare`, which also reads last week's numbers. Step 3 gains "with `--numbers` set to what step 1 printed, which also drafts the email copy". Goal, the name and the `cron` line are untouched, so a day or time the owner changed is kept with no conflict.
- `key/apps/briefs/definition.yaml`: two fields, `{ key: numbers, name: Numbers, type: text }` for the numbers as step 1 printed them, and `{ key: email_copy, name: Email copy, type: text }` for the drafted email.
- `key/apps/briefs/migrations/0002_briefs_numbers.sql`, new, and added to the row's `files`: `alter table briefs add column if not exists numbers text, add column if not exists email_copy text`. The first migration is never edited.
- `src/lib/data/briefs.ts`: `weekNumbers` reads last week's row for the comparison, and the save writes `numbers` and drafts `email_copy` from the business email in the business profile and the brief.
- `src/lib/data/briefs-command.ts`: the `--compare` option for `numbers` and the `--numbers` option for `save`.
- `tests/unit/briefs.test.ts`, named in the plan: the comparison, the stored numbers and the drafted copy.

To Mastery, from Complete, the skill's run first, then the routine's run:

- `key/routines/monday-brief.md`: inside the Steps section, after the numbered steps, a Targets list with one line per number the owner chose at question 5, such as "- new leads: 5". Step 3 passes `--title "Your week of <month and day>: <count> off track"` when anything is off track.
- No data change. Mastery creates no code file and changes none, because `save` takes `--title` from Essentials on.

**What remove exports first.** Every row of `briefs`, the week and the brief, into one file the owner keeps, inside the Foundation folder, outside `key/` and never committed. The brief cards stay in the Inbox. Remove then takes out the routine, the two code files in `code` and the `brief` script line, and the `briefs` table is kept unless the owner says to drop it, which is a new migration. The skill stays unless the owner removes it too.

## How it is done

**Why a routine, a skill and an app.** The routine owns when and in what order. The skill owns how the brief is written, so the owner can reshape the brief without touching the schedule. The app owns the history, so a week has one brief and the next brief can compare against the last. Each part changes on its own, which is what keeps modify and upgrade clean.

**Where it runs, and when.** Today the brief runs on the owner's own computer, when the owner asks, with the Foundation closed. The Foundation keeps its local database in `.data/`, and only one program can open that database at a time, so `npm run dev` must be stopped while the brief command runs. The Foundation has no scheduler yet. The Monday 8:00 schedule in the routine's `cron` line takes effect once the Foundation has a hosted database. Until then the deployed copy runs without a database and shows no brief.

**The brief command.** `npm run brief` runs `src/lib/data/briefs-command.ts` with tsx, the way `npm run key:sync` runs its script. It opens the local database with `openPglite` and `migrateAll` from `src/lib/db/`, the same way `getDb()` does, using `FOUNDATION_DATA_DIR` or `.data/pglite` as `readEnv` does. It calls neither `getDb()` nor `readEnv`, because they load the environment through a server-only module that tsx cannot load. The logic lives in `src/lib/data/briefs.ts` as functions that take the database and the date as arguments, as `docs/standards/testing.md` asks, so `tests/unit/briefs.test.ts` runs in milliseconds.

- `numbers` reads the time zone from the business profile, works out the Monday that starts this week, and prints one line of JSON for the last seven days: the week, the time zone, contacts added, the Inbox cards with status `new` other than briefs, and for every app listed in `key.yaml` except `briefs`, each entity's records added and in all. An entity with a `select` field keyed `status` also gets a count per status, which is how open deals appear. An entity with a `number` field keyed `amount` also gets the total for the last seven days, which is how money in and out appear. With no time zone set, it uses UTC and says so.
- `save --week <date>` reads the brief from standard input and runs one statement: insert the row into `briefs`, skipping the insert when the week already has one, and insert the card into `inbox_items` only when the row went in. It sets `sent_at` to today's date in the business's time zone. `--title` replaces the card's title.

**The one data shape.** The table is named after the entity key and each column after a field key, with the SQL type of its field type: `date` for `week` and `sent_at`, `text` for `body`. `compareDefinition` in `src/lib/key/schema.ts` fails `npm test` if the two drift. The `unique` on `week` is a constraint, and the shape check reads only names and types.

**Going deeper.** Ask to [learn](../runner/verbs/learn.md) how routines run on a schedule, how the Inbox works, or how the three-way comparison keeps your changes.

## Next

- [Modify](../runner/verbs/modify.md) it to your week: "Modify my Monday brief to arrive on Tuesdays."
- [Upgrade](../runner/verbs/upgrade.md) it to Complete for the comparison with last week and the drafted email copy: "Upgrade my Monday brief to Complete."
- [Check](../runner/verbs/check.md) your system to see what the brief can report next.
- Install Capture leads when it arrives in the dictionary, so every inquiry shows in the brief.
