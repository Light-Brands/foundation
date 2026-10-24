import path from "node:path";
import { mkdir } from "node:fs/promises";
import { readEnv } from "@/lib/env";
import { databaseInsecureMessage, selectDriver, type DriverKind } from "./driver";
import { openPglite } from "./pglite";
import { openPostgres } from "./postgres";
import { tablesWithoutRls } from "./rls";
import { migrateAll } from "./migrate";
import type { Db } from "./types";

const g = globalThis as unknown as { __foundationDb?: Promise<Db | null> };

export function storageMode(): DriverKind {
  return selectDriver(readEnv());
}

export function getDb(): Promise<Db | null> {
  g.__foundationDb ??= open().catch((err) => {
    g.__foundationDb = undefined;
    throw err;
  });
  return g.__foundationDb;
}

async function openLocal(dataDir: string): Promise<Db> {
  const dir = path.resolve(process.cwd(), dataDir);
  await mkdir(dir, { recursive: true });
  return openPglite(dir);
}

async function open(): Promise<Db | null> {
  const env = readEnv();
  const kind = selectDriver(env);
  if (env.databaseProblem === "insecure") console.error(databaseInsecureMessage(env.databaseSetting ?? undefined));
  if (kind === "preview") return null;
  const db = kind === "postgres" ? openPostgres(env.databaseUrl as string, { ca: env.databaseCa, setting: env.databaseSetting ?? undefined }) : await openLocal(env.dataDir);
  try {
    await migrateAll(db, process.cwd());
    // One statement, so two starts at once never seed two rows.
    await db.query("insert into business_profile (id, business, chief_name) values (1, $1, $2) on conflict (id) do nothing", [env.businessName, env.chiefName]);
    if (kind === "postgres") {
      const unprotected = await tablesWithoutRls(db);
      if (unprotected.length) console.error(`These tables have no row level security: ${unprotected.join(", ")}. Add it in their app's migrations.`);
    }
    return db;
  } catch (err) {
    await db.close().catch(() => {});
    throw err;
  }
}
