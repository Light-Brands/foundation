import { describe, it, expect } from "vitest";
import { CATEGORIES } from "@/lib/layout/categories";
import {
  buildSections, buildSettings, activeEntry, findOwnPage, TABS, tabFor, mobileBar,
  SECTION_DEPARTMENTS, SETTINGS_DEPARTMENTS, CONTEXT_PAGES, AGENTIC_PAGES, breadcrumb, entryState, hubOwner,
} from "@/lib/layout/sections";

describe("the six sections", () => {
  it("come in order", () => {
    expect(buildSections().map((s) => s.label)).toEqual(["Command center", "Context", "Agentic", "Grow", "Serve", "Run"]);
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
  it("put every page in a labeled group", () => {
    for (const s of buildSections()) for (const h of s.headings) expect(h.label, `${s.id} heading`).not.toBe("");
  });
  it("give Context its Brand and Assets groups", () => {
    const c = buildSections().find((s) => s.id === "context")!;
    expect(c.headings.map((h) => h.label)).toEqual(["Brand", "Assets"]);
    expect(c.headings[0].entries.map((e) => e.label)).toEqual(["Overview", "Identity", "Story and voice", "Offers", "Audience", "Proof"]);
    expect(c.headings[1].entries.map((e) => e.label)).toEqual(["Library", "Upload", "Brand kit", "From my website", "Generate", "Rights"]);
    expect(c.headings[0].entries[2].href).toBe("/admin/context/story");
  });
  it("give Agentic its four groups", () => {
    const a = buildSections().find((s) => s.id === "agentic")!;
    expect(a.headings.map((h) => h.label)).toEqual(["Agents", "Skills", "Recipes", "Routines"]);
    expect(a.headings[0].entries.map((e) => e.label)).toEqual(["Your team", "Chief of staff", "Department leads", "Specialists", "Build crew"]);
    expect(a.headings[1].entries.map((e) => e.label)).toEqual(["Your skills", "Voice and writing", "Research", "Numbers", "Tools"]);
    expect(a.headings[2].entries.map((e) => e.label)).toEqual(["Library", "Quick wins", "Department kits", "Your recipes"]);
    expect(a.headings[3].entries.map((e) => e.label)).toEqual(["Routines", "Runs", "Workflows", "Weaves"]);
    expect(a.headings[0].entries[0].state).toBe("ready");
    expect(a.headings[0].entries[1].state).toBe("soon");
  });
  it("labels Command center's group Today", () => {
    expect(buildSections().find((s) => s.id === "command")!.headings[0].label).toBe("Today");
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
    expect(activeEntry("/admin/context/identity", sections, settings)).toBe("context.identity");
    expect(activeEntry("/admin/system/setup", sections, settings)).toBe("system.setup");
    expect(activeEntry("/somewhere", sections, settings)).toBeNull();
  });
  it("find a section's own page and refuse unknown ones", () => {
    expect(findOwnPage("context", "offers")?.label).toBe("Offers");
    expect(findOwnPage("agentic", "recipes")?.state).toBe("soon");
    expect(findOwnPage("context", "nope")).toBeUndefined();
    expect(CONTEXT_PAGES.every((p) => p.blurb.length > 20)).toBe(true);
    expect(AGENTIC_PAGES.every((p) => p.blurb.length > 20)).toBe(true);
  });
});

describe("the phone tabs", () => {
  const sections = buildSections();
  const settings = buildSettings();
  it("are Today, Context, Business, Agentic and More", () => {
    expect(TABS.map((t) => [t.label, t.href])).toEqual([
      ["Today", "/admin"], ["Context", "/admin/context"], ["Business", "/admin/business"], ["Agentic", "/admin/agentic"], ["More", "/admin/more"],
    ]);
  });
  it("light the tab that owns the screen", () => {
    expect(tabFor("/admin", sections, settings)).toBe("today");
    expect(tabFor("/admin/command/inbox", sections, settings)).toBe("today");
    expect(tabFor("/admin/context", sections, settings)).toBe("context");
    expect(tabFor("/admin/context/offers", sections, settings)).toBe("context");
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
    expect(mobileBar("/admin/context/identity", sections, settings)).toEqual({ title: "Identity", back: "/admin/context", hub: null });
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
    expect(breadcrumb("/admin/context/identity", sections, settings)).toEqual(["Context", "Identity"]);
    expect(breadcrumb("/admin/system/settings", sections, settings)).toEqual(["Settings", "Preferences"]);
  });
  it("names a hub in one word", () => {
    expect(breadcrumb("/admin/business", sections, settings)).toEqual(["Business"]);
    expect(breadcrumb("/admin/settings", sections, settings)).toEqual(["Settings"]);
  });
});

describe("entry states", () => {
  it("say the job's state in words, for a screen reader to hear after its name", () => {
    const e = { key: "x", label: "Collect reviews", blurb: "", href: "/", badge: 0 };
    expect(entryState({ ...e, state: "built" })).toBe("running");
    expect(entryState({ ...e, state: "ready" })).toBe("ready to set up");
    expect(entryState({ ...e, state: "soon" })).toBe("coming soon");
  });
});

describe("the sidebar's owner on a hub", () => {
  it("opens and marks the section a hub belongs to", () => {
    expect(hubOwner("/admin/context", null)).toBe("context");
    expect(hubOwner("/admin/agentic", null)).toBe("agentic");
    expect(hubOwner("/admin/business", null)).toBe("grow");
    expect(hubOwner("/admin/business", "serve")).toBe("serve");
    expect(hubOwner("/admin/business", "run")).toBe("run");
    expect(hubOwner("/admin/business", "nonsense")).toBe("grow");
  });
  it("names no owner on Today, More, or a page", () => {
    for (const p of ["/admin", "/admin/more", "/admin/settings", "/admin/sell/leads", "/admin/context/identity"]) expect(hubOwner(p, null), p).toBe("");
  });
});
