import { notFound } from "next/navigation";
import { findOwnPage } from "@/lib/layout/sections";
import { PageHeader } from "@/components/frame/PageHeader";
import { ReadyState } from "@/components/frame/ReadyState";

export default async function AgenticPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const found = findOwnPage("agentic", page);
  if (!found) notFound();
  return (
    <div>
      <PageHeader kicker={`Agentic${found.group && found.group !== found.label ? ` · ${found.group}` : ""}`} title={found.label} lede={found.blurb} />
      <ReadyState page={found} />
    </div>
  );
}
