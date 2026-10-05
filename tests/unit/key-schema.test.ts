import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, cpSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { FIELD_TYPES, checkKeyFolder } from "@/lib/key/formats";
import { SQL_TYPE, tablesFromSql, compareDefinition, rlsProblems, personFields, personFieldProblems } from "@/lib/key/schema";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";

const root = process.cwd();
const appDir = (name: string) => path.join(root, "tests/fixtures/key-apps", name);
const load = (name: string) => {
  const dir = appDir(name);
  const sql = readdirSync(path.join(dir, "migrations")).sort().map((f) => readFileSync(path.join(dir, "migrations", f), "utf8"));
  return { def: readFileSync(path.join(dir, "definition.yaml"), "utf8"), sql };
};

describe("SQL_TYPE", () => {
  it("holds the SQL form of every field type", () => {
    expect(SQL_TYPE).toEqual({
      text: "text", select: "text", url: "text", email: "text", user: "text", attachment: "text",
      number: "numeric", date: "date", checkbox: "boolean", multi_select: "text[]", multi_user: "text[]",
    });
  });
  it("covers exactly the field types", () => {
    expect(Object.keys(SQL_TYPE).sort()).toEqual([...FIELD_TYPES].sort());
  });
});

describe("tablesFromSql", () => {
  it("reads create table, alter table add column, and skips constraints", () => {
    const t = tablesFromSql(`
      -- a comment, with a comma
      CREATE TABLE IF NOT EXISTS public."Jobs" (
        id uuid primary key,
        amount numeric(10, 2) not null default 0,
        tags text[] default '{}',
        note text default 'a, b',
        at timestamp with time zone,
        primary key (id),
        constraint amt check (amount > 0),
        unique (id, amount)
      );
      alter table jobs add column if not exists owner text, add column done boolean not null default false;
    `);
    expect(t).toEqual({
      jobs: { id: "uuid", amount: "numeric", tags: "text[]", note: "text", at: "timestamptz", owner: "text", done: "boolean" },
    });
  });
});

describe("tablesFromSql, columns without spaces before constraints", () => {
  it("cuts the type where the constraint starts", () => {
    const t = tablesFromSql(`create table k (
      s text check(s in ('a','b')),
      n numeric check(n>0),
      d text default'z',
      e int default(0),
      q text default 'not null, check'
    );`);
    expect(t.k).toEqual({ s: "text", n: "numeric", d: "text", e: "integer", q: "text" });
  });
});

describe("tablesFromSql, schema-qualified names", () => {
  it("reads a quoted schema and table in create and alter", () => {
    const t = tablesFromSql(`create table "public"."jobs" (id uuid);
      alter table "public"."jobs" add column owner text;
      create table public.other (id uuid);
      alter table "public".other add column x date;`);
    expect(t).toEqual({ jobs: { id: "uuid", owner: "text" }, other: { id: "uuid", x: "date" } });
  });
});

describe("compareDefinition", () => {
  it("passes the good app", () => {
    const { def, sql } = load("good");
    expect(compareDefinition("good/definition.yaml", def, sql)).toEqual([]);
  });
  it("flags a missing column, an extra column and a wrong type", () => {
    const { def, sql } = load("drifted");
    const p = compareDefinition("drifted/definition.yaml", def, sql);
    expect(p).toHaveLength(3);
    for (const m of p) expect(m.startsWith("drifted/definition.yaml: entity \"bookings\"")).toBe(true);
    expect(p.find((m) => /column "starts"/.test(m))).toMatch(/missing/);
    expect(p.find((m) => /column "nickname"/.test(m))).toMatch(/not in the definition/);
    expect(p.find((m) => /column "paid"/.test(m))).toMatch(/boolean.*text|text.*boolean/);
  });
  it("flags a missing table", () => {
    const { def } = load("good");
    expect(compareDefinition("d.yaml", def, [])).toEqual([expect.stringMatching(/entity "bookings".*no table/)]);
  });
  it("flags a table no entity describes", () => {
    const { def, sql } = load("good");
    const p = compareDefinition("d.yaml", def, [...sql, "create table stray (id uuid);"]);
    expect(p).toEqual([expect.stringMatching(/table "stray".*no entity/)]);
  });
});

describe("every app under key/ matches its definition", () => {
  it("has no drift", async () => {
    expect(await checkKeyFolder(root)).toEqual([]);
  });
  it("is checked from key/apps/<app>/migrations (a drifted app fails the folder check)", async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), "key-apps-"));
    cpSync(path.join(root, "key"), path.join(tmp, "key"), { recursive: true });
    mkdirSync(path.join(tmp, "key/apps"), { recursive: true });
    cpSync(appDir("drifted"), path.join(tmp, "key/apps/drifted-app"), { recursive: true });
    expect(existsSync(path.join(tmp, "key/apps/drifted-app/definition.yaml"))).toBe(true);
    const problems = await checkKeyFolder(tmp);
    expect(problems.filter((m) => m.includes("drifted-app/definition.yaml") && m.includes("entity \"bookings\""))).toHaveLength(3);
  });
});

const TABLE = "create table if not exists notes (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now());";

describe("row level security in app migrations", () => {
  it("passes a migration that turns it on", () => {
    expect(rlsProblems("m", [`${TABLE}\nalter table notes enable row level security;`])).toEqual([]);
  });
  it("fails a table without it, naming the line to add", () => {
    expect(rlsProblems("m", [TABLE])).toEqual([
      'm: table "notes" needs row level security. Add "alter table notes enable row level security" to a migration in this app.',
    ]);
  });
  it("accepts it in a later migration file of the same app", () => {
    expect(rlsProblems("m", [TABLE, "alter table if exists only notes enable row level security;"])).toEqual([]);
  });
  it("fails a policy for anon, for public, or with no role", () => {
    for (const p of [
      "create policy open on notes for select to anon using (true);",
      'create policy "open" on notes to public using (true);',
      "create policy open on notes using (true);",
    ]) {
      const out = rlsProblems("m", [`${TABLE} alter table notes enable row level security; ${p}`]);
      expect(out.join(), p).toMatch(/opens it to anonymous visitors/);
    }
  });
  it("accepts a policy for a signed in role", () => {
    expect(rlsProblems("m", [`${TABLE} alter table notes enable row level security; create policy mine on notes for select to authenticated using (true);`])).toEqual([]);
  });
  it("fails a grant to anon and turning it off", () => {
    expect(rlsProblems("m", [`${TABLE} alter table notes enable row level security; grant select on notes to anon;`]).join()).toMatch(/grant to anon or public/);
    expect(rlsProblems("m", [`${TABLE} alter table notes enable row level security; alter table notes disable row level security;`]).join()).toMatch(/turns row level security off/);
  });
  it("fails alter policy to anon or public, in any case and spacing", () => {
    for (const p of [
      "alter policy mine on notes to anon;",
      "ALTER   POLICY\n mine ON notes\tTO  Public;",
      'alter policy "mine" on notes to authenticated, anon;',
    ]) {
      const out = rlsProblems("m", [`${TABLE} alter table notes enable row level security; ${p}`]);
      expect(out.join(), p).toMatch(/opens it to anonymous visitors/);
    }
    expect(rlsProblems("m", [`${TABLE} alter table notes enable row level security; alter policy mine on notes to authenticated;`])).toEqual([]);
    expect(rlsProblems("m", [`${TABLE} alter table notes enable row level security; alter policy mine on notes rename to yours;`])).toEqual([]);
  });
  it("fails alter default privileges that grant to anon or public", () => {
    for (const p of [
      "alter default privileges in schema public grant select on tables to anon;",
      "ALTER  DEFAULT\nPRIVILEGES grant all on tables TO  PUBLIC;",
    ]) {
      const out = rlsProblems("m", [`${TABLE} alter table notes enable row level security; ${p}`]);
      expect(out.join(), p).toMatch(/grant to anon or public/);
    }
    expect(rlsProblems("m", [`${TABLE} alter table notes enable row level security; alter default privileges in schema public grant select on tables to authenticated;`])).toEqual([]);
  });
  it("ignores the words inside comments and strings", () => {
    expect(rlsProblems("m", [`${TABLE} -- create table ghosts (x int);\nalter table notes enable row level security; select 'create table ghost (x int)';`])).toEqual([]);
  });
});

describe("checkKeyFolder and row level security", () => {
  it("fails an installed app whose table lacks it", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "rls-"));
    mkdirSync(path.join(root, "key/apps/notes/migrations"), { recursive: true });
    writeFileSync(path.join(root, "key/key.yaml"), "key: 1\nclient: harbor-studio\nstage: systems\nhome: repo\nroster: []\nskills: []\napps:\n  - slug: notes\n    definition: apps/notes/definition.yaml\n    category: command\nroutines: []\n");
    writeFileSync(path.join(root, "key/apps/notes/definition.yaml"), "app: notes\nname: Notes\ncategory: command\nruntime: custom_app\nentities:\n  - key: notes\n    name: Note\n    fields: []\nmigrations: migrations/\n");
    writeFileSync(path.join(root, "key/apps/notes/migrations/0001_notes_create.sql"), TABLE);
    expect((await checkKeyFolder(root)).join("\n")).toMatch(/table "notes" needs row level security/);
  });
});

describe("an app with row level security still works on this computer", () => {
  it("reads and writes its own table", async () => {
    const db = await openPglite();
    await migrate(db, path.join(process.cwd(), "tests/fixtures/key-apps/good/migrations"), "bookings-app");
    await db.query("insert into bookings (client_email) values ('ada@example.com')");
    const rows = await db.query<{ client_email: string }>("select client_email from bookings");
    expect(rows).toEqual([{ client_email: "ada@example.com" }]);
    await db.close();
  });
});

describe("person fields", () => {
  const def = (fields: unknown[], extra: Record<string, unknown> = {}) => ({ app: "x", entities: [{ key: "things", fields, ...extra }] });
  it("finds every address and team member id", () => {
    const d = def([
      { key: "contact_email", type: "email" }, { key: "billing_email", type: "email" }, { key: "owner_id", type: "text" },
      { key: "title", type: "text" },
    ], { forget: "blank" });
    expect(personFields(d, "x")).toEqual([
      { app: "x", table: "things", column: "contact_email", how: "email", forget: "blank" },
      { app: "x", table: "things", column: "billing_email", how: "email", forget: "blank" },
      { app: "x", table: "things", column: "owner_id", how: "team_id", forget: "blank" },
    ]);
  });
  it("finds a roster's work email and every team member id, deleting by default", () => {
    const d = { app: "team", entities: [
      { key: "people", fields: [{ key: "name", type: "text" }, { key: "manager_id", type: "text" }, { key: "work_email", type: "email" }] },
      { key: "review_inputs", forget: "blank", fields: [{ key: "person_id", type: "text" }, { key: "owner_id", type: "text" }, { key: "words", type: "text" }] },
    ] };
    expect(personFields(d, "team")).toEqual([
      { app: "team", table: "people", column: "manager_id", how: "team_id", forget: "delete" },
      { app: "team", table: "people", column: "work_email", how: "email", forget: "delete" },
      { app: "team", table: "review_inputs", column: "person_id", how: "team_id", forget: "blank" },
      { app: "team", table: "review_inputs", column: "owner_id", how: "team_id", forget: "blank" },
    ]);
  });
  it("refuses a person field outside the naming rule", () => {
    const out = (fields: unknown[]) => personFieldProblems("d.yaml", def(fields)).join("\n");
    expect(out([{ key: "customer_email", type: "text" }])).toMatch(/holds an email, so its type must be email/);
    expect(out([{ key: "mobile_phone", type: "text" }])).toMatch(/Phones live on the contact/);
    expect(out([{ key: "assignee", type: "user" }])).toMatch(/Use person_id, owner_id or manager_id/);
    expect(out([{ key: "staff_id", type: "text" }])).toMatch(/Call it person_id, owner_id or manager_id/);
    expect(out([{ key: "owner_id", type: "number" }])).toMatch(/holds a team member's id, so its type must be text/);
    expect(personFieldProblems("d.yaml", def([], { forget: "archive" })).join()).toMatch(/forget must be delete or blank/);
    expect(out([{ key: "work_email", type: "email" }, { key: "manager_id", type: "text" }])).toBe("");
  });
  it("fails the Key checker on an installed app with a person field outside the rule", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "person-rule-"));
    cpSync(path.join(root, "tests/fixtures/key-ext"), dir, { recursive: true });
    const f = path.join(dir, "key/apps/leads-demo/definition.yaml");
    writeFileSync(f, readFileSync(f, "utf8").replace("{ key: contact_email, name: Contact email, type: email }", "{ key: contact_email, name: Contact email, type: text }"));
    expect((await checkKeyFolder(dir)).join("\n")).toMatch(/field "contact_email" holds an email, so its type must be email/);
  });
});
