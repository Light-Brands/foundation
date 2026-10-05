import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { runDraft } from "../src/lib/drafts/command";
import { openScriptDb } from "../src/lib/db/script";

// npm run draft -- <routine> <step> [args]. The only place a handler process starts.
const root = process.cwd();
mkdirSync(path.join(root, ".data"), { recursive: true });

runDraft(process.argv.slice(2), {
  root,
  lockFile: path.join(root, ".data/draft.lock"),
  openDb: () => openScriptDb(root),
  print: (line) => console.log(line),
  now: new Date(),
  spawn: (handler, argv) =>
    new Promise((resolve) => {
      const child = spawn(process.execPath, ["--conditions=react-server", "--import", "tsx", handler, ...argv], { cwd: root, stdio: "inherit", env: process.env });
      child.on("error", () => resolve(1));
      child.on("exit", (code, signal) => resolve(code ?? (signal ? 1 : 0)));
    }),
}).then(
  (code) => process.exit(code),
  (err) => { console.error(`The drafting command stopped: ${(err as Error).message}`); process.exit(1); },
);
