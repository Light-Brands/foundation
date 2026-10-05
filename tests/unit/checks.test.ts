import { describe, it, expect, vi } from "vitest";
import { extDb, KEY_EXT } from "../support/db";
import { CHECK_FUNCTIONS, readDeclarations, type CheckDecl } from "@/lib/key/declarations";
import { registryFrom } from "@/lib/data/card-kinds";
import { writeCard } from "@/lib/data/cards";
import { setPause } from "@/lib/data/pause";
import { draftEmail } from "@/lib/data/outbox";
import { applyLapses, periodFor, planRelations, runCheckSql, runChecks, runChecksIfDue, describeReport, type RunnerDeps } from "@/lib/checks/runner";

const TZ = "America/Los_Angeles";
const MON = new Date("2026-10-05T16:00:00Z"); // Monday 09:00 in Portland
const later = (ms: number, from = MON) => new Date(from.getTime() + ms);
const DAY = 86_400_000;
const widen = (...f: string[]) => ({ functions: new Set([...CHECK_FUNCTIONS, ...f]) });

async function setup(checks?: CheckDecl[]): Promise<RunnerDeps> {
  const d = await readDeclarations(KEY_EXT);
  return { db: await extDb(), kinds: registryFrom(d.kinds), checks: checks ?? d.checks, timezone: TZ };
}
const addLead = (deps: RunnerDeps) => deps.db.query("insert into leads_demo (contact_email, status, created_at) values ('ada@example.com', 'new', $1)", [later(-3600_000)]);
const cards = (deps: RunnerDeps) => deps.db.query<{ kind: string; title: string; status: string }>("select kind, title, status from inbox_items order by created_at, title");

describe("periodFor", () => {
  it("uses the business's day and Monday", () => {
    const lateSunday = new Date("2026-10-05T06:30:00Z");
    expect(periodFor("day", TZ, lateSunday)).toBe("2026-10-04");
    expect(periodFor("week", TZ, lateSunday)).toBe("2026-09-28");
  });
});

describe("planRelations", () => {
  it("finds every relation in a nested plan", () => {
    const plan = [{ Plan: { "Node Type": "Hash Join", Plans: [{ "Relation Name": "a", Schema: "public" }, { Plans: [{ "Relation Name": "b", Schema: "x" }] }] } }];
    expect(planRelations(plan)).toEqual([{ schema: "public", name: "a" }, { schema: "x", name: "b" }]);
  });
});

describe("runCheckSql", () => {
  it("passes today as $1::date and now as $2::timestamptz, and returns raise, title and body", async () => {
    const deps = await setup();
    const base = deps.checks[0];
    const sql = "select true as raise, to_char($1::date, 'YYYY-MM-DD') as title, to_char($2::timestamptz at time zone 'UTC', 'HH24:MI') as body from leads_demo where status is null or true limit 1";
    await addLead(deps);
    expect(await runCheckSql(deps.db, { ...base, sql }, "2026-10-05", MON)).toEqual({ raise: true, title: "2026-10-05", body: "16:00" });
    await deps.db.close();
  });
  it("the read-only wrap refuses a write even when the plan check would allow it", async () => {
    const deps = await setup();
    const base = deps.checks[0];
    await addLead(deps);
    const writer = { ...base, sql: "with d as (delete from leads_demo returning id) select count(*) > 0 as raise, 'x' as title, '' as body from d" };
    await expect(runCheckSql(deps.db, writer, "2026-10-05", MON)).rejects.toThrow(/top level|read-only/);
    expect(await deps.db.query("select count(*)::int as n from leads_demo")).toEqual([{ n: 1 }]);
    await deps.db.close();
  });
  it("the read-only transaction refuses a write the outer select lets through", async () => {
    const deps = await setup();
    await deps.db.exec("create sequence check_probe");
    const bumps = { ...deps.checks[0], sql: "select nextval('check_probe') > 0 as raise, 'x' as title, '' as body" };
    await expect(runCheckSql(deps.db, bumps, "2026-10-05", MON)).rejects.toThrow(/calls nextval/);
    await expect(runCheckSql(deps.db, bumps, "2026-10-05", MON, widen("nextval"))).rejects.toThrow(/read-only/);
    expect(await deps.db.query("select last_value::int as v, is_called from check_probe")).toEqual([{ v: 1, is_called: false }]);
    await deps.db.close();
  });
});

describe("the run is the boundary, whatever slips past the Key checker", () => {
  const SNEAKS: [string, string][] = [
    ["an insert inside a with clause", "with w as (insert into leads_demo (contact_email) values ('x@example.com') returning id) select true as raise, 'x' as title, '' as body from w"],
    ["a volatile function that writes", "select setval('check_probe', 99) > 0 as raise, 'x' as title, '' as body"],
    ["select into", "select true as raise, 'x' as title, '' as body into scratch_copy from leads_demo"],
    ["a second statement hidden from the checker by a quote in a comment", "select true as raise, 'x' as title, '' as body -- it's\n; delete from leads_demo; select 'a' as raise"],
    ["a second statement after a semicolon", "select true as raise, 'x' as title, '' as body; delete from leads_demo"],
  ];
  for (const [what, sql] of SNEAKS) {
    it(`refuses ${what} at run time and changes nothing`, async () => {
      const deps = await setup();
      await deps.db.exec("create sequence check_probe");
      await addLead(deps);
      await expect(runCheckSql(deps.db, { ...deps.checks[0], sql: sql.replace("\\n", "\n") }, "2026-10-05", MON)).rejects.toThrow();
      expect(await deps.db.query("select count(*)::int as n from leads_demo")).toEqual([{ n: 1 }]);
      expect(await deps.db.query("select last_value::int as v from check_probe")).toEqual([{ v: 1 }]);
      expect(await deps.db.query("select count(*)::int as n from information_schema.tables where table_name = 'scratch_copy'")).toEqual([{ n: 0 }]);
      await deps.db.close();
    });
  }
  it("always rolls the check's transaction back, even when it succeeds", async () => {
    const deps = await setup();
    const probe = { ...deps.checks[0], sql: "select set_config('foundation.probe', 'leaked', false) is not null as raise, 'x' as title, '' as body" };
    expect(await runCheckSql(deps.db, probe, "2026-10-05", MON, widen("set_config"))).toEqual({ raise: true, title: "x", body: "" });
    const [row] = await deps.db.query<{ v: string | null }>("select current_setting('foundation.probe', true) as v");
    expect(row.v ?? "").toBe("");
    await deps.db.close();
  });
  it("runs under a five second statement limit", async () => {
    // PGlite runs in this process and cannot interrupt itself, so only the hosted database enforces the limit.
    // The limit is set on every run all the same, and this proves it is in place while the check runs.
    const deps = await setup();
    const probe = { ...deps.checks[0], sql: "select current_setting('statement_timeout') = '5s' as raise, 'x' as title, '' as body" };
    expect(await runCheckSql(deps.db, probe, "2026-10-05", MON, widen("current_setting"))).toEqual({ raise: true, title: "x", body: "" });
    await deps.db.close();
  });
});

describe("the run reads only what the check may read, whatever its declaration says", () => {
  const SELECT = "select count(*) > 0 as raise, 'x' as title, '' as body";
  async function refused(sql: string, reads: string[], prep?: string, mayRead?: string[]): Promise<string> {
    const deps = await setup();
    if (prep) await deps.db.exec(prep);
    const check = { ...deps.checks[0], reads, sql, ...(mayRead ? { may_read: mayRead } : {}) };
    try {
      await runCheckSql(deps.db, check, "2026-10-05", MON);
      return "ran";
    } catch (e) {
      return (e as Error).message;
    } finally {
      await deps.db.close();
    }
  }
  it("refuses a core table off the list even when reads names it", async () => {
    expect(await refused(`${SELECT} from pause`, ["pause"], undefined, ["leads_demo", "pause"])).toMatch(/reads public\.pause/);
    expect(await refused(`${SELECT} from webhook_events`, ["webhook_events"], undefined, ["webhook_events"])).toMatch(/reads public\.webhook_events/);
    expect(await refused(`${SELECT} from outbox`, ["outbox"], undefined, ["outbox"])).toMatch(/reads public\.outbox/);
  });
  it("refuses another app's table even when reads names it", async () => {
    expect(await refused(`${SELECT} from other_rows`, ["leads_demo", "other_rows"], "create table other_rows (id int)")).toMatch(/reads public\.other_rows/);
  });
  it("refuses an undeclared table reached by a schema name, a quoted name, a view or a shadowing alias", async () => {
    expect(await refused(`${SELECT} from public.contacts`, ["leads_demo"])).toMatch(/reads public\.contacts/);
    expect(await refused(`${SELECT} from "contacts"`, ["leads_demo"])).toMatch(/reads public\.contacts/);
    expect(await refused(`${SELECT} from leads_view`, ["leads_demo", "leads_view"], "create view leads_view as select * from contacts")).toMatch(/reads public\.contacts/);
    expect(await refused(`with leads_demo as (select * from contacts) ${SELECT} from leads_demo`, ["leads_demo"])).toMatch(/reads public\.contacts/);
  });
  it("refuses a function that reads a table out of sight of the plan", async () => {
    expect(await refused("select query_to_xml('select * from contacts', true, true, '') is not null as raise, 'x' as title, '' as body", ["leads_demo"])).toMatch(/calls query_to_xml/);
    expect(await refused("select length(current_setting('foundation.x', true)) > 0 as raise, 'x' as title, '' as body", ["leads_demo"])).toMatch(/calls current_setting/);
  });
  it("refuses SQL the first Key checker read differently from Postgres, by its plan", async () => {
    // The tokenizer at 2811380 read $a1$'$a1$ as the start of a string that hid version() and the subquery.
    expect(await refused("select $a1$'$a1$ as t, version() as junk, true as raise, 'x' as title, '' as body from leads_demo", ["leads_demo"])).toMatch(/calls version/);
    expect(await refused("select $a1$'$a1$ as t, (select count(*) from contacts) as junk, true as raise, 'x' as title, '' as body from leads_demo", ["leads_demo"])).toMatch(/reads public\.contacts/);
  });
  it("refuses a function whose name only looks like syntax, or hides behind another schema, by its plan", async () => {
    // Reported allowlist bypass: the plan scan folded case and passed any word Postgres also uses as syntax,
    // and read x.count( as count(. Both functions here read contacts out of sight of the plan.
    const body = "language plpgsql as $f$ begin return (select count(*)::int from contacts); end $f$";
    const prep = `create function partition(int) returns int ${body}; create schema sneaky; create function sneaky.count(int) returns int ${body};`;
    expect(await refused("select partition(1) >= 0 as raise, 'x' as title, '' as body", ["leads_demo"], prep)).toMatch(/calls partition/);
    expect(await refused("select sneaky.count(1) >= 0 as raise, 'x' as title, '' as body", ["leads_demo"], prep)).toMatch(/calls sneaky\.count/);
  });
  it("runs a check that joins lines with an escape string", async () => {
    expect(await refused("select count(*) >= 0 as raise, 'x' as title, string_agg(contact_email, E'\\n') as body from leads_demo", ["leads_demo"])).toBe("ran");
  });
  it("still runs every allowed function", async () => {
    const sql = "select count(*) >= 0 or bool_or(true) as raise, concat_ws(' ', upper(min(status)), lower(max(status)), btrim(' a '), left('ab', 1), to_char(now(), 'YYYY'), coalesce(null, 'z'), greatest(1, 2)::text, date_trunc('day', $2::timestamptz)::text, age($2::timestamptz, $2::timestamptz)::text, make_interval(days => 1)::text, round(abs(-1.5))::text) as title, string_agg(contact_email, ', ') as body from leads_demo where created_at <= $2::timestamptz and starts_ok(1)";
    expect(await refused(sql.replace(" and starts_ok(1)", ""), ["leads_demo"])).toBe("ran");
  });
});

describe("runChecks", () => {
  it("runs each check once per period however often it is asked, and raises one card per period", async () => {
    const deps = await setup();
    await addLead(deps);
    expect((await runChecks(deps, MON)).outcomes).toEqual([{ slug: "lead-watch/new-leads", result: "raised" }]);
    expect((await runChecks(deps, later(3600_000))).outcomes).toEqual([{ slug: "lead-watch/new-leads", result: "already_ran" }]);
    expect(await cards(deps)).toEqual([{ kind: "lead-waiting", title: "1 new leads are waiting", status: "new" }]);
    expect((await runChecks(deps, later(DAY))).outcomes[0].result).toBe("raised");
    expect((await cards(deps)).length).toBe(2);
    await deps.db.close();
  });
  it("records a clear run and raises nothing when nothing crosses", async () => {
    const deps = await setup();
    expect((await runChecks(deps, MON)).outcomes).toEqual([{ slug: "lead-watch/new-leads", result: "clear" }]);
    expect(await cards(deps)).toEqual([]);
    expect(await deps.db.query("select check_slug, period, result from check_runs")).toEqual([{ check_slug: "lead-watch/new-leads", period: "2026-10-05", result: "clear" }]);
    await deps.db.close();
  });
  it("home opens are debounced", async () => {
    const deps = await setup();
    expect(await runChecksIfDue(deps, MON)).not.toBeNull();
    expect(await runChecksIfDue(deps, later(5 * 60_000))).toBeNull();
    expect(await runChecksIfDue(deps, later(16 * 60_000))).not.toBeNull();
    await deps.db.close();
  });
  it("a check that tries to write fails, raises one failure card, and changes nothing", async () => {
    const base = (await readDeclarations(KEY_EXT)).checks[0];
    const writer: CheckDecl = { ...base, slug: "lead-watch/writer", sql: "with d as (delete from leads_demo returning id) select count(*) > 0 as raise, 'x' as title, '' as body from d" };
    const deps = await setup([writer]);
    await addLead(deps);
    expect((await runChecks(deps, MON)).outcomes).toEqual([{ slug: "lead-watch/writer", result: "failed" }]);
    expect((await runChecks(deps, later(60_000))).outcomes[0].result).toBe("already_ran");
    expect(await deps.db.query("select count(*)::int as n from leads_demo")).toEqual([{ n: 1 }]);
    expect(await cards(deps)).toEqual([{ kind: "check-failed", title: 'The check "New leads waiting" could not run', status: "new" }]);
    const [run] = await deps.db.query<{ result: string; detail: string }>("select result, detail from check_runs");
    expect(run.result).toBe("failed");
    expect(run.detail).toMatch(/read-only|top level/);
    await deps.db.close();
  });
  it("a check that reads beyond its list fails", async () => {
    const base = (await readDeclarations(KEY_EXT)).checks[0];
    const nosy: CheckDecl = { ...base, slug: "lead-watch/nosy", sql: "select count(*) > 0 as raise, 'x' as title, '' as body from contacts" };
    const deps = await setup([nosy]);
    expect((await runChecks(deps, MON)).outcomes[0].result).toBe("failed");
    const [run] = await deps.db.query<{ detail: string }>("select detail from check_runs");
    expect(run.detail).toMatch(/reads public\.contacts, which is not in its reads list/);
    await deps.db.close();
  });
  it("a check must return raise, title and body in one row", async () => {
    const base = (await readDeclarations(KEY_EXT)).checks[0];
    const deps = await setup([{ ...base, slug: "lead-watch/shape", sql: "select 1 as n from leads_demo" }]);
    await addLead(deps);
    expect((await runChecks(deps, MON)).outcomes[0].result).toBe("failed");
    await deps.db.close();
  });
  it("a check that reads an absent optional app is skipped, with a record and no card, and runs once the app is there", async () => {
    const base = (await readDeclarations(KEY_EXT)).checks[0];
    const waiting: CheckDecl = { ...base, slug: "lead-watch/vendors", absent: ["vendors"], reads: ["vendors"], sql: "select count(*) > 0 as raise, 'x' as title, '' as body from vendors" };
    const deps = await setup([waiting]);
    expect((await runChecks(deps, MON)).outcomes).toEqual([{ slug: "lead-watch/vendors", result: "skipped" }]);
    expect((await runChecks(deps, later(60_000))).outcomes).toEqual([{ slug: "lead-watch/vendors", result: "already_ran" }]);
    expect(await deps.db.query("select check_slug, period, result, detail from check_runs")).toEqual([
      { check_slug: "lead-watch/vendors", period: "2026-10-05", result: "skipped_absent", detail: "Waits for vendors, which is not installed." },
    ]);
    expect(await cards(deps)).toEqual([]);
    await addLead(deps);
    const installed = { ...deps, checks: [{ ...base, slug: "lead-watch/vendors" }] };
    expect((await runChecks(installed, later(120_000))).outcomes).toEqual([{ slug: "lead-watch/vendors", result: "raised" }]);
    expect(await deps.db.query("select result from check_runs")).toEqual([{ result: "raised" }]);
    await deps.db.close();
  });
  it("with the pause flag on, the checks runner writes one skipped record and nothing else", async () => {
    const deps = await setup();
    await addLead(deps);
    await setPause(deps.db, { paused: true, reason: "", by: "pin:owner" }, MON);
    expect(await runChecks(deps, MON)).toEqual({ paused: true, outcomes: [], lapsed: { closed: 0, raised: 0 } });
    await runChecks(deps, later(60_000));
    expect(await deps.db.query("select check_slug, period, result from check_runs")).toEqual([{ check_slug: "runner/checks", period: "2026-10-05", result: "skipped_paused" }]);
    expect(await cards(deps)).toEqual([]);
    await deps.db.close();
  });
  it("an expired card follows its kind's lapse rule", async () => {
    const deps = await setup([]);
    await writeCard(deps.db, deps.kinds, { kind: "lead-waiting", title: "closes" }, MON);
    await writeCard(deps.db, deps.kinds, { kind: "lead-new", title: "comes back" }, MON);
    await writeCard(deps.db, deps.kinds, { kind: "discount-ask", title: "stays" }, MON);
    const now = later(15 * DAY);
    expect(await applyLapses(deps.db, deps.kinds, now)).toEqual({ closed: 1, raised: 1 });
    const rows = await deps.db.query<{ title: string; status: string; bumped: boolean }>(
      "select title, status, created_at = $1::timestamptz as bumped from inbox_items order by title", [now]);
    expect(rows).toEqual([
      { title: "closes", status: "done", bumped: false },
      { title: "comes back", status: "new", bumped: true },
      { title: "stays", status: "new", bumped: false },
    ]);
    await deps.db.close();
  });
  it("a lapse reads the stored expiry, never one worked out again from the kind", async () => {
    const deps = await setup([]);
    await writeCard(deps.db, deps.kinds, { kind: "lead-waiting", title: "kept longer" }, MON);
    await deps.db.query("update inbox_items set expires_at = $1", [later(30 * DAY)]);
    expect(await applyLapses(deps.db, deps.kinds, later(15 * DAY))).toEqual({ closed: 0, raised: 0 });
    expect(await applyLapses(deps.db, deps.kinds, later(31 * DAY))).toEqual({ closed: 1, raised: 0 });
    await deps.db.close();
  });
});

describe("lapses and drafted email", () => {
  it("a lapsed card that closes cancels its unsent draft", async () => {
    vi.stubEnv("FOUNDATION_SECRET", "lapse-test-secret");
    const deps = await setup([]);
    const card = await writeCard(deps.db, deps.kinds, { kind: "lead-reply", title: "Reply ready" }, MON);
    if (card.status !== "written") throw new Error("not written");
    await draftEmail(deps.db, { to: "ada@example.com", subject: "Hi", body: "Hello", sendKey: "k1", cardId: card.id });
    expect(await applyLapses(deps.db, deps.kinds, later(8 * DAY))).toEqual({ closed: 1, raised: 0 });
    expect(await deps.db.query("select status from outbox")).toEqual([{ status: "cancelled" }]);
    await deps.db.close();
    vi.unstubAllEnvs();
  });
});

describe("describeReport", () => {
  it("says what happened in plain words", () => {
    expect(describeReport({ paused: true, outcomes: [], lapsed: { closed: 0, raised: 0 } }, 2)).toBe("Your routines are paused, so no checks ran. Turn them back on in Settings, then Preferences.");
    expect(describeReport({ paused: false, outcomes: [], lapsed: { closed: 0, raised: 0 } }, 0)).toBe("No checks are installed yet.");
    expect(describeReport({ paused: false, outcomes: [{ slug: "a", result: "already_ran" }], lapsed: { closed: 0, raised: 0 } }, 1)).toBe("Today's checks already ran. Each one runs once a day or once a week.");
    expect(describeReport({ paused: false, outcomes: [{ slug: "a", result: "raised" }, { slug: "b", result: "clear" }], lapsed: { closed: 0, raised: 0 } }, 2)).toBe("2 checks ran. 1 raised a card in your Inbox.");
    expect(describeReport({ paused: false, outcomes: [{ slug: "a", result: "failed" }], lapsed: { closed: 0, raised: 0 } }, 1)).toBe("1 check ran. 1 could not run, and its card says why.");
    expect(describeReport({ paused: false, outcomes: [{ slug: "a", result: "clear" }, { slug: "b", result: "skipped" }], lapsed: { closed: 0, raised: 0 } }, 2)).toBe("1 check ran. Nothing needs you. 1 waits for an app that is not installed.");
    expect(describeReport({ paused: false, outcomes: [{ slug: "a", result: "skipped" }, { slug: "b", result: "skipped" }], lapsed: { closed: 0, raised: 0 } }, 2)).toBe("2 wait for an app that is not installed.");
  });
});
