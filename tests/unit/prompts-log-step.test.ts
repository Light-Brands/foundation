import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? markdownFiles(p) : p.endsWith(".md") ? [p] : [];
  });
}

describe("every prompt keeps the build log", () => {
  const files = markdownFiles("prompts").filter((f) => !f.endsWith("README.md"));
  it("finds the prompts", () => {
    expect(files.length).toBeGreaterThanOrEqual(6);
  });
  for (const f of files) {
    it(`${f} ends with the log step`, () => {
      const text = readFileSync(f, "utf8");
      expect(text).toContain("key/log/");
      expect(text).toContain("npm run key:sync");
    });
  }
});
