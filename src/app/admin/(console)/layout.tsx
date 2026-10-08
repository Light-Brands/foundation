import { AdminFrame } from "@/components/frame/AdminFrame";
import { PreviewBanner } from "@/components/PreviewBanner";
import { buildSections, buildSettings } from "@/lib/layout/sections";
import { storageMode } from "@/lib/db";
import { loadBrand, loadInboxCount, loadProfile } from "@/lib/data/safe";
import { chiefName } from "@/lib/dictionary/prompt";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  // The frame reads through the safe loaders, so it stands when the database fails and the page's error shows inside it.
  const [profile, brand, waiting] = await Promise.all([loadProfile(), loadBrand(), loadInboxCount()]);
  const badges = { "command.inbox": waiting };
  return (
    <AdminFrame
      businessName={profile.business}
      chiefName={chiefName(profile)}
      logoUrl={brand.logoUrl}
      sections={buildSections(badges)}
      settings={buildSettings(badges)}
      banner={storageMode() === "preview" ? <PreviewBanner /> : undefined}
    >
      {children}
    </AdminFrame>
  );
}
