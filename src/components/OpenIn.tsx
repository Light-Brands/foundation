"use client";
import { useEffect, useId, useRef, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ChevronDown } from "@/components/frame/icons";
import { useRepo } from "@/components/RepoProvider";
import { openInLink, TARGETS, TARGET_HINT, TARGET_LABEL, type Target } from "@/lib/claude/open-in";
import { readDefault, readFolder, writeDefault, writeFolder } from "@/lib/claude/default";

function browserStore(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Opens a prompt in Claude with the owner's repo or folder chosen, and keeps Copy beside it. The main part opens the
 * remembered target (Claude Desktop until they choose otherwise); the chevron opens a picker that sets the default.
 * Nothing is sent: the owner reads the prompt and presses Enter. learn=false hides the setup link before sign-in;
 * align="right" anchors the picker to the right edge of the control.
 */
export function OpenIn({ prompt, primary = false, learn = true, align = "left" }: {
  prompt: string; primary?: boolean; learn?: boolean; align?: "left" | "right";
}) {
  const { repo, folder: provided, label } = useRepo();
  const [target, setTarget] = useState<Target>("desktop");
  const [stored, setStored] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const chevron = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    const s = browserStore();
    setTarget(readDefault(s));
    setStored(readFolder(s));
  }, []);

  const rows = () => Array.from(root.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
  const focusChecked = () => {
    const all = rows();
    (all.find((r) => r.getAttribute("aria-checked") === "true") ?? all[0])?.focus();
  };
  const later = (fn: () => void) => setTimeout(fn, 0);

  useEffect(() => {
    if (!open) return;
    focusChecked();
    const away = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const folder = provided ?? stored;
  const where = { repo, folder };
  const main = openInLink(target, prompt, where);

  const openFrom = (el: HTMLElement | null) => {
    opener.current = el;
    setNote("");
    setOpen(true);
  };
  const closeTo = (el: HTMLElement | null) => {
    setOpen(false);
    setNote("");
    later(() => el?.focus());
  };

  const onRootKey = (e: React.KeyboardEvent) => {
    if (open && e.key === "Escape") {
      e.preventDefault();
      closeTo(opener.current ?? chevron.current);
    }
  };
  const onMenuKey = (e: React.KeyboardEvent) => {
    if (!(e.target as HTMLElement).matches('[role="menuitemradio"]')) return;
    const all = rows();
    const at = all.indexOf(e.target as HTMLElement);
    const to = e.key === "ArrowDown" ? at + 1 : e.key === "ArrowUp" ? at - 1 : e.key === "Home" ? 0 : e.key === "End" ? all.length - 1 : null;
    if (to === null) return;
    e.preventDefault();
    all[(to + all.length) % all.length]?.focus();
  };
  const onBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (open && next && root.current && !root.current.contains(next)) setOpen(false);
  };

  const choose = (t: Target) => {
    writeDefault(browserStore(), t);
    setTarget(t);
    closeTo(mainRef.current);
  };
  const saveFolder = () => {
    if (writeFolder(browserStore(), draft)) {
      setStored(draft.trim());
      setNote("Saved");
      later(focusChecked);
    } else {
      setNote("Use the full path, starting with / or a drive letter.");
    }
  };

  const look = primary ? "btn-primary" : "btn-quiet";
  const text = `Open in ${TARGET_LABEL[target]}`;
  const askFolder = !main.ok && target !== "web" && !folder;
  const fallback = label === "your Foundation";

  return (
    <div ref={root} className="relative" onKeyDown={onRootKey} onBlur={onBlur}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-stretch">
          {main.ok ? (
            <a ref={mainRef} href={main.href} className={`${look} rounded-r-none`}>{text}</a>
          ) : (
            <button
              ref={mainRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              className={`${look} rounded-r-none`}
              onClick={(e) => (open ? closeTo(e.currentTarget) : openFrom(e.currentTarget))}
            >{text}</button>
          )}
          <button
            ref={chevron}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            aria-label="Choose where to open"
            className={`${look} min-w-11 rounded-l-none border-l border-l-admin-line-strong px-2`}
            onClick={(e) => (open ? closeTo(e.currentTarget) : openFrom(e.currentTarget))}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && !open) {
                e.preventDefault();
                openFrom(e.currentTarget);
              }
            }}
          >
            <ChevronDown aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <CopyButton text={prompt} />
      </div>
      {open && (
        <div className={`surface absolute ${align === "right" ? "right-0" : "left-0"} z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-2 shadow-lg`}>
          <ul id={menuId} role="menu" aria-label="Open in" className="space-y-1" onKeyDown={onMenuKey}>
            {TARGETS.map((t) => {
              const built = openInLink(t, prompt, where);
              const checked = t === target;
              return (
                <li key={t} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={checked}
                    tabIndex={checked ? 0 : -1}
                    className="block min-h-11 w-full rounded-control border border-admin-line p-2 text-left text-sm text-admin-ink hover:bg-admin-hover"
                    onClick={() => choose(t)}
                  >
                    <span className="font-medium">{TARGET_LABEL[t]}</span>
                    {checked && <span className="ml-2 text-xs text-admin-muted">Default</span>}
                    <span className="block text-xs text-admin-muted">{TARGET_HINT[t]}</span>
                    {!built.ok && <span className="block text-xs text-warn">{built.reason}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {!main.ok && (
            <div className="mt-2 space-y-2 border-t border-admin-line p-2">
              {askFolder && (
                <div>
                  <label className="block text-sm text-admin-ink" htmlFor={`${menuId}-folder`}>Where is your Foundation on this computer?</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id={`${menuId}-folder`}
                      className="min-h-11 min-w-0 flex-1 rounded-control border border-admin-line-strong bg-admin-surface px-3 text-sm text-admin-ink"
                      placeholder="/Users/you/command-center"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveFolder(); } }}
                    />
                    <button type="button" className="btn-quiet" onClick={saveFolder}>Save</button>
                  </div>
                </div>
              )}
              <CopyButton text={prompt} className="btn-sm" />
            </div>
          )}
          <p role="status" className="px-2 text-xs text-admin-muted empty:hidden">{note}</p>
        </div>
      )}
      <p className="mt-2 text-xs text-admin-muted">
        {fallback ? (
          <>Opens in your Foundation folder. Check it is selected before you send.</>
        ) : (
          <>Opens in <span className="font-medium text-admin-ink">{label}</span> · check it is selected before you send.</>
        )}
        {learn && <>{" "}<a href="/admin/system/setup#work-with-claude" className="underline underline-offset-4">How this works</a></>}
      </p>
    </div>
  );
}
