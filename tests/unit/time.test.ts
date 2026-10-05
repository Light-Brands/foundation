import { describe, it, expect } from "vitest";
import { businessTimeZone, formatCardTime } from "@/lib/time";

// 06:30 UTC on a Monday is still Sunday evening in Los Angeles: the card must show the business's day.
const AT = "2026-10-05 06:30:00.123456+00";

describe("card times", () => {
  it("render in the business time zone from the profile, whatever the server's zone", () => {
    const before = process.env.TZ;
    try {
      for (const serverZone of ["UTC", "Asia/Tokyo", "America/New_York"]) {
        process.env.TZ = serverZone;
        expect(formatCardTime(AT, "America/Los_Angeles")).toBe("Oct 4, 2026, 11:30 PM PDT");
        expect(formatCardTime(AT, "Asia/Tokyo")).toBe("Oct 5, 2026, 3:30 PM GMT+9");
      }
    } finally {
      if (before === undefined) delete process.env.TZ;
      else process.env.TZ = before;
    }
  });
  it("fall back to UTC when the profile has no time zone or a bad one", () => {
    expect(businessTimeZone("")).toBe("UTC");
    expect(businessTimeZone("Central-ish")).toBe("UTC");
    expect(businessTimeZone(" America/Chicago ")).toBe("America/Chicago");
    expect(formatCardTime(AT, "")).toBe("Oct 5, 2026, 6:30 AM UTC");
    expect(formatCardTime("2026-10-05T06:30:00Z", undefined)).toBe("Oct 5, 2026, 6:30 AM UTC");
  });
  it("read the database's text form of a timestamp", () => {
    expect(formatCardTime("2026-10-05 06:30:00+00", "UTC")).toBe("Oct 5, 2026, 6:30 AM UTC");
    expect(formatCardTime("2026-10-05 06:30:00-07", "UTC")).toBe("Oct 5, 2026, 1:30 PM UTC");
    expect(formatCardTime("not a time", "UTC")).toBe("not a time");
  });
});
