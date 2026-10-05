import { describe, it, expect } from "vitest";
import path from "node:path";
import { validateProfile, PROFILE_FIELDS, type Profile } from "@/lib/validate";
import { getProfile, saveProfile } from "@/lib/data/profile";
import { openPglite } from "@/lib/db/pglite";
import { migrate } from "@/lib/db/migrate";

const EMPTY: Profile = Object.fromEntries(PROFILE_FIELDS.map((k) => [k, ""])) as Profile;
const MIGRATIONS = path.join(__dirname, "../../core/db/migrations");

describe("validateProfile", () => {
  it("needs a business name and trims everything", () => {
    const r = validateProfile({ business: "  Harbor Studio  ", what_we_do: " Calm work " });
    expect(r).toEqual({ ok: true, value: { ...EMPTY, business: "Harbor Studio", what_we_do: "Calm work" } });
  });
  it("rejects an empty name, a bad email and oversized fields", () => {
    const r = validateProfile({ business: "", email: "nope", what_we_do: "x".repeat(300) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["business", "email", "what_we_do"]);
  });
});

describe("validateProfile context block", () => {
  it("accepts and trims every context-block field", () => {
    const r = validateProfile({ business: " Harbor ", city: " Austin ", timezone: "America/Chicago", owner_name: "Ada Lane" });
    expect(r.ok && r.value.city).toBe("Austin");
    expect(r.ok && r.value.owner_first).toBe("Ada");
  });
  it("rejects a time zone that is not an IANA name", () => {
    const r = validateProfile({ business: "Harbor", timezone: "Central-ish" });
    expect(r.ok).toBe(false);
  });
});

describe("profile storage", () => {
  it("falls back to the env name in preview", async () => {
    expect((await getProfile(null, "Harbor Studio")).business).toBe("Harbor Studio");
  });
  it("saves and reads the one profile row", async () => {
    const db = await openPglite();
    await migrate(db, MIGRATIONS, "core");
    await saveProfile(db, { ...EMPTY, business: "Harbor", what_we_do: "t", email: "a@b.co" });
    await saveProfile(db, { ...EMPTY, business: "Harbor Studio", what_we_do: "t", email: "a@b.co", city: "Austin", owner_first: "Ada" });
    const got = await getProfile(db, "x");
    expect(got.business).toBe("Harbor Studio");
    expect(got.city).toBe("Austin");
    expect(got.owner_first).toBe("Ada");
    await db.close();
  });
});
