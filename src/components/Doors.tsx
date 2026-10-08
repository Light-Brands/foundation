import { lessonHref, customHref, installPrompt, connectPrompt, installCardCopy, connectCardCopy, CUSTOM_CARD_COPY } from "@/lib/links";
import { CopyButton } from "@/components/CopyButton";

// hasEntry: the dictionary has an install entry for this job, so the install door builds it.
// Three doors, one recommended: installing with the Ninja framework is the path most owners should take,
// so it carries the ring, the chip and the only primary button.
export function Doors({ categoryId, subId, subLabel, hasEntry }: {
  categoryId: string; subId: string; subLabel: string; hasEntry: boolean;
}) {
  const connectPr = connectPrompt(categoryId, subId, subLabel);
  const installPr = installPrompt(categoryId, subId, subLabel, hasEntry);
  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-3">
      <div data-door="connect" className="surface flex flex-col p-5 md:p-6">
        <p className="kicker">1 · Connect a tool you use</p>
        <p className="mt-3 text-sm leading-relaxed text-admin-muted">{connectCardCopy(subLabel)}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-5"><CopyButton text={connectPr} /></div>
      </div>
      <div data-door="install" className="surface relative mt-3 flex flex-col p-5 ring-1 ring-accent/25 md:p-6 lg:mt-0">
        <span className="chip absolute -top-3 left-5 border-accent/30 bg-admin-surface font-medium text-admin-ink md:left-6">Recommended</span>
        <p className="kicker">2 · Install it with the Ninja framework</p>
        <p className="mt-3 text-sm leading-relaxed text-admin-muted">Paste this into Claude Code. {installCardCopy(hasEntry)}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <CopyButton text={installPr} className="btn-primary" />
          <a className="btn-quiet" href={lessonHref(categoryId, subId)} target="_blank" rel="noreferrer">Open the Dojo</a>
        </div>
      </div>
      <div data-door="custom" className="surface flex flex-col p-5 md:p-6">
        <p className="kicker">3 · Have Light Brands build it</p>
        <p className="mt-3 text-sm leading-relaxed text-admin-muted">{CUSTOM_CARD_COPY}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <a className="btn-quiet" href={customHref(categoryId, subId)} target="_blank" rel="noreferrer">Request a custom build</a>
        </div>
      </div>
    </div>
  );
}
