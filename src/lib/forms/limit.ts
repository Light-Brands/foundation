import type { Db } from "@/lib/db/types";

// A limiter kept in the database, so it holds across restarts and across every running copy of the
// site. Each save records one hit, keyed by a hash of the form and the client address.

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

/** True when the client may save once more, and records the save. False when either limit is reached. */
export async function takeFormSlot(db: Db, input: { form: string; keyHash: string }, now: Date, limits: { perClient: number; perClientWindowMs: number; perForm: number; perFormWindowMs: number; keepMs: number } = FORM_LIMITS): Promise<boolean> {
  await db.query("delete from form_hits where form = $1 and at < $2", [input.form, new Date(now.getTime() - limits.keepMs)]);
  const rows = await db.query<{ id: string }>(
    `insert into form_hits (form, key_hash, at)
     select $1, $2, $3
      where (select count(*) from form_hits where form = $1 and key_hash = $2 and at > $4) < $5
        and (select count(*) from form_hits where form = $1 and at > $6) < $7
     returning id`,
    [input.form, input.keyHash, now, new Date(now.getTime() - limits.perClientWindowMs), limits.perClient, new Date(now.getTime() - limits.perFormWindowMs), limits.perForm],
  );
  return rows.length === 1;
}
