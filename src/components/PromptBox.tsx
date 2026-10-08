import { readPrompt } from "@/lib/prompts";
import { OpenIn } from "@/components/OpenIn";

// primary marks the one prompt a screen leads with, such as the next setup step.
export async function PromptBox({ name, title, primary = false }: { name: string; title: string; primary?: boolean }) {
  const text = await readPrompt(name);
  return (
    <div className="surface p-4">
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="kicker">{title}</p>
        <OpenIn prompt={text} primary={primary} />
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-admin-muted">{text}</pre>
    </div>
  );
}
