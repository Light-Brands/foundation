---
id: frameworks/foundation-setup/connect-github
kind: framework
title: Connect GitHub
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
# Connect GitHub

## What it is

The third of nine setup steps for your [Foundation](../foundation.md). GitHub keeps your command center's history safe online, in your own private repository named `foundation-command-center`. You sign in to GitHub once from your own Terminal window, then Claude creates the repository in your account and puts your Foundation in it. From here, `origin` is yours and `upstream` is Light Brands'.

[Prep](../prep.md) explains GitHub at more length, and [Home](../home.md) builds a home that moves in later. Before this step: [Bring in your Foundation](bring-in-your-foundation.md).

## The bar

The repository is the owner's own and private. The GitHub sign in happens in the owner's own Terminal window and browser, because it asks questions and shows a one time code that belong there, never in the chat. When the name is taken in the owner's account, Claude offers `foundation-command-center-2` and says so plainly.

## Depth tiers

Not part of this entry. Every owner takes this step the same way.

## Questions

One per message, only when needed:

1. "Do you have a GitHub account?" Default: no, and the owner creates one at github.com in their browser first.
2. When `foundation-command-center` already exists in their account: "That name is taken in your GitHub account. Shall I use foundation-command-center-2?" Default: yes.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Runs the check and holds the order: sign in, then the repository.
- **Integrations engineer.** The GitHub CLI, the sign in in the owner's own Terminal window, and the repository.
- **QA lead.** Confirms the repository is private and that both remotes are right.
- **Scribe.** The step's record.
- **Guide.** Opens the Terminal window with the owner and gives the next step.

## Data

- **The remotes.** `origin` is `github.com/<their account>/foundation-command-center`, private. `upstream` stays Light Brands' Foundation.

## Screens and panels

Not part of this entry.

## Routines and Inbox cards

Not part of this entry.

## Connections

- **GitHub.** The owner's own account, signed in with `gh auth login` in their own Terminal window and finished in their browser. The GitHub CLI is the tool Claude uses from here to work with their repository.

## Autopilot

Not part of this entry.

## Proof

`git remote -v` shows `origin` pointing at the owner's own `foundation-command-center` and `upstream` at Light-Brands/foundation. On github.com the repository opens under the owner's account, marked Private, with the Foundation's files in it.

## Complete when

**Fitted.** passes when the repository sits in the owner's own account under the agreed name.

**Autopiloted.** passes when the GitHub CLI stays signed in, so later steps push without another sign in.

**Visible.** passes when the owner opens the repository on github.com and sees the Private label.

**Connected.** passes when `gh auth status` shows the owner's account and `origin` is theirs.

**Recorded.** passes when the Foundation's history and the build log are in the repository on GitHub.

**Tested.** passes when the push finished with no error.

**Proven.** passes when the owner sees their own files on GitHub, under their own account.

**Coherent.** passes when `origin` is the owner's repository and `upstream` is Light Brands', and nothing else.

**Reversible.** passes when the owner knows the repository is theirs to delete in GitHub, Settings, and that the run deletes nothing.

**Explained.** passes when the owner can say in one sentence: my command center's history lives in my own private GitHub repository.

## Changing it

- **Modify.** A different account: `gh auth logout`, then the owner signs in again in their own Terminal window.
- **Upgrade.** Not part of this step.
- **Remove.** The owner deletes the repository on github.com, in its Settings. The run never deletes it.

## How it is done

**Check.** `git remote -v` shows `upstream` at Light-Brands/foundation. When it does not, return to [Bring in your Foundation](bring-in-your-foundation.md). When `origin` already points at the owner's own repository, this step is done, and the run goes to Next.

**Do.**

1. `gh --version`: the GitHub CLI lets Claude work with GitHub from here. When it is missing, the owner installs it from cli.github.com, or on a Mac with Homebrew, `brew install gh`, when Homebrew is there.
2. **A Terminal window.** On a Mac: Command and Space, type Terminal, press Return. On Windows: the Start menu, type PowerShell, open it. Claude runs `pwd` and gives the exact `cd` line for the folder.
3. **The sign in, in that window.** The owner runs `gh auth login --hostname github.com --git-protocol https --web`, presses Return, and finishes in the browser, typing the one time code there. Claude waits.
4. `gh auth status`: confirms the sign in and shows the account. `gh auth setup-git` lets Git push with that sign in.
5. `gh repo view foundation-command-center`: checks whether the name is taken. When it is, Claude asks about `foundation-command-center-2`.
6. `gh repo create foundation-command-center --private --source . --remote origin --push`: makes the private repository in the owner's account, adds it as `origin`, and pushes the Foundation there.
7. `gh repo view --web`: opens it in the browser for the owner to see.
8. The record.

**When something goes wrong.** "You are not logged into any GitHub hosts": the sign in did not finish, so the owner runs it again in their Terminal window. "Name already exists on this account": use `foundation-command-center-2`. "Remote origin already exists": `git remote -v` shows where it points; when it is Light Brands', run `git remote rename origin upstream` first. "Permission denied" on push: run `gh auth setup-git`, then push again with `git push -u origin main`.

**The prompt to copy.** Paste this into the Code tab of Claude Desktop, with the `foundation-command-center` folder open.

```text
You are helping me with step 0.3.3, Connect GitHub, the third of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; when something needs a sign in that asks questions, give me the exact command to run in my own Terminal window and wait until I say it is done. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on. My repository is always mine and private.

1. Check where we are: run git remote -v. upstream must point at github.com/Light-Brands/foundation. If it does not, stop and tell me to go back to 0.3.2, Bring in your Foundation. If origin already points at my own repository, tell me this step is done and go to the last two steps.
2. Ask whether I have a GitHub account. If not, send me to github.com to create one in my browser.
3. Run gh --version. If the GitHub CLI is missing, help me install it from cli.github.com, or with brew install gh on a Mac that has Homebrew.
4. Help me open a Terminal window: on a Mac, Command and Space, type Terminal, press Return; on Windows, the Start menu, type PowerShell. Run pwd and give me the exact cd line for this folder.
5. Give me this command to run in that Terminal window: gh auth login --hostname github.com --git-protocol https --web. Tell me to press Return, then finish in my browser, typing the code it shows there and never here. Wait until I say it is done.
6. Run gh auth status to confirm, then gh auth setup-git so Git can push with that sign in.
7. Run gh repo view foundation-command-center. If it already exists in my account, tell me and offer foundation-command-center-2.
8. Run gh repo create foundation-command-center --private --source . --remote origin --push, with the name we agreed.
9. Show me git remote -v, then run gh repo view --web so I see my repository, marked Private, with my files.
10. Tell me what I now have, and the next step: 0.3.4, Connect Vercel and choose your PIN. In this same folder I can say: Follow 0.3.4 Connect Vercel and choose your PIN, in ninja/frameworks/foundation-setup/connect-vercel.md.
11. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.
```

## Next

Put your command center on Vercel and choose your PIN: [Connect Vercel and choose your PIN](connect-vercel.md). In the same folder, you can say:

```text
Follow 0.3.4 Connect Vercel and choose your PIN, in ninja/frameworks/foundation-setup/connect-vercel.md.
```
