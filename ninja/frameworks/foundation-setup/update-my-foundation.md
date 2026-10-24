---
id: frameworks/foundation-setup/update-my-foundation
kind: framework
title: Update my Foundation
lead: null
state: live
target: any
tiers: [essentials]
uses: []
crew: [run-lead, integrations-engineer, code-reviewer, qa-lead, release-engineer, scribe, guide]
specialists: []
level: 1
version: 1
---
# Update my Foundation

## What it is

The eighth of nine steps for your [Foundation](../foundation.md), one you take any time after it is live. Light Brands keeps improving the Foundation. This step brings those improvements into your own copy and keeps everything that is yours: your Key in `key/`, your settings files, and every file you added. Claude shows you what changed in plain words, works through any place where our change meets yours with you, and puts it live only when you say yes.

[Prep](../prep.md) and [Home](../home.md) are there for more. Any time after [Go live](go-live.md).

## The bar

Nothing of the owner's is overwritten: `key/` stays exactly as the owner had it, and `key/key.yaml`, `key/knowledge/context-block.yaml`, `key/knowledge/system.md` and the entries in `key/log/` are never replaced by Light Brands' versions, `.env*` files are never touched, and files only the owner added stay. Every conflict is explained in plain words and settled with the owner before anything is saved. The push, which puts the update live, happens only on the owner's yes.

## Depth tiers

Not part of this entry. Every owner takes this step the same way.

## Questions

One per message, only when needed:

1. When the folder holds unsaved changes: "You have changes that are not saved yet. Shall I save them first, as their own commit?" Default: yes.
2. For each conflict: what Light Brands changed, what the owner changed, and "Which shall we keep, or shall I combine them?" Default: the owner's version.
3. When Light Brands changed a Key file the owner never changed: "Light Brands changed <file> in the Key, and you have not changed it. Shall I bring in their version?" Default: no. A file both sides changed is explained side by side first, and only the owner's version is kept unless they ask for a careful combination by hand. `key/key.yaml`, `key/knowledge/context-block.yaml`, `key/knowledge/system.md` and the entries in `key/log/` are never offered.
4. At the end: "Shall I push? Pushing puts the update live." Default: none; the owner says yes or no.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Holds the order: check, fetch, show, merge, settle, test, record, push on yes.
- **Integrations engineer.** The `upstream` remote and the fetch.
- **Code reviewer.** Reads each conflict and explains both sides plainly.
- **QA lead.** `npm install` and `npm test` before anything is saved.
- **Release engineer.** The push, and the deploy it starts.
- **Scribe.** The merge as the work commit, and its log-only commit.
- **Guide.** Says what changed and what it gives the business.

## Data

- **Kept as it is.** `key/`, every `.env*` file, and files only the owner added.
- **Brought in.** Light Brands' changes to the app, the prompts and the `ninja/` dictionary, from `upstream/main`.

## Screens and panels

Not part of this entry.

## Routines and Inbox cards

Not part of this entry.

## Connections

- **Light Brands' Foundation.** `upstream`, read only.
- **The owner's repository.** `origin`, where the push goes, which deploys on Vercel.

## Autopilot

The push deploys the update on its own, because the project is connected to the owner's repository.

## Proof

`git log -1` shows the merge, `npm test` passed, the push finished, the newest deployment in `vercel ls` is Ready, and on the live address the owner's PIN opens the command center with their business profile and Inbox as they were.

## Complete when

**Fitted.** passes when the owner's Key, settings and own files are exactly as they were.

**Autopiloted.** passes when the push alone puts the update live.

**Visible.** passes when the owner heard, in plain words, what the update changes.

**Connected.** passes when `upstream` and `origin` are both in place and the push reached `origin`.

**Recorded.** passes when the merge is the work commit and its log-only commit follows it.

**Tested.** passes when `npm test` passes before the push.

**Proven.** passes when the live site opens with the owner's PIN and their data after the deploy.

**Coherent.** passes when what is live is what the owner's repository holds.

**Reversible.** passes when the owner knows the merge can be undone with a revert commit, on their yes.

**Explained.** passes when the owner can say in one sentence what the update gave them.

## Changing it

- **Modify.** A change the owner turned down, such as one in `key/`, can be brought in later by asking.
- **Upgrade.** Take this step again whenever Light Brands says a new Foundation is out.
- **Remove.** An update is undone with `git revert` of the merge, on the owner's yes, then a push.

## How it is done

**Check.** `git remote -v` shows `origin` as the owner's repository and `upstream` as Light-Brands/foundation. When `upstream` is missing, `git remote add upstream https://github.com/Light-Brands/foundation`. When `origin` is missing, return to [Connect GitHub](connect-github.md). `git status` shows no unsaved changes, or they are saved first on the owner's yes. The branch is `main`.

**Do.**

1. `git fetch upstream`: downloads Light Brands' newest Foundation without changing anything yet.
2. `git log --oneline HEAD..upstream/main`: lists what is new. Claude says it in plain words. When nothing is new, the Foundation is up to date and the step ends.
3. `git merge --no-ff --no-commit upstream/main`: brings the changes in without saving them yet, so they can be checked first.
4. `git restore --source=HEAD --staged --worktree -- key/`: keeps the owner's Key exactly as it was. `git diff --name-only HEAD...upstream/main -- key/`, with three dots, names only the Key files Light Brands changed since the owner's copy was made, and `git diff --name-only upstream/main...HEAD -- key/` names the ones the owner changed. `key/key.yaml`, `key/knowledge/context-block.yaml`, `key/knowledge/system.md` and the entries in `key/log/` always stay the owner's and are never offered. A file only Light Brands changed is offered, and on the owner's yes comes in with `git checkout upstream/main -- <file>`. A file both sides changed is explained side by side, from `git diff HEAD...upstream/main -- <file>` and `git diff upstream/main...HEAD -- <file>`, and stays the owner's unless they ask Claude to combine the two by hand, keeping every line of theirs.
5. **Conflicts.** `git status` lists any file both sides changed. For each, Claude explains what Light Brands changed and what the owner changed, then settles it with the owner.
6. `npm install`, then `npm test`: brings in any new dependencies and confirms everything still passes.
7. **The record.** `npm run key:sync`, then the merge saved as the work commit with `key/knowledge/system.md` in it, then the log-only commit.
8. **Push, on yes.** Claude asks, and on yes runs `git push`, which puts the update live. `vercel ls` shows the deployment Ready.

**When something goes wrong.** "Your local changes would be overwritten": unsaved changes are in the way, so save them first as their own commit. A conflict the owner is unsure about: keep the owner's version, and note it to ask Light Brands. `npm test` fails: Claude reads the real failure and explains it; often a Key file needs a field the new version expects, which is brought in on the owner's yes. The push is rejected: `git pull --no-rebase origin main`, then push again. To stop part way: `git merge --abort` puts everything back as it was.

**The prompt to copy.** Paste this into the Code tab of Claude Desktop, with the `foundation-command-center` folder open.

```text
You are helping me with step 0.3.8, Update my Foundation, one of the nine steps for my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one. Never overwrite my key/ folder, any .env file, or any file only I added. Never push without my yes. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: run git remote -v. origin must be my own repository and upstream must be github.com/Light-Brands/foundation. If upstream is missing, run git remote add upstream https://github.com/Light-Brands/foundation. If origin is missing, stop and tell me to go back to 0.3.3, Connect GitHub. Run git status and git branch --show-current: I should be on main. If I have unsaved changes, ask whether to save them first as their own commit.
2. Run git fetch upstream, then git log --oneline HEAD..upstream/main, and tell me in plain words what is new. If nothing is new, tell me my Foundation is up to date and stop.
3. Run git merge --no-ff --no-commit upstream/main, so nothing is saved until we have checked it.
4. Run git restore --source=HEAD --staged --worktree -- key/ so my Key stays exactly as it was. Then run git diff --name-only HEAD...upstream/main -- key/ (three dots) to list only the Key files Light Brands changed, and git diff --name-only upstream/main...HEAD -- key/ to list the ones I changed. Never offer to replace key/key.yaml, key/knowledge/context-block.yaml, key/knowledge/system.md or anything in key/log/: those stay mine. For each other file Light Brands changed, one at a time: if I never changed it, tell me what their change does and ask whether to bring it in, and only on my yes run git checkout upstream/main -- <that file>. If we both changed it, show me both sides in plain words first, from git diff HEAD...upstream/main -- <that file> and git diff upstream/main...HEAD -- <that file>; my version stays unless I ask you to combine them by hand, keeping every line of mine.
5. Run git status. For each file both sides changed, tell me in plain words what Light Brands changed and what I changed, and ask me which to keep or whether to combine them. My version is the default. If I want to stop, run git merge --abort.
6. Run npm install, then npm test. If a test fails, explain it plainly and fix it with me before going on.
7. Tell me what this update gives my business, in a few plain sentences.
8. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. The merge is the work commit. Then ask me: Shall I push? Pushing puts the update live. Only on my yes, run git push, then vercel ls until the newest deployment is Ready, and ask me to open my live address and sign in with my PIN.
```

## Next

Put your command center on an address of your own, such as command.yourbusiness.com: [Put it on my own domain](own-domain.md). In the same folder, you can say:

```text
Follow 0.3.9 Put it on my own domain, in ninja/frameworks/foundation-setup/own-domain.md.
```
