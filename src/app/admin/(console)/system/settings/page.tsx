import { getDb } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { readEnv } from "@/lib/env";
import { getPause } from "@/lib/data/pause";
import { PausePanel } from "./PausePanel";
import { ProfileForm } from "./ProfileForm";
import { PageHeader } from "@/components/frame/PageHeader";

export default async function SettingsPage() {
  const db = await getDb();
  const profile = await getProfile(db, readEnv().businessName);
  const pause = await getPause(db);
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Settings · Preferences"
        title="Your business profile"
        lede="Every part of your command center uses these details: your name, how people reach you, and what you do."
      />
      <ProfileForm profile={profile} />
      <PausePanel state={pause} />
    </div>
  );
}
