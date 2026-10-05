import { describe, it, expect } from "vitest";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  checkKeyFolder, checkKeyYaml, checkCharter, checkSkill, checkWorkflow, checkDefinition, checkLogText, parseFrontMatter,
} from "@/lib/key/formats";
import { parse } from "yaml";
import { contextBlockFromProfile } from "@/lib/key/context-block";
import { PROFILE_FIELDS, type Profile } from "@/lib/validate";

const emptyProfile = Object.fromEntries(PROFILE_FIELDS.map((k) => [k, ""])) as Profile;

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
every: 1 day
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
name: Clients
category: keep
runtime: custom_app
entities:
  - key: clients
    name: Client
    fields:
      - { key: stage, name: Stage, type: select, options: [new, active] }
      - { key: notes, name: Notes, type: text }
automations:
  - { workflow: nightly-follow-up }
migrations: migrations/
`;
const keyYaml = `key: 1
client: acme
name: Acme
stage: seed
home: repo
roster:
  - { persona: Mara, role: care, charter: agents/care/charter.md }
skills: [{ slug: send-quote, path: skills/send-quote/SKILL.md }]
apps: [{ slug: clients, definition: apps/clients/definition.yaml, category: keep }]
workflows: [{ slug: nightly-follow-up, path: workflows/nightly-follow-up.md, category: keep }]
`;

function keyRoot(over: Record<string, string | null> = {}): string {
  const root = mkdtempSync(path.join(tmpdir(), "keyroot-"));
  const files: Record<string, string> = {
    "key/key.yaml": keyYaml,
    "key/agents/care/charter.md": charter,
    "key/skills/send-quote/SKILL.md": skill,
    "key/workflows/nightly-follow-up.md": workflow,
    "key/apps/clients/definition.yaml": definition,
    "key/apps/clients/migrations/0001_clients_create.sql":
      "create table clients (id uuid primary key, created_at timestamptz, updated_at timestamptz, stage text, notes text);",
  };
  for (const [f, text] of Object.entries({ ...files, ...over })) {
    if (text === null) continue;
    mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    writeFileSync(path.join(root, f), text);
  }
  return root;
}

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

describe("checkKeyYaml matches the converter", () => {
  const base = (patch: string) => keyYaml.replace(/^(roster|skills|apps|workflows):.*(\n  .*)*$/gm, (m) => (patch.startsWith(m.split(":")[0] + ":") ? patch : m));
  it("passes the complete example", () => expect(checkKeyYaml("key.yaml", keyYaml)).toEqual([]));
  it("needs a path on every skill", () => {
    expect(checkKeyYaml("key.yaml", base("skills: [{ slug: send-quote }]")).join("\n")).toMatch(/skills\[0\]\.path/);
  });
  it("needs a path on every workflow", () => {
    expect(checkKeyYaml("key.yaml", base("workflows: [{ slug: nightly-follow-up, category: keep }]")).join("\n")).toMatch(/workflows\[0\]\.path/);
  });
  it("needs a definition on every app", () => {
    expect(checkKeyYaml("key.yaml", base("apps: [{ slug: clients, category: keep }]")).join("\n")).toMatch(/apps\[0\]\.definition/);
  });
  it("needs a persona on every roster entry", () => {
    expect(checkKeyYaml("key.yaml", base("roster:\n  - { role: care, charter: agents/care/charter.md }")).join("\n")).toMatch(/roster\[0\]\.persona/);
  });
});

describe("checkWorkflow every", () => {
  const wf = (every: string) => workflow.replace("every: 1 day", `every: ${every}`);
  it.each(["1 day", "30 minutes", "2 weeks", "10 seconds", "1 hour"])("accepts %s", (v) => expect(checkWorkflow("w.md", wf(v))).toEqual([]));
  it.each(["1d", "daily", "every day", "1 fortnight", "day"])("rejects %s", (v) => {
    expect(checkWorkflow("w.md", wf(v)).join("\n")).toMatch(/every must be a number and a unit/);
  });
});

describe("checkDefinition reads entities[].fields", () => {
  const def = (fields: string, extra = "") => `app: clients
category: keep
entities:
  - key: clients
    name: Client
    fields:
${fields}
${extra}migrations: migrations/
`;
  it("passes the real shape", () => expect(checkDefinition("d.yaml", definition, ["nightly-follow-up"])).toEqual([]));
  it("rejects an unknown field type", () => {
    expect(checkDefinition("d.yaml", def("      - { key: n, name: N, type: json }"), []).join("\n")).toMatch(/type "json"/);
  });
  it("needs options on select and multi_select", () => {
    expect(checkDefinition("d.yaml", def("      - { key: s, name: S, type: select }"), []).join("\n")).toMatch(/needs options/);
    expect(checkDefinition("d.yaml", def("      - { key: s, name: S, type: multi_select, options: [] }"), []).join("\n")).toMatch(/needs options/);
  });
  it("rejects a bad field key", () => {
    expect(checkDefinition("d.yaml", def("      - { key: Bad-Key, name: N, type: text }"), []).join("\n")).toMatch(/field key/);
  });
  it("rejects a bad entity key", () => {
    expect(checkDefinition("d.yaml", def("      - { key: n, name: N, type: text }").replace("key: clients", "key: Client-List"), []).join("\n")).toMatch(/entity key/);
  });
  it("rejects a field key that is a system column or repeats", () => {
    expect(checkDefinition("d.yaml", def("      - { key: id, name: N, type: text }"), []).join("\n")).toMatch(/system column/);
    expect(checkDefinition("d.yaml", def("      - { key: n, name: N, type: text }\n      - { key: n, name: M, type: text }"), []).join("\n")).toMatch(/repeats/);
  });
});

describe("checkKeyFolder cross-checks", () => {
  it("passes a complete folder", async () => expect(await checkKeyFolder(keyRoot())).toEqual([]));
  it("fails a charter named in key.yaml that is not on disk", async () => {
    expect((await checkKeyFolder(keyRoot({ "key/agents/care/charter.md": null }))).join("\n")).toMatch(/agents\/care\/charter\.md: named in key\.yaml but missing/);
  });
  it("fails a skill, workflow and definition path that is not on disk", async () => {
    const p = (await checkKeyFolder(keyRoot({ "key/skills/send-quote/SKILL.md": null, "key/workflows/nightly-follow-up.md": null }))).join("\n");
    expect(p).toMatch(/skills\/send-quote\/SKILL\.md: named in key\.yaml but missing/);
    expect(p).toMatch(/workflows\/nightly-follow-up\.md: named in key\.yaml but missing/);
    const d = (await checkKeyFolder(keyRoot({ "key/apps/clients/definition.yaml": null, "key/apps/clients/migrations/0001_clients_create.sql": null }))).join("\n");
    expect(d).toMatch(/apps\/clients\/definition\.yaml: named in key\.yaml but missing/);
  });
  it("fails an app folder that key.yaml does not list", async () => {
    const other = definition.replace("app: clients", "app: extra");
    const p = (await checkKeyFolder(keyRoot({ "key/apps/extra/definition.yaml": other, "key/apps/extra/migrations/0001_extra_create.sql": "create table clients (id uuid primary key, created_at timestamptz, updated_at timestamptz, stage text, notes text);" }))).join("\n");
    expect(p).toMatch(/apps\/extra: app folder is not listed in key\.yaml/);
  });
  it("fails when the folder name and the definition app differ", async () => {
    const p = (await checkKeyFolder(keyRoot({ "key/apps/clients/definition.yaml": definition.replace("app: clients", "app: other-name") }))).join("\n");
    expect(p).toMatch(/app folder "clients" must match the definition app "other-name"/);
  });
  it("fails a record_change workflow whose entity no app defines", async () => {
    const wf = workflow.replace("trigger: every\nevery: 1 day", "trigger: record_change\nentity: invoices\nevents: [insert]");
    const p = (await checkKeyFolder(keyRoot({ "key/workflows/nightly-follow-up.md": wf }))).join("\n");
    expect(p).toMatch(/entity "invoices" is not defined by any app/);
  });
  it("accepts a record_change workflow whose entity an app defines", async () => {
    const wf = workflow.replace("trigger: every\nevery: 1 day", "trigger: record_change\nentity: clients\nevents: [insert]");
    expect(await checkKeyFolder(keyRoot({ "key/workflows/nightly-follow-up.md": wf }))).toEqual([]);
  });
});

describe("the Commit line exemption", () => {
  it("exempts only a bare commit id", () => {
    expect(checkLogText("l.md", "- Commit: 3f2a91c\n")).toEqual([]);
    expect(checkLogText("l.md", "- Commit: 3f2a91c   \n")).toEqual([]);
  });
  it("fails a phone number placed in a Commit line", () => {
    expect(checkLogText("l.md", "- Commit: 555 123 4567\n").join("\n")).toMatch(/phone/);
    expect(checkLogText("l.md", "- Commit: 3f2a91c call 555 123 4567\n").join("\n")).toMatch(/phone/);
  });
});

describe("the examples in docs/standards/key.md", () => {
  const md = readFileSync(path.join(process.cwd(), "docs/standards/key.md"), "utf8");
  const section = (heading: string, lang: string): string => {
    const start = md.indexOf(`\n## ${heading}\n`);
    expect(start, `section ${heading}`).toBeGreaterThan(-1);
    const m = new RegExp("```" + lang + "\\n([\\s\\S]*?)\\n```").exec(md.slice(start));
    expect(m, `a ${lang} example in ${heading}`).not.toBeNull();
    return m![1];
  };
  it("key.yaml passes checkKeyYaml", () => expect(checkKeyYaml("key.md", section("key.yaml", "yaml"))).toEqual([]));
  it("the charter passes checkCharter", () => expect(checkCharter("key.md", section("Charter", "markdown"))).toEqual([]));
  it("the skill passes checkSkill", () => expect(checkSkill("key.md", section("Skill", "markdown"))).toEqual([]));
  it("the workflow passes checkWorkflow", () => expect(checkWorkflow("key.md", section("Workflow", "markdown"))).toEqual([]));
  it("the app definition passes checkDefinition", () => expect(checkDefinition("key.md", section("App definition", "yaml"), ["booking-reminders"])).toEqual([]));
  it("the context block has exactly the context block fields", () => {
    const block = parse(section("The context block", "yaml")) as Record<string, unknown>;
    expect(Object.keys(block).sort()).toEqual(Object.keys(contextBlockFromProfile(emptyProfile, "", "")).sort());
    expect(Object.keys(block.owner as object).sort()).toEqual(["first", "name", "role"]);
  });
});
