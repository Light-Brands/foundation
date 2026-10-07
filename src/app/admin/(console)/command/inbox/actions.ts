"use server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { hasSession } from "@/lib/auth/session";
import { PIN_OWNER, SESSION_ENDED_MESSAGE, allows } from "@/lib/auth/roles";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { decideCard, markCardDone, type DecideResult, type DoneResult } from "@/lib/data/inbox";
import { routeCard } from "@/lib/data/cards";
import { SLUG } from "@/lib/key/frontmatter";
import { PREVIEW_MESSAGE } from "@/lib/data/profile";
import { cancelEmail, markCopied, markSentByHand, type HandSentResult } from "@/lib/data/outbox";
import { emailSendingActive } from "@/lib/data/connections";
import { MissingSecretError } from "@/lib/email";

export type CardActionResult = { ok: boolean; message: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const REFUSED: Record<string, string> = {
  not_found: "That card is no longer here.",
  already_decided: "This card was already decided.",
  already_done: "This card is already done.",
  not_decidable: "This card needs no decision. Mark it done when you have handled it.",
  needs_decision: "Approve or decline this card first.",
  owner_only: "Only the owner can decide this card.",
  not_allowed: "This card belongs to a department you do not work in.",
};
const FAILED = "We could not save that just now. Try again in a moment.";
const ROUTE_REFUSED: Record<string, string> = {
  not_routable: "Only a new message can be moved.",
  unknown_kind: "That job is not installed.",
  not_done_kind: "That job takes decisions, so a message cannot be moved there.",
};

export async function decideCardAction(_prev: CardActionResult | null, form: FormData): Promise<CardActionResult> {
  if (!(await hasSession())) return { ok: false, message: SESSION_ENDED_MESSAGE };
  const id = String(form.get("id") ?? "");
  const decision = String(form.get("decision") ?? "");
  if (!UUID.test(id) || (decision !== "approve" && decision !== "decline")) return { ok: false, message: "That card could not be read. Reload the page and try again." };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: PREVIEW_MESSAGE };
    const r: DecideResult = await decideCard(db, await loadCardKinds(), { cardId: id, decision, actor: PIN_OWNER }, new Date());
    revalidatePath("/", "layout");
    if (r.status === "decided") return { ok: true, message: decision === "approve" ? "Approved." : "Declined." };
    return { ok: false, message: REFUSED[r.status] };
  } catch (err) {
    console.error("decideCardAction failed", err);
    return { ok: false, message: FAILED };
  }
}

export async function markDoneAction(_prev: CardActionResult | null, form: FormData): Promise<CardActionResult> {
  if (!(await hasSession())) return { ok: false, message: SESSION_ENDED_MESSAGE };
  const id = String(form.get("id") ?? "");
  if (!UUID.test(id)) return { ok: false, message: "That card could not be read. Reload the page and try again." };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: PREVIEW_MESSAGE };
    const r: DoneResult = await markCardDone(db, await loadCardKinds(), { cardId: id, actor: PIN_OWNER });
    revalidatePath("/", "layout");
    return r.status === "done" ? { ok: true, message: "Marked done." } : { ok: false, message: REFUSED[r.status] };
  } catch (err) {
    console.error("markDoneAction failed", err);
    return { ok: false, message: FAILED };
  }
}

export async function routeCardAction(_prev: CardActionResult | null, form: FormData): Promise<CardActionResult> {
  if (!(await hasSession())) return { ok: false, message: SESSION_ENDED_MESSAGE };
  const id = String(form.get("id") ?? "");
  const to = String(form.get("to") ?? "");
  if (!UUID.test(id) || !SLUG.test(to)) return { ok: false, message: "That card could not be read. Reload the page and try again." };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: PREVIEW_MESSAGE };
    const kinds = await loadCardKinds();
    const r = await routeCard(db, kinds, { cardId: id, toKind: to }, new Date());
    revalidatePath("/", "layout");
    if (r.status === "routed") return { ok: true, message: `Moved to ${kinds.get(to)?.label ?? "its job"}.` };
    return { ok: false, message: ROUTE_REFUSED[r.status] ?? REFUSED.not_found };
  } catch (err) {
    console.error("routeCardAction failed", err);
    return { ok: false, message: FAILED };
  }
}

const HAND_SENT: Record<HandSentResult, string> = {
  sent: "Marked as sent.",
  opted_out: "This person asked us to stop.",
  automatic: "Your email connection sends this one on its own.",
  not_waiting: "This email is not waiting to be sent.",
};
const EMAIL_UNREADABLE = "That email could not be read. Reload the page and try again.";

/**
 * The owner sent an approved or failed email from their own email. Owner only. Refused for an address that
 * opted out, and for an approved email while the email connection sends on its own.
 */
export async function markSentByHandAction(_prev: CardActionResult | null, form: FormData): Promise<CardActionResult> {
  const actor = (await hasSession()) ? PIN_OWNER : null;
  if (!actor || !allows(actor, "owner")) return { ok: false, message: SESSION_ENDED_MESSAGE };
  const id = String(form.get("id") ?? "");
  if (!UUID.test(id)) return { ok: false, message: EMAIL_UNREADABLE };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: PREVIEW_MESSAGE };
    const r = await markSentByHand(db, id, new Date(), { approved: !(await emailSendingActive(db)) });
    revalidatePath("/admin/command/inbox");
    return { ok: r === "sent", message: HAND_SENT[r] };
  } catch (err) {
    if (err instanceof MissingSecretError) return { ok: false, message: err.message };
    console.error("markSentByHandAction failed", err);
    return { ok: false, message: FAILED };
  }
}

/**
 * The owner pressed Copy email. Recorded before the text reaches the clipboard, so from then on no sender
 * claims the email: it waits for "I sent it" or a cancel, even if the email connection turns active later. Owner only.
 */
export async function markCopiedAction(id: string): Promise<CardActionResult> {
  const actor = (await hasSession()) ? PIN_OWNER : null;
  if (!actor || !allows(actor, "owner")) return { ok: false, message: SESSION_ENDED_MESSAGE };
  if (typeof id !== "string" || !UUID.test(id)) return { ok: false, message: EMAIL_UNREADABLE };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: PREVIEW_MESSAGE };
    const ok = await markCopied(db, id, new Date());
    revalidatePath("/admin/command/inbox");
    return ok ? { ok: true, message: "Copied. Send it from your email, then mark it sent." } : { ok: false, message: HAND_SENT.not_waiting };
  } catch (err) {
    console.error("markCopiedAction failed", err);
    return { ok: false, message: FAILED };
  }
}

/** The owner stops one email: a draft, or an approved one no sender has picked up. Owner only. */
export async function cancelEmailAction(_prev: CardActionResult | null, form: FormData): Promise<CardActionResult> {
  const actor = (await hasSession()) ? PIN_OWNER : null;
  if (!actor || !allows(actor, "owner")) return { ok: false, message: SESSION_ENDED_MESSAGE };
  const id = String(form.get("id") ?? "");
  if (!UUID.test(id)) return { ok: false, message: EMAIL_UNREADABLE };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: PREVIEW_MESSAGE };
    const ok = await cancelEmail(db, id, new Date());
    revalidatePath("/admin/command/inbox");
    return ok ? { ok: true, message: "This email will not be sent." } : { ok: false, message: "This email is already sending or sent, so it cannot be stopped." };
  } catch (err) {
    console.error("cancelEmailAction failed", err);
    return { ok: false, message: FAILED };
  }
}
