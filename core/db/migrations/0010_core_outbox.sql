create table if not exists outbox (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  contact_id uuid references contacts(id) on delete set null,
  subject text not null,
  body text not null,
  source_app text,
  source_id text,
  card_id uuid references inbox_items(id) on delete set null,
  send_key text not null,
  kind text not null default 'transactional' check (kind in ('transactional', 'marketing')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'sending', 'sent', 'failed', 'cancelled')),
  send_after timestamptz,
  approved_at timestamptz,
  claimed_at timestamptz,
  sent_at timestamptz,
  provider_ref text,
  sent_by_hand boolean not null default false,
  attempts int not null default 0,
  last_error text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- A send key is unique among rows not cancelled, so a routine may draft again after a cancel.
create unique index if not exists outbox_send_key on outbox (send_key) where status <> 'cancelled';
create index if not exists outbox_status on outbox (status, approved_at);
create index if not exists outbox_card on outbox (card_id);

-- A sent message is a record of something that happened. It never goes back.
create or replace function outbox_sent_is_final() returns trigger language plpgsql as $$
begin
  if old.status = 'sent' and new.status <> 'sent' then
    raise exception 'a sent message stays sent';
  end if;
  return new;
end $$;
drop trigger if exists outbox_sent_is_final on outbox;
create trigger outbox_sent_is_final before update on outbox for each row execute function outbox_sent_is_final();

-- email_hash is an HMAC of the address under FOUNDATION_SECRET (src/lib/email.ts). email is null for a forgotten person.
create table if not exists opt_outs (
  id uuid primary key default gen_random_uuid(),
  email text,
  email_hash text not null,
  at timestamptz not null default now(),
  source text not null default ''
);
create unique index if not exists opt_outs_email on opt_outs (lower(email)) where email is not null;
create unique index if not exists opt_outs_email_hash on opt_outs (email_hash);

-- The business's postal address, for the footer of marketing email. Jobs read it and never keep a copy.
alter table business_profile add column if not exists postal_address text not null default '';
