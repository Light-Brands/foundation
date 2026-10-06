-- Facts core records once, by name. secret_fingerprint is HMAC-SHA256 under FOUNDATION_SECRET of the fixed label
-- "foundation-fingerprint" (src/lib/data/secret-check.ts), written on the first keyed use. Every reader and writer
-- of the opt-out list compares today's secret against it first, so a different FOUNDATION_SECRET on another
-- computer or on the hosted site refuses instead of quietly missing an opt-out. It never reveals the secret.
create table if not exists core_settings (
  key text primary key,
  value text not null,
  at timestamptz not null default now()
);
