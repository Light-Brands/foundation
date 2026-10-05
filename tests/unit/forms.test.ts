import { describe, it, expect } from "vitest";
import { coreDb, KEY_EXT } from "../support/db";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { CONTACT_FORM, loadForms, readSubmission, submitPublicForm, BODY_MAX } from "@/lib/forms/public";
import type { FormDecl } from "@/lib/key/declarations";
import { FORM_LIMITS } from "@/lib/forms/limit";

const NOW = new Date("2026-10-05T16:00:00Z");
const GOOD = { _form: "get-in-touch", name: "Ada", email: "ada@example.com", phone: "503 555 0100", service: "Recovery", message: "My knee", utm_source: "news", utm_medium: "email", utm_campaign: "fall", utm_content: "hero", referrer: "https://news.example/a?x=1" };

async function deps() {
  return { db: await coreDb(), kinds: await loadCardKinds(KEY_EXT), forms: await loadForms(KEY_EXT), secret: "test-secret" };
}

describe("readSubmission", () => {
  it("reads the contact form as before", () => {
    expect(readSubmission(CONTACT_FORM, { name: " Ada ", email: "ada@example.com", message: " Hello " })).toMatchObject({
      ok: true, contact: { name: "Ada", email: "ada@example.com", phone: "" }, answers: { message: "Hello" },
    });
  });
  it("names each field that needs a look", () => {
    const r = readSubmission(CONTACT_FORM, { name: "", email: "x", phone: "abc", message: "y".repeat(5000) });
    expect(r.ok).toBe(false);
    if (!r.ok && "errors" in r) expect(Object.keys(r.errors).sort()).toEqual(["email", "message", "name", "phone"]);
  });
  it("keeps HTML as plain text", () => {
    const r = readSubmission(CONTACT_FORM, { name: "Ada", email: "ada@example.com", message: "<script>alert(1)</script>" });
    expect(r.ok && r.answers.message).toBe("<script>alert(1)</script>");
  });
  it("drops NUL and control characters a visitor sends, and keeps line breaks", () => {
    const r = readSubmission(CONTACT_FORM, { name: "A\u0000da", email: "ada@example.com", message: "one\u0000\u0007\ntwo" });
    expect(r.ok && r.contact.name).toBe("Ada");
    expect(r.ok && r.answers.message).toBe("one\ntwo");
  });
  it("refuses an oversized field or body", () => {
    const tooBig = readSubmission(CONTACT_FORM, { name: "Ada", email: "ada@example.com", message: "x", padding: "y".repeat(BODY_MAX) });
    expect(!tooBig.ok && "errors" in tooBig && tooBig.errors._form).toBe("That is more than this form can take. Please shorten it.");
    const field = readSubmission(CONTACT_FORM, { name: "A".repeat(121), email: "ada@example.com", message: "x" });
    expect(!field.ok && "errors" in field && field.errors.name).toBe("Keep this under 120 characters.");
  });
});

describe("submitPublicForm", () => {
  it("an undeclared form is not found", async () => {
    const d = await deps();
    expect(await submitPublicForm(d, { formKey: "apply-now", data: { ...GOOD, _form: "apply-now" }, clientKey: "203.0.113.9" }, NOW)).toEqual({ status: "not_found" });
    await d.db.close();
  });
  it("saves one card with its source, and the answers in plain lines", async () => {
    const d = await deps();
    const r = await submitPublicForm(d, { formKey: "get-in-touch", data: GOOD, clientKey: "203.0.113.9" }, NOW);
    expect(r.status).toBe("saved");
    const [c] = await d.db.query<Record<string, unknown>>("select kind, category, subcategory, title, body, meta from inbox_items");
    expect(c).toEqual({
      kind: "lead-new", category: "sell", subcategory: "leads", title: "Ada: Tell us what you need",
      body: "What you need: Recovery\nTell us more: My knee",
      meta: { form: "get-in-touch", source: "news", utm_source: "news", utm_medium: "email", utm_campaign: "fall", utm_content: "hero", referrer: "https://news.example/a" },
    });
    await d.db.close();
  });
  it("a filled honeypot writes nothing", async () => {
    const d = await deps();
    expect(await submitPublicForm(d, { formKey: "get-in-touch", data: { ...GOOD, website: "http://spam.example" }, clientKey: "x" }, NOW)).toEqual({ status: "discarded" });
    expect(await d.db.query("select id from inbox_items")).toEqual([]);
    expect(await d.db.query("select id from form_hits")).toEqual([]);
    await d.db.close();
  });
  it("refuses past its count", async () => {
    const d = await deps();
    for (let i = 0; i < FORM_LIMITS.perClient; i++) {
      expect((await submitPublicForm(d, { formKey: "get-in-touch", data: GOOD, clientKey: "203.0.113.9" }, NOW)).status).toBe("saved");
    }
    expect(await submitPublicForm(d, { formKey: "get-in-touch", data: GOOD, clientKey: "203.0.113.9" }, NOW)).toEqual({ status: "limited" });
    await d.db.close();
  });
  it("a resubmission never changes a stored record", async () => {
    const d = await deps();
    await submitPublicForm(d, { formKey: "get-in-touch", data: GOOD, clientKey: "a" }, NOW);
    const [first] = await d.db.query("select title, body from inbox_items");
    await submitPublicForm(d, { formKey: "get-in-touch", data: { ...GOOD, name: "Mallory", phone: "503 555 0199", message: "changed" }, clientKey: "b" }, NOW);
    expect(await d.db.query("select name, phone from contacts")).toEqual([{ name: "Ada", phone: "503 555 0100" }]);
    expect(await d.db.query("select title, body from inbox_items order by created_at, title limit 1")).toContainEqual(first);
    await d.db.close();
  });
  it("answers preview without a database and writes nothing", async () => {
    const d = await deps();
    expect(await submitPublicForm({ ...d, db: null }, { formKey: "get-in-touch", data: GOOD, clientKey: "a" }, NOW)).toEqual({ status: "preview" });
    await d.db.close();
  });
  it("the contact page uses the same helper and the core contact card", async () => {
    const d = await deps();
    const r = await submitPublicForm(d, { formKey: "contact", data: { _form: "contact", name: "Ada", email: "ada@example.com", message: "Hi" }, clientKey: "a" }, NOW);
    expect(r.status).toBe("saved");
    expect(await d.db.query("select kind, title, body from inbox_items")).toEqual([{ kind: "contact", title: "Ada sent a message", body: "Hi" }]);
    await d.db.close();
  });
});

describe("a url field", () => {
  const FORM: FormDecl = {
    ...CONTACT_FORM, key: "apply", card_kind: "lead-new", source: "leads-demo", contact: true,
    fields: [...CONTACT_FORM.fields.slice(0, 2), { key: "portfolio", label: "Portfolio link", type: "url", required: true, max: 2000, options: [] }],
  };
  const read = (portfolio: string) => readSubmission(FORM, { name: "Ada", email: "ada@example.com", portfolio });
  it("takes one https address of at most 2000 characters", () => {
    expect(read(" https://ada.example/work?x=1 ")).toMatchObject({ ok: true, answers: { portfolio: "https://ada.example/work?x=1" } });
    expect(read(`https://ada.example/${"a".repeat(2000 - 20)}`).ok).toBe(true);
  });
  it("refuses anything else", () => {
    for (const v of ["http://ada.example", "javascript:alert(1)", "ada.example", "https://", "https://user:pw@ada.example/", "https://ada.example/ a", `https://ada.example/${"a".repeat(2000)}`]) {
      const r = read(v);
      expect(r.ok, v).toBe(false);
      if (!r.ok && "errors" in r) expect(r.errors.portfolio, v).toBe(v.length > 2000 ? "Keep this under 2000 characters." : "Use a link that starts with https://.");
    }
  });
});

describe("a form with contact: false", () => {
  it("puts the name and email on the card and creates no core contact", async () => {
    const d = await deps();
    const form: FormDecl = { ...(d.forms.get("get-in-touch") as FormDecl), key: "apply", contact: false };
    const r = await submitPublicForm({ ...d, forms: new Map([["apply", form]]) }, { formKey: "apply", data: { ...GOOD, _form: "apply" }, clientKey: "203.0.113.9" }, NOW);
    expect(r.status).toBe("saved");
    expect(await d.db.query("select count(*)::int as n from contacts")).toEqual([{ n: 0 }]);
    expect(await d.db.query("select title, body, contact_id from inbox_items")).toEqual([{
      title: "Ada: Tell us what you need",
      body: "Your name: Ada\nEmail: ada@example.com\nPhone: 503 555 0100\nWhat you need: Recovery\nTell us more: My knee",
      contact_id: null,
    }]);
    await d.db.close();
  });
});
