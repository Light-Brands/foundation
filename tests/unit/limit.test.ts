import { describe, it, expect, vi } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { coreDb, CORE_MIGRATIONS } from "../support/db";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";
import { readEnv } from "@/lib/env";
import { handleGatePost } from "@/lib/auth/gate";
import {
  GATE_LIMITS,
  clientAddress,
  clientBucket,
  clientKeyFromHeaders,
  clientNetwork,
  clearGateAttempts,
  dbGateLimiter,
  memoryGateLimiter,
  type GateLimiter,
} from "@/lib/auth/limit";

const MIN = 60_000;
const T0 = new Date("2026-10-07T16:00:00Z").getTime();
const at = (ms: number) => new Date(T0 + ms);
const SECRET = "limit-test-secret-of-at-least-32-characters";

async function tries(l: GateLimiter, client: string, n: number, when: Date) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(await l.attempt(client, when));
  return out;
}

describe("clientBucket", () => {
  it("keys an IPv4 address by the whole address", () => {
    expect(clientBucket("203.0.113.9")).toBe("v4:203.0.113.9");
    expect(clientBucket("203.0.113.10")).not.toBe(clientBucket("203.0.113.9"));
    expect(clientBucket("::ffff:203.0.113.9")).toBe("v4:203.0.113.9");
  });
  it("keys an IPv6 address by its /64", () => {
    const a = clientBucket("2001:db8:1:2:aaaa:bbbb:cccc:dddd");
    expect(a).toBe("v6:2001:db8:1:2::/64");
    expect(clientBucket("2001:db8:1:2::1")).toBe(a);
    expect(clientBucket("[2001:DB8:1:2:ffff::9]")).toBe(a);
    expect(clientBucket("2001:db8:1:3::1")).not.toBe(a);
  });
  it("spaces a slowed site by IPv4 /24 and IPv6 /48", () => {
    expect(clientNetwork("203.0.113.9")).toBe(clientNetwork("203.0.113.200"));
    expect(clientNetwork("203.0.113.9")).not.toBe(clientNetwork("203.0.114.9"));
    expect(clientNetwork("2001:db8:1:2::1")).toBe(clientNetwork("2001:db8:1:ffff::1"));
    expect(clientNetwork("2001:db8:1:2::1")).not.toBe(clientNetwork("2001:db8:2:2::1"));
  });
  it("puts anything that is not an address in one bucket", () => {
    expect(clientBucket("")).toBe("unknown");
    expect(clientBucket("not-an-ip")).toBe("unknown");
    expect(clientBucket("999.1.1.1")).toBe("unknown");
  });
});

describe("clientAddress", () => {
  const spoof = { "x-forwarded-for": "198.51.100.1", "x-real-ip": "198.51.100.2" };
  it("on Vercel reads only the address the platform set", () => {
    const env = readEnv({ VERCEL: "1" });
    expect(clientAddress(new Headers({ ...spoof, "x-vercel-forwarded-for": "203.0.113.9" }), env)).toBe("203.0.113.9");
    expect(clientAddress(new Headers(spoof), env)).toBe("unknown");
  });
  it("elsewhere ignores every address header until one is named", () => {
    expect(clientAddress(new Headers({ ...spoof, "x-vercel-forwarded-for": "203.0.113.9" }), readEnv({}))).toBe("direct");
  });
  it("reads the named header's last entry, the one the trusted proxy added", () => {
    const env = readEnv({ FOUNDATION_CLIENT_IP_HEADER: "X-Forwarded-For" });
    expect(clientAddress(new Headers({ "x-forwarded-for": "198.51.100.1, 203.0.113.9" }), env)).toBe("203.0.113.9");
    expect(clientAddress(new Headers(), env)).toBe("unknown");
  });
  it("refuses a header name that is not one", () => {
    expect(readEnv({ FOUNDATION_CLIENT_IP_HEADER: "x forwarded" }).clientIpHeader).toBeNull();
  });
});

describe("clientKeyFromHeaders (public forms)", () => {
  it("prefers the address Vercel set, then x-real-ip, then the first x-forwarded-for entry", () => {
    const all = { "x-vercel-forwarded-for": "198.51.100.7", "x-real-ip": "192.0.2.4", "x-forwarded-for": "203.0.113.9, 10.0.0.1" };
    expect(clientKeyFromHeaders(new Headers(all))).toBe("198.51.100.7");
    expect(clientKeyFromHeaders(new Headers({ ...all, "x-vercel-forwarded-for": " " }))).toBe("192.0.2.4");
    expect(clientKeyFromHeaders(new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe("203.0.113.9");
    expect(clientKeyFromHeaders(new Headers())).toBe("local");
  });
});

describe("the sign-in limiter in the database", () => {
  it("allows five tries, then asks the client to wait ten minutes", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    const first = await tries(l, "203.0.113.9", GATE_LIMITS.perClient, at(0));
    expect(first.every((d) => d.ok)).toBe(true);
    const sixth = await l.attempt("203.0.113.9", at(1000));
    expect(sixth).toEqual({ ok: false, retryAfterMs: GATE_LIMITS.clientLockMs });
    expect((await l.attempt("203.0.113.9", at(5 * MIN))).ok).toBe(false);
    expect((await l.attempt("203.0.113.10", at(5 * MIN))).ok).toBe(true);
    await db.close();
  });

  it("stores no address", async () => {
    const db = await coreDb();
    await dbGateLimiter(db, SECRET).attempt("203.0.113.9", at(0));
    const rows = await db.query<{ key: string }>("select key from gate_attempts");
    expect(rows.map((r) => r.key).join(" ")).not.toContain("203.0.113");
    await db.close();
  });

  it("lets exactly five through when a burst arrives at once", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    const burst = await Promise.all(Array.from({ length: 40 }, () => l.attempt("203.0.113.9", at(0))));
    expect(burst.filter((d) => d.ok)).toHaveLength(GATE_LIMITS.perClient);
    await db.close();
  });

  it("records the try before the PIN is compared, so a burst of wrong PINs gets five answers", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    const env = readEnv({ FOUNDATION_PIN: "24681012", FOUNDATION_SECRET: SECRET });
    const res = await Promise.all(Array.from({ length: 30 }, (_, i) => handleGatePost({ pin: String(10000000 + i) }, env, T0, { limiter: l, client: "203.0.113.9" })));
    expect(res.filter((r) => r.status === 401)).toHaveLength(GATE_LIMITS.perClient);
    expect(res.filter((r) => r.status === 429)).toHaveLength(30 - GATE_LIMITS.perClient);
    expect(res.find((r) => r.status === 429)?.retryAfterMs).toBeGreaterThan(0);
    await db.close();
  });

  it("treats every address inside one IPv6 /64 as one client", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    const rotating = Array.from({ length: 20 }, (_, i) => `2001:db8:1:2:${(i + 1).toString(16)}::1`);
    const out = [];
    for (const addr of rotating) out.push(await l.attempt(addr, at(0)));
    expect(out.filter((d) => d.ok)).toHaveLength(GATE_LIMITS.perClient);
    expect((await l.attempt("2001:db8:1:3::1", at(0))).ok).toBe(true);
    await db.close();
  });

  it("doubles the wait each time a client is locked out again", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    await tries(l, "a", GATE_LIMITS.perClient, at(0));
    expect(await l.attempt("a", at(0))).toEqual({ ok: false, retryAfterMs: GATE_LIMITS.clientLockMs });
    const after1 = GATE_LIMITS.clientLockMs + 1;
    expect((await tries(l, "a", GATE_LIMITS.perClient, at(after1))).every((d) => d.ok)).toBe(true);
    expect(await l.attempt("a", at(after1))).toEqual({ ok: false, retryAfterMs: 2 * GATE_LIMITS.clientLockMs });
    await db.close();
  });

  it("slows the site past the ceiling, spacing each network's tries, and never closes it", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    // Thirty tries from one /24, each from its own address.
    for (let i = 0; i < GATE_LIMITS.global; i++) expect((await l.attempt(`198.51.100.${i}`, at(i))).ok).toBe(true);
    const t = GATE_LIMITS.global;
    // That network tried a moment ago, so it waits the spacing, never longer.
    const over = await l.attempt("198.51.100.200", at(t));
    expect(over.ok).toBe(false);
    expect(!over.ok && over.retryAfterMs).toBeLessThanOrEqual(GATE_LIMITS.slowSpacingMs);
    // Another network gets in at once, and then waits the spacing itself.
    expect((await l.attempt("203.0.113.5", at(t))).ok).toBe(true);
    expect(await l.attempt("203.0.113.6", at(t + 1000))).toEqual({ ok: false, retryAfterMs: GATE_LIMITS.slowSpacingMs - 1000 });
    expect((await l.attempt("203.0.113.6", at(t + GATE_LIMITS.slowSpacingMs))).ok).toBe(true);
    // A later slowdown doubles the spacing.
    const later = t + GATE_LIMITS.slowMs + 1;
    for (let i = 0; i < GATE_LIMITS.global; i++) expect((await l.attempt(`192.0.${i}.1`, at(later))).ok).toBe(true);
    expect((await l.attempt("192.0.200.9", at(later))).ok).toBe(true);
    expect(await l.attempt("192.0.200.10", at(later))).toEqual({ ok: false, retryAfterMs: 2 * GATE_LIMITS.slowSpacingMs });
    await db.close();
  });

  it("never makes anyone wait longer than the capped spacing, however many slowdowns came before", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    let now = 0;
    for (let round = 0; round < 8; round++) {
      for (let i = 0; i < GATE_LIMITS.global + 1; i++) await l.attempt(`10.${round}.${i}.1`, at(now));
      const d = await l.attempt("10.250.0.1", at(now + 1));
      const again = await l.attempt("10.250.0.2", at(now + 2));
      expect(d.ok).toBe(true);
      expect(again.ok).toBe(false);
      expect(!again.ok && again.retryAfterMs).toBeLessThanOrEqual(GATE_LIMITS.maxSlowSpacingMs);
      now += GATE_LIMITS.maxSlowMs + 1;
    }
    await db.close();
  });

  it("lets the owner in within the capped wait while a stranger exhausts the ceiling from many networks", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    const env = readEnv({ FOUNDATION_PIN: "24681012", FOUNDATION_SECRET: SECRET });
    // The stranger guesses from sixty IPv6 /48s, then keeps going while the owner signs in.
    const stranger = (i: number) => `2001:db8:${(i + 1).toString(16)}::1`;
    for (let i = 0; i < 60; i++) await handleGatePost({ pin: "11111111" }, env, T0 + i, { limiter: l, client: stranger(i) });
    for (let i = 0; i < 60; i++) {
      const r = await handleGatePost({ pin: "11111111" }, env, T0 + 100 + i, { limiter: l, client: stranger(i) });
      expect(r.status === 429 ? r.retryAfterMs : 0).toBeLessThanOrEqual(GATE_LIMITS.maxClientLockMs);
    }
    const owner = { limiter: l, client: "203.0.113.9" };
    let when = T0 + 200;
    let r = await handleGatePost({ pin: "24681012" }, env, when, owner);
    if (r.status === 429) {
      expect(r.retryAfterMs).toBeLessThanOrEqual(GATE_LIMITS.maxSlowSpacingMs);
      when += r.retryAfterMs ?? 0;
      r = await handleGatePost({ pin: "24681012" }, env, when, owner);
    }
    expect(r.status).toBe(200);
    expect(when - (T0 + 200)).toBeLessThanOrEqual(GATE_LIMITS.maxSlowSpacingMs);
    await db.close();
  });

  it("keeps locking out the stranger's own address", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    let refusedFor = 0;
    for (let i = 0; i < 40; i++) {
      const d = await l.attempt("2001:db8:7:7::1", at(i * 60_000));
      if (!d.ok) refusedFor = Math.max(refusedFor, d.retryAfterMs);
    }
    expect(refusedFor).toBeGreaterThanOrEqual(GATE_LIMITS.clientLockMs - 60_000);
    await db.close();
  });

  it("npm run auth:unlock's helper clears every wait", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    await tries(l, "203.0.113.9", GATE_LIMITS.perClient + 1, at(0));
    expect((await l.attempt("203.0.113.9", at(1))).ok).toBe(false);
    expect(await clearGateAttempts(db)).toBeGreaterThan(0);
    expect((await l.attempt("203.0.113.9", at(2))).ok).toBe(true);
    await db.close();
  });

  it("a right PIN gives back its try, so the owner never spends the site's budget", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    for (let i = 0; i < GATE_LIMITS.global * 2; i++) {
      expect((await l.attempt("203.0.113.9", at(i))).ok).toBe(true);
      await l.succeed("203.0.113.9", at(i));
    }
    await db.close();
  });

  it("a right PIN works once the lockout ends, and clears the client's count", async () => {
    const db = await coreDb();
    const l = dbGateLimiter(db, SECRET);
    const env = readEnv({ FOUNDATION_PIN: "24681012", FOUNDATION_SECRET: SECRET });
    const gate = { limiter: l, client: "203.0.113.9" };
    for (let i = 0; i < GATE_LIMITS.perClient; i++) expect((await handleGatePost({ pin: "11111111" }, env, T0, gate)).status).toBe(401);
    expect((await handleGatePost({ pin: "24681012" }, env, T0 + MIN, gate)).status).toBe(429);
    const open = T0 + GATE_LIMITS.clientLockMs + 2 * MIN;
    const ok = await handleGatePost({ pin: "24681012" }, env, open, gate);
    expect(ok.status).toBe(200);
    expect(ok.token).toBeTruthy();
    expect((await tries(l, "203.0.113.9", GATE_LIMITS.perClient, new Date(open))).every((d) => d.ok)).toBe(true);
    await db.close();
  });

  it("holds across a restart and a fresh copy of the module", async () => {
    const dir = path.join(mkdtempSync(path.join(tmpdir(), "gate-")), "pglite");
    const first = await openPglite(dir);
    await migrate(first, CORE_MIGRATIONS, "core");
    await tries(dbGateLimiter(first, SECRET), "203.0.113.9", GATE_LIMITS.perClient + 1, at(0));
    await first.close();
    vi.resetModules();
    const fresh = await import("@/lib/auth/limit");
    const again = await openPglite(dir);
    expect((await fresh.dbGateLimiter(again, SECRET).attempt("203.0.113.9", at(MIN))).ok).toBe(false);
    await again.close();
  }, 60_000);
});

describe("the sign-in limiter without a database (preview)", () => {
  it("keeps the same limits in memory", async () => {
    const l = memoryGateLimiter();
    const burst = await Promise.all(Array.from({ length: 20 }, () => l.attempt("2001:db8::1", at(0))));
    expect(burst.filter((d) => d.ok)).toHaveLength(GATE_LIMITS.perClient);
    expect((await l.attempt("2001:db8::2", at(0))).ok).toBe(false);
    expect((await l.attempt("2001:db8::2", at(GATE_LIMITS.clientLockMs + 1))).ok).toBe(true);
  });
});

describe("the wait the sign-in page shows", () => {
  it("names the wait in calm, rounded words", async () => {
    const { waitMessage } = await import("@/app/admin/login/Keypad");
    expect(waitMessage(600)).toBe("Too many tries for now. Try again in 10 minutes.");
    expect(waitMessage(61)).toBe("Too many tries for now. Try again in 2 minutes.");
    expect(waitMessage(20)).toBe("Too many tries for now. Try again in 1 minute.");
    expect(waitMessage(4 * 3600)).toBe("Too many tries for now. Try again in 4 hours.");
    expect(waitMessage(undefined)).toBe("Too many tries for now. Try again in a few minutes.");
  });
});
