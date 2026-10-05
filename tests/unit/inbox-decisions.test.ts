import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { copyFileSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { coreDb, CORE_MIGRATIONS, KEY_EXT } from "../support/db";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { writeCard } from "@/lib/data/cards";
import { completeCard, decideCard, listInbox, markCardDone } from "@/lib/data/inbox";
import { PIN_OWNER, type Actor } from "@/lib/auth/roles";
import { cancelEmail, draftEmail } from "@/lib/data/outbox";

const NOW = new Date("2026-10-05T16:00:00Z");
const TEAM_SALES: Actor = { id: "acct-1", role: "team", via: "account", departments: ["sell"] };
const TEAM_MONEY: Actor = { id: "acct-2", role: "team", via: "account", departments: ["money"] };

async function setup() {
  const db = await coreDb();
  const kinds = await loadCardKinds(KEY_EXT);
  const card = async (kind: string) => {
    const r = await writeCard(db, kinds, { kind, title: `A ${kind} card` }, NOW);
    if (r.status !== "written") throw new Error("not written");
    return r.id;
  };
  return { db, kinds, card };
}

describe("deciding a card", () => {
  it("records the decision once and moves the card to decided", async () => {
    const { db, kinds, card } = await setup();
    const id = await card("lead-reply");
    expect(await decideCard(db, kinds, { cardId: id, decision: "approve", actor: PIN_OWNER }, NOW)).toEqual({ status: "decided" });
    const [row] = await db.query("select status, decision, decided_by from inbox_items where id = $1", [id]);
    expect(row).toEqual({ status: "decided", decision: "approve", decided_by: "pin:owner" });
    await db.close();
  });
  it("a decided card cannot be decided again", async () => {
    const { db, kinds, card } = await setup();
    const id = await card("lead-reply");
    await decideCard(db, kinds, { cardId: id, decision: "approve", actor: PIN_OWNER }, NOW);
    expect(await decideCard(db, kinds, { cardId: id, decision: "decline", actor: PIN_OWNER }, NOW)).toEqual({ status: "already_decided" });
    const [row] = await db.query("select decision from inbox_items where id = $1", [id]);
    expect(row).toEqual({ decision: "approve" });
    await db.close();
  });
  it("the database refuses to rewrite a decision", async () => {
    const { db, kinds, card } = await setup();
    const id = await card("lead-reply");
    await decideCard(db, kinds, { cardId: id, decision: "approve", actor: PIN_OWNER }, NOW);
    await expect(db.query("update inbox_items set decision = 'decline' where id = $1", [id])).rejects.toThrow(/written once/);
    await db.close();
  });
  it("keeps an always human card for the owner", async () => {
    const { db, kinds, card } = await setup();
    const id = await card("discount-ask");
    expect(await decideCard(db, kinds, { cardId: id, decision: "approve", actor: TEAM_SALES }, NOW)).toEqual({ status: "owner_only" });
    const reply = await card("lead-reply");
    expect(await decideCard(db, kinds, { cardId: reply, decision: "approve", actor: TEAM_MONEY }, NOW)).toEqual({ status: "not_allowed" });
    expect(await decideCard(db, kinds, { cardId: reply, decision: "approve", actor: TEAM_SALES }, NOW)).toEqual({ status: "decided" });
    expect(await decideCard(db, kinds, { cardId: id, decision: "decline", actor: PIN_OWNER }, NOW)).toEqual({ status: "decided" });
    expect(await markCardDone(db, kinds, { cardId: id, actor: TEAM_SALES })).toEqual({ status: "owner_only" });
    await db.close();
  });
  it("only decides what asks for a decision", async () => {
    const { db, kinds, card } = await setup();
    const id = await card("lead-new");
    expect(await decideCard(db, kinds, { cardId: id, decision: "approve", actor: PIN_OWNER }, NOW)).toEqual({ status: "not_decidable" });
    expect(await decideCard(db, kinds, { cardId: "00000000-0000-0000-0000-000000000000", decision: "approve", actor: PIN_OWNER }, NOW)).toEqual({ status: "not_found" });
    await db.close();
  });
});

describe("closing a card", () => {
  it("marks a done card done, once", async () => {
    const { db, kinds, card } = await setup();
    const id = await card("lead-new");
    expect(await markCardDone(db, kinds, { cardId: id, actor: PIN_OWNER })).toEqual({ status: "done" });
    expect(await markCardDone(db, kinds, { cardId: id, actor: PIN_OWNER })).toEqual({ status: "already_done" });
    await db.close();
  });
  it("never closes a card that waits for a decision", async () => {
    const { db, kinds, card } = await setup();
    const id = await card("lead-reply");
    expect(await markCardDone(db, kinds, { cardId: id, actor: PIN_OWNER })).toEqual({ status: "needs_decision" });
    await db.close();
  });
  it("lets the owning job finish a decided card, and nothing else", async () => {
    const { db, kinds, card } = await setup();
    const open = await card("lead-reply");
    expect(await completeCard(db, open)).toBe(false);
    await decideCard(db, kinds, { cardId: open, decision: "approve", actor: PIN_OWNER }, NOW);
    expect(await completeCard(db, open)).toBe(true);
    const [row] = await db.query("select status, decision from inbox_items where id = $1", [open]);
    expect(row).toEqual({ status: "done", decision: "approve" });
    await db.close();
  });
  it("lists only the cards with a status when asked", async () => {
    const { db, kinds, card } = await setup();
    const a = await card("lead-new");
    await card("lead-new");
    await markCardDone(db, kinds, { cardId: a, actor: PIN_OWNER });
    expect((await listInbox(db, 10, { status: "new" })).length).toBe(1);
    expect((await listInbox(db, 10)).length).toBe(2);
    await db.close();
  });
});

describe("the decisions migration", () => {
  it("keeps every existing card valid", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "mig-"));
    for (const f of readdirSync(CORE_MIGRATIONS).filter((f) => f < "0007")) copyFileSync(path.join(CORE_MIGRATIONS, f), path.join(dir, f));
    const db = await openPglite();
    await migrate(db, dir, "core");
    await db.query("insert into inbox_items (kind, category, subcategory, title, status) values ('contact', 'command', 'inbox', 'Old new', 'new'), ('contact', 'command', 'inbox', 'Old done', 'done')");
    await migrate(db, CORE_MIGRATIONS, "core");
    expect(await db.query("select title, status, decision from inbox_items order by title")).toEqual([
      { title: "Old done", status: "done", decision: null },
      { title: "Old new", status: "new", decision: null },
    ]);
    await db.query("update inbox_items set status = 'decided', decision = 'approve', decided_at = now(), decided_by = 'pin:owner' where title = 'Old new'");
    await expect(db.query("update inbox_items set status = 'archived' where title = 'Old done'")).rejects.toThrow();
    await db.close();
  });
});

describe("the words a refusal gets", () => {
  it("a done kind card that is already done is not called decided", async () => {
    const { db, kinds, card } = await setup();
    const id = await card("lead-new");
    await markCardDone(db, kinds, { cardId: id, actor: PIN_OWNER });
    expect(await decideCard(db, kinds, { cardId: id, decision: "approve", actor: PIN_OWNER }, NOW)).toEqual({ status: "not_decidable" });
    await db.close();
  });
  it("a team member from another department hears that a decision is needed first", async () => {
    const { db, kinds, card } = await setup();
    const id = await card("lead-reply");
    expect(await markCardDone(db, kinds, { cardId: id, actor: TEAM_MONEY })).toEqual({ status: "needs_decision" });
    await db.close();
  });
});

describe("the decision and its drafted email", () => {
  beforeEach(() => { vi.stubEnv("FOUNDATION_SECRET", "decision-test-secret"); });
  afterEach(() => { vi.unstubAllEnvs(); });
  async function cardWithDraft() {
    const s = await setup();
    const id = await s.card("lead-reply");
    const d = await draftEmail(s.db, { to: "ada@example.com", subject: "Re: your question", body: "Yes, we work weekends.", sendKey: `leads/${id}/reply`, cardId: id });
    if (d.status !== "drafted") throw new Error("not drafted");
    return { ...s, id, draftId: d.id };
  }
  it("approving a card approves its drafted email in the same statement", async () => {
    const { db, kinds, id } = await cardWithDraft();
    await decideCard(db, kinds, { cardId: id, decision: "approve", actor: PIN_OWNER }, NOW);
    expect(await db.query("select status, approved_at is not null as stamped from outbox")).toEqual([{ status: "approved", stamped: true }]);
    await db.close();
  });
  it("declining a card cancels its drafted email", async () => {
    const { db, kinds, id } = await cardWithDraft();
    await decideCard(db, kinds, { cardId: id, decision: "decline", actor: PIN_OWNER }, NOW);
    expect(await db.query("select status from outbox")).toEqual([{ status: "cancelled" }]);
    await db.close();
  });
  it("approving a card approves only the drafts still at draft", async () => {
    const { db, kinds, id, draftId } = await cardWithDraft();
    const second = await draftEmail(db, { to: "ada@example.com", subject: "A reminder", body: "See you soon.", sendKey: `leads/${id}/remind`, cardId: id });
    if (second.status !== "drafted") throw new Error("not drafted");
    expect(await cancelEmail(db, second.id, NOW)).toBe(true);
    await decideCard(db, kinds, { cardId: id, decision: "approve", actor: PIN_OWNER }, NOW);
    const status = async (x: string) => (await db.query<{ status: string }>("select status from outbox where id = $1", [x]))[0].status;
    expect(await status(draftId)).toBe("approved");
    expect(await status(second.id)).toBe("cancelled");
    await db.close();
  });
  it("the card and its outbox row change together or not at all", async () => {
    const { db, kinds, id } = await cardWithDraft();
    await db.query("alter table outbox add constraint refuse_approval check (status <> 'approved')");
    await expect(decideCard(db, kinds, { cardId: id, decision: "approve", actor: PIN_OWNER }, NOW)).rejects.toThrow();
    expect(await db.query("select status, decision from inbox_items where id = $1", [id])).toEqual([{ status: "new", decision: null }]);
    expect(await db.query("select status from outbox")).toEqual([{ status: "draft" }]);
    await db.close();
  });
  it("an owner closing a decided card leaves its approved email to send", async () => {
    const { db, kinds, id } = await cardWithDraft();
    await decideCard(db, kinds, { cardId: id, decision: "approve", actor: PIN_OWNER }, NOW);
    await markCardDone(db, kinds, { cardId: id, actor: PIN_OWNER });
    expect(await db.query("select status from outbox")).toEqual([{ status: "approved" }]);
    await db.close();
  });
  it("shows every draft on its card, oldest first", async () => {
    const { db, id } = await cardWithDraft();
    await draftEmail(db, { to: "ada@example.com", subject: "A reminder", body: "See you soon.", sendKey: `leads/${id}/remind`, cardId: id, kind: "marketing", sendAfter: new Date("2026-10-06T16:00:00Z") });
    const [item] = (await listInbox(db)).filter((i) => i.id === id);
    expect(item.emails).toEqual([
      { id: expect.any(String), to: "ada@example.com", subject: "Re: your question", body: "Yes, we work weekends.", status: "draft", kind: "transactional", send_after: null, note: "" },
      { id: expect.any(String), to: "ada@example.com", subject: "A reminder", body: "See you soon.", status: "draft", kind: "marketing", send_after: expect.stringMatching(/^2026-10-06/), note: "" },
    ]);
    const other = await setup();
    const plain = await other.card("lead-new");
    expect((await listInbox(other.db)).find((i) => i.id === plain)?.emails).toEqual([]);
    await other.db.close();
    await db.close();
  });
});
