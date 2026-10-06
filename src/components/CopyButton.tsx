"use client";
import { useState } from "react";
import { copyText } from "@/lib/copy-text";

/**
 * Copies text to the clipboard through copyText, which keeps the click's permission for Safari. With before, the copy
 * happens only once before resolves ok, and its message is shown when it does not.
 */
export function CopyButton({ text, label = "Copy prompt", before }: { text: string; label?: string; before?: () => Promise<{ ok: boolean; message: string }> }) {
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");
  return (
    <>
      <button
        type="button"
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-violet/60"
        onClick={async () => {
          setNote("");
          const r = await copyText(text, before);
          if (!r.ok) { setNote(r.message); return; }
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? "Copied" : label}
      </button>
      {note && <span role="status" className="text-sm text-amber-200">{note}</span>}
    </>
  );
}
