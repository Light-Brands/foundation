import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readEnv } from "@/lib/env";
import { CLAUDE_PRO_URL, START_DEEP_LINK, START_PROMPT } from "@/lib/setup-links";
import { PILL } from "@/components/start-style";
import { DesktopDownload, PromptCopy } from "@/components/StartActions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Build your business with Claude",
  description: "Three steps, about ten minutes. Everything you build is yours: your code, your site and your data.",
};

// The public start page, on the demo deployment only (FOUNDATION_DEMO_DEPLOY=on): three numbered steps, three actions.
// Owner copies answer not found. It keeps the home page's look: glow field, hairline eyebrow, display title, rise order.
export default function StartPage() {
  if (!readEnv().demoDeploy) notFound();
  const at = (i: number) => ({ "--i": i }) as React.CSSProperties;
  const card = "rise grid gap-5 rounded-card border border-hairline bg-canvas-muted/60 p-6 text-left sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6 sm:p-8";
  const numeral = "font-display text-5xl font-light leading-none text-ink-muted sm:w-14";
  return (
    <main className="public relative isolate flex min-h-dvh flex-col items-center overflow-hidden px-5 py-20 text-center sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_20%,color-mix(in_oklch,var(--color-glow)_18%,transparent),transparent)]" />
      <p className="rise flex items-center gap-4 font-label text-[11px] uppercase tracking-[0.3em] text-ink-muted" style={at(0)}>
        <span aria-hidden className="h-px w-10 bg-hairline" />
        Your own command center
        <span aria-hidden className="h-px w-10 bg-hairline" />
      </p>
      <h1 className="rise display-title mt-6 max-w-3xl" style={at(1)}>Build your business with Claude</h1>
      <p className="rise mt-6 max-w-xl text-lg text-ink-muted" style={at(2)}>Three steps, about ten minutes. Everything you build is yours: your code, your site and your data.</p>

      <ol className="mt-12 flex w-full max-w-[40rem] flex-col gap-4">
        <li className={card} style={at(3)}>
          <span aria-hidden className={numeral}>1</span>
          <div>
            <h2 className="text-xl text-ink">Get Claude Pro</h2>
            <p className="mt-2 text-ink-muted">Building runs on Claude Pro, about $20 a month. Sign up, then choose Pro.</p>
          </div>
          <a href={CLAUDE_PRO_URL} target="_blank" rel="noopener noreferrer" className={`${PILL} justify-self-start sm:justify-self-end`}>Get Claude Pro</a>
        </li>
        <li className={card} style={at(4)}>
          <span aria-hidden className={numeral}>2</span>
          <div>
            <h2 className="text-xl text-ink">Download Claude Desktop</h2>
            <p className="mt-2 text-ink-muted">Install it, open it, and sign in with the same account.</p>
          </div>
          <DesktopDownload />
        </li>
        <li className={`${card} sm:grid-cols-[auto_1fr] sm:items-start`} style={at(5)}>
          <span aria-hidden className={numeral}>3</span>
          <div>
            <h2 className="text-xl text-ink">Start your build</h2>
            <p className="mt-2 text-ink-muted">Opens Claude Desktop with your first message ready. When it asks for a folder, make a new one named foundation-command-center, then press send.</p>
            <a href={START_DEEP_LINK} className={`${PILL} mt-5`}>Open in Claude Desktop</a>
            <PromptCopy text={START_PROMPT} />
          </div>
        </li>
      </ol>

      <p className="rise mt-10 text-sm text-ink-muted" style={at(6)}>
        Want us to build it for you instead? Write to <a href="mailto:hello@lightbrands.ai" className="underline underline-offset-4">hello@lightbrands.ai</a>.
      </p>
    </main>
  );
}
