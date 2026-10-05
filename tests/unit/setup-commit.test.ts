import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import nextConfig from "../../next.config";

describe("setup's own changes have a commit home", () => {
  it("next dev never rewrites AGENTS.md or CLAUDE.md", () => {
    expect(nextConfig.agentRules).toBe(false);
  });
  for (const f of ["CLAUDE.md", "prompts/first-session.md"]) {
    it(`${f} has the first session commit setup's changes as one commit, with the owner's yes, before other work`, () => {
      const text = readFileSync(f, "utf8");
      expect(text).toContain("chore: set up <business>");
      expect(text).toContain("key/key.yaml");
      expect(text).toContain("key/knowledge/context-block.yaml");
      expect(text).toMatch(/before any other work/);
    });
  }
});
