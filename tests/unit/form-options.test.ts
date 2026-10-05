import { describe, it, expect } from "vitest";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { coreDb, KEY_EXT } from "../support/db";
import { migrate } from "@/lib/db/migrate";
import { checkKeyFolder } from "@/lib/key/formats";
import { readDeclarations } from "@/lib/key/declarations";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { loadForms, submitPublicForm } from "@/lib/forms/public";
import { loadChoices, formChoices } from "@/lib/forms/options";

// A select whose options come from another app's table (options_from), as Marketing's forms use for
// open events or current offers. The choices are read at render and checked again at save.

const NOW = new Date("2026-10-05T16:00:00Z");
const OPTIONS_FROM = "options_from: { app: offers-demo, entity: offers_demo, label: title, where: active }";

/** The fixture Key plus an offers-demo app, with get-in-touch asking for an offer from it. */
function keyWith(opts: { field?: string; uses?: string } = {}): string {
  const root = mkdtempSync(path.join(tmpdir(), "form-options-"));
  cpSync(KEY_EXT, root, { recursive: true });
  const keyFile = path.join(root, "key/key.yaml");
  writeFileSync(keyFile, readFileSync(keyFile, "utf8").replace("routines:\n", "  - slug: offers-demo\n    definition: apps/offers-demo/definition.yaml\n    category: attract\nroutines:\n"));
  mkdirSync(path.join(root, "key/apps/offers-demo/migrations"), { recursive: true });
  writeFileSync(path.join(root, "key/apps/offers-demo/definition.yaml"), [
    "app: offers-demo", "name: Offers demo", "category: attract", "runtime: custom_app", "entities:",
    "  - key: offers_demo", "    name: Offer", "    fields:",
    "      - { key: title, name: Title, type: text }",
    "      - { key: active, name: Active, type: checkbox }",
    "      - { key: starts, name: Starts, type: date }",
    "    views: [table]", "migrations: migrations/", "",
  ].join("\n"));
  writeFileSync(path.join(root, "key/apps/offers-demo/migrations/0001_offers_demo_create.sql"), [
    "create table if not exists offers_demo (",
    "  id uuid primary key default gen_random_uuid(),",
    "  title text,", "  active boolean not null default false,", "  starts date,",
    "  created_at timestamptz not null default now(),", "  updated_at timestamptz not null default now()",
    ");", "alter table offers_demo enable row level security;", "",
  ].join("\n"));
  const def = path.join(root, "key/apps/leads-demo/definition.yaml");
  const field = opts.field ?? `      - { key: offer, label: Which offer, type: select, ${OPTIONS_FROM} }`;
  writeFileSync(def, readFileSync(def, "utf8")
    .replace("migrations: migrations/\n", `migrations: migrations/\n${opts.uses ?? "uses_apps: [offers-demo]"}\n`)
    .replace("      - { key: message, label:", `${field}\n      - { key: message, label:`));
  return root;
}

async function setup() {
  const root = keyWith();
  const db = await coreDb();
  await migrate(db, path.join(root, "key/apps/leads-demo/migrations"), "leads-demo");
  await migrate(db, path.join(root, "key/apps/offers-demo/migrations"), "offers-demo");
  const [open] = await db.query<{ id: string }>("insert into offers_demo (title, active) values ('Fall open house', true) returning id::text as id");
  const [closed] = await db.query<{ id: string }>("insert into offers_demo (title, active) values ('Summer camp', false) returning id::text as id");
  await db.query("insert into offers_demo (title, active) values ('Winter clinic', true)");
  const deps = { db, kinds: await loadCardKinds(root), forms: await loadForms(root), secret: "test-secret" };
  return { root, db, deps, open: open.id, closed: closed.id };
}

const answers = (offer: string) => ({ _form: "get-in-touch", name: "Ada", email: "ada@example.com", message: "Hello", offer });

describe("options_from in the Key", () => {
  it("passes when the app is in uses_apps and the entity, label and where fields exist", async () => {
    expect(await checkKeyFolder(keyWith())).toEqual([]);
    const d = await readDeclarations(keyWith());
    expect(d.forms[0].fields.find((f) => f.key === "offer")).toEqual({
      key: "offer", label: "Which offer", type: "select", required: false, max: 120, options: [],
      options_from: { app: "offers-demo", entity: "offers_demo", label: "title", where: "active" },
    });
  });
  it("refuses an app that is not in the declaring app's uses_apps", async () => {
    expect((await checkKeyFolder(keyWith({ uses: "" }))).join("\n")).toMatch(/options_from app "offers-demo" is another app, so it must be listed in this app's uses_apps/);
  });
  it("reads the declaring app's own table without listing it in uses_apps", async () => {
    const own = "options_from: { app: leads-demo, entity: leads_demo, label: message }";
    expect(await checkKeyFolder(keyWith({ uses: "", field: `      - { key: offer, label: Which lead, type: select, ${own} }` }))).toEqual([]);
    expect((await checkKeyFolder(keyWith({ uses: "", field: `      - { key: offer, label: Which offer, type: select, ${OPTIONS_FROM} }` }))).join("\n"))
      .toMatch(/options_from app "offers-demo" is another app, so it must be listed in this app's uses_apps/);
  });
  it("refuses an unknown entity, an unknown label, a where that is not a checkbox, and options beside it", async () => {
    const bad = async (from: string, extra = "") =>
      (await checkKeyFolder(keyWith({ field: `      - { key: offer, label: Which offer, type: select, ${extra}options_from: ${from} }` }))).join("\n");
    expect(await bad("{ app: offers-demo, entity: offers, label: title }")).toMatch(/options_from entity "offers" is not a table of offers-demo/);
    expect(await bad("{ app: offers-demo, entity: offers_demo, label: name }")).toMatch(/options_from label "name" is not a text field of offers_demo/);
    expect(await bad("{ app: offers-demo, entity: offers_demo, label: title, where: starts }")).toMatch(/options_from where "starts" is not a checkbox field of offers_demo/);
    expect(await bad("{ app: offers-demo, entity: offers_demo, label: title }", "options: [A], ")).toMatch(/takes options or options_from, never both/);
    expect(await bad("{ app: offers-demo, entity: offers_demo, label: title, sql: x }")).toMatch(/options_from holds only app, entity, label and where/);
  });
  it("is only for a select field", async () => {
    const out = (await checkKeyFolder(keyWith({ field: `      - { key: offer, label: Which offer, type: text, ${OPTIONS_FROM} }` }))).join("\n");
    expect(out).toMatch(/options_from is only for a select field/);
  });
});

describe("options_from at render and at save", () => {
  it("lists only the rows whose where field is true, by label", async () => {
    const { db, deps, open } = await setup();
    const form = deps.forms.get("get-in-touch")!;
    const field = form.fields.find((f) => f.key === "offer")!;
    const choices = await loadChoices(db, field.options_from!);
    expect(choices.map((c) => c.label)).toEqual(["Fall open house", "Winter clinic"]);
    expect(choices[0].value).toBe(open);
    expect(Object.keys(await formChoices(db, form))).toEqual(["offer"]);
    expect(await formChoices(null, form)).toEqual({ offer: [] });
    await db.close();
  });
  it("saves a current choice, with its label on the card and its id in the card's meta", async () => {
    const { db, deps, open } = await setup();
    const r = await submitPublicForm(deps, { formKey: "get-in-touch", data: answers(open), clientKey: "1.2.3.4" }, NOW);
    expect(r.status).toBe("saved");
    const [card] = await db.query<{ body: string; meta: Record<string, unknown> }>("select body, meta from inbox_items");
    expect(card.body).toContain("Which offer: Fall open house");
    expect(card.meta.picked).toEqual({ offer: open });
    await db.close();
  });
  it("refuses a forged, a closed or a stale option id, and writes nothing", async () => {
    const { db, deps, open, closed } = await setup();
    const forged = ["00000000-0000-0000-0000-000000000000", "Fall open house", `${open}' or '1'='1`, closed];
    for (const id of forged) {
      const r = await submitPublicForm(deps, { formKey: "get-in-touch", data: answers(id), clientKey: "1.2.3.4" }, NOW);
      expect(r, id).toEqual({ status: "invalid", errors: { offer: "Pick one of the choices." } });
    }
    await db.query("update offers_demo set active = false where id = $1", [open]);
    const stale = await submitPublicForm(deps, { formKey: "get-in-touch", data: answers(open), clientKey: "1.2.3.4" }, NOW);
    expect(stale).toEqual({ status: "invalid", errors: { offer: "Pick one of the choices." } });
    expect(await db.query("select id from inbox_items")).toEqual([]);
    expect(await db.query("select id from form_hits")).toEqual([]);
    await db.close();
  });
});
