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

export function hrefFor(category: string, sub: string): string {
  return CORE_SCREENS[`${category}.${sub}`] ?? `/${category}/${sub}`;
}

export function buildNav(badges: Record<string, number> = {}): NavGroup[] {
  return CATEGORIES.map((c) => {
    const items = c.subcategories.map((s) => {
      const key = `${c.id}.${s.id}`;
      return {
        key,
        label: s.label,
        href: hrefFor(c.id, s.id),
        state: key in CORE_SCREENS ? ("built" as const) : ("ready" as const),
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
    const hit = i.href === "/" ? pathname === "/" : pathname === i.href || pathname.startsWith(i.href + "/");
    if (hit && (!best || i.href.length > best.href.length)) best = i;
  }
  return best?.key ?? null;
}
