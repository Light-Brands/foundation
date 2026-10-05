# Data

- **Put the tables every business has in `core/db/migrations/`.** That means contacts, cards (the Inbox) and the business profile. Why: core tables belong to the app, and an app's tables belong to the app's folder.
- **Put each app's tables in `key/apps/<app>/migrations/`, numbered per app and named `NNNN_<app>_<what>.sql`.** For example `0001_bookings_create.sql`. Why: the name says which app owns the file and in what order it runs.
- **Give every app's entity a table name no other installed app uses.** The Key checker refuses two installed apps that declare the same entity, and names both. Why: two apps sharing one table would read and overwrite each other's records.
- **Let the runner apply core first, then each app in app-slug order, and trust its record.** `migrateAll` in `src/lib/db/migrate.ts` records each file as `<app>/<file>`, with `core/` for core files. Why: the prefix keeps two apps' `0001` files from colliding.
- **Number core migrations in order, and read a shared number by file name.** Two core files share `0008`: `0008_core_form_hits.sql` (the public form limiter, `form_hits` and `form_counts`) and `0008_core_webhook_events.sql`. That is safe: `migrate` sorts files by name, so `form_hits` always runs first, and each file is recorded under its own name in `_migrations`. Never renumber either one, and give the next core file the next free number. Why: renaming an applied file makes the runner apply it a second time, and a name sort is the order every database has already used.
- **Let the migration runner take its lock, and never run migrations any other way.** Each file runs in its own transaction that takes `pg_advisory_xact_lock(hashtext('foundation:migrate'))`, checks `_migrations` again, and skips a file another start already applied. Why: two cold starts of the deployed site can migrate at the same moment, and a file applied twice fails or doubles data.
- **Never edit an applied migration.** Add a new numbered file instead. Why: a database that already ran the old file never sees the edit, and two copies of the truth drift apart.
- **Never add a foreign key across an app boundary, or from an app into core.** An app refers to a core record by its id or its email. Why: each app must be able to live in its own database.
- **Store an app's tables exactly as its `definition.yaml` describes them.** The table name is the entity key, each column is a field key, and each column's type is the SQL form of the field type. Why: one shape for the data means nothing has to be translated, and a test (`compareDefinition` in `src/lib/key/schema.ts`) catches any drift.
- **Add the three system columns to every app table: `id uuid primary key`, `created_at timestamptz` and `updated_at timestamptz`.** Why: every record needs an identity and a history, and the converter relies on those names.
- **Turn on row level security for every table an app migration creates, and give anonymous visitors no way in.** Write `alter table <name> enable row level security;` in a migration of the same app. Never create a policy for `anon` or `public`, never create a policy without a `to` role, and never `grant` to `anon` or `public`. `rlsProblems` in `src/lib/key/schema.ts` fails `npm test` when a table lacks it. The check reads plain SQL statements and does not parse `$$` function bodies, so the same rule inside a function body is the author's to follow. On the local database the statement changes nothing the owner sees. Why: once the hosted database is connected its tables have an anonymous address, and a table with row level security and no anonymous policy returns nothing there.
- **Name every person field by the rule, so forget and export can find it.** A person's address is a field of type `email` or named `contact_email`, and a text field with `email` anywhere in its name must be of type `email`. A team member is `person_id`, `owner_id` or `manager_id`, of type `text`, holding a `people` id. Phones live on the contact, never in an app. An entity whose rows the business must keep declares `forget: blank`, and its person fields are blanked instead of the row being deleted. A text field that holds a person's name says `person: name`, and forget blanks it on every row that holds the person's address. `forget: blank` clears these declared person fields only: any other text that names the person, such as a note, stays, so name it with `person: name` or check it by hand. `personFieldProblems` in `src/lib/key/schema.ts` fails `npm test` on a field outside the rule. A person field counts only on a table the app's own migrations create, never a core table (`CORE_TABLES`), another app's table, a table it only alters, or a system column: `ownedPersonRefs` applies that rule at load, for forget and export, and in the Key checker. Why: a person's request to be forgotten must reach every record, and a field nobody can find by name is a record that stays.
- **Use only the field types below.** Postgres types beyond them stay inside core. Why: the list is what the Key's formats and every tool that reads them understand.
- **Name timestamps `created_at` and `updated_at` in SQL.** This is the one difference between a definition and its tables: the definition never lists them, because every table has them. Why: the platform's own timestamp fields have fixed names, and only these two are mapped.
- **Open the local database only through `getDb()` or `openPglite()` from `src/lib/db`, in the app and in every script.** Both take the lock file `.data/pglite.lock`, which holds the opener's process id and the time the computer started, and release it on close and when the process exits. A second opener gets "Another program has the local database open (the command center or a command such as npm run brief). Close it, then run this again. If nothing is open, delete .data/pglite.lock." A lock is stale and taken over when it is from an earlier start of the computer, when its process is no longer running, or when its process id now belongs to another user's program (every program that opens the database runs as the owner). The takeover moves the stale lock aside and checks it moved the stale one, so two openers never both win. Why: PGlite does not guard its own folder, and two programs writing to it at once corrupt the data.
- **Save every export from remove in `.data/exports/`.** In a Foundation, the Ninja framework runner exports an entry's data before it removes the entry, and writes the file to `.data/exports/` unless the owner picks another place outside the repository. Git ignores the folder through `.data/`. `npm run person -- export` writes there too, and only inside `.data/`. Why: exported records are business records, and they stay on the owner's computer, out of the repository (see `privacy.md`).
- **Keep the business profile in the context-block shape.** The `business_profile` table's columns are the context block's fields, with `owner_name`, `owner_first` and `owner_role` for `owner`. Why: the Preferences save copies the row into the Key with no mapping.

## Field types and their SQL

| Field type | SQL type |
|---|---|
| `text` | `text` |
| `select` | `text` |
| `url` | `text` |
| `email` | `text` |
| `user` | `text` |
| `attachment` | `text` |
| `number` | `numeric` |
| `date` | `date` |
| `checkbox` | `boolean` |
| `multi_select` | `text[]` |
| `multi_user` | `text[]` |

## The migration that matches the definition in `key.md`

```sql
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  client_email text not null,
  starts date,
  status text,
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table bookings enable row level security;
```

- **Read the pause switch before any check or drafting routine acts.** The `pause` table holds one row. `getPause` in `src/lib/data/pause.ts` reads it, and `setPause` is its only writer, called from the Preferences pause action, which checks the session (the owner role once the hosted database is connected). Public forms keep saving while paused. Why: one switch the owner trusts stops every automatic action at once, while visitors still reach the business.
- **Create every card through `writeCard` in `src/lib/data/cards.ts`.** Pass a kind the installed Key declares, a title, and a run key when the same run could write twice. Never insert into `inbox_items` directly and never pass a category. Why: the writer takes the department, the job, who decides and when it lapses from the declared kind, and a run key keeps a routine to one card per run.
- **Read Inbox cards with `listInbox` in `src/lib/data/inbox.ts`, and show each one through `InboxCard`.** With no options it gives the 50 newest cards, newest first. `limit: null` lists every card, `statuses` keeps several statuses and `oldestFirst` puts the longest wait first. A job that groups or annotates the Inbox renders its own list with `inboxCardProps` and `InboxCard` (whose `below` slot holds the job's line), and swaps the one `<InboxList />` line in the Inbox page for it. Why: every card keeps every action the Foundation's Inbox has, and a job changes a core page by one line only.
- **Give an app table that holds a record made from a card a `card_id` text column with a unique index, and create the record with `insertOncePerCard`.** Pass `insertOncePerCard` only your own app's table and column names, written in your code: it checks them as plain names but cannot tell whose table it is, and a second call for the same card returns `exists` and never changes the first record. Route a message to its job with `routeCard`, which keeps the visitor's words exactly: it moves only a new card of a routable kind (`contact`, and `mail-in` once the Key declares it with `routable: true`), and only to a job kind marked `decide: done`. Why: a job that runs twice must never create two leads from one message, and the card is the record's history.
