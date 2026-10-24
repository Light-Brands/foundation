---
id: frameworks/foundation-setup/connect-vercel
kind: framework
title: Connect Vercel and choose your PIN
lead: null
state: live
target: any
tiers: [essentials]
uses: []
crew: [run-lead, integrations-engineer, release-engineer, qa-lead, scribe, guide]
specialists: []
level: 1
version: 1
---
# Connect Vercel and choose your PIN

## What it is

The fourth of nine setup steps for your [Foundation](../foundation.md). Vercel is where your command center runs online. You sign in to Vercel, Claude makes a Vercel project named `foundation-command-center` and connects it to your GitHub repository, so every change you push goes live on its own. Then you choose your PIN, 6 to 12 digits, and type it into Vercel yourself, in your own Terminal window, and Claude sets your business name.

This is the one place your PIN is chosen. It never enters the chat. [Prep](../prep.md) and [Home](../home.md) are there for more. Before this step: [Connect GitHub](connect-github.md).

## The bar

The Vercel project is the owner's own, named `foundation-command-center`, or `foundation-command-center-2` when the name is taken, said aloud. The PIN is typed only by the owner, in their own Terminal window, into `vercel env add`, and is never shown, asked for or repeated in the chat. The project deploys on every push to the owner's repository.

## Depth tiers

Not part of this entry. Every owner takes this step the same way.

## Questions

One per message:

1. "Do you have a Vercel account?" Default: no, and the owner signs up at vercel.com with GitHub, on the free Hobby plan.
2. "What is your business name, exactly as customers see it?" Default: none; the owner says it. A business name is public, so saying it in the chat is fine.
3. When `foundation-command-center` already exists in their Vercel account: "That name is taken in your Vercel account. Shall I use foundation-command-center-2?" Default: yes.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Runs the check and holds the order: sign in, project, connection, PIN, name.
- **Integrations engineer.** The Vercel CLI, the sign in and the GitHub connection.
- **Release engineer.** The project and its settings.
- **QA lead.** Confirms the settings by name, never by value.
- **Scribe.** The step's record.
- **Guide.** Walks the owner through their Terminal window and gives the next step.

## Data

- **The settings on Vercel.** `FOUNDATION_PIN`, for Production and Preview, typed by the owner. `FOUNDATION_BUSINESS_NAME`, for Production and Preview, set by Claude.
- **The link.** `.vercel/` in the folder ties it to the Vercel project. It is never committed.

## Screens and panels

Not part of this entry.

## Routines and Inbox cards

Not part of this entry.

## Connections

- **Vercel.** The owner's own account, signed in with `vercel login` in their own Terminal window.
- **Vercel's GitHub app.** Installed by the owner in their browser at github.com/apps/vercel, so a push to their repository deploys.

## Autopilot

From this step on, every push to the owner's repository deploys the command center on its own.

## Proof

`vercel env ls` lists `FOUNDATION_PIN` and `FOUNDATION_BUSINESS_NAME` for Production and Preview, with their values hidden. In the project on vercel.com, Settings, Git shows the owner's `foundation-command-center` repository connected.

## Complete when

**Fitted.** passes when the project, the PIN and the business name are the owner's own.

**Autopiloted.** passes when the project is connected to the repository, so a push deploys.

**Visible.** passes when the owner sees the project and its connected repository on vercel.com.

**Connected.** passes when `vercel whoami` names the owner's account and Settings, Git shows their repository.

**Recorded.** passes when the step's record is made where the folder changed, and the settings are listed by name.

**Tested.** passes when `vercel env ls` lists both settings for Production and Preview.

**Proven.** passes when the settings exist without their values ever appearing in the chat.

**Coherent.** passes when the Vercel project, the GitHub repository and the folder share one name.

**Reversible.** passes when the owner knows the project is theirs to delete on vercel.com, and the PIN can change any time with [Change my PIN](change-my-pin.md).

**Explained.** passes when the owner can say in one sentence: Vercel runs my command center, every push puts it live, and only I know my PIN.

**Private PIN.** passes when the PIN was typed only into the owner's own Terminal window.

## Changing it

- **Modify.** The PIN: [Change my PIN](change-my-pin.md). The business name: `vercel env rm FOUNDATION_BUSINESS_NAME production --yes`, the same for preview, then add it again and redeploy.
- **Upgrade.** Not part of this step.
- **Remove.** The owner deletes the project on vercel.com, in its Settings. The run never deletes it.

## How it is done

**Check.** `git remote -v` shows `origin` at the owner's own `foundation-command-center`. When it does not, return to [Connect GitHub](connect-github.md). When `vercel env ls` already lists both settings and the repository is connected, this step is done, and the run goes to Next.

**Do.**

1. `vercel --version`: the Vercel CLI lets Claude work with Vercel from here. When it is missing, `npm install -g vercel`. When that fails with a permission error, every later `vercel` command runs as `npx vercel@latest` instead.
2. **The account.** When the owner has none, they sign up at vercel.com with GitHub, on the free Hobby plan, in their browser.
3. **The sign in, in the owner's Terminal window.** The owner runs `vercel login` there and finishes in the browser. Claude then runs `vercel whoami`.
4. `vercel project ls`: checks whether the name is taken. When it is, Claude asks about `foundation-command-center-2`.
5. `vercel link --yes --project foundation-command-center`: makes the Vercel project and ties this folder to it.
6. `vercel git connect`: connects the project to the owner's repository. When it reports that Vercel cannot reach the repository, the owner opens github.com/apps/vercel in their browser, installs Vercel's GitHub app on their account and gives it the repository, then Claude runs it again.
7. **The PIN, in the owner's Terminal window.** The owner runs `vercel env add FOUNDATION_PIN production`, types a PIN of 6 to 12 digits when asked for the value, then runs `vercel env add FOUNDATION_PIN preview` and types the same PIN. When it asks about a Git branch, pressing Return means every branch. When it asks whether the value is sensitive, the answer is no, so the PIN can come down to the owner's own computer later; it stays private to their account either way. Claude waits.
8. **The business name.** Claude asks for it, then runs `printf '%s' "<business name>" | vercel env add FOUNDATION_BUSINESS_NAME production`, and the same with `preview`. When a command stops to ask a question, Claude gives the owner the same command for their Terminal window.
9. `vercel env ls`: lists the settings by name, values hidden.
10. The record.

**When something goes wrong.** "No existing credentials found": the sign in did not finish, so the owner runs `vercel login` again in their Terminal window. "Failed to connect" or a request to install the GitHub app: the owner installs Vercel's GitHub app at github.com/apps/vercel, giving it the repository, then `vercel git connect` again. "Environment variable already exists": it was added earlier, so check `vercel env ls` and go on; to replace it, remove it first. A PIN that is not 6 to 12 digits does not open the command center, so the owner replaces it with [Change my PIN](change-my-pin.md).

**The prompt to copy.** Paste this into the Code tab of Claude Desktop, with the `foundation-command-center` folder open.

```text
You are helping me with step 0.3.4, Connect Vercel and choose your PIN, the fourth of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; when something needs a secret or a sign in that asks questions, give me the exact command to run in my own Terminal window and wait until I say it is done. Never print a setting's value. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: run git remote -v. origin must point at my own foundation-command-center repository on GitHub. If it does not, stop and tell me to go back to 0.3.3, Connect GitHub. If vercel env ls already lists FOUNDATION_PIN and FOUNDATION_BUSINESS_NAME, and vercel git connect says my repository is already connected, tell me this step is done and go to the last two steps. If only the connection is missing, do step 7 and then the last two steps.
2. Run vercel --version. If the Vercel CLI is missing, run npm install -g vercel. If that fails with a permission error, use npx vercel@latest in place of vercel for every command after this.
3. Ask whether I have a Vercel account. If not, send me to vercel.com to sign up with GitHub, on the free Hobby plan.
4. Help me open a Terminal window in this folder, as in 0.3.3, and give me this command to run there: vercel login. I finish in my browser. Wait until I say it is done, then run vercel whoami.
5. Run vercel project ls. If foundation-command-center is already there, tell me and offer foundation-command-center-2.
6. Run vercel link --yes --project foundation-command-center, with the name we agreed.
7. Run vercel git connect. If it says Vercel cannot reach my repository, send me to github.com/apps/vercel in my browser to install Vercel's GitHub app on my account and give it my repository, then run it again.
8. Tell me to choose a PIN of 6 to 12 digits that only I know. Give me these two commands to run in my Terminal window, one after the other, typing the same PIN each time when it asks for the value: vercel env add FOUNDATION_PIN production, then vercel env add FOUNDATION_PIN preview. If it asks about a Git branch, I press Return. If it asks whether the value is sensitive, I answer no, so it can come down to my own computer later. Wait until I say it is done. Never ask me what the PIN is.
9. Ask me for my business name, exactly as customers see it. Run printf '%s' "<my business name>" | vercel env add FOUNDATION_BUSINESS_NAME production, then the same with preview. If a command stops to ask a question, give it to me to run in my Terminal window.
10. Run vercel env ls and show me both settings listed, with their values hidden.
11. Tell me what I now have, and the next step: 0.3.5, Connect your database. In this same folder I can say: Follow 0.3.5 Connect your database, in ninja/frameworks/foundation-setup/connect-your-database.md.
12. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.
```

## Next

Give your command center a database so it saves: [Connect your database](connect-your-database.md). In the same folder, you can say:

```text
Follow 0.3.5 Connect your database, in ninja/frameworks/foundation-setup/connect-your-database.md.
```
