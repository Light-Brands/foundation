# Remove

Remove takes an installed entry out cleanly. Its data is saved first, everything that depends on it is shown, and nothing goes without the owner's yes.

## What differs from the full runner

- **Dependents first.** At stage 3, list every installed entry that `uses` this one, and every routine or app automation that names its routines or its tables. The owner sees what will stop working before anything is planned.
- **Export first.** The entry's Changing it section says what remove exports. The first steps of the plan export that data to a file the owner keeps, inside the home folder, outside `key/` and never committed, because business records never go in the Key or the repository.
- **It needs a yes.** Plan approval, and then a separate yes to remove, asked plainly: "This takes <entry title> out of your business. Your data is saved in <file>. Shall I remove it?"
- **Code goes too.** After the data export, the plan lists every app file in the row's `code` for removal, and each goes only with the owner's yes to the plan and to the removal.
- **Tables are kept unless the owner says to drop them.** Dropping a table is a new migration. An applied migration is never edited.

## Stages

All ten. Stage 4 involves the roles that built the parts being taken out. Stage 9 proves the removal: the export opens and holds the records, and every check is still green without the entry.

## Questions

1. The questionnaire's first question. The entry must be in `installed`.
2. "Here is what depends on it: <list>. Shall we go ahead, or adjust those first?"
3. "Where would you like the export saved?" with a default inside the home folder.
4. "Shall I keep its tables in the database, or drop them?" with keeping them as the default.
5. The questionnaire's third and fourth questions.

## The close

The builders remove the files in the row's `files` and `code`. The scribe removes the entry's row from `installed` and its rows from the other lists in `key.yaml`. In a Foundation, the run lead runs `npm run key:sync`, makes the run's one work commit with the removal, the run brief, `key.yaml` and `key/knowledge/system.md`, then the build log entry with `Kind: change` and its `- Entry: <entry id>` line, in its own log-only commit. In a Ninja home, the scribe writes `key.yaml` directly and rebuilds the starter kit. The receipt names what was removed, where the export is, and what was kept. The next moves include a [check](check.md).

In a text only chat, ask the owner to paste `key.yaml` and every existing file before you change it, and return each file you create or change whole, one per message, as [the runner](../run.md) describes. `key.yaml` and the starter kit come back whole too.
