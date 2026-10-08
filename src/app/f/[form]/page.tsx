import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { loadProfile } from "@/lib/data/safe";
import { loadForms } from "@/lib/forms/public";
import { ownHosts, sourceFields } from "@/lib/forms/source";
import { formChoices, formReady, NOT_READY, type Choice } from "@/lib/forms/options";
import type { FormDecl } from "@/lib/key/declarations";
import { PublicForm } from "@/components/PublicForm";

export const dynamic = "force-dynamic";

/** The form's choices, or null when the database cannot be reached, so the page says the form is not ready. */
async function loadFormChoices(form: FormDecl): Promise<Record<string, Choice[]> | null> {
  try {
    return await formChoices(await getDb(), form);
  } catch (err) {
    console.error("public form: the database could not be reached", err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ form: string }> }): Promise<Metadata> {
  const { form: key } = await params;
  const [profile, forms] = await Promise.all([loadProfile(), loadForms()]);
  const form = key === "contact" ? undefined : forms.get(key);
  return { title: form ? `${form.title}, ${profile.business}` : profile.business };
}

export default async function PublicFormPage({ params, searchParams }: {
  params: Promise<{ form: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { form: key } = await params;
  const form = key === "contact" ? undefined : (await loadForms()).get(key);
  if (!form) notFound();
  const [profile, choices] = await Promise.all([loadProfile(), loadFormChoices(form)]);
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
      {choices && formReady(form, choices) ? <PublicForm form={form} source={source} choices={choices} /> : <p className="surface border-hairline bg-canvas-muted p-6 text-ink">{NOT_READY}</p>}
    </main>
  );
}
