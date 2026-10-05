import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../..");
const DIR = path.join(ROOT, "docs/standards");
const read = (f: string) => readFileSync(path.join(DIR, f), "utf8");

// Files the README lists, as in "- `stack.md`: ..." lines.
const listed = (): string[] =>
  [...read("README.md").matchAll(/`([a-z0-9-]+\.md)`/g)].map((m) => m[1]).filter((f) => f !== "README.md");

const onDisk = (): string[] => readdirSync(DIR).filter((f) => f.endsWith(".md") && f !== "README.md");

describe("the coding standards", () => {
  it("lists every standards file in the README, and every listed file exists", () => {
    expect(existsSync(DIR)).toBe(true);
    const l = [...new Set(listed())].sort();
    expect(l.length).toBeGreaterThan(10);
    for (const f of l) expect(existsSync(path.join(DIR, f)), `${f} is listed but missing`).toBe(true);
    expect(onDisk().sort()).toEqual(l);
  });

  it("is linked from CLAUDE.md, file by file", () => {
    const claude = readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");
    for (const f of ["README.md", ...onDisk()]) expect(claude, `CLAUDE.md must link docs/standards/${f}`).toContain(`docs/standards/${f}`);
  });

  it("holds no long or short dash characters", () => {
    const files = ["README.md", ...onDisk()].map((f) => path.join("docs/standards", f)).concat("modules/README.md");
    for (const f of files) expect(readFileSync(path.join(ROOT, f), "utf8"), `${f} holds a long or short dash`).not.toMatch(/[–—]/);
  });

  it("gives every rule a reason", () => {
    for (const f of onDisk()) {
      const rules = read(f).split("\n").filter((l) => /^- \*\*[^*]*\.\*\*/.test(l));
      for (const r of rules) expect(r, `${f}: a rule without Why: ${r.slice(0, 50)}`).toContain("Why:");
    }
  });
});
