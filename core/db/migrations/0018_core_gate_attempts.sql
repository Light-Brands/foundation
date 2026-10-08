-- The sign-in limiter: PIN tries, kept in the database so a lockout holds across restarts, deploys and every
-- running copy of the site. One row per client, keyed by an HMAC of its address (an IPv4 address, or an IPv6 /64)
-- under the session secret, so no address is ever stored, plus one row keyed '*' that counts tries for the whole
-- site. src/lib/auth/limit.ts reads and writes these rows inside one transaction under an advisory lock, before the
-- PIN is compared, so a burst of tries at once is counted one by one. strikes is how many lockouts this key has had;
-- each new lockout lasts twice as long as the last. A row is forgotten a day after its last try or lockout.
create table if not exists gate_attempts (
  key text primary key,
  fails integer not null default 0,
  window_start timestamptz not null,
  locked_until timestamptz,
  strikes integer not null default 0,
  touched timestamptz not null
);

alter table gate_attempts enable row level security;
