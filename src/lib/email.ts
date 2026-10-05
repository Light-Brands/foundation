import "server-only";
import { createHmac } from "node:crypto";

// One strict reading of an email address, used by every path that sends to, matches or records one:
// drafting, the opt-out check at send time, unsubscribing, recording an opt-out and forget.
// Only one plain ASCII addr-spec is accepted: no display name, no quoted local part, no comments,
// no spaces or line breaks, one @, and a domain of ordinary labels. Anything else is refused, never guessed at,
// so our reading can never differ from the mail server's.
// The address is sent with its local part as typed and its domain lowercased. It is matched with the whole
// address lowercased and a plus tag dropped, so Jo+News@ and jo@ are one person, which errs toward not sending.

export const EMAIL_MAX = 254;
const LOCAL_MAX = 64;
const REFUSED = "Use one plain email address, like name@example.com.";

export class InvalidEmailError extends TypeError {
  constructor() {
    super(REFUSED);
    this.name = "InvalidEmailError";
  }
}

export class MissingSecretError extends Error {
  constructor() {
    super("Set FOUNDATION_SECRET before recording or checking an opt-out. It is fixed for the life of the Foundation.");
    this.name = "MissingSecretError";
  }
}

const ATEXT = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+";
const LOCAL = new RegExp(`^${ATEXT}(?:\\.${ATEXT})*$`);
const LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const PRINTABLE_ASCII = /^[\x21-\x7e]+$/;
const PLUS_TAG = /^([^+]+)\+.*$/;

export type ParsedEmail = { ok: true; send: string; match: string } | { ok: false; error: string };

export function parseEmail(raw: string): ParsedEmail {
  const no = { ok: false, error: REFUSED } as const;
  if (typeof raw !== "string") return no;
  const s = raw.trim().normalize("NFC");
  if (s.length < 3 || s.length > EMAIL_MAX || !PRINTABLE_ASCII.test(s)) return no;
  const parts = s.split("@");
  if (parts.length !== 2) return no;
  const [local, domain] = parts;
  if (local.length > LOCAL_MAX || !LOCAL.test(local)) return no;
  const labels = domain.split(".");
  if (domain.length > 253 || labels.length < 2 || !labels.every((l) => LABEL.test(l))) return no;
  const host = domain.toLowerCase();
  return { ok: true, send: `${local}@${host}`, match: `${local.toLowerCase().replace(PLUS_TAG, "$1")}@${host}` };
}

/** The matching form of an address. Throws InvalidEmailError for anything that is not one plain address. */
export function normalizeEmail(raw: string): string {
  const p = parseEmail(raw);
  if (!p.ok) throw new InvalidEmailError();
  return p.match;
}

const IDENTIFIER = /^[a-z][a-z0-9_.]*$/;

/** The same matching rule in SQL, for a column name the caller controls, over addresses parseEmail accepted. */
export function normalizedEmailSql(column: string): string {
  if (!IDENTIFIER.test(column)) throw new TypeError(`"${column}" is not a column name`);
  return `regexp_replace(lower(btrim(${column})), '^([^+@]+)\\+[^@]*@', '\\1@')`;
}

/**
 * The stored token for an address: HMAC-SHA256 under FOUNDATION_SECRET over its matching form, so a list of
 * known addresses cannot be hashed to find who opted out. Rotating the secret makes every earlier opt-out
 * unmatchable, so the secret is fixed for the life of the Foundation.
 */
export function emailHash(raw: string, secret: string | null | undefined): string {
  if (!secret) throw new MissingSecretError();
  return createHmac("sha256", `foundation:email:v1:${secret}`).update(normalizeEmail(raw)).digest("hex");
}
