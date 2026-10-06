create table if not exists check_runs (
  id uuid primary key default gen_random_uuid(),
  check_slug text not null,
  period text not null,
  ran_at timestamptz not null default now(),
  result text not null check (result in ('running', 'clear', 'raised', 'failed', 'skipped_paused', 'skipped_absent', 'ran')),
  card_id uuid references inbox_items(id) on delete set null,
  detail text not null default ''
);
create unique index if not exists check_runs_slug_period on check_runs (check_slug, period);
create index if not exists check_runs_ran_at on check_runs (ran_at desc);
