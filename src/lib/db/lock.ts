import { linkSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

// Only one program may open the local database at a time: PGlite does not guard its own folder,
// and two writers corrupt it. The lock is a file next to the data folder holding the owner's pid.
export const DB_OPEN_MESSAGE = "The command center is open. Close it, then run this again.";

export class DbLockedError extends Error {
  constructor() {
    super(DB_OPEN_MESSAGE);
    this.name = "DbLockedError";
  }
}

export const lockFileFor = (dataDir: string): string => `${path.resolve(dataDir)}.lock`;

export function pidAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
}

function readPid(file: string): number | null {
  try {
    const n = Number(readFileSync(file, "utf8").trim());
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

const unlinkQuiet = (f: string) => {
  try { unlinkSync(f); } catch { /* already gone */ }
};

// Takes the lock or throws DbLockedError. Returns the release function, which also runs on process exit.
export function acquireDbLock(file: string, opts: { pid?: number; isAlive?: (pid: number) => boolean } = {}): () => void {
  const pid = opts.pid ?? process.pid;
  const isAlive = opts.isAlive ?? pidAlive;
  const tmp = `${file}.${pid}.${Date.now()}.tmp`;
  // Written whole first, then linked into place: link fails if the lock exists, so no reader sees a half-written file.
  writeFileSync(tmp, `${pid}\n`);
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        linkSync(tmp, file);
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
        const holder = readPid(file);
        if (holder !== null && isAlive(holder)) throw new DbLockedError();
        // The holder is gone. Move the stale lock aside, then make sure it was the stale one we moved.
        const aside = `${file}.${pid}.stale`;
        try { renameSync(file, aside); } catch { continue; }
        const moved = readPid(aside);
        if (moved !== null && moved !== holder && isAlive(moved)) {
          try { linkSync(aside, file); } catch { /* the new holder's lock is already back */ }
          unlinkQuiet(aside);
          throw new DbLockedError();
        }
        unlinkQuiet(aside);
        continue;
      }
      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        process.removeListener("exit", release);
        if (readPid(file) === pid) unlinkQuiet(file);
      };
      process.on("exit", release);
      return release;
    }
    throw new DbLockedError();
  } finally {
    unlinkQuiet(tmp);
  }
}
