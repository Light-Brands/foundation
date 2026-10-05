import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { CATEGORIES } from "@/lib/layout/categories";
import { compareDefinition } from "@/lib/key/schema";

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const CHARTER_HEADINGS = ["Role", "Who I serve", "How I work", "What I know", "What I never do", "Tasks", "Skills", "Memory"];
export const SKILL_SECTIONS = ["Input", "Steps", "Output", "Check"];
export const WORKFLOW_SECTIONS = ["Goal", "Steps", "Expected output", "Check", "When blocked"];
export const TRIGGERS = ["cron", "every", "at", "record_change"];
export const FIELD_TYPES = ["text", "number", "date", "select", "multi_select", "checkbox", "user", "multi_user", "url", "email", "attachment"];
const MEMORY_TYPES = ["preference", "feedback", "reference", "context"];
const CATEGORY_IDS: string[] = CATEGORIES.map((c) => c.id);
// A slug that would collide with the core migration names.
const RESERVED_APP_SLUGS = ["core"];

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function loadYaml(file: string, text: string, problems: string[]): unknown {
  try { return parse(text); } catch (e) {
    problems.push(`${file}: not valid YAML (${(e as Error).message.split("\n")[0]})`);
    return undefined;
  }
}

export function parseFrontMatter(md: string): { data: Record<string, unknown>; body: string } | null {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  if (lines[0]?.trim() !== "---") return null;
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (end < 0) return null;
  let data: unknown;
  try { data = parse(lines.slice(1, end).join("\n")); } catch { return null; }
  if (data == null) data = {};
  if (!isObj(data)) return null;
  return { data, body: lines.slice(end + 1).join("\n") };
}

function h2(md: string): string[] {
  const out: string[] = [];
  let fence = false;
  for (const line of md.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; continue; }
    if (fence) continue;
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (m && !line.startsWith("###")) out.push(m[1]);
  }
  return out;
}

function inOrder(found: string[], wanted: string[]): string[] {
  const missing = wanted.filter((w) => !found.includes(w));
  if (missing.length) return [`missing section${missing.length > 1 ? "s" : ""} ${missing.join(", ")}`];
  const seq = found.filter((h) => wanted.includes(h));
  return seq.join("|") === wanted.join("|") ? [] : [`sections out of order, expected ${wanted.join(", ")}`];
}

export function checkKeyYaml(file: string, text: string): string[] {
  const p: string[] = [];
  const bad = (m: string) => p.push(`${file}: ${m}`);
  const d = loadYaml(file, text, p);
  if (d === undefined) return p;
  if (!isObj(d)) return [`${file}: key.yaml must be a mapping`];
  if (d.key !== 1) bad("key must be 1");
  if (!SLUG.test(str(d.client))) bad("client must be a lowercase hyphenated slug");
  if (!["seed", "systems"].includes(str(d.stage))) bad("stage must be seed or systems");
  if (d.home !== "repo") bad("home must be repo");
  list(d.roster).forEach((r, i) => {
    const role = isObj(r) ? str(r.role) : "";
    if (!SLUG.test(role)) bad(`roster[${i}].role must be a lowercase hyphenated slug`);
    else if (!isObj(r) || r.charter !== `agents/${role}/charter.md`) bad(`roster[${i}].charter must be agents/${role}/charter.md`);
  });
  for (const k of ["skills", "apps", "workflows"] as const) {
    list(d[k]).forEach((e, i) => {
      if (!isObj(e) || !SLUG.test(str(e.slug))) bad(`${k}[${i}].slug must be a lowercase hyphenated slug`);
      else if (k === "apps" && RESERVED_APP_SLUGS.includes(e.slug as string)) bad(`apps[${i}].slug "${e.slug}" is reserved (it would collide with core migration names)`);
      if (k !== "skills" && (!isObj(e) || !CATEGORY_IDS.includes(str(e.category)))) bad(`${k}[${i}].category must be a known category id`);
    });
  }
  return p;
}

export function checkCharter(file: string, md: string): string[] {
  const p: string[] = [];
  const heads = h2(md);
  if (heads.join("|") !== CHARTER_HEADINGS.join("|")) {
    const missing = CHARTER_HEADINGS.filter((h) => !heads.includes(h));
    p.push(`${file}: charter headings must be exactly ${CHARTER_HEADINGS.join(", ")} in that order` +
      (missing.length ? ` (missing ${missing.join(", ")})` : ""));
  }
  let inMemory = false;
  for (const line of md.replace(/\r\n/g, "\n").split("\n")) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m && !line.startsWith("###")) { inMemory = m[1] === "Memory"; continue; }
    if (!inMemory) continue;
    const b = /^\s*[-*]\s+(.*)$/.exec(line);
    if (b && !MEMORY_TYPES.some((t) => b[1].startsWith(`${t}:`))) {
      p.push(`${file}: Memory entry "${b[1].slice(0, 40)}" must start with preference:, feedback:, reference: or context:`);
    }
  }
  return p;
}

export function checkSkill(file: string, md: string): string[] {
  const p: string[] = [];
  const fm = parseFrontMatter(md);
  if (!fm) return [`${file}: skill needs front matter with name and description`];
  for (const k of ["name", "description"]) if (!str(fm.data[k]).trim()) p.push(`${file}: skill front matter needs a non-empty ${k}`);
  for (const m of inOrder(h2(fm.body), SKILL_SECTIONS)) p.push(`${file}: skill ${m}`);
  return p;
}

export function checkWorkflow(file: string, md: string): string[] {
  const p: string[] = [];
  const fm = parseFrontMatter(md);
  if (!fm) return [`${file}: workflow needs front matter`];
  const d = fm.data;
  const bad = (m: string) => p.push(`${file}: ${m}`);
  if (!str(d.name).trim()) bad("workflow front matter needs a name");
  if (!SLUG.test(str(d.agent))) bad("workflow agent must be a lowercase hyphenated slug");
  if (!CATEGORY_IDS.includes(str(d.category))) bad("workflow category must be a known category id");
  const t = str(d.trigger);
  if (!TRIGGERS.includes(t)) bad(`workflow trigger must be one of ${TRIGGERS.join(", ")}`);
  else {
    const need: Record<string, string[]> = { cron: ["cron"], every: ["every"], at: ["at"], record_change: ["entity", "events"] };
    for (const k of need[t]) if (d[k] == null || d[k] === "") bad(`workflow trigger ${t} needs ${k}`);
  }
  for (const m of inOrder(h2(fm.body), WORKFLOW_SECTIONS)) bad(`workflow ${m}`);
  return p;
}

export function checkDefinition(file: string, text: string, workflowSlugs: string[]): string[] {
  const p: string[] = [];
  const bad = (m: string) => p.push(`${file}: ${m}`);
  const d = loadYaml(file, text, p);
  if (d === undefined) return p;
  if (!isObj(d)) return [`${file}: definition must be a mapping`];
  if (!SLUG.test(str(d.app))) bad("app must be a lowercase hyphenated slug");
  else if (RESERVED_APP_SLUGS.includes(str(d.app))) bad(`app slug "${str(d.app)}" is reserved (it would collide with core migration names)`);
  if (!CATEGORY_IDS.includes(str(d.category))) bad("category must be a known category id");
  list(d.fields).forEach((f, i) => {
    const type = isObj(f) ? str(f.type) : "";
    if (!FIELD_TYPES.includes(type)) bad(`fields[${i}].type "${type}" must be one of ${FIELD_TYPES.join(", ")}`);
    else if ((type === "select" || type === "multi_select") && list(isObj(f) ? f.options : undefined).length === 0) bad(`fields[${i}] of type ${type} needs options`);
  });
  list(d.automations).forEach((a, i) => {
    const w = isObj(a) ? str(a.workflow) : "";
    if (!workflowSlugs.includes(w)) bad(`automations[${i}].workflow "${w}" names a workflow that does not exist`);
  });
  if (d.migrations !== "migrations/") bad("migrations must be migrations/");
  return p;
}

export function checkLogText(file: string, md: string): string[] {
  const p: string[] = [];
  if (/\b[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}\b/.test(md)) p.push(`${file}: log text holds an email address; the build log never holds customer details`);
  const cleaned = md
    .replace(/^- Commit:.*$/gm, "- Commit:")
    .replace(/\b(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/gi, " ")
    .replace(/\d{4}-\d{2}-\d{2}(T|\b)/g, " ")
    .replace(/\b\d{1,2}:\d{2}(:\d{2})?(\.\d+)?Z?\b/g, " ");
  for (const run of cleaned.match(/[\d(][\d\s.\-()+]*/g) ?? []) {
    if (run.replace(/\D/g, "").length >= 7) { p.push(`${file}: log text holds a phone number; the build log never holds customer details`); break; }
  }
  return p;
}

async function files(dir: string, ext: string): Promise<string[]> {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return []; }
  const out: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(full, ext)));
    else if (e.name.endsWith(ext)) out.push(full);
  }
  return out.sort();
}

export async function checkKeyFolder(root: string): Promise<string[]> {
  const key = path.join(root, "key");
  const rel = (f: string) => path.relative(root, f);
  const problems: string[] = [];
  const read = (f: string) => readFile(f, "utf8");

  const keyYaml = path.join(key, "key.yaml");
  let keyText: string | null = null;
  try { keyText = await read(keyYaml); } catch { /* reported below */ }
  if (keyText === null) problems.push(`${rel(keyYaml)}: missing`);
  else problems.push(...checkKeyYaml(rel(keyYaml), keyText));

  for (const f of await files(path.join(key, "agents"), "charter.md")) problems.push(...checkCharter(rel(f), await read(f)));
  for (const f of await files(path.join(key, "skills"), ".md")) problems.push(...checkSkill(rel(f), await read(f)));

  const wfFiles = await files(path.join(key, "workflows"), ".md");
  const slugs = wfFiles.map((f) => (path.basename(f, ".md") === "workflow" ? path.basename(path.dirname(f)) : path.basename(f, ".md")));
  for (const f of wfFiles) problems.push(...checkWorkflow(rel(f), await read(f)));
  for (const f of await files(path.join(key, "apps"), "definition.yaml")) {
    const text = await read(f);
    problems.push(...checkDefinition(rel(f), text, slugs));
    const migrations = await files(path.join(path.dirname(f), "migrations"), ".sql");
    const sql = await Promise.all(migrations.map(read));
    problems.push(...compareDefinition(rel(f), text, sql));
  }
  for (const f of await files(path.join(key, "log"), ".md")) problems.push(...checkLogText(rel(f), await read(f)));
  return problems;
}
