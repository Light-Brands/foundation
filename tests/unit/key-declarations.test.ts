import { describe, it, expect, vi, afterEach } from "vitest";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadDeclarations } from "@/lib/key/load";
import { KEY_EXT } from "../support/db";
import { checkKeyFolder } from "@/lib/key/formats";
import { checkCardKinds, checkForms, readDeclarations, readSources, NAME_MAX } from "@/lib/key/declarations";
import { CARD_LIMITS } from "@/lib/data/cards";

function copyFixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), "keyext-"));
  cpSync(KEY_EXT, root, { recursive: true });
  return root;
}
const routineFile = (root: string) => path.join(root, "key/routines/lead-watch.md");

describe("card kinds in the Key", () => {
  it("the fixture Key passes the checker", async () => {
    expect(await checkKeyFolder(KEY_EXT)).toEqual([]);
  });
  it("loads the core kinds and every declared kind, filed in the declaring department", async () => {
    const d = await readDeclarations(KEY_EXT);
    const byKind = Object.fromEntries(d.kinds.map((k) => [k.kind, k]));
    expect(byKind["lead-new"]).toEqual({
      kind: "lead-new", category: "sell", subcategory: "leads", label: "New lead", always_human: false,
      decide: "done", expires_days: 14, on_lapse: "raised_again", source: "leads-demo", routable: false,
    });
    expect(byKind["discount-ask"]).toMatchObject({ always_human: true, decide: "approve", expires_days: null, on_lapse: "stays" });
    expect(byKind["lead-waiting"].source).toBe("lead-watch");
    expect(byKind["contact"].source).toBe("core");
    expect(d.tablesByApp).toEqual({ "leads-demo": ["leads_demo"] });
    expect(d.routines).toEqual(["lead-watch"]);
    expect(d.problems).toEqual([]);
  });
  it("refuses bad declarations with a plain reason each", () => {
    const src = { file: "d.yaml", category: "sell", slug: "x" };
    const bad = (k: unknown) => checkCardKinds(src, [k]).problems.join("\n");
    expect(bad({ kind: "Lead", subcategory: "leads", label: "x" })).toMatch(/kind must be a lowercase hyphenated slug/);
    expect(bad({ kind: "a", subcategory: "booking", label: "x" })).toMatch(/subcategory "booking" is not a job in sell/);
    expect(bad({ kind: "a", subcategory: "leads", label: "" })).toMatch(/label must be 1 to 60 characters/);
    expect(bad({ kind: "a", subcategory: "leads", label: "New; lead" })).toMatch(/no long or short dash and no semicolon/);
    expect(bad({ kind: "a", subcategory: "leads", label: "x", expires_days: 3 })).toMatch(/on_lapse is required with expires_days/);
    expect(bad({ kind: "a", subcategory: "leads", label: "x", expires_days: 0, on_lapse: "closes" })).toMatch(/expires_days must be a whole number from 1 to 365/);
    expect(bad({ kind: "a", subcategory: "leads", label: "x", on_lapse: "closes" })).toMatch(/needs expires_days/);
    expect(bad({ kind: "a", subcategory: "leads", label: "x", decide: "maybe" })).toMatch(/decide must be done or approve/);
    expect(bad({ kind: "a", subcategory: "leads", label: "x", always_human: "yes" })).toMatch(/always_human must be true or false/);
    expect(checkCardKinds(src, { kind: "a" }).problems).toEqual(["d.yaml: card_kinds must be a list"]);
  });
  it("lets only the declared routable kinds be routable, as done kinds", () => {
    const src = { file: "d.yaml", category: "command", slug: "mailbox" };
    const mail = { kind: "mail-in", subcategory: "inbox", label: "Mail in", routable: true };
    expect(checkCardKinds(src, [mail])).toMatchObject({ problems: [], kinds: [{ kind: "mail-in", routable: true }] });
    expect(checkCardKinds(src, [{ ...mail, kind: "letter-in" }]).problems.join()).toMatch(/routable: true is only for contact and mail-in/);
    expect(checkCardKinds(src, [{ ...mail, decide: "approve" }]).problems.join()).toMatch(/a routable kind is decide: done/);
    expect(checkCardKinds(src, [{ ...mail, routable: "yes" }]).problems.join()).toMatch(/routable must be true or false/);
    expect(checkCardKinds(src, [{ ...mail, routable: undefined }]).kinds[0].routable).toBe(false);
  });
  it("keeps money, contract and people decisions for the owner", () => {
    const k = { kind: "a", subcategory: "invoicing", label: "Invoice ready", decide: "approve" };
    expect(checkCardKinds({ file: "d.yaml", category: "money", slug: "x" }, [k]).problems.join()).toMatch(/needs always_human: true/);
    expect(checkCardKinds({ file: "d.yaml", category: "money", slug: "x" }, [{ ...k, always_human: true }]).problems).toEqual([]);
    expect(checkCardKinds({ file: "d.yaml", category: "sell", slug: "x" }, [{ ...k, subcategory: "contracts" }]).problems.join()).toMatch(/needs always_human: true/);
    expect(checkCardKinds({ file: "d.yaml", category: "team", slug: "x" }, [{ ...k, subcategory: "hiring" }]).problems.join()).toMatch(/needs always_human: true/);
    expect(checkCardKinds({ file: "d.yaml", category: "team", slug: "x" }, [{ ...k, subcategory: "tasks" }]).problems).toEqual([]);
    expect(checkCardKinds({ file: "d.yaml", category: "money", slug: "x" }, [{ ...k, decide: "done" }]).problems).toEqual([]);
  });
  it("refuses uses_apps that names an app that is not installed", async () => {
    const root = copyFixture();
    writeFileSync(routineFile(root), readFileSync(routineFile(root), "utf8").replace("app: leads-demo", "app: leads-demo\nuses_apps: [vendors]"));
    expect((await checkKeyFolder(root)).join("\n")).toMatch(/uses_apps names "vendors", which is not installed/);
  });
  it("refuses two installed apps that declare the same table, naming both", async () => {
    const root = copyFixture();
    const keyFile = path.join(root, "key/key.yaml");
    writeFileSync(keyFile, readFileSync(keyFile, "utf8").replace("routines:\n", "  - slug: leads-copy\n    definition: apps/leads-copy/definition.yaml\n    category: sell\nroutines:\n"));
    mkdirSync(path.join(root, "key/apps/leads-copy/migrations"), { recursive: true });
    writeFileSync(path.join(root, "key/apps/leads-copy/definition.yaml"), "app: leads-copy\nname: Leads copy\ncategory: sell\nruntime: custom_app\nentities:\n  - key: leads_demo\n    name: Lead\n    fields: []\nmigrations: migrations/\n");
    writeFileSync(path.join(root, "key/apps/leads-copy/migrations/0001_leads_copy_create.sql"), "create table if not exists leads_demo (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now());\nalter table leads_demo enable row level security;\n");
    const problems = (await checkKeyFolder(root)).join("\n");
    expect(problems).toMatch(/table "leads_demo" is declared by both leads-demo and leads-copy/);
    expect((await readDeclarations(root)).problems.join("\n")).toMatch(/leads-demo and leads-copy/);
  });
  it("refuses a kind declared twice, and a core kind name", async () => {
    const root = copyFixture();
    const text = readFileSync(routineFile(root), "utf8").replace(
      "card_kinds:\n",
      "card_kinds:\n  - { kind: lead-new, subcategory: leads, label: Again }\n  - { kind: contact, subcategory: leads, label: Mine }\n",
    );
    writeFileSync(routineFile(root), text);
    const problems = (await checkKeyFolder(root)).join("\n");
    expect(problems).toMatch(/card kind "lead-new" is already declared by leads-demo/);
    expect(problems).toMatch(/card kind "contact" is already declared by core/);
  });
  it("refuses a routine that names an app that is not installed", async () => {
    const root = copyFixture();
    writeFileSync(routineFile(root), readFileSync(routineFile(root), "utf8").replace("app: leads-demo", "app: invoices"));
    expect((await checkKeyFolder(root)).join("\n")).toMatch(/app "invoices" is not installed/);
  });
});

describe("a Key that cannot be read", () => {
  it("reports malformed YAML in key.yaml without crashing", async () => {
    const root = copyFixture();
    writeFileSync(path.join(root, "key/key.yaml"), "apps: [unclosed\n  - : :");
    const src = await readSources(root);
    expect(src.sources).toEqual([]);
    expect(src.problems.join("\n")).toMatch(/key\/key\.yaml: could not be read as YAML/);
    expect((await readDeclarations(root)).problems.join("\n")).toMatch(/key\.yaml: could not be read as YAML/);
  });
  it("reports malformed YAML in a definition and in routine front matter", async () => {
    const root = copyFixture();
    const def = path.join(root, "key/apps/leads-demo/definition.yaml");
    writeFileSync(def, "app: [broken\n  x: : :");
    writeFileSync(routineFile(root), "---\ncategory: [broken\n---\nbody\n");
    const d = await readDeclarations(root);
    const text = d.problems.join("\n");
    expect(text).toMatch(/definition\.yaml: could not be read as YAML/);
    expect(text).toMatch(/lead-watch\.md: front matter could not be read as YAML/);
    expect(d.kinds.map((k) => k.kind).sort()).toEqual(["brief", "brief-blocked", "check-failed", "contact", "person-forget"]);
  });
  it("drops a kind whose category differs from its key.yaml entry", async () => {
    const root = copyFixture();
    const def = path.join(root, "key/apps/leads-demo/definition.yaml");
    writeFileSync(def, readFileSync(def, "utf8").replace(/^category: sell/m, "category: money"));
    const d = await readDeclarations(root);
    expect(d.problems.join("\n")).toMatch(/category "money" does not match "sell" in key\.yaml/);
    expect(d.kinds.find((k) => k.kind === "lead-new")).toBeUndefined();
  });
  it("drops a routine kind whose front matter category differs from its key.yaml entry", async () => {
    const root = copyFixture();
    writeFileSync(routineFile(root), readFileSync(routineFile(root), "utf8").replace(/^category: sell/m, "category: money"));
    const d = await readDeclarations(root);
    expect(d.problems.join("\n")).toMatch(/lead-watch\.md: category "money" does not match "sell" in key\.yaml/);
    expect(d.kinds.find((k) => k.kind === "lead-waiting")).toBeUndefined();
  });
});

describe("loading declarations at run time", () => {
  afterEach(() => vi.restoreAllMocks());
  it("warns once per problem, on the first load only", async () => {
    const root = copyFixture();
    writeFileSync(routineFile(root), readFileSync(routineFile(root), "utf8").replace("app: leads-demo", "app: invoices"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await loadDeclarations(root);
    await loadDeclarations(root);
    // Two problems: the app is not installed, and so the routine's check reads a table that is not its app's.
    expect(warn).toHaveBeenCalledTimes(2);
    expect(String(warn.mock.calls[0][0])).toMatch(/app "invoices" is not installed/);
    expect(String(warn.mock.calls[1][0])).toMatch(/reads "leads_demo"/);
  });
  it("stays quiet when the Key is sound", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await loadDeclarations(copyFixture());
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("public forms in the Key", () => {
  const src = { file: "d.yaml", slug: "leads-demo" };
  const kinds = new Set(["lead-new", "contact"]);
  const base = {
    key: "get-in-touch", title: "Get in touch", card_kind: "lead-new", thanks: "Thank you.",
    fields: [{ key: "name", label: "Your name", type: "text", required: true }, { key: "email", label: "Email", type: "email", required: true }],
  };
  const bad = (patch: Record<string, unknown>) => checkForms(src, [{ ...base, ...patch }], kinds).problems.join("\n");

  it("loads the fixture form with its defaults filled in", async () => {
    const d = await readDeclarations(KEY_EXT);
    expect(d.forms.map((f) => f.key)).toEqual(["get-in-touch"]);
    const form = d.forms[0];
    expect(form.fields.find((f) => f.key === "email")).toEqual({ key: "email", label: "Email", type: "email", required: true, max: 254, options: [] });
    expect(form.fields.find((f) => f.key === "phone")).toMatchObject({ required: false, max: 40 });
    expect(form.source).toBe("leads-demo");
  });
  it("passes a minimal form", () => expect(checkForms(src, [base], kinds).problems).toEqual([]));
  it("refuses a bad key, the reserved contact key and a missing or core card kind", () => {
    expect(bad({ key: "Get In Touch" })).toMatch(/key must be a lowercase hyphenated slug/);
    expect(bad({ key: "contact" })).toMatch(/"contact" is reserved/);
    expect(bad({ card_kind: "nope" })).toMatch(/card_kind "nope" is not declared/);
    expect(bad({ card_kind: "contact" })).toMatch(/card_kind "contact" is a core kind/);
  });
  it("needs a name and an email that make the contact", () => {
    expect(bad({ fields: [base.fields[0]] })).toMatch(/needs a required email field of type email/);
    expect(bad({ fields: [{ ...base.fields[0], required: false }, base.fields[1]] })).toMatch(/needs a required name field of type text/);
    expect(bad({ fields: [...base.fields, { key: "phone", label: "Phone", type: "text" }] })).toMatch(/phone field must have type phone/);
  });
  it("refuses bad fields", () => {
    expect(bad({ fields: [...base.fields, { key: "website", label: "Site", type: "text" }] })).toMatch(/"website" is reserved/);
    expect(bad({ fields: [...base.fields, { key: "utm_content", label: "x", type: "text" }] })).toMatch(/"utm_content" is reserved/);
    expect(bad({ fields: [...base.fields, { key: "cv", label: "CV", type: "file" }] })).toMatch(/type "file" must be one of/);
    expect(bad({ fields: [...base.fields, { key: "pick", label: "Pick", type: "select" }] })).toMatch(/select needs 1 to 30 options/);
    expect(bad({ fields: [...base.fields, { key: "big", label: "Big", type: "long_text", max: 5000 }] })).toMatch(/max must be a whole number from 1 to 4000/);
    expect(bad({ fields: [...base.fields, { key: "name", label: "Again", type: "text" }] })).toMatch(/field key "name" repeats/);
    expect(bad({ fields: [{ ...base.fields[0], max: 201 }, base.fields[1]] })).toMatch(/a name field's max is at most 200/);
    expect(bad({ fields: [{ ...base.fields[0], max: 200 }, base.fields[1]] })).toBe("");
    expect(NAME_MAX).toBeLessThanOrEqual(Math.min(CARD_LIMITS.title, CARD_LIMITS.contactName));
  });
  it("takes contact: false, so the form writes no core contact, and defaults to true", () => {
    expect(checkForms(src, [base], kinds).forms[0].contact).toBe(true);
    const r = checkForms(src, [{ ...base, contact: false }], kinds);
    expect(r.problems).toEqual([]);
    expect(r.forms[0].contact).toBe(false);
    expect(bad({ contact: "no" })).toMatch(/contact must be true or false/);
  });
  it("refuses a form key or a field key it does not know, naming each, so a newer Key never installs quietly", () => {
    const problems = bad({ contacts: false, help: "x", fields: [...base.fields, { key: "cv", label: "CV", type: "text", accept: "pdf", hint: "x" }] });
    expect(problems).toMatch(/forms\[0\] has a key this Foundation does not know: "contacts"/);
    expect(problems).toMatch(/forms\[0\] has a key this Foundation does not know: "help"/);
    expect(problems).toMatch(/fields\[2\] has a key this Foundation does not know: "accept"/);
    expect(problems).toMatch(/fields\[2\] has a key this Foundation does not know: "hint"/);
    expect(checkForms(src, [{ ...base, contacts: false }], kinds).forms).toEqual([]);
    // Every key the Foundation does know passes, contact among them.
    const full = { ...base, intro: "Hi.", submit: "Send", contact: false, fields: [...base.fields, { key: "pick", label: "Pick", type: "select", required: false, max: 80, options: ["A"] }] };
    expect(checkForms(src, [full], kinds).problems).toEqual([]);
  });
  it("takes a url field of at most 2000 characters", () => {
    const r = checkForms(src, [{ ...base, fields: [...base.fields, { key: "portfolio", label: "Portfolio link", type: "url" }] }], kinds);
    expect(r.problems).toEqual([]);
    expect(r.forms[0].fields.find((f) => f.key === "portfolio")).toMatchObject({ type: "url", max: 2000 });
    expect(bad({ fields: [...base.fields, { key: "portfolio", label: "Portfolio link", type: "url", max: 2001 }] })).toMatch(/a url field's max is at most 2000/);
  });
  it("holds the words to the copy rules", () => {
    expect(bad({ thanks: "Thanks; talk soon." })).toMatch(/thanks must hold no long or short dash and no semicolon/);
  });
  it("refuses a form key two apps declare", async () => {
    const root = copyFixture();
    const keyFile = path.join(root, "key/key.yaml");
    writeFileSync(keyFile, readFileSync(keyFile, "utf8").replace("routines:\n", "  - slug: leads-two\n    definition: apps/leads-two/definition.yaml\n    category: sell\nroutines:\n"));
    mkdirSync(path.join(root, "key/apps/leads-two/migrations"), { recursive: true });
    writeFileSync(path.join(root, "key/apps/leads-two/definition.yaml"), "app: leads-two\nname: Leads two\ncategory: sell\nruntime: custom_app\nentities:\n  - key: leads_two\n    name: Lead\n    fields: []\nmigrations: migrations/\nforms:\n  - { key: get-in-touch, title: Again, card_kind: lead-new, thanks: Thanks., fields: [{ key: name, label: Name, type: text, required: true }, { key: email, label: Email, type: email, required: true }] }\n");
    writeFileSync(path.join(root, "key/apps/leads-two/migrations/0001_leads_two_create.sql"), "create table if not exists leads_two (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now());\nalter table leads_two enable row level security;\n");
    expect((await checkKeyFolder(root)).join("\n")).toMatch(/form "get-in-touch" is already declared by leads-demo/);
  });
  it("refuses a form declared in a routine", async () => {
    const root = copyFixture();
    const routine = readFileSync(routineFile(root), "utf8").replace("card_kinds:\n", "forms:\n  - { key: get-in-touch, title: Again, card_kind: lead-new, thanks: Thanks., fields: [{ key: name, label: Name, type: text, required: true }, { key: email, label: Email, type: email, required: true }] }\ncard_kinds:\n");
    writeFileSync(routineFile(root), routine);
    expect((await checkKeyFolder(root)).join("\n")).toMatch(/forms are declared in an app definition, never a routine/);
  });
});
