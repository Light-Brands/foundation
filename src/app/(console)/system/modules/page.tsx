import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import ReactMarkdown from "react-markdown";
import { keyRoot } from "@/lib/key/write";
import { parseLog } from "@/lib/key/log";

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
      <div>
        <p className="kicker">System · Modules</p>
        <h1 className="mt-1 text-3xl text-zinc-50">What you have built</h1>
        <p className="mt-2 max-w-2xl text-mist">The plain-words record of your system, kept current by Claude from your build log.</p>
      </div>
      <section className="surface p-5">
        {system ? (
          <div className="space-y-3 text-sm text-zinc-200 [&_h1]:text-xl [&_h2]:mt-4 [&_h2]:text-lg [&_li]:ml-5 [&_li]:list-disc">
            <ReactMarkdown skipHtml>{system}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-mist">Nothing is built yet. Your system record appears here after your first build session.</p>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg text-zinc-100">Build log</h2>
        {log.length === 0 ? (
          <p className="surface p-5 text-sm text-mist">Your build log starts with your first build session.</p>
        ) : (
          <ol className="space-y-3">
            {log.map((e) => (
              <li key={`${e.at}-${e.title}`} className="surface p-4">
                <p className="font-mono text-xs text-mist">{e.at} · {e.kind}{e.category ? ` · ${e.category}` : ""}</p>
                <h3 className="mt-1 text-zinc-100">{e.title}</h3>
                {e.what && <p className="mt-1 text-sm text-mist">{e.what}</p>}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
