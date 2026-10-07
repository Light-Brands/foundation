import { headers } from "next/headers";
import { ownHosts, sourceFields } from "@/lib/forms/source";
import { getDb } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { readEnv } from "@/lib/env";
import { CONTACT_FORM } from "@/lib/forms/public";
import { PublicForm } from "@/components/PublicForm";

export const dynamic = "force-dynamic";

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const profile = await getProfile(await getDb(), readEnv().businessName);
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
