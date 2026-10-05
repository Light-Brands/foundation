import Link from "next/link";
import { getDb, storageMode } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { listInbox } from "@/lib/data/inbox";
import { buildNav } from "@/lib/layout/registry";
import { stackStatus } from "@/lib/setup/steps";
import { readEnv } from "@/lib/env";
import { ICONS } from "@/components/shell/icons";

export default async function Home() {
  const db = await getDb();
  const profile = await getProfile(db, readEnv().businessName);
  const latest = await listInbox(db, 3);
  const steps = stackStatus(process.env, { storage: storageMode() });
  const done = steps.filter((s) => s.status === "done").length;
  const nav = buildNav().filter((g) => g.id !== "command" && g.id !== "system");
  return (
    <div className="space-y-10">
      <section>
        <p className="kicker">See your day</p>
        <h1 className="mt-1 text-4xl text-zinc-50">{profile.business}</h1>
        <p className="mt-2 text-mist">{profile.what_we_do || "Your command center is live. Here is where your business stands."}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/system/setup" className="surface block p-5 transition hover:border-white/20">
          <p className="kicker">Set up</p>
          <p className="mt-2 text-2xl text-zinc-50">{done} of {steps.length} steps live</p>
          <p className="mt-1 text-sm text-mist">Next: {steps.find((s) => s.status === "next")?.label ?? "You are all set"}</p>
        </Link>
        {storageMode() === "preview" && latest.length === 0 ? (
          <div className="surface block p-5">
            <p className="kicker">Inbox</p>
            <p className="mt-2 text-sm text-mist">Your contact page starts taking messages once your database is connected.</p>
            <Link href="/system/setup" className="mt-2 inline-block text-sm text-zinc-200 underline">Open setup</Link>
          </div>
        ) : (
          <Link href="/command/inbox" className="surface block p-5 transition hover:border-white/20">
            <p className="kicker">Inbox</p>
            {latest.length ? (
              <ul className="mt-2 space-y-1 text-sm text-zinc-200">{latest.map((i) => <li key={i.id}>{i.title}</li>)}</ul>
            ) : (
              <p className="mt-2 text-sm text-mist">Nothing yet. Share your contact page and the first message lands here.</p>
            )}
          </Link>
        )}
      </section>

      <section>
        <p className="kicker">Your business, laid out</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {nav.map((g) => {
            const Icon = ICONS[g.icon];
            return (
              <Link key={g.id} href={`/${g.id}`} className="surface flex items-start gap-3 p-4 transition hover:border-white/20">
                <Icon size={18} className="mt-0.5 text-violet-soft" aria-hidden />
                <div>
                  <p className="text-zinc-100">{g.label}</p>
                  <p className="text-sm text-mist">{g.items.map((i) => i.label).join(" · ")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
