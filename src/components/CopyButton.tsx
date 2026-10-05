"use client";
import { useState } from "react";

/**
 * Copies text to the clipboard. With before, the copy happens only once before resolves ok, and its message
 * is shown when it does not, so a copy the server must record is never made without that record.
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
          if (before) {
            const r = await before();
            if (!r.ok) { setNote(r.message); return; }
          }
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            setNote("Your browser did not allow the copy. Try once more.");
            return;
          }
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
