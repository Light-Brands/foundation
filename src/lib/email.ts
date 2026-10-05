import { createHash } from "node:crypto";

// One rule for comparing email addresses, used by the outbox, the opt-out list and forget.
// Trimmed, lowercased, and a plus tag removed before the @, so jo+news@ and Jo@ are one person.
// Drafts still go to the address exactly as written.

const PLUS_TAG = /^([^+@]+)\+[^@]*@/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase().replace(PLUS_TAG, "$1@");
}

const IDENTIFIER = /^[a-z][a-z0-9_.]*$/;

/** The same rule in SQL, for a column name the caller controls. */
export function normalizedEmailSql(column: string): string {
  if (!IDENTIFIER.test(column)) throw new TypeError(`"${column}" is not a column name`);
  return `regexp_replace(lower(btrim(${column})), '^([^+@]+)\\+[^@]*@', '\\1@')`;
}

export function emailHash(raw: string): string {
  return createHash("sha256").update(`foundation:email:v1:${normalizeEmail(raw)}`).digest("hex");
}
