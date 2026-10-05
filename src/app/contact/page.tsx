import { getDb } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { readEnv } from "@/lib/env";
import { ContactForm } from "./ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const profile = await getProfile(await getDb(), readEnv().businessName);
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 p-6">
      <div>
        <p className="kicker">Get in touch</p>
        <h1 className="mt-1 text-3xl text-zinc-50">{profile.business}</h1>
        {profile.what_we_do && <p className="mt-2 text-mist">{profile.what_we_do}</p>}
      </div>
      <ContactForm />
    </main>
  );
}
