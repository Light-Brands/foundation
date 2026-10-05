import type { Db, Queryable } from "@/lib/db/types";

// The record of inbound webhook deliveries. The first record of an event wins, and entries leave only
// through the owner's prune command, never on their own.

export const PRUNE_MIN_DAYS = 30;

/** True when this is the first record of the event, false when it was already received. */
export async function recordWebhookEvent(db: Queryable, input: { connection: string; eventId: string }, now: Date): Promise<boolean> {
  const rows = await db.query<{ id: string }>(
    "insert into webhook_events (connection, event_id, received_at) values ($1, $2, $3) on conflict (connection, event_id) do nothing returning id",
    [input.connection, input.eventId, now],
  );
  return rows.length === 1;
}

/** Takes back a record whose handler failed, so the provider's retry is handled. */
export async function forgetWebhookEvent(db: Queryable, input: { connection: string; eventId: string }): Promise<void> {
  await db.query("delete from webhook_events where connection = $1 and event_id = $2", [input.connection, input.eventId]);
}

/** Forgets entries older than the given days, at least 30, and returns how many it removed. */
export async function pruneWebhookEvents(db: Db, olderThanDays: number, now: Date): Promise<number> {
  if (!Number.isInteger(olderThanDays) || olderThanDays < PRUNE_MIN_DAYS) {
    throw new RangeError(`Keep at least ${PRUNE_MIN_DAYS} days of webhook events. Pass a whole number of days, ${PRUNE_MIN_DAYS} or more.`);
  }
  const rows = await db.query<{ id: string }>(
    "delete from webhook_events where received_at < $1 returning id",
    [new Date(now.getTime() - olderThanDays * 86_400_000)],
  );
  return rows.length;
}
