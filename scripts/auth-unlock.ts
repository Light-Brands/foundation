import { openScriptDb } from "../src/lib/db/script";
import { openSupabase } from "../src/lib/db/supabase";
import { migrateAll } from "../src/lib/db/migrate";
import { readEnv } from "../src/lib/env";
import { clearGateAttempts } from "../src/lib/auth/limit";
import type { Db } from "../src/lib/db/types";

// Owner-run, the way in when sign-in is waiting: forgets every sign-in try, so every address may try again now.
// Usage: npm run auth:unlock. It reaches the hosted database when FOUNDATION_DATABASE_URL is set (in .env.local or
// the shell), otherwise the local one, with the command center closed. It needs no sign-in: whoever can run it
// already holds the database.
try { process.loadEnvFile(".env.local"); } catch { /* no .env.local: use the settings already set */ }

async function open(): Promise<Db> {
  const env = readEnv();
  if (!env.databaseUrl) return openScriptDb();
  const db = openSupabase(env.databaseUrl, { max: 1, ca: env.databaseCa });
  await migrateAll(db, process.cwd());
  return db;
}

async function main() {
  const db = await open();
  try {
    const n = await clearGateAttempts(db);
    console.log(n ? "Sign-in is open again. Every address may try the PIN now." : "Sign-in was not waiting. Nothing to clear.");
  } finally {
    await db.close();
  }
}

main().catch((e: Error) => {
  console.log(`auth:unlock could not finish: ${e.message}`);
  process.exit(1);
});
