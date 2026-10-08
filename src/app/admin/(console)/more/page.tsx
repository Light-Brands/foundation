import { buildSettings } from "@/lib/layout/sections";
import { SectionHub } from "@/components/frame/SectionHub";
import { PageHeader } from "@/components/frame/PageHeader";
import { SiteActions } from "@/components/frame/SiteActions";

export default function MoreHub() {
  return (
    <div className="space-y-8">
      <PageHeader flush title="More" lede="Settings, security and your site." />
      <SectionHub headings={buildSettings()} />
      <SiteActions />
    </div>
  );
}
