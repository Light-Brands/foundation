import { describe, it, expect } from "vitest";
import { readDefault, writeDefault, readFolder, writeFolder } from "@/lib/claude/default";

function store(): Storage {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), clear: () => m.clear(), key: () => null, length: 0 } as Storage;
}
const throwing = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } } as unknown as Storage;

describe("the remembered default", () => {
  it("starts at Claude Desktop and remembers a choice", () => {
    const s = store();
    expect(readDefault(s)).toBe("desktop");
    expect(writeDefault(s, "terminal")).toBe(true);
    expect(readDefault(s)).toBe("terminal");
  });
  it("ignores a stored value it does not know", () => {
    const s = store(); s.setItem("foundation.openIn.default", "fax");
    expect(readDefault(s)).toBe("desktop");
  });
  it("survives storage that throws or is missing", () => {
    expect(readDefault(throwing)).toBe("desktop");
    expect(writeDefault(throwing, "web")).toBe(false);
    expect(readDefault(null)).toBe("desktop");
  });
  it("keeps an absolute folder path and refuses anything else", () => {
    const s = store();
    expect(writeFolder(s, "/Users/jo/harbor")).toBe(true);
    expect(readFolder(s)).toBe("/Users/jo/harbor");
    expect(writeFolder(s, "harbor")).toBe(false);
    expect(writeFolder(s, "C:\\Users\\jo\\harbor")).toBe(true);
  });
});
