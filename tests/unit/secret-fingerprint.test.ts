import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import { coreDb, KEY_EXT } from "../support/db";
import { draftEmail, isOptedOut, optOut, sendApproved, type Sender } from "@/lib/data/outbox";
import { exportPerson, forgetPerson, planForget } from "@/lib/data/person";
import type { PersonRef } from "@/lib/key/schema";
import { loadCardKinds } from "@/lib/data/card-kinds";
import { decideCard, submitContact } from "@/lib/data/inbox";
import { PIN_OWNER } from "@/lib/auth/roles";
import { emailHash } from "@/lib/email";
import { SECRET_MISMATCH, secretFingerprint } from "@/lib/data/secret-check";
import type { Db } from "@/lib/db/types";

// The opt-out list is keyed by FOUNDATION_SECRET. A different value on the hosted site than on the owner's
// computer would make every hash-only opt-out (a forgotten person) unmatchable there, so core records a keyed
// fingerprint of the secret on its first keyed use and every keyed reader and writer compares against it first.

const T0 = new Date("2026-10-05T16:00:00Z");
const A = "fingerprint-secret-a-".padEnd(40, "a");
const B = "fingerprint-secret-b-".padEnd(40, "b");
const OWNER = { actor: PIN_OWNER };
const MAIL = { to: "jo@harbor.example", subject: "Your booking", body: "See you Tuesday.", sendKey: "bookings/b1/confirm" };
const sender = (): Sender => vi.fn(async () => ({ providerRef: "msg_1" })) as never;
const stored = async (db: Db) => db.query<{ value: string }>("select value from core_settings where key = 'secret_fingerprint'");

beforeEach(() => { vi.stubEnv("FOUNDATION_SECRET", A); });
afterEach(() => { vi.unstubAllEnvs(); });

async function approvedRow(db: Db): Promise<string> {
  const d = await draftEmail(db, MAIL);
  if (d.status !== "drafted") throw new Error("not drafted");
  await db.query("update outbox set status = 'approved', approved_at = $2 where id = $1", [d.id, T0]);
  return d.id;
}

describe("the secret fingerprint", () => {
  it("is an HMAC under the secret of a fixed label, so it never reveals the secret", () => {
    const fp = secretFingerprint(A);
    expect(fp).toBe(createHmac("sha256", A).update("foundation-fingerprint").digest("hex"));
    expect(fp).not.toContain(A);
    expect(secretFingerprint(B)).not.toBe(fp);
  });
  it("is written on the first keyed use, and only once", async () => {
    const db = await coreDb();
    expect(await stored(db)).toEqual([]);
    await optOut(db, { email: "jo@harbor.example", source: "owner", scope: "all" }, T0);
    expect(await stored(db)).toEqual([{ value: secretFingerprint(A) }]);
    await optOut(db, { email: "bo@harbor.example", source: "owner", scope: "all" }, T0);
    expect(await stored(db)).toEqual([{ value: secretFingerprint(A) }]);
    await db.close();
  });
  it("a mismatched secret refuses recording and checking an opt-out", async () => {
    const db = await coreDb();
    await optOut(db, { email: "jo@harbor.example", source: "owner", scope: "all" }, T0);
    await expect(optOut(db, { email: "bo@harbor.example", source: "owner", scope: "all" }, T0, B)).rejects.toThrow(SECRET_MISMATCH);
    await expect(isOptedOut(db, "bo@harbor.example", "transactional", B)).rejects.toThrow(SECRET_MISMATCH);
    expect(await draftEmail(db, { ...MAIL, to: "bo@harbor.example" }, B)).toEqual({ status: "invalid", error: SECRET_MISMATCH });
    expect(await db.query("select count(*)::int as n from opt_outs")).toEqual([{ n: 1 }]);
    expect(await stored(db)).toEqual([{ value: secretFingerprint(A) }]);
    await db.close();
  });
  it("a mismatched secret refuses sending, and the row stays approved", async () => {
    const db = await coreDb();
    const id = await approvedRow(db);
    const send = sender();
    await expect(sendApproved(db, send, T0, 20, { secret: B })).rejects.toThrow(SECRET_MISMATCH);
    expect(send).not.toHaveBeenCalled();
    expect(await db.query("select status, attempts from outbox where id = $1", [id])).toEqual([{ status: "approved", attempts: 0 }]);
    // The matching secret sends it.
    expect(await sendApproved(db, send, T0, 20, { secret: A })).toEqual({ sent: 1, failed: 0, refused: 0 });
    await db.close();
  });
  it("refuses sending when the fingerprint cannot be read", async () => {
    const db = await coreDb();
    await approvedRow(db);
    const blind: Db = {
      ...db,
      query: (async (sql: string, params?: unknown[]) => {
        if (/core_settings/.test(sql)) throw new Error("connection reset");
        return db.query(sql, params);
      }) as Db["query"],
      transaction: db.transaction.bind(db),
      exec: db.exec.bind(db),
      close: db.close.bind(db),
    };
    const send = sender();
    await expect(sendApproved(blind, send, T0)).rejects.toThrow();
    await expect(isOptedOut(blind, "jo@harbor.example", "transactional")).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
    expect(await db.query("select status from outbox")).toEqual([{ status: "approved" }]);
    await db.close();
  });
  it("refuses sending when the stored fingerprint is gone or changed after the pass began checking", async () => {
    const db = await coreDb();
    await approvedRow(db);
    await db.query("update core_settings set value = 'not-this-secret' where key = 'secret_fingerprint'");
    const send = sender();
    await expect(sendApproved(db, send, T0)).rejects.toThrow(SECRET_MISMATCH);
    expect(send).not.toHaveBeenCalled();
    await db.close();
  });
});

describe("forget and export under the fingerprint", () => {
  async function withPerson() {
    const db = await coreDb();
    const kinds = await loadCardKinds(KEY_EXT);
    const refs: PersonRef[] = [];
    await submitContact(db, { name: "Ada", email: "ada@harbor.example", phone: "", message: "Please remove me" }, { now: T0 });
    return { db, kinds, refs };
  }
  it("a mismatched secret refuses forget and export, and changes nothing", async () => {
    const { db, kinds, refs } = await withPerson();
    await optOut(db, { email: "bo@harbor.example", source: "owner", scope: "all" }, T0);
    await expect(forgetPerson(db, kinds, refs, "ada@harbor.example", T0, { ...OWNER, secret: B })).rejects.toThrow(SECRET_MISMATCH);
    await expect(planForget(db, refs, "ada@harbor.example", { ...OWNER, secret: B })).rejects.toThrow(SECRET_MISMATCH);
    await expect(exportPerson(db, refs, "ada@harbor.example", T0, { ...OWNER, secret: B })).rejects.toThrow(SECRET_MISMATCH);
    expect(await db.query("select count(*)::int as n from inbox_items where kind = 'person-forget'")).toEqual([{ n: 0 }]);
    // Even an approved forget does not run under the wrong secret.
    const r = await forgetPerson(db, kinds, refs, "ada@harbor.example", T0, OWNER);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, T0);
    await expect(forgetPerson(db, kinds, refs, "ada@harbor.example", T0, { ...OWNER, secret: B })).rejects.toThrow(SECRET_MISMATCH);
    expect(await db.query("select count(*)::int as n from contacts")).toEqual([{ n: 1 }]);
    await db.close();
  });
  it("forget under the matching secret keeps protection", async () => {
    const { db, kinds, refs } = await withPerson();
    const r = await forgetPerson(db, kinds, refs, "ada@harbor.example", T0, OWNER);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, T0);
    expect(await forgetPerson(db, kinds, refs, "ada@harbor.example", T0, OWNER)).toMatchObject({ status: "forgotten" });
    expect(await isOptedOut(db, "Ada+x@harbor.example", "transactional")).toBe(true);
    expect(await draftEmail(db, { ...MAIL, to: "ada@harbor.example" })).toEqual({ status: "opted_out" });
    // Under another secret the hash-only row could not match, so nothing is drafted or checked at all.
    expect(await draftEmail(db, { ...MAIL, to: "ada@harbor.example" }, B)).toEqual({ status: "invalid", error: SECRET_MISMATCH });
    await db.close();
  });
  it("never deletes an earlier hash-only row kept under another secret", async () => {
    const { db, kinds, refs } = await withPerson();
    // A forgotten person's row from before the fingerprint, under another secret: only its hash is kept.
    const earlier = emailHash("ada@harbor.example", B);
    await db.query("insert into opt_outs (email, email_hash, source, scope) values (null, $1, 'forget', 'all')", [earlier]);
    const r = await forgetPerson(db, kinds, refs, "ada@harbor.example", T0, OWNER);
    if (r.status !== "card_raised") throw new Error("no card");
    await decideCard(db, kinds, { cardId: r.cardId, decision: "approve", actor: PIN_OWNER }, T0);
    expect(await forgetPerson(db, kinds, refs, "ada@harbor.example", T0, OWNER)).toMatchObject({ status: "forgotten" });
    expect(await db.query("select email_hash from opt_outs order by email_hash = $1 desc", [earlier])).toEqual([
      { email_hash: earlier },
      { email_hash: emailHash("ada@harbor.example", A) },
    ]);
    await db.close();
  });
});
