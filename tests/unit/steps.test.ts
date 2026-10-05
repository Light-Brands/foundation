import { describe, it, expect } from "vitest";
import { stackStatus } from "@/lib/setup/steps";

const ids = (s: ReturnType<typeof stackStatus>) => s.map((x) => `${x.id}:${x.status}`);

describe("stackStatus", () => {
  it("lists the eight steps in order", () => {
    expect(stackStatus({}, { storage: "pglite" }).map((s) => s.id)).toEqual(
      ["github", "vercel", "supabase", "owner", "domain", "email", "claude", "dojo"],
    );
  });
  it("on a fresh Vercel deploy, GitHub and Vercel are done and running locally is the next win", () => {
    const steps = stackStatus({ VERCEL: "1", VERCEL_GIT_REPO_SLUG: "command-center", VERCEL_PROJECT_PRODUCTION_URL: "cc.vercel.app" }, { storage: "preview" });
    expect(ids(steps).slice(0, 3)).toEqual(["github:done", "vercel:done", "supabase:later"]);
    expect(steps.find((s) => s.id === "claude")!.status).toBe("next");
  });
  it("marks a custom domain done when production is off vercel.app", () => {
    const steps = stackStatus({ VERCEL: "1", VERCEL_PROJECT_PRODUCTION_URL: "command.harbor.studio" }, { storage: "preview" });
    expect(steps.find((s) => s.id === "domain")!.status).toBe("done");
  });
  it("has exactly one next step", () => {
    for (const env of [{}, { VERCEL: "1" }]) {
      expect(stackStatus(env, { storage: "pglite" }).filter((s) => s.status === "next")).toHaveLength(1);
    }
  });
  it("gives every step that a member can do now a prompt", () => {
    for (const s of stackStatus({}, { storage: "pglite" })) {
      if (s.status !== "later") expect(s.prompt).toBeDefined();
    }
  });
});
