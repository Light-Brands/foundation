-- Who can sign in on the hosted database: a Supabase Auth user (user_id, linked on first sign-in), a role,
-- and the departments a team member works in (an empty list means every department).
create table if not exists core_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null,
  role text not null check (role in ('owner', 'team')),
  departments text[] not null default '{}',
  added_at timestamptz not null default now(),
  removed_at timestamptz,
  last_signed_in_at timestamptz
);
create unique index if not exists core_accounts_user_id on core_accounts (user_id) where user_id is not null;
create unique index if not exists core_accounts_email on core_accounts (lower(email));

-- What a check may read about accounts: never the account id or the Supabase user id. It runs as its caller,
-- so the table's row level security holds through it.
create or replace view accounts with (security_invoker = true) as
  select email, role, departments, added_at, removed_at, last_signed_in_at from core_accounts;

-- Every core table refuses anonymous access. The Foundation's own connection owns the tables and reads as before.
alter table _migrations enable row level security;
alter table business_profile enable row level security;
alter table contacts enable row level security;
alter table inbox_items enable row level security;
alter table pause enable row level security;
alter table form_hits enable row level security;
alter table form_counts enable row level security;
alter table webhook_events enable row level security;
alter table check_runs enable row level security;
alter table outbox enable row level security;
alter table opt_outs enable row level security;
alter table connections enable row level security;
alter table core_settings enable row level security;
alter table core_accounts enable row level security;

-- On Supabase the anon and authenticated roles exist and get default grants. Take them away.
-- On the local database these roles do not exist and the block does nothing.
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on all tables in schema public from %I', r);
      execute format('revoke all on all sequences in schema public from %I', r);
      execute format('alter default privileges in schema public revoke all on tables from %I', r);
      execute format('alter default privileges in schema public revoke all on sequences from %I', r);
    end if;
  end loop;
end $$;
