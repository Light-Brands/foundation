---
id: frameworks/foundation-setup/get-claude-desktop
kind: framework
title: Get Claude Desktop
lead: null
state: live
target: any
tiers: [essentials]
uses: []
crew: [run-lead, integrations-engineer, guide]
specialists: []
level: 1
version: 1
---
# Get Claude Desktop

## What it is

The first of nine setup steps for your [Foundation](../foundation.md), the command center that runs your business. Claude Desktop's Code tab needs a paid Claude plan: Claude Pro, about $20 a month, is the one to choose. With it you install Claude Desktop, sign in, open its Code tab, and give it a new, empty folder named `foundation-command-center`, where your command center will live.

The Code tab is Claude Code inside Claude Desktop: Claude runs commands on your own computer, in the folder you give it, and shows you each one. Every later step happens there. For more about your computer and AI tools, [Prep](../prep.md) goes deeper, and [Home](../home.md) builds a home for your business that moves into the Foundation later. Neither is needed first.

## The bar

You sign up, pay and sign in yourself, in your own browser and in Claude Desktop. Nothing is typed into the chat that belongs on a payment page or a sign in page. The step ends with the Code tab open on an empty folder named `foundation-command-center`, on your own computer.

## Depth tiers

Not part of this entry. Every owner takes this step the same way.

## Questions

One per message:

1. "Do you have a Claude Pro plan, or Max?" Default: not yet, and the step starts there.
2. "Are you on a Mac or on Windows?" Default: Mac.
3. "Do you already have Claude Desktop installed?" Default: no.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Keeps the step to one small action at a time, each confirmed before the next.
- **Integrations engineer.** The plan, the download and the sign in, each done by the owner.
- **Guide.** Shows where the Code tab is and how a folder is chosen, and gives the next step.

## Data

Not part of this entry.

## Screens and panels

Not part of this entry.

## Routines and Inbox cards

Not part of this entry.

## Connections

- **Claude.** The owner's own Claude account at claude.ai, on Claude Pro or Max, signed in to Claude Desktop.

## Autopilot

Not part of this entry.

## Proof

Claude Desktop is open on the Code tab, and the folder it shows is `foundation-command-center`, empty, on the owner's own computer.

## Complete when

**Fitted.** passes when the plan, the computer and the folder are the owner's own.

**Autopiloted.** passes when Claude Desktop is signed in, so every later step runs in it without another sign in.

**Visible.** passes when the owner sees the Code tab with `foundation-command-center` chosen.

**Connected.** passes when Claude Desktop is signed in to the owner's own Claude account.

**Recorded.** passes when the owner knows where the folder sits, such as Documents, because no repository exists yet to hold a record.

**Tested.** passes when, in the Code tab, Claude can list the folder and finds it empty.

**Proven.** passes when the next step's check runs in that folder and passes.

**Coherent.** passes when the folder's name matches the name every later step uses for the repository, the Vercel project and the database.

**Reversible.** passes when the owner knows they can delete the empty folder and cancel the plan in claude.ai, Settings, Billing.

**Explained.** passes when the owner can say in one sentence what the Code tab does: Claude runs commands in my folder and shows me each one.

## Changing it

- **Modify.** A different folder: create a new empty one with the same name and choose it in the Code tab.
- **Upgrade.** Max instead of Pro, in claude.ai, Settings, Billing. Nothing else changes.
- **Remove.** Delete the empty folder. The plan and the app are the owner's to cancel and uninstall.

## How it is done

**Check.** This is the first step, so there is nothing before it to check. When the owner already has Claude Desktop and a paid plan, the step goes straight to the folder.

**Do.** One action at a time, each confirmed before the next:

1. **The plan.** At claude.ai, sign in or create an account, then Settings, Billing, and choose Pro. The owner enters payment there, in their own browser.
2. **The download.** At claude.ai/download, download Claude Desktop for Mac or Windows, install it, and open it.
3. **The sign in.** Sign in to Claude Desktop with the same Claude account.
4. **The Code tab.** In Claude Desktop, switch from Chat to Code. Where it asks how to run, choose your own computer (Local).
5. **The folder.** On a Mac, in Finder, open Documents, then File, New Folder, and name it `foundation-command-center`. On Windows, in File Explorer, open Documents, then New, Folder, with the same name.
6. **Open it.** In the Code tab, where it asks for a folder, choose `foundation-command-center`.

**When something goes wrong.** The Code tab asks for a paid plan: the plan step did not finish, so check claude.ai, Settings, Billing. On Windows, the Code tab asks for Git: install Git for Windows from git-scm.com, then open the Code tab again. The folder already holds files: make a new empty one with the same name somewhere else, such as on the Desktop.

**The prompt to copy.** Paste this into a chat at claude.ai, or into Claude Desktop when you already have it.

```text
You are helping me with step 0.3.1, Get Claude Desktop, the first of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Never ask me for a password, payment details, a key or a code in this chat, and tell me never to paste one. I sign up, pay and sign in myself, in my own browser and in Claude Desktop.

1. Tell me first that the Code tab in Claude Desktop needs a paid Claude plan, and that Claude Pro, about $20 a month, is the one to choose. Ask whether I have Pro or Max. If not, walk me to claude.ai, Settings, Billing, to choose Pro, paying there myself.
2. Ask whether I am on a Mac or on Windows.
3. Send me to claude.ai/download to download Claude Desktop, install it and open it. Then ask me to sign in with the same Claude account.
4. Show me where to switch from Chat to Code in Claude Desktop. Where it asks how to run, I choose my own computer (Local). On Windows, if it asks for Git, send me to git-scm.com to install Git for Windows first.
5. Walk me through making a new, empty folder named foundation-command-center in my Documents folder: on a Mac in Finder with File, New Folder; on Windows in File Explorer with New, Folder.
6. Ask me to choose that folder in the Code tab. I should see the Code tab open with foundation-command-center as its folder.
7. When I say it is done, tell me the next step: open 0.3.2, Bring in your Foundation, copy its prompt and paste it into the Code tab.
8. If your command center folder is open in Claude Code, and it already holds the Foundation, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.

If anything shows an error, ask me to describe it or paste the error text, tell me in plain words what it means, and help me fix it before moving on.
```

## Next

Bring your Foundation into the folder: open [Bring in your Foundation](bring-in-your-foundation.md), copy its prompt, and paste it into the Code tab with `foundation-command-center` open.
