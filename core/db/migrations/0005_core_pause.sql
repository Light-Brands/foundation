create table if not exists pause (
  id int primary key default 1 check (id = 1),
  paused boolean not null default false,
  reason text not null default '',
  paused_at timestamptz,
  paused_by text not null default '',
  updated_at timestamptz not null default now()
);
insert into pause (id) values (1) on conflict (id) do nothing;
