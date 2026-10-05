import { describe, it, expect } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { acquireDbLock, lockFileFor, DB_OPEN_MESSAGE } from "@/lib/db/lock";
import { openPglite } from "@/lib/db/pglite";

const scratch = () => mkdtempSync(path.join(tmpdir(), "dblock-"));
// A pid that is certainly not running: a child that has already exited.
const deadPid = () => spawnSync("node", ["-e", ""]).pid!;

describe("the local database lock", () => {
  it("lives next to the data folder, so .data/pglite locks .data/pglite.lock", () => {
    expect(lockFileFor(".data/pglite")).toBe(path.resolve(".data/pglite.lock"));
  });

  it("refuses a second opener while the first holder is alive, with the plain message", () => {
    const file = path.join(scratch(), "pglite.lock");
    const release = acquireDbLock(file, { pid: process.pid });
    expect(readFileSync(file, "utf8").trim()).toBe(String(process.pid));
    expect(() => acquireDbLock(file, { pid: process.pid })).toThrow(DB_OPEN_MESSAGE);
    expect(DB_OPEN_MESSAGE).toBe("The command center is open. Close it, then run this again.");
    release();
    expect(existsSync(file)).toBe(false);
    acquireDbLock(file, { pid: process.pid })();
  });

  it("reclaims a lock whose pid is not alive", () => {
    const file = path.join(scratch(), "pglite.lock");
    writeFileSync(file, `${deadPid()}\n`);
    const release = acquireDbLock(file, { pid: process.pid });
    expect(readFileSync(file, "utf8").trim()).toBe(String(process.pid));
    release();
  });

  it("releases the lock when the holding process exits", () => {
    const file = path.join(scratch(), "pglite.lock");
    const lib = path.resolve("src/lib/db/lock.ts");
    const held = execFileSync("npx", ["tsx", "-e", `Promise.all([import("${lib}"), import("node:fs")]).then(([m, fs]) => { m.acquireDbLock(${JSON.stringify(file)}); console.log(fs.existsSync(${JSON.stringify(file)})); process.exit(0); })`], { encoding: "utf8", stdio: "pipe" });
    expect(held.trim()).toBe("true");
    expect(existsSync(file)).toBe(false);
  }, 60000);

  it("releases the lock when the holding process is stopped with a signal, and still stops", () => {
    const file = path.join(scratch(), "pglite.lock");
    const lib = path.resolve("src/lib/db/lock.ts");
    const r = spawnSync("npx", ["tsx", "-e", `Promise.all([import("${lib}"), import("node:fs")]).then(([m, fs]) => { m.acquireDbLock(${JSON.stringify(file)}); console.log(fs.existsSync(${JSON.stringify(file)})); process.kill(process.pid, "SIGTERM"); setTimeout(() => console.log("still running"), 2000); })`], { encoding: "utf8" });
    expect(r.stdout.trim()).toBe("true");
    expect(existsSync(file)).toBe(false);
  }, 60000);

  it("lets only one PGlite open the same folder, and frees it on close", async () => {
    const dir = path.join(scratch(), "pglite");
    const first = await openPglite(dir);
    await expect(openPglite(dir)).rejects.toThrow(DB_OPEN_MESSAGE);
    expect(existsSync(`${dir}.lock`)).toBe(true);
    await first.close();
    expect(existsSync(`${dir}.lock`)).toBe(false);
    const again = await openPglite(dir);
    await again.close();
  }, 60000);
});
