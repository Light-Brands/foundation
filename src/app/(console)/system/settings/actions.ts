"use server";
import { revalidatePath } from "next/cache";
import { getDb, storageMode } from "@/lib/db";
import { saveProfile, PREVIEW_MESSAGE } from "@/lib/data/profile";
import { validateProfile, PROFILE_FIELDS, type Profile } from "@/lib/validate";
import { hasSession } from "@/lib/auth/session";
import { PIN_OWNER, SESSION_ENDED_MESSAGE } from "@/lib/auth/roles";
import { setPause, cleanReason } from "@/lib/data/pause";
import { contextBlockFromProfile } from "@/lib/key/context-block";
import { writeContextBlock, writeKeyName, keyRoot } from "@/lib/key/write";

export type ActionResult = { ok: boolean; message: string; errors?: Record<string, string>; values?: Profile };

function submittedValues(form: FormData): Profile {
  const raw = Object.fromEntries(form);
  const str = (k: keyof Profile) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");
  return Object.fromEntries(PROFILE_FIELDS.map((k) => [k, str(k)])) as Profile;
}

export async function saveProfileAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const values = submittedValues(form);
  if (!(await hasSession())) return { ok: false, message: "Your session ended. Enter your PIN again to save.", values };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: PREVIEW_MESSAGE, values };
    const result = validateProfile(Object.fromEntries(form));
    if (!result.ok) return { ok: false, message: "A few details need a look.", errors: result.errors, values };
    await saveProfile(db, result.value);
    revalidatePath("/", "layout");
    if (storageMode() === "pglite") {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const root = keyRoot();
        await writeContextBlock(root, contextBlockFromProfile(result.value, result.value.owner_name, today));
        await writeKeyName(root, result.value.business);
      } catch (err) {
        console.error("context block write failed", err);
        return { ok: true, message: "Saved. Your business notes could not be updated this time. They update on your next save." };
      }
    }
    return { ok: true, message: "Saved." };
  } catch (err) {
    console.error("saveProfileAction failed", err);
    return { ok: false, message: "We could not save just now. Try again in a moment.", values };
  }
}

export type PauseResult = { ok: boolean; message: string };

export async function pauseAction(_prev: PauseResult | null, form: FormData): Promise<PauseResult> {
  if (!(await hasSession())) return { ok: false, message: SESSION_ENDED_MESSAGE };
  const paused = form.get("paused") === "on";
  const reason = cleanReason(form.get("reason"));
  if (!reason.ok) return { ok: false, message: reason.error };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: PREVIEW_MESSAGE };
    await setPause(db, { paused, reason: reason.value, by: PIN_OWNER.id }, new Date());
    revalidatePath("/", "layout");
    return { ok: true, message: paused ? "Routines are paused. Nothing runs until you turn them back on." : "Routines are back on." };
  } catch (err) {
    console.error("pauseAction failed", err);
    return { ok: false, message: "We could not change that just now. Try again in a moment." };
  }
}
