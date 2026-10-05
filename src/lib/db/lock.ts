import { linkSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Only one program may open the local database at a time: PGlite does not guard its own folder,
// and two writers corrupt it. The lock is a file next to the data folder holding the owner's pid
// on its first line and the computer's boot time on its second.
export const DB_OPEN_MESSAGE = "Another program has the local database open (the command center or a command such as npm run brief). Close it, then run this again. If nothing is open, delete .data/pglite.lock.";

export class DbLockedError extends Error {
  constructor() {
    super(DB_OPEN_MESSAGE);
    this.name = "DbLockedError";
  }
}

export const lockFileFor = (dataDir: string): string => `${path.resolve(dataDir)}.lock`;

// When this computer started, in milliseconds, rounded to the second.
export const currentBootTime = (): number => Math.round((Date.now() - os.uptime() * 1000) / 1000) * 1000;

// The boot time is worked out from the clock, so it wobbles by a second or so, and more when the clock
// is set. A lock counts as from an earlier boot only when it is older than this.
const BOOT_SLACK_MS = 60_000;

type Kill = (pid: number, signal: 0) => void;
type Holder = { pid: number; boot: number | null; text: string };

// The holder still has the database open: the lock is from this boot, and its pid answers as ours.
// ESRCH means the process is gone. EPERM means the pid now belongs to another user's process,
// because every program that opens the database runs as the owner.
export function holderIsLive(h: Holder, bootNow: number, kill: Kill = process.kill): boolean {
  if (h.boot !== null && h.boot < bootNow - BOOT_SLACK_MS) return false;
  try {
    kill(h.pid, 0);
    return true;
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    return code !== "ESRCH" && code !== "EPERM";
  }
}

function readLock(file: string): Holder | null {
  let text: string;
  try { text = readFileSync(file, "utf8"); } catch { return null; }
  const [first, second] = text.split("\n");
  const pid = Number(first?.trim());
  if (!Number.isInteger(pid) || pid <= 0) return null;
  const b = Number(second?.trim());
  return { pid, boot: second?.trim() && Number.isInteger(b) ? b : null, text };
}

const SIGNALS: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGHUP"];

const unlinkQuiet = (f: string) => {
  try { unlinkSync(f); } catch { /* already gone */ }
};

// Takes the lock or throws DbLockedError. Returns the release function, which also runs on process exit.
export function acquireDbLock(file: string, opts: { pid?: number; kill?: Kill; bootTime?: number } = {}): () => void {
  const pid = opts.pid ?? process.pid;
  const kill = opts.kill ?? ((p: number, sig: 0) => { process.kill(p, sig); });
  const boot = opts.bootTime ?? currentBootTime();
  const mine = `${pid}\n${boot}\n`;
  const live = (h: Holder | null) => h !== null && holderIsLive(h, boot, kill);
  const tmp = `${file}.${pid}.${Date.now()}.tmp`;
  // Written whole first, then linked into place: link fails if the lock exists, so no reader sees a half-written file.
  writeFileSync(tmp, mine);
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        linkSync(tmp, file);
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
        const holder = readLock(file);
        if (live(holder)) throw new DbLockedError();
        // The holder is gone. Move the stale lock aside, then make sure it was the stale one we moved.
        const aside = `${file}.${pid}.stale`;
        try { renameSync(file, aside); } catch { continue; }
        const moved = readLock(aside);
        if (moved !== null && moved.text !== holder?.text && live(moved)) {
          try { linkSync(aside, file); } catch { /* the new holder's lock is already back */ }
          unlinkQuiet(aside);
          throw new DbLockedError();
        }
        unlinkQuiet(aside);
        continue;
      }
      let released = false;
      // Ctrl+C or a stop request: free the lock, then let the signal end the process as it would have,
      // unless another handler (such as Next's own) is there to end it.
      const onSignal = (signal: NodeJS.Signals) => {
        release();
        if (process.listenerCount(signal) === 0) process.kill(process.pid, signal);
      };
      const release = () => {
        if (released) return;
        released = true;
        process.removeListener("exit", release);
        for (const s of SIGNALS) process.removeListener(s, onSignal);
        if (readLock(file)?.text === mine) unlinkQuiet(file);
      };
      process.on("exit", release);
      for (const s of SIGNALS) process.once(s, onSignal);
      return release;
    }
    throw new DbLockedError();
  } finally {
    unlinkQuiet(tmp);
  }
}
