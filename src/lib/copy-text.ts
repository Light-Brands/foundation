export type CopyRecord = () => Promise<{ ok: boolean; message: string }>;
export type CopyResult = { ok: boolean; message: string };

const BLOCKED = "Your browser did not allow the copy. Try once more.";
const NOT_RECORDED = "That copy could not be recorded. Try once more.";

/**
 * Copies text to the clipboard. With before, the text is copied only once before resolves ok, so a copy the
 * server must record is never made without that record. Safari allows a copy only inside the click, so where
 * the browser has ClipboardItem the write starts at once and takes the text as a promise that settles after
 * the record. Never put an await ahead of the call. Where ClipboardItem is missing it records first and then
 * uses writeText.
 */
export function copyText(text: string, before?: CopyRecord): Promise<CopyResult> {
  const clip = typeof navigator === "undefined" ? undefined : navigator.clipboard;
  if (before && clip && typeof clip.write === "function" && typeof ClipboardItem !== "undefined") {
    let refused: string | null = null;
    const blob = before().then(
      (r) => {
        if (r.ok) return new Blob([text], { type: "text/plain" });
        refused = r.message;
        return Promise.reject(new Error(r.message));
      },
      (err: unknown) => { refused = NOT_RECORDED; return Promise.reject(err); },
    );
    return clip.write([new ClipboardItem({ "text/plain": blob })]).then(
      () => ({ ok: true, message: "" }),
      () => ({ ok: false, message: refused ?? BLOCKED }),
    );
  }
  return (async () => {
    if (before) {
      let r: { ok: boolean; message: string };
      try { r = await before(); } catch { return { ok: false, message: NOT_RECORDED }; }
      if (!r.ok) return { ok: false, message: r.message };
    }
    try {
      await clip?.writeText(text);
    } catch {
      return { ok: false, message: BLOCKED };
    }
    if (!clip) return { ok: false, message: BLOCKED };
    return { ok: true, message: "" };
  })();
}
