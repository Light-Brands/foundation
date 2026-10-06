import type { Db } from "@/lib/db/types";
import { SLUG } from "@/lib/key/frontmatter";
import { businessDate } from "@/lib/time";
import { looksLikeSecret } from "@/lib/key-shape";

// One row per outside service: which door it came through, whether it works, and the NAME of the
// setting that holds its key. Never the key. A key lives only in the host's settings or .env.local.

export const CONNECTION_STATUSES = ["planned", "connected", "failing", "disconnected"] as const;
export const DOORS = ["own", "custom"] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];
export type Door = (typeof DOORS)[number];
export type ConnectionInput = { service: string; door: Door; status: ConnectionStatus; scopes: string[]; key_setting: string; tested_on: string | null; owner: string; note?: string };
export type ConnectionRow = ConnectionInput & { note: string; updated_at: string };
export const NOTE_MAX = 200;

const SETTING = /^[A-Z][A-Z0-9_]{1,63}$/;
const SCOPE = /^[a-z0-9:._/-]{1,80}$/;
export { looksLikeKey, looksLikeSecret } from "@/lib/key-shape";

/** A YYYY-MM-DD string that names a real day, so 2026-02-30 is refused. */
function isCalendarDate(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
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
    ...(input.note === undefined ? {} : { note: str("note") }),
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
  if (value.tested_on && !isCalendarDate(value.tested_on)) errors.tested_on = "Use a date like 2026-10-05.";
  if (value.owner.length > 120 || looksLikeSecret(value.owner)) errors.owner = "Name who looks after it, in up to 120 characters.";
  if (value.note !== undefined && (value.note.length > NOTE_MAX || /\p{Cc}/u.test(value.note) || value.note.split(/\s+/).some(looksLikeSecret))) {
    errors.note = "Keep the note to one plain line of up to 200 characters, with no keys in it.";
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

export async function upsertConnection(db: Db, input: ConnectionInput, now: Date): Promise<void> {
  const checked = validateConnection(input as unknown as Record<string, unknown>);
  if (!checked.ok) throw new Error(Object.values(checked.errors)[0]);
  const v = checked.value;
  await db.query(
    `insert into connections (service, door, status, scopes, key_setting, tested_on, owner, updated_at, note)
     values ($1, $2, $3, $4, $5, $6, $7, $8, coalesce($9, ''))
     on conflict (service) do update set door = $2, status = $3, scopes = $4, key_setting = $5, tested_on = $6, owner = $7, updated_at = $8,
       note = coalesce($9, connections.note)`,
    [v.service, v.door, v.status, v.scopes, v.key_setting, v.tested_on, v.owner, now, v.note ?? null],
  );
}

export async function listConnections(db: Db | null): Promise<ConnectionRow[]> {
  if (!db) return [];
  return db.query<ConnectionRow>(
    "select service, door, status, scopes, key_setting, tested_on::text as tested_on, owner, note, updated_at::text as updated_at from connections order by service",
  );
}

export async function connectionStatuses(db: Db | null): Promise<Record<string, ConnectionStatus>> {
  return Object.fromEntries((await listConnections(db)).map((r) => [r.service, r.status]));
}

export const CONNECTION_SET_USAGE = "Use npm run connection:set -- <service> <status> [--note <text>] [--tested], with a status of planned, connected, failing or disconnected. --tested goes only with connected.";

/** Reads the arguments of npm run connection:set. --tested says the connection was just tested and works. */
export function parseConnectionSetArgs(argv: string[]):
  | { ok: true; value: { service: string; status: ConnectionStatus; note: string; tested: boolean } }
  | { ok: false; error: string } {
  const [service, status, ...rest] = argv;
  if (!service || !status) return { ok: false, error: CONNECTION_SET_USAGE };
  let note: string | null = null;
  let tested = false;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--note" && note === null && rest[i + 1]?.trim()) { note = rest[i + 1].trim(); i++; continue; }
    if (rest[i] === "--tested" && !tested) { tested = true; continue; }
    return { ok: false, error: CONNECTION_SET_USAGE };
  }
  if (tested && status !== "connected") return { ok: false, error: CONNECTION_SET_USAGE };
  return { ok: true, value: { service, status: status as ConnectionStatus, note: note ?? "", tested } };
}

/**
 * The connection row writer an install or the owner runs: sets one connection's status and note, keeping
 * every other field. A service with no row yet gets one with door own. With tested, tested_on becomes today
 * in the business's time zone. Writes through validateConnection, so a bad slug, status or a key in the note
 * throws and nothing is written.
 */
export async function setConnectionStatus(db: Db, input: { service: string; status: ConnectionStatus; note: string; tested?: boolean }, now: Date): Promise<void> {
  const [existing] = SLUG.test(input.service)
    ? await db.query<ConnectionRow>("select service, door, status, scopes, key_setting, tested_on::text as tested_on, owner, note from connections where service = $1", [input.service])
    : [];
  const base: ConnectionInput = existing ?? { service: input.service, door: "own", status: "planned", scopes: [], key_setting: "", tested_on: null, owner: "" };
  let testedOn = base.tested_on;
  if (input.tested) {
    const [p] = await db.query<{ timezone: string }>("select timezone from business_profile where id = 1");
    testedOn = businessDate(p?.timezone, now);
  }
  await upsertConnection(db, { ...base, service: input.service, status: input.status, note: input.note, tested_on: testedOn }, now);
}

/** The connection that sends approved email on its own. */
export const EMAIL_SENDING = "email-sending";

/**
 * True only while the email-sending connection is connected. Then drainOutbox sends approved email on its own,
 * and Copy email waits for it so the owner and the sender never both send one email. A failing connection
 * does not drain, so Copy email stays available. The one rule every screen and the drain read.
 */
export async function emailSendingActive(db: Db | null): Promise<boolean> {
  return (await connectionStatuses(db))[EMAIL_SENDING] === "connected";
}

/**
 * Whether the setting a connection names holds a value: "set" or "unset", and null when there is no
 * usable name. The value itself is never returned, so a screen can show only set or unset.
 */
export function keySettingState(name: string, env: Record<string, string | undefined>): "set" | "unset" | null {
  if (!SETTING.test(name) || name.startsWith("NEXT_PUBLIC_")) return null;
  return env[name]?.trim() ? "set" : "unset";
}
