import type { Db } from "@/lib/db/types";

export type PauseState = { paused: boolean; reason: string; paused_at: string | null; paused_by: string };

export const NOT_PAUSED: PauseState = { paused: false, reason: "", paused_at: null, paused_by: "" };
export const REASON_MAX = 200;

/** What the pause reads as when the setting cannot be read: paused, so nothing acts on a guess. */
export const PAUSE_UNREADABLE: PauseState = Object.freeze({
  paused: true,
  reason: "The pause setting could not be read.",
  paused_at: null,
  paused_by: "",
});

export function cleanReason(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
  const value = (typeof raw === "string" ? raw : "")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\p{Cc}/gu, "")
    .replace(/ {2,}/g, " ")
    .trim();
  return [...value].length > REASON_MAX ? { ok: false, error: "Keep the reason under 200 characters." } : { ok: true, value };
}

const AT = `to_char(paused_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

export async function getPause(db: Db | null): Promise<PauseState> {
  if (!db) return NOT_PAUSED;
  try {
    const [row] = await db.query<PauseState>(`select paused, reason, ${AT} as paused_at, paused_by from pause where id = 1`);
    return row ?? PAUSE_UNREADABLE;
  } catch {
    return PAUSE_UNREADABLE;
  }
}

export async function isPaused(db: Db | null): Promise<boolean> {
  return (await getPause(db)).paused;
}

/** The only writer of the switch. Clearing it clears the reason and who set it. Pausing again keeps the first time and person. */
export async function setPause(db: Db, input: { paused: boolean; reason: string; by: string }, now: Date): Promise<PauseState> {
  const params = input.paused ? [true, input.reason, now, input.by] : [false, "", now, ""];
  const [row] = await db.query<PauseState>(
    `insert into pause (id, paused, reason, paused_at, paused_by, updated_at)
       values (1, $1::boolean, $2, case when $1::boolean then $3::timestamptz end, $4, $3::timestamptz)
     on conflict (id) do update set
       paused = $1::boolean,
       reason = $2,
       paused_at = case when not $1::boolean then null when pause.paused then pause.paused_at else $3::timestamptz end,
       paused_by = case when not $1::boolean then '' when pause.paused then pause.paused_by else $4 end,
       updated_at = $3::timestamptz
     returning paused, reason, ${AT} as paused_at, paused_by`,
    params,
  );
  return row;
}
