import type { Db } from "@/lib/db/types";

export type PauseState = { paused: boolean; reason: string; paused_at: string | null; paused_by: string };

export const NOT_PAUSED: PauseState = { paused: false, reason: "", paused_at: null, paused_by: "" };
export const REASON_MAX = 200;

export function cleanReason(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
  const value = (typeof raw === "string" ? raw : "").trim();
  return value.length > REASON_MAX ? { ok: false, error: "Keep the reason under 200 characters." } : { ok: true, value };
}

export async function getPause(db: Db | null): Promise<PauseState> {
  if (!db) return NOT_PAUSED;
  const [row] = await db.query<PauseState>(
    "select paused, reason, paused_at::text as paused_at, paused_by from pause where id = 1",
  );
  return row ?? NOT_PAUSED;
}

export async function isPaused(db: Db | null): Promise<boolean> {
  return (await getPause(db)).paused;
}

/** The only writer of the switch. Clearing it clears the reason and who set it. */
export async function setPause(db: Db, input: { paused: boolean; reason: string; by: string }, now: Date): Promise<PauseState> {
  const params = input.paused ? [true, input.reason, now, input.by, now] : [false, "", null, "", now];
  const [row] = await db.query<PauseState>(
    `insert into pause (id, paused, reason, paused_at, paused_by, updated_at) values (1, $1, $2, $3, $4, $5)
     on conflict (id) do update set paused = $1, reason = $2, paused_at = $3, paused_by = $4, updated_at = $5
     returning paused, reason, paused_at::text as paused_at, paused_by`,
    params,
  );
  return row;
}
