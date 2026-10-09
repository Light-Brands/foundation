"use client";
import { useEffect, useId, useRef, useState } from "react";

// The prompt the owner is about to open in Claude, in view: the same inset block on a phone and a desk, held to about
// six lines with a soft fade and a control that shows the whole prompt. The control appears only when the prompt runs
// past the six lines, measured in the browser, so a short prompt reads whole with nothing extra.
export function PromptText({ prompt }: { prompt: string }) {
  const [whole, setWhole] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLParagraphElement>(null);
  const id = useId();

  useEffect(() => {
    const el = box.current;
    const host = wrap.current;
    if (!el || !host || whole) return;
    const mark = () => { host.dataset.overflow = String(el.scrollHeight > el.clientHeight + 1); };
    mark();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(mark);
    ro.observe(el);
    return () => ro.disconnect();
  }, [whole]);

  return (
    <div ref={wrap} className="group mt-4">
      <div data-prompt="" className="relative rounded-control border border-admin-line bg-admin-canvas p-3">
        <p id={id} ref={box} className={`font-mono text-[13px] leading-6 text-admin-ink [overflow-wrap:anywhere] ${whole ? "" : "max-h-36 overflow-hidden"}`}>{prompt}</p>
        {!whole && <div aria-hidden className="pointer-events-none absolute inset-x-px bottom-px hidden h-12 rounded-b-control bg-linear-to-t from-admin-canvas to-transparent group-data-[overflow=true]:block" />}
      </div>
      <button
        type="button"
        aria-expanded={whole}
        aria-controls={id}
        onClick={() => setWhole((w) => !w)}
        className="-mb-2 hidden min-h-11 cursor-pointer items-center text-sm font-medium text-admin-muted underline decoration-admin-line-strong underline-offset-4 hover:text-admin-ink hover:decoration-accent group-data-[overflow=true]:inline-flex"
      >
        {whole ? "Show less" : "Show the whole prompt"}
      </button>
    </div>
  );
}
