import Link from "next/link";
import { getDb, storageMode } from "@/lib/db";
import { listInbox } from "@/lib/data/inbox";
import { loadInboxCount, loadProfile } from "@/lib/data/safe";
import { buildSections } from "@/lib/layout/sections";
import { stackStatus } from "@/lib/setup/steps";
import { connectionStatuses, EMAIL_SENDING } from "@/lib/data/connections";
import { SECTION_ICONS } from "@/components/frame/icons";
import { PageHeader } from "@/components/frame/PageHeader";
import { formatTodayKicker } from "@/lib/time";
import { after } from "next/server";
import { checkDeps } from "@/lib/checks/deps";
import { runChecksIfDue } from "@/lib/checks/runner";
import { InstallHint } from "@/components/pwa/InstallHint";
import { SetupCard } from "./SetupCard";
import { NeedsYouCard, NEEDS_YOU_ROWS } from "./NeedsYouCard";

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
  // Independent reads start together. The profile and the count are the ones the frame already read this request.
  const [profile, latest, waiting, connections] = await Promise.all([
    loadProfile(),
    listInbox(db, NEEDS_YOU_ROWS, { status: "new" }),
    loadInboxCount(),
    connectionStatuses(db),
  ]);
  const steps = stackStatus(process.env, { storage: storageMode(), connections, emailSending: connections[EMAIL_SENDING] === "connected" });
  const done = steps.filter((s) => s.status === "done").length;
  const next = steps.find((s) => s.status === "next")?.label ?? null;
  const departments = buildSections().filter((s) => s.id !== "command");
  const preview = storageMode() === "preview";
  return (
    <div data-today className="space-y-stack-sm md:space-y-stack">
      {/* The header and the grid read as one opening, so they sit closer than the sections below them. */}
      <div className="space-y-5 md:space-y-6">
        <PageHeader
          flush
          kicker={formatTodayKicker(profile.timezone, new Date())}
          title={profile.business}
          lede={profile.what_we_do || "Your command center is live. Here is where your business stands."}
        />

        <div data-today-grid className="grid gap-4 lg:grid-cols-12">
          {preview && latest.length === 0 ? (
            <section data-needs-you="" className="surface rise h-full p-card md:p-card-lg lg:col-span-8" style={{ "--i": 1 } as React.CSSProperties}>
              <h2 className="kicker">What needs you</h2>
              <p className="mt-4 text-lg text-admin-muted">Your contact page starts taking messages once your database is connected.</p>
              <Link href="/admin/system/setup" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-admin-ink underline decoration-admin-line-strong underline-offset-4 hover:decoration-accent md:min-h-0">Open setup</Link>
            </section>
          ) : (
            <NeedsYouCard items={latest} waiting={waiting} timezone={profile.timezone} />
          )}
          <div className="rise lg:col-span-4" style={{ "--i": 2 } as React.CSSProperties}>
            <SetupCard done={done} total={steps.length} next={next} showChecks={!preview} />
          </div>
        </div>
      </div>

      <InstallHint businessName={profile.business} />

      <section className="rise" style={{ "--i": 3 } as React.CSSProperties}>
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
                className="surface surface-link group flex min-h-[148px] flex-col p-card"
              >
                <span className="grid h-9 w-9 place-items-center rounded-control bg-admin-hover text-admin-muted transition-colors duration-200 ease-breath group-hover:text-admin-ink">
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
