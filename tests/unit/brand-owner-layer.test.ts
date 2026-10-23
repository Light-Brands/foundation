import { describe, it, expect, vi, afterEach } from "vitest";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parse } from "yaml";
import { CORE_MIGRATIONS } from "../support/db";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";
import { getBrand } from "@/lib/data/brand";
import { readOwnerBrand, OWNER_BRAND_FILE } from "@/lib/data/owner-brand";
import { DEFAULT_BRAND, NEUTRALS, adminCanvas, brandLayerProblems, contrastRatio, parseBrand, type BrandTokens } from "@/lib/brand/tokens";
import { ADMIN_TONES, TONES, toneContrastProblems, toneVars } from "@/lib/brand/admin-tone";
import { brandTone, oklch } from "@/lib/brand/neutrals";
import { brandCss } from "@/lib/brand/css";
import { checkKeyFolder } from "@/lib/key/formats";
import { buildInventory } from "@/lib/key/inventory";

// The owner's own look lives in key/brand.yaml, layered between the Foundation's default and the saved brand row,
// so a prompt that restyles the command center never edits DEFAULT_BRAND or the pinned admin tones.

function root(brandYaml?: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), "owner-brand-"));
  cpSync(path.join(process.cwd(), "key"), path.join(dir, "key"), { recursive: true });
  if (brandYaml !== undefined) writeFileSync(path.join(dir, OWNER_BRAND_FILE), brandYaml);
  return dir;
}

const OWNER = `colors:
  accent: "#0e7490"
  primary: "#164e63"
pairing: editorial
radiusCard: 4
density: airy
neutrals: brand
`;

afterEach(() => vi.restoreAllMocks());

describe("the owner brand layer", () => {
  it("without key/brand.yaml the brand equals DEFAULT_BRAND", async () => {
    const r = root();
    expect(await readOwnerBrand(r)).toEqual(DEFAULT_BRAND);
    expect(await getBrand(null, await readOwnerBrand(r))).toEqual(DEFAULT_BRAND);
  });

  it("key/brand.yaml values override DEFAULT_BRAND", async () => {
    const owner = await readOwnerBrand(root(OWNER));
    expect(owner.colors.accent).toBe("#0e7490");
    expect(owner.colors.primary).toBe("#164e63");
    expect(owner.colors.canvas).toBe(DEFAULT_BRAND.colors.canvas);
    expect(owner).toMatchObject({ pairing: "editorial", radiusCard: 4, density: "airy", neutrals: "brand" });
    expect(owner.radiusControl).toBe(DEFAULT_BRAND.radiusControl);
    expect(owner.adminTone).toBe(DEFAULT_BRAND.adminTone);
    // With no database and with an empty brand row, the owner's layer is what renders.
    expect(await getBrand(null, owner)).toEqual(owner);
    const db = await openPglite();
    await migrate(db, CORE_MIGRATIONS, "core");
    expect(await getBrand(db, owner)).toEqual(owner);
    await db.close();
  });

  it("the saved row overrides key/brand.yaml", async () => {
    const owner = await readOwnerBrand(root(OWNER));
    const db = await openPglite();
    await migrate(db, CORE_MIGRATIONS, "core");
    await db.query("insert into core_brand (id, tokens) values (1, $1)", [{ colors: { accent: "#7c3aed" }, pairing: "modern", neutrals: "slate" }]);
    const b = await getBrand(db, owner);
    expect(b.colors.accent).toBe("#7c3aed");
    expect(b.pairing).toBe("modern");
    expect(b.neutrals).toBe("slate");
    // What the row leaves out still comes from the owner's layer, then the default.
    expect(b.colors.primary).toBe("#164e63");
    expect(b.radiusCard).toBe(4);
    expect(b.density).toBe("airy");
    expect(b.colors.canvas).toBe(DEFAULT_BRAND.colors.canvas);
    await db.close();
  });

  it("an out of range or unknown key is ignored and logged once", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = root(`colors:
  accent: "#0e7490"
  ink: red
  sparkle: "#ffffff"
radiusCard: 99
density: roomy
favoriteColor: teal
type:
  headingWeight: 450
  displayWeight: 600
neutrals: plaid
`);
    const first = await readOwnerBrand(r);
    const second = await readOwnerBrand(r);
    expect(second).toEqual(first);
    expect(first.colors.accent).toBe("#0e7490");
    expect(first.colors.ink).toBe(DEFAULT_BRAND.colors.ink);
    expect(first.radiusCard).toBe(DEFAULT_BRAND.radiusCard);
    expect(first.density).toBe(DEFAULT_BRAND.density);
    expect(first.neutrals).toBe("slate");
    expect(first.type).toEqual({ displayWeight: 600 });
    expect(first).not.toHaveProperty("favoriteColor");
    const lines = warn.mock.calls.map((c) => String(c[0]));
    for (const name of ["colors.ink", "colors.sparkle", "radiusCard", "density", "favoriteColor", "type.headingWeight", "neutrals"]) {
      expect(lines.filter((l) => l.includes(`key/brand.yaml: ${name} `)), name).toHaveLength(1);
    }
    expect(lines).toHaveLength(7);
    // Broken YAML is never thrown at a visitor: the default renders and the problem is named once.
    const broken = root("colors: [unclosed");
    expect(await readOwnerBrand(broken)).toEqual(DEFAULT_BRAND);
    expect(await readOwnerBrand(broken)).toEqual(DEFAULT_BRAND);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("not valid YAML"))).toHaveLength(1);
  });

  it("neutrals defaults to slate and leaves every tone's colors unchanged", () => {
    expect(NEUTRALS).toEqual(["slate", "brand"]);
    expect(DEFAULT_BRAND.neutrals).toBe("slate");
    expect(parseBrand(null).neutrals).toBe("slate");
    const before = JSON.stringify(TONES);
    for (const tone of ADMIN_TONES) {
      const b: BrandTokens = { ...DEFAULT_BRAND, adminTone: tone };
      expect(brandTone(b)).toBe(TONES[tone]);
      expect(brandCss(b)).toContain(toneVars(tone).join(""));
      expect(adminCanvas(b)).toBe(TONES[tone].neutrals.canvas);
    }
    expect(JSON.stringify(TONES)).toBe(before);
  });

  it("neutrals brand tints the neutral grays with the brand hue and keeps text contrast at 4.5 to 1", () => {
    const before = JSON.stringify(TONES);
    for (const primary of ["#1f483a", "#164e63", "#7c2d12", "#6d28d9", "#be185d", "#a16207"]) {
      for (const tone of ADMIN_TONES) {
        const b: BrandTokens = { ...DEFAULT_BRAND, colors: { ...DEFAULT_BRAND.colors, primary }, adminTone: tone, neutrals: "brand" };
        const scale = brandTone(b);
        expect(toneContrastProblems(scale), `${primary} ${tone}`).toEqual([]);
        for (const fg of ["ink", "muted", "faint"] as const) {
          for (const bg of ["canvas", "surface", "hover"] as const) {
            expect(contrastRatio(scale.neutrals[fg], scale.neutrals[bg])).toBeGreaterThanOrEqual(4.5);
          }
        }
        expect(scale.status).toEqual(TONES[tone].status);
        expect(scale.scheme).toBe(TONES[tone].scheme);
        // The grays now lean toward the brand: muted carries the brand's hue at low chroma.
        const m = oklch(scale.neutrals.muted);
        const want = oklch(primary).h;
        const gap = Math.min(Math.abs(m.h - want), 360 - Math.abs(m.h - want));
        expect(m.c, `${primary} ${tone}`).toBeGreaterThan(0.005);
        expect(m.c).toBeLessThan(0.05);
        expect(gap, `${primary} ${tone}`).toBeLessThan(12);
        expect(scale.neutrals.muted).not.toBe(TONES[tone].neutrals.muted);
        const css = brandCss(b);
        expect(css).toContain(`--admin-muted:${scale.neutrals.muted};`);
        expect(css).not.toContain(`--admin-muted:${TONES[tone].neutrals.muted};`);
        expect(adminCanvas(b)).toBe(scale.neutrals.canvas);
      }
    }
    expect(JSON.stringify(TONES)).toBe(before);
  });

  it("the Key checks accept key/brand.yaml", async () => {
    expect(await checkKeyFolder(root(OWNER))).toEqual([]);
    const bad = (await checkKeyFolder(root("density: roomy\nsparkle: 1\n"))).join("\n");
    expect(bad).toContain("key/brand.yaml: density ");
    expect(bad).toContain("key/brand.yaml: sparkle ");
    expect((await checkKeyFolder(root("colors: [unclosed"))).join("\n")).toContain("key/brand.yaml: not valid YAML");
    // The example in docs/standards/key.md is a valid owner layer.
    const md = readFileSync(path.join(process.cwd(), "docs/standards/key.md"), "utf8");
    const at = md.indexOf("\n## Brand\n");
    expect(at).toBeGreaterThan(-1);
    const example = /```yaml\n([\s\S]*?)\n```/.exec(md.slice(at))![1];
    expect(brandLayerProblems(parse(example))).toEqual([]);
    expect(await checkKeyFolder(root(example))).toEqual([]);
    // system.md names the owner's look when the file is there, and says nothing of it otherwise.
    const ring = readFileSync(path.join(process.cwd(), "key/key.yaml"), "utf8");
    expect(buildInventory(ring, { brand: true })).toContain("key/brand.yaml");
    expect(buildInventory(ring)).not.toContain("brand.yaml");
  });
});
