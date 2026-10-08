import { describe, it, expect } from "vitest";
import path from "node:path";
import { validateProfile, PROFILE_FIELDS, type Profile } from "@/lib/validate";
import { getProfile, saveProfile, setChiefName } from "@/lib/data/profile";
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
  it("keeps a first name the person chose", () => {
    const r = validateProfile({ business: "Harbor", owner_name: "Ada Lane", owner_first: "Addie" });
    expect(r.ok && r.value.owner_first).toBe("Addie");
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

describe("setChiefName", () => {
  it("names the chief of staff, keeps every other fact, and clears back to empty", async () => {
    const db = await openPglite();
    await migrate(db, MIGRATIONS, "core");
    await saveProfile(db, { ...EMPTY, business: "Harbor Studio", city: "Austin" });
    const r = await setChiefName(db, "  Sage ", "x");
    expect(r.ok && [r.profile.chief_name, r.profile.business, r.profile.city]).toEqual(["Sage", "Harbor Studio", "Austin"]);
    expect((await setChiefName(db, "R2D2", "x")).ok).toBe(false);
    expect((await getProfile(db, "x")).chief_name).toBe("Sage");
    const cleared = await setChiefName(db, "", "x");
    expect(cleared.ok && cleared.profile.chief_name).toBe("");
    await db.close();
  });
  it("starts the row when there is none yet", async () => {
    const db = await openPglite();
    await migrate(db, MIGRATIONS, "core");
    const r = await setChiefName(db, "Sage", "Harbor Studio");
    expect(r.ok && [r.profile.business, r.profile.chief_name]).toEqual(["Harbor Studio", "Sage"]);
    await db.close();
  });
});

describe("working hours", () => {
  const base = { business: "Harbor" };
  it("stores days in week order from any spacing and case", () => {
    const r = validateProfile({ ...base, work_days: "Fri, mon  TUE", work_start: "09:00", work_end: "17:30" });
    expect(r.ok && [r.value.work_days, r.value.work_start, r.value.work_end]).toEqual(["mon,tue,fri", "09:00", "17:30"]);
  });
  it("accepts all three empty", () => {
    const r = validateProfile(base);
    expect(r.ok && r.value.work_days).toBe("");
  });
  it("refuses unknown or repeated days", () => {
    for (const d of ["monday", "mon,mon", "mon;tue"]) {
      const r = validateProfile({ ...base, work_days: d, work_start: "09:00", work_end: "17:00" });
      expect(!r.ok && r.errors.work_days, d).toBe("List your working days, such as mon, tue, wed, thu, fri.");
    }
  });
  it("refuses times that are not HH:MM on a 24 hour clock", () => {
    const r = validateProfile({ ...base, work_days: "mon", work_start: "9am", work_end: "24:00" });
    expect(!r.ok && [r.errors.work_start, r.errors.work_end]).toEqual(["Use a 24 hour time like 09:00.", "Use a 24 hour time like 17:00."]);
  });
  it("refuses a closing time that is not after the opening time", () => {
    const r = validateProfile({ ...base, work_days: "mon", work_start: "17:00", work_end: "09:00" });
    expect(!r.ok && r.errors.work_end).toBe("Make closing time later than opening time.");
  });
  it("refuses a partial set and points at each missing field", () => {
    const r = validateProfile({ ...base, work_days: "mon" });
    expect(!r.ok && [r.errors.work_start, r.errors.work_end]).toEqual([
      "Add this too, or clear all three working hours fields.",
      "Add this too, or clear all three working hours fields.",
    ]);
  });
  it("saves and reads the three fields", async () => {
    const db = await openPglite();
    await migrate(db, MIGRATIONS, "core");
    await saveProfile(db, { ...EMPTY, business: "Harbor", work_days: "mon,tue", work_start: "09:00", work_end: "17:00" });
    const got = await getProfile(db, "x");
    expect([got.work_days, got.work_start, got.work_end]).toEqual(["mon,tue", "09:00", "17:00"]);
    await db.close();
  });
});

describe("postal address", () => {
  it("is a business fact, saved, read back and kept to one line of up to 300 characters", async () => {
    const r = validateProfile({ business: "Harbor", postal_address: " 12 Harbor Way, Portland, OR 97201 " });
    expect(r.ok && r.value.postal_address).toBe("12 Harbor Way, Portland, OR 97201");
    expect(validateProfile({ business: "Harbor", postal_address: "x".repeat(301) }).ok).toBe(false);
    expect(validateProfile({ business: "Harbor", postal_address: "12 Harbor Way\nBcc: x" }).ok).toBe(false);
    const db = await openPglite();
    await migrate(db, MIGRATIONS, "core");
    await saveProfile(db, { ...EMPTY, business: "Harbor", postal_address: "12 Harbor Way, Portland, OR 97201" });
    expect((await getProfile(db, "x")).postal_address).toBe("12 Harbor Way, Portland, OR 97201");
    await db.close();
  });
});
