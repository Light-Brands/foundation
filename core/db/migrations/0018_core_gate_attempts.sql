-- The sign-in limiter: PIN tries, kept in the database so every wait holds across restarts, deploys and every
-- running copy of the site. One row per client (an IPv4 address or an IPv6 /64), one row per network (an IPv4 /24
-- or an IPv6 /48) that spaces tries while the site is slowed, each keyed by an HMAC under the session secret so no
-- address is ever stored, and one row keyed '*' that counts tries for the whole site. src/lib/auth/limit.ts reads
-- and writes these rows inside one transaction under an advisory lock, before the PIN is compared, so a burst of
-- tries at once is counted one by one. strikes is how many lockouts or slowdowns a key has had; each new one lasts
-- twice as long as the last, up to a cap. A row is forgotten a day after its last try or wait. npm run auth:unlock
-- clears the table.
create table if not exists gate_attempts (
  key text primary key,
  fails integer not null default 0,
  window_start timestamptz not null,
  locked_until timestamptz,
  strikes integer not null default 0,
  touched timestamptz not null
);

alter table gate_attempts enable row level security;
