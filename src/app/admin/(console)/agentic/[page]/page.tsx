import { notFound } from "next/navigation";
import { findOwnPage } from "@/lib/layout/sections";

export default async function AgenticPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const found = findOwnPage("agentic", page);
  if (!found) notFound();
  return (
    <div className="space-y-2">
      <p className="kicker">Agentic{found.group && found.group !== found.label ? ` - ${found.group}` : ""}</p>
      <h1 className="text-3xl font-semibold tracking-tight text-admin-ink">{found.label}</h1>
      <p className="max-w-2xl text-admin-muted">{found.blurb}</p>
      {found.state === "soon" && <p className="chip mt-4">Coming soon</p>}
    </div>
  );
}
