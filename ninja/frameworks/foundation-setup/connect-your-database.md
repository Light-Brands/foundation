---
id: frameworks/foundation-setup/connect-your-database
kind: framework
title: Connect your database
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
# Connect your database

## What it is

The fifth of nine setup steps for your [Foundation](../foundation.md). A database is where your command center saves everything: your business profile, your contacts and the messages in your Inbox. Claude adds a Neon database through Vercel, named `foundation-command-center` and connected to your project. Neon puts the database's address into your project's settings itself, so nothing is copied by hand, and the command center finds it there.

Then Claude brings your project's settings down to your computer, so you can also run the command center there later. [Prep](../prep.md) and [Home](../home.md) are there for more. Before this step: [Connect Vercel and choose your PIN](connect-vercel.md).

## The bar

The database is the owner's own, on Neon's free plan unless they choose otherwise, named like the project and connected to it. Anything Vercel or Neon opens in the browser, such as accepting Neon's terms, the owner confirms there. No database address or password passes through the chat, and Claude never opens or prints `.env.local`.

## Depth tiers

Not part of this entry. Every owner takes this step the same way.

## Questions

One per message, only when needed:

1. When Neon asks for a plan: "Neon offers a free plan. Shall we use it?" Default: yes.
2. When Neon asks for a region: "Where are most of your customers?" Default: the region nearest the owner.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Runs the check, then the integration, then the fallback when the command line cannot finish.
- **Integrations engineer.** Neon through Vercel, confirmed by the owner in the browser.
- **QA lead.** Confirms the settings Neon added, by name only.
- **Scribe.** The step's record.
- **Guide.** Explains what a database is for and gives the next step.

## Data

- **The database.** Neon Postgres, named `foundation-command-center`. Its tables are made the first time the command center opens.
- **The settings Neon adds.** `DATABASE_URL`, and others such as `POSTGRES_URL`, on the project. The command center reads `DATABASE_URL`, then `POSTGRES_URL`, and a `FOUNDATION_DATABASE_URL`, when there is one, always wins.
- **`.env.local`.** The project's Production settings on the owner's computer, written by `vercel env pull`. Never committed, never printed.

## Screens and panels

Not part of this entry.

## Routines and Inbox cards

Not part of this entry.

## Connections

- **Neon.** Added through Vercel's Marketplace with `vercel integration add neon`, or from the project's Storage tab on vercel.com.

## Autopilot

Not part of this entry.

## Proof

`vercel env ls` lists `DATABASE_URL` (or `POSTGRES_URL`) for Production beside `FOUNDATION_PIN` and `FOUNDATION_BUSINESS_NAME`. On vercel.com, the project's Storage tab shows the Neon database `foundation-command-center` connected. The names in `.env.local`, printed without their values, include the PIN, the business name and the database address.

## Complete when

**Fitted.** passes when the database is the owner's own, named like the project.

**Autopiloted.** passes when the address reached the project's settings with nothing copied by hand.

**Visible.** passes when the owner sees the database in the project's Storage tab.

**Connected.** passes when `vercel env ls` lists the database address for Production.

**Recorded.** passes when the step's record is made where the folder changed.

**Tested.** passes when `.env.local` holds the expected names, checked without printing a value.

**Proven.** passes when the database shows as connected on the owner's own Vercel project.

**Coherent.** passes when the database, the project and the repository share one name.

**Reversible.** passes when the owner knows the database is theirs to delete in the project's Storage tab, and that deleting it deletes everything saved.

**Explained.** passes when the owner can say in one sentence: my command center saves into my own database, connected to my Vercel project.

## Changing it

- **Modify.** A different region or plan: in the project's Storage tab, on the Neon database.
- **Upgrade.** Neon's paid plans, chosen by the owner in their browser when the free plan's limits are near.
- **Remove.** The owner removes the database in the Storage tab. Everything saved goes with it, so the run never removes it.

## How it is done

**Check.** `vercel env ls` lists `FOUNDATION_PIN` and `FOUNDATION_BUSINESS_NAME`. When it does not, return to [Connect Vercel and choose your PIN](connect-vercel.md). When it already lists `DATABASE_URL` or `POSTGRES_URL`, the database is connected, and the run goes to the settings on the computer.

**Do.**

1. `vercel integration add neon --name foundation-command-center`: adds a Neon database through Vercel and connects it to the project. When it opens the browser, the owner finishes there: accepting Neon's terms, choosing the free plan and a region, and connecting it to the `foundation-command-center` project for every environment. When it stops to ask questions Claude cannot answer, the owner runs the same command in their own Terminal window.
2. **The fallback.** When the command line cannot finish, the owner opens the project on vercel.com, then Storage, then Neon, chooses the free plan and the name `foundation-command-center`, and presses Connect, for every environment.
3. `vercel env ls`: confirms the database address is in the project's settings.
4. `vercel env pull .env.local --environment=production`: brings the project's settings, PIN and database address included, to `.env.local` on the computer, so a later run here uses the same PIN. Then `sed -i.bak '/^VERCEL=/d;/^VERCEL_/d' .env.local && rm .env.local.bak` removes the lines Vercel adds about its own servers, such as `VERCEL="1"`, because they make a run on the computer act as if it were on Vercel; no value is printed.
5. `cut -d= -f1 .env.local`: lists the names in it, never the values.
6. The record.

**When something goes wrong.** "Integration not found" or an older CLI: update it with `npm install -g vercel`, then try again. A name already taken in Neon: use `foundation-command-center-2`. A free plan limit, such as one free database already used: the owner chooses whether to reuse that one, remove it, or pick a paid plan, in their browser. `.env.local` lacks `FOUNDATION_PIN`: the PIN was saved as sensitive, which Vercel never sends down. The live command center is unaffected, and a run on the computer waits until the PIN is added again, not marked sensitive, with [Change my PIN](change-my-pin.md).

**The prompt to copy.** Paste this into the Code tab of Claude Desktop, with the `foundation-command-center` folder open.

```text
You are helping me with step 0.3.5, Connect your database, the fifth of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; when something needs a sign in that asks questions, give me the exact command to run in my own Terminal window and wait until I say it is done. Never open or print .env.local, and never print a setting's value. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: run vercel env ls. FOUNDATION_PIN and FOUNDATION_BUSINESS_NAME must be listed. If they are not, stop and tell me to go back to 0.3.4, Connect Vercel and choose your PIN. If DATABASE_URL or POSTGRES_URL is already listed, skip to step 5.
2. Tell me in one sentence what the database is for. Then run vercel integration add neon --name foundation-command-center. If it opens my browser, tell me to finish there: accept Neon's terms, choose the free plan and the region nearest my customers, and connect it to my foundation-command-center project for every environment. If it stops to ask questions, give me the same command to run in my Terminal window. Wait until I say it is done.
3. If that cannot finish, walk me through the fallback on vercel.com: my project, then Storage, then Neon, the free plan, the name foundation-command-center, then Connect, for every environment.
4. Run vercel env ls and show me DATABASE_URL or POSTGRES_URL listed for Production.
5. Run vercel env pull .env.local --environment=production, so my settings are on this computer too. Then run sed -i.bak '/^VERCEL=/d;/^VERCEL_/d' .env.local && rm .env.local.bak, and tell me in one sentence why: those lines describe Vercel's own servers, and left in, they make a run on this computer act as if it were on Vercel. Never print a value. Then run cut -d= -f1 .env.local to show me only the names, and confirm FOUNDATION_PIN, FOUNDATION_BUSINESS_NAME and the database address are there.
6. Tell me what I now have, and the next step: 0.3.6, Go live. In this same folder I can say: Follow 0.3.6 Go live, in ninja/frameworks/foundation-setup/go-live.md.
7. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.
```

## Next

Put your command center live and try it: [Go live](go-live.md). In the same folder, you can say:

```text
Follow 0.3.6 Go live, in ninja/frameworks/foundation-setup/go-live.md.
```
