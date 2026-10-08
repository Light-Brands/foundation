import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";

describe("the CI workflow", () => {
  const ci = parse(readFileSync(".github/workflows/ci.yml", "utf8"));
  it("reads the repository and nothing more", () => {
    expect(ci.permissions).toEqual({ contents: "read" });
  });
  it("runs each action at a full commit, never a moving tag", () => {
    const uses = ci.jobs.check.steps.map((s: { uses?: string }) => s.uses).filter(Boolean);
    expect(uses.length).toBeGreaterThan(0);
    for (const u of uses) expect(u).toMatch(/@[0-9a-f]{40}$/);
  });
  it("never runs a fork's code with the repository's secrets", () => {
    expect(JSON.stringify(ci.on)).not.toContain("pull_request_target");
  });
  it("has Dependabot watching actions and npm", () => {
    expect(existsSync(".github/dependabot.yml")).toBe(true);
    const d = parse(readFileSync(".github/dependabot.yml", "utf8"));
    expect(d.updates.map((u: { "package-ecosystem": string }) => u["package-ecosystem"]).sort()).toEqual(["github-actions", "npm"]);
  });
});
