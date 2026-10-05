# Coding standards

These are the rules every builder follows in this repository, human or Claude. Each file is a short list of rules, and each rule carries the reason behind it.

- `stack.md`: versions, Next.js 16 specifics, and the npm scripts.
- `layout.md`: what each folder holds and what never goes there.
- `glossary.md`: one meaning for each word the project uses.
- `key.md`: the formats of the Key, with a complete example of each.
- `data.md`: where tables live, how migrations run, and how an app's data matches its definition.
- `security.md`: sessions, redirects, secrets, servers, limits and writes.
- `testing.md`: how tests are written and when they run.
- `copy.md`: the words and punctuation every screen, prompt and document uses.
- `prompts.md`: how member prompts are written.
- `commits.md`: how changes are committed and checked before a push.
- `log.md`: the build log and the system document.
- `privacy.md`: what stays in this repository and what is never written down.

## How to read and change them

- **Read the file for your topic before you change code in it.** Each file is short on purpose. Why: a rule you have not read cannot guide the change you are making.
- **Change a standard with a pull request that also changes the code or test that enforces it.** A rule with nothing behind it drifts from the code within weeks. Why: a standard and its enforcement have to move together or the standard stops being true.
- **Add a new standards file to this index and to the Standards section of `CLAUDE.md` in the same change.** A test fails when a file is missing from either place. Why: a standard nobody can find does not get followed.
