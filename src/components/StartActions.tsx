"use client";
import { useEffect, useRef, useState } from "react";
import { PILL } from "@/components/start-style";
import { DESKTOP_MAC_URL, DESKTOP_WINDOWS_URL } from "@/lib/setup-links";


/** The desktop download: Mac first as the server renders it, Windows first once the browser says it is Windows. */
export function DesktopDownload() {
  const [windows, setWindows] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const platform = nav.userAgentData?.platform ?? nav.userAgent;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the browser after mount so the server render stays the same for everyone
    setWindows(/win/i.test(platform) && !/darwin/i.test(platform));
  }, []);
  const main = windows ? { label: "Download for Windows", href: DESKTOP_WINDOWS_URL } : { label: "Download for Mac", href: DESKTOP_MAC_URL };
  const other = windows ? { label: "Mac", href: DESKTOP_MAC_URL } : { label: "Windows", href: DESKTOP_WINDOWS_URL };
  return (
    <div className="flex flex-col items-start gap-3 sm:items-end">
      <a href={main.href} className={PILL}>{main.label}</a>
      <a href={other.href} className="font-label text-[11px] uppercase tracking-[0.15em] text-ink-muted underline-offset-4 hover:underline">{other.label}</a>
    </div>
  );
}

/** A read-only box with the prompt and a Copy button. Where the clipboard is unavailable, the text is selected for a hand copy. */
export function PromptCopy({ text }: { text: string }) {
  const box = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      box.current?.focus();
      box.current?.select();
    }
  }
  return (
    <div className="mt-6 text-left">
      <p className="text-sm text-ink-muted">Or copy this and paste it into the Code tab:</p>
      <textarea
        ref={box}
        readOnly
        rows={7}
        value={text}
        aria-label="Your first message for Claude"
        className="mt-3 block w-full resize-none overflow-y-auto rounded-control border border-hairline bg-canvas-muted p-4 font-mono text-xs leading-relaxed text-ink"
      />
      <div className="mt-3 flex items-center gap-3">
        <button type="button" onClick={copy} className="rounded-full border border-hairline px-5 py-2.5 font-label text-[11px] uppercase tracking-[0.15em] text-ink transition-[translate] duration-500 ease-breath hover:-translate-y-0.5">
          {copied ? "Copied" : "Copy"}
        </button>
        <span role="status" className="sr-only">{copied ? "Copied" : ""}</span>
      </div>
    </div>
  );
}
