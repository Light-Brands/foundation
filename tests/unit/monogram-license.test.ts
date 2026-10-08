import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { MONOGRAM_FONTS } from "@/lib/pwa/monogram-fonts";

// Under the SIL Open Font License 1.1 (condition 3), a modified font, and a subset is one, may not use a Reserved
// Font Name. Each embedded cut is read the way a font tool reads it: its name table, every record.
function names(b64: string): Map<number, string[]> {
  const buf = Buffer.from(b64, "base64");
  const tables = buf.readUInt16BE(4);
  let name = -1;
  for (let i = 0; i < tables; i++) {
    const rec = 12 + i * 16;
    if (buf.toString("latin1", rec, rec + 4) === "name") name = buf.readUInt32BE(rec + 8);
  }
  if (name < 0) throw new Error("no name table");
  const count = buf.readUInt16BE(name + 2);
  const strings = name + buf.readUInt16BE(name + 4);
  const out = new Map<number, string[]>();
  for (let i = 0; i < count; i++) {
    const r = name + 6 + i * 12;
    const platform = buf.readUInt16BE(r);
    const id = buf.readUInt16BE(r + 6);
    const len = buf.readUInt16BE(r + 8);
    const at = strings + buf.readUInt16BE(r + 10);
    const raw = buf.subarray(at, at + len);
    const text = platform === 1 ? raw.toString("latin1") : Buffer.from(raw).swap16().toString("utf16le");
    out.set(id, [...(out.get(id) ?? []), text]);
  }
  return out;
}

describe("the embedded monogram cuts", () => {
  it("never keep a Reserved Font Name in a modified cut", () => {
    for (const [pairing, cut] of Object.entries(MONOGRAM_FONTS)) {
      const n = names(cut.data);
      const legal = [...(n.get(0) ?? []), ...(n.get(13) ?? [])].join("\n");
      const reserved = [...legal.matchAll(/Reserved Font Names? "([^"]+)"/g)].map((m) => m[1]);
      const naming = [1, 3, 4, 6, 16, 17, 18].flatMap((id) => n.get(id) ?? []).concat(cut.name).join("\n").toLowerCase();
      for (const rfn of reserved) {
        expect(naming, `${pairing} keeps "${rfn}"`).not.toContain(rfn.toLowerCase());
        expect(naming, `${pairing} keeps "${rfn}"`).not.toContain(rfn.toLowerCase().replace(/\s+/g, ""));
      }
    }
  });
  it("keep each family's copyright line and the license with them", () => {
    for (const [pairing, cut] of Object.entries(MONOGRAM_FONTS)) {
      const n = names(cut.data);
      expect((n.get(0) ?? []).join(" "), pairing).toMatch(/Copyright/);
      expect([...(n.get(13) ?? []), ...(n.get(14) ?? [])].join(" "), pairing).toMatch(/Open Font License|OFL|openfontlicense/i);
    }
    expect(readFileSync("src/lib/pwa/fonts/OFL.txt", "utf8")).toContain("SIL OPEN FONT LICENSE Version 1.1");
    expect(existsSync("THIRD_PARTY_NOTICES.md")).toBe(true);
  });
});
