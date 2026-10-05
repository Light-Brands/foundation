import path from "node:path";
import { mkdir } from "node:fs/promises";
import { readEnv } from "@/lib/env";
import { selectDriver, type DriverKind } from "./driver";
import { openPglite } from "./pglite";
import { migrate } from "./migrate";
import type { Db } from "./types";

const g = globalThis as unknown as { __foundationDb?: Promise<Db | null> };

export function storageMode(): DriverKind {
  return selectDriver(readEnv());
}

export function getDb(): Promise<Db | null> {
  g.__foundationDb ??= open();
  return g.__foundationDb;
}

async function open(): Promise<Db | null> {
  const env = readEnv();
  if (selectDriver(env) === "preview") return null;
  const dir = path.resolve(process.cwd(), env.dataDir);
  await mkdir(dir, { recursive: true });
  const db = await openPglite(dir);
  await migrate(db, path.join(process.cwd(), "db/migrations"));
  const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from business_profile");
  if (n === 0) await db.query("insert into business_profile (business_name) values ($1)", [env.businessName]);
  return db;
}
