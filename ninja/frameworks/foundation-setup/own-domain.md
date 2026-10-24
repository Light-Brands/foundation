---
id: frameworks/foundation-setup/own-domain
kind: framework
title: Put it on my own domain
lead: null
state: live
target: any
tiers: [mastery]
uses: []
crew: [run-lead, integrations-engineer, release-engineer, qa-lead, scribe, guide]
specialists: []
level: 1
version: 1
---
# Put it on my own domain

## What it is

The ninth of nine steps for your [Foundation](../foundation.md), one you take any time after it is live. Your command center moves from its Vercel address to one of your own, such as command.yourbusiness.com. The subdomain `command.` keeps your main website exactly as it is. You add the address in Vercel, then add the one record Vercel shows at the company where you bought your domain, and wait a few minutes.

[Prep](../prep.md) and [Home](../home.md) are there for more. Any time after [Go live](go-live.md).

## The bar

The owner's main website keeps working. The owner signs in to Vercel and to their domain company themselves, in their own browser, and adds the record there; Claude reads every value back in plain words. The step ends when the new address shows Valid Configuration and opens behind the owner's PIN.

## Depth tiers

Not part of this entry. Every owner takes this step the same way.

## Questions

One per message:

1. "Which domain do you own?" Default: none; the owner says it.
2. "Where did you buy it, or where is its DNS managed?" Default: none; the owner says it, such as Cloudflare, GoDaddy or Namecheap.
3. "Shall your command center live at command.<your domain>?" Default: yes.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Holds the order: add in Vercel, add the record, wait, prove.
- **Integrations engineer.** The record at the owner's domain company, entered by the owner.
- **Release engineer.** The domain on the Vercel project.
- **QA lead.** Valid Configuration, and the PIN on the new address.
- **Scribe.** The step's record, where the folder changed.
- **Guide.** Reads each value back in plain words.

## Data

Not part of this entry.

## Screens and panels

Not part of this entry.

## Routines and Inbox cards

Not part of this entry.

## Connections

- **Vercel.** The project's Settings, Domains, where the address is added.
- **The domain company.** Its DNS page, where the owner adds the record Vercel shows. On Cloudflare, the record's proxy status is DNS only.

## Autopilot

Not part of this entry.

## Proof

In the Vercel project's Settings, Domains, the new address shows Valid Configuration, and opening it in the browser shows the sign in page; the owner's PIN opens the command center.

## Complete when

**Fitted.** passes when the address is the one the owner chose, on their own domain.

**Autopiloted.** passes when Vercel keeps the address's certificate current on its own.

**Visible.** passes when the owner opens the new address in their browser.

**Connected.** passes when Vercel shows Valid Configuration.

**Recorded.** passes when the step's record is made where the folder changed.

**Tested.** passes when the main website still opens as before.

**Proven.** passes when the owner's PIN opens the command center on the new address.

**Coherent.** passes when the old Vercel address and the new one open the same command center.

**Reversible.** passes when the owner knows that removing the address in Vercel, and the record at their domain company, puts things back.

**Explained.** passes when the owner can say in one sentence where their command center now lives.

## Changing it

- **Modify.** A different address: add it the same way, then remove the old one in Settings, Domains.
- **Upgrade.** Not part of this step.
- **Remove.** The owner removes the address in Vercel's Settings, Domains, and the record at their domain company.

## How it is done

**Check.** The command center is live and opens with the owner's PIN on its Vercel address. When it does not, return to [Go live](go-live.md).

**Do.**

1. **The address.** Claude asks which domain the owner owns and where, and suggests `command.<domain>`.
2. **In Vercel.** The owner opens their project, then Settings, then Domains, then Add, and enters the full address. From the Code tab, Claude can do the same with `vercel domains add command.<domain>`, which adds it to the linked project.
3. **The record.** Vercel shows a DNS record. Claude reads it back in plain words: its type, its name and its value.
4. **At the domain company.** On Cloudflare: DNS, then Records, then Add record, with exactly those values and the proxy status set to DNS only. Anywhere else: that company's DNS page, the same way.
5. **Wait.** A few minutes, then Refresh on Vercel's Domains page until it shows Valid Configuration.
6. **Try it.** The owner opens the new address and signs in with their PIN.
7. The record, when the folder changed.

**When something goes wrong.** Invalid Configuration after a few minutes: the record's name or value differs from what Vercel shows, so Claude reads both back side by side; on Cloudflare, the proxy must be DNS only. "Domain is already in use": the address is on another Vercel project, so remove it there first. A certificate warning: it clears on its own within an hour of Valid Configuration.

**The prompt to copy.** Paste this into the Code tab of Claude Desktop, with the `foundation-command-center` folder open.

```text
You are helping me with step 0.3.9, Put it on my own domain, one of the nine steps for my Foundation command center, for example command.mybusiness.com. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; I sign in to Vercel and to my domain company myself, in my browser. When something fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: my command center must be live and open with my PIN on its Vercel address. If it is not, stop and tell me to go back to 0.3.6, Go live.
2. Ask me which domain I own and where I bought it. Suggest the subdomain command. so my main website stays as it is.
3. Walk me through my Vercel project, then Settings, then Domains, then Add, entering the full subdomain. Or, if I prefer, run vercel domains add with the full subdomain for me.
4. Vercel shows a DNS record to add. Read it back to me in plain words: the type, the name, and the value.
5. If my domain is on Cloudflare: walk me through DNS, then Records, then Add record, using exactly those values, with the proxy status set to DNS only. If it is somewhere else, walk me through that provider's DNS page the same way.
6. Ask me to wait a few minutes, then press Refresh in Vercel's Domains page. When it shows Valid Configuration, ask me to open my new address and enter my PIN.
7. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.
```

## Next

All nine steps are done. From here you build your business out by asking: the [Foundation](../foundation.md) entry names the first moves, and [Get Claude Desktop](get-claude-desktop.md) is where anyone you help starts. Come back to [Update my Foundation](update-my-foundation.md) whenever Light Brands says a new Foundation is out.
