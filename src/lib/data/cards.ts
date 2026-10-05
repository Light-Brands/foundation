import type { Queryable } from "@/lib/db/types";
import type { KindRegistry } from "@/lib/data/card-kinds";

// The one way to create a card. Called from server code and commands, never with a kind or a category
// taken from a request: the kind's declaration decides the department, the job, who may decide it and
// when it lapses.

export class UnknownCardKindError extends Error {
  constructor(kind: string, registrySize = 1) {
    super(registrySize === 0
      ? `Card kind "${kind}" could not be checked, because the Key's declarations could not be read`
      : `Card kind "${kind}" is not declared in the installed Key`);
    this.name = "UnknownCardKindError";
  }
}

export const CARD_LIMITS = {
  title: 200, body: 20_000, meta: 8_192, runKey: 200,
  sourceApp: 200, sourceId: 200, contactName: 200, contactEmail: 320, contactPhone: 40,
} as const;

const SOURCE_SHAPE = /^[A-Za-z0-9][A-Za-z0-9_.:-]*$/;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUL = "\u0000";

function within(value: string, max: number, what: string): void {
  if (value.length < 1 || value.length > max) throw new RangeError(`${what} is 1 to ${max} characters.`);
}

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

export async function writeCard(db: Queryable, kinds: KindRegistry, input: CardInput, now?: Date): Promise<WriteResult> {
  const k = kinds.get(input.kind);
  if (!k) throw new UnknownCardKindError(input.kind, kinds.size);
  if (typeof input.title !== "string") throw new TypeError("A card title must be text.");
  const title = input.title.trim();
  const body = input.body ?? "";
  const meta = JSON.stringify(input.meta ?? {});
  const runKey = input.runKey ?? null;
  within(title, CARD_LIMITS.title, "A card title");
  if (body.length > CARD_LIMITS.body) throw new RangeError("A card body is at most 20,000 characters.");
  if (title.includes(NUL) || body.includes(NUL) || meta.includes("\\u0000")) throw new RangeError("A card holds no NUL characters.");
  if (meta.length > CARD_LIMITS.meta) throw new RangeError("A card's details are at most 8 KB.");
  if (runKey !== null) within(runKey, CARD_LIMITS.runKey, "A run key");
  if (input.sourceApp != null) {
    within(input.sourceApp, CARD_LIMITS.sourceApp, "A source app");
    if (!SOURCE_SHAPE.test(input.sourceApp)) throw new RangeError("A source app is a slug or an id, with no spaces.");
  }
  if (input.sourceId != null) {
    within(input.sourceId, CARD_LIMITS.sourceId, "A source id");
    if (!SOURCE_SHAPE.test(input.sourceId)) throw new RangeError("A source id is a slug or an id, with no spaces.");
  }
  if (input.contactId != null && !UUID_SHAPE.test(input.contactId)) throw new RangeError("A contact id is a UUID.");
  if (input.contact && input.contactId) throw new TypeError("Give a contact or a contact id, not both.");
  if (input.contact) {
    const { name, email, phone } = input.contact;
    within(name, CARD_LIMITS.contactName, "A contact name");
    within(email, CARD_LIMITS.contactEmail, "A contact email");
    if (!EMAIL_SHAPE.test(email)) throw new RangeError("A contact email needs the form name@example.com.");
    if (phone !== undefined) within(phone, CARD_LIMITS.contactPhone, "A contact phone number");
    if (name.includes(NUL) || email.includes(NUL) || (phone ?? "").includes(NUL)) throw new RangeError("A card holds no NUL characters.");
  }
  // With no clock given, the card takes the database's now(), and its expiry counts from that same instant,
  // so cards written one after another always sort in the order they were written.
  const values = [k.kind, k.category, k.subcategory, title, body, input.sourceApp ?? null, input.sourceId ?? null, runKey, k.always_human, k.expires_days, meta, now ?? null];
  // When a run key already has its card, the insert below is skipped, but the contact upsert still runs.
  // That is harmless: its conflict branch only sets email = contacts.email, so it never rewrites an existing contact.
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
