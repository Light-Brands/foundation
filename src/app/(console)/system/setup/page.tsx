import { stackStatus } from "@/lib/setup/steps";
import { storageMode } from "@/lib/db";
import { StatusLight } from "@/components/StatusLight";
import { PromptBox } from "@/components/PromptBox";
import { customHref } from "@/lib/links";

const LIGHT_LABEL = { done: "Live", next: "Your next step", later: "Coming up" } as const;

export default async function SetupPage() {
  const steps = stackStatus(process.env, { storage: storageMode() });
  return (
    <div className="space-y-8">
      <div>
        <p className="kicker">Settings · Set up</p>
        <h1 className="mt-1 text-3xl text-zinc-50">Your stack, step by step</h1>
        <p className="mt-2 max-w-2xl text-mist">Each step adds something real to your command center. Do it yourself with a prompt for Claude, or have Light Brands set it up.</p>
      </div>
      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={s.id} className="surface p-5">
            <div className="flex items-center gap-3">
              <StatusLight state={s.status} label={LIGHT_LABEL[s.status]} />
              <p className="font-mono text-xs text-mist">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="text-lg text-zinc-100">{s.label}</h2>
              <span className="kicker ml-auto">{LIGHT_LABEL[s.status]}</span>
            </div>
            <p className="mt-2 text-sm text-mist">{s.unlocks}</p>
            {s.status === "next" && s.prompt && (
              <div className="mt-4"><PromptBox name={s.prompt} title={`Do it with Claude: ${s.label}`} /></div>
            )}
            {s.status === "later" && s.prompt && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-mist">Show the prompt</summary>
                <div className="mt-3"><PromptBox name={s.prompt} title={`Do it with Claude: ${s.label}`} /></div>
              </details>
            )}
            {s.status !== "done" && s.custom && (
              <a className="btn-quiet mt-4" href={customHref("system", `setup-${s.id}`)} target="_blank" rel="noreferrer">Have Light Brands set it up</a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
