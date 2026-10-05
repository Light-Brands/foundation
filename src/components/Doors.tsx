import { lessonHref, customHref, lessonPrompt } from "@/lib/links";
import { CopyButton } from "@/components/CopyButton";

export function Doors({ categoryId, categoryLabel, subId, subLabel }: {
  categoryId: string; categoryLabel: string; subId: string; subLabel: string;
}) {
  const prompt = lessonPrompt(categoryLabel, subLabel);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="surface p-5">
        <p className="kicker">1 · Connect a tool you use</p>
        <p className="mt-2 text-sm text-zinc-300">Already using something for {subLabel.toLowerCase()}? Claude connects it so the rest of your command center can see it.</p>
        <div className="mt-4"><CopyButton text={prompt} /></div>
      </div>
      <div className="surface p-5">
        <p className="kicker">2 · Build it with a lesson</p>
        <p className="mt-2 text-sm text-zinc-300">Paste the prompt into Claude Code inside this project. Claude builds it with you, step by step.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton text={prompt} />
          <a className="btn-quiet" href={lessonHref(categoryId, subId)} target="_blank" rel="noreferrer">Open the lesson</a>
        </div>
      </div>
      <div className="surface p-5">
        <p className="kicker">3 · Have Light Brands build it</p>
        <p className="mt-2 text-sm text-zinc-300">We build it custom and connect it to your command center. Custom takes a bit longer and can be a bit trickier.</p>
        <a className="btn-primary mt-4" href={customHref(categoryId, subId)} target="_blank" rel="noreferrer">Request a custom build</a>
      </div>
    </div>
  );
}
