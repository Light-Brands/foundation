import type { Db } from "@/lib/db/types";
import type { ContactInput } from "@/lib/validate";
import type { KindRegistry } from "@/lib/data/card-kinds";
import { allows, type Actor } from "@/lib/auth/roles";
import { writeCard } from "@/lib/data/cards";
import { registryFrom } from "@/lib/data/card-kinds";
import { CORE_CARD_KINDS } from "@/lib/key/core-kinds";
import type { SourceMeta } from "@/lib/forms/source";
import type { OutboxKind, OutboxStatus } from "@/lib/data/outbox";

const CORE_KINDS = registryFrom(CORE_CARD_KINDS);

export async function submitContact(db: Db, c: ContactInput, opts: { source?: SourceMeta; now?: Date } = {}): Promise<string> {
  // The writer creates or reuses the contact and the card in one statement. A public form never
  // rewrites a stored name or phone.
  const r = await writeCard(db, CORE_KINDS, {
    kind: "contact",
    title: `${c.name} sent a message`,
    body: c.message,
    contact: { name: c.name, email: c.email, phone: c.phone || undefined },
    meta: { ...(opts.source ?? { source: "direct" }) },
  }, opts.now);
  if (r.status !== "written") throw new Error("The contact card was not written.");
  return r.id;
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
  /** Every email drafted for this card, oldest first. Bodies are shown as plain text. */
  emails: CardEmail[];
};

export type CardEmail = { id: string; to: string; subject: string; body: string; status: OutboxStatus; kind: OutboxKind; send_after: string | null; note: string };

export async function listInbox(db: Db | null, limit = 50, opts: { status?: CardStatus } = {}): Promise<InboxItem[]> {
  if (!db) return [];
  return db.query<InboxItem>(
    `select i.id, i.kind, i.category, i.subcategory, i.title, i.body, i.status, i.always_human, i.decision,
            i.decided_at::text as decided_at, i.created_at::text as created_at,
            c.name as contact_name, c.email as contact_email,
            coalesce((select json_agg(json_build_object('id', o.id, 'to', o.to_email, 'subject', o.subject, 'body', o.body,
                                                        'status', o.status, 'kind', o.kind, 'send_after', o.send_after::text,
                                                        'note', case when o.status = 'failed' then o.last_error else '' end)
                                      order by o.created_at, o.id)
                        from outbox o where o.card_id = i.id), '[]'::json) as emails
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
  // The card and its drafted email move in one statement: an email is approved only by this yes, and
  // only while it is still a draft, so a draft the owner already stopped stays stopped.
  const [r] = await db.query<{ decided: number }>(
    `with d as (
       update inbox_items set status = 'decided', decision = $2, decided_at = $3, decided_by = $4
        where id = $1 and status = 'new' and decision is null and (not always_human or $5)
        returning id, decision
     ), o as (
       update outbox
          set status = case when d.decision = 'approve' then 'approved' else 'cancelled' end,
              approved_at = case when d.decision = 'approve' then $3::timestamptz else null end,
              updated_at = $3
         from d
        where outbox.card_id = d.id and outbox.status = 'draft'
        returning outbox.id
     )
     select (select count(*)::int from d) as decided, (select count(*)::int from o) as moved`,
    [input.cardId, input.decision, now, input.actor.id, input.actor.role === "owner"],
  );
  return { status: r.decided ? "decided" : "already_decided" };
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
