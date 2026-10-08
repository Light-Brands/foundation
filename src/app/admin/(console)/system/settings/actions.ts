"use server";
import { revalidatePath } from "next/cache";
import { getDb, storageMode } from "@/lib/db";
import { saveProfile, setChiefName, PREVIEW_MESSAGE } from "@/lib/data/profile";
import { readEnv } from "@/lib/env";
import { validateProfile, PROFILE_FIELDS, type Profile } from "@/lib/validate";
import { hasSession } from "@/lib/auth/session";
import { PIN_OWNER, SESSION_ENDED_MESSAGE, allows } from "@/lib/auth/roles";
import { setPause, cleanReason } from "@/lib/data/pause";
import { contextBlockFromProfile } from "@/lib/key/context-block";
import { writeContextBlock, writeKeyName, keyRoot } from "@/lib/key/write";

export type ActionResult = { ok: boolean; message: string; errors?: Record<string, string>; values?: Profile };

function submittedValues(form: FormData): Profile {
  const raw = Object.fromEntries(form);
  const str = (k: keyof Profile) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");
  return Object.fromEntries(PROFILE_FIELDS.map((k) => [k, str(k)])) as Profile;
}

// Locally, every save also writes the Key's context block and names the Key after the business.
async function writeKey(p: Profile): Promise<boolean> {
  if (storageMode() !== "pglite") return true;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const root = keyRoot();
    await writeContextBlock(root, contextBlockFromProfile(p, p.owner_name, today));
    await writeKeyName(root, p.business);
    return true;
  } catch (err) {
    console.error("context block write failed", err);
    return false;
  }
}
const KEY_LATER = "Saved. Your business notes could not be updated this time. They update on your next save.";

// The Agents page names the chief of staff through this same action, sending only that one field.
async function saveChiefNameOnly(form: FormData): Promise<ActionResult> {
  if (!(await hasSession())) return { ok: false, message: "Your session ended. Enter your PIN again to save." };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: PREVIEW_MESSAGE };
    const r = await setChiefName(db, form.get("chief_name"), readEnv().businessName);
    if (!r.ok) return { ok: false, message: r.error, errors: { chief_name: r.error } };
    revalidatePath("/", "layout");
    return { ok: true, message: (await writeKey(r.profile)) ? "Saved." : KEY_LATER };
  } catch (err) {
    console.error("saveChiefNameOnly failed", err);
    return { ok: false, message: "We could not save just now. Try again in a moment." };
  }
}

export async function saveProfileAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (form.get("only") === "chief_name") return saveChiefNameOnly(form);
  const values = submittedValues(form);
  if (!(await hasSession())) return { ok: false, message: "Your session ended. Enter your PIN again to save.", values };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: PREVIEW_MESSAGE, values };
    const result = validateProfile(Object.fromEntries(form));
    if (!result.ok) return { ok: false, message: "A few details need a look.", errors: result.errors, values };
    await saveProfile(db, result.value);
    revalidatePath("/", "layout");
    return { ok: true, message: (await writeKey(result.value)) ? "Saved." : KEY_LATER };
  } catch (err) {
    console.error("saveProfileAction failed", err);
    return { ok: false, message: "We could not save just now. Try again in a moment.", values };
  }
}

export type PauseResult = { ok: boolean; paused: boolean; message: string };

export async function pauseAction(_prev: PauseResult | null, form: FormData): Promise<PauseResult> {
  const actor = (await hasSession()) ? PIN_OWNER : null;
  if (!actor || !allows(actor, "owner")) return { ok: false, paused: false, message: SESSION_ENDED_MESSAGE };
  const choice = form.get("paused");
  if (choice !== "on" && choice !== "off") return { ok: false, paused: false, message: "Choose pause or turn back on, then try once more." };
  const paused = choice === "on";
  const reason = cleanReason(form.get("reason"));
  if (!reason.ok) return { ok: false, paused: false, message: reason.error };
  try {
    const db = await getDb();
    if (!db) return { ok: false, paused: false, message: PREVIEW_MESSAGE };
    await setPause(db, { paused, reason: reason.value, by: actor.id }, new Date());
    revalidatePath("/", "layout");
    return { ok: true, paused, message: paused ? "Routines are paused. Nothing runs until you turn them back on." : "Routines are back on." };
  } catch (err) {
    console.error("pauseAction failed", err);
    return { ok: false, paused: false, message: "We could not change that just now. Try again in a moment." };
  }
}
