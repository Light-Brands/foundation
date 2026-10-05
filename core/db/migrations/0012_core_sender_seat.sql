-- When the email sender's bounces step has read a kept webhook event. Null until then, so each event is read once.
alter table webhook_events add column if not exists handled_at timestamptz;
create index if not exists webhook_events_unhandled on webhook_events (connection, received_at) where handled_at is null;

-- A short plain note on a connection, written by npm run connection:set (for example why it is failing).
alter table connections add column if not exists note text not null default '';
