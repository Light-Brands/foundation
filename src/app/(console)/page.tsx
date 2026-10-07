import Link from "next/link";
import { getDb, storageMode } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { listInbox } from "@/lib/data/inbox";
import { buildNav } from "@/lib/layout/registry";
import { stackStatus } from "@/lib/setup/steps";
import { connectionStatuses, emailSendingActive } from "@/lib/data/connections";
import { readEnv } from "@/lib/env";
import { ICONS } from "@/components/shell/icons";
import { formatCardTime } from "@/lib/time";
import { after } from "next/server";
import { checkDeps } from "@/lib/checks/deps";
import { runChecksIfDue } from "@/lib/checks/runner";
import { RunChecksButton } from "./RunChecksButton";

export default async function Home() {
  const db = await getDb();
  if (db) {
    // Due checks run after the page is sent, at most once per 15 minutes however often it opens.
    after(async () => {
      try {
        await runChecksIfDue(await checkDeps(db), new Date());
      } catch (err) {
        console.error("home checks failed", err);
      }
    });
  }
  const profile = await getProfile(db, readEnv().businessName);
  const latest = await listInbox(db, 3, { status: "new" });
  const steps = stackStatus(process.env, { storage: storageMode(), connections: await connectionStatuses(db), emailSending: await emailSendingActive(db) });
  const done = steps.filter((s) => s.status === "done").length;
  const nav = buildNav().filter((g) => g.id !== "command" && g.id !== "system");
  return (
    <div className="space-y-10">
      <section>
        <p className="kicker">See your day</p>
        <h1 className="mt-1 text-4xl text-admin-ink">{profile.business}</h1>
        <p className="mt-2 text-admin-muted">{profile.what_we_do || "Your command center is live. Here is where your business stands."}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/system/setup" className="surface block p-5 transition hover:border-admin-faint">
          <p className="kicker">Set up</p>
          <p className="mt-2 text-2xl text-admin-ink">{done} of {steps.length} steps live</p>
          <p className="mt-1 text-sm text-admin-muted">Next: {steps.find((s) => s.status === "next")?.label ?? "You are all set"}</p>
        </Link>
        {storageMode() === "preview" && latest.length === 0 ? (
          <div className="surface block p-5">
            <p className="kicker">Inbox</p>
            <p className="mt-2 text-sm text-admin-muted">Your contact page starts taking messages once your database is connected.</p>
            <Link href="/system/setup" className="mt-2 inline-block text-sm text-admin-ink underline">Open setup</Link>
          </div>
        ) : (
          <Link href="/command/inbox" className="surface block p-5 transition hover:border-admin-faint">
            <p className="kicker">Inbox</p>
            {latest.length ? (
              <ul className="mt-2 space-y-1 text-sm text-admin-ink">
                {latest.map((i) => (
                  <li key={i.id} className="flex items-baseline justify-between gap-4">
                    <span>{i.title}</span>
                    <span className="font-mono text-xs text-admin-muted">{formatCardTime(i.created_at, profile.timezone)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-admin-muted">Nothing yet. Share your contact page and the first message lands here.</p>
            )}
          </Link>
        )}
      </section>
      {storageMode() !== "preview" && <RunChecksButton />}

      <section>
        <p className="kicker">Your business, laid out</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {nav.map((g) => {
            const Icon = ICONS[g.icon];
            return (
              <Link key={g.id} href={`/${g.id}`} className="surface flex items-start gap-3 p-4 transition hover:border-admin-faint">
                <Icon size={18} className="mt-0.5 text-accent" aria-hidden />
                <div>
                  <p className="text-admin-ink">{g.label}</p>
                  <p className="text-sm text-admin-muted">{g.items.map((i) => i.label).join(" · ")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
