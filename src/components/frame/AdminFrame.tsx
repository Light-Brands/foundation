"use client";
import { useEffect, useState } from "react";
import type { NavHeading, NavSection } from "@/lib/layout/sections";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import { MobileHeader } from "./MobileHeader";
import { TopBar } from "./TopBar";

const KEY = "foundation.sidebar";

export function AdminFrame({ businessName, logoUrl, sections, settings, banner, children }: {
  businessName: string;
  logoUrl: string | null;
  sections: NavSection[];
  settings: NavHeading[];
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      // Read after mount so the server and first client render agree.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(KEY) === "collapsed") setCollapsed(true);
    } catch {
      // Private windows can refuse storage; the menu simply starts open.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, collapsed ? "collapsed" : "open");
    } catch {
      // Nothing to do: the choice lasts until the page closes.
    }
  }, [collapsed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const todayBadge = sections.find((s) => s.id === "command")?.badge ?? 0;

  return (
    <div className="min-h-dvh overflow-x-clip bg-admin-canvas">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-admin-line transition-[width] duration-300 ease-breath md:flex ${collapsed ? "w-20" : "w-64"}`}>
        <Sidebar businessName={businessName} logoUrl={logoUrl} sections={sections} settings={settings} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </aside>
      <MobileHeader sections={sections} settings={settings} businessName={businessName} logoUrl={logoUrl} />
      <main className={`min-h-dvh pb-[calc(72px+env(safe-area-inset-bottom))] transition-[padding] duration-300 ease-breath md:pb-0 ${collapsed ? "md:pl-20" : "md:pl-64"}`}>
        {banner}
        <TopBar sections={sections} settings={settings} />
        <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-6 sm:px-5 md:px-6 md:pt-8 lg:px-8 lg:pb-14">
          {children}
        </div>
      </main>
      <TabBar sections={sections} settings={settings} todayBadge={todayBadge} />
    </div>
  );
}
