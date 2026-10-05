import { describe, it, expect } from "vitest";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { KEY_EXT } from "../support/db";
import { checkChecks, checkDraftBlock, checkSqlProblems, readDeclarations } from "@/lib/key/declarations";
import { checkKeyFolder } from "@/lib/key/formats";

const OK = "select count(*) > 0 as raise, 'x' as title, '' as body from leads_demo where created_at <= $2::timestamptz";

describe("check SQL", () => {
  it("passes a plain read of its own table", () => expect(checkSqlProblems(OK, ["leads_demo"])).toEqual([]));
  it("passes a with clause, a filter and a trailing semicolon", () => {
    const sql = "with w as (select * from leads_demo where status = 'new') select count(*) filter (where card_id is null) > 0 as raise, 'x' as title, null as body from w;";
    expect(checkSqlProblems(sql, ["leads_demo"])).toEqual([]);
  });
  it("refuses anything that writes or changes settings", () => {
    for (const sql of [
      "with d as (delete from leads_demo returning id) select true as raise, 'x' as title, '' as body from d",
      "select true as raise, 'x' as title, '' as body into scratch from leads_demo",
      "select set_config('role', 'postgres', true) as raise",
    ]) expect(checkSqlProblems(sql, ["leads_demo"]).join("\n"), sql).toMatch(/must only read|calls "set_config"/);
  });
  it("refuses two statements, a schema name, catalogs, quoting and other parameters", () => {
    expect(checkSqlProblems(`${OK}; select 1`, ["leads_demo"]).join()).toMatch(/one statement/);
    expect(checkSqlProblems(OK.replace("from leads_demo", "from public.leads_demo"), ["leads_demo"]).join()).toMatch(/without a schema/);
    expect(checkSqlProblems("select true as raise, relname as title, '' as body from pg_class", ["leads_demo"]).join()).toMatch(/system catalogs/);
    expect(checkSqlProblems('select true as raise, "title" from leads_demo', ["leads_demo"]).join()).toMatch(/quoted identifiers/);
    expect(checkSqlProblems("select $$x$$ as title", ["leads_demo"]).join()).toMatch(/dollar quoting/);
    expect(checkSqlProblems("select true as raise, 'x' as title, '' as body from leads_demo where created_at < $3::timestamptz", ["leads_demo"]).join()).toMatch(/only \$1::date and \$2::timestamptz/);
    expect(checkSqlProblems("select true as raise, 'x' as title, '' as body from leads_demo where created_at < $2", ["leads_demo"]).join()).toMatch(/write \$2 as \$2::timestamptz/);
  });
  it("refuses a comma join", () => {
    expect(checkSqlProblems("select true as raise, 'x' as title, '' as body from leads_demo, contacts", ["leads_demo", "contacts"]).join()).toMatch(/join tables with join, never a comma/);
    expect(checkSqlProblems("select true as raise, 'x' as title, '' as body from leads_demo l, contacts c", ["leads_demo", "contacts"]).join()).toMatch(/never a comma/);
    expect(checkSqlProblems("select count(*) > 0 as raise, string_agg(message, ', ') as title, '' as body from leads_demo", ["leads_demo"])).toEqual([]);
  });
  it("refuses a table outside reads and a function off the list", () => {
    expect(checkSqlProblems("select true as raise, 'x' as title, '' as body from accounts", ["leads_demo"]).join()).toMatch(/reads "accounts", which is not in reads/);
    expect(checkSqlProblems("select pg_sleep(10) as raise", ["leads_demo"]).join()).toMatch(/system catalogs|calls "pg_sleep"/);
    expect(checkSqlProblems("select true as raise, md5(message) as title, '' as body from leads_demo", ["leads_demo"]).join()).toMatch(/calls "md5"/);
  });
  it("allows exactly the listed functions", () => {
    const listed = ["count", "sum", "min", "max", "avg", "coalesce", "nullif", "greatest", "least", "lower", "upper", "trim", "btrim",
      "ltrim", "rtrim", "length", "char_length", "concat", "concat_ws", "format", "left", "right", "replace", "split_part",
      "string_agg", "array_agg", "array_to_string", "array_length", "cardinality", "to_char", "date_trunc", "date_part",
      "make_interval", "age", "now", "abs", "round", "floor", "ceil", "ceiling", "bool_or", "bool_and", "jsonb_build_object", "jsonb_agg"];
    for (const f of listed) expect(checkSqlProblems(`select ${f}(status) is not null as raise, 'x' as title, '' as body from leads_demo`, ["leads_demo"]), f).toEqual([]);
    for (const f of ["lo_import", "dblink", "current_setting", "txid_current", "random", "query_to_xml", "convert_from", "upper_inf"]) {
      expect(checkSqlProblems(`select ${f}(status) is not null as raise, 'x' as title, '' as body from leads_demo`, ["leads_demo"]).join(), f).toMatch(new RegExp(`calls "${f}"`));
    }
  });
  it("ignores words inside string literals", () => {
    expect(checkSqlProblems("select true as raise, 'delete from accounts; pg_class' as title, '' as body from leads_demo", ["leads_demo"])).toEqual([]);
  });
});

describe("check declarations", () => {
  const src = { file: "d.yaml", slug: "leads-demo", type: "app" as const, app: "leads-demo", uses: [] as string[] };
  const ctx = { kindNames: new Set(["lead-waiting", "contact"]), tablesByApp: { "leads-demo": ["leads_demo"], invoices: ["invoices"] } };
  const base = { key: "new-leads", name: "New leads", period: "day", card_kind: "lead-waiting", reads: ["leads_demo"], sql: OK };
  const bad = (patch: Record<string, unknown>, s: typeof src | Record<string, unknown> = src) => checkChecks(s as typeof src, [{ ...base, ...patch }], ctx).problems.join("\n");
  it("loads the fixture check with its full slug", async () => {
    const d = await readDeclarations(KEY_EXT);
    expect(d.checks.map((c) => [c.slug, c.period, c.reads])).toEqual([["lead-watch/new-leads", "day", ["leads_demo"]]]);
    expect(d.drafts).toEqual([{ routine: "lead-watch", handler: "src/drafts/lead-watch.ts", subcommands: ["list", "save"] }]);
    expect(d.problems).toEqual([]);
  });
  it("lets a check read only its own app's tables and the core list", () => {
    expect(bad({ reads: ["invoices"], sql: OK.replace("leads_demo", "invoices") })).toMatch(/reads "invoices", which is not this app's table, a table of an app in uses_apps/);
    expect(bad({ reads: ["outbox"] })).toMatch(/reads "outbox"/);
    expect(bad({ reads: ["accounts"] })).toMatch(/reads "accounts"/);
    expect(checkChecks(src, [{ ...base, reads: ["leads_demo", "contacts"] }], ctx).problems).toEqual([]);
  });
  it("needs an app on a routine that declares checks", () => {
    expect(bad({}, { file: "r.md", slug: "lead-watch", type: "routine", app: null, uses: [] })).toMatch(/names its app with app:/);
  });
  it("lets a check read the tables of an app it lists in uses_apps", () => {
    const withUses = { ...src, uses: ["invoices"] };
    const sql = "select count(*) > 0 as raise, 'x' as title, '' as body from leads_demo l join invoices i on i.lead_id = l.id::text";
    expect(checkChecks(withUses, [{ ...base, reads: ["leads_demo", "invoices"], sql }], ctx).problems).toEqual([]);
    expect(checkChecks(src, [{ ...base, reads: ["leads_demo", "invoices"], sql }], ctx).problems.join()).toMatch(/reads "invoices"/);
  });
  it("refuses a bad period, an undeclared or core kind, and an empty reads list", () => {
    expect(bad({ period: "hour" })).toMatch(/period must be day or week/);
    expect(bad({ card_kind: "nope" })).toMatch(/card_kind "nope" is not declared/);
    expect(bad({ card_kind: "contact" })).toMatch(/is a core kind/);
    expect(bad({ reads: [] })).toMatch(/reads must list the tables/);
  });
});

describe("optional apps in uses_apps", () => {
  const VENDOR_CHECK = [
    "  - key: vendor-renewals",
    "    name: Vendor renewals due",
    "    period: week",
    "    card_kind: lead-waiting",
    "    reads: [vendors]",
    "    sql: select count(*) > 0 as raise, 'x' as title, '' as body from vendors",
    "draft:",
  ].join("\n");
  function keyWith(usesLine: string): string {
    const root = mkdtempSync(path.join(tmpdir(), "keyopt-"));
    cpSync(KEY_EXT, root, { recursive: true });
    const file = path.join(root, "key/routines/lead-watch.md");
    writeFileSync(file, readFileSync(file, "utf8").replace("app: leads-demo", `app: leads-demo\n${usesLine}`).replace("draft:", VENDOR_CHECK));
    return root;
  }
  it("a required app that is not installed is a problem", async () => {
    expect((await checkKeyFolder(keyWith("uses_apps: [{app: vendors}]"))).join("\n")).toMatch(/uses_apps names "vendors", which is not installed/);
  });
  it("an optional app that is not installed is no problem, and its check waits for it", async () => {
    const root = keyWith("uses_apps: [{app: vendors, optional: true}]");
    expect(await checkKeyFolder(root)).toEqual([]);
    const d = await readDeclarations(root);
    expect(d.checks.map((c) => [c.slug, c.absent ?? []])).toEqual([["lead-watch/new-leads", []], ["lead-watch/vendor-renewals", ["vendors"]]]);
  });
  const src = { file: "r.md", slug: "renewal-watch", type: "routine" as const, app: "leads-demo", uses: ["invoices"], optionalUses: ["invoices"] };
  const ctx = (installed: boolean) => ({
    kindNames: new Set(["lead-waiting"]),
    tablesByApp: { "leads-demo": ["leads_demo"], other: ["other_rows"], ...(installed ? { invoices: ["invoices"] } : {}) },
  });
  const check = (reads: string[]) => [{ key: "due", name: "Due", period: "week", card_kind: "lead-waiting", reads, sql: `select count(*) > 0 as raise, 'x' as title, '' as body from ${reads[0]}` }];
  it("an installed optional app's tables are read like any other", () => {
    const r = checkChecks(src, check(["invoices"]), ctx(true));
    expect(r.problems).toEqual([]);
    expect(r.checks[0].absent).toBeUndefined();
  });
  it("an absent optional app never excuses a core table or another app's table", () => {
    for (const t of ["accounts", "outbox", "pause", "_migrations", "other_rows"]) {
      expect(checkChecks(src, check([t]), ctx(false)).problems.join(), t).toMatch(new RegExp(`reads "${t}"`));
    }
    expect(checkChecks(src, check(["Invoices"]), ctx(false)).problems.join()).toMatch(/reads "Invoices"/);
  });
  it("refuses a malformed uses_apps entry", async () => {
    for (const line of ["uses_apps: [{optional: true}]", "uses_apps: [{app: Vendors, optional: true}]", "uses_apps: [{app: vendors, optional: yes please}]", "uses_apps: [7]"]) {
      expect((await checkKeyFolder(keyWith(line))).join("\n"), line).toMatch(/uses_apps/);
    }
  });
});

describe("drafting declarations", () => {
  const src = { file: "r.md", slug: "review-ask" };
  it("accepts a handler under src or modules", () => {
    expect(checkDraftBlock(src, { handler: "src/lib/drafts/review-ask.ts", subcommands: ["list", "save"] }, () => true)).toEqual({ draft: { routine: "review-ask", handler: "src/lib/drafts/review-ask.ts", subcommands: ["list", "save"] }, problems: [] });
  });
  it("refuses a handler that leaves the code folders, is missing, or is not TypeScript", () => {
    for (const handler of ["../evil.ts", "scripts/x.ts", "src/../x.ts", "/tmp/x.ts", "src/x.js"]) {
      expect(checkDraftBlock(src, { handler, subcommands: ["list"] }, () => true).problems.join(), handler).toMatch(/handler must be a \.ts file under src\/ or modules\//);
    }
    expect(checkDraftBlock(src, { handler: "src/x.ts", subcommands: ["list"] }, () => false).problems.join()).toMatch(/does not exist/);
  });
  it("refuses bad or repeated steps", () => {
    expect(checkDraftBlock(src, { handler: "src/x.ts", subcommands: [] }, () => true).problems.join()).toMatch(/1 to 12 steps/);
    expect(checkDraftBlock(src, { handler: "src/x.ts", subcommands: ["Save", "save"] }, () => true).problems.join()).toMatch(/lowercase hyphenated slug/);
  });
});
