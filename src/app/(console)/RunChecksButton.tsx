"use client";
import { useActionState } from "react";
import { runChecksAction, type ChecksResult } from "./actions";

export function RunChecksButton() {
  const [state, action, pending] = useActionState<ChecksResult | null, FormData>(runChecksAction, null);
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <button type="submit" className="btn-quiet" disabled={pending}>{pending ? "Running" : "Run today's checks"}</button>
      <p role="status" className="text-sm text-admin-muted">{state?.message}</p>
    </form>
  );
}
