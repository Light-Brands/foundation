"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileBar, type NavHeading, type NavSection } from "@/lib/layout/sections";
import { ChevronLeft } from "./icons";
import { Monogram } from "./Monogram";

// The phone's top bar. On a hub the page's large title already names the tab, so the bar carries the brand: its
// mark and name, or the mark alone on Today, whose title is the business name. Deeper in, it is back plus the title.
// The leading slot is always 44px wide, so titles line up whether or not there is a back button.
export function MobileHeader({ sections, settings, businessName, logoUrl }: {
  sections: NavSection[];
  settings: NavHeading[];
  businessName: string;
  logoUrl: string | null;
}) {
  const pathname = usePathname();
  const { title, back, hub } = mobileBar(pathname, sections, settings);
  const mark = logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt="" className="h-7 w-7 shrink-0 object-contain" />
  ) : (
    <Monogram name={businessName} size="sm" />
  );
  return (
    <header className="sticky top-0 z-20 flex min-h-12 items-center gap-1 border-b border-admin-line bg-admin-surface/95 px-2 pt-[env(safe-area-inset-top)] backdrop-blur-md md:hidden">
      {hub ? (
        <Link href="/admin" aria-label={businessName} className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-control px-2">
          {mark}
          {hub !== "today" && <span className="truncate text-[15px] font-semibold text-admin-ink">{businessName}</span>}
        </Link>
      ) : (
        <>
          <Link href={back ?? "/admin"} aria-label="Back" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-accent">
            <ChevronLeft size={22} aria-hidden />
          </Link>
          <span className="truncate text-[15px] font-semibold text-admin-ink">{title}</span>
        </>
      )}
    </header>
  );
}
