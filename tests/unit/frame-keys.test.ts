import { describe, it, expect } from "vitest";
import { isSidebarToggle } from "@/components/frame/AdminFrame";

const ev = (over: Partial<{ metaKey: boolean; ctrlKey: boolean; key: string; target: unknown }>) =>
  ({ metaKey: false, ctrlKey: false, key: "b", target: null, ...over }) as unknown as KeyboardEvent;
const el = (tag: string, editable = false) => ({ tagName: tag, isContentEditable: editable });

describe("the sidebar shortcut", () => {
  it("toggles on Cmd or Ctrl and B outside a text field", () => {
    expect(isSidebarToggle(ev({ metaKey: true }))).toBe(true);
    expect(isSidebarToggle(ev({ ctrlKey: true, key: "B", target: el("DIV") }))).toBe(true);
    expect(isSidebarToggle(ev({ key: "b" }))).toBe(false);
  });
  it("leaves Cmd or Ctrl and B to text fields, where it means bold", () => {
    for (const t of [el("INPUT"), el("TEXTAREA"), el("SELECT"), el("DIV", true)]) expect(isSidebarToggle(ev({ metaKey: true, target: t }))).toBe(false);
  });
});
