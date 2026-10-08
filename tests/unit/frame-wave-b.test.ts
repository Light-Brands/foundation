import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { buildSections, buildSettings, BRAND_PAGES, AGENTIC_PAGES } from "@/lib/layout/sections";

// Wave B of the frame: weight and entrance, the brand on the phone, the sign-in keys, relative times, the
// What needs you rows, the More actions and the ready pages. Markup only; the look is checked by eye.

let pathname = "/admin";
vi.mock("next/navigation", () => ({ usePathname: () => pathname, useSearchParams: () => new URLSearchParams() }));

const { CardTime } = await import("@/components/CardTime");
const { MobileHeader } = await import("@/components/frame/MobileHeader");
const { PageHeader } = await import("@/components/frame/PageHeader");
const { Sidebar } = await import("@/components/frame/Sidebar");
const { Keypad } = await import("@/app/admin/login/Keypad");
const { SiteActions } = await import("@/components/frame/SiteActions");
const { ReadyState } = await import("@/components/frame/ReadyState");
const { NeedsYouCard } = await import("@/app/admin/(console)/NeedsYouCard");
const { READY } = await import("@/lib/layout/ready");

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const text = (h: string) => h.replace(/<[^>]+>/g, " ");

beforeEach(() => {
  pathname = "/admin";
});

describe("card times", () => {
  const now = new Date("2026-10-07T18:00:00Z");
  it("say how long ago, with the full date in a time element", () => {
    const h = html(createElement(CardTime, { at: "2026-10-07 16:00:00+00", timezone: "America/Los_Angeles", now }));
    expect(h).toContain('<time dateTime="2026-10-07T16:00:00.000Z"');
    expect(h).toContain('title="Oct 7, 2026, 9:00 AM PDT"');
    expect(h).toContain(">2h ago</time>");
  });
  it("leave unreadable text as plain text", () => {
    expect(html(createElement(CardTime, { at: "soon", timezone: "UTC", now }))).toBe("<span>soon</span>");
  });
});

describe("the phone header", () => {
  const props = { sections: buildSections(), settings: buildSettings(), businessName: "Harbor Studio", logoUrl: null };
  it("shows the brand on a hub, since the page's own title names the tab", () => {
    pathname = "/admin/brand";
    const h = html(createElement(MobileHeader, props));
    expect(h).toContain("HS");
    expect(h).toContain("Harbor Studio");
    expect(text(h)).not.toMatch(/\bBrand\b/);
  });
  it("shows only the mark on Today, where the business name is the page title", () => {
    const h = html(createElement(MobileHeader, props));
    expect(h).toContain("HS");
    // The name is on the link for a screen reader only, so the link's name holds the mark's visible letters too.
    expect(h).toContain('<span class="sr-only">Harbor Studio</span>');
    expect(h).not.toMatch(/<a [^>]*aria-label="Harbor Studio"/);
    expect(h).not.toMatch(/truncate[^>]*>Harbor Studio/);
    expect(text(h)).not.toContain("Today");
  });
  it("keeps back and the title deeper in, aligned to the back button's width", () => {
    pathname = "/admin/keep/reviews";
    const h = html(createElement(MobileHeader, props));
    expect(h).toContain('aria-label="Back"');
    expect(h).toContain("Collect reviews");
    pathname = "/admin/brand";
    expect(html(createElement(MobileHeader, { ...props, logoUrl: "/logo.png" }))).toContain('src="/logo.png"');
  });
});

describe("entrances", () => {
  it("the page header rises first", () => {
    const h = html(createElement(PageHeader, { title: "Brand" }));
    expect(h).toMatch(/<header class="[^"]*\brise\b/);
    expect(h).toContain("--i:0");
  });
});

describe("the sidebar", () => {
  function sidebar(path: string): string {
    pathname = path;
    return html(createElement(Sidebar, { businessName: "Harbor Studio", logoUrl: null, sections: buildSections(), settings: buildSettings(), collapsed: false, onToggle: () => {} }));
  }
  it("marks the current entry and Settings with the brand's one active marker", () => {
    const current = (sidebar("/admin/keep/reviews").match(/<a [^>]*>/g) ?? []).filter((a) => a.includes('aria-current="page"'));
    expect(current[0]).toContain("nav-active");
    const settings = (sidebar("/admin/settings").match(/<a [^>]*>/g) ?? []).filter((a) => a.includes('aria-current="page"'));
    expect(settings[0]).toContain("nav-active");
    expect(settings[0]).not.toContain("bg-admin-hover text-admin-ink");
  });
  it("keeps every label at a readable size and the section icons out of the accent", () => {
    const h = sidebar("/admin/keep/reviews");
    expect(h).not.toContain("text-[9px]");
    expect(h).not.toMatch(/<svg[^>]*text-accent/);
  });
});

describe("the sign-in keys", () => {
  const h = html(createElement(Keypad, { next: "/admin" }));
  it("delete with an icon that says what it does", () => {
    expect(h).toMatch(/<button[^>]*aria-label="Delete last digit"[^>]*><svg/);
    expect(text(h)).not.toMatch(/\bBack\b/);
  });
  it("hint at the PIN in the empty box, and give every key a full tap target", () => {
    expect(h).toContain('placeholder="••••••"');
    const keys = h.match(/<button type="button"[^>]*>/g) ?? [];
    expect(keys).toHaveLength(11);
    for (const k of keys) expect(k).toContain("min-h-14");
  });
});

describe("what needs you", () => {
  const now = new Date("2026-10-07T18:00:00Z");
  const item = (n: number) => ({ id: `c${n}`, title: `Message ${n}`, created_at: "2026-10-07 16:00:00+00" });
  it("lists up to five, each a tap-sized link to its card, with a way to see all", () => {
    const h = html(createElement(NeedsYouCard, { items: [1, 2, 3, 4, 5].map(item), waiting: 7, timezone: "UTC", now }));
    const rows = (h.match(/<a [^>]*>/g) ?? []).filter((a) => a.includes("#card-"));
    expect(rows).toHaveLength(5);
    for (const r of rows) expect(r).toContain("min-h-11");
    expect(rows[0]).toContain('href="/admin/command/inbox#card-c1"');
    expect(h).toContain(">7<");
    expect(h).toMatch(/<a [^>]*href="\/admin\/command\/inbox"[^>]*>See all/);
    expect(h).toContain("<time");
    expect((h.match(/<a /g) ?? []).length).toBe((h.match(/<\/a>/g) ?? []).length);
  });
  it("sizes to what it holds and stays calm when nothing waits", () => {
    const two = html(createElement(NeedsYouCard, { items: [1, 2].map(item), waiting: 2, timezone: "UTC", now }));
    expect((two.match(/#card-/g) ?? []).length).toBe(2);
    expect(two).not.toContain("See all");
    const none = html(createElement(NeedsYouCard, { items: [], waiting: 0, timezone: "UTC", now }));
    expect(none).toContain("Nothing needs you right now.");
  });
});

describe("the More screen's site actions", () => {
  const h = html(createElement(SiteActions));
  it("are rows in one group, like the settings above them", () => {
    expect(h).toMatch(/<h2 class="kicker[^"]*">Your site<\/h2>/);
    expect(h).toMatch(/<a [^>]*href="\/"[^>]*>/);
    expect(text(h)).toContain("Check my system");
    expect(text(h)).toContain("Lock");
    expect(h).toContain("text-bad");
    expect(h).not.toContain("w-full btn");
    expect((h.match(/min-h-row/g) ?? []).length).toBe(3);
  });
});

describe("ready pages", () => {
  it("every Brand and Agentic page says what it will hold and gives a sentence to copy", () => {
    for (const p of [...BRAND_PAGES, ...AGENTIC_PAGES]) {
      const r = READY[p.id];
      expect(r, p.id).toBeDefined();
      expect(r!.holds.length, p.id).toBeGreaterThan(0);
      expect(r!.sentence, p.id).toMatch(/\.$/);
      expect([...r!.holds, r!.sentence].join(" "), p.id).not.toMatch(/[–—]/);
    }
  });
  it("renders the sentence as the page's one primary action, and marks coming pages", () => {
    const ready = html(createElement(ReadyState, { page: BRAND_PAGES.find((p) => p.id === "offers")! }));
    expect(ready).toContain("What this page will hold");
    expect(ready).toContain("btn-primary");
    expect(ready).not.toContain("Coming soon");
    const soon = html(createElement(ReadyState, { page: AGENTIC_PAGES.find((p) => p.id === "routines")! }));
    expect(soon).toContain("Coming soon");
  });
});
