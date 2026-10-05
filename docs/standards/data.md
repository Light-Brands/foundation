# Data

- **Put the tables every business has in `core/db/migrations/`.** That means contacts, cards (the Inbox) and the business profile. Why: core tables belong to the app, and an app's tables belong to the app's folder.
- **Put each app's tables in `key/apps/<app>/migrations/`, numbered per app and named `NNNN_<app>_<what>.sql`.** For example `0001_bookings_create.sql`. Why: the name says which app owns the file and in what order it runs.
- **Let the runner apply core first, then each app in app-slug order, and trust its record.** `migrateAll` in `src/lib/db/migrate.ts` records each file as `<app>/<file>`, with `core/` for core files. Why: the prefix keeps two apps' `0001` files from colliding.
- **Never edit an applied migration.** Add a new numbered file instead. Why: a database that already ran the old file never sees the edit, and two copies of the truth drift apart.
- **Never add a foreign key across an app boundary, or from an app into core.** An app refers to a core record by its id or its email. Why: each app must be able to live in its own database.
- **Store an app's tables exactly as its `definition.yaml` describes them.** The table name is the entity key, each column is a field key, and each column's type is the SQL form of the field type. Why: one shape for the data means nothing has to be translated, and a test (`compareDefinition` in `src/lib/key/schema.ts`) catches any drift.
- **Add the three system columns to every app table: `id uuid primary key`, `created_at timestamptz` and `updated_at timestamptz`.** Why: every record needs an identity and a history, and the converter relies on those names.
- **Use only the field types below.** Postgres types beyond them stay inside core. Why: the list is what the Key's formats and every tool that reads them understand.
- **Name timestamps `created_at` and `updated_at` in SQL.** This is the one difference between a definition and its tables: the definition never lists them, because every table has them. Why: the platform's own timestamp fields have fixed names, and only these two are mapped.
- **Keep the business profile in the context-block shape.** The `business_profile` table's columns are the context block's fields, with `owner_name`, `owner_first` and `owner_role` for `owner`. Why: the Settings save copies the row into the Key with no mapping.

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
```
