import type { Db } from "@/lib/db/types";
import type { KindRegistry } from "@/lib/data/card-kinds";

// The one way to create a card. Called from server code and commands, never with a kind or a category
// taken from a request: the kind's declaration decides the department, the job, who may decide it and
// when it lapses.

export class UnknownCardKindError extends Error {
  constructor(kind: string) {
    super(`Card kind "${kind}" is not declared in the installed Key`);
    this.name = "UnknownCardKindError";
  }
}

export const CARD_LIMITS = { title: 200, body: 20_000, meta: 8_192, runKey: 200 } as const;

export type CardContact = { name: string; email: string; phone?: string };
export type CardInput = {
  kind: string;
  title: string;
  body?: string;
  contactId?: string | null;
  contact?: CardContact;
  sourceApp?: string | null;
  sourceId?: string | null;
  runKey?: string | null;
  meta?: Record<string, unknown>;
};
export type WriteResult = { status: "written"; id: string } | { status: "exists"; id: string | null };

const COLUMNS = "kind, category, subcategory, title, body, source_app, source_id, run_key, always_human, expires_at, meta, created_at, contact_id";
const CREATED = "coalesce($12::timestamptz, now())";
const EXPIRES = `case when $10::int is null then null else ${CREATED} + make_interval(days => $10::int) end`;

export async function writeCard(db: Db, kinds: KindRegistry, input: CardInput, now?: Date): Promise<WriteResult> {
  const k = kinds.get(input.kind);
  if (!k) throw new UnknownCardKindError(input.kind);
  const body = input.body ?? "";
  const meta = JSON.stringify(input.meta ?? {});
  const runKey = input.runKey ?? null;
  if (input.title.length < 1 || input.title.length > CARD_LIMITS.title) throw new RangeError("A card title is 1 to 200 characters.");
  if (body.length > CARD_LIMITS.body) throw new RangeError("A card body is at most 20,000 characters.");
  if (meta.length > CARD_LIMITS.meta) throw new RangeError("A card's details are at most 8 KB.");
  if (runKey !== null && (runKey.length < 1 || runKey.length > CARD_LIMITS.runKey)) throw new RangeError("A run key is 1 to 200 characters.");
  if (input.contact && input.contactId) throw new TypeError("Give a contact or a contact id, not both.");
  // With no clock given, the card takes the database's now(), and its expiry counts from that same instant,
  // so cards written one after another always sort in the order they were written.
  const values = [k.kind, k.category, k.subcategory, input.title, body, input.sourceApp ?? null, input.sourceId ?? null, runKey, k.always_human, k.expires_days, meta, now ?? null];
  const rows = input.contact
    ? await db.query<{ id: string }>(
        `with c as (
           insert into contacts (name, email, phone) values ($13, $14, $15)
           on conflict ((lower(email))) do update set email = contacts.email
           returning id
         )
         insert into inbox_items (${COLUMNS})
         select $1, $2, $3, $4, $5, $6, $7, $8, $9, ${EXPIRES}, $11::jsonb, ${CREATED}, c.id from c
         on conflict (kind, run_key) where run_key is not null do nothing
         returning id`,
        [...values, input.contact.name, input.contact.email, input.contact.phone ?? ""],
      )
    : await db.query<{ id: string }>(
        `insert into inbox_items (${COLUMNS})
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, ${EXPIRES}, $11::jsonb, ${CREATED}, $13)
         on conflict (kind, run_key) where run_key is not null do nothing
         returning id`,
        [...values, input.contactId ?? null],
      );
  if (rows[0]) return { status: "written", id: rows[0].id };
  const [existing] = await db.query<{ id: string }>("select id from inbox_items where kind = $1 and run_key = $2", [k.kind, runKey]);
  return { status: "exists", id: existing?.id ?? null };
}
