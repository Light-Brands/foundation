import { describe, it, expect, afterEach } from "vitest";
import { coreDb } from "../support/db";
import type { Db, Tx } from "@/lib/db/types";
import { GATE_LIMITS, SLOWED_CARD, dbGateLimiter, type GateDecision } from "@/lib/auth/limit";

// PGlite is one session, so it cannot show one try waiting on another's advisory lock. This wrapper keeps the
// advisory locks itself, one per name, held until the transaction that took it ends, and passes every other query
// to PGlite. A test can then hold the site-wide lock the way a flood of strangers' tries does, and see which tries
// wait behind it.

const SITE_LOCK = "foundation:gate-attempts";
const T0 = new Date("2026-10-07T16:00:00Z").getTime();
const at = (ms: number) => new Date(T0 + ms);
const SECRET = "locks-test-secret-of-at-least-32-characters";
const LOCK_QUERY = /pg_advisory_xact_lock\(hashtext\(\$1\)\)/;

function withLocks(inner: Db) {
  const held = new Map<string, Promise<void>>();
  const taken: string[] = [];
  async function acquire(name: string): Promise<() => void> {
    while (held.has(name)) await held.get(name);
    let release!: () => void;
    held.set(name, new Promise<void>((r) => { release = r; }));
    return () => { held.delete(name); release(); };
  }
  const db: Db = {
    query: (sql, params) => inner.query(sql, params),
    exec: (sql) => inner.exec(sql),
    close: () => inner.close(),
    async transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
      const releases: (() => void)[] = [];
      const tx: Tx = {
        async query<R>(sql: string, params: unknown[] = []) {
          if (LOCK_QUERY.test(sql)) {
            taken.push(String(params[0]));
            releases.push(await acquire(String(params[0])));
            return [] as R[];
          }
          return inner.query<R>(sql, params);
        },
        exec: (sql) => inner.exec(sql),
      };
      try {
        return await fn(tx);
      } finally {
        for (const r of releases) r();
      }
    },
  };
  return { db, taken, hold: acquire };
}

/** The decision, or "waiting" when it has not come within the time a stalled try would take. */
async function settles(p: Promise<GateDecision>, ms = 1500): Promise<GateDecision | "waiting"> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<"waiting">((r) => { timer = setTimeout(() => r("waiting"), ms); });
  try {
    return await Promise.race([p, late]);
  } finally {
    clearTimeout(timer);
  }
}

let inner: Db | null = null;
afterEach(async () => {
  await inner?.close();
  inner = null;
});

describe("the sign-in limiter under a flood", () => {
  it("lets a known device's try finish while strangers' tries wait on the site-wide lock", async () => {
    inner = await coreDb();
    const { db, taken, hold } = withLocks(inner);
    const l = dbGateLimiter(db, SECRET);

    // Another session holds the site-wide lock, and many strangers' tries queue behind it.
    const release = await hold(SITE_LOCK);
    let strangersDone = 0;
    const strangers = Array.from({ length: 30 }, (_, i) => l.attempt(`2001:db8:${(i + 1).toString(16)}::1`, at(0)).finally(() => { strangersDone++; }));

    const owner = await settles(l.attempt("198.51.100.7", at(0), "owner-device-id"));
    expect(owner).toEqual({ ok: true });
    expect(strangersDone).toBe(0);
    // The device took a lock of its own, never the site's.
    const deviceLocks = taken.filter((n) => n !== SITE_LOCK);
    expect(deviceLocks).toHaveLength(1);
    expect(deviceLocks[0]).toMatch(/^foundation:gate-device:/);

    release();
    const out = await Promise.all(strangers);
    expect(out.filter((d) => d.ok)).toHaveLength(GATE_LIMITS.globalPerMinute);
  });

  it("refuses a locked client and a spent site budget from a plain read, without waiting on any lock", async () => {
    inner = await coreDb();
    const { db, hold } = withLocks(inner);
    const l = dbGateLimiter(db, SECRET);
    // One client locks itself out (five tries, then the sixth), and five strangers spend the rest of the minute.
    for (let i = 0; i <= GATE_LIMITS.perClient; i++) await l.attempt("203.0.113.9", at(i));
    for (let i = 0; i < GATE_LIMITS.globalPerMinute - GATE_LIMITS.perClient; i++) await l.attempt(`198.51.100.${i}`, at(10 + i));

    const release = await hold(SITE_LOCK);
    const locked = await settles(l.attempt("203.0.113.9", at(100)));
    expect(locked).toMatchObject({ ok: false });
    expect((locked as { retryAfterMs: number }).retryAfterMs).toBeGreaterThan(GATE_LIMITS.minuteMs);
    const spent = await settles(l.attempt("192.0.2.50", at(100)));
    expect(spent).toMatchObject({ ok: false });
    expect((spent as { retryAfterMs: number }).retryAfterMs).toBeLessThanOrEqual(GATE_LIMITS.minuteMs);
    release();

    // The owner still hears once that sign-in slowed.
    const cards = await inner.query("select id from inbox_items where kind = $1", [SLOWED_CARD.kind]);
    expect(cards).toHaveLength(1);
  });

  it("still counts a try the plain read let through under the site-wide lock", async () => {
    inner = await coreDb();
    const { db, taken } = withLocks(inner);
    const l = dbGateLimiter(db, SECRET);
    expect(await l.attempt("203.0.113.9", at(0))).toEqual({ ok: true });
    expect(taken).toEqual([SITE_LOCK]);
    expect(await inner.query("select key_hash from gate_failures")).toHaveLength(1);
  });
});
