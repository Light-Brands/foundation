-- The sign-in limiter's clients: one row per client (an IPv4 address or an IPv6 /64), keyed by an HMAC under the
-- session secret so no address is ever stored. src/lib/auth/limit.ts reads and writes these rows inside one
-- transaction under an advisory lock, before the PIN is compared, so a burst of tries at once is counted one by one
-- and a lockout holds across restarts, deploys and every running copy of the site. strikes is how many lockouts a
-- client has had; each new one lasts twice as long as the last, up to a day. A row is forgotten a day after its last
-- try or lockout. The whole site's budget is gate_failures (0019). npm run auth:unlock clears both.
create table if not exists gate_attempts (
  key text primary key,
  fails integer not null default 0,
  window_start timestamptz not null,
  locked_until timestamptz,
  strikes integer not null default 0,
  touched timestamptz not null
);

alter table gate_attempts enable row level security;
