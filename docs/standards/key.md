# The Key

The Key is the `key/` folder. Every format below has one complete example. The examples follow one small business, Harbor Studio, and they are checked by the same code that checks the real folder (`src/lib/key/formats.ts`).

- **Write every name as a slug: lowercase letters and digits joined by single hyphens, as in `front-desk`.** A slug matches `^[a-z0-9]+(-[a-z0-9]+)*$`. A role slug is the agent's key everywhere: in `key.yaml`, in the charter's folder, and in routines and skills. Why: one name for one thing lets every file find every other file without a lookup table.
- **Use only the eleven category ids in `key.yaml`, routines and apps.** They are `command`, `attract`, `sell`, `deliver`, `keep`, `money`, `team`, `plan`, `vendors`, `risk`, `system`. Why: a new category would break the navigation and every place that groups by category.
- **Never put customer details, business records or secrets in the Key.** Business records live in the database. Why: the Key travels with the repository, and records do not belong there (see `privacy.md`).
- **Never use `core` as an app slug.** Why: it would collide with the core migration names.

## key.yaml

The ring: the list of everything the Key holds. `stage` is `seed` or `systems`. `home` is always `repo`. Paths are relative to `key/`.

```yaml
key: 1
client: harbor-studio
name: Harbor Studio
stage: systems
home: repo
roster:
  - persona: Mara
    role: front-desk
    charter: agents/front-desk/charter.md
    added: 2026-10-05
    version: 1
skills:
  - slug: confirm-booking
    path: skills/confirm-booking/SKILL.md
    agent: front-desk
apps:
  - slug: bookings
    definition: apps/bookings/definition.yaml
    category: deliver
routines:
  - slug: booking-reminders
    path: routines/booking-reminders.md
    agent: front-desk
    category: deliver
runs: []
installed:
  - entry: routines/booking-reminders
    from: dictionary@0.1.0
    tier: essentials
    version: 1
    files: [routines/booking-reminders.md]
    installed: 2026-10-05
provenance:
  stated_by: Jo Harbor
  recorded: 2026-10-05
  guide: foundation
  base: 3f2a91c04b7d6e5f8a9b0c1d2e3f4a5b6c7d8e9f
```

- **Leave `provenance.base` to setup.** When setup names the Key it records the commit it ran on, the full 40 character id, as `base`, and keeps the other provenance fields. The build log starts after that commit. When setup did not record one, as in a Foundation set up before setup recorded its base, run `npm run log:base` once: it sets `base` to the current commit and touches no other field, and it changes an existing `base` only with `--force` (see `log.md`). Why: `npm run log:sync` reads only the commits after `base`, so Light Brands' own template history never lands in the member's log.
- **Record every Dictionary install in `installed`.** Each item has `entry` (a kind folder and a slug, such as `routines/booking-reminders`), `from` (`dictionary@` and a version such as `0.1.0`), `tier` (`essentials`, `complete` or `mastery`), `files` (a non-empty list of paths inside `key/`, written without `..`, without a leading `/` and without a backslash, each of which exists) and `installed` (the date). Why: the list shows what the business has put in place and from which version, and a file named there that is gone is found at once.
- **Record the entry's version in `version` when its front matter has one.** It is the `version` from the entry's front matter in the dictionary, a positive whole number such as `2`. A row may leave it out. Why: it records which version of the entry was put in place, so an upgrade can tell whether the entry has changed since, and the format test rejects anything that is not a positive whole number.
- **Name the app code an install added in `code`.** Most installs add code outside `key/` as well as Key files. Give each such row a `code` list of paths from the top of the repository, each starting with `src/` or `modules/`, written without `..` or `.` segments, without an empty segment such as `src//x`, without a leading or trailing `/` and without a backslash, and each of which exists. A row with only Key files has no `code`. Why: the list then shows everything an install put in place, and a code file named there that is gone is found at once. Upgrade, check and remove treat these files the same way as the Key files, so an upgrade keeps your edits in them too.
- **Keep `key.yaml` in step with the files.** Add the entry when you add the file, and run `npm run key:sync` afterward. Why: the system document's inventory is built from this file.
- **Set `charter` to `agents/<role>/charter.md` for every roster entry, and give it a `persona`.** Why: the format test fails on any other path, and the converter reads the persona as the agent's display name.
- **Name a role from the roster in every skill's `agent`.** When a skill arrives before its role, as when a skill is installed before the routine that adds the role, leave `agent` out until the roster has the role. Why: a skill whose agent has no roster row has no charter and no persona, and the format test fails on it (`skills[i].agent "<role>" is not in the roster`).
- **Give every skill and routine a `path` and every app a `definition`, and make each file exist.** Every file `key.yaml` names must be on disk. Why: the converter builds its manifest from these entries, and a missing file fails there instead of here.
- **Keep every app folder in `key/apps/` listed in `key.yaml`, and name the folder, the definition's `app` and the `key.yaml` slug the same.** Why: a folder `key.yaml` does not list never reaches the manifest, and three names for one app leave nothing to find it by.
- **Give every `record_change` routine an `entity` that some app's definition defines.** Why: a trigger on an entity nobody defines never fires.

## Run briefs

`key/runs/` holds one brief for each run of the Dictionary. The Dictionary is the Ninja framework guide, shipped in `ninja/`, that lists everything you can put into your business. The file name is `<YYYY-MM-DD>-<verb>-<entry with / as ->.md`, such as `2026-10-06-install-routines-booking-reminders.md`. Every `/` in the entry becomes `-`, so `modules/sell/leads` gives `2026-10-06-install-modules-sell-leads.md`. The front matter has `verb` (`install`, `modify`, `upgrade`, `check`, `remove`, `learn` or `weave`), `entry`, `tier`, `stage` (1 to 10), `consents` (a mapping of `write`, `preview` and `messages`, each `true` for yes or `false` for no) and the dates `started` and `updated`.

```markdown
---
verb: install
entry: routines/booking-reminders
tier: essentials
stage: 5
consents: {write: true, preview: false, messages: false}
started: 2026-10-06
updated: 2026-10-06
---
# Brief

Install the booking reminders routine.
```

- **Name the file after the verb and the entry it records.** Why: the folder reads as a dated history, and the name tells you which run each brief holds.

## The context block

`key/knowledge/context-block.yaml` is the single source of business facts. The database's `business_profile` table has the same fields under the same names, with `owner` stored as `owner_name`, `owner_first` and `owner_role`. The Preferences save is the only writer of this file: it copies the saved row into it with no mapping, and sets `name` in `key.yaml` to the business name. `client` stays as set at setup. `npm run key:sync` rebuilds the inventory in `system.md` and writes neither.

```yaml
business: Harbor Studio
short_name: Harbor
what_we_do: Private yoga and mobility sessions for people recovering from injury
who_we_serve: Adults in Portland who want to move well again
how_we_sound: Warm, plain and encouraging
website: https://harborstudio.example
email: hello@harborstudio.example
phone: 503 555 0100
city: Portland
timezone: America/Los_Angeles
owner:
  name: Jo Harbor
  first: Jo
  role: Founder
stated_by: Jo Harbor
recorded: 2026-10-05
```

- **Change a business fact in Settings, then Preferences, and press Save.** Never edit the file by hand. Commit the files the save changed, `key/key.yaml` and `key/knowledge/context-block.yaml`, by name as one commit named `chore: business facts`. The first session's setup commit, `chore: set up <business>`, holds any save made before it. Why: the Preferences save is the only writer, and the next Save rewrites the file from the database row. One commit name for every save makes the history of business facts easy to find.

## Charter

`key/agents/<role>/charter.md` has exactly eight headings, in this order: Role, Who I serve, How I work, What I know, What I never do, Tasks, Skills, Memory. Each Memory entry starts with its type: `preference:`, `feedback:`, `reference:` or `context:`.

```markdown
# Front desk

## Role
I answer new inquiries and keep the booking calendar accurate.

## Who I serve
Jo Harbor and the people who book sessions with Harbor Studio.

## How I work
I reply within one business day, in plain words, and I confirm every booking in writing.

## What I know
The session types, the prices and the cancellation policy in key/knowledge/context-block.yaml.

## What I never do
I never take a payment, change a price, or promise a time Jo has not approved.

## Tasks
- Confirm new bookings.
- Send reminders before each session.

## Skills
- confirm-booking

## Memory
- preference: Jo likes confirmations to open with the client's first name.
- context: Sessions run Tuesday to Saturday.
```

## Skill

`key/skills/<slug>/SKILL.md` has front matter with `name` and `description`, then the sections Input, Steps, Output and Check, in that order.

```markdown
---
name: Confirm a booking
description: Confirm a new booking with the client in writing and record it.
---

## Input
The client's name, email and the session time they asked for.

## Steps
1. Check the time is free on the calendar.
2. Write a short confirmation in the voice from the context block.
3. Ask Jo to approve it, then send it.

## Output
A sent confirmation and a booking record with status confirmed.

## Check
The booking appears on the calendar and the client has the confirmation.
```

## Routine

`key/routines/<slug>.md` has front matter with `name`, `agent` (a role slug), `category` (a category id) and `trigger`, plus the fields the trigger needs. Then the sections Goal, Steps, Expected output, Check and When blocked, in that order.

| trigger | fields it needs |
|---|---|
| `cron` | `cron`, a schedule of exactly five space-separated fields (minute 0-59, hour 0-23, day of month 1-31, month 1-12, weekday 0-7), each a number, `*`, a range `a-b`, a list `a,b` or a step `*/n` or `a-b/n`, such as `0 9 * * *` or `*/15 9-17 * * 1-5` |
| `every` | `every`, a number and a unit, such as `1 day` or `30 minutes` (`second`, `minute`, `hour`, `day` or `week`, with an optional `s`) |
| `at` | `at`, a date and time |
| `record_change` | `entity` and `events` |

```markdown
---
name: Booking reminders
agent: front-desk
category: deliver
trigger: record_change
entity: bookings
events: [insert]
---

## Goal
Every client gets a reminder 24 hours before their session.

## Steps
1. Read the new booking.
2. Schedule a reminder for 24 hours before the start.
3. Draft the message in the voice from the context block.

## Expected output
One scheduled reminder for each confirmed booking.

## Check
A test booking produces exactly one reminder at the right time.

## When blocked
Ask Jo in the Inbox and change nothing.
```

## App definition

`key/apps/<app>/definition.yaml` registers the app and describes its tables. Field types are limited to `text`, `number`, `date`, `select`, `multi_select`, `checkbox`, `user`, `multi_user`, `url`, `email` and `attachment`. A `select` or `multi_select` field needs `options`. An automation names a routine that exists. `migrations` is always `migrations/`. The SQL for each type is in `data.md`.

```yaml
app: bookings
name: Bookings
category: deliver
runtime: custom_app
entities:
  - key: bookings
    name: Booking
    fields:
      - { key: client_email, name: Client email, type: email }
      - { key: starts, name: Starts, type: date }
      - { key: status, name: Status, type: select, options: [new, confirmed] }
      - { key: paid, name: Paid, type: checkbox }
    views: [table]
automations:
  - key: send-reminder
    trigger: { record_change: { entity: bookings, events: [insert] } }
    routine: booking-reminders
migrations: migrations/
```

- **Run `npm test` after any change to the Key.** The format tests read every file in `key/`. Why: a malformed charter or definition is found in seconds here and in days after it is plugged into something else.
