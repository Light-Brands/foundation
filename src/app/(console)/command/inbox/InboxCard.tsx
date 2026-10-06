import type { ReactNode } from "react";
import type { InboxItem } from "@/lib/data/inbox";
import type { HandSend } from "@/lib/data/hand-send";
import { formatCardTime } from "@/lib/time";
import { CardActions } from "./CardActions";
import { EmailDraft } from "./EmailDraft";

const STATUS_LABEL = { new: "", decided: "Decided, waiting for its job to finish", done: "Done" } as const;

export type InboxCardProps = {
  item: InboxItem;
  timezone: string;
  mode: "approve" | "done";
  routes: { kind: string; label: string }[];
  /** For every approved or failed email on the card: the text to copy, or why there is none. */
  handSend: ReadonlyMap<string, HandSend>;
  /** A line another job adds below the card, such as a suggestion. Shown after the card's own actions. */
  below?: ReactNode;
};

// One Inbox card: its title, time, sender, body, drafted email, status and actions, exactly as the Inbox shows it.
// A job that groups or annotates the Inbox renders every card through this, so no action is ever lost.
export function InboxCard({ item: i, timezone, mode, routes, handSend, below }: InboxCardProps) {
  return (
    <li className="surface p-4">
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
      <CardActions id={i.id} status={i.status} mode={mode} routes={routes} />
      {below}
    </li>
  );
}
