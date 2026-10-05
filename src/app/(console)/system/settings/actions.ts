"use server";
import { revalidatePath } from "next/cache";
import { getDb, storageMode } from "@/lib/db";
import { saveProfile, PREVIEW_MESSAGE } from "@/lib/data/profile";
import { validateProfile, PROFILE_FIELDS, type Profile } from "@/lib/validate";
import { hasSession } from "@/lib/auth/session";
import { contextBlockFromProfile } from "@/lib/key/context-block";
import { writeContextBlock } from "@/lib/key/write";

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
    if (storageMode() === "pglite") {
      const today = new Date().toISOString().slice(0, 10);
      await writeContextBlock(process.cwd(), contextBlockFromProfile(result.value, result.value.owner_name, today));
    }
    revalidatePath("/", "layout");
    return { ok: true, message: "Saved." };
  } catch (err) {
    console.error("saveProfileAction failed", err);
    return { ok: false, message: "We could not save just now. Try again in a moment.", values };
  }
}
