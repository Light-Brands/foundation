---
id: modules/agentic/your-recipes
kind: module
title: Your recipes
lead: system-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: [modules/agentic/recipes, agents/chief-of-staff]
crew: [run-lead, business-analyst, experience-designer, copywriter, builder, automation-engineer, security-reviewer, code-reviewer, qa-lead, scribe]
specialists: []
level: 2
version: 1
---

# Your recipes

Section: Agentic.

**The job it takes off your plate:** doing a good setup twice from memory. When a run turned out the way you wanted, such as adding your Sales lead, you save it as a recipe: its name, when to use it, and which questions to ask again next time. "Run my recipe" then does it again the same way, and a recipe can be shared with another business without any of yours inside it.

**What you still decide:** which runs become recipes, what each one asks again, and every run of a recipe. A recipe repeats a plan you approved once, and it still shows you the new plan and waits for your yes.

You start it from the Your recipes page in the Recipes group of Agentic, with its one line copied or opened in Claude.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one keeps the runs worth repeating.

Every run of the dictionary in your Foundation already leaves a full record, and a recipe points at it:

- **The run brief,** `key/runs/<date>-<verb>-<entry>.md`: the request and your answers, the target, the plan you approved, the review notes and the proof.
- **The `installed` row** in `key/key.yaml`, with the tier and the entry's version.
- **The build log entry** in `key/log/<YYYY-MM>.md`, with the commit and the entry.

A recipe is one small file, `key/recipes/<slug>.md`, that names one or more finished run briefs in order and adds only what the record lacks: a name, when to use it, the questions to ask again, and the check that proves it worked. The [Library](recipes.md) is where the dictionary's entries live. Your recipes is where your own runs of them live.

The Your recipes page shows each recipe with its steps, when you last ran it, and its line to run again or to export for sharing.

**How it runs today.** The page reads the files everywhere. Saving, running and exporting a recipe happen in Claude Code on your own computer, where the run briefs are. At Complete, a weekly offer suggests one finished run worth saving. It runs on your own computer when you ask, such as "Offer me a recipe", until your Foundation can run a routine on its own schedule.

**What you do by hand.** Name each recipe, say what to ask again, and approve each run.

## The bar

The world-class version is the recipe card a good kitchen keeps for its signature dish: the steps in order, the parts a cook adjusts by taste, and how to tell it came out right. Its test is the second time. When the owner says "run my recipe for adding a lead" for Customer care, the run asks only what differs, shows the plan, and the new lead answers for its department in a fresh conversation, just as the Sales lead did. A shared recipe carries the method and nothing of the business: no answers, no names, no facts. Every recipe on the page points at records that exist, and every step names an entry the dictionary still ships.

## Depth tiers

**Essentials.** The Your recipes page lists every recipe with its steps and its run and export lines. One request saves a finished run as a recipe, one runs a recipe again, and one exports it for sharing. `npm run recipes -- yours` prints the same.

Adds: the recipe format in the Key, one code file, the page, the word on the recipes command and their tests. No table.

**Complete.** Adds the weekly offer: one Inbox card a week naming a finished run worth saving, which on your yes becomes a recipe.

Adds: one routine file, its handler and its two card kinds. No table.

**Mastery.** Adds the recipe check, which names any recipe whose run brief is missing or whose entry the dictionary no longer ships, and says when an entry changed since the recipe was made. A finished [Department kit](department-kits.md) request is offered as one recipe.

Adds: `npm run recipes -- yours --check`, and the check inside `npm test`. No table.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run reads `key/runs/` for finished runs and reflects back what it found, such as "You have four finished runs. The one you might repeat is adding your Sales lead on October 6."

1. **Your first recipe.** "Which finished run would you do again, here or for another business?" The default is the newest finished install or modify. It becomes the first recipe, named in your words.
2. **What to ask again.** "Next time, which answers should I ask you again, and which should I reuse?" The default asks again every answer about the department, the names and what stays with you, and reuses the rest. Every consent and every question in a money, contract or people job is asked again whatever you choose. It becomes `## Asked again`.
3. **Your tools.** "Do you keep saved prompts or checklists you run again, such as a doc of steps or Claude Projects?" The default is none. Each one you name is listed in the receipt, matched to an entry or a finished run, as a recipe to make. Nothing is read without your yes.

At Complete, one more:

4. **When the offer arrives.** "Which day and time should a run worth saving reach your Inbox?" The default is Friday at 16:00, after the week's runs. It becomes the routine's `cron` line.

Everything from here on is the build plan your assistant follows.

## Parts

Installed in this order, before the entry. When a part is not installed yet, [install](../../runner/verbs/install.md) installs it first, as its own run, with its own `installed` row.

1. [Library](recipes.md) (`modules/agentic/recipes`): the catalog and the `npm run recipes` command.
2. At Complete, [Chief of staff](../../agents/chief-of-staff.md) (`agents/chief-of-staff`): the role that owns the weekly offer.

`uses` lists every part at any tier. A part marked At Complete installs only when the run's tier is Complete or deeper, and an upgrade to Complete installs it then.

## Crew

The system lead directs this entry when the owner has the Master Agent Library, and sends back any recipe that copies a record it could point at.

- **Run lead:** the stages, the plan and the gates, every commit, and in a recipe run, the order of its steps.
- **Business analyst:** the read, the questions and each recipe's Asked again.
- **Experience designer:** the list, each recipe's detail and every state, phone and laptop.
- **Copywriter:** each recipe's name and When to use, every label and line, in plain words.
- **Builder:** `src/lib/recipes/yours.ts`, the page, the command word and their tests, written test first.
- **Automation engineer:** at Complete, the routine, its handler and its two card kinds.
- **Security reviewer:** that an export carries no answer, name, fact or secret from the business.
- **Code reviewer:** that a recipe points at its run briefs and never copies them.
- **QA lead:** the proof.
- **Scribe:** the recipes list in `key/key.yaml`, the origin in `installed`, the run brief and the log.

The [build crew](build-crew.md) carries out every run of a recipe the same way it carried out the first, stage by stage.

## Data

No app and no table. A recipe is a file in the Key that points at records the Key already holds.

**Source of truth.** Each fact lives in one place:

- **What a run did, what was answered and how it was proven:** the run brief in `key/runs/`, never copied.
- **The tier and the entry's version when it ran:** the `installed` row in `key/key.yaml`.
- **The commit:** the build log entry in `key/log/`.
- **A recipe's name, when to use it, what is asked again and its check:** the recipe file, `key/recipes/<slug>.md`.
- **Which recipes the business has:** the `recipes` list in `key/key.yaml`, one row per recipe with its `slug` and `path`, as every other file in the Key is listed.
- **What an entry is today:** the entry's file in `ninja/`, read when a recipe runs, so a recipe always runs the current entry.
- **Each week's offer:** one card in the core table `inbox_items`, at Complete.

A recipe, the shape the copywriter writes, for Harbor Studio:

```markdown
---
name: Add a department lead
description: One more department lead with its plan, set up the way the Sales lead was.
runs: [runs/2026-10-06-modify-modules-agentic-department-leads.md]
made: 2026-10-09
---
# Add a department lead

## When to use
When another department needs a lead to hold its plan.

## Asked again
- Which department
- The lead's name
- What stays with you

## Check
The new lead answers for its department in a fresh conversation, as the first run's proof did.
```

- `runs` lists finished run briefs, in the order they run, each a path inside `key/` that exists and reached stage 10.
- A recipe shared in from another business has `steps` in place of `runs`: each step's `verb`, `entry` and `tier`. A recipe has one or the other, never both.
- `## Asked again` never needs to list the consents or a question in Finance, Sign contracts, Manage your team or Hire: those are always asked.
- No customer's name or record appears in a recipe, because the Key travels with the repository.

What the entry builds at Essentials:

- **Code:** `src/lib/recipes/yours.ts`, with `readRecipes(root)`, which reads the `recipes` list, each recipe file and each run brief it names, and returns each recipe's steps with their verb, entry, tier and date, when it last ran, and any problem; `saveRecipe`, which writes a recipe file and its row from a finished brief; and `exportRecipe`, which builds the shared form. Both doors call them.
- **The page:** `src/app/admin/(console)/agentic/[page]/RecipesPage.tsx`, passed as the page's `above` when the page is `your-recipes`.
- **The command word:** `src/lib/recipes/recipes-command.ts` gains `yours`, with `save`, `show` and `export`.
- **Tests:** `tests/unit/your-recipes.test.ts`, which builds a fixture Key with two finished briefs and one stopped at stage 6, saves a recipe from a finished one, refuses the stopped one, and checks that an export holds no line of any brief's `# Brief`, and `tests/e2e/your-recipes.spec.ts`, which signs in through the PIN gate and finds the recipe, at phone width and at desktop width.
- **Shared edits named in the plan:** `docs/standards/key.md` gains `key/recipes/`, its front matter and its three sections, and the `recipes` list, with `checkRecipe` in `src/lib/key/formats.ts`, called by `checkKeyFolder`, and `checkKeyYaml` checking each row names a file that exists, their tests written first. `src/lib/key/inventory.ts` lists recipes in `system.md`. The dictionary's [primer](../../foundation/primer.md) lists the same in its Key table. The `your-recipes` row in `src/lib/layout/sections.ts` changes its `state` from `soon` to `ready`.

## Screens and panels

**Your recipes** (`/admin/agentic/your-recipes`), the fourth page in the Recipes group of Agentic, keeps its title and its Open in line, and adds above it, with every state:

- **Your recipes.** One card per recipe, in the order of `key/key.yaml`: its name, When to use, its steps in plain words, such as "Modify Department leads, at Essentials", when it last ran, and two lines to copy or open: "Avery, run my recipe Add a department lead." and "Avery, export my recipe Add a department lead for sharing."
- **Shared with you.** Recipes with `steps` show "Shared in" and ask every question when run.
- **Ready to save.** Finished runs no recipe names, newest first, each with the line "Avery, save my <entry> run from <date> as a recipe."
- **Nothing yet.** "You have no recipes yet. When a run turns out the way you want, save it here and run it again in one line.", with the newest finished run's save line.
- **A problem.** A recipe whose brief is missing, or whose brief never finished, shows in place with the Copy line that repairs it. The rest of the page renders as normal.

At Complete, the card of a run offered this week is marked "Offered in your Inbox". At Mastery, a recipe whose entry changed since it was made says so, with the line that runs it once with you to refresh it.

Every Open in line waits for your Enter, as [Work with Claude](../../frameworks/work-with-claude.md) teaches.

## Routines and Inbox cards

At Complete, `key/routines/recipe-offer.md`, with `agent: chief-of-staff`, `category: system`, `rung: Drafts for approval` and a `cron` trigger, Friday at 16:00 by default. It declares its handler under `draft`, `src/lib/recipes/recipe-offer.ts`, with the steps `offer`, `apply`, `status` and `blocked`, and its card kinds:

- **Save this run as a recipe?** (`recipe-offer`, subcategory `modules`, `decide: approve`, `always_human: true`, so only the owner decides, `expires_days: 14`, `on_lapse: closes`): one finished install or modify from the last two weeks that no recipe names, with its entry, its date and the recipe it would make. Its run key, `recipe-offer:<brief file>`, means a run is offered once, ever.
- **The offer did not run** (`recipe-blocked`, subcategory `modules`, `decide: done`): an offer that stopped, with the step and the fix to try.

Its steps:

1. **Apply.** Run `npm run draft -- recipe-offer apply`, which saves a recipe through `saveRecipe` for every approved card, with Asked again set to question 2's default.
2. **Offer.** Run `npm run draft -- recipe-offer offer`, which writes at most one card a week.

When `apply` saved a recipe, the run asks the owner's yes to save it in history, staged by name, as "chore: recipes, <date>", and otherwise leaves it for the next run's Orient.

## Connections

Not part of this entry. A recipe's steps make their own connections, each through its entry, and an export is a file the owner sends themselves.

## Autopilot

**What runs on its own.** The page keeps itself current, read fresh on every load from the recipes and the run briefs. In a recipe run, the run lead carries each step to the next with no step from the owner but each plan's yes. At Complete, the offer reads the week's finished runs and brings one worth saving to the Inbox. At Mastery, `npm test` runs the recipe check.

**The trigger.** The page reads on every load. A recipe runs when the owner opens its line. The offer runs on its `cron` line, which waits on a routine runner, so until then the owner asks, "Offer me a recipe", on their own computer with the command center stopped.

**The rung.** Drafts for approval. The offer drafts a recipe and the owner decides, and every run of a recipe waits for its plan's yes.

**The next rung.** There is none above Drafts for approval for recipes. A recipe changes how the business installs, so saving one and running one stay the owner's yes at every rung.

**What stays with the owner.** Which runs become recipes, what each asks again, every run, every consent, every money, contract and people question, and whether to share an export and with whom.

## Proof

### Essentials

**Setup.** The Library is installed, and the Foundation has at least one finished run, such as the install of Department leads.

**The run.** Through Claude, the QA lead saves the owner's chosen run as a recipe, with the owner's answers to question 2, and checks the file against the brief: it names the brief, and holds no line of the brief's `# Brief`. Then the owner runs it again for a second department: "Avery, run my recipe Add a department lead." The run asks only the questions under Asked again and the consents, shows the plan, and on the owner's yes runs to its close with its own brief, `installed` row and proof. Then `npm run recipes -- yours export add-a-department-lead` prints the shared form, which the security reviewer reads line by line.

**The completion test.** All of these pass:

1. The recipe names its brief and copies none of it, and the page shows its steps read from that brief.
2. The second run asked every question under Asked again and every consent, and reused the rest, shown in its plan.
3. The export holds the steps, Asked again and Check, and no answer, name, business fact or secret.
4. `npm test` and `npm run e2e` pass, including `tests/unit/your-recipes.test.ts`, `tests/e2e/your-recipes.spec.ts` and the `checkRecipe` test.

### Complete

**The run.** The QA lead runs the offer on the owner's own Key, triggered by asking because the schedule waits on a routine runner, and the proof says so. The completion test: one card names a finished run no recipe names, approving it and running `apply` writes the recipe and its row, and running the offer again never offers the same run.

### Mastery

**The run.** In a fixture, the QA lead points a recipe at a brief that is missing and runs `npm run recipes -- yours --check`, which names the recipe and exits with a failure. The completion test: the check passes on the owner's real recipes, a recipe whose entry's version moved shows the refresh line without failing, and `npm test` fails on the fixture and passes once it is removed.

## Complete when

**Fitted.** passes when each recipe has the owner's name for it, and asks again exactly what the owner chose, plus every consent and owner-only question.

**Autopiloted.** passes when the page reads the recipes and briefs fresh, a recipe run carries itself from step to step, and from Complete the offer brings runs worth saving to the Inbox with no one starting it.

**Visible.** passes when Your recipes shows each recipe, Shared with you, Ready to save, Nothing yet and any problem, each with its empty state, on a phone and on a laptop.

**Connected.** passes when each recipe carries its run and export lines, each finished run carries its save line, and from Complete each offer reaches the owner as exactly one card.

**Recorded.** passes when each recipe has its row in the `recipes` list, the entry's `installed` row names its files and `code`, each run of a recipe has its own brief and log entry, and `system.md` lists the recipes.

**Tested.** passes when the tests in `tests/unit/your-recipes.test.ts` and `tests/e2e/your-recipes.spec.ts` and the `checkRecipe` test failed before the code that passes them existed, and `npm test` and `npm run e2e` pass.

**Proven.** passes when a real recipe, saved from the owner's own run, ran again to its close on the owner's yes.

**Coherent.** passes when both doors meet the same recipes: a recipe saved through Claude shows on the page at the next load, and the page and `npm run recipes -- yours` print the same steps.

**Reversible.** passes when remove takes out the page's list, the code, the command word, the routine and their tests, keeps every recipe file and row unless the owner says to delete them, leaves every run brief as it is, and `npm test` stays green.

**Explained.** passes when the owner can say in one sentence what a recipe is, such as "A recipe is a run I liked, saved so I can do it again or share it, asking me only what changes."

## Changing it

**What modify may change.**

| Change | File | What changes |
|---|---|---|
| A recipe's name or When to use | `key/recipes/<slug>.md` | `name`, `description` and `## When to use`. |
| What is asked again | `key/recipes/<slug>.md` | The lines under `## Asked again`. |
| A recipe's steps | `key/recipes/<slug>.md` | `runs`, in order, each a finished brief. |
| The offer's day or time | `key/routines/recipe-offer.md` | The `cron` line. |

**From the command line.** In Claude Code or Claude Desktop, inside your Foundation folder. Reading and saving recipes needs nothing stopped. The offer opens the local database, so stop the command center first:

- `npm run recipes -- yours` lists every recipe, Shared with you and Ready to save.
- `npm run recipes -- yours show <slug>` prints one recipe with each step's brief, tier and date.
- `npm run recipes -- yours save <brief>` saves a finished run as a recipe, with question 2's defaults.
- `npm run recipes -- yours export <slug>` prints the shared form for the owner to send.
- `npm run draft -- recipe-offer offer` and `apply`, at Complete.

A recipe is a file, so Claude edits it directly when the owner asks, such as "Ask me the lead's name again in my lead recipe", and `npm test` checks its shape.

**What upgrade adds, tier by tier.** Parts upgrade first, each in its own run. Then each file in the row's `files` and `code` is compared three ways, the original from the commit that added the entry's newest install or upgrade brief, and every line the owner wrote stays.

- **To Complete:** the routine, its handler `src/lib/recipes/recipe-offer.ts`, its two card kinds and question 4, with their tests.
- **To Mastery:** `yours.ts` gains `checkRecipes`, the command gains `--check`, the Key checker's test calls it, and the offer treats a finished kit request as one recipe, with their tests.

**What remove exports first.** Nothing, because every recipe is a file the owner keeps. Remove takes out the routine and its row, the handler, `yours.ts`, the page's list, the `yours` word and their tests, and sets the page back to coming soon. Every recipe file and its row stay unless the owner says to delete them.

## How it is done

**How a recipe runs.** The run lead reads the recipe through `readRecipes`, then runs each step in order, the way [the runner](../../runner/run.md) runs Install the Ninja framework: one run brief for the whole request, whose `# Brief` names the recipe and every step and which are done, each step a full run with its own plan, proof and work commit. Each step uses the entry as it is in `ninja/` today, at the tier the step names. Each answer in the original brief is reused and shown in the plan, except the questions under Asked again, which are asked fresh, and every consent and every question in Finance, Sign contracts, Manage your team or Hire, which are always asked. A step whose entry is already installed follows install's own rule and offers modify or upgrade.

**Why a recipe points and never copies.** The run brief is the record of what happened, and it never changes after its close. A recipe that copied it would be a second record, and the first time the owner edited the copy, nobody could say which run the recipe repeats.

**Why an export carries no answers.** Answers are the business's own words: its departments, its names, what it keeps for itself. A recipe shared with a friend's business carries the method, the steps and the check, and the other business answers every question for itself. Sending it is the owner's own act, by hand, and the Foundation sends nothing.

**The first run of this entry.** The part runs first. The plan, shown in plan mode, lists the Key format, the code, the page, the command word, the tests and the shared edits. After the owner's yes, tests come first and fail, then the code, the proof on the owner's own run, and one work commit with its log entry.

## Next

- Browse what you can install next, and what you already have, in the [Library](recipes.md).
- See the [build crew](build-crew.md) that carries out every run of a recipe, stage by stage.
- Save a finished [Department kit](department-kits.md) as one recipe for your next location.
- [Upgrade](../../runner/verbs/upgrade.md) to Complete, so a run worth keeping reaches your Inbox: "Upgrade Your recipes to Complete."
