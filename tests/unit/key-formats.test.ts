import { describe, it, expect } from "vitest";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  checkKeyFolder, checkKeyYaml, checkCharter, checkSkill, checkWorkflow, checkDefinition, checkLogText, parseFrontMatter,
} from "@/lib/key/formats";

const dir = path.join(process.cwd(), "tests/fixtures/key-bad");
const fx = (name: string) => readFileSync(path.join(dir, name), "utf8");

const charter = `# Care

## Role
Keeps clients happy.
## Who I serve
The owner.
## How I work
Plainly.
## What I know
The client list.
## What I never do
Send without approval.
## Tasks
- Answer inquiries
## Skills
- send-quote
## Memory
- preference: short emails
- context: closed on Sundays
`;
const skill = `---
name: send-quote
description: Drafts and sends a quote.
---
## Input
A request.
## Steps
Draft it.
## Output
A quote.
## Check
The total matches.
`;
const workflow = `---
name: Nightly follow-up
agent: care
category: keep
trigger: every
every: 1d
---
## Goal
Follow up.
## Steps
Do it.
## Expected output
A note.
## Check
Sent.
## When blocked
Ask the owner.
`;
const definition = `app: clients
category: keep
fields:
  - { name: stage, type: select, options: [new, active] }
  - { name: notes, type: text }
automations:
  - { workflow: nightly-follow-up }
migrations: migrations/
`;
const keyYaml = `key: 1
client: acme
stage: seed
home: repo
roster:
  - { role: care, charter: agents/care/charter.md }
skills: [{ slug: send-quote }]
apps: [{ slug: clients, category: keep }]
workflows: [{ slug: nightly-follow-up, category: keep }]
`;

describe("the seeded Key", () => {
  it("passes every check", async () => {
    expect(await checkKeyFolder(process.cwd())).toEqual([]);
  });
});

describe("a root without key.yaml", () => {
  it("reports it and keeps checking the other folders", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "key-"));
    mkdirSync(path.join(root, "key/log"), { recursive: true });
    writeFileSync(path.join(root, "key/log/a.md"), "mail ada@example.com\n");
    const problems = await checkKeyFolder(root);
    expect(problems).toContain("key/key.yaml: missing");
    expect(problems.join("\n")).toMatch(/log\/a\.md: log text holds an email/);
  });
});

describe("the email check", () => {
  it("flags real addresses", () => {
    expect(checkLogText("l.md", "ada@example.com")).not.toEqual([]);
    expect(checkLogText("l.md", "A.Lane+test@mail.example.co.uk")).not.toEqual([]);
  });
  it("passes package pins and import aliases", () => {
    for (const t of ["next@16.0.1", '"@/lib/x.ts"', "react@19.3.0"]) expect(checkLogText("l.md", `used ${t}`)).toEqual([]);
  });
});

describe("valid files", () => {
  it("pass", () => {
    expect(checkKeyYaml("key.yaml", keyYaml)).toEqual([]);
    expect(checkCharter("c.md", charter)).toEqual([]);
    expect(checkSkill("s.md", skill)).toEqual([]);
    expect(checkWorkflow("w.md", workflow)).toEqual([]);
    expect(checkDefinition("d.yaml", definition, ["nightly-follow-up"])).toEqual([]);
  });
  it("parses front matter", () => {
    expect(parseFrontMatter(skill)?.data.name).toBe("send-quote");
    expect(parseFrontMatter("no front matter")).toBeNull();
  });
  it("a commit hash and a timestamp pass the privacy check", () => {
    expect(checkLogText("log.md", "2026-10-05 14:02 shipped the quote form in 3f2a91c\n")).toEqual([]);
  });
});

describe("bad fixtures fail with the file name and the rule", () => {
  const cases: [string, (n: string, t: string) => string[], RegExp][] = [
    ["charter-out-of-order.md", checkCharter, /order/],
    ["charter-missing-memory.md", checkCharter, /missing Memory/],
    ["charter-bad-memory-type.md", checkCharter, /Memory entry/],
    ["skill-missing-description.md", checkSkill, /description/],
    ["skill-missing-check.md", checkSkill, /missing section Check/],
    ["workflow-bad-trigger.md", checkWorkflow, /trigger/],
    ["workflow-missing-when-blocked.md", checkWorkflow, /When blocked/],
    ["definition-bad-field-type.yaml", (n, t) => checkDefinition(n, t, []), /type "json"/],
    ["definition-missing-workflow.yaml", (n, t) => checkDefinition(n, t, ["other"]), /does not exist/],
    ["definition-reserved-slug.yaml", (n, t) => checkDefinition(n, t, []), /reserved/],
    ["keyyaml-reserved-app-slug.yaml", checkKeyYaml, /reserved/],
    ["keyyaml-bad-role.yaml", checkKeyYaml, /role/],
    ["log-email.md", checkLogText, /email/],
    ["log-phone.md", checkLogText, /phone/],
  ];
  for (const [name, check, rule] of cases) {
    it(name, () => {
      const problems = check(name, fx(name));
      expect(problems.length).toBeGreaterThan(0);
      for (const m of problems) expect(m.startsWith(name)).toBe(true);
      expect(problems.join("\n")).toMatch(rule);
    });
  }
});
