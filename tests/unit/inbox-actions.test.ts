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
const routeCard = vi.fn(async () => ({ status: "routed" }));
vi.mock("@/lib/data/cards", () => ({ routeCard: (...a: unknown[]) => (routeCard as (...x: unknown[]) => unknown)(...a) }));
vi.mock("@/lib/data/card-kinds", () => ({ loadCardKinds: async () => new Map([["lead-new", { kind: "lead-new", label: "New lead" }]]) }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
const markSentByHand = vi.fn(async (): Promise<string> => "sent");
const cancelEmail = vi.fn(async () => true);
const markCopied = vi.fn(async () => true);
vi.mock("@/lib/data/connections", () => ({ emailSendingActive: async () => false }));
vi.mock("@/lib/data/outbox", () => ({
  markSentByHand: (...a: unknown[]) => (markSentByHand as (...x: unknown[]) => unknown)(...a),
  cancelEmail: (...a: unknown[]) => (cancelEmail as (...x: unknown[]) => unknown)(...a),
  markCopied: (...a: unknown[]) => (markCopied as (...x: unknown[]) => unknown)(...a),
}));

import { cancelEmailAction, decideCardAction, markCopiedAction, markDoneAction, markSentByHandAction, routeCardAction } from "@/app/(console)/command/inbox/actions";

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

describe("routeCardAction", () => {
  it("routeCardAction refuses without a session", async () => {
    hasSession.mockResolvedValue(false);
    getDb.mockReset();
    expect((await routeCardAction(null, form({ id: ID, to: "lead-new" }))).ok).toBe(false);
    expect(getDb).not.toHaveBeenCalled();
    expect(routeCard).not.toHaveBeenCalled();
  });
  it("refuses a malformed kind before opening the database", async () => {
    hasSession.mockResolvedValue(true);
    getDb.mockReset();
    expect((await routeCardAction(null, form({ id: ID, to: "Lead New" }))).ok).toBe(false);
    expect(getDb).not.toHaveBeenCalled();
  });
  it("moves a message and names the job it went to", async () => {
    hasSession.mockResolvedValue(true);
    getDb.mockReset().mockResolvedValue({});
    routeCard.mockClear();
    expect(await routeCardAction(null, form({ id: ID, to: "lead-new" }))).toEqual({ ok: true, message: "Moved to New lead." });
    expect((routeCard.mock.calls[0] as unknown[])[2]).toEqual({ cardId: ID, toKind: "lead-new" });
  });
  it("falls back to plain words for a kind with no label, and explains each refusal", async () => {
    hasSession.mockResolvedValue(true);
    getDb.mockReset().mockResolvedValue({});
    expect(await routeCardAction(null, form({ id: ID, to: "lead-other" }))).toEqual({ ok: true, message: "Moved to its job." });
    routeCard.mockResolvedValueOnce({ status: "not_routable" });
    expect(await routeCardAction(null, form({ id: ID, to: "lead-new" }))).toEqual({ ok: false, message: "Only a new message can be moved." });
    routeCard.mockResolvedValueOnce({ status: "unknown_kind" });
    expect(await routeCardAction(null, form({ id: ID, to: "lead-new" }))).toEqual({ ok: false, message: "That job is not installed." });
  });
});

describe("markCopiedAction", () => {
  it("refuses without a session, and a malformed id before opening the database", async () => {
    hasSession.mockResolvedValue(false);
    getDb.mockReset();
    markCopied.mockClear();
    expect((await markCopiedAction(ID)).ok).toBe(false);
    hasSession.mockResolvedValue(true);
    expect((await markCopiedAction("x' or 1=1")).ok).toBe(false);
    expect(getDb).not.toHaveBeenCalled();
    expect(markCopied).not.toHaveBeenCalled();
  });
  it("records the copy, and refuses one for an email that is not waiting", async () => {
    hasSession.mockResolvedValue(true);
    getDb.mockReset().mockResolvedValue({});
    expect(await markCopiedAction(ID)).toEqual({ ok: true, message: "Copied. Send it from your email, then mark it sent." });
    markCopied.mockResolvedValueOnce(false);
    expect(await markCopiedAction(ID)).toEqual({ ok: false, message: "This email is not waiting to be sent." });
  });
});

describe("markSentByHandAction", () => {
  it("refuses without a session, and a malformed id before opening the database", async () => {
    hasSession.mockResolvedValue(false);
    getDb.mockReset();
    expect(await markSentByHandAction(null, form({ id: ID }))).toEqual({ ok: false, message: "Your session ended. Sign in again, then try once more." });
    hasSession.mockResolvedValue(true);
    expect((await markSentByHandAction(null, form({ id: "x' or 1=1" }))).ok).toBe(false);
    expect(getDb).not.toHaveBeenCalled();
    expect(markSentByHand).not.toHaveBeenCalled();
  });
  it("records an email the owner sent by hand", async () => {
    hasSession.mockResolvedValue(true);
    getDb.mockResolvedValue({});
    expect(await markSentByHandAction(null, form({ id: ID }))).toEqual({ ok: true, message: "Marked as sent." });
    markSentByHand.mockResolvedValueOnce("not_waiting");
    expect(await markSentByHandAction(null, form({ id: ID }))).toEqual({ ok: false, message: "This email is not waiting to be sent." });
    markSentByHand.mockResolvedValueOnce("opted_out");
    expect(await markSentByHandAction(null, form({ id: ID }))).toEqual({ ok: false, message: "This person asked us to stop." });
  });
});

describe("cancelEmailAction", () => {
  it("refuses without a session", async () => {
    hasSession.mockResolvedValue(false);
    getDb.mockReset();
    expect((await cancelEmailAction(null, form({ id: ID }))).ok).toBe(false);
    expect(cancelEmail).not.toHaveBeenCalled();
  });
  it("stops an email that has not started sending, and says when it is too late", async () => {
    hasSession.mockResolvedValue(true);
    getDb.mockResolvedValue({});
    expect(await cancelEmailAction(null, form({ id: ID }))).toEqual({ ok: true, message: "This email will not be sent." });
    cancelEmail.mockResolvedValueOnce(false);
    expect(await cancelEmailAction(null, form({ id: ID }))).toEqual({ ok: false, message: "This email is already sending or sent, so it cannot be stopped." });
  });
});
