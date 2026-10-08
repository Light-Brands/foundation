import { describe, it, expect, vi } from "vitest";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { CORE_MIGRATIONS, KEY_EXT, ROOT, coreDb } from "../support/db";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";
import { acquireDbLock } from "@/lib/db/lock";
import { setPause } from "@/lib/data/pause";
import { readDeclarations, type Declarations } from "@/lib/key/declarations";
import { DRAFT_LOCK_MESSAGE, PAUSED_MESSAGE, draftsFrom, planDraft, runDraft } from "@/lib/drafts/command";
import { HandlerError, parseFlags, runHandler } from "@/lib/drafts/handler";

const NOW = new Date("2026-10-05T16:00:00Z");
function scratchRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "draft-"));
  cpSync(KEY_EXT, root, { recursive: true });
  mkdirSync(path.join(root, ".data"), { recursive: true });
  return root;
}
const deps = (root: string, extra: Partial<Parameters<typeof runDraft>[1]> = {}) => ({
  root, lockFile: path.join(root, ".data/draft.lock"), openDb: () => coreDb(), spawn: vi.fn(async () => 0), print: vi.fn(), now: NOW, ...extra,
});

describe("planDraft", () => {
  it("plans a declared drafting command and refuses everything else", async () => {
    const drafts = draftsFrom(await readDeclarations(KEY_EXT));
    expect(planDraft(drafts, ["lead-watch", "save", "--week", "2026-10-05"], () => true)).toEqual({
      status: "run", decl: { routine: "lead-watch", handler: "src/drafts/lead-watch.ts", subcommands: ["list", "save"] }, argv: ["save", "--week", "2026-10-05"],
    });
    expect(planDraft(drafts, [], () => true)).toMatchObject({ status: "usage", message: "Use: npm run draft -- <routine> <step>. Routines with a drafting command: lead-watch (list, save)." });
    expect(planDraft(drafts, ["review-ask", "list"], () => true).status).toBe("unknown_routine");
    expect(planDraft(drafts, ["lead-watch", "send"], () => true)).toMatchObject({ status: "unknown_subcommand", message: "lead-watch has no step called send. Its steps are list, save." });
    expect(planDraft(drafts, ["lead-watch", "list"], () => false).status).toBe("no_handler");
  });
  it("reaches the Monday brief's existing command, and a declared block wins", () => {
    const bare = { drafts: [], routines: ["monday-brief"] } as Pick<Declarations, "drafts" | "routines">;
    expect(draftsFrom(bare).get("monday-brief")).toEqual({ routine: "monday-brief", handler: "src/lib/data/briefs-command.ts", subcommands: ["numbers", "save", "check", "blocked"] });
    const declared = { drafts: [{ routine: "monday-brief", handler: "src/lib/drafts/brief.ts", subcommands: ["numbers"] }], routines: ["monday-brief"] };
    expect(draftsFrom(declared).get("monday-brief")?.handler).toBe("src/lib/drafts/brief.ts");
    expect(draftsFrom({ drafts: [], routines: [] }).has("monday-brief")).toBe(false);
  });
});

describe("runDraft", () => {
  it("runs the handler with the step and its flags, and returns its exit code", async () => {
    const root = scratchRoot();
    const d = deps(root, { spawn: vi.fn(async () => 7) });
    expect(await runDraft(["lead-watch", "save", "--week", "2026-10-05"], d)).toBe(7);
    expect(d.spawn).toHaveBeenCalledWith(path.join(root, "src/drafts/lead-watch.ts"), ["save", "--week", "2026-10-05"]);
  });
  it("with the pause flag on, the drafting command writes one skipped record and nothing else", async () => {
    const root = scratchRoot();
    const dir = path.join(root, ".data/pglite");
    const setup = await openPglite(dir);
    await migrate(setup, CORE_MIGRATIONS, "core");
    await setPause(setup, { paused: true, reason: "", by: "pin:owner" }, NOW);
    await setup.close();
    const d = deps(root, { openDb: () => openPglite(dir) });
    expect(await runDraft(["lead-watch", "list"], d)).toBe(3);
    expect(await runDraft(["lead-watch", "list"], d)).toBe(3);
    expect(d.spawn).not.toHaveBeenCalled();
    expect(d.print).toHaveBeenCalledWith(PAUSED_MESSAGE);
    const check = await openPglite(dir);
    expect(await check.query("select check_slug, period, result from check_runs")).toEqual([{ check_slug: "runner/draft", period: "2026-10-05", result: "skipped_paused" }]);
    await check.close();
  }, 60_000);
  it("reads a missing pause setting as paused", async () => {
    const root = scratchRoot();
    const dir = path.join(root, ".data/pglite");
    const setup = await openPglite(dir);
    await migrate(setup, CORE_MIGRATIONS, "core");
    await setup.query("delete from pause");
    await setup.close();
    const d = deps(root, { openDb: () => openPglite(dir) });
    expect(await runDraft(["lead-watch", "list"], d)).toBe(3);
    expect(d.spawn).not.toHaveBeenCalled();
  }, 60_000);
  it("a second drafting run while one holds the lock stops with a plain message", async () => {
    const root = scratchRoot();
    const d = deps(root);
    const release = acquireDbLock(d.lockFile);
    try {
      expect(await runDraft(["lead-watch", "list"], d)).toBe(4);
      expect(d.print).toHaveBeenCalledWith(DRAFT_LOCK_MESSAGE);
      expect(d.spawn).not.toHaveBeenCalled();
    } finally {
      release();
    }
  });
  it("on the hosted database, holds the database lock for the whole run", async () => {
    const root = scratchRoot();
    const d = deps(root, { hosted: true, spawn: vi.fn(async () => 0) });
    expect(await runDraft(["lead-watch", "list"], d)).toBe(0);
    expect(d.spawn).toHaveBeenCalledTimes(1);
    const busy = {
      query: async () => [], exec: async () => {}, close: async () => {},
      transaction: async <T,>(fn: (tx: { query: (s: string) => Promise<unknown[]>; exec: () => Promise<void> }) => Promise<T>) =>
        fn({ query: async (sql: string) => (/pg_try_advisory_xact_lock/.test(sql) ? [{ got: false }] : []), exec: async () => {} }),
    };
    const held = deps(root, { hosted: true, openDb: async () => busy as never });
    expect(await runDraft(["lead-watch", "list"], held)).toBe(4);
    expect(held.print).toHaveBeenCalledWith(DRAFT_LOCK_MESSAGE);
    expect(held.spawn).not.toHaveBeenCalled();
  });
  it("refuses an unknown step without taking the lock", async () => {
    const root = scratchRoot();
    const d = deps(root);
    expect(await runDraft(["lead-watch", "send"], d)).toBe(2);
    expect(readdirSync(path.join(root, ".data"))).toEqual([]);
  });
});

describe("runHandler", () => {
  it("respects the pause switch when started directly", async () => {
    const db = await coreDb();
    await setPause(db, { paused: true, reason: "", by: "pin:owner" }, NOW);
    const err: string[] = [];
    const step = vi.fn(async () => {});
    const kept = { query: db.query.bind(db), exec: db.exec.bind(db), transaction: db.transaction.bind(db), close: async () => {} };
    expect(await runHandler(["list"], { list: step }, { openDb: async () => kept, writeError: (s) => err.push(s), now: NOW })).toBe(3);
    expect(step).not.toHaveBeenCalled();
    expect(err).toEqual([`${PAUSED_MESSAGE}\n`]);
    expect(await db.query("select check_slug, result from check_runs")).toEqual([{ check_slug: "runner/draft", result: "skipped_paused" }]);
    await db.close();
  });
  it("parses flags, prints JSON lines, and reports a plain error", async () => {
    expect(parseFlags(["--week", "2026-10-05", "--dry", "--step=2", "extra"])).toEqual({ flags: { week: "2026-10-05", dry: "true", step: "2" }, rest: ["extra"] });
    const out: string[] = [];
    const err: string[] = [];
    const io = { openDb: () => coreDb(), write: (s: string) => out.push(s), writeError: (s: string) => err.push(s), now: NOW };
    const subs = {
      list: async ({ out: print, flags }: { out: (v: unknown) => void; flags: Record<string, string> }) => print({ week: flags.week }),
      save: async () => { throw new HandlerError("The brief was empty. Write it, then run save again."); },
    };
    expect(await runHandler(["list", "--week", "2026-10-05"], subs, io)).toBe(0);
    expect(out).toEqual(['{"week":"2026-10-05"}\n']);
    expect(await runHandler(["save"], subs, io)).toBe(1);
    expect(err).toEqual(["The brief was empty. Write it, then run save again.\n"]);
    expect(await runHandler(["toString"], subs, io)).toBe(2);
  });
});

describe("process safety", () => {
  it("nothing under src can start a process", () => {
    const walk = (d: string): string[] => readdirSync(d).flatMap((n) => {
      const f = path.join(d, n);
      return statSync(f).isDirectory() ? walk(f) : /\.(ts|tsx)$/.test(n) ? [f] : [];
    });
    const hits = walk(path.join(ROOT, "src")).filter((f) => /child_process/.test(readFileSync(f, "utf8")));
    expect(hits).toEqual([]);
  });
});
