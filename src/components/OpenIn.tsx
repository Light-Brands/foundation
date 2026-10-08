"use client";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ChevronDown, Sparkles } from "@/components/frame/icons";
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

// The remembered choices live in the browser. They are read as an external store, so the server and the first client
// render both show Claude Desktop and the stored choice appears right after. Writes in this tab notify the listeners;
// writes in another tab arrive as storage events.
const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}
const notify = () => listeners.forEach((fn) => fn());
const readTarget = () => readDefault(browserStore());
const readStoredFolder = () => readFolder(browserStore());
const serverTarget = (): Target => "desktop";
const serverFolder = (): string | null => null;

/**
 * Opens a prompt in Claude with the owner's repo or folder chosen, and keeps Copy beside it. The main part opens the
 * remembered target (Claude Desktop until they choose otherwise); the chevron opens a picker that sets the default.
 * Nothing is sent: the owner reads the prompt and presses Enter. learn=false hides the setup link before sign-in;
 * align="right" anchors the picker to the right edge of the control.
 */
export function OpenIn({ prompt, primary = false, learn = true, align = "left", compact = false, label: mainLabel, icon = false, defaultOpen = false }: {
  prompt: string; primary?: boolean; learn?: boolean; align?: "left" | "right";
  /** Compact: the main part reads the label (Claude by default), and Copy and the repo line move into the menu. */
  compact?: boolean; label?: string;
  /** Compact only: the main part is the Claude icon, named Open Claude, for a phone header. */
  icon?: boolean;
  /** Starts with the menu open. For markup tests; the page never sets it. */
  defaultOpen?: boolean;
}) {
  const { repo, folder: provided, label: repoLabel } = useRepo();
  const savedTarget = useSyncExternalStore(subscribe, readTarget, serverTarget);
  const savedFolder = useSyncExternalStore(subscribe, readStoredFolder, serverFolder);
  // When storage refuses a write, the choice still holds for this page.
  const [kept, setKept] = useState<{ target?: Target }>({});
  const target = kept.target ?? savedTarget;
  const stored = savedFolder;
  const [open, setOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const chevron = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const menuId = useId();

  const rows = () => Array.from(root.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
  const focusChecked = useCallback(() => {
    const all = Array.from(root.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
    (all.find((r) => r.getAttribute("aria-checked") === "true") ?? all[0])?.focus();
  }, []);
  const later = (fn: () => void) => setTimeout(fn, 0);

  useEffect(() => {
    if (!open) return;
    focusChecked();
    const away = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open, focusChecked]);

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
    if (writeDefault(browserStore(), t)) notify();
    else setKept((k) => ({ ...k, target: t }));
    closeTo(mainRef.current);
  };
  const saveFolder = () => {
    if (writeFolder(browserStore(), draft)) {
      notify();
      setNote("Saved");
      later(focusChecked);
    } else {
      setNote("Use the full path, starting with / or a drive letter.");
    }
  };

  const look = primary ? "btn-primary" : "btn-quiet";
  const text = compact ? (mainLabel ?? "Claude") : `Open in ${TARGET_LABEL[target]}`;
  const sm = compact ? " btn-sm" : "";
  const asIcon = compact && icon;
  const askFolder = !main.ok && target !== "web" && !folder;
  const fallback = repoLabel === "your Foundation";
  const mainName = asIcon ? { "aria-label": "Open Claude" } : {};
  const mainBody = asIcon ? <Sparkles aria-hidden className="h-5 w-5" /> : text;
  const repoLine = (
    <p className={compact ? "px-2 text-xs text-admin-muted" : "mt-2 text-xs text-admin-muted"}>
      {fallback ? (
        <>Opens in your Foundation folder. Check it is selected before you send.</>
      ) : (
        <>Opens in <span className="font-medium text-admin-ink">{repoLabel}</span> · check it is selected before you send.</>
      )}
      {learn && <>{" "}<Link href="/admin/system/setup#work-with-claude" className="underline underline-offset-4">How this works</Link></>}
    </p>
  );

  return (
    <div ref={root} className={asIcon ? undefined : "relative"} onKeyDown={onRootKey} onBlur={onBlur}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-stretch">
          {main.ok ? (
            <a ref={mainRef} href={main.href} className={`${look}${sm} rounded-r-none${asIcon ? " min-h-11 min-w-11 justify-center px-2" : ""}`} {...mainName}>{mainBody}</a>
          ) : (
            <button
              ref={mainRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              className={`${look}${sm} rounded-r-none${asIcon ? " min-h-11 min-w-11 justify-center px-2" : ""}`}
              {...mainName}
              onClick={(e) => (open ? closeTo(e.currentTarget) : openFrom(e.currentTarget))}
            >{mainBody}</button>
          )}
          <button
            ref={chevron}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            aria-label="Choose where to open"
            className={`${look}${sm} min-w-11 rounded-l-none border-l border-l-admin-line-strong px-2`}
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
        {!compact && <CopyButton text={prompt} />}
      </div>
      {open && (
        <div className={`surface absolute z-20 p-2 shadow-lg ${asIcon ? "inset-x-4 top-full mt-1" : `${align === "right" ? "right-0" : "left-0"} mt-2 w-[min(22rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)]`}`}>
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
          {(!main.ok || compact) && (
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
          {compact && <div className="mt-2 border-t border-admin-line pt-2">{repoLine}</div>}
          <p role="status" className="px-2 text-xs text-admin-muted empty:hidden">{note}</p>
        </div>
      )}
      {!compact && repoLine}
    </div>
  );
}
