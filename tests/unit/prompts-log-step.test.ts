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
    it(`${f} ends with the conditional log step`, () => {
      const step = lastStep(readFileSync(f, "utf8"));
      expect(step).toContain("If your command center folder is open in Claude Code,");
      expect(step).toContain("key/log/");
      expect(step).toContain("log-only commit");
      expect(step).toContain("npm run key:sync");
    });
    it(`${f} runs key:sync before the work commit, so system.md rides in it, then makes the log-only commit`, () => {
      const step = lastStep(readFileSync(f, "utf8"));
      const sync = step.indexOf("npm run key:sync");
      const work = step.indexOf("make the work commit");
      const log = step.indexOf("log-only commit");
      expect(sync).toBeGreaterThanOrEqual(0);
      expect(work).toBeGreaterThan(sync);
      expect(log).toBeGreaterThan(work);
      expect(step.slice(work, log)).toContain("key/knowledge/system.md");
    });
  }
});
