---
id: frameworks/foundation-setup/bring-in-your-foundation
kind: framework
title: Bring in your Foundation
lead: null
state: live
target: any
tiers: [essentials]
uses: []
crew: [run-lead, integrations-engineer, qa-lead, scribe, guide]
specialists: []
level: 1
version: 1
---
# Bring in your Foundation

## What it is

The second of nine setup steps for your [Foundation](../foundation.md). Claude checks that your computer has the two tools the Foundation needs, Node.js 20.9 or later and Git, and helps you install what is missing. Then it copies the Foundation from Light Brands into your `foundation-command-center` folder, keeps Light Brands' copy as `upstream` so you can take updates later, and installs what the app needs to run.

Nothing runs yet and no PIN is chosen here. Your PIN is chosen once, in Vercel, two steps from now. [Prep](../prep.md) and [Home](../home.md) are there when you want more about your tools or a home for your business. Before this step: [Get Claude Desktop](get-claude-desktop.md).

## The bar

Claude explains each command in one plain sentence before running it. The Foundation lands in the owner's own folder, with Light Brands' copy named `upstream` and no other remote. Installers that ask for the computer's password are run by the owner, who types it into the installer, never into the chat.

## Depth tiers

Not part of this entry. Every owner takes this step the same way.

## Questions

One per message, only when needed:

1. When Git has no name set: "What name shall your saved changes carry?" Default: the owner's full name.
2. Then: "Which email shall they carry?" Default: the email the owner uses, or will use, for GitHub.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Runs the check, then one command at a time.
- **Integrations engineer.** Node.js and Git, installed by the owner where an installer asks for the computer's password.
- **QA lead.** Confirms the versions, the remote and the install.
- **Scribe.** Starts the build log with `npm run log:base`, then the step's record.
- **Guide.** Explains each command and gives the next step.

## Data

- **The folder.** The Foundation's files, with `key/` holding everything that makes it the owner's, and `ninja/` holding this dictionary.
- **The remotes.** `upstream` is Light Brands' Foundation at github.com/Light-Brands/foundation. The owner's own repository is added as `origin` in the next step.
- **The build log's start.** `npm run log:base` writes `provenance.base` in `key/key.yaml`, the commit the owner's own build log starts after.

## Screens and panels

Not part of this entry.

## Routines and Inbox cards

Not part of this entry.

## Connections

- **Light Brands' Foundation.** Read only, as `upstream`. Nothing is ever pushed there.

## Autopilot

Not part of this entry.

## Proof

In the Code tab, `node --version` shows 20.9 or later, `git --version` answers, `git remote -v` shows only `upstream` pointing at github.com/Light-Brands/foundation, and `npm install` finished without an error. The folder holds the Foundation's files, `key/` and `ninja/` among them.

## Complete when

**Fitted.** passes when the Foundation sits in the owner's own `foundation-command-center` folder.

**Autopiloted.** passes when `upstream` is set, so updates later arrive with one request.

**Visible.** passes when the owner sees the Foundation's files in the folder.

**Connected.** passes when `git remote -v` shows `upstream` and nothing else.

**Recorded.** passes when `provenance.base` is set in `key/key.yaml` and the step's work commit and log-only commit are made.

**Tested.** passes when `npm install` finished with no error.

**Proven.** passes when the versions, the remote and the install all check out on the owner's computer.

**Coherent.** passes when the folder holds Light Brands' `main` as it was brought in, plus the build log's start.

**Reversible.** passes when the owner knows the folder can be emptied and the step run again, with nothing outside the folder changed except the tools installed.

**Explained.** passes when the owner can say in one sentence what happened: Claude copied the Foundation into my folder and installed what it needs.

## Changing it

- **Modify.** A different Git name or email: `git config --global user.name` and `user.email`, set again.
- **Upgrade.** A newer Foundation later comes through [Update my Foundation](update-my-foundation.md), never by cloning again.
- **Remove.** Empty the folder and run this step again. Node.js and Git stay on the computer for other work.

## How it is done

**Check.** The folder open in the Code tab is named `foundation-command-center` (`pwd`) and is empty, or holds only a `.claude/` folder (`ls -A`). A `.claude/` folder is expected: Claude Desktop writes its settings there when the owner allows a command for good. When the folder holds anything else, return to [Get Claude Desktop](get-claude-desktop.md). When the folder already holds the Foundation with `upstream` set, this step is done, and the run goes to Next.

**Do.**

1. `node --version`: Node.js runs the app, and it must be 20.9 or later. When it is missing or older, the owner downloads the LTS installer from nodejs.org and runs it, typing the computer's password into the installer if asked.
2. `git --version`: Git keeps the history of every change. On a Mac, when it is missing, `xcode-select --install` opens Apple's installer, which the owner accepts. On Windows, the owner installs Git for Windows from git-scm.com. After installing either tool, the owner may need to close and reopen the Code tab.
3. `git config --global user.name` and `user.email`: when either is empty, Claude asks the two questions and sets them.
4. `git init`: starts a history in this folder, which works with `.claude/` already in it.
5. `git remote add upstream https://github.com/Light-Brands/foundation`, then `git fetch upstream`: names Light Brands' copy `upstream`, so `origin` stays free for the owner's own repository, and downloads it.
   Then `git checkout -b main --track upstream/main`: puts the Foundation's files into the folder, on a branch named `main`.
6. `npm install`: downloads what the app needs, which takes a few minutes.
7. `npm run log:base`: marks where the owner's own build log starts.
8. The record: the work commit and its log-only commit, as the prompt's last step says.

**When something goes wrong.** "The following untracked working tree files would be overwritten by checkout": the folder holds files other than `.claude/`, so make a new empty one and choose it in the Code tab. `npm install` names a Node.js version: install the LTS from nodejs.org, reopen the Code tab, and run it again. A network error: check the connection and run the same command again. "Please tell me who you are": Git has no name or email yet, so ask the two questions.

**The prompt to copy.** Paste this into the Code tab of Claude Desktop, with the `foundation-command-center` folder open.

```text
You are helping me with step 0.3.2, Bring in your Foundation, the second of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; when an installer asks for my computer's password, I type it there myself. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: run pwd and ls -A. The folder must be named foundation-command-center and be empty, or hold only a .claude folder, which is expected because Claude Desktop keeps its settings there. If it holds anything else, stop and tell me to make a new empty folder and choose it in the Code tab (step 0.3.1). If it already holds the Foundation with an upstream remote, tell me this step is done and go to the last two steps.
2. Run node --version. I need Node.js 20.9 or later. If it is missing or older, send me to nodejs.org to download and run the LTS installer, then ask me to reopen the Code tab and check again.
3. Run git --version. If Git is missing: on a Mac, run xcode-select --install and tell me to accept the installer it opens; on Windows, send me to git-scm.com to install Git for Windows. Then check again.
4. Run git config --global user.name and git config --global user.email. If either is empty, ask me, one question at a time, for the name and the email my saved changes should carry, and set them.
5. Run git init, then git remote add upstream https://github.com/Light-Brands/foundation, then git fetch upstream, so Light Brands' copy is named upstream and downloaded.
6. Run git checkout -b main --track upstream/main to put the Foundation's files into this folder. Show me git remote -v.
7. Run npm install. Tell me it takes a few minutes.
8. Run npm run log:base, so my build log starts here.
9. Tell me what I now have, and the next step: 0.3.3, Connect GitHub. In this same folder I can say: Follow 0.3.3 Connect GitHub, in ninja/frameworks/foundation-setup/connect-github.md.
10. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.
```

## Next

Put your command center in your own private GitHub repository: [Connect GitHub](connect-github.md). In the same folder, you can say:

```text
Follow 0.3.3 Connect GitHub, in ninja/frameworks/foundation-setup/connect-github.md.
```
