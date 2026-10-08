"use client";
import { useActionState } from "react";
import { runChecksAction, type ChecksResult } from "./actions";

export function RunChecksButton() {
  const [state, action, pending] = useActionState<ChecksResult | null, FormData>(runChecksAction, null);
  return (
    <form action={action} className="flex items-center gap-3">
      <p role="status" className={`text-xs empty:hidden ${state && !state.ok ? "text-bad" : "text-admin-muted"}`}>{state?.message}</p>
      <button type="submit" className="btn-quiet btn-sm shrink-0" disabled={pending}>{pending ? "Running" : "Run today's checks"}</button>
    </form>
  );
}
