import { describe, it, expect, vi, beforeEach } from "vitest";

const getDb = vi.fn();
const storageMode = vi.fn(() => "local");
const writeContextBlock = vi.fn(async () => {});
const writeKeyName = vi.fn(async () => {});
const saveProfile = vi.fn(async () => {});
vi.mock("@/lib/db", () => ({ getDb: (...a: unknown[]) => getDb(...a), storageMode: () => storageMode() }));
vi.mock("@/lib/key/write", () => ({ keyRoot: () => "/key-root", writeContextBlock: (...a: unknown[]) => (writeContextBlock as (...x: unknown[]) => unknown)(...a), writeKeyName: (...a: unknown[]) => (writeKeyName as (...x: unknown[]) => unknown)(...a) }));
vi.mock("@/lib/data/profile", () => ({
  saveProfile: (...a: unknown[]) => (saveProfile as (...x: unknown[]) => unknown)(...a),
  PREVIEW_MESSAGE: "preview",
}));
const setPause = vi.fn(async () => ({ paused: true, reason: "", paused_at: "x", paused_by: "pin:owner" }));
vi.mock("@/lib/data/pause", () => ({
  setPause: (...a: unknown[]) => (setPause as (...x: unknown[]) => unknown)(...a),
  cleanReason: (raw: unknown) => {
    const v = typeof raw === "string" ? raw.trim() : "";
    return v.length > 200 ? { ok: false, error: "Keep the reason under 200 characters." } : { ok: true, value: v };
  },
}));
const actorRef: { value: unknown } = { value: null };
vi.mock("@/lib/auth/roles", async (orig) => {
  const real = await orig<typeof import("@/lib/auth/roles")>();
  return { ...real, get PIN_OWNER() { return actorRef.value ?? real.PIN_OWNER; } };
});
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (...a: unknown[]) => revalidatePath(...a) }));
const hasSession = vi.fn(async () => false);
vi.mock("@/lib/auth/session", () => ({ hasSession: () => hasSession() }));

import { saveProfileAction, pauseAction } from "@/app/(console)/system/settings/actions";

function form(values: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}

describe("saveProfileAction session check", () => {
  beforeEach(() => {
    getDb.mockReset();
    hasSession.mockResolvedValue(false);
  });
  it("refuses without a session, writes nothing, and keeps what was typed", async () => {
    const result = await saveProfileAction(null, form({ business: "  Harbor  ", what_we_do: "Calm work" }));
    expect(result.ok).toBe(false);
    expect(result.message).toContain("Your session ended");
    expect(result.values?.business).toBe("Harbor");
    expect(getDb).not.toHaveBeenCalled();
  });
});

describe("saveProfileAction context block", () => {
  beforeEach(() => {
    getDb.mockReset().mockResolvedValue({});
    writeContextBlock.mockClear();
    writeKeyName.mockClear();
    revalidatePath.mockClear();
    saveProfile.mockClear();
    hasSession.mockResolvedValue(true);
  });
  it("copies the working hours into the context block", async () => {
    storageMode.mockReturnValue("pglite");
    await saveProfileAction(null, form({ business: "Harbor", work_days: "Mon Tue", work_start: "09:00", work_end: "17:00" }));
    const block = (writeContextBlock.mock.calls[0] as unknown[])[1] as { work_days: string; work_start: string; work_end: string };
    expect([block.work_days, block.work_start, block.work_end]).toEqual(["mon,tue", "09:00", "17:00"]);
  });
  it("writes the context block after a successful save in pglite mode", async () => {
    storageMode.mockReturnValue("pglite");
    const r = await saveProfileAction(null, form({ business: "Harbor", owner_name: "Ann Lee" }));
    expect(r.ok).toBe(true);
    expect(writeContextBlock).toHaveBeenCalledTimes(1);
    const block = (writeContextBlock.mock.calls[0] as unknown[])[1] as { business: string; stated_by: string; owner: { first: string } };
    expect(block.business).toBe("Harbor");
    expect(block.stated_by).toBe("Ann Lee");
    expect(block.owner.first).toBe("Ann");
  });
  it("does not write it in other modes", async () => {
    storageMode.mockReturnValue("local");
    const r = await saveProfileAction(null, form({ business: "Harbor" }));
    expect(r.ok).toBe(true);
    expect(writeContextBlock).not.toHaveBeenCalled();
    expect(writeKeyName).not.toHaveBeenCalled();
  });
  it("also updates the Key name to the business name in pglite mode", async () => {
    storageMode.mockReturnValue("pglite");
    await saveProfileAction(null, form({ business: "Harbor Studio" }));
    expect(writeKeyName).toHaveBeenCalledTimes(1);
    expect(writeKeyName.mock.calls[0]).toEqual(["/key-root", "Harbor Studio"]);
  });
  it("reports the notes message when the Key name write fails", async () => {
    storageMode.mockReturnValue("pglite");
    writeKeyName.mockRejectedValueOnce(new Error("disk"));
    const r = await saveProfileAction(null, form({ business: "Harbor" }));
    expect(r.ok).toBe(true);
    expect(r.message).toContain("could not be updated this time");
    expect(saveProfile).toHaveBeenCalledTimes(1);
  });
  it("uses the key root for the write", async () => {
    storageMode.mockReturnValue("pglite");
    await saveProfileAction(null, form({ business: "Harbor" }));
    expect((writeContextBlock.mock.calls[0] as unknown[])[0]).toBe("/key-root");
  });
  it("still reports a saved profile when the Key write fails", async () => {
    storageMode.mockReturnValue("pglite");
    writeContextBlock.mockRejectedValueOnce(new Error("disk"));
    const r = await saveProfileAction(null, form({ business: "Harbor" }));
    expect(r.ok).toBe(true);
    expect(r.message).toBe("Saved. Your business notes could not be updated this time. They update on your next save.");
    expect(saveProfile).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalled();
  });
  it("keeps the failure message when the database save fails", async () => {
    storageMode.mockReturnValue("pglite");
    saveProfile.mockRejectedValueOnce(new Error("db"));
    const r = await saveProfileAction(null, form({ business: "Harbor" }));
    expect(r.ok).toBe(false);
    expect(r.message).toContain("could not save just now");
    expect(writeContextBlock).not.toHaveBeenCalled();
  });
});

describe("pauseAction", () => {
  beforeEach(() => {
    getDb.mockReset().mockResolvedValue({});
    setPause.mockClear();
    actorRef.value = null;
  });
  it("refuses without a session", async () => {
    hasSession.mockResolvedValue(false);
    const r = await pauseAction(null, form({ paused: "on" }));
    expect(r).toEqual({ ok: false, paused: false, message: "Your session ended. Sign in again, then try once more." });
    expect(getDb).not.toHaveBeenCalled();
    expect(setPause).not.toHaveBeenCalled();
  });
  it("pauses as the owner and turns back on", async () => {
    hasSession.mockResolvedValue(true);
    expect((await pauseAction(null, form({ paused: "on", reason: "Holiday" }))).message).toBe("Routines are paused. Nothing runs until you turn them back on.");
    expect((setPause.mock.calls[0] as unknown[])[1]).toEqual({ paused: true, reason: "Holiday", by: "pin:owner" });
    expect((await pauseAction(null, form({ paused: "off" }))).message).toBe("Routines are back on.");
  });
  it("refuses a reason that is too long", async () => {
    hasSession.mockResolvedValue(true);
    const r = await pauseAction(null, form({ paused: "on", reason: "x".repeat(201) }));
    expect(r.ok).toBe(false);
    expect(setPause).not.toHaveBeenCalled();
  });
  it("refuses a team actor", async () => {
    hasSession.mockResolvedValue(true);
    actorRef.value = { id: "a1", role: "team", via: "account", departments: ["sell"] };
    const r = await pauseAction(null, form({ paused: "on" }));
    expect(r).toEqual({ ok: false, paused: false, message: "Your session ended. Sign in again, then try once more." });
    expect(getDb).not.toHaveBeenCalled();
    expect(setPause).not.toHaveBeenCalled();
  });
  it("needs an explicit on or off", async () => {
    hasSession.mockResolvedValue(true);
    for (const v of [undefined, "", "yes", "ON", "true"]) {
      const r = await pauseAction(null, form(v === undefined ? {} : { paused: v }));
      expect(r.ok).toBe(false);
    }
    expect(setPause).not.toHaveBeenCalled();
  });
  it("reports the new state and records who", async () => {
    hasSession.mockResolvedValue(true);
    expect((await pauseAction(null, form({ paused: "on" }))).paused).toBe(true);
    expect((await pauseAction(null, form({ paused: "off" }))).paused).toBe(false);
    expect((setPause.mock.calls[0] as unknown[])[1]).toMatchObject({ by: "pin:owner" });
  });
});
