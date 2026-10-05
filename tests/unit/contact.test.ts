import { describe, it, expect } from "vitest";
import path from "node:path";
import { validateContact, cleanPhone } from "@/lib/validate";
import { submitContact, listInbox, countNewInbox } from "@/lib/data/inbox";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";

const MIGRATIONS = path.join(__dirname, "../../core/db/migrations");

describe("validateContact", () => {
  it("accepts a complete message", () => {
    const r = validateContact({ name: " Ada ", email: "ada@example.com", message: " Hello ", website: "" });
    expect(r).toEqual({ ok: true, value: { name: "Ada", email: "ada@example.com", phone: "", message: "Hello" } });
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
  it("files a contact submission in the Inbox (Command center, Handle what needs you) and dedupes the contact by email", async () => {
    const db = await openPglite();
    await migrate(db, MIGRATIONS, "core");
    await submitContact(db, { name: "Ada", email: "Ada@Example.com", phone: "", message: "First" });
    await submitContact(db, { name: "Ada L.", email: "ada@example.com", phone: "", message: "Second" });
    const items = await listInbox(db);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("Ada L. sent a message");
    expect(items[0].category).toBe("command");
    expect(items[0].subcategory).toBe("inbox");
    expect(items[0].body).toBe("Second");
    const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from contacts");
    expect(n).toBe(1);
    const [{ name }] = await db.query<{ name: string }>("select name from contacts");
    expect(name).toBe("Ada");
    expect(await countNewInbox(db)).toBe(2);
    await db.close();
  });
  it("is atomic: a failed inbox insert leaves no contact behind", async () => {
    const db = await openPglite();
    await migrate(db, MIGRATIONS, "core");
    await db.query("alter table inbox_items add constraint reject_boom check (title <> 'Boom sent a message')");
    await expect(submitContact(db, { name: "Boom", email: "boom@example.com", phone: "", message: "x" })).rejects.toThrow();
    const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from contacts");
    expect(n).toBe(0);
    await db.close();
  });
  it("is empty in preview", async () => {
    expect(await listInbox(null)).toEqual([]);
    expect(await countNewInbox(null)).toBe(0);
  });
});

describe("cleanPhone", () => {
  it("accepts a blank phone and common formats", () => {
    expect(cleanPhone("")).toEqual({ ok: true, value: "" });
    expect(cleanPhone("  +1 (503)   555-0100 ")).toEqual({ ok: true, value: "+1 (503) 555-0100" });
    expect(cleanPhone("503.555.0100")).toEqual({ ok: true, value: "503.555.0100" });
    expect(cleanPhone(undefined)).toEqual({ ok: true, value: "" });
  });
  it("refuses letters, too few or too many digits, and oversized input", () => {
    for (const bad of ["call me", "555 01", "1234567890123456", "1".repeat(41), "503 555 0100 ext 2"]) {
      expect(cleanPhone(bad).ok, bad).toBe(false);
    }
  });
  it("refuses a bad phone in a contact message", () => {
    const r = validateContact({ name: "Ada", email: "ada@example.com", phone: "nope", message: "Hi" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.phone).toBe("Add a phone number with 7 to 15 digits, or leave it blank.");
  });
});

describe("a contact's phone", () => {
  it("keeps the phone on the contact a first message creates", async () => {
    const db = await openPglite();
    await migrate(db, MIGRATIONS, "core");
    await submitContact(db, { name: "Ada", email: "ada@example.com", phone: "+1 (503) 555-0100", message: "Hi" });
    const [c] = await db.query<{ phone: string }>("select phone from contacts");
    expect(c.phone).toBe("+1 (503) 555-0100");
    await db.close();
  });
  it("never rewrites a stored phone from a later message", async () => {
    const db = await openPglite();
    await migrate(db, MIGRATIONS, "core");
    await submitContact(db, { name: "Ada", email: "ada@example.com", phone: "503 555 0100", message: "One" });
    await submitContact(db, { name: "Ada", email: "ADA@example.com", phone: "503 555 0199", message: "Two" });
    await submitContact(db, { name: "Ada", email: "ada@example.com", phone: "", message: "Three" });
    const rows = await db.query<{ phone: string }>("select phone from contacts");
    expect(rows).toEqual([{ phone: "503 555 0100" }]);
    await db.close();
  });
});
