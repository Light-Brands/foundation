import { describe, it, expect, beforeEach, vi } from "vitest";
import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { coreDb, KEY_EXT, ROOT } from "../support/db";
import { migrate } from "@/lib/db/migrate";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { submitContact, decideCard } from "@/lib/data/inbox";
import { draftEmail, optOut } from "@/lib/data/outbox";
import { PIN_OWNER } from "@/lib/auth/roles";
import { emailHash } from "@/lib/email";
import { writeCard } from "@/lib/data/cards";
import type { Db } from "@/lib/db/types";
import type { KindRegistry } from "@/lib/data/card-kinds";
import type { PersonRef } from "@/lib/key/schema";
import { exportPerson, exportTarget, forgetPerson, forgetSummary, installedPersonRefs } from "@/lib/data/person";

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
  return { root, db, kinds, refs, ids };
}

const count = async (db: Db, table: string) => (await db.query<{ n: number }>(`select count(*)::int as n from ${table}`))[0].n;

describe("export", () => {
  it("exports one person whole, and nobody else", async () => {
    const { db, refs } = await seeded();
    const out = await exportPerson(db, refs, "ADA@harbor.example", NOW);
    expect(Object.fromEntries(Object.entries(out.core).map(([k, v]) => [k, v.length]))).toEqual({ contacts: 1, inbox_items: 2, outbox: 1, opt_outs: 0 });
    expect(Object.fromEntries(Object.entries(out.apps).map(([k, v]) => [k, v.length]))).toEqual({
      "leads-demo/leads_demo": 1, "team-demo/people": 2, "team-demo/chores": 1, "team-demo/review_inputs": 2, "team-demo/invoices_demo": 1,
    });
    expect(out.email_hash).toBe(hashOf("ada@harbor.example"));
    expect(out.generated_at).toBe(NOW.toISOString());
    expect(JSON.stringify(out)).not.toMatch(/bo@harbor\.example|Hello from Bo|chore Bo|lead Bo/);
    await db.close();
  });
  it("keeps exports out of the repository", () => {
    expect(exportTarget(ROOT, null, "a".repeat(64), "2026-10-05")).toBe(path.join(ROOT, ".data/exports/person-aaaaaaaaaaaa-2026-10-05.json"));
    expect(exportTarget(ROOT, "/private/tmp/out", "a".repeat(64), "2026-10-05")).toBe("/private/tmp/out/person-aaaaaaaaaaaa-2026-10-05.json");
    expect(exportTarget(ROOT, path.join(ROOT, ".data/exports/june"), "a".repeat(64), "2026-10-05")).toBe(path.join(ROOT, ".data/exports/june/person-aaaaaaaaaaaa-2026-10-05.json"));
    expect(() => exportTarget(ROOT, path.join(ROOT, "key"), "a".repeat(64), "2026-10-05")).toThrow(/outside this repository/);
    expect(() => exportTarget(ROOT, ROOT, "a".repeat(64), "2026-10-05")).toThrow(/outside this repository/);
    expect(() => exportTarget(ROOT, path.join(ROOT, ".data/exports-old"), "a".repeat(64), "2026-10-05")).toThrow(/outside this repository/);
  });
});

describe("forget", () => {
  it("raises a card first and changes nothing", async () => {
    const { db, kinds, refs } = await seeded();
    const first = await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW);
    expect(first).toMatchObject({ status: "card_raised", previous: "none" });
    expect(await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW)).toEqual({ status: "waiting" });
    const [card] = await db.query<{ title: string; body: string; always_human: boolean; category: string }>("select title, body, always_human, category from inbox_items where kind = 'person-forget'");
    expect(card.title).toBe("Forget one person on request");
    expect(card.always_human).toBe(true);
    expect(card.category).toBe("risk");
    expect(card.body).not.toMatch(/@|Ada/i);
    expect(card.body).toMatch(/1 in leads-demo\/leads_demo/);
    expect(card.body.trim().split("\n").at(-1)).toMatch(/notes or messages inside your apps.*mentioned only by name/);
    expect(await count(db, "contacts")).toBe(2);
    expect(await count(db, "people")).toBe(2);
    expect(await count(db, "opt_outs")).toBe(0);
    await db.close();
  });
  it("a declined card forgets nothing, and the next request gets a new card", async () => {
    const { db, kinds, refs } = await seeded();
    const r = await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "decline", actor: PIN_OWNER }, NOW);
    const again = await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW);
    expect(again).toMatchObject({ status: "card_raised", previous: "declined" });
    expect(await count(db, "contacts")).toBe(2);
    const keys = await db.query<{ run_key: string }>("select run_key from inbox_items where kind = 'person-forget' order by run_key");
    expect(keys.map((k) => k.run_key)).toEqual([1, 2].map((n) => `forget:${hashOf("ada@harbor.example").slice(0, 16)}:${n}`));
    expect(await db.query("select expires_at from inbox_items where kind = 'person-forget'")).toEqual([{ expires_at: null }, { expires_at: null }]);
    await db.close();
  });
  it("forgets every reference once approved, across two apps", async () => {
    const { db, kinds, refs, ids } = await seeded();
    const r = await forgetPerson(db, kinds, refs, "Ada@Harbor.example", NOW);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, NOW);
    const done = await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW);
    expect(done).toEqual({ status: "forgotten", counts: {
      inbox_items: 2, outbox: 1, contacts: 1, "leads-demo/leads_demo": 1,
      "team-demo/people": 2, "team-demo/chores": 1, "team-demo/review_inputs": 2, "team-demo/invoices_demo": 1,
    } });
    expect(await db.query("select email from contacts")).toEqual([{ email: "bo@harbor.example" }]);
    expect(await db.query("select title, body, contact_id from inbox_items where kind = 'contact' order by title")).toEqual([
      { title: "A forgotten person", body: "", contact_id: null },
      { title: "Bo sent a message", body: "Hello from Bo", contact_id: expect.any(String) },
    ]);
    expect(await db.query("select title, body from inbox_items where title = 'Call back' or body like '%vip%'")).toEqual([]);
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
    expect(await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW)).toEqual({ status: "done_before" });
    // The person writes again: a fresh request raises a new card.
    await submitContact(db, { name: "Ada", email: "ada@harbor.example", phone: "", message: "Me again" }, { now: NOW });
    expect(await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW)).toMatchObject({ status: "card_raised", previous: "forgotten" });
    await db.close();
  });
  it("keeps the rows an entity keeps: turning blank into delete is caught", async () => {
    const { db, kinds, refs } = await seeded();
    const r = await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, NOW);
    await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW);
    expect(await count(db, "invoices_demo")).toBe(2);
    expect(await count(db, "review_inputs")).toBe(2);
    await db.close();
  });
  it("finds a team member through their work email alone", async () => {
    const { db, kinds, refs } = await seeded();
    const [cy] = await db.query<{ id: string }>("insert into people (name, work_email) values ('Cy', 'Cy@Harbor.example') returning id");
    await db.query("insert into chores (title, owner_id) values ('chore Cy', $1)", [cy.id]);
    const out = await exportPerson(db, refs, "cy@harbor.example", NOW);
    expect(Object.fromEntries(Object.entries(out.apps).filter(([, v]) => v.length).map(([k, v]) => [k, v.length]))).toEqual({ "team-demo/people": 1, "team-demo/chores": 1 });
    const r = await forgetPerson(db, kinds, refs, "cy@harbor.example", NOW);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, NOW);
    expect(await forgetPerson(db, kinds, refs, "cy@harbor.example", NOW)).toEqual({ status: "forgotten", counts: { "team-demo/people": 1, "team-demo/chores": 1 } });
    expect(await db.query("select owner_id from chores where title = 'chore Cy'")).toEqual([{ owner_id: "" }]);
    expect(await count(db, "people")).toBe(2);
    await db.close();
  });
  it("widens an unsubscribe to every email and drops the address it kept", async () => {
    const { db, kinds, refs } = await seeded();
    await optOut(db, { email: "dee@harbor.example", source: "unsubscribe", scope: "marketing" }, NOW);
    expect(await db.query("select email, scope from opt_outs")).toEqual([{ email: "dee@harbor.example", scope: "marketing" }]);
    const r = await forgetPerson(db, kinds, refs, "Dee@harbor.example", NOW);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, NOW);
    expect(await forgetPerson(db, kinds, refs, "dee@harbor.example", NOW)).toEqual({ status: "forgotten", counts: { opt_outs: 1 } });
    expect(await db.query("select email, email_hash, scope from opt_outs")).toEqual([{ email: null, email_hash: hashOf("dee@harbor.example"), scope: "all" }]);
    expect(await draftEmail(db, { to: "dee@harbor.example", subject: "Receipt", body: "x", sendKey: "k/dee" })).toEqual({ status: "opted_out" });
    await db.close();
  });
  it("says nothing is held for a stranger, and writes nothing", async () => {
    const { db, kinds, refs } = await seeded();
    expect(await forgetPerson(db, kinds, refs, "nobody@harbor.example", NOW)).toEqual({ status: "nothing" });
    expect(await count(db, "inbox_items where kind = 'person-forget'")).toBe(0);
    expect(await count(db, "opt_outs")).toBe(0);
    await db.close();
  });
  it("refuses a person with no email plainly, and changes nothing", async () => {
    const { db, kinds, refs } = await seeded();
    for (const bad of ["", "Ada", "Ada <ada@harbor.example>", "ada@harbor.example, bo@harbor.example"]) {
      await expect(forgetPerson(db, kinds, refs, bad, NOW)).rejects.toThrow("Use one plain email address, like name@example.com.");
      await expect(exportPerson(db, refs, bad, NOW)).rejects.toThrow("Use one plain email address, like name@example.com.");
    }
    expect(await count(db, "inbox_items where kind = 'person-forget'")).toBe(0);
    expect(await count(db, "contacts")).toBe(2);
    await db.close();
  });
  it("refuses to work without FOUNDATION_SECRET", async () => {
    const { db, kinds, refs } = await seeded();
    vi.stubEnv("FOUNDATION_SECRET", "");
    await expect(forgetPerson(db, kinds, refs, "ada@harbor.example", NOW)).rejects.toThrow(/FOUNDATION_SECRET/);
    await expect(exportPerson(db, refs, "ada@harbor.example", NOW)).rejects.toThrow(/FOUNDATION_SECRET/);
    expect(await count(db, "inbox_items where kind = 'person-forget'")).toBe(0);
    await db.close();
  });
  it("never forgets someone who still has an account", async () => {
    const { db, kinds, refs } = await seeded();
    // The accounts table arrives with the hosted database (K1). Its shape, as K1 creates it:
    await db.query(`create table accounts (id uuid primary key default gen_random_uuid(), user_id uuid, email text not null,
      role text not null, departments text[] not null default '{}', added_at timestamptz not null default now(), removed_at timestamptz)`);
    await db.query("insert into accounts (email, role) values ('Ada@harbor.example', 'team')");
    expect(await forgetPerson(db, kinds, refs, "ada+x@harbor.example", NOW)).toEqual({ status: "has_account" });
    expect(await count(db, "inbox_items where kind = 'person-forget'")).toBe(0);
    await db.query("update accounts set removed_at = $1", [NOW]);
    expect(await forgetPerson(db, kinds, refs, "ada@harbor.example", NOW)).toMatchObject({ status: "card_raised" });
    await db.close();
  });
  it("the summary never names the person", () => {
    const s = forgetSummary({ contacts: 1, inbox_items: 1, outbox: 1, "leads-demo/leads_demo": 1 });
    expect(s).toBe("Forgot one person: 1 contacts, 1 inbox_items, 1 outbox, 1 leads-demo/leads_demo.");
    expect(s).not.toMatch(/@/);
  });
});
