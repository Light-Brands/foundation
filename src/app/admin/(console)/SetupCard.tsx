import Link from "next/link";
import { RunChecksButton } from "./RunChecksButton";

// The Set up card on Today: how much of the stack is live, the next step, and the checks button in its footer.
// It is a plain section with links inside, so the checks form never sits inside a link.
export function SetupCard({ done, total, next, showChecks }: { done: number; total: number; next: string | null; showChecks: boolean }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <section className="surface flex h-full flex-col p-card md:p-card-lg" aria-labelledby="today-setup">
      <h2 id="today-setup" className="kicker">
        <Link href="/admin/system/setup" className="transition-colors duration-200 ease-breath hover:text-admin-ink">Set up</Link>
      </h2>
      <p className="mt-4 flex items-baseline gap-2">
        <span className="font-mono text-4xl tracking-tight text-admin-ink">{done}</span>
        <span className="text-admin-muted">of {total} live</span>
      </p>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-admin-hover" role="presentation">
        <div className="h-full rounded-full bg-accent transition-[width] duration-700 ease-breath" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-sm text-admin-muted">
        {next ? (
          <>Next: <Link href="/admin/system/setup" className="font-medium text-admin-ink underline decoration-admin-line-strong underline-offset-4 hover:decoration-accent">{next}</Link></>
        ) : (
          "Every step is live."
        )}
      </p>
      {showChecks && (
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-line pt-3">
            <p className="text-xs text-admin-muted">Checks run on their own every 15 minutes</p>
            <RunChecksButton />
          </div>
        </div>
      )}
    </section>
  );
}
