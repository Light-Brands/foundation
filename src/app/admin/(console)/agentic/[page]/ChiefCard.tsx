"use client";
import { useActionState, useState } from "react";
import { saveProfileAction, type ActionResult } from "@/app/admin/(console)/system/settings/actions";

// The top of the Agents page: the name the owner gave their chief of staff, and a field to change it. It saves
// through the same action as Preferences, sending only this one field. Every copied prompt opens with the name.
export function ChiefCard({ name, saved }: { name: string; saved: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveProfileAction, null);
  const [value, setValue] = useState(saved);
  const error = state?.errors?.chief_name;
  // Save stays quiet until the field differs from the saved name.
  const changed = value.trim() !== saved.trim();
  return (
    <section data-chief className="surface rise mb-6 max-w-2xl p-card md:p-card-lg" style={{ "--i": 1 } as React.CSSProperties} aria-labelledby="chief-title">
      <h2 id="chief-title" className="kicker">Your chief of staff</h2>
      <p data-chief-name className="mt-2 font-heading text-2xl leading-tight text-admin-ink">{name}</p>
      <p className="mt-1 text-sm leading-relaxed text-admin-muted">Every prompt you copy opens with this name. Leave the field empty to use Claude.</p>
      <form action={action} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <input type="hidden" name="only" value="chief_name" />
        <label className="block min-w-0 flex-1">
          <span className="kicker">Change the name</span>
          <input
            name="chief_name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={40}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "chief-error" : undefined}
            placeholder="Claude"
            className="field mt-1 bg-admin-canvas"
          />
        </label>
        <button type="submit" className={changed ? "btn-primary" : "btn-quiet"} disabled={pending}>{pending ? "Saving" : "Save"}</button>
      </form>
      {error ? (
        <p id="chief-error" role="status" className="mt-2 text-sm text-warn">{error}</p>
      ) : (
        <p role="status" className="mt-2 min-h-5 text-sm text-admin-muted">{state?.message}</p>
      )}
    </section>
  );
}
