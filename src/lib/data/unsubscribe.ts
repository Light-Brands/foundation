import "server-only";
import type { Db } from "@/lib/db/types";
import { optOut } from "@/lib/data/outbox";
import { clientHash, takeFormSlot } from "@/lib/forms/limit";
import { BODY_MAX } from "@/lib/forms/public";
import { readUnsubscribeToken } from "@/lib/email-links";
import { FIXED_SECRET_MIN } from "@/lib/env";

export { httpsOrigin, publicBaseUrl, readUnsubscribeToken, unsubscribeToken, unsubscribeUrl } from "@/lib/email-links";

// Unsubscribing through the link on a marketing email (the token is in src/lib/email-links.ts). A visit (GET)
// only asks. A post, from the page's button or a mail app's one-click, records the opt-out for that row's
// address. Opt-outs are checked again at send time, so a later marketing email to it is cancelled.

// Forged tokens are refused before the database is touched, so only real links reach the limiter. It is keyed
// by the row, so many people unsubscribing through one mail provider's servers never crowd each other out.
export const UNSUBSCRIBE_LIMITS = {
  perClient: 5,
  perClientWindowMs: 10 * 60_000,
  perForm: 2_000,
  perFormWindowMs: 60 * 60_000,
  keepMs: 24 * 3600_000,
} as const;

export type UnsubscribeOutcome = { status: "confirm" | "done" | "invalid" | "limited" | "too_large" | "preview" };

export async function handleUnsubscribe(
  deps: { db: Db | null; secret: string | null },
  input: { token: string; method: "GET" | "POST"; contentLength: number | null },
  now: Date,
): Promise<UnsubscribeOutcome> {
  if (input.method === "POST" && input.contentLength !== null && input.contentLength > BODY_MAX) return { status: "too_large" };
  if (!deps.secret || deps.secret.length < FIXED_SECRET_MIN) return { status: "invalid" };
  const id = readUnsubscribeToken(input.token, deps.secret);
  if (!id) return { status: "invalid" };
  if (input.method === "GET") return { status: "confirm" };
  if (!deps.db) return { status: "preview" };
  const [row] = await deps.db.query<{ to_email: string }>("select to_email from outbox where id = $1 and kind = 'marketing'", [id]);
  if (!row) return { status: "invalid" };
  const keyHash = await clientHash("unsubscribe", id, deps.secret);
  if (!(await takeFormSlot(deps.db, { form: "unsubscribe", keyHash }, now, UNSUBSCRIBE_LIMITS))) return { status: "limited" };
  // optOut throws unless the opt-out is on the list afterwards, so done is said only when it is.
  await optOut(deps.db, { email: row.to_email, source: "unsubscribe link", scope: "marketing" }, now, deps.secret);
  return { status: "done" };
}
