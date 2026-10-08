import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import ReactMarkdown from "react-markdown";
import { keyRoot } from "@/lib/key/write";
import { parseLog } from "@/lib/key/log";
import { PageHeader } from "@/components/frame/PageHeader";
import { EmptyState } from "@/components/frame/EmptyState";
import { CopyButton } from "@/components/CopyButton";

async function readOptional(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

async function latestLog(root: string) {
  let names: string[] = [];
  try {
    names = (await readdir(join(root, "key/log"))).filter((n) => /^\d{4}-\d{2}\.md$/.test(n)).sort().reverse();
  } catch {
    return [];
  }
  const entries = [];
  for (const n of names) {
    const text = await readOptional(join(root, "key/log", n));
    if (text) entries.push(...parseLog(text).sort((a, b) => b.at.localeCompare(a.at)));
    if (entries.length >= 20) break;
  }
  return entries.slice(0, 20);
}

export default async function ModulesPage() {
  const root = keyRoot();
  const system = await readOptional(join(root, "key/knowledge/system.md"));
  const log = await latestLog(root);
  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Settings · Add capabilities"
        title="What you have built"
        lede={<>The plain-words record of your system, kept current by Claude from your build log.</>}
      />
      {!system && log.length === 0 ? (
        <EmptyState
          title="Nothing is built yet."
          body="Your system record and build log fill in after your first build session. To start, paste this into Claude Code: it reads what is installed and ranks your next moves."
          action={<CopyButton text="Check my system." label="Copy: Check my system." className="btn-primary" />}
        />
      ) : (
        <>
          <section className="surface p-card">
            {system ? (
              <div className="space-y-3 text-sm text-admin-ink [&_h1]:text-xl [&_h2]:mt-4 [&_h2]:text-lg [&_li]:ml-5 [&_li]:list-disc">
                <ReactMarkdown skipHtml>{system}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-admin-muted">Your system record appears here after your next build session.</p>
            )}
          </section>
          <section className="space-y-3">
            <h2 className="text-lg text-admin-ink">Build log</h2>
            {log.length === 0 ? (
              <p className="surface p-card text-sm text-admin-muted">Your build log starts with your first build session.</p>
            ) : (
              <ol className="space-y-3">
                {log.map((e) => (
                  <li key={`${e.at}-${e.title}`} className="surface p-4">
                    <p className="font-mono text-xs text-admin-muted">{e.at} · {e.kind}{e.category ? ` · ${e.category}` : ""}</p>
                    <h3 className="mt-1 text-admin-ink">{e.title}</h3>
                    {e.what && <p className="mt-1 text-sm text-admin-muted">{e.what}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  );
}
