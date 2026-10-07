"use client";
import { useActionState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { cancelEmailAction, markCopiedAction, markSentByHandAction, type CardActionResult } from "./actions";
import type { CardEmail } from "@/lib/data/inbox";
import type { OutboxStatus } from "@/lib/data/outbox";
import type { HandSend } from "@/lib/data/hand-send";
import { handSendNote } from "@/lib/hand-send-notes";

const BUTTON = "min-h-11";
const STATUS: Record<OutboxStatus, string> = {
  draft: "Drafted. It waits for your decision on this card.",
  approved: "Approved. Copy it and send it from your email, then mark it sent.",
  sending: "Sending now.",
  sent: "Sent.",
  failed: "Not sent.",
  cancelled: "Not sent. It was stopped.",
};

// A drafted email on its card. The body is customer-facing text written by a job, shown as plain text only.
export function EmailDraft({ email, sendAfter, handSend }: { email: CardEmail; sendAfter: string | null; handSend: HandSend }) {
  const { copyText } = handSend;
  const note = handSendNote(handSend.reason);
  const [marked, mark, marking] = useActionState<CardActionResult | null, FormData>(markSentByHandAction, null);
  const [stopped, stop, stopping] = useActionState<CardActionResult | null, FormData>(cancelEmailAction, null);
  const pending = marking || stopping;
  const result = stopped ?? marked;
  const canSendByHand = (email.status === "approved" || email.status === "failed") && copyText !== null;
  const canStop = email.status === "draft" || email.status === "approved";
  return (
    <div className="mt-3 rounded-xl border border-admin-line-strong p-3">
      <p className="kicker">{email.kind === "marketing" ? "Marketing email" : "Email"} to {email.to}</p>
      <p className="mt-1 text-sm text-admin-ink">{email.subject}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-admin-muted">{email.body}</p>
      <p className="mt-2 text-xs text-admin-muted">{email.status === "approved" && copyText === null ? "Approved." : STATUS[email.status]}{email.note ? ` ${email.note}` : ""}</p>
      {email.status === "approved" && email.copied && <p className="mt-1 text-xs text-admin-muted">Copied. It waits for you to mark it sent, and is never sent on its own.</p>}
      {sendAfter && (email.status === "draft" || email.status === "approved") && <p className="mt-1 text-xs text-admin-muted">Goes out after {sendAfter}.</p>}
      {note && <p className="mt-1 text-xs text-admin-muted">{note}</p>}
      {(canSendByHand || canStop) && (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {canSendByHand && <CopyButton text={copyText} label="Copy email" before={email.status === "approved" ? () => markCopiedAction(email.id) : undefined} />}
          {canSendByHand && (
            <form action={mark}>
              <input type="hidden" name="id" value={email.id} />
              <button type="submit" className={`btn-quiet ${BUTTON}`} disabled={pending}>I sent it</button>
            </form>
          )}
          {canStop && (
            <form action={stop}>
              <input type="hidden" name="id" value={email.id} />
              <button type="submit" className={`btn-quiet ${BUTTON}`} disabled={pending}>Do not send</button>
            </form>
          )}
          <p role="status" className="text-sm text-admin-muted">{pending ? "Saving" : (result?.message ?? "")}</p>
        </div>
      )}
    </div>
  );
}
