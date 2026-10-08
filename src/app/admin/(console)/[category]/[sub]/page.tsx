import { notFound, redirect } from "next/navigation";
import { outcomesFor } from "@/lib/layout/categories";
import { CORE_SCREENS, findSubcategory } from "@/lib/layout/registry";
import { hoursBack } from "@/lib/links";
import { Doors } from "@/components/Doors";
import { PageHeader } from "@/components/frame/PageHeader";
import { DictionaryKicker } from "@/components/frame/DictionaryKicker";
import { entryForPage, entryWritten, pagePrompt } from "@/lib/dictionary/numbers";
import { chiefName } from "@/lib/dictionary/prompt";
import { loadProfile } from "@/lib/data/safe";

export default async function ReadyPage({ params }: { params: Promise<{ category: string; sub: string }> }) {
  const { category, sub } = await params;
  const found = findSubcategory(category, sub);
  if (!found) notFound();
  // A job that is a built screen lives at the screen's own address (command/home is Today).
  const built = CORE_SCREENS[`${category}.${sub}`];
  if (built) redirect(built);
  const hours = hoursBack(found.sub.hours);
  const page = `${found.category.id}/${found.sub.id}`;
  const entry = entryForPage(page);
  const name = chiefName(await loadProfile());
  return (
    <div>
      <PageHeader
        kicker={<DictionaryKicker page={page} fallback={`${found.category.label} · Ready to set up`} />}
        title={found.sub.label}
        lede={
          <>
            <p>{found.sub.blurb}</p>
            {(entry || hours) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {/* With a number in the kicker, the state moves down here so the kicker keeps to one line. */}
                {entry && <p data-state className="chip">Ready to set up</p>}
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
            )}
          </>
        }
      />
      <Doors
        categoryId={found.category.id}
        subId={found.sub.id}
        subLabel={found.sub.label}
        prompt={pagePrompt(name, page, found.sub.label)}
        hasEntry={entry !== null && entryWritten(entry)}
        name={name}
      />
      <section className="surface rise mt-6 max-w-3xl p-card-lg" style={{ "--i": 2 } as React.CSSProperties} aria-labelledby="outcomes-title">
        <h2 id="outcomes-title" className="kicker">What changes once it runs</h2>
        <ul className="mt-4 space-y-3">
          {outcomesFor(found.sub).map((line) => (
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
