import { describe, it, expect, afterEach, vi } from "vitest";
import { copyText } from "@/lib/copy-text";

// Safari only allows a copy made inside the click, so the clipboard write must start before the server
// record finishes and hand the browser the text as a promise. These tests mock the clipboard.

type Item = { "text/plain": Promise<Blob> };
class FakeItem { constructor(public data: Item) {} }

function install(opts: { item?: boolean; write?: boolean } = {}) {
  const calls: string[] = [];
  const clipboard: Record<string, unknown> = {
    writeText: vi.fn(async (t: string) => { calls.push(`writeText:${t}`); }),
  };
  if (opts.write !== false) {
    clipboard.write = vi.fn(async (items: FakeItem[]) => {
      calls.push("write:started");
      const blob = await items[0].data["text/plain"];
      calls.push(`write:${await blob.text()}`);
    });
  }
  vi.stubGlobal("navigator", { clipboard });
  vi.stubGlobal("ClipboardItem", opts.item !== false ? FakeItem : undefined);
  return { calls, clipboard };
}
afterEach(() => { vi.unstubAllGlobals(); });

describe("copyText", () => {
  it("starts the clipboard write before the record finishes, then copies once it is ok", async () => {
    const { calls, clipboard } = install();
    let release!: (v: { ok: boolean; message: string }) => void;
    const before = vi.fn(() => new Promise<{ ok: boolean; message: string }>((r) => { release = r; }));
    const done = copyText("hello", before);
    expect(clipboard.write).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(["write:started"]);
    release({ ok: true, message: "" });
    expect(await done).toEqual({ ok: true, message: "" });
    expect(calls).toEqual(["write:started", "write:hello"]);
    expect(clipboard.writeText).not.toHaveBeenCalled();
  });
  it("copies nothing and returns the message when the record is refused", async () => {
    const { calls } = install();
    const r = await copyText("hello", async () => ({ ok: false, message: "Your session ended." }));
    expect(r).toEqual({ ok: false, message: "Your session ended." });
    expect(calls).not.toContain("write:hello");
  });
  it("falls back to writeText after the record where ClipboardItem is missing", async () => {
    const { calls, clipboard } = install({ item: false });
    const order: string[] = [];
    const r = await copyText("hello", async () => { order.push("recorded"); return { ok: true, message: "" }; });
    expect(r.ok).toBe(true);
    expect(clipboard.writeText).toHaveBeenCalledWith("hello");
    expect(calls).toEqual(["writeText:hello"]);
    expect(order).toEqual(["recorded"]);
  });
  it("falls back to writeText, never copying before a refusal, where write is missing", async () => {
    const { calls } = install({ write: false });
    expect(await copyText("hello", async () => ({ ok: false, message: "No." }))).toEqual({ ok: false, message: "No." });
    expect(calls).toEqual([]);
  });
  it("copies with no record step", async () => {
    const { calls } = install();
    expect((await copyText("hello")).ok).toBe(true);
    expect(calls).toEqual(["writeText:hello"]);
  });
  it("says so when the browser refuses the copy", async () => {
    const { clipboard } = install();
    (clipboard.write as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("NotAllowedError"));
    expect(await copyText("hello", async () => ({ ok: true, message: "" }))).toEqual({ ok: false, message: "Your browser did not allow the copy. Try once more." });
  });
  it("a record step that throws is a failure with a plain message", async () => {
    install();
    const r = await copyText("hello", async () => { throw new Error("network"); });
    expect(r.ok).toBe(false);
    expect(r.message).not.toBe("");
  });
});
