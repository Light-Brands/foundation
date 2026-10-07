-- The brand: the tokens every surface paints with. One row, id 1. Anything missing reads as the Foundation's default.
create table if not exists core_brand (
  id int primary key check (id = 1),
  tokens jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table core_brand enable row level security;
