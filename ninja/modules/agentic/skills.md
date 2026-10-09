---
id: modules/agentic/skills
kind: module
title: Your skills
lead: system-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, experience-designer, copywriter, builder, code-reviewer, qa-lead, scribe]
specialists: []
level: 1
version: 1
---

# Your skills

Section: Agentic.

**The job it takes off your plate:** knowing what your agents know how to do. Every skill in your Foundation, the procedures your agents follow the same way every time, shows on one page, read from the files themselves, with the agent that owns each one and every place it is used. A command lists the same skills from Claude.

**What you still decide:** which skills your business keeps, what each one says, and which agent owns it. The page shows the skills as they are on disk. It writes, moves and removes nothing on its own.

You start it from the Your skills page in the Skills group of Agentic, with its one line copied or opened in Claude. The line opens with your chief of staff's name, the one you chose at Setup, or "Claude" until you choose one.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one is the page your skills live on. A skill is a job written down the way your best person would explain it, in four parts: Input (what it reads), Steps (how the job is done), Output (what it hands back) and Check (how it knows the work is right). [Write the brief](../../skills/write-the-brief.md) is the shape every skill takes.

The page reads two folders in your Foundation on every load and shows what it finds:

- **Your skills.** Every skill in `key/skills/<slug>/SKILL.md`, the ones your business owns. Each shows its name, its one line of purpose, the agent that owns it, and where it is used: the routines whose steps run it, the charters that list it under `## Skills`, and the entry it was installed from.
- **Ready to add.** The skill entries the dictionary in your `ninja/` folder holds that your Key does not have yet, each with the one line that installs it.

Below them sit the four skills the Skills group of Agentic builds into your Foundation, each with its own page: [Voice and writing](voice-and-writing.md), [Research](research.md), [Numbers](numbers.md) and [Tools](tools.md). Each shows here as installed, with its page, or as ready to add.

Two doors reach the same skills: the page reads the files on every load, and `npm run skills` prints the same list. Change a skill through Claude, and the page shows it at the next load.

**How it runs today.** The page reads the files where it runs. Your deployed command center already carries `key/` and `ninja/` with every build, so a skill changed on your computer shows live once it is deployed.

**What you do by hand.** Answer three questions. Decide each new skill, through its own install or through [Specialists](specialists.md).

## The bar

The world-class version is the operations manual a well run company keeps for every repeatable job: one page per procedure, an owner for each, and a clear line from each procedure to the work that uses it. Its test is trust. When the owner asks "how does my business write a reply to a review?", the page answers with the skill, the agent that follows it, and the routine that runs it, and the answer is the file Claude will actually use. Every skill on the page exists on disk, and every skill on disk is on the page. A skill that is broken, unowned or unused shows as such, with the line that repairs it, and never as a healthy card. The page loads on a phone in one screen for a business with ten skills, and stays readable at a hundred.

## Depth tiers

**Essentials.** The Your skills page lists every skill on disk in its groups, each with its owner and where it is used, and `npm run skills` lists the same.

Adds: one code file that reads the skills, one command, the list on the page, and their tests. No table and no Key file.

**Complete.** Adds each skill's detail one tap away: its four sections as written, its `installed` row, and whether the dictionary holds a newer version of the entry it came from, with the upgrade line.

Adds: the detail view on the page and `npm run skills -- show <slug>`. No new table.

**Mastery.** Adds the skill check. It names anything out of place: a routine that runs a skill that is not on disk, a skill whose agent is not on the roster, a skill no routine runs and no charter lists, and a skill whose Check says nothing it can test. The page shows each with the line that repairs it.

Adds: `npm run skills -- check`, and the check inside `npm test`. No new table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads `key/key.yaml`, both folders and every routine, and reflects back in two or three sentences what it found, such as "Your Key has one skill, write-the-brief, which Avery owns and the Monday brief runs every week. The dictionary has one more skill ready to add."

1. **First on the page.** "When you open Your skills, what do you want to see first: the skills your business has, or the ones ready to add?" The default is the skills your business has. It sets which group sits first.
2. **A home for a skill with no owner.** "When a skill has no agent, which of your agents should own it? I suggest your chief of staff." The default is the chief of staff, or the first role on the roster. A skill with no owner shows with a repair line naming that agent. The page never writes it: the owner's yes on the repair line does, through Claude, as a change to the skill's row in `key/key.yaml`.
3. **Your tools.** "Do you keep written procedures somewhere else, such as checklists in a doc, a folder of saved prompts, or Claude Projects?" The default is none. Each one you name is listed in your receipt as a skill to bring in, through [Specialists](specialists.md) or one of the skill entries. Nothing is read without your yes.

Everything from here on is the build plan your assistant follows.

## Parts

Not part of this entry. The page reads whatever skills are on disk, so it installs with none. When the roster has no chief of staff, question 2 offers the first role on the roster, and with no roster at all the repair line says to install [Chief of staff](../../agents/chief-of-staff.md) first.

## Crew

The system lead directs this entry when the owner has the Master Agent Library, the paid set of section leads and specialists, and sends back any card that keeps a copy of a fact.

- **Run lead:** the stages, the plan and the gates, and every commit.
- **Business analyst:** the read, the three questions, and the receipt's list of procedures to bring in.
- **Experience designer:** the list, the detail view and every state, on a phone and on a laptop.
- **Copywriter:** every label, empty state and repair line, in plain words.
- **Builder:** `src/lib/skills/skills.ts`, the command, the page change and their tests, written test first.
- **Code reviewer:** that both folders are read fresh on every use, nothing is copied into the database, and both doors call the same function.
- **QA lead:** the proof, on the owner's own skills.
- **Scribe:** the origin in `installed`, the run brief and the build log entries.

## Data

No app and no table. Your skills are files, and this entry reads them.

**Source of truth.** Each fact on the page lives in one place, and the page keeps no copy:

- **Which skills your business has:** the folders in `key/skills/`, each with its `SKILL.md`, and the `skills` list in `key/key.yaml`, one row per skill with its `slug`, `path` and `agent`.
- **What each skill does:** the skill's own file: its front matter `name` and `description`, then Input, Steps, Output and Check.
- **Who owns it:** the `agent` on its row in `key/key.yaml`.
- **Which routines run it:** each routine file in `key/routines/` whose Steps name it as "the <slug> skill", the way the Monday brief's step 2 names "the write-the-brief skill".
- **Which charters list it:** each charter in `key/agents/` with the slug under `## Skills`.
- **Where it came from:** the `installed` row in `key/key.yaml` whose `files` name it.
- **Which services it uses:** once [Tools](tools.md) is installed, the `connections` list in the skill's front matter.
- **What is ready to add:** the entries in `ninja/skills/`, the dictionary's own copy, which only a dictionary update changes.

What the entry builds at Essentials:

- **Code:** `src/lib/skills/skills.ts`, with `readSkills(root)`, which reads both folders, `key/key.yaml`, every routine and every charter, and returns the groups, each skill's slug, name, purpose, owner, uses and any problem found. Both doors call it.
- **The command:** `src/lib/skills/skills-command.ts`, run as `npm run skills`, with its `preskills` line generating the build secret first, as every command does. The four skill entries each add their own word to this one command, such as `npm run skills -- numbers`, so the Foundation has one command for its skills.
- **The page:** `src/app/admin/(console)/agentic/[page]/SkillsList.tsx`, passed as the page's `above` when the page is `skills`, the way Your team passes its chief of staff card.
- **Tests:** `tests/unit/skills.test.ts`, which builds a fixture Foundation with a roster, two skills, one routine that runs one of them, one charter that lists the other, and one dictionary skill, and checks every group and every use, and `tests/e2e/skills.spec.ts`, which signs in through the PIN gate and finds both groups, at phone width and at desktop width.
- **Shared edits named in the plan:** `package.json` gains `"preskills": "node scripts/gen-build-secret.mjs"` and `"skills": "tsx --conditions=react-server src/lib/skills/skills-command.ts"`, the way the Monday brief's command runs. The page's `skills` row in `src/lib/layout/sections.ts` stays `ready`, and the page keeps its Open in line below the list. `next.config.ts` needs no change: its tracing already includes `./key/**/*` and `./ninja/**/*`.

One skill, as `readSkills` returns it, for Harbor Studio, the sample business whose context block is in [the Ninja home](../../foundation/ninja-home.md):

```json
{"group": "yours", "slug": "write-the-brief", "name": "Write the brief", "purpose": "Turn the week's numbers into a one-screen brief the owner reads in under a minute.", "agent": "chief-of-staff", "agentName": "Avery", "routines": ["monday-brief"], "charters": ["chief-of-staff"], "from": "skills/write-the-brief", "connections": [], "problems": []}
```

- `purpose` is the skill's front matter `description`.
- `agentName` is the roster row's `persona` for the agent, and for the chief of staff `chief_name` from `key/knowledge/context-block.yaml`, the file the profile saves write, so the command never opens the database.
- `routines` and `charters` are the uses, read fresh each time.
- `problems` lists plain lines, such as "key.yaml names this skill, and its file is missing."

## Screens and panels

**Your skills** (`/admin/agentic/skills`), the first page in the Skills group of Agentic, keeps its title and its Open in line, and adds the skills above it, with every state:

- **Your skills.** One card per skill, in the order of `key/key.yaml`. Each shows the name, the one line of purpose, the owner by name, and its uses in plain words, such as "Runs every Monday in the Monday brief. Listed in Avery's charter." With no skills yet: "Your agents have no written skills yet. A skill is a job written down so it is done the same way every time.", with the install line for the first skill entry that fits.
- **Not used yet.** A skill no routine runs and no charter lists shows with a quiet "Not used yet" and the line that puts it to work, such as "Avery, add the research skill to your charter."
- **Ready to add.** Each dictionary skill not in your Key, with its install line, and each of the four skill pages of the Skills group, marked installed or ready to add.
- **A problem.** A skill whose file is missing, whose sections are out of order, whose agent is not on the roster, or that a routine names and the Key does not have, shows in place, marked plainly, with a Copy line that repairs it, such as "<Name>, repair the skill <slug>." The rest of the page renders as normal.

At Complete, tapping a card opens its detail: the four sections as written, its `installed` row, and, when the dictionary's entry carries a higher `version` than the row, "A newer version is in your dictionary" with the line "Upgrade <entry>." At Mastery, the check's problems sit at the top of the page, each with its repair line.

Every Open in line waits for your Enter, as [Work with Claude](../../frameworks/work-with-claude.md) teaches.

## Routines and Inbox cards

Not part of this entry.

## Connections

Not part of this entry. A skill that uses a service names it in its front matter once [Tools](tools.md) is installed, and this page shows the name.

## Autopilot

**What runs on its own.** The list keeps itself current. Every load of the page and every `npm run skills` reads the folders, the rows, the routines and the charters fresh, so a skill added, changed or put to use shows at once, with no list kept by hand. Every `npm test`, which every run makes before it commits, reads every skill through `checkSkill`, and at Mastery runs the skill check, so a routine that names a missing skill stops a commit.

**The trigger.** The page load and the command read the skills as they run. The test runs at every run's stage 8 checks in [the runner](../../runner/run.md), and whenever the owner runs `npm test`.

**The rung.** Runs and reports. The page and the command keep the list current with no one starting them, and report anything out of place in plain words, without fixing it.

**The next rung.** There is none above Runs and reports. What a deeper page adds is more skills, through [Voice and writing](voice-and-writing.md), [Research](research.md), [Numbers](numbers.md), [Tools](tools.md) and [Specialists](specialists.md), each with its own rung.

**What stays with the owner.** Which skills the business keeps, what each says, and who owns each, each through its own install, modify or remove.

## Proof

### Essentials

**Setup.** At least one skill is in the Key, such as write-the-brief from the Monday brief, and the command center is open on the owner's computer.

**The run, the way it will run.** The QA lead opens Your skills and checks each group against the folders: every folder in `key/skills/` has a card, every row in `key/key.yaml` names a folder that exists, and Ready to add shows each dictionary skill the Key does not have. Then, through Claude, it makes one real change to the owner's own skill: with the owner's yes, it adds one line to the skill's Check, such as "The brief never names a customer." It loads the page again and finds the card unchanged in name, and `npm run skills` still listing it with the same owner and uses. Then it runs `npm run skills`, which prints, for Harbor Studio:

```text
Your skills (1)
  Write the brief, owned by Avery: runs in monday-brief, listed in chief-of-staff
Ready to add (0)
Skills group: Voice and writing, Research, Numbers, Tools (ready to add)
```

**The completion test.** All of these pass:

1. Every folder in `key/skills/` has a card, every row names a file that exists, and the page shows nothing that is not on disk.
2. Each use shown matches the files: the routine names the skill in its Steps, and the charter lists it under `## Skills`.
3. A fixture routine that names a skill the Key does not have shows as a problem with its repair line, and the rest of the page still renders.
4. `npm test` passes, including `tests/unit/skills.test.ts`, and `npm run e2e` passes, including `tests/e2e/skills.spec.ts`.

### Complete

**The run.** The QA lead opens the detail of write-the-brief and checks its four sections match the file line for line, and its `installed` row is shown. In a fixture with the dictionary's entry one version ahead, the detail shows the newer version and its upgrade line. The completion test: the detail and `npm run skills -- show write-the-brief` print the same sections and the same row.

### Mastery

**The run.** The QA lead points a fixture routine at a skill that is not on disk and runs `npm run skills -- check`, which names the routine and the missing skill and exits with a failure. The completion test: the check passes on the owner's real skills, and `npm test` fails on the fixture and passes again once the fixture is removed.

## Complete when

**Fitted.** passes when the group the owner chose sits first, and a skill with no owner shows the agent the owner named in its repair line.

**Autopiloted.** passes when the page and the command read the skills fresh on every use, with no list kept by hand, and a broken skill stops `npm test` before any commit.

**Visible.** passes when Your skills shows the owner's skills, Not used yet, Ready to add, the Skills group and any problem, each with its empty state, on a phone and on a laptop.

**Connected.** passes when each card links to what acts on it: the owner's card on [Your team](agents.md), the install line for a ready skill, the repair line for a problem, and the page of each skill entry in the Skills group.

**Recorded.** passes when the entry's `installed` row names its tier, version and `code`, the build log has the run's entries, and `key/knowledge/system.md` lists the skills under their roles through `npm run key:sync`.

**Tested.** passes when the tests in `tests/unit/skills.test.ts` and `tests/e2e/skills.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when a real change to the owner's own skill, made through Claude, showed through both doors.

**Coherent.** passes when both doors meet the same skills: a skill changed through Claude shows on the page at the next load, and the uses `npm run skills` prints are the uses the page shows.

**Reversible.** passes when remove takes out the list, the command and their tests, the page returns to its Open in line alone, every skill and every row stay as they are, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the page shows and where it comes from, such as "Your skills shows every procedure my agents follow, read from their files, with who owns each one and where it runs."

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| Which group comes first | `src/app/admin/(console)/agentic/[page]/SkillsList.tsx` | The order of the groups, from question 1. |
| A skill's owner | `key/key.yaml` | The skill row's `agent`, which must name a role on the roster. |
| A skill's purpose line | `key/skills/<slug>/SKILL.md` | The front matter `description`. The page shows it at the next load. |
| Where a skill is used | The routine or charter that uses it | A routine's step names "the <slug> skill", or a charter lists the slug under `## Skills`. |

Adding or removing a skill is that skill's own install or remove, or a change through [Specialists](specialists.md), never an edit to this page.

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder, the skills command reads the same files the page does, with nothing to stop first, because it reads files and never opens the database:

- `npm run skills` lists your skills, what is ready to add and the Skills group, in the order the page shows them.
- `npm run skills -- show <slug>`, at Complete, prints one skill's four sections, its owner, its uses and its `installed` row, and says when the dictionary has a newer version.
- `npm run skills -- check`, at Mastery, prints each problem and exits with a failure when there is one, so a run can stop on it.

A skill is a file, so Claude edits it directly when the owner asks, such as "Add a step to the brief skill: list refunds on their own line", and `npm test` checks its shape. The page reads the file at the next load.

**What upgrade adds, tier by tier.** This entry has no part. Its run compares each file in its row's `code` three ways, the original from the commit that added the entry's newest install or upgrade brief, as [upgrade](../../runner/verbs/upgrade.md) describes.

- **To Complete:** `src/lib/skills/skills.ts` reads each skill's sections and its `installed` row and compares the row's `version` with the dictionary entry's, `skills-command.ts` gains `show`, and `SkillsList.tsx` gains the detail view, with their tests.
- **To Mastery:** `skills.ts` gains `checkSkills`, `skills-command.ts` gains `check`, the Key checker's test calls `checkSkills`, and `SkillsList.tsx` shows the check's problems first, with their tests.

**What remove exports first.** Nothing, because the page holds no records. Remove takes out `src/lib/skills/skills.ts`, `SkillsList.tsx`, their tests, and the page's list. When no installed skill entry adds a word to `src/lib/skills/skills-command.ts`, remove takes out that file and its two `package.json` lines too, and otherwise keeps them for the entries that use them. Every skill and every row in `key/key.yaml` stay.

## How it is done

**How `readSkills` reads.** It reads `key/key.yaml` for the `skills` list and the roster, lists the folders in `key/skills/`, and reads each `SKILL.md` through `parseFrontMatter`, taking the name and the purpose from the front matter and running `checkSkill` from `src/lib/key/formats.ts` for its shape. It reads each routine named in `key/key.yaml` and finds every skill its Steps name as "the <slug> skill", and each charter's `## Skills` list. It lists `ninja/skills/` and keeps each entry whose slug is not a folder in `key/skills/`. It never writes, and it never throws on a bad file: a file it cannot read becomes a problem line on that skill, so one broken skill never blanks the page.

**Why the page reads disk.** Claude works from these files. A copy in the database would be a second answer, and the day the two differed, the page would show a skill Claude does not follow.

**Why one command for every skill.** Each skill entry in the Skills group has something to print: the voice checks, the research notes, the numbers, the tools. One command, `npm run skills`, with one word per skill, means the owner learns one door. Each entry adds its word to `src/lib/skills/skills-command.ts`, and when this entry is not installed, the first skill entry adds that file and its two `package.json` lines, the same way [Department leads](department-leads.md) adds to the agents command.

**Skills and agents.** An agent is who does the work. A skill is how one job is done. A skill has exactly one owner, so a change to how a job is done is one file, and who does it is one row. Your agents live on [Your team](agents.md).

**The first run of this entry.** The plan, shown in plan mode, lists the code file, the command, the page change, the tests and the shared edits. After the owner's yes, tests come first and fail, then the code, the proof on the owner's real skills, and one work commit with its log entry, [the runner](../../runner/run.md)'s way.

## Next

- Give your agents a writing skill that sounds like you on every channel, on [Voice and writing](voice-and-writing.md): "Install Voice and writing."
- Let them read your market with every source kept, on [Research](research.md): "Install Research."
- Let them read your records and explain what changed, on [Numbers](numbers.md): "Install Numbers."
- Let them use the services you have connected, safely, on [Tools](tools.md): "Install Tools."
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so each skill's sections are one tap away: "Upgrade Your skills to Complete."
