import { promptLead } from "@/lib/dictionary/prompt";

// The lead sentence with its dictionary number in the figure face.
function Lead({ text }: { text: string }) {
  const m = /\d+(?:\.\d+)+/.exec(text);
  if (!m) return <>{text}</>;
  return <>{text.slice(0, m.index)}<span className="font-mono text-admin-ink">{m[0]}</span>{text.slice(m.index + m[0].length)}</>;
}

// The prompt the owner is about to open in Claude, in view. A phone shows the first sentence and keeps the whole
// prompt in a native disclosure, since the owner copies it there and seldom reads it. A desk shows it whole.
export function PromptText({ prompt }: { prompt: string }) {
  return (
    <div className="mt-4">
      <p data-prompt-lead="" className="text-sm leading-relaxed text-admin-ink md:hidden"><Lead text={promptLead(prompt)} /></p>
      <details className="mt-2 md:hidden">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-admin-muted underline decoration-admin-line-strong underline-offset-4">Show the whole prompt</summary>
        <p className="font-mono text-[13px] leading-relaxed break-all text-admin-ink">{prompt}</p>
      </details>
      <div data-prompt="" className="hidden rounded-control border border-admin-line bg-admin-canvas p-3 md:block">
        <p className="break-words font-mono text-sm leading-relaxed text-admin-ink">{prompt}</p>
      </div>
    </div>
  );
}
