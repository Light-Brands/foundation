import { describe, it, expect } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { acquireDbLock, lockFileFor, currentBootTime, DB_OPEN_MESSAGE } from "@/lib/db/lock";
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
    expect(readFileSync(file, "utf8")).toBe(`${process.pid}\n${currentBootTime()}\n`);
    expect(() => acquireDbLock(file, { pid: process.pid })).toThrow(DB_OPEN_MESSAGE);
    expect(DB_OPEN_MESSAGE).toBe("Another program has the local database open (the command center or a command such as npm run brief). Close it, then run this again. If nothing is open, delete .data/pglite.lock.");
    release();
    expect(existsSync(file)).toBe(false);
    acquireDbLock(file, { pid: process.pid })();
  });

  it("reclaims a lock whose pid is not alive", () => {
    const file = path.join(scratch(), "pglite.lock");
    writeFileSync(file, `${deadPid()}\n${currentBootTime()}\n`);
    const release = acquireDbLock(file, { pid: process.pid });
    expect(readFileSync(file, "utf8").split("\n")[0]).toBe(String(process.pid));
    release();
  });

  it("records the boot time to the second, the same on every read", () => {
    const boot = currentBootTime();
    expect(boot % 1000).toBe(0);
    expect(Math.abs(currentBootTime() - boot)).toBeLessThanOrEqual(1000);
    expect(boot).toBeLessThanOrEqual(Date.now());
  });

  it("reclaims a lock from an earlier boot, even when its pid is running again", () => {
    const file = path.join(scratch(), "pglite.lock");
    const earlier = currentBootTime() - 3600_000;
    // After a restart the old pid can belong to a new, unrelated process: here, this very test.
    writeFileSync(file, `${process.pid}\n${earlier}\n`);
    const release = acquireDbLock(file, { pid: process.pid });
    expect(readFileSync(file, "utf8")).toBe(`${process.pid}\n${currentBootTime()}\n`);
    release();
  });

  it("reclaims a lock whose pid now belongs to another user (EPERM)", () => {
    const file = path.join(scratch(), "pglite.lock");
    // pid 1 belongs to the system, so a real check also answers EPERM.
    writeFileSync(file, `1\n${currentBootTime()}\n`);
    const kill = (pid: number) => {
      if (pid === 1) throw Object.assign(new Error("not permitted"), { code: "EPERM" });
    };
    const release = acquireDbLock(file, { pid: process.pid, kill });
    expect(readFileSync(file, "utf8").split("\n")[0]).toBe(String(process.pid));
    release();
  });

  it("still blocks on a live lock from this boot", () => {
    const file = path.join(scratch(), "pglite.lock");
    writeFileSync(file, `4242\n${currentBootTime()}\n`);
    const kill = () => {};
    expect(() => acquireDbLock(file, { pid: process.pid, kill })).toThrow(DB_OPEN_MESSAGE);
    expect(readFileSync(file, "utf8").split("\n")[0]).toBe("4242");
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
