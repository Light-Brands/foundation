import { describe, it, expect } from "vitest";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { KEY_EXT } from "../support/db";
import { checkKeyFolder } from "@/lib/key/formats";
import { checkCardKinds, readDeclarations } from "@/lib/key/declarations";

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
      decide: "done", expires_days: 14, on_lapse: "raised_again", source: "leads-demo",
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
