import { describe, it, expect } from "vitest";
import { businessTimeZone, formatCardTime, formatRelativeTime, toIsoTime, businessDate, businessWeekday, businessWeekStart, businessClock, isOpenAt, workingHours, formatTodayKicker } from "@/lib/time";

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

describe("the business's clock", () => {
  // 2026-10-05T06:30:00Z is 23:30 on Sunday, October 4 in Portland.
  const lateSunday = new Date("2026-10-05T06:30:00Z");
  it("dates and weeks follow the business's zone", () => {
    expect(businessDate("America/Los_Angeles", lateSunday)).toBe("2026-10-04");
    expect(businessWeekday("America/Los_Angeles", lateSunday)).toBe("sun");
    expect(businessWeekStart("America/Los_Angeles", lateSunday)).toBe("2026-09-28");
    expect(businessWeekStart("UTC", lateSunday)).toBe("2026-10-05");
    expect(businessClock("America/Los_Angeles", lateSunday)).toBe("23:30");
  });
  it("falls back to UTC for an empty or unknown zone", () => {
    expect(businessDate("", lateSunday)).toBe("2026-10-05");
    expect(businessDate("Mars/Base", lateSunday)).toBe("2026-10-05");
  });
  it("reads midnight as 00:00", () => {
    expect(businessClock("UTC", new Date("2026-10-05T00:00:00Z"))).toBe("00:00");
  });
});

describe("isOpenAt", () => {
  const hours = workingHours({ work_days: "mon,tue,wed,thu,fri", work_start: "09:00", work_end: "17:00" });
  const tz = "America/Los_Angeles";
  it("is open on a working day inside the hours, with the end excluded", () => {
    expect(isOpenAt(hours, tz, new Date("2026-10-05T16:00:00Z"))).toBe(true); // Monday 09:00
    expect(isOpenAt(hours, tz, new Date("2026-10-05T23:59:00Z"))).toBe(true); // Monday 16:59
    expect(isOpenAt(hours, tz, new Date("2026-10-06T00:00:00Z"))).toBe(false); // Monday 17:00
  });
  it("is closed on a day off", () => {
    expect(isOpenAt(hours, tz, new Date("2026-10-04T18:00:00Z"))).toBe(false); // Sunday 11:00
  });
  it("is always open when no hours are set", () => {
    expect(workingHours({ work_days: "", work_start: "", work_end: "" })).toBeNull();
    expect(isOpenAt(null, tz, new Date("2026-10-04T18:00:00Z"))).toBe(true);
  });
});

describe("daylight saving and week edges", () => {
  const LA = "America/Los_Angeles";
  it("spring forward: 2026-03-08 02:00 does not exist, the clock jumps from 01:59 PST to 03:00 PDT", () => {
    expect(businessClock(LA, new Date("2026-03-08T09:59:00Z"))).toBe("01:59");
    expect(businessClock(LA, new Date("2026-03-08T10:00:00Z"))).toBe("03:00");
    expect(businessDate(LA, new Date("2026-03-08T10:00:00Z"))).toBe("2026-03-08");
    expect(businessWeekday(LA, new Date("2026-03-08T10:00:00Z"))).toBe("sun");
    expect(businessWeekStart(LA, new Date("2026-03-08T10:00:00Z"))).toBe("2026-03-02");
  });
  it("fall back: 2026-11-01 01:30 happens twice and the date stays put", () => {
    expect(businessClock(LA, new Date("2026-11-01T08:30:00Z"))).toBe("01:30"); // PDT
    expect(businessClock(LA, new Date("2026-11-01T09:30:00Z"))).toBe("01:30"); // PST
    expect(businessDate(LA, new Date("2026-11-01T09:30:00Z"))).toBe("2026-11-01");
    expect(businessClock(LA, new Date("2026-11-01T10:00:00Z"))).toBe("02:00");
    expect(businessWeekStart(LA, new Date("2026-11-01T09:30:00Z"))).toBe("2026-10-26");
  });
  it("a zone without daylight saving keeps one offset all year", () => {
    expect(businessClock("Asia/Kolkata", new Date("2026-03-08T10:00:00Z"))).toBe("15:30");
    expect(businessClock("Asia/Kolkata", new Date("2026-11-01T10:00:00Z"))).toBe("15:30");
    expect(businessClock("UTC", new Date("2026-03-08T10:00:00Z"))).toBe("10:00");
    expect(businessClock("UTC", new Date("2026-11-01T10:00:00Z"))).toBe("10:00");
  });
  it("the week turns over between Sunday 23:59 and Monday 00:00", () => {
    const sun = new Date("2026-10-04T23:59:00Z");
    const mon = new Date("2026-10-05T00:00:00Z");
    expect(businessWeekday("UTC", sun)).toBe("sun");
    expect(businessWeekStart("UTC", sun)).toBe("2026-09-28");
    expect(businessWeekday("UTC", mon)).toBe("mon");
    expect(businessWeekStart("UTC", mon)).toBe("2026-10-05");
  });
  it("isOpenAt reads an invalid zone as UTC and includes the exact opening minute", () => {
    const hours = workingHours({ work_days: "mon,tue,wed,thu,fri", work_start: "09:00", work_end: "17:00" });
    expect(isOpenAt(hours, "Mars/Base", new Date("2026-10-05T09:00:00Z"))).toBe(true);
    expect(isOpenAt(hours, "Mars/Base", new Date("2026-10-05T08:59:00Z"))).toBe(false);
    expect(isOpenAt(hours, "UTC", new Date("2026-10-05T09:00:00Z"))).toBe(true);
    expect(isOpenAt(hours, LA, new Date("2026-10-05T16:00:00Z"))).toBe(true);
    expect(isOpenAt(hours, LA, new Date("2026-10-05T15:59:00Z"))).toBe(false);
  });
  it("workingHours keeps only real weekdays from a bad stored value", () => {
    const h = workingHours({ work_days: "mon,funday,fri,", work_start: "09:00", work_end: "17:00" });
    expect(h?.days).toEqual(["mon", "fri"]);
    expect(workingHours({ work_days: "nope", work_start: "09:00", work_end: "17:00" })).toBeNull();
  });
});

describe("the Today kicker", () => {
  it("names the day on the business's clock", () => {
    const at = new Date("2026-10-07T03:00:00Z");
    expect(formatTodayKicker("UTC", at)).toBe("Wednesday, October 7");
    expect(formatTodayKicker("America/Los_Angeles", at)).toBe("Tuesday, October 6");
    expect(formatTodayKicker(null, at)).toBe("Wednesday, October 7");
  });
});

describe("relative card times", () => {
  const LA = "America/Los_Angeles";
  // 18:00 UTC on Wednesday, October 7 is 11:00 in Los Angeles.
  const now = new Date("2026-10-07T18:00:00Z");
  it("say minutes and hours on the same business day", () => {
    expect(formatRelativeTime("2026-10-07T17:59:40Z", LA, now)).toBe("Just now");
    expect(formatRelativeTime("2026-10-07T17:55:00Z", LA, now)).toBe("5m ago");
    expect(formatRelativeTime("2026-10-07 16:00:00+00", LA, now)).toBe("2h ago");
    expect(formatRelativeTime("2026-10-07T07:30:00Z", LA, now)).toBe("10h ago");
  });
  it("turn to Yesterday at the business's midnight, not the server's", () => {
    // 06:59 UTC is 23:59 on Tuesday in Los Angeles, but already Wednesday in UTC.
    expect(formatRelativeTime("2026-10-07T06:59:00Z", LA, now)).toBe("Yesterday");
    expect(formatRelativeTime("2026-10-07T07:00:00Z", LA, now)).toBe("11h ago");
    expect(formatRelativeTime("2026-10-07T06:59:00Z", "UTC", now)).toBe("11h ago");
  });
  it("keep a message from minutes ago in minutes across midnight", () => {
    const justAfter = new Date("2026-10-08T07:10:00Z"); // 00:10 Thursday in Los Angeles
    expect(formatRelativeTime("2026-10-08T06:30:00Z", LA, justAfter)).toBe("40m ago");
    expect(formatRelativeTime("2026-10-08T05:00:00Z", LA, justAfter)).toBe("Yesterday");
  });
  it("show the date after yesterday, with the year only when it differs", () => {
    expect(formatRelativeTime("2026-10-03T18:00:00Z", LA, now)).toBe("Oct 3");
    expect(formatRelativeTime("2025-12-30T18:00:00Z", LA, now)).toBe("Dec 30, 2025");
  });
  it("treat a time slightly ahead of the clock as just now, and keep unreadable text as it is", () => {
    expect(formatRelativeTime("2026-10-07T18:00:30Z", LA, now)).toBe("Just now");
    expect(formatRelativeTime("not a time", LA, now)).toBe("not a time");
  });
  it("give the machine-readable instant for the time element", () => {
    expect(toIsoTime("2026-10-05 06:30:00.123+00")).toBe("2026-10-05T06:30:00.123Z");
    expect(toIsoTime("not a time")).toBeNull();
  });
});
