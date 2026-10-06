import { describe, it, expect, vi } from "vitest";

const getDb = vi.fn();
vi.mock("@/lib/db", () => ({ getDb: (...a: unknown[]) => getDb(...a) }));
const hasSession = vi.fn(async () => false);
vi.mock("@/lib/auth/session", () => ({ hasSession: () => hasSession() }));
const upsertConnection = vi.fn(async () => {});
vi.mock("@/lib/data/connections", async (orig) => ({ ...(await orig<typeof import("@/lib/data/connections")>()), upsertConnection: (...a: unknown[]) => (upsertConnection as (...x: unknown[]) => unknown)(...a) }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
const runConnectionTest = vi.fn(async (): Promise<unknown> => ({ status: "tested", ok: true, note: "Signed in." }));
vi.mock("@/lib/connections/tester", () => ({ runConnectionTest: (...a: unknown[]) => (runConnectionTest as (...x: unknown[]) => unknown)(...a) }));
vi.mock("@/lib/data/profile", async (orig) => ({ ...(await orig<typeof import("@/lib/data/profile")>()), getProfile: async () => ({ timezone: "America/Los_Angeles" }) }));
const actorRef: { value: unknown } = { value: null };
vi.mock("@/lib/auth/roles", async (orig) => {
  const real = await orig<typeof import("@/lib/auth/roles")>();
  return { ...real, get PIN_OWNER() { return actorRef.value ?? real.PIN_OWNER; } };
});

import { saveConnectionAction, testConnectionAction } from "@/app/(console)/system/connections/actions";

const form = (v: Record<string, string>) => { const f = new FormData(); for (const [k, x] of Object.entries(v)) f.set(k, x); return f; };

describe("saveConnectionAction", () => {
  it("saveConnectionAction refuses without a session", async () => {
    hasSession.mockResolvedValue(false);
    expect((await saveConnectionAction(null, form({ service: "email-sending", door: "own" }))).ok).toBe(false);
    expect(getDb).not.toHaveBeenCalled();
    expect(upsertConnection).not.toHaveBeenCalled();
  });
  it("refuses an actor without the owner role", async () => {
    hasSession.mockResolvedValue(true);
    actorRef.value = { id: "a1", role: "team", via: "account", departments: ["sell"] };
    try {
      const r = await saveConnectionAction(null, form({ service: "email-sending", door: "own", status: "connected" }));
      expect(r.ok).toBe(false);
      expect(getDb).not.toHaveBeenCalled();
      expect(upsertConnection).not.toHaveBeenCalled();
    } finally {
      actorRef.value = null;
    }
  });
  it("refuses a key typed where its setting name goes, before opening the database", async () => {
    hasSession.mockResolvedValue(true);
    const r = await saveConnectionAction(null, form({ service: "email-sending", door: "own", status: "connected", key_setting: ["sk", "_live_", "x".repeat(24)].join("") }));
    expect(r.ok).toBe(false);
    expect(r.errors?.key_setting).toMatch(/looks like a key/);
    expect(getDb).not.toHaveBeenCalled();
  });
  it("saves a valid row", async () => {
    hasSession.mockResolvedValue(true);
    getDb.mockResolvedValue({});
    expect(await saveConnectionAction(null, form({ service: "email-sending", door: "own", status: "connected", key_setting: "RESEND_API_KEY", scopes: "send" }))).toEqual({ ok: true, message: "Saved." });
    expect(upsertConnection).toHaveBeenCalledTimes(1);
  });
});

describe("testConnectionAction", () => {
  it("refuses without a session, a team actor and a malformed name, before opening the database", async () => {
    getDb.mockReset();
    runConnectionTest.mockClear();
    hasSession.mockResolvedValue(false);
    expect((await testConnectionAction(null, form({ service: "demo-pay" }))).ok).toBe(false);
    hasSession.mockResolvedValue(true);
    actorRef.value = { id: "a1", role: "team", via: "account", departments: ["system"] };
    try {
      expect((await testConnectionAction(null, form({ service: "demo-pay" }))).ok).toBe(false);
    } finally {
      actorRef.value = null;
    }
    expect((await testConnectionAction(null, form({ service: "../demo-pay" }))).ok).toBe(false);
    expect(getDb).not.toHaveBeenCalled();
    expect(runConnectionTest).not.toHaveBeenCalled();
  });
  it("runs the test for the owner and says what it found", async () => {
    hasSession.mockResolvedValue(true);
    getDb.mockReset().mockResolvedValue({});
    runConnectionTest.mockClear();
    expect(await testConnectionAction(null, form({ service: "demo-pay" }))).toEqual({ ok: true, message: "It works. Signed in." });
    expect((runConnectionTest.mock.calls[0] as unknown[])[1]).toMatchObject({ service: "demo-pay", timezone: "America/Los_Angeles" });
    runConnectionTest.mockResolvedValueOnce({ status: "tested", ok: false, note: "The key was refused." });
    expect(await testConnectionAction(null, form({ service: "demo-pay" }))).toEqual({ ok: false, message: "It needs a look. The key was refused." });
    runConnectionTest.mockResolvedValueOnce({ status: "no_setting", message: "Set DEMO_PAY_API_KEY first, then test again." });
    expect(await testConnectionAction(null, form({ service: "demo-pay" }))).toEqual({ ok: false, message: "Set DEMO_PAY_API_KEY first, then test again." });
    getDb.mockResolvedValueOnce(null);
    expect((await testConnectionAction(null, form({ service: "demo-pay" }))).ok).toBe(false);
  });
});
