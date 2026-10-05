import type { Db, Tx } from "@/lib/db/types";
import type { KindRegistry } from "@/lib/data/card-kinds";
import { CHECK_CORE_TABLES, CHECK_FUNCTIONS, CORE_TABLES, SQL_WORDS, normalizeSql, type CheckDecl } from "@/lib/key/declarations";
import { writeCard, CARD_LIMITS } from "@/lib/data/cards";
import { getPause } from "@/lib/data/pause";
import { businessDate, businessWeekStart } from "@/lib/time";

// Checks run the same way from the home screen, the owner's button and the host's schedule: at most once
// per period each, read-only, and at most one card per check per period. Only this file writes for a check.

export const HOME_DEBOUNCE_MS = 15 * 60_000;
const STATEMENT_TIMEOUT = "5s";

export type CheckOutcome = { slug: string; result: "clear" | "raised" | "failed" | "skipped" | "already_ran" };
export type RunReport = { paused: boolean; outcomes: CheckOutcome[]; lapsed: { closed: number; raised: number } };
export type RunnerDeps = { db: Db; kinds: KindRegistry; checks: CheckDecl[]; timezone: string };

export function periodFor(period: "day" | "week", tz: string, now: Date): string {
  return period === "day" ? businessDate(tz, now) : businessWeekStart(tz, now);
}

/** Every relation a Postgres JSON plan touches. A view shows up as the tables beneath it. */
export function planRelations(plan: unknown): { schema: string; name: string }[] {
  const out: { schema: string; name: string }[] = [];
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (typeof o["Relation Name"] === "string") out.push({ schema: String(o["Schema"] ?? ""), name: o["Relation Name"] as string });
      Object.values(o).forEach(walk);
    }
  };
  walk(plan);
  return out;
}

// Words Postgres prints before a parenthesis in a plan that are syntax, never a function it calls.
const PLAN_WORDS: ReadonlySet<string> = new Set([...SQL_WORDS, "array", "coalesce", "greatest", "least", "nullif", "extract", "subplan", "initplan", "partition", "within", "group", "order", "only"]);
// Core tables a check never reads, whatever its declaration says. The outbox is one of them.
const NEVER_READ: ReadonlySet<string> = new Set(CORE_TABLES.filter((t) => !CHECK_CORE_TABLES.includes(t)));

/** Every function a Postgres verbose JSON plan shows it will call, read from every expression it prints. */
export function planFunctions(plan: unknown): string[] {
  const found = new Set<string>();
  const scan = (text: string) => {
    // Literals and quoted names fold away first, then type names after :: (such as numeric(10,2)).
    const t = normalizeSql(text).text.replace(/::\s*[a-z_][a-z0-9_ ]*(\(\s*\d+(\s*,\s*\d+)?\s*\))?(\[\])?/g, " ");
    for (const m of t.matchAll(/([a-z_][a-z0-9_$]*)\s*\(/g)) if (!PLAN_WORDS.has(m[1])) found.add(m[1]);
  };
  const walk = (v: unknown): void => {
    if (typeof v === "string") { scan(v); return; }
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (v && typeof v === "object") Object.values(v as Record<string, unknown>).forEach(walk);
  };
  walk(plan);
  return [...found];
}

class CheckRefused extends Error {}

// Thrown to end a check's transaction with a rollback whatever happened inside it, carrying the result out.
class RolledBack<T> {
  constructor(readonly value: T) {}
}

const SHAPE = "must return raise (boolean), title (text) and body (text)";

type Hit = { raise: boolean; title: string; body: string } | null;

/**
 * Runs one check's SQL: its plan first, refused when it touches a relation outside reads, then the
 * statement itself inside a read-only transaction, wrapped in an outer select so a statement that
 * writes cannot even be parsed, and rolled back whatever happens. $1 is today in the business's time
 * zone and $2 is now.
 */
export async function runCheckSql(
  db: Db, check: CheckDecl, today: string, now: Date,
  // Tests only: widen the function list to prove the read-only transaction and the rollback hold alone.
  layers: { functions?: ReadonlySet<string> } = {},
): Promise<Hit> {
  try {
    await db.transaction(async (tx) => { throw new RolledBack(await readCheck(tx, check, today, now, layers.functions ?? CHECK_FUNCTIONS)); }, { readOnly: true });
  } catch (e) {
    if (e instanceof RolledBack) return e.value as Hit;
    throw e;
  }
  throw new Error("a check's transaction ended without a result");
}

// This, not the Key checker, is the boundary: one wrapped statement with parameters (so a second statement
// cannot run), in a read-only transaction with a statement limit, always rolled back.
async function readCheck(tx: Tx, check: CheckDecl, today: string, now: Date, functions: ReadonlySet<string>): Promise<Hit> {
  const inner = check.sql.trim().replace(/;\s*$/, "");
  const sql = `select * from (${inner}) as check_result where $1::date is not null and $2::timestamptz is not null`;
  const params = [today, now];
  await tx.exec(`set local statement_timeout = '${STATEMENT_TIMEOUT}'`);
  const [plan] = await tx.query<Record<string, unknown>>(`explain (format json, verbose) ${sql}`, params);
  // Postgres has parsed the statement, resolved views, CTEs and names: its plan is what will run.
  for (const r of planRelations(plan?.["QUERY PLAN"])) {
    const ok = r.schema === "public" && check.reads.includes(r.name) && (check.may_read ?? []).includes(r.name) && !NEVER_READ.has(r.name) && /^[a-z]/.test(r.name);
    if (!ok) throw new CheckRefused(`reads ${r.schema}.${r.name}, which is not in its reads list`);
  }
  for (const f of planFunctions(plan?.["QUERY PLAN"])) {
    if (!functions.has(f)) throw new CheckRefused(`calls ${f}, which checks may not use`);
  }
  const rows = await tx.query<{ raise?: unknown; title?: unknown; body?: unknown }>(sql, params);
  if (rows.length === 0) return null;
  if (rows.length > 1) throw new CheckRefused("returned more than one row");
  const [row] = rows;
  if (typeof row.raise !== "boolean") throw new CheckRefused(SHAPE);
  if (!row.raise) return { raise: false, title: "", body: "" };
  if (typeof row.title !== "string" || (row.body != null && typeof row.body !== "string")) throw new CheckRefused(SHAPE);
  return { raise: true, title: row.title, body: (row.body as string | null) ?? "" };
}

/** Cards past their stored expires_at follow their kind's rule. The stored expiry is the one truth: it is never worked out again. */
export async function applyLapses(db: Db, kinds: KindRegistry, now: Date): Promise<{ closed: number; raised: number }> {
  const all = [...kinds.values()];
  const closes = all.filter((k) => k.on_lapse === "closes").map((k) => k.kind);
  const closed = closes.length
    ? await db.query<{ id: string }>(
        "update inbox_items set status = 'done' where status = 'new' and expires_at is not null and expires_at <= $1 and kind = any($2::text[]) returning id",
        [now, closes],
      )
    : [];
  let raised = 0;
  for (const k of all.filter((x) => x.on_lapse === "raised_again" && x.expires_days !== null)) {
    const rows = await db.query<{ id: string }>(
      `update inbox_items set created_at = $1, expires_at = $1 + make_interval(days => $3::int)
        where status = 'new' and expires_at is not null and expires_at <= $1 and kind = $2 returning id`,
      [now, k.kind, k.expires_days],
    );
    raised += rows.length;
  }
  return { closed: closed.length, raised };
}

const clip = (s: string, n: number) => s.slice(0, n);

async function finish(db: Db, runId: string, result: "clear" | "raised" | "failed", cardId: string | null, detail: string, now: Date): Promise<void> {
  await db.query("update check_runs set result = $2, card_id = $3, detail = $4, ran_at = $5 where id = $1", [runId, result, cardId, detail, now]);
}

const waitsFor = (apps: string[]) => `Waits for ${apps.join(", ")}, which ${apps.length === 1 ? "is" : "are"} not installed.`;

async function runOne({ db, kinds, timezone }: RunnerDeps, check: CheckDecl, now: Date): Promise<CheckOutcome> {
  const period = periodFor(check.period, timezone, now);
  if (check.absent?.length) {
    // An optional app this check reads is not installed: record the skip once per period, raise nothing.
    const [mark] = await db.query<{ id: string }>(
      "insert into check_runs (check_slug, period, result, ran_at, detail) values ($1, $2, 'skipped_absent', $3, $4) on conflict (check_slug, period) do nothing returning id",
      [check.slug, period, now, waitsFor(check.absent)],
    );
    return { slug: check.slug, result: mark ? "skipped" : "already_ran" };
  }
  // A period skipped while its app was absent may still run once the app arrives.
  const [claim] = await db.query<{ id: string }>(
    `insert into check_runs (check_slug, period, result, ran_at) values ($1, $2, 'running', $3)
     on conflict (check_slug, period) do update set result = 'running', ran_at = $3, detail = ''
       where check_runs.result = 'skipped_absent'
     returning id`,
    [check.slug, period, now],
  );
  if (!claim) return { slug: check.slug, result: "already_ran" };
  const runKey = `${check.slug}:${period}`;
  try {
    const hit = await runCheckSql(db, check, businessDate(timezone, now), now);
    if (!hit || !hit.raise) {
      await finish(db, claim.id, "clear", null, "", now);
      return { slug: check.slug, result: "clear" };
    }
    const card = await writeCard(db, kinds, {
      kind: check.card_kind, title: clip(hit.title.trim(), CARD_LIMITS.title) || check.name, body: clip(hit.body, CARD_LIMITS.body), runKey, sourceApp: check.source,
    }, now);
    await finish(db, claim.id, "raised", card.id, "", now);
    return { slug: check.slug, result: "raised" };
  } catch (err) {
    const detail = clip(err instanceof Error ? err.message : String(err), 500);
    const card = await writeCard(db, kinds, { kind: "check-failed", title: clip(`The check "${check.name}" could not run`, CARD_LIMITS.title), body: detail, runKey, sourceApp: check.source }, now);
    await finish(db, claim.id, "failed", card.id, detail, now);
    return { slug: check.slug, result: "failed" };
  }
}

export async function runChecks(deps: RunnerDeps, now: Date): Promise<RunReport> {
  if ((await getPause(deps.db)).paused) {
    await deps.db.query(
      "insert into check_runs (check_slug, period, result, ran_at) values ('runner/checks', $1, 'skipped_paused', $2) on conflict (check_slug, period) do nothing",
      [businessDate(deps.timezone, now), now],
    );
    return { paused: true, outcomes: [], lapsed: { closed: 0, raised: 0 } };
  }
  const lapsed = await applyLapses(deps.db, deps.kinds, now);
  const outcomes: CheckOutcome[] = [];
  for (const check of deps.checks) outcomes.push(await runOne(deps, check, now));
  return { paused: false, outcomes, lapsed };
}

/** The home screen's run: at most once per 15 minute window, however many times the page opens. */
export async function runChecksIfDue(deps: RunnerDeps, now: Date): Promise<RunReport | null> {
  const window = new Date(Math.floor(now.getTime() / HOME_DEBOUNCE_MS) * HOME_DEBOUNCE_MS).toISOString();
  const [mark] = await deps.db.query<{ id: string }>(
    "insert into check_runs (check_slug, period, result, ran_at) values ('runner/home', $1, 'ran', $2) on conflict (check_slug, period) do nothing returning id",
    [window, now],
  );
  if (!mark) return null;
  await deps.db.query("delete from check_runs where check_slug = 'runner/home' and ran_at < $1", [new Date(now.getTime() - 86_400_000)]);
  return runChecks(deps, now);
}

export function describeReport(r: RunReport, installed: number): string {
  if (r.paused) return "Your routines are paused, so no checks ran. Turn them back on in Settings, then Preferences.";
  if (installed === 0) return "No checks are installed yet.";
  const ran = r.outcomes.filter((o) => o.result !== "already_ran" && o.result !== "skipped");
  const skipped = r.outcomes.filter((o) => o.result === "skipped").length;
  if (ran.length === 0 && skipped === 0) return "Today's checks already ran. Each one runs once a day or once a week.";
  const raised = ran.filter((o) => o.result === "raised").length;
  const failed = ran.filter((o) => o.result === "failed").length;
  const parts: string[] = [];
  if (ran.length) {
    parts.push(`${ran.length} ${ran.length === 1 ? "check" : "checks"} ran.`);
    if (raised) parts.push(`${raised} raised a card in your Inbox.`);
    if (failed) parts.push(`${failed} could not run, and ${failed === 1 ? "its card says" : "their cards say"} why.`);
    if (!raised && !failed) parts.push("Nothing needs you.");
  }
  if (skipped) parts.push(`${skipped} ${skipped === 1 ? "waits" : "wait"} for an app that is not installed.`);
  return parts.join(" ");
}
