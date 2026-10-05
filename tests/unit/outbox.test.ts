import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { coreDb } from "../support/db";
import {
  OptOutNotRecordedError, cancelEmail, claimNext, draftEmail, isOptedOut, markSent, markSentByHand, optOut, recoverStuck, sendApproved, STUCK_AFTER_MS, type Sender,
} from "@/lib/data/outbox";
import type { Db } from "@/lib/db/types";

const T0 = new Date("2026-10-05T16:00:00Z");
const later = (ms: number) => new Date(T0.getTime() + ms);
const MAIL = { to: "jo@harbor.example", subject: "Your booking", body: "See you Tuesday.", sendKey: "bookings/b1/confirm" };
// Tests stand in for K2's decision here. The inbox decision tests prove the real path.
const approve = (db: Db, id: string) => db.query("update outbox set status = 'approved', approved_at = $2 where id = $1", [id, T0]);
const sender = (): Sender & { mock: { calls: unknown[][] } } => vi.fn(async () => ({ providerRef: "msg_1" })) as never;

async function approved(db: Db, extra: Partial<Parameters<typeof draftEmail>[1]> = {}): Promise<string> {
  const d = await draftEmail(db, { ...MAIL, ...extra });
  if (d.status !== "drafted") throw new Error("not drafted");
  await approve(db, d.id);
  return d.id;
}
beforeEach(() => { vi.stubEnv("FOUNDATION_SECRET", "outbox-test-secret-of-at-least-32-chars"); });
afterEach(() => { vi.unstubAllEnvs(); });

const statusOf = async (db: Db, id: string) => (await db.query<{ status: string }>("select status from outbox where id = $1", [id]))[0].status;

describe("drafting", () => {
  it("a second draft with the same send key writes nothing", async () => {
    const db = await coreDb();
    const a = await draftEmail(db, MAIL);
    const b = await draftEmail(db, { ...MAIL, body: "Changed" });
    expect(a.status).toBe("drafted");
    expect(b).toEqual({ status: "exists", id: a.status === "drafted" ? a.id : "" });
    expect(await db.query("select body, status from outbox")).toEqual([{ body: "See you Tuesday.", status: "draft" }]);
    await db.close();
  });
  it("a send key is free again once its draft is cancelled, and takes a numbered suffix", async () => {
    const db = await coreDb();
    const a = await draftEmail(db, MAIL);
    if (a.status !== "drafted") throw new Error("not drafted");
    expect(await cancelEmail(db, a.id, T0)).toBe(true);
    expect((await draftEmail(db, MAIL)).status).toBe("drafted");
    expect((await draftEmail(db, { ...MAIL, sendKey: `${MAIL.sendKey}:2` })).status).toBe("drafted");
    expect((await draftEmail(db, MAIL)).status).toBe("exists");
    await db.close();
  });
  it("refuses an incomplete address, an empty subject and an oversized body", async () => {
    const db = await coreDb();
    expect((await draftEmail(db, { ...MAIL, to: "jo@" })).status).toBe("invalid");
    expect((await draftEmail(db, { ...MAIL, subject: " " })).status).toBe("invalid");
    expect((await draftEmail(db, { ...MAIL, body: "x".repeat(50_001) })).status).toBe("invalid");
    expect((await draftEmail(db, { ...MAIL, sendKey: "" })).status).toBe("invalid");
    expect((await draftEmail(db, { ...MAIL, sendKey: "k".repeat(201) })).status).toBe("invalid");
    expect(await db.query("select count(*)::int as n from outbox")).toEqual([{ n: 0 }]);
    await db.close();
  });
  it("refuses a line break in the address or subject, a NUL anywhere and an id that is not a UUID", async () => {
    const db = await coreDb();
    expect((await draftEmail(db, { ...MAIL, subject: "Hi\r\nBcc: all@harbor.example" })).status).toBe("invalid");
    expect((await draftEmail(db, { ...MAIL, to: "jo@harbor.example\nbcc@x.example" })).status).toBe("invalid");
    expect((await draftEmail(db, { ...MAIL, body: "a\u0000b" })).status).toBe("invalid");
    expect((await draftEmail(db, { ...MAIL, cardId: "not-a-uuid" })).status).toBe("invalid");
    expect((await draftEmail(db, { ...MAIL, contactId: "1; drop table outbox" })).status).toBe("invalid");
    expect((await draftEmail(db, { ...MAIL, sendAfter: new Date("nope") })).status).toBe("invalid");
    for (const c of ["\t", "\u0001", "\u001b", "\u007f", "\u0080", "\u0085", "\u009b", "\u009f", "\u2028", "\u2029"]) {
      expect((await draftEmail(db, { ...MAIL, subject: `Hi${c}there` })).status, JSON.stringify(c)).toBe("invalid");
    }
    await db.close();
  });
  it("keeps the local part as the job wrote it and lowercases the domain", async () => {
    const db = await coreDb();
    await draftEmail(db, { ...MAIL, to: " Jo+News@Harbor.Example " });
    expect(await db.query("select to_email from outbox")).toEqual([{ to_email: "Jo+News@harbor.example" }]);
    await db.close();
  });
  it("refuses an address the one strict reading refuses", async () => {
    const db = await coreDb();
    for (const to of ["Jo <jo@harbor.example>", '"jo"@harbor.example', "jo@harbor.example.", "jо@harbor.example"]) {
      expect(await draftEmail(db, { ...MAIL, to }), to).toEqual({ status: "invalid", error: "Use one plain email address, like name@example.com." });
    }
    await db.close();
  });
  it("drafts nothing, sends nothing and records no opt-out while FOUNDATION_SECRET is unset", async () => {
    const db = await coreDb();
    const id = await approved(db);
    vi.stubEnv("FOUNDATION_SECRET", "");
    expect((await draftEmail(db, { ...MAIL, sendKey: "k2" })).status).toBe("invalid");
    await expect(optOut(db, { email: MAIL.to, source: "reply", scope: "all" }, T0)).rejects.toThrow(/FOUNDATION_SECRET/);
    const send = sender();
    await expect(sendApproved(db, send, T0)).rejects.toThrow(/FOUNDATION_SECRET/);
    expect(send).not.toHaveBeenCalled();
    expect(await statusOf(db, id)).toBe("approved");
    await db.close();
  });
  it("drafts inside the caller's transaction, so a card and its drafts land together or not at all", async () => {
    const db = await coreDb();
    await expect(db.transaction(async (tx) => {
      expect((await draftEmail(tx, MAIL)).status).toBe("drafted");
      throw new Error("the handler failed after drafting");
    })).rejects.toThrow(/handler failed/);
    expect(await db.query("select count(*)::int as n from outbox")).toEqual([{ n: 0 }]);
    await db.close();
  });
});

describe("sending", () => {
  it("nothing sends without an approval", async () => {
    const db = await coreDb();
    await draftEmail(db, MAIL);
    const send = sender();
    expect(await sendApproved(db, send, T0)).toEqual({ sent: 0, failed: 0, refused: 0 });
    expect(send).not.toHaveBeenCalled();
    await db.close();
  });
  it("a message is sent at most once under two concurrent runs", async () => {
    const db = await coreDb();
    await approved(db);
    const send = sender();
    const [a, b] = await Promise.all([sendApproved(db, send, T0), sendApproved(db, send, T0)]);
    expect(a.sent + b.sent).toBe(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(await db.query("select status, provider_ref, attempts from outbox")).toEqual([{ status: "sent", provider_ref: "msg_1", attempts: 1 }]);
    expect(await sendApproved(db, send, later(1000))).toEqual({ sent: 0, failed: 0, refused: 0 });
    await db.close();
  });
  it("a claim takes a row only while it is approved", async () => {
    const db = await coreDb();
    const id = await approved(db);
    const first = await claimNext(db, T0);
    expect(first?.id).toBe(id);
    expect(await claimNext(db, T0)).toBeNull();
    await db.close();
  });
  it("an approved row waits until its send_after has passed", async () => {
    const db = await coreDb();
    await approved(db, { sendAfter: later(3_600_000) });
    const send = sender();
    expect(await sendApproved(db, send, later(3_599_000))).toEqual({ sent: 0, failed: 0, refused: 0 });
    expect(send).not.toHaveBeenCalled();
    expect(await sendApproved(db, send, later(3_600_000))).toEqual({ sent: 1, failed: 0, refused: 0 });
    await db.close();
  });
  it("records a failure and never retries it on its own", async () => {
    const db = await coreDb();
    await approved(db);
    const send = vi.fn(async () => { throw new Error("provider said no"); });
    expect(await sendApproved(db, send, T0)).toEqual({ sent: 0, failed: 1, refused: 0 });
    expect(await sendApproved(db, send, later(1000))).toEqual({ sent: 0, failed: 0, refused: 0 });
    expect(await db.query("select status, last_error from outbox")).toEqual([{ status: "failed", last_error: "provider said no" }]);
    await db.close();
  });
  it("an opted-out address is refused, in any spelling", async () => {
    const db = await coreDb();
    await approved(db);
    await optOut(db, { email: "Jo+Promos@Harbor.Example", source: "reply", scope: "all" }, T0);
    expect(await isOptedOut(db, " JO@harbor.example", "transactional")).toBe(true);
    expect(await draftEmail(db, { ...MAIL, sendKey: "bookings/b2/confirm" })).toEqual({ status: "opted_out" });
    const send = sender();
    expect(await sendApproved(db, send, T0)).toEqual({ sent: 0, failed: 0, refused: 1 });
    expect(send).not.toHaveBeenCalled();
    expect(await db.query("select status from outbox")).toEqual([{ status: "cancelled" }]);
    await db.close();
  });
  it("an opt-out is recorded once however often it is asked for", async () => {
    const db = await coreDb();
    await optOut(db, { email: "jo@harbor.example", source: "reply", scope: "all" }, T0);
    await optOut(db, { email: "Jo+again@Harbor.Example", source: "link", scope: "all" }, T0);
    expect(await db.query("select count(*)::int as n from opt_outs")).toEqual([{ n: 1 }]);
    await db.close();
  });
  it("a sent message stays sent", async () => {
    const db = await coreDb();
    const id = await approved(db);
    const claimed = await claimNext(db, T0);
    await markSent(db, claimed!.id, "msg_1", T0);
    await expect(db.query("update outbox set status = 'approved' where id = $1", [id])).rejects.toThrow(/stays sent/);
    await db.close();
  });
});

describe("opt-out scope", () => {
  const BASE = { baseUrl: "https://harbor.example" };
  it("a marketing opt-out stops only marketing mail, in any spelling", async () => {
    const db = await coreDb();
    const booking = await approved(db);
    const promo = await approved(db, { sendKey: "promo/1", kind: "marketing" });
    await optOut(db, { email: "Jo+Promos@Harbor.Example", source: "link", scope: "marketing" }, T0);
    expect(await isOptedOut(db, " JO@harbor.example", "marketing")).toBe(true);
    expect(await isOptedOut(db, " JO@harbor.example", "transactional")).toBe(false);
    expect((await draftEmail(db, { ...MAIL, sendKey: "promo/2", kind: "marketing" })).status).toBe("opted_out");
    expect((await draftEmail(db, { ...MAIL, sendKey: "bookings/b2/confirm" })).status).toBe("drafted");
    const send = sender();
    expect(await sendApproved(db, send, T0, 20, BASE)).toEqual({ sent: 1, failed: 0, refused: 1 });
    expect(await statusOf(db, booking)).toBe("sent");
    expect(await statusOf(db, promo)).toBe("cancelled");
    await db.close();
  });
  it("an all opt-out stops every kind", async () => {
    const db = await coreDb();
    await approved(db);
    await approved(db, { sendKey: "promo/1", kind: "marketing" });
    await optOut(db, { email: "jo@harbor.example", source: "owner", scope: "all" }, T0);
    expect(await isOptedOut(db, "JO+x@harbor.example", "transactional")).toBe(true);
    expect(await isOptedOut(db, "JO+x@harbor.example", "marketing")).toBe(true);
    const send = sender();
    expect(await sendApproved(db, send, T0, 20, BASE)).toEqual({ sent: 0, failed: 0, refused: 2 });
    expect(send).not.toHaveBeenCalled();
    await db.close();
  });
  it("an opt-out only widens", async () => {
    const db = await coreDb();
    const scope = async () => (await db.query<{ scope: string }>("select scope from opt_outs")).map((r) => r.scope);
    await optOut(db, { email: "jo@harbor.example", source: "link", scope: "marketing" }, T0);
    expect(await scope()).toEqual(["marketing"]);
    await optOut(db, { email: "Jo+again@harbor.example", source: "owner", scope: "all" }, T0);
    expect(await scope()).toEqual(["all"]);
    await optOut(db, { email: "jo@harbor.example", source: "link", scope: "marketing" }, T0);
    expect(await scope()).toEqual(["all"]);
    await db.close();
  });
  it("requires a scope", async () => {
    const db = await coreDb();
    await expect(optOut(db, { email: "jo@harbor.example", source: "x", scope: "everything" as never }, T0)).rejects.toThrow(TypeError);
    await expect(optOut(db, { email: "jo@harbor.example", source: "x" } as never, T0)).rejects.toThrow(TypeError);
    expect(await db.query("select count(*)::int as n from opt_outs")).toEqual([{ n: 0 }]);
    await db.close();
  });
  it("never raises a database error on a second unique index", async () => {
    const db = await coreDb();
    await optOut(db, { email: "jo@harbor.example", source: "link", scope: "marketing" }, T0, "an-earlier-secret-of-at-least-32-chars");
    await expect(optOut(db, { email: "jo@harbor.example", source: "owner", scope: "all" }, T0)).rejects.toThrow(OptOutNotRecordedError);
    await db.close();
  });
});

describe("every opt-out path fails closed", () => {
  const SHORT = "s".repeat(31);
  // The database answers everything except a read of the opt-out list, which errors.
  const listDown = (db: Db): Db => ({
    ...db,
    query: (async (sql: string, params?: unknown[]) => {
      if (/from opt_outs/.test(sql)) throw new Error("connection reset");
      return db.query(sql, params);
    }) as Db["query"],
    transaction: db.transaction.bind(db),
    exec: db.exec.bind(db),
    close: db.close.bind(db),
  });
  it("a short secret refuses both recording and checking, even one passed in", async () => {
    const db = await coreDb();
    await expect(optOut(db, { email: MAIL.to, source: "x", scope: "all" }, T0, SHORT)).rejects.toThrow(/FOUNDATION_SECRET/);
    await expect(isOptedOut(db, MAIL.to, "transactional", SHORT)).rejects.toThrow(/FOUNDATION_SECRET/);
    await expect(isOptedOut(db, MAIL.to, "transactional", "")).rejects.toThrow(/FOUNDATION_SECRET/);
    expect((await draftEmail(db, MAIL, SHORT)).status).toBe("invalid");
    await expect(sendApproved(db, sender(), T0, 20, { secret: SHORT })).rejects.toThrow(/FOUNDATION_SECRET/);
    expect(await db.query("select count(*)::int as n from opt_outs")).toEqual([{ n: 0 }]);
    await db.close();
  });
  it("an opt-out that could not be written for this hash is a failure, never a quiet success", async () => {
    const db = await coreDb();
    // The same address kept under an earlier secret holds the address index, so nothing is written for today's hash.
    await optOut(db, { email: MAIL.to, source: "link", scope: "all" }, T0, "an-earlier-secret-of-at-least-32-chars");
    await expect(optOut(db, { email: MAIL.to, source: "owner", scope: "all" }, T0)).rejects.toThrow(/could not record/);
    await db.close();
  });
  it("a marketing opt-out already covered by an all one is a success", async () => {
    const db = await coreDb();
    await optOut(db, { email: MAIL.to, source: "owner", scope: "all" }, T0);
    await expect(optOut(db, { email: MAIL.to, source: "link", scope: "marketing" }, T0)).resolves.toBeUndefined();
    await db.close();
  });
  it("a draft is refused when the opt-out list cannot be read", async () => {
    const db = await coreDb();
    expect(await draftEmail(listDown(db), MAIL)).toEqual({ status: "invalid", error: "We could not check who asked us to stop, so nothing was drafted. Try again in a moment." });
    expect(await db.query("select count(*)::int as n from outbox")).toEqual([{ n: 0 }]);
    await db.close();
  });
  it("a send is refused when the opt-out list cannot be read, and waits for the owner", async () => {
    const db = await coreDb();
    const id = await approved(db);
    const send = sender();
    expect(await sendApproved(listDown(db), send, T0)).toEqual({ sent: 0, failed: 0, refused: 1 });
    expect(send).not.toHaveBeenCalled();
    expect(await db.query("select status, last_error from outbox where id = $1", [id])).toEqual([
      { status: "failed", last_error: "We could not check whether this person asked us to stop, so this email was not sent." },
    ]);
    await db.close();
  });
});

describe("a provider success that arrives late", () => {
  const unknown = async () => "unknown" as const;
  it("records a send that recovery had already marked unconfirmed", async () => {
    const db = await coreDb();
    const id = await approved(db);
    const send: Sender = async () => {
      expect(await recoverStuck(db, unknown, later(STUCK_AFTER_MS + 1000))).toEqual({ sent: 0, failed: 1 });
      return { providerRef: "msg_late" };
    };
    expect(await sendApproved(db, send, T0)).toEqual({ sent: 1, failed: 0, refused: 0 });
    expect(await db.query("select status, provider_ref, sent_by_hand from outbox where id = $1", [id])).toEqual([{ status: "sent", provider_ref: "msg_late", sent_by_hand: false }]);
    await db.close();
  });
  it("counts nothing when the row was already sent by hand, or failed for another reason", async () => {
    const db = await coreDb();
    const a = await approved(db);
    const byHand: Sender = async () => {
      await recoverStuck(db, unknown, later(STUCK_AFTER_MS + 1000));
      expect(await markSentByHand(db, a, T0)).toBe("sent");
      return { providerRef: "msg_late" };
    };
    expect(await sendApproved(db, byHand, T0)).toEqual({ sent: 0, failed: 0, refused: 0 });
    expect(await db.query("select provider_ref, sent_by_hand from outbox where id = $1", [a])).toEqual([{ provider_ref: null, sent_by_hand: true }]);
    const b = await approved(db, { sendKey: "k-b" });
    const otherFailure: Sender = async () => {
      await db.query("update outbox set status = 'failed', last_error = 'bounced' where id = $1", [b]);
      return { providerRef: "msg_late" };
    };
    expect(await sendApproved(db, otherFailure, T0)).toEqual({ sent: 0, failed: 0, refused: 0 });
    expect(await statusOf(db, b)).toBe("failed");
    await db.close();
  });
});

describe("cancelling", () => {
  it("cancels an approved row that has not started sending, so it never goes out", async () => {
    const db = await coreDb();
    const id = await approved(db, { sendAfter: later(3_600_000) });
    expect(await cancelEmail(db, id, T0)).toBe(true);
    const send = sender();
    expect(await sendApproved(db, send, later(7_200_000))).toEqual({ sent: 0, failed: 0, refused: 0 });
    expect(send).not.toHaveBeenCalled();
    expect(await statusOf(db, id)).toBe("cancelled");
    await db.close();
  });
  it("never cancels a row that is sending or sent", async () => {
    const db = await coreDb();
    const id = await approved(db);
    await claimNext(db, T0);
    expect(await cancelEmail(db, id, T0)).toBe(false);
    expect(await statusOf(db, id)).toBe("sending");
    await markSent(db, id, "msg_1", T0);
    expect(await cancelEmail(db, id, T0)).toBe(false);
    expect(await statusOf(db, id)).toBe("sent");
    await db.close();
  });
});

describe("sent by hand", () => {
  it("records an approved or failed email the owner sent another way, and never retries it", async () => {
    const db = await coreDb();
    const a = await approved(db);
    expect(await markSentByHand(db, a, T0)).toBe("sent");
    expect(await db.query("select status, sent_by_hand from outbox where id = $1", [a])).toEqual([{ status: "sent", sent_by_hand: true }]);
    const b = await approved(db, { sendKey: "k-failed" });
    await claimNext(db, T0);
    await db.query("update outbox set status = 'failed' where id = $1", [b]);
    expect(await markSentByHand(db, b, T0)).toBe("sent");
    const send = sender();
    expect(await sendApproved(db, send, later(1000))).toEqual({ sent: 0, failed: 0, refused: 0 });
    await db.close();
  });
  it("refuses a draft, a row that is sending and one already sent", async () => {
    const db = await coreDb();
    const d = await draftEmail(db, MAIL);
    if (d.status !== "drafted") throw new Error("not drafted");
    expect(await markSentByHand(db, d.id, T0)).toBe("not_waiting");
    await approve(db, d.id);
    await claimNext(db, T0);
    expect(await markSentByHand(db, d.id, T0)).toBe("not_waiting");
    await markSent(db, d.id, "msg_1", T0);
    expect(await markSentByHand(db, d.id, T0)).toBe("not_waiting");
    expect(await db.query("select sent_by_hand from outbox")).toEqual([{ sent_by_hand: false }]);
    await db.close();
  });
});

describe("recovering a stuck send", () => {
  async function stuck(db: Db, key: string) {
    const id = await approved(db, { sendKey: key });
    await db.query("update outbox set status = 'sending', claimed_at = $2 where id = $1", [id, T0]);
    return id;
  }
  it("a stuck sending row is recovered without a second send", async () => {
    const db = await coreDb();
    const wasSent = await stuck(db, "k-sent");
    const unknown = await stuck(db, "k-unknown");
    const answers: Record<string, "sent" | "unknown"> = { "k-sent": "sent", "k-unknown": "unknown" };
    const lookup = vi.fn(async (row: { send_key: string }) => answers[row.send_key]);
    expect(await recoverStuck(db, lookup, later(STUCK_AFTER_MS - 1000))).toEqual({ sent: 0, failed: 0 });
    expect(await recoverStuck(db, lookup, later(STUCK_AFTER_MS + 1000))).toEqual({ sent: 1, failed: 1 });
    const row = async (id: string) => (await db.query<{ status: string; last_error: string }>("select status, last_error from outbox where id = $1", [id]))[0];
    expect((await row(wasSent)).status).toBe("sent");
    expect(await row(unknown)).toEqual({ status: "failed", last_error: "We could not confirm whether this email was sent. Check your sent mail before sending it again." });
    const send = sender();
    expect(await sendApproved(db, send, later(STUCK_AFTER_MS + 2000))).toEqual({ sent: 0, failed: 0, refused: 0 });
    expect(send).not.toHaveBeenCalled();
    await db.close();
  });
  it("never puts an unconfirmed send back in the queue, whatever the lookup answers", async () => {
    const db = await coreDb();
    const id = await stuck(db, "k-odd");
    const lookup = (async () => "not_sent") as never;
    expect(await recoverStuck(db, lookup, later(STUCK_AFTER_MS + 1000))).toEqual({ sent: 0, failed: 1 });
    expect(await statusOf(db, id)).toBe("failed");
    const send = sender();
    expect((await sendApproved(db, send, later(STUCK_AFTER_MS + 2000))).sent).toBe(0);
    await db.close();
  });
  it("treats a lookup that throws as unknown", async () => {
    const db = await coreDb();
    await stuck(db, "k-err");
    const r = await recoverStuck(db, async () => { throw new Error("timeout"); }, later(STUCK_AFTER_MS + 1000));
    expect(r).toEqual({ sent: 0, failed: 1 });
    await db.close();
  });
});
