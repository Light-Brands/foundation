import { buildSettings } from "@/lib/layout/sections";
import { SectionHub } from "@/components/frame/SectionHub";
import { CopyButton } from "@/components/CopyButton";
import { LockButton } from "@/components/frame/LockButton";

export default function MoreHub() {
  return (
    <div className="space-y-8">
      <SectionHub headings={buildSettings()} />
      <section className="surface space-y-3 p-4">
        <a href="/" target="_blank" rel="noreferrer" className="btn-quiet w-full">View my site</a>
        <CopyButton text="Check my system." label="Check my system" className="w-full" />
        <LockButton />
      </section>
    </div>
  );
}
