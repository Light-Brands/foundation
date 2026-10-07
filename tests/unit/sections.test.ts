import { describe, it, expect } from "vitest";
import { CATEGORIES } from "@/lib/layout/categories";
import {
  buildSections, buildSettings, activeEntry, findOwnPage,
  SECTION_DEPARTMENTS, SETTINGS_DEPARTMENTS, BRAND_PAGES, AGENTIC_PAGES,
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
