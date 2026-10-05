import path from "node:path";
import { mkdir } from "node:fs/promises";
import { readEnv } from "@/lib/env";
import { selectDriver, type DriverKind } from "./driver";
import { openPglite } from "./pglite";
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

async function open(): Promise<Db | null> {
  const env = readEnv();
  if (selectDriver(env) === "preview") return null;
  const dir = path.resolve(process.cwd(), env.dataDir);
  await mkdir(dir, { recursive: true });
  const db = await openPglite(dir);
  try {
    await migrateAll(db, process.cwd());
    const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from business_profile");
    if (n === 0) await db.query("insert into business_profile (business) values ($1)", [env.businessName]);
    return db;
  } catch (err) {
    await db.close().catch(() => {});
    throw err;
  }
}
