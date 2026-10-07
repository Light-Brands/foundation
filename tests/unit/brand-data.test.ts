import { describe, it, expect } from "vitest";
import { CORE_MIGRATIONS } from "../support/db";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";
import { getBrand } from "@/lib/data/brand";
import { DEFAULT_BRAND } from "@/lib/brand/tokens";

describe("getBrand", () => {
  it("gives the default brand with no database", async () => {
    expect(await getBrand(null)).toEqual(DEFAULT_BRAND);
  });
  it("gives the default brand before anything is saved", async () => {
    const db = await openPglite();
    await migrate(db, CORE_MIGRATIONS, "core");
    expect(await getBrand(db)).toEqual(DEFAULT_BRAND);
    await db.close();
  });
  it("merges a partial saved brand over the default", async () => {
    const db = await openPglite();
    await migrate(db, CORE_MIGRATIONS, "core");
    await db.query("insert into core_brand (id, tokens) values (1, $1)", [{ colors: { accent: "#0055ff" }, pairing: "editorial" }]);
    const b = await getBrand(db);
    expect(b.colors.accent).toBe("#0055ff");
    expect(b.colors.canvas).toBe(DEFAULT_BRAND.colors.canvas);
    expect(b.pairing).toBe("editorial");
    await db.close();
  });
  it("keeps one brand row only", async () => {
    const db = await openPglite();
    await migrate(db, CORE_MIGRATIONS, "core");
    await expect(db.query("insert into core_brand (id) values (2)")).rejects.toThrow();
    await db.close();
  });
});
