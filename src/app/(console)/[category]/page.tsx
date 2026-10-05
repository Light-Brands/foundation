import Link from "next/link";
import { notFound } from "next/navigation";
import { buildNav } from "@/lib/layout/registry";
import { findCategory } from "@/lib/layout/registry";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) notFound();
  const group = buildNav().find((g) => g.id === cat.id)!;
  return (
    <div className="space-y-8">
      <div>
        <p className="kicker">{cat.label} · Dashboard</p>
        <h1 className="mt-1 text-3xl text-zinc-50">{cat.label}</h1>
        <p className="mt-2 text-mist">Each part below is either running or ready to set up. Open one to see how it works for your business.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {group.items.map((i) => {
          const sub = cat.subcategories.find((s) => `${cat.id}.${s.id}` === i.key)!;
          return (
            <Link key={i.key} href={i.href} className="surface block p-4 transition hover:border-white/20">
              <div className="flex items-center justify-between">
                <p className="text-zinc-100">{i.label}</p>
                <span className="kicker">{i.state === "built" ? "Running" : "Ready to set up"}</span>
              </div>
              <p className="mt-1 text-sm text-mist">{sub.blurb}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
