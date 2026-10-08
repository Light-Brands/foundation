import type { OwnPage } from "@/lib/layout/sections";
import { READY } from "@/lib/layout/ready";
import { CopyButton } from "@/components/CopyButton";

// The body of a Brand or Agentic page that is not built yet: what it will hold, then the one sentence to copy into
// Claude Code. A coming page says so and keeps the sentence, so there is always a next move.
export function ReadyState({ page }: { page: OwnPage }) {
  const ready = READY[page.id];
  if (!ready) return null;
  const soon = page.state === "soon";
  return (
    <section className="surface rise max-w-2xl p-card md:p-card-lg" style={{ "--i": 1 } as React.CSSProperties}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="kicker">What this page will hold</h2>
        {soon && <span className="chip">Coming soon</span>}
      </div>
      <ul className="mt-4 space-y-2 text-admin-ink">
        {ready.holds.map((line) => (
          <li key={line} className="flex gap-3 leading-relaxed">
            <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-admin-ghost" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-admin-line pt-5">
        <p className="text-sm text-admin-muted">{soon ? "Until it arrives, paste this into Claude Code:" : "Paste this into Claude Code:"}</p>
        <p className="mt-2 font-mono text-sm text-admin-ink">{ready.sentence}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CopyButton text={ready.sentence} label="Copy the sentence" className="btn-primary" />
        </div>
      </div>
    </section>
  );
}
