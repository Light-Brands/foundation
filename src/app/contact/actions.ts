"use server";
import { getDb } from "@/lib/db";
import { submitContact } from "@/lib/data/inbox";
import { captureSource } from "@/lib/forms/source";
import { validateContact, type ContactInput } from "@/lib/validate";

export type ContactResult = { ok: boolean; message: string; errors?: Record<string, string>; values?: ContactInput };

// Public on purpose: visitors use this action, so there is no session check.
export async function contactAction(_prev: ContactResult | null, form: FormData): Promise<ContactResult> {
  const raw = Object.fromEntries(form);
  const result = validateContact(raw);
  const s = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : "");
  const typed = { name: s("name"), email: s("email"), phone: s("phone"), message: s("message") };
  if (!result.ok) {
    return { ok: false, message: "A few details need a look.", errors: result.errors, values: typed };
  }
  try {
    const db = await getDb();
    if (!db) return { ok: false, message: "This page opens for messages very soon. Please check back.", values: typed };
    await submitContact(db, result.value, { source: captureSource(raw) });
    return { ok: true, message: "Thank you. Your message is in, and you will hear back soon." };
  } catch (err) {
    console.error("contactAction failed", err);
    return { ok: false, message: "We could not send that just now. Please try again in a moment.", values: typed };
  }
}
