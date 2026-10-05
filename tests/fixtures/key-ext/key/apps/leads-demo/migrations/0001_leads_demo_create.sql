create table if not exists leads_demo (
  id uuid primary key default gen_random_uuid(),
  contact_email text not null,
  card_id text,
  status text,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists leads_demo_card_id on leads_demo (card_id);
alter table leads_demo enable row level security;
