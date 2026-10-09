---
id: modules/agentic/tools
kind: module
title: Tools
lead: system-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, integrations-engineer, experience-designer, copywriter, builder, automation-engineer, code-reviewer, security-reviewer, qa-lead, scribe]
specialists: []
level: 2
version: 1
---

# Tools

Section: Agentic.

**The job it takes off your plate:** letting your agents use the services you already pay for, safely, the same way every time. Each service you connect says, once, what your agents may do with it: read your calendar, draft an email, list last week's payments. Your agents follow one skill to use any of them, check the connection works before they start, and bring you anything that writes, sends or spends as a draft. A draft you approve in a conversation is yours to send or copy into your own tool, and only a routine's approved card puts an email in your outbox.

**What you still decide:** which services are connected, what agents may do with each, and every write. Reading is what you allow it to be. Sending, posting, paying and changing a record always come to you first.

You start it from the Tools page in the Skills group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one sits on top of the one connection catalog your Foundation already has: the Connect your tools page in Settings, where every service is listed once with how it was connected, whether it works, and the name of the setting that holds its key, never the key.

It adds three things:

- **What each service may do.** In each service's Key file, `key/connections/<service>.yaml`, a list of `actions`: each with a name, whether it reads or writes, and the permissions it needs. The connection's own entry writes its first list. For a catalog row with no Key file, or a file with no list, Tools writes it at install, from your answers, and you decide every change after.
- **One way to use any of them.** The skill `use-a-tool`, kept at `key/skills/use-a-tool/SKILL.md`, which every agent follows: check the connection is working, choose an action the list allows, read what it may read, and turn anything that writes into a draft for you.
- **Which skill uses which service.** A skill that uses a service names it in its own front matter, as `connections: [<service>]`, so [Your skills](skills.md) and this page can show where each one is used.

**How it runs today.** The page reads the catalog wherever it runs: on your computer, and on a deployed command center once its own database is connected. The command line opens the local database, so on your own computer it runs with the command center stopped. An agent uses a tool when you ask, such as "Avery, list this week's bookings from the calendar", or when a routine that uses one runs.

**What you do by hand.** Answer four questions. Connect each service once on the Connect your tools page, and approve each draft that writes.

## The bar

The world-class version is how a careful operations lead hands a new assistant the company's accounts: what the assistant may do in each, and a rule that anything that leaves the building comes back for a signature first. Its test is the boundary. Asked to use a service, any agent does an allowed read, drafts an allowed write for your yes, or says plainly the action is not allowed. No agent ever sees a key. A failing connection is noticed before it is needed, and a service with more access than its actions need is flagged until the extra access is removed.

## Depth tiers

**Essentials.** Each connected service's actions in its Key file, the skill every agent follows to use one, and the Tools page showing each service, its actions and the skills that use it.

Adds: the `actions` list and the skill's `connections` field, the skill, one code file, the page, the command and their tests. No table.

**Complete.** Adds the weekly tool check. Each connection with a test runs it every week, and a connection that fails reaches you as one card before anything needs it.

Adds: a routine, its handler and one card kind. No table.

**Mastery.** Adds the access review. Each connection's granted permissions are compared with what its actions need, and a connection with more access than it uses is brought to you, with the permissions to remove.

Adds: one step in the routine and one card kind. No table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads the catalog, each connection's Key file, every skill and the roster, and reflects back in two or three sentences what it found, such as "Your Foundation has email sending connected, and no other services yet. No skill uses a service today."

1. **Your tools.** "Which services does your business use every week, such as your calendar, your email, your payments or your bookkeeping?" The default is the services already on Connect your tools. Each one not connected is listed in the receipt with the line that connects it. Nothing is read without a connection and your yes.
2. **What agents may do.** "For each connected service, may your agents only read, or also draft changes for you to approve?" The default is read only. The answer sets the actions in the service's list.
3. **Who owns the skill.** "Which of your agents should own the tools skill? I suggest your chief of staff." The default is the chief of staff. With no chief of staff, the row leaves `agent` out until there is one.
4. **Anything off limits.** "Is there a service your agents should never touch, such as your bank?" The default is none. Each one named is written as a connection with an empty `actions` list, so the page shows it as off limits and the skill refuses it.

Everything from here on is the build plan your assistant follows.

## Parts

Not part of this entry. The catalog, the Connect your tools page, the connection test and the key settings are part of every Foundation. Each service's connection is its own entry's job.

## Crew

The system lead directs this entry when the owner has the Master Agent Library.

- **Run lead:** the stages, the plan and the gates, and every commit.
- **Business analyst:** the read, the questions, and the receipt's list of services to connect.
- **Integrations engineer:** each `actions` list and its permissions, from the provider's documentation.
- **Experience designer:** the page, every state, on a phone and on a laptop.
- **Copywriter:** each action's label, the skill's steps and every empty state.
- **Builder:** `src/lib/tools/tools.ts`, the Key check, the page, the command and their tests, written test first.
- **Automation engineer:** at Complete the routine and its card, and at Mastery the access review.
- **Code reviewer:** that both doors read the catalog through one function, copying no status.
- **Security reviewer:** that no key is ever read, printed or stored, that a write can only become a draft, and that the access review never widens access.
- **QA lead:** the proof, on a real connected service.
- **Scribe:** the rows, the origin in `installed`, the run brief and the build log.

## Data

No app and no table. The catalog is the core `connections` table, and what each service may do is its Key file.

**Source of truth.** Each fact lives in one place:

- **Which services are connected, and whether each works:** the core table `connections`, one row per service, written only by the Connect your tools page, `npm run connection:set` and the connection test, through `upsertConnection` in `src/lib/data/connections.ts`.
- **Which permissions each service was granted:** the row's `scopes`.
- **Where each key lives:** the row's `key_setting`, the name of a setting, never its value.
- **What agents may do with each:** the `actions` list in `key/connections/<service>.yaml`.
- **How agents use a tool:** the skill, `key/skills/use-a-tool/SKILL.md`.
- **Which skills use which service:** each skill's own `connections` front matter.
- **A failing connection or extra access,** from Complete: one card in the core table `inbox_items`.

Each action has `key` (a slug), `label` (plain words), `kind` (`read` or `write`) and `needs` (the permissions it uses, as the catalog writes them). A `write` action may add `send: outbox` when a routine's approved card sends it through the Foundation's outbox, as email does.

What the entry builds at Essentials:

- **Key files:** the skill and its row in `key/key.yaml`. For each catalog row with no `key/connections/<service>.yaml`, the file with `connection`, `name` and `actions`, and for a file with no `actions`, the list, both from question 2. A list the connection's own entry wrote is left as it is.
- **Code:** `src/lib/tools/tools.ts`, with `readTools(db, root)`, which joins each catalog row from `listConnections` with its Key file's actions, whether it has a test through `hasTester`, whether its key setting holds a value through `keySettingState`, and the skills that name it, and returns each service with any problem found. The page and the command call it.
- **The page:** `src/app/admin/(console)/agentic/[page]/ToolsPage.tsx`, shown when the page is `tools`.
- **Tests:** `tests/unit/tools.test.ts`, which fails on an action with an unknown `kind`, a skill that names a service with no catalog row, and any output that holds a setting's value, and `tests/e2e/tools.spec.ts`, which signs in through the PIN gate and finds one service with its actions and the skill that uses it, at phone width and at desktop width.
- **Shared edits named in the plan:**
  - `docs/standards/key.md` gains the `actions` list in a connection's Key file and the `connections` field in a skill's front matter. The Key checker checks both, its tests written first: each action's shape, and each skill's `connections` naming a service with a Key file.
  - The dictionary's [primer](../../foundation/primer.md) lists `key/connections/<service>.yaml` and a skill's `connections` in its Key table.
  - The `tools` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`.
  - `src/lib/skills/skills-command.ts` gains the word `tools`, and when [Your skills](skills.md) is not installed, this entry adds that file and its two `package.json` lines.

Harbor Studio's email sending, the sample business whose context block is in [the Ninja home](../../foundation/ninja-home.md), as its Key file with its actions:

```yaml
connection: email-sending
name: Email sending
sender:
  secret_setting: RESEND_API_KEY
actions:
  - key: send-email
    label: Draft an email for your approval
    kind: write
    needs: []
    send: outbox
```

And the skill, as the copywriter writes it at Essentials:

```markdown
---
name: Use a connected tool
description: Use a connected service through its declared actions, reading what it allows and turning every write into a draft for the owner.
---

## Input
The task, and the service it needs. Use this skill whenever a job reads from or writes to an outside service.

## Steps
1. Run `npm run skills -- tools show <service>` and read its status and its actions.
2. When the service is not connected, or is failing, stop and tell the owner, with the line that connects or tests it.
3. Choose the action the task needs from the list. When none fits, stop and say which action would, and that the owner decides whether to add it.
4. For a read action, read only what the task needs, through the entry's own command for that service.
5. For a write action, prepare a draft for the owner: as the routine's own approval card when a routine asked, or in the conversation when the owner asked, for them to send or copy into their own tool. Never call a provider to write.

## Output
What was read, or the draft waiting for the owner, and the action used.

## Check
- No key was asked for, read or printed.
- Only declared actions were used.
- Every write is waiting for the owner's yes.
```

## Screens and panels

**Tools** (`/admin/agentic/tools`), the fifth page in the Skills group of Agentic, replaces its coming soon state with three parts, each with its empty and error states:

- **Your tools.** One card per service in the catalog: its name, its status in the catalog's own words (Connected, Needs a look, Planned, Disconnected), whether its key setting holds a value, what agents may do with it, each action as one line marked Reads or Drafts for you, and the skills that use it. A service with an empty list says "Off limits to your agents." With nothing connected: "Nothing is connected yet.", with a link to Connect your tools.
- **Not connected yet.** Each service a skill names, or the owner listed at question 1, that has no catalog row, with the line that connects it.
- **A problem.** A Key file whose actions the checker refuses, or a skill that names a service with no Key file, shows in place with its repair line.

Connecting, testing and disconnecting stay on the Connect your tools page, and each card links there. At Complete, each card shows when it was last tested by the weekly check. At Mastery, a service with more access than it uses shows the permissions to remove.

Every Open in line waits for your Enter, as [Work with Claude](../../frameworks/work-with-claude.md) teaches.

## Routines and Inbox cards

Essentials adds no routine. The skill runs whenever a job needs a service.

At Complete, `key/routines/tools-check.md`, with `agent` set to the skill's owner, `category: system`, a `cron` trigger, Mondays at 6:30, a handler `src/lib/tools/command.ts` under `draft` with the steps `test`, `review` and `blocked`, and its card kinds:

- **A tool needs a look** (`tool-failing`, subcategory `connections`, `decide: done`, `expires_days: 7`, `on_lapse: raised_again`): one per connection whose test failed this week, with the note the test gave and the link to Connect your tools. Its run key, `tool-failing:<service>:<week>`, means a second run in the same week adds none.
- **The tool check did not run** (`tools-check-blocked`, subcategory `connections`, `decide: done`).

Its steps: run `test`, which calls `runConnectionTest` from `src/lib/connections/tester.ts` for each connection with a test, so the catalog records the result the same way Test now does, then writes one card per failure.

At Mastery, the step `review` compares each row's `scopes` with the `needs` of its actions, and writes one **A tool has more access than it uses** card (`tool-access`, subcategory `connections`, `decide: done`) per service with extra permissions, naming each one. Removing them is the owner's, in the provider's own settings.

## Connections

This entry adds no connection of its own. It reads the catalog every Foundation has, and every service in it is connected by its own entry, through the Connect your tools page in Settings with its two doors: connect your own account, or Light Brands builds it custom.

## Autopilot

**What runs on its own.** Every use of a service follows one skill, so it checks the connection first and turns every write into a draft. At Complete, every Monday the tool check tests each connection and brings any failure to you before a job needs it. At Mastery, the same run flags any service with more access than its actions need.

**The trigger.** The job that needs a service, or the owner's ask. At Complete, the routine's schedule, the `cron` line in `key/routines/tools-check.md`, which waits on a routine runner. Until then the owner starts it by asking, "Run my tool check", on their own computer with the command center stopped.

**The rung.** Drafts for approval. Reads run as allowed, and every write reaches you as a draft for your yes.

**The next rung.** Acts within policy, for one write action at a time, once Department leads is at Mastery and the owner adds a `## Policy` line to the plan of the lead that owns the job, such as "Confirm a booking the calendar already shows as paid." Money, legal commitments, anything said in public for the first time, and anything the owner marked for themselves stay drafts at every rung.

**What stays with the owner.** Which services are connected, what each may do, every key, and every write that sends, posts, pays or changes a record outside the policy line.

## Proof

### Essentials

**Setup.** At least one service is connected on Connect your tools, such as email sending, its Key file carries its actions, and the command center is stopped on the owner's computer.

**The run, the way it will run.** The owner opens a fresh conversation with the Claude button and asks for one real job that needs the service, such as "Avery, send our new class schedule to the three people who asked about it." The agent runs the skill: it reads the service's status and actions, finds `send-email`, and shows the three drafts in the conversation. The owner approves one and copies it into their own email. Then the QA lead asks for an action the list does not have, such as deleting a contact in the email provider, and the agent says it is not allowed and which action would allow it.

**The completion test.** All of these pass:

1. The allowed write became drafts shown to the owner, no provider was called, and the outbox has no new row.
2. The action that is not listed was refused, with the plain reason.
3. No key appears in the conversation, the command's output or the page.
4. Tools shows the service, its actions and the skill that used it, and Connect your tools shows the same status.
5. `npm test` and `npm run e2e` pass, including `tests/unit/tools.test.ts` and `tests/e2e/tools.spec.ts`.

### Complete

**The run.** In a fixture with one connection whose test fails, the QA lead runs the tool check. The completion test: one A tool needs a look card arrives with the test's note, Connect your tools shows the connection as Needs a look, and a second run in the same week adds no card.

### Mastery

**The run.** In a fixture whose row lists a permission no action needs, the QA lead runs the review. The completion test: one A tool has more access than it uses card names that permission, and nothing in the catalog changed.

## Complete when

**Fitted.** passes when the services, what agents may do with each, the skill's owner and the off-limits services all come from the owner's answers.

**Autopiloted.** passes when every use of a service goes through the skill with no step left for the owner but approving writes, and from Complete the tool check runs from its file alone.

**Visible.** passes when Tools shows each service, its actions and its uses, not connected yet and any problem, each with its empty state.

**Connected.** passes when each card links to Connect your tools, and every failure from Complete reaches the owner as exactly one card.

**Recorded.** passes when the skill's row and the entry's `installed` row with its files and `code` are in `key/key.yaml`, and the build log has the run's entries.

**Tested.** passes when the tests in `tests/unit/tools.test.ts` and `tests/e2e/tools.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when a real job on a real service drafted its write for the owner, and an unlisted action was refused.

**Coherent.** passes when both doors meet the same catalog: a status saved on Connect your tools is the status `npm run skills -- tools` prints, and an action Claude adds to a Key file shows on the page at the next load.

**Reversible.** passes when remove takes out the skill and its code, leaves every connection, every key setting and every card as they are, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the skill does and what they decide, such as "My agents use the services I connected, only for what I allowed, and anything that sends or pays comes to me first."

**No key seen.** passes when no conversation, output, page or file the entry wrote holds the value of any setting.

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| What agents may do with a service | `key/connections/<service>.yaml` | One action added or taken out of `actions`. |
| Make a service off limits | The same file | `actions: []`. |
| Which skills use a service | The skill's `SKILL.md` | Its `connections` front matter. |
| How agents use a tool | `key/skills/use-a-tool/SKILL.md` | The Steps. Steps 2 and 5, stopping on a failing connection and drafting every write, stay. |
| When the check runs, at Complete | `key/routines/tools-check.md` | The `cron` line. |

Connecting, testing or disconnecting a service stays on the Connect your tools page or `npm run connection:set`.

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder. The tools command opens the local database to read the catalog, so stop the command center first:

- `npm run skills -- tools` prints each service with its status, whether its key setting holds a value, its actions and the skills that use it.
- `npm run skills -- tools show <service>` prints one service, as step 1 of the skill reads it.
- `npm run skills -- tools --check` checks every Key file's actions and every skill's `connections`, with nothing stopped, because it reads files alone.
- `npm run draft -- tools-check test`, at Complete, tests every connection with a test and writes a card for each failure.

**What upgrade adds, tier by tier.** This entry has no part. Its run compares each file in its row's `files` and `code` three ways, the original from the commit that added the entry's newest install or upgrade brief. Every action the owner added stays as it is.

- **To Complete:** the routine, its handler with `test` and `blocked`, the card kind, and the last tested line on the page.
- **To Mastery:** the `review` step, its card kind, and the access line on the page.

**What remove exports first.** Nothing, because the catalog is core and stays. Remove takes out the skill, its row, the routine at Complete, the code, the page and the tests, and sets the page back to coming soon. The `actions` lists stay in each Key file, where the connection's own entry reads them.

## How it is done

**Why actions live in the connection's Key file.** The file already says what the service is and how it is reached, so what agents may do with it belongs beside that, and every skill reads the same list.

**Why every write is a draft.** A read can be undone by forgetting it. A sent email, a post or a payment cannot. So the skill turns every write into a draft, and only a routine's approved card sends one, through the outbox.

**Why the check uses the existing test.** The weekly check runs the function Test now runs, so a failure is recorded the same way.

**Why least access.** Access no action needs is a risk with no use. The review only names it, because the owner removes access in the provider's own settings.

**The first run of this entry.** The run lead asks the questions and shows the plan in plan mode. With the owner's yes, the tests come first and fail, then the code, the proof on a real service, and one work commit with its log entry, [the runner](../../runner/run.md)'s way.

## Next

- Connect the service you use most for one job, on the Connect your tools page in Settings, so your agents can use it here.
- Give a writing skill to the agents that draft your emails, on [Voice and writing](voice-and-writing.md): "Install Voice and writing."
- See which skills use which service on [Your skills](skills.md).
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so a failing connection reaches you before a job needs it: "Upgrade Tools to Complete."
