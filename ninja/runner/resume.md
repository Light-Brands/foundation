# Resuming a run

Every run that writes anything keeps a run brief, so a run that stops, for an hour or a week, picks up at the stage it reached. This page is part of [the runner](run.md).

## The run brief

In a Foundation, each run brief is one file in `key/runs/`:

```
key/runs/<YYYY-MM-DD>-<verb>-<entry with each / as ->.md
```

The date is the day the run started, in the business's time zone from the context block, or in UTC when none is set. Every `/` in the entry id becomes `-`, so installing `modules/sell/leads` on 6 October 2026 gives `key/runs/2026-10-06-install-modules-sell-leads.md`. The Foundation's Key checks hold every brief to this name and to the front matter below, and the format is in the Foundation's `docs/standards/key.md`.

The brief is drafted at stage 2 and written as the first write of the approved plan at stage 5, because nothing is written before the plan is approved. From then on it is updated as each stage starts. `learn` and `check` write nothing, so they keep no brief.

A Ninja home keeps the shape [its page](../foundation/ninja-home.md) defines, which has no runs folder. There the brief stays in the conversation as a block the owner can keep, and pasting it back resumes the run.

### Front matter

| Key | What it holds |
|---|---|
| `verb` | One of `install`, `modify`, `upgrade`, `check`, `remove`, `learn` or `weave` |
| `entry` | The entry id, such as `modules/sell/leads` |
| `tier` | `essentials`, `complete` or `mastery` |
| `stage` | The stage the run has reached, a whole number from 1 to 10 |
| `consents` | A mapping of `write`, `preview` and `messages`, each `true` for yes or `false` for no |
| `started` | The date the run started |
| `updated` | The date the brief last changed |

### Body

The body has five parts, each filled in as the run reaches it. It opens with `# Brief`, as the Foundation's example does, then four sections:

- `# Brief`: the request and the answers to the questionnaire, in the owner's words.
- `## Target`: what will exist when the run is done, from stage 3.
- `## Plan`: the approved plan, every step as a checkbox, ticked as it is done.
- `## Review notes`: each finding, how it was fixed, and anything the owner decided.
- `## Proof`: the item that went end to end and the completion test result.

### Example

```markdown
---
verb: install
entry: modules/sell/leads
tier: essentials
stage: 6
consents: {write: true, preview: true, messages: false}
started: 2026-10-06
updated: 2026-10-07
---
# Brief

Install Capture leads at Essentials, so every inquiry from the website lands in one list.

## Target

A lead form on the public contact page, a Leads list in Sales, and an Inbox card for each new lead.

## Plan

- [x] Write this brief.
- [x] Add the leads app definition and its first migration.
- [ ] Add the Leads list screen.
- [ ] Add the Inbox card for a new lead.
- [ ] Proof: send one inquiry through the form and see its card in the Inbox.

## Review notes

## Proof
```

The example shows the format only. Each module entry's own Target and Plan come from the entry and the business.

## Picking a run up again

When the owner says "continue the Capture leads install", or opens a new session in the middle of a run:

1. **Find the brief.** Look in `key/runs/` for the newest brief whose `verb` and `entry` match the request. Match the entry the same way the runner does: by id, title, or department and job. When two briefs match, ask which one, naming each by its entry and its start date. When none matches, say so and offer to start the run fresh.
2. **Orient again.** Run stage 1: the Key, the dictionary version and the environment may have changed since the run stopped. When the dictionary is newer than when the plan was approved, say so and offer to review the plan against the new version before going on.
3. **Confirm in one line.** "We stopped at stage <n>, <stage name>, with <what is done> done and <what is left> to go. Shall I carry on?"
4. **Check the plan against the folder.** Every ticked step should be on disk. A run makes its one work commit at the close, so until then its files are on disk and not yet committed, and that is expected. When the folder and the brief disagree, show the difference and ask the owner which is right before going on.
5. **Carry on at the recorded stage.** Skip every question the brief answers. The consents in the brief still hold for what they cover. Going live is always asked again, at the moment it would happen.
6. **Keep the brief current.** Set `updated` to today and move `stage` forward as each stage starts.

A brief whose `stage` is 10 is a finished run. Asking to continue it offers the next moves instead.

"Continue installing the Ninja framework" resumes the whole request of Prep, Home and Foundation. [The runner](run.md) says how it works out where the owner is from what exists.
