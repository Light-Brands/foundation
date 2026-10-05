"use server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { hasSession } from "@/lib/auth/session";
import { SESSION_ENDED_MESSAGE } from "@/lib/auth/roles";
import { upsertConnection, validateConnection } from "@/lib/data/connections";
import { PREVIEW_MESSAGE } from "@/lib/data/profile";

export type ConnectionResult = { ok: boolean; message: string; errors?: Record<string, string> };

export async function saveConnectionAction(_prev: ConnectionResult | null, form: FormData): Promise<ConnectionResult> {
  if (!(await hasSession())) return { ok: false, message: SESSION_ENDED_MESSAGE };
  const raw = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string"));
  const scopes = String(raw.scopes ?? "").split(/[\s,]+/).filter(Boolean);
  const checked = validateConnection({ ...raw, scopes });
  if (!checked.ok) return { ok: false, message: "A few details need a look.", errors: checked.errors as Record<string, string> };
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: PREVIEW_MESSAGE };
    await upsertConnection(db, checked.value, new Date());
    revalidatePath("/", "layout");
    return { ok: true, message: "Saved." };
  } catch (err) {
    console.error("saveConnectionAction failed", err);
    return { ok: false, message: "We could not save just now. Try again in a moment." };
  }
}
