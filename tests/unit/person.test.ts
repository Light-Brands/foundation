import { describe, it, expect, beforeEach, vi } from "vitest";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { coreDb, KEY_EXT, ROOT } from "../support/db";
import { migrate } from "@/lib/db/migrate";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { submitContact, decideCard } from "@/lib/data/inbox";
import { draftEmail, optOut } from "@/lib/data/outbox";
import { PIN_OWNER, type Actor } from "@/lib/auth/roles";
import { emailHash } from "@/lib/email";
import { writeCard } from "@/lib/data/cards";
import type { Db } from "@/lib/db/types";
import type { KindRegistry } from "@/lib/data/card-kinds";
import type { PersonRef } from "@/lib/key/schema";
import { exportPerson, exportTarget, forgetPerson, forgetSummary, installedPersonRefs, OwnerOnlyError } from "@/lib/data/person";

const OWNER = { actor: PIN_OWNER };
const TEAM: Actor = { id: "acct:team", role: "team", via: "account", departments: ["risk", "team", "sell"] };

const NOW = new Date("2026-10-05T16:00:00Z");
const SECRET = "person-test-secret-of-at-least-32-chars";
const hashOf = (email: string) => emailHash(email, SECRET);
beforeEach(() => { vi.stubEnv("FOUNDATION_SECRET", SECRET); });

const TEAM_DEF = `app: team-demo
name: Team demo
category: team
runtime: custom_app
entities:
  - key: people
    name: Person
    fields:
      - { key: name, name: Name, type: text }
      - { key: manager_id, name: Reports to, type: text }
      - { key: work_email, name: Work email, type: email }
  - key: chores
    name: Chore
    fields:
      - { key: title, name: Title, type: text }
      - { key: owner_id, name: Owner, type: text }
  - key: review_inputs
    name: Review input
    forget: blank
    fields:
      - { key: person_id, name: About, type: text }
      - { key: owner_id, name: Written by, type: text }
      - { key: words, name: Words, type: text }
  - key: invoices_demo
    name: Invoice
    forget: blank
    fields:
      - { key: contact_email, name: Contact email, type: email }
      - { key: total, name: Total, type: number }
migrations: migrations/
`;
const TEAM_SQL = [
  "people (id uuid primary key default gen_random_uuid(), name text, manager_id text, work_email text",
  "chores (id uuid primary key default gen_random_uuid(), title text, owner_id text",
  "review_inputs (id uuid primary key default gen_random_uuid(), person_id text, owner_id text, words text",
  "invoices_demo (id uuid primary key default gen_random_uuid(), contact_email text, total numeric",
].map((t) => `create table if not exists ${t}, created_at timestamptz not null default now(), updated_at timestamptz not null default now());\nalter table ${t.split(" ")[0]} enable row level security;`).join("\n");

function personRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "person-"));
  cpSync(path.join(KEY_EXT, "key/apps/leads-demo"), path.join(root, "key/apps/leads-demo"), { recursive: true });
  mkdirSync(path.join(root, "key/apps/team-demo/migrations"), { recursive: true });
  writeFileSync(path.join(root, "key/apps/team-demo/definition.yaml"), TEAM_DEF);
  writeFileSync(path.join(root, "key/apps/team-demo/migrations/0001_team_demo_create.sql"), TEAM_SQL);
  writeFileSync(path.join(root, "key/key.yaml"), "key: 1\nclient: harbor-studio\nstage: systems\nhome: repo\nroster: []\nskills: []\napps:\n  - slug: leads-demo\n    definition: apps/leads-demo/definition.yaml\n    category: sell\n  - slug: team-demo\n    definition: apps/team-demo/definition.yaml\n    category: team\nroutines: []\n");
  return root;
}

type Seeded = { root: string; db: Db; kinds: KindRegistry; refs: PersonRef[]; ids: Record<string, string> };

async function seeded(): Promise<Seeded> {
  const root = personRoot();
  const db = await coreDb();
  await migrate(db, path.join(root, "key/apps/leads-demo/migrations"), "leads-demo");
  await migrate(db, path.join(root, "key/apps/team-demo/migrations"), "team-demo");
  const kinds = await loadCardKinds(root);
  const refs = await installedPersonRefs(root);
  const ids: Record<string, string> = {};
  for (const who of [{ name: "Ada", email: "ada+shop@harbor.example" }, { name: "Bo", email: "bo@harbor.example" }]) {
    await submitContact(db, { ...who, phone: "503 555 0100", message: `Hello from ${who.name}` }, { now: NOW });
    expect(await draftEmail(db, { to: who.email, subject: "Hi", body: "Thanks", sendKey: `k/${who.name}` })).toMatchObject({ status: "drafted" });
    await db.query("insert into leads_demo (contact_email, status, message) values ($1, 'new', $2)", [who.email.toUpperCase(), `lead ${who.name}`]);
    const [p] = await db.query<{ id: string }>("insert into people (name, work_email) values ($1, $2) returning id", [who.name, who.email]);
    ids[who.name] = p.id;
    await db.query("insert into chores (title, owner_id) values ($1, $2)", [`chore ${who.name}`, p.id]);
    await db.query("insert into invoices_demo (contact_email, total) values ($1, 120)", [who.email]);
  }
  // Bo reports to Ada, and each wrote a review of the other.
  await db.query("update people set manager_id = $1 where id = $2", [ids.Ada, ids.Bo]);
  await db.query("insert into review_inputs (person_id, owner_id, words) values ($1, $2, 'Ada on Bo'), ($2, $1, 'Bo on Ada')", [ids.Bo, ids.Ada]);
  // A card that names Ada only in its text, in another spelling, with no contact attached.
  await writeCard(db, kinds, { kind: "lead-new", title: "Call back", body: "Call Ada+vip@Harbor.Example back tomorrow" }, NOW);
  // A batch card that names Ada among others.
  await writeCard(db, kinds, { kind: "lead-new", title: "Batch follow up", body: "Remind ada@harbor.example and Bo Lee at bo@harbor.example", meta: { to: ["ada@harbor.example", "bo@harbor.example"] } }, NOW);
  return { root, db, kinds, refs, ids };
}

const count = async (db: Db, table: string) => (await db.query<{ n: number }>(`select count(*)::int as n from ${table}`))[0].n;

// An installed app that declares person fields on tables it does not own: a core table, another app's table, a
// table it only alters, and a system column. None of them may ever be reached by forget or export.
const INTRUDER_DEF = `app: intruder-demo
name: Intruder demo
category: team
runtime: custom_app
entities:
  - key: opt_outs
    name: Opt out
    fields:
      - { key: email, name: Email, type: email }
  - key: core_settings
    name: Setting
    fields:
      - { key: value, name: Value, type: email }
  - key: invoices_demo
    name: Invoice
    fields:
      - { key: contact_email, name: Contact email, type: email }
  - key: leads_demo
    name: Lead
    fields:
      - { key: contact_email, name: Contact email, type: email }
  - key: intruder_notes
    name: Note
    fields:
      - { key: id, name: Id, type: email }
      - { key: contact_email, name: Contact email, type: email }
migrations: migrations/
`;
const INTRUDER_SQL = `create table if not exists intruder_notes (id text primary key, contact_email text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table intruder_notes enable row level security;
alter table leads_demo add column if not exists intruder_flag text;`;

function withIntruder(root: string): void {
  mkdirSync(path.join(root, "key/apps/intruder-demo/migrations"), { recursive: true });
  writeFileSync(path.join(root, "key/apps/intruder-demo/definition.yaml"), INTRUDER_DEF);
  writeFileSync(path.join(root, "key/apps/intruder-demo/migrations/0001_intruder_demo_create.sql"), INTRUDER_SQL);
  const ring = path.join(root, "key/key.yaml");
  writeFileSync(ring, readFileSync(ring, "utf8").replace("routines: []", "  - slug: intruder-demo\n    definition: apps/intruder-demo/definition.yaml\n    category: team\nroutines: []"));
}

describe("person fields reach only the declaring app's own tables", () => {
  it("never collects a core table, another app's table, an altered table or a system column", async () => {
    const root = personRoot();
    withIntruder(root);
    const refs = await installedPersonRefs(root);
    const intruder = refs.filter((r) => r.app === "intruder-demo").map((r) => `${r.table}.${r.column}`);
    expect(intruder).toEqual(["intruder_notes.contact_email"]);
    // The installed apps' own refs stay.
    expect(refs.some((r) => r.app === "team-demo" && r.table === "invoices_demo")).toBe(true);
    expect(refs.some((r) => r.app === "leads-demo" && r.table === "leads_demo")).toBe(true);
  });
  it("forget under an intruding declaration leaves core tables and other apps' kept rows alone", async () => {
    const x = await seeded();
    withIntruder(x.root);
    await migrate(x.db, path.join(x.root, "key/apps/intruder-demo/migrations"), "intruder-demo");
    const refs = await installedPersonRefs(x.root);
    await optOut(x.db, { email: "zed@harbor.example", source: "owner", scope: "all" }, NOW);
    const r = await forgetPerson(x.db, x.kinds, refs, "ada@harbor.example", NOW, OWNER);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(x.db, x.kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, NOW);
    expect(await forgetPerson(x.db, x.kinds, refs, "ada@harbor.example", NOW, OWNER)).toMatchObject({ status: "forgotten" });
    // team-demo keeps its invoices with the address blanked: the intruder's delete never ran on them.
    expect(await count(x.db, "invoices_demo")).toBe(2);
    expect(await count(x.db, "core_settings")).toBe(1);
    expect(await count(x.db, "opt_outs")).toBe(2);
    await x.db.close();
  });
});

describe("export", () => {
  it("exports one person whole, and nobody else", async () => {
    const { db, refs, ids } = await seeded();
    const out = await exportPerson(db, refs, "ADA@harbor.example", NOW, OWNER);
    expect(Object.fromEntries(Object.entries(out.core).map(([k, v]) => [k, v.length]))).toEqual({ contacts: 1, inbox_items: 3, outbox: 1, opt_outs: 0 });
    expect(Object.fromEntries(Object.entries(out.apps).map(([k, v]) => [k, v.length]))).toEqual({
      "leads-demo/leads_demo": 1, "team-demo/people": 2, "team-demo/chores": 1, "team-demo/review_inputs": 2, "team-demo/invoices_demo": 1,
    });
    expect(out.email_hash).toBe(hashOf("ada@harbor.example"));
    expect(out.generated_at).toBe(NOW.toISOString());
    // Nobody else: no other address, name, id or words, even from a card or a row that names several people.
    const text = JSON.stringify(out);
    expect(text).not.toMatch(/bo@harbor\.example|Bo Lee|Hello from Bo|chore Bo|lead Bo|"Bo"|Ada on Bo|Bo on Ada/);
    expect(text).not.toContain(ids.Bo);
    // Rows that also name someone else are listed by id, and say why.
    const cards = out.core.inbox_items as Record<string, unknown>[];
    expect(cards.filter((c) => c.withheld)).toHaveLength(2);
    expect(cards.find((c) => c.withheld)).toEqual({ id: expect.any(String), kind: "lead-new", created_at: expect.anything(), withheld: "This card names the person in its text, which may name others too, so only that it exists is exported." });
    const reviews = out.apps["team-demo/review_inputs"] as Record<string, unknown>[];
    // The two reviews share a created_at, so their order is not fixed.
    expect(reviews.map((r) => Object.keys(r).sort().join()).sort()).toEqual(["owner_id,withheld", "person_id,withheld"]);
    expect((out.apps["team-demo/people"] as Record<string, unknown>[]).find((r) => r.withheld)).toEqual({ manager_id: ids.Ada, withheld: "This record also names someone else, so only the parts about this person are exported." });
    await db.close();
  });
  it("keeps exports inside .data, under a name that never holds the address", () => {
    const h = "a".repeat(64);
    expect(exportTarget(ROOT, null, h, "2026-10-05")).toBe(path.join(ROOT, ".data/exports/person-aaaaaaaaaaaa-2026-10-05.json"));
    expect(exportTarget(ROOT, path.join(ROOT, ".data/exports/june"), h, "2026-10-05")).toBe(path.join(ROOT, ".data/exports/june/person-aaaaaaaaaaaa-2026-10-05.json"));
    expect(exportTarget(ROOT, ".data/requests", h, "2026-10-05")).toBe(path.join(ROOT, ".data/requests/person-aaaaaaaaaaaa-2026-10-05.json"));
    for (const out of ["/private/tmp/out", path.join(ROOT, "key"), ROOT, path.join(ROOT, ".data"), path.join(ROOT, ".data/../key"), path.join(ROOT, ".data-old")]) {
      expect(() => exportTarget(ROOT, out, h, "2026-10-05")).toThrow("Save exports in a folder inside .data, such as .data/exports.");
    }
    expect(() => exportTarget(ROOT, null, "ada@harbor.example", "2026-10-05")).toThrow(TypeError);
    expect(() => exportTarget(ROOT, null, h, "../x")).toThrow(TypeError);
  });
});

describe("forget", () => {
  /** Raises Ada's card and approves it, so the next forgetPerson carries it out. */
  async function approvedForget(x: Seeded) {
    const r = await forgetPerson(x.db, x.kinds, x.refs, "ada@harbor.example", NOW, OWNER);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(x.db, x.kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, NOW);
  }
  it("blanks a card that names the person only in its run key or source id, and one whose source row goes", async () => {
    const x = await seeded();
    const [lead] = await x.db.query<{ id: string }>("select id::text as id from leads_demo where message = 'lead Ada'");
    const [bo] = await x.db.query<{ id: string }>("select id::text as id from leads_demo where message = 'lead Bo'");
    await writeCard(x.db, x.kinds, { kind: "lead-new", title: "Keyed", body: "plain", runKey: "follow-up:Ada+x@harbor.example" }, NOW);
    const sourced = await writeCard(x.db, x.kinds, { kind: "lead-new", title: "Sourced", body: "plain" }, NOW);
    if (sourced.status !== "written") throw new Error("no card");
    await x.db.query("update inbox_items set source_app = 'mail', source_id = 'ada@harbor.example' where id = $1", [sourced.id]);
    await writeCard(x.db, x.kinds, { kind: "lead-new", title: "From the lead", body: "plain", sourceApp: "leads-demo", sourceId: lead.id }, NOW);
    await writeCard(x.db, x.kinds, { kind: "lead-new", title: "From Bo's lead", body: "plain", sourceApp: "leads-demo", sourceId: bo.id }, NOW);
    await approvedForget(x);
    expect(await forgetPerson(x.db, x.kinds, x.refs, "ada@harbor.example", NOW, OWNER)).toMatchObject({ status: "forgotten" });
    expect(await x.db.query("select title from inbox_items where title in ('Keyed', 'Sourced', 'From the lead', 'From Bo''s lead') order by title")).toEqual([{ title: "From Bo's lead" }]);
    const text = JSON.stringify(await x.db.query("select run_key, source_id, title from inbox_items where kind <> 'person-forget'"));
    expect(text).not.toMatch(/ada@|Ada\+x|harbor\.example.*Ada/i);
    expect(text).not.toContain(lead.id);
    await x.db.close();
  });
  it("waits while an email to the person is being sent, and changes nothing", async () => {
    const x = await seeded();
    await approvedForget(x);
    await x.db.query("update outbox set status = 'approved', approved_at = $1 where send_key = 'k/Ada'", [NOW]);
    await x.db.query("update outbox set status = 'sending', claimed_at = $1 where send_key = 'k/Ada'", [NOW]);
    expect(await forgetPerson(x.db, x.kinds, x.refs, "ada@harbor.example", NOW, OWNER)).toEqual({ status: "sending" });
    expect(await count(x.db, "contacts")).toBe(2);
    expect(await count(x.db, "opt_outs")).toBe(0);
    expect(await x.db.query("select status from inbox_items where kind = 'person-forget'")).toEqual([{ status: "decided" }]);
    // Once the send settles, the same approved card carries it out.
    await x.db.query("update outbox set status = 'sent', sent_at = $1 where send_key = 'k/Ada'", [NOW]);
    expect(await forgetPerson(x.db, x.kinds, x.refs, "ada@harbor.example", NOW, OWNER)).toMatchObject({ status: "forgotten" });
    await x.db.close();
  });
  it("blanks every detail of a sent email, the send key, error, provider reference and source among them", async () => {
    const x = await seeded();
    await approvedForget(x);
    await x.db.query("update outbox set status = 'approved', approved_at = $1, source_app = 'leads-demo', source_id = 'ada-row' where send_key = 'k/Ada'", [NOW]);
    await x.db.query("update outbox set status = 'sending', claimed_at = $1 where send_key = 'k/Ada'", [NOW]);
    await x.db.query("update outbox set status = 'sent', provider_ref = 'ref-ada@harbor.example', last_error = 'retry for ada@harbor.example', sent_at = $1 where send_key = 'k/Ada'", [NOW]);
    // A second sent email to the same person, so two blanked send keys must not clash.
    const d = await draftEmail(x.db, { to: "ada@harbor.example", subject: "Again", body: "x", sendKey: "k/Ada/2" });
    if (d.status !== "drafted") throw new Error("not drafted");
    await x.db.query("update outbox set status = 'sent', sent_at = $1 where id = $2", [NOW, d.id]);
    expect(await forgetPerson(x.db, x.kinds, x.refs, "ada@harbor.example", NOW, OWNER)).toMatchObject({ status: "forgotten" });
    const rows = await x.db.query<Record<string, unknown>>("select id, to_email, subject, body, send_key, last_error, provider_ref, source_id, status from outbox where to_email <> 'bo@harbor.example' order by send_key");
    expect(rows).toHaveLength(2);
    for (const r of rows) {
      expect(r).toMatchObject({ to_email: "", subject: "", body: "", last_error: "", provider_ref: null, source_id: null, status: "sent" });
      expect(r.send_key).toBe(`forgotten:${r.id}`);
    }
    expect(JSON.stringify(rows)).not.toMatch(/ada|k\/Ada/i);
    await x.db.close();
  });
  it("raises a card first and changes nothing", async () => {
    const { db, kinds, refs } = await seeded();
    const first = await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER);
    expect(first).toMatchObject({ status: "card_raised", previous: "none" });
    expect(await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER)).toEqual({ status: "waiting" });
    const [card] = await db.query<{ title: string; body: string; always_human: boolean; category: string }>("select title, body, always_human, category from inbox_items where kind = 'person-forget'");
    expect(card.title).toBe("Forget one person on request");
    expect(card.always_human).toBe(true);
    expect(card.category).toBe("risk");
    expect(card.body).not.toMatch(/@|Ada/i);
    expect(card.body).toMatch(/1 in leads-demo\/leads_demo/);
    // The card separates the person's own records from other people's records that only point at them.
    const [about, linked] = card.body.split("Other people's records");
    expect(about).toMatch(/1 in team-demo\/people\n/);
    expect(about).not.toMatch(/chores|review_inputs/);
    expect(linked).toMatch(/^ that point to this person keep everything else. Only the link is cleared:\n1 in team-demo\/people\n1 in team-demo\/chores\n2 in team-demo\/review_inputs\n/);
    expect(card.body.trim().split("\n").at(-1)).toMatch(/notes or messages inside your apps.*mentioned only by name/);
    expect(await count(db, "contacts")).toBe(2);
    expect(await count(db, "people")).toBe(2);
    expect(await count(db, "opt_outs")).toBe(0);
    await db.close();
  });
  it("a declined card forgets nothing, and the next request gets a new card", async () => {
    const { db, kinds, refs } = await seeded();
    const r = await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "decline", actor: PIN_OWNER }, NOW);
    const again = await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER);
    expect(again).toMatchObject({ status: "card_raised", previous: "declined" });
    expect(await count(db, "contacts")).toBe(2);
    const keys = await db.query<{ run_key: string }>("select run_key from inbox_items where kind = 'person-forget' order by run_key");
    expect(keys.map((k) => k.run_key)).toEqual([1, 2].map((n) => `forget:${hashOf("ada@harbor.example").slice(0, 16)}:${n}`));
    expect(await db.query("select expires_at from inbox_items where kind = 'person-forget'")).toEqual([{ expires_at: null }, { expires_at: null }]);
    await db.close();
  });
  it("forgets every reference once approved, across two apps", async () => {
    const { db, kinds, refs, ids } = await seeded();
    const r = await forgetPerson(db, kinds, refs, "Ada@Harbor.example", NOW, OWNER);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, NOW);
    const done = await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER);
    // About Ada: her own records. Linked: other people's records that pointed at her, which keep all but that link.
    expect(done).toEqual({ status: "forgotten", counts: {
      about: { inbox_items: 3, outbox: 1, contacts: 1, "leads-demo/leads_demo": 1, "team-demo/people": 1, "team-demo/invoices_demo": 1 },
      linked: { "team-demo/people": 1, "team-demo/chores": 1, "team-demo/review_inputs": 2 },
    } });
    expect(await db.query("select email from contacts")).toEqual([{ email: "bo@harbor.example" }]);
    expect(await db.query("select title, body, contact_id from inbox_items where kind = 'contact' order by title")).toEqual([
      { title: "A forgotten person", body: "", contact_id: null },
      { title: "Bo sent a message", body: "Hello from Bo", contact_id: expect.any(String) },
    ]);
    expect(await db.query("select title, body from inbox_items where title in ('Call back', 'Batch follow up') or body like '%ada%'")).toEqual([]);
    expect(await db.query("select to_email from outbox")).toEqual([{ to_email: "bo@harbor.example" }]);
    // The second app: a deleted row, a blanked id on a kept row, and a kept invoice with its address blanked.
    expect(await db.query("select message from leads_demo")).toEqual([{ message: "lead Bo" }]);
    expect(await db.query("select id, name, manager_id from people")).toEqual([{ id: ids.Bo, name: "Bo", manager_id: "" }]);
    expect(await db.query("select title, owner_id from chores order by title")).toEqual([
      { title: "chore Ada", owner_id: "" },
      { title: "chore Bo", owner_id: ids.Bo },
    ]);
    expect(await db.query("select person_id, owner_id, words from review_inputs order by words")).toEqual([
      { person_id: ids.Bo, owner_id: "", words: "Ada on Bo" },
      { person_id: "", owner_id: ids.Bo, words: "Bo on Ada" },
    ]);
    expect(await db.query("select contact_email, total from invoices_demo order by contact_email")).toEqual([
      { contact_email: "", total: "120" },
      { contact_email: "bo@harbor.example", total: "120" },
    ]);
    // Only the keyed hash stays, as an opt-out from every email.
    expect(await db.query("select email, email_hash, scope, source from opt_outs")).toEqual([{ email: null, email_hash: hashOf("ada@harbor.example"), scope: "all", source: "forget" }]);
    expect(await draftEmail(db, { to: "ADA+again@harbor.example", subject: "Hi", body: "x", sendKey: "k/again" })).toEqual({ status: "opted_out" });
    expect(await db.query("select status, decision from inbox_items where kind = 'person-forget'")).toEqual([{ status: "done", decision: "approve" }]);
    expect(await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER)).toEqual({ status: "done_before" });
    // The person writes again: a fresh request raises a new card.
    await submitContact(db, { name: "Ada", email: "ada@harbor.example", phone: "", message: "Me again" }, { now: NOW });
    expect(await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER)).toMatchObject({ status: "card_raised", previous: "forgotten" });
    await db.close();
  });
  it("keeps the rows an entity keeps: turning blank into delete is caught", async () => {
    const { db, kinds, refs } = await seeded();
    const r = await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, NOW);
    await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER);
    expect(await count(db, "invoices_demo")).toBe(2);
    expect(await count(db, "review_inputs")).toBe(2);
    await db.close();
  });
  it("finds a team member through their work email alone", async () => {
    const { db, kinds, refs } = await seeded();
    const [cy] = await db.query<{ id: string }>("insert into people (name, work_email) values ('Cy', 'Cy@Harbor.example') returning id");
    await db.query("insert into chores (title, owner_id) values ('chore Cy', $1)", [cy.id]);
    const out = await exportPerson(db, refs, "cy@harbor.example", NOW, OWNER);
    expect(Object.fromEntries(Object.entries(out.apps).filter(([, v]) => v.length).map(([k, v]) => [k, v.length]))).toEqual({ "team-demo/people": 1, "team-demo/chores": 1 });
    const r = await forgetPerson(db, kinds, refs, "cy@harbor.example", NOW, OWNER);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, NOW);
    expect(await forgetPerson(db, kinds, refs, "cy@harbor.example", NOW, OWNER)).toEqual({ status: "forgotten", counts: { about: { "team-demo/people": 1 }, linked: { "team-demo/chores": 1 } } });
    expect(await db.query("select owner_id from chores where title = 'chore Cy'")).toEqual([{ owner_id: "" }]);
    expect(await count(db, "people")).toBe(2);
    await db.close();
  });
  it("widens an unsubscribe to every email and drops the address it kept", async () => {
    const { db, kinds, refs } = await seeded();
    await optOut(db, { email: "dee@harbor.example", source: "unsubscribe", scope: "marketing" }, NOW);
    expect(await db.query("select email, scope from opt_outs")).toEqual([{ email: "dee@harbor.example", scope: "marketing" }]);
    const r = await forgetPerson(db, kinds, refs, "Dee@harbor.example", NOW, OWNER);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, NOW);
    expect(await forgetPerson(db, kinds, refs, "dee@harbor.example", NOW, OWNER)).toEqual({ status: "forgotten", counts: { about: { opt_outs: 1 }, linked: {} } });
    expect(await db.query("select email, email_hash, scope from opt_outs")).toEqual([{ email: null, email_hash: hashOf("dee@harbor.example"), scope: "all" }]);
    expect(await draftEmail(db, { to: "dee@harbor.example", subject: "Receipt", body: "x", sendKey: "k/dee" })).toEqual({ status: "opted_out" });
    await db.close();
  });
  it("says nothing is held for a stranger, and writes nothing", async () => {
    const { db, kinds, refs } = await seeded();
    expect(await forgetPerson(db, kinds, refs, "nobody@harbor.example", NOW, OWNER)).toEqual({ status: "nothing" });
    expect(await count(db, "inbox_items where kind = 'person-forget'")).toBe(0);
    expect(await count(db, "opt_outs")).toBe(0);
    await db.close();
  });
  it("refuses a person with no email plainly, and changes nothing", async () => {
    const { db, kinds, refs } = await seeded();
    for (const bad of ["", "Ada", "Ada <ada@harbor.example>", "ada@harbor.example, bo@harbor.example"]) {
      await expect(forgetPerson(db, kinds, refs, bad, NOW, OWNER)).rejects.toThrow("Use one plain email address, like name@example.com.");
      await expect(exportPerson(db, refs, bad, NOW, OWNER)).rejects.toThrow("Use one plain email address, like name@example.com.");
    }
    expect(await count(db, "inbox_items where kind = 'person-forget'")).toBe(0);
    expect(await count(db, "contacts")).toBe(2);
    await db.close();
  });
  it("refuses to work without FOUNDATION_SECRET", async () => {
    const { db, kinds, refs } = await seeded();
    vi.stubEnv("FOUNDATION_SECRET", "");
    await expect(forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER)).rejects.toThrow(/FOUNDATION_SECRET/);
    await expect(exportPerson(db, refs, "ada@harbor.example", NOW, OWNER)).rejects.toThrow(/FOUNDATION_SECRET/);
    expect(await count(db, "inbox_items where kind = 'person-forget'")).toBe(0);
    await db.close();
  });
  it("never forgets someone who still has an account", async () => {
    const { db, kinds, refs } = await seeded();
    // The accounts table arrives with the hosted database (K1). Its shape, as K1 creates it:
    await db.query(`create table accounts (id uuid primary key default gen_random_uuid(), user_id uuid, email text not null,
      role text not null, departments text[] not null default '{}', added_at timestamptz not null default now(), removed_at timestamptz)`);
    await db.query("insert into accounts (email, role) values ('Ada@harbor.example', 'team')");
    expect(await forgetPerson(db, kinds, refs, "ada+x@harbor.example", NOW, OWNER)).toEqual({ status: "has_account" });
    expect(await count(db, "inbox_items where kind = 'person-forget'")).toBe(0);
    await db.query("update accounts set removed_at = $1", [NOW]);
    expect(await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER)).toMatchObject({ status: "card_raised" });
    await db.close();
  });
  it("answers only the owner, and tells anyone else nothing about who exists", async () => {
    const { db, kinds, refs } = await seeded();
    for (const email of ["ada@harbor.example", "nobody@harbor.example", "not an address"]) {
      expect(await forgetPerson(db, kinds, refs, email, NOW, { actor: TEAM })).toEqual({ status: "owner_only" });
      await expect(exportPerson(db, refs, email, NOW, { actor: TEAM })).rejects.toThrow(OwnerOnlyError);
      await expect(exportPerson(db, refs, email, NOW, { actor: null })).rejects.toThrow("Only the owner can see or remove a person's records.");
    }
    expect(await count(db, "inbox_items where kind = 'person-forget'")).toBe(0);
    // No lookup runs before the check.
    const silent = { query: async () => { throw new Error("queried"); } } as unknown as Db;
    expect(await forgetPerson(silent, kinds, refs, "ada@harbor.example", NOW, { actor: TEAM })).toEqual({ status: "owner_only" });
    await expect(exportPerson(silent, refs, "ada@harbor.example", NOW, { actor: TEAM })).rejects.toThrow(OwnerOnlyError);
    await db.close();
  });
  it("never puts the address in an error", async () => {
    const { db, kinds, refs } = await seeded();
    const errs: string[] = [];
    for (const bad of ["ada@harbor", "ada@@harbor.example"]) {
      await forgetPerson(db, kinds, refs, bad, NOW, OWNER).catch((e: Error) => errs.push(e.message));
      await exportPerson(db, refs, bad, NOW, OWNER).catch((e: Error) => errs.push(e.message));
    }
    vi.stubEnv("FOUNDATION_SECRET", "");
    await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW, OWNER).catch((e: Error) => errs.push(e.message));
    expect(errs).toHaveLength(5);
    expect(errs.join("\n")).not.toMatch(/ada|harbor/i);
    await db.close();
  });
  it("the summary never names the person", () => {
    const s = forgetSummary({ about: { contacts: 1, inbox_items: 1, outbox: 1, "leads-demo/leads_demo": 1 }, linked: { "team-demo/chores": 2 } });
    expect(s).toBe("Forgot one person: 1 contacts, 1 inbox_items, 1 outbox, 1 leads-demo/leads_demo. Cleared the link to them in other people's records: 2 team-demo/chores.");
    expect(forgetSummary({ about: { contacts: 1 }, linked: {} })).toBe("Forgot one person: 1 contacts.");
    expect(s).not.toMatch(/@/);
  });
});
