import { buildSettings } from "@/lib/layout/sections";
import { PageHeader } from "@/components/frame/PageHeader";
import { SectionHub } from "@/components/frame/SectionHub";

export default function SettingsHub() {
  return (
    <div>
      <PageHeader title="Settings" lede="How your command center is set up, who can get in, and how your data is kept safe." />
      <SectionHub headings={buildSettings()} />
    </div>
  );
}
