# Modify

Modify changes an installed entry so it fits how this business works. The changes are the owner's own, and they live in the Key.

## What differs from the full runner

- **The questions ask what to change.** The questionnaire's tier question is skipped, because the tier stays as installed.
- **The plan shows a diff.** For every file the run will change, the plan shows the owner's current file next to the change, in plain words and as a diff.
- **Modify works on the installed version.** The row's `from` and `tier` say which version of the entry is in place, and that version's Changing it section sets the limits: what modify may change. Read the entry at that version the way [the runner](../run.md) describes, from git history in a Foundation. A Ninja home keeps no history, so there the entry as published sets the limits. A change beyond that is offered as an [upgrade](upgrade.md) to a deeper tier, or as a different entry.
- **A newer dictionary is named, then left for later.** Compare the row's `from` with `ninja/VERSION`. When the dictionary is newer, say so in one line, carry on with the modify on the installed version, and offer the upgrade as the next move.
- **What names the change changes with it.** When the change alters something another file names in plain words, such as a schedule the charter of the role that runs it names, that line changes in the same run, and the plan lists the file.
- **The origin stays.** The `installed` row keeps its `from` and its `tier`, because modify moves the entry to no other version. When the run adds a file the entry owns, the scribe adds it to the row's `files`, or to its `code` when it is an app file. A code file the modify changes stays listed in `code`, so a later upgrade still compares it.

## Stages

All ten. Stage 3 (Target) describes the entry as it will work after the change. Stage 4 (Crew design) involves only the roles whose slices the change touches.

**The proof.** The entry's Proof section at the installed version. When that proof needs a tool the installed version does not have, the proof is the installed routine's own Check, run as it stands, with the changed file showing what the owner asked for and `npm test` passing.

## Questions

1. The questionnaire's first question, confirming the verb and the entry. The entry must be in `installed`. When it is not, offer to [install](install.md) it instead.
2. "What would you like it to do differently?" Then one follow-up question at a time, until the change is clear enough to plan.
3. The questionnaire's third and fourth questions.
4. Any of the entry's own questions the change reopens.

## The close

In a Foundation, once the stage 8 checks pass, the run lead runs `npm run key:sync`, then makes the run's one work commit on the run branch with the changed files, the run brief, any change to the `installed` row and `key/knowledge/system.md`, then its build log entry with `Kind: change` and its `- Entry: <entry id>` line, in its own log-only commit. Going live waits for the owner's yes at stage 10. A later upgrade never takes this commit as its original, because the original comes from an install or upgrade brief, never a modify brief. In a Ninja home, `key.yaml` and the starter kit are updated directly. The receipt says what now works differently. The next moves include a [check](check.md) when the change touched anything other entries use.

In a text only chat, ask the owner to paste `key.yaml` and every existing file before you change it, and return each file you create or change whole, one per message, as [the runner](../run.md) describes. `key.yaml` and the starter kit come back whole too.
