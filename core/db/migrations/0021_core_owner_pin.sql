-- The owner's PIN, kept in core_settings (0015), so no new table. The keys:
--   pin_default_from  when this copy first migrated, as an ISO 8601 UTC time. The default PIN 1234 opens it for
--                     7 days after this (src/lib/auth/owner-pin.ts), then expires. Seeded here, once.
--   pin_hash          the scrypt hash of the PIN the owner chose ("scrypt1$<salt hex>$<key hex>"), never the PIN.
--                     Written once by choosePin with insert on conflict do nothing, so the first choice wins.
--   pin_email         the email the owner gave when choosing the PIN, where a forgotten PIN's code is sent.
--   pin_set_at        when the PIN was chosen, as an ISO 8601 UTC time.
--   pin_reset         state for a forgotten PIN's emailed code, written by the reset flow.
-- A FOUNDATION_PIN hosting setting, when set, still wins over all of these.
insert into core_settings (key, value)
values ('pin_default_from', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
on conflict (key) do nothing;
