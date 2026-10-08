import { notFound } from "next/navigation";
import { findOwnPage } from "@/lib/layout/sections";
import { PageHeader } from "@/components/frame/PageHeader";

export default async function AgenticPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const found = findOwnPage("agentic", page);
  if (!found) notFound();
  return (
    <div>
      <PageHeader kicker={`Agentic${found.group && found.group !== found.label ? ` · ${found.group}` : ""}`} title={found.label} lede={found.blurb} />
      {found.state === "soon" && <p className="chip">Coming soon</p>}
    </div>
  );
}
