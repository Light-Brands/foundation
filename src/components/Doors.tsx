import { lessonHref, customHref, connectDoorPrompt, installCardCopy, connectCardCopy, CUSTOM_CARD_COPY } from "@/lib/links";
import { CopyButton } from "@/components/CopyButton";

// prompt: the job's dictionary prompt, opening with the chief of staff's name. hasEntry: its entry ships in ninja/,
// so the install door builds it.
// Three doors, one recommended: installing with the Ninja framework is the path most owners should take,
// so it carries the ring, the chip and the only primary button.
export function Doors({ categoryId, subId, subLabel, prompt, hasEntry, name }: {
  categoryId: string; subId: string; subLabel: string; prompt: string; hasEntry: boolean; name: string;
}) {
  return (
    <div className="rise grid items-stretch gap-4 lg:grid-cols-3" style={{ "--i": 1 } as React.CSSProperties}>
      <div data-door="connect" className="surface flex flex-col p-card md:p-card-lg">
        <p className="kicker">1 · Connect a tool you use</p>
        <p className="mt-3 text-sm leading-relaxed text-admin-muted">{connectCardCopy(subLabel, name)}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-5"><CopyButton text={connectDoorPrompt(prompt)} /></div>
      </div>
      <div data-door="install" className="surface relative mt-3 flex flex-col p-card ring-1 ring-accent/25 md:p-card-lg lg:mt-0">
        <span className="chip absolute -top-3 left-5 border-accent/30 bg-admin-surface font-medium text-admin-ink md:left-6">Recommended</span>
        <p className="kicker">2 · Install it with the Ninja framework</p>
        <p className="mt-3 text-sm leading-relaxed text-admin-muted">Paste this into Claude Code. {installCardCopy(hasEntry, name)}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <CopyButton text={prompt} className="btn-primary" />
          <a className="btn-quiet" href={lessonHref(categoryId, subId)} target="_blank" rel="noreferrer">Open the Dojo</a>
        </div>
      </div>
      <div data-door="custom" className="surface flex flex-col p-card md:p-card-lg">
        <p className="kicker">3 · Have Light Brands build it</p>
        <p className="mt-3 text-sm leading-relaxed text-admin-muted">{CUSTOM_CARD_COPY}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <a className="btn-quiet" href={customHref(categoryId, subId)} target="_blank" rel="noreferrer">Request a custom build</a>
        </div>
      </div>
    </div>
  );
}
