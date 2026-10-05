import type { Db } from "@/lib/db/types";
import type { KindRegistry } from "@/lib/data/card-kinds";
import { URL_MAX, type FormDecl, type FormField } from "@/lib/key/declarations";
import { loadDeclarations } from "@/lib/key/load";
import { writeCard, CARD_LIMITS } from "@/lib/data/cards";
import { captureSource, type SourceMeta } from "@/lib/forms/source";
import { clientHash, takeFormSlot } from "@/lib/forms/limit";
import { cleanPhone, EMAIL } from "@/lib/validate";
import { findChoice } from "@/lib/forms/options";

// The one way a visitor's form becomes a record. It only inserts: a new card, and a contact created
// or reused by email and never rewritten. Text a visitor sends is data, shown as plain text.

export const HONEYPOT = "website";
export const BODY_MAX = 16_384;

export const CONTACT_FORM: FormDecl = {
  key: "contact",
  title: "a message",
  intro: "",
  submit: "Send",
  thanks: "Thank you. Your message is in, and you will hear back soon.",
  card_kind: "contact",
  source: "core",
  contact: true,
  fields: [
    { key: "name", label: "Your name", type: "text", required: true, max: 120, options: [] },
    { key: "email", label: "Email", type: "email", required: true, max: 254, options: [] },
    { key: "phone", label: "Phone", type: "phone", required: false, max: 40, options: [] },
    { key: "message", label: "Message", type: "long_text", required: true, max: 4000, options: [] },
  ],
};

const CONTACT_KEYS = new Set(["name", "email", "phone"]);

export async function loadForms(root?: string): Promise<ReadonlyMap<string, FormDecl>> {
  const { forms } = await loadDeclarations(root);
  return new Map([["contact", CONTACT_FORM], ...forms.map((f) => [f.key, f] as const)]);
}

export type Submission =
  | { ok: true; answers: Record<string, string>; contact: { name: string; email: string; phone: string }; source: SourceMeta }
  | { ok: false; bot: true }
  | { ok: false; errors: Record<string, string> };

const PICK = "Pick one of the choices.";
const LINK = "Use a link that starts with https://.";

/** One https address with a host and no user name or password in it. Length is checked against the field's max first. */
function httpsLink(v: string): boolean {
  if (/\s/.test(v)) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && u.hostname !== "" && u.username === "" && u.password === "";
  } catch {
    return false;
  }
}

const realDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;

function fieldError(f: FormField, v: string): string | null {
  if (v.length > f.max) return `Keep this under ${f.max} characters.`;
  if (f.type === "email" && !EMAIL.test(v)) return "Add an email we can reply to.";
  if (f.type === "phone") { const p = cleanPhone(v); return p.ok ? null : p.error; }
  if (f.type === "date" && !realDate(v)) return "Use a date like 2026-10-05.";
  if (f.type === "number" && !/^-?\d+(\.\d+)?$/.test(v)) return "Use a number.";
  if (f.type === "url" && (v.length > URL_MAX || !httpsLink(v))) return LINK;
  // An options_from select is checked against its table in submitPublicForm, which has the database.
  if (f.type === "select" && !f.options_from && !f.options.includes(v)) return PICK;
  return null;
}

export function readSubmission(form: FormDecl, data: Record<string, unknown>): Submission {
  const s = (k: string) => (typeof data[k] === "string" ? (data[k] as string) : "");
  if (s(HONEYPOT).trim() !== "") return { ok: false, bot: true };
  const total = Object.values(data).reduce<number>((n, v) => n + (typeof v === "string" ? v.length : 0), 0);
  if (total > BODY_MAX) return { ok: false, errors: { _form: "That is more than this form can take. Please shorten it." } };
  const answers: Record<string, string> = {};
  const errors: Record<string, string> = {};
  for (const f of form.fields) {
    // Control characters (NUL among them) never reach the database. Tabs and line breaks stay.
    let v = s(f.key).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
    if (f.type === "phone") v = v.replace(/\s+/g, " ");
    if (f.type === "checkbox") v = v ? "yes" : "";
    if (!v) {
      if (f.required) errors[f.key] = f.key === "name" ? "Add your name (up to 120 characters)." : f.key === "email" ? "Add an email we can reply to." : "Please fill this in.";
      answers[f.key] = "";
      continue;
    }
    const e = fieldError(f, v);
    if (e) errors[f.key] = e;
    else answers[f.key] = v;
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, answers, contact: { name: answers.name, email: answers.email, phone: answers.phone ?? "" }, source: captureSource(data) };
}

function cardText(form: FormDecl, answers: Record<string, string>): { title: string; body: string } {
  const name = answers.name.slice(0, 120);
  const title = form.key === "contact" ? `${name} sent a message` : `${name}: ${form.title}`.slice(0, CARD_LIMITS.title);
  // With contact: false there is no contact to hold the name, email and phone, so the card carries them.
  const rest = form.fields.filter((f) => (form.contact === false || !CONTACT_KEYS.has(f.key)) && answers[f.key]);
  const body = rest.length === 1 ? answers[rest[0].key] : rest.map((f) => `${f.label}: ${answers[f.key]}`).join("\n");
  return { title, body: body.slice(0, CARD_LIMITS.body) };
}

export type SubmitOutcome =
  | { status: "saved"; cardId: string }
  | { status: "discarded" }
  | { status: "limited" }
  | { status: "preview" }
  | { status: "not_found" }
  | { status: "invalid"; errors: Record<string, string> };

export async function submitPublicForm(
  deps: { db: Db | null; kinds: KindRegistry; forms: ReadonlyMap<string, FormDecl>; secret: string },
  input: { formKey: string; data: Record<string, unknown>; clientKey: string },
  now: Date,
): Promise<SubmitOutcome> {
  const form = deps.forms.get(input.formKey);
  if (!form) return { status: "not_found" };
  const sub = readSubmission(form, input.data);
  if (!sub.ok) return "bot" in sub ? { status: "discarded" } : { status: "invalid", errors: sub.errors };
  if (!deps.db) return { status: "preview" };
  // A choice read from an app table is checked against today's rows, so a forged or stale id is refused.
  const picked: Record<string, string> = {};
  const errors: Record<string, string> = {};
  for (const f of form.fields) {
    if (!f.options_from || !sub.answers[f.key]) continue;
    const choice = await findChoice(deps.db, f.options_from, sub.answers[f.key]);
    if (!choice) { errors[f.key] = PICK; continue; }
    picked[f.key] = choice.value;
    sub.answers[f.key] = choice.label;
  }
  if (Object.keys(errors).length) return { status: "invalid", errors };
  const keyHash = await clientHash(form.key, input.clientKey, deps.secret);
  if (!(await takeFormSlot(deps.db, { form: form.key, keyHash }, now))) return { status: "limited" };
  const { title, body } = cardText(form, sub.answers);
  const r = await writeCard(deps.db, deps.kinds, {
    kind: form.card_kind, title, body,
    // An empty phone stays off the contact, because the card writer refuses an empty one. A form declared
    // contact: false writes no contact at all: the card's body holds the name and email.
    ...(form.contact === false ? {} : { contact: { name: sub.contact.name, email: sub.contact.email, ...(sub.contact.phone ? { phone: sub.contact.phone } : {}) } }),
    sourceApp: form.source === "core" ? null : form.source,
    meta: { form: form.key, ...sub.source, ...(Object.keys(picked).length ? { picked } : {}) },
  }, now);
  if (r.status !== "written") throw new Error("The form's card was not written.");
  return { status: "saved", cardId: r.id };
}
