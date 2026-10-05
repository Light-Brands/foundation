import { existsSync } from "node:fs";
import path from "node:path";
import type { Db, Tx } from "@/lib/db/types";
import { acquireDbLock, DbLockedError, DB_OPEN_MESSAGE } from "@/lib/db/lock";
import { readDeclarations, type Declarations, type DraftDecl } from "@/lib/key/declarations";
import { businessDate } from "@/lib/time";

// The one drafting command: npm run draft -- <routine> <step> [args]. It checks the step, holds one
// drafting lock, reads the pause switch, then hands the step to the routine's handler. Starting the
// handler is passed in as spawn by scripts/draft.ts, because nothing under src/ starts a process.

export const BUILT_IN_DRAFTS: Record<string, Omit<DraftDecl, "routine">> = {
  "monday-brief": { handler: "src/lib/data/briefs-command.ts", subcommands: ["numbers", "save", "check", "blocked"] },
};
export const DRAFT_LOCK_MESSAGE = "Another drafting run is still going. Wait for it to finish, then run this again. If nothing is running, delete .data/draft.lock.";
export const PAUSED_MESSAGE = "Your routines are paused. Turn them back on in Settings, then Preferences, and run this again.";

export function draftsFrom(d: Pick<Declarations, "drafts" | "routines">): Map<string, DraftDecl> {
  const out = new Map<string, DraftDecl>();
  for (const slug of d.routines) {
    const builtIn = BUILT_IN_DRAFTS[slug];
    if (builtIn) out.set(slug, { routine: slug, ...builtIn });
  }
  for (const x of d.drafts) out.set(x.routine, x);
  return out;
}

export type DraftPlan =
  | { status: "run"; decl: DraftDecl; argv: string[] }
  | { status: "usage" | "unknown_routine" | "unknown_subcommand" | "no_handler"; message: string };

export function planDraft(drafts: ReadonlyMap<string, DraftDecl>, argv: string[], exists: (repoPath: string) => boolean): DraftPlan {
  const [routine, sub, ...rest] = argv;
  const known = [...drafts.values()].map((d) => `${d.routine} (${d.subcommands.join(", ")})`).join(", ") || "none yet";
  if (!routine || !sub) return { status: "usage", message: `Use: npm run draft -- <routine> <step>. Routines with a drafting command: ${known}.` };
  const decl = drafts.get(routine);
  if (!decl) return { status: "unknown_routine", message: `No installed routine called ${routine} has a drafting command. Routines with one: ${known}.` };
  if (!decl.subcommands.includes(sub)) return { status: "unknown_subcommand", message: `${routine} has no step called ${sub}. Its steps are ${decl.subcommands.join(", ")}.` };
  if (!exists(decl.handler)) return { status: "no_handler", message: `The drafting code for ${routine} is missing (${decl.handler}). Run its install again, or ask Light Brands.` };
  return { status: "run", decl, argv: [sub, ...rest] };
}

export const DRAFT_LOCK = "foundation:draft";

// Fails closed: no pause row reads as paused, and an error stops the run before any handler starts.
async function pausedIn(db: Tx): Promise<boolean> {
  const [row] = await db.query<{ paused: boolean }>("select paused from pause where id = 1");
  return row?.paused !== false;
}

/** One record that a drafting run was skipped because routines are paused, at most one per business day. */
export async function recordDraftSkip(db: Tx, now: Date): Promise<void> {
  const [p] = await db.query<{ timezone: string }>("select timezone from business_profile where id = 1");
  await db.query(
    "insert into check_runs (check_slug, period, result, ran_at) values ('runner/draft', $1, 'skipped_paused', $2) on conflict (check_slug, period) do nothing",
    [businessDate(p?.timezone, now), now],
  );
}

export type DraftDeps = {
  root: string;
  lockFile: string;
  openDb: () => Promise<Db>;
  spawn: (handlerPath: string, argv: string[]) => Promise<number>;
  print: (line: string) => void;
  now: Date;
  /** True on the hosted database: the run also holds a database lock, for drafting runs on other computers. */
  hosted?: boolean;
};

export async function runDraft(argv: string[], deps: DraftDeps): Promise<number> {
  const plan = planDraft(draftsFrom(await readDeclarations(deps.root)), argv, (p) => existsSync(path.join(deps.root, p)));
  if (plan.status !== "run") {
    deps.print(plan.message);
    return 2;
  }
  let release: () => void;
  try {
    release = acquireDbLock(deps.lockFile);
  } catch (err) {
    if (err instanceof DbLockedError) { deps.print(DRAFT_LOCK_MESSAGE); return 4; }
    throw err;
  }
  try {
    let db: Db;
    try {
      db = await deps.openDb();
    } catch (err) {
      if (err instanceof DbLockedError) { deps.print(DB_OPEN_MESSAGE); return 4; }
      throw err;
    }
    const handler = path.join(deps.root, plan.decl.handler);
    if (deps.hosted) {
      // One transaction stays open for the whole run, holding a transaction-scoped advisory lock,
      // which also works through Supabase's transaction pooler. It commits when the handler exits.
      try {
        return await db.transaction(async (tx) => {
          const [lock] = await tx.query<{ got: boolean }>("select pg_try_advisory_xact_lock(hashtext($1)) as got", [DRAFT_LOCK]);
          if (!lock?.got) { deps.print(DRAFT_LOCK_MESSAGE); return 4; }
          if (await pausedIn(tx)) { await recordDraftSkip(tx, deps.now); deps.print(PAUSED_MESSAGE); return 3; }
          return deps.spawn(handler, plan.argv);
        });
      } finally {
        await db.close();
      }
    }
    try {
      if (await pausedIn(db)) {
        await recordDraftSkip(db, deps.now);
        deps.print(PAUSED_MESSAGE);
        return 3;
      }
    } finally {
      await db.close();
    }
    return await deps.spawn(handler, plan.argv);
  } finally {
    release();
  }
}
