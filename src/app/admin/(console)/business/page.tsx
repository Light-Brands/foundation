import Link from "next/link";
import { buildSections, STAGES } from "@/lib/layout/sections";
import { SectionHub } from "@/components/frame/SectionHub";
import { PageHeader } from "@/components/frame/PageHeader";

export default async function BusinessHub({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const { stage: asked } = await searchParams;
  const stage = STAGES.find((x) => x === asked) ?? "grow";
  const sections = buildSections();
  const current = sections.find((s) => s.id === stage)!;
  return (
    <div>
      <PageHeader title="Business" lede={current.blurb} />
      <nav aria-label="Stage" className="mb-8 grid grid-cols-3 rounded-control bg-admin-hover p-1 md:mb-10 md:inline-grid md:min-w-[22rem]">
        {STAGES.map((id) => {
          const label = sections.find((s) => s.id === id)!.label;
          const on = id === stage;
          return (
            <Link
              key={id}
              aria-current={on ? "page" : undefined}
              href={`/admin/business?stage=${id}`}
              className={`flex min-h-11 items-center justify-center rounded-control px-4 text-sm font-medium transition-colors duration-200 ease-breath md:min-h-9 ${on ? "bg-admin-surface text-admin-ink shadow-sm" : "text-admin-muted hover:text-admin-ink"}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <SectionHub headings={current.headings} />
    </div>
  );
}
