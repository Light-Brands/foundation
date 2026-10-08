import { notFound } from "next/navigation";
import { findOwnPage } from "@/lib/layout/sections";
import { PageHeader } from "@/components/frame/PageHeader";

export default async function BrandPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const found = findOwnPage("brand", page);
  if (!found) notFound();
  return <PageHeader kicker={`Brand${found.group ? ` · ${found.group}` : ""}`} title={found.label} lede={found.blurb} />;
}
