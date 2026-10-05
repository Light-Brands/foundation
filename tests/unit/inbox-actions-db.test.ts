import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { coreDb, KEY_EXT } from "../support/db";
import { writeCard } from "@/lib/data/cards";

// The actions run here against a real in-memory database. Only the session, the cache and the Key folder are stood in.
let current: Awaited<ReturnType<typeof coreDb>>;
vi.mock("@/lib/db", () => ({ getDb: async () => current, storageMode: () => "pglite" }));
vi.mock("@/lib/auth/session", () => ({ hasSession: async () => true }));
vi.mock("@/lib/data/card-kinds", async () => {
  const real = await vi.importActual<typeof import("@/lib/data/card-kinds")>("@/lib/data/card-kinds");
  return { ...real, loadCardKinds: () => real.loadCardKinds(KEY_EXT) };
});
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

import { decideCardAction, markDoneAction } from "@/app/(console)/command/inbox/actions";

const form = (v: Record<string, string>) => { const f = new FormData(); for (const [k, x] of Object.entries(v)) f.set(k, x); return f; };

describe("the inbox actions over a real database", () => {
  let id: string;
  beforeEach(async () => {
    current = await coreDb();
    const r = await writeCard(current, await (await import("@/lib/data/card-kinds")).loadCardKinds(), { kind: "lead-reply", title: "Reply to Ada" }, new Date("2026-10-05T16:00:00Z"));
    if (r.status !== "written") throw new Error("not written");
    id = r.id;
  });
  afterEach(async () => { await current.close(); });
  it("approves a card, stores the decision and refuses a second one", async () => {
    expect(await decideCardAction(null, form({ id, decision: "approve" }))).toEqual({ ok: true, message: "Approved." });
    expect(await current.query("select status, decision, decided_by from inbox_items")).toEqual([{ status: "decided", decision: "approve", decided_by: "pin:owner" }]);
    expect(await decideCardAction(null, form({ id, decision: "decline" }))).toEqual({ ok: false, message: "This card was already decided." });
  });
  it("declines a card", async () => {
    expect(await decideCardAction(null, form({ id, decision: "decline" }))).toEqual({ ok: true, message: "Declined." });
    expect(await current.query("select decision from inbox_items")).toEqual([{ decision: "decline" }]);
  });
  it("asks for a decision before it closes an approve card", async () => {
    expect(await markDoneAction(null, form({ id }))).toEqual({ ok: false, message: "Approve or decline this card first." });
    await decideCardAction(null, form({ id, decision: "approve" }));
    expect(await markDoneAction(null, form({ id }))).toEqual({ ok: true, message: "Marked done." });
    expect(await current.query("select status from inbox_items")).toEqual([{ status: "done" }]);
  });
});
