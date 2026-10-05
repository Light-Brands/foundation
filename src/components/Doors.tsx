import { lessonHref, customHref, installPrompt, connectPrompt } from "@/lib/links";
import { CopyButton } from "@/components/CopyButton";

export function Doors({ categoryId, subId, subLabel }: {
  categoryId: string; subId: string; subLabel: string;
}) {
  const connectPr = connectPrompt(categoryId, subId, subLabel);
  const lessonPr = installPrompt(categoryId, subId, subLabel);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="surface p-5">
        <p className="kicker">1 · Connect a tool you use</p>
        <p className="mt-2 text-sm text-zinc-300">Tell Claude which tool you already use for {subLabel}. Claude maps how it connects to your command center, and the connection itself arrives with your next update.</p>
        <div className="mt-4"><CopyButton text={connectPr} /></div>
      </div>
      <div className="surface p-5">
        <p className="kicker">2 · Install it with the Ninja framework</p>
        <p className="mt-2 text-sm text-zinc-300">Paste this into Claude Code inside this project. A build crew asks what you want, plans it with you, builds it, tests it and proves it works.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton text={lessonPr} />
          <a className="btn-quiet" href={lessonHref(categoryId, subId)} target="_blank" rel="noreferrer">Open the Dojo</a>
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
