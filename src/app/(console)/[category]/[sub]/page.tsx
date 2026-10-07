import { notFound } from "next/navigation";
import { findSubcategory } from "@/lib/layout/registry";
import { showsHours } from "@/lib/links";
import { Doors } from "@/components/Doors";
import { hasInstallEntry } from "@/lib/ninja";

export default async function ReadyPage({ params }: { params: Promise<{ category: string; sub: string }> }) {
  const { category, sub } = await params;
  const found = findSubcategory(category, sub);
  if (!found) notFound();
  return (
    <div className="space-y-8">
      <div>
        <p className="kicker">{found.category.label} · Ready to set up</p>
        <h1 className="mt-1 text-3xl text-admin-ink">{found.sub.label}</h1>
        <p className="mt-2 max-w-2xl text-admin-muted">{found.sub.blurb}</p>
        {showsHours(found.sub.hours) && (
          <p className="mt-1 font-mono text-xs text-admin-muted">Typically gives back {found.sub.hours.toLowerCase()}</p>
        )}
      </div>
      <Doors categoryId={found.category.id} subId={found.sub.id} subLabel={found.sub.label} hasEntry={hasInstallEntry(found.category.id, found.sub.id)} />
    </div>
  );
}
