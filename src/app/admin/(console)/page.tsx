import Link from "next/link";
import { getDb, storageMode } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { countNewInbox, listInbox } from "@/lib/data/inbox";
import { buildSections } from "@/lib/layout/sections";
import { stackStatus } from "@/lib/setup/steps";
import { connectionStatuses, emailSendingActive } from "@/lib/data/connections";
import { readEnv } from "@/lib/env";
import { SECTION_ICONS } from "@/components/frame/icons";
import { PageHeader } from "@/components/frame/PageHeader";
import { formatCardTime, formatTodayKicker } from "@/lib/time";
import { after } from "next/server";
import { checkDeps } from "@/lib/checks/deps";
import { runChecksIfDue } from "@/lib/checks/runner";
import { InstallHint } from "@/components/pwa/InstallHint";
import { SetupCard } from "./SetupCard";

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
  const next = steps.find((s) => s.status === "next")?.label ?? null;
  const departments = buildSections().filter((s) => s.id !== "command");
  const preview = storageMode() === "preview";
  return (
    <div data-today className="space-y-10 md:space-y-14">
      <PageHeader
        flush
        kicker={formatTodayKicker(profile.timezone, new Date())}
        title={profile.business}
        lede={profile.what_we_do || "Your command center is live. Here is where your business stands."}
      />

      <div data-today-grid className="grid gap-4 lg:grid-cols-12">
        {preview && latest.length === 0 ? (
          <section data-needs-you="" className="surface p-5 md:p-6 lg:col-span-8">
            <h2 className="kicker">What needs you</h2>
            <p className="mt-4 text-lg text-admin-muted">Your contact page starts taking messages once your database is connected.</p>
            <Link href="/admin/system/setup" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-admin-ink underline decoration-admin-line-strong underline-offset-4 hover:decoration-accent md:min-h-0">Open setup</Link>
          </section>
        ) : (
          <Link data-needs-you="" href="/admin/command/inbox" className="surface surface-link flex flex-col p-5 md:p-6 lg:col-span-8">
            <h2 className="kicker">What needs you</h2>
            {latest.length ? (
              <>
                <p className="mt-4 flex items-baseline gap-3">
                  <span className="font-mono text-4xl tracking-tight text-admin-ink md:text-5xl">{waiting}</span>
                  <span className="text-admin-muted">waiting</span>
                </p>
                <ul className="mt-5 divide-y divide-admin-line border-t border-admin-line text-sm text-admin-ink">
                  {latest.map((i) => (
                    <li key={i.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <span className="min-w-0 truncate">{i.title}</span>
                      <span className="shrink-0 font-mono text-xs text-admin-muted">{formatCardTime(i.created_at, profile.timezone)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-4 text-lg text-admin-muted">Nothing needs you right now.</p>
            )}
          </Link>
        )}
        <div className="lg:col-span-4">
          <SetupCard done={done} total={steps.length} next={next} showChecks={!preview} />
        </div>
      </div>

      <InstallHint businessName={profile.business} />

      <section>
        <h2 className="kicker mb-3 px-1">Your business, laid out</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {departments.map((sec) => {
            const Icon = SECTION_ICONS[sec.id];
            const entries = sec.headings.flatMap((h) => h.entries);
            const running = entries.filter((e) => e.state === "built").length;
            const ready = entries.filter((e) => e.state === "ready").length;
            const soon = entries.filter((e) => e.state === "soon").length;
            return (
              <Link
                key={sec.id}
                href={sec.id === "brand" || sec.id === "agentic" ? `/admin/${sec.id}` : `/admin/business?stage=${sec.id}`}
                className="surface surface-link group flex min-h-[148px] flex-col p-5"
              >
                <span className="grid h-9 w-9 place-items-center rounded-control bg-admin-hover text-admin-muted transition-colors duration-200 ease-breath group-hover:text-accent">
                  <Icon size={18} aria-hidden />
                </span>
                <span className="mt-3 font-medium text-admin-ink">{sec.label}</span>
                <span className="mt-1 line-clamp-2 text-sm leading-relaxed text-admin-muted">{sec.blurb}</span>
                <span className="mt-auto pt-3 text-xs text-admin-muted">
                  <span className="font-mono text-admin-ink">{running}</span> running · <span className="font-mono text-admin-ink">{ready}</span> ready
                  {soon > 0 && <> · <span className="font-mono text-admin-ink">{soon}</span> coming</>}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
