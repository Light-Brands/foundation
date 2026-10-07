"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS, tabFor, type NavHeading, type NavSection } from "@/lib/layout/sections";
import { TAB_ICONS } from "./icons";

// Always there on a phone. Tapping the tab you are on returns to its hub, like any phone app.
export function TabBar({ sections, settings, todayBadge }: { sections: NavSection[]; settings: NavHeading[]; todayBadge: number }) {
  const pathname = usePathname();
  const current = tabFor(pathname, sections, settings);
  return (
    <nav aria-label="Tabs" className="fixed inset-x-0 bottom-0 z-30 border-t border-admin-line-strong bg-admin-surface/95 backdrop-blur-md md:hidden">
      <ul className="flex pb-[env(safe-area-inset-bottom)]">
        {TABS.map((t) => {
          const Icon = TAB_ICONS[t.id];
          const on = current === t.id;
          return (
            <li key={t.id} className="flex-1">
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-200 ease-breath ${on ? "text-accent" : "text-admin-faint"}`}
              >
                <Icon size={22} strokeWidth={on ? 2.25 : 1.75} aria-hidden />
                <span>{t.label}</span>
                {t.id === "today" && todayBadge > 0 && (
                  <span className="absolute right-[calc(50%-18px)] top-2 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-admin-surface" aria-label={`${todayBadge} waiting`} />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
