import { describe, it, expect } from "vitest";
import { allows, PIN_OWNER, type Actor } from "@/lib/auth/roles";

const team = (departments: string[]): Actor => ({ id: "a1", role: "team", via: "account", departments });

describe("allows", () => {
  it("lets the owner do everything", () => {
    expect(allows(PIN_OWNER, "owner")).toBe(true);
    expect(allows(PIN_OWNER, "team", "money")).toBe(true);
  });
  it("keeps owner work from the team role", () => {
    expect(allows(team(["sell"]), "owner")).toBe(false);
  });
  it("lets the team role work only in its departments", () => {
    expect(allows(team(["sell"]), "team", "sell")).toBe(true);
    expect(allows(team(["sell"]), "team", "money")).toBe(false);
    expect(allows(team([]), "team")).toBe(true);
  });
  it("lets nobody in without an actor", () => {
    expect(allows(null, "team")).toBe(false);
  });
});
