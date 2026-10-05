import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { coreDb, KEY_EXT, ROOT } from "../support/db";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { writeCard, UnknownCardKindError, type CardInput } from "@/lib/data/cards";
import type { Queryable } from "@/lib/db/types";
import { registryFrom } from "@/lib/data/card-kinds";
import { CORE_CARD_KINDS } from "@/lib/key/core-kinds";

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

describe("card input bounds", () => {
  // One database for the group: every refusal must leave it empty, so it is safe to share.
  let db: Awaited<ReturnType<typeof coreDb>>;
  beforeAll(async () => { db = await coreDb(); });
  afterAll(async () => { await db.close(); });
  const refused = async (input: Partial<CardInput> & Record<string, unknown>, type: ErrorConstructor = RangeError) => {
    const kinds = await loadCardKinds(KEY_EXT);
    let err: unknown;
    try { await writeCard(db, kinds, { kind: "lead-new", title: "x", ...input } as CardInput, NOW); } catch (e) { err = e; }
    expect(err).toBeInstanceOf(type);
    expect((err as Error).message).not.toMatch(/[\u2013\u2014;]/);
    expect(await count(db, "inbox_items")).toBe(0);
    expect(await count(db, "contacts")).toBe(0);
  };
  const ada = { name: "Ada", email: "ada@example.com" };
  it("bounds the source app and source id", async () => {
    await refused({ sourceApp: "" });
    await refused({ sourceApp: "x".repeat(201) });
    await refused({ sourceApp: "has space" });
    await refused({ sourceId: "" });
    await refused({ sourceId: "y".repeat(201) });
    await refused({ sourceId: "a\nb" });
  });
  it("bounds the contact", async () => {
    await refused({ contact: { ...ada, name: "" } });
    await refused({ contact: { ...ada, name: "n".repeat(201) } });
    await refused({ contact: { ...ada, email: "" } });
    await refused({ contact: { ...ada, email: "not-an-email" } });
    await refused({ contact: { ...ada, email: `${"a".repeat(320)}@example.com` } });
    await refused({ contact: { ...ada, phone: "" } });
    await refused({ contact: { ...ada, phone: "1".repeat(41) } });
  });
  it("takes a contact id only in uuid shape", async () => {
    await refused({ contactId: "not-a-uuid" });
  });
  it("refuses a contact together with a contact id", async () => {
    await refused({ contact: ada, contactId: "6f1c2a4e-1b2c-4d5e-8f90-1234567890ab" }, TypeError);
  });
  it("limits the body and the run key", async () => {
    await refused({ body: "b".repeat(20_001) });
    await refused({ runKey: "" });
    await refused({ runKey: "r".repeat(201) });
  });
  it("trims the title first, then refuses an empty one", async () => {
    await refused({ title: "   " });
    const own = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    await writeCard(own, kinds, { kind: "lead-new", title: "  Ada asked  " }, NOW);
    expect(await own.query("select title from inbox_items")).toEqual([{ title: "Ada asked" }]);
    await own.close();
  });
  it("refuses a NUL character with a RangeError, never a driver error", async () => {
    await refused({ title: "a\u0000b" });
    await refused({ body: "a\u0000b" });
    await refused({ meta: { note: "a\u0000b" } });
    await refused({ contact: { ...ada, name: "A\u0000da" } });
  });
  it("refuses a title that is not text", async () => {
    await refused({ title: 42 as unknown as string }, TypeError);
    await refused({ title: undefined as unknown as string }, TypeError);
  });
});

describe("core kinds through the writer", () => {
  it("gives a check-failed card its seven day expiry, and takes a contact card", async () => {
    const db = await coreDb();
    const kinds = registryFrom(CORE_CARD_KINDS);
    await writeCard(db, kinds, { kind: "check-failed", title: "A check could not run" }, NOW);
    const [c] = await db.query("select category, subcategory, expires_at = $1::timestamptz as expiry_ok from inbox_items where kind = 'check-failed'", [new Date("2026-10-12T16:00:00Z")]);
    expect(c).toEqual({ category: "command", subcategory: "alerts", expiry_ok: true });
    const r = await writeCard(db, kinds, { kind: "contact", title: "Ada sent a message", contact: { name: "Ada", email: "ada@example.com" } }, NOW);
    expect(r.status).toBe("written");
    expect(await db.query("select category, subcategory, expires_at from inbox_items where kind = 'contact'")).toEqual([{ category: "command", subcategory: "inbox", expires_at: null }]);
    await db.close();
  });
});

describe("a run key that already has its card", () => {
  it("leaves the stored contact alone, even with a new name and phone", async () => {
    const db = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    const key = "lead-watch/new-leads:2026-10-05";
    await writeCard(db, kinds, { kind: "lead-waiting", title: "One", runKey: key, contact: { name: "Ada", email: "ada@example.com", phone: "503" } }, NOW);
    const again = await writeCard(db, kinds, { kind: "lead-waiting", title: "Two", runKey: key, contact: { name: "Other", email: "ada@example.com", phone: "999" } }, NOW);
    expect(again.status).toBe("exists");
    expect(await count(db, "inbox_items")).toBe(1);
    expect(await db.query("select name, phone from contacts")).toEqual([{ name: "Ada", phone: "503" }]);
    await db.close();
  });
});

describe("writing inside a transaction", () => {
  it("leaves no card behind when the transaction fails", async () => {
    const db = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    const tx: Queryable = { query: (sql, params) => db.query(sql, params) };
    await db.query("begin");
    try {
      await writeCard(tx, kinds, { kind: "lead-new", title: "Inside", contact: { name: "Ada", email: "ada@example.com" } }, NOW);
      expect(await count(db, "inbox_items")).toBe(1);
      throw new Error("the drafts failed");
    } catch {
      await db.query("rollback");
    }
    expect(await count(db, "inbox_items")).toBe(0);
    expect(await count(db, "contacts")).toBe(0);
    await db.close();
  });
});

describe("an empty registry", () => {
  it("says the Key's declarations could not be read", async () => {
    const db = await coreDb();
    await expect(writeCard(db, new Map(), { kind: "lead-new", title: "x" }, NOW)).rejects.toThrow(/could not be read/);
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
