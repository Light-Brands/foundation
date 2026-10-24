---
id: modules/attract
kind: module
title: Marketing
lead: null
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, growth-strategist, copywriter, experience-designer, solution-architect, builder, automation-engineer, integrations-engineer, code-reviewer, security-reviewer, qa-lead, scribe]
specialists: []
level: 2
version: 1
---

# Marketing

Section: Grow.

**The job it takes off your plate:** bringing customers in. One request runs your whole Marketing department: it knows everything Marketing can add, reads what your Foundation already has, and builds the next piece around how you win customers.

**What you still decide:** which pieces you want, what each one says in your name, what you spend, and how far each runs on its own. Nothing is written until you approve the plan.

You start it from the Marketing page in your command center, by copying its one line into Claude Code. The same line starts Marketing the first time and picks it up again every time after.

## What it is

A department master, which is one entry for a whole department. Marketing has no separate entry for each job. This entry carries the full menu of what Marketing can add, listed under Parts, and every run of it starts by reading where your Marketing stands.

**The opening read.** Before any question, the run reads, and changes nothing:

- **What is added,** from the `installed` rows in `key/key.yaml` whose `entry` is `modules/attract`. Each row names its `piece`.
- **What is in flight,** from the run briefs in `key/runs/` for this entry, and any run branch not yet in `main`.
- **Your plan,** from `key/knowledge/plans/attract.md`, when it exists.
- **Your business,** from `key/knowledge/context-block.yaml`, and your voice guide at `key/knowledge/voice.md` when [Story and voice](brand/story.md) is installed.
- **Your tools,** from the Connect your tools page's records.

Then it says where you stand in a few lines, such as "Create content is running. Post on social is planned and waiting on your Instagram connection. Three pieces are open." It offers three moves, with the first as the default:

1. **Continue** what is in flight.
2. **Take the next piece** your plan names, or the one the read suggests, with one line on why.
3. **Pick** anything from the menu, or describe something of your own.

**Pieces the menu does not hold.** When you describe marketing work that fits none of the menu's pieces, such as a podcast, a partner newsletter or a print mailer, the run plans it as a piece of its own, gives it a name with you, and builds it the same way. Your Marketing section grows from what you choose.

**What a piece becomes.** Each piece is built from the parts a Foundation has: a routine for work that repeats, a skill for a procedure, an app for records, a connection for a tool you already use, and a screen when there is something to see. Every job on the menu has its page under Marketing from the first day, carrying the one line that starts this entry at that piece. When a piece with a screen is built, its screen replaces that page at the same address, so the prompt you ran becomes the working tool. A piece with no screen keeps its page, marked added.

**How it runs today.** The run works everywhere you run Claude Code. Each piece is planned with you and built by the crew through [the runner](../runner/run.md). Schedules wait on a routine runner, so until then a piece's recurring work runs when you ask for it.

**What you do by hand.** Answer the questions, approve each plan, connect each tool through the Connect your tools page, and approve what goes out in your name.

## The bar

The world-class version is a marketing lead who has worked with you for a year. They know what you sell and to whom, they know which two things bring in most of your customers, and they never ask you to start from a blank page. Every piece is fitted to how you already win customers, and nothing is installed because it was on a list. You can stop for a month, come back, say one sentence, and be told exactly where things stand and what the next move is.

## Depth tiers

A tier sets how far the department goes. Each piece is built at the tier of its run.

**Essentials.** The plan and your first piece. The run writes your Marketing plan, builds the one piece that matters most, and records it.

Adds: `key/knowledge/plans/attract.md`, the first piece's files, and its `installed` row.

**Complete.** Every piece you chose, each connected to the tools you use, each with its work arriving in your Inbox for approval.

Adds: one `installed` row per piece, and the connections each piece reads.

**Mastery.** The pieces work as one system. Approved content feeds your social posts, events feed follow-up, referrals are thanked from the same record, and one monthly review reads all of it and proposes changes to the plan.

Adds: the hand-offs between pieces, and the monthly Marketing review.

## Questions

Asked after [the questionnaire](../runner/questionnaire.md), one at a time, each with its default. On a return visit, only the questions whose answers the plan does not already hold are asked.

1. **How customers find you today.** "Where did your last five customers come from?" The default is what your site and your records show. The answer orders the menu: the pieces closest to what already works come first.
2. **What you want next.** "Which of these would change the most for you in the next month?" followed by the open pieces, in the suggested order. The default is the first. The answer is the piece this run builds.
3. **What stays with you.** "What should always come to you before it goes out?" The default is anything published in your name, any spend, and any new claim about your business. It becomes `## Stays with the owner` in the plan.
4. **How far it runs.** "Should this draft for your approval, act inside rules you set, or run and report?" The default is drafts for approval. It becomes the piece's line under `## Rungs`.
5. **Your tools.** "Which tools does your marketing run on today, such as your website, your email service, your social accounts or your ad accounts?" The default is your website. Each tool named becomes a connection to make on the Connect your tools page before the piece that needs it is built. Nothing is read without your yes.

**Your tools.** A piece is built around the tools you named. A tool the catalog holds is connected. A tool it does not hold is planned as a connection of its own, in the same run, with your yes.

## Parts

The menu. Every piece Marketing can add, in the default order. The opening read marks each one as added, in flight or open.

- **Create content.** Pages, posts and articles drafted from what your business knows, in your voice, published on a schedule you set. Builds best on Story and voice.
- **Post on social.** A steady presence on your channels, drafted from your approved content, one post a day waiting for your yes. Builds on Create content.
- **Run ads.** Paid campaigns with tracking proven from click to sale, and a daily check that holds spend inside your guardrails. Needs your ad account connected.
- **Get referrals.** Partners and referrers tracked, credited and thanked on time, so you see who sends your best customers.
- **Host events.** Webinars and events from registration to reminders, replays and follow-up while the event is fresh.

A piece you describe yourself joins this list in your own Foundation, under the name you gave it.

No other entry is installed first. When Story and voice is not installed, the run says so once and offers it, because every draft reads better with it.

## Crew

- **Run lead:** the opening read, the three moves, the plan and the gates, and every commit.
- **Business analyst:** the questions, and the receipt that matches what you asked for to what was built.
- **Growth strategist:** the order of the menu for your business, and the reason given with each suggestion.
- **Solution architect:** which parts each piece becomes, and how a new piece joins the ones already added.
- **Copywriter:** every draft, label and card, in your voice.
- **Experience designer:** each piece's screen and its states, on a phone and on a laptop.
- **Builder:** the code and its tests, written test first.
- **Automation engineer:** each routine, its trigger and its cards.
- **Integrations engineer:** each connection a piece reads.
- **Code reviewer and security reviewer:** every change before it is committed, and everything that publishes or spends.
- **QA lead:** the proof.
- **Scribe:** the `installed` rows, the plan, the run brief and the log.

## Data

**Source of truth.** Each fact lives in one place:

- **What Marketing can add:** this entry's Parts, and the Foundation's own list of departments and jobs.
- **What is added:** the `installed` rows in `key/key.yaml` with `entry: modules/attract`. Each carries `piece`, the piece's id, and `label`, its name. The command center's navigation and the Marketing page read the same rows.
- **The order, the rungs and what stays with you:** `key/knowledge/plans/attract.md`, under the fixed headings `## Priorities`, `## Rungs`, `## Stays with the owner` and `## Next`, the shape [Department leads](agentic/department-leads.md) reads.
- **What is in flight:** the run briefs in `key/runs/`.
- **Each piece's own records:** the app, routine or skill the piece built, named in its row's `files` and `code`.

One row, for Harbor Studio's first piece:

```yaml
- entry: modules/attract
  piece: content
  label: Create content
  from: dictionary@0.4.0
  tier: essentials
  version: 1
  files: [routines/weekly-article.md, knowledge/plans/attract.md]
  installed: 2026-10-12
```

A piece you named yourself uses an id made from its name, such as `piece: partner-newsletter`.

## Screens and panels

**Marketing** (`/admin/attract`), the department's page, shows:

- **The line to copy or open,** the same every time.
- **Added.** Each piece in `installed`, with its name, and a link to its screen when it has one.
- **You can add.** Each open piece from the menu, with what changes once it runs.

**Each job on the menu** has its page at `/admin/attract/<piece>`, listed under Marketing in the navigation. Until the piece is built, the page carries this entry's line opened at that piece ("Pick Create content from its menu") and what changes once it runs. A piece that is added with no screen is marked added there.

**How a screen replaces the page.** A piece with a screen is installed as a module, so the command center swaps the prompt for the screen by itself:

1. The screen is a page at `src/app/admin/(console)/attract/<piece>/page.tsx`. A page at that path takes the place of the prompt page at the same address.
2. The module is `modules/attract/<piece>/module.yaml`, with `id: attract/<piece>` and `screens: { attract.<piece>: /admin/attract/<piece> }`, and `attract/<piece>` is added to `modules.yaml`. The screen entry is what marks the job built in the navigation and links it from the Marketing page.
3. The piece's `installed` row names both files in `code`, so upgrade, check and remove find them.

A piece of your own, such as a partner newsletter, follows the same three steps under its own id, and appears in the navigation once its screen is installed. Until then it is planned from the Marketing page.

## Routines and Inbox cards

Each piece declares its own routines and card kinds when it is built, with `category: attract` and the piece's id as the job. Every card that publishes or spends is decided by the owner. The master itself adds one card kind at Mastery, **Marketing review**, once a month, proposing changes to the plan.

## Connections

Each piece names the connections it reads when it is planned: a website, an email service, social accounts, an ad account, an events tool. Every one is made on the Connect your tools page, by you, before the piece that needs it is built. A piece never asks for a secret in the conversation.

## Autopilot

**What runs on its own.** The opening read, on every run, so you never explain where you left off. Each piece's recurring work, once built: drafts written, posts queued, spend checked, referrers thanked, reminders sent. At Mastery, the monthly review.

**The trigger.** Each piece's routine carries its own trigger. Schedules wait on a routine runner, so until then you ask, such as "Run this week's article."

**The rung.** Drafts for approval. Every piece starts here: its work reaches your Inbox as a card, and nothing is published or spent without your yes.

**The next rung.** Acts within policy, one piece at a time, when you set a rule in the plan, such as "Post approved articles to social without asking." Spend never moves past your approval.

**What stays with the owner.** What is said in your name for the first time, every amount spent, every new claim, and every line under `## Stays with the owner`.

## Proof

### Essentials

**Setup.** A Foundation with its Key in place, and the owner at the keyboard.

**The run.** The QA lead starts Marketing from the page's line on the owner's own Foundation. The opening read names what is added and what is open. The owner chooses a piece, approves its plan, and the crew builds it.

**The completion test.** All of these pass:

1. The opening read matches `installed` and `key/runs/`, with nothing invented.
2. The chosen piece's row is in `installed` with its `piece`, `label`, `files` and any `code`, and every file it names exists.
3. The Marketing page lists the piece under Added, and when it has a screen, `/admin/attract/<piece>` shows the screen in place of the prompt, with `modules/attract/<piece>/module.yaml` and the `modules.yaml` line in place.
4. Starting Marketing again, in a new session, names that piece as added without being told.
5. `npm test` passes.

### Complete

**The run.** A second and a third piece are added in later sessions, each starting from the same line. The completion test: each session's opening read was right, and each piece's cards reach the Inbox.

### Mastery

**The run.** One approved article becomes social posts through the hand-off, with no copy pasted by hand. The completion test: the monthly review reads every piece and its card names one change to the plan.

## Complete when

**Fitted.** passes when the menu's order follows how the owner's customers find them, and each piece's plan names what the owner said in their own words.

**Autopiloted.** passes when the opening read runs with no prompting, and each built piece's recurring work runs from its routine file alone.

**Visible.** passes when the Marketing page shows what is added and what can be added, each built piece's screen stands where its prompt page was, and every state reads well on a phone and on a laptop.

**Connected.** passes when each piece reads the tools the owner named through the Connect your tools page, and its work reaches the Inbox as cards.

**Recorded.** passes when every piece has its `installed` row with `piece` and `label`, the plan holds the order, the rungs and what stays with the owner, and `key/knowledge/system.md` is current.

**Tested.** passes when each piece's tests failed before the code that passes them existed, and `npm test` passes.

**Proven.** passes when the owner ran a piece on their own Foundation and approved its first real card.

**Coherent.** passes when the page and the command line agree: the pieces the page lists under Added are the rows `key/key.yaml` holds, and a change made in either shows in the other.

**Reversible.** passes when remove takes out one piece cleanly, after saving its records, and leaves every other piece running.

**Explained.** passes when the owner can say in one sentence what Marketing does for them, such as "Marketing writes my weekly article and my daily posts, and I approve them from my Inbox."

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| The order of the pieces | `key/knowledge/plans/attract.md` | `## Priorities`. |
| How far a piece runs | `key/knowledge/plans/attract.md` | `## Rungs`. |
| What stays with you | `key/knowledge/plans/attract.md` | `## Stays with the owner`. |
| A piece's name | `key/key.yaml` | The row's `label`. |
| Anything inside a piece | The files its row names | Planned with you, as its own run. |

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder:

- "Follow Marketing from the Ninja dictionary." starts or continues the department.
- "Where does my Marketing stand?" runs the opening read alone, and changes nothing.
- "Add Post on social to my Marketing." goes straight to that piece.
- "Remove Run ads from my Marketing." takes one piece out.
- `npm test` checks every `installed` row and every file it names.

The plan and the rows are files, so Claude edits them directly when you ask, and the Marketing page shows the change at its next load.

**What upgrade adds, tier by tier.** Each piece upgrades in its own run, and every line you wrote stays.

- **To Complete:** the pieces you chose and have not built yet, in the plan's order.
- **To Mastery:** the hand-offs between pieces, and the monthly review.

**What remove exports first.** Each piece's own records, saved to `.data/exports/` before anything is taken out. Removing one piece leaves the plan, the other pieces and the department's page in place.

## How it is done

**Why one entry for the department.** A separate entry for every job asks you to know the map before you start. One entry that carries the menu lets you say what you want in your own words, and the run finds the piece or builds a new one.

**Why the read comes first.** The record already holds what is built and what is in flight. Reading it first means a return visit takes one sentence, and the run never asks for something the Key already knows.

**Why a piece is recorded by its own row.** The navigation, the Marketing page and the next run all read the same rows, so there is one answer to what has been added, and a piece removed is gone from all three at once.

**The first run.** The opening read finds nothing added. The questions order the menu, the owner picks one piece, and the plan, shown in plan mode, lists that piece's files, its tests and its row. After the owner's yes, tests come first and fail, then the code, the proof on the owner's own Foundation, and one work commit with its log entry, [the runner](../runner/run.md)'s way.

## Next

- Give every draft your voice with [Story and voice](brand/story.md): "Install Story and voice."
- Put a lead over the department, holding its plan and proposing the next step each week, with [Department leads](agentic/department-leads.md).
- Come back any time with the same line. The run starts from where you are.
