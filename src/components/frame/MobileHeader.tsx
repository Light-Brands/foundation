"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileBar, type NavHeading, type NavSection } from "@/lib/layout/sections";
import { ChevronLeft } from "./icons";

export function MobileHeader({ sections, settings }: { sections: NavSection[]; settings: NavHeading[] }) {
  const pathname = usePathname();
  const { title, back } = mobileBar(pathname, sections, settings);
  return (
    <header className="sticky top-0 z-20 flex min-h-12 items-center gap-1 border-b border-admin-line bg-admin-surface/95 px-2 pt-[env(safe-area-inset-top)] backdrop-blur-md md:hidden">
      {back ? (
        <Link href={back} aria-label="Back" className="flex h-11 w-11 items-center justify-center rounded-control text-accent">
          <ChevronLeft size={22} aria-hidden />
        </Link>
      ) : (
        <span className="w-3" />
      )}
      <span className="truncate text-[15px] font-semibold text-admin-ink">{title}</span>
    </header>
  );
}
