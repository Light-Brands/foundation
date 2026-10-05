import { describe, it, expect } from "vitest";
import { coreDb } from "../support/db";
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
