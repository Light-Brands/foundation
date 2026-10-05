import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { CATEGORIES } from "@/lib/layout/categories";
import { compareDefinition } from "@/lib/key/schema";

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const COMMIT_ID = /^[0-9a-f]{40}$/;
export const CHARTER_HEADINGS = ["Role", "Who I serve", "How I work", "What I know", "What I never do", "Tasks", "Skills", "Memory"];
export const SKILL_SECTIONS = ["Input", "Steps", "Output", "Check"];
export const OLD_WORKFLOWS = "workflows is now routines: rename the list to routines and the folder key/workflows/ to key/routines/";
export const ROUTINE_SECTIONS = ["Goal", "Steps", "Expected output", "Check", "When blocked"];
export const TRIGGERS = ["cron", "every", "at", "record_change"];
export const FIELD_TYPES = ["text", "number", "date", "select", "multi_select", "checkbox", "user", "multi_user", "url", "email", "attachment"];
export const EVERY = /^\d+\s*(second|minute|hour|day|week)s?$/;
const IDENTIFIER = /^[a-z][a-z0-9_]*$/;
const SYSTEM_COLUMNS = ["id", "created_at", "updated_at"];
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
    if (!isObj(r) || !str(r.persona).trim()) bad(`roster[${i}].persona must be a non-empty name`);
  });
  const roles = new Set(list(d.roster).filter(isObj).map((r) => str(r.role)).filter(Boolean));
  if ("workflows" in d) p.push(`${file}: ${OLD_WORKFLOWS}`);
  if (isObj(d.provenance) && "base" in d.provenance && !COMMIT_ID.test(str(d.provenance.base))) bad("provenance.base must be a full 40 character commit id");
  p.push(...checkInstalled(file, d));
  for (const k of ["skills", "apps", "routines"] as const) {
    list(d[k]).forEach((e, i) => {
      if (!isObj(e) || !SLUG.test(str(e.slug))) bad(`${k}[${i}].slug must be a lowercase hyphenated slug`);
      else if (k === "apps" && RESERVED_APP_SLUGS.includes(e.slug as string)) bad(`apps[${i}].slug "${e.slug}" is reserved (it would collide with core migration names)`);
      if (k !== "skills" && (!isObj(e) || !CATEGORY_IDS.includes(str(e.category)))) bad(`${k}[${i}].category must be a known category id`);
      const pathKey = k === "apps" ? "definition" : "path";
      if (!isObj(e) || !str(e[pathKey]).trim()) bad(`${k}[${i}].${pathKey} must name the file, relative to key/`);
      if (k === "skills" && isObj(e) && "agent" in e && !roles.has(str(e.agent))) bad(`skills[${i}].agent "${str(e.agent)}" is not in the roster`);
    });
  }
  return p;
}

const ENTRY = /^(frameworks|blueprints|modules|agents|skills|routines|connections)\/[a-z0-9-]+(\/[a-z0-9-]+)?$/;
const FROM = /^dictionary@\d+\.\d+\.\d+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const TIERS = ["essentials", "complete", "mastery"];
export const VERBS = ["install", "modify", "upgrade", "check", "remove", "learn", "weave"];
const realDate = (v: unknown): boolean => {
  const t = dateText(v);
  if (!ISO_DATE.test(t)) return false;
  const d = new Date(`${t}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === t;
};
const dateText = (v: unknown): string => (v instanceof Date && !Number.isNaN(v.getTime()) ? v.toISOString().slice(0, 10) : str(v));

// A code path is relative to the repository root and sits under src/ or modules/.
export const codePathOk = (f: unknown): boolean =>
  typeof f === "string" && /^(src|modules)\/./.test(f) && !f.includes("\\") && !f.split("/").includes("..");

export function checkInstalled(file: string, d: Obj): string[] {
  const p: string[] = [];
  const bad = (m: string) => p.push(`${file}: ${m}`);
  if (d.installed === undefined) return p;
  if (!Array.isArray(d.installed)) return [`${file}: installed must be a list`];
  d.installed.forEach((e, i) => {
    const at = `installed[${i}]`;
    if (!isObj(e)) { bad(`${at} must be a mapping`); return; }
    if (!ENTRY.test(str(e.entry))) bad(`${at}.entry must look like routines/monday-brief (a kind folder, then lowercase hyphenated names)`);
    if (!FROM.test(str(e.from))) bad(`${at}.from must look like dictionary@0.1.0`);
    if (!TIERS.includes(str(e.tier))) bad(`${at}.tier must be one of ${TIERS.join(", ")}`);
    const fl = list(e.files);
    if (fl.length === 0 || fl.some((f) => !str(f).trim() || path.isAbsolute(str(f)) || str(f).split("/").includes(".."))) bad(`${at}.files must be a non-empty list of paths relative to key/`);
    if (e.code !== undefined && (!Array.isArray(e.code) || e.code.some((c) => !codePathOk(c)))) bad(`${at}.code must be a list of paths relative to the repository root, each starting with src/ or modules/`);
    if (!realDate(e.installed)) bad(`${at}.installed must be a date like 2026-10-06`);
  });
  return p;
}

export function checkRunBrief(file: string, md: string): string[] {
  const p: string[] = [];
  const bad = (m: string) => p.push(`${file}: ${m}`);
  const base = path.basename(file);
  if (!/^\d{4}-\d{2}-\d{2}-[a-z]+-[a-z0-9-]+\.md$/.test(base)) bad("file name must be <YYYY-MM-DD>-<verb>-<entry with / as ->.md");
  const fm = parseFrontMatter(md);
  if (!fm) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    const closed = lines[0]?.trim() === "---" && lines.findIndex((l, i) => i > 0 && l.trim() === "---") > 0;
    bad(closed ? "run brief front matter is not valid YAML" : "run brief needs front matter");
    return p;
  }
  const d = fm.data;
  const verb = str(d.verb);
  const entry = str(d.entry);
  if (!VERBS.includes(verb)) bad(`verb must be one of ${VERBS.join(", ")}`);
  if (!ENTRY.test(entry)) bad("entry must look like routines/monday-brief");
  if (VERBS.includes(verb) && ENTRY.test(entry) && !base.endsWith(`-${verb}-${entry.replace(/\//g, "-")}.md`)) bad(`file name must end with -${verb}-${entry.replace(/\//g, "-")}.md`);
  if (!TIERS.includes(str(d.tier))) bad(`tier must be one of ${TIERS.join(", ")}`);
  if (!Number.isInteger(d.stage) || (d.stage as number) < 1 || (d.stage as number) > 10) bad("stage must be a whole number from 1 to 10");
  if (!isObj(d.consents)) bad("consents must be a mapping");
  for (const k of ["started", "updated"]) if (!realDate(d[k])) bad(`${k} must be a date like 2026-10-06`);
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

const CRON_RANGES: [number, number][] = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];
export const CRON_MESSAGE = "cron must be five fields: minute hour day month weekday, such as 0 7 * * 2";

export function isValidCron(cron: string): boolean {
  const fields = cron.trim().split(/\s+/);
  if (fields.length !== 5) return false;
  return fields.every((field, i) => {
    const [lo, hi] = CRON_RANGES[i];
    const num = (v: string) => /^\d+$/.test(v) && Number(v) >= lo && Number(v) <= hi;
    return field.split(",").every((part) => {
      const [base, step, extra] = part.split("/");
      if (extra !== undefined) return false;
      if (step !== undefined && !(/^\d+$/.test(step) && Number(step) >= 1)) return false;
      if (base === "*") return true;
      const range = base.split("-");
      if (range.length === 1) return step === undefined ? num(base) : false;
      return range.length === 2 && num(range[0]) && num(range[1]) && Number(range[0]) <= Number(range[1]);
    });
  });
}

export function checkRoutine(file: string, md: string): string[] {
  const p: string[] = [];
  const fm = parseFrontMatter(md);
  if (!fm) return [`${file}: routine needs front matter`];
  const d = fm.data;
  const bad = (m: string) => p.push(`${file}: ${m}`);
  if (!str(d.name).trim()) bad("routine front matter needs a name");
  if (!SLUG.test(str(d.agent))) bad("routine agent must be a lowercase hyphenated slug");
  if (!CATEGORY_IDS.includes(str(d.category))) bad("routine category must be a known category id");
  const t = str(d.trigger);
  if (!TRIGGERS.includes(t)) bad(`routine trigger must be one of ${TRIGGERS.join(", ")}`);
  else {
    if (t === "every" && d.every != null && d.every !== "" && !EVERY.test(str(d.every).trim())) bad("routine every must be a number and a unit, such as 1 day or 30 minutes (seconds, minutes, hours, days or weeks)");
    const need: Record<string, string[]> = { cron: ["cron"], every: ["every"], at: ["at"], record_change: ["entity", "events"] };
    for (const k of need[t]) if (d[k] == null || d[k] === "") bad(`routine trigger ${t} needs ${k}`);
    if (t === "cron" && d.cron != null && d.cron !== "" && !isValidCron(str(d.cron))) bad(CRON_MESSAGE);
  }
  for (const m of inOrder(h2(fm.body), ROUTINE_SECTIONS)) bad(`routine ${m}`);
  return p;
}

export function checkDefinition(file: string, text: string, routineSlugs: string[]): string[] {
  const p: string[] = [];
  const bad = (m: string) => p.push(`${file}: ${m}`);
  const d = loadYaml(file, text, p);
  if (d === undefined) return p;
  if (!isObj(d)) return [`${file}: definition must be a mapping`];
  if (!SLUG.test(str(d.app))) bad("app must be a lowercase hyphenated slug");
  else if (RESERVED_APP_SLUGS.includes(str(d.app))) bad(`app slug "${str(d.app)}" is reserved (it would collide with core migration names)`);
  if (!CATEGORY_IDS.includes(str(d.category))) bad("category must be a known category id");
  const entityKeys = new Set<string>();
  list(d.entities).forEach((e, ei) => {
    const ek = isObj(e) ? str(e.key) : "";
    if (!IDENTIFIER.test(ek)) bad(`entities[${ei}] entity key "${ek}" must be lowercase letters, digits and underscores, starting with a letter`);
    else if (entityKeys.has(ek)) bad(`entities[${ei}] entity key "${ek}" repeats`);
    entityKeys.add(ek);
    const seen = new Set<string>();
    list(isObj(e) ? e.fields : undefined).forEach((f, i) => {
      const at = `entities[${ei}].fields[${i}]`;
      const fk = isObj(f) ? str(f.key) : "";
      if (!IDENTIFIER.test(fk)) bad(`${at} field key "${fk}" must be lowercase letters, digits and underscores, starting with a letter`);
      else if (SYSTEM_COLUMNS.includes(fk)) bad(`${at} field key "${fk}" is a system column every table already has`);
      else if (seen.has(fk)) bad(`${at} field key "${fk}" repeats`);
      seen.add(fk);
      const type = isObj(f) ? str(f.type) : "";
      if (!FIELD_TYPES.includes(type)) bad(`${at}.type "${type}" must be one of ${FIELD_TYPES.join(", ")}`);
      else if ((type === "select" || type === "multi_select") && list(isObj(f) ? f.options : undefined).length === 0) bad(`${at} of type ${type} needs options`);
    });
  });
  list(d.automations).forEach((a, i) => {
    const w = isObj(a) ? str(a.routine) : "";
    if (!routineSlugs.includes(w)) bad(`automations[${i}].routine "${w}" names a routine that does not exist`);
  });
  if (d.migrations !== "migrations/") bad("migrations must be migrations/");
  return p;
}

export function checkLogText(file: string, md: string): string[] {
  const p: string[] = [];
  if (/\b[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}\b/.test(md)) p.push(`${file}: log text holds an email address; the build log never holds customer details`);
  for (const m of md.matchAll(/^- Entry: ?(.*)$/gm)) {
    if (!ENTRY.test(m[1].trim())) p.push(`${file}: log entry id must look like routines/monday-brief (a kind folder, then lowercase hyphenated names)`);
  }
  const cleaned = md
    .replace(/^- Commit: [0-9a-f]{7,40}\s*$/gm, "- Commit:")
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

async function exists(f: string): Promise<boolean> {
  try { await access(f); return true; } catch { return false; }
}

export async function checkKeyFolder(root: string): Promise<string[]> {
  const key = path.join(root, "key");
  const rel = (f: string) => path.relative(root, f);
  const problems: string[] = [];
  const read = (f: string) => readFile(f, "utf8");

  const keyYaml = path.join(key, "key.yaml");
  let keyText: string | null = null;
  try { keyText = await read(keyYaml); } catch { /* reported below */ }
  let ring: Obj | null = null;
  if (keyText === null) problems.push(`${rel(keyYaml)}: missing`);
  else {
    problems.push(...checkKeyYaml(rel(keyYaml), keyText));
    try { const d = parse(keyText); if (isObj(d)) ring = d; } catch { /* checkKeyYaml reported it */ }
  }

  for (const f of await files(path.join(key, "agents"), "charter.md")) problems.push(...checkCharter(rel(f), await read(f)));
  for (const f of await files(path.join(key, "skills"), ".md")) problems.push(...checkSkill(rel(f), await read(f)));

  if (await exists(path.join(key, "workflows")) && !problems.some((x) => x.endsWith(OLD_WORKFLOWS))) problems.push(`${rel(keyYaml)}: ${OLD_WORKFLOWS}`);
  const routineFiles = await files(path.join(key, "routines"), ".md");
  const slugs = routineFiles.map((f) => (path.basename(f, ".md") === "routine" ? path.basename(path.dirname(f)) : path.basename(f, ".md")));
  const recordChange: { file: string; entity: string }[] = [];
  for (const f of routineFiles) {
    const text = await read(f);
    problems.push(...checkRoutine(rel(f), text));
    const fm = parseFrontMatter(text);
    if (fm && str(fm.data.trigger) === "record_change") recordChange.push({ file: rel(f), entity: str(fm.data.entity) });
  }
  const entities = new Set<string>();
  for (const f of await files(path.join(key, "apps"), "definition.yaml")) {
    const text = await read(f);
    problems.push(...checkDefinition(rel(f), text, slugs));
    const migrations = await files(path.join(path.dirname(f), "migrations"), ".sql");
    const sql = await Promise.all(migrations.map(read));
    problems.push(...compareDefinition(rel(f), text, sql));
    let def: unknown;
    try { def = parse(text); } catch { def = undefined; }
    if (isObj(def)) {
      const folder = path.basename(path.dirname(f));
      if (SLUG.test(str(def.app)) && str(def.app) !== folder) problems.push(`${rel(f)}: app folder "${folder}" must match the definition app "${str(def.app)}"`);
      for (const e of list(def.entities)) if (isObj(e) && str(e.key)) entities.add(str(e.key));
    }
  }
  for (const r of recordChange) {
    if (!entities.has(r.entity)) problems.push(`${r.file}: record_change entity "${r.entity}" is not defined by any app`);
  }

  if (ring) {
    const named: string[] = [];
    const reported = new Set<string>();
    for (const r of list(ring.roster)) if (isObj(r) && str(r.charter)) named.push(str(r.charter));
    for (const k of ["skills", "routines"] as const) for (const e of list(ring[k])) if (isObj(e) && str(e.path)) named.push(str(e.path));
    for (const e of list(ring.apps)) if (isObj(e) && str(e.definition)) named.push(str(e.definition));
    for (const n of named) {
      const full = path.join(key, n);
      if (reported.has(full)) continue;
      if (!(await exists(full))) { reported.add(full); problems.push(`${rel(full)}: named in key.yaml but missing`); }
    }
    for (const e of list(ring.installed)) {
      if (!isObj(e)) continue;
      for (const f of list(e.files)) {
        if (typeof f !== "string" || !f.trim() || path.isAbsolute(f) || f.split("/").includes("..")) continue;
        const full = path.join(key, f);
        if (reported.has(full)) continue;
        if (!(await exists(full))) { reported.add(full); problems.push(`${rel(full)}: named in installed but missing`); }
      }
    }
    const codeRoot = root;
    for (const e of list(ring.installed)) {
      if (!isObj(e)) continue;
      for (const f of list(e.code)) {
        if (!codePathOk(f)) continue;
        const full = path.join(codeRoot, f as string);
        if (reported.has(full)) continue;
        if (!(await exists(full))) { reported.add(full); problems.push(`${rel(full)}: named in installed code but missing`); }
      }
    }
    const listed = new Set(list(ring.apps).filter(isObj).map((e) => str(e.slug)));
    let folders: string[] = [];
    try { folders = (await readdir(path.join(key, "apps"), { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name); } catch { /* no apps folder */ }
    for (const folder of folders.sort()) {
      if (!listed.has(folder)) problems.push(`${rel(path.join(key, "apps", folder))}: app folder is not listed in key.yaml`);
    }
  }
  for (const f of await files(path.join(key, "runs"), ".md")) problems.push(...checkRunBrief(rel(f), await read(f)));
  for (const f of await files(path.join(key, "log"), ".md")) problems.push(...checkLogText(rel(f), await read(f)));
  return problems;
}
