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
 * remembered target (Claude Desktop until they choose otherwise); the chevron picks another and can make it the default.
 * Nothing is sent: the owner reads the prompt and presses Enter.
 */
export function OpenIn({ prompt, primary = false }: { prompt: string; primary?: boolean }) {
  const { repo, folder: provided, label } = useRepo();
  const [target, setTarget] = useState<Target>("desktop");
  const [stored, setStored] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [bad, setBad] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const chevron = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const menuId = useId();

  useEffect(() => {
    const s = browserStore();
    setTarget(readDefault(s));
    setStored(readFolder(s));
  }, []);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const folder = provided ?? stored;
  const where = { repo, folder };
  const main = openInLink(target, prompt, where);
  const needsFolder = !folder && TARGETS.some((t) => t !== "web" && !openInLink(t, prompt, where).ok);

  const focusItem = (i: number) => {
    const items = menu.current?.querySelectorAll<HTMLElement>("[data-item]");
    if (items && items.length) items[(i + items.length) % items.length].focus();
  };
  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      chevron.current?.focus();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(menu.current?.querySelectorAll<HTMLElement>("[data-item]") ?? []);
    const at = items.indexOf(document.activeElement as HTMLElement);
    focusItem(e.key === "ArrowDown" ? at + 1 : at - 1);
  };

  const makeDefault = (t: Target) => {
    writeDefault(browserStore(), t);
    setTarget(t);
  };
  const saveFolder = () => {
    if (writeFolder(browserStore(), draft)) {
      setStored(draft.trim());
      setBad(false);
    } else {
      setBad(true);
    }
  };

  const look = primary ? "btn-primary" : "btn-quiet";
  const text = `Open in ${TARGET_LABEL[target]}`;

  return (
    <div ref={root} className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-stretch">
          {main.ok ? (
            <a href={main.href} className={`${look} rounded-r-none`}>{text}</a>
          ) : (
            <button type="button" className={`${look} rounded-r-none`} onClick={() => setOpen(true)}>{text}</button>
          )}
          <button
            ref={chevron}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            aria-label="Choose where to open"
            className={`${look} min-w-11 rounded-l-none border-l border-l-admin-line-strong px-2`}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
                setTimeout(() => focusItem(0), 0);
              }
            }}
          >
            <ChevronDown aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <CopyButton text={prompt} />
      </div>
      {open && (
        <div className="surface absolute left-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] p-2 shadow-lg" onKeyDown={onMenuKey}>
          <ul ref={menu} id={menuId} role="menu" aria-label="Open in" className="space-y-1">
            {TARGETS.map((t) => {
              const built = openInLink(t, prompt, where);
              const checked = t === target;
              return (
                <li key={t} role="none" className="rounded-control border border-admin-line p-2">
                  <div role="menuitemradio" aria-checked={checked} tabIndex={-1} data-item="" className="min-h-11 text-sm text-admin-ink focus:outline-2 focus:outline-accent">
                    <span className="font-medium">{TARGET_LABEL[t]}</span>{checked && <span className="ml-2 text-xs text-admin-muted">Default</span>}
                    <span className="block text-xs text-admin-muted">{TARGET_HINT[t]}</span>
                    {!built.ok && <span className="block text-xs text-warn">{built.reason}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {built.ok && <a data-item="" role="menuitem" href={built.href} className="btn-quiet btn-sm">Open</a>}
                    {!checked && <button type="button" data-item="" role="menuitem" className="btn-quiet btn-sm" onClick={() => makeDefault(t)}>Make default</button>}
                  </div>
                </li>
              );
            })}
          </ul>
          {needsFolder && (
            <div className="mt-2 border-t border-admin-line p-2">
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
              {bad && <p role="status" className="mt-1 text-xs text-warn">Use the full path, starting with / or a drive letter.</p>}
            </div>
          )}
        </div>
      )}
      <p className="mt-2 text-xs text-admin-muted">
        Opens in <span className="font-medium text-admin-ink">{label}</span> · check it is selected before you send.{" "}
        <a href="/admin/system/setup#work-with-claude" className="underline underline-offset-4">How this works</a>
      </p>
    </div>
  );
}
