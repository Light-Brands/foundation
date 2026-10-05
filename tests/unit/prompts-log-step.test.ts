import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? markdownFiles(p) : p.endsWith(".md") ? [p] : [];
  });
}

function lastStep(text: string): string {
  const lines = text.split("\n");
  let start = -1;
  lines.forEach((l, i) => { if (/^\d+\.\s/.test(l)) start = i; });
  return start < 0 ? "" : lines.slice(start).join("\n");
}

describe("every prompt keeps the build log", () => {
  const files = markdownFiles("prompts").filter((f) => !f.endsWith("README.md"));
  it("finds the prompts", () => {
    expect(files.length).toBeGreaterThanOrEqual(6);
  });
  for (const f of files) {
    it(`${f} ends with the log step`, () => {
      const step = lastStep(readFileSync(f, "utf8"));
      expect(step).toContain("key/log/");
      expect(step).toContain("npm run key:sync");
    });
  }
});
