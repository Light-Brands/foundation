import type { Db } from "@/lib/db/types";
import type { FoundationEnv } from "@/lib/env";

// The sign-in limiter. Every PIN try is recorded before the PIN is compared, and refused when its client or its
// network has to wait:
// - a client (one IPv4 address, or one IPv6 /64) gets five tries in ten minutes, then waits ten minutes, and each
//   later lockout lasts twice as long as the one before, up to a day. This lockout falls only on that client.
// - once the whole site passes thirty tries in ten minutes, it slows for fifteen minutes (doubling with each later
//   slowdown, up to four hours): each network (an IPv4 /24 or an IPv6 /48) may try once per thirty seconds,
//   doubling with each slowdown up to five minutes. The site itself never closes, so a stranger guessing from many
//   addresses can make no one wait longer than that capped spacing, and the owner's own network is never held
//   behind someone else's tries.
// A right PIN clears its client and gives the site's count its try back. The state lives in gate_attempts
// (core/db/migrations/0018_core_gate_attempts.sql), read and written in one transaction under an advisory lock, so a
// burst of tries at once is counted one by one and every wait holds across restarts and every running copy of the
// site. Only a deploy with no database (preview) keeps it in memory, per running copy. npm run auth:unlock clears it.

export const GATE_LIMITS = {
  perClient: 5,
  windowMs: 10 * 60_000,
  clientLockMs: 10 * 60_000,
  maxClientLockMs: 24 * 3600_000,
  global: 30,
  slowMs: 15 * 60_000,
  maxSlowMs: 4 * 3600_000,
  slowSpacingMs: 30_000,
  maxSlowSpacingMs: 5 * 60_000,
  /** A row is forgotten, strikes and all, this long after its last try or the end of its last wait. */
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
type Rows = { client?: Row; network?: Row; site?: Row };

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
 * One try against the site's row. The site never refuses: it counts tries, and past the ceiling it slows, saying
 * how far apart each network's tries must be (0 when it is not slowed). lockedUntil is the end of the slowdown.
 */
export function siteStep(row: Row | undefined, now: number, l: GateLimits): { row: Row; spacingMs: number; changed: boolean } {
  let r = row ?? fresh(now);
  const spacing = (strikes: number) => Math.min(l.slowSpacingMs * 2 ** Math.max(0, strikes - 1), l.maxSlowSpacingMs);
  if (r.lockedUntil > now) return { row: r, spacingMs: spacing(r.strikes), changed: false };
  if (forgotten(r, now, l)) r = fresh(now);
  if (now - r.windowStart >= l.windowMs) r = { ...r, fails: 0, windowStart: now };
  if (r.fails >= l.global) {
    const slowMs = Math.min(l.slowMs * 2 ** r.strikes, l.maxSlowMs);
    const next = { fails: 0, windowStart: now, lockedUntil: now + slowMs, strikes: r.strikes + 1, touched: now };
    return { row: next, spacingMs: spacing(next.strikes), changed: true };
  }
  return { row: { ...r, fails: r.fails + 1, touched: now }, spacingMs: 0, changed: true };
}

/** Decides one try from the client's, its network's and the site's rows, and says which rows to save. */
export function decide(rows: Rows, now: number, l: GateLimits): { decision: GateDecision; save: Rows } {
  const c = clientStep(rows.client, now, l);
  if (!c.ok) return { decision: { ok: false, retryAfterMs: c.retryAfterMs }, save: c.changed ? { client: c.row } : {} };
  const s = siteStep(rows.site, now, l);
  const since = rows.network ? now - rows.network.touched : Infinity;
  if (s.spacingMs > 0 && since < s.spacingMs) {
    // The site is slowed and this network tried a moment ago. No PIN is compared, so the client's try is not spent.
    return { decision: { ok: false, retryAfterMs: s.spacingMs - since }, save: s.changed ? { site: s.row } : {} };
  }
  return { decision: { ok: true }, save: { client: c.row, site: s.row, network: { ...fresh(now) } } };
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

/** The network a slowed site spaces tries by: an IPv4 /24, an IPv6 /48, or one bucket for anything else. */
export function clientNetwork(address: string): string {
  const p = parse(address);
  if (!p) return "net:unknown";
  return "v4" in p ? `net:${p.v4.split(".").slice(0, 3).join(".")}.0/24` : `net:${p.v6.slice(0, 3).join(":")}::/48`;
}

const enc = new TextEncoder();

/** The stored key for a bucket: an HMAC of it, so the table never holds an address. */
async function rowKey(bucket: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(`foundation:gate-attempts:v1:${secret}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(bucket));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------------------------------------------
// The stores.

const SITE = "*";
const LOCK = "foundation:gate-attempts";
const ms = (v: unknown): number => (v == null ? 0 : new Date(v as string | Date).getTime());
const date = (n: number): Date | null => (n ? new Date(n) : null);

type DbRow = { key: string; fails: number; window_start: unknown; locked_until: unknown; strikes: number; touched: unknown };

const UPSERT = `insert into gate_attempts (key, fails, window_start, locked_until, strikes, touched) values ($1, $2, $3, $4, $5, $6)
  on conflict (key) do update set fails = excluded.fails, window_start = excluded.window_start,
  locked_until = excluded.locked_until, strikes = excluded.strikes, touched = excluded.touched`;

/** The limiter kept in gate_attempts. secret keys the client and network rows; every copy must use the same one. */
export function dbGateLimiter(db: Db, secret: string, limits: GateLimits = GATE_LIMITS): GateLimiter {
  async function withRows<T>(address: string, now: number, fn: (rows: Rows) => { result: T; save: Rows; dropClient?: boolean }): Promise<T> {
    const [client, network] = await Promise.all([rowKey(clientBucket(address), secret), rowKey(clientNetwork(address), secret)]);
    return db.transaction(async (tx) => {
      await tx.query("select pg_advisory_xact_lock(hashtext($1))", [LOCK]);
      await tx.query("delete from gate_attempts where greatest(touched, coalesce(locked_until, touched)) < $1", [new Date(now - limits.forgetMs)]);
      const found = await tx.query<DbRow>("select key, fails, window_start, locked_until, strikes, touched from gate_attempts where key in ($1, $2, $3)", [client, network, SITE]);
      const read = (k: string): Row | undefined => {
        const r = found.find((x) => x.key === k);
        return r && { fails: Number(r.fails), windowStart: ms(r.window_start), lockedUntil: ms(r.locked_until), strikes: Number(r.strikes), touched: ms(r.touched) };
      };
      const out = fn({ client: read(client), network: read(network), site: read(SITE) });
      const write = (k: string, r: Row) => tx.query(UPSERT, [k, r.fails, new Date(r.windowStart), date(r.lockedUntil), r.strikes, new Date(r.touched)]);
      if (out.dropClient) await tx.query("delete from gate_attempts where key = $1", [client]);
      if (out.save.client) await write(client, out.save.client);
      if (out.save.network) await write(network, out.save.network);
      if (out.save.site) await write(SITE, out.save.site);
      return out.result;
    });
  }
  return {
    attempt: (address, now) =>
      withRows(address, now.getTime(), (rows) => {
        const { decision, save } = decide(rows, now.getTime(), limits);
        return { result: decision, save };
      }),
    succeed: async (address, now) => {
      await withRows(address, now.getTime(), (rows) => {
        const back = giveBack(rows.site);
        return { result: undefined, save: back ? { site: back } : {}, dropClient: true };
      });
    },
  };
}

/** Forgets every client, network and site row: the owner's way in when sign-in is waiting. Returns the rows removed. */
export async function clearGateAttempts(db: Pick<Db, "query">): Promise<number> {
  const rows = await db.query<{ key: string }>("delete from gate_attempts returning key");
  return rows.length;
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
  return {
    attempt: (address, now) =>
      serial(() => {
        const t = now.getTime();
        for (const [k, r] of rows) if (forgotten(r, t, limits)) rows.delete(k);
        const client = clientBucket(address);
        const network = clientNetwork(address);
        const { decision, save } = decide({ client: rows.get(client), network: rows.get(network), site: rows.get(SITE) }, t, limits);
        if (save.client) rows.set(client, save.client);
        if (save.network) rows.set(network, save.network);
        if (save.site) rows.set(SITE, save.site);
        return decision;
      }),
    succeed: (address) =>
      serial(() => {
        rows.delete(clientBucket(address));
        const back = giveBack(rows.get(SITE));
        if (back) rows.set(SITE, back);
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
