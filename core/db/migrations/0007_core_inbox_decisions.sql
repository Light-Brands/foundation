-- The status check from 0001 was created without a name, so its name depends on the database.
-- Read every check constraint on inbox_items.status from pg_constraint and drop it, whatever it is called.
do $$
declare c record;
begin
  for c in
    select con.conname
      from pg_constraint con
      join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
     where con.conrelid = 'inbox_items'::regclass and con.contype = 'c' and att.attname = 'status'
  loop
    execute format('alter table inbox_items drop constraint %I', c.conname);
  end loop;
end $$;

alter table inbox_items add constraint inbox_items_status_check check (status in ('new', 'decided', 'done'));
alter table inbox_items add column if not exists decision text check (decision in ('approve', 'decline'));
alter table inbox_items add column if not exists decided_at timestamptz;
alter table inbox_items add column if not exists decided_by text;
alter table inbox_items add constraint inbox_items_decision_shape check (
  (decision is null and decided_at is null and decided_by is null)
  or (decision is not null and decided_at is not null and decided_by is not null and status in ('decided', 'done'))
);

-- A decision is written once. Nothing, not even a direct update, rewrites it.
create or replace function inbox_items_decision_once() returns trigger language plpgsql as $$
begin
  if old.decision is not null and (
    new.decision is distinct from old.decision
    or new.decided_at is distinct from old.decided_at
    or new.decided_by is distinct from old.decided_by
  ) then
    raise exception 'a card decision is written once';
  end if;
  return new;
end $$;
drop trigger if exists inbox_items_decision_once on inbox_items;
create trigger inbox_items_decision_once before update on inbox_items
  for each row execute function inbox_items_decision_once();
