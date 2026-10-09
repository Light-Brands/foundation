---
id: modules/agentic/research
kind: module
title: Research
lead: brand-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, copywriter, experience-designer, builder, automation-engineer, code-reviewer, compliance-reviewer, qa-lead, scribe]
specialists: []
level: 2
version: 1
---

# Research

Section: Agentic.

**The job it takes off your plate:** finding things out properly. When you want to know what similar businesses charge, what your customers say about the problem you solve, or what a competitor just launched, an agent researches it the way a good analyst would: it reads real sources, answers your question, and keeps every source beside every finding, so you can see where each fact came from.

**What you still decide:** what is worth researching, which findings you keep, and what you do with them. Research informs. It changes no price, no offer and no page, and a finding reaches your public words only through a draft you approve.

You start it from the Research page in the Skills group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one gives your agents one way to research: the skill `research`, kept at `key/skills/research/SKILL.md` in the four sections every skill has, and a place to keep what it finds. Each piece of research is one note in your Key, `key/knowledge/research/<date>-<slug>.md`, with the question, the answer, the findings and the sources, each source with its address, its title, the date it was read and the words that support the finding.

When a note is ready, a **Research ready** card reaches your Inbox with the answer in two lines and a link to the note. You approve it to keep the note, or decline it to let it go. Notes you keep are knowledge your agents read, the same way they read your context block.

Research feeds two pages in the Brand group of Context: the Audience page, from what your customers say in public about the problem you solve, and the Offers page, from what others charge and include. Until those pages are installed, each note names the page its findings belong to.

**How it runs today.** Research runs when you ask, such as "Avery, research what pilates studios in Portland charge for a first class." The agent reads the web through the search and fetch tools your Claude already has, writes the note, and saves its card, which opens the local database, so on your own computer it runs with the command center stopped. The notes show everywhere once they are saved in your history, and the cards show on your own computer, where the research runs.

**What you do by hand.** Answer four questions. Ask your questions, and keep or let go each note.

## The bar

The world-class version is the research a sharp analyst hands a founder before a decision: a direct answer to the question asked, each finding with its source, primary sources over summaries, the date every source was read, what is still unknown said plainly, and nothing padded. Its test is the trace. Pick any sentence in the answer, and the note shows the source and the words that support it, read on a stated date. A question the sources cannot answer gets "not found". Research never reads a private person's details, never gets around a paywall or a site's terms, and never presents a guess as a finding.

## Depth tiers

**Essentials.** The research skill, run by the agent you choose, writing one note per question with every finding sourced, and one Research ready card per note. The Research page lists the notes.

Adds: the skill, its row, the research folder in the Key, the routine that declares the cards and runs the saved questions, one code file, the command handler, the page and their tests. No table.

**Complete.** Adds the watch list: questions you want asked again on a schedule, such as what three competitors charge, each month. Each new note is compared with the last one on the same question, and the card leads with what changed.

Adds: `key/knowledge/research/watch.yaml` and the compare step. No table.

**Mastery.** Adds source review. A kept finding whose sources are older than ninety days is read again, and a finding the sources no longer support is marked and brought to you.

Adds: the review step in the routine and one card kind. No table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads the context block, the roster and any notes already in the Key, and reflects back in two or three sentences what it found, such as "Your business is a yoga and pilates studio in Portland. There is no research in your Key yet."

1. **Who researches.** "Which of your agents should own the research skill? I suggest your chief of staff." The default is the chief of staff. Its row in `key/key.yaml` names that role as its `agent`, and when the roster has no chief of staff, the row leaves `agent` out until it does.
2. **Your first question.** "What do you most want to know right now? I suggest: what similar businesses near you charge, and what they include." The default is that question, fitted to the business from the context block. It becomes the first note, in the proof.
3. **Who you compare yourself with.** "Which businesses do you think of as your competitors?" The default is none named, and then the run proposes up to three in the first note, each marked **Proposed** until the owner confirms it, and at Complete the watch list follows them.
4. **Your tools.** "Where do you look today: review sites, a news alert, a newsletter, an industry group?" The default is none known. Each one named becomes a source the skill tries first. A source that needs a sign in is listed in your receipt as a connection to make on the Connect your tools page in Settings, and nothing behind a sign in is read without that connection and your yes.

Everything from here on is the build plan your assistant follows.

## Parts

Not part of this entry. The skill needs an agent on the roster to own it, and with none, the row leaves `agent` out, so Research installs on its own.

## Crew

The brand lead directs this entry when the owner has the Master Agent Library.

- **Run lead:** the stages, the plan and the gates, and every commit.
- **Business analyst:** the read, the questions, and the first question fitted to the business.
- **Copywriter:** the skill's Steps and Check, the note's headings and the card's words.
- **Experience designer:** the page, every state, on a phone and on a laptop.
- **Builder:** `src/lib/research/notes.ts`, the handler, the page and their tests, written test first.
- **Automation engineer:** the routine, its steps and its cards, and at Complete the watch list.
- **Code reviewer:** that every finding carries a source, and that the card is written once per note.
- **Compliance reviewer:** that research reads only public sources, respects each site's terms, and never keeps a private person's details in the Key.
- **QA lead:** the proof, a real question from the owner.
- **Scribe:** the rows, the origin in `installed`, the run brief and the build log.

## Data

No app and no table. Each note is a file in the Key, because research is knowledge your agents read, and its card is a row in the core Inbox table.

**Source of truth.** Each fact lives in one place:

- **How research is done:** the skill, `key/skills/research/SKILL.md`.
- **What was found:** each note, `key/knowledge/research/<YYYY-MM-DD>-<slug>.md`, with front matter `question`, `asked`, `status` (`draft` or `kept`) and `feeds` (`audience`, `offers` or neither), then the fixed headings Answer, Findings, Sources and Open questions.
- **What is watched,** at Complete: `key/knowledge/research/watch.yaml`, one row per question with its `slug`, `question` and `every` (`week` or `month`).
- **When saved questions run, and the cards:** the routine `key/routines/research-watch.md` and its row in `key/key.yaml`.
- **Each note's card:** one row in the core table `inbox_items`.
- **Whether a note is kept:** its `status`, which only the owner's yes changes, through the card or through Claude.

What the entry builds at Essentials:

- **Key files:** the skill, the routine, their rows in `key/key.yaml`, and the folder `key/knowledge/research/`.
- **Code:** `src/lib/research/notes.ts`, with `readResearch(root)`, which lists the notes newest first with their question, answer, status, sources and any problem, and `checkNote(file, text)`, which checks the shape below. The page and both commands call it. `src/lib/research/command.ts`, the routine's handler, with the steps `save`, `apply`, `check` and `blocked`, through `runHandler`.
- **The page:** `src/app/admin/(console)/agentic/[page]/ResearchPage.tsx`, shown when the page is `research`.
- **Tests:** `tests/unit/research.test.ts`, which fails on a note with a finding that cites no source, a source with no date read, or a heading out of order, and checks that `save` writes one card per note however often it runs, and `tests/e2e/research.spec.ts`, which signs in through the PIN gate and finds one note with its sources, at phone width and at desktop width.
- **Shared edits named in the plan:**
  - The `research` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`.
  - `src/lib/skills/skills-command.ts` gains the word `research`, and when [Your skills](skills.md) is not installed, this entry adds that file and its two `package.json` lines.
  - `docs/standards/key.md` gains the research note format and the watch list, with `checkKeyFolder` in `src/lib/key/formats.ts` calling `checkNote` on every note, its test written first.
  - The dictionary's [primer](../../foundation/primer.md) lists `key/knowledge/research/` in its Key table.

A note, as the skill writes it for Harbor Studio, the sample business whose context block is in [the Ninja home](../../foundation/ninja-home.md):

```markdown
---
question: What do pilates studios in Portland charge for a first class, and what do they include?
asked: 2026-10-08
status: draft
feeds: offers
---

## Answer
Most charge for a first class, often less than a regular class, and many add a short welcome before it. [1] [2]

## Findings
1. One studio lists an intro offer of three classes for new students. [1]
2. Another includes a short welcome talk before the first class. [2]

## Sources
1. <title>, <address>, read 2026-10-08: "<the words that support finding 1>"
2. <title>, <address>, read 2026-10-08: "<the words that support finding 2>"

## Open questions
- Whether the intro offers include mat rental. Not found on the pages read.
```

Each source's real title, address and quoted words replace the angle brackets. `checkNote` checks that every finding and every sentence of the answer ends in at least one `[n]`, that every `[n]` names a source, and that every source has an address and a date read. An answer of "Not found." passes with no sources when Open questions lists the searches tried.

## Screens and panels

**Research** (`/admin/agentic/research`), the third page in the Skills group of Agentic, replaces its coming soon state with three parts, each with its empty and error states:

- **Your research.** One card per note, newest first: the question, the two-line answer, how many sources, the date asked, and whether it is kept or a draft. A note that feeds Audience or Offers says so. Tapping a card opens the note, each source a link. With none yet: "No research yet. Ask a question, and the answer comes back with every source.", with the line that asks the first one.
- **Waiting for you.** Each draft note whose card is open, with a link to that card, where Approve keeps it and Decline lets it go.
- **A problem.** A note whose shape `checkNote` refuses shows in place with its repair line, and the rest of the page renders as normal.

At Complete, a **Watching** part lists each watched question, how often it runs and when it last ran, and each card says what changed since the last note. At Mastery, a finding marked unsupported shows on its note with the source that changed.

Every Open in line waits for your Enter, as [Work with Claude](../../frameworks/work-with-claude.md) teaches.

## Routines and Inbox cards

`key/routines/research-watch.md`, with `agent` set to the skill's owner, `category: plan`, because a research note is a report and Reports is a Leadership job, and a `cron` trigger, Tuesdays at 7:00 by default. It declares its handler under `draft` with the steps `save`, `apply`, `check` and `blocked`, and its card kinds:

- **Research ready** (`research-ready`, subcategory `reports`, `decide: approve`, `always_human: true`, so only the owner keeps a note, `expires_days: 14`, `on_lapse: closes`): one per note, with the two-line answer, the number of sources and the link. Approve keeps the note: `apply` writes `status: kept` into each approved note and closes its card. A declined or lapsed card leaves the note a draft. Its run key, `research-ready:<note file>`, means a second save of the same note adds no card.
- **The research did not run** (`research-blocked`, subcategory `reports`, `decide: done`): a run that stopped, with the step and the fix to try.

Its steps:

1. **Apply.** Run `npm run draft -- research-watch apply`, which keeps every note whose card was approved.
2. **Read the questions.** At Essentials, the questions the owner asked and saved for a run. At Complete, each row of the watch list that is due.
3. **Research.** Run the research skill on each question.
4. **Save.** Run `npm run draft -- research-watch save --note <file>` for each note, which checks it with `checkNote` and writes its card once.

When the owner asks for research in a conversation, the agent runs the skill and step 4 for that one note, so every note reaches the Inbox the same way.

## Connections

Essentials uses the search and fetch tools the owner's Claude already has, on public pages only. A source behind a sign in, such as a paid industry report or a members' forum, is read only through a connection made on the Connect your tools page in Settings, through its own entry and [Tools](tools.md), and only with the owner's yes. Research never posts, signs up or contacts anyone.

## Autopilot

**What runs on its own.** Each question becomes a sourced note and one card, with no one assembling it. At Complete, watched questions run on their schedule and each card leads with what changed since the last time. At Mastery, kept findings are read again once their sources are ninety days old, and a finding the sources no longer support is brought to you.

**The trigger.** The owner's question, or the routine's schedule, the `cron` line in `key/routines/research-watch.md`, which waits on a routine runner. Until then the owner starts it by asking, "Run my research watch", on their own computer with the command center stopped.

**The rung.** Drafts for approval. Every note arrives as a draft with its card, and only your Approve makes it knowledge your agents rely on.

**The next rung.** Acts within policy, for watched questions: once a watched question's notes have been kept three times in a row, a new note on it that finds nothing changed is kept on its own and listed in the Monday brief, and only a change reaches you as a card.

**What stays with the owner.** What to research. Which notes are kept. Every use of a finding in public words, which goes through a draft you approve. Any change to a price or an offer.

## Proof

### Essentials

**Setup.** The skill, the routine and the folder are in the Key, and the command center is stopped on the owner's computer so the card can be saved.

**The run, the way it will run.** The owner opens a fresh conversation with the Claude button and asks their first question, from question 2. The agent runs the skill on the open web, writes the note, and runs `save`. For Harbor Studio, the note answers what pilates studios in Portland charge for a first class, with each finding citing the studio's own page and the date it was read. The owner reads the answer and opens two sources at random to see the quoted words are there.

**The completion test.** All of these pass:

1. Every sentence of the answer and every finding cites a source, every source has an address and a date read, and the two sources the owner opened hold the quoted words.
2. One Research ready card arrived, and running `save` again for the same note adds none.
3. Approving the card and running `apply` marks the note `kept`, and Research shows it as kept at the next load.
4. `npm test` and `npm run e2e` pass, including `tests/unit/research.test.ts` and `tests/e2e/research.spec.ts`, and `checkNote` refuses a fixture note with an unsourced finding.

### Complete

**The run.** The QA lead adds the first question to the watch list, monthly, and runs the routine twice in a fixture with a source that changed between runs. The completion test: the second card leads with what changed, and the page shows the question under Watching.

### Mastery

**The run.** In a fixture, a kept finding's source is ninety-one days old and its quoted words are gone. The completion test: the review marks the finding unsupported, one card says which finding and which source, and a second run adds none.

## Complete when

**Fitted.** passes when the skill's owner, the first question and the competitors come from the owner's answers, and every competitor the owner has not confirmed is marked Proposed.

**Autopiloted.** passes when a question becomes a note and one card with no step left for the owner but Approve or Decline, and from Complete the watch list runs from its file alone.

**Visible.** passes when Research shows the notes, what is waiting and any problem, each with its empty state, on a phone and on a laptop.

**Connected.** passes when every note reaches the owner as exactly one Research ready card, and each note that bears on Audience or Offers names that page.

**Recorded.** passes when the skill's and the routine's rows and the entry's `installed` row with its files and `code` are in `key/key.yaml`, and the build log has the run's entries.

**Tested.** passes when the tests in `tests/unit/research.test.ts` and `tests/e2e/research.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when the owner's own first question became a note whose sources hold the words it quotes.

**Coherent.** passes when both doors meet the same notes: a note Claude writes shows on the page at the next load, and an Approve on the card is the note's `status` once `apply` runs.

**Reversible.** passes when remove leaves every note in the Key, keeps every card in the Inbox, takes out the skill, the routine, the code and the tests, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what the skill does and what they decide, such as "When I ask a question, an agent researches it, keeps every source, and I decide which answers to keep."

**Every finding sourced.** passes when no note in the Key holds a finding or an answer sentence without a source the run read, and dated.

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| How research is done | `key/skills/research/SKILL.md` | The Steps, such as "Try the owner's review sites first." The rule that every finding cites a source stays. |
| Who owns it | `key/key.yaml` | The skill row's `agent`, and the routine's `agent` with it. |
| A watched question, at Complete | `key/knowledge/research/watch.yaml` | One row: its question and how often. |
| When saved questions run | `key/routines/research-watch.md` | The `cron` line. Mondays at 6:00 is `cron: "0 6 * * 1"`. |
| A note | `key/knowledge/research/<file>` | Its `status`, or a correction the owner asks for, which adds a line under Open questions saying what changed. |

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder. Reading needs nothing stopped. Saving a card opens the local database, so stop the command center first:

- `npm run skills -- research` lists every note, newest first, with its question, status and number of sources, and any problem.
- `npm run skills -- research show <file>` prints one note as written.
- `npm run draft -- research-watch save --note <file>` checks a note and writes its card once.
- `npm run draft -- research-watch apply` keeps every note whose card was approved, and prints which.

A note is a file, so Claude edits it when the owner asks, and `npm test` checks its shape. When `apply` kept a note, the run asks the owner's yes to save it in history, staged by name, as "chore: research, <date>", and otherwise leaves it for the next run's Orient.

**What upgrade adds, tier by tier.** This entry has no part. Its run compares each file in its row's `files` and `code` three ways, the original from the commit that added the entry's newest install or upgrade brief. Every note and every line the owner wrote stays as it is.

- **To Complete:** `watch.yaml`, step 2 reading it, a compare step that reads the last note on the same question and writes "What changed" at the top of the answer, and Watching on the page.
- **To Mastery:** a review step in the routine, the card kind **A finding needs a look** (`research-stale`, subcategory `reports`, `decide: done`), and the unsupported mark on the page.

**What remove exports first.** Nothing, because every note stays in the Key and every card stays in the Inbox. Remove takes out the skill, the routine, their rows, the code, the page and the tests, and sets the page back to coming soon.

## How it is done

**Why notes live in the Key.** A finding about the market is knowledge, the same kind of thing as the voice guide and the context block, and agents read it the same way. A file per note keeps one history in git and shows on the page with no copy. Nothing about a private person or a customer ever goes in it.

**How the skill researches.** It restates the question in one line and plans three to five searches before it reads. It prefers primary sources, a business's own pages over a list that mentions them, and the most recent of each. It reads each page it cites and quotes the words that support each finding. It writes the answer last, from the findings, and says "not found" with the searches tried when the sources cannot answer.

**Why a card per note.** Research that sits in a folder unread is research nobody did. One card puts the answer in front of the owner once, in two lines.

**Why Audience and Offers read it.** Those pages hold what the business believes about its customers and its prices, so a kept note is proposed there, as a Proposed line the owner confirms.

**The first run of this entry.** The run lead asks the questions and shows the plan in plan mode. With the owner's yes, the tests come first and fail, then the code, the proof on the owner's first question, and one work commit with its log entry, [the runner](../../runner/run.md)'s way.

## Next

- Turn what you learn into the page about who you serve, with the Audience page in the Brand group of Context, when it arrives in the dictionary.
- Turn what others charge and include into your own offer ladder, with the Offers page in the Brand group of Context, when it arrives in the dictionary.
- Write about what you found in your own voice, on [Voice and writing](voice-and-writing.md): "Install Voice and writing."
- See every skill your agents have on [Your skills](skills.md).
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so the questions that matter are asked again on their own: "Upgrade Research to Complete."
