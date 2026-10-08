#!/usr/bin/env node
// Writes .env.local for running the command center locally.
// Built for Claude Code: every answer can come from a flag.
//   node scripts/setup.mjs --name "Harbor Studio" --pin 246810
//   node scripts/setup.mjs --name "Harbor Studio" --pin-prompt   (you type the PIN yourself)
//   node scripts/setup.mjs --pin-prompt --force                  (keeps the business name already saved)
//   node scripts/setup.mjs --name "Harbor Studio" --chief "Sage" --pin-prompt   (names the chief of staff)
import { chmodSync, existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { mkdirSync } from "node:fs";
import { parse, stringify } from "yaml";

const { values } = parseArgs({
  options: {
    name: { type: "string" },
    chief: { type: "string" },
    pin: { type: "string" },
    "pin-prompt": { type: "boolean", default: false },
    force: { type: "boolean", default: false },
  },
});

function fail(message) {
  console.error(message);
  process.exit(1);
}

const file = ".env.local";
if (existsSync(file) && !values.force) fail(".env.local already exists. Run again with --force to replace it.");

// With --force and no --name, keep the business name already saved in .env.local. The chief of staff's name too.
function savedName(key = "FOUNDATION_BUSINESS_NAME") {
  if (!existsSync(file)) return "";
  const line = readFileSync(file, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${key}=`));
  if (!line) return undefined;
  const raw = line.slice(`${key}=`.length).trim();
  const q = raw[0];
  if (raw.length >= 2 && (q === '"' || q === "'") && raw.endsWith(q)) return raw.slice(1, -1);
  return raw;
}

let name = values.name ?? (values.force ? (savedName() ?? "") : "");
let pin = values.pin ?? "";
let chief = values.chief ?? (values.force ? savedName("FOUNDATION_CHIEF_NAME") : undefined);

if ((!name || !pin) && !process.stdin.isTTY) {
  if (!name) fail('Add --name "Your business".');
  fail("Run this in your own terminal window so you can type your PIN, or pass --pin.");
}
if (!name || !pin) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  if (!name) name = await rl.question("Your business name: ");
  if (chief === undefined) {
    chief = await rl.question("What would you like to call your chief of staff? This is the name you'll use when you ask for anything. Press Enter to keep Claude. ");
  }
  if (!pin) pin = await rl.question("Choose a PIN (6 to 12 digits): ");
  rl.close();
}
name = name.trim();
pin = pin.trim();

if (!name) fail("Add a business name.");
if (!/^\d{6,12}$/.test(pin)) fail("Your PIN needs to be 6 to 12 digits.");

if (/[\u0000-\u001f\u007f]/.test(name)) fail("Use letters, numbers and punctuation in your business name.");
if (name.includes('"') && name.includes("'")) fail("Your business name cannot contain both kinds of quote marks.");
// The same rule as cleanChiefName in src/lib/validate.ts: one short name, or empty to keep Claude.
chief = (chief ?? "").trim();
const CHIEF_NAME = /^\p{L}[\p{L}\p{M}]*(?:[ '\u2019-][\p{L}\p{M}]+){0,2}['\u2019]?$/u;
if (chief && (chief.length > 40 || !CHIEF_NAME.test(chief))) {
  fail("Use letters, spaces, apostrophes and hyphens in your chief of staff's name, up to 40 characters.");
}
if (chief.includes('"') && chief.includes("'")) fail("Your chief of staff's name cannot contain both kinds of quote marks.");
// Written raw: Next's env loader does not unescape backslashes, so pick the quote style that fits.
const quote = (v) => (v.includes('"') ? `'${v}'` : `"${v}"`);
writeFileSync(
  file,
  [
    `FOUNDATION_PIN=${pin}`,
    `FOUNDATION_SECRET=${randomBytes(32).toString("hex")}`,
    `FOUNDATION_BUSINESS_NAME=${quote(name)}`,
    // Seeds the profile the first time the command center opens its database. Agents and Preferences change it later.
    ...(chief ? [`FOUNDATION_CHIEF_NAME=${quote(chief)}`] : []),
    "",
  ].join("\n"),
  { mode: 0o600 },
);
chmodSync(file, 0o600);

// The commit setup runs on, when this folder is the top of its own git repository.
// The build log starts after it, so Light Brands' template history never lands in the member's log.
function headCommit() {
  const git = (...args) => spawnSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const top = git("rev-parse", "--show-toplevel");
  if (top.status !== 0 || realpathSync(top.stdout.trim()) !== realpathSync(process.cwd())) return null;
  const head = git("rev-parse", "HEAD").stdout?.trim() ?? "";
  return /^[0-9a-f]{40}$/.test(head) ? head : null;
}

// Seed the Key: name it after the business, and start its context block with the business name.
const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const keyFile = "key/key.yaml";
if (existsSync(keyFile)) {
  const key = parse(readFileSync(keyFile, "utf8"));
  if (key && key.client === "your-business") {
    const today = new Date().toISOString().slice(0, 10);
    key.client = slugify(name) || "your-business";
    key.name = name;
    key.provenance = { ...(key.provenance ?? {}), recorded: today };
    const base = headCommit();
    if (base) key.provenance.base = base;
    writeFileSync(keyFile, stringify(key));
    const blockFile = "key/knowledge/context-block.yaml";
    const empty = {
      business: "", short_name: "", what_we_do: "", who_we_serve: "", how_we_sound: "", website: "",
      email: "", phone: "", city: "", timezone: "", chief_name: "", owner: { name: "", first: "", role: "" },
      stated_by: "", recorded: "",
    };
    const block = existsSync(blockFile) ? { ...empty, ...(parse(readFileSync(blockFile, "utf8")) ?? {}) } : empty;
    block.business = name;
    block.chief_name = chief;
    mkdirSync("key/knowledge", { recursive: true });
    writeFileSync(blockFile, stringify(block));
  }
}
// Build the inventory in key/knowledge/system.md so it exists from the first session.
if (existsSync(keyFile)) {
  const sync = spawnSync("npm", ["run", "key:sync"], { stdio: "ignore", shell: process.platform === "win32" });
  if (sync.status !== 0) console.log("Setup is done, but the system document inventory was not built. Run `npm run key:sync` once.");
}
// The name seeds a new database once. One that already exists keeps its name until the owner renames it.
if (values.force && values.chief !== undefined && chief && existsSync(".data")) {
  console.log(`Your command center already has a database. Run \`npm run chief -- "${chief}"\` to use the new name.`);
}
console.log("Done. Run `npm run dev`, open http://localhost:3000 and enter your PIN.");
