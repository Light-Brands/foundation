import { lessonHref, customHref, connectDoorPrompt, installCardCopy, connectCardCopy, CUSTOM_CARD_COPY } from "@/lib/links";
import { OpenIn } from "@/components/OpenIn";
import { PromptText } from "@/components/PromptText";
import { ExternalLink } from "@/components/frame/icons";

// prompt: the job's dictionary prompt, opening with the chief of staff's name. hasEntry: its entry ships in ninja/,
// so the install door builds it.
// Three doors, one recommended: installing with the Ninja framework is the path most owners should take,
// so it carries the ring, the chip and the only primary button.
export function Doors({ categoryId, subId, subLabel, prompt, hasEntry, name }: {
  categoryId: string; subId: string; subLabel: string; prompt: string; hasEntry: boolean; name: string;
}) {
  // From xl the three doors share rows through a subgrid: what each door says, its buttons, and the line under them.
  // Every door's buttons sit on one line across the row however long the words above them run.
  const door = "surface flex flex-col p-card md:p-card-lg xl:row-span-3 xl:grid xl:grid-rows-subgrid xl:gap-0";
  return (
    <div className="rise relative z-10 grid items-stretch gap-4 xl:grid-cols-[1fr_1.4fr_1fr] xl:grid-rows-[auto_auto_auto] xl:gap-y-0" style={{ "--i": 1 } as React.CSSProperties}>
      <div data-door="connect" className={door}>
        <div className="flex-1 pb-5">
          <p className="kicker">1 · Connect a tool you use</p>
          <p className="mt-3 text-sm leading-relaxed text-admin-muted">{connectCardCopy(subLabel, name)}</p>
        </div>
        <OpenIn prompt={connectDoorPrompt(prompt)} copyInMenu className="contents" />
      </div>
      <div data-door="install" className={`${door} relative mt-3 ring-1 ring-accent/25 xl:mt-0`}>
        <span className="chip absolute -top-3 left-5 border-accent/30 bg-admin-surface font-medium text-admin-ink md:left-6">Recommended</span>
        <div className="flex-1 pb-5">
          <p className="kicker">2 · Install it with the Ninja framework</p>
          <p className="mt-3 text-sm leading-relaxed text-admin-muted">Open this in Claude. {installCardCopy(hasEntry, name)}</p>
          <PromptText prompt={prompt} />
        </div>
        <OpenIn
          prompt={prompt}
          primary
          className="contents"
          extra={
            <p className="text-xs leading-5 text-admin-muted">
              <a className="-my-3.5 inline-flex min-h-11 items-center gap-1 underline decoration-admin-line-strong underline-offset-4 hover:text-admin-ink hover:decoration-accent" href={lessonHref(categoryId, subId)} target="_blank" rel="noreferrer">
                Open the Dojo<ExternalLink aria-hidden className="size-3" />
              </a>
            </p>
          }
        />
      </div>
      <div data-door="custom" className={door}>
        <div className="flex-1 pb-5">
          <p className="kicker">3 · Have Light Brands build it</p>
          <p className="mt-3 text-sm leading-relaxed text-admin-muted">{CUSTOM_CARD_COPY}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a className="btn-quiet md:min-h-11" href={customHref(categoryId, subId)} target="_blank" rel="noreferrer">Request a custom build</a>
        </div>
      </div>
    </div>
  );
}
