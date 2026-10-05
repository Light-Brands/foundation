import "server-only";
import type { Db } from "@/lib/db/types";
import { EMAIL_SENDING, emailSendingActive } from "@/lib/data/connections";
import { isPaused } from "@/lib/data/pause";
import { optOut, recoverStuck, sendApproved, senderOptions } from "@/lib/data/outbox";
import { loadSender, readSender, type EmailSender, type KeptEvent, type SenderContext } from "./sender";

// Sends approved email through the email-sending connection's own sender, from the host's schedule or from
// npm run outbox:send on the owner's computer. It runs only while email sending is connected and the pause
// switch is off. Each step logs one plain line when it cannot go on, and the provider key's value never
// reaches a log line or a row.

export type DrainStatus =
  | "ran" | "no_database" | "not_connected" | "paused" | "no_sender" | "no_setting" | "no_secret" | "bounces_unrecorded" | "error";
export type DrainResult = {
  status: DrainStatus;
  sent: number;
  failed: number;
  refused: number;
  bounced: number;
  recovered: { sent: number; failed: number };
};

/** How many kept webhook events one drain hands to bounces. */
export const BOUNCE_EVENTS_MAX = 500;

const firstLine = (err: unknown): string => (err instanceof Error ? err.message : String(err)).split("\n")[0].slice(0, 200);

/** Removes the provider key's value from any text before it is logged or stored. */
function redact(text: string, secret: string): string {
  return secret ? text.split(secret).join("[hidden]") : text;
}

function result(status: DrainStatus, extra: Partial<DrainResult> = {}): DrainResult {
  return { status, sent: 0, failed: 0, refused: 0, bounced: 0, recovered: { sent: 0, failed: 0 }, ...extra };
}

/**
 * Records every address the provider reports as bounced or complained about as an opt-out from all email,
 * then marks the kept events it was given as handled. Returns the count recorded, or null when bounces threw
 * or one could not be recorded: then nothing is marked handled and the caller sends nothing, so an address
 * is never mailed past a bounce that was not recorded.
 */
async function recordBounces(db: Db, sender: EmailSender, ctx: SenderContext, fixedSecret: string | null): Promise<number | null> {
  if (!sender.bounces) return 0;
  const rows = await db.query<{ id: string; event_id: string; received_at: string }>(
    "select id::text as id, event_id, received_at::text as received_at from webhook_events where connection = $1 and handled_at is null order by received_at, id limit $2",
    [EMAIL_SENDING, BOUNCE_EVENTS_MAX],
  );
  const events: KeptEvent[] = rows.map((r) => ({ eventId: r.event_id, receivedAt: r.received_at }));
  let reported: unknown;
  try {
    reported = await sender.bounces({ ...ctx, events });
  } catch (err) {
    console.error(`Email sender bounces failed, so no email was sent: ${redact(firstLine(err), ctx.secret)}`);
    return null;
  }
  let recorded = 0;
  for (const b of Array.isArray(reported) ? reported : []) {
    const kind = (b as { kind?: unknown })?.kind;
    const email = (b as { email?: unknown })?.email;
    if ((kind !== "bounce" && kind !== "complaint") || typeof email !== "string") continue;
    try {
      await optOut(db, { email, source: kind, scope: "all" }, ctx.now, fixedSecret);
      recorded++;
    } catch (err) {
      if (err instanceof TypeError) continue; // Not one plain address: nothing to stop sending to.
      console.error(`A ${kind} could not be recorded as an opt-out, so no email was sent: ${firstLine(err)}`);
      return null;
    }
  }
  if (rows.length) await db.query("update webhook_events set handled_at = $1 where id = any($2::bigint[])", [ctx.now, rows.map((r) => r.id)]);
  return recorded;
}

/**
 * One pass of the email sender: bounces first, then recovery of rows left in sending, then approved rows.
 * Never throws, and fails closed at every step: a read that errors (the connection, the pause switch, the
 * opt-out list, recovery) or a sender, setting or secret that is missing ends the pass with nothing sent.
 * A sender's error stays on its own row through sendApproved.
 */
export async function drainOutbox(db: Db | null, env: Record<string, string | undefined>, now: Date, opts: { root?: string } = {}): Promise<DrainResult> {
  if (!db) return result("no_database");
  const root = opts.root ?? process.cwd();
  let secret = "";
  try {
    if (!(await emailSendingActive(db))) return result("not_connected");
    if (await isPaused(db)) return result("paused");
    const declared = await readSender(root);
    if (!declared.decl) {
      console.error(`Email sending is connected, but no sender is declared: ${declared.problems[0] ?? "unknown reason"}.`);
      return result("no_sender");
    }
    secret = env[declared.decl.secretSetting]?.trim() ?? "";
    if (!secret) {
      console.error(`Email sending is connected, but the setting ${declared.decl.secretSetting} is not set, so no email was sent.`);
      return result("no_setting");
    }
    const loaded = await loadSender(root);
    if ("problem" in loaded) {
      console.error(loaded.problem);
      return result("no_sender");
    }
    const sender = loaded.sender;
    const ctx: SenderContext = { secret, now };
    const options = senderOptions(env);
    if (!options.secret) {
      // Without the fixed secret no opt-out can be recorded or checked, so nothing runs, bounces included.
      console.error("Email sending is connected, but FOUNDATION_SECRET is not set to at least 32 characters, so no email was sent.");
      return result("no_secret");
    }

    const bounced = await recordBounces(db, sender, ctx, options.secret);
    if (bounced === null) return result("bounces_unrecorded");

    const lookup = sender.lookup;
    const recovered = await recoverStuck(
      db,
      lookup ? (row) => lookup(row.provider_ref ?? row.send_key, ctx) : async () => "unknown",
      now,
    );
    const sent = await sendApproved(
      db,
      async (msg) => {
        try {
          return await sender.send(msg, ctx);
        } catch (err) {
          // The message is stored on the row for the owner, so the key's value is taken out first.
          throw new Error(redact(firstLine(err), secret));
        }
      },
      now,
      20,
      options,
    );
    return result("ran", { ...sent, bounced, recovered });
  } catch (err) {
    console.error(`The email sender stopped: ${redact(firstLine(err), secret)}`);
    return result("error");
  }
}
