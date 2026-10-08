import Link from "next/link";
import { buildSections } from "@/lib/layout/sections";
import { SectionHub } from "@/components/frame/SectionHub";
import { PageHeader } from "@/components/frame/PageHeader";

export default function BrandHub() {
  const section = buildSections().find((s) => s.id === "brand")!;
  return (
    <div>
      <PageHeader
        title="Brand"
        lede={section.blurb}
        action={<Link href="/admin/brand/identity" className="btn-primary">Start with your identity</Link>}
      />
      <SectionHub headings={section.headings} />
    </div>
  );
}
