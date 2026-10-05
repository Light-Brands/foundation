import { describe, it, expect, vi, beforeEach } from "vitest";

const getDb = vi.fn();
const storageMode = vi.fn(() => "local");
const writeContextBlock = vi.fn(async () => {});
const saveProfile = vi.fn(async () => {});
vi.mock("@/lib/db", () => ({ getDb: (...a: unknown[]) => getDb(...a), storageMode: () => storageMode() }));
vi.mock("@/lib/key/write", () => ({ writeContextBlock: (...a: unknown[]) => (writeContextBlock as (...x: unknown[]) => unknown)(...a) }));
vi.mock("@/lib/data/profile", () => ({
  saveProfile: (...a: unknown[]) => (saveProfile as (...x: unknown[]) => unknown)(...a),
  PREVIEW_MESSAGE: "preview",
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
const hasSession = vi.fn(async () => false);
vi.mock("@/lib/auth/session", () => ({ hasSession: () => hasSession() }));

import { saveProfileAction } from "@/app/(console)/system/settings/actions";

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
    saveProfile.mockClear();
    hasSession.mockResolvedValue(true);
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
  });
  it("returns the existing error message when the write fails", async () => {
    storageMode.mockReturnValue("pglite");
    writeContextBlock.mockRejectedValueOnce(new Error("disk"));
    const r = await saveProfileAction(null, form({ business: "Harbor" }));
    expect(r.ok).toBe(false);
    expect(r.message).toContain("could not save");
  });
});
