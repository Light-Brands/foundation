-- Inbound webhook deliveries, kept by event id so a provider's retry or a replay is recognized and
-- ignored. The first record of an event wins. Rows are removed only by the owner's prune command.
create table if not exists webhook_events (
  id bigint generated always as identity primary key,
  connection text not null,
  event_id text not null,
  received_at timestamptz not null default now(),
  unique (connection, event_id)
);
create index if not exists webhook_events_received_at on webhook_events (received_at);
