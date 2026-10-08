import type { Db } from "@/lib/db/types";
import type { FoundationEnv } from "@/lib/env";

// The sign-in limiter. Every PIN try is recorded before the PIN is compared, and refused once its client, or the
// whole site, has used its budget:
// - a client (one IPv4 address, or one IPv6 /64) gets five tries in ten minutes, then waits ten minutes, and each
//   later lockout lasts twice as long as the one before, up to a day;
// - the whole site gets thirty tries in ten minutes, then every client waits fifteen minutes, doubling the same
//   way up to four hours, so guessing from many addresses at once stays slow too.
// A right PIN gives its try back. The state lives in gate_attempts (core/db/migrations/0018_core_gate_attempts.sql),
// read and written in one transaction under an advisory lock, so a burst of tries at once is counted one by one and
// a lockout holds across restarts and every running copy of the site. Only a deploy with no database (preview)
// keeps it in memory, per running copy.

export const GATE_LIMITS = {
  perClient: 5,
  windowMs: 10 * 60_000,
  clientLockMs: 10 * 60_000,
  maxClientLockMs: 24 * 3600_000,
  global: 30,
  globalLockMs: 15 * 60_000,
  maxGlobalLockMs: 4 * 3600_000,
  /** A row is forgotten, strikes and all, this long after its last try or the end of its last lockout. */
  forgetMs: 24 * 3600_000,
} as const;

export type GateLimits = { [K in keyof typeof GATE_LIMITS]: number };
export type GateDecision = { ok: true } | { ok: false; retryAfterMs: number };

export interface GateLimiter {
  /** Records one try for this client at this time, and says whether its PIN may be compared. */
  attempt(clientAddress: string, now: Date): Promise<GateDecision>;
  /** A right PIN: the client's count is cleared and the site's count gets this try back. */
  succeed(clientAddress: string, now: Date): Promise<void>;
}

type Row = { fails: number; windowStart: number; lockedUntil: number; strikes: number; touched: number };
type Budget = { limit: number; lockMs: number; maxLockMs: number };

const GLOBAL = "*";

/** One try against one row. Pure: the stores below only load and save what it returns. */
export function step(row: Row | undefined, now: number, b: Budget, limits: GateLimits): { row: Row; ok: boolean; retryAfterMs: number; changed: boolean } {
  let r: Row = row ?? { fails: 0, windowStart: now, lockedUntil: 0, strikes: 0, touched: now };
  if (r.lockedUntil > now) return { row: r, ok: false, retryAfterMs: r.lockedUntil - now, changed: false };
  if (now - Math.max(r.touched, r.lockedUntil) >= limits.forgetMs) r = { fails: 0, windowStart: now, lockedUntil: 0, strikes: 0, touched: now };
  if (now - r.windowStart >= limits.windowMs) r = { ...r, fails: 0, windowStart: now };
  if (r.fails >= b.limit) {
    const lockMs = Math.min(b.lockMs * 2 ** r.strikes, b.maxLockMs);
    return { row: { fails: 0, windowStart: now, lockedUntil: now + lockMs, strikes: r.strikes + 1, touched: now }, ok: false, retryAfterMs: lockMs, changed: true };
  }
  return { row: { ...r, fails: r.fails + 1, touched: now }, ok: true, retryAfterMs: 0, changed: true };
}

const budgets = (l: GateLimits): { client: Budget; site: Budget } => ({
  client: { limit: l.perClient, lockMs: l.clientLockMs, maxLockMs: l.maxClientLockMs },
  site: { limit: l.global, lockMs: l.globalLockMs, maxLockMs: l.maxGlobalLockMs },
});

/** Decides one try from the client's row and the site's row, and says which rows to save. */
function decide(client: Row | undefined, site: Row | undefined, now: number, limits: GateLimits) {
  const b = budgets(limits);
  const c = step(client, now, b.client, limits);
  if (!c.ok) return { decision: { ok: false, retryAfterMs: c.retryAfterMs } as GateDecision, save: c.changed ? { client: c.row } : {} };
  const s = step(site, now, b.site, limits);
  // The site refused, so no PIN is compared and the client's try is not spent.
  if (!s.ok) return { decision: { ok: false, retryAfterMs: s.retryAfterMs } as GateDecision, save: s.changed ? { site: s.row } : {} };
  return { decision: { ok: true } as GateDecision, save: { client: c.row, site: s.row } };
}

const giveBack = (site: Row | undefined): Row | undefined => (site && site.fails > 0 ? { ...site, fails: site.fails - 1 } : undefined);

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

/** The bucket a limit counts in: a whole IPv4 address, an IPv6 address's /64, or one bucket for anything else. */
export function clientBucket(address: string): string {
  let a = address.trim().toLowerCase();
  if (a.startsWith("[") && a.endsWith("]")) a = a.slice(1, -1);
  a = a.replace(/%.*$/, "");
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(a);
  if (mapped) a = mapped[1];
  if (V4.test(a)) return `v4:${a}`;
  if (!a.includes(":") || !/^[0-9a-f:.]+$/.test(a)) return "unknown";
  let canonical: string;
  try {
    canonical = new URL(`http://[${a}]/`).hostname.slice(1, -1);
  } catch {
    return "unknown";
  }
  const [head, tail = ""] = canonical.split("::");
  const left = head ? head.split(":") : [];
  const right = canonical.includes("::") && tail ? tail.split(":") : [];
  const groups = canonical.includes("::") ? [...left, ...Array(8 - left.length - right.length).fill("0"), ...right] : left;
  if (groups.length !== 8) return "unknown";
  return `v6:${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}

const enc = new TextEncoder();

/** The stored key for a client: an HMAC of its bucket, so the table never holds an address. */
export async function clientRowKey(address: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(`foundation:gate-attempts:v1:${secret}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(clientBucket(address)));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------------------------------------------
// The stores.

const LOCK = "foundation:gate-attempts";
const ms = (v: unknown): number => (v == null ? 0 : new Date(v as string | Date).getTime());
const date = (n: number): Date | null => (n ? new Date(n) : null);

type DbRow = { key: string; fails: number; window_start: unknown; locked_until: unknown; strikes: number; touched: unknown };

const UPSERT = `insert into gate_attempts (key, fails, window_start, locked_until, strikes, touched) values ($1, $2, $3, $4, $5, $6)
  on conflict (key) do update set fails = excluded.fails, window_start = excluded.window_start,
  locked_until = excluded.locked_until, strikes = excluded.strikes, touched = excluded.touched`;

/** The limiter kept in gate_attempts. secret keys the client rows; the same secret must be used on every copy. */
export function dbGateLimiter(db: Db, secret: string, limits: GateLimits = GATE_LIMITS): GateLimiter {
  async function withRows<T>(clientKey: string, now: number, fn: (client: Row | undefined, site: Row | undefined) => { result: T; save: { client?: Row; site?: Row }; dropClient?: boolean }): Promise<T> {
    return db.transaction(async (tx) => {
      await tx.query("select pg_advisory_xact_lock(hashtext($1))", [LOCK]);
      await tx.query("delete from gate_attempts where greatest(touched, coalesce(locked_until, touched)) < $1", [new Date(now - limits.forgetMs)]);
      const rows = await tx.query<DbRow>("select key, fails, window_start, locked_until, strikes, touched from gate_attempts where key in ($1, $2)", [clientKey, GLOBAL]);
      const read = (k: string): Row | undefined => {
        const r = rows.find((x) => x.key === k);
        return r && { fails: Number(r.fails), windowStart: ms(r.window_start), lockedUntil: ms(r.locked_until), strikes: Number(r.strikes), touched: ms(r.touched) };
      };
      const out = fn(read(clientKey), read(GLOBAL));
      const write = (k: string, r: Row) => tx.query(UPSERT, [k, r.fails, new Date(r.windowStart), date(r.lockedUntil), r.strikes, new Date(r.touched)]);
      if (out.dropClient) await tx.query("delete from gate_attempts where key = $1", [clientKey]);
      if (out.save.client) await write(clientKey, out.save.client);
      if (out.save.site) await write(GLOBAL, out.save.site);
      return out.result;
    });
  }
  return {
    async attempt(address, now) {
      const key = await clientRowKey(address, secret);
      return withRows(key, now.getTime(), (client, site) => {
        const { decision, save } = decide(client, site, now.getTime(), limits);
        return { result: decision, save };
      });
    },
    async succeed(address, now) {
      const key = await clientRowKey(address, secret);
      await withRows(key, now.getTime(), (_client, site) => {
        const back = giveBack(site);
        return { result: undefined, save: back ? { site: back } : {}, dropClient: true };
      });
    },
  };
}

/** The same limiter in memory, for a deploy with no database. Each running copy keeps its own. */
export function memoryGateLimiter(limits: GateLimits = GATE_LIMITS): GateLimiter {
  const rows = new Map<string, Row>();
  let queue: Promise<unknown> = Promise.resolve();
  const serial = <T>(fn: () => T): Promise<T> => {
    const next = queue.then(fn);
    queue = next.catch(() => {});
    return next;
  };
  const prune = (now: number) => {
    for (const [k, r] of rows) if (now - Math.max(r.touched, r.lockedUntil) >= limits.forgetMs) rows.delete(k);
  };
  return {
    attempt: (address, now) =>
      serial(() => {
        const t = now.getTime();
        prune(t);
        const key = clientBucket(address);
        const { decision, save } = decide(rows.get(key), rows.get(GLOBAL), t, limits);
        if (save.client) rows.set(key, save.client);
        if (save.site) rows.set(GLOBAL, save.site);
        return decision;
      }),
    succeed: (address) =>
      serial(() => {
        rows.delete(clientBucket(address));
        const back = giveBack(rows.get(GLOBAL));
        if (back) rows.set(GLOBAL, back);
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
