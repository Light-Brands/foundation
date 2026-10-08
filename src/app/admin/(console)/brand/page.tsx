import { buildSections } from "@/lib/layout/sections";
import { SectionHub } from "@/components/frame/SectionHub";
import { PageHeader } from "@/components/frame/PageHeader";

export default function BrandHub() {
  const section = buildSections().find((s) => s.id === "brand")!;
  return (
    <div>
      <PageHeader title="Brand" lede={section.blurb} />
      <SectionHub headings={section.headings} />
    </div>
  );
}
