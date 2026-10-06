-- isOptedOut matches an opt-out by its hash, by lower(email) and by the address with any +tag taken out
-- (normalizedEmailSql in src/lib/email.ts). The first two have indexes from 0010. This is the third, written as
-- the same expression so the planner can use it, and partial like opt_outs_email because email is null for a
-- forgotten person.
create index if not exists opt_outs_email_normalized
  on opt_outs ((regexp_replace(lower(btrim(email)), '^([^+@]+)\+[^@]*@', '\1@')))
  where email is not null;
