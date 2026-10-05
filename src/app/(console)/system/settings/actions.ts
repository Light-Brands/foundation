"use server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { saveProfile, PREVIEW_MESSAGE } from "@/lib/data/profile";
import { validateProfile } from "@/lib/validate";

export type ActionResult = { ok: boolean; message: string; errors?: Record<string, string> };

export async function saveProfileAction(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const db = await getDb();
  if (!db) return { ok: false, message: PREVIEW_MESSAGE };
  const result = validateProfile(Object.fromEntries(form));
  if (!result.ok) return { ok: false, message: "A few details need a look.", errors: result.errors };
  await saveProfile(db, result.value);
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved." };
}
