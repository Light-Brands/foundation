import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, mkdtempSync, mkdirSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { FIELD_TYPES, checkKeyFolder } from "@/lib/key/formats";
import { SQL_TYPE, tablesFromSql, compareDefinition } from "@/lib/key/schema";

const root = process.cwd();
const appDir = (name: string) => path.join(root, "tests/fixtures/key-apps", name);
const load = (name: string) => {
  const dir = appDir(name);
  const sql = readdirSync(path.join(dir, "migrations")).sort().map((f) => readFileSync(path.join(dir, "migrations", f), "utf8"));
  return { def: readFileSync(path.join(dir, "definition.yaml"), "utf8"), sql };
};

describe("SQL_TYPE", () => {
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
