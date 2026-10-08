import Link from "next/link";
import { buildSections } from "@/lib/layout/sections";
import { SectionHub } from "@/components/frame/SectionHub";
import { PageHeader } from "@/components/frame/PageHeader";

export default function AgenticHub() {
  const section = buildSections().find((s) => s.id === "agentic")!;
  return (
    <div>
      <PageHeader
        title="Agentic"
        lede={section.blurb}
        action={<Link href="/admin/agentic/agents" className="btn-primary">Meet your agents</Link>}
      />
      <SectionHub headings={section.headings} />
    </div>
  );
}
