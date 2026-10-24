import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";
import { SLUG } from "@/lib/key/frontmatter";
import { insideKey } from "@/lib/key/declarations";

// A connection declares its inbound webhook in key/connections/<connection>.yaml:
//   webhook: { verifier: verify.ts, secret_setting: STRIPE_WEBHOOK_SECRET }
// The verifier is code inside key/connections/<connection>/ and the secret is a setting name, so the
// value never lives in the Key. The contract a verifier keeps (constant time compare, a 5 minute
// freshness window, idempotent handle) is in docs/standards/key.md under Webhooks.

export type WebhookDecl = { connection: string; verifier: string; secretSetting: string };
/** What verify gets beside the decoded body: the exact bytes received, the clock, and the freshness window. */
export type VerifyContext = { bytes: Uint8Array; now: Date; toleranceMs: number };
export type Verifier = {
  verify: (req: Request, rawBody: string, secret: string, ctx: VerifyContext) => boolean | Promise<boolean>;
  handle?: (event: unknown) => Promise<void> | void;
  eventId?: (rawBody: string, req: Request) => string;
};

const VERIFIER = /^[a-z0-9][a-z0-9_.-]*(\/[a-z0-9][a-z0-9_.-]*)*\.ts$/;
const SETTING = /^[A-Z][A-Z0-9_]{2,63}$/;
/**
 * Settings the Foundation itself relies on, never handed to a Key's code as a webhook secret or provider key:
 * its own, the host's, and every name a database address can arrive under (DATABASE_*, POSTGRES_*, PG*, NEON_*).
 */
export const CORE_SETTING = /^(NEXT_PUBLIC_|FOUNDATION_|VERCEL|CRON_SECRET$|SUPABASE_|DATABASE_|POSTGRES|PG|NEON_)/;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

export const connectionsDir = (root: string) => path.join(root, "key", "connections");

/** Checks one connection file's webhook block. No webhook block is fine and returns no declaration. */
export function checkWebhook(file: string, connection: string, data: unknown): { decl: WebhookDecl | null; problems: string[] } {
  const problems: string[] = [];
  if (!isObj(data) || data.webhook === undefined) return { decl: null, problems };
  const w = data.webhook;
  if (!isObj(w)) return { decl: null, problems: [`${file}: webhook must be a mapping with verifier and secret_setting`] };
  const verifier = typeof w.verifier === "string" ? w.verifier.trim() : "";
  const secretSetting = typeof w.secret_setting === "string" ? w.secret_setting.trim() : "";
  if (!VERIFIER.test(verifier) || !insideKey(verifier) || verifier.split("/").some((p) => p === "." || p === "..")) {
    problems.push(`${file}: webhook verifier must be a .ts file inside key/connections/${connection}/`);
  }
  if (!SETTING.test(secretSetting) || CORE_SETTING.test(secretSetting)) {
    problems.push(`${file}: webhook secret_setting must be a setting name in capitals, such as STRIPE_WEBHOOK_SECRET, and never a public or core setting`);
  }
  return problems.length ? { decl: null, problems } : { decl: { connection, verifier, secretSetting }, problems };
}

/** The connection's webhook declaration, or null when the connection is unknown, has none, or is invalid. */
export async function readWebhook(root: string, connection: string): Promise<{ decl: WebhookDecl | null; problems: string[] }> {
  if (!SLUG.test(connection)) return { decl: null, problems: [] };
  const file = `key/connections/${connection}.yaml`;
  let text: string;
  try { text = await readFile(path.join(connectionsDir(root), `${connection}.yaml`), "utf8"); } catch { return { decl: null, problems: [] }; }
  let data: unknown;
  try { data = parse(text); } catch { return { decl: null, problems: [`${file}: could not be read as YAML`] }; }
  return checkWebhook(file, connection, data);
}

const firstLine = (err: unknown): string => (err instanceof Error ? err.message : String(err)).split("\n")[0].slice(0, 200);

/**
 * Loads the verifier module, only when the connection's folder is really inside the Key and the
 * verifier is really inside that folder. A module that fails to import is logged in one line and
 * treated as missing, so the provider sees 404 and never a crash.
 */
export async function loadVerifier(root: string, decl: WebhookDecl): Promise<Verifier | null> {
  let key: string;
  let dir: string;
  let file: string;
  try {
    key = await realpath(path.join(root, "key"));
    dir = await realpath(path.join(connectionsDir(root), decl.connection));
    file = await realpath(path.join(dir, decl.verifier));
  } catch {
    return null;
  }
  if (!dir.startsWith(key + path.sep) || !file.startsWith(dir + path.sep)) return null;
  let mod: Partial<Verifier>;
  try {
    mod = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ pathToFileURL(file).href)) as Partial<Verifier>;
  } catch (err) {
    console.error(`Webhook verifier for ${decl.connection} could not be loaded: ${firstLine(err)}`);
    return null;
  }
  if (typeof mod.verify !== "function") return null;
  return {
    verify: mod.verify,
    handle: typeof mod.handle === "function" ? mod.handle : undefined,
    eventId: typeof mod.eventId === "function" ? mod.eventId : undefined,
  };
}
