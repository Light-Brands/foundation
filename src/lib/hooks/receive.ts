import { createHash } from "node:crypto";
import type { Db } from "@/lib/db/types";
import { readWebhook, loadVerifier } from "./declaration";
import { recordWebhookEvent, forgetWebhookEvent } from "./events";

// The one door for inbound provider webhooks, /api/hooks/<connection>. Nothing is written before the
// signature on the raw body is verified: an unknown connection or verifier is 404, a bad signature 401.

export const HOOK_BODY_MAX = 1_048_576;
const EVENT_ID = /^[\x21-\x7e]{1,200}$/;

export type HookOutcome = { status: 200 | 401 | 404 | 413 | 500 | 503; body: string };
const out = (status: HookOutcome["status"], body: string): HookOutcome => ({ status, body });

const warned = new Set<string>();
function warnOnce(problems: string[]) {
  for (const p of problems) {
    if (warned.has(p)) continue;
    warned.add(p);
    console.warn(`Key declaration problem: ${p}`);
  }
}

/** The raw body as text, or null when it is larger than the cap. Reads no further than the cap. */
async function readCapped(req: Request, max: number): Promise<string | null> {
  const declared = Number(req.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > max) return null;
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel().catch(() => {}); return null; }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

function parseEvent(raw: string): unknown {
  try { return JSON.parse(raw); } catch { return raw; }
}

function eventIdOf(raw: string, event: unknown, custom: string | undefined): string {
  if (custom !== undefined && EVENT_ID.test(custom)) return custom;
  const id = typeof event === "object" && event !== null ? (event as { id?: unknown }).id : undefined;
  if (typeof id === "string" && EVENT_ID.test(id)) return id;
  return `sha256:${createHash("sha256").update(raw).digest("hex")}`;
}

export async function receiveWebhook(
  deps: { db: Db | null; root: string; env: Record<string, string | undefined> },
  input: { connection: string; req: Request },
  now: Date,
): Promise<HookOutcome> {
  const { decl, problems } = await readWebhook(deps.root, input.connection);
  warnOnce(problems);
  if (!decl) return out(404, "Not found");
  const verifier = await loadVerifier(deps.root, decl);
  if (!verifier) return out(404, "Not found");
  const secret = deps.env[decl.secretSetting]?.trim() ?? "";
  if (!secret || !deps.db) return out(503, "Not set up");
  const raw = await readCapped(input.req, HOOK_BODY_MAX);
  if (raw === null) return out(413, "Too large");
  let ok = false;
  try { ok = (await verifier.verify(input.req, raw, secret)) === true; } catch { ok = false; }
  if (!ok) return out(401, "Signature not verified");
  const event = parseEvent(raw);
  let custom: string | undefined;
  try { custom = verifier.eventId?.(raw, input.req); } catch { custom = undefined; }
  const key = { connection: decl.connection, eventId: eventIdOf(raw, event, custom) };
  if (!(await recordWebhookEvent(deps.db, key, now))) return out(200, "Already received");
  if (verifier.handle) {
    try {
      await verifier.handle(event);
    } catch (err) {
      console.error(`Webhook handler for ${decl.connection} failed`, err);
      await forgetWebhookEvent(deps.db, key);
      return out(500, "Not handled");
    }
  }
  return out(200, "Received");
}
