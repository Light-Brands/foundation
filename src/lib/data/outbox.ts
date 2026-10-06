import type { Db, Queryable } from "@/lib/db/types";
import { FIXED_SECRET_MIN, readEnv } from "@/lib/env";
import { emailHash, normalizedEmailSql, parseEmail, MissingSecretError } from "@/lib/email";
import { isPaused } from "@/lib/data/pause";
import { checkSecretFingerprint, FINGERPRINT_KEY, secretFingerprint, SecretMismatchError } from "@/lib/data/secret-check";
import { httpsOrigin, publicBaseUrl, unsubscribeUrl } from "@/lib/email-links";

// Every drafted customer email, sent at most once. A draft becomes approved only through the card
// decision (decideCard in inbox.ts), and only while it is still a draft. A sender claims one approved,
// due row at a time by moving it to sending in one statement. A row left in sending is resolved by
// asking the provider: confirmed sent becomes sent, anything else becomes failed for the owner, and
// nothing is ever resent on its own. Every address is read by parseEmail and checked against the
// opt-out list when it is drafted and again when it is sent. A row the owner copied to send by hand is never
// claimed by a sender: it waits for "I sent it" or a cancel.

export const OUTBOX_STATUSES = ["draft", "approved", "sending", "sent", "failed", "cancelled"] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];
export const OUTBOX_KINDS = ["transactional", "marketing"] as const;
export type OutboxKind = (typeof OUTBOX_KINDS)[number];
export const OUTBOX_LIMITS = { subject: 200, body: 50_000, sendKey: 200 } as const;
/** A row sending longer than this is resolved by recoverStuck. Every Sender must time out well under it, at a minute or two. */
export const STUCK_AFTER_MS = 15 * 60_000;
const UNCONFIRMED = "We could not confirm whether this email was sent. Check your sent mail before sending it again.";
const SOURCE_MAX = 200;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Every C0 and C1 control character, DEL, and the Unicode line and paragraph separators.
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;
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

/**
 * The fixed secret the opt-out list is keyed by: the caller's, else FOUNDATION_SECRET. Never the build secret,
 * and never one shorter than 32 characters: without a usable key nothing is recorded or checked.
 */
function keyOf(secret: string | null | undefined): string {
  const s = secret === undefined ? readEnv().fixedSecret : secret;
  if (!s || s.length < FIXED_SECRET_MIN) throw new MissingSecretError();
  return s;
}

/** An opt-out that could not be written for this address under today's secret. The caller reports a failure. */
export class OptOutNotRecordedError extends Error {
  constructor() {
    super("We could not record that opt-out. Nothing was changed.");
    this.name = "OptOutNotRecordedError";
  }
}
const UNCHECKED_DRAFT = "We could not check who asked us to stop, so nothing was drafted. Try again in a moment.";
const NO_POSTAL_ADDRESS = "Add your postal address in Settings first.";

/** marketing: the person stopped marketing email (the unsubscribe link). all: the person stopped every email. */
export const OPT_OUT_SCOPES = ["marketing", "all"] as const;
export type OptOutScope = (typeof OPT_OUT_SCOPES)[number];

/**
 * The SQL test for "an opt-out covers this address for this kind". It matches a row by today's hash, or by the
 * address the row keeps (email is null only for a forgotten person), so an opt-out recorded under an earlier
 * FOUNDATION_SECRET still refuses. $hash, $send and $match are parameter placeholders, kind is a SQL expression
 * that gives 'marketing' or 'transactional'.
 */
export function optOutCovers(hash: string, send: string, match: string, kind: string): string {
  return `exists (select 1 from opt_outs o
                   where (o.email_hash = ${hash}
                          or (o.email is not null and (lower(o.email) = lower(${send}) or ${normalizedEmailSql("o.email")} = ${match})))
                     and (o.scope = 'all' or ${kind} = 'marketing'))`;
}

/**
 * True when the address, in any spelling the one rule joins, has an opt-out that covers this kind of email,
 * or cannot be read at all. An all opt-out covers every kind. A marketing opt-out covers marketing only.
 * It matches on today's hash or on the address an opt-out keeps, so one recorded under an earlier secret still counts.
 */
export async function isOptedOut(db: Queryable, email: string, kind: OutboxKind, secret?: string | null): Promise<boolean> {
  const key = keyOf(secret);
  await checkSecretFingerprint(db, key);
  const p = parseEmail(email);
  if (!p.ok) return true;
  const [row] = await db.query<{ hit: boolean }>(
    `select ${optOutCovers("$1", "$2", "$3", "$4")} as hit`,
    [emailHash(p.send, key), p.send, p.match, kind === "marketing" ? "marketing" : "transactional"],
  );
  return row?.hit !== false;
}

/**
 * Records an opt-out once, with its scope. It matches an earlier row on email_hash or on lower(email), so an
 * opt-out kept under an earlier FOUNDATION_SECRET is re-keyed to today's hash. A second opt-out for the same
 * person only widens a marketing one to all, never narrows it. Refused with SecretMismatchError when today's secret is not
 * the one this Foundation started with. Never raises a database error on a clash with any unique index, and then reads back:
 * unless a row for this address now covers the scope, it throws OptOutNotRecordedError. Throws for an address parseEmail
 * refuses, for a scope that is not marketing or all, and while FOUNDATION_SECRET is unset.
 */
export async function optOut(db: Queryable, input: { email: string; source: string; scope: OptOutScope }, now: Date, secret?: string | null): Promise<void> {
  const key = keyOf(secret);
  const p = parseEmail(input.email);
  if (!p.ok) throw new TypeError(p.error);
  if (!(OPT_OUT_SCOPES as readonly string[]).includes(input.scope)) throw new TypeError("An opt-out is for marketing email or for all email.");
  await checkSecretFingerprint(db, key);
  const hash = emailHash(p.send, key);
  // One row per person, found by today's hash or by the address itself, so an opt-out kept under an earlier
  // secret is re-keyed to today's hash. The hash row wins when both exist. A scope only widens.
  const refresh = () => db.query(
    `update opt_outs set email_hash = $1, scope = case when $3 = 'all' then 'all' else scope end
     where id = (select id from opt_outs where email_hash = $1 or (email is not null and lower(email) = lower($2))
                 order by (email_hash = $1) desc limit 1)
       and not exists (select 1 from opt_outs o where o.email_hash = $1 and o.id <> opt_outs.id)
     returning id`,
    [hash, p.send, input.scope],
  );
  if ((await refresh()).length === 0) {
    // No conflict target, so a clash on any unique index writes nothing instead of throwing.
    const inserted = await db.query(
      "insert into opt_outs (email, email_hash, at, source, scope) values ($1, $2, $3, $4, $5) on conflict do nothing returning id",
      [p.send, hash, now, input.source.slice(0, 80), input.scope],
    );
    if (inserted.length === 0) await refresh();
  }
  // Fail closed: success only when a row for this hash now covers the scope asked for.
  const covered = await db.query("select 1 as hit from opt_outs where email_hash = $1 and (scope = 'all' or $2 = 'marketing') limit 1", [hash, input.scope]);
  if (covered.length === 0) throw new OptOutNotRecordedError();
}

function checkDraft(input: DraftEmail): string | null {
  if (typeof input.subject !== "string" || !input.subject.trim() || input.subject.length > OUTBOX_LIMITS.subject || CONTROL.test(input.subject)) {
    return "A subject is one line of 1 to 200 characters, with no control characters.";
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
 * because the opt-out list cannot be checked without it, and a marketing email is refused while the business
 * has no postal address, because its footer must carry one.
 */
export async function draftEmail(db: Queryable, input: DraftEmail, secret?: string | null): Promise<DraftResult> {
  const p = parseEmail(input.to);
  if (!p.ok) return { status: "invalid", error: p.error };
  const problem = checkDraft(input);
  if (problem) return { status: "invalid", error: problem };
  if (input.kind === "marketing" && !(await readFooterFacts(db)).postalAddress) return { status: "invalid", error: NO_POSTAL_ADDRESS };
  let optedOut: boolean;
  try {
    optedOut = await isOptedOut(db, p.send, input.kind ?? "transactional", secret);
  } catch (err) {
    // Fail closed: a list that cannot be read never counts as not opted out.
    return { status: "invalid", error: err instanceof MissingSecretError || err instanceof SecretMismatchError ? err.message : UNCHECKED_DRAFT };
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
 * Marketing rows are taken only by a caller that can add their unsubscribe link. A copied row is never taken.
 */
export async function claimNext(db: Queryable, now: Date, opts: { marketing?: boolean } = {}): Promise<Claimed | null> {
  const due = "status = 'approved' and copied_at is null and (send_after is null or send_after <= $1) and (kind = 'transactional' or $2)";
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

export type HandSentResult = "sent" | "opted_out" | "automatic" | "not_waiting";

/**
 * The owner sent an approved or failed email another way. It becomes sent, marked as sent by hand, and is
 * never retried. A row that is sending stays refused until it resolves. A row whose address opted out of its
 * kind is refused, checked again in the same statement that marks it. approved: false refuses an approved
 * row that was not copied, for while the email connection sends approved rows on its own, so the two never both send it.
 */
export async function markSentByHand(db: Queryable, id: string, now: Date, opts: { secret?: string | null; approved?: boolean } = {}): Promise<HandSentResult> {
  if (!UUID.test(id)) return "not_waiting";
  const key = keyOf(opts.secret);
  const [row] = await db.query<{ to_email: string; kind: OutboxKind; status: OutboxStatus; copied: boolean }>(
    "select to_email, kind, status, copied_at is not null as copied from outbox where id = $1 and status in ('approved', 'failed')",
    [id],
  );
  if (!row) return "not_waiting";
  // A copied row is never claimed by the sender, so the owner may mark it sent even while the connection is active.
  if (row.status === "approved" && opts.approved === false && !row.copied) return "automatic";
  if (await isOptedOut(db, row.to_email, row.kind, key)) return "opted_out";
  const p = parseEmail(row.to_email);
  if (!p.ok) return "opted_out";
  const rows = await db.query(
    `update outbox set status = 'sent', sent_by_hand = true, sent_at = $2, updated_at = $2
      where id = $1 and (status = 'failed' or (status = 'approved' and ($3 or copied_at is not null)))
        and not ${optOutCovers("$4", "$5", "$6", "outbox.kind")}
      returning id`,
    [id, now, opts.approved !== false, emailHash(p.send, key), p.send, p.match],
  );
  return rows.length === 1 ? "sent" : "not_waiting";
}

/**
 * The owner copied an approved or failed email to send it from their own mail. From then on no sender claims
 * it: it waits for "I sent it" or a cancel. True when the copy was recorded.
 */
export async function markCopied(db: Queryable, id: string, now: Date): Promise<boolean> {
  if (!UUID.test(id)) return false;
  const rows = await db.query(
    "update outbox set copied_at = coalesce(copied_at, $2), updated_at = $2 where id = $1 and status in ('approved', 'failed') returning id",
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

/** Hands one email to the provider. It must give up well under STUCK_AFTER_MS, so recovery rarely meets a live send. */
export type Sender = (msg: OutgoingEmail) => Promise<{ providerRef: string }>;
/** secret: the fixed secret, else FOUNDATION_SECRET. baseUrl: the live site's https address, which marketing email needs. */
export type SendOptions = { secret?: string | null; baseUrl?: string | null };

/** What every sender passes to sendApproved: the fixed secret and the live site's address (FOUNDATION_URL first). */
export function senderOptions(env: Record<string, string | undefined> = process.env): Required<SendOptions> {
  return { secret: readEnv(env).fixedSecret, baseUrl: publicBaseUrl(env) };
}

/**
 * Sends approved, due rows, one at a time. The opt-out check is part of the claim itself: a row moves to
 * sending only in the statement that finds no opt-out covering it, so nothing between the check and the claim
 * can leave a row in sending. A row an opt-out covers is cancelled from approved. When the list cannot be read
 * or that cancel fails, the row stays approved, unsent and never marked failed, and the pass stops, because the
 * next row would meet the same trouble. The pause switch is read again before each row, so a pause set during a
 * pass stops the rows still to go. After the provider call, a row that cannot be marked stays in sending for
 * recoverStuck to ask the provider about, because putting it back could send it twice.
 */
export async function sendApproved(db: Db, send: Sender, now: Date, max = 20, opts: SendOptions = {}): Promise<{ sent: number; failed: number; refused: number }> {
  // Without the fixed secret the opt-out list cannot be read, so nothing is claimed at all. Under a secret that is
  // not the one this Foundation started with, or a fingerprint that cannot be read, nothing is claimed either.
  const key = keyOf(opts.secret);
  await checkSecretFingerprint(db, key);
  const base = httpsOrigin(opts.baseUrl);
  const facts = base ? await readFooterFacts(db) : null;
  const out = { sent: 0, failed: 0, refused: 0 };
  for (let i = 0; i < max; i++) {
    if (await isPaused(db)) break;
    let step: Awaited<ReturnType<typeof claimClear>>;
    try {
      step = await claimClear(db, now, key, base !== null);
    } catch {
      // Fail closed: nothing was claimed, so the row is still approved for the next pass.
      out.refused++;
      break;
    }
    if (step === "none") break;
    if (step === "refused") { out.refused++; continue; }
    if (step === "busy") continue;
    const claimed = step;
    const msg = composeEmail(claimed, { postalAddress: facts?.postalAddress ?? "", mailto: facts?.mailto ?? null, unsubscribeUrl: base ? unsubscribeUrl(base, claimed.id, key) : null });
    let providerRef: string;
    try {
      providerRef = (await send(msg)).providerRef;
    } catch (err) {
      await markFailed(db, msg.id, err instanceof Error ? err.message : String(err), now);
      out.failed++;
      continue;
    }
    if (await markSent(db, msg.id, providerRef, now)) {
      out.sent++;
      continue;
    }
    // The provider took it after recovery had already marked the row unconfirmed. Record the send, and count it
    // only when that update really happened. A provider call must time out well under STUCK_AFTER_MS, so this
    // is rare, never the normal path.
    const late = await db.query(
      "update outbox set status = 'sent', provider_ref = $2, sent_at = $3, updated_at = $3 where id = $1 and status = 'failed' and last_error = $4 returning id",
      [msg.id, providerRef, now, UNCONFIRMED],
    );
    out.sent += late.length;
  }
  return out;
}

/**
 * One step of a pass: the next approved, due row moved to sending only when no opt-out covers it ("claimed"),
 * cancelled from approved when one does ("refused"), "busy" when another sender or the owner moved it first,
 * or "none" when nothing is due. Throws when the database cannot answer, with the row still approved.
 */
async function claimClear(db: Queryable, now: Date, key: string, marketing: boolean): Promise<Claimed | "refused" | "busy" | "none"> {
  const due = "status = 'approved' and copied_at is null and (send_after is null or send_after <= $1) and (kind = 'transactional' or $2)";
  const [next] = await db.query<{ id: string; to_email: string }>(
    `select id, to_email from outbox where ${due} order by approved_at nulls last, created_at limit 1`,
    [now, marketing],
  );
  if (!next) return "none";
  const p = parseEmail(next.to_email);
  if (!p.ok) {
    // An address the one strict reading refuses is never sent to.
    const r = await db.query("update outbox set status = 'cancelled', last_error = 'opted_out', updated_at = $2 where id = $1 and status = 'approved' returning id", [next.id, now]);
    return r.length ? "refused" : "busy";
  }
  const params = [now, marketing, next.id, emailHash(p.send, key), p.send, p.match, FINGERPRINT_KEY, secretFingerprint(key)];
  const covered = optOutCovers("$4", "$5", "$6", "outbox.kind");
  // The claim itself also requires the stored fingerprint to be this secret's, so no row moves to sending under
  // another secret even if the fingerprint changed after the pass checked it.
  const sameSecret = "exists (select 1 from core_settings s where s.key = $7 and s.value = $8)";
  const [row] = await db.query<Claimed>(
    `update outbox set status = 'sending', claimed_at = $1, attempts = attempts + 1, updated_at = $1
      where id = (select id from outbox where id = $3 and ${due} for update skip locked)
        and ${due} and ${sameSecret} and not ${covered}
      returning id, to_email, subject, body, send_key, attempts, kind`,
    params,
  );
  if (row) return row;
  const cancelled = await db.query(
    `update outbox set status = 'cancelled', last_error = 'opted_out', updated_at = $1
      where id = $3 and ${due} and ${covered} and ${sameSecret} returning id`,
    params,
  );
  if (cancelled.length) return "refused";
  // Neither moved: another sender took the row, or the secret no longer matches. Ask again, which throws for the second.
  await checkSecretFingerprint(db, key);
  return "busy";
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
