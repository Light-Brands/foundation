"use client";
import { useState } from "react";
import { copyText } from "@/lib/copy-text";

/**
 * Copies text to the clipboard through copyText, which keeps the click's permission for Safari. With before, the copy
 * happens only once before resolves ok, and its message is shown when it does not. It wears the shared button scale:
 * btn-quiet unless a className such as btn-primary is passed.
 */
export function CopyButton({ text, label = "Copy prompt", before, className = "", onCopied }: {
  text: string;
  label?: string;
  before?: () => Promise<{ ok: boolean; message: string }>;
  className?: string;
  /** Called after a successful copy. */
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");
  const look = /\bbtn-(primary|quiet)\b/.test(className) ? className : `btn-quiet ${className}`;
  return (
    <>
      <button
        type="button"
        className={look.trim()}
        onClick={async () => {
          setNote("");
          const r = await copyText(text, before);
          if (!r.ok) { setNote(r.message); return; }
          onCopied?.();
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? "Copied" : label}
      </button>
      {note && <span role="status" className="text-sm text-warn">{note}</span>}
    </>
  );
}
