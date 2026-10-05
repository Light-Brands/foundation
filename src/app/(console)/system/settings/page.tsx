import { getDb } from "@/lib/db";
import { getProfile } from "@/lib/data/profile";
import { readEnv } from "@/lib/env";
import { ProfileForm } from "./ProfileForm";

export default async function SettingsPage() {
  const profile = await getProfile(await getDb(), readEnv().businessName);
  return (
    <div className="space-y-6">
      <div>
        <p className="kicker">System · Settings</p>
        <h1 className="mt-1 text-3xl text-zinc-50">Your business profile</h1>
        <p className="mt-2 max-w-xl text-mist">Every part of your command center uses these details: your name, how people reach you, and what you do.</p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
