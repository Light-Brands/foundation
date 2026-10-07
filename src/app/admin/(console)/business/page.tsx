import Link from "next/link";
import { buildSections, STAGES } from "@/lib/layout/sections";
import { SectionHub } from "@/components/frame/SectionHub";

export default async function BusinessHub({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const { stage: asked } = await searchParams;
  const stage = STAGES.find((x) => x === asked) ?? "grow";
  const sections = buildSections();
  const current = sections.find((s) => s.id === stage)!;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-admin-ink md:text-3xl">Business</h1>
        <p className="mt-1 text-admin-muted">{current.blurb}</p>
      </div>
      <div role="tablist" aria-label="Stage" className="grid grid-cols-3 rounded-control bg-admin-hover p-1">
        {STAGES.map((id) => {
          const label = sections.find((s) => s.id === id)!.label;
          const on = id === stage;
          return (
            <Link
              key={id}
              role="tab"
              aria-selected={on}
              href={`/admin/business?stage=${id}`}
              className={`rounded-control py-2 text-center text-sm font-medium transition-colors duration-200 ease-breath ${on ? "bg-admin-surface text-admin-ink shadow-sm" : "text-admin-muted"}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <SectionHub headings={current.headings} />
    </div>
  );
}
