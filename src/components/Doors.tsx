import { lessonHref, customHref, installPrompt, connectPrompt, installCardCopy, connectCardCopy } from "@/lib/links";
import { CopyButton } from "@/components/CopyButton";

// hasEntry: the dictionary has an install entry for this job, so the install door builds it.
export function Doors({ categoryId, subId, subLabel, hasEntry }: {
  categoryId: string; subId: string; subLabel: string; hasEntry: boolean;
}) {
  const connectPr = connectPrompt(categoryId, subId, subLabel);
  const installPr = installPrompt(categoryId, subId, subLabel, hasEntry);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="surface p-5">
        <p className="kicker">1 · Connect a tool you use</p>
        <p className="mt-2 text-sm text-zinc-300">{connectCardCopy(subLabel)}</p>
        <div className="mt-4"><CopyButton text={connectPr} /></div>
      </div>
      <div className="surface p-5">
        <p className="kicker">2 · Install it with the Ninja framework</p>
        <p className="mt-2 text-sm text-zinc-300">Paste this into Claude Code inside this project. {installCardCopy(hasEntry)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton text={installPr} />
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
