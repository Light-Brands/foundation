import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { Db } from "./types";

// A transaction-scoped advisory lock: it works through Supabase's transaction pooler and releases at commit.
export const MIGRATE_LOCK = "foundation:migrate";

async function ensureTable(db: Db) {
  await db.transaction(async (tx) => {
    await tx.query("select pg_advisory_xact_lock(hashtext($1))", [MIGRATE_LOCK]);
    await tx.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
  });
}

export async function normalizeLegacyNames(db: Db): Promise<void> {
  await ensureTable(db);
  await db.exec("update _migrations set name = 'core/' || name where position('/' in name) = 0");
}

export async function migrate(db: Db, dir: string, prefix: string): Promise<string[]> {
  await ensureTable(db);
  const done = new Set((await db.query<{ name: string }>("select name from _migrations")).map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const applied: string[] = [];
  for (const file of files) {
    const name = `${prefix}/${file}`;
    if (done.has(name)) continue;
    const sql = await readFile(path.join(dir, file), "utf8");
    let ran: boolean;
    try {
      // Under the lock, check again: another start may have applied this file since the list above.
      ran = await db.transaction(async (tx) => {
        await tx.query("select pg_advisory_xact_lock(hashtext($1))", [MIGRATE_LOCK]);
        if ((await tx.query("select 1 as hit from _migrations where name = $1", [name])).length) return false;
        await tx.exec(sql);
        await tx.query("insert into _migrations (name) values ($1)", [name]);
        return true;
      });
    } catch (err) {
      throw new Error(`Migration ${name} failed: ${(err as Error).message}`);
    }
    if (ran) applied.push(name);
  }
  return applied;
}

async function isDir(p: string): Promise<boolean> {
  try { return (await stat(p)).isDirectory(); } catch { return false; }
}

export async function migrateAll(db: Db, root: string): Promise<string[]> {
  await normalizeLegacyNames(db);
  const applied = await migrate(db, path.join(root, "core/db/migrations"), "core");
  const appsDir = path.join(root, "key/apps");
  if (await isDir(appsDir)) {
    for (const app of (await readdir(appsDir)).sort()) {
      const dir = path.join(appsDir, app, "migrations");
      if (await isDir(dir)) applied.push(...(await migrate(db, dir, app)));
    }
  }
  return applied;
}
