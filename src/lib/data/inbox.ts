import type { Db } from "@/lib/db/types";
import type { ContactInput } from "@/lib/validate";

export type InboxItem = {
  id: string;
  kind: string;
  category: string;
  subcategory: string;
  title: string;
  body: string;
  status: "new" | "done";
  created_at: string;
  contact_name: string | null;
  contact_email: string | null;
};

export async function submitContact(db: Db, c: ContactInput): Promise<string> {
  const [contact] = await db.query<{ id: string }>(
    `insert into contacts (name, email) values ($1, $2)
     on conflict ((lower(email))) do update set name = excluded.name
     returning id`,
    [c.name, c.email],
  );
  const [item] = await db.query<{ id: string }>(
    `insert into inbox_items (kind, category, subcategory, title, body, contact_id)
     values ('contact', 'command', 'inbox', $1, $2, $3) returning id`,
    [`${c.name} sent a message`, c.message, contact.id],
  );
  return item.id;
}

export async function listInbox(db: Db | null, limit = 50): Promise<InboxItem[]> {
  if (!db) return [];
  return db.query<InboxItem>(
    `select i.id, i.kind, i.category, i.subcategory, i.title, i.body, i.status, i.created_at::text as created_at,
            c.name as contact_name, c.email as contact_email
       from inbox_items i left join contacts c on c.id = i.contact_id
      order by i.created_at desc, i.id desc
      limit $1`,
    [limit],
  );
}

export async function countNewInbox(db: Db | null): Promise<number> {
  if (!db) return 0;
  const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from inbox_items where status = 'new'");
  return n;
}
