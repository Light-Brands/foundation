import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { buildSections, buildSettings } from "@/lib/layout/sections";

// The frame's states, as markup: what a screen reader hears for each job, which link says "you are here",
// and where the Set up card's form sits. Styling is checked by eye; these are the parts a person relies on.

let pathname = "/admin";
vi.mock("next/navigation", () => ({ usePathname: () => pathname, useSearchParams: () => new URLSearchParams() }));
vi.mock("@/app/admin/(console)/actions", () => ({ runChecksAction: async () => null }));

const { Sidebar } = await import("@/components/frame/Sidebar");
const { SectionHub } = await import("@/components/frame/SectionHub");
const { PageHeader } = await import("@/components/frame/PageHeader");
const { SetupCard } = await import("@/app/admin/(console)/SetupCard");
const { Doors } = await import("@/components/Doors");
const BusinessHub = (await import("@/app/admin/(console)/business/page")).default;

function sidebar(path: string): string {
  pathname = path;
  return renderToStaticMarkup(createElement(Sidebar, {
    businessName: "Harbor Studio", logoUrl: null, sections: buildSections(), settings: buildSettings(), collapsed: false, onToggle: () => {},
  }));
}

function anchors(html: string): string[] {
  return html.match(/<a [^>]*>/g) ?? [];
}

beforeEach(() => {
  pathname = "/admin";
});

describe("sidebar", () => {
  it("marks only the open job as the current page", () => {
    const current = anchors(sidebar("/admin/keep/reviews")).filter((a) => a.includes('aria-current="page"'));
    expect(current).toHaveLength(1);
    expect(current[0]).toContain('href="/admin/keep/reviews"');
  });

  it("marks Settings current inside Settings, and nothing else", () => {
    const current = anchors(sidebar("/admin/settings")).filter((a) => a.includes('aria-current="page"'));
    expect(current).toHaveLength(1);
    expect(current[0]).toContain('href="/admin/settings"');
  });

  it("names each job with its state", () => {
    const html = sidebar("/admin");
    expect(html).toContain('See your day<span class="sr-only">, running</span>');
    expect(html).toContain('Collect reviews<span class="sr-only">, ready to set up</span>');
    expect(html).toContain('Recipes<span class="sr-only">, coming soon</span>');
    // A link's name is its visible text plus these words, so no aria-label can drop part of what is on screen.
    expect(html).not.toMatch(/<a [^>]*aria-label=/);
  });

  it("sets group headings as kickers, never in the heading face", () => {
    const h3 = sidebar("/admin/keep/reviews").match(/<h3 [^>]*>/g) ?? [];
    expect(h3.length).toBeGreaterThan(0);
    for (const h of h3) expect(h).toMatch(/class="kicker/);
  });
});

describe("section hub", () => {
  const serve = buildSections().find((s) => s.id === "serve")!;
  const html = renderToStaticMarkup(createElement(SectionHub, { headings: serve.headings }));

  it("says each job's state in words and in a dot", () => {
    expect(html).toContain('Collect reviews<span class="sr-only">, ready to set up</span>');
    expect(html).toContain("data-state=\"ready\"");
    const agentic = buildSections().find((s) => s.id === "agentic")!;
    const soon = renderToStaticMarkup(createElement(SectionHub, { headings: agentic.headings }));
    expect(soon).toContain('Recipes<span class="sr-only">, coming soon</span>');
    const command = buildSections().find((s) => s.id === "command")!;
    const running = renderToStaticMarkup(createElement(SectionHub, { headings: command.headings }));
    expect(running).toContain('See your day<span class="sr-only">, running</span>');
    expect(running).toContain("data-state=\"built\"");
  });

  it("shows each job's blurb for the desktop cards", () => {
    expect(html).toContain("testimonials kept with consent");
  });

  it("sets its group headings as kickers", () => {
    for (const h of html.match(/<h2 [^>]*>/g) ?? []) expect(h).toMatch(/class="kicker/);
  });
});

describe("business hub", () => {
  it("marks the chosen stage with aria-current, without tab roles that have no panel", async () => {
    const html = renderToStaticMarkup(await BusinessHub({ searchParams: Promise.resolve({ stage: "serve" }) }));
    expect(html).not.toContain('role="tab"');
    expect(html).not.toContain('role="tablist"');
    const current = anchors(html).filter((a) => a.includes('aria-current="page"'));
    expect(current).toHaveLength(1);
    expect(current[0]).toContain("stage=serve");
  });
});

describe("page header", () => {
  it("gives every page one title class, with an optional kicker, lede and action", () => {
    const html = renderToStaticMarkup(createElement(PageHeader, {
      kicker: "Customer care", title: "Collect reviews", lede: "Reviews asked for.", action: createElement("button", null, "Do it"),
    }));
    expect(html).toMatch(/<h1 class="page-title[^"]*">Collect reviews<\/h1>/);
    expect(html).toContain('class="kicker"');
    expect(html).toContain("Reviews asked for.");
    expect(html).toContain("<button>Do it</button>");
    const bare = renderToStaticMarkup(createElement(PageHeader, { title: "Settings" }));
    expect(bare).not.toContain("kicker");
  });
});

describe("set up card", () => {
  const html = renderToStaticMarkup(createElement(SetupCard, { done: 2, total: 8, next: "Vercel", showChecks: true }));

  it("holds the checks form in its footer, never inside a link", () => {
    expect(html).toContain("<form");
    expect(html).toContain("Run today&#x27;s checks");
    const beforeForm = html.slice(0, html.indexOf("<form"));
    expect((beforeForm.match(/<a /g) ?? []).length).toBe((beforeForm.match(/<\/a>/g) ?? []).length);
    expect(html.indexOf("Checks run on their own every 15 minutes")).toBeLessThan(html.indexOf("<form"));
  });

  it("links its title to setup and shows progress", () => {
    expect(html).toMatch(/<a [^>]*href="\/admin\/system\/setup"/);
    expect(html).toContain('style="width:25%"');
    expect(html).toContain("Vercel");
  });

  it("leaves the checks out when there is no database", () => {
    const preview = renderToStaticMarkup(createElement(SetupCard, { done: 0, total: 8, next: "Vercel", showChecks: false }));
    expect(preview).not.toContain("<form");
  });
});

describe("doors", () => {
  const html = renderToStaticMarkup(createElement(Doors, { categoryId: "keep", subId: "reviews", subLabel: "Collect reviews", hasEntry: false }));

  it("recommends the install door and gives it the one primary button", () => {
    const doors = html.split('data-door="').slice(1);
    expect(doors).toHaveLength(3);
    expect(doors[1]).toContain("Recommended");
    expect(doors[1]).toContain("btn-primary");
    expect(doors[0]).not.toContain("btn-primary");
    expect(doors[2]).not.toContain("btn-primary");
    expect(doors[2]).toContain("btn-quiet");
  });

  it("speaks plainly, without dashes", () => {
    const text = html.replace(/<[^>]+>/g, " ");
    expect(text).not.toMatch(/[–—]/);
    expect(text).not.toMatch(/trickier|coming dictionary updates/);
  });
});
