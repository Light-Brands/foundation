import { Doors } from "@/components/Doors";
import { PageHeader } from "@/components/frame/PageHeader";

type PromptPageProps = {
  page: string;
  kicker: React.ReactNode;
  title: string;
  blurb: string;
  state: "ready" | "soon";
  hours: { lead: string; figure: string; tail: string } | null;
  doors: { category: string; sub: string; label: string };
  prompt: string;
  hasEntry: boolean;
  name: string;
  card: { title: string; lines: string[] };
  above?: React.ReactNode;
};

// One page for every place that hands the owner a prompt: three doors with the prompt in view, then a card.
export function PromptPage({ page, kicker, title, blurb, state, hours, doors, prompt, hasEntry, name, card, above }: PromptPageProps) {
  return (
    <div data-prompt-page={page}>
      <PageHeader
        kicker={kicker}
        title={title}
        lede={
          <>
            <p>{blurb}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <p data-state className="chip">{state === "soon" ? "Coming soon" : "Ready to set up"}</p>
              {hours && (
                <p className="chip">
                  {hours.lead}
                  {hours.figure.split(" to ").map((n, i) => (
                    <span key={i}>{i > 0 && " to "}<span className="font-mono text-admin-ink">{n}</span></span>
                  ))}{" "}
                  {hours.tail}
                </p>
              )}
            </div>
          </>
        }
      />
      {above}
      <Doors categoryId={doors.category} subId={doors.sub} subLabel={doors.label} prompt={prompt} hasEntry={hasEntry} name={name} />
      <section className="surface rise mt-6 max-w-3xl p-card-lg" style={{ "--i": 2 } as React.CSSProperties} aria-labelledby="outcomes-title">
        <h2 id="outcomes-title" className="kicker">{card.title}</h2>
        <ul className="mt-4 space-y-3">
          {card.lines.map((line) => (
            <li key={line} className="flex gap-3 text-sm leading-relaxed text-admin-ink md:text-[15px]">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
