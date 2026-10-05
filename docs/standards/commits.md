# Commits

- **Make small commits, each with one purpose.** Why: a small commit is easy to review and easy to undo.
- **Stage files by name with `git add path/to/file`.** Never use `git add -A` or `git add .` without reviewing every change first. Why: it is how a stray file or a secret gets committed.
- **Run `git diff --cached --stat` in the same step as `git commit`.** Check that the files listed are the ones you meant. Why: another session can change the staging area between your `add` and your `commit`.
- **Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run e2e` before a push.** All five pass. Why: the push is the point where a mistake reaches the member.
- **Write the commit message to say why.** The first line says what changed, in plain words, and the lines after say the reason. Why: the diff already shows what, and only the message can say why.
- **Make one fix per review finding.** Name the finding in the message and add its test in the same commit. Why: a reviewer can then confirm each finding is closed by reading one commit.
- **Never commit `.env.local`, `.data/` or any secret.** Why: a secret in history stays in history (see `security.md`).
- **Record the build step in the build log in the same change as the work.** See `log.md`. Why: the log entry points at the commit, and a log that lags behind the work stops being trusted.
