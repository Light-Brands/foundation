import { parse } from "yaml";
import { CATEGORIES } from "../layout/categories";

const START = "<!-- inventory:start -->";
const END = "<!-- inventory:end -->";

type Item = { slug?: string; agent?: string; category?: string; persona?: string; role?: string };

function list(v: unknown): Item[] {
  return Array.isArray(v) ? (v.filter((x) => x && typeof x === "object") as Item[]) : [];
}

const byText = (a: string, b: string) => a.localeCompare(b);

/** The inventory for system.md. With brand, the owner's own look in key/brand.yaml is named too. */
export function buildInventory(keyYamlText: string, opts: { brand?: boolean } = {}): string {
  const key = (parse(keyYamlText) ?? {}) as Record<string, unknown>;
  const apps = list(key.apps);
  const routines = list(key.routines);
  const skills = list(key.skills);
  const roster = list(key.roster);
  const label = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

  const lines: string[] = ["## What is running", ""];
  const cats = [...new Set([...apps, ...routines].map((x) => x.category ?? "uncategorized"))].sort((a, b) => byText(label(a), label(b)));
  if (cats.length === 0) lines.push("Nothing is running yet.", "");
  for (const c of cats) {
    lines.push(`### ${label(c)}`, "");
    for (const a of apps.filter((x) => (x.category ?? "uncategorized") === c).sort((x, y) => byText(x.slug ?? "", y.slug ?? ""))) lines.push(`- App: ${a.slug}`);
    for (const w of routines.filter((x) => (x.category ?? "uncategorized") === c).sort((x, y) => byText(x.slug ?? "", y.slug ?? ""))) lines.push(`- Routine: ${w.slug}${w.agent ? ` (run by ${w.agent})` : ""}`);
    lines.push("");
  }

  lines.push("## Roles and skills", "");
  const roles = [...new Set([...roster.map((r) => r.role ?? ""), ...skills.map((s) => s.agent ?? "")].filter(Boolean))].sort(byText);
  if (roles.length === 0) lines.push("No roles yet.", "");
  for (const r of roles) {
    const persona = roster.find((x) => x.role === r)?.persona;
    lines.push(`### ${r}${persona ? ` (${persona})` : ""}`, "");
    const mine = skills.filter((s) => s.agent === r).sort((x, y) => byText(x.slug ?? "", y.slug ?? ""));
    if (mine.length === 0) lines.push("- No skills yet");
    for (const s of mine) lines.push(`- Skill: ${s.slug}`);
    lines.push("");
  }
  if (opts.brand) {
    lines.push("## Look", "", "The command center wears this business's own brand, kept in key/brand.yaml.", "");
  }
  return lines.join("\n").trimEnd() + "\n";
}

export function replaceInventory(systemMd: string, inventory: string): string {
  const block = `${START}\n${inventory.trimEnd()}\n${END}`;
  const s = systemMd.indexOf(START);
  const e = systemMd.indexOf(END);
  if (s === -1 || e === -1 || e < s) {
    return `${systemMd.replace(/\n*$/, "")}\n\n${block}\n`;
  }
  return systemMd.slice(0, s) + block + systemMd.slice(e + END.length);
}
