import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { CATEGORIES } from "@/lib/layout/categories";

const shipped = existsSync("ninja/VERSION");
describe.skipIf(!shipped)("the shipped Ninja framework", () => {
  it("has a valid version", () => {
    expect(readFileSync("ninja/VERSION", "utf8")).toMatch(/^dictionary: \d+\.\d+\.\d+\n?$/);
  });
  it("labels match the dictionary's departments", () => {
    const d = parse(readFileSync("ninja/foundation/departments.yaml", "utf8"));
    const want = d.departments.map((x: { id: string; label: string; jobs: { id: string; label: string }[] }) => [x.id, x.label, x.jobs.map((j) => [j.id, j.label])]);
    const have = CATEGORIES.map((c) => [c.id, c.label, c.subcategories.map((s) => [s.id, s.label])]);
    expect(have).toEqual(want);
  });
  it("ships every crew role an entry names", () => {
    const agents = new Set(readdirSync(".claude/agents").filter((f) => f.startsWith("crew-")).map((f) => f.slice(5, -3)));
    const files = readdirSync("ninja", { recursive: true }) as string[];
    for (const f of files.filter((x) => /^(frameworks|blueprints|modules|agents|skills|routines|connections)\/.*\.md$/.test(x))) {
      const fm = parse(readFileSync(`ninja/${f}`, "utf8").split("\n---\n")[0].replace(/^---\n/, ""));
      for (const r of [...(fm.crew ?? []), ...(fm.specialists ?? [])]) expect(agents.has(r), `${f} names ${r}`).toBe(true);
    }
  });
});
