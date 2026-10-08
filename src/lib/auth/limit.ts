import type { Db, Queryable } from "@/lib/db/types";
import type { FoundationEnv } from "@/lib/env";
import { writeCard } from "@/lib/data/cards";
import { registryFrom } from "@/lib/data/card-kinds";
import { CORE_CARD_KINDS } from "@/lib/key/core-kinds";

// The sign-in limiter. Every PIN try is recorded before the PIN is compared, and refused when either budget is spent:
// - a client (one IPv4 address, or one IPv6 /64) gets five tries in ten minutes, then waits ten minutes, and each
//   later lockout lasts twice as long as the one before, up to a day. This lockout falls only on that client.
// - the whole site gets ten wrong PINs in any rolling minute and three hundred in any rolling day, counted across
//   every client. Once either is spent, every client waits, the owner too, until the oldest try in that window ages
//   out. The wait is never longer than the window, so the owner is delayed and never locked out for good, and
//   npm run auth:unlock ends it at once. The first time a day the site budget is spent, the owner gets an Inbox card.
// A right PIN clears its client and gives its try back to the site. The state lives in gate_attempts (clients) and
// gate_failures (the site's tries), read and written in one transaction under an advisory lock, so a burst of tries
// at once is counted one by one and every wait holds across restarts and every running copy of the site. Only a
// deploy with no database (preview) keeps it in memory, per running copy.

export const GATE_LIMITS = {
  perClient: 5,
  windowMs: 10 * 60_000,
  clientLockMs: 10 * 60_000,
  maxClientLockMs: 24 * 3600_000,
  globalPerMinute: 10,
  minuteMs: 60_000,
  globalPerDay: 300,
  dayMs: 24 * 3600_000,
  /** A client row is forgotten, strikes and all, this long after its last try or the end of its last lockout. */
  forgetMs: 24 * 3600_000,
} as const;

export type GateLimits = { [K in keyof typeof GATE_LIMITS]: number };
export type GateDecision = { ok: true } | { ok: false; retryAfterMs: number };

export interface GateLimiter {
  /** Records one try for this client at this time, and says whether its PIN may be compared. */
  attempt(clientAddress: string, now: Date): Promise<GateDecision>;
  /** A right PIN: the client's count is cleared and the site gets this try back. */
  succeed(clientAddress: string, now: Date): Promise<void>;
}

/** The card the owner gets, once a day, when the site's budget is spent. */
export const SLOWED_CARD = { kind: "sign-in-slowed", title: "Many wrong PINs today. Your command center slowed sign-in to protect itself." } as const;

type Row = { fails: number; windowStart: number; lockedUntil: number; strikes: number; touched: number };

const fresh = (now: number): Row => ({ fails: 0, windowStart: now, lockedUntil: 0, strikes: 0, touched: now });
const forgotten = (r: Row, now: number, l: GateLimits) => now - Math.max(r.touched, r.lockedUntil) >= l.forgetMs;

/** One try against a client's row: five per window, then a lockout that doubles each time. */
export function clientStep(row: Row | undefined, now: number, l: GateLimits): { row: Row; ok: boolean; retryAfterMs: number; changed: boolean } {
  let r = row ?? fresh(now);
  if (r.lockedUntil > now) return { row: r, ok: false, retryAfterMs: r.lockedUntil - now, changed: false };
  if (forgotten(r, now, l)) r = fresh(now);
  if (now - r.windowStart >= l.windowMs) r = { ...r, fails: 0, windowStart: now };
  if (r.fails >= l.perClient) {
    const lockMs = Math.min(l.clientLockMs * 2 ** r.strikes, l.maxClientLockMs);
    return { row: { fails: 0, windowStart: now, lockedUntil: now + lockMs, strikes: r.strikes + 1, touched: now }, ok: false, retryAfterMs: lockMs, changed: true };
  }
  return { row: { ...r, fails: r.fails + 1, touched: now }, ok: true, retryAfterMs: 0, changed: true };
}

/**
 * The site's budget, from the times of its tries in the last day (oldest first). 0 when a try may go ahead, else how
 * long until the oldest try in the full window ages out, which is never longer than that window.
 */
export function siteWait(tries: readonly number[], now: number, l: GateLimits): number {
  let wait = 0;
  for (const [limit, span] of [[l.globalPerMinute, l.minuteMs], [l.globalPerDay, l.dayMs]] as const) {
    const inWindow = tries.filter((t) => t > now - span);
    if (inWindow.length >= limit) wait = Math.max(wait, inWindow[inWindow.length - limit] + span - now);
  }
  return wait;
}

/** Decides one try. The client is checked first; a try the site refuses compares no PIN and spends nothing. */
export function decide(client: Row | undefined, siteTries: readonly number[], now: number, l: GateLimits): { decision: GateDecision; client?: Row; record: boolean; tripped: boolean } {
  const c = clientStep(client, now, l);
  if (!c.ok) return { decision: { ok: false, retryAfterMs: c.retryAfterMs }, client: c.changed ? c.row : undefined, record: false, tripped: false };
  const wait = siteWait(siteTries, now, l);
  if (wait > 0) return { decision: { ok: false, retryAfterMs: wait }, record: false, tripped: true };
  return { decision: { ok: true }, client: c.row, record: true, tripped: false };
}

/** Raises the owner's card for a spent site budget, once per UTC day. A failure is logged, never thrown. */
export async function raiseSlowedCard(db: Queryable, now: Date): Promise<void> {
  try {
    await writeCard(db, registryFrom(CORE_CARD_KINDS), { kind: SLOWED_CARD.kind, title: SLOWED_CARD.title, runKey: `${SLOWED_CARD.kind}:${now.toISOString().slice(0, 10)}` }, now);
  } catch (err) {
    console.error("sign-in: the slowed sign-in card could not be written", err);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// The client's address and its bucket.

/**
 * The visitor's address, from the one header this deploy can trust:
 * - on Vercel, x-vercel-forwarded-for, which the platform writes itself;
 * - elsewhere, the header named in FOUNDATION_CLIENT_IP_HEADER, last entry, which the proxy in front of the app
 *   must write (or append to) on every request;
 * - with neither, "direct": every visitor shares one budget, which is safe and only slower for the owner.
 * A trusted header that is missing reads "unknown".
 */
export function clientAddress(h: { get(name: string): string | null }, env: Pick<FoundationEnv, "onVercel" | "clientIpHeader">): string {
  if (env.onVercel) return h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!env.clientIpHeader) return "direct";
  return h.get(env.clientIpHeader)?.split(",").at(-1)?.trim() || "unknown";
}

const V4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

type Parsed = { v4: string } | { v6: string[] } | null;

function parse(address: string): Parsed {
  let a = address.trim().toLowerCase();
  if (a.startsWith("[") && a.endsWith("]")) a = a.slice(1, -1);
  a = a.replace(/%.*$/, "");
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(a);
  if (mapped) a = mapped[1];
  if (V4.test(a)) return { v4: a };
  if (!a.includes(":") || !/^[0-9a-f:.]+$/.test(a)) return null;
  let canonical: string;
  try {
    canonical = new URL(`http://[${a}]/`).hostname.slice(1, -1);
  } catch {
    return null;
  }
  const [head, tail = ""] = canonical.split("::");
  const left = head ? head.split(":") : [];
  const right = canonical.includes("::") && tail ? tail.split(":") : [];
  const groups = canonical.includes("::") ? [...left, ...Array(8 - left.length - right.length).fill("0"), ...right] : left;
  return groups.length === 8 ? { v6: groups.map((g) => g.replace(/^0+(?=.)/, "")) } : null;
}

/** The bucket a client's own limit counts in: a whole IPv4 address, an IPv6 address's /64, or one bucket for anything else. */
export function clientBucket(address: string): string {
  const p = parse(address);
  if (!p) return "unknown";
  return "v4" in p ? `v4:${p.v4}` : `v6:${p.v6.slice(0, 4).join(":")}::/64`;
}

const enc = new TextEncoder();

/** The stored key for a client: an HMAC of its bucket, so no table ever holds an address. */
async function rowKey(address: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(`foundation:gate-attempts:v1:${secret}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(clientBucket(address)));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------------------------------------------
// The stores.

const LOCK = "foundation:gate-attempts";
const ms = (v: unknown): number => (v == null ? 0 : new Date(v as string | Date).getTime());
const date = (n: number): Date | null => (n ? new Date(n) : null);

type DbRow = { fails: number; window_start: unknown; locked_until: unknown; strikes: number; touched: unknown };

const UPSERT = `insert into gate_attempts (key, fails, window_start, locked_until, strikes, touched) values ($1, $2, $3, $4, $5, $6)
  on conflict (key) do update set fails = excluded.fails, window_start = excluded.window_start,
  locked_until = excluded.locked_until, strikes = excluded.strikes, touched = excluded.touched`;

/** The limiter kept in gate_attempts and gate_failures. secret keys the client rows; every copy must use the same one. */
export function dbGateLimiter(db: Db, secret: string, limits: GateLimits = GATE_LIMITS): GateLimiter {
  return {
    async attempt(address, now) {
      const key = await rowKey(address, secret);
      const t = now.getTime();
      const out = await db.transaction(async (tx) => {
        await tx.query("select pg_advisory_xact_lock(hashtext($1))", [LOCK]);
        await tx.query("delete from gate_attempts where greatest(touched, coalesce(locked_until, touched)) < $1", [new Date(t - limits.forgetMs)]);
        await tx.query("delete from gate_failures where at <= $1", [new Date(t - limits.dayMs)]);
        const [row] = await tx.query<DbRow>("select fails, window_start, locked_until, strikes, touched from gate_attempts where key = $1", [key]);
        const client = row && { fails: Number(row.fails), windowStart: ms(row.window_start), lockedUntil: ms(row.locked_until), strikes: Number(row.strikes), touched: ms(row.touched) };
        const tries = (await tx.query<{ at: unknown }>("select at from gate_failures order by at, id")).map((r) => ms(r.at));
        const d = decide(client, tries, t, limits);
        if (d.client) await tx.query(UPSERT, [key, d.client.fails, new Date(d.client.windowStart), date(d.client.lockedUntil), d.client.strikes, new Date(d.client.touched)]);
        if (d.record) await tx.query("insert into gate_failures (key_hash, at) values ($1, $2)", [key, now]);
        return d;
      });
      // Outside the transaction, so a card that cannot be written never undoes the count.
      if (out.tripped) await raiseSlowedCard(db, now);
      return out.decision;
    },
    async succeed(address) {
      const key = await rowKey(address, secret);
      await db.transaction(async (tx) => {
        await tx.query("select pg_advisory_xact_lock(hashtext($1))", [LOCK]);
        await tx.query("delete from gate_attempts where key = $1", [key]);
        await tx.query("delete from gate_failures where id = (select id from gate_failures where key_hash = $1 order by at desc, id desc limit 1)", [key]);
      });
    },
  };
}

/** Forgets every client and every counted try: the owner's way in when sign-in is waiting. Returns the rows removed. */
export async function clearGateAttempts(db: Queryable): Promise<number> {
  const a = await db.query<{ key: string }>("delete from gate_attempts returning key");
  const b = await db.query<{ id: string }>("delete from gate_failures returning id");
  return a.length + b.length;
}

/** The same limiter in memory, for a deploy with no database. Each running copy keeps its own; it writes no card. */
export function memoryGateLimiter(limits: GateLimits = GATE_LIMITS): GateLimiter {
  const clients = new Map<string, Row>();
  let tries: { at: number; key: string }[] = [];
  let queue: Promise<unknown> = Promise.resolve();
  const serial = <T>(fn: () => T): Promise<T> => {
    const next = queue.then(fn);
    queue = next.catch(() => {});
    return next;
  };
  return {
    attempt: (address, now) =>
      serial(() => {
        const t = now.getTime();
        for (const [k, r] of clients) if (forgotten(r, t, limits)) clients.delete(k);
        tries = tries.filter((x) => x.at > t - limits.dayMs);
        const key = clientBucket(address);
        const d = decide(clients.get(key), tries.map((x) => x.at), t, limits);
        if (d.client) clients.set(key, d.client);
        if (d.record) tries.push({ at: t, key });
        return d.decision;
      }),
    succeed: (address) =>
      serial(() => {
        const key = clientBucket(address);
        clients.delete(key);
        const i = tries.map((x) => x.key).lastIndexOf(key);
        if (i >= 0) tries.splice(i, 1);
      }),
  };
}

/** The in-memory limiter this running copy uses when it has no database. */
export const previewGateLimiter = memoryGateLimiter();

// ---------------------------------------------------------------------------------------------------------------

/**
 * The visitor's address for the public form limiter: x-vercel-forwarded-for, then x-real-ip, then the first
 * x-forwarded-for entry, else "local". Off Vercel a visitor can write these headers, so the per form budget,
 * which counts every client together, is the limit that holds there. The sign-in limiter uses clientAddress.
 */
export function clientKeyFromHeaders(h: { get(name: string): string | null }): string {
  const vercel = h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  const first = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first || "local";
}
