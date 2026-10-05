# The build log

The build log is the monthly set of files in `key/log/`, one entry for each thing built. It stays in this repository (see `privacy.md`).

## Entry format

One file per month, named `key/log/<YYYY-MM>.md`. Entries are only added, newest last. Each entry:

```markdown
## 2026-10-05 14:02 · Booking reminders
- Kind: lesson | module | connection | setup | change
- Category: Deliver · Booking
- What changed: reminders go out 24 hours and 1 hour before each session
- Files: key/apps/booking/definition.yaml, key/workflows/booking-reminders.md
- Commit: 3f2a91c
- Checked: the reminder test passed on a real booking
- By: claude | member | light-brands
```

Write the real value for `Kind` and for `By`, never the list. The heading is the date, the time (UTC when `log:sync` writes it), a middle dot and a short title.

## Rules

- **Add an entry after every build step, in a log-only commit made right after the work commit.** Claude writes it, and every prompt ends with that step (see `prompts.md`). The entry's `Commit` is the work commit's id, never the log commit's. Why: an entry cannot hold the id of the commit that contains it, and the log is how the member, and the next session, learn what was built and how it was checked.
- **Write what was built and how it was checked.** Name the files and the commit. Why: an entry that cannot be verified is a story.
- **Never put customer details, business records or secrets in an entry.** No names of customers, no email addresses, no phone numbers. A format test (`checkLogText` in `src/lib/key/formats.ts`) fails on an email address or a phone number. Why: the log is documentation of the system, and the data stays in the database (see `privacy.md`).
- **Add entries only; never rewrite an old one.** Why: the log is the history, and a history that changes is not one.
- **Use `Kind` from `lesson`, `module`, `connection`, `setup` and `change`.** Use `By` from `claude`, `member` and `light-brands`. Why: the "What you have built" page and the system document read those words.
- **Run `npm run log:sync` when commits are missing from the log.** It adds an entry for each recent commit with no entry, skips commits that only touch the log, holds back a commit subject that fails the privacy check or names the workspace platform, and writes the time in UTC. Why: a skipped step leaves no gap.
- **Run `npm run key:sync` after you add an entry or change the Key.** It rebuilds the inventory in the system document from `key.yaml` and writes nothing else. Why: the inventory is the only part of the system document a machine owns, and the Settings save is the only writer of the context block (see `key.md`).

## The system document

`key/knowledge/system.md` is the plain-words record of what is running in each category, how each part works, which roles and skills it uses, and what changed recently. When the member connects a workspace later, this document goes with it as knowledge for that workspace. The build log does not. Both stay free of customer details.

- **Leave the inventory block to `npm run key:sync`.** It sits between `<!-- inventory:start -->` and `<!-- inventory:end -->` and is rebuilt from `key.yaml` with no judgment. Why: a hand edit there is lost on the next sync, and the sync is always right about what is listed.
- **Leave the Summary and Recent changes sections to `prompts/update-system-docs.md`.** Claude rewrites them from the log in the member's words at the end of every build session, and whenever the member asks what has been built. Why: a person writes prose, and the machine writes lists.
- **Show the system document in the app as "What you have built".** It sits in System, Modules, with the log beneath it. Why: the owner should read their own system without opening a file.
