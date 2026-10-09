import { notFound } from "next/navigation";
import { findOwnPage } from "@/lib/layout/sections";
import { PromptPage } from "@/components/PromptPage";
import { DictionaryKicker } from "@/components/frame/DictionaryKicker";
import { loadProfile } from "@/lib/data/safe";
import { chiefName } from "@/lib/dictionary/prompt";
import { entryForPage, entryWritten, pagePrompt } from "@/lib/dictionary/numbers";
import { READY } from "@/lib/layout/ready";

export default async function ContextPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const found = findOwnPage("context", page);
  if (!found) notFound();
  const name = chiefName(await loadProfile());
  const key = `context/${found.id}`;
  const entry = entryForPage(key);
  return (
    <PromptPage
      page={key}
      kicker={<DictionaryKicker page={key} fallback={found.group} />}
      title={found.label}
      blurb={found.blurb}
      state={found.state === "soon" ? "soon" : "ready"}
      hours={null}
      doors={{ category: "context", sub: found.id, label: found.label }}
      prompt={pagePrompt(name, key, found.label)}
      hasEntry={entry !== null && entryWritten(entry)}
      name={name}
      card={{ title: "What this page will hold", lines: READY[found.id]?.holds ?? [found.blurb] }}
    />
  );
}
