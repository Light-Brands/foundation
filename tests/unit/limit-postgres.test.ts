import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { openPostgres } from "@/lib/db/postgres";
import type { Db } from "@/lib/db/types";
import { GATE_LIMITS, dbGateLimiter, type GateDecision } from "@/lib/auth/limit";
import { CORE_MIGRATIONS, ROOT } from "../support/db";

// The sign-in limiter against a real Postgres server, where each transaction has its own connection and the
// advisory locks are real. It runs only when FOUNDATION_TEST_DATABASE_URL names a throwaway database, such as
// postgres://localhost:5432/foundation_test (docs/standards/testing.md), and skips cleanly otherwise. It migrates that
// database's two limiter tables (their migrations are written to run again) and empties them, so never point it at
// real data. Only the limiter's own migrations run, so any Postgres the app supports will do. The slowed sign-in
// card needs the inbox, which is not created here; the limiter logs that write and carries on, as it does in production.

const URL = process.env.FOUNDATION_TEST_DATABASE_URL?.trim() ?? "";
const SECRET = "postgres-test-secret-of-at-least-32-characters";
const SITE_LOCK = "foundation:gate-attempts";

async function settles(p: Promise<GateDecision>, ms = 3000): Promise<GateDecision | "waiting"> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<"waiting">((r) => { timer = setTimeout(() => r("waiting"), ms); });
  try {
    return await Promise.race([p, late]);
  } finally {
    clearTimeout(timer);
  }
}

describe.skipIf(!URL)("the sign-in limiter on Postgres", () => {
  let db: Db;
  beforeAll(async () => {
    db = openPostgres(URL, { max: 10 });
    for (const f of ["0018_core_gate_attempts.sql", "0019_core_gate_failures.sql"]) await db.exec(readFileSync(path.join(CORE_MIGRATIONS, f), "utf8"));
  }, 60_000);
  beforeEach(async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await db.query("delete from gate_attempts");
    await db.query("delete from gate_failures");
  });
  afterAll(async () => {
    vi.restoreAllMocks();
    await db?.close();
  });

  it("lets exactly five through when a burst from one client arrives at once", async () => {
    const l = dbGateLimiter(db, SECRET);
    const now = new Date();
    const burst = await Promise.all(Array.from({ length: 40 }, () => l.attempt("203.0.113.9", now)));
    expect(burst.filter((d) => d.ok)).toHaveLength(GATE_LIMITS.perClient);
  });

  it("lets no more than the minute's budget through when many /64s guess at once", async () => {
    const l = dbGateLimiter(db, SECRET);
    const now = new Date();
    const burst = await Promise.all(Array.from({ length: 60 }, (_, i) => l.attempt(`2001:db8:${(i + 1).toString(16)}:1::1`, now)));
    expect(burst.filter((d) => d.ok)).toHaveLength(GATE_LIMITS.globalPerMinute);
    expect(await db.query("select id from gate_failures")).toHaveLength(GATE_LIMITS.globalPerMinute);
  });

  it("lets a known device in while another session holds the site-wide lock", async () => {
    const holder = openPostgres(URL, { max: 1 });
    let release!: () => void;
    const released = new Promise<void>((r) => { release = r; });
    let holding!: () => void;
    const held = new Promise<void>((r) => { holding = r; });
    const holdingTx = holder.transaction(async (tx) => {
      await tx.query("select pg_advisory_xact_lock(hashtext($1))", [SITE_LOCK]);
      holding();
      await released;
    });
    try {
      await held;
      const l = dbGateLimiter(db, SECRET);
      let strangerDone = false;
      const stranger = l.attempt("198.51.100.1", new Date()).finally(() => { strangerDone = true; });
      expect(await settles(l.attempt("203.0.113.9", new Date(), "owner-device-id"))).toEqual({ ok: true });
      expect(strangerDone).toBe(false);
      release();
      expect(await stranger).toEqual({ ok: true });
    } finally {
      release();
      await holdingTx;
      await holder.close();
    }
  });

  it("npm run auth:unlock reports a database without the limiter's tables and builds nothing there", async () => {
    const name = `foundation_unlock_${process.pid}_${Date.now()}`;
    await db.query(`create database ${name}`);
    try {
      const target = new globalThis.URL(URL);
      target.pathname = `/${name}`;
      const r = spawnSync("npm", ["run", "-s", "auth:unlock"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, FOUNDATION_DATABASE_URL: target.toString() } });
      expect(r.stdout).toMatch(/sign-in limiter's tables are not in this database/);
      expect(r.status).not.toBe(0);
      const empty = openPostgres(target.toString(), { max: 1 });
      try {
        expect(await empty.query("select table_name from information_schema.tables where table_schema = 'public'")).toEqual([]);
      } finally {
        await empty.close();
      }
    } finally {
      await db.query(`drop database if exists ${name}`);
    }
  }, 120_000);
});
