"use client";
import { useState } from "react";
import { copyText } from "@/lib/copy-text";
import { ExternalLink, ChevronRight, Lock, Check, Stethoscope } from "./icons";
import { lockGate } from "./lock";
import { checkSystemPrompt } from "@/lib/dictionary/prompt";

const ROW = "flex min-h-row w-full items-center gap-3 px-4 py-3 text-left text-[15px] transition-colors duration-200 ease-breath active:bg-admin-hover";

// The phone's More screen ends with the three things every page offers on a desk, as rows in one group like the
// settings above them: view the site, copy the Check my system prompt, and lock.
export function SiteActions({ chiefName }: { chiefName: string }) {
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");
  const [lockFailed, setLockFailed] = useState(false);
  return (
    <section>
      <h2 className="kicker mb-2 px-1">Your site</h2>
      <ul className="surface divide-y divide-admin-line overflow-hidden">
        <li>
          <a href="/" target="_blank" rel="noreferrer" className={`${ROW} text-admin-ink`}>
            <ExternalLink size={18} aria-hidden className="text-admin-ghost" />
            <span className="flex-1">View my site</span>
            <ChevronRight size={18} aria-hidden className="text-admin-ghost" />
          </a>
        </li>
        <li>
          <button
            type="button"
            className={`${ROW} text-admin-ink`}
            onClick={async () => {
              setNote("");
              const r = await copyText(checkSystemPrompt(chiefName));
              if (!r.ok) { setNote(r.message); return; }
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? <Check size={18} aria-hidden className="text-good" /> : <Stethoscope size={18} aria-hidden className="text-admin-ghost" />}
            <span className="flex-1">{copied ? "Copied. Paste it into Claude Code." : "Check my system"}</span>
          </button>
          {note && <p role="status" className="px-4 pb-3 text-sm text-warn">{note}</p>}
        </li>
        <li>
          <button type="button" className={`${ROW} text-bad`} onClick={async () => setLockFailed(!(await lockGate()))}>
            <Lock size={18} aria-hidden />
            <span className="flex-1">Lock</span>
          </button>
          {lockFailed && <p role="status" className="px-4 pb-3 text-sm text-bad">Could not lock. Try again.</p>}
        </li>
      </ul>
    </section>
  );
}
