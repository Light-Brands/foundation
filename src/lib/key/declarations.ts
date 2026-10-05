import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { CATEGORIES } from "@/lib/layout/categories";
import { parseFrontMatter, SLUG } from "./frontmatter";
import { CORE_CARD_KINDS } from "./core-kinds";

// What an installed Key declares for the Foundation to load at run time: card kinds here, public forms
// (K8), checks and drafting handlers (K5). The Key checker and the running app read the same result.

export const ON_LAPSE = ["stays", "closes", "raised_again"] as const;
export const DECIDE = ["done", "approve"] as const;
export type OnLapse = (typeof ON_LAPSE)[number];
export type DecideMode = (typeof DECIDE)[number];

export type CardKindDecl = {
  kind: string;
  category: string;
  subcategory: string;
  label: string;
  always_human: boolean;
  decide: DecideMode;
  expires_days: number | null;
  on_lapse: OnLapse;
  source: string;
};

export type DeclSource = {
  type: "app" | "routine";
  slug: string;
  file: string;
  category: string;
  entryCategory: string; // the category on the source's entry in key.yaml
  app: string | null;
  uses: string[]; // uses_apps: other installed apps whose tables this source's checks may read (K5)
  data: Record<string, unknown>;
};

export type Declarations = {
  kinds: CardKindDecl[];
  forms: FormDecl[];
  routines: string[];
  tablesByApp: Record<string, string[]>;
  problems: string[];
};

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const insideKey = (rel: string): boolean => rel !== "" && !path.isAbsolute(rel) && !rel.includes("\\") && !rel.split("/").includes("..");

// Jobs whose decisions belong to the owner alone: every Finance job, contracts, the team roster and hiring.
export const OWNER_ONLY_JOBS: readonly string[] = ["money/*", "sell/contracts", "team/people", "team/hiring"];
const ownerOnly = (category: string, sub: string): boolean => OWNER_ONLY_JOBS.includes(`${category}/*`) || OWNER_ONLY_JOBS.includes(`${category}/${sub}`);
const slugList = (v: unknown): string[] => list(v).map(str);

/** Member-facing words in a declaration follow docs/standards/copy.md. */
export const copyOk = (s: string): boolean => !/[–—;]/.test(s);
const COPY_RULE = "must hold no long or short dash and no semicolon";

export function checkCardKinds(src: Pick<DeclSource, "file" | "category" | "slug">, raw: unknown): { kinds: CardKindDecl[]; problems: string[] } {
  const kinds: CardKindDecl[] = [];
  const problems: string[] = [];
  if (raw === undefined) return { kinds, problems };
  if (!Array.isArray(raw)) return { kinds, problems: [`${src.file}: card_kinds must be a list`] };
  const jobs = CATEGORIES.find((c) => c.id === src.category)?.subcategories.map((s) => s.id) ?? [];
  raw.forEach((k, i) => {
    const before = problems.length;
    const bad = (m: string) => problems.push(`${src.file}: card_kinds[${i}] ${m}`);
    if (!isObj(k)) { bad("must be a mapping"); return; }
    const kind = str(k.kind);
    if (!SLUG.test(kind)) bad("kind must be a lowercase hyphenated slug");
    const sub = str(k.subcategory);
    if (!jobs.includes(sub)) bad(`subcategory "${sub}" is not a job in ${src.category}`);
    const label = str(k.label).trim();
    if (label.length < 1 || label.length > 60) bad("label must be 1 to 60 characters");
    else if (!copyOk(label)) bad(`label ${COPY_RULE}`);
    if (k.always_human !== undefined && typeof k.always_human !== "boolean") bad("always_human must be true or false");
    const decide = k.decide === undefined ? "done" : str(k.decide);
    if (!(DECIDE as readonly string[]).includes(decide)) bad("decide must be done or approve");
    else if (decide === "approve" && ownerOnly(src.category, sub) && k.always_human !== true) bad(`decide: approve in ${src.category}/${sub} needs always_human: true, because money, contract and people decisions are the owner's alone`);
    const exp = k.expires_days;
    const hasExpiry = exp !== undefined;
    if (hasExpiry && !(Number.isInteger(exp) && (exp as number) >= 1 && (exp as number) <= 365)) bad("expires_days must be a whole number from 1 to 365");
    const lapse = k.on_lapse === undefined ? (hasExpiry ? "" : "stays") : str(k.on_lapse);
    if (!(ON_LAPSE as readonly string[]).includes(lapse)) bad(hasExpiry ? "on_lapse is required with expires_days: stays, closes or raised_again" : "on_lapse must be stays, closes or raised_again");
    else if (!hasExpiry && lapse !== "stays") bad(`on_lapse ${lapse} needs expires_days`);
    if (problems.length === before) {
      kinds.push({
        kind, category: src.category, subcategory: sub, label, always_human: k.always_human === true,
        decide: decide as DecideMode, expires_days: hasExpiry ? (exp as number) : null, on_lapse: lapse as OnLapse, source: src.slug,
      });
    }
  });
  return { kinds, problems };
}

export const FORM_FIELD_TYPES = ["text", "long_text", "email", "phone", "date", "number", "select", "checkbox"] as const;
export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];
export const RESERVED_FIELD_KEYS: readonly string[] = ["website", "_form", "source", "utm_source", "utm_medium", "utm_campaign", "utm_content", "referrer"];
const DEFAULT_MAX: Record<FormFieldType, number> = { text: 200, long_text: 4000, email: 254, phone: 40, date: 10, number: 30, select: 120, checkbox: 3 };
const FIELD_KEY = /^[a-z][a-z0-9_]*$/;

export type FormField = { key: string; label: string; type: FormFieldType; required: boolean; max: number; options: string[] };
export type FormDecl = { key: string; title: string; intro: string; submit: string; thanks: string; card_kind: string; fields: FormField[]; source: string };

function words(at: string, name: string, v: unknown, min: number, max: number, bad: (m: string) => void): string {
  const s = str(v).trim();
  if (s.length < min || s.length > max) bad(`${name} must be ${min} to ${max} characters`);
  else if (!copyOk(s)) bad(`${name} ${COPY_RULE}`);
  return s;
}

export function checkForms(src: Pick<DeclSource, "file" | "slug">, raw: unknown, kindNames: ReadonlySet<string>): { forms: FormDecl[]; problems: string[] } {
  const forms: FormDecl[] = [];
  const problems: string[] = [];
  if (raw === undefined) return { forms, problems };
  if (!Array.isArray(raw)) return { forms, problems: [`${src.file}: forms must be a list`] };
  const coreKinds = new Set(CORE_CARD_KINDS.map((k) => k.kind));
  raw.forEach((f, i) => {
    const before = problems.length;
    const bad = (m: string) => problems.push(`${src.file}: forms[${i}] ${m}`);
    if (!isObj(f)) { bad("must be a mapping"); return; }
    const key = str(f.key);
    if (!SLUG.test(key)) bad("key must be a lowercase hyphenated slug");
    else if (key === "contact") bad('key "contact" is reserved for the contact page');
    const title = words("", "title", f.title, 1, 80, bad);
    const intro = f.intro === undefined ? "" : words("", "intro", f.intro, 0, 300, bad);
    const submit = f.submit === undefined ? "Send" : words("", "submit", f.submit, 1, 30, bad);
    const thanks = words("", "thanks", f.thanks, 1, 200, bad);
    const kind = str(f.card_kind);
    if (coreKinds.has(kind)) bad(`card_kind "${kind}" is a core kind. Declare a kind for this job`);
    else if (!kindNames.has(kind)) bad(`card_kind "${kind}" is not declared in the Key`);
    const rawFields = list(f.fields);
    if (rawFields.length < 2 || rawFields.length > 20) bad("fields must list 2 to 20 fields");
    const seen = new Set<string>();
    const fields: FormField[] = [];
    rawFields.forEach((x, j) => {
      const fb = (m: string) => bad(`fields[${j}] ${m}`);
      if (!isObj(x)) { fb("must be a mapping"); return; }
      const fk = str(x.key);
      if (!FIELD_KEY.test(fk)) fb(`key "${fk}" must be lowercase letters, digits and underscores, starting with a letter`);
      else if (RESERVED_FIELD_KEYS.includes(fk)) fb(`key "${fk}" is reserved`);
      else if (seen.has(fk)) bad(`field key "${fk}" repeats`);
      seen.add(fk);
      const label = words("", `fields[${j}] label`, x.label, 1, 60, bad);
      const type = str(x.type);
      if (!(FORM_FIELD_TYPES as readonly string[]).includes(type)) { fb(`type "${type}" must be one of ${FORM_FIELD_TYPES.join(", ")}`); return; }
      const t = type as FormFieldType;
      if (x.required !== undefined && typeof x.required !== "boolean") fb("required must be true or false");
      const max = x.max === undefined ? DEFAULT_MAX[t] : x.max;
      if (!(Number.isInteger(max) && (max as number) >= 1 && (max as number) <= 4000)) fb("max must be a whole number from 1 to 4000");
      const options = list(x.options).map((o) => str(o).trim());
      if (t === "select" && (options.length < 1 || options.length > 30 || options.some((o) => !o || o.length > 80 || !copyOk(o)))) fb("select needs 1 to 30 options, each 1 to 80 characters");
      fields.push({ key: fk, label, type: t, required: x.required === true, max: max as number, options: t === "select" ? options : [] });
    });
    const has = (k: string, t: FormFieldType) => fields.some((x) => x.key === k && x.type === t && x.required);
    if (!has("name", "text")) bad("needs a required name field of type text");
    if (!has("email", "email")) bad("needs a required email field of type email");
    if (fields.some((x) => x.key === "phone" && x.type !== "phone")) bad("a phone field must have type phone");
    if (fields.some((x) => x.key === "email" && x.max > 254)) bad("an email field's max is at most 254");
    if (problems.length === before) forms.push({ key, title, intro, submit, thanks, card_kind: kind, fields, source: src.slug });
  });
  return { forms, problems };
}

/** Every installed app definition and routine front matter key.yaml names. Missing or broken files are skipped here, because checkKeyFolder reports them. */
export async function readSources(root: string): Promise<{ sources: DeclSource[]; routines: string[]; tablesByApp: Record<string, string[]>; problems: string[] }> {
  const key = path.join(root, "key");
  const sources: DeclSource[] = [];
  const routines: string[] = [];
  const tablesByApp: Record<string, string[]> = {};
  const problems: string[] = [];
  let ring: unknown;
  let ringText: string;
  try { ringText = await readFile(path.join(key, "key.yaml"), "utf8"); } catch { return { sources, routines, tablesByApp, problems }; }
  try { ring = parse(ringText); } catch { problems.push("key/key.yaml: could not be read as YAML"); return { sources, routines, tablesByApp, problems }; }
  if (!isObj(ring)) return { sources, routines, tablesByApp, problems };
  for (const a of list(ring.apps)) {
    const slug = isObj(a) ? str(a.slug) : "";
    const rel = isObj(a) ? str(a.definition) : "";
    if (!SLUG.test(slug) || !insideKey(rel)) continue;
    let text: string;
    try { text = await readFile(path.join(key, rel), "utf8"); } catch { continue; }
    let def: unknown;
    try { def = parse(text); } catch { problems.push(`key/${rel}: could not be read as YAML`); continue; }
    if (!isObj(def)) continue;
    tablesByApp[slug] = list(def.entities).filter(isObj).map((e) => str(e.key)).filter(Boolean);
    sources.push({ type: "app", slug, file: `key/${rel}`, category: str(def.category), entryCategory: isObj(a) ? str(a.category) : "", app: slug, uses: slugList(def.uses_apps), data: def });
  }
  for (const r of list(ring.routines)) {
    const slug = isObj(r) ? str(r.slug) : "";
    const rel = isObj(r) ? str(r.path) : "";
    if (!SLUG.test(slug)) continue;
    routines.push(slug);
    if (!insideKey(rel)) continue;
    let text: string;
    try { text = await readFile(path.join(key, rel), "utf8"); } catch { continue; }
    const fm = parseFrontMatter(text);
    if (!fm) {
      if (text.trimStart().startsWith("---")) problems.push(`key/${rel}: front matter could not be read as YAML`);
      continue;
    }
    sources.push({ type: "routine", slug, file: `key/${rel}`, category: str(fm.data.category), entryCategory: isObj(r) ? str(r.category) : "", app: str(fm.data.app) || null, uses: slugList(fm.data.uses_apps), data: fm.data });
  }
  return { sources, routines, tablesByApp, problems };
}

export async function readDeclarations(root: string): Promise<Declarations> {
  const { sources, routines, tablesByApp, problems: unreadable } = await readSources(root);
  const problems: string[] = [...unreadable];
  const kinds: CardKindDecl[] = [...CORE_CARD_KINDS];
  for (const s of sources) {
    if (s.type === "routine" && s.app !== null && !(s.app in tablesByApp)) problems.push(`${s.file}: app "${s.app}" is not installed`);
    if (s.data.uses_apps !== undefined && !Array.isArray(s.data.uses_apps)) problems.push(`${s.file}: uses_apps must be a list of app slugs`);
    for (const u of s.uses) {
      if (!SLUG.test(u)) problems.push(`${s.file}: uses_apps "${u}" must be an app slug`);
      else if (!(u in tablesByApp)) problems.push(`${s.file}: uses_apps names "${u}", which is not installed. Install it first, as the entry's uses say`);
    }
    if (s.entryCategory !== "" && s.category !== s.entryCategory) {
      problems.push(`${s.file}: category "${s.category}" does not match "${s.entryCategory}" in key.yaml, so its card kinds are not loaded`);
      continue;
    }
    const found = checkCardKinds(s, s.data.card_kinds);
    problems.push(...found.problems);
    for (const k of found.kinds) {
      const taken = kinds.find((x) => x.kind === k.kind);
      if (taken) problems.push(`${s.file}: card kind "${k.kind}" is already declared by ${taken.source}`);
      else kinds.push(k);
    }
  }
  const kindNames = new Set(kinds.map((k) => k.kind));
  const forms: FormDecl[] = [];
  for (const s of sources) {
    if (s.data.forms === undefined) continue;
    if (s.type === "routine") { problems.push(`${s.file}: forms are declared in an app definition, never a routine`); continue; }
    const found = checkForms(s, s.data.forms, kindNames);
    problems.push(...found.problems);
    for (const f of found.forms) {
      const taken = forms.find((x) => x.key === f.key);
      if (taken) problems.push(`${s.file}: form "${f.key}" is already declared by ${taken.source}`);
      else forms.push(f);
    }
  }
  return { kinds, forms, routines, tablesByApp, problems };
}
