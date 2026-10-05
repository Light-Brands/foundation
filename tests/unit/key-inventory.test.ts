import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, utimesSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildInventory, replaceInventory } from "@/lib/key/inventory";

const keyYaml = `key: 1
roster:
  - { persona: Dana, role: coordinator, charter: agents/coordinator/charter.md, added: 2026-10-05, version: 1 }
skills:
  - { slug: reminder-writing, path: skills/reminder-writing/SKILL.md, agent: coordinator }
apps:
  - { slug: booking, definition: apps/booking/definition.yaml, category: deliver }
routines:
  - { slug: booking-reminders, path: routines/booking-reminders.md, agent: coordinator, category: deliver }
`;

describe("inventory", () => {
  it("lists apps and routines under their category and skills under their role", () => {
    const inv = buildInventory(keyYaml);
    const deliver = inv.slice(inv.indexOf("### Deliver"), inv.indexOf("## Roles"));
    expect(deliver).toContain("App: booking");
    expect(deliver).toContain("Routine: booking-reminders");
    const role = inv.slice(inv.indexOf("### coordinator"));
    expect(role).toContain("Skill: reminder-writing");
  });
  it("is idempotent and leaves outside text untouched", () => {
    const doc = "# Top\r\n\nbefore  \n<!-- inventory:start -->\nold\n<!-- inventory:end -->\nafter\n\n";
    const once = replaceInventory(doc, buildInventory(keyYaml));
    expect(replaceInventory(once, buildInventory(keyYaml))).toBe(once);
    expect(once.startsWith("# Top\r\n\nbefore  \n<!-- inventory:start -->")).toBe(true);
    expect(once.endsWith("<!-- inventory:end -->\nafter\n\n")).toBe(true);
    expect(once).not.toContain("old");
  });
  it("appends a marked block when there are no markers", () => {
    const out = replaceInventory("# Doc\n", "inv\n");
    expect(out).toBe("# Doc\n\n<!-- inventory:start -->\ninv\n<!-- inventory:end -->\n");
  });
});

describe("key:sync", () => {
  it("runs twice with identical results", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "keysync-"));
    mkdirSync(path.join(dir, "key/knowledge"), { recursive: true });
    cpSync("key/knowledge/system.md", path.join(dir, "key/knowledge/system.md"));
    writeFileSync(path.join(dir, "key/key.yaml"), keyYaml);
    const run = () => execFileSync("npx", ["tsx", path.resolve("scripts/key-sync.ts"), "--root", dir], { stdio: "pipe" });
    run();
    const first = readFileSync(path.join(dir, "key/knowledge/system.md"), "utf8");
    run();
    expect(readFileSync(path.join(dir, "key/knowledge/system.md"), "utf8")).toBe(first);
    expect(first).toContain("App: booking");
    expect(first).toContain("## Recent changes");
  }, 60000);

  it("says no change and leaves the file alone when nothing differs", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "keysync-"));
    mkdirSync(path.join(dir, "key/knowledge"), { recursive: true });
    cpSync("key/knowledge/system.md", path.join(dir, "key/knowledge/system.md"));
    writeFileSync(path.join(dir, "key/key.yaml"), keyYaml);
    const run = () => execFileSync("npx", ["tsx", path.resolve("scripts/key-sync.ts"), "--root", dir], { stdio: "pipe" }).toString();
    expect(run()).toContain("key:sync updated key/knowledge/system.md");
    const f = path.join(dir, "key/knowledge/system.md");
    const t = new Date(2020, 0, 1);
    utimesSync(f, t, t);
    expect(run()).toContain("No change to key/knowledge/system.md");
    expect(statSync(f).mtimeMs).toBe(t.getTime());
  }, 60000);
});
