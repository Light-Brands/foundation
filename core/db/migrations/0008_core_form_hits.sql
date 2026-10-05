create table if not exists form_hits (
  id bigint generated always as identity primary key,
  form text not null,
  key_hash text not null,
  at timestamptz not null default now()
);
create index if not exists form_hits_form_key_at on form_hits (form, key_hash, at desc);
create index if not exists form_hits_form_at on form_hits (form, at desc);

-- The limiter's counts: one row per form and client (key_hash '' is the whole form) per fixed window.
-- A save takes a slot with one insert on conflict do update, so two saves at once can never both pass.
create table if not exists form_counts (
  form text not null,
  key_hash text not null,
  window_start timestamptz not null,
  n integer not null,
  primary key (form, key_hash, window_start)
);
