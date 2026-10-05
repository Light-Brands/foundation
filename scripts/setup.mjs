#!/usr/bin/env node
// Writes .env.local for running the command center locally.
// Built for Claude Code: every answer can come from a flag.
//   node scripts/setup.mjs --name "Harbor Studio" --pin 246810
//   node scripts/setup.mjs --name "Harbor Studio" --pin-prompt   (you type the PIN yourself)
//   node scripts/setup.mjs --pin-prompt --force                  (keeps the business name already saved)
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    name: { type: "string" },
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

// With --force and no --name, keep the business name already saved in .env.local.
function savedName() {
  if (!existsSync(file)) return "";
  const line = readFileSync(file, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith("FOUNDATION_BUSINESS_NAME="));
  if (!line) return "";
  const raw = line.slice("FOUNDATION_BUSINESS_NAME=".length).trim();
  const q = raw[0];
  if (raw.length >= 2 && (q === '"' || q === "'") && raw.endsWith(q)) return raw.slice(1, -1);
  return raw;
}

let name = values.name ?? (values.force ? savedName() : "");
let pin = values.pin ?? "";

if ((!name || !pin) && !process.stdin.isTTY) {
  if (!name) fail('Add --name "Your business".');
  fail("Run this in your own terminal window so you can type your PIN, or pass --pin.");
}
if (!name || !pin) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  if (!name) name = await rl.question("Your business name: ");
  if (!pin) pin = await rl.question("Choose a PIN (6 to 12 digits): ");
  rl.close();
}
name = name.trim();
pin = pin.trim();

if (!name) fail("Add a business name.");
if (!/^\d{6,12}$/.test(pin)) fail("Your PIN needs to be 6 to 12 digits.");

if (/[\u0000-\u001f\u007f]/.test(name)) fail("Use letters, numbers and punctuation in your business name.");
if (name.includes('"') && name.includes("'")) fail("Your business name cannot contain both kinds of quote marks.");
// Written raw: Next's env loader does not unescape backslashes, so pick the quote style that fits.
const quote = (v) => (v.includes('"') ? `'${v}'` : `"${v}"`);
writeFileSync(
  file,
  [
    `FOUNDATION_PIN=${pin}`,
    `FOUNDATION_SECRET=${randomBytes(32).toString("hex")}`,
    `FOUNDATION_BUSINESS_NAME=${quote(name)}`,
    "",
  ].join("\n"),
  { mode: 0o600 },
);
chmodSync(file, 0o600);
console.log("Done. Run `npm run dev`, open http://localhost:3000 and enter your PIN.");
