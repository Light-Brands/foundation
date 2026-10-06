import type { Db } from "@/lib/db/types";

// A limiter kept in the database, so it holds across restarts and across every running copy of the
// site. Each save records one hit, keyed by a hash of the form and the client address.
// The decision itself is a counter per fixed window in form_counts, bumped by one statement that
// only raises the count while it is under the limit. Two saves at once can never both take the last
// slot, because the database settles the conflict on that one row. Fixed windows can admit up to
// twice the limit across a window edge, which is a fair price for a count that cannot race.

export const FORM_LIMITS = {
  perClient: 5,
  perClientWindowMs: 10 * 60_000,
  perForm: 300,
  perFormWindowMs: 60 * 60_000,
  keepMs: 24 * 3600_000,
} as const;

const enc = new TextEncoder();

export async function clientHash(form: string, clientKey: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(`foundation:form-hits:v1:${secret}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${form}\n${clientKey}`));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function countHits(db: Db, input: { form: string; keyHash?: string }, now: Date, windowMs: number): Promise<number> {
  const since = new Date(now.getTime() - windowMs);
  const [{ n }] = await db.query<{ n: number }>(
    "select count(*)::int as n from form_hits where form = $1 and ($2::text is null or key_hash = $2) and at > $3",
    [input.form, input.keyHash ?? null, since],
  );
  return n;
}

export async function recordHit(db: Db, input: { form: string; keyHash: string }, now: Date): Promise<void> {
  await db.query("insert into form_hits (form, key_hash, at) values ($1, $2, $3)", [input.form, input.keyHash, now]);
}

const WINDOW_SLOT = `insert into form_counts (form, key_hash, window_start, n) values ($1, $2, $3, 1)
  on conflict (form, key_hash, window_start) do update set n = form_counts.n + 1 where form_counts.n < $4
  returning n`;

const windowStart = (now: Date, ms: number) => new Date(Math.floor(now.getTime() / ms) * ms);

/** One atomic step: true when the count for this window was under the limit and is now one higher. */
async function bump(db: Db, form: string, keyHash: string, now: Date, windowMs: number, limit: number): Promise<boolean> {
  if (limit < 1) return false;
  const rows = await db.query<{ n: number }>(WINDOW_SLOT, [form, keyHash, windowStart(now, windowMs), limit]);
  return rows.length === 1;
}

/**
 * True when the client may save once more, and records the save. False when either limit is reached.
 * The client's slot is taken before the form's, so a refusal can only ever spend a slot, never grant one.
 */
export async function takeFormSlot(db: Db, input: { form: string; keyHash: string }, now: Date, limits: { perClient: number; perClientWindowMs: number; perForm: number; perFormWindowMs: number; keepMs: number } = FORM_LIMITS): Promise<boolean> {
  const old = new Date(now.getTime() - limits.keepMs);
  await db.query("delete from form_hits where form = $1 and at < $2", [input.form, old]);
  await db.query("delete from form_counts where form = $1 and window_start < $2", [input.form, old]);
  if (!(await bump(db, input.form, input.keyHash, now, limits.perClientWindowMs, limits.perClient))) return false;
  if (!(await bump(db, input.form, "", now, limits.perFormWindowMs, limits.perForm))) return false;
  await recordHit(db, input, now);
  return true;
}
