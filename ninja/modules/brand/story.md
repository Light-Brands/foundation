---
id: modules/brand/story
kind: module
title: Story and voice
lead: brand-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: [agents/chief-of-staff]
crew: [run-lead, business-analyst, copywriter, experience-designer, builder, automation-engineer, code-reviewer, qa-lead, scribe]
specialists: [story-and-voice]
level: 2
version: 1
---

# Story and voice

Section: Context.

**The job it takes off your plate:** sounding like yourself, every time. Your story and your voice are drawn out of your own words into one voice guide, and every draft your Foundation's routines write is checked against that guide before it reaches you.

**What you still decide:** what the guide says. You approve the guide, every change to it, your origin story, and any new claim about your business. The system writes in your voice and tells you where a draft drifted. It never changes the guide without your yes.

You start it from the Story and voice page in your command center, by copying its one line into Claude Code. The line opens with your chief of staff's name, the one you chose at Setup, or "Claude" until you choose one.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one writes your voice guide: one file in your Key, the folder that holds your business's knowledge and instructions, at `key/knowledge/voice.md`. The guide holds your story, the way you sound, the words you use and avoid, rewrites that show the difference, a rule for each channel, and a master prompt, the one paragraph any AI model can follow to write as you. It is written from what you have already said, on your website and in your answers, and every line you did not say yourself is marked **Proposed** until you confirm it.

Then it keeps the guide in use. A voice check runs on every draft your Foundation's routines write, before the draft's card reaches your Inbox. Once a month a voice review reads what you have published and sent, and proposes changes to the guide as Inbox cards for you to approve. The Story and voice page shows the guide, how each recent draft scored, and what is waiting for you.

**How it runs today.** Nothing here runs on a timer yet. Stop the command center running on your computer, the window where `npm run dev` runs, then ask: "Run my voice review." The monthly schedule starts once your Foundation can run jobs on its own. The voice check runs whenever a writing routine runs, as one of that routine's own steps. Your guide shows everywhere, on your computer and on your live command center, once it is saved in your history. The draft scores and the voice cards show on your own computer, where the checks run.

**What you do by hand.** Answer five questions. Save your three words in Settings, then Preferences, when they change: the system hands you the words on a card and leaves the saving to you. Take the blind test: write one short piece fresh, then read four pieces and say which you would send. Approve or decline each card. At Complete, a few tools may ask you for a one-time export, such as Instagram's. At Mastery, you ask the people on a recorded call for their consent before that call is read.

## The bar

The world-class version is the voice guide a top brand strategist hands over at the end of an engagement, built so that a model can follow it without drifting. It reads like you on your best day, and a template with your name in it fails. Its test is its essence line: one sentence that could belong to no one else. Every line traces to something you said or showed, or carries a **Proposed** label. It holds rules a model can test, examples a person can copy, and a master prompt short enough to paste anywhere. And it is proven blind: a model given only the master prompt writes three pieces your business really needs, they are mixed with one piece you wrote, and you cannot pick out your own. After that, the guide earns its keep on the thousandth draft, because every draft is checked against it and the guide keeps up as you change.

## Depth tiers

**Essentials.** Your voice guide, written from your site and your answers, shown on the Story and voice page, with a voice check on every draft your routines write and a monthly review that proposes updates.

Adds: the guide, the voice check, the monthly review, a table of check results and the Story and voice page. The files are listed under Data, with the tests.

**Complete.** Adds your other channels. Each tool you named at question 5 is connected through the Connect your tools page, so the guide and the monthly review also read your newsletter, your social posts and your sent email, with your yes for each. The guide gains a rule for each channel, and the blind test gains one piece per connected channel.

Adds: the connected channels as sources, and one channel rule each. No new table.

**Mastery.** Adds the full verbal system and your recorded calls. The guide gains the lines a business says again and again: short ready-made descriptions of your business in 25 and 50 words, a first-person bio and a third-person bio, a 60-second pitch, and your answers to the three objections you hear most. Recorded calls become a source, with consent recorded for everyone on them, so the review hears how you speak as well as how you write.

Adds: a verbal system section in the guide, and call transcripts as a source. No new table and no new code file.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads your website and your Key and reflects back in three or four sentences what it found: what you offer, who it seems to be for, and one thing that stands out. It requests each page as a browser does, asking for HTML, and names the pages it read, so a site that serves assistants a different page is read the way a customer sees it. It says only what it actually found, and says plainly when the site could not be read.

1. **Your three words.** "Your profile says you sound <your three words, from your profile>. Are those still the three?" The default is your profile's three words. Each opens one line of the guide's `## How we sound`, with a phrase in your own words, and every draft is judged for tone against them. When you change one, or your profile has none yet, the run proposes three from what your site showed, marked **Proposed**, and gives you an **Update how you sound** card with the exact words to save in Settings, then Preferences. The run never writes your profile itself.
2. **How it started.** "Tell me the moment this business started: where you were, and what you decided." Then, after reflecting back what it heard, the gentle follow-up: "And what changes in the world when it wins?" There is no default, because this is yours alone. Your answer becomes the guide's origin, written as a short scene with its turning point, and the mission in one sentence. When you would rather skip it, the origin stays an open line marked **Proposed: waiting for your story**, and no draft tells a story about you that you did not tell.
3. **What you stand for.** "Here is what your site says you believe: <the beliefs the read found>. Is that right, and what would you add, especially anything others in your industry would argue with?" The default is the beliefs the read found. Your answer becomes the guide's three core beliefs, each with a line on why it matters, and its five soundbites. The phrases that state what you stand against go on the avoid list.
4. **Your edges.** "Which words or phrases make you wince when you see them in your own copy? And whose way of speaking do you admire?" The default is none yet. Every word you name goes on the avoid list, which the check tests word for word on every draft. The voice you admire shapes the guide's sentence rules and its tone settings. The guide never borrows that person's lines, and the check counts any phrase quoted from them as a hit.
5. **Your tools.** "Where do your words already live: your website, your newsletter, your social accounts, your sent email, a tool that records your calls? And may I check the replies your Foundation has already sent against the guide each month?" The default is your website. With your yes, the replies your Foundation has sent are checked against the guide each month. The guide learns only from words you wrote, so those replies are never a source for it. Each other tool you name is listed in your receipt, the summary you get when the install finishes, as a connection to make, and at Complete it is read too. Nothing is read without your yes.

**For example, the Dojo.** The Light Brands Dojo is the business this entry was shaped around, and these answers come only from its own operating facts. Anything they leave open is marked *to confirm*.

- **The claims check, on a real risk.** The Dojo's prices move: the Audit is $2,500 until Saturday, October 31, then $5,000. A draft written on November 2 that still says "$2,500" traces to no confirmed source for that date, so its claims mark drops and it reaches Dan Lawless with a card titled "A draft missed your voice", naming the line, "$2,500", and asking him to confirm the price or take the line out.
- **The read.** From the Dojo's site, the read finds two paths. Learn it: a free AI-Native Assessment of fifteen questions, a weekly workshop with Dan, recorded and free for an email or live on Tuesdays from 2:00 to 2:45 pm Central for $19, credited against a first membership payment, and a membership in three levels at $29, $49 and $79 a month. Build it: the Audit at $2,500 until October 31, then the 12 departments, each built with you or for you. One thing that stands out: "Your company still runs on you. Become the founder who directs it."
- **Question 1.** The Dojo's three words are *to confirm*. When its profile has none, the run proposes three from the site, marked **Proposed**, and Dan saves the ones he chooses.
- **Questions 2 to 4.** The origin, the beliefs and the words to avoid are Dan's to give. Until he answers, each is an open **Proposed** line. The one sentence already in the Dojo's own words is its guarantee, "Satisfied, or we refund you in full.", which goes into the words it uses.
- **Question 5.** The site is the confirmed source. The Dojo's operating facts also name email through Resend, a Facebook Page and Instagram through a social scheduling service, Discord for members, and Zoom, each *to confirm*. At Essentials the guide reads the site. Facebook and Instagram are connections to make at Complete, and recordings are a Mastery source, with consent. Discord carries members' words alongside the Dojo's, so it stays out until Dan names which channels hold only the Dojo's own posts, *to confirm*.
- **Who decides.** Dan approves the guide and every voice card.
- **The blind test.** A paragraph for the workshop page, an email to someone who registered for the recorded workshop, and a reply to someone asking about the Audit's refund window, which runs through the end of week one. The fourth piece is one Dan writes fresh to the same brief, as the Proof describes.
- **The writing routines.** The Dojo's operating facts name a campaign engine, built and idle, and an email steward, built and disabled, *to confirm*.

Everything from here on is the build plan your assistant follows.

## Parts

Installed in this order, before the entry. When a part is not installed yet, [install](../../runner/verbs/install.md) installs it first, as its own run, with its own `installed` row.

1. [Chief of staff](../../agents/chief-of-staff.md) (`agents/chief-of-staff`): the role that runs the voice review and the voice check skill, and writes in the owner's voice. The routine's `agent` and the skill's `agent` name it.

## Crew

The Brand lead and its Story and voice specialist direct this entry when the owner has the Master Agent Library, the paid set of section leads and specialists. The specialist draws the story and the voice out of the owner's words, writes the guide, runs the blind test, and hands the voice check to the automation engineer. The Brand lead reviews the guide before it lands.

- **Run lead:** owns the ten stages, the merged plan and the gates, and is the only one who commits.
- **Business analyst:** the website read, the five questions, and the map of the owner's channels and which can be read today.
- **Copywriter:** the guide's words, every line traced to its source or marked **Proposed**, the five rewrites, the channel rules and the master prompt, and the card titles. Any line in the guide that states a guarantee, a price or a result goes to the compliance reviewer when the owner's crew includes it.
- **Experience designer:** the Story and voice page, its four panels and every state each can be in, on a laptop and on a phone.
- **Builder:** the `voice` app and its migration, the three code files and their tests, written test first, and the end-to-end test.
- **Automation engineer:** the routine file and its four card kinds, the voice-check skill file, the voice step in each installed writing routine, and the Monday brief's line naming any draft that missed.
- **Code reviewer:** that the guide has one source and nothing keeps a copy, that a check writes its row and any card in one transaction and a second check of the same draft writes neither, that a second review in the same month writes no new card, that an approval is never lost, and that the run never writes the context block.
- **QA lead:** the blind test, the proof with a real draft, and the completion test.
- **Scribe:** the `key.yaml` rows, the origin in `installed` with its `files` and `code`, the run brief and the build log entries.

## Data

One app, `voice`, kept under Marketing (`attract`), because the Key's categories are the eleven departments and Brand is a group in the Context section of the command center with no category id of its own. Create content is where most drafts are written. Its table keeps one row per draft checked. The guide itself is knowledge, so it lives in the Key.

**Source of truth.** Each piece of Story and voice lives in one place, and nothing keeps a second copy:

- **The voice guide:** the Key file `key/knowledge/voice.md`. Every routine, the skill, the chief of staff and the Story and voice page read it from there.
- **The three sound words:** the business profile's `how_we_sound`, which Settings, Preferences writes, and its copy in `key/knowledge/context-block.yaml`, the business profile file that only that save writes. The guide uses the words only as the keys of its phrases, checked against the profile.
- **Each check's result:** the `voice_checks` table, one row per draft checked.
- **Each proposed change and each drift:** the core table `inbox_items`, one card per proposal and one per draft that missed.
- **When the review runs, its steps and the role that runs it:** the Key file `key/routines/voice-review.md` and the routine's row in `key/key.yaml`.
- **How a draft is checked:** the Key file `key/skills/voice-check/SKILL.md`, and the rung, read from the `Rung:` line of the guide's `## Checking` section. A rung is how much the system may do without asking: Drafts for approval means it suggests and the owner decides.

What the entry builds at Essentials:

- **Key files:** `key/knowledge/voice.md`, `key/skills/voice-check/SKILL.md`, `key/routines/voice-review.md` (which declares the drafting steps and the four card kinds), `key/apps/voice/definition.yaml` and `key/apps/voice/migrations/0001_voice_create.sql`.
- **Code:** `src/lib/voice/guide.ts` (reads the guide's sections and checks its shape), `src/lib/voice/command.ts` (the steps `guide`, `check`, `apply`, `sources`, `propose`, `status` and `blocked`), and the page `src/app/admin/(console)/context/story/page.tsx`.
- **Tests:** `tests/unit/voice.test.ts`, which also reads the real `key/knowledge/voice.md` and fails on a broken shape, and `tests/e2e/voice.spec.ts`, which signs in through the PIN gate and finds Story and voice with a fixture guide, one check row and one waiting card, at phone width and at desktop width.
- **Shared edits named in the plan:** the `story` row of `BRAND_PAGES` in `src/lib/layout/sections.ts` changes its `state` to `built`. When the Monday brief is installed, its routine gains the voice step, and the chief of staff's charter gains one line under What I know pointing at the guide's master prompt.

`key/knowledge/voice.md`, the shape the copywriter writes. The headings are fixed, because `src/lib/voice/guide.ts` reads them. This is Harbor Studio, the sample business whose context block is in [the Ninja home](../../foundation/ninja-home.md), with its profile's three words as the keys, and every other line left as the shape it takes:

```markdown
# Harbor Studio voice guide

## Essence
<one sentence that could belong to no one else>

## Story
**Origin.** <the moment, the place and the decision, as a short scene>
**Mission.** <one sentence>
**Beliefs.**
1. <belief>: <why it matters>
2. <belief>: <why it matters>
3. <belief>: <why it matters>

## How we sound
- **Warm.** <a phrase in the owner's words>
- **Clear.** <a phrase>
- **Grounded.** <a phrase>
**Tone.** Serious <0 to 2> funny. Formal <0 to 2> casual. Respectful <0 to 2> irreverent. Matter-of-fact <0 to 2> enthusiastic.
**Sentences.** <length, how we open, how we close, what we never do>

## Words we use
- <word or phrase>

## Words we avoid
- <word or phrase>

## Soundbites
1. <a line the owner could say on a stage>

## Rewrites
1. **Instead of** <a line that misses> **we say** <the line in our voice>

## Channels
- **Site:** <rule>
- **Email:** <rule>
- **Social:** <rule>
- **Replies:** <rule>
- **Proposals:** <rule>
- **Brief:** <rule>

## Proposed
- <every line above the owner has not confirmed yet, quoted>

## Master prompt
<one paragraph any model can follow to write as this business>

## Checking
Rung: Drafts for approval
```

- `## How we sound` has one line per word in the profile's `how_we_sound`, plus at most one more the owner confirms. Each line starts with its word in bold, as the key for its phrase. `guide` reads the keys against `how_we_sound` and reports a mismatch, and nothing in this entry writes the words.
- **Tone** places the business on the four dimensions of tone, each a three-point scale: 0 is the first word, 1 the middle and 2 the second.
- `## Rewrites` holds five pairs, and `## Soundbites` five lines.
- `## Proposed` lists every line the owner has not confirmed. A line leaves it when the owner confirms it.
- `## Master prompt` holds, in order: who the business is and who it serves, from the profile; the three words, each with its phrase; the tone settings and the Sentences line; up to five avoid words; two rewrites; and the claims rule. It stays under 150 words, so it pastes anywhere.
- No customer's name or words appear anywhere in the guide, because the Key travels with the repository.

For example, Harbor Studio's guide, the sample business, after Jo confirmed it. These are a sample business's lines, written to show the bar, and no real person's words:

```markdown
## Essence
The studio where your first class feels like your tenth.

## How we sound
- **Warm.** We greet you by name and remember what your back said last week.
- **Clear.** One instruction at a time, in words you would use yourself.
- **Grounded.** We promise a good hour, and we keep it.
**Tone.** Serious 1 funny. Formal 2 casual. Respectful 0 irreverent. Matter-of-fact 0 enthusiastic.
**Sentences.** Short. Open with the person, close with the next step. One exclamation mark a page at most.

## Rewrites
1. **Instead of** "Transform your body and mind with our world-class instructors!" **we say** "Come to a trial class. Jo will show you where to put your mat."
2. **Instead of** "Unfortunately we are unable to accommodate late arrivals." **we say** "Doors close five minutes after start, so the room can settle. The 6pm is a good next one."

## Channels
- **Replies:** answer the question in the first line, then one next step, signed by first name.

## Master prompt
You write for Harbor Studio, a small yoga and pilates studio in Portland, for adults new to yoga or pilates and for our regulars. Sound warm, clear and grounded: greet by name, one instruction at a time, promise only a good hour. Tone: a little funny, casual, respectful, matter-of-fact. Keep sentences short, open with the person and close with the next step. Never use: transform, world-class, journey. Write "Come to a trial class. Jo will show you where to put your mat." where you might write "Transform your body and mind with our world-class instructors!" Write "Doors close five minutes after start, so the room can settle. The 6pm is a good next one." where you might write "Unfortunately we are unable to accommodate late arrivals." State a price, a date or a result only when it is in the records you were given.
```

`key/apps/voice/definition.yaml`, as the builder writes it at Essentials:

```yaml
app: voice
name: Voice
category: attract
runtime: custom_app
entities:
  - key: voice_checks
    name: Voice check
    fields:
      - { key: ref, name: Draft, type: text }
      - { key: channel, name: Channel, type: select, options: [site, email, social, reply, proposal, brief] }
      - { key: status, name: Result, type: select, options: [pass, rewritten, drift] }
      - { key: marks, name: Marks, type: text }
      - { key: notes, name: Notes, type: text }
      - { key: checked_on, name: Checked, type: date }
    views: [table]
migrations: migrations/
```

`key/apps/voice/migrations/0001_voice_create.sql`, the matching table, with the three system columns every app table has:

```sql
create table if not exists voice_checks (
  id uuid primary key default gen_random_uuid(),
  ref text not null,
  channel text not null,
  status text not null,
  marks text not null default '',
  notes text not null default '',
  checked_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists voice_checks_ref on voice_checks (ref);
alter table voice_checks enable row level security;
```

- `ref` names the draft checked, such as `brief:2026-10-05` or `outbox:<send key>`, and is unique, so a draft is checked once. The draft's own text stays with its own record, so the table never keeps a second copy.
- `status` is `pass`, `rewritten` (at Acts within policy, a draft the writer fixed before saving that then passed) or `drift` (a draft that went on with a drift card beside it). Because the field is a `select` keyed `status`, the Monday brief counts the checks by result with no change to its own code.
- `marks` holds the four marks, such as `tone=4 words=5 shape=4 claims=5`. `notes` holds the lines that drifted and the suggested rewrite for each, and never a customer's details.

The entries in `key.yaml` after an Essentials install, for a run on October 7, 2026 from dictionary 0.2.0, with the chief of staff already on the roster:

```yaml
skills:
  - slug: voice-check
    path: skills/voice-check/SKILL.md
    agent: chief-of-staff
apps:
  - slug: voice
    definition: apps/voice/definition.yaml
    category: attract
routines:
  - slug: voice-review
    path: routines/voice-review.md
    agent: chief-of-staff
    category: attract
installed:
  - entry: modules/brand/story
    from: dictionary@0.2.0
    tier: essentials
    version: 1
    files: [knowledge/voice.md, skills/voice-check/SKILL.md, routines/voice-review.md, apps/voice/definition.yaml, apps/voice/migrations/0001_voice_create.sql]
    code: [src/lib/voice/guide.ts, src/lib/voice/command.ts, src/app/admin/(console)/context/story/page.tsx]
    installed: 2026-10-07
```

- The chief of staff's own row and charter belong to its own entry. The line this entry adds to the charter, and the voice step it adds to the Monday brief's routine, are edits to those entries' files, named in the plan, so their rows stay as they are.
- `src/lib/layout/sections.ts` belongs to the whole Foundation, so the `state` change is named in the plan and never in `code`. The tests are named in the plan and stay out of `code`.

## Screens and panels

**Story and voice** (`/admin/context/story`), the Story and voice page in the Brand group of Context, replaces its "ready to set up" state with four panels, each with its empty and error states:

- **Your voice guide.** The guide as written in `key/knowledge/voice.md`, read from the file on every load, with the essence line at the top. Each line still marked **Proposed** carries a small Proposed label. With no guide yet, the page shows its ready state and its Copy prompt. A guide that has lost one of its fixed headings, as after a hand edit, shows what `guide` found missing and the Copy prompt that repairs it.
- **How you sound.** The profile's three words beside the guide's keys. When they match, the panel says so in one line. When they differ, it names the word that moved and links to Settings, then Preferences. With no words in the profile yet, it says so and links there too.
- **Recent checks.** The last 20 rows of `voice_checks`, newest first: the draft, the channel, the result and the date, with the drifted lines and their rewrites one tap away. With none yet: "No drafts checked yet. The first is checked the next time a writing routine runs, such as your Monday brief." Above the list: "Writing routines checked: <n> of <m>", naming any routine without the voice step, with a Copy prompt: "<Name>, add the voice step to <routine>." On a deployed copy on a hosted database, the panel says the checks are on your own computer.
- **Waiting for you.** Each open voice card by title and age, each linking to its card, then the count of open voice cards, linked to **Handle what needs you** (`/admin/command/inbox`), and the count of approved changes not yet written into the guide, with "Run my voice review" to copy. On a deployed copy, the panel says the voice cards are on your own computer.

The page keeps its Copy prompt, so a change to the guide is always one sentence away. It keeps the same kicker, `DictionaryKicker` with `page="context/story"`, and builds its Copy prompt with `pagePrompt` and `chiefName`, so it still opens with the chief of staff's name and the page's kicker: its number from the map, then its section and name. On your own computer, the cards also show where the Foundation already shows the Inbox: on Handle what needs you, and by title in the What needs you panel on **See your day** (`/admin`). The navigation shows Story and voice as running.

## Routines and Inbox cards

`key/routines/voice-review.md`, as the builder writes it at Essentials:

```markdown
---
name: Voice review
agent: chief-of-staff
category: attract
trigger: cron
cron: "0 9 1 * *"
draft:
  handler: src/lib/voice/command.ts
  subcommands: [guide, check, apply, sources, propose, status, blocked]
card_kinds:
  - kind: voice-update
    subcategory: content
    label: Voice guide update
    decide: approve
    always_human: true
    expires_days: 30
    on_lapse: closes
  - kind: voice-words
    subcategory: content
    label: Update how you sound
    decide: done
  - kind: voice-drift
    subcategory: content
    label: A draft missed your voice
    decide: done
    expires_days: 14
    on_lapse: closes
  - kind: voice-review-blocked
    subcategory: content
    label: The voice review did not run
    decide: done
---

## Goal
On the first of each month at 9:00 in the business's time zone, the owner finds in the Inbox every change the last month's words suggest for the voice guide, each as one card to approve or decline.

## Steps
1. Run `npm run draft -- voice-review apply` to write every approved change into the guide.
2. Run `npm run draft -- voice-review sources --since <the first day of last month>` and read every source it lists: the website pages and each connected channel the owner writes in. Read the sent replies only to run them through the voice check.
3. With the voice-check skill's reading of the guide, find what the owner now says again and again that the guide lacks, any avoid word the owner now uses, and any guide line the owner has stopped using. Quote only the owner's own words, never a customer's.
4. Run `npm run draft -- voice-review propose --month <YYYY-MM>` with the proposals as JSON on standard input. It puts each one in the Inbox as one card, and a card to update the profile when the guide's keys and the profile's words differ.
5. When step 1 changed the guide, ask the owner: "Your voice review wrote <n> approved changes into your voice guide. May I save them in your history now?" With a yes, commit `key/knowledge/voice.md` alone, staged by name, as "chore: voice guide, <YYYY-MM>", with the applied card ids from step 1's output in the body, then run `npm run log:sync`. With a no, leave it for the next run's Orient.

## Expected output
One voice update card per proposal for the month, or none when nothing changed, and every approved change from before written into the guide.

## Check
`npm run draft -- voice-review status --month <YYYY-MM>` prints the month's proposals, cards and changes applied, and the cards match the proposals one for one.

## When blocked
Write no proposal. Run `npm run draft -- voice-review blocked --step <the step that stopped> --reason "<what it printed>"`, which puts one card titled "The voice review did not run" in the Inbox, saying which step stopped, what it printed and the fix to try. Tell the owner the same.
```

`key/skills/voice-check/SKILL.md`, the check every writing routine runs on its draft:

```markdown
---
name: Check a draft against the voice guide
description: Score a draft against key/knowledge/voice.md and return the lines that drift, each with a rewrite.
---

## Input
The draft, its channel (site, email, social, reply, proposal or brief), its reference, and the records it was written from.

## Steps
1. Mark the draft in a fresh context: hand a reader only the guide, the draft, its channel and its input records, with none of the conversation that wrote it. In Claude Code that is one subagent per draft. Its marks are the marks.
2. The reader runs `npm run draft -- voice-review guide` and reads the whole guide it names, with the profile's three words and any approved change not yet written into the file.
3. The reader marks the draft from 1 to 5 on four things: tone, words, sentence shape, and claims, where every price, date, number, guarantee and result in the draft traces to the draft's input records, the context block or a confirmed line of the guide. A claim with no source is a hit. The rewrite for it takes the claim out or asks the owner to confirm it, and never supplies a figure of its own.
4. Each mark uses this scale. **5:** the owner would send it as written. **4:** one or two words to change, and nothing a customer would notice. **3:** a line the owner would rewrite. **2:** reads like another business. **1:** wrong for the channel or the owner. For tone, compare against the three words and the four tone settings. For words, any avoid word caps the mark at 2. For shape, compare sentence length, the opening and the close with the Sentences line and the channel rule. For claims, any unsourced claim caps the mark at 2.
5. For every line that costs a mark, the reader writes the rewrite in the guide's voice, using the rewrites and soundbites as examples.
6. When the guide's rung is Acts within policy, the writer applies the rewrites, a fresh reader marks the rewritten draft, and the check gets `--rewritten`.
7. Run `npm run draft -- voice-review check --channel <channel> --ref <ref> --marks "tone=<n> words=<n> shape=<n> claims=<n>" --notes "<the drifted lines and their rewrites>"`, once, with the draft that will be saved on standard input.

## Output
The result the check printed: pass, rewritten, or drift with a card beside the draft. At Acts within policy, the rewritten draft, which the routine saves in place of the first.

## Check
Every mark is 4 or more, and the check found no avoid word, no unconfirmed Proposed line and no unfilled placeholder. Otherwise the draft carries its drift card.
```

**The voice step.** Every routine that writes words for the business runs the skill on its draft before the step that saves it. At install, the run adds this step to each writing routine already installed. Today that is the Monday brief, whose routine gains, between writing the brief and saving it: "Run the voice-check skill on the brief, with channel `brief` and reference `brief:<the week>`." Every later entry that writes words carries the step in its own routine.

**The cards.** All four are declared in the routine's front matter, so they file under Marketing, Create content, wherever they come from. A drift card for the Monday brief sits there, beside the brief's own card on See your day. Every card the command writes carries `sourceApp: "voice"`, so the Inbox and a later filter can find them, and the Story and voice page lists every open voice card, so the owner meets them from Brand as well as from the Inbox.

- **Voice guide update** (`voice-update`): one proposed change, with the section it touches, the line as it would read, why, and where the owner said it. Approve or Decline. Only the owner may decide it, and it closes on its own after 30 days. Its run key, `voice-update:<month>:<section>:<a short hash of the line>`, means a second review in the same month adds no card for the same change.
- **Update how you sound** (`voice-words`): the guide's keys and the profile's words have moved apart. The card names the three words to save in Settings, then Preferences. Saving them there is the one way they change.
- **A draft missed your voice** (`voice-drift`): one per draft that missed, with run key `voice-drift:<ref>`, naming each drifted line and its rewrite, for the owner to use or wave on. It closes on its own after 14 days.
- **The voice review did not run** (`voice-review-blocked`): a review that stopped, with the step, what it printed and the fix to try, so a missed month shows up in the Inbox.

**The schedule.** The `cron` line reads minute 0, hour 9, day 1 of the month, any month, any day of the week: 9:00 on the first of each month, in the `timezone` of `key/knowledge/context-block.yaml`. The Foundation's only scheduled job today is the daily checks, so the review runs when the owner asks, on their own computer, with the command center stopped. The schedule takes effect once the Foundation has a routine runner that runs a routine on its own schedule. The voice check needs no schedule, because each writing routine runs it as one of its own steps.

## Connections

Essentials uses none. It reads the owner's public website pages and the owner's answers. With the owner's yes at question 5, it also reads the replies the Foundation has already sent, from the core `outbox` table where the status is `sent`, as a test set only: the review runs each through the voice check to see where approved copy and the guide disagree, and it never proposes a guide line from them, because the Foundation wrote them. New lines come only from words the owner wrote: the site, the answers, and at Complete the owner's own sent mail and posts.

Complete and Mastery read the tools the owner named at question 5, each through the Connect your tools page, with its two doors: connect your own, or Light Brands builds it custom.

- **The newsletter and sent email.** The email platform, or the mailbox's sent folder. Gmail, for one, lets a connected app list sent mail by date, such as `in:sent after:2026/09/01` ([Gmail search](https://developers.google.com/gmail/api/guides/filtering)).
- **Social accounts.** A Facebook Page's published posts through its connection ([published posts](https://developers.facebook.com/docs/graph-api/reference/page/published_posts/)). For Instagram, until a connection exists, the owner requests the account's own "Download your information" export, chooses posts only, so messages and other people's comments stay out, and saves it in `.data/imports/instagram/`, which git ignores, for the review to read.
- **Recorded calls, at Mastery.** A call recording tool's transcripts, which may need an app the account's admin approves, so Light Brands builds this door custom. Read only with consent recorded for everyone on the call.

Each connection is read only. Nothing this entry does posts, sends or replies.

## Autopilot

**What runs on its own.** The guide is drafted from the owner's existing words, their site and their answers, so the owner starts by confirming and correcting. Every draft the Foundation's routines write is checked against the guide before its card reaches the Inbox, and a draft that misses arrives with a drift card naming each line and its rewrite. Once a month the voice review reads what the owner published and sent, proposes changes to the guide as cards, and writes each one the owner approves into the guide.

**The trigger.** Two. The voice check is triggered by the draft itself: it is a step inside every writing routine, so it runs whenever that routine runs, with no one starting it. The voice review is triggered by its schedule, the `cron` line in `key/routines/voice-review.md`, 9:00 on the first of each month, which waits on a routine runner, since the Foundation's only scheduled job today is the daily checks. Until that runner exists, the owner starts the same five steps by asking, "Run my voice review", on their own computer with the command center stopped.

**The rung.** Drafts for approval. The check marks every draft and suggests a rewrite for each line that drifts, and the draft reaches the owner as written, with its drift card beside it. The review proposes, and nothing in the guide changes until the owner approves.

**The next rung.** Acts within policy, for the check. Once the suggested rewrites have been the right call for a month of drafts, the owner sets the guide's `Rung:` line to `Acts within policy`. From then on the writer applies the rewrites itself, marks the rewritten draft, and runs the check once with `--rewritten`: a draft that passes is recorded `rewritten` with what changed, and only one that still misses reaches the owner with a drift card. The guide itself stays on Drafts for approval at every rung: every change to it is the owner's to approve.

**What stays with the owner.** Approving the guide and every change to it. The origin story and the mission. Any new claim about the business, which stays **Proposed** until the owner confirms it, and any change to a business fact, made in Settings, then Preferences. Any use of a customer's words, which belongs to the Proof page and its consent records.

## Proof

### Essentials

**Setup.** The owner's three words are saved in Settings, then Preferences, and the guide is approved: every line the owner confirmed has left `## Proposed`. Then `npm run dev` is stopped, so the drafting command can open the local database.

**The blind test.** The QA lead gives a fresh model only the guide's master prompt and asks for three pieces the business really needs: one paragraph for its website, one email to a customer, and one reply to a common question. Each runs through the voice-check skill exactly as a routine would, so each gets a row in `voice_checks`. Then the owner writes a fourth piece to the same brief as one of the three, fresh, in the next ten minutes, so the content gives nothing away. The QA lead shows the owner all four unlabeled, in a shuffled order, and asks two things: which would you send as your own, and which one did you write.

**A real draft, run the way it will run.** When the Monday brief is installed, the QA lead runs its routine's steps, the voice step included, with no one stepping in between them, and the proof names the week it used. For a run on October 7, 2026, step 1 of the brief prints the week `2026-10-05`, and the voice step prints:

```json
{"ref": "brief:2026-10-05", "channel": "brief", "status": "pass", "marks": "tone=5 words=5 shape=4 claims=5", "hits": []}
```

Compare by value. Any status is a real result: a drift prints `"status": "drift"` with its `hits` and adds one drift card. When the Monday brief is not installed, the three blind test pieces are the real drafts, and the proof says so.

**The review, run the way it will run.** The QA lead runs the routine's first four steps on the owner's own data, triggered by asking, because the schedule waits on a routine runner, and the proof says the trigger is still waiting. For a run in October 2026, step 2 reads from September 1, and `status` prints the month's counts, such as:

```json
{"month": "2026-10", "proposals": 2, "cards": 2, "applied": 0}
```

**The completion test.** All of these pass:

1. The owner would send each of the three model pieces with at most a word changed, and did not pick their own piece, or said the pick was a guess. When a piece fails, the lines that gave it away become avoid words or rewrites in `## Proposed`, the owner confirms them, and the blind test runs again with three new pieces.
2. The voice step ran inside the writing routine and wrote one row in `voice_checks` per draft, and `check` with the same `--ref` again adds no row and no card.
3. Running the review's step 4 again for the same month adds no card: `status` prints the same counts.
4. Approving one voice update card and running `npm run draft -- voice-review apply` writes that line into `key/knowledge/voice.md`, marks the card applied and closes it, and Story and voice shows the line at the next load.
5. `npm test` passes, including `tests/unit/voice.test.ts` with its shape test on the real `key/knowledge/voice.md`, the Key checker on the new definition, migration, routine and skill, and the one shape test between the definition and its table. `npm run e2e` passes, including `tests/e2e/voice.spec.ts`.
6. Story and voice shows the guide, the three words matching the profile, the recent checks and the cards waiting.

### Complete

**Setup.** The Essentials proof, then each tool the owner named connected through the Connect your tools page, its status `connected`.

**The run.** `sources` lists one line per connected channel, the review reads them, and the blind test adds one piece per connected channel, each through the voice check. The completion test: every connected channel has its rule in `## Channels`, every added piece passed, and nothing was posted or sent.

### Mastery

**Setup.** The Complete proof, then the call recording tool connected, with consent recorded for everyone on the calls it reads.

**The run.** The review reads the last month's transcripts with the other sources, and the guide's `## Verbal system` section is written and approved. The completion test: the two short descriptions count 25 and 50 words, every piece of the verbal system passes the voice check, and no line quotes anyone but the owner.

## Complete when

**Fitted.** passes when every answer shows in the guide: the three words key `## How we sound`, the origin and mission are in `## Story` or the origin is an open Proposed line, the beliefs and soundbites come from question 3, every word named at question 4 is on the avoid list, and the tools from question 5 are the guide's sources or are in the receipt as connections to make.

**Autopiloted.** passes when the voice step runs inside every installed writing routine with no one starting it, at Drafts for approval, the review's steps run from its file alone, triggered by its monthly schedule once the Foundation can run a routine on its own schedule and by the owner's request until then, no step is left for the owner except deciding the cards, and `status` shows every installed writing routine with the voice step.

**Visible.** passes when Story and voice shows the guide, the three words beside the profile's, the recent checks and the cards waiting, each with its empty state, and on the owner's own computer the cards show on Handle what needs you and by title on See your day.

**Connected.** passes when every proposed change reaches the owner as exactly one voice update card, every draft that missed as one drift card, and a review that stops as one card of its own.

**Recorded.** passes when `key.yaml` lists the skill, the `voice` app and the routine, and the entry's own `installed` row names its tier, version, files, code and the dictionary it came from, and the build log has each run's entries.

**Tested.** passes when the tests in `tests/unit/voice.test.ts` and `tests/e2e/voice.spec.ts` failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when the Proof ran on the owner's own words and data: a real draft through the voice step, and the review on the owner's own sources.

**Coherent.** passes when both doors meet the same guide: a change Claude makes to `key/knowledge/voice.md` shows on Story and voice at the next load, and a voice update the owner approves in the command center is in the guide the next draft is held to, because every check reads approved changes first and `apply` writes them into the file.

**Reversible.** passes when remove exports every row of `voice_checks` to `.data/exports/` before it takes the routine out, keeps the guide, and `npm test` stays green afterward.

**Explained.** passes when the owner can say in one sentence what runs, when, and what they decide, such as "Every draft my business writes is checked against my voice guide before it reaches me, once a month it suggests updates, and I approve every change."

**Voiced.** passes when the owner would send all three blind test pieces as their own, as Proof item 1 states.

**One guide.** passes when the voice lives only in `key/knowledge/voice.md` and the sound words live in the profile: the guide uses them only as keys, checked against the profile, and no routine, skill, charter or page keeps a copy.

## Changing it

**What modify may change.** Each change lives in as few files as it can, so the owner's edits stay easy to keep at upgrade.

| Change | File | What changes |
|---|---|---|
| A line of the guide | `key/knowledge/voice.md` | The line, under its fixed heading. A line the owner confirms leaves `## Proposed`. |
| The three words | Settings, then Preferences | The profile's `how_we_sound`, through its Save. `guide` then reports the keys that no longer match, and the run asks the owner for a phrase for each new word. |
| The rung | `key/knowledge/voice.md` | The `Rung:` line under `## Checking`: `Drafts for approval` or `Acts within policy`. |
| A channel rule | `key/knowledge/voice.md` | One line under `## Channels`. |
| The review's day or time | `key/routines/voice-review.md` | The `cron` line and the day and time named in Goal. The 15th at 8:00 is `cron: "0 8 15 * *"`. |
| Who runs it | `key/routines/voice-review.md` and `key/key.yaml` | The `agent` line, and the `agent` of the routine's and the skill's rows. |
| How a draft is marked | `key/skills/voice-check/SKILL.md` | Steps 3 and 4: what is marked and the scale. The pass rule in Check stays: every mark 4 or more, and no hits. |

Anything beyond the table is an upgrade or a different entry: the `voice_checks` table and the code change only by upgrade, and the owner's offers and audience belong to the Offers and Audience pages, which build on the profile's `what_we_do` and `who_we_serve` the same way this entry builds on `how_we_sound`.

**From the command line.** In Claude Code or Claude Desktop, with the command center stopped, the drafting command, the one command the Foundation runs every routine's steps through, reads and writes the same rows the command center shows on the owner's own computer. It opens the local database only, so a hosted database is out of its reach today:

- `npm run draft -- voice-review guide` prints the guide's sections, the profile's three words, whether the keys match them, and any approved change not yet written into the file.
- `npm run draft -- voice-review check --channel <channel> --ref <ref> --marks "<marks>"` checks a draft given on standard input and records the result once. `--rewritten` records a draft the writer already fixed.
- `npm run draft -- voice-review apply` writes every approved voice update into the guide and prints what changed, with the ids of the cards it applied.
- `npm run draft -- voice-review status --month <YYYY-MM>` reads a month's proposals, cards and changes applied, and the writing routines with and without the voice step.

The guide itself is a file, so Claude edits `key/knowledge/voice.md` directly when the owner asks, such as "Add 'plain' to the words my business avoids", and `npm test` checks the guide's shape. Story and voice reads the file on every load, so a change made from the command line is on the page at the next load. A change written by `apply` is saved as its own commit, staged by name, as "chore: voice guide, <month>", at the end of the review or, when the owner said not yet, at the next run's Orient. The three words change only in Settings, then Preferences: Claude hands the owner the words as a card and never edits the context block.

**What upgrade adds, tier by tier.** Upgrading this entry upgrades its part first, [Chief of staff](../../agents/chief-of-staff.md), to the same tier, in its own run, with its own `installed` row. Then this entry's run compares each file in its row's `files` and `code` three ways, the original from the commit that added the entry's newest install or upgrade brief, and the applied migration stays as it is.

To Complete:

- `src/lib/voice/command.ts`: `sources` adds one line per row of the core `connections` table whose status is `connected` and whose service is one the owner named at question 5, and the Instagram export folder when it holds a file.
- `key/knowledge/voice.md`: one `## Channels` line per connected channel, each **Proposed** until the owner confirms it. Every line the owner wrote stays as it is.
- `tests/unit/voice.test.ts`, named in the plan: the sources from connections.

To Mastery, from Complete:

- `key/knowledge/voice.md`: a `## Verbal system` section after `## Channels`, with the two short descriptions, the two bios, the 60-second pitch and the three objections with their answers, each **Proposed** until the owner confirms it.
- `src/lib/voice/guide.ts`: reads the new section.
- No data change.

**What remove exports first.** Every row of `voice_checks`, the draft reference, the channel, the result, the marks and the notes, into one file the owner keeps, inside the Foundation folder, outside `key/` and never committed. It goes in `.data/exports/`, which git ignores. Then remove takes out the routine, the skill, the three code files in `code`, the tests in `tests/unit/voice.test.ts` and `tests/e2e/voice.spec.ts`, the voice step from each writing routine, and the guide's line in the chief of staff's charter, and sets Story and voice back to ready, so `npm test` stays green. The guide is the owner's own words, so `key/knowledge/voice.md` stays unless the owner says to delete it. The `voice_checks` table is kept unless the owner says to drop it, which is a new migration. The cards stay in the Inbox.

## How it is done

**Why one file in the Key.** The guide is knowledge, the same kind of thing as the context block, so it lives beside it in `key/knowledge/`. One file means one place Claude edits, one place every routine reads, one place the page shows, and one history in git. A copy anywhere else would drift the first time either changed, which is why the chief of staff gets a pointer to the master prompt and never a copy.

**Why the guide builds on the profile.** The profile is the one writer of the short answers about the business. Its `how_we_sound` is three words in one line, separated by commas, and every part of the Foundation that writes can read it. The guide adds what three words cannot hold, a phrase for each, the tone settings, the lists, the rewrites, the channels and the master prompt, and leaves the words where they live. When the two move apart, the page shows it and the review sends a card to save the new words in Settings, then Preferences.

**How the guide is drawn out.** The specialist reads before asking: the Key, the site and, at Complete, the connected channels, quoting and noting where each line came from. It asks only what that reading left open, one question per message, reflecting back one sentence of what it heard before the next, with at most one gentle follow-up when an answer is thin. Specific memories beat summaries, so the origin question asks for the moment, the place and the decision. Then it finds the patterns: sentence length, the words the owner repeats, how they open and close, what they joke about, what they never say, and how they speak to a customer who is upset. It writes the guide from those, marks every line the owner did not say **Proposed**, and swaps a competitor's name in for the business's on every line. A line that still reads true could belong to another business, so it goes back for a rewrite from the owner's own words.

**Why rewrites and examples.** A model follows examples more reliably than adjectives. Anthropic's guidance on prompting is to give a few diverse examples, three to five, to improve consistency of tone and structure ([multishot prompting](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting)), and practitioners pair each voice word with its edge, such as "witty but never snarky", because a model learns faster from contrasts ([Optimizely](https://www.optimizely.com/insights/blog/using-ai-for-brand-voice/)). So the guide carries five rewrites, five soundbites and the owner's own lines, and the master prompt names them.

**Why four tone settings.** Three words leave a model room to guess. Nielsen Norman Group names four dimensions of tone, funny to serious, formal to casual, respectful to irreverent, and enthusiastic to matter-of-fact ([the four dimensions](https://www.nngroup.com/videos/tone-of-voice-dimensions/)), and its research found that tone measurably changes how friendly, trustworthy and desirable a business seems ([tone and users](https://www.nngroup.com/articles/tone-voice-users/)). Placing the business on each one gives the check something it can mark. The voice stays the same everywhere, and the tone moves with the moment, which is what the channel rules hold, the same split Mailchimp's [voice and tone guide](https://styleguide.mailchimp.com/voice-and-tone/) makes.

**The voice check, step by step.** The skill does the judging and the command does the counting. The marks come from a reader that never saw the draft being written, so a writer never passes its own work. The reader reads the guide through `guide`, marks the draft on tone, words, sentence shape and claims, and writes a rewrite for each line that costs a mark. Then `check` runs, once per draft:

- It reads the guide with every approved, unapplied change folded in, in memory, so the draft is held to the guide as the owner last decided it. Only `apply` writes the file.
- It tests the draft word for word against the avoid list, for any line still under `## Proposed`, and for any unfilled placeholder such as `<name>`. Each one found is a hit.
- It sets the status: `pass` when every mark is 4 or more and there are no hits. Otherwise `drift`. With `--rewritten`, a draft that passes is `rewritten`, and one that still misses is `drift`.
- In one transaction, it inserts the row in `voice_checks`, skipping it when the `ref` is already there, and for a drift writes the drift card through `writeCard` with run key `voice-drift:<ref>`, so the two land together or not at all, and a second check of the same draft writes neither.
- It prints one line of JSON with the reference, the channel, the status, the marks and the hits.

The pass rule, every mark 4 or more and no hits, is this entry's own rule, and modify can tighten it.

**The review, step by step.** `apply` reads `inbox_items` of kind `voice-update` with `decision` set to `approve` and no `applied` mark in its `meta`, whether or not the owner has since closed the card, so an approval is never lost. It writes each line under its heading in `key/knowledge/voice.md` through a temporary file renamed into place, so a reader never sees half a file, then marks the card applied in `meta` and closes it with `completeCard`, and prints the ids of the cards it applied. `apply` skips a line already present under its heading, so a run that stopped between the file and the mark writes nothing twice. `sources` prints the website from the profile and, from Complete, each connected channel the owner writes in, and lists the replies sent since the date given, when the owner said yes, as a test set for the voice check. `propose` reads the proposals as JSON, one object per proposal with the section, the line, why, and where the owner said it, and writes one card each, plus one `voice-words` card when the guide's keys and the profile's words differ. `status` prints the month's counts, and `writing_routines` and `with_voice_step`: it reads each routine file in `key.yaml` whose card kinds sit in a content, social, reply or proposal job, or that names the Monday brief's save, and finds the line "Run the voice-check skill". It writes nothing. `blocked` writes the one blocked card. Every step reads the pause switch first, through the drafting command and `runHandler`, and stops when the owner's routines are paused.

**Where it runs, and when.** Today the drafting command runs on the owner's own computer, with the command center stopped: the Foundation keeps its local database in `.data/`, and only one program can open it at a time. The command opens the database with `openScriptDb` from `src/lib/db/script.ts`, holds the one drafting lock, `.data/draft.lock`, and hands each step to `src/lib/voice/command.ts`, which uses `runHandler` from `src/lib/drafts/handler.ts`. The logic lives in `src/lib/voice/guide.ts` as functions that take the guide's text, the database and the date as arguments, as `docs/standards/testing.md` asks, so `tests/unit/voice.test.ts` runs in milliseconds. Story and voice reads the guide the way What you have built reads `key/knowledge/system.md`: from the file, through `keyRoot()` from `src/lib/key/write.ts`, rendered as Markdown with raw HTML skipped.

**The one data shape.** The table is named after the entity key and each column after a field key, with the SQL type of its field type: `text` for `ref`, `channel`, `status`, `marks` and `notes`, and `date` for `checked_on`. `compareDefinition` in `src/lib/key/schema.ts` fails `npm test` if the two drift. The unique index on `ref` is a constraint, and the shape check reads only names and types.

**Going deeper.** Ask to [learn](../../runner/verbs/learn.md) how the voice check marks a draft, how the review finds what the owner now says, or how the guide and the profile stay one story.

## Next

- Install the [Monday brief](../../routines/monday-brief.md) when it is not installed yet, so the voice check has a draft to check every week: "Install the Monday brief."
- [Modify](../../runner/verbs/modify.md) the guide as the business changes: "Modify my voice guide to avoid the word 'journey'."
- [Upgrade](../../runner/verbs/upgrade.md) it to Complete, so the newsletter and social posts feed the guide: "Upgrade Story and voice to Complete."
- Give every agent one way to write from this guide, on [Voice and writing](../agentic/voice-and-writing.md): "Install Voice and writing."
- The Offers and Audience pages, when they arrive in the dictionary, build on the same profile the guide builds on, and every page they write passes the voice check. The Offers page gives the claims mark a confirmed source for every price.
- [Check](../../runner/verbs/check.md) the system to see which writing jobs can now run in the business's voice, such as social posts, email replies and proposals.
