"use client";
import { useActionState } from "react";
import { submitFormAction, type FormResult } from "@/app/f/actions";
import type { FormDecl, FormField } from "@/lib/key/declarations";

const INPUT = "mt-1 w-full rounded-xl border border-white/10 bg-ink-50 px-3 py-2";
const TYPE: Partial<Record<FormField["type"], string>> = { text: "text", email: "email", phone: "tel", date: "date", number: "text" };

export function PublicForm({ form, source }: { form: FormDecl; source: Record<string, string> }) {
  const [state, action, pending] = useActionState<FormResult | null, FormData>(submitFormAction, null);
  if (state?.ok) return <p role="status" className="surface p-6 text-zinc-100">{state.message}</p>;
  const keyFor = (k: string) => `${k}-${state?.values ? "v" : "p"}-${state?.values?.[k] ?? ""}`;
  const value = (k: string) => state?.values?.[k] ?? "";
  return (
    <form action={action} className="surface relative space-y-4 p-6">
      <input type="hidden" name="_form" value={form.key} />
      {Object.entries(source).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {form.fields.map((f) => (
        <label key={f.key} className="block">
          <span className="kicker">{f.required ? f.label : `${f.label} (optional)`}</span>
          {f.type === "long_text" ? (
            <textarea key={keyFor(f.key)} name={f.key} required={f.required} maxLength={f.max} rows={5} defaultValue={value(f.key)} className={INPUT} />
          ) : f.type === "select" ? (
            <select key={keyFor(f.key)} name={f.key} required={f.required} defaultValue={value(f.key)} className={INPUT}>
              <option value="">Choose one</option>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.type === "checkbox" ? (
            <input key={keyFor(f.key)} name={f.key} type="checkbox" value="yes" defaultChecked={value(f.key) === "yes"} className="ml-2" />
          ) : (
            <input key={keyFor(f.key)} name={f.key} type={TYPE[f.type] ?? "text"} inputMode={f.type === "number" ? "decimal" : undefined} required={f.required} maxLength={f.max} defaultValue={value(f.key)} className={INPUT} />
          )}
          {state?.errors?.[f.key] && <span className="text-sm text-amber-200">{state.errors[f.key]}</span>}
        </label>
      ))}
      <div aria-hidden="true" className="absolute left-[-10000px]">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Sending" : form.submit}</button>
        <p role="status" className="text-sm text-mist">{state?.message}</p>
      </div>
    </form>
  );
}
