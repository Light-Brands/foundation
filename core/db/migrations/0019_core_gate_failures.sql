-- The sign-in limiter's budget for the whole site: one row per PIN try that was compared, kept for a day. Before a
-- PIN is compared, src/lib/auth/limit.ts counts the rows in the last minute (at most 10) and the last day (at most
-- 300) inside the same locked transaction that reads gate_attempts, and adds one. A right PIN removes its row
-- again. key_hash is the client's HMAC from gate_attempts, never an address. npm run auth:unlock clears the table.
create table if not exists gate_failures (
  id bigint generated always as identity primary key,
  key_hash text not null,
  at timestamptz not null
);
create index if not exists gate_failures_at on gate_failures (at);

alter table gate_failures enable row level security;
