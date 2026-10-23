import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { PIN_FORMAT, type FoundationEnv } from "@/lib/env";
import { getDb } from "@/lib/db";
import type { Queryable } from "@/lib/db/types";
import { pinMatches } from "@/lib/auth/pin-token";

// Where the owner's PIN comes from, in order:
//   hosting  FOUNDATION_PIN is set in the hosting settings. It always wins, as it did before this file existed.
//   chosen   the owner chose a PIN in the app; core_settings holds its scrypt hash (pin_hash), never the PIN.
//   default  a fresh copy opens with 1234 for DEFAULT_PIN_DAYS after pin_default_from, set when it first migrated.
//   expired  that window has passed with no PIN chosen.
//   none     no hosting PIN and no database, so there is nothing to sign in with.
// The credential is what a session is signed with (pin-token.ts), so any PIN change signs everyone out.

export const DEFAULT_PIN = "1234";
export const DEFAULT_PIN_DAYS = 7;

export type PinState =
  | { kind: "hosting"; credential: string; chosen: boolean }
  | { kind: "chosen"; credential: string; email: string }
  | { kind: "default"; credential: string; expiresAt: Date }
  | { kind: "expired" }
  | { kind: "none" };

const DAY_MS = 24 * 3600_000;
const HOSTING = "hosting:";
const CHOSEN = "chosen:";
const DEFAULT = "default";

/**
 * Reads the owner's PIN state. A database error throws, so every caller fails closed. A pin_default_from that is
 * missing or unreadable counts as expired, never as an open default.
 */
export async function readPinState(db: Queryable | null, env: FoundationEnv, now: Date = new Date()): Promise<PinState> {
  if (env.pin) {
    const chosen = db ? (await db.query("select 1 from core_settings where key = 'pin_hash'")).length > 0 : false;
    return { kind: "hosting", credential: `${HOSTING}${env.pin}`, chosen };
  }
  if (!db) return { kind: "none" };
  const rows = await db.query<{ key: string; value: string }>(
    "select key, value from core_settings where key in ('pin_hash', 'pin_email', 'pin_default_from')",
  );
  const v = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string | undefined>;
  if (v.pin_hash) return { kind: "chosen", credential: `${CHOSEN}${v.pin_hash}`, email: v.pin_email ?? "" };
  const from = v.pin_default_from ? Date.parse(v.pin_default_from) : NaN;
  if (Number.isNaN(from)) return { kind: "expired" };
  const expiresAt = new Date(from + DEFAULT_PIN_DAYS * DAY_MS);
  return now.getTime() < expiresAt.getTime() ? { kind: "default", credential: DEFAULT, expiresAt } : { kind: "expired" };
}

/** The credential to sign the session with when candidate is the right PIN for this state, else null. */
export async function pinAccepts(state: PinState, candidate: string): Promise<string | null> {
  switch (state.kind) {
    case "hosting":
      return (await pinMatches(candidate, state.credential.slice(HOSTING.length))) ? state.credential : null;
    case "chosen":
      return checkPinHash(candidate, state.credential.slice(CHOSEN.length)) ? state.credential : null;
    case "default":
      return (await pinMatches(candidate, DEFAULT_PIN)) ? state.credential : null;
    default:
      return null;
  }
}

// scrypt with Node's default cost (N=16384, r=8, p=1), a 16 byte random salt and a 32 byte key.
const SCHEME = "scrypt1";
const KEY_BYTES = 32;

/** "scrypt1$<salt hex>$<key hex>". The PIN itself is never stored. */
export function hashPin(pin: string): string {
  const salt = randomBytes(16);
  return `${SCHEME}$${salt.toString("hex")}$${scryptSync(pin, salt, KEY_BYTES).toString("hex")}`;
}

/** True when pin hashes to stored. Compares in constant time; a stored value in any other shape is false. */
export function checkPinHash(pin: string, stored: string): boolean {
  const m = /^scrypt1\$([0-9a-f]{32})\$([0-9a-f]{64})$/.exec(stored);
  if (!m) return false;
  const actual = scryptSync(pin, Buffer.from(m[1], "hex"), KEY_BYTES);
  return timingSafeEqual(actual, Buffer.from(m[2], "hex"));
}

/**
 * Stores the owner's chosen PIN, hashed, with their email, in one statement. "taken" when a PIN is already stored:
 * the first choice wins and is never overwritten here. Throws on a PIN that is not 6 to 12 digits.
 */
export async function choosePin(db: Queryable, pin: string, email: string, now: Date = new Date()): Promise<"ok" | "taken"> {
  if (!PIN_FORMAT.test(pin)) throw new Error("A PIN is 6 to 12 digits.");
  const rows = await db.query(
    `with h as (
       insert into core_settings (key, value, at) values ('pin_hash', $1, $4) on conflict (key) do nothing returning key
     )
     insert into core_settings (key, value, at)
     select x.key, x.value, $4 from h, (values ('pin_email', $2), ('pin_set_at', $3)) as x(key, value)
     on conflict (key) do update set value = excluded.value, at = excluded.at
     returning key`,
    [hashPin(pin), email.trim(), now.toISOString(), now.toISOString()],
  );
  pinCache = null;
  return rows.length > 0 ? "ok" : "taken";
}

const CACHE_MS = 5000;
let pinCache: { pin: string | null; at: number; state: PinState } | null = null;

/** readPinState on the app's database behind a 5 second in-memory cache. An error is thrown and never cached. */
export async function cachedPinState(env: FoundationEnv, now: Date = new Date()): Promise<PinState> {
  const t = now.getTime();
  const c = pinCache;
  const lapsed = c?.state.kind === "default" && t >= c.state.expiresAt.getTime();
  if (c && !lapsed && c.pin === env.pin && t >= c.at && t - c.at < CACHE_MS) return c.state;
  const state = await readPinState(await getDb(), env, now);
  pinCache = { pin: env.pin, at: t, state };
  return state;
}
