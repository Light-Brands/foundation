import { stackStatus } from "@/lib/setup/steps";
import { getDb, storageMode } from "@/lib/db";
import { connectionStatuses, emailSendingActive } from "@/lib/data/connections";
import { StatusLight } from "@/components/StatusLight";
import { PromptBox } from "@/components/PromptBox";
import { customHref } from "@/lib/links";
import { PageHeader } from "@/components/frame/PageHeader";
import { WorkWithClaude } from "@/components/WorkWithClaude";
import { readPrompt } from "@/lib/prompts";
import { DictionaryKicker } from "@/components/frame/DictionaryKicker";

const LIGHT_LABEL = { done: "Live", next: "Your next step", later: "Coming up" } as const;

export default async function SetupPage() {
  const db = await getDb();
  const steps = stackStatus(process.env, { storage: storageMode(), connections: await connectionStatuses(db), emailSending: await emailSendingActive(db) });
  const lesson = await readPrompt("work-with-claude");
  return (
    <div className="space-y-8">
      <PageHeader
        kicker={<DictionaryKicker page="system/setup" fallback="Settings · Set up" />}
        title="Your stack, step by step"
        lede={<>Each step adds something real to your command center. Do it yourself with a prompt for Claude, or have Light Brands set it up.</>}
      />
      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={s.id} className="surface p-card">
            <div className="flex items-center gap-3">
              <StatusLight state={s.status} label={LIGHT_LABEL[s.status]} />
              <p className="font-mono text-xs text-admin-muted">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="text-lg text-admin-ink">{s.label}</h2>
              <span className="kicker ml-auto">{LIGHT_LABEL[s.status]}</span>
            </div>
            <p className="mt-2 text-sm text-admin-muted">{s.unlocks}</p>
            {s.status === "next" && s.prompt && (
              <div className="mt-4"><PromptBox name={s.prompt} title={`Do it with Claude: ${s.label}`} primary /></div>
            )}
            {s.status === "later" && s.prompt && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-admin-muted">Show the prompt</summary>
                <div className="mt-3"><PromptBox name={s.prompt} title={`Do it with Claude: ${s.label}`} /></div>
              </details>
            )}
            {s.status !== "done" && s.custom && (
              <a className="btn-quiet mt-4" href={customHref("system", `setup-${s.id}`)} target="_blank" rel="noreferrer">Have Light Brands set it up</a>
            )}
          </li>
        ))}
      </ol>
      <WorkWithClaude prompt={lesson} />
    </div>
  );
}
