"use client";
import { useActionState } from "react";
import { decideCardAction, markDoneAction, type CardActionResult } from "./actions";
import type { CardStatus } from "@/lib/data/inbox";

const BUTTON = "min-h-11";

export function CardActions({ id, mode, status }: { id: string; mode: "approve" | "done"; status: CardStatus }) {
  const [decided, decide, deciding] = useActionState<CardActionResult | null, FormData>(decideCardAction, null);
  const [closed, close, closing] = useActionState<CardActionResult | null, FormData>(markDoneAction, null);
  const result = closed ?? decided;
  const pending = deciding || closing;
  // Once a decision lands, the card's own status line says "Approved." or "Declined.", so the message would only repeat it.
  const repeated = result?.ok === true && status === "decided" && result === decided;
  const message = pending ? "Saving" : repeated ? "" : (result?.message ?? "");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      {status === "new" && mode === "approve" ? (
        <form action={decide} className="flex gap-2">
          <input type="hidden" name="id" value={id} />
          <button type="submit" name="decision" value="approve" className={`btn-primary ${BUTTON}`} disabled={pending}>Approve</button>
          <button type="submit" name="decision" value="decline" className={`btn-quiet ${BUTTON}`} disabled={pending}>Decline</button>
        </form>
      ) : status !== "done" ? (
        <form action={close}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className={`btn-quiet ${BUTTON}`} disabled={pending}>Mark done</button>
        </form>
      ) : null}
      <p role="status" className={`text-sm ${result && !result.ok && !pending ? "text-amber-200" : "text-mist"}`}>{message}</p>
    </div>
  );
}
