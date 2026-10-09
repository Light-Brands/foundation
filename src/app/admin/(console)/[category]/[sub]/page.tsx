import { notFound, redirect } from "next/navigation";
import { outcomesFor } from "@/lib/layout/categories";
import { CORE_SCREENS, findSubcategory } from "@/lib/layout/registry";
import { hoursBack } from "@/lib/links";
import { PromptPage } from "@/components/PromptPage";
import { DictionaryKicker } from "@/components/frame/DictionaryKicker";
import { entryForPage, entryWritten, pagePrompt } from "@/lib/dictionary/numbers";
import { chiefName } from "@/lib/dictionary/prompt";
import { loadProfile } from "@/lib/data/safe";

export default async function ReadyPage({ params }: { params: Promise<{ category: string; sub: string }> }) {
  const { category, sub } = await params;
  const found = findSubcategory(category, sub);
  if (!found) notFound();
  // A job that is a built screen lives at the screen's own address (command/home is Today).
  const built = CORE_SCREENS[`${category}.${sub}`];
  if (built) redirect(built);
  const hours = hoursBack(found.sub.hours);
  const page = `${found.category.id}/${found.sub.id}`;
  const entry = entryForPage(page);
  const name = chiefName(await loadProfile());
  return (
    <PromptPage
      page={page}
      kicker={<DictionaryKicker page={page} fallback={`${found.category.label} · Ready to set up`} />}
      title={found.sub.label}
      blurb={found.sub.blurb}
      state="ready"
      hours={hours}
      doors={{ category: found.category.id, sub: found.sub.id, label: found.sub.label }}
      prompt={pagePrompt(name, page, found.sub.label)}
      hasEntry={entry !== null && entryWritten(entry)}
      name={name}
      card={{ title: "What changes once it runs", lines: outcomesFor(found.sub) }}
    />
  );
}
