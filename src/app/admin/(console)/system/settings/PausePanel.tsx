"use client";
import { useActionState } from "react";
import { pauseAction, type PauseResult } from "./actions";
import type { PauseState } from "@/lib/data/pause";

export function PausePanel({ state: initial }: { state: PauseState }) {
  const [state, action, pending] = useActionState<PauseResult | null, FormData>(pauseAction, null);
  const paused = state?.ok ? state.paused : initial.paused;
  return (
    <form action={action} className="surface max-w-xl space-y-3 p-6">
      <p className="kicker">Pause routines</p>
      <p className="text-sm text-admin-muted">
        {paused
          ? `Routines are paused.${initial.reason ? ` Reason: ${initial.reason}.` : ""} Checks and drafting wait. Your public pages still take messages.`
          : "Routines are running. Pause them to stop every check and drafting routine at once. Your public pages still take messages."}
      </p>
      <input type="hidden" name="paused" value={paused ? "off" : "on"} />
      {!paused && (
        <label className="block">
          <span className="kicker">Why (optional)</span>
          <input name="reason" maxLength={200} className="mt-1 w-full rounded-xl border border-admin-line-strong bg-admin-canvas px-3 py-2 text-admin-ink" />
        </label>
      )}
      <div className="flex items-center gap-4">
        <button type="submit" className={paused ? "btn-primary" : "btn-quiet"} disabled={pending}>
          {paused ? "Turn routines back on" : "Pause routines"}
        </button>
        {/* aria-live, not role="status": the profile form above owns the page's one status role, which the first-win e2e test reads. */}
        <p aria-live="polite" data-testid="pause-status" className="text-sm text-admin-muted">{state?.message}</p>
      </div>
    </form>
  );
}
