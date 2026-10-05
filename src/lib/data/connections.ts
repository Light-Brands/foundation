import type { Db } from "@/lib/db/types";
import { SLUG } from "@/lib/key/frontmatter";

// One row per outside service: which door it came through, whether it works, and the NAME of the
// setting that holds its key. Never the key. A key lives only in the host's settings or .env.local.

export const CONNECTION_STATUSES = ["planned", "connected", "failing", "disconnected"] as const;
export const DOORS = ["own", "custom"] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];
export type Door = (typeof DOORS)[number];
export type ConnectionInput = { service: string; door: Door; status: ConnectionStatus; scopes: string[]; key_setting: string; tested_on: string | null; owner: string };
export type ConnectionRow = ConnectionInput & { updated_at: string };

const SETTING = /^[A-Z][A-Z0-9_]{1,63}$/;
const SCOPE = /^[a-z0-9:._/-]{1,80}$/;
const KEY_SHAPES = [
  /^(sk|rk|pk)_(live|test)_/i, /^sb_(secret|publishable)_/, /^re_[A-Za-z0-9]{8,}/, /^whsec_/, /^gh[pousr]_[A-Za-z0-9]{20,}/,
  /^xox[abprs]-/, /^AKIA[0-9A-Z]{16}$/, /-----BEGIN [A-Z ]+-----/, /^eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/, /:\/\/[^/\s:@]+:[^/\s@]+@/,
];

export function looksLikeSecret(value: string): boolean {
  const s = value.trim();
  if (KEY_SHAPES.some((re) => re.test(s))) return true;
  // A long run of mixed-case letters and digits with no spaces reads as a token. Setting names are upper case only.
  return s.length >= 24 && /^[A-Za-z0-9_\-+/=.]+$/.test(s) && /\d/.test(s) && /[a-z]/.test(s) && /[A-Z]/.test(s);
}

const KEY_MESSAGE = "That looks like a key. Save the name of the setting that holds it, such as RESEND_API_KEY, never the key itself.";

export function validateConnection(input: Record<string, unknown>):
  | { ok: true; value: ConnectionInput }
  | { ok: false; errors: Partial<Record<keyof ConnectionInput, string>> } {
  const str = (k: string) => (typeof input[k] === "string" ? (input[k] as string).trim() : "");
  const scopes = Array.isArray(input.scopes) ? input.scopes.map((s) => String(s).trim()).filter(Boolean) : [];
  const value: ConnectionInput = {
    service: str("service"), door: str("door") as Door, status: (str("status") || "planned") as ConnectionStatus,
    scopes, key_setting: str("key_setting"), tested_on: str("tested_on") || null, owner: str("owner"),
  };
  const errors: Partial<Record<keyof ConnectionInput, string>> = {};
  if (!SLUG.test(value.service)) errors.service = "Use the connection's slug, such as email-sending.";
  if (!(DOORS as readonly string[]).includes(value.door)) errors.door = "Choose your own account or built by Light Brands.";
  if (!(CONNECTION_STATUSES as readonly string[]).includes(value.status)) errors.status = "Choose planned, connected, failing or disconnected.";
  if (scopes.length > 20 || scopes.some((s) => !SCOPE.test(s) || looksLikeSecret(s))) errors.scopes = "List up to 20 permissions, each a short name such as events:read.";
  if (value.key_setting) {
    if (looksLikeSecret(value.key_setting)) errors.key_setting = KEY_MESSAGE;
    else if (value.key_setting.startsWith("NEXT_PUBLIC_")) errors.key_setting = "A key setting must never start with NEXT_PUBLIC_, because the browser can read those.";
    else if (!SETTING.test(value.key_setting)) errors.key_setting = "Use the setting's name in capitals, such as RESEND_API_KEY.";
  }
  if (value.tested_on && !/^\d{4}-\d{2}-\d{2}$/.test(value.tested_on)) errors.tested_on = "Use a date like 2026-10-05.";
  if (value.owner.length > 120 || looksLikeSecret(value.owner)) errors.owner = "Name who looks after it, in up to 120 characters.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

export async function upsertConnection(db: Db, input: ConnectionInput, now: Date): Promise<void> {
  const checked = validateConnection(input as unknown as Record<string, unknown>);
  if (!checked.ok) throw new Error(Object.values(checked.errors)[0]);
  const v = checked.value;
  await db.query(
    `insert into connections (service, door, status, scopes, key_setting, tested_on, owner, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (service) do update set door = $2, status = $3, scopes = $4, key_setting = $5, tested_on = $6, owner = $7, updated_at = $8`,
    [v.service, v.door, v.status, v.scopes, v.key_setting, v.tested_on, v.owner, now],
  );
}

export async function listConnections(db: Db | null): Promise<ConnectionRow[]> {
  if (!db) return [];
  return db.query<ConnectionRow>(
    "select service, door, status, scopes, key_setting, tested_on::text as tested_on, owner, updated_at::text as updated_at from connections order by service",
  );
}

export async function connectionStatuses(db: Db | null): Promise<Record<string, ConnectionStatus>> {
  return Object.fromEntries((await listConnections(db)).map((r) => [r.service, r.status]));
}

/** The connection that sends approved email on its own. */
export const EMAIL_SENDING = "email-sending";

/**
 * True while the email-sending connection may be sending approved email on its own: connected, or failing
 * (a failing sender still runs and may still succeed). Copying an approved email to send by hand waits on this,
 * so the owner and the sender never both send one email.
 */
export async function emailSenderActive(db: Db | null): Promise<boolean> {
  const status = (await connectionStatuses(db))[EMAIL_SENDING];
  return status === "connected" || status === "failing";
}

/**
 * Whether the setting a connection names holds a value: "set" or "unset", and null when there is no
 * usable name. The value itself is never returned, so a screen can show only set or unset.
 */
export function keySettingState(name: string, env: Record<string, string | undefined>): "set" | "unset" | null {
  if (!SETTING.test(name) || name.startsWith("NEXT_PUBLIC_")) return null;
  return env[name]?.trim() ? "set" : "unset";
}
