create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  door text not null check (door in ('own', 'custom')),
  status text not null default 'planned' check (status in ('planned', 'connected', 'failing', 'disconnected')),
  scopes text[] not null default '{}',
  key_setting text not null default '',
  tested_on date,
  owner text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists connections_service on connections (service);
