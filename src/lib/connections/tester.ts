import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";
import type { Db } from "@/lib/db/types";
import { connectionsDir } from "@/lib/hooks/declaration";
import { SLUG } from "@/lib/key/frontmatter";
import { businessDate } from "@/lib/time";
import { upsertConnection, validateConnection, type ConnectionInput, type ConnectionRow, NOTE_MAX } from "@/lib/data/connections";
import { looksLikeKey } from "@/lib/key-shape";
import { CORE_SETTING } from "@/lib/outbox/sender";
import { loadConnectionModule } from "./module";

// The seat core keeps for a connection's own test: key/connections/<service>/test.ts exports
//   test(ctx: { secret, now }): Promise<{ ok: boolean, note: string }>
// It is loaded the same way as the email sender (loadConnectionModule), handed the value of the setting the
// connection's row names, and its answer is written through the registry's own validator: status connected or
// failing, tested_on today in the business's time zone, and a one-line note that never holds the key.

export const TEST_FILE = "test.ts";
/** A test gives up after this long and counts as a failure. A real test makes one cheap read-only call. */
export const TEST_TIMEOUT_MS = 30_000;
export type TestContext = { secret: string; now: Date };
export type TestOutcome =
  | { status: "tested"; ok: boolean; note: string }
  | { status: "invalid" | "no_connection" | "no_test" | "no_setting"; message: string };

const SETTING = /^[A-Z][A-Z0-9_]{1,63}$/;
const TIMED_OUT = Symbol("timed out");

/** True when the connection keeps a test.ts in its folder. The run still confines it before loading. */
export async function hasTester(root: string, service: string): Promise<boolean> {
  if (!SLUG.test(service)) return false;
  try {
    return (await stat(path.join(connectionsDir(root), service, TEST_FILE))).isFile();
  } catch {
    return false;
  }
}

/** One plain line of at most NOTE_MAX characters, with the key's value taken out and nothing that looks like a key. */
function cleanNote(raw: string, secret: string, fallback: string): string {
  const hidden = secret ? raw.split(secret).join("[hidden]") : raw;
  const line = hidden.split(/[\r\n]/)[0].replace(/\p{Cc}/gu, "").trim().slice(0, NOTE_MAX);
  if (!line || looksLikeKey(line)) return fallback;
  return validateConnection({ service: "x", door: "own", owner: "", note: line }).ok ? line : fallback;
}

/**
 * Runs one connection's test and records the answer. Writes only after the test ran. Nothing is written for a
 * bad name, a connection with no row, no test.ts (or one outside its folder), or a setting with no value.
 */
export async function runConnectionTest(
  db: Db,
  input: { service: string; root: string; env: Record<string, string | undefined>; now: Date; timezone: string; timeoutMs?: number },
): Promise<TestOutcome> {
  const { service, now } = input;
  if (!SLUG.test(service)) return { status: "invalid", message: "That connection could not be read. Reload the page and try again." };
  const [current] = await db.query<ConnectionRow>(
    "select service, door, status, scopes, key_setting, tested_on::text as tested_on, owner, note from connections where service = $1",
    [service],
  );
  if (!current) return { status: "no_connection", message: "Add this connection first, then test it." };
  const name = current.key_setting;
  if (name && (!SETTING.test(name) || CORE_SETTING.test(name))) return { status: "no_setting", message: `${name} is a setting the Foundation keeps for itself. Name the setting that holds this service's key.` };
  const secret = name ? input.env[name]?.trim() ?? "" : "";
  if (name && !secret) return { status: "no_setting", message: `Set ${name} first, then test again.` };
  const loaded = await loadConnectionModule(input.root, service, TEST_FILE);
  if ("problem" in loaded) {
    if ("error" in loaded) console.error(`The test for ${service} could not be loaded: ${secret ? loaded.error.split(secret).join("[hidden]") : loaded.error}`);
    return { status: "no_test", message: loaded.problem === "outside" ? `The test for ${service} is outside its folder, so it was not run.` : `${service} has no test yet.` };
  }
  const test = loaded.mod.test;
  if (typeof test !== "function") return { status: "no_test", message: `${service} has no test yet.` };

  let ok = false;
  let note: string;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const answer: unknown = await Promise.race([
      Promise.resolve((test as (ctx: TestContext) => unknown)({ secret, now })),
      new Promise((resolve) => { timer = setTimeout(() => resolve(TIMED_OUT), input.timeoutMs ?? TEST_TIMEOUT_MS); }),
    ]);
    if (answer === TIMED_OUT) note = "The test took too long, so it was stopped.";
    else if (typeof answer === "object" && answer !== null && typeof (answer as { ok?: unknown }).ok === "boolean") {
      ok = (answer as { ok: boolean }).ok;
      const fallback = ok ? "The test passed." : "The test failed.";
      const raw = (answer as { note?: unknown }).note;
      note = typeof raw === "string" ? cleanNote(raw, secret, fallback) : fallback;
    } else note = "The test gave no clear answer.";
  } catch (err) {
    note = cleanNote(`The test could not finish: ${err instanceof Error ? err.message : String(err)}`, secret, "The test could not finish.");
  } finally {
    clearTimeout(timer);
  }
  const next: ConnectionInput = {
    service: current.service, door: current.door, status: ok ? "connected" : "failing", scopes: current.scopes,
    key_setting: current.key_setting, tested_on: businessDate(input.timezone, now), owner: current.owner, note,
  };
  await upsertConnection(db, next, now);
  return { status: "tested", ok, note };
}
