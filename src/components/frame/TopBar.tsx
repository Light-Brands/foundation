"use client";
import { usePathname } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { checkSystemPrompt } from "@/lib/dictionary/prompt";
import { breadcrumb, type NavHeading, type NavSection } from "@/lib/layout/sections";
import { ExternalLink } from "./icons";

// Desktop only: a real bar across the top of the content, saying where you are on the left and holding the two
// actions every page shares on the right. Check my system is the Ninja verb that reads everything installed and
// ranks the next moves.
export function TopBar({ sections, settings, chiefName = "Claude" }: { sections: NavSection[]; settings: NavHeading[]; chiefName?: string }) {
  const crumbs = breadcrumb(usePathname(), sections, settings);
  return (
    <div data-top-bar className="bar bar-top sticky top-0 z-20 hidden h-14 items-center justify-between gap-4 border-b px-6 md:flex lg:px-8">
      <p className="kicker min-w-0 truncate">
        {crumbs.map((c, i) => (
          <span key={c} className={i === crumbs.length - 1 ? "text-admin-muted" : undefined}>
            {i > 0 && <span aria-hidden className="mx-2 text-admin-ghost">/</span>}
            {c}
          </span>
        ))}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <CopyButton text={checkSystemPrompt(chiefName)} label="Check my system" className="btn-quiet btn-sm" />
        <a href="/" target="_blank" rel="noreferrer" className="btn-quiet btn-sm">
          View my site
          <ExternalLink size={14} aria-hidden className="text-admin-ghost" />
        </a>
      </div>
    </div>
  );
}
