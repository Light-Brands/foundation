import { existsSync } from "node:fs";
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
  uses: string[]; // uses_apps: every app named there, required or optional, whose tables this source's checks may read (K5)
  optionalUses?: string[]; // the apps in uses_apps marked optional: true, which need not be installed
  data: Record<string, unknown>;
};

export type Declarations = {
  kinds: CardKindDecl[];
  forms: FormDecl[];
  checks: CheckDecl[];
  drafts: DraftDecl[];
  routines: string[];
  tablesByApp: Record<string, string[]>;
  problems: string[];
};

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export const insideKey = (rel: string): boolean => rel !== "" && !path.isAbsolute(rel) && !rel.includes("\\") && !rel.split("/").includes("..");

// Jobs whose decisions belong to the owner alone: every Finance job, contracts, the team roster and hiring.
export const OWNER_ONLY_JOBS: readonly string[] = ["money/*", "sell/contracts", "team/people", "team/hiring"];
const ownerOnly = (category: string, sub: string): boolean => OWNER_ONLY_JOBS.includes(`${category}/*`) || OWNER_ONLY_JOBS.includes(`${category}/${sub}`);

/**
 * uses_apps lists app slugs, each either required (a plain slug, or {app: <slug>}) or optional
 * ({app: <slug>, optional: true}). An optional app need not be installed: a check reading it waits.
 */
export function parseUses(v: unknown): { uses: string[]; optional: string[]; problems: string[] } {
  const uses: string[] = [];
  const optional: string[] = [];
  const problems: string[] = [];
  if (v === undefined) return { uses, optional, problems };
  if (!Array.isArray(v)) return { uses, optional, problems: ["uses_apps must be a list of app slugs"] };
  for (const e of v) {
    if (typeof e === "string") { uses.push(e); continue; }
    if (!isObj(e) || typeof e.app !== "string") { problems.push("uses_apps entries are app slugs, or {app: <slug>, optional: true}"); continue; }
    if (e.optional !== undefined && typeof e.optional !== "boolean") problems.push(`uses_apps "${e.app}" has optional set to something other than true or false`);
    if (Object.keys(e).some((k) => k !== "app" && k !== "optional")) problems.push(`uses_apps "${e.app}" holds only app and optional`);
    uses.push(e.app);
    if (e.optional === true) optional.push(e.app);
  }
  return { uses, optional, problems };
}

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
/** The longest name a form may ask for: CARD_LIMITS.title and CARD_LIMITS.contactName are both 200. */
export const NAME_MAX = 200;

/** A select's options read at render from an app table: the rows where `where` is true, shown by `label`. */
export type OptionsFrom = { app: string; entity: string; label: string; where: string | null };
export type FormField = { key: string; label: string; type: FormFieldType; required: boolean; max: number; options: string[]; options_from?: OptionsFrom };
export type FormDecl = { key: string; title: string; intro: string; submit: string; thanks: string; card_kind: string; fields: FormField[]; source: string };

function words(at: string, name: string, v: unknown, min: number, max: number, bad: (m: string) => void): string {
  const s = str(v).trim();
  if (s.length < min || s.length > max) bad(`${name} must be ${min} to ${max} characters`);
  else if (!copyOk(s)) bad(`${name} ${COPY_RULE}`);
  return s;
}

/** Each installed app's entities, and each entity's fields with their types, as definition.yaml declares them. */
export type FieldsByApp = Record<string, Record<string, Record<string, string>>>;
/** What a form's options_from may read: the declaring app's uses_apps and the installed apps' fields. */
export type FormContext = { uses: readonly string[]; fieldsByApp: FieldsByApp };

const OPTIONS_FROM_KEYS = ["app", "entity", "label", "where"];
const LABEL_TYPES = ["text", "select", "email", "url"];

function checkOptionsFrom(v: unknown, ctx: FormContext | undefined, fb: (m: string) => void): OptionsFrom | null {
  let issues = 0;
  const bad = (m: string) => { issues += 1; fb(m); };
  if (!isObj(v)) { bad("options_from must be a mapping with app, entity, label and where"); return null; }
  if (Object.keys(v).some((k) => !OPTIONS_FROM_KEYS.includes(k))) bad("options_from holds only app, entity, label and where");
  const app = str(v.app);
  const entity = str(v.entity);
  const label = str(v.label);
  const where = v.where === undefined || v.where === null ? null : str(v.where);
  if (!SLUG.test(app)) { bad("options_from app must be an app slug"); return null; }
  if (!ctx || !ctx.uses.includes(app)) { bad(`options_from app "${app}" must be listed in this app's uses_apps`); return null; }
  const entities = ctx.fieldsByApp[app];
  if (!entities) { bad(`options_from app "${app}" is not installed`); return null; }
  const fields = FIELD_KEY.test(entity) && Object.hasOwn(entities, entity) ? entities[entity] : null;
  if (!fields) { bad(`options_from entity "${entity}" is not a table of ${app}`); return null; }
  if (!FIELD_KEY.test(label) || !Object.hasOwn(fields, label) || !LABEL_TYPES.includes(fields[label])) bad(`options_from label "${label}" is not a text field of ${entity}`);
  if (where !== null && (!FIELD_KEY.test(where) || !Object.hasOwn(fields, where) || fields[where] !== "checkbox")) bad(`options_from where "${where}" is not a checkbox field of ${entity}`);
  return issues ? null : { app, entity, label, where };
}

export function checkForms(src: Pick<DeclSource, "file" | "slug">, raw: unknown, kindNames: ReadonlySet<string>, ctx?: FormContext): { forms: FormDecl[]; problems: string[] } {
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
      let from: OptionsFrom | null = null;
      if (x.options_from !== undefined) {
        if (t !== "select") fb("options_from is only for a select field");
        else if (x.options !== undefined) fb("a select takes options or options_from, never both");
        else from = checkOptionsFrom(x.options_from, ctx, fb);
      } else if (t === "select" && (options.length < 1 || options.length > 30 || options.some((o) => !o || o.length > 80 || !copyOk(o)))) fb("select needs 1 to 30 options, each 1 to 80 characters");
      fields.push({ key: fk, label, type: t, required: x.required === true, max: max as number, options: t === "select" && !from ? options : [], ...(from ? { options_from: from } : {}) });
    });
    const has = (k: string, t: FormFieldType) => fields.some((x) => x.key === k && x.type === t && x.required);
    if (!has("name", "text")) bad("needs a required name field of type text");
    if (!has("email", "email")) bad("needs a required email field of type email");
    if (fields.some((x) => x.key === "phone" && x.type !== "phone")) bad("a phone field must have type phone");
    if (fields.some((x) => x.key === "email" && x.max > 254)) bad("an email field's max is at most 254");
    // The name makes the contact and starts the card title, so it can never be longer than either holds.
    if (fields.some((x) => x.key === "name" && x.max > NAME_MAX)) bad(`a name field's max is at most ${NAME_MAX}`);
    if (problems.length === before) forms.push({ key, title, intro, submit, thanks, card_kind: kind, fields, source: src.slug });
  });
  return { forms, problems };
}

function usesOf(v: unknown): { uses: string[]; optionalUses: string[] } {
  const { uses, optional } = parseUses(v);
  return { uses, optionalUses: optional };
}

/** Every installed app definition and routine front matter key.yaml names. Missing or broken files are skipped here, because checkKeyFolder reports them. */
export async function readSources(root: string): Promise<{ sources: DeclSource[]; routines: string[]; tablesByApp: Record<string, string[]>; fieldsByApp: FieldsByApp; problems: string[] }> {
  const key = path.join(root, "key");
  const sources: DeclSource[] = [];
  const routines: string[] = [];
  const tablesByApp: Record<string, string[]> = {};
  const fieldsByApp: FieldsByApp = {};
  const problems: string[] = [];
  let ring: unknown;
  let ringText: string;
  try { ringText = await readFile(path.join(key, "key.yaml"), "utf8"); } catch { return { sources, routines, tablesByApp, fieldsByApp, problems }; }
  try { ring = parse(ringText); } catch { problems.push("key/key.yaml: could not be read as YAML"); return { sources, routines, tablesByApp, fieldsByApp, problems }; }
  if (!isObj(ring)) return { sources, routines, tablesByApp, fieldsByApp, problems };
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
    fieldsByApp[slug] = Object.fromEntries(list(def.entities).filter(isObj).filter((e) => str(e.key)).map((e) => [
      str(e.key), Object.fromEntries(list(e.fields).filter(isObj).filter((f) => str(f.key)).map((f) => [str(f.key), str(f.type)])),
    ]));
    sources.push({ type: "app", slug, file: `key/${rel}`, category: str(def.category), entryCategory: isObj(a) ? str(a.category) : "", app: slug, ...usesOf(def.uses_apps), data: def });
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
    sources.push({ type: "routine", slug, file: `key/${rel}`, category: str(fm.data.category), entryCategory: isObj(r) ? str(r.category) : "", app: str(fm.data.app) || null, ...usesOf(fm.data.uses_apps), data: fm.data });
  }
  return { sources, routines, tablesByApp, fieldsByApp, problems };
}

export async function readDeclarations(root: string): Promise<Declarations> {
  const { sources, routines, tablesByApp, fieldsByApp, problems: unreadable } = await readSources(root);
  const problems: string[] = [...unreadable];
  const kinds: CardKindDecl[] = [...CORE_CARD_KINDS];
  for (const s of sources) {
    if (s.type === "routine" && s.app !== null && !(s.app in tablesByApp)) problems.push(`${s.file}: app "${s.app}" is not installed`);
    for (const m of parseUses(s.data.uses_apps).problems) problems.push(`${s.file}: ${m}`);
    for (const u of s.uses) {
      if (!SLUG.test(u)) problems.push(`${s.file}: uses_apps "${u}" must be an app slug`);
      else if (!(u in tablesByApp) && !(s.optionalUses ?? []).includes(u)) problems.push(`${s.file}: uses_apps names "${u}", which is not installed. Install it first, as the entry's uses say`);
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
    const found = checkForms(s, s.data.forms, kindNames, { uses: s.uses, fieldsByApp });
    problems.push(...found.problems);
    for (const f of found.forms) {
      const taken = forms.find((x) => x.key === f.key);
      if (taken) problems.push(`${s.file}: form "${f.key}" is already declared by ${taken.source}`);
      else forms.push(f);
    }
  }
  const checks: CheckDecl[] = [];
  const drafts: DraftDecl[] = [];
  for (const s of sources) {
    if (s.data.checks !== undefined) {
      const found = checkChecks(s, s.data.checks, { kindNames, tablesByApp });
      problems.push(...found.problems);
      for (const c of found.checks) {
        if (checks.some((x) => x.slug === c.slug)) problems.push(`${s.file}: check "${c.slug}" is already declared`);
        else checks.push(c);
      }
    }
    if (s.data.draft !== undefined) {
      if (s.type === "app") { problems.push(`${s.file}: a drafting command is declared in a routine, never an app`); continue; }
      const found = checkDraftBlock(s, s.data.draft, (p) => existsSync(path.join(root, p)));
      problems.push(...found.problems);
      if (found.draft) drafts.push(found.draft);
    }
  }
  return { kinds, forms, checks, drafts, routines, tablesByApp, problems };
}

// Every table the Foundation itself creates. A check may read only the few in CHECK_CORE_TABLES.
export const CORE_TABLES = ["business_profile", "contacts", "inbox_items", "pause", "form_hits", "form_counts", "webhook_events", "check_runs", "outbox", "opt_outs", "connections", "accounts"];

export const CHECK_PERIODS = ["day", "week"] as const;
// Core tables a check may read. K7 appends "connections" when that table exists. The outbox stays out: it holds message bodies.
export const CHECK_CORE_TABLES: readonly string[] = ["contacts", "inbox_items", "business_profile", "check_runs"];
export const CHECK_FUNCTIONS: ReadonlySet<string> = new Set([
  "count", "sum", "min", "max", "avg", "coalesce", "nullif", "greatest", "least", "lower", "upper", "trim", "btrim",
  "ltrim", "rtrim", "length", "char_length", "concat", "concat_ws", "format", "left", "right", "replace", "split_part",
  "string_agg", "array_agg", "array_to_string", "array_length", "cardinality", "to_char", "date_trunc", "date_part",
  "make_interval", "age", "now", "abs", "round", "floor", "ceil", "ceiling", "bool_or", "bool_and", "jsonb_build_object", "jsonb_agg",
]);
// Words that may stand before an opening parenthesis without being a function call.
export const SQL_WORDS: ReadonlySet<string> = new Set([
  "and", "or", "not", "in", "exists", "any", "all", "some", "filter", "over", "values", "on", "using", "from", "join",
  "where", "select", "when", "then", "else", "by", "as", "with", "case", "numeric", "decimal", "between", "having", "is", "distinct", "row", "cast", "lateral",
]);
const WRITE_WORDS = /\b(insert|update|delete|merge|truncate|drop|alter|create|grant|revoke|copy|call|do|execute|prepare|deallocate|listen|notify|unlisten|set|reset|lock|vacuum|analyze|cluster|reindex|refresh|comment|security|into|nextval|setval)\b/i;
const TABLE_NAME = /^[a-z][a-z0-9_]*$/;

/**
 * slug is the check's full slug, <app or routine slug>/<key>. absent names the optional apps in uses_apps
 * that are not installed, when the check reads a table none of the installed apps or the core list holds:
 * such a check waits, and the runner records a skip for it each period and raises no card.
 */
export type CheckDecl = {
  slug: string; key: string; name: string; period: "day" | "week"; card_kind: string; reads: string[]; sql: string; source: string;
  /** Every table this check's file may read: its app's tables, its installed uses_apps' tables and CHECK_CORE_TABLES. The run refuses anything else. */
  may_read: string[];
  absent?: string[];
};
export type DraftDecl = { routine: string; handler: string; subcommands: string[] };

/**
 * Reads SQL the way Postgres's scanner does: comments (nested block comments too) become spaces, each
 * string literal becomes '', a quoted name becomes the word q, and everything else folds to lower case.
 * Escape strings (E'...') are read with their backslash escapes. Unicode strings, quoted names, dollar
 * quoting and an unclosed comment or string are reported, because each one can make text read one way here and another way in Postgres.
 */
export function normalizeSql(sql: string): { text: string; problems: string[] } {
  const problems = new Set<string>();
  let out = "";
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    const next = sql[i + 1];
    if (c === "-" && next === "-") {
      while (i < n && sql[i] !== "\n") i++;
      out += " ";
      continue;
    }
    if (c === "/" && next === "*") {
      let depth = 1;
      i += 2;
      while (i < n && depth > 0) {
        if (sql[i] === "/" && sql[i + 1] === "*") { depth++; i += 2; }
        else if (sql[i] === "*" && sql[i + 1] === "/") { depth--; i += 2; }
        else i++;
      }
      if (depth > 0) problems.add("sql has an unclosed comment");
      out += " ";
      continue;
    }
    if (c === "'") {
      // out is already lower case. A lone e just before the quote makes an escape string, where a backslash
      // escapes the next character (E'\n', E'it\'s'). A lone u& makes a Unicode string, which is refused.
      const escape = /(^|[^a-z0-9_$])e$/.test(out);
      if (escape) out = out.slice(0, -1);
      if (/(^|[^a-z0-9_$])u&$/.test(out)) problems.add("sql must not use Unicode strings (U&'...')");
      i++;
      let closed = false;
      while (i < n) {
        if (escape && sql[i] === "\\") { i += 2; continue; }
        if (sql[i] === "'" && sql[i + 1] === "'") { i += 2; continue; }
        if (sql[i] === "'") { closed = true; i++; break; }
        i++;
      }
      if (!closed) problems.add("sql has an unclosed string");
      out += "''";
      continue;
    }
    if (c === '"') {
      problems.add("sql must not use quoted identifiers");
      i++;
      while (i < n) {
        if (sql[i] === '"' && sql[i + 1] === '"') { i += 2; continue; }
        if (sql[i] === '"') { i++; break; }
        i++;
      }
      out += " q ";
      continue;
    }
    if (c === "$") {
      const tag = /^\$(?:[A-Za-z_\u0080-\uffff][A-Za-z0-9_\u0080-\uffff]*)?\$/.exec(sql.slice(i));
      if (tag && !/[A-Za-z0-9_]$/.test(out)) {
        problems.add("sql must not use dollar quoting");
        const end = sql.indexOf(tag[0], i + tag[0].length);
        i = end === -1 ? n : end + tag[0].length;
        out += "''";
        continue;
      }
    }
    out += c.toLowerCase();
    i++;
  }
  return { text: out, problems: [...problems] };
}

export function checkSqlProblems(sql: string, reads: readonly string[]): string[] {
  const norm = normalizeSql(sql);
  const p = new Set<string>(norm.problems);
  const text = norm.text.trim().replace(/;\s*$/, "");
  if (text.includes(";")) p.add("sql must be one statement");
  if (!/^(select|with)\b/.test(text)) p.add("sql must start with select or with");
  const write = WRITE_WORDS.exec(text);
  if (write) p.add(`sql must only read: "${write[1].toLowerCase()}" is not allowed`);
  if (/\bfor\s+(no\s+key\s+update|update|share|key\s+share)\b/.test(text)) p.add("sql must only read: it may not lock rows");
  if (/\btable\b/.test(text)) p.add("sql must name each table with from or join");
  if (/\b(pg_[a-z0-9_]*|information_schema)\b/.test(text)) p.add("sql must not read system catalogs");
  for (const m of text.matchAll(/\b([a-z_][a-z0-9_$]*)\s*\.\s*([a-z_][a-z0-9_$]*)\s*\(/g)) p.add(`sql must call functions without a schema ("${m[1]}.${m[2]}")`);
  for (const m of text.matchAll(/\b([a-z_][a-z0-9_$]*)\s*\(/g)) {
    const f = m[1];
    if (!CHECK_FUNCTIONS.has(f) && !SQL_WORDS.has(f)) p.add(`sql calls "${f}", which checks may not use`);
  }
  for (const m of text.matchAll(/\$(\d+)(::[a-z]+)?/g)) {
    if (m[1] !== "1" && m[1] !== "2") p.add("sql may use only $1::date and $2::timestamptz");
    else if (m[1] === "1" && m[2] !== "::date") p.add("write $1 as $1::date");
    else if (m[1] === "2" && m[2] !== "::timestamptz") p.add("write $2 as $2::timestamptz");
  }
  // Every table comes in through from or join, so a comma list of tables (an old-style join) is refused.
  if (/\bfrom\s+[a-z_][a-z0-9_]*(\s+(as\s+)?(?!where\b|join\b|left\b|right\b|inner\b|full\b|cross\b|group\b|order\b|limit\b|on\b)[a-z_][a-z0-9_]*)?\s*,/i.test(text)) p.add("sql must join tables with join, never a comma");
  const ctes = new Set([...text.matchAll(/\b([a-z_][a-z0-9_]*)\s+as\s*\(/gi)].map((m) => m[1].toLowerCase()));
  for (const m of text.matchAll(/\b(?:from|join)\s+([A-Za-z_][A-Za-z0-9_]*)(\s*\.\s*[A-Za-z_][A-Za-z0-9_]*)?/gi)) {
    const t = m[1].toLowerCase();
    if (m[2]) { p.add(`sql must name tables without a schema ("${t}${m[2].replace(/\s/g, "")}")`); continue; }
    if (t === "lateral" || ctes.has(t)) continue;
    if (!reads.includes(t)) p.add(`sql reads "${t}", which is not in reads`);
  }
  return [...p];
}

export function checkChecks(
  src: Pick<DeclSource, "file" | "slug" | "type" | "app" | "uses" | "optionalUses">,
  raw: unknown,
  ctx: { kindNames: ReadonlySet<string>; tablesByApp: Record<string, string[]> },
): { checks: CheckDecl[]; problems: string[] } {
  const checks: CheckDecl[] = [];
  const problems: string[] = [];
  if (raw === undefined) return { checks, problems };
  if (!Array.isArray(raw)) return { checks, problems: [`${src.file}: checks must be a list`] };
  if (src.type === "routine" && !src.app) problems.push(`${src.file}: a routine that declares checks names its app with app: <slug>`);
  const own = src.app ? ctx.tablesByApp[src.app] ?? [] : [];
  const used = src.uses.flatMap((u) => ctx.tablesByApp[u] ?? []);
  const allowed = new Set<string>([...own, ...used, ...CHECK_CORE_TABLES]);
  // An optional app that is not installed has no known tables. A table no installed app and no core list
  // holds may be one of its tables, so the check waits for it. A known table never waits.
  const absentApps = (src.optionalUses ?? []).filter((u) => !(u in ctx.tablesByApp));
  const known = new Set<string>([...Object.values(ctx.tablesByApp).flat(), ...CORE_TABLES]);
  const mayWait = (t: string) => absentApps.length > 0 && TABLE_NAME.test(t) && !t.startsWith("pg_") && !known.has(t);
  const coreKinds = new Set(CORE_CARD_KINDS.map((k) => k.kind));
  const keys = new Set<string>();
  raw.forEach((c, i) => {
    const before = problems.length;
    const bad = (m: string) => problems.push(`${src.file}: checks[${i}] ${m}`);
    if (!isObj(c)) { bad("must be a mapping"); return; }
    const key = str(c.key);
    if (!SLUG.test(key)) bad("key must be a lowercase hyphenated slug");
    else if (keys.has(key)) bad(`key "${key}" repeats`);
    keys.add(key);
    const name = words("", "name", c.name, 1, 80, bad);
    const period = str(c.period);
    if (!(CHECK_PERIODS as readonly string[]).includes(period)) bad("period must be day or week");
    const kind = str(c.card_kind);
    if (coreKinds.has(kind)) bad(`card_kind "${kind}" is a core kind. Declare a kind for this job`);
    else if (!ctx.kindNames.has(kind)) bad(`card_kind "${kind}" is not declared in the Key`);
    const reads = list(c.reads).map(str);
    if (reads.length === 0) bad("reads must list the tables the check reads");
    let waits = false;
    for (const t of reads) {
      if (allowed.has(t)) continue;
      if (mayWait(t)) { waits = true; continue; }
      bad(`reads "${t}", which is not this app's table, a table of an app in uses_apps, or a core table checks may read`);
    }
    const sql = str(c.sql).trim();
    if (sql.length < 1 || sql.length > 4000) bad("sql must be 1 to 4000 characters");
    else for (const m of checkSqlProblems(sql, reads)) bad(m);
    if (problems.length === before) {
      checks.push({
        slug: `${src.slug}/${key}`, key, name, period: period as "day" | "week", card_kind: kind, reads, sql, source: src.slug, may_read: [...allowed],
        ...(waits ? { absent: absentApps } : {}),
      });
    }
  });
  return { checks, problems };
}

const HANDLER_PATH = /^(src|modules)\/[A-Za-z0-9_./-]+\.ts$/;

export function checkDraftBlock(src: Pick<DeclSource, "file" | "slug">, raw: unknown, exists: (repoPath: string) => boolean): { draft: DraftDecl | null; problems: string[] } {
  if (!isObj(raw)) return { draft: null, problems: [`${src.file}: draft must be a mapping with handler and subcommands`] };
  const problems: string[] = [];
  const bad = (m: string) => problems.push(`${src.file}: draft ${m}`);
  const handler = str(raw.handler);
  if (!HANDLER_PATH.test(handler) || handler.split("/").some((seg) => seg === "" || seg === "." || seg === "..")) bad("handler must be a .ts file under src/ or modules/, written from the top of the repository");
  else if (!exists(handler)) bad(`handler ${handler} does not exist`);
  const subs = list(raw.subcommands).map(str);
  if (subs.length < 1 || subs.length > 12) bad("subcommands must list 1 to 12 steps");
  else if (subs.some((x) => !SLUG.test(x))) bad("each subcommand must be a lowercase hyphenated slug");
  else if (new Set(subs).size !== subs.length) bad("subcommands must not repeat");
  return problems.length ? { draft: null, problems } : { draft: { routine: src.slug, handler, subcommands: subs }, problems };
}
