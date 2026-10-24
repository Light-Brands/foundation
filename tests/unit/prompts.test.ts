import { describe, it, expect } from "vitest";
import { readPrompt } from "@/lib/prompts";

describe("readPrompt", () => {
  it("reads a prompt by name", async () => {
    expect(await readPrompt("setup/change-my-pin")).toContain("FOUNDATION_PIN");
  });
  it("refuses names that leave the prompts folder", async () => {
    await expect(readPrompt("../package")).rejects.toThrow();
    await expect(readPrompt("setup/../../x")).rejects.toThrow();
    await expect(readPrompt("/etc/passwd")).rejects.toThrow();
  });
});
