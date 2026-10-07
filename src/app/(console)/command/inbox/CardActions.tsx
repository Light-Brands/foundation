"use client";
import { useActionState } from "react";
import { decideCardAction, markDoneAction, routeCardAction, type CardActionResult } from "./actions";
import type { CardStatus } from "@/lib/data/inbox";

const BUTTON = "min-h-11";

export function CardActions({ id, mode, status, routes = [] }: { id: string; mode: "approve" | "done"; status: CardStatus; routes?: { kind: string; label: string }[] }) {
  const [decided, decide, deciding] = useActionState<CardActionResult | null, FormData>(decideCardAction, null);
  const [closed, close, closing] = useActionState<CardActionResult | null, FormData>(markDoneAction, null);
  const [moved, route, routing] = useActionState<CardActionResult | null, FormData>(routeCardAction, null);
  const result = moved ?? closed ?? decided;
  const pending = deciding || closing || routing;
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
      {status === "new" && routes.length > 0 && (
        <form action={route} className="flex gap-2">
          <input type="hidden" name="id" value={id} />
          <label className="sr-only" htmlFor={`to-${id}`}>Move to</label>
          <select id={`to-${id}`} name="to" className="rounded-xl border border-admin-line-strong bg-admin-canvas px-3 py-2 text-sm text-admin-ink">
            {routes.map((r) => <option key={r.kind} value={r.kind}>{r.label}</option>)}
          </select>
          <button type="submit" className={`btn-quiet ${BUTTON}`} disabled={pending}>Move</button>
        </form>
      )}
      <p role="status" className={`text-sm ${result && !result.ok && !pending ? "text-warn" : "text-admin-muted"}`}>{message}</p>
    </div>
  );
}
