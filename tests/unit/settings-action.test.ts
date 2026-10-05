import { describe, it, expect, vi, beforeEach } from "vitest";

const getDb = vi.fn();
vi.mock("@/lib/db", () => ({ getDb: (...a: unknown[]) => getDb(...a), storageMode: () => "local" }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
}));

import { saveProfileAction } from "@/app/(console)/system/settings/actions";

function form(values: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}

describe("saveProfileAction session check", () => {
  beforeEach(() => getDb.mockReset());
  it("refuses without a session, writes nothing, and keeps what was typed", async () => {
    const result = await saveProfileAction(null, form({ business_name: "  Harbor  ", tagline: "Calm work" }));
    expect(result.ok).toBe(false);
    expect(result.message).toContain("Your session ended");
    expect(result.values?.business_name).toBe("Harbor");
    expect(getDb).not.toHaveBeenCalled();
  });
});
