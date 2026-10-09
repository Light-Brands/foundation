import { notFound } from "next/navigation";
import { findOwnPage } from "@/lib/layout/sections";
import { PromptPage } from "@/components/PromptPage";
import { DictionaryKicker } from "@/components/frame/DictionaryKicker";
import { loadProfile } from "@/lib/data/safe";
import { chiefName } from "@/lib/dictionary/prompt";
import { entryForPage, entryWritten, pagePrompt } from "@/lib/dictionary/numbers";
import { READY } from "@/lib/layout/ready";
import { ChiefCard } from "./ChiefCard";

export default async function AgenticPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const found = findOwnPage("agentic", page);
  if (!found) notFound();
  const profile = await loadProfile();
  const name = chiefName(profile);
  const key = `agentic/${found.id}`;
  const entry = entryForPage(key);
  return (
    <PromptPage
      page={key}
      kicker={<DictionaryKicker page={key} fallback={`Agentic${found.group && found.group !== found.label ? ` · ${found.group}` : ""}`} />}
      title={found.label}
      blurb={found.blurb}
      state={found.state === "soon" ? "soon" : "ready"}
      hours={null}
      doors={{ category: "agentic", sub: found.id, label: found.label }}
      prompt={pagePrompt(name, key, found.label)}
      hasEntry={entry !== null && entryWritten(entry)}
      name={name}
      card={{ title: "What this page will hold", lines: READY[found.id]?.holds ?? [found.blurb] }}
      above={found.id === "agents" ? <ChiefCard name={name} saved={profile.chief_name} /> : undefined}
    />
  );
}
