import { notFound } from "next/navigation";
import { findOwnPage } from "@/lib/layout/sections";
import { PageHeader } from "@/components/frame/PageHeader";
import { ReadyState } from "@/components/frame/ReadyState";
import { DictionaryKicker } from "@/components/frame/DictionaryKicker";
import { loadProfile } from "@/lib/data/safe";
import { chiefName } from "@/lib/dictionary/prompt";
import { ChiefCard } from "./ChiefCard";

export default async function AgenticPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const found = findOwnPage("agentic", page);
  if (!found) notFound();
  const profile = await loadProfile();
  const name = chiefName(profile);
  return (
    <div>
      <PageHeader
        kicker={<DictionaryKicker page={`agentic/${found.id}`} fallback={`Agentic${found.group && found.group !== found.label ? ` · ${found.group}` : ""}`} />}
        title={found.label}
        lede={found.blurb}
      />
      {found.id === "agents" && <ChiefCard name={name} saved={profile.chief_name} />}
      <ReadyState page={found} section="agentic" name={name} />
    </div>
  );
}
