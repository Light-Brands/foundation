---
id: frameworks/foundation-setup/change-my-pin
kind: framework
title: Change my PIN
lead: null
state: live
target: any
tiers: [essentials]
uses: []
crew: [run-lead, release-engineer, qa-lead, scribe, guide]
specialists: []
level: 1
version: 1
---
# Change my PIN

## What it is

The seventh of nine steps for your [Foundation](../foundation.md), one you take any time after it is live. Claude removes your old PIN from Vercel, you type your new one into Vercel yourself, in your own Terminal window, and Claude puts the command center live again so the new PIN works. Your live site keeps working with the old PIN until that moment.

Changing the PIN signs everyone out, which is expected. [Prep](../prep.md) and [Home](../home.md) are there for more. Before this step: [Go live](go-live.md).

## The bar

The new PIN is 6 to 12 digits, typed only by the owner in their own Terminal window, and never asked for, shown or repeated in the chat. Claude puts the command center live again only after the new PIN is in place for Production and Preview, so the site is never left without one.

## Depth tiers

Not part of this entry. Every owner takes this step the same way.

## Questions

One per message:

1. "Do you also run your command center on this computer?" Default: no. When yes, the new PIN comes down to it too.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Holds the order: remove, add, deploy, prove.
- **Release engineer.** The removal and the deploy.
- **QA lead.** The old PIN refused, the new one accepted.
- **Scribe.** The step's record, where the folder changed.
- **Guide.** Walks the owner through their Terminal window.

## Data

- **The setting.** `FOUNDATION_PIN` on Vercel, for Production and Preview, and in `.env.local` when the owner runs it on their computer.

## Screens and panels

- **The sign in.** Where the owner tries the old PIN and the new one.

## Routines and Inbox cards

Not part of this entry.

## Connections

- **Vercel.** The owner's own project, already linked to the folder.

## Autopilot

Not part of this entry.

## Proof

On the live address, the old PIN no longer opens the command center and the new one does.

## Complete when

**Fitted.** passes when the new PIN is the one the owner chose.

**Autopiloted.** passes when the deploy carries the new PIN with no setting edited by hand on vercel.com.

**Visible.** passes when the owner sees the new PIN open "See your day".

**Connected.** passes when `vercel env ls` lists `FOUNDATION_PIN` for Production and Preview again.

**Recorded.** passes when the step's record is made where the folder changed; a PIN change alone changes no file.

**Tested.** passes when the old PIN is refused on the live site.

**Proven.** passes when the new PIN opens the live command center.

**Coherent.** passes when the live site and a local run use the same new PIN.

**Reversible.** passes when the owner knows they can take this step again any time.

**Explained.** passes when the owner can say in one sentence: I changed my PIN in Vercel, and everyone signs in again.

**Private PIN.** passes when the new PIN was typed only into the owner's own Terminal window and the sign in page.

## Changing it

- **Modify.** Take this step again.
- **Upgrade.** Not part of this step.
- **Remove.** A command center always has a PIN, so it cannot be removed, only changed.

## How it is done

**Check.** `.vercel/project.json` exists, `vercel whoami` names the owner's account, and `vercel env ls` lists `FOUNDATION_PIN`. When the folder is not linked, return to [Connect Vercel and choose your PIN](connect-vercel.md).

**Do.**

1. **Say what happens.** Changing the PIN signs everyone out, and the live site keeps the old PIN until the redeploy. Nothing is pushed to GitHub between removing the old PIN and adding the new one, because every push deploys, and a deploy in that gap would have no PIN.
2. `vercel env rm FOUNDATION_PIN production --yes` and `vercel env rm FOUNDATION_PIN preview --yes`: removes the old PIN from the project's settings.
3. **The new PIN, in the owner's Terminal window.** The owner runs `vercel env add FOUNDATION_PIN production` and types the new PIN, 6 to 12 digits, then `vercel env add FOUNDATION_PIN preview` with the same PIN, pressing Return when it asks about a Git branch and answering no when it asks whether the value is sensitive. Claude waits.
4. `vercel env ls`: confirms the PIN is listed again for both, value hidden.
5. `vercel --prod`: puts the command center live again with the new PIN.
6. **On this computer, when wanted.** `vercel env pull .env.local --environment=production`, then `sed -i.bak '/^VERCEL=/d;/^VERCEL_/d' .env.local && rm .env.local.bak` to remove the lines about Vercel's own servers, then `npm run dev` again.
7. **Try it.** The owner opens the live address: the old PIN is refused, the new one opens it.
8. The record, when the folder changed.

**When something goes wrong.** "Environment variable not found" on removal: it was already removed, so go on to adding it. The new PIN does not open the site: the deploy has not finished, or the PIN is not 6 to 12 digits, so check `vercel ls` for Ready, and when it is, take this step again with a valid PIN. The old PIN still works: the redeploy did not run, so run `vercel --prod` again.

**The prompt to copy.** Paste this into the Code tab of Claude Desktop, with the `foundation-command-center` folder open.

```text
You are helping me with step 0.3.7, Change my PIN, one of the nine steps for my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; I type my new PIN only in my own Terminal window and on my sign in page. Never open or print .env.local, and never print a setting's value. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: .vercel/project.json must exist, vercel whoami must name my account, and vercel env ls must list FOUNDATION_PIN. If the folder is not linked, stop and tell me to go back to 0.3.4, Connect Vercel and choose your PIN.
2. Tell me that changing the PIN signs everyone out, and that my live site keeps the old PIN until we redeploy. Tell me not to push anything to GitHub until the new PIN is added, because every push deploys.
3. Run vercel env rm FOUNDATION_PIN production --yes, then vercel env rm FOUNDATION_PIN preview --yes.
4. Help me open a Terminal window in this folder and give me these two commands to run there, one after the other, typing the same new PIN of 6 to 12 digits each time: vercel env add FOUNDATION_PIN production, then vercel env add FOUNDATION_PIN preview. If it asks about a Git branch, I press Return. If it asks whether the value is sensitive, I answer no. Wait until I say it is done. Never ask me what the PIN is.
5. Run vercel env ls and show me FOUNDATION_PIN listed again for Production and Preview, value hidden.
6. Run vercel --prod to put it live with the new PIN.
7. Ask whether I also run it on this computer. If yes, run vercel env pull .env.local --environment=production, then sed -i.bak '/^VERCEL=/d;/^VERCEL_/d' .env.local && rm .env.local.bak to remove the lines about Vercel's own servers, then restart npm run dev.
8. Ask me to open my live address: the old PIN should be refused, and the new one should open my command center.
9. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.

Changing the PIN signs everyone out. That is expected.
```

## Next

Take Light Brands' newest Foundation into your copy, keeping your own work: [Update my Foundation](update-my-foundation.md). In the same folder, you can say:

```text
Follow 0.3.8 Update my Foundation, in ninja/frameworks/foundation-setup/update-my-foundation.md.
```
