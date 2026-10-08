import type { Metadata } from "next";
import { loadProfile } from "@/lib/data/safe";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await loadProfile();
  return { title: profile.business, description: profile.what_we_do || `Welcome to ${profile.business}.` };
}

// A simple branded welcome until the landing page entry builds the real one: a faint glow field, an eyebrow
// between hairlines, the name in the display face, and one action. Each part rises once, in order.
export default async function PublicHome() {
  const profile = await loadProfile();
  const at = (i: number) => ({ "--i": i }) as React.CSSProperties;
  return (
    <main className="public relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-24 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_30%,color-mix(in_oklch,var(--color-glow)_18%,transparent),transparent)]" />
      <p className="rise flex items-center gap-4 font-label text-[11px] uppercase tracking-[0.3em] text-ink-muted" style={at(0)}>
        <span aria-hidden className="h-px w-10 bg-hairline" />
        Welcome
        <span aria-hidden className="h-px w-10 bg-hairline" />
      </p>
      <h1 className="rise display-title mt-6 max-w-3xl" style={at(1)}>{profile.business}</h1>
      {profile.what_we_do && <p className="rise mt-6 max-w-xl text-lg text-ink-muted" style={at(2)}>{profile.what_we_do}</p>}
      <a
        href="/contact"
        className="rise mt-10 inline-flex rounded-full bg-highlight px-8 py-4 font-label text-[11px] uppercase tracking-[0.15em] text-on-highlight transition-[translate] duration-500 ease-breath hover:-translate-y-0.5"
        style={at(3)}
      >
        Get in touch
      </a>
    </main>
  );
}
