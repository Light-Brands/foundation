import Link from "next/link";
import { getDb, storageMode } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { countNewInbox, listInbox } from "@/lib/data/inbox";
import { buildSections } from "@/lib/layout/sections";
import { stackStatus } from "@/lib/setup/steps";
import { connectionStatuses, emailSendingActive } from "@/lib/data/connections";
import { readEnv } from "@/lib/env";
import { SECTION_ICONS } from "@/components/frame/icons";
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
  const waiting = await countNewInbox(db);
  const steps = stackStatus(process.env, { storage: storageMode(), connections: await connectionStatuses(db), emailSending: await emailSendingActive(db) });
  const done = steps.filter((s) => s.status === "done").length;
  const departments = buildSections().filter((s) => s.id !== "command");
  return (
    <div data-today className="space-y-8 md:space-y-10">
      {storageMode() === "preview" && latest.length === 0 ? (
        <section data-needs-you="" className="surface block p-5">
          <p className="kicker">What needs you</p>
          <p className="mt-2 text-sm text-admin-muted">Your contact page starts taking messages once your database is connected.</p>
          <Link href="/admin/system/setup" className="mt-2 inline-block text-sm text-admin-ink underline">Open setup</Link>
        </section>
      ) : (
        <Link data-needs-you="" href="/admin/command/inbox" className="surface block p-5 transition-colors duration-200 ease-breath hover:border-admin-faint">
          <p className="kicker">What needs you</p>
          {latest.length ? (
            <>
              <p className="mt-2 text-2xl font-semibold text-admin-ink">{waiting} waiting</p>
              <ul className="mt-3 space-y-2 text-sm text-admin-ink">
                {latest.map((i) => (
                  <li key={i.id} className="flex items-baseline justify-between gap-4">
                    <span className="min-w-0 truncate">{i.title}</span>
                    <span className="shrink-0 font-mono text-xs text-admin-muted">{formatCardTime(i.created_at, profile.timezone)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-admin-muted">Nothing needs you right now.</p>
          )}
        </Link>
      )}

      <section>
        <p className="kicker">See your day</p>
        <h1 className="mt-1 text-3xl text-admin-ink md:text-4xl">{profile.business}</h1>
        <p className="mt-2 text-admin-muted">{profile.what_we_do || "Your command center is live. Here is where your business stands."}</p>
      </section>

      <Link href="/admin/system/setup" className="surface block p-5 transition-colors duration-200 ease-breath hover:border-admin-faint">
        <p className="kicker">Set up</p>
        <p className="mt-2 text-2xl text-admin-ink">{done} of {steps.length} steps live</p>
        <p className="mt-1 text-sm text-admin-muted">Next: {steps.find((s) => s.status === "next")?.label ?? "You are all set"}</p>
      </Link>
      {storageMode() !== "preview" && <RunChecksButton />}

      <section>
        <p className="kicker">Your business, laid out</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {departments.map((sec) => {
            const Icon = SECTION_ICONS[sec.id];
            const entries = sec.headings.flatMap((h) => h.entries);
            return (
              <Link key={sec.id} href={sec.id === "brand" || sec.id === "agentic" ? `/admin/${sec.id}` : `/admin/business?stage=${sec.id}`} className="surface flex items-start gap-3 p-4 transition-colors duration-200 ease-breath hover:border-admin-faint">
                <Icon size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                <div className="min-w-0">
                  <p className="text-admin-ink">{sec.label}</p>
                  <p className="text-sm text-admin-muted">{entries.map((e) => e.label).join(" · ")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
