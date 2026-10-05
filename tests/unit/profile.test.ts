import { describe, it, expect } from "vitest";
import path from "node:path";
import { validateProfile } from "@/lib/validate";
import { getProfile, saveProfile } from "@/lib/data/profile";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";

const MIGRATIONS = path.join(__dirname, "../../core/db/migrations");

describe("validateProfile", () => {
  it("needs a business name and trims everything", () => {
    const r = validateProfile({ business_name: "  Harbor Studio  ", tagline: " Calm work " });
    expect(r).toEqual({ ok: true, value: { business_name: "Harbor Studio", tagline: "Calm work", email: "", phone: "", website: "" } });
  });
  it("rejects an empty name, a bad email and oversized fields", () => {
    const r = validateProfile({ business_name: "", email: "nope", tagline: "x".repeat(300) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["business_name", "email", "tagline"]);
  });
});

describe("profile storage", () => {
  it("falls back to the env name in preview", async () => {
    expect((await getProfile(null, "Harbor Studio")).business_name).toBe("Harbor Studio");
  });
  it("saves and reads the one profile row", async () => {
    const db = await openPglite();
    await migrate(db, MIGRATIONS, "core");
    await saveProfile(db, { business_name: "Harbor", tagline: "t", email: "a@b.co", phone: "", website: "" });
    await saveProfile(db, { business_name: "Harbor Studio", tagline: "t", email: "a@b.co", phone: "", website: "" });
    expect((await getProfile(db, "x")).business_name).toBe("Harbor Studio");
    await db.close();
  });
});
