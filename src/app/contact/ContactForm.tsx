"use client";
import { useActionState } from "react";
import { contactAction, type ContactResult } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactResult | null, FormData>(contactAction, null);
  if (state?.ok) return <p role="status" className="surface p-6 text-zinc-100">{state.message}</p>;
  const keyFor = (k: "name" | "email" | "message") => `${k}-${state?.values ? "v" : "p"}-${state?.values?.[k] ?? ""}`;
  return (
    <form action={action} className="surface relative space-y-4 p-6">
      <label className="block">
        <span className="kicker">Your name</span>
        <input key={keyFor("name")} name="name" required maxLength={120} defaultValue={state?.values?.name ?? ""} className="mt-1 w-full rounded-xl border border-white/10 bg-ink-50 px-3 py-2" />
        {state?.errors?.name && <span className="text-sm text-amber-200">{state.errors.name}</span>}
      </label>
      <label className="block">
        <span className="kicker">Email</span>
        <input key={keyFor("email")} name="email" type="email" required maxLength={254} defaultValue={state?.values?.email ?? ""} className="mt-1 w-full rounded-xl border border-white/10 bg-ink-50 px-3 py-2" />
        {state?.errors?.email && <span className="text-sm text-amber-200">{state.errors.email}</span>}
      </label>
      <label className="block">
        <span className="kicker">Message</span>
        <textarea key={keyFor("message")} name="message" required maxLength={4000} rows={5} defaultValue={state?.values?.message ?? ""} className="mt-1 w-full rounded-xl border border-white/10 bg-ink-50 px-3 py-2" />
        {state?.errors?.message && <span className="text-sm text-amber-200">{state.errors.message}</span>}
      </label>
      <div aria-hidden="true" className="absolute left-[-10000px]">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Sending" : "Send"}</button>
        <p role="status" className="text-sm text-mist">{state?.message}</p>
      </div>
    </form>
  );
}
