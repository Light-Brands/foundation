import { readPrompt } from "@/lib/prompts";
import { OpenIn } from "@/components/OpenIn";

// primary marks the one prompt a screen leads with, such as the next setup step.
export async function PromptBox({ name, title, primary = false, learn = true }: { name: string; title: string; primary?: boolean; learn?: boolean }) {
  const text = await readPrompt(name);
  return (
    <div className="surface p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <p className="kicker">{title}</p>
        <div className="ml-auto"><OpenIn prompt={text} primary={primary} learn={learn} align="right" /></div>
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-admin-muted">{text}</pre>
    </div>
  );
}
