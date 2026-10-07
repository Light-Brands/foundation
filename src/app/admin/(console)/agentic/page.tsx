import { buildSections } from "@/lib/layout/sections";
import { SectionHub } from "@/components/frame/SectionHub";

export default function AgenticHub() {
  const section = buildSections().find((s) => s.id === "agentic")!;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-admin-ink md:text-3xl">Agentic</h1>
        <p className="mt-1 text-admin-muted">{section.blurb}</p>
      </div>
      <SectionHub headings={section.headings} />
    </div>
  );
}
