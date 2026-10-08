import Link from "next/link";
import { buildSections } from "@/lib/layout/sections";
import { SectionHub } from "@/components/frame/SectionHub";
import { PageHeader } from "@/components/frame/PageHeader";

export default function ContextHub() {
  const section = buildSections().find((s) => s.id === "context")!;
  return (
    <div>
      <PageHeader
        title="Context"
        lede={section.blurb}
        action={<Link href="/admin/context/identity" className="btn-primary">Start with your identity</Link>}
      />
      <SectionHub headings={section.headings} />
    </div>
  );
}
