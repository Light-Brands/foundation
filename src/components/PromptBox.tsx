import { readPrompt } from "@/lib/prompts";
import { CopyButton } from "@/components/CopyButton";

export async function PromptBox({ name, title }: { name: string; title: string }) {
  const text = await readPrompt(name);
  return (
    <div className="surface p-4">
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="kicker">{title}</p>
        <CopyButton text={text} />
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-mist">{text}</pre>
    </div>
  );
}
