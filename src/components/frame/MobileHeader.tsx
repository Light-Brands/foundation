"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileBar, type NavHeading, type NavSection } from "@/lib/layout/sections";
import { ChevronLeft, Inbox } from "./icons";
import { Monogram } from "./Monogram";

// The phone's top bar. On a hub the page's large title already names the tab, so the bar carries the brand: its
// mark and name, or on Today, whose title is the business name, the mark with the inbox and its waiting count on the
// right. Deeper in, it is back plus the title. The leading slot is always 44px wide, so titles line up whether or not
// there is a back button.
export function MobileHeader({ sections, settings, businessName, logoUrl }: {
  sections: NavSection[];
  settings: NavHeading[];
  businessName: string;
  logoUrl: string | null;
}) {
  const pathname = usePathname();
  const { title, back, hub } = mobileBar(pathname, sections, settings);
  const waiting = sections.find((s) => s.id === "command")?.badge ?? 0;
  const mark = logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt="" className="h-7 w-7 shrink-0 object-contain" />
  ) : (
    <Monogram name={businessName} size="sm" />
  );
  return (
    <header className="bar bar-phone sticky top-0 z-20 flex min-h-12 items-center gap-1 border-b px-2 pt-[env(safe-area-inset-top)] md:hidden">
      {hub ? (
        <>
          <Link href="/admin" aria-label={businessName} className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-control px-2">
            {mark}
            {hub !== "today" && <span className="truncate text-[15px] font-semibold text-admin-ink">{businessName}</span>}
          </Link>
          {hub === "today" && (
            <Link
              href="/admin/command/inbox"
              aria-label={waiting > 0 ? `Inbox, ${waiting} waiting` : "Inbox"}
              className="relative ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-admin-muted transition-colors duration-200 ease-breath hover:bg-admin-hover hover:text-admin-ink"
            >
              <Inbox size={22} strokeWidth={1.75} aria-hidden />
              {waiting > 0 && (
                <span aria-hidden className="absolute right-0.5 top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 font-mono text-[11px] font-semibold leading-none text-on-accent ring-2 ring-admin-surface">
                  {waiting > 99 ? "99+" : waiting}
                </span>
              )}
            </Link>
          )}
        </>
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
