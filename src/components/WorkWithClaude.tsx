"use client";
import { OpenIn } from "@/components/OpenIn";

const STEPS = [
  <>Pick where you work with the arrow beside Open in. The choices are Claude Desktop, claude.ai/code and Terminal, and your pick is remembered on this computer.</>,
  <>Check the line under the button names your Foundation. On claude.ai/code, check your repo is selected.</>,
  <>On Claude Desktop, confirm the folder when Claude asks. In Terminal, the warning &quot;Prompt from an external link&quot; is expected.</>,
  <>Read the prompt and press Enter. Nothing is sent until you press Enter.</>,
];

/** The first lesson: how an Open in button hands a prompt to Claude. Ends with one prompt to try. */
export function WorkWithClaude({ prompt = "" }: { prompt?: string }) {
  return (
    <section id="work-with-claude" className="surface scroll-mt-24 p-card">
      <p className="kicker">Lesson 1</p>
      <h2 className="mt-1 text-lg text-admin-ink">Work with Claude</h2>
      <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-admin-muted">Every prompt in your command center opens in Claude with one press. Here is how it works.</p>
      <ol className="mt-4 max-w-[65ch] list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-admin-ink">
        {STEPS.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <div className="mt-5">
        <p className="mb-2 text-sm text-admin-muted">Try it with a short prompt that asks Claude to say hello and name your next setup step.</p>
        <OpenIn prompt={prompt} learn={false} />
      </div>
    </section>
  );
}
