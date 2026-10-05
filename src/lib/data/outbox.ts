import type { Db, Queryable } from "@/lib/db/types";
import { readEnv } from "@/lib/env";
import { emailHash, parseEmail, MissingSecretError } from "@/lib/email";
import { httpsOrigin, unsubscribeUrl } from "@/lib/email-links";

// Every drafted customer email, sent at most once. A draft becomes approved only through the card
// decision (decideCard in inbox.ts), and only while it is still a draft. A sender claims one approved,
// due row at a time by moving it to sending in one statement. A row left in sending is resolved by
// asking the provider: confirmed sent becomes sent, anything else becomes failed for the owner, and
// nothing is ever resent on its own. Every address is read by parseEmail and checked against the
// opt-out list when it is drafted and again when it is sent.

export const OUTBOX_STATUSES = ["draft", "approved", "sending", "sent", "failed", "cancelled"] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];
export const OUTBOX_KINDS = ["transactional", "marketing"] as const;
export type OutboxKind = (typeof OUTBOX_KINDS)[number];
export const OUTBOX_LIMITS = { subject: 200, body: 50_000, sendKey: 200 } as const;
export const STUCK_AFTER_MS = 15 * 60_000;
const UNCONFIRMED = "We could not confirm whether this email was sent. Check your sent mail before sending it again.";
const SOURCE_MAX = 200;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LINE_BREAK = /[\r\n]/;
const NUL = "\u0000";

export type DraftEmail = {
  to: string;
  subject: string;
  body: string;
  /** Opaque, 1 to 200 characters, unique among rows not cancelled. A redraft after a cancel may add a numbered suffix. */
  sendKey: string;
  contactId?: string | null;
  sourceApp?: string | null;
  sourceId?: string | null;
  cardId?: string | null;
  /** marketing adds an unsubscribe link, its headers and the postal address. Defaults to transactional. */
  kind?: OutboxKind;
  /** When set, the sender leaves the approved row until this instant has passed. */
  sendAfter?: Date | null;
};
export type DraftResult = { status: "drafted"; id: string } | { status: "exists"; id: string } | { status: "opted_out" } | { status: "invalid"; error: string };

/** The fixed secret the opt-out list is keyed by: the caller's, else FOUNDATION_SECRET. Never the build secret. */
function keyOf(secret: string | null | undefined): string {
  const s = secret === undefined ? readEnv().fixedSecret : secret;
  if (!s) throw new MissingSecretError();
  return s;
}

/** True when the address, in any spelling the one rule joins, is on the opt-out list, or cannot be read at all. */
export async function isOptedOut(db: Queryable, email: string, secret?: string | null): Promise<boolean> {
  const key = keyOf(secret);
  if (!parseEmail(email).ok) return true;
  const rows = await db.query("select 1 as hit from opt_outs where email_hash = $1 limit 1", [emailHash(email, key)]);
  return rows.length > 0;
}

/** Records an opt-out once. Throws for an address parseEmail refuses, and while FOUNDATION_SECRET is unset. */
export async function optOut(db: Queryable, input: { email: string; source: string }, now: Date, secret?: string | null): Promise<void> {
  const key = keyOf(secret);
  const p = parseEmail(input.email);
  if (!p.ok) throw new TypeError(p.error);
  await db.query(
    "insert into opt_outs (email, email_hash, at, source) values ($1, $2, $3, $4) on conflict (email_hash) do nothing",
    [p.send, emailHash(p.send, key), now, input.source.slice(0, 80)],
  );
}

function checkDraft(input: DraftEmail): string | null {
  if (typeof input.subject !== "string" || !input.subject.trim() || input.subject.length > OUTBOX_LIMITS.subject || LINE_BREAK.test(input.subject)) {
    return "A subject is one line of 1 to 200 characters.";
  }
  if (typeof input.body !== "string" || !input.body.trim() || input.body.length > OUTBOX_LIMITS.body) return "A message is 1 to 50,000 characters.";
  if (typeof input.sendKey !== "string" || input.sendKey.length < 1 || input.sendKey.length > OUTBOX_LIMITS.sendKey) return "A send key is 1 to 200 characters.";
  if ([input.subject, input.body, input.sendKey, input.sourceApp ?? "", input.sourceId ?? ""].some((v) => v.includes(NUL))) return "An email holds no NUL characters.";
  for (const id of [input.contactId, input.cardId]) if (id != null && !UUID.test(id)) return "A contact or card id is a UUID.";
  for (const v of [input.sourceApp, input.sourceId]) if (v != null && (v.length < 1 || v.length > SOURCE_MAX)) return "A source is 1 to 200 characters.";
  if (input.kind !== undefined && !(OUTBOX_KINDS as readonly string[]).includes(input.kind)) return "An email is transactional or marketing.";
  if (input.sendAfter != null && !(input.sendAfter instanceof Date && Number.isFinite(input.sendAfter.getTime()))) return "A send time is a real date.";
  return null;
}

/**
 * Drafts one email, or finds the draft its send key already has. Takes a Db or a transaction handle, so a
 * handler can write its card and its drafts in one transaction. Refused while FOUNDATION_SECRET is unset,
 * because the opt-out list cannot be checked without it.
 */
export async function draftEmail(db: Queryable, input: DraftEmail, secret?: string | null): Promise<DraftResult> {
  const p = parseEmail(input.to);
  if (!p.ok) return { status: "invalid", error: p.error };
  const problem = checkDraft(input);
  if (problem) return { status: "invalid", error: problem };
  let optedOut: boolean;
  try {
    optedOut = await isOptedOut(db, p.send, secret);
  } catch (err) {
    if (err instanceof MissingSecretError) return { status: "invalid", error: err.message };
    throw err;
  }
  if (optedOut) return { status: "opted_out" };
  for (let tries = 0; tries < 2; tries++) {
    const rows = await db.query<{ id: string }>(
      `insert into outbox (to_email, contact_id, subject, body, source_app, source_id, card_id, send_key, kind, send_after)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       on conflict (send_key) where status <> 'cancelled' do nothing returning id`,
      [p.send, input.contactId ?? null, input.subject, input.body, input.sourceApp ?? null, input.sourceId ?? null, input.cardId ?? null, input.sendKey, input.kind ?? "transactional", input.sendAfter ?? null],
    );
    if (rows[0]) return { status: "drafted", id: rows[0].id };
    const [existing] = await db.query<{ id: string }>("select id from outbox where send_key = $1 and status <> 'cancelled'", [input.sendKey]);
    // The row in the way was cancelled between the two statements: its key is free, so try once more.
    if (existing) return { status: "exists", id: existing.id };
  }
  throw new Error("The draft's send key could not be settled.");
}

export type Claimed = { id: string; to_email: string; subject: string; body: string; send_key: string; attempts: number; kind: OutboxKind };

/**
 * Moves one approved, due row to sending in one statement, so two senders never take the same row.
 * Marketing rows are taken only by a caller that can add their unsubscribe link.
 */
export async function claimNext(db: Queryable, now: Date, opts: { marketing?: boolean } = {}): Promise<Claimed | null> {
  const due = "status = 'approved' and (send_after is null or send_after <= $1) and (kind = 'transactional' or $2)";
  const [row] = await db.query<Claimed>(
    `update outbox set status = 'sending', claimed_at = $1, attempts = attempts + 1, updated_at = $1
      where id = (select id from outbox where ${due} order by approved_at nulls last, created_at limit 1 for update skip locked)
        and ${due}
      returning id, to_email, subject, body, send_key, attempts, kind`,
    [now, opts.marketing === true],
  );
  return row ?? null;
}

/** What a sender hands the provider: the body with any footer, and the headers to set. */
export type OutgoingEmail = Claimed & { headers: Record<string, string> };
export type Footer = { postalAddress: string; unsubscribeUrl: string | null; mailto: string | null };

/**
 * A marketing email gets the business's postal address when it is set, a link that unsubscribes this
 * message's address, and the List-Unsubscribe headers for a mail app's one-click. Transactional email goes as written.
 */
export function composeEmail(msg: Claimed, footer: Footer): OutgoingEmail {
  if (msg.kind !== "marketing") return { ...msg, headers: {} };
  const lines = [footer.postalAddress.trim(), footer.unsubscribeUrl ? `To stop getting these emails, open ${footer.unsubscribeUrl}` : ""].filter(Boolean);
  const targets = [footer.mailto ? `<mailto:${footer.mailto}?subject=unsubscribe>` : "", footer.unsubscribeUrl ? `<${footer.unsubscribeUrl}>` : ""].filter(Boolean);
  return {
    ...msg,
    body: lines.length ? `${msg.body}\n\n${lines.join("\n")}` : msg.body,
    headers: targets.length ? { "List-Unsubscribe": targets.join(", "), ...(footer.unsubscribeUrl ? { "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : {}) } : {},
  };
}

/** The business's postal address and the mailto for unsubscribing, read fresh: jobs never keep a copy. */
export async function readFooterFacts(db: Queryable): Promise<{ postalAddress: string; mailto: string | null }> {
  const [p] = await db.query<{ postal_address: string; email: string }>("select postal_address, email from business_profile where id = 1");
  const mail = parseEmail(p?.email ?? "");
  return { postalAddress: (p?.postal_address ?? "").replace(/[\r\n]+/g, " ").trim(), mailto: mail.ok ? mail.send : null };
}

export async function markSent(db: Queryable, id: string, providerRef: string, now: Date): Promise<boolean> {
  const rows = await db.query("update outbox set status = 'sent', provider_ref = $2, sent_at = $3, updated_at = $3 where id = $1 and status = 'sending' returning id", [id, providerRef, now]);
  return rows.length === 1;
}

export async function markFailed(db: Queryable, id: string, error: string, now: Date): Promise<boolean> {
  const rows = await db.query("update outbox set status = 'failed', last_error = $2, updated_at = $3 where id = $1 and status = 'sending' returning id", [id, error.slice(0, 500), now]);
  return rows.length === 1;
}

/**
 * The owner sent an approved or failed email another way. It becomes sent, marked as sent by hand, and is
 * never retried. A row that is sending stays refused until it resolves.
 */
export async function markSentByHand(db: Queryable, id: string, now: Date): Promise<boolean> {
  if (!UUID.test(id)) return false;
  const rows = await db.query(
    "update outbox set status = 'sent', sent_by_hand = true, sent_at = $2, updated_at = $2 where id = $1 and status in ('approved', 'failed') returning id",
    [id, now],
  );
  return rows.length === 1;
}

/** The owner stops one email: a draft, or an approved row no sender has claimed yet. Never one sending or sent. */
export async function cancelEmail(db: Queryable, id: string, now: Date): Promise<boolean> {
  if (!UUID.test(id)) return false;
  const rows = await db.query(
    "update outbox set status = 'cancelled', updated_at = $2 where id = $1 and status in ('draft', 'approved') returning id",
    [id, now],
  );
  return rows.length === 1;
}

export type Sender = (msg: OutgoingEmail) => Promise<{ providerRef: string }>;
/** secret: the fixed secret, else FOUNDATION_SECRET. baseUrl: the live site's https address, which marketing email needs. */
export type SendOptions = { secret?: string | null; baseUrl?: string | null };

export async function sendApproved(db: Db, send: Sender, now: Date, max = 20, opts: SendOptions = {}): Promise<{ sent: number; failed: number; refused: number }> {
  // Without the fixed secret the opt-out list cannot be read, so nothing is claimed at all.
  const key = keyOf(opts.secret);
  const base = httpsOrigin(opts.baseUrl);
  const facts = base ? await readFooterFacts(db) : null;
  const out = { sent: 0, failed: 0, refused: 0 };
  for (let i = 0; i < max; i++) {
    const claimed = await claimNext(db, now, { marketing: base !== null });
    if (!claimed) break;
    const msg = composeEmail(claimed, { postalAddress: facts?.postalAddress ?? "", mailto: facts?.mailto ?? null, unsubscribeUrl: base ? unsubscribeUrl(base, claimed.id, key) : null });
    if (await isOptedOut(db, msg.to_email, key)) {
      await db.query("update outbox set status = 'cancelled', last_error = 'opted_out', updated_at = $2 where id = $1 and status = 'sending'", [msg.id, now]);
      out.refused++;
      continue;
    }
    let providerRef: string;
    try {
      providerRef = (await send(msg)).providerRef;
    } catch (err) {
      await markFailed(db, msg.id, err instanceof Error ? err.message : String(err), now);
      out.failed++;
      continue;
    }
    await markSent(db, msg.id, providerRef, now);
    out.sent++;
  }
  return out;
}

/** What the provider says about a send it may or may not have taken: confirmed sent, or unknown. */
export type ProviderLookup = (row: { send_key: string; provider_ref: string | null }) => Promise<"sent" | "unknown">;

/**
 * Resolves rows left in sending. Only a confirmed send becomes sent. Every other answer, a lookup that
 * throws among them, leaves the row failed with a plain note for the owner. Nothing goes back to approved.
 */
export async function recoverStuck(db: Db, lookup: ProviderLookup, now: Date, stuckAfterMs: number = STUCK_AFTER_MS): Promise<{ sent: number; failed: number }> {
  const stuck = await db.query<{ id: string; send_key: string; provider_ref: string | null }>(
    "select id, send_key, provider_ref from outbox where status = 'sending' and claimed_at < $1 order by claimed_at",
    [new Date(now.getTime() - stuckAfterMs)],
  );
  const out = { sent: 0, failed: 0 };
  for (const row of stuck) {
    let answer: string;
    try { answer = await lookup(row); } catch { answer = "unknown"; }
    if (answer === "sent") {
      const r = await db.query("update outbox set status = 'sent', sent_at = coalesce(sent_at, $2), updated_at = $2 where id = $1 and status = 'sending' returning id", [row.id, now]);
      out.sent += r.length;
    } else {
      const r = await db.query("update outbox set status = 'failed', last_error = $2, updated_at = $3 where id = $1 and status = 'sending' returning id", [row.id, UNCONFIRMED, now]);
      out.failed += r.length;
    }
  }
  return out;
}
