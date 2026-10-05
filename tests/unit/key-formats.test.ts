import { describe, it, expect } from "vitest";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  checkKeyFolder, checkKeyYaml, checkCharter, checkSkill, checkRoutine, checkDefinition, checkLogText, parseFrontMatter, checkInstalled, checkRunBrief, codePathOk,
} from "@/lib/key/formats";
import { parse } from "yaml";
import { checkCardKinds, checkChecks, checkDraftBlock, checkForms } from "@/lib/key/declarations";
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
const routine = `---
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
  - { routine: nightly-follow-up }
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
routines: [{ slug: nightly-follow-up, path: routines/nightly-follow-up.md, category: keep }]
`;

function keyRoot(over: Record<string, string | null> = {}): string {
  const root = mkdtempSync(path.join(tmpdir(), "keyroot-"));
  const files: Record<string, string> = {
    "key/key.yaml": keyYaml,
    "key/agents/care/charter.md": charter,
    "key/skills/send-quote/SKILL.md": skill,
    "key/routines/nightly-follow-up.md": routine,
    "key/apps/clients/definition.yaml": definition,
    "key/apps/clients/migrations/0001_clients_create.sql":
      "create table clients (id uuid primary key, created_at timestamptz, updated_at timestamptz, stage text, notes text);\nalter table clients enable row level security;",
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
    expect(checkRoutine("w.md", routine)).toEqual([]);
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

describe("a skill's agent", () => {
  it("passes when it names a role in the roster", () => {
    expect(checkKeyYaml("key.yaml", keyYaml.replace("path: skills/send-quote/SKILL.md }", "path: skills/send-quote/SKILL.md, agent: care }"))).toEqual([]);
  });
  it("fails when the roster has no such role, as between installing a skill and the routine that adds its role", () => {
    const dangling = keyYaml.replace("path: skills/send-quote/SKILL.md }", "path: skills/send-quote/SKILL.md, agent: chief-of-staff }");
    expect(checkKeyYaml("key.yaml", dangling)).toEqual(['key.yaml: skills[0].agent "chief-of-staff" is not in the roster']);
    const empty = dangling.replace(/roster:\n  - \{[^\n]*\}\n/, "roster: []\n");
    expect(checkKeyYaml("key.yaml", empty)).toEqual(['key.yaml: skills[0].agent "chief-of-staff" is not in the roster']);
  });
});

describe("provenance.base", () => {
  const withBase = (base: string) => `${keyYaml}provenance:\n  stated_by: ""\n  recorded: ""\n  guide: foundation\n  base: "${base}"\n`;
  it("accepts a full 40 character commit id, and a Key with no base", () => {
    expect(checkKeyYaml("key.yaml", withBase("0123456789abcdef0123456789abcdef01234567"))).toEqual([]);
    expect(checkKeyYaml("key.yaml", keyYaml)).toEqual([]);
  });
  it("rejects a short or malformed base", () => {
    for (const b of ["0123abc", "", "0123456789ABCDEF0123456789ABCDEF01234567", "g123456789abcdef0123456789abcdef01234567"]) {
      expect(checkKeyYaml("key.yaml", withBase(b)), b).toContain("key.yaml: provenance.base must be a full 40 character commit id");
    }
  });
});

describe("bad fixtures fail with the file name and the rule", () => {
  const cases: [string, (n: string, t: string) => string[], RegExp][] = [
    ["charter-out-of-order.md", checkCharter, /order/],
    ["charter-missing-memory.md", checkCharter, /missing Memory/],
    ["charter-bad-memory-type.md", checkCharter, /Memory entry/],
    ["skill-missing-description.md", checkSkill, /description/],
    ["skill-missing-check.md", checkSkill, /missing section Check/],
    ["routine-bad-trigger.md", checkRoutine, /trigger/],
    ["routine-missing-when-blocked.md", checkRoutine, /When blocked/],
    ["definition-bad-field-type.yaml", (n, t) => checkDefinition(n, t, []), /type "json"/],
    ["definition-missing-routine.yaml", (n, t) => checkDefinition(n, t, ["other"]), /does not exist/],
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
  const base = (patch: string) => keyYaml.replace(/^(roster|skills|apps|routines):.*(\n  .*)*$/gm, (m) => (patch.startsWith(m.split(":")[0] + ":") ? patch : m));
  it("passes the complete example", () => expect(checkKeyYaml("key.yaml", keyYaml)).toEqual([]));
  it("needs a path on every skill", () => {
    expect(checkKeyYaml("key.yaml", base("skills: [{ slug: send-quote }]")).join("\n")).toMatch(/skills\[0\]\.path/);
  });
  it("needs a path on every routine", () => {
    expect(checkKeyYaml("key.yaml", base("routines: [{ slug: nightly-follow-up, category: keep }]")).join("\n")).toMatch(/routines\[0\]\.path/);
  });
  it("needs a definition on every app", () => {
    expect(checkKeyYaml("key.yaml", base("apps: [{ slug: clients, category: keep }]")).join("\n")).toMatch(/apps\[0\]\.definition/);
  });
  it("needs a persona on every roster entry", () => {
    expect(checkKeyYaml("key.yaml", base("roster:\n  - { role: care, charter: agents/care/charter.md }")).join("\n")).toMatch(/roster\[0\]\.persona/);
  });
});

describe("the old workflows name", () => {
  it("names the old workflows key plainly", () => {
    const text = "key: 1\nclient: a\nname: A\nstage: seed\nhome: repo\nroster: []\nskills: []\napps: []\nworkflows: []\nruns: []\n";
    expect(checkKeyYaml("key/key.yaml", text)).toContain(
      "key/key.yaml: workflows is now routines: rename the list to routines and the folder key/workflows/ to key/routines/");
  });

  it("checks routines entries like workflows were checked", () => {
    const text = "key: 1\nclient: a\nname: A\nstage: seed\nhome: repo\nroster: []\nskills: []\napps: []\nroutines:\n  - {slug: Bad Slug, category: command, path: routines/x.md}\nruns: []\n";
    expect(checkKeyYaml("key/key.yaml", text).join("\n")).toMatch(/routines\[0\]\.slug/);
  });

  it("names the old key/workflows folder without crashing", async () => {
    const p = (await checkKeyFolder(keyRoot({ "key/workflows/old.md": "x" }))).join("\n");
    expect(p).toContain("workflows is now routines");
  });
});

describe("checkRoutine every", () => {
  const wf = (every: string) => routine.replace("every: 1 day", `every: ${every}`);
  it.each(["1 day", "30 minutes", "2 weeks", "10 seconds", "1 hour"])("accepts %s", (v) => expect(checkRoutine("w.md", wf(v))).toEqual([]));
  it.each(["1d", "daily", "every day", "1 fortnight", "day"])("rejects %s", (v) => {
    expect(checkRoutine("w.md", wf(v)).join("\n")).toMatch(/every must be a number and a unit/);
  });
});

describe("checkRoutine cron", () => {
  const cr = (c: string) => routine.replace("trigger: every", "trigger: cron").replace("every: 1 day", `cron: "${c}"`);
  it.each(["0 7 * * 2", "*/15 9-17 * * 1-5", "0 9,17 1 1 0", "0-30/10 * * * 7"])("accepts %s", (v) => expect(checkRoutine("w.md", cr(v))).toEqual([]));
  it.each(["0 25 * * 2", "0 7 * *", "every tuesday", "0 7 * * 8", "60 * * * *", "* * 0 * *", "* * * 13 *", "*/0 * * * *", "5-1 * * * *"])("rejects %s", (v) => {
    expect(checkRoutine("w.md", cr(v)).join("\n")).toContain("w.md: cron must be five fields: minute hour day month weekday, such as 0 7 * * 2");
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
  it("refuses an entity named like a core table", () => {
    for (const t of ["contacts", "inbox_items", "outbox", "accounts"]) {
      expect(checkDefinition("d.yaml", definition.replace("key: clients", `key: ${t}`), ["nightly-follow-up"]).join(), t).toMatch(/is a core table name/);
    }
  });
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
  it("fails a skill, routine and definition path that is not on disk", async () => {
    const p = (await checkKeyFolder(keyRoot({ "key/skills/send-quote/SKILL.md": null, "key/routines/nightly-follow-up.md": null }))).join("\n");
    expect(p).toMatch(/skills\/send-quote\/SKILL\.md: named in key\.yaml but missing/);
    expect(p).toMatch(/routines\/nightly-follow-up\.md: named in key\.yaml but missing/);
    const d = (await checkKeyFolder(keyRoot({ "key/apps/clients/definition.yaml": null, "key/apps/clients/migrations/0001_clients_create.sql": null }))).join("\n");
    expect(d).toMatch(/apps\/clients\/definition\.yaml: named in key\.yaml but missing/);
  });
  it("fails an app folder that key.yaml does not list", async () => {
    const other = definition.replace("app: clients", "app: extra");
    const p = (await checkKeyFolder(keyRoot({ "key/apps/extra/definition.yaml": other, "key/apps/extra/migrations/0001_extra_create.sql": "create table clients (id uuid primary key, created_at timestamptz, updated_at timestamptz, stage text, notes text);\nalter table clients enable row level security;" }))).join("\n");
    expect(p).toMatch(/apps\/extra: app folder is not listed in key\.yaml/);
  });
  it("fails when the folder name and the definition app differ", async () => {
    const p = (await checkKeyFolder(keyRoot({ "key/apps/clients/definition.yaml": definition.replace("app: clients", "app: other-name") }))).join("\n");
    expect(p).toMatch(/app folder "clients" must match the definition app "other-name"/);
  });
  it("fails a record_change routine whose entity no app defines", async () => {
    const wf = routine.replace("trigger: every\nevery: 1 day", "trigger: record_change\nentity: invoices\nevents: [insert]");
    const p = (await checkKeyFolder(keyRoot({ "key/routines/nightly-follow-up.md": wf }))).join("\n");
    expect(p).toMatch(/entity "invoices" is not defined by any app/);
  });
  it("accepts a record_change routine whose entity an app defines", async () => {
    const wf = routine.replace("trigger: every\nevery: 1 day", "trigger: record_change\nentity: clients\nevents: [insert]");
    expect(await checkKeyFolder(keyRoot({ "key/routines/nightly-follow-up.md": wf }))).toEqual([]);
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

describe("the installed block", () => {
  const base = "key: 1\nclient: a\nname: A\nstage: seed\nhome: repo\nroster: []\nskills: []\napps: []\nroutines: []\nruns: []\n";
  it("validates the installed block", () => {
    const good = base + "installed:\n  - {entry: routines/monday-brief, from: dictionary@0.1.0, tier: essentials, files: [routines/monday-brief.md], installed: 2026-10-06}\n";
    expect(checkKeyYaml("key/key.yaml", good)).toEqual([]);
    expect(checkInstalled("k", { installed: "x" }).join()).toMatch(/must be a list/);
    const bad = base + "installed:\n  - {entry: Routines/x, from: v1, tier: max, files: [], installed: soon}\n";
    const p = checkKeyYaml("key/key.yaml", bad).join("\n");
    for (const k of ["entry", "from", "tier", "files", "installed"]) expect(p).toMatch(new RegExp(`installed\\[0\\]\\.${k}`));
  });
  it("reports a file named in installed but missing", async () => {
    const withInstalled = keyYaml + "installed:\n  - {entry: routines/nightly-follow-up, from: dictionary@0.1.0, tier: complete, files: [routines/nightly-follow-up.md, routines/gone.md], installed: 2026-10-06}\n";
    const problems = await checkKeyFolder(keyRoot({ "key/key.yaml": withInstalled }));
    expect(problems).toEqual(["key/routines/gone.md: named in installed but missing"]);
  });
  it("checks run briefs in the folder", async () => {
    const problems = await checkKeyFolder(keyRoot({ "key/runs/brief.md": "---\nverb: install\n---\n" }));
    expect(problems.join("\n")).toMatch(/runs\/brief\.md: file name/);
  });
});

describe("guards", () => {
  const ok = { entry: "routines/x", from: "dictionary@0.1.0", tier: "complete", files: ["routines/x.md"], installed: "2026-10-06" };
  const run = (over: object) => checkInstalled("k", { installed: [{ ...ok, ...over }] }).join("\n");
  it("rejects installed as a mapping", () => expect(checkInstalled("k", { installed: { a: 1 } }).join()).toMatch(/must be a list/));
  it("rejects files as a string", () => expect(run({ files: "routines/x.md" })).toMatch(/files/));
  it("rejects files that leave key/", () => {
    expect(run({ files: ["../x"] })).toMatch(/files/);
    expect(run({ files: ["/etc/x"] })).toMatch(/files/);
  });
  it("accepts an entry version that is a positive whole number, and rejects anything else", () => {
    expect(run({ version: 1 })).toBe("");
    expect(run({ version: 12 })).toBe("");
    for (const v of [0, -1, 1.5, "1", "1.0.0", null, true, [1]]) expect(run({ version: v }), String(v)).toMatch(/installed\[0\]\.version must be a positive whole number/);
  });
  it("rejects files written with a backslash", () => {
    expect(run({ files: ["routines\\x.md"] })).toMatch(/installed\[0\]\.files/);
    expect(run({ files: ["routines/x.md"] })).toBe("");
  });
  it("accepts a Date object and rejects an impossible date", () => {
    expect(run({ installed: new Date("2026-10-06T00:00:00Z") })).toBe("");
    expect(run({ installed: "2026-13-45" })).toMatch(/installed\[0\]\.installed/);
  });
  it("tells missing from invalid front matter", () => {
    expect(checkRunBrief("key/runs/2026-10-06-install-routines-x.md", "# no front matter").join()).toMatch(/needs front matter/);
    expect(checkRunBrief("key/runs/2026-10-06-install-routines-x.md", "---\nverb: [oops\n---\n").join()).toMatch(/not valid YAML/);
  });
  it("reports each missing path once", async () => {
    const e = (n: string) => `  - {entry: routines/nightly-follow-up, from: dictionary@0.1.0, tier: complete, files: [routines/gone.md, ${n}], installed: 2026-10-06}\n`;
    const text = keyYaml.replace("path: routines/nightly-follow-up.md", "path: routines/gone.md") + "installed:\n" + e("routines/gone.md") + e("routines/gone.md");
    const problems = (await checkKeyFolder(keyRoot({ "key/key.yaml": text }))).filter((x) => /gone/.test(x));
    expect(problems).toHaveLength(1);
  });
});

describe("installed code", () => {
  const ok = { entry: "modules/sell/leads", from: "dictionary@0.1.0", tier: "complete", files: ["routines/x.md"], installed: "2026-10-06" };
  const run = (over: object) => checkInstalled("k", { installed: [{ ...ok, ...over }] }).join("\n");
  it("accepts a row with code and a row without", () => {
    expect(run({ code: ["src/app/leads/page.tsx", "modules/sell/leads.ts"] })).toBe("");
    expect(run({})).toBe("");
  });
  it("rejects code that is not a list of strings", () => {
    expect(run({ code: "src/x.ts" })).toMatch(/installed\[0\]\.code/);
    expect(run({ code: [3] })).toMatch(/installed\[0\]\.code/);
  });
  it("rejects paths that leave src/ and modules/", () => {
    for (const c of ["../x", "src/../x.ts", "/etc/x", "\\x", "lib/x.ts"]) expect(run({ code: [c] })).toMatch(/installed\[0\]\.code/);
  });
  it("rejects an empty segment, a . segment and a trailing slash in a code path", () => {
    for (const c of ["src//x.ts", "src/./x.ts", "./src/x.ts", "src/x/", "modules/", "src/x\\y.ts"]) {
      expect(codePathOk(c), c).toBe(false);
      expect(run({ code: [c] }), c).toMatch(/installed\[0\]\.code/);
    }
    expect(codePathOk("src/app/leads/page.tsx")).toBe(true);
  });
  it("reports a missing code file once even when listed twice", async () => {
    const row = (c: string) => `  - {entry: routines/nightly-follow-up, from: dictionary@0.1.0, tier: complete, files: [routines/nightly-follow-up.md], code: [${c}], installed: 2026-10-06}\n`;
    const text = keyYaml + "installed:\n" + row("src/gone.ts, src/gone.ts") + row("src/gone.ts");
    const problems = await checkKeyFolder(keyRoot({ "key/key.yaml": text, "src/here.ts": "x" }));
    expect(problems).toEqual(["src/gone.ts: named in installed code but missing"]);
  });
});

describe("a run brief", () => {
  it("accepts a module entry, every slash becoming a hyphen", () => {
    const md = "---\nverb: install\nentry: modules/sell/leads\ntier: complete\nstage: 3\nconsents: {write: true}\nstarted: 2026-10-06\nupdated: 2026-10-06\n---\n";
    expect(checkRunBrief("key/runs/2026-10-06-install-modules-sell-leads.md", md)).toEqual([]);
    expect(checkRunBrief("key/runs/2026-10-06-install-modules-sell-leads.md", md.replace("started: 2026-10-06", "started: 2026-13-45")).join()).toMatch(/started/);
  });
  it("validates a run brief", () => {
    const md = "---\nverb: install\nentry: routines/monday-brief\ntier: essentials\nstage: 5\nconsents: {write: true, preview: false, messages: false}\nstarted: 2026-10-06\nupdated: 2026-10-06\n---\n# Brief\n";
    expect(checkRunBrief("key/runs/2026-10-06-install-routines-monday-brief.md", md)).toEqual([]);
    expect(checkRunBrief("key/runs/brief.md", md).join("\n")).toMatch(/file name/);
    expect(checkRunBrief("key/runs/2026-10-06-fly-routines-x.md", md.replace("verb: install", "verb: fly")).join("\n")).toMatch(/verb/);
    expect(checkRunBrief("key/runs/2026-10-06-install-routines-monday-brief.md", md.replace("stage: 5", "stage: 11")).join("\n")).toMatch(/stage/);
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
  it("the run brief passes checkRunBrief", () => expect(checkRunBrief("key/runs/2026-10-06-install-routines-booking-reminders.md", section("Run briefs", "markdown"))).toEqual([]));
  it("the charter passes checkCharter", () => expect(checkCharter("key.md", section("Charter", "markdown"))).toEqual([]));
  it("the skill passes checkSkill", () => expect(checkSkill("key.md", section("Skill", "markdown"))).toEqual([]));
  it("the routine passes checkRoutine", () => expect(checkRoutine("key.md", section("Routine", "markdown"))).toEqual([]));
  it("the app definition passes checkDefinition", () => expect(checkDefinition("key.md", section("App definition", "yaml"), ["booking-reminders"])).toEqual([]));
  it("the card kinds example passes checkCardKinds", () => {
    const decl = parse(section("Card kinds", "yaml")) as { card_kinds: unknown };
    expect(checkCardKinds({ file: "key.md", category: "deliver", slug: "bookings" }, decl.card_kinds).problems).toEqual([]);
  });
  it("the public forms example passes checkForms", () => {
    const decl = parse(section("Public forms", "yaml")) as { forms: unknown };
    expect(checkForms({ file: "key.md", slug: "bookings" }, decl.forms, new Set(["booking-request"])).problems).toEqual([]);
  });
  it("the checks example passes checkChecks", () => {
    const decl = parse(section("Checks", "yaml")) as { checks: unknown };
    const src = { file: "key.md", slug: "bookings", type: "app" as const, app: "bookings", uses: [] as string[] };
    expect(checkChecks(src, decl.checks, { kindNames: new Set(["requests-waiting"]), tablesByApp: { bookings: ["bookings"] } }).problems).toEqual([]);
  });
  it("the drafting example passes checkDraftBlock", () => {
    const fm = parseFrontMatter(section("Drafting commands", "markdown"));
    expect(checkDraftBlock({ file: "key.md", slug: "review-ask" }, fm?.data.draft, () => true).problems).toEqual([]);
  });
  it("the context block has exactly the context block fields", () => {
    const block = parse(section("The context block", "yaml")) as Record<string, unknown>;
    expect(Object.keys(block).sort()).toEqual(Object.keys(contextBlockFromProfile(emptyProfile, "", "")).sort());
    expect(Object.keys(block.owner as object).sort()).toEqual(["first", "name", "role"]);
  });
});
