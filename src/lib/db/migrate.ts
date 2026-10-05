import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { Db } from "./types";

async function ensureTable(db: Db) {
  await db.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
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
    await db.exec("begin");
    try {
      await db.exec(sql);
      await db.query("insert into _migrations (name) values ($1)", [name]);
      await db.exec("commit");
    } catch (err) {
      try { await db.exec("rollback"); } catch { /* keep the original error */ }
      throw new Error(`Migration ${name} failed: ${(err as Error).message}`);
    }
    applied.push(name);
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
