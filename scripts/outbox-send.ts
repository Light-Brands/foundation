import { openScriptDb } from "../src/lib/db/script";
import { drainOutbox, type DrainResult } from "../src/lib/outbox/drain";

// Owner-run: npm run outbox:send. One pass of the email sender from the owner's computer, the same pass the
// host's schedule runs: only while email sending is connected and the pause switch is off.
try { process.loadEnvFile(".env.local"); } catch { /* no .env.local: use the settings already set */ }

const SAID: Record<DrainResult["status"], string> = {
  ran: "",
  no_database: "There is no database to send from.",
  not_connected: "Email sending is not connected, so nothing was sent.",
  paused: "Your command center is paused, so nothing was sent.",
  no_sender: "The email sender could not be loaded, so nothing was sent.",
  no_setting: "The email sender's setting is not set, so nothing was sent.",
  no_secret: "FOUNDATION_SECRET is not set to at least 32 characters, so nothing was sent.",
  bounces_unrecorded: "A bounce could not be recorded, so nothing was sent.",
  error: "The email sender stopped, so some email may still be waiting.",
};

async function main() {
  const db = await openScriptDb(process.cwd());
  try {
    const r = await drainOutbox(db, process.env, new Date());
    console.log(r.status === "ran" ? `Sent ${r.sent}, not sent ${r.failed}, stopped ${r.refused}.` : SAID[r.status]);
    return r.status === "error" ? 1 : 0;
  } finally {
    await db.close();
  }
}

main().then(
  (code) => process.exit(code),
  (e: Error) => { console.log(`outbox:send could not finish: ${e.message.split("\n")[0]}`); process.exit(1); },
);
