import { describe, it, expect, vi, beforeEach } from "vitest";

const getDb = vi.fn();
vi.mock("@/lib/db", () => ({ getDb: (...a: unknown[]) => getDb(...a) }));
const hasSession = vi.fn(async () => false);
vi.mock("@/lib/auth/session", () => ({ hasSession: () => hasSession() }));
const runChecks = vi.fn(async () => ({ paused: false, outcomes: [{ slug: "a", result: "clear" }], lapsed: { closed: 0, raised: 0 } }));
vi.mock("@/lib/checks/runner", async (orig) => ({ ...(await orig<typeof import("@/lib/checks/runner")>()), runChecks: (...a: unknown[]) => (runChecks as (...x: unknown[]) => unknown)(...a) }));
vi.mock("@/lib/checks/deps", () => ({ checkDeps: async (db: unknown) => ({ db, kinds: new Map(), checks: [{}], timezone: "UTC" }) }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
const order: string[] = [];
const drainOutbox = vi.fn(async () => { order.push("drain"); return { status: "ran", sent: 2, failed: 0, refused: 0, bounced: 0, recovered: { sent: 0, failed: 0 } }; });
vi.mock("@/lib/outbox/drain", () => ({ drainOutbox: (...a: unknown[]) => (drainOutbox as (...x: unknown[]) => unknown)(...a) }));
const env = { cronSecret: "s".repeat(32) as string | null };
vi.mock("@/lib/env", () => ({ readEnv: () => env }));
const { allows } = vi.hoisted(() => ({ allows: vi.fn((...a: unknown[]) => a.length > 0) }));
vi.mock("@/lib/auth/roles", async (orig) => {
  const real = await orig<typeof import("@/lib/auth/roles")>();
  allows.mockImplementation((...a: unknown[]) => (real.allows as (...x: unknown[]) => boolean)(...a));
  return { ...real, allows: (...a: unknown[]) => allows(...a) };
});

import { runChecksAction } from "@/app/admin/(console)/actions";
import { GET } from "@/app/api/cron/checks/route";

beforeEach(() => { getDb.mockReset(); runChecks.mockClear(); drainOutbox.mockClear(); order.length = 0; });

describe("runChecksAction", () => {
  it("runChecksAction refuses without a session", async () => {
    hasSession.mockResolvedValue(false);
    expect(await runChecksAction(null)).toEqual({ ok: false, message: "Your session ended. Sign in again, then try once more." });
    expect(getDb).not.toHaveBeenCalled();
    expect(runChecks).not.toHaveBeenCalled();
  });
  it("refuses an actor without the owner role", async () => {
    hasSession.mockResolvedValue(true);
    allows.mockReturnValueOnce(false);
    expect(await runChecksAction(null)).toEqual({ ok: false, message: "Your session ended. Sign in again, then try once more." });
    expect(allows).toHaveBeenLastCalledWith(expect.objectContaining({ role: "owner" }), "owner");
    expect(runChecks).not.toHaveBeenCalled();
  });
  it("lets nothing the caller sends choose the check, the period or the time", async () => {
    hasSession.mockResolvedValue(true);
    getDb.mockResolvedValue({ tag: "db" });
    const form = new FormData();
    for (const [k, v] of Object.entries({ slug: "other-app/x", period: "1999-01-01", now: "1999-01-01", checks: "[]" })) form.set(k, v);
    const before = Date.now();
    await (runChecksAction as (...a: unknown[]) => Promise<unknown>)({ ok: true, message: "", slug: "other-app/x" }, form);
    expect(runChecks).toHaveBeenCalledTimes(1);
    const [deps, now] = runChecks.mock.calls[0] as unknown as [{ db: unknown; checks: unknown[] }, Date];
    expect(deps).toEqual({ db: { tag: "db" }, kinds: new Map(), checks: [{}], timezone: "UTC" });
    expect(now.getTime()).toBeGreaterThanOrEqual(before);
  });
  it("runs the checks and says what happened", async () => {
    hasSession.mockResolvedValue(true);
    getDb.mockResolvedValue({});
    expect(await runChecksAction(null)).toEqual({ ok: true, message: "1 check ran. Nothing needs you." });
  });
});

describe("the cron route", () => {
  it("refuses a request without the secret, even past the gate", async () => {
    const res = await GET(new Request("http://localhost/api/cron/checks"));
    expect(res.status).toBe(401);
    expect(runChecks).not.toHaveBeenCalled();
    expect(drainOutbox).not.toHaveBeenCalled();
  });
  it("runs with the secret", async () => {
    getDb.mockResolvedValue({});
    const res = await GET(new Request("http://localhost/api/cron/checks", { headers: { authorization: `Bearer ${"s".repeat(32)}` } }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, paused: false, ran: 1, outbox: { status: "ran", sent: 2 } });
  });
  it("drains the outbox after the checks, with the database, the host's settings and now", async () => {
    getDb.mockResolvedValue({ tag: "db" });
    runChecks.mockImplementationOnce(async () => { order.push("checks"); return { paused: false, outcomes: [], lapsed: { closed: 0, raised: 0 } }; });
    await GET(new Request("http://localhost/api/cron/checks", { headers: { authorization: `Bearer ${"s".repeat(32)}` } }));
    expect(order).toEqual(["checks", "drain"]);
    const [db, envArg, now] = drainOutbox.mock.calls[0] as unknown as [unknown, unknown, Date];
    expect(db).toEqual({ tag: "db" });
    expect(envArg).toBe(process.env);
    expect(now).toBeInstanceOf(Date);
  });
  it("lets nothing in the request choose the check, the period or the time", async () => {
    getDb.mockResolvedValue({ tag: "db" });
    const before = Date.now();
    await GET(new Request("http://localhost/api/cron/checks?slug=other-app/x&period=1999-01-01&now=1999-01-01", { headers: { authorization: `Bearer ${"s".repeat(32)}`, "x-check": "other-app/x" } }));
    const [deps, now] = runChecks.mock.calls[0] as unknown as [{ db: unknown }, Date];
    expect(deps).toEqual({ db: { tag: "db" }, kinds: new Map(), checks: [{}], timezone: "UTC" });
    expect(now.getTime()).toBeGreaterThanOrEqual(before);
  });
  it("refuses everyone when no cron secret is set", async () => {
    env.cronSecret = null;
    try {
      for (const auth of ["Bearer ", "Bearer null", "Bearer undefined", `Bearer ${"s".repeat(32)}`]) {
        expect((await GET(new Request("http://localhost/api/cron/checks", { headers: { authorization: auth } }))).status).toBe(401);
      }
      expect(runChecks).not.toHaveBeenCalled();
      expect(drainOutbox).not.toHaveBeenCalled();
    } finally {
      env.cronSecret = "s".repeat(32);
    }
  });
  it("answers plainly when there is no database yet", async () => {
    getDb.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/cron/checks", { headers: { authorization: `Bearer ${"s".repeat(32)}` } }));
    expect(await res.json()).toEqual({ ok: true, ran: 0, reason: "no-database" });
  });
});
