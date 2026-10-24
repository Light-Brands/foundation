import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { connectionsDir, CORE_SETTING } from "@/lib/hooks/declaration";
import { EMAIL_SENDING } from "@/lib/data/connections";
import type { OutgoingEmail } from "@/lib/data/outbox";
import { loadConnectionModule } from "@/lib/connections/module";

// The seat core keeps for the email sender. The connection declares it in key/connections/email-sending.yaml:
//   sender: { secret_setting: RESEND_API_KEY }
// and its code is key/connections/email-sending/send.ts. The setting holds the provider's key, so the value
// never lives in the Key. Loaded the way loadVerifier loads a webhook verifier: only when the real paths of
// the folder and the file stay inside key/.

export const SENDER_FILE = "send.ts";
export type SenderDecl = { secretSetting: string };
export type SenderContext = { secret: string; now: Date };
/** A kept webhook event for email-sending that no bounces call has read yet. */
export type KeptEvent = { eventId: string; receivedAt: string };
export type Bounce = { email: string; kind: "bounce" | "complaint" };
export type EmailSender = {
  send: (email: OutgoingEmail, ctx: SenderContext) => Promise<{ providerRef: string }>;
  /** ref is the provider's reference when one was recorded, else the row's send_key. */
  lookup?: (ref: string, ctx: SenderContext) => Promise<"sent" | "unknown">;
  bounces?: (ctx: SenderContext & { events: KeptEvent[] }) => Promise<Bounce[]>;
};

const SETTING = /^[A-Z][A-Z0-9_]{2,63}$/;
export { CORE_SETTING };
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Checks one connection file's sender block. Only email-sending may declare one. No block returns no declaration. */
export function checkSender(file: string, connection: string, data: unknown): { decl: SenderDecl | null; problems: string[] } {
  if (!isObj(data) || data.sender === undefined) return { decl: null, problems: [] };
  if (connection !== EMAIL_SENDING) return { decl: null, problems: [`${file}: only key/connections/${EMAIL_SENDING}.yaml declares a sender`] };
  const s = data.sender;
  const setting = isObj(s) && typeof s.secret_setting === "string" ? s.secret_setting.trim() : "";
  if (!SETTING.test(setting) || CORE_SETTING.test(setting)) {
    return { decl: null, problems: [`${file}: sender secret_setting must be a setting name in capitals, such as RESEND_API_KEY, and never a public or core setting`] };
  }
  return { decl: { secretSetting: setting }, problems: [] };
}

/** The email-sending connection's sender declaration, or null with the reason. */
export async function readSender(root: string): Promise<{ decl: SenderDecl | null; problems: string[] }> {
  const file = `key/connections/${EMAIL_SENDING}.yaml`;
  let text: string;
  try { text = await readFile(path.join(connectionsDir(root), `${EMAIL_SENDING}.yaml`), "utf8"); } catch { return { decl: null, problems: [`${file} is missing`] }; }
  let data: unknown;
  try { data = parse(text); } catch { return { decl: null, problems: [`${file} could not be read as YAML`] }; }
  const checked = checkSender(file, EMAIL_SENDING, data);
  if (!checked.decl && checked.problems.length === 0) return { decl: null, problems: [`${file} declares no sender`] };
  return checked;
}

/**
 * Loads send.ts, only when key/connections/email-sending/ is really inside the Key and send.ts is really inside
 * that folder (loadConnectionModule). Never throws: a missing, escaping or broken module gives the one plain line the caller logs.
 */
export async function loadSender(root: string): Promise<{ sender: EmailSender } | { problem: string }> {
  const loaded = await loadConnectionModule(root, EMAIL_SENDING, SENDER_FILE);
  if ("problem" in loaded) {
    if (loaded.problem === "missing") return { problem: `Email sending is connected, but key/connections/${EMAIL_SENDING}/${SENDER_FILE} is missing.` };
    if (loaded.problem === "outside") return { problem: `Email sending is connected, but its sender is outside key/connections/${EMAIL_SENDING}/, so it was not loaded.` };
    return { problem: `Email sender for ${EMAIL_SENDING} could not be loaded: ${"error" in loaded ? loaded.error : "unknown reason"}` };
  }
  const mod = loaded.mod as Partial<EmailSender>;
  if (typeof mod.send !== "function") return { problem: `Email sender for ${EMAIL_SENDING} exports no send function.` };
  return {
    sender: {
      send: mod.send,
      lookup: typeof mod.lookup === "function" ? mod.lookup : undefined,
      bounces: typeof mod.bounces === "function" ? mod.bounces : undefined,
    },
  };
}
