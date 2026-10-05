import type { Db } from "@/lib/db/types";
import type { ContactInput } from "@/lib/validate";
import type { KindRegistry } from "@/lib/data/card-kinds";
import { allows, type Actor } from "@/lib/auth/roles";

export async function submitContact(db: Db, c: ContactInput): Promise<string> {
  // One statement, so the contact and its message land together or not at all.
  // On an email match the stored name and phone are kept: a public form never rewrites a contact.
  const [item] = await db.query<{ id: string }>(
    `with c as (
       insert into contacts (name, email, phone) values ($1, $2, $5)
       on conflict ((lower(email))) do update set email = contacts.email
       returning id
     )
     insert into inbox_items (kind, category, subcategory, title, body, contact_id)
     select 'contact', 'command', 'inbox', $3, $4, c.id from c
     returning id`,
    [c.name, c.email, `${c.name} sent a message`, c.message, c.phone],
  );
  return item.id;
}

export type CardStatus = "new" | "decided" | "done";
export type Decision = "approve" | "decline";

export type InboxItem = {
  id: string;
  kind: string;
  category: string;
  subcategory: string;
  title: string;
  body: string;
  status: CardStatus;
  always_human: boolean;
  decision: Decision | null;
  decided_at: string | null;
  created_at: string;
  contact_name: string | null;
  contact_email: string | null;
};

export async function listInbox(db: Db | null, limit = 50, opts: { status?: CardStatus } = {}): Promise<InboxItem[]> {
  if (!db) return [];
  return db.query<InboxItem>(
    `select i.id, i.kind, i.category, i.subcategory, i.title, i.body, i.status, i.always_human, i.decision,
            i.decided_at::text as decided_at, i.created_at::text as created_at,
            c.name as contact_name, c.email as contact_email
       from inbox_items i left join contacts c on c.id = i.contact_id
      where ($2::text is null or i.status = $2)
      order by i.created_at desc, i.id desc
      limit $1`,
    [limit, opts.status ?? null],
  );
}

export async function countNewInbox(db: Db | null): Promise<number> {
  if (!db) return 0;
  const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from inbox_items where status = 'new'");
  return n;
}

type CardRow = { kind: string; category: string; status: CardStatus; always_human: boolean; decision: Decision | null };

async function cardRow(db: Db, id: string): Promise<CardRow | null> {
  const [row] = await db.query<CardRow>("select kind, category, status, always_human, decision from inbox_items where id = $1", [id]);
  return row ?? null;
}

export type DecideResult = { status: "decided" | "not_found" | "already_decided" | "not_decidable" | "owner_only" | "not_allowed" };

/** Records an approve or decline once. Only a kind declared with decide: approve takes one. */
export async function decideCard(db: Db, kinds: KindRegistry, input: { cardId: string; decision: Decision; actor: Actor }, now: Date): Promise<DecideResult> {
  const card = await cardRow(db, input.cardId);
  if (!card) return { status: "not_found" };
  if (kinds.get(card.kind)?.decide !== "approve") return { status: "not_decidable" };
  if (card.decision !== null || card.status !== "new") return { status: "already_decided" };
  if (card.always_human && !allows(input.actor, "owner")) return { status: "owner_only" };
  if (!allows(input.actor, "team", card.category)) return { status: "not_allowed" };
  const rows = await db.query<{ id: string }>(
    `update inbox_items set status = 'decided', decision = $2, decided_at = $3, decided_by = $4
      where id = $1 and status = 'new' and decision is null and (not always_human or $5)
      returning id`,
    [input.cardId, input.decision, now, input.actor.id, input.actor.role === "owner"],
  );
  return { status: rows.length ? "decided" : "already_decided" };
}

export type DoneResult = { status: "done" | "not_found" | "already_done" | "needs_decision" | "owner_only" | "not_allowed" };

/** A person closing a card: a done kind that is new, or any card already decided. */
export async function markCardDone(db: Db, kinds: KindRegistry, input: { cardId: string; actor: Actor }): Promise<DoneResult> {
  const card = await cardRow(db, input.cardId);
  if (!card) return { status: "not_found" };
  if (card.status === "done") return { status: "already_done" };
  if (card.status === "new" && kinds.get(card.kind)?.decide === "approve") return { status: "needs_decision" };
  if (card.always_human && !allows(input.actor, "owner")) return { status: "owner_only" };
  if (!allows(input.actor, "team", card.category)) return { status: "not_allowed" };
  const rows = await db.query<{ id: string }>("update inbox_items set status = 'done' where id = $1 and status <> 'done' returning id", [input.cardId]);
  return { status: rows.length ? "done" : "already_done" };
}

/** The owning job, after acting on a decided card. */
export async function completeCard(db: Db, cardId: string): Promise<boolean> {
  const rows = await db.query<{ id: string }>("update inbox_items set status = 'done' where id = $1 and status = 'decided' returning id", [cardId]);
  return rows.length === 1;
}
