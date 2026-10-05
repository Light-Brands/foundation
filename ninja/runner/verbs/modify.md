# Modify

Modify changes an installed entry so it fits how this business works. The changes are the owner's own, and they live in the Key.

## What differs from the full runner

- **The questions ask what to change.** The questionnaire's tier question is skipped, because the tier stays as installed.
- **The plan shows a diff.** For every file the run will change, the plan shows the owner's current file next to the change, in plain words and as a diff.
- **The entry's Changing it section sets the limits.** It says what modify may change. A change beyond that is offered as an [upgrade](upgrade.md) to a deeper tier, or as a different entry.
- **The origin stays.** The `installed` row keeps its `from` and its `tier`, because the dictionary version did not change. When the run adds a file the entry owns, the scribe adds it to the row's `files`, or to its `code` when it is an app file. A code file the modify changes stays listed in `code`, so a later upgrade still compares it.

## Stages

All ten. Stage 3 (Target) describes the entry as it will work after the change. Stage 4 (Crew design) involves only the roles whose slices the change touches.

## Questions

1. The questionnaire's first question, confirming the verb and the entry. The entry must be in `installed`. When it is not, offer to [install](install.md) it instead.
2. "What would you like it to do differently?" Then one follow-up question at a time, until the change is clear enough to plan.
3. The questionnaire's third and fourth questions.
4. Any of the entry's own questions the change reopens.

## The close

In a Foundation, the run lead commits the work, each work commit followed by its build log entry with `Kind: change` in its own log-only commit, then runs `npm run key:sync`. In a Ninja home, `key.yaml` and the starter kit are updated directly. The receipt says what now works differently. The next moves include a [check](check.md) when the change touched anything other entries use.

In a text only chat, ask the owner to paste `key.yaml` and every existing file before you change it, and return each file you create or change whole, one per message, as [the runner](../run.md) describes. `key.yaml` and the starter kit come back whole too.
