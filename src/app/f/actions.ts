"use server";
import { headers } from "next/headers";
import { getDb } from "@/lib/db";
import { readEnv } from "@/lib/env";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { loadForms, submitPublicForm, HONEYPOT } from "@/lib/forms/public";
import { SOURCE_KEYS } from "@/lib/forms/source";
import { clientKeyFromHeaders } from "@/lib/auth/limit";

export type FormResult = { ok: boolean; message: string; errors?: Record<string, string>; values?: Record<string, string> };

const HIDDEN = new Set<string>([HONEYPOT, "_form", ...SOURCE_KEYS]);

// Public on purpose: visitors use this action, so it has no session check. It reaches the database
// only through submitPublicForm, which refuses an undeclared form and only inserts.
export async function submitFormAction(_prev: FormResult | null, data: FormData): Promise<FormResult> {
  const raw: Record<string, string> = Object.create(null);
  for (const [k, v] of data.entries()) if (typeof v === "string" && !(k in raw)) raw[k] = v;
  const values = Object.fromEntries(Object.entries(raw).filter(([k]) => !HIDDEN.has(k) && !k.startsWith("$")).map(([k, v]) => [k, v.slice(0, 4000)]));
  try {
    const [db, kinds, forms] = await Promise.all([getDb(), loadCardKinds(), loadForms()]);
    const formKey = raw._form ?? "";
    const outcome = await submitPublicForm({ db, kinds, forms, secret: readEnv().secret }, { formKey, data: raw, clientKey: clientKeyFromHeaders(await headers()) }, new Date());
    switch (outcome.status) {
      case "saved":
      case "discarded":
        return { ok: true, message: forms.get(formKey)?.thanks ?? "Thank you." };
      case "invalid":
        return { ok: false, message: outcome.errors._form ?? "A few details need a look.", errors: outcome.errors, values };
      case "limited":
        return { ok: false, message: "We received several messages from you just now. Please try again in a few minutes.", values };
      case "preview":
        return { ok: false, message: "This page opens for messages very soon. Please check back.", values };
      default:
        return { ok: false, message: "This form is not taking messages.", values };
    }
  } catch (err) {
    console.error("submitFormAction failed", err);
    return { ok: false, message: "We could not send that just now. Please try again in a moment.", values };
  }
}
