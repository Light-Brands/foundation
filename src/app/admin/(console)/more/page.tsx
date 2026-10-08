import { buildSettings } from "@/lib/layout/sections";
import { SectionHub } from "@/components/frame/SectionHub";
import { PageHeader } from "@/components/frame/PageHeader";
import { SiteActions } from "@/components/frame/SiteActions";
import { loadProfile } from "@/lib/data/safe";
import { chiefName } from "@/lib/dictionary/prompt";

export default async function MoreHub() {
  return (
    <div className="space-y-8">
      <PageHeader flush title="More" lede="Settings, security and your site." />
      <SectionHub headings={buildSettings()} />
      <SiteActions chiefName={chiefName(await loadProfile())} />
    </div>
  );
}
