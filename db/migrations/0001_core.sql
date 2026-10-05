create table if not exists business_profile (
  id int primary key default 1 check (id = 1),
  business_name text not null,
  tagline text not null default '',
  email text not null default '',
  phone text not null default '',
  website text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists contacts_email_key on contacts (lower(email));

create table if not exists inbox_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  category text not null,
  subcategory text not null,
  title text not null,
  body text not null default '',
  contact_id uuid references contacts(id),
  status text not null default 'new' check (status in ('new', 'done')),
  created_at timestamptz not null default now()
);
create index if not exists inbox_items_created on inbox_items (created_at desc);
