import { notFound } from "next/navigation";
import { findOwnPage } from "@/lib/layout/sections";
import { PageHeader } from "@/components/frame/PageHeader";
import { ReadyState } from "@/components/frame/ReadyState";
import { DictionaryKicker } from "@/components/frame/DictionaryKicker";
import { loadProfile } from "@/lib/data/safe";
import { chiefName } from "@/lib/dictionary/prompt";

export default async function BrandPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const found = findOwnPage("brand", page);
  if (!found) notFound();
  return (
    <div>
      <PageHeader
        kicker={<DictionaryKicker page={`brand/${found.id}`} fallback={`Brand${found.group ? ` · ${found.group}` : ""}`} />}
        title={found.label}
        lede={found.blurb}
      />
      <ReadyState page={found} section="brand" name={chiefName(await loadProfile())} />
    </div>
  );
}
