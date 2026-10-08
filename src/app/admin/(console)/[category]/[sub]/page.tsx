import { notFound } from "next/navigation";
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
    </div>
  );
}
