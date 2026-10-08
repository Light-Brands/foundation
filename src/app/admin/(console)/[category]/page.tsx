import Link from "next/link";
import { notFound } from "next/navigation";
import { CORE_SCREENS, findCategory, hrefFor } from "@/lib/layout/registry";
import { PageHeader } from "@/components/frame/PageHeader";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) notFound();
  return (
    <div>
      <PageHeader
        kicker={`${cat.label} · Dashboard`}
        title={cat.label}
        lede="Each part below is either running or ready to set up. Open one to see how it works for your business."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cat.subcategories.map((sub) => {
          const key = `${cat.id}.${sub.id}`;
          return (
            <Link key={key} href={hrefFor(cat.id, sub.id)} className="surface surface-link block p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-admin-ink">{sub.label}</p>
                <span className="kicker shrink-0">{key in CORE_SCREENS ? "Running" : "Ready to set up"}</span>
              </div>
              <p className="mt-1 text-sm text-admin-muted">{sub.blurb}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
