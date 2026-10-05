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
  { name: "timezone", label: "Time zone" },
  { name: "owner_name", label: "Your name" },
];
const MORE: Field[] = [
  { name: "how_we_sound", label: "How you sound" },
  { name: "short_name", label: "Short name" },
  { name: "owner_role", label: "Your role" },
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
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-50 px-3 py-2 text-zinc-100"
          />
          {state?.errors?.[f.name] && <span className="mt-1 block text-sm text-amber-200">{state.errors[f.name]}</span>}
        </label>
  );
  return (
    <form action={action} className="surface max-w-xl space-y-4 p-6">
      {FIELDS.map(renderField)}
      <details className="space-y-4">
        <summary className="kicker cursor-pointer">More about how you sound</summary>
        {MORE.map(renderField)}
      </details>
      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Saving" : "Save"}</button>
        <p role="status" className="text-sm text-mist">{state?.message}</p>
      </div>
    </form>
  );
}
