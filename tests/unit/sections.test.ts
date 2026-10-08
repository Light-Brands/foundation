import { describe, it, expect } from "vitest";
import { CATEGORIES } from "@/lib/layout/categories";
import {
  buildSections, buildSettings, activeEntry, findOwnPage, TABS, tabFor, mobileBar,
  SECTION_DEPARTMENTS, SETTINGS_DEPARTMENTS, BRAND_PAGES, AGENTIC_PAGES, breadcrumb, entryLabel,
} from "@/lib/layout/sections";

describe("the six sections", () => {
  it("come in order", () => {
    expect(buildSections().map((s) => s.label)).toEqual(["Command center", "Brand", "Agentic", "Grow", "Serve", "Run"]);
  });
  it("place every department exactly once, with Settings and Security behind the gear", () => {
    const placed = [...Object.values(SECTION_DEPARTMENTS).flat(), ...SETTINGS_DEPARTMENTS];
    expect([...placed].sort()).toEqual(CATEGORIES.map((c) => c.id).sort());
    expect(new Set(placed).size).toBe(placed.length);
    expect(SETTINGS_DEPARTMENTS).toEqual(["system", "risk"]);
  });
  it("group the departments by stage", () => {
    const grow = buildSections().find((s) => s.id === "grow")!;
    expect(grow.headings.map((h) => h.label)).toEqual(["Marketing", "Sales"]);
    const run = buildSections().find((s) => s.id === "run")!;
    expect(run.headings.map((h) => h.label)).toEqual(["Finance", "People", "Leadership", "Operations"]);
  });
  it("keep every job's label and route", () => {
    const sales = buildSections().find((s) => s.id === "grow")!.headings[1];
    expect(sales.entries.map((e) => e.label)).toEqual(["Capture leads", "Follow up and close", "Send proposals", "Take payment", "Sign contracts"]);
    expect(sales.entries[0].href).toBe("/admin/sell/leads");
  });
  it("give Brand its pages and its Assets folder", () => {
    const brand = buildSections().find((s) => s.id === "brand")!;
    expect(brand.headings.map((h) => h.label)).toEqual(["", "Assets"]);
    expect(brand.headings[0].entries.map((e) => e.label)).toEqual(["Overview", "Identity", "Story and voice", "Offers", "Audience", "Proof"]);
    expect(brand.headings[1].entries.map((e) => e.label)).toEqual(["Library", "Upload", "Brand kit", "From my website", "Generate", "Rights"]);
    expect(brand.headings[0].entries[1].href).toBe("/admin/brand/identity");
  });
  it("give Agentic its team first, with Recipes and the whole Routines folder coming soon", () => {
    const agentic = buildSections().find((s) => s.id === "agentic")!;
    expect(agentic.headings.map((h) => h.label)).toEqual(["", "Routines"]);
    expect(agentic.headings[0].entries.map((e) => [e.label, e.state])).toEqual([["Agents", "ready"], ["Skills", "ready"], ["Recipes", "soon"]]);
    expect(agentic.headings[1].entries.map((e) => [e.label, e.state])).toEqual([["Routines", "soon"], ["Runs", "soon"], ["Workflows", "soon"], ["Weaves", "soon"]]);
  });
  it("put Settings first and Security second behind the gear", () => {
    const settings = buildSettings();
    expect(settings.map((h) => h.label)).toEqual(["Settings", "Security"]);
    expect(settings[1].entries.map((e) => e.label)).toEqual(["Stay compliant", "Control access", "Back up your data"]);
  });
  it("roll badges up to the section", () => {
    expect(buildSections({ "command.inbox": 3 }).find((s) => s.id === "command")!.badge).toBe(3);
  });
  it("find the active entry, longest match first", () => {
    const sections = buildSections();
    const settings = buildSettings();
    expect(activeEntry("/admin", sections, settings)).toBe("command.home");
    expect(activeEntry("/admin/command/inbox", sections, settings)).toBe("command.inbox");
    expect(activeEntry("/admin/brand/identity", sections, settings)).toBe("brand.identity");
    expect(activeEntry("/admin/system/setup", sections, settings)).toBe("system.setup");
    expect(activeEntry("/somewhere", sections, settings)).toBeNull();
  });
  it("find a section's own page and refuse unknown ones", () => {
    expect(findOwnPage("brand", "offers")?.label).toBe("Offers");
    expect(findOwnPage("agentic", "recipes")?.state).toBe("soon");
    expect(findOwnPage("brand", "nope")).toBeUndefined();
    expect(BRAND_PAGES.every((p) => p.blurb.length > 20)).toBe(true);
    expect(AGENTIC_PAGES.every((p) => p.blurb.length > 20)).toBe(true);
  });
});

describe("the phone tabs", () => {
  const sections = buildSections();
  const settings = buildSettings();
  it("are Today, Brand, Business, Agentic and More", () => {
    expect(TABS.map((t) => [t.label, t.href])).toEqual([
      ["Today", "/admin"], ["Brand", "/admin/brand"], ["Business", "/admin/business"], ["Agentic", "/admin/agentic"], ["More", "/admin/more"],
    ]);
  });
  it("light the tab that owns the screen", () => {
    expect(tabFor("/admin", sections, settings)).toBe("today");
    expect(tabFor("/admin/command/inbox", sections, settings)).toBe("today");
    expect(tabFor("/admin/brand", sections, settings)).toBe("brand");
    expect(tabFor("/admin/brand/offers", sections, settings)).toBe("brand");
    expect(tabFor("/admin/business", sections, settings)).toBe("business");
    expect(tabFor("/admin/sell/leads", sections, settings)).toBe("business");
    expect(tabFor("/admin/money/books", sections, settings)).toBe("business");
    expect(tabFor("/admin/agentic/skills", sections, settings)).toBe("agentic");
    expect(tabFor("/admin/more", sections, settings)).toBe("more");
    expect(tabFor("/admin/settings", sections, settings)).toBe("more");
    expect(tabFor("/admin/system/setup", sections, settings)).toBe("more");
    expect(tabFor("/admin/risk/backups", sections, settings)).toBe("more");
  });
  it("title every screen and point back to its tab", () => {
    expect(mobileBar("/admin", sections, settings)).toEqual({ title: "Today", back: null, hub: "today" });
    expect(mobileBar("/admin/business", sections, settings)).toEqual({ title: "Business", back: null, hub: "business" });
    expect(mobileBar("/admin/command/inbox", sections, settings)).toEqual({ title: "Handle what needs you", back: "/admin", hub: null });
    expect(mobileBar("/admin/brand/identity", sections, settings)).toEqual({ title: "Identity", back: "/admin/brand", hub: null });
    expect(mobileBar("/admin/sell/leads", sections, settings)).toEqual({ title: "Capture leads", back: "/admin/business?stage=grow", hub: null });
    expect(mobileBar("/admin/keep/reviews", sections, settings)).toEqual({ title: "Collect reviews", back: "/admin/business?stage=serve", hub: null });
    expect(mobileBar("/admin/system/setup", sections, settings)).toEqual({ title: "Set up", back: "/admin/more", hub: null });
    expect(mobileBar("/admin/settings", sections, settings)).toEqual({ title: "Settings", back: "/admin/more", hub: null });
  });
});

describe("the desktop breadcrumb", () => {
  const sections = buildSections();
  const settings = buildSettings();
  it("names the section and the page", () => {
    expect(breadcrumb("/admin", sections, settings)).toEqual(["Command center", "See your day"]);
    expect(breadcrumb("/admin/keep/reviews", sections, settings)).toEqual(["Serve", "Collect reviews"]);
    expect(breadcrumb("/admin/brand/identity", sections, settings)).toEqual(["Brand", "Identity"]);
    expect(breadcrumb("/admin/system/settings", sections, settings)).toEqual(["Settings", "Preferences"]);
  });
  it("names a hub in one word", () => {
    expect(breadcrumb("/admin/business", sections, settings)).toEqual(["Business"]);
    expect(breadcrumb("/admin/settings", sections, settings)).toEqual(["Settings"]);
  });
});

describe("entry labels", () => {
  it("say the job, its state and anything waiting", () => {
    const e = { key: "x", label: "Collect reviews", blurb: "", href: "/", badge: 0 };
    expect(entryLabel({ ...e, state: "built" })).toBe("Collect reviews, running");
    expect(entryLabel({ ...e, state: "ready" })).toBe("Collect reviews, ready to set up");
    expect(entryLabel({ ...e, state: "soon" })).toBe("Collect reviews, coming soon");
    expect(entryLabel({ ...e, state: "built", badge: 3 })).toBe("Collect reviews, running, 3 waiting");
  });
});
