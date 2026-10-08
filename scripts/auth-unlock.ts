import path from "node:path";
import { existsSync } from "node:fs";
import { openPglite } from "../src/lib/db/pglite";
import { openPostgres } from "../src/lib/db/postgres";
import { readEnv } from "../src/lib/env";
import { clearGateAttempts, gateTablesExist } from "../src/lib/auth/limit";
import type { Db } from "../src/lib/db/types";

// Owner-run, the way in when sign-in is waiting: forgets every client lockout and every counted try, so sign-in opens now.
// Usage: npm run auth:unlock. It reaches the hosted database when FOUNDATION_DATABASE_URL is set (in .env.local or
// the shell), otherwise the local one, with the command center closed. It needs no sign-in: whoever can run it
// already holds the database. It only deletes. It never runs migrations, so a checkout ahead of production never
// changes the live database's schema, and a database without the limiter's tables is reported, not built.
try { process.loadEnvFile(".env.local"); } catch { /* no .env.local: use the settings already set */ }

class Stop extends Error {}

async function open(): Promise<Db> {
  const env = readEnv();
  if (env.databaseUrl) return openPostgres(env.databaseUrl, { max: 1, ca: env.databaseCa });
  const dir = path.resolve(env.dataDir);
  if (!existsSync(dir)) throw new Stop(`There is no local database at ${env.dataDir}, so there is nothing to clear.`);
  return openPglite(dir);
}

async function main() {
  const db = await open();
  try {
    if (!(await gateTablesExist(db))) {
      throw new Stop("The sign-in limiter's tables are not in this database, so there is nothing to clear. Deploy this version, or start the command center once, and its migrations add them. Nothing was changed.");
    }
    const n = await clearGateAttempts(db);
    console.log(n ? "Sign-in is open again. Every address may try the PIN now." : "Sign-in was not waiting. Nothing to clear.");
  } finally {
    await db.close();
  }
}

main().catch((e: Error) => {
  console.log(e instanceof Stop ? e.message : `auth:unlock could not finish: ${e.message}`);
  process.exit(1);
});
