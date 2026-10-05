"use client";
import { useActionState } from "react";
import { decideCardAction, markDoneAction, type CardActionResult } from "./actions";
import type { CardStatus } from "@/lib/data/inbox";

export function CardActions({ id, mode, status }: { id: string; mode: "approve" | "done"; status: CardStatus }) {
  const [decided, decide, deciding] = useActionState<CardActionResult | null, FormData>(decideCardAction, null);
  const [closed, close, closing] = useActionState<CardActionResult | null, FormData>(markDoneAction, null);
  const message = closed?.message ?? decided?.message;
  if (status === "done") return message ? <p role="status" className="mt-3 text-sm text-mist">{message}</p> : null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      {status === "new" && mode === "approve" ? (
        <form action={decide} className="flex gap-2">
          <input type="hidden" name="id" value={id} />
          <button type="submit" name="decision" value="approve" className="btn-primary" disabled={deciding}>Approve</button>
          <button type="submit" name="decision" value="decline" className="btn-quiet" disabled={deciding}>Decline</button>
        </form>
      ) : (
        <form action={close}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="btn-quiet" disabled={closing}>Mark done</button>
        </form>
      )}
      <p role="status" className="text-sm text-mist">{message}</p>
    </div>
  );
}
