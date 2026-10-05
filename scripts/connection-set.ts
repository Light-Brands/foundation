import { openScriptDb } from "../src/lib/db/script";
import { parseConnectionSetArgs, setConnectionStatus } from "../src/lib/data/connections";

// Owner-run: npm run connection:set -- <service> <status> [--note <text>] [--tested]. --tested stamps tested_on with today's business date. A connection's install runs it to
// mark itself connected or failing. It writes through the same validator as the Connections screen.
try { process.loadEnvFile(".env.local"); } catch { /* no .env.local: use the settings already set */ }

const args = parseConnectionSetArgs(process.argv.slice(2));
if (!args.ok) {
  console.log(args.error);
  process.exit(1);
}

async function main(value: { service: string; status: "planned" | "connected" | "failing" | "disconnected"; note: string; tested: boolean }) {
  const db = await openScriptDb(process.cwd());
  try {
    await setConnectionStatus(db, value, new Date());
    console.log(`${value.service} is now ${value.status}${value.tested ? ", tested today" : ""}.`);
  } finally {
    await db.close();
  }
}

main(args.value).catch((e: Error) => {
  console.log(`connection:set could not finish: ${e.message.split("\n")[0]}`);
  process.exit(1);
});
