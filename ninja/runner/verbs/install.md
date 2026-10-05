# Install

Install adds an entry where it is not yet. It is the full flow: all ten stages of [the runner](../run.md), with nothing left out.

## What differs from the full runner

Nothing. Install is the runner as written. The other verbs are described by how they differ from it.

## Before stage 1 ends

Look in `key.yaml` under `installed` for the entry. When it is already installed, say so in one line and offer the verb that fits: [modify](modify.md) to change it, [upgrade](upgrade.md) to take it to a newer version or a deeper tier, or [check](check.md) to see how it is doing.

When the entry `uses` other entries that are not installed yet, say which ones, and offer to install them first, in order, each as its own run. An install never builds a part it depends on silently.

## Stages

All ten, from Orient to Close.

## Questions

[The questionnaire](../questionnaire.md), all five, then the entry's own questions.

## The close

- The scribe adds a row to `installed` in `key.yaml`: `entry`, `from` (the dictionary version, such as `dictionary@0.1.0`), `tier`, `files` (every file the entry put in place in the Key, as paths relative to `key/`), `code` (every app file the entry created, as paths relative to the repository root, under `src/` or `modules/`, with no `..`, no leading `/` and no backslash) and `installed` (today's date). An entry that created no app code leaves `code` out. This row is what lets [upgrade](upgrade.md) keep the owner's own edits later.
- The entry's roles, skills, routines and apps are added to the matching lists in `key.yaml`.
- In a Foundation, the build log entry's `Kind` is `module` for a module, `connection` for a connection, `setup` for a framework, and `change` for everything else.
- The receipt names the entry, the tier and what it costs to run, or "no running cost" for an entry that has none, such as Prep or Home. The next moves come from the entry's Next section.

In a Ninja home, the close follows [the Ninja home](../../foundation/ninja-home.md), writing `key.yaml` directly: new rows in `roster` or `skills`, an `installed` row with `files` as paths relative to the home folder, a `runs` row for a task that ran and passed its check, and the starter kit rebuilt. A home without git keeps no build log, so those rows are the record.

In a text only chat, ask the owner to paste `key.yaml` and every existing file before you change it, and return each file you create or change whole, one per message, as [the runner](../run.md) describes. `key.yaml` and the starter kit come back whole too.
