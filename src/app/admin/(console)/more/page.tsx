import { buildSettings } from "@/lib/layout/sections";
import { SectionHub } from "@/components/frame/SectionHub";
import { CopyButton } from "@/components/CopyButton";
import { LockButton } from "@/components/frame/LockButton";

export default function MoreHub() {
  const [settings, security] = buildSettings();
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-admin-ink">Settings</h2>
        <SectionHub headings={[{ label: "", entries: settings.entries }]} />
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-admin-ink">Security</h2>
        <SectionHub headings={[{ label: "", entries: security.entries }]} />
      </section>
      <section className="surface space-y-3 p-4">
        <a href="/" target="_blank" rel="noreferrer" className="btn-quiet w-full">View my site</a>
        <CopyButton text="Check my system." label="Check my system" />
        <LockButton />
      </section>
    </div>
  );
}
