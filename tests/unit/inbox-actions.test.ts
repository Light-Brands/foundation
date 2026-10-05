import { describe, it, expect, vi, beforeEach } from "vitest";

const getDb = vi.fn();
vi.mock("@/lib/db", () => ({ getDb: (...a: unknown[]) => getDb(...a), storageMode: () => "pglite" }));
const hasSession = vi.fn(async () => false);
vi.mock("@/lib/auth/session", () => ({ hasSession: () => hasSession() }));
const decideCard = vi.fn(async () => ({ status: "decided" }));
const markCardDone = vi.fn(async () => ({ status: "done" }));
vi.mock("@/lib/data/inbox", () => ({
  decideCard: (...a: unknown[]) => (decideCard as (...x: unknown[]) => unknown)(...a),
  markCardDone: (...a: unknown[]) => (markCardDone as (...x: unknown[]) => unknown)(...a),
}));
vi.mock("@/lib/data/card-kinds", () => ({ loadCardKinds: async () => new Map() }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

import { decideCardAction, markDoneAction } from "@/app/(console)/command/inbox/actions";

const ID = "6f1c2a4e-1b2c-4d5e-8f90-1234567890ab";
const form = (v: Record<string, string>) => { const f = new FormData(); for (const [k, x] of Object.entries(v)) f.set(k, x); return f; };

describe("decideCardAction", () => {
  beforeEach(() => { getDb.mockReset().mockResolvedValue({}); decideCard.mockClear(); });
  it("refuses without a session", async () => {
    hasSession.mockResolvedValue(false);
    expect(await decideCardAction(null, form({ id: ID, decision: "approve" }))).toEqual({ ok: false, message: "Your session ended. Sign in again, then try once more." });
    expect(getDb).not.toHaveBeenCalled();
    expect(decideCard).not.toHaveBeenCalled();
  });
  it("refuses a malformed card id or decision before opening the database", async () => {
    hasSession.mockResolvedValue(true);
    expect((await decideCardAction(null, form({ id: "x' or 1=1", decision: "approve" }))).ok).toBe(false);
    expect((await decideCardAction(null, form({ id: ID, decision: "maybe" }))).ok).toBe(false);
    expect(getDb).not.toHaveBeenCalled();
  });
  it("decides as the owner and says so", async () => {
    hasSession.mockResolvedValue(true);
    expect(await decideCardAction(null, form({ id: ID, decision: "decline" }))).toEqual({ ok: true, message: "Declined." });
    expect((decideCard.mock.calls[0] as unknown[])[2]).toMatchObject({ cardId: ID, decision: "decline", actor: { id: "pin:owner", role: "owner" } });
  });
  it("explains a refusal in plain words", async () => {
    hasSession.mockResolvedValue(true);
    decideCard.mockResolvedValueOnce({ status: "owner_only" });
    expect((await decideCardAction(null, form({ id: ID, decision: "approve" }))).message).toBe("Only the owner can decide this card.");
    decideCard.mockResolvedValueOnce({ status: "already_decided" });
    expect((await decideCardAction(null, form({ id: ID, decision: "approve" }))).message).toBe("This card was already decided.");
  });
});

describe("markDoneAction", () => {
  it("refuses without a session", async () => {
    hasSession.mockResolvedValue(false);
    getDb.mockReset();
    expect((await markDoneAction(null, form({ id: ID }))).ok).toBe(false);
    expect(getDb).not.toHaveBeenCalled();
  });
  it("marks a card done", async () => {
    hasSession.mockResolvedValue(true);
    getDb.mockResolvedValue({});
    expect(await markDoneAction(null, form({ id: ID }))).toEqual({ ok: true, message: "Marked done." });
  });
});
