import { describe, it, expect } from "vitest";
import { CATEGORIES } from "@/lib/layout/categories";
import { buildNav, hrefFor, findSubcategory, activeKey } from "@/lib/layout/registry";

describe("the eleven categories", () => {
  it("are in the spec's order", () => {
    expect(CATEGORIES.map((c) => c.label)).toEqual([
      "Command", "Attract", "Sell", "Deliver", "Keep", "Money", "Team", "Plan", "Vendors and assets", "Risk", "System",
    ]);
  });
  it("carry exactly the spec's sub-categories", () => {
    const subs = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.subcategories.map((s) => s.label)]));
    expect(subs).toEqual({
      command: ["Home", "Inbox", "Alerts"],
      attract: ["Content", "Social", "Ads", "Referrals", "Events"],
      sell: ["Leads", "Pipeline", "Proposals", "Checkout", "Contracts"],
      deliver: ["Booking", "Projects", "Programs", "Orders"],
      keep: ["Support", "Client success", "Community", "Reviews"],
      money: ["Invoicing", "Books", "Bills", "Pay prep"],
      team: ["People", "Hiring", "Tasks and manual"],
      plan: ["Scorecard", "Priorities", "Reports"],
      vendors: ["Vendors", "Stock", "Equipment"],
      risk: ["Compliance", "Access", "Backups"],
      system: ["Connections", "Modules", "Setup", "Users and roles", "Settings", "Requests"],
    });
  });
  it("give every sub-category a blurb and an hours estimate", () => {
    for (const c of CATEGORIES) for (const s of c.subcategories) {
      expect(s.blurb.length).toBeGreaterThan(20);
      expect(s.hours.length).toBeGreaterThan(0);
    }
  });
  it("use URL-safe unique ids", () => {
    const keys = CATEGORIES.flatMap((c) => c.subcategories.map((s) => `${c.id}.${s.id}`));
    expect(new Set(keys).size).toBe(keys.length);
    for (const k of keys) expect(k).toMatch(/^[a-z]+\.[a-z-]+$/);
  });
});

describe("the nav", () => {
  it("maps core screens to their routes and everything else to its slot", () => {
    expect(hrefFor("command", "home")).toBe("/");
    expect(hrefFor("command", "inbox")).toBe("/command/inbox");
    expect(hrefFor("system", "setup")).toBe("/system/setup");
    expect(hrefFor("deliver", "booking")).toBe("/deliver/booking");
  });
  it("builds the Modules screen at /system/modules", () => {
    expect(hrefFor("system", "modules")).toBe("/system/modules");
    const system = buildNav().find((g) => g.id === "system")!;
    expect(system.items.find((i) => i.key === "system.modules")!.state).toBe("built");
  });
  it("marks built core screens and leaves the rest ready to set up", () => {
    const nav = buildNav();
    const command = nav.find((g) => g.id === "command")!;
    expect(command.items.find((i) => i.key === "command.home")!.state).toBe("built");
    expect(command.items.find((i) => i.key === "command.alerts")!.state).toBe("ready");
    expect(nav.find((g) => g.id === "deliver")!.items.every((i) => i.state === "ready")).toBe(true);
  });
  it("rolls badges up to the category", () => {
    const nav = buildNav({ "command.inbox": 3, "command.alerts": 2 });
    expect(nav.find((g) => g.id === "command")!.badge).toBe(5);
  });
  it("finds sub-categories and refuses unknown ones", () => {
    expect(findSubcategory("deliver", "booking")?.sub.label).toBe("Booking");
    expect(findSubcategory("deliver", "nope")).toBeUndefined();
    expect(findSubcategory("nope", "booking")).toBeUndefined();
  });
  it("picks the longest matching href as active", () => {
    const nav = buildNav();
    expect(activeKey("/", nav)).toBe("command.home");
    expect(activeKey("/command/inbox", nav)).toBe("command.inbox");
    expect(activeKey("/deliver/booking", nav)).toBe("deliver.booking");
    expect(activeKey("/elsewhere", nav)).toBeNull();
  });
});
