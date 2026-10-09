"use client";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CopyButton } from "@/components/CopyButton";
import { Check, ChevronDown, Folder, GitBranch, Sparkles } from "@/components/frame/icons";
import { useRepo } from "@/components/RepoProvider";
import { LIMIT, openInLink, TARGETS, TARGET_HINT, TARGET_LABEL, type Target } from "@/lib/claude/open-in";
import { markOpened, readDefault, readFolder, writeDefault, writeFolder } from "@/lib/claude/default";
import { browserStore, notify, subscribe } from "@/lib/claude/browser-store";

const readTarget = () => readDefault(browserStore());
const readStoredFolder = () => readFolder(browserStore());
const serverTarget = (): Target => "desktop";
const serverFolder = (): string | null => null;

// Below the sm breakpoint the menu is a bottom sheet above the tab bar.
const NARROW = "(max-width: 639.98px)";
const hasMq = () => typeof window !== "undefined" && typeof window.matchMedia === "function";
const subscribeNarrow = (cb: () => void) => {
  if (!hasMq()) return () => {};
  const m = window.matchMedia(NARROW);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const readNarrow = () => hasMq() && window.matchMedia(NARROW).matches;
const serverNarrow = () => false;

const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const visible = (el: HTMLElement) => el.getClientRects().length > 0;

// Where the popover sits: above or below the button, anchored to its right or left edge, and how tall it may grow.
type Place = { up: boolean; right: boolean; max: number };
const MENU_WIDTH = 352;
const MENU_CAP = 512;

/**
 * Opens a prompt in Claude with the owner's repo or folder chosen, and keeps Copy beside it. The main part opens the
 * remembered target (Claude Desktop until they choose otherwise); the chevron opens a picker that sets the default.
 * Nothing is sent: the owner reads the prompt and presses Enter. learn=false hides the setup link before sign-in;
 * align="right" always anchors the picker to the chevron, otherwise it anchors there when the page has room.
 */
export function OpenIn({ prompt, primary = false, learn = true, align = "left", compact = false, label: mainLabel, icon = false, defaultOpen = false, copyInMenu = false, extra, line = "full", webReason, className }: {
  prompt: string; primary?: boolean; learn?: boolean; align?: "left" | "right";
  /** Compact: the main part reads the label (Claude by default), and Copy and the repo line move into the menu. */
  compact?: boolean; label?: string;
  /** Compact only: the main part is the Claude icon, named Open Claude, for a phone header. */
  icon?: boolean;
  /** Starts with the menu open. For markup tests; the page never sets it. */
  defaultOpen?: boolean;
  /** Copy lives in the menu, so a narrow card keeps one row of buttons. */
  copyInMenu?: boolean;
  /** A quiet link at the end of the repo line, such as the lesson in the Dojo. */
  extra?: React.ReactNode;
  /** The repo line: the sentence, or only the repo chip and the setup link for a card that already says it. */
  line?: "full" | "chip";
  /** Replaces the reason shown for claude.ai/code when no GitHub repo is known, for a page where Setup is out of reach. */
  webReason?: string;
  /** The wrapper's class. "contents" lets a card's grid place the button row and the repo line. */
  className?: string;
}) {
  const { repo, folder: provided, label: repoLabel } = useRepo();
  const savedTarget = useSyncExternalStore(subscribe, readTarget, serverTarget);
  const savedFolder = useSyncExternalStore(subscribe, readStoredFolder, serverFolder);
  const narrow = useSyncExternalStore(subscribeNarrow, readNarrow, serverNarrow);
  // When storage refuses a write, the choice still holds for this page.
  const [kept, setKept] = useState<{ target?: Target }>({});
  const target = kept.target ?? savedTarget;
  const stored = savedFolder;
  const [open, setOpen] = useState(defaultOpen);
  const [place, setPlace] = useState<Place>({ up: false, right: align === "right", max: MENU_CAP });
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const anchor = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const chevron = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  // Which part opened the menu. Focus returns to the live node at that moment, since the main part can swap between a
  // button and a link when the chosen target changes.
  const opener = useRef<"main" | "chevron">("chevron");
  const menuId = useId();

  const asIcon = compact && icon;
  const sheet = asIcon || narrow;

  const rows = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
  const focusChecked = useCallback(() => {
    const all = Array.from(panel.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
    (all.find((r) => r.getAttribute("aria-checked") === "true") ?? all[0])?.focus();
  }, []);
  const later = (fn: () => void) => setTimeout(fn, 0);
  const inside = (n: Node | null) => !!n && (!!panel.current?.contains(n) || !!anchor.current?.contains(n));

  useEffect(() => {
    if (!open) return;
    focusChecked();
    const away = (e: PointerEvent) => {
      const t = e.target as Node;
      // The scrim closes the sheet on its own click, so the press never lands on the page beneath it.
      if (!panel.current?.contains(t) && !anchor.current?.contains(t) && !scrim.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open, focusChecked]);

  // A capped menu shows a fade at its foot while more rows sit below, so it never reads as cut off. The mark is a
  // data attribute on the panel, so the fade follows the scroll without a render.
  useEffect(() => {
    const el = panel.current;
    if (!open || !el) return;
    const mark = () => { el.dataset.more = String(el.scrollTop + el.clientHeight < el.scrollHeight - 2); };
    mark();
    el.addEventListener("scroll", mark, { passive: true });
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(mark);
    ro?.observe(el);
    return () => { el.removeEventListener("scroll", mark); ro?.disconnect(); };
  }, [open]);

  const folder = provided ?? stored;
  const where = { repo, folder };
  const main = openInLink(target, prompt, where);

  // Measured when the menu opens, from the button's place on screen: it opens upward when the room below is short,
  // and anchors to the chevron unless that would carry it over the sidebar.
  const measure = (): Place => {
    const a = anchor.current?.getBoundingClientRect();
    if (!a || typeof window === "undefined") return place;
    const vh = window.innerHeight;
    const cap = Math.min(vh * 0.7, MENU_CAP);
    const below = vh - a.bottom - 16;
    // The room above ends at the sticky top bar (or the phone header), with a little air.
    const bars = Array.from(document.querySelectorAll<HTMLElement>("[data-top-bar], header.bar")).map((el) => el.getBoundingClientRect()).filter((r) => r.height > 0 && r.bottom <= a.top);
    const ceiling = Math.max(0, ...bars.map((r) => r.bottom));
    const above = a.top - ceiling - 16;
    const up = below < cap && above > below;
    const width = Math.min(MENU_WIDTH, window.innerWidth - 32);
    const page = document.getElementById("main");
    const bound = page ? page.getBoundingClientRect().left + parseFloat(getComputedStyle(page).paddingLeft || "0") : 16;
    const right = align === "right" || a.right - width >= bound;
    return { up, right, max: Math.max(160, Math.min(cap, up ? above : below)) };
  };

  const openerEl = () => (opener.current === "main" ? mainRef.current : chevron.current) ?? chevron.current;
  const openFrom = (from: "main" | "chevron") => {
    opener.current = from;
    setNote("");
    if (!sheet) setPlace(measure());
    setOpen(true);
  };
  const closeTo = (el: () => HTMLElement | null) => {
    setOpen(false);
    setNote("");
    later(() => el()?.focus());
  };

  const onRootKey = (e: React.KeyboardEvent) => {
    if (open && e.key === "Escape") {
      e.preventDefault();
      closeTo(openerEl);
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
  // Tab walks the menu's own stops (the folder field, the rows as one stop, Copy), then closes the menu and moves on
  // from the button, the way a menu button does. Shift Tab off the first stop returns to the button.
  const onPanelKey = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panel.current) return;
    const stops: HTMLElement[] = [];
    let rowStop: HTMLElement | null = null;
    for (const el of Array.from(panel.current.querySelectorAll<HTMLElement>(TABBABLE + ', [role="menuitemradio"]'))) {
      if (el.matches('[role="menuitemradio"]')) {
        if (!rowStop) { rowStop = rows().find((r) => r.getAttribute("aria-checked") === "true") ?? el; stops.push(rowStop); }
      } else if (visible(el)) stops.push(el);
    }
    const active = document.activeElement as HTMLElement | null;
    const at = active?.matches('[role="menuitemradio"]') ? stops.indexOf(rowStop!) : stops.indexOf(active!);
    const to = at + (e.shiftKey ? -1 : 1);
    e.preventDefault();
    if (at >= 0 && to >= 0 && to < stops.length) { stops[to]!.focus(); return; }
    const trigger = openerEl();
    setOpen(false);
    setNote("");
    if (e.shiftKey || !trigger) { trigger?.focus(); return; }
    const from = chevron.current ?? trigger;
    const next = Array.from(document.querySelectorAll<HTMLElement>(TABBABLE)).find((el) =>
      !panel.current?.contains(el) && !from.contains(el) && el.tabIndex >= 0 && visible(el) &&
      !!(from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING));
    (next ?? trigger).focus();
  };
  const onBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (open && next && !inside(next)) setOpen(false);
  };

  const choose = (t: Target) => {
    if (writeDefault(browserStore(), t)) notify();
    else setKept((k) => ({ ...k, target: t }));
    closeTo(() => mainRef.current);
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

  const opened = () => {
    if (markOpened(browserStore())) notify();
  };

  const look = primary ? "btn-primary" : "btn-quiet";
  const text = compact ? (mainLabel ?? "Claude") : `Open in ${TARGET_LABEL[target]}`;
  // The door's buttons keep the 44px tap floor on a desk too; the top bar stays dense.
  const size = compact ? " btn-sm" : " md:min-h-11";
  const askFolder = !folder && target !== "web";
  const fallback = repoLabel === "your Foundation";
  const mainName = asIcon ? { "aria-label": "Open Claude" } : {};
  const mainBody = asIcon ? <Sparkles aria-hidden className="h-5 w-5" /> : text;
  const PlaceIcon = target === "web" ? GitBranch : Folder;
  // The repo chip: a visible edge so the sentence's period sits flush against it.
  // With no repo known it names the folder in plain words, in the same chip.
  const chip = (
    <span className={`inline-flex items-center gap-1 rounded-control border border-admin-line-strong bg-admin-hover px-1.5 align-[-1px] leading-[18px] text-admin-ink ${fallback ? "text-xs" : "font-mono text-[12px]"}`}>
      <PlaceIcon aria-hidden className="size-3.5 text-admin-muted" />{fallback ? "your folder" : repoLabel}
    </span>
  );
  const how = learn && (
    <Link href="/admin/system/setup#work-with-claude" className="-my-3.5 inline-flex min-h-11 items-center underline decoration-admin-line-strong underline-offset-4 hover:text-admin-ink hover:decoration-accent">How this works</Link>
  );
  const repoLine = (
    <p className="text-xs leading-5 text-admin-muted">
      {line === "chip" ? (
        <>{chip}{how && <>{" "}<span className="whitespace-nowrap"><span aria-hidden>·</span> {how}</span></>}</>
      ) : (
        <>Opens in {chip}. Check it is selected.{how && <> {how}</>}</>
      )}
      {extra && <>{" "}<span className="whitespace-nowrap"><span aria-hidden>·</span> {extra}</span></>}
    </p>
  );

  const menu = open ? (
    <div
      ref={panel}
      onKeyDown={onPanelKey}
      style={sheet ? undefined : { maxHeight: place.max }}
      className={`group/menu menu-surface focus-inset overflow-y-auto overscroll-contain p-1.5 text-left ${sheet
        ? "fixed inset-x-4 bottom-[calc(72px+env(safe-area-inset-bottom))] z-50 max-h-[min(70vh,32rem)]"
        : `absolute z-30 w-[min(22rem,calc(100vw-2rem))] max-h-[min(70vh,32rem)] ${place.up ? "bottom-full mb-2" : "top-full mt-2"} ${place.right ? "right-0" : "left-0"}`}`}
    >
      {askFolder && (
        <div className="mb-1.5 border-b border-admin-line p-1.5 pb-3">
          <label htmlFor={`${menuId}-folder`} className="block rounded-control bg-admin-hover px-3 py-2 text-[13px] leading-5 text-admin-muted">
            Add where your Foundation is on this computer to open it here.
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id={`${menuId}-folder`}
              className="field min-h-11 min-w-0 flex-1"
              placeholder="/Users/you/command-center"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveFolder(); } }}
            />
            <button type="button" className="btn-quiet md:min-h-11" onClick={saveFolder}>Save</button>
          </div>
        </div>
      )}
      <ul id={menuId} role="menu" aria-label="Open in" className="divide-y divide-admin-line" onKeyDown={onMenuKey}>
        {TARGETS.map((t) => {
          const built = openInLink(t, prompt, where);
          const checked = t === target;
          const needsFolder = !built.ok && t !== "web" && !folder && prompt.length <= LIMIT[t];
          return (
            <li key={t} role="none" className="py-0.5">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                className="menu-row grid min-h-11 w-full grid-cols-[1rem_1fr] gap-x-2.5 rounded-control px-2.5 py-2 text-left text-sm text-admin-ink"
                onClick={() => choose(t)}
              >
                <span aria-hidden className="flex h-5 items-center text-accent">{checked && <Check className="size-4" strokeWidth={2.5} />}</span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-x-2">
                    <span className="font-medium">{TARGET_LABEL[t]}</span>
                    {needsFolder && <span className="rounded-full border border-admin-line-strong px-1.5 text-[11px] leading-4 text-admin-muted">Needs folder</span>}
                  </span>
                  <span className="block text-xs leading-5 text-admin-muted">{TARGET_HINT[t]}</span>
                  {!built.ok && !needsFolder && <span className="block text-xs leading-5 text-admin-muted">{t === "web" && webReason && !where.repo && prompt.length <= LIMIT.web ? webReason : built.reason}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {/* Copy sits in the menu wherever it is not already beside the button, in every state. */}
      {(compact || copyInMenu) && (
        <div className="mt-1.5 border-t border-admin-line p-1.5 pt-3">
          <CopyButton text={prompt} className="w-full md:min-h-11" onCopied={opened} />
        </div>
      )}
      {compact && <div className="mt-1.5 border-t border-admin-line px-2.5 pb-1 pt-2.5">{repoLine}</div>}
      <p role="status" className="px-2.5 pb-1 text-xs text-admin-muted empty:hidden">{note}</p>
      <div aria-hidden className="pointer-events-none sticky -bottom-1.5 -mx-1.5 -mb-1.5 -mt-8 hidden h-8 rounded-b-card bg-linear-to-t from-[var(--menu-bg,var(--color-admin-surface))] to-transparent group-data-[more=true]/menu:block" />
    </div>
  ) : null;
  // The sheet lives on the page's body, clear of any bar that would trap a fixed element.
  const portal = sheet && typeof document !== "undefined";

  return (
    <div className={className} onKeyDown={onRootKey} onBlur={onBlur}>
      <div className="flex flex-wrap items-center gap-3">
        <div ref={anchor} className={`${asIcon ? "" : "relative "}inline-flex items-stretch`}>
          {main.ok ? (
            <a ref={mainRef} href={main.href} onClick={opened} className={`${look} rounded-r-none${size}${asIcon ? " min-h-11 min-w-11 justify-center px-2" : ""}`} {...mainName}>{mainBody}</a>
          ) : (
            <button
              ref={mainRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              className={`${look} rounded-r-none${size}${asIcon ? " min-h-11 min-w-11 justify-center px-2" : ""}`}
              {...mainName}
              onClick={() => (open ? closeTo(openerEl) : openFrom("main"))}
            >{mainBody}</button>
          )}
          <button
            ref={chevron}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            aria-label="Choose where to open"
            className={`${look} min-w-11 rounded-l-none${size} border-l border-l-admin-line-strong px-2`}
            onClick={() => (open ? closeTo(() => chevron.current) : openFrom("chevron"))}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && !open) {
                e.preventDefault();
                openFrom("chevron");
              }
            }}
          >
            <ChevronDown aria-hidden className="h-4 w-4" />
          </button>
          {!portal && menu}
        </div>
        {!compact && !copyInMenu && <CopyButton text={prompt} className="md:min-h-11" onCopied={opened} />}
      </div>
      {!compact && (
        <div className="mt-2">{repoLine}</div>
      )}
      {portal && menu && createPortal(
        <>
          <div ref={scrim} aria-hidden className="fixed inset-0 z-40 bg-admin-canvas/60" onClick={() => closeTo(openerEl)} />
          {menu}
        </>,
        document.body,
      )}
    </div>
  );
}
