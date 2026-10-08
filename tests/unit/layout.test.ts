import { describe, it, expect } from "vitest";
import { CATEGORIES, outcomesFor } from "@/lib/layout/categories";
import { hrefFor, findSubcategory } from "@/lib/layout/registry";

describe("the eleven categories", () => {
  it("are in the spec's order", () => {
    expect(CATEGORIES.map((c) => c.label)).toEqual([
      "Command center", "Marketing", "Sales", "Delivery", "Customer care", "Finance", "People", "Leadership", "Operations", "Protection", "Settings",
    ]);
  });
  it("carry exactly the spec's sub-categories", () => {
    const subs = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.subcategories.map((s) => s.label)]));
    expect(subs).toEqual({
      command: ["See your day", "Inbox", "Get alerted"],
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
    expect(hrefFor("system", "modules")).toBe("/admin/system/modules");
  });
  it("finds sub-categories and refuses unknown ones", () => {
    expect(findSubcategory("deliver", "booking")?.sub.label).toBe("Book appointments");
    expect(findSubcategory("deliver", "nope")).toBeUndefined();
    expect(findSubcategory("nope", "booking")).toBeUndefined();
  });
});

describe("Connect your tools", () => {
  it("is a built screen at /system/connections", () => {
    expect(hrefFor("system", "connections")).toBe("/admin/system/connections");
  });
});

describe("what changes once a job runs", () => {
  const jobs = CATEGORIES.flatMap((c) => c.subcategories.map((s) => ({ key: `${c.id}.${s.id}`, s })));
  it("gives every job with an hours figure two or three plain outcome lines", () => {
    for (const { key, s } of jobs.filter((j) => j.s.hours !== "Core")) {
      expect(s.outcomes?.length, key).toBeGreaterThanOrEqual(2);
      expect(s.outcomes?.length, key).toBeLessThanOrEqual(3);
    }
  });
  it("keeps the lines honest: no numbers, no dashes, nothing defined by what it is not", () => {
    for (const { key, s } of jobs) for (const line of s.outcomes ?? []) {
      expect(line, key).not.toMatch(/[\d\u2013\u2014]/);
      expect(line, key).not.toMatch(/\b(not|isn't|aren't|never|rather than|instead of)\b/i);
      expect(line.endsWith("."), key).toBe(true);
    }
  });
  it("falls back to the blurb when a job has none", () => {
    expect(outcomesFor({ ...jobs[0]!.s, outcomes: undefined })).toEqual([jobs[0]!.s.blurb]);
    expect(outcomesFor({ ...jobs[0]!.s, outcomes: ["One."] })).toEqual(["One."]);
  });
});
