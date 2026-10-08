import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { buildSections, buildSettings } from "@/lib/layout/sections";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/context", useSearchParams: () => new URLSearchParams() }));
const { Sidebar } = await import("@/components/frame/Sidebar");
const { TabBar } = await import("@/components/frame/TabBar");

const badges = { "command.inbox": 3 };

describe("waiting cards show wherever the owner looks", () => {
  it("a collapsed sidebar marks a section with waiting cards, and says how many", () => {
    const html = renderToStaticMarkup(createElement(Sidebar, { businessName: "Harbor Studio", logoUrl: null, sections: buildSections(badges), settings: buildSettings(badges), collapsed: true, onToggle: () => {} }));
    const button = /<button[^>]*title="Command center"[^>]*>[\s\S]*?<\/button>/.exec(html)?.[0] ?? "";
    expect(button).toContain("data-badge-dot");
    expect(button).toMatch(/aria-label="Command center, 3 waiting"/);
  });
  it("the phone's Today tab names its count in the link, and the dot is decoration", () => {
    const html = renderToStaticMarkup(createElement(TabBar, { sections: buildSections(badges), settings: buildSettings(badges), todayBadge: 3 }));
    expect(html).toMatch(/<a[^>]*aria-label="Today, 3 waiting"/);
    expect(html).toMatch(/<span[^>]*aria-hidden="true"[^>]*class="absolute/);
  });
});
