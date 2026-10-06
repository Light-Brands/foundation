import { describe, it, expect, vi, afterEach } from "vitest";

const submitPublicForm = vi.fn(async () => ({ status: "saved" as const }));
vi.mock("@/lib/forms/public", () => ({ loadForms: async () => new Map(), submitPublicForm: (...a: unknown[]) => (submitPublicForm as (...x: unknown[]) => unknown)(...a), HONEYPOT: "website" }));
vi.mock("@/lib/data/card-kinds", () => ({ loadCardKinds: async () => new Map() }));
vi.mock("@/lib/db", () => ({ getDb: async () => null }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

import { submitFormAction } from "@/app/f/actions";

afterEach(() => { vi.unstubAllEnvs(); submitPublicForm.mockClear(); });

describe("the public form action and FOUNDATION_SECRET", () => {
  it("never hashes a visitor under a FOUNDATION_SECRET shorter than 32 characters", async () => {
    const short = "f".repeat(31);
    vi.stubEnv("FOUNDATION_SECRET", short);
    const f = new FormData();
    f.set("_form", "contact");
    await submitFormAction(null, f);
    const deps = (submitPublicForm.mock.calls[0] as unknown as [{ secret: string }])[0];
    expect(deps.secret).not.toBe(short);
    expect(deps.secret.length).toBeGreaterThanOrEqual(32);
  });
});
