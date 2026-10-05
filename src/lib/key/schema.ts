import { parse } from "yaml";

export type FieldType =
  | "text" | "number" | "date" | "select" | "multi_select" | "checkbox"
  | "user" | "multi_user" | "url" | "email" | "attachment";

/** The SQL form of each app field type. */
export const SQL_TYPE: Record<FieldType, string> = {
  text: "text",
  number: "numeric",
  date: "date",
  select: "text",
  multi_select: "text[]",
  checkbox: "boolean",
  user: "text",
  multi_user: "text[]",
  url: "text",
  email: "text",
  attachment: "text",
};

const SYSTEM_COLUMNS: Record<string, string> = { id: "uuid", created_at: "timestamptz", updated_at: "timestamptz" };
const CONSTRAINT_WORD = /\b(not|null|default|primary|references|unique|check|constraint|generated|collate)\b/i;
const TABLE_CONSTRAINT = new Set(["primary", "unique", "check", "constraint", "foreign", "exclude"]);

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function stripComments(sql: string): string {
  let out = "";
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    if (c === "'") { // string literal: copy through, '' is an escaped quote
      let j = i + 1;
      while (j < sql.length && !(sql[j] === "'" && sql[j + 1] !== "'")) j += sql[j] === "'" ? 2 : 1;
      out += sql.slice(i, j + 1);
      i = j + 1;
    } else if (c === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i++;
    } else if (c === "/" && sql[i + 1] === "*") {
      const end = sql.indexOf("*/", i + 2);
      i = end < 0 ? sql.length : end + 2;
      out += " ";
    } else { out += c; i++; }
  }
  return out;
}

/** Split at commas or semicolons that sit outside parentheses and quotes. */
function splitTop(s: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0, cur = "", quote = "";
  for (const c of s) {
    if (quote) { cur += c; if (c === quote) quote = ""; continue; }
    if (c === "'" || c === '"') { quote = c; cur += c; continue; }
    if (c === "(") depth++;
    if (c === ")") depth--;
    if (c === sep && depth === 0) { parts.push(cur); cur = ""; } else cur += c;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

const unquote = (id: string) => id.replace(/^"|"$/g, "").toLowerCase();
const IDENT = String.raw`(?:"[^"]+"|[\w$]+)`;
const QNAME = String.raw`(${IDENT}(?:\.${IDENT})?)`; // optional schema, either part quoted
const tableName = (raw: string) => unquote(/("[^"]+"|[\w$]+)$/.exec(raw)?.[1] ?? raw);

function normalizeType(raw: string): string {
  let t = raw.toLowerCase().replace(/\(\s*[\d\s,]+\)/g, "").replace(/\s+/g, " ").trim();
  t = t.replace(/\s*\[\s*\]/g, "[]");
  const aliases: Record<string, string> = {
    "timestamp with time zone": "timestamptz", bool: "boolean", "double precision": "numeric", decimal: "numeric",
    int: "integer", int4: "integer", varchar: "text", "character varying": "text",
  };
  const arr = t.endsWith("[]");
  const base = arr ? t.slice(0, -2).trim() : t;
  return (aliases[base] ?? base) + (arr ? "[]" : "");
}

/** `name type ...` to [name, normalized type], or null for a table constraint. */
function columnOf(def: string): [string, string] | null {
  const m = /^("[^"]+"|[A-Za-z_][\w$]*)\s+([\s\S]*)$/.exec(def.trim());
  if (!m) return null;
  if (TABLE_CONSTRAINT.has(m[1].toLowerCase()) || /^foreign\b/i.test(def.trim())) return null;
  const rest = m[2];
  const masked = rest.replace(/'(?:[^']|'')*'|"[^"]*"/g, (q) => " ".repeat(q.length));
  const cut = masked.search(CONSTRAINT_WORD);
  const type = (cut < 0 ? rest : rest.slice(0, cut)).trim();
  return type ? [unquote(m[1]), normalizeType(type)] : null;
}

/** Table to column to lowercased type, from create table and alter table add column statements. */
export function tablesFromSql(sql: string): Record<string, Record<string, string>> {
  const tables: Record<string, Record<string, string>> = {};
  for (const stmt of splitTop(stripComments(sql), ";")) {
    const create = new RegExp(String.raw`^create\s+(?:unlogged\s+|temp(?:orary)?\s+)?table\s+(?:if\s+not\s+exists\s+)?${QNAME}\s*\(([\s\S]*)\)\s*[^)]*$`, "i").exec(stmt);
    if (create) {
      const cols = (tables[tableName(create[1])] ??= {});
      for (const part of splitTop(create[2], ",")) {
        const c = columnOf(part);
        if (c) cols[c[0]] = c[1];
      }
      continue;
    }
    const alter = new RegExp(String.raw`^alter\s+table\s+(?:only\s+)?(?:if\s+exists\s+)?${QNAME}\s+([\s\S]*)$`, "i").exec(stmt);
    if (alter) {
      const cols = (tables[tableName(alter[1])] ??= {});
      for (const part of splitTop(alter[2], ",")) {
        const add = /^add\s+column\s+(?:if\s+not\s+exists\s+)?([\s\S]*)$/i.exec(part);
        const c = add && columnOf(add[1]);
        if (c) cols[c[0]] = c[1];
      }
    }
  }
  return tables;
}

/** Problems where an app's migrations drift from its definition. Never throws. */
export function compareDefinition(file: string, definitionText: string, migrationsSql: string[]): string[] {
  let def: unknown;
  try { def = parse(definitionText); } catch { return []; } // checkDefinition reports invalid YAML
  if (!isObj(def) || !Array.isArray(def.entities)) return [];
  const tables = tablesFromSql(migrationsSql.join("\n;\n"));
  const problems: string[] = [];
  const known = new Set<string>();
  for (const e of def.entities) {
    if (!isObj(e) || typeof e.key !== "string") continue;
    const entity = e.key;
    known.add(entity.toLowerCase());
    const bad = (m: string) => problems.push(`${file}: entity "${entity}": ${m}`);
    const want: Record<string, string> = { ...SYSTEM_COLUMNS };
    for (const f of Array.isArray(e.fields) ? e.fields : []) {
      if (!isObj(f) || typeof f.key !== "string") continue;
      const sqlType = Object.hasOwn(SQL_TYPE, String(f.type)) ? SQL_TYPE[f.type as FieldType] : null;
      if (sqlType === null) { bad(`field "${f.key}" has unknown type "${String(f.type)}"`); continue; }
      want[f.key.toLowerCase()] = sqlType;
    }
    const have = tables[entity.toLowerCase()];
    if (!have) { bad(`no table "${entity}" in the migrations`); continue; }
    for (const [col, type] of Object.entries(want)) {
      if (!(col in have)) bad(`column "${col}" (${type}) is missing from the migrations`);
      else if (have[col] !== type) bad(`column "${col}" is ${have[col]} in the migrations but ${type} in the definition`);
    }
    for (const col of Object.keys(have)) {
      if (!(col in want)) bad(`column "${col}" is in the migrations but not in the definition`);
    }
  }
  for (const t of Object.keys(tables)) {
    if (!known.has(t)) problems.push(`${file}: table "${t}" in the migrations has no entity in the definition`);
  }
  return problems;
}

const CREATE_TABLE = new RegExp(String.raw`^create\s+(?:unlogged\s+)?table\s+(?:if\s+not\s+exists\s+)?${QNAME}`, "i");
const RLS_ON = new RegExp(String.raw`^alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?${QNAME}\s+enable\s+row\s+level\s+security$`, "i");
const RLS_OFF = /\b(?:disable|no\s+force)\s+row\s+level\s+security\b/i;
const POLICY = new RegExp(String.raw`^create\s+policy\s+(?:"[^"]+"|[\w$]+)\s+on\s+${QNAME}([\s\S]*)$`, "i");
const ANONYMOUS = new Set(["anon", "public"]);

/** Problems where an app's migrations leave a table open to anonymous visitors. Never throws. */
export function rlsProblems(file: string, migrationsSql: string[]): string[] {
  const created = new Set<string>();
  const enabled = new Set<string>();
  const problems: string[] = [];
  const masked = (s: string) => s.replace(/'(?:[^']|'')*'/g, "''");
  for (const raw of splitTop(stripComments(migrationsSql.join("\n;\n")), ";")) {
    const stmt = masked(raw).trim();
    const create = CREATE_TABLE.exec(stmt);
    if (create) { created.add(tableName(create[1])); continue; }
    const on = RLS_ON.exec(stmt);
    if (on) { enabled.add(tableName(on[1])); continue; }
    if (/^alter\s+table\b/i.test(stmt) && RLS_OFF.test(stmt)) {
      problems.push(`${file}: a migration turns row level security off. App tables keep it on.`);
      continue;
    }
    const policy = POLICY.exec(stmt);
    if (policy) {
      const to = /\bto\s+([\s\S]*?)(?=\busing\b|\bwith\s+check\b|$)/i.exec(policy[2]);
      const roles = to ? to[1].split(",").map((r) => unquote(r.trim())) : ["public"];
      if (roles.some((r) => ANONYMOUS.has(r))) problems.push(`${file}: the policy on "${tableName(policy[1])}" opens it to anonymous visitors. Name a signed in role with "to", never anon or public.`);
      continue;
    }
    const grant = /^grant\s[\s\S]*?\bto\s+([\s\S]*)$/i.exec(stmt);
    if (grant && grant[1].split(",").some((r) => ANONYMOUS.has(unquote(r.trim().split(/\s+/)[0] ?? "")))) {
      problems.push(`${file}: a grant to anon or public opens a table to anonymous visitors. Remove it.`);
    }
  }
  for (const t of [...created].sort()) {
    if (!enabled.has(t)) problems.push(`${file}: table "${t}" needs row level security. Add "alter table ${t} enable row level security" to a migration in this app.`);
  }
  return problems;
}
