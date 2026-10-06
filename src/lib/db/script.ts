import path from "node:path";
import { mkdir } from "node:fs/promises";
import { readEnv } from "@/lib/env";
import { openPglite } from "./pglite";
import { migrateAll } from "./migrate";
import type { Db } from "./types";

// Commands on the owner's computer open the same database the app opens, through the same lock.
// Scripts run with --conditions=react-server so the server-only marker in env.ts resolves.
export async function openScriptDb(root: string = process.cwd()): Promise<Db> {
  const env = readEnv();
  const dir = path.resolve(root, env.dataDir);
  await mkdir(dir, { recursive: true });
  const db = await openPglite(dir);
  try {
    await migrateAll(db, root);
    return db;
  } catch (err) {
    await db.close().catch(() => {});
    throw err;
  }
}
