import { describe, it, expect } from "vitest";
import { stackStatus } from "@/lib/setup/steps";
import { readPrompt } from "@/lib/prompts";

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
  it("points every prompt at a real prompt file", async () => {
    const all = [...stackStatus({}, { storage: "pglite" }), ...stackStatus({ VERCEL: "1" }, { storage: "preview" })];
    for (const step of all) {
      if (step.prompt) expect(await readPrompt(step.prompt)).toContain("Paste this into");
    }
  });
  it("offers Light Brands setup on every not-done step of a fresh Vercel deploy", () => {
    for (const s of stackStatus({ VERCEL: "1" }, { storage: "preview" })) {
      if (s.status !== "done") expect(s.custom).toBe(true);
    }
  });
});

describe("Set up reads connection status from the table", () => {
  it("marks the hosted database and email sending done when their connections are connected", () => {
    const steps = stackStatus({}, { storage: "pglite", connections: { "hosted-database": "connected", "email-sending": "connected" } });
    expect(steps.find((s) => s.id === "supabase")!.status).toBe("done");
    expect(steps.find((s) => s.id === "email")!.status).toBe("done");
  });
  it("leaves them open while a connection is only planned or failing", () => {
    const steps = stackStatus({}, { storage: "pglite", connections: { "hosted-database": "planned", "email-sending": "failing" } });
    expect(steps.find((s) => s.id === "supabase")!.status).not.toBe("done");
    expect(steps.find((s) => s.id === "email")!.status).not.toBe("done");
  });
});
