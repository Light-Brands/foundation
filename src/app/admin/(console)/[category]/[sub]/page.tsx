import { notFound } from "next/navigation";
import { outcomesFor } from "@/lib/layout/categories";
import { findSubcategory } from "@/lib/layout/registry";
import { hoursBack } from "@/lib/links";
import { Doors } from "@/components/Doors";
import { PageHeader } from "@/components/frame/PageHeader";
import { hasInstallEntry } from "@/lib/ninja";

export default async function ReadyPage({ params }: { params: Promise<{ category: string; sub: string }> }) {
  const { category, sub } = await params;
  const found = findSubcategory(category, sub);
  if (!found) notFound();
  const hours = hoursBack(found.sub.hours);
  return (
    <div>
      <PageHeader
        kicker={`${found.category.label} · Ready to set up`}
        title={found.sub.label}
        lede={
          <>
            <p>{found.sub.blurb}</p>
            {hours && (
              <p className="chip mt-4">
                {hours.lead}
                {hours.figure.split(" to ").map((n, i) => (
                  <span key={i}>{i > 0 && " to "}<span className="font-mono text-admin-ink">{n}</span></span>
                ))}{" "}
                {hours.tail}
              </p>
            )}
          </>
        }
      />
      <Doors categoryId={found.category.id} subId={found.sub.id} subLabel={found.sub.label} hasEntry={hasInstallEntry(found.category.id, found.sub.id)} />
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
