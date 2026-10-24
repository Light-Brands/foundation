---
id: frameworks/foundation-setup/go-live
kind: framework
title: Go live
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
# Go live

## What it is

The sixth of nine setup steps for your [Foundation](../foundation.md), and the one where it comes alive. Claude puts your command center live on Vercel and opens its address. You sign in with your PIN, save your business profile, send yourself a test message from your public contact page, and see it arrive in your Inbox. When you want, it also runs on your own computer, with the same PIN and the same data.

From here you build your business out by asking, and the [Foundation](../foundation.md) entry names what comes next. [Prep](../prep.md) and [Home](../home.md) are there for more. Before this step: [Connect your database](connect-your-database.md).

## The bar

The command center is live on its own address, opens only with the owner's PIN, greets the business by its name, and saves. The owner signs in in their own browser; the PIN never enters the chat. The step ends only when a save and a test message are seen working on the live site.

## Depth tiers

Not part of this entry. Every owner takes this step the same way.

## Questions

One per message:

1. "Do you also want it running on this computer?" Default: no; it is optional, and the live site is the one that matters.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Runs the check, then the deploy, then the proof in order.
- **Release engineer.** The deploy and its address.
- **QA lead.** The sign in, the save and the test message.
- **Scribe.** The step's record, and the push that brings GitHub up to date.
- **Guide.** Walks the owner through their command center and names what comes next.

## Data

- **The tables.** Contacts, the Inbox and the business profile, made in the owner's database the first time the command center opens.
- **The business profile.** Saved from Settings, Preferences.

## Screens and panels

- **The sign in.** The PIN page every visitor without a session sees.
- **Command center, See your day.** The business name and what is next.
- **Command center, Handle what needs you.** The Inbox, where the test message arrives.
- **Settings, Preferences.** The business profile, saved with Save.
- **The contact page.** At `/contact`, the one page anyone can open.

## Routines and Inbox cards

A message sent from the contact page lands in Handle what needs you as a card, "<name> sent a message".

## Connections

- **Vercel.** The deploy, by `vercel --prod`. Every later push to the owner's repository deploys too.

## Autopilot

A message sent from the contact page lands in the Inbox as a card on its own.

## Proof

On the live address, the PIN opens the command center, "See your day" shows the business name, Settings, Preferences says "Saved" after Save, and a test message sent from the address's `/contact` page arrives in Handle what needs you. When the owner chose it, the same works at http://localhost:3000 on their own computer.

## Complete when

**Fitted.** passes when the address, the PIN and the business name are the owner's own.

**Autopiloted.** passes when the test message arrives as a card with no step taken by hand.

**Visible.** passes when "See your day" greets the business by its name behind the owner's PIN.

**Connected.** passes when the save and the test message both reach the owner's database.

**Recorded.** passes when the step's record is made and pushed, so GitHub holds the same history as the folder.

**Tested.** passes when the deploy finished with Ready and no error.

**Proven.** passes when the owner saw "Saved" and their own test message on the live site.

**Coherent.** passes when the live site and a local run share one PIN and one database, because both read the project's settings.

**Reversible.** passes when the owner knows the project, the repository and the database are theirs to delete, and that the run deletes nothing.

**Explained.** passes when the owner can say in one sentence where their command center lives, what it saves, and what they decide.

**Private PIN.** passes when the PIN was typed only into the sign in page.

## Changing it

- **Modify.** The PIN: [Change my PIN](change-my-pin.md). The business facts: Settings, Preferences, with Save.
- **Upgrade.** Light Brands' newer Foundation: [Update my Foundation](update-my-foundation.md). An address of the owner's own: [Put it on my own domain](own-domain.md).
- **Remove.** The project, the repository and the database belong to the owner, who deletes them in their own dashboards. The run never deletes them.

## How it is done

**Check.** `vercel env ls` lists `FOUNDATION_PIN`, `FOUNDATION_BUSINESS_NAME` and `DATABASE_URL` or `POSTGRES_URL`. When the database address is missing, return to [Connect your database](connect-your-database.md); when the PIN or the name is missing, to [Connect Vercel and choose your PIN](connect-vercel.md).

**Do.**

1. `vercel --prod`: builds the command center and puts it live, in about two minutes. The last line it prints is the live address.
2. **Open it.** `open <address>` on a Mac, `start <address>` on Windows, or the owner copies the address into their browser.
3. **Sign in.** The owner types their PIN on the sign in page and sees "See your day" with the business name.
4. **Save.** Settings, Preferences: the owner fills in the business profile, presses Save, and sees "Saved".
5. **The test message.** The owner opens `<address>/contact` in another tab, sends a short message to themselves, then opens Command center, Handle what needs you and sees it as a card.
6. **On this computer, when wanted.** First `sed -i.bak '/^VERCEL=/d;/^VERCEL_/d' .env.local && rm .env.local.bak`, which removes any lines about Vercel's own servers, such as `VERCEL="1"`, that would make a run on the computer act as if it were on Vercel. Then `npm run dev`, then http://localhost:3000, signing in with the same PIN. It reads the settings pulled into `.env.local`, so it works on the same live database: what is saved there shows online too. Pressing Control and C in the Code tab, or asking Claude, stops it.
7. The record, then `git push`, so GitHub holds the same history. That push deploys again, which is expected.

**When something goes wrong.** The deploy fails: `vercel inspect --logs <address>` shows the build's real error, which Claude reads and explains. The sign in says the PIN is not set or not valid: return to [Change my PIN](change-my-pin.md). Preferences says the live site is not saving yet: the database address is missing, so return to [Connect your database](connect-your-database.md), then deploy again. A database error on the first open: wait a minute and reload, because a new Neon database can take a moment to wake; when it stays, Claude reads the error in `vercel logs <address>`.

**The prompt to copy.** Paste this into the Code tab of Claude Desktop, with the `foundation-command-center` folder open.

```text
You are helping me with step 0.3.6, Go live, the sixth of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; I type my PIN only on my command center's sign in page. Never open or print .env.local. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: run vercel env ls. FOUNDATION_PIN, FOUNDATION_BUSINESS_NAME and DATABASE_URL or POSTGRES_URL must be listed. If the database address is missing, stop and tell me to go back to 0.3.5, Connect your database; if the PIN or the name is missing, to 0.3.4, Connect Vercel and choose your PIN.
2. Run vercel --prod. Tell me it takes about two minutes, then show me the live address it prints.
3. Open that address in my browser. Ask me to sign in with my PIN and tell you when I see See your day with my business name.
4. Walk me to Settings, Preferences. I fill in my business profile and press Save. I should see Saved.
5. Ask me to open the address with /contact at the end in another tab, send a short test message to myself, then open Command center, Handle what needs you. I should see my message as a card.
6. Ask whether I also want it running on this computer. If yes, first run sed -i.bak '/^VERCEL=/d;/^VERCEL_/d' .env.local && rm .env.local.bak and tell me in one sentence why: those lines describe Vercel's own servers and would make this computer act as if it were on Vercel. Never print a value. Then run npm run dev and tell me to open http://localhost:3000 and sign in with the same PIN. Tell me plainly that it uses the same live database, so what I save there shows online too. Stop it when I say so.
7. Tell me what I now have, and that from here I build my business out by asking. Name the three steps I can come back to any time: 0.3.7 Change my PIN, 0.3.8 Update my Foundation and 0.3.9 Put it on my own domain, each in ninja/frameworks/foundation-setup/.
8. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits. Then run git push, so GitHub holds the same history, and tell me it deploys again, which is expected.
```

## Next

Your command center is live. From here you build your business out by asking, and the [Foundation](../foundation.md) entry names the first moves: moving your Ninja home in, the first session, and your first install. The next step, any time you want a new PIN: [Change my PIN](change-my-pin.md). After it come [Update my Foundation](update-my-foundation.md) and [Put it on my own domain](own-domain.md), also any time. In the same folder, you can say:

```text
Follow 0.3.7 Change my PIN, in ninja/frameworks/foundation-setup/change-my-pin.md.
```
