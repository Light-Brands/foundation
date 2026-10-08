# The build log

The build log is the monthly set of files in `key/log/`, one entry for each thing built. It stays in this repository (see `privacy.md`).

## Entry format

One file per month, named `key/log/<YYYY-MM>.md`. The file starts with one title line, `# Build log, <Month YYYY>`, such as `# Build log, October 2026`, then a blank line, which is what `npm run log:sync` writes when it starts a month. Entries are only added, newest last. Each entry:

```markdown
## 2026-10-05 14:02 · Booking reminders
- Kind: lesson | module | connection | setup | change
- Category: Delivery · Book appointments
- What changed: reminders go out 24 hours and 1 hour before each session
- Files: key/apps/booking/definition.yaml, key/routines/booking-reminders.md
- Commit: 3f2a91c
- Entry: routines/booking-reminders
- Checked: the reminder test passed on a real booking
- By: claude | member | light-brands
```

`Entry` is optional. It is the dictionary entry the work belongs to: a kind folder (`frameworks`, `blueprints`, `modules`, `agents`, `skills`, `routines` or `connections`), then one or two lowercase hyphenated names, joined by `/`, such as `routines/monday-brief` or `modules/sell/leads`. It follows the same rule as `entry` in the `installed` list of `key.yaml`. The Ninja framework runner writes it, and it sits right after the `Commit` line. Why: an upgrade can find the commit that installed the entry. A malformed entry id fails the format test.

Write the real value for `Kind` and for `By`, never the list. The heading is the date, the time, a middle dot and a short title. The date and time are always in UTC, in an entry you write by hand as in one `log:sync` writes, and the month file is the UTC month. Why: one clock for every entry keeps the log in order, and it matches the commit times `log:sync` reads.

## Rules

- **Add an entry for every work commit, in a log-only commit made right after it.** A Ninja framework run makes one work commit on its run branch, `run/<date>-<verb>-<entry with / as ->`, then one log-only commit, and goes live only by merging into `main` on the owner's yes. Work done by hand outside the runner adds an entry after each of its small work commits. Claude writes the entry, and every prompt ends with that step (see `prompts.md`). The entry's `Commit` is the work commit's id, never the log commit's. Why: an entry cannot hold the id of the commit that contains it, and the log is how the member, and the next session, learn what was built and how it was checked.
- **Write what was built and how it was checked.** Name the files and the commit. Why: an entry that cannot be verified is a story.
- **Never put customer details, business records or secrets in an entry.** No names of customers, no email addresses, no phone numbers. A format test (`checkLogText` in `src/lib/key/formats.ts`) fails on an email address or a phone number. Why: the log is documentation of the system, and the data stays in the database (see `privacy.md`).
- **Add entries only; never rewrite an old one.** Why: the log is the history, and a history that changes is not one.
- **Use `Kind` from `lesson`, `module`, `connection`, `setup` and `change`.** Use `By` from `claude`, `member` and `light-brands`. Why: the "What you have built" page and the system document read those words.
- **Run `npm run log:sync` when commits are missing from the log.** It reads only the commits after `provenance.base` in `key/key.yaml`, the commit setup ran on, and adds an entry for each one with no entry, skips bookkeeping commits, whose files all sit in `key/log/` or `key/runs/` (a log-only commit, or a run's closing `chore: close <brief>` commit), holds back a commit subject that fails the privacy check or names the workspace platform, and writes the time in UTC. When `base` is missing it says the build log starts after setup records its base, points at `npm run log:base`, and adds nothing. Why: a skipped step leaves no gap, and the template history from Light Brands is never the member's build.
- **Run `npm run log:base` once when `provenance.base` is missing.** It sets `base` in `key/key.yaml` to the current commit, prints what it did, and changes no other field, writing the file whole so no reader sees half of it. When `base` is already set it changes nothing and says so, and `npm run log:base -- --force` moves it to the current commit. Why: a Foundation set up before setup recorded its base needs a starting point for the log, and moving an existing one by accident would drop or repeat entries.
- **Run `npm run key:sync` before the work commit, and commit `key/knowledge/system.md` in it.** The order is the same for a run and for work done by hand: make the work, run `npm run key:sync`, make the work commit, then make the log-only commit. The sync rebuilds the inventory in the system document from `key.yaml` and writes nothing else, and a log entry never changes it. Why: a sync run after the commits leaves `system.md` changed with no commit to hold it. The inventory is the only part of the system document a machine owns, and the profile saves are the only writers of the context block (see `key.md`).

## The system document

`key/knowledge/system.md` is the plain-words record of what is running in each category, how each part works, which roles and skills it uses, and what changed recently. When the member connects a workspace later, this document goes with it as knowledge for that workspace. The build log does not. Both stay free of customer details.

- **Leave the inventory block to `npm run key:sync`.** It sits between `<!-- inventory:start -->` and `<!-- inventory:end -->` and is rebuilt from `key.yaml` with no judgment. Why: a hand edit there is lost on the next sync, and the sync is always right about what is listed.
- **Leave the Summary and Recent changes sections to `prompts/update-system-docs.md`.** Claude rewrites them from the log in the member's words at the end of every build session, and whenever the member asks what has been built. Why: a person writes prose, and the machine writes lists.
- **Show the system document in the app as "What you have built".** It sits in Settings, then Add capabilities, with the log beneath it. Why: the owner should read their own system without opening a file.
