---
id: modules/agentic/agents
kind: module
title: Your team
lead: command-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: [agents/chief-of-staff]
crew: [run-lead, business-analyst, experience-designer, copywriter, builder, code-reviewer, qa-lead, scribe]
specialists: []
level: 1
version: 1
---

# Your team

Section: Agentic.

**The job it takes off your plate:** keeping track of who works for your business. Every agent your Foundation has, the ones that run your business and the crew that builds it, shows on one page, read from the files themselves, with your chief of staff's name at the top and a command that lists the same team from Claude.

**What you still decide:** who joins the team, what each one is called, and what each one may never do without you. The page shows the team as it is on disk. It adds, renames and removes no one on its own.

You start it from the Your team page in the Agents group of Agentic, with its one line copied or opened in Claude. The line opens with your chief of staff's name, the one you chose at Setup, or "Claude" until you choose one.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one is the page your team lives on. It reads three folders in your Foundation on every load and shows what it finds:

- **Your team.** The agents that run your business, one charter each in `key/agents/`, named in the roster in `key/key.yaml`. Your [chief of staff](chief-of-staff.md) leads them, with a [lead for each department](department-leads.md) you run and the [specialists](specialists.md) those leads call in.
- **The build crew.** The roles that build your business with Claude Code, one file each in `.claude/agents/`, every name starting with `crew-`. The dictionary supplies them and replaces them on every dictionary update. Their own page is [Build crew](build-crew.md).
- **Ready to add.** The agent entries the dictionary in your `ninja/` folder holds that your roster does not have yet, each with the one line that installs it.

Above the list sits the chief of staff card, which already exists on the page: your chief of staff's name and a field to change it. The card and `npm run chief -- "Name"` save through `setChiefName`, Settings, Preferences saves through `saveProfile`, and all three check the name with `cleanChiefName`, so there is one name and three ways to set it.

Two doors reach the same team: the page reads the files on every load, and `npm run agents` prints the same list. Change a charter through Claude, and the page shows it at the next load.

**How it runs today.** The page reads the files where it runs, so a charter changed on your computer shows live once it is deployed.

**What you do by hand.** Answer four questions. Choose your chief of staff's name, or keep the one you have. Decide each new agent, through its own install.

## The bar

The world-class version is the org chart a sharp operations lead keeps for a company that runs on agents: every role, its name, its purpose and who it answers to, and nothing on it that is not real. Its test is trust. When the owner asks "who handles my bookkeeping?", the page answers in one glance, and the answer is the file Claude will actually use. Every agent on the page exists on disk, and every agent on disk is on the page. A broken charter shows as broken, with the line that repairs it, and never as a healthy card. The page loads on a phone in one screen for a team of five, and stays readable at fifty.

## Depth tiers

**Essentials.** The Your team page lists every agent on disk in its three groups, under the chief of staff card, and `npm run agents` lists the same.

Adds: one code file that reads the team, one command, the list on the page, and their tests. No table and no Key file.

**Complete.** Adds each agent's detail one tap away: its Role line, who it serves, the skills and routines in `key/key.yaml` that name it, when it joined, and the entry it came from.

Adds: the detail view on the page and `npm run agents -- show <name>`. No new table.

**Mastery.** Adds the team map and the team check. The map draws your chief of staff, the leads who report to it and the specialists each lead calls in, from the roster. The check names anything out of place, such as a skill whose agent is missing, and shows it on the page with the line that repairs it.

Adds: the map on the page, `npm run agents -- check`, and the check inside `npm test`. No new table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads your roster, the three folders and your profile, and reflects back in two or three sentences who is on the team today and what stands out, such as "Your roster has your chief of staff, Avery, and no department leads yet. The crew has 24 roles."

1. **First on the page.** "When you open Your team, what do you want to see first: the agents who run your business, or the crew that builds it?" The default is the agents who run it. It sets which group sits first under the chief of staff card.
2. **Your chief of staff.** "Your chief of staff is <the name every prompt opens with>. Is that the name you want on every prompt?" The default is the name you have, or Avery when it is still Claude. A new name is saved by the owner on the chief of staff card, or with `npm run chief`, and never written into a file by the run.
3. **Your departments.** "Which departments do you run today?" The default is every department with an entry installed. Each department you name shows on the page with its lead, or with an open seat and the line that installs its lead. The answer is used for this run's plan and receipt, and the page reads the roster from then on, so nothing stores the answer twice.
4. **Your tools.** "Do you already keep instructions for AI somewhere else, such as Claude Projects, custom GPTs or a folder of prompts?" The default is none. Each one you name is listed in your receipt as an agent to bring onto the team, through [Department leads](department-leads.md) or [Specialists](specialists.md). Nothing is read without your yes.

Everything from here on is the build plan your assistant follows.

## Parts

Installed in this order, before the entry. When a part is not installed yet, [install](../../runner/verbs/install.md) installs it first, as its own run, with its own `installed` row.

1. [Chief of staff](../../agents/chief-of-staff.md) (`agents/chief-of-staff`): the first role on every team, with its roster row and its charter. A team page with no chief of staff would open on an empty seat.

## Crew

The command lead directs this entry when the owner has the Master Agent Library, the paid set of section leads and specialists, and sends back any card that shows a copy of a fact.

- **Run lead:** the stages, the plan and the gates, and every commit.
- **Business analyst:** the read, the questions, and which departments have a lead.
- **Experience designer:** the list, detail and map, every state, phone and laptop.
- **Copywriter:** every label and empty state, in plain words.
- **Builder:** `src/lib/agents/team.ts`, the command, the page change and their tests, written test first.
- **Code reviewer:** that every group is read fresh from disk, nothing is copied into the database, and both doors call the same function.
- **QA lead:** the proof.
- **Scribe:** the origin in `installed`, the run brief and the log.

## Data

No app and no table. Your team is files, and this entry reads them.

**Source of truth.** Each fact on the page lives in one place, and the page keeps no copy:

- **Who is on your team:** the `roster` list in `key/key.yaml`, one row per role, and each role's charter at `key/agents/<role>/charter.md`.
- **Your chief of staff's name:** `chief_name` in your business profile, saved by the chief of staff card and `npm run chief` through `setChiefName`, and by Settings, Preferences through `saveProfile`, both in `src/lib/data/profile.ts` and both checked by `cleanChiefName`. On your own computer the same save writes it into `key/knowledge/context-block.yaml`.
- **Who does what:** the `skills` and `routines` lists in `key/key.yaml`, each with its `agent`.
- **The build crew, the add-on and your own build agents:** the files in `.claude/agents/`, one per role, sorted as How it is done says.
- **What is ready to add:** the agent entries in `ninja/agents/`, the dictionary's own copy, which only a dictionary update changes.

What the entry builds at Essentials:

- **Code:** `src/lib/agents/team.ts`, with `readTeam(root)`, which reads the three folders and the roster and returns the groups, each agent's name, role, file and one line of purpose, and any problem found. Both doors call it.
- **The command:** `src/lib/agents/agents-command.ts`, run as `npm run agents`, with its `preagents` line generating the build secret first, as every command does.
- **The page:** `src/app/admin/(console)/agentic/[page]/TeamList.tsx`, shown under the chief of staff card when the page is `agents`.
- **Tests:** `tests/unit/team.test.ts`, which builds a fixture Foundation with a roster, two charters, three crew files and one dictionary agent and checks every group, and `tests/e2e/team.spec.ts`, which signs in through the PIN gate and finds the chief of staff card and the three groups, at phone width and at desktop width.
- **Shared edits named in the plan:** `next.config.ts` adds `./.claude/agents/**/*` to `outputFileTracingIncludes`, so a deployed page reads the same crew files. `package.json` gains `"preagents": "node scripts/gen-build-secret.mjs"` and `"agents": "tsx --conditions=react-server src/lib/agents/agents-command.ts"`, the way the Monday brief's command runs.

One agent, as `readTeam` returns it, for Harbor Studio, the sample business whose context block is in [the Ninja home](../../foundation/ninja-home.md):

```json
{"group": "team", "role": "chief-of-staff", "name": "Avery", "file": "key/agents/chief-of-staff/charter.md", "purpose": "Keeps the owner's week in view.", "answersTo": "owner", "problems": []}
```

- `name` is the roster row's `persona`, and for the chief of staff the profile's name.
- `purpose` is the first sentence under the charter's `## Role`, or under a crew file's `## Role`.
- `answersTo` is the roster row's `reports_to` once [Department leads](department-leads.md) adds it, and `owner` until then.
- `problems` lists plain lines, such as "The roster names this role, and its charter is missing."

## Screens and panels

**Your team** (`/admin/agentic/agents`), the first page in the Agents group of Agentic, keeps its chief of staff card at the top and adds the team beneath it, with every state:

- **The chief of staff card.** As it is today: the name every prompt opens with, and the field to change it. Saving it here, in Settings, Preferences, or with `npm run chief` sets the same profile field.
- **Your team.** One card per role on the roster, chief of staff first, then department leads in department order, then specialists. Each card shows the name, the role in plain words and the one line of purpose. With only the chief of staff: "Your chief of staff works alone for now. Add a lead for the department that costs you the most hours.", with that department's install line to copy or open.
- **Open seats.** Each department named at question 3 with no lead shows as one quiet line with its install line.
- **The build crew.** One compact row per crew role, its name and its one line, with a link to [Build crew](build-crew.md) for the full page. Add-on roles show here too, marked as such, and every other agent file is marked as the owner's.
- **Ready to add.** Each dictionary agent not on the roster, with its install line.
- **A problem.** A role whose charter is missing or has lost a heading shows in place, marked plainly, with a Copy line that repairs it, such as "<Name>, repair the charter for <role>." The rest of the page renders as normal.

At Complete, tapping a card opens its detail: the Role and Who I serve lines, the skills and routines that name it, when it joined, and the entry in `installed` it came from. At Mastery, a switch above the list shows the team map: the chief of staff at the top, its leads beneath, and each lead's specialists beneath that, drawn from the roster.

Every Open in line waits for your Enter, as [Work with Claude](../../frameworks/work-with-claude.md) teaches.

## Routines and Inbox cards

Not part of this entry.

## Connections

Not part of this entry.

## Autopilot

**What runs on its own.** The team keeps itself current. Every load of the page and every `npm run agents` reads the folders and the roster fresh, so any change shows at once, with no list kept by hand. Every `npm test`, which every run makes before it commits, reads every charter, and at Mastery runs the team check, so a broken team stops a commit.

**The trigger.** The page load and the command read the team as they run. The test runs at every run's stage 8 checks in [the runner](../../runner/run.md), and whenever the owner runs `npm test`.

**The rung.** Runs and reports. The page and the command keep the team current with no one starting them, and report anything out of place in plain words, without fixing it.

**The next rung.** There is none above Runs and reports. What a deeper team adds is more of the team: [Department leads](department-leads.md) and [Specialists](specialists.md) bring agents that work on their own rungs.

**What stays with the owner.** Who joins the team and who leaves it, each through its own install or remove. The chief of staff's name. Anything a charter says the role may never do.

## Proof

### Essentials

**Setup.** The chief of staff is on the roster, and the command center is open on the owner's computer.

**The run, the way it will run.** The QA lead opens Your team and checks the three groups against the folders: every roster row has a card, the crew shows every `crew-` file, and Ready to add shows each dictionary agent not on the roster. Then, through Claude, it makes one real change to the owner's own team: with the owner's yes, it adds one Memory line to the chief of staff's charter, such as "preference: one screen, the thing that needs me first". It loads the page again and finds the chief of staff's card unchanged in name, and `npm run agents -- show chief-of-staff` printing the new line. Then it runs `npm run agents`, which prints, for Harbor Studio:

```text
Your team (1)
  Avery, chief of staff: Keeps the owner's week in view.
Build crew (24)
  Run lead: Owns the stages, the plan and the gates.
  ...
Ready to add (0)
```

**The completion test.** All of these pass:

1. Every roster row has a card, every `crew-` file has a row, and the page shows nothing that is not on disk.
2. The chief of staff card, `npm run chief` and Settings, Preferences show the same name, and a name changed in one shows in the other two at the next load.
3. A charter with its `## Role` heading removed, in a fixture, shows as a problem with its repair line, and the rest of the page still renders.
4. `npm test` passes, including `tests/unit/team.test.ts`, and `npm run e2e` passes, including `tests/e2e/team.spec.ts`.

### Complete

**The run.** The QA lead opens the chief of staff's detail and checks it names Write the brief and the Monday brief when they are installed, or says no skills yet. The completion test: every skill and routine in `key/key.yaml` shows under the agent it names, and `npm run agents -- show <role>` prints the same.

### Mastery

**The run.** With at least one lead on the roster, the map shows the chief of staff above it. The QA lead points a fixture skill at a role that is not on the roster and runs `npm run agents -- check`, which names the skill and the missing role and exits with a failure. The completion test: the map matches every `reports_to`, the check passes on the owner's real team, and `npm test` fails on the fixture and passes again once the fixture is removed.

## Complete when

**Fitted.** passes when the group the owner chose sits first, the chief of staff's name is the one they confirmed, and the open seats are the departments they named.

**Autopiloted.** passes when the page and the command read the team fresh on every use, with no list kept by hand, and a broken charter stops `npm test` before any commit.

**Visible.** passes when Your team shows the chief of staff card, the team, the crew, Ready to add and any problem, each with its empty state, on a phone and on a laptop.

**Connected.** passes when each card links to what acts on it: the install line for an open seat or a ready agent, the repair line for a problem, and the Build crew page for the crew.

**Recorded.** passes when the entry's `installed` row names its tier, version and `code`, the build log has the run's entries, and `key/knowledge/system.md` lists the team through `npm run key:sync`.

**Tested.** passes when the tests in `tests/unit/team.test.ts` and `tests/e2e/team.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when a real change to the owner's own charter, made through Claude, showed through both doors.

**Coherent.** passes when both doors meet the same team: a charter changed through Claude shows on the page at the next load, and a name saved on the chief of staff card is the name `npm run chief` prints and the next prompt opens with.

**Reversible.** passes when remove takes out the list, the command and their tests, the page returns to its chief of staff card alone, every charter and the roster stay as they are, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the page shows and where it comes from, such as "Your team shows every agent in my Foundation, read from their files, and I add or rename them through Claude or the card at the top."

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| Which group comes first | `src/app/admin/(console)/agentic/[page]/TeamList.tsx` | The order of the two groups, from question 1. |
| The chief of staff's name | The chief of staff card, Settings, Preferences, or `npm run chief` | The profile's `chief_name`, through its one save. |
| An agent's purpose line | `key/agents/<role>/charter.md` | The first sentence under `## Role`. The page shows it at the next load. |
| The open seats shown | Nothing to change | The page reads the roster: install a lead and its seat fills. |

Adding or removing an agent is that agent's own install or remove, never an edit to this page.

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder, the agents command reads the same files the page does, with nothing to stop first, because it reads files and never opens the database:

- `npm run agents` lists your team, the build crew and what is ready to add, in the order the page shows them.
- `npm run agents -- show <name or role>` prints one agent's file, its purpose, who it answers to, and at Complete the skills and routines that name it.
- `npm run agents -- check`, at Mastery, prints each problem and exits with a failure when there is one, so a run can stop on it.
- `npm run chief` prints your chief of staff's name, `npm run chief -- "Name"` changes it, and `npm run chief -- --clear` goes back to Claude, through `setChiefName`, the same save as the card. That command opens the local database, so stop the command center first.

A charter is a file, so Claude edits it directly when the owner asks, such as "Add a line to Avery's charter: never book a meeting before 10:00", and `npm test` checks its shape. The page reads the file at the next load.

**What upgrade adds, tier by tier.** Upgrading this entry upgrades its part first, [Chief of staff](../../agents/chief-of-staff.md), to the same tier, in its own run. Then this entry's run compares each file in its row's `code` three ways, the original from the commit that added the entry's newest install or upgrade brief.

- **To Complete:** `src/lib/agents/team.ts` reads each agent's skills and routines and its `installed` row, `agents-command.ts` gains `show`, and `TeamList.tsx` gains the detail view, with their tests.
- **To Mastery:** `team.ts` gains `checkTeam`, `agents-command.ts` gains `check`, the Key checker's test calls `checkTeam`, and `TeamList.tsx` gains the map, with their tests.

**What remove exports first.** Nothing, because the page holds no records. Remove takes out `src/lib/agents/team.ts`, `src/lib/agents/agents-command.ts`, `TeamList.tsx`, their tests, the two `package.json` lines and the tracing line, and the page goes back to its chief of staff card. The roster, the charters and the crew files stay.

## How it is done

**How `readTeam` reads.** It reads `key/key.yaml` for the roster, then each roster row's charter, taking the name from the row and the purpose from `## Role`. It sorts each file in `.claude/agents/`: a file starting with `crew-` is crew, the add-on is any file an `installed` row in `key/key.yaml` names, where the row has `from: master-agent-library@<version>` and lists its `.claude/agents/<id>.md` files, as the library's install writes it, and any other is the owner's own, as the Foundation's `CLAUDE.md` allows, with `own-` files the twins of `key/build-roles/`. A filename alone never makes a file the add-on. `docs/standards/key.md` gains that `installed` form as a shared edit, with `checkInstalled` accepting it, test first, and the canon primer names it. It lists `ninja/agents/` and keeps each entry whose role is not on the roster. It never writes, and it never throws on a bad file: a file it cannot read becomes a problem line on that agent, so one broken charter never blanks the page.

**Why the page reads disk.** Claude works from these files. A copy in the database would be a second answer to "who is on my team", and the day the two differed, the page would show a team Claude does not use.

**Your team and your crew.** Your team runs the business: it reads your Inbox, writes your brief and keeps each department moving. The crew builds the business: it designs, codes, reviews and proves each entry you install. They live in different folders so a dictionary update can replace the crew without touching anyone you hired. Your own agents have names of their own in `key/agents/`, never starting with `crew-` or `own-`, and the team check at Mastery flags one that does.

**The first run of this entry.** The plan, shown in plan mode, lists the code file, the command, the page change, the tests and the shared edits. After the owner's yes, tests come first and fail, then the code, the proof on the owner's real team, and one work commit with its log entry, [the runner](../../runner/run.md)'s way.

## Next

- Name your [chief of staff](chief-of-staff.md) and give it its page, so every prompt opens with the name you chose and your week arrives on one screen: "Install Chief of staff."
- Add a lead for the department that costs you the most hours: "Install Department leads for Finance."
- See who builds your business, and add a build role of your own, on [Build crew](build-crew.md): "Install Build crew."
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so each agent's skills and routines are one tap away: "Upgrade Your team to Complete."
