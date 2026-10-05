import { notFound } from "next/navigation";
import { findSubcategory } from "@/lib/layout/registry";
import { Doors } from "@/components/Doors";

export default async function ReadyPage({ params }: { params: Promise<{ category: string; sub: string }> }) {
  const { category, sub } = await params;
  const found = findSubcategory(category, sub);
  if (!found) notFound();
  return (
    <div className="space-y-8">
      <div>
        <p className="kicker">{found.category.label} · Ready to set up</p>
        <h1 className="mt-1 text-3xl text-zinc-50">{found.sub.label}</h1>
        <p className="mt-2 max-w-2xl text-mist">{found.sub.blurb}</p>
        {found.sub.hours !== "Core" && (
          <p className="mt-1 font-mono text-xs text-mist">Typically gives back {found.sub.hours.toLowerCase()}</p>
        )}
      </div>
      <Doors categoryId={found.category.id} categoryLabel={found.category.label} subId={found.sub.id} subLabel={found.sub.label} />
    </div>
  );
}
