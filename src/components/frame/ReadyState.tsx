import type { OwnPage } from "@/lib/layout/sections";
import { READY } from "@/lib/layout/ready";
import { pagePrompt } from "@/lib/dictionary/numbers";
import { promptLead } from "@/lib/dictionary/prompt";
import { CopyButton } from "@/components/CopyButton";

// The lead sentence with its dictionary number in the figure face.
function Lead({ text }: { text: string }) {
  const m = /\d+(?:\.\d+)+/.exec(text);
  if (!m) return <>{text}</>;
  return <>{text.slice(0, m.index)}<span className="font-mono text-admin-ink">{m[0]}</span>{text.slice(m.index + m[0].length)}</>;
}

// The body of a Brand or Agentic page that is not built yet: what it will hold, then the prompt to copy into
// Claude Code, opening with the chief of staff's name and pointing at the page's dictionary entry. A coming page says
// so and keeps the prompt, so there is always a next move. A phone shows the first sentence and keeps the whole
// prompt in a native disclosure, since the owner copies it there and seldom reads it. A desk shows it whole.
export function ReadyState({ page, section, name }: { page: OwnPage; section: "brand" | "agentic"; name: string }) {
  const ready = READY[page.id];
  if (!ready) return null;
  const soon = page.state === "soon";
  const prompt = pagePrompt(name, `${section}/${page.id}`, page.label);
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
        <p data-prompt-lead="" className="mt-2 text-sm leading-relaxed text-admin-ink md:hidden"><Lead text={promptLead(prompt)} /></p>
        <details className="mt-2 md:hidden">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-admin-muted underline decoration-admin-line-strong underline-offset-4">Show the whole prompt</summary>
          <p className="font-mono text-[13px] leading-relaxed break-all text-admin-ink">{prompt}</p>
        </details>
        <p data-prompt className="mt-2 hidden break-words font-mono text-sm leading-relaxed text-admin-ink md:block">{prompt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CopyButton text={prompt} className="btn-primary" />
        </div>
      </div>
    </section>
  );
}
