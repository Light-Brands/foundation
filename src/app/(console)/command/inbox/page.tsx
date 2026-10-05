import Link from "next/link";
import { getDb, storageMode } from "@/lib/db";
import { listInbox } from "@/lib/data/inbox";
import { getProfile } from "@/lib/data/profile";
import { readEnv } from "@/lib/env";
import { formatCardTime } from "@/lib/time";
import { PromptBox } from "@/components/PromptBox";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { CardActions } from "./CardActions";
import { EmailDraft } from "./EmailDraft";
import { handSendContext, handSendFor, type HandSend } from "@/lib/data/hand-send";

const STATUS_LABEL = { new: "", decided: "Decided, waiting for its job to finish", done: "Done" } as const;

export default async function InboxPage() {
  const db = await getDb();
  const items = await listInbox(db);
  const kinds = await loadCardKinds();
  const env = readEnv();
  const { timezone } = await getProfile(db, env.businessName);
  // For every approved or failed email: the text the owner copies to send by hand, or why there is none.
  const ctx = await handSendContext(db);
  const handSend = new Map<string, HandSend>();
  for (const i of items) for (const e of i.emails) handSend.set(e.id, await handSendFor(db, e, ctx));
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">Command center · Handle what needs you</p>
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
                <p className="font-mono text-xs text-mist">{formatCardTime(i.created_at, timezone)}</p>
              </div>
              {i.contact_email && <p className="text-sm text-mist">{i.contact_email}</p>}
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{i.body}</p>
              {i.emails.map((e) => (
                <EmailDraft key={e.id} email={e} sendAfter={e.send_after ? formatCardTime(e.send_after, timezone) : null} handSend={handSend.get(e.id) ?? { copyText: null, reason: null }} />
              ))}
              {i.status !== "new" && (
                <p className="mt-2 text-xs text-mist">
                  {i.decision === "approve" ? "Approved. " : i.decision === "decline" ? "Declined. " : ""}{STATUS_LABEL[i.status]}
                </p>
              )}
              {i.always_human && i.status === "new" && <p className="mt-2 text-xs text-amber-200">Only the owner decides this one.</p>}
              <CardActions id={i.id} status={i.status} mode={kinds.get(i.kind)?.decide ?? "done"} routes={i.kind === "contact" ? [...kinds.values()].filter((k) => k.source !== "core" && k.decide === "done").map((k) => ({ kind: k.kind, label: k.label })) : []} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
