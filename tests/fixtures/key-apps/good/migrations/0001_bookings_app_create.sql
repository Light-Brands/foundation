create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  client_email text not null,
  starts date,
  status text,
  paid boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_email, starts)
);
alter table bookings enable row level security;
