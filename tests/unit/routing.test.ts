import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { coreDb, extDb, KEY_EXT, ROOT } from "../support/db";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { routeCard, insertOncePerCard } from "@/lib/data/cards";
import { captureSource, sourceFields } from "@/lib/forms/source";
import { submitContact } from "@/lib/data/inbox";

const NOW = new Date("2026-10-05T16:00:00Z");
const ADA = { name: "Ada", email: "ada@example.com", phone: "", message: "Do you work weekends?" };

describe("captureSource", () => {
  it("keeps the UTM values, including utm_content, and the referring page without its query", () => {
    expect(captureSource({ utm_source: "newsletter", utm_medium: "email", utm_campaign: "fall", utm_content: "hero-button", referrer: "https://news.example/issue/9?id=42" })).toEqual({
      source: "newsletter", utm_source: "newsletter", utm_medium: "email", utm_campaign: "fall", utm_content: "hero-button", referrer: "https://news.example/issue/9",
    });
  });
  it("names the source direct or referral when nothing says otherwise", () => {
    expect(captureSource({})).toEqual({ source: "direct" });
    expect(captureSource({ referrer: "https://friend.example/" })).toEqual({ source: "referral", referrer: "https://friend.example/" });
    expect(captureSource({ source: "flyer", utm_source: "news" }).source).toBe("flyer");
  });
  it("cleans and caps what a visitor can type into the address", () => {
    const out = captureSource({ utm_source: "a\u0000b\nc", utm_campaign: "x".repeat(500), referrer: "javascript:alert(1)" });
    expect(out.utm_source).toBe("abc");
    expect(out.utm_campaign).toHaveLength(200);
    expect(out.referrer).toBeUndefined();
  });
  it("turns the page's address and referer into the hidden fields", () => {
    expect(sourceFields({ utm_source: ["ads", "x"], utm_content: "v2" }, "https://ads.example/p")).toEqual({
      source: "ads", utm_source: "ads", utm_content: "v2", referrer: "https://ads.example/p",
    });
  });
});

describe("the contact message", () => {
  it("a contact message lands as one card with its source", async () => {
    const db = await coreDb();
    await submitContact(db, ADA, { source: captureSource({ utm_source: "news", utm_content: "footer" }), now: NOW });
    const rows = await db.query("select kind, category, subcategory, title, body, meta from inbox_items");
    expect(rows).toEqual([{
      kind: "contact", category: "command", subcategory: "inbox", title: "Ada sent a message", body: "Do you work weekends?",
      meta: { source: "news", utm_source: "news", utm_content: "footer" },
    }]);
    await db.close();
  });
});

describe("routing", () => {
  it("routes a message to the owning job without changing its text", async () => {
    const db = await extDb();
    const kinds = await loadCardKinds(KEY_EXT);
    const id = await submitContact(db, ADA, { source: captureSource({ utm_source: "news" }), now: NOW });
    expect(await routeCard(db, kinds, { cardId: id, toKind: "lead-new" }, NOW)).toEqual({ status: "routed" });
    const [c] = await db.query<Record<string, unknown>>(
      "select kind, category, subcategory, title, body, meta, expires_at = $2::timestamptz as expiry_ok from inbox_items where id = $1",
      [id, new Date("2026-10-19T16:00:00Z")],
    );
    expect(c).toEqual({ kind: "lead-new", category: "sell", subcategory: "leads", title: "Ada sent a message", body: "Do you work weekends?", meta: { source: "news", utm_source: "news" }, expiry_ok: true });
    await db.close();
  });
  it("routes only a new message, and only to a declared job kind", async () => {
    const db = await extDb();
    const kinds = await loadCardKinds(KEY_EXT);
    const id = await submitContact(db, ADA, { now: NOW });
    expect(await routeCard(db, kinds, { cardId: id, toKind: "invoice-new" }, NOW)).toEqual({ status: "unknown_kind" });
    expect(await routeCard(db, kinds, { cardId: id, toKind: "check-failed" }, NOW)).toEqual({ status: "unknown_kind" });
    await routeCard(db, kinds, { cardId: id, toKind: "lead-new" }, NOW);
    expect(await routeCard(db, kinds, { cardId: id, toKind: "lead-reply" }, NOW)).toEqual({ status: "not_routable" });
    expect(await routeCard(db, kinds, { cardId: "00000000-0000-0000-0000-000000000000", toKind: "lead-new" }, NOW)).toEqual({ status: "not_found" });
    await db.close();
  });
  it("the owning job creates exactly one record per card", async () => {
    const db = await extDb();
    const id = await submitContact(db, ADA, { now: NOW });
    expect(await insertOncePerCard(db, "leads_demo", id, { contact_email: "ada@example.com", status: "new", message: "Do you work weekends?" })).toBe("inserted");
    expect(await insertOncePerCard(db, "leads_demo", id, { contact_email: "ada@example.com", status: "new", message: "again" })).toBe("exists");
    expect(await db.query("select card_id, message from leads_demo")).toEqual([{ card_id: id, message: "Do you work weekends?" }]);
    await expect(insertOncePerCard(db, "leads_demo; drop table contacts", id, {})).rejects.toBeInstanceOf(TypeError);
    await expect(insertOncePerCard(db, "leads_demo", id, { "status = 'x'": 1 })).rejects.toBeInstanceOf(TypeError);
    await db.close();
  });
  it("no public action can route a card", () => {
    // Every file a visitor can reach without a session: all of src/app outside (console), the public
    // form helper, the webhook door, the shared components, and any "use server" module outside (console). Walked from disk, so a new public
    // page or action is covered the day it lands.
    const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(e.name) ? [p] : [];
    });
    const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join("/");
    const outsideConsole = (f: string) => !f.split("/").includes("(console)");
    const app = walk(path.join(ROOT, "src/app")).map(rel).filter(outsideConsole);
    const forms = ["src/lib/forms", "src/lib/hooks", "src/components"].flatMap((d) => walk(path.join(ROOT, d))).map(rel);
    const actions = walk(path.join(ROOT, "src")).map(rel).filter(outsideConsole)
      .filter((f) => /^\s*["']use server["']/m.test(readFileSync(path.join(ROOT, f), "utf8")));
    const files = [...new Set([...app, ...forms, ...actions])];
    for (const f of ["src/app/f/actions.ts", "src/lib/forms/public.ts", "src/app/contact/page.tsx", "src/lib/hooks/receive.ts", "src/components/PublicForm.tsx"]) expect(files, f).toContain(f);
    for (const f of files) {
      expect(readFileSync(path.join(ROOT, f), "utf8"), f).not.toMatch(/routeCard|insertOncePerCard|decideCard|markCardDone|completeCard/);
    }
  });
});
