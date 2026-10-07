import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { coreDb, KEY_EXT, ROOT } from "../support/db";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { writeCard } from "@/lib/data/cards";
import { listInbox, type InboxItem } from "@/lib/data/inbox";
import { draftEmail, markCopied } from "@/lib/data/outbox";
import type { Db } from "@/lib/db/types";

vi.mock("@/app/admin/(console)/command/inbox/actions", () => ({
  decideCardAction: async () => null, markDoneAction: async () => null, routeCardAction: async () => null,
  markSentByHandAction: async () => null, cancelEmailAction: async () => null, markCopiedAction: async () => ({ ok: true, message: "" }),
}));

// listInbox's options for a job that lists every waiting card (Handle what needs you at Complete), and the
// Inbox card and list as their own pieces, so a job can add a line below a card or swap the list in one line.

const T0 = new Date("2026-09-28T16:00:00Z");
const DAY = 86_400_000;

async function seed(n: number): Promise<Db> {
  const db = await coreDb();
  const kinds = await loadCardKinds(KEY_EXT);
  for (let i = 0; i < n; i++) {
    const r = await writeCard(db, kinds, { kind: "lead-new", title: `Card ${i}` }, new Date(T0.getTime() + i * 3_600_000));
    if (r.status !== "written") throw new Error("not written");
  }
  return db;
}

describe("listInbox options", () => {
  it("with no options, lists the 50 newest cards, newest first, as before", async () => {
    const db = await seed(60);
    const rows = await listInbox(db);
    expect(rows).toHaveLength(50);
    expect(rows[0].title).toBe("Card 59");
    expect(rows[49].title).toBe("Card 10");
    await db.close();
  });
  it("lists every card with limit null, oldest first, across several statuses", async () => {
    const db = await seed(60);
    await db.query("update inbox_items set status = 'decided', decision = 'approve', decided_at = now(), decided_by = 'pin:owner' where title = 'Card 1'");
    await db.query("update inbox_items set status = 'done' where title = 'Card 2'");
    const rows = await listInbox(db, null, { statuses: ["new", "decided"], oldestFirst: true });
    expect(rows).toHaveLength(59);
    expect(rows.slice(0, 3).map((r) => r.title)).toEqual(["Card 0", "Card 1", "Card 3"]);
    expect(rows.at(-1)?.title).toBe("Card 59");
    expect((await listInbox(db, 20, { status: "done" })).map((r) => r.title)).toEqual(["Card 2"]);
    await db.close();
  });
  it("keeps every email key, copied among them", async () => {
    vi.stubEnv("FOUNDATION_SECRET", "inbox-list-test-secret-of-at-least-32-chars");
    try {
      const db = await seed(1);
      const [card] = await listInbox(db);
      const d = await draftEmail(db, { to: "ada@example.com", subject: "Hi", body: "Hello.", sendKey: "k1", cardId: card.id });
      if (d.status !== "drafted") throw new Error("not drafted");
      await db.query("update outbox set status = 'approved', approved_at = $2 where id = $1", [d.id, T0]);
      await markCopied(db, d.id, T0);
      const [item] = await listInbox(db, null, { oldestFirst: true });
      expect(Object.keys(item.emails[0]).sort()).toEqual(["body", "copied", "id", "kind", "note", "send_after", "status", "subject", "to"]);
      expect(item.emails[0].copied).toBe(true);
      await db.close();
    } finally { vi.unstubAllEnvs(); }
  });
});

describe("the Inbox card and list", () => {
  const ITEM: InboxItem = {
    id: "6f1c2a4e-1b2c-4d5e-8f90-1234567890ab", kind: "contact", category: "command", subcategory: "inbox",
    title: "Ada sent a message", body: "Do you work weekends?", status: "new", always_human: false, decision: null,
    decided_at: null, created_at: new Date(T0.getTime() + DAY).toISOString(), contact_name: "Ada", contact_email: "ada@example.com", emails: [],
  };
  it("InboxCard renders one card, with an optional line below it from another job", async () => {
    const { InboxCard } = await import("@/app/admin/(console)/command/inbox/InboxCard");
    const props = { item: ITEM, timezone: "America/Los_Angeles", mode: "done" as const, routes: [], handSend: new Map() };
    const plain = renderToStaticMarkup(createElement(InboxCard, props));
    expect(plain).toContain("Ada sent a message");
    expect(plain).toContain("Mark done");
    const withLine = renderToStaticMarkup(createElement(InboxCard, { ...props, below: createElement("p", null, "Looks like a lead.") }));
    expect(withLine).toContain("Looks like a lead.");
    expect(withLine.indexOf("Looks like a lead.")).toBeGreaterThan(withLine.indexOf("Do you work weekends?"));
  });
  it("the Inbox page shows the list as one element a job can swap in one line", () => {
    const page = readFileSync(path.join(ROOT, "src/app/admin/(console)/command/inbox/page.tsx"), "utf8");
    expect(page.match(/<InboxList \/>/g)).toHaveLength(1);
    expect(page).not.toMatch(/listInbox|EmailDraft|CardActions/);
    const list = readFileSync(path.join(ROOT, "src/app/admin/(console)/command/inbox/InboxList.tsx"), "utf8");
    expect(list).toMatch(/<InboxCard /);
  });
});
