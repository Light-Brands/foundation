"use server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { hasSession } from "@/lib/auth/session";
import { PIN_OWNER, SESSION_ENDED_MESSAGE } from "@/lib/auth/roles";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { decideCard, markCardDone, type DecideResult, type DoneResult } from "@/lib/data/inbox";
import { PREVIEW_MESSAGE } from "@/lib/data/profile";

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
