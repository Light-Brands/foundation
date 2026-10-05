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
work_days: tue,wed,thu,fri,sat
work_start: "09:00"
work_end: "17:00"
postal_address: 12 Harbor Way, Portland, OR 97201
owner:
  name: Jo Harbor
  first: Jo
  role: Founder
stated_by: Jo Harbor
recorded: 2026-10-05
```

`work_days` lists the days the business is open in week order, and `work_start` and `work_end` are its hours on a 24 hour clock in its own time zone. All three are empty when the owner has not set them, and every routine then treats the business as always open. `postal_address` is one line, and marketing email carries it in its footer when it is set. A job reads it from the profile when it sends and never keeps its own copy.

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

## Card kinds

An app's `definition.yaml` or a routine's front matter declares the kinds of card it writes, under `card_kinds`. The category is the app's or the routine's own. `src/lib/key/declarations.ts` checks every declaration, and the running app loads the same list from `key/`.

```yaml
card_kinds:
  - kind: booking-request
    subcategory: booking
    label: Booking request
    decide: approve
    expires_days: 3
    on_lapse: raised_again
  - kind: refund-ask
    subcategory: booking
    label: Refund request
    decide: approve
    always_human: true
```

- **Declare every card kind a job writes, once, in the Key.** `kind` is a slug no other app, routine or core kind uses (`contact`, `check-failed`, `brief`, `brief-blocked` are core), `subcategory` is a job in the declaring category, and `label` is 1 to 60 characters in plain words. Why: the card writer refuses a kind nobody declared, so every card has an owner and a place.
- **Set `decide` to `approve` when the card waits for a yes or no, and `always_human: true` when only the owner may give it.** Money, signing, people and deleting records are always the owner's: the checker refuses a `decide: approve` kind without `always_human: true` in any Finance job, in Sign contracts, in Manage your team and in Hire. Why: the Inbox shows Approve and Decline only where a decision is wanted, and a team member can never decide what belongs to the owner.
- **Give a card that goes stale an `expires_days` and an `on_lapse` rule.** `stays` keeps it, `closes` marks it done, and `raised_again` brings it back to the top. Why: an Inbox full of old cards hides the ones that matter.
- **Restart the app after a run adds a routine or a card kind in production.** In production the app reads the Key's declarations once and keeps them for the life of the process. Why: a deployed app never changes its Key, so reading once is safe, and a restart is how a new declaration shows up.

## Public forms

An app's `definition.yaml` declares the public forms its job takes in, under `forms`. The Foundation serves each one at `/f/<key>` and writes every answer as a card of the declared kind, through the same helper `/contact` uses.

```yaml
forms:
  - key: request-a-session
    title: Request a session
    intro: Pick a day that suits you and we will confirm by email.
    card_kind: booking-request
    submit: Send request
    thanks: Thank you. We will confirm your time by email.
    fields:
      - { key: name, label: Your name, type: text, required: true, max: 120 }
      - { key: email, label: Email, type: email, required: true }
      - { key: phone, label: Phone, type: phone }
      - { key: day, label: Preferred day, type: date }
      - { key: service, label: Session, type: select, options: [Mobility, Recovery] }
      - { key: notes, label: Anything we should know, type: long_text, max: 2000 }
```

`key` is a slug no other form uses, and never `contact`. `title` is 1 to 80 characters, `intro` up to 300, `submit` 1 to 30 (default Send) and `thanks` 1 to 200. A form has 2 to 20 fields. Field `type` is one of `text`, `long_text`, `email`, `phone`, `date`, `number`, `select` and `checkbox`, a `select` needs 1 to 30 `options` or one `options_from` (below), and `max` is a whole number from 1 to 4000. No file upload in 1.0.

- **Declare a public form in its app's `definition.yaml`, under `forms`, and never build a public page by hand.** The Foundation serves every declared form at `/f/<key>`, refuses any form the Key does not declare, and saves through one helper that only inserts. Why: one route with one set of protections is safer than a new public page per job.
- **Give every form a required `name` text field and a required `email` field, and a `phone` field of type `phone` when you ask for one.** Those three create or reuse the contact, and every other answer lands on the card. Why: a person's details live once, on the contact, and never in an app's own table.
- **Read a select's options from an app table with `options_from`, from the declaring app or an app listed in its `uses_apps`.** Write `{ key: event, label: Event, type: select, options_from: { app: events, entity: events, label: title, where: open } }` in place of `options`. `app` is the declaring app or one in its `uses_apps`, and installed, `entity` one of its tables, `label` a `text`, `select`, `email` or `url` field of that table, and `where`, when given, a `checkbox` field: only rows where it is true are choices. The page lists up to 200 choices by label, valued by the row's `id`. The save reads the table again and refuses any value that is not the id of a row that is a choice now, then puts the label on the card and the id in the card's `meta.picked`. Every label of a row that is a choice is shown to any visitor. Why: the choices change with the business, a visitor can send any value, and only the database knows which rows are open now.
- **Keep the reserved field keys out of a form:** `website`, `_form`, `source`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` and `referrer`. Why: the helper uses them for its honeypot and for where the visitor came from.

## Webhooks

A connection takes inbound provider deliveries at `/api/hooks/<connection>` when its file `key/connections/<connection>.yaml` declares a `webhook` block. The verifier is code in the connection's own folder, `key/connections/<connection>/`, and the secret is the name of a setting, never its value.

```yaml
connection: stripe
name: Stripe
webhook:
  verifier: verify.ts
  secret_setting: STRIPE_WEBHOOK_SECRET
```

The verifier module exports `verify`, and may export `eventId` and `handle`:

```ts
type VerifyContext = { bytes: Uint8Array; now: Date; toleranceMs: number };
export function verify(req: Request, rawBody: string, secret: string, ctx: VerifyContext): boolean | Promise<boolean>;
export function eventId(rawBody: string, req: Request): string;
export function handle(event: unknown): void | Promise<void>;
```

`receiveWebhook` in `src/lib/hooks/receive.ts` reads the body once, up to 1 MB, then calls `verify` with the body decoded as UTF-8 (`rawBody`), the setting's value (`secret`), and `ctx`: the exact bytes received, the time now, and `toleranceMs`, which is 300000 (5 minutes). Only a `verify` that returns exactly `true` lets the delivery in. Then the event id is `eventId(rawBody, req)` when it returns 1 to 200 visible ASCII characters, else the body's top-level JSON `id`, else a SHA-256 hash of the body. The first record of that id in `webhook_events` wins, and `handle` runs with the parsed JSON body (or the text when it is not JSON) only on that first record. The fixture verifier `tests/fixtures/key-ext/key/connections/demo-pay/verify.ts` follows every rule below.

- **Declare a webhook with `verifier` and `secret_setting`, and keep the verifier file in the connection's own folder.** `verifier` is a `.ts` path inside `key/connections/<connection>/`, and the Key checker reports a declared file that does not exist. The app loads it only when the real paths of the folder and the file stay inside `key/`, and a verifier that fails to import answers 404 with one line in the log. `secret_setting` is a setting name in capitals that never starts with `NEXT_PUBLIC_`, `FOUNDATION_`, `VERCEL` or `SUPABASE_` and is never `CRON_SECRET` or `DATABASE_URL`. Why: code reached by a public address must come only from the Key's own folder, and the Foundation's own settings must never be handed to a Key's code.
- **Compare the signature in constant time, after a length check.** Return false when the lengths differ, then compare with `timingSafeEqual` from `node:crypto`. Why: a plain `===` can reveal through its timing how much of a forged signature matched, and `timingSafeEqual` throws on different lengths instead of answering false.
- **Refuse a delivery whose signed timestamp is more than 5 minutes from `ctx.now`, in either direction.** Use the provider's signed timestamp, never one the signature does not cover, and compare it with `ctx.now` and `ctx.toleranceMs`, never with the computer's clock. Why: `webhook_events` forgets an event when the owner prunes it, so without freshness a delivery captured once could be replayed after that and act again.
- **Sign over `ctx.bytes` when the provider signs the exact bytes it sent.** `rawBody` is the same bytes decoded as UTF-8, which is enough for providers that send JSON. Why: decoding replaces bytes that are not valid UTF-8, so a signature checked over text can refuse a genuine delivery.
- **Read the delivery only through `rawBody` and `ctx.bytes`, and use `req` only for its headers and address.** Why: the body of `req` is already read when `verify` runs, so `req.text()` or `req.json()` throws, and the capped copy is the only one there is.
- **Export `eventId` when the provider's event id is not the body's top-level `id`.** Why: the event id is how a retry or a replay is recognized, and a hash of the body changes whenever the provider resends anything in it differently.
- **Make `handle` idempotent.** When `handle` throws, the record is deleted and the provider gets 500, so its retry runs `handle` again on the same event, after whatever the first attempt already wrote. Why: a failed attempt that half wrote must not leave two records or two charges when it runs again.
- **Write verifiers in TypeScript that Node's type stripping supports, and import only `node:` built-ins.** Type annotations and `type` declarations are fine. Never use `enum`, `namespace`, parameter properties or the `@/` alias. Why: the running server imports the file as it is, with no build step, and anything type stripping cannot erase fails to import.

## Checks

An app's `definition.yaml` or a routine's front matter declares its checks, under `checks`. A check is SQL the Foundation runs read-only, at most once per period, raising at most one card. A routine that declares checks names the app it acts for with a top-level `app: <slug>`. A check that reads another app's table names that app in a top-level `uses_apps` in the same file. The install writes `uses_apps` from the entry's `uses`, and the Key checker refuses an app there that is not installed. An app written `{app: <slug>, optional: true}` may be absent: while it is, a check that reads its tables is skipped each period with a record in `check_runs` and no card, and once it is installed the check runs like any other.

```yaml
checks:
  - key: requests-waiting
    name: Booking requests waiting
    period: day
    card_kind: requests-waiting
    reads: [bookings]
    sql: |
      select count(*) > 0 as raise,
             count(*)::text || ' booking requests are waiting' as title,
             coalesce(string_agg(client_email, ', '), '') as body
        from bookings
       where status = 'new' and starts <= $1::date + 2
```

`key` is a slug, unique in its app or routine, and the check's full slug is `<app or routine slug>/<key>`. `name` is 1 to 80 characters and titles the card when the check cannot run. `period` is `day` or `week`, in the business's time zone. `card_kind` is a kind declared in the Key, never a core kind. `reads` lists every table the SQL reads.

The SQL is one `select` (or `with ... select`) statement. It returns zero rows (nothing to raise) or one row with `raise` (boolean), `title` (text, used when `raise` is true) and `body` (text or null). It may use two parameters, written `$1::date` (today in the business's time zone) and `$2::timestamptz` (now). It may use escape strings such as `E'\n'`. It never names a schema, never quotes an identifier, never uses dollar quoting, never reads `pg_` or `information_schema` objects, and calls only these functions: `count`, `sum`, `min`, `max`, `avg`, `coalesce`, `nullif`, `greatest`, `least`, `lower`, `upper`, `trim`, `btrim`, `ltrim`, `rtrim`, `length`, `char_length`, `concat`, `concat_ws`, `format`, `left`, `right`, `replace`, `split_part`, `string_agg`, `array_agg`, `array_to_string`, `array_length`, `cardinality`, `to_char`, `date_trunc`, `date_part`, `make_interval`, `age`, `now`, `abs`, `round`, `floor`, `ceil`, `ceiling`, `bool_or`, `bool_and`, `jsonb_build_object`, `jsonb_agg`. The outbox is never readable by a check, because it holds customers' message bodies.

Three layers hold a check to reading, and the run itself is the boundary: the Key checker is the early warning that tells the builder at once. The Key checker reads comments, strings, quoted names and dollar quotes the way Postgres does, then refuses any writing word, unknown function, schema name, catalog read or table outside `reads`. At run time the runner asks Postgres for the statement's plan and fails the check when the plan touches any relation that is not a `public` table in `reads` and in its file's allowed tables, or calls any function off the list. The plan check and the read-only transaction are the boundary, because Postgres itself has parsed the statement. Then it runs the statement as one parameterized statement inside a read-only transaction with a five second limit, wrapped in an outer select, so a data-modifying statement cannot even be parsed, and it always rolls that transaction back. Only the runner writes: one row in `check_runs` and at most one card.

- **Write a check as one read-only select that returns raise, title and body, and list every table it reads.** It reads only its own app's tables, the tables of the apps listed in its file's `uses_apps` (written at install from the entry's `uses`, each one installed unless marked optional), and the core tables `contacts`, `inbox_items`, `business_profile`, `check_runs` and `connections`, and uses `$1::date` for today and `$2::timestamptz` for now. Why: the Key checker, the plan check and a read-only transaction all hold a check to reading, and one result row means at most one card.
- **Mark an app in `uses_apps` as `{app: <slug>, optional: true}` when the check must keep working while that app is absent.** The checker accepts an optional app that is not installed, and the runner skips, with a record and no card, any check that reads its tables until it is. A table the core or an installed app holds is never excused this way. Why: one register's removal must not stop every other register's card.

## Drafting commands

A drafting routine runs on the owner's computer through one command, `npm run draft -- <routine> <step>`. It declares its handler and its steps in its front matter, under `draft`.

```markdown
---
name: Review ask
agent: front-desk
category: keep
trigger: cron
cron: "0 10 * * 1"
draft:
  handler: src/lib/drafts/review-ask.ts
  subcommands: [list, save, check, blocked]
---
```

`handler` is a `.ts` file under `src/` or `modules/`, written from the top of the repository. `subcommands` lists 1 to 12 slugs. The command refuses an unknown routine, an unknown step or a missing handler file with exit code 2, holds one drafting lock (`.data/draft.lock`), reads the pause switch, then runs the handler with the step and its flags. A handler prints machine output as one JSON object per line, reads drafted text from standard input, writes cards only through `writeCard`, and exits 0 when done, 1 with a plain message when it fails and 2 for a step it does not know. New handlers use `runHandler` from `src/lib/drafts/handler.ts`, which does all of that. An installed `monday-brief` without a `draft` block runs its existing `src/lib/data/briefs-command.ts`.

- **Give a drafting routine a `draft` block naming its handler and its steps, and run it with `npm run draft -- <routine> <step>`.** The handler is a `.ts` file under `src/` or `modules/`. The pause switch is read twice: `npm run draft` writes one `runner/draft` skipped row and exits 3 when paused, and every handler (through `runHandler`, or by hand for an older handler) does the same when started directly. Why: every drafting routine runs the same way, under one lock, with the pause switch read first.

## App definition

`key/apps/<app>/definition.yaml` registers the app and describes its tables. Field types are limited to `text`, `number`, `date`, `select`, `multi_select`, `checkbox`, `user`, `multi_user`, `url`, `email` and `attachment`. A `select` or `multi_select` field needs `options`. An automation names a routine that exists. `migrations` is always `migrations/`. Every table the migrations create turns on row level security (see `data.md`). The SQL for each type is in `data.md`.

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
