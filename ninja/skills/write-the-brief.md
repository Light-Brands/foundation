---
id: skills/write-the-brief
kind: skill
title: Write the brief
lead: null
state: live
target: foundation
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, automation-engineer, builder, code-reviewer, qa-lead, scribe]
specialists: []
level: 1
version: 1
---

# Write the brief

Department: Command center. Job: See your day.

**The job it takes off your plate:** turning a page of numbers into a summary you can read in under a minute.

**What you still decide:** which sections the brief has, and what you do about what it says.

## What it is

A skill, which is a procedure an agent follows the same way every time. This one takes the week's numbers from everything installed in your Foundation and writes them up as a brief that fits on one screen, in your business's voice. The [Monday brief](../routines/monday-brief.md) routine runs it every week. Any of your roles can run it whenever you ask for a summary of the week.

## The bar

Every number in the brief is real and comes from the input, and every number that matters in the input is in the brief. It fits in 12 lines of text, and the blank lines between sections are free. It sounds like your business, in the words your business profile gives for how you sound. It says plainly what it cannot see yet, and it ends on one useful next step. It never guesses, never rounds a number into a different one, and never pads a quiet week.

## Depth tiers

**Essentials.** A one-screen brief of the week from the numbers, in fixed sections, ending on the next step.

Adds: the skill file, with the sections New in the last seven days, Waiting for you, Money and Not tracked yet.

**Complete.** Adds the change since last week beside every number.

Adds: last week's numbers to the Input, one step that writes each change, such as "up 2 since last week", and the matching line in Check.

**Mastery.** Adds the targets, an "Off track" mark on every number that misses its target, and a short plan for the week.

Adds: the targets to the Input, one step that marks what is off track, and three suggested moves for the week in place of the single next step.

## Questions

Asked after [the questionnaire](../runner/questionnaire.md).

1. **Who runs it?** "Which of your roles should write the brief? I suggest your chief of staff." The skill's row in `key.yaml` names that role as its `agent`, and the Foundation's Key checker requires that role to be on the roster. When the roster has no `chief-of-staff` row, say so in one line and offer to install [Chief of staff](../agents/chief-of-staff.md) first, in its own run, with its own `installed` row. The owner can instead choose any role already on the roster. When the [Monday brief](../routines/monday-brief.md) installs this skill as its part, the Chief of staff run comes first, so the role is already there.
2. **The sections.** "Your brief has four sections: New in the last seven days, Waiting for you, Money, and Not tracked yet. Would you like them as they are?" The default is yes.

## Parts

Not part of this entry.

## Crew

- **Run lead:** owns the stages, the plan and the gates, and commits.
- **Automation engineer:** writes the skill file and fits its sections to the routine that runs it.
- **Builder:** makes sure the Input matches exactly what `npm run brief -- numbers` prints, once that command exists.
- **Code reviewer:** checks the file against the Foundation's skill format.
- **QA lead:** runs the skill on the seeded numbers and holds the result to the completion test.
- **Scribe:** the skill's row in `key.yaml`, its origin in `installed`, and the build log entries.

## Data

Not part of this entry.

## Screens and panels

Not part of this entry.

## Routines and Inbox cards

The [Monday brief](../routines/monday-brief.md) runs this skill at its step 2, every week. The skill writes no card itself.

## Connections

Not part of this entry.

## Autopilot

The skill runs whenever a routine or a role calls it, every week at step 2 of the Monday brief, and it hands back text that the routine saves and delivers.

## Proof

### Essentials

**The input.** When the [Monday brief](../routines/monday-brief.md) is already installed, the input is what its brief command prints today, `npm run brief -- numbers`. When this skill is installed before the routine, as it is when the Monday brief installs it as a part, there is no brief command yet, so the input is this sample, stated here: one new contact through the public contact page and one card waiting in the Inbox, with nothing else installed, for the week that starts on Monday, October 5, 2026.

```json
{"week": "2026-10-05", "timezone": "America/Los_Angeles", "contacts_added": 1, "inbox_waiting": 1, "apps": []}
```

Name in the proof which input was used.

**The result,** for the sample input.

```text
Your week, October 5

New in the last seven days
- 1 new contact, through your contact page.

Waiting for you
- 1 card in your Inbox.

Not tracked yet
- Leads, deals, bookings and money show here once you install them.

Next: install Capture leads, so every inquiry is counted here.
```

The Money section is left out, because no installed app has amounts.

**The completion test.** The brief fits in 12 lines of text, blank lines aside, each of its numbers appears in the input, each number above zero in the input appears in the brief, and `npm test` passes with the skill in `key/skills/`, which runs the Foundation's skill format check on it.

### Complete

**The input.** When the Monday brief is installed at Complete, what `npm run brief -- numbers --compare` prints today. When last week has no numbers kept yet, `last_week` is empty, and the brief carries no change. When this skill runs before the routine's Complete run, the input is this sample, the Essentials sample with last week beside it:

```json
{"week": "2026-10-05", "timezone": "America/Los_Angeles", "contacts_added": 1, "inbox_waiting": 1, "apps": [], "last_week": {"contacts_added": 0, "inbox_waiting": 0, "apps": []}}
```

Name in the proof which input was used.

**The result,** for the sample input, the Essentials brief with the change beside each number:

```text
New in the last seven days
- 1 new contact, through your contact page, up 1 since last week.

Waiting for you
- 1 card in your Inbox, up 1 since last week.
```

**The completion test.** The Essentials test passes, every change since last week equals this week's number less last week's, and the skill's Check reads as the Complete line in Changing it sets it.

## Complete when

**Fitted.** passes when the role that runs the skill and its sections are the ones the owner chose.

**Autopiloted.** passes when the skill writes the brief from its input alone, with no question to the owner, so step 2 of the Monday brief can run it unattended.

**Visible.** passes, once the Monday brief is installed, when the brief the skill writes shows as that routine's card in the Inbox.

**Connected.** passes when the skill hands back text only, and the routine that runs it puts that text in front of the owner as one Inbox card.

**Recorded.** passes when `key.yaml` has the skill's row naming its `agent`, and its `installed` row with `skills/write-the-brief/SKILL.md` in `files`.

**Tested.** passes when `npm test` passes, with `checkSkill` reading the skill file.

**Proven.** passes when the brief written from the input named in the proof meets the completion test.

**Coherent.** passes when the skill file is the one place the brief's shape lives: modify edits `key/skills/write-the-brief/SKILL.md`, and the next brief follows it.

**Reversible.** passes when remove names the Monday brief as an entry that uses the skill and asks first, and leaves no data behind, because the skill keeps none.

**Explained.** passes when the owner can say in one sentence what the skill does and what they decide, such as "It turns my week's numbers into one screen, and I choose its sections."

**True numbers.** passes when every number in the brief appears in the input, and the brief fits in 12 lines of text.

## Changing it

**What modify may change.** Everything in `key/skills/write-the-brief/SKILL.md` except the limits in Output and Check: the sections in steps 2 to 5 (add, remove, rename or reorder them), the opening and closing lines, and the `description`. The 12 line limit and the rule that every number comes from the input stay, because the routine's completion test depends on them. Who runs it is the `agent` of the skill's row in `key.yaml`.

**What upgrade adds, tier by tier.** One file, `key/skills/write-the-brief/SKILL.md`, compared three ways, the original from the commit that added this entry's newest install or upgrade run brief, as [upgrade](../runner/verbs/upgrade.md) describes. When the [Monday brief](../routines/monday-brief.md) is upgraded, this skill is upgraded first, to the same tier, in its own run, with its own `installed` row, and its file is listed under that run.

- **To Complete:** Input gains "and last week's numbers, when the input has them". A new step after step 5: "Beside each number, write the change since last week, such as up 2 since last week." Check becomes "Every number in the brief appears in the input, or is a change since last week that equals this week's number less last week's, every number above zero in the input appears in the brief, and the brief has at most 12 lines of text, blank lines not counted." The sections the owner reshaped are kept, because the new step adds a line and edits none.
- **To Mastery:** Input gains "and the target for each number, when the routine lists one". A new step: "Start the line of every number that misses its target with Off track:". The closing "Next:" step becomes "Close with This week and three suggested moves, one line each." Check gains "every Off track mark matches a missed target".

**What remove exports first.** Nothing, because the skill holds no data. Remove lists the Monday brief as an entry that uses it, and asks first.

## How it is done

The skill is one file, `key/skills/write-the-brief/SKILL.md`, in the Foundation's skill format: front matter with `name` and `description`, then the sections Input, Steps, Output and Check, in that order. `checkSkill` in `src/lib/key/formats.ts` fails `npm test` when the front matter or a section is missing or out of order. The file as the automation engineer writes it at Essentials:

```markdown
---
name: Write the brief
description: Turn the week's numbers into a one-screen brief the owner reads in under a minute.
---

## Input
The week's numbers, as the brief command prints them: the week, the time zone, the contacts added, the Inbox cards waiting, and for each installed app the records added in the last seven days and in all, with counts by status and the total for the last seven days where the app has them.

## Steps
1. Open with one line: "Your week," and the month and day of the week.
2. Under "New in the last seven days", one line for each number that grew: new contacts first, then each app, named by its job.
3. Under "Waiting for you", the cards waiting in the Inbox, then anything open by status, such as open deals.
4. Under "Money", money in and money out, only when an installed app has amounts.
5. Under "Not tracked yet", one line naming what nothing installed can report yet.
6. Close with one line: "Next:" and the one step that would help most.

## Output
The brief as plain text, at most 12 lines of text, with blank lines between sections not counted, in the business's own voice, the words its profile gives for how it sounds.

## Check
Every number in the brief appears in the input, every number above zero in the input appears in the brief, and the brief has at most 12 lines of text, blank lines not counted.
```

### Input

What the agent reads before it writes. Here it is the one line of JSON the brief command, `npm run brief -- numbers`, prints. Keeping the input to exact numbers is what lets Check prove the brief true, line by line.

### Steps

The procedure, numbered, in the order the agent follows. Steps 2 to 5 are the sections, which is why modify reshapes the brief by editing them. A section with nothing to report is left out, so a quiet week reads short.

### Output

What the skill hands back: plain text the routine saves as it is. The 12 line limit is what "one screen" means here. It counts the lines with text in them, so the blank lines that separate sections never push a brief over.

### Check

How the agent knows the work is right before it hands it back. When a check fails, the agent rewrites the brief from the input, and never edits a number to make it pass.

**Going deeper.** Ask to [learn](../runner/verbs/learn.md) how skills work, or how a skill and a routine divide a job.

## Next

- Install the [Monday brief](../routines/monday-brief.md), which runs this skill every week and puts the brief in your Inbox.
- [Modify](../runner/verbs/modify.md) the sections to match how you think about your week.
