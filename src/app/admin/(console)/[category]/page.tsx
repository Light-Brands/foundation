import Link from "next/link";
import { notFound } from "next/navigation";
import { CORE_SCREENS, findCategory, hrefFor } from "@/lib/layout/registry";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) notFound();
  return (
    <div className="space-y-8">
      <div>
        <p className="kicker">{cat.label} · Dashboard</p>
        <h1 className="mt-1 text-3xl text-admin-ink">{cat.label}</h1>
        <p className="mt-2 text-admin-muted">Each part below is either running or ready to set up. Open one to see how it works for your business.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cat.subcategories.map((sub) => {
          const key = `${cat.id}.${sub.id}`;
          return (
            <Link key={key} href={hrefFor(cat.id, sub.id)} className="surface block p-4 transition hover:border-admin-faint">
              <div className="flex items-center justify-between">
                <p className="text-admin-ink">{sub.label}</p>
                <span className="kicker">{key in CORE_SCREENS ? "Running" : "Ready to set up"}</span>
              </div>
              <p className="mt-1 text-sm text-admin-muted">{sub.blurb}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
