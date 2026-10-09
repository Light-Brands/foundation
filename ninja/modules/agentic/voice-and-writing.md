---
id: modules/agentic/voice-and-writing
kind: module
title: Voice and writing
lead: brand-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: [modules/brand/story]
crew: [run-lead, business-analyst, copywriter, experience-designer, builder, automation-engineer, code-reviewer, qa-lead, scribe]
specialists: [story-and-voice]
level: 2
version: 1
---

# Voice and writing

Section: Agentic.

**The job it takes off your plate:** writing as your business, on every channel, without you rewriting each draft. One writing skill turns a job, such as a reply to a review, a post or a follow-up email, into a draft in your voice, lists every claim it makes with where that claim came from, and checks itself against your voice guide before you see it.

**What you still decide:** what goes out in your name. Every draft reaches you before it is sent: a routine's draft as its Inbox card, and a draft you asked for in the conversation. Anything said for the first time in public, any price, date, guarantee or result, and anything about money or a legal matter always waits for your yes.

You start it from the Voice and writing page in the Skills group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one gives every agent on [Your team](agents.md) one way to write: the skill `write-as-us`, "Write as your business", kept at `key/skills/write-as-us/SKILL.md` in the four sections every skill has. It writes from your voice guide, the file [Story and voice](../brand/story.md) keeps at `key/knowledge/voice.md`, and it finishes every draft by running that entry's voice check, so a draft that drifts arrives with the lines that drifted and their rewrites.

Every routine and every agent that writes words for the business, from a quick reply you ask for to the posts the Create content page in the Marketing department will draft once it is installed, writes through this one skill, so your voice is one procedure and one file.

**How it runs today.** The skill runs whenever you ask an agent to write, such as "Avery, write a reply to this review", or whenever a routine that runs it runs. The voice check opens the local database, so on your own computer it runs with the command center stopped. The page shows the draft results wherever the database holds them, including a deployed command center once its own database is connected.

**What you do by hand.** Answer four questions. Read each draft, and send it, change it or decline it.

## The bar

The world-class version is the in-house writer a growing business hires once the owner can no longer write everything: someone who writes in the owner's voice on every channel, never invents a fact, and hands over drafts the owner sends with at most a word changed. Its test is the send rate. Over a month of real drafts, the owner sends most as written, every claim traces to a source, and no new promise reaches a customer without the owner's yes. A draft is short where the channel is short, and specific to the business.

## Depth tiers

**Essentials.** The writing skill, run by the agent you choose, writing every draft from your voice guide, listing its claims with their sources, and finishing with the voice check. The page shows the skill, the routines that run it and the recent results.

Adds: the skill file and its row in `key/key.yaml`, one code file, the page, the command and their tests. No table.

**Complete.** Adds examples for each channel you write on most: up to three pieces you approved, kept in the skill, which the writer follows the way a new hire follows a good sample.

Adds: an `## Examples` section in the skill, one per channel, and the step that picks them. No table.

**Mastery.** Adds the channel review. Each month, any channel where fewer than four in five drafts passed the voice check the first time gets a proposed channel rule for your voice guide, as one card through Story and voice's own review.

Adds: one step in Story and voice's monthly review and its counts on this page. No table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads the voice guide, the roster, every routine and the recent voice checks, and reflects back in two or three sentences what it found, such as "Your voice guide is approved and lists four channels. The Monday brief runs the voice check, and nothing else writes for you yet."

1. **Who writes.** "Which of your agents should own the writing skill? I suggest your chief of staff." The default is the chief of staff. Its row in `key/key.yaml` names that role as its `agent`. Any agent may run it. When the roster has no chief of staff, the row leaves `agent` out until it does, as `docs/standards/key.md` asks.
2. **Where you write most.** "Where does your business write most: email replies, social posts, your website, proposals, or something else?" The default is the channels under `## Channels` in your voice guide. The answer orders the channels on the page, and at Complete names the channels that get examples first.
3. **Words that always need you.** "Beyond prices, dates, guarantees and results, is there anything a draft should never say without asking you first, such as a discount, a medical claim or a client's name?" The default is none. Each answer becomes one line in the skill's Check, under "Always ask the owner".
4. **Your tools.** "Where do you write today: your email, a document, a social scheduler, or somewhere else?" The default is none known. Each one named is listed in your receipt as a connection to make on the Connect your tools page in Settings, through its own entry. Nothing is read or posted without your yes.

Everything from here on is the build plan your assistant follows.

## Parts

Installed in this order, before the entry. When a part is not installed yet, [install](../../runner/verbs/install.md) installs it first, as its own run, with its own `installed` row.

1. [Story and voice](../brand/story.md) (`modules/brand/story`): the voice guide the skill writes from, the voice check it finishes with, and the table that keeps each check's result.

## Crew

The brand lead directs this entry when the owner has the Master Agent Library, with its Story and voice specialist reviewing the skill's steps against the guide.

- **Run lead:** the stages, the plan and the gates, and every commit.
- **Business analyst:** the read, the four questions, and which writing routines run without the skill.
- **Copywriter:** the skill's Steps and Check, and at Complete the examples.
- **Experience designer:** the page, every state, on a phone and on a laptop.
- **Builder:** `src/lib/writing/writing.ts`, the page, the command and their tests, written test first.
- **Automation engineer:** the writing step in each routine that writes, and at Mastery the step in the voice review.
- **Code reviewer:** that the skill copies no guide, every claim has a source, and nothing is sent without the owner's yes.
- **QA lead:** the proof, a real draft from the owner's own week.
- **Scribe:** the skill's row, the origin in `installed`, the run brief and the build log entries.

## Data

No app and no table. The skill is a file in the Key, and the results it shows are the rows Story and voice already keeps.

**Source of truth.** Each fact lives in one place:

- **How the business writes:** the skill, `key/skills/write-as-us/SKILL.md`.
- **What the business sounds like:** the voice guide, `key/knowledge/voice.md`, which only Story and voice writes. The skill reads it and never keeps a copy.
- **The business facts a draft may use:** `key/knowledge/context-block.yaml`, written only by the profile saves.
- **Who owns the skill:** its row in `key/key.yaml`.
- **Which routines write through it:** each routine whose Steps name "the write-as-us skill".
- **How each draft did:** the `voice_checks` table that Story and voice keeps, one row per draft checked.
- **Each draft that missed:** its voice drift card in the core table `inbox_items`.

What the entry builds at Essentials:

- **Key files:** `key/skills/write-as-us/SKILL.md` and its row in `key/key.yaml`.
- **Code:** `src/lib/writing/writing.ts`, with `readWriting(root, db)`, which returns the skill's sections, the routines that run it, the writing routines that do not, and, when a database is reachable, the last thirty checks per channel with how many passed the first time. Both doors call it.
- **The page:** `src/app/admin/(console)/agentic/[page]/WritingPage.tsx`, shown when the page is `voice-and-writing`.
- **Tests:** `tests/unit/writing.test.ts`, with a fixture guide, the skill, one routine that runs it, one that writes without it and seeded check rows, and `tests/e2e/writing.spec.ts`, which signs in through the PIN gate and finds the skill, both routines and the channel results, at phone width and at desktop width.
- **Shared edits named in the plan:**
  - The `voice-and-writing` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`.
  - `src/lib/skills/skills-command.ts` gains the word `writing`. When [Your skills](skills.md) is not installed, this entry adds that file and its `package.json` lines, `"preskills": "node scripts/gen-build-secret.mjs"` and `"skills": "tsx --conditions=react-server src/lib/skills/skills-command.ts"`.
  - Story and voice's `status` step finds writing routines inside its command. That logic moves into one exported function, `writingRoutines(root)` in `src/lib/voice/guide.ts`, which both `status` and `readWriting` call, and it counts a routine that runs the write-as-us skill as one with the voice step, because the skill runs the check itself. Its test is written first.

The skill as the copywriter writes it at Essentials, for Harbor Studio, the sample business whose context block is in [the Ninja home](../../foundation/ninja-home.md):

```markdown
---
name: Write as your business
description: Draft any piece of writing in the business's voice, with every claim sourced, checked against the voice guide.
---

## Input
The job: the channel (site, email, social, reply, proposal or brief), what the piece is for, who reads it, and the records it may use. Use this skill for any words the business sends or publishes.

## Steps
1. Run `npm run draft -- voice-review guide` and read the whole guide it names, with the master prompt and the channel rule for this channel.
2. Read the context block for any business fact the piece needs.
3. Write the draft in the guide's voice, at the channel's length, from the records given and nothing else.
4. List every price, date, number, guarantee, result and promise in the draft, each with where it came from: a record, the context block or a confirmed line of the guide.
5. Mark the draft "needs the owner" when it carries anything under "Always ask the owner", or when the guide has no confirmed rule for this channel yet.
6. Run the voice-check skill on the draft, with its channel and reference: the routine's own, or `ask:<date>-<slug>` for a draft asked for in conversation.

## Output
The draft, its list of claims with their sources, whether it needs the owner, and the result the voice check printed.

## Check
- Every claim has a source. A claim with none is taken out, or asked of the owner, and never supplied.
- The voice check passed, or the draft carries its drift card.
- Always ask the owner: prices, dates, guarantees, results, discounts.
```

## Screens and panels

**Voice and writing** (`/admin/agentic/voice-and-writing`), the second page in the Skills group of Agentic, replaces its coming soon state with four parts, each with its empty and error states:

- **The skill.** Its four sections as written, its owner by name, and a link to the voice guide on [Story and voice](../brand/story.md). With no guide approved yet: "Your writing skill needs your voice guide first."
- **Who writes through it.** Each routine that runs the skill, by name, with its schedule. With none yet: "Nothing writes on its own yet. Ask any agent to write, such as a reply to a review, and it uses this skill."
- **Writing without it.** Each writing routine that does not run the skill, with the line that adds the step, such as "Avery, add the writing step to <routine>."
- **How it is going.** For each channel, in the order the owner chose, the last thirty checks: how many passed the first time, how many were rewritten, and how many missed, with the latest drift card linked. With no checks yet: "No drafts checked yet."

At Complete, each channel shows its examples. At Mastery, a channel under the four in five line shows the proposed rule waiting in the Inbox.

Every Open in line waits for your Enter, as [Work with Claude](../../frameworks/work-with-claude.md) teaches.

## Routines and Inbox cards

This entry adds no routine and no card kind. It adds one step to every routine that writes words for the business: "Write the <piece> with the write-as-us skill, channel <channel>." At install, the automation engineer adds the step to each installed writing routine that `writingRoutines` lists without it, in place of its own writing step, each change shown in the plan. The Monday brief keeps its own skill, [Write the brief](../../skills/write-the-brief.md), because a brief is numbers before it is prose, and it already runs the voice check.

The cards a draft brings are the ones Story and voice declares: **A draft missed your voice**, one per draft that missed. A routine's draft arrives as that routine's own card, and a draft asked for in conversation arrives in the conversation. Either way, a draft marked "needs the owner" is never sent on its own, at every rung.

## Connections

Not part of this entry. The skill writes drafts and sends nothing. Where a draft goes once you approve it, an email through your outbox or a post through a connected account, is the job of the entry that runs the routine, through the Connect your tools page in Settings and [Tools](tools.md).

## Autopilot

**What runs on its own.** Every routine that writes runs this skill, so every draft your Foundation writes is written from your voice guide, lists its claims with their sources, and is checked before its card reaches you. A draft that drifts arrives with its drift card. At Mastery, each month the channels that drift most get a proposed rule, so the guide learns where the writing struggles.

**The trigger.** The routine that writes, as one of its steps, or the owner's ask. The monthly channel review runs inside Story and voice's voice review, on its schedule.

**The rung.** Drafts for approval. The skill drafts, and every draft reaches you before it is sent.

**The next rung.** Acts within policy, for the rewrites only: once the voice guide's `Rung:` line says `Acts within policy`, the writer applies the voice check's rewrites itself before you see the draft. Sending stays with you, and anything marked "needs the owner" reaches you at every rung.

**What stays with the owner.** Every send. Anything said in public for the first time. Every price, date, guarantee, result and promise, and every line under "Always ask the owner". Every change to the voice guide.

## Proof

### Essentials

**Setup.** Story and voice is installed, the voice guide is approved, and the command center is stopped on the owner's computer so the voice check can open the database.

**The run, the way it will run.** The owner opens a fresh conversation with the Claude button and asks for one real piece their business needs this week, such as "Avery, write a reply to our latest review." The agent runs the skill: it reads the guide, writes the draft, lists its claims and runs the voice check with reference `ask:<date>-<slug>`. For Harbor Studio the reply opens with the reviewer's first name, thanks them for a specific moment from the review, and invites them back, with no price and no promise, and the check prints `pass`. The owner says in the run's chat whether they would send it.

**The completion test.** All of these pass:

1. The draft lists every claim it makes, each with a source, and none is supplied without one.
2. The voice check recorded one row for the draft, and a drift, when there was one, carries its card.
3. The owner would send the draft with at most a word changed. When they would not, the skill's steps or the guide are fixed with them and the run asks again.
4. Voice and writing shows the skill, its owner, and the draft's result under its channel.
5. `npm test` and `npm run e2e` pass, including `tests/unit/writing.test.ts` and `tests/e2e/writing.spec.ts`.

### Complete

**The run.** The owner picks up to three pieces they sent on their busiest channel, the copywriter strips any customer's name and record, and they go under `## Examples`. The QA lead asks for a new piece on that channel. The completion test: the draft follows the examples' shape, passes the voice check, and the page shows the examples.

### Mastery

**The run.** In a fixture month where one channel passed fewer than four in five checks the first time, the QA lead runs the voice review. The completion test: exactly one proposed channel rule arrives as a Voice guide update card, a second run in the same month adds none, and the page shows the channel under the line.

## Complete when

**Fitted.** passes when the skill's owner, the channel order and the "Always ask the owner" lines all come from the owner's answers.

**Autopiloted.** passes when every writing routine runs the skill as one of its steps, so no draft reaches the owner unchecked, and nothing is left for the owner but the send.

**Visible.** passes when Voice and writing shows the skill, who writes through it, what writes without it and how each channel is going, each with its empty state.

**Connected.** passes when every draft that missed reaches the owner as exactly one drift card, and every draft reaches the owner as its routine's card or in the conversation that asked for it.

**Recorded.** passes when the skill's row and the entry's `installed` row with the skill's file and `code` are in `key/key.yaml`, and the build log has the run's entries.

**Tested.** passes when the tests in `tests/unit/writing.test.ts` and `tests/e2e/writing.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when the skill wrote a real piece from the owner's own week, and the owner would send it.

**Coherent.** passes when both doors meet the same writing: a change Claude makes to the skill shows on the page at the next load, and a check recorded from the command line shows under its channel the next time the command center opens.

**Reversible.** passes when remove takes out the skill's row and file only after every routine that runs it is moved back to its own writing step, keeps every check row and card, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the skill does and what they decide, such as "Everything my business writes goes through one skill that writes in my voice and checks itself, and I send every piece."

**One writer.** passes when every routine that writes words for the business runs the write-as-us skill, and no routine, charter or skill keeps its own copy of the voice.

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| How a draft is written | `key/skills/write-as-us/SKILL.md` | The Steps. Step 1 and step 6, reading the guide and running the check, stay. |
| What always needs you | The same skill | One line under "Always ask the owner" in Check. |
| An example, at Complete | The same skill | One piece under `## Examples`, for its channel, with no customer's name or record. |
| Who owns it | `key/key.yaml` | The skill row's `agent`. |
| How the business sounds | Not here | The voice guide, through [Story and voice](../brand/story.md). |

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder. Reading the skill needs nothing stopped. Reading the results and running the check open the local database, so stop the command center first:

- `npm run skills -- writing` prints the skill's owner, the routines that run it, the writing routines that do not, and the last results per channel.
- `npm run skills -- writing --routines` prints only the routines, with nothing stopped, because it reads files alone.

The skill is a file, so Claude edits it directly when the owner asks, such as "Never mention our old address in a draft", and `npm test` checks its shape.

**What upgrade adds, tier by tier.** Upgrading this entry upgrades its part first, [Story and voice](../brand/story.md), to the same tier, in its own run. Then this entry's run compares each file in its row's `files` and `code` three ways, the original from the commit that added the entry's newest install or upgrade brief. Every line the owner wrote in the skill stays as it is.

- **To Complete:** `## Examples` in the skill, a step before step 3, "Read the examples for this channel and follow their shape", and the examples on the page.
- **To Mastery:** one step in `key/routines/voice-review.md`, before its propose step, "Run `npm run skills -- writing --channels` and propose a channel rule for each channel under four in five", the `--channels` word in the command, and the channel line on the page.

**What remove exports first.** Nothing, because the skill holds no records, and every check row and card stays with Story and voice. Remove first moves each routine that runs the skill back to a writing step of its own, shown in the plan, then takes out the skill, its row, the code, the page and the tests, and sets the page back to coming soon.

## How it is done

**Why one writing skill.** Ten routines with ten ways of writing drift ten ways. One skill means one place the method lives and every routine better the moment it changes. The voice lives in the guide, the method in the skill, and each routine says only what it is writing and for whom.

**Why claims are listed.** A model writes a confident sentence about a price it was never given as easily as one it was. Listing every claim with its source turns that risk into a line the check can test, and shows the owner where each fact came from.

**Why examples at Complete.** A model follows examples more reliably than adjectives, so three pieces the owner really sent teach a channel's shape faster than a paragraph of rules.

**Why the channel review goes through Story and voice.** The guide has one writer and one review, so a proposed channel rule is one more Voice guide update card there, and the guide never changes from two places.

**The first run of this entry.** The part runs first when Story and voice is missing. Then the run lead asks the questions and shows the plan in plan mode. With the owner's yes, the tests come first and fail, then the code, the proof on a real piece, and one work commit with its log entry, [the runner](../../runner/run.md)'s way.

## Next

- Keep your voice guide current as the business changes, on [Story and voice](../brand/story.md): "Modify my voice guide."
- Put the skill to work on a schedule with the Create content page in the Marketing department, when it arrives in the dictionary, so posts and pages are drafted every week and every one runs through this skill.
- Give a specialist this skill as its job, such as a reply writer for your Customer care lead, on [Specialists](specialists.md).
- See every skill your agents have on [Your skills](skills.md).
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so each channel has examples to follow: "Upgrade Voice and writing to Complete."
