import { Shell } from "@/components/shell/Shell";
import { PreviewBanner } from "@/components/PreviewBanner";
import { buildNav } from "@/lib/layout/registry";
import { getDb, storageMode } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { countNewInbox } from "@/lib/data/inbox";
import { readEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const db = await getDb();
  const profile = await getProfile(db, readEnv().businessName);
  const nav = buildNav({ "command.inbox": await countNewInbox(db) });
  return (
    <Shell businessName={profile.business} nav={nav} banner={storageMode() === "preview" ? <PreviewBanner /> : undefined}>
      {children}
    </Shell>
  );
}
