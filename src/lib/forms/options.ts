import type { Queryable } from "@/lib/db/types";
import type { FormDecl, OptionsFrom } from "@/lib/key/declarations";

// A select field may take its options from an app table (options_from in the Key). The options are the
// rows whose `where` field is true, valued by id and shown by `label`. They are read when the page
// renders and read again when the form saves, so a value must be the id of a row that is a choice now:
// an id a visitor made up, or one whose row closed after the page loaded, is refused.

export type Choice = { value: string; label: string };
export const CHOICES_MAX = 200;
export const CHOICE_LABEL_MAX = 120;

const IDENT = /^[a-z][a-z0-9_]*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** The SQL pieces for one options_from. The Key checker already held each name to a field the app declares. */
function parts(from: OptionsFrom): { table: string; label: string; open: string } {
  for (const n of [from.entity, from.label, from.where ?? "id"]) if (!IDENT.test(n)) throw new TypeError(`options_from name "${n}" is not a plain name`);
  const label = `"${from.label}"`;
  return { table: `"${from.entity}"`, label, open: `${from.where ? `"${from.where}" is true and ` : ""}${label} is not null and btrim(${label}::text) <> ''` };
}

const cap = (c: Choice): Choice => ({ value: c.value, label: c.label.trim().slice(0, CHOICE_LABEL_MAX) });

/** Today's choices, by label. */
export async function loadChoices(db: Queryable, from: OptionsFrom): Promise<Choice[]> {
  const { table, label, open } = parts(from);
  const rows = await db.query<Choice>(
    `select id::text as value, ${label}::text as label from ${table} where ${open} order by 2, 1 limit ${CHOICES_MAX}`,
  );
  return rows.map(cap);
}

/** The choice with this id when it is one today, or null. A value that is not an id is never looked up. */
export async function findChoice(db: Queryable, from: OptionsFrom, id: string): Promise<Choice | null> {
  if (!UUID.test(id)) return null;
  const { table, label, open } = parts(from);
  try {
    const rows = await db.query<Choice>(`select id::text as value, ${label}::text as label from ${table} where id = $1::uuid and ${open} limit 1`, [id]);
    return rows[0] ? cap(rows[0]) : null;
  } catch (err) {
    console.error(`options_from ${from.app}/${from.entity} could not be read: ${(err as Error).message.split("\n")[0]}`);
    return null;
  }
}

/** The choices for every options_from field of a form. With no database, or a table that cannot be read, a field has none. */
export async function formChoices(db: Queryable | null, form: FormDecl): Promise<Record<string, Choice[]>> {
  const out: Record<string, Choice[]> = {};
  for (const f of form.fields) {
    if (!f.options_from) continue;
    if (!db) { out[f.key] = []; continue; }
    try {
      out[f.key] = await loadChoices(db, f.options_from);
    } catch (err) {
      console.error(`options_from ${f.options_from.app}/${f.options_from.entity} could not be read: ${(err as Error).message.split("\n")[0]}`);
      out[f.key] = [];
    }
  }
  return out;
}

/** The line a form shows in place of its fields when it cannot be filled in yet. */
export const NOT_READY = "This form is not ready yet.";

/** False when a required options_from select has no choices it can show, so no visitor could send the form. */
export function formReady(form: FormDecl, choices: Record<string, Choice[]>): boolean {
  return form.fields.every((f) => !f.options_from || !f.required || (choices[f.key]?.length ?? 0) > 0);
}
