import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { coreDb, KEY_EXT, ROOT } from "../support/db";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { writeCard, UnknownCardKindError, type CardInput } from "@/lib/data/cards";

const NOW = new Date("2026-10-05T16:00:00Z");
const count = async (db: Awaited<ReturnType<typeof coreDb>>, table: string) =>
  (await db.query<{ n: number }>(`select count(*)::int as n from ${table}`))[0].n;

describe("writeCard", () => {
  it("files a declared kind under its own department and job, with its expiry", async () => {
    const db = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    const r = await writeCard(db, kinds, { kind: "lead-new", title: "Ada asked about pricing", body: "Hi", sourceApp: "leads-demo", sourceId: "r1", meta: { utm_source: "news" } }, NOW);
    expect(r.status).toBe("written");
    const [c] = await db.query<Record<string, unknown>>(
      "select kind, category, subcategory, always_human, source_app, source_id, meta, expires_at = $1::timestamptz as expiry_ok from inbox_items",
      [new Date("2026-10-19T16:00:00Z")],
    );
    expect(c).toEqual({ kind: "lead-new", category: "sell", subcategory: "leads", always_human: false, source_app: "leads-demo", source_id: "r1", meta: { utm_source: "news" }, expiry_ok: true });
    await db.close();
  });
  it("writes at most one card for a run key", async () => {
    const db = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    const first = await writeCard(db, kinds, { kind: "lead-waiting", title: "2 leads waiting", runKey: "lead-watch/new-leads:2026-10-05" }, NOW);
    const second = await writeCard(db, kinds, { kind: "lead-waiting", title: "3 leads waiting", runKey: "lead-watch/new-leads:2026-10-05" }, NOW);
    expect(second).toEqual({ status: "exists", id: first.status === "written" ? first.id : null });
    expect(await count(db, "inbox_items")).toBe(1);
    await db.close();
  });
  it("refuses a kind the Key does not declare and writes nothing", async () => {
    const db = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    await expect(writeCard(db, kinds, { kind: "invoice-overdue", title: "x" }, NOW)).rejects.toBeInstanceOf(UnknownCardKindError);
    expect(await count(db, "inbox_items")).toBe(0);
    await db.close();
  });
  it("never takes a category from the caller", async () => {
    const db = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    await writeCard(db, kinds, { kind: "lead-new", title: "x", category: "money", subcategory: "invoicing", always_human: true } as CardInput, NOW);
    const [c] = await db.query("select category, subcategory, always_human from inbox_items");
    expect(c).toEqual({ category: "sell", subcategory: "leads", always_human: false });
    await db.close();
  });
  it("marks an always human kind and leaves a kind with no expiry open", async () => {
    const db = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    await writeCard(db, kinds, { kind: "discount-ask", title: "Ada asked for 20 percent off" }, NOW);
    const [c] = await db.query("select always_human, expires_at from inbox_items");
    expect(c).toEqual({ always_human: true, expires_at: null });
    await db.close();
  });
  it("creates or reuses the contact in the same statement, never rewriting it", async () => {
    const db = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    await writeCard(db, kinds, { kind: "lead-new", title: "One", contact: { name: "Ada", email: "ada@example.com", phone: "503 555 0100" } }, NOW);
    await writeCard(db, kinds, { kind: "lead-new", title: "Two", contact: { name: "Ada L.", email: "ADA@example.com", phone: "503 555 0199" } }, NOW);
    expect(await count(db, "contacts")).toBe(1);
    expect(await db.query("select name, phone from contacts")).toEqual([{ name: "Ada", phone: "503 555 0100" }]);
    const linked = await db.query<{ n: number }>("select count(*)::int as n from inbox_items where contact_id is not null");
    expect(linked[0].n).toBe(2);
    await db.close();
  });
  it("refuses oversized input", async () => {
    const db = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    await expect(writeCard(db, kinds, { kind: "lead-new", title: "x".repeat(201) }, NOW)).rejects.toBeInstanceOf(RangeError);
    await expect(writeCard(db, kinds, { kind: "lead-new", title: "x", meta: { big: "y".repeat(9000) } }, NOW)).rejects.toBeInstanceOf(RangeError);
    await expect(writeCard(db, kinds, { kind: "lead-new", title: "" }, NOW)).rejects.toBeInstanceOf(RangeError);
    await db.close();
  });
});

describe("the card's time", () => {
  it("takes the database's clock when none is given, so cards keep the order they were written", async () => {
    const db = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    await writeCard(db, kinds, { kind: "lead-new", title: "first" });
    await writeCard(db, kinds, { kind: "lead-new", title: "second" });
    const rows = await db.query<{ title: string; window_ok: boolean }>(
      "select title, expires_at = created_at + interval '14 days' as window_ok from inbox_items order by created_at desc, title");
    expect(rows).toEqual([{ title: "second", window_ok: true }, { title: "first", window_ok: true }]);
    await db.close();
  });
});

describe("the Key travels with the deployed app", () => {
  it("next.config.ts traces key/ for Vercel", () => {
    expect(readFileSync(path.join(ROOT, "next.config.ts"), "utf8")).toContain('"./key/**/*"');
  });
});
