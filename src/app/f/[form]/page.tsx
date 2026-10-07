import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { readEnv } from "@/lib/env";
import { loadForms } from "@/lib/forms/public";
import { ownHosts, sourceFields } from "@/lib/forms/source";
import { formChoices, formReady, NOT_READY } from "@/lib/forms/options";
import { PublicForm } from "@/components/PublicForm";

export const dynamic = "force-dynamic";

export default async function PublicFormPage({ params, searchParams }: {
  params: Promise<{ form: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { form: key } = await params;
  const form = key === "contact" ? undefined : (await loadForms()).get(key);
  if (!form) notFound();
  const db = await getDb();
  const profile = await getProfile(db, readEnv().businessName);
  const choices = await formChoices(db, form);
  const h = await headers();
  // A visit from the business's own site is never a referral.
  const source = sourceFields(await searchParams, h.get("referer"), ownHosts(h.get("host"), profile.website));
  return (
    <main className="public mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 p-6">
      <div>
        <p className="kicker">{profile.business}</p>
        <h1 className="mt-1 text-3xl text-ink">{form.title}</h1>
        {form.intro && <p className="mt-2 text-ink-muted">{form.intro}</p>}
      </div>
      {formReady(form, choices) ? <PublicForm form={form} source={source} choices={choices} /> : <p className="surface border-hairline bg-canvas-muted p-6 text-ink">{NOT_READY}</p>}
    </main>
  );
}
