import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { openPglite } from "@/lib/db/pglite";
import { submitContact, decideCard } from "@/lib/data/inbox";
import { registryFrom } from "@/lib/data/card-kinds";
import { CORE_CARD_KINDS } from "@/lib/key/core-kinds";
import { PIN_OWNER } from "@/lib/auth/roles";

const ROOT = path.join(__dirname, "../..");
const SECRET = "person-script-secret-of-at-least-32-chars";

/** What the command said: its last line, after the build secret step's own line. */
const said = (stdout: string) => stdout.trim().split("\n").at(-1) ?? "";

function person(args: string[], dataDir: string) {
  return spawnSync("npm", ["run", "-s", "person", "--", ...args], {
    cwd: ROOT, encoding: "utf8", env: { ...process.env, FOUNDATION_DATA_DIR: dataDir, FOUNDATION_SECRET: SECRET },
  });
}

describe("npm run person", () => {
  it("is an npm script, with the build secret made first", () => {
    const scripts = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")).scripts;
    expect(scripts.person).toBe("tsx --conditions=react-server scripts/person.ts");
    expect(scripts.preperson).toBe("node scripts/gen-build-secret.mjs");
  });
  it("refuses a person with no email plainly, before opening the database", () => {
    const dir = path.join(mkdtempSync(path.join(tmpdir(), "person-script-")), "pglite");
    for (const args of [["forget"], ["forget", "Ada"], ["export", "Ada <ada@harbor.example>"], ["remove", "ada@harbor.example"]]) {
      const r = person(args, dir);
      expect(said(r.stdout)).toBe("Give one plain email address: npm run person -- export <email>, or npm run person -- forget <email>.");
      expect(r.status).toBe(2);
    }
    expect(() => statSync(dir)).toThrow();
  }, 120_000);
  it("exports to a folder outside the repository, and finds nothing to forget for a stranger", () => {
    const base = mkdtempSync(path.join(tmpdir(), "person-script-"));
    const dir = path.join(base, "pglite");
    const out = path.join(base, "out");
    const r = person(["export", "nobody@harbor.example", "--out", out], dir);
    expect(said(r.stdout)).toMatch(/^Saved everything held about this person to .*person-[0-9a-f]{12}-\d{4}-\d{2}-\d{2}\.json\. Send it to them privately\./);
    expect(r.status).toBe(0);
    const [file] = readdirSync(out);
    const data = JSON.parse(readFileSync(path.join(out, file), "utf8"));
    expect(data.core).toEqual({ contacts: [], inbox_items: [], outbox: [], opt_outs: [] });
    expect(statSync(path.join(out, file)).mode & 0o777).toBe(0o600);
    const f = person(["forget", "nobody@harbor.example"], dir);
    expect(said(f.stdout)).toBe("Nothing is held about this person.");
    expect(f.status).toBe(1);
  }, 120_000);
  it("forgets a person only after the owner approves the card, and prints a line that names no one", async () => {
    const dir = path.join(mkdtempSync(path.join(tmpdir(), "person-script-")), "pglite");
    expect(said(person(["export", "ada@harbor.example", "--out", path.join(dir, "..", "out")], dir).stdout)).toMatch(/^Saved/);
    let db = await openPglite(dir);
    await submitContact(db, { name: "Ada", email: "ada@harbor.example", phone: "", message: "Please remove me" }, { now: new Date() });
    await db.close();
    const raised = person(["forget", "Ada+x@harbor.example"], dir);
    expect(said(raised.stdout)).toBe("A card is waiting in your Inbox listing what will be removed. Approve it, then run this again.");
    expect(said(person(["forget", "ada@harbor.example"], dir).stdout)).toBe("The card in your Inbox still waits for your decision. Approve it, then run this again.");
    db = await openPglite(dir);
    const [card] = await db.query<{ id: string }>("select id from inbox_items where kind = 'person-forget'");
    await decideCard(db, registryFrom(CORE_CARD_KINDS), { cardId: card.id, decision: "approve", actor: PIN_OWNER }, new Date());
    await db.close();
    const done = person(["forget", "ada@harbor.example"], dir);
    expect(said(done.stdout)).toBe("Forgot one person: 1 inbox_items, 1 contacts. Add that line, as it is, to your build log.");
    expect(done.status).toBe(0);
    db = await openPglite(dir);
    expect(await db.query("select email, scope from opt_outs")).toEqual([{ email: null, scope: "all" }]);
    expect(await db.query("select count(*)::int as n from contacts")).toEqual([{ n: 0 }]);
    await db.close();
    expect(said(person(["forget", "ada@harbor.example"], dir).stdout)).toBe("This person was already forgotten, and nothing new is held about them.");
  }, 240_000);
});
