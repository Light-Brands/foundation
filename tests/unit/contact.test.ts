import { describe, it, expect } from "vitest";
import path from "node:path";
import { validateContact } from "@/lib/validate";
import { submitContact, listInbox, countNewInbox } from "@/lib/data/inbox";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";

const MIGRATIONS = path.join(__dirname, "../../db/migrations");

describe("validateContact", () => {
  it("accepts a complete message", () => {
    const r = validateContact({ name: " Ada ", email: "ada@example.com", message: " Hello ", website: "" });
    expect(r).toEqual({ ok: true, value: { name: "Ada", email: "ada@example.com", message: "Hello" } });
  });
  it("rejects missing fields, a bad email and oversized input", () => {
    const r = validateContact({ name: "", email: "x", message: "y".repeat(5000) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["email", "message", "name"]);
  });
  it("treats a filled honeypot as a bot", () => {
    const r = validateContact({ name: "Ada", email: "ada@example.com", message: "Hi", website: "http://spam" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.website).toBeDefined();
  });
  it("keeps HTML as plain text", () => {
    const r = validateContact({ name: "Ada", email: "ada@example.com", message: "<script>alert(1)</script>" });
    expect(r.ok && r.value.message).toBe("<script>alert(1)</script>");
  });
});

describe("the inbox", () => {
  it("files a contact submission under Command, Inbox and dedupes the contact by email", async () => {
    const db = await openPglite();
    await migrate(db, MIGRATIONS);
    await submitContact(db, { name: "Ada", email: "Ada@Example.com", message: "First" });
    await submitContact(db, { name: "Ada L.", email: "ada@example.com", message: "Second" });
    const items = await listInbox(db);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("Ada L. sent a message");
    expect(items[0].category).toBe("command");
    expect(items[0].subcategory).toBe("inbox");
    expect(items[0].body).toBe("Second");
    const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from contacts");
    expect(n).toBe(1);
    expect(await countNewInbox(db)).toBe(2);
    await db.close();
  });
  it("is empty in preview", async () => {
    expect(await listInbox(null)).toEqual([]);
    expect(await countNewInbox(null)).toBe(0);
  });
});
