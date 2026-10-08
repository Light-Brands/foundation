import type { Metadata } from "next";
import { headers } from "next/headers";
import { ownHosts, sourceFields } from "@/lib/forms/source";
import { loadProfile } from "@/lib/data/safe";
import { CONTACT_FORM } from "@/lib/forms/public";
import { PublicForm } from "@/components/PublicForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await loadProfile();
  return { title: profile.business, description: `Get in touch with ${profile.business}. Send a message and you will hear back soon.` };
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const profile = await loadProfile();
  const h = await headers();
  // A visit from the business's own site is never a referral.
  const source = sourceFields(await searchParams, h.get("referer"), ownHosts(h.get("host"), profile.website));
  return (
    <main className="public mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 p-6">
      <div>
        <p className="kicker">Get in touch</p>
        <h1 className="mt-1 text-3xl text-ink">{profile.business}</h1>
        {profile.what_we_do && <p className="mt-2 text-ink-muted">{profile.what_we_do}</p>}
      </div>
      <PublicForm form={CONTACT_FORM} source={source} />
    </main>
  );
}
