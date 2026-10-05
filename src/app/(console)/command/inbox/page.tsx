import Link from "next/link";
import { getDb, storageMode } from "@/lib/db";
import { listInbox } from "@/lib/data/inbox";
import { PromptBox } from "@/components/PromptBox";

export default async function InboxPage() {
  const items = await listInbox(await getDb());
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Command · Inbox</p>
        <h1 className="mt-1 text-3xl text-zinc-50">Inbox</h1>
        <p className="mt-2 text-mist">Every message and every decision from every part of your business lands here.</p>
      </div>
      {items.length === 0 ? (
        <div className="space-y-4">
          {storageMode() === "preview" ? (
            <p className="text-mist">
              Your contact page starts taking messages once your database is connected.{" "}
              <Link href="/system/setup" className="text-zinc-200 underline">Open setup</Link>
            </p>
          ) : (
            <p className="text-mist">Nothing yet. Your public contact page is at <code className="font-mono text-zinc-200">/contact</code>. Share it and the first message arrives here.</p>
          )}
          <PromptBox name="first-session" title="Ask Claude what to do next" />
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.id} className="surface p-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-zinc-100">{i.title}</p>
                <p className="font-mono text-xs text-mist">{new Date(i.created_at).toLocaleString("en-US")}</p>
              </div>
              {i.contact_email && <p className="text-sm text-mist">{i.contact_email}</p>}
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{i.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
