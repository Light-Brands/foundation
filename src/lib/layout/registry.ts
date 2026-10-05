import { CATEGORIES, type Category, type CategoryId, type IconName, type Subcategory } from "./categories";

export type NavItem = { key: string; label: string; href: string; state: "built" | "ready"; badge: number };
export type NavGroup = { id: CategoryId; label: string; icon: IconName; items: NavItem[]; badge: number };

// Screens this phase ships. Later phases add module screens through manifests.
export const CORE_SCREENS: Record<string, string> = {
  "command.home": "/",
  "command.inbox": "/command/inbox",
  "system.setup": "/system/setup",
  "system.settings": "/system/settings",
};

export type NavOptions = { base?: string; screens?: Record<string, string> };

export function hrefFor(category: string, sub: string, opts: NavOptions = {}): string {
  const screens = opts.screens ?? CORE_SCREENS;
  const path = screens[`${category}.${sub}`] ?? `/${category}/${sub}`;
  const base = opts.base ?? "";
  return base && path === "/" ? base : base + path;
}

export function buildNav(badges: Record<string, number> = {}, opts: NavOptions = {}): NavGroup[] {
  const screens = opts.screens ?? CORE_SCREENS;
  return CATEGORIES.map((c) => {
    const items = c.subcategories.map((s) => {
      const key = `${c.id}.${s.id}`;
      return {
        key,
        label: s.label,
        href: hrefFor(c.id, s.id, opts),
        state: key in screens ? ("built" as const) : ("ready" as const),
        badge: badges[key] ?? 0,
      };
    });
    return { id: c.id, label: c.label, icon: c.icon, items, badge: items.reduce((n, i) => n + i.badge, 0) };
  });
}

export function findCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function findSubcategory(categoryId: string, subId: string): { category: Category; sub: Subcategory } | undefined {
  const category = findCategory(categoryId);
  const sub = category?.subcategories.find((s) => s.id === subId);
  return category && sub ? { category, sub } : undefined;
}

export function activeKey(pathname: string, groups: NavGroup[]): string | null {
  let best: NavItem | null = null;
  for (const g of groups) for (const i of g.items) {
    const hit = i.key === "command.home" ? pathname === i.href : pathname === i.href || pathname.startsWith(i.href + "/");
    if (hit && (!best || i.href.length > best.href.length)) best = i;
  }
  return best?.key ?? null;
}
