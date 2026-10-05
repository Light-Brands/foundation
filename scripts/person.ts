import path from "node:path";
import { openScriptDb } from "../src/lib/db/script";
import { loadCardKinds } from "../src/lib/data/card-kinds";
import { exportPerson, exportTarget, writeExport, forgetPerson, forgetSummary, installedPersonRefs, type ForgetOutcome } from "../src/lib/data/person";
import { parseFlags } from "../src/lib/drafts/handler";
import { parseEmail } from "../src/lib/email";
import { PIN_OWNER } from "../src/lib/auth/roles";

// Owner-run, with the command center closed:
//   npm run person -- export <email> [--out <folder inside .data>]
//   npm run person -- forget <email>
// Forget raises a card first. Nothing is removed until the owner approves it in the Inbox and runs forget again.
// The command runs in the owner's own terminal on the owner's computer, the same trust as the PIN, so it acts as
// the owner. Nothing it prints holds the address or anything found: only counts and table names.
try { process.loadEnvFile(".env.local"); } catch { /* no .env.local: use the settings already set */ }

const USE = "Give one plain email address: npm run person -- export <email>, or npm run person -- forget <email>.";

const SAID: Record<Exclude<ForgetOutcome["status"], "forgotten">, string> = {
  owner_only: "Only the owner can see or remove a person's records.",
  nothing: "Nothing is held about this person.",
  has_account: "This person still has an account. Remove it first with npm run accounts -- remove, then run this again.",
  card_raised: "A card is waiting in your Inbox listing what will be removed. Approve it, then run this again.",
  waiting: "The card in your Inbox still waits for your decision. Approve it, then run this again.",
  sending: "An email to this person is being sent right now. Wait a minute, then run this again.",
  done_before: "This person was already forgotten, and nothing new is held about them.",
};

async function main(argv: string[]): Promise<number> {
  const [cmd, ...rest] = argv;
  const { flags, rest: args } = parseFlags(rest);
  // One plain address, read by the one strict parser, before the database is opened.
  if ((cmd !== "export" && cmd !== "forget") || args.length !== 1 || !parseEmail(args[0]).ok) {
    console.log(USE);
    return 2;
  }
  const email = args[0];
  const root = process.cwd();
  const db = await openScriptDb(root);
  try {
    const refs = await installedPersonRefs(root);
    const now = new Date();
    if (cmd === "export") {
      const data = await exportPerson(db, refs, email, now, { actor: PIN_OWNER });
      const file = exportTarget(root, flags.out ?? null, data.email_hash, now.toISOString().slice(0, 10));
      writeExport(file, JSON.stringify(data, null, 2));
      console.log(`Saved everything held about this person to ${path.relative(root, file)}. Send it to them privately.`);
      return 0;
    }
    const r = await forgetPerson(db, await loadCardKinds(root), refs, email, now, { actor: PIN_OWNER });
    console.log(r.status === "forgotten" ? `${forgetSummary(r.counts)} Add that line, as it is, to your build log.` : SAID[r.status]);
    return r.status === "forgotten" || r.status === "card_raised" ? 0 : 1;
  } finally {
    await db.close();
  }
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err) => { console.log(`The person command stopped: ${(err as Error).message.split("\n")[0]}`); process.exit(1); },
);
