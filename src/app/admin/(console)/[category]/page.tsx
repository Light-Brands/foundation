import { notFound, redirect } from "next/navigation";
import { findCategory } from "@/lib/layout/registry";
import { SECTION_DEPARTMENTS, SETTINGS_DEPARTMENTS, type SectionId } from "@/lib/layout/sections";

// A department's old dashboard address, from a bookmark or an old link, leads to where that department lives in
// the frame now: Today for the command center, its stage of the business hub, or Settings.
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = findCategory(category);
  if (!cat) notFound();
  if (cat.id === "command") redirect("/admin");
  if (SETTINGS_DEPARTMENTS.includes(cat.id)) redirect("/admin/settings");
  const section = (Object.entries(SECTION_DEPARTMENTS) as [SectionId, string[]][]).find(([, ids]) => ids.includes(cat.id))?.[0];
  redirect(section ? `/admin/business?stage=${section}` : "/admin");
}
