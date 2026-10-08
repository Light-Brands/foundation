import Link from "next/link";
import { entryState, type NavEntry, type NavHeading } from "@/lib/layout/sections";
import { ChevronRight } from "./icons";

const STATE_TEXT = { built: "Running", ready: "Ready to set up", soon: "Coming soon" } as const;

// The state a job is in, as a dot: filled when it runs, hollow when it is ready to set up, none when it is coming.
// Inside the current sidebar entry, .nav-active recolors it to suit the brand's active marker.
export function StateDot({ state }: { state: NavEntry["state"] }) {
  if (state === "soon") return <span aria-hidden className="h-2 w-2 shrink-0" />;
  const look = state === "built" ? "bg-good" : "ring-1 ring-inset ring-admin-ghost";
  return <span aria-hidden data-state={state} className={`h-2 w-2 shrink-0 rounded-full ${look}`} />;
}

// A section as one list. On a phone it is grouped rows in one surface, like a phone settings screen.
// From md up the same list becomes a grid of cards, each with its blurb, so nothing stretches across the desk.
export function SectionHub({ headings }: { headings: NavHeading[] }) {
  return (
    <div className="rise space-y-8 md:space-y-10" style={{ "--i": 1 } as React.CSSProperties}>
      {headings.map((h) => (
        <section key={h.label || "main"}>
          {h.label && <h2 className="kicker mb-2 px-1 md:mb-3">{h.label}</h2>}
          <ul className="surface divide-y divide-admin-line overflow-hidden md:grid md:grid-cols-2 md:gap-3 md:divide-y-0 md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:shadow-none xl:grid-cols-3">
            {h.entries.map((e) => (
              <li key={e.key} className="md:flex">
                <Link
                  href={e.href}
                  className="group flex min-h-row w-full items-center gap-3 px-4 py-3 transition-colors duration-200 ease-breath active:bg-admin-hover md:min-h-[128px] md:items-start md:rounded-card md:border md:border-[var(--surface-border)] md:bg-[var(--surface-bg)] md:p-card md:shadow-[var(--surface-shadow)] md:transition-[translate,box-shadow] md:hover:translate-y-[calc(-1px*var(--motion,1))] md:hover:shadow-[var(--shadow-lift)] md:active:bg-[var(--surface-bg)]"
                >
                  <span className="flex h-[22px] items-center md:h-6"><StateDot state={e.state} /></span>
                  <span className="flex min-w-0 flex-1 flex-col md:h-full">
                    <span className={`text-[15px] md:font-medium ${e.state === "built" ? "text-admin-ink" : "text-admin-muted md:text-admin-ink"}`}>{e.label}<span className="sr-only">, {entryState(e)}</span></span>
                    <span className="mt-1 hidden text-sm leading-relaxed text-admin-muted md:line-clamp-2">{e.blurb}</span>
                    <span className="mt-auto hidden pt-3 text-xs text-admin-faint md:block">{STATE_TEXT[e.state]}</span>
                  </span>
                  {e.state === "soon" && <span className="chip md:hidden">Soon</span>}
                  {e.badge > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-on-accent">{e.badge}</span>}
                  {e.badge > 0 && <span className="sr-only">waiting</span>}
                  <ChevronRight size={18} aria-hidden className="text-admin-ghost md:hidden" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
