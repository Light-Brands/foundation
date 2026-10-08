import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { CATEGORIES } from "@/lib/layout/categories";

// An entry's front matter, failing with the file's name when it is missing, empty or not a mapping.
function frontMatter(file: string): { crew?: string[]; specialists?: string[] } {
  const text = readFileSync(file, "utf8");
  const m = /^---\n([\s\S]*?)\n---(\n|$)/.exec(text);
  const fm = m ? parse(m[1]) : null;
  if (fm === null || typeof fm !== "object" || Array.isArray(fm)) throw new Error(`${file} has no front matter, or it is empty`);
  return fm;
}

describe("frontMatter", () => {
  it("names the file when the front matter is missing or empty", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "ninja-fm-"));
    for (const [name, text] of [["none.md", "# No front matter\n"], ["empty.md", "---\n---\n# Empty\n"], ["null.md", "---\n~\n---\n"]]) {
      writeFileSync(path.join(dir, name), text);
      expect(() => frontMatter(path.join(dir, name))).toThrow(`${path.join(dir, name)} has no front matter, or it is empty`);
    }
    writeFileSync(path.join(dir, "ok.md"), "---\ncrew: [run-lead]\n---\n# Ok\n");
    expect(frontMatter(path.join(dir, "ok.md"))).toEqual({ crew: ["run-lead"] });
  });
});

// These specialists ship with the Master Agent Library add-on, so they have no crew file here.
const ADDON_SPECIALISTS = new Set(["story-and-voice"]);

// This repository always ships the dictionary, so a missing ninja/VERSION is a failure, never a skip.
describe("the shipped Ninja framework", () => {
  it("has a valid version", () => {
    expect(existsSync("ninja/VERSION"), "ninja/VERSION is missing: the dictionary must ship in this repository").toBe(true);
    expect(readFileSync("ninja/VERSION", "utf8")).toMatch(/^dictionary: \d+\.\d+\.\d+\n?$/);
  });
  it("is pointed at from CLAUDE.md: the guide for how to ask, the runner for how runs work", () => {
    const section = readFileSync("CLAUDE.md", "utf8").split("## The Ninja framework")[1]?.split("\n## ")[0] ?? "";
    for (const f of ["ninja/guide.md", "ninja/runner/run.md"]) {
      expect(section, `CLAUDE.md's Ninja framework section names ${f}`).toContain(`\`${f}\``);
      expect(existsSync(f), `${f} ships`).toBe(true);
    }
    expect(section).toMatch(/ninja\/guide\.md`[^.]*how to ask/);
    expect(section).toMatch(/ninja\/runner\/run\.md`[^.]*how runs work/);
  });
  it("labels match the dictionary's departments", () => {
    const d = parse(readFileSync("ninja/foundation/departments.yaml", "utf8"));
    const want = d.departments.map((x: { id: string; label: string; jobs: { id: string; label: string }[] }) => [x.id, x.label, x.jobs.map((j) => [j.id, j.label])]);
    const have = CATEGORIES.map((c) => [c.id, c.label, c.subcategories.map((s) => [s.id, s.label])]);
    expect(have).toEqual(want);
  });
  it("keeps the add-on allowlist honest: no add-on specialist is also a crew file", () => {
    for (const r of ADDON_SPECIALISTS) expect(existsSync(`ninja/crew/${r}.md`), `${r} has a crew file, so drop it from the allowlist`).toBe(false);
  });
  it("ships every crew role an entry names", () => {
    const agents = new Set(readdirSync(".claude/agents").filter((f) => f.startsWith("crew-")).map((f) => f.slice(5, -3)));
    const files = readdirSync("ninja", { recursive: true }) as string[];
    for (const f of files.filter((x) => /^(frameworks|blueprints|modules|agents|skills|routines|connections)\/.*\.md$/.test(x))) {
      const fm = frontMatter(`ninja/${f}`);
      for (const r of fm.crew ?? []) expect(agents.has(r), `${f} names ${r}`).toBe(true);
      for (const r of fm.specialists ?? []) {
        if (ADDON_SPECIALISTS.has(r)) continue;
        expect(existsSync(`ninja/crew/${r}.md`), `${f} names specialist ${r}, which is neither a crew role nor an add-on specialist`).toBe(true);
        expect(agents.has(r), `${f} names specialist ${r}, which has no .claude/agents/crew-${r}.md`).toBe(true);
      }
    }
  });
});
