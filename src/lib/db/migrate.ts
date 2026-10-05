import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Db } from "./types";

export async function migrate(db: Db, dir: string): Promise<string[]> {
  await db.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
  const done = new Set((await db.query<{ name: string }>("select name from _migrations")).map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const applied: string[] = [];
  for (const file of files) {
    if (done.has(file)) continue;
    const sql = await readFile(path.join(dir, file), "utf8");
    await db.exec("begin");
    try {
      await db.exec(sql);
      await db.query("insert into _migrations (name) values ($1)", [file]);
      await db.exec("commit");
    } catch (err) {
      await db.exec("rollback");
      throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
    }
    applied.push(file);
  }
  return applied;
}
