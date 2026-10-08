import { openScriptDb } from "../src/lib/db/script";
import { setChiefName, getProfile } from "../src/lib/data/profile";
import { contextBlockFromProfile } from "../src/lib/key/context-block";
import { keyRoot, writeContextBlock, writeKeyName } from "../src/lib/key/write";
import { readEnv } from "../src/lib/env";
import { chiefName } from "../src/lib/dictionary/prompt";

// Owner-run, with the command center closed:
//   npm run chief                 says the name every copied prompt opens with
//   npm run chief -- "Sage"       names the chief of staff
//   npm run chief -- --clear      goes back to Claude
// It saves through setChiefName, the same function the Agents page and Preferences use, then writes the Key's
// context block the way a Preferences save does.
try { process.loadEnvFile(".env.local"); } catch { /* no .env.local: use the settings already set */ }

const USE = 'Give one name: npm run chief -- "Sage", or npm run chief -- --clear to go back to Claude.';

async function main(argv: string[]): Promise<number> {
  if (argv.length > 1) { console.log(USE); return 2; }
  const db = await openScriptDb(process.cwd());
  try {
    const fallback = readEnv().businessName;
    if (argv.length === 0) {
      console.log(`Your chief of staff is ${chiefName(await getProfile(db, fallback))}.`);
      return 0;
    }
    const r = await setChiefName(db, argv[0] === "--clear" ? "" : argv[0], fallback);
    if (!r.ok) { console.log(r.error); return 1; }
    const root = keyRoot();
    await writeContextBlock(root, contextBlockFromProfile(r.profile, r.profile.owner_name, new Date().toISOString().slice(0, 10)));
    await writeKeyName(root, r.profile.business);
    console.log(`Your chief of staff is now ${chiefName(r.profile)}. Every prompt you copy opens with this name.`);
    return 0;
  } finally {
    await db.close();
  }
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err) => { console.log(`The chief command stopped: ${(err as Error).message.split("\n")[0]}`); process.exit(1); },
);
