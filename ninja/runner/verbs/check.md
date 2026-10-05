# Check

Check says where the business stands and what is ready to go further: what is working, what is current, and what is within the rules. It always ends with a ranked list of next moves.

## What differs from the full runner

- **Read only.** Check writes nothing in the Key, changes no code, keeps no run brief and never commits, so the questionnaire's consent question is skipped. When Orient finds changes setup or a Preferences save left uncommitted, check names them in its read and offers the setup commit as a next move. Run branches not yet in `main` are named the same way, with going live as a next move.
- **It stops after stage 3.** Stage 3 holds every installed entry in scope against its bar.

## Stages

1. **Orient,** in full, including the dictionary version check, and making no commit.
2. **Questionnaire,** the first question only: the whole business, one department, or one entry. "Check my system" means the whole business.
3. **Target.** For each installed entry in scope, the [run lead](../../crew/run-lead.md) and the reviewers read and report:
   - **Working.** In a Foundation, `npm test` reads every file in `key/` and runs the Key checks. In a Ninja home there is no npm: read `key.yaml` directly and check the shape [the Ninja home](../../foundation/ninja-home.md) defines. In both, every file `key.yaml` names is on disk, including each row's `files` and `code` in `installed`.
   - **Current.** For each row in `installed`, compare the row's `version` with the `version` in the entry's front matter in the current dictionary. A larger number in the dictionary means a newer version of the entry, for its Key files and its code files alike. A row written before rows carried `version` is current when its `from` names the current dictionary version.
   - **Within the rules.** Anything that breaks [the rules](../../foundation/rules.md), such as customer details in the build log or the system document.
   - **Fit.** Whether the entry still fits the business as the context block describes it today.

## Questions

Only the scope, and only when the request does not already say it.

## The close

The [guide](../../crew/guide.md) gives the read in plain words, department by department, then the next moves, ranked:

1. Anything broken, with the fix as a run, such as "Modify my Monday brief".
2. Anything outside the rules.
3. Upgrades available, newest first.
4. The next jobs to build, from the installed entries' Next sections and from the departments with nothing built yet, revenue first: Sales, Marketing, Delivery, Customer care, Finance, then the rest.

Each next move is one sentence the owner can say back to start it.
