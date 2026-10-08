import { describe, it, expect } from "vitest";
import robots from "@/app/robots";
import { isPublicPath } from "@/lib/auth/gate";

describe("robots.txt", () => {
  it("lets crawlers read the public pages and keeps them out of the command center and the API", () => {
    const rules = robots().rules as { userAgent: string; allow: string; disallow: string[] };
    expect(rules.allow).toBe("/");
    expect(rules.disallow).toEqual(["/admin", "/api/"]);
  });
  it("answers without a session, so a crawler never gets the sign-in page", () => {
    expect(isPublicPath("/robots.txt")).toBe(true);
  });
});
