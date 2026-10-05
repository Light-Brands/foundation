import path from "node:path";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";
import type { Db } from "@/lib/db/types";

export const ROOT = path.resolve(__dirname, "../..");
export const CORE_MIGRATIONS = path.join(ROOT, "core/db/migrations");
export const KEY_EXT = path.join(ROOT, "tests/fixtures/key-ext");

/** An in-memory database with every core migration. */
export async function coreDb(): Promise<Db> {
  const db = await openPglite();
  await migrate(db, CORE_MIGRATIONS, "core");
  return db;
}
