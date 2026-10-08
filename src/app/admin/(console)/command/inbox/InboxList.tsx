import { PREVIEW_INBOX_LINE } from "@/lib/setup/preview";
import Link from "next/link";
import { getDb, storageMode } from "@/lib/db";
import { listInbox } from "@/lib/data/inbox";
import { PromptBox } from "@/components/PromptBox";
import { EmptyState } from "@/components/frame/EmptyState";
import { InboxCard } from "./InboxCard";
import { inboxCardProps } from "./card-props";

// The Foundation's Inbox list: the 50 newest cards, newest first, each through InboxCard, or the empty state.
// The Inbox page shows it as one element, <InboxList />, so a job can swap it for its own list in one line.
export async function InboxList() {
  const db = await getDb();
  const items = await listInbox(db);
  if (items.length === 0) {
    return (
      <div className="max-w-4xl space-y-4">
        {storageMode() === "preview" ? (
          <p className="text-admin-muted">
            {PREVIEW_INBOX_LINE}{" "}
            <Link href="/admin/system/setup" className="text-admin-ink underline">Open setup</Link>
          </p>
        ) : (
          <EmptyState
            kicker="All clear"
            title="New messages and decisions land here."
            body={<>Your public contact page is at <code className="font-mono text-admin-ink">/contact</code>. Share it and the first message arrives here.</>}
            action={<a href="/contact" target="_blank" rel="noreferrer" className="btn-primary">Open my contact page</a>}
          />
        )}
        <PromptBox name="first-session" title="Ask Claude what to do next" />
      </div>
    );
  }
  const propsFor = await inboxCardProps(db, items);
  return (
    <ul className="max-w-4xl space-y-3">
      {items.map((i) => <InboxCard key={i.id} {...propsFor(i)} />)}
    </ul>
  );
}
