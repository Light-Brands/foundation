"use client";
import { useActionState } from "react";
import { saveProfileAction, type ActionResult } from "./actions";
import type { Profile } from "@/lib/validate";

type Field = { name: keyof Profile; label: string; type?: string };
const FIELDS: Field[] = [
  { name: "business", label: "Business name" },
  { name: "what_we_do", label: "What you do, in one line" },
  { name: "who_we_serve", label: "Who you serve" },
  { name: "email", label: "Business email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "website", label: "Website" },
  { name: "city", label: "City" },
  { name: "postal_address", label: "Postal address, shown at the foot of marketing email" },
  { name: "timezone", label: "Time zone" },
  { name: "work_days", label: "Working days, such as mon, tue, wed, thu, fri" },
  { name: "work_start", label: "Opening time", type: "time" },
  { name: "work_end", label: "Closing time", type: "time" },
  { name: "owner_name", label: "Your name" },
];
const MORE: Field[] = [
  { name: "how_we_sound", label: "How you sound" },
  { name: "short_name", label: "Short name" },
  { name: "owner_role", label: "Your role" },
  { name: "owner_first", label: "What people call you" },
];

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveProfileAction, null);
  const renderField = (f: Field) => (
        <label key={f.name} className="block">
          <span className="kicker">{f.label}</span>
          <input
            key={`${f.name}-${state?.values ? "v" : "p"}-${JSON.stringify(state?.values?.[f.name] ?? "")}`}
            name={f.name}
            type={f.type ?? "text"}
            defaultValue={state?.values?.[f.name] ?? profile[f.name]}
            className="mt-1 w-full rounded-xl border border-admin-line-strong bg-admin-canvas px-3 py-2 text-admin-ink"
          />
          {state?.errors?.[f.name] && <span className="mt-1 block text-sm text-warn">{state.errors[f.name]}</span>}
        </label>
  );
  return (
    <form action={action} className="surface max-w-xl space-y-4 p-6">
      {FIELDS.map(renderField)}
      <details className="space-y-4" open={MORE.some((f) => state?.errors?.[f.name]) || undefined}>
        <summary className="kicker cursor-pointer">More about how you sound</summary>
        {MORE.map(renderField)}
      </details>
      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Saving" : "Save"}</button>
        <p role="status" className="text-sm text-admin-muted">{state?.message}</p>
      </div>
    </form>
  );
}
