---
id: agents/chief-of-staff
kind: agent
title: Chief of staff
target: foundation
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, scribe]
specialists: []
level: 1
version: 1
---

# Chief of staff

Department: Command center. Job: See your day.

**The job it takes off your plate:** keeping your week in view. Your chief of staff is the role that gathers what happened, what is waiting and what needs you, so you start each week knowing where to begin.

**What you still decide:** everything that matters. Your chief of staff reports and suggests. It never sends a message to a customer, moves money or changes a record.

## What it is

An agent, which is a role in your business with a name of its own, a way of working and knowledge of your business. This entry adds one role to your roster, the chief of staff, with its charter: the one page that says what the role does, who it serves, how it works, what it knows and what it never does. The skills and routines that do the work, such as [Write the brief](../skills/write-the-brief.md) and the [Monday brief](../routines/monday-brief.md), are their own entries, and each names this role as the one that runs it.

## The bar

The world-class version is the chief of staff a busy owner would hire if they could: it knows the business from the owner's own words, it keeps every summary to one screen, it never guesses a number, and it hands every decision back to the owner with one clear suggestion. Asked in a fresh conversation what it knows and what its role is, it answers in two or three sentences the owner agrees with.

## Depth tiers

**Essentials.** The role and its charter, ready to run the skills and routines that name it.

Adds: one row in `roster` in `key.yaml` and one file, `key/agents/chief-of-staff/charter.md`, with the eight sections every charter has. Its Tasks and Skills sections point at the routines and skills in `key.yaml` that name this role, so they stay true as more is installed.

**Complete.** Adds what the role remembers about how you like to work.

Adds: Memory lines from your answers, each typed as the Foundation's charter format asks, such as "preference: short and plain, with the one thing that needs me first".

**Mastery.** Adds the role's standing tasks for the week.

Adds: three standing tasks in the Tasks section, such as reading the Inbox each morning and naming what needs the owner first, alongside the routines that name the role.

## Questions

Asked after [the questionnaire](../runner/questionnaire.md), one at a time, each with its default.

1. **The name.** "What would you like to call your chief of staff? I suggest Avery." The default is Avery. The name is the role's display name, and the owner can rename it at any time with [modify](../runner/verbs/modify.md). The role itself, `chief-of-staff`, never changes, because it is the role's key everywhere.
2. **Who it answers to.** "Your chief of staff answers to <the owner's first name from your context block>. Is that right?" The default is yes.
3. **Complete only. How you like to work.** "How do you like to hear from your chief of staff? I suggest: short and plain, with the one thing that needs you first." The default is the suggestion. Each answer becomes one Memory line.
4. **Mastery only. The standing tasks.** "Which three things should your chief of staff do every week? I suggest: read the Inbox each morning and name what needs you first, flag any card older than three days, and close the week with what moved." The default is the three suggested.

When the roster already has a `chief-of-staff` row, the role is in place, so nothing is installed again. When `installed` has an `agents/chief-of-staff` row, say so in one line and offer [modify](../runner/verbs/modify.md) to change it, or [upgrade](../runner/verbs/upgrade.md) to take it deeper. When its charter is listed in another entry's row instead, as a Monday brief installed from dictionary 0.1.0 lists it, this entry's run is an upgrade: it takes the charter into its own row, as [upgrade](../runner/verbs/upgrade.md) describes.

## Parts

Not part of this entry.

## Crew

- **Run lead:** owns the stages, the plan and the gates, and commits.
- **Business analyst:** asks the questions and drafts the charter from the context block and the owner's answers, for the owner to read before it is written.
- **Scribe:** the roster row, the origin in `installed`, the run brief and the build log entries.

## Data

No app and no database table. The role lives in the Key.

The entries in `key.yaml` after an Essentials install, for a run on October 5, 2026 from dictionary 0.1.1, with the default name:

```yaml
roster:
  - persona: Avery
    role: chief-of-staff
    charter: agents/chief-of-staff/charter.md
    added: 2026-10-05
    version: 1
installed:
  - entry: agents/chief-of-staff
    from: dictionary@0.1.1
    tier: essentials
    files: [agents/chief-of-staff/charter.md]
    installed: 2026-10-05
```

- `persona` is the name from question 1. `role` and the charter's folder are always `chief-of-staff`.
- `files` are paths relative to `key/`. The entry creates no app code, so its row has no `code`.
- The version in `from` is the dictionary version the run used, read from `ninja/VERSION`.

## Screens and panels

Not part of this entry.

## Routines and Inbox cards

Not part of this entry.

## Connections

Not part of this entry.

## Proof

**The run.** With the charter written, the owner opens a fresh conversation that reads the Foundation folder (in Claude Code, a new session started in the folder) and asks: "<the name from question 1>, tell me what you know about <the business name> and what your role is." Then the owner comes back to the run's chat and says what the answer was, and the run waits until they do.

**The completion test.** All of these pass:

1. `key.yaml` has exactly one `roster` row with `role` `chief-of-staff`, its `persona` set to the chosen name and its `charter` set to `agents/chief-of-staff/charter.md`.
2. The charter has the eight sections in order, and every Memory line starts with its type.
3. `npm test` passes, which runs the Foundation's Key checker on the roster row and the charter.
4. The answer in the fresh conversation matches the context block and the charter, and the owner agrees with it. When anything is off, the charter is fixed and the question asked again.

## Changing it

**What modify may change.** The name, which is the `persona` in the roster row and the name on the charter's first line, changed together. The text under any section of the charter. A Memory line added at any time. The role `chief-of-staff`, the charter's path and the eight section headings stay, because every skill and routine that names the role finds it by them.

**What upgrade adds, tier by tier.** One file, `key/agents/chief-of-staff/charter.md`, compared three ways: the original is the charter as it stood at the commit that installed or last upgraded it, and the new version is that charter with the lines the new tier adds below, filled from this business's answers. The charter in How it is done is a draft for one sample business, so it is never applied in place of the owner's charter. The roster row moves to the next `version`.

- **To Complete:** Memory gains one typed line for each answer to question 3. Every other section is untouched, so the owner's own edits are kept.
- **To Mastery:** Tasks gains the three standing tasks from question 4, above the line that points at the routines. Every other section is untouched.

**What remove exports first.** Nothing, because a charter holds no business records. Remove first lists every skill and routine in `key.yaml` whose `agent` is `chief-of-staff`. Each one moves to another role or is removed first, because every `agent` must name a role on the roster.

## How it is done

The charter is one file in the Foundation's charter format: a first line naming the agent, its role and the business, then exactly eight `##` sections in this order: Role, Who I serve, How I work, What I know, What I never do, Tasks, Skills, Memory. `checkCharter` in `src/lib/key/formats.ts` fails `npm test` when a section is missing or out of order, or when a Memory line has no type. The charter at Essentials, as the business analyst drafts it for Harbor Studio, the sample business whose context block is in [the Ninja home](../foundation/ninja-home.md), with the default name. For the owner's business, every name in it comes from their own context block and answers:

```markdown
# Avery, chief of staff at Harbor Studio

## Role
Keeps the owner's week in view: gathers what happened, what is waiting and what needs a decision, so Jo starts each week knowing where to begin.

## Who I serve
Jo Harbor, the owner and lead teacher of Harbor Studio. I answer to Jo.

## How I work
I report only what the Foundation shows, and I say plainly what it cannot see yet.
I keep every summary to one screen, in a warm, clear and grounded voice.
I suggest one next step. Jo decides.

## What I know
The business facts in key/knowledge/context-block.yaml, and what is built in key/knowledge/system.md.

## What I never do
I never send a message to a customer, move money or change a record.
I never invent a number or round one into a different one.
I never give financial, legal or tax advice. I flag those questions for Jo to take to a qualified professional.

## Tasks
The routines in key/key.yaml whose agent is chief-of-staff.

## Skills
The skills in key/key.yaml whose agent is chief-of-staff.

## Memory
```

**Why Tasks and Skills point at `key.yaml`.** The skills and routines this role runs are installed by their own entries, later and in their own runs. Pointing at the list keeps the charter true as each one arrives, with no other entry editing this file.

**Why the name is asked and the role is fixed.** The owner talks to the agent by its name, so the name is theirs to choose and change. Every file finds the agent by its role, so the role never changes.

**Going deeper.** Ask to [learn](../runner/verbs/learn.md) how agents, skills and routines divide the work.

## Next

- Install [Write the brief](../skills/write-the-brief.md), the first skill your chief of staff runs: "Install Write the brief."
- Install the [Monday brief](../routines/monday-brief.md), which your chief of staff runs every week: "Install the Monday brief."
