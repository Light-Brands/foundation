import path from "node:path";
import { mkdir } from "node:fs/promises";
import { openPglite } from "../src/lib/db/pglite";
import { migrateAll } from "../src/lib/db/migrate";
import { pruneWebhookEvents, PRUNE_MIN_DAYS } from "../src/lib/hooks/events";

// Owner-run: forgets inbound webhook records older than the given days. Webhook code never deletes them.
// Usage: npm run hooks:prune -- <days>, with at least 30 days.
const arg = process.argv[2] ?? "";
const days = /^\d+$/.test(arg) ? Number(arg) : NaN;
if (!Number.isInteger(days) || days < PRUNE_MIN_DAYS) {
  console.log(`Keep at least ${PRUNE_MIN_DAYS} days of webhook events. Run npm run hooks:prune -- ${PRUNE_MIN_DAYS} or a larger number of days.`);
  process.exit(1);
}

async function main() {
  const root = process.cwd();
  const dir = path.resolve(root, process.env.FOUNDATION_DATA_DIR?.trim() || ".data/pglite");
  await mkdir(dir, { recursive: true });
  const db = await openPglite(dir);
  try {
    await migrateAll(db, root);
    const n = await pruneWebhookEvents(db, days, new Date());
    console.log(`Removed ${n} webhook events older than ${days} days.`);
  } finally {
    await db.close();
  }
}

main().catch((e: Error) => {
  console.log(`hooks:prune could not finish: ${e.message}`);
  process.exit(1);
});
