"use client";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavGroup } from "@/lib/layout/registry";
import { Rail } from "./Rail";

export function Shell({
  businessName,
  nav,
  banner,
  children,
}: {
  businessName: string;
  nav: NavGroup[];
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  // Header stays transparent until the page moves, then gains a hairline and an ink backdrop.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    const frame = requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Drawer: focus moves in on open, Escape closes, focus returns to the menu button on close.
  useEffect(() => {
    if (!drawer) return;
    const trigger = menuButton.current;
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [drawer]);

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div inert={drawer} className="relative min-h-dvh">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-8rem] h-[26rem] w-[42rem] -translate-x-1/2 rounded-full bg-violet/10 blur-[120px]"
        />
        <header
          className={`sticky top-0 z-30 transition-colors duration-300 ease-breath ${
            scrolled ? "border-b border-white/5 bg-ink/80 backdrop-blur-md" : "border-b border-transparent"
          }`}
        >
          <div className="flex h-14 items-center gap-3 px-4">
            <button
              ref={menuButton}
              type="button"
              className="lg:hidden"
              aria-label="Open menu"
              aria-expanded={drawer}
              onClick={() => setDrawer(true)}
            >
              <Menu size={20} />
            </button>
            <span className="font-display text-sm tracking-wide text-zinc-100">{businessName}</span>
            <span className="kicker ml-2 hidden sm:inline">Command center</span>
            <form
              action="/api/gate"
              method="post"
              className="ml-auto"
              onSubmit={async (e) => {
                e.preventDefault();
                await fetch("/api/gate", { method: "DELETE" });
                window.location.href = "/gate";
              }}
            >
              <button type="submit" className="chip transition-colors duration-200 ease-breath hover:border-white/20 hover:text-white">
                Lock
              </button>
            </form>
          </div>
        </header>
        {banner}
        <div className="relative flex">
          <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-white/10 lg:block">
            <Rail groups={nav} />
          </aside>
          <div className="relative z-10 mx-auto w-full max-w-6xl min-w-0 flex-1 px-6 py-8">
            <main className="min-w-0">{children}</main>
          </div>
        </div>
      </div>
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" tabIndex={-1} aria-hidden className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-white/10 bg-ink">
            <button ref={closeButton} type="button" className="m-3" aria-label="Close menu" onClick={() => setDrawer(false)}>
              <X size={20} />
            </button>
            <Rail groups={nav} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
