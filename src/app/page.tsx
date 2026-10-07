import { getDb } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { readEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

// A simple branded welcome until the landing page entry builds the real one.
export default async function PublicHome() {
  const profile = await getProfile(await getDb(), readEnv().businessName);
  return (
    <main className="public flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
      <p className="font-label text-[11px] uppercase tracking-[0.3em] text-accent">Welcome</p>
      <h1 className="mt-6 max-w-3xl font-display text-5xl font-light leading-[0.95] tracking-tight sm:text-7xl">{profile.business}</h1>
      {profile.what_we_do && <p className="mt-6 max-w-xl text-lg text-ink-muted">{profile.what_we_do}</p>}
      <a
        href="/contact"
        className="mt-10 inline-flex rounded-full bg-highlight px-8 py-4 font-label text-[11px] uppercase tracking-[0.15em] text-on-highlight transition-transform duration-500 ease-breath hover:-translate-y-0.5"
      >
        Get in touch
      </a>
    </main>
  );
}
