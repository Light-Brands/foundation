create table if not exists form_hits (
  id bigint generated always as identity primary key,
  form text not null,
  key_hash text not null,
  at timestamptz not null default now()
);
create index if not exists form_hits_form_key_at on form_hits (form, key_hash, at desc);
create index if not exists form_hits_form_at on form_hits (form, at desc);
