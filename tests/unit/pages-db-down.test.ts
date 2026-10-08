import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { FormDecl } from "@/lib/key/declarations";

// The database is unreachable: opening it rejects, the way getDb() does when Neon is cold or paused.
vi.mock("@/lib/db", () => ({
  getDb: async () => {
    throw new Error("database is paused");
  },
  storageMode: () => "postgres",
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ host: "harbor.example" }) }));

const LEAD: FormDecl = {
  key: "lead-form",
  title: "Book a visit",
  intro: "",
  submit: "Send",
  thanks: "Thank you.",
  card_kind: "contact",
  source: "leads-demo",
  contact: true,
  fields: [{ key: "name", label: "Your name", type: "text", required: true, max: 120, options: [] }],
};
vi.mock("@/lib/forms/public", async (orig) => {
  const real = await orig<typeof import("@/lib/forms/public")>();
  return { ...real, loadForms: async () => new Map([["contact", real.CONTACT_FORM], ["lead-form", LEAD]]) };
});

const render = async (el: Promise<React.ReactElement>) => renderToStaticMarkup(await el);

describe("pages that need no data still open when the database is down", () => {
  beforeEach(() => {
    vi.stubEnv("FOUNDATION_BUSINESS_NAME", "Harbor Studio");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("the sign-in page shows the keypad", async () => {
    vi.stubEnv("FOUNDATION_PIN", "24681012");
    const { default: SignIn } = await import("@/app/admin/login/page");
    const html = await render(SignIn({ searchParams: Promise.resolve({}) }));
    expect(html).toContain("Harbor Studio");
    expect(html).toContain("Sign in");
    expect(html).toContain('id="pin"');
  });

  it("the public home page shows the business", async () => {
    const { default: PublicHome } = await import("@/app/page");
    const html = await render(PublicHome());
    expect(html).toContain("Harbor Studio");
    expect(html).toContain('href="/contact"');
  });

  it("the contact page shows its form", async () => {
    const { default: ContactPage } = await import("@/app/contact/page");
    const html = await render(ContactPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain("Harbor Studio");
    expect(html).toContain("<form");
  });

  it("a public form page says it is not ready, in place of a server error", async () => {
    const { default: FormPage } = await import("@/app/f/[form]/page");
    const html = await render(FormPage({ params: Promise.resolve({ form: "lead-form" }), searchParams: Promise.resolve({}) }));
    expect(html).toContain("Book a visit");
    expect(html).toContain("This form is not ready yet.");
  });
});
