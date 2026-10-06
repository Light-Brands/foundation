alter table inbox_items add column if not exists source_app text;
alter table inbox_items add column if not exists source_id text;
alter table inbox_items add column if not exists run_key text;
alter table inbox_items add column if not exists always_human boolean not null default false;
alter table inbox_items add column if not exists expires_at timestamptz;
alter table inbox_items add column if not exists meta jsonb not null default '{}'::jsonb;
create unique index if not exists inbox_items_kind_run_key on inbox_items (kind, run_key) where run_key is not null;
create index if not exists inbox_items_open_expiry on inbox_items (expires_at) where status = 'new' and expires_at is not null;
