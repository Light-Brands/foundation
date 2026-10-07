import { describe, it, expect } from "vitest";
import { CATEGORIES } from "@/lib/layout/categories";
import { buildNav, hrefFor, findSubcategory, activeKey } from "@/lib/layout/registry";

describe("the eleven categories", () => {
  it("are in the spec's order", () => {
    expect(CATEGORIES.map((c) => c.label)).toEqual([
      "Command center", "Marketing", "Sales", "Delivery", "Customer care", "Finance", "People", "Leadership", "Operations", "Protection", "Settings",
    ]);
  });
  it("carry exactly the spec's sub-categories", () => {
    const subs = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.subcategories.map((s) => s.label)]));
    expect(subs).toEqual({
      command: ["See your day", "Handle what needs you", "Get alerted"],
      attract: ["Create content", "Post on social", "Run ads", "Get referrals", "Host events"],
      sell: ["Capture leads", "Follow up and close", "Send proposals", "Take payment", "Sign contracts"],
      deliver: ["Book appointments", "Run projects", "Run programs", "Fulfill orders"],
      keep: ["Answer customers", "Keep clients happy", "Run a community", "Collect reviews"],
      money: ["Invoice and collect", "Keep the books", "Pay bills", "Prepare payroll"],
      team: ["Manage your team", "Hire", "Assign work"],
      plan: ["Track your numbers", "Set priorities", "Get reports"],
      vendors: ["Manage suppliers", "Track stock", "Maintain equipment"],
      risk: ["Stay compliant", "Control access", "Back up your data"],
      system: ["Connect your tools", "Add capabilities", "Set up", "Users", "Preferences", "Requests"],
    });
    expect(CATEGORIES.flatMap((c) => c.subcategories).length).toBe(43);
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
    expect(hrefFor("command", "home")).toBe("/admin");
    expect(hrefFor("command", "inbox")).toBe("/admin/command/inbox");
    expect(hrefFor("system", "setup")).toBe("/admin/system/setup");
    expect(hrefFor("deliver", "booking")).toBe("/admin/deliver/booking");
  });
  it("builds the Modules screen at /system/modules", () => {
    expect(hrefFor("system", "modules")).toBe("/admin/system/modules");
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
    expect(findSubcategory("deliver", "booking")?.sub.label).toBe("Book appointments");
    expect(findSubcategory("deliver", "nope")).toBeUndefined();
    expect(findSubcategory("nope", "booking")).toBeUndefined();
  });
  it("picks the longest matching href as active", () => {
    const nav = buildNav();
    expect(activeKey("/admin", nav)).toBe("command.home");
    expect(activeKey("/admin/command/inbox", nav)).toBe("command.inbox");
    expect(activeKey("/admin/deliver/booking", nav)).toBe("deliver.booking");
    expect(activeKey("/elsewhere", nav)).toBeNull();
  });
});

describe("Connect your tools", () => {
  it("is a built screen at /system/connections", () => {
    expect(hrefFor("system", "connections")).toBe("/admin/system/connections");
    const item = buildNav().find((g) => g.id === "system")!.items.find((i) => i.key === "system.connections")!;
    expect(item.state).toBe("built");
  });
});
