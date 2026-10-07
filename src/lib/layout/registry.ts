import { CATEGORIES, type Category, type Subcategory } from "./categories";

// Screens this phase ships. Later phases add module screens through manifests.
export const CORE_SCREENS: Record<string, string> = {
  "command.home": "/admin",
  "command.inbox": "/admin/command/inbox",
  "system.modules": "/admin/system/modules",
  "system.setup": "/admin/system/setup",
  "system.settings": "/admin/system/settings",
  "system.connections": "/admin/system/connections",
};

export function hrefFor(category: string, sub: string): string {
  return CORE_SCREENS[`${category}.${sub}`] ?? `/admin/${category}/${sub}`;
}

export function findCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function findSubcategory(categoryId: string, subId: string): { category: Category; sub: Subcategory } | undefined {
  const category = findCategory(categoryId);
  const sub = category?.subcategories.find((s) => s.id === subId);
  return category && sub ? { category, sub } : undefined;
}
