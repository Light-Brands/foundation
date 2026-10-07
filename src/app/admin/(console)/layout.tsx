import { AdminFrame } from "@/components/frame/AdminFrame";
import { PreviewBanner } from "@/components/PreviewBanner";
import { buildSections, buildSettings } from "@/lib/layout/sections";
import { getDb, storageMode } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { getBrand } from "@/lib/data/brand";
import { countNewInbox } from "@/lib/data/inbox";
import { readEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const db = await getDb();
  const [profile, brand, waiting] = await Promise.all([getProfile(db, readEnv().businessName), getBrand(db), countNewInbox(db)]);
  const badges = { "command.inbox": waiting };
  return (
    <AdminFrame
      businessName={profile.business}
      logoUrl={brand.logoUrl}
      sections={buildSections(badges)}
      settings={buildSettings(badges)}
      banner={storageMode() === "preview" ? <PreviewBanner /> : undefined}
    >
      {children}
    </AdminFrame>
  );
}
