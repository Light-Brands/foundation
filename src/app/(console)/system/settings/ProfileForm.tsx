"use client";
import { useActionState } from "react";
import { saveProfileAction, type ActionResult } from "./actions";
import type { Profile } from "@/lib/validate";

const FIELDS: { name: keyof Profile; label: string; type?: string }[] = [
  { name: "business_name", label: "Business name" },
  { name: "tagline", label: "What you do, in one line" },
  { name: "email", label: "Business email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "website", label: "Website" },
];

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveProfileAction, null);
  return (
    <form action={action} className="surface max-w-xl space-y-4 p-6">
      {FIELDS.map((f) => (
        <label key={f.name} className="block">
          <span className="kicker">{f.label}</span>
          <input
            key={`${f.name}-${state?.values ? "v" : "p"}-${JSON.stringify(state?.values?.[f.name] ?? "")}`}
            name={f.name}
            type={f.type ?? "text"}
            defaultValue={state?.values?.[f.name] ?? profile[f.name]}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-50 px-3 py-2 text-zinc-100"
          />
          {state?.errors?.[f.name] && <span className="mt-1 block text-sm text-amber-200">{state.errors[f.name]}</span>}
        </label>
      ))}
      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Saving" : "Save"}</button>
        <p role="status" className="text-sm text-mist">{state?.message}</p>
      </div>
    </form>
  );
}
