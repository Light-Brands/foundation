import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.join(__dirname, "../..");

describe("npm run outbox:send", () => {
  it("is an npm script", () => {
    expect(JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).scripts["outbox:send"]).toBe("tsx --conditions=react-server scripts/outbox-send.ts");
  });
  it("sends nothing and says why while email sending is not connected", () => {
    const dir = path.join(mkdtempSync(path.join(tmpdir(), "outbox-send-")), "pglite");
    const r = spawnSync("npm", ["run", "-s", "outbox:send"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, FOUNDATION_DATA_DIR: dir } });
    expect(r.stdout).toMatch(/Email sending is not connected, so nothing was sent\./);
    expect(r.status).toBe(0);
  }, 120_000);
});
