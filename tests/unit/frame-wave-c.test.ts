import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { buildSections, buildSettings } from "@/lib/layout/sections";
import { brandCss } from "@/lib/brand/css";
import { parseBrand, DEFAULT_BRAND, SURFACES } from "@/lib/brand/tokens";

// Wave C of the frame: the rulings on wave B (the Today phone header, the breathing chamber, the Soon chip, bars that
// follow the surface style, Today's even top row, the sidebar's wrapping labels) and the whole-product pass.

let pathname = "/admin";
vi.mock("next/navigation", () => ({ usePathname: () => pathname, useSearchParams: () => new URLSearchParams() }));

const { MobileHeader } = await import("@/components/frame/MobileHeader");
const { Sidebar } = await import("@/components/frame/Sidebar");
const { TabBar } = await import("@/components/frame/TabBar");
const { TopBar } = await import("@/components/frame/TopBar");

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const text = (h: string) => h.replace(/<[^>]+>/g, " ");
const css = readFileSync("src/app/globals.css", "utf8");
const chamber = readFileSync("src/app/admin/login/chamber.module.css", "utf8");

function rule(selector: string, from = css): string {
  const at = from.indexOf(`${selector} {`);
  if (at < 0) throw new Error(`no ${selector} rule`);
  return from.slice(at, from.indexOf("}", at));
}

beforeEach(() => {
  pathname = "/admin";
});

describe("the Today phone header", () => {
  const props = (waiting: number) => ({ sections: buildSections({ "command.inbox": waiting }), settings: buildSettings(), businessName: "Harbor Studio", logoUrl: null });
  it("carries the mark on the left and an inbox button with the waiting count on the right", () => {
    const h = html(createElement(MobileHeader, props(3)));
    expect(h).toContain("HS");
    const inbox = (h.match(/<a [^>]*>/g) ?? []).find((a) => a.includes('href="/admin/command/inbox"'));
    expect(inbox).toBeDefined();
    expect(inbox).toContain('aria-label="Inbox, 3 waiting"');
    expect(inbox).toMatch(/h-11 w-11|min-h-11 min-w-11/);
    expect(text(h)).toMatch(/\b3\b/);
  });
  it("keeps the inbox button when nothing waits, with no count", () => {
    const h = html(createElement(MobileHeader, props(0)));
    const inbox = (h.match(/<a [^>]*>/g) ?? []).find((a) => a.includes('href="/admin/command/inbox"'));
    expect(inbox).toContain('aria-label="Inbox"');
    expect(text(h)).not.toMatch(/\b0\b/);
  });
  it("shows the inbox button only on Today", () => {
    pathname = "/admin/brand";
    expect(html(createElement(MobileHeader, props(3)))).not.toContain('href="/admin/command/inbox"');
  });
});

describe("the sign-in chamber", () => {
  it("breathes one slow ambient glow, scaled by motion", () => {
    const floor = rule(".floor", chamber);
    expect(floor).toMatch(/animation:[^;]*breathe[^;]*infinite/);
    expect(chamber).toMatch(/@keyframes breathe/);
    expect(chamber).toMatch(/@keyframes breathe[^}]*var\(--motion/);
  });
  it("holds still under reduced motion", () => {
    const reduced = chamber.slice(chamber.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/\.floor/);
    expect(reduced).toMatch(/animation:\s*none/);
  });
});

describe("the sidebar", () => {
  const h = (() => {
    pathname = "/admin/keep/reviews";
    return html(createElement(Sidebar, { businessName: "Harbor Studio", logoUrl: null, sections: buildSections(), settings: buildSettings(), collapsed: false, onToggle: () => {} }));
  })();
  it("sets the Soon chip at 11px", () => {
    const soon = h.match(/<span class="([^"]*)">Soon<\/span>/)?.[1] ?? "";
    expect(soon).toContain("text-[11px]");
    expect(soon).not.toContain("text-[10px]");
  });
  it("lets an entry's label wrap, so a wider face never cuts it off", () => {
    const labels = [...h.matchAll(/<a [^>]*href="\/admin\/[^"]+"[^>]*>(.*?)<\/a>/g)].map((m) => m[1]!);
    expect(labels.length).toBeGreaterThan(10);
    for (const l of labels) expect(l).not.toMatch(/<span class="[^"]*\btruncate\b[^"]*">/);
  });
});

describe("bars follow the surface style", () => {
  it("every bar wears the bar class", () => {
    const sections = buildSections();
    const settings = buildSettings();
    expect(html(createElement(TopBar, { sections, settings, chiefName: "Sage" }))).toMatch(/class="[^"]*\bbar bar-top\b/);
    expect(html(createElement(TabBar, { sections, settings, todayBadge: 0 }))).toMatch(/class="[^"]*\bbar bar-tabs\b/);
    expect(html(createElement(MobileHeader, { sections, settings, businessName: "B", logoUrl: null }))).toMatch(/class="[^"]*\bbar bar-phone\b/);
  });
  it("the bar classes read the variables the brand writes", () => {
    for (const v of ["--bar-filter", "--surface-border"]) expect(rule(".bar")).toContain(v);
    expect(rule(".bar-top")).toContain("--bar-fill-top");
    expect(rule(".bar-phone")).toContain("--bar-fill");
    expect(rule(".bar-tabs")).toContain("--bar-shadow-up");
  });
  it("each surface style writes its own bar", () => {
    const seen = new Set<string>();
    for (const surface of SURFACES) {
      const out = brandCss(parseBrand({ surface }));
      for (const v of ["--bar-fill:", "--bar-fill-top:", "--bar-filter:", "--bar-shadow:", "--bar-shadow-up:"]) expect(out, `${surface} ${v}`).toContain(v);
      seen.add((out.match(/--bar-[^;]*;/g) ?? []).join(""));
    }
    expect(seen.size).toBe(SURFACES.length);
    expect(brandCss(DEFAULT_BRAND)).toContain("--bar-filter:blur(12px);");
    expect(brandCss(parseBrand({ surface: "flat" }))).toContain("--bar-filter:none;");
  });
});

describe("Today", () => {
  const page = readFileSync("src/app/admin/(console)/page.tsx", "utf8");
  it("gives the top row's cards one height", () => {
    expect(page).not.toContain("lg:items-start");
    expect(readFileSync("src/app/admin/(console)/NeedsYouCard.tsx", "utf8")).toMatch(/className="surface[^"]*\bh-full\b/);
  });
  it("sits the business closer below the opening", () => {
    expect(page).toContain("space-y-stack-sm");
    expect(css).toMatch(/--spacing-stack-sm:\s*calc\(2rem \* var\(--density/);
  });
});

describe("the tab bar", () => {
  it("names the current tab in ink, with the accent on its icon, so the label always reads", () => {
    pathname = "/admin";
    const h = html(createElement(TabBar, { sections: buildSections(), settings: buildSettings(), todayBadge: 0 }));
    const current = (h.match(/<a [^>]*>/g) ?? []).find((a) => a.includes('aria-current="page"'))!;
    expect(current).toContain("text-admin-ink");
    expect(current).not.toMatch(/\btext-accent\b/);
    expect(h).toMatch(/<svg[^>]*text-accent/);
  });
});

describe("the whole-product pass", () => {
  const read = (p: string) => readFileSync(p, "utf8");
  it("an empty state is a calm card with a next step, never a bare line", async () => {
    const { EmptyState } = await import("@/components/frame/EmptyState");
    const h = html(createElement(EmptyState, { title: "Nothing is connected yet.", body: "Each connection appears here.", action: createElement("a", { href: "/x", className: "btn-primary" }, "See what you can add") }));
    expect(h).toMatch(/class="surface[^"]*"/);
    expect(h).toContain("btn-primary");
    for (const p of ["src/app/admin/(console)/system/connections/page.tsx", "src/app/admin/(console)/system/modules/page.tsx", "src/app/admin/(console)/command/inbox/InboxList.tsx"]) expect(read(p), p).toContain("<EmptyState");
  });
  it("keeps the inbox to a readable width, and its move menu on the shared field style", () => {
    expect(read("src/app/admin/(console)/command/inbox/InboxList.tsx")).toMatch(/max-w-4xl/);
    const actions = read("src/app/admin/(console)/command/inbox/CardActions.tsx");
    expect(actions).not.toContain("rounded-xl");
    expect(actions).toMatch(/<select[^>]*className="field/);
  });
  it("gives the Brand and Agentic hubs one primary next step", () => {
    for (const p of ["src/app/admin/(console)/brand/page.tsx", "src/app/admin/(console)/agentic/page.tsx"]) expect(read(p), p).toMatch(/action=\{[\s\S]*btn-primary/);
  });
  it("says something new on each coming page, beyond the line under its title", async () => {
    const { READY } = await import("@/lib/layout/ready");
    const { AGENTIC_PAGES, BRAND_PAGES } = await import("@/lib/layout/sections");
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, "").replace(/\band\b/g, "").replace(/\s+/g, " ").trim();
    for (const p of [...BRAND_PAGES, ...AGENTIC_PAGES]) for (const h of READY[p.id]!.holds) expect(norm(h), p.id).not.toBe(norm(p.blurb));
  });
  it("makes the next setup step's prompt the primary copy", () => {
    expect(read("src/components/PromptBox.tsx")).toContain("primary");
    expect(read("src/app/admin/(console)/system/setup/page.tsx")).toMatch(/<PromptBox[^>]*primary/);
  });
  it("lets a keyboard skip the menu and always shows where focus is", () => {
    const frame = read("src/components/frame/AdminFrame.tsx");
    expect(frame).toMatch(/href="#main"[^>]*>Skip to content/);
    expect(frame).toMatch(/<main id="main" tabIndex=\{-1\}/);
    expect(rule(".field")).toMatch(/focus-visible:ring-2/);
  });
});

describe("sign-in at a desk", () => {
  it("puts the cursor in the PIN box where there is a real keyboard, and leaves a phone's keypad in charge", () => {
    const k = readFileSync("src/app/admin/login/Keypad.tsx", "utf8");
    expect(k).toMatch(/matchMedia\("\(pointer: fine\)"\)\.matches/);
    expect(k).toMatch(/\.focus\(\)/);
    expect(k).not.toContain("autoFocus");
  });
});

describe("focus inside clipped panels", () => {
  it("draws the ring inside the sidebar's sections and the tab bar", () => {
    expect(css).toMatch(/\.focus-inset :focus-visible \{ outline-offset: -2px; \}/);
    expect(readFileSync("src/components/frame/Sidebar.tsx", "utf8")).toMatch(/<nav aria-label="Command center" className="focus-inset/);
    expect(readFileSync("src/components/frame/TabBar.tsx", "utf8")).toContain("focus-inset");
  });
});

describe("one radius and one field", () => {
  function tsx(dir: string): string[] {
    return readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? tsx(join(dir, n)) : n.endsWith(".tsx") ? [join(dir, n)] : []));
  }
  it("every rounded corner comes from the brand's radius tokens", () => {
    const stray = tsx("src").filter((f) => /\brounded-(sm|md|lg|xl|2xl|3xl)\b/.test(readFileSync(f, "utf8")));
    expect(stray).toEqual([]);
  });
  it("fields are 16px on a phone so it never zooms in, and the bars mix without a hue shift", () => {
    expect(rule(".field")).toMatch(/text-base[^;]*md:text-sm/);
    for (const b of [".bar-top", ".bar-phone", ".bar-tabs"]) expect(rule(b)).toContain("in oklab");
  });
});
