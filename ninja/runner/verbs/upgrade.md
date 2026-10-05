# Upgrade

Upgrade moves an installed entry to a newer version of the dictionary, to a deeper tier, or both. It keeps every change the owner made.

## What differs from the full runner

- **The questions ask where to go.** The newer version, the deeper tier, or both.
- **Stage 4 adds the three-way comparison** below, for every file the entry put in place, in the Key and in the app.
- **The plan shows the comparison.** Every change only the dictionary made, every edit of the owner's that is kept, and every conflict.
- **Conflicts go to the owner as a choice,** one at a time, before the plan is approved.

## The installed block

Every entry installed from the dictionary is recorded in `key.yaml`, under `installed`:

```yaml
installed:
  - entry: agents/client-care-lead
    from: dictionary@1.2.0
    tier: complete
    files: [agents/client-care-lead/charter.md]
    installed: 2026-10-05
```

- `entry`: the entry id, a kind folder and a name.
- `from`: the dictionary version the entry came from, written `dictionary@` and the version.
- `tier`: `essentials`, `complete` or `mastery`.
- `files`: every file the entry put in place, as paths relative to `key/` in a Foundation, or to the home folder in a Ninja home. A home path is the same path under `key/`, so the row stays right when the home moves into a Foundation.
- `code`: in a Foundation, every app file the entry created, as paths relative to the repository root, under `src/` or `modules/`, with no `..`, no leading `/` and no backslash. A Ninja home has no app, so its rows carry no `code`.
- `installed`: the date.

A module row in a Foundation carries both:

```yaml
installed:
  - entry: modules/sell/leads
    from: dictionary@1.0.0
    tier: essentials
    files: [apps/leads/definition.yaml, apps/leads/migrations/0001_leads_init.sql]
    code: [modules/sell/leads/module.ts, modules/sell/leads/ui/page.tsx]
    installed: 2026-10-06
```

The paths show the shape only. Module code lives in `modules/<department id>/<job id>/` (`module.ts` and `ui/`), as the Foundation's `modules/README.md` describes. Each entry names its own files.

In a Foundation, the Key checker validates this block, and names any file listed in `files` or `code` that is missing. In a Ninja home, the block is in the home's own `key.yaml`, and the runner reads it directly.

## The three-way comparison

For each file in `files` and each file in `code`, compare three versions. Code files are compared exactly like Key files:

1. **The original:** the file as it stood at the last work commit that installed or upgraded this entry. In a Foundation, find that commit through the build log: every log entry for a run carries a line `- Entry: <entry id>`, and the newest install or upgrade entry with this entry's id names the work commit. For logs written before that line existed, the commit is the one that last changed this entry's row in `key.yaml`, found with `git log -- key/key.yaml`. `git show <commit>:<path>` gives the file. In a Ninja home without git, the original is the published version of the entry that the row's `from` names, as [the runner](../run.md) describes.
2. **The owner's file:** the file as it is in the Key or the app today.
3. **The new version:** for a Key file, what the entry at the new version and tier says to write, filled with this business's answers. For a code file, what the builder produces from the entry at the new tier.

**Migrations are never compared.** An applied migration is never edited. A new tier adds new migrations, listed in the plan like any new file, and the migrations already in `files` stay exactly as they are.

Then, part by part:

- **Only the dictionary changed it** (the owner's file matches the original, the new version differs): apply the new version.
- **Only the owner changed it** (the new version matches the original, the owner's file differs): keep the owner's file.
- **Both changed the same part:** the owner chooses. Show both in plain words and offer three answers: keep yours, take the new version, or a merge of the two that the crew drafts and shows before anything is written.

A deeper tier adds the parts its tier lists in the entry's Depth tiers section. New files are listed in the plan like any install.

**The entries it uses come first.** When the entry names other entries in `uses` (a routine, the role that runs it and the skill it runs, for example), upgrade each of those to the entry's tier first, as its own run with its own `installed` row, then the entry itself. They are one request, so the tier, anything else at the same time and each consent are asked once and hold for every run, as [the runner](../run.md) describes. A file belongs to exactly one row, so each entry's upgrade compares and records only its own files. Name the order in the plan.

**A part that moves into its own row.** A newer version can move a file out of an entry into a part of its own. A Monday brief installed from dictionary 0.1.0, for example, lists the chief of staff's charter in the routine's row, and from 0.1.1 the charter belongs to the `agents/chief-of-staff` entry. That part is already in place, so its run is an upgrade. The part's run takes the file into its own new row, compares it three ways like any file, and records the row with the new version and tier. The entry's run then drops the file from its own row. Its original is found the same way, through the commit that installed the entry that listed it.

## Stages

All ten.

## Questions

1. The questionnaire's first question. The entry must be in `installed`, in its own row, or as files inside the row of an entry that uses it, as described above. When it is in neither, offer to [install](install.md) it.
2. "Would you like the newest version, a deeper tier, or both?" with a default: the newest version at the current tier. Explain what the newer version or the deeper tier adds, from the entry's Changing it section. The dictionary in a folder holds one version, so when the row's `from` is older than it, a deeper tier comes with the newer version: offer the newest version, or both, and say why.
3. The questionnaire's third and fourth questions.
4. Each conflict from the comparison, one per message.
5. Any of the entry's own questions the deeper tier adds.

## The close

The scribe updates the entry's row in `installed`: `from` becomes the new dictionary version, `tier` the chosen tier, `files` and `code` every file the entry now has in place, and `installed` today's date.

- **In a Foundation,** the run lead runs `npm run key:sync`, then makes the run's one work commit: the upgraded Key and code files, any new migrations, the run brief, the updated `installed` row and `key/knowledge/system.md`. Then the build log entry with `Kind: change` and its `- Entry: <entry id>` line, in its own log-only commit after it.
- **In a Ninja home,** there is no npm, no `key:sync` and no git required. The scribe writes `key.yaml` directly, adds a `runs` row when a task ran and passed its check, and rebuilds the starter kit.

In a text only chat, ask the owner to paste `key.yaml` and every existing file before you change it, and return each file you create or change whole, one per message, as [the runner](../run.md) describes. `key.yaml` and the starter kit come back whole too.

The receipt names what the dictionary changed, what of the owner's was kept, and how each conflict was settled.

## Upgrading the dictionary itself

When the version check at stage 1 finds a newer dictionary on lb-share, the runner offers it as its own step: it says what changes, and that the new dictionary arrives as an update from Light Brands for the owner to accept. Until it lands, the run continues on the local copy, and nothing is written for it. The update replaces the dictionary in `ninja/` only. It never touches the Key.
