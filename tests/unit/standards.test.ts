import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
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

  it("keeps long and short dashes out of every prompt", () => {
    const walk = (d: string): string[] =>
      readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    const files = walk(path.join(ROOT, "prompts"));
    expect(files.length).toBeGreaterThan(5);
    for (const f of files) expect(readFileSync(f, "utf8"), `${path.relative(ROOT, f)} holds a long or short dash`).not.toMatch(/[\u2013\u2014]/);
  });

  it("gives every rule a reason", () => {
    for (const f of onDisk()) {
      const rules = read(f).split("\n").filter((l) => /^- \*\*[^*]*\.\*\*/.test(l));
      for (const r of rules) expect(r, `${f}: a rule without Why: ${r.slice(0, 50)}`).toContain("Why:");
    }
  });
});

describe("a Ninja framework run commits once", () => {
  for (const f of ["CLAUDE.md", "docs/standards/commits.md", "docs/standards/log.md"]) {
    it(`${f} gives a run one work commit on its run branch, one log-only commit, and main only on the owner's yes`, () => {
      const text = readFileSync(path.join(ROOT, f), "utf8");
      expect(text).toContain("run/<date>-<verb>-<entry with / as ->");
      expect(text).toMatch(/one work commit/);
      expect(text).toMatch(/one log-only commit/);
      expect(text).toMatch(/merging (it )?into `?main`? on the owner's yes/);
      expect(text).toMatch(/by hand outside the runner/);
      expect(text).not.toMatch(/After every build step|Add an entry after every build step|The order for every build step/);
    });
  }
  it("commits.md asks one fix per review finding only for work by hand", () => {
    const text = readFileSync(path.join(ROOT, "docs/standards/commits.md"), "utf8");
    expect(text).not.toMatch(/^- \*\*Make one fix per review finding\.\*\*/m);
  });
});

describe("folders the dictionary and remove own", () => {
  const text = (f: string) => readFileSync(path.join(ROOT, f), "utf8");
  for (const f of ["CLAUDE.md", "docs/standards/layout.md"]) {
    it(`${f} reserves .claude/agents/crew-*.md for the dictionary's build crew`, () => {
      expect(text(f)).toMatch(/`\.claude\/agents\/crew-\*\.md`[^.]*reserved for the dictionary's build crew[^.]*replaced on every dictionary update/);
      expect(text(f)).toMatch(/a member's own agents use any other name/i);
    });
  }
  it("data.md sends exports from remove to .data/exports/, which git ignores", () => {
    expect(text("docs/standards/data.md")).toMatch(/remove[^.]*`\.data\/exports\/`/);
    expect(execFileSync("git", ["check-ignore", ".data/exports/contacts.csv"], { cwd: ROOT, encoding: "utf8" }).trim()).toBe(".data/exports/contacts.csv");
  });
});
