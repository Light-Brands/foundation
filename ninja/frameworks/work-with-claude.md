---
id: frameworks/work-with-claude
kind: framework
title: Work with Claude
lead: null
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, guide, integrations-engineer, qa-lead, scribe]
specialists: []
level: 1
version: 1
---
# Work with Claude

## What it is

The habit that turns your command center into a place you build from. Every prompt in your Foundation, on every page and in every lesson, has an **Open in** button. One press opens Claude with the prompt already typed and your Foundation already chosen, on the computer in front of you. You read the prompt, you check the right repo or folder is selected, and you press Enter. That is the whole loop, and every later entry in this dictionary runs through it.

There are three doors into Claude, and you choose the one that suits how you work:

- **Claude Desktop.** The Claude app on your computer, opened on its Code tab in your Foundation folder.
- **claude.ai/code.** Claude Code in your web browser, with your GitHub repo selected for you.
- **Terminal.** Claude Code in your own terminal, started in your Foundation folder.

The job it takes off your plate: copying a prompt, opening Claude, finding the right folder or repo, and pasting it in, every time you want something built. What you still decide: which door you use, whether the repo or folder Claude shows is the right one, and whether to send. Nothing is ever sent until you press Enter.

Your Setup page carries this entry as its first lesson, with a short prompt to try. It assumes a [Foundation](foundation.md) that is already deployed, and for the doors that run on your computer, the tools [Prep](prep.md) sets up. The name the Claude button opens with is your chief of staff's, shown and changed on [Your team](../modules/agentic/agents.md), and every install you open runs through the [build crew](../modules/agentic/build-crew.md).

## The bar

The owner opens a prompt from their command center through their chosen door, sees their own Foundation named under the button and selected in Claude, reads the prompt, and presses Enter themselves. Claude answers inside their Foundation, reading its `CLAUDE.md`, and knows the business by name. The owner can say which door they use, why the repo line matters, what the warning in Terminal means, and that nothing leaves the page until they send it. When a door cannot open a prompt, the button says why in plain words and offers Copy instead, and the owner is never left with a link that opens the wrong place.

## Depth tiers

- **Essentials.** One prompt opened from your command center through one door, the repo or folder checked, and sent with Enter. About five minutes. On a deployed command center, the quickest first door is claude.ai/code, because your GitHub repo is already known and nothing needs installing.
- **Complete.** Adds your default door chosen in the menu, your Foundation folder saved in this browser for the two doors that run on your computer, the folder confirmed in Claude Desktop, and the Claude button in the top bar used to start a fresh session.
- **Mastery.** Adds the Terminal door working on your computer, the external link warning read and understood, a long prompt handled through Copy, and the same setup repeated on each computer and browser you work from.

## Questions

After the shared questionnaire, one per message:

1. "Where do you like to work with Claude: the Claude app on your computer, Claude in your web browser, or your terminal?" Default: Claude Desktop, the door every command center starts on.
2. "Is your command center open on Vercel, on your own computer, or both?" Default: the one the owner has open right now, read from the address bar.
3. At Complete, on a deployed command center: "Where is your Foundation folder on this computer?" The answer is the full path, starting with `/` or a drive letter. Typing `pwd` in a terminal inside the folder shows it. Default: the folder [Foundation](foundation.md) cloned into, when the owner remembers it.
4. At Complete: "Is your Foundation's repository on GitHub, and is it the one named under the Open in button?" Default: yes, the repository the Deploy button made.
5. At Mastery: "Have you run Claude Code in your terminal on this computer before?" Default: no, and the run starts it once.
6. At Mastery: "Do you work from more than one computer or browser?" Default: no.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Finds where the owner is, picks the first door with them, and holds the one rule of this entry: the owner presses Enter.
- **Guide.** Teaches the loop on the owner's own command center, one door at a time, and answers what each screen and warning means.
- **Integrations engineer.** Checks that the command center knows its GitHub repository, on Vercel and on the owner's computer, so claude.ai/code opens on the right repo.
- **QA lead.** Runs the proof: a real prompt opened through each door the owner uses, with the right repo or folder selected, and Claude answering inside the Foundation.
- **Scribe.** Records in `key/knowledge/system.md`, in plain words, which doors the owner uses, and writes the receipt.

## Data

This entry stores almost nothing, on purpose, and nothing at all in your repository or your database.

- **Your default door.** Kept in this browser's own storage, and nowhere else. It starts at Claude Desktop. Choosing a door in the menu makes it the default for this browser. A private window or a browser that blocks storage remembers nothing, and the button still works, opening Claude Desktop each time.
- **Your Foundation folder.** On a deployed command center, the path to your folder on this computer is kept in this browser's own storage only. It never reaches your repository, your database or any log, because a path on your computer carries your user name. On your own computer, the command center knows its folder from where it is running, and asks for nothing.
- **Your GitHub repository.** Read by the command center as it runs: on Vercel, from the project's own Git connection, and on your computer, from the folder's git remote. It is never typed in or stored by this entry.
- **What you have opened.** Whether you have opened or copied your first prompt is kept in this browser's storage too, so the card that points you to this lesson steps aside once you know the loop. Clearing it brings the card back.

## Screens and panels

- **The Open in button.** On every prompt in the command center. Its main part reads **Open in** with the name of your default door, such as "Open in Claude Desktop", and opens that door with the prompt typed. The small arrow beside it opens the menu.
- **The menu.** Three choices, Claude Desktop, claude.ai/code and Terminal, each with a one line hint of where it opens. Choosing one makes it your default in this browser, closes the menu, and the main part of the button now opens that door. When a door is missing something it needs, its choice says what is missing and offers Copy.
- **The folder field.** The first time you choose Claude Desktop or Terminal on a deployed command center, the menu asks "Where is your Foundation on this computer?" Type the full path, starting with `/` or a drive letter, press Save, and this browser keeps it.
- **Copy.** Beside the button, always. It copies the prompt for any other tool, and it is the way through when a prompt is too long for a door.
- **The repo line.** Under the button: "Opens in <your repo> · check it is selected before you send." When the repo is unknown, it reads "Opens in your Foundation folder. Check it is selected before you send."
- **The Claude button.** In the top bar, and in the header on your phone. It opens your default door on your Foundation with a short opening line already typed, which points Claude at your Foundation's instructions and dictionary and asks what you want to do.
- **Settings, Set up.** The Work with Claude lesson: four short steps and one prompt to try, which asks Claude to say hello and name your next setup step.

## Routines and Inbox cards

Not part of this entry.

## Connections

- **Claude Desktop.** The Claude app on the owner's computer, signed in with their own Claude account. The link opens its Code tab, and the app asks the owner to confirm the folder.
- **claude.ai/code.** Claude Code on the web, signed in with the owner's own Claude account and connected to their GitHub, so it can open the repository the link names.
- **Claude Code in the terminal.** Installed by [Prep](prep.md) at Mastery. The link opens it in the owner's terminal once it has run on that computer at least once.
- **GitHub.** The repository the Deploy button made. It is how claude.ai/code finds the Foundation, and how the command center names it on the repo line.

## Autopilot

Nothing in this entry runs on its own, by design. Every Open in link stops at the point of sending: Claude opens with the prompt typed and waits for the owner. What this entry automates is the setup around that moment, the door, the folder and the repository, so that from here every prompt in the dictionary reaches the right place with one press. The owner runs it each time they press Open in, and the run lead runs it once, as the proof.

## Proof

One real prompt from the owner's own command center opens through their default door with the right repository or folder selected, the owner reads it and presses Enter, and Claude answers from inside the Foundation, naming the business and the next setup step.

- **Complete adds:** the default door chosen in the menu stays chosen after the page reloads, Claude Desktop asks to confirm the folder and the folder it names is the Foundation, and the Claude button in the top bar opens a fresh session on the same repository.
- **Mastery adds:** the Terminal door opens Claude Code in the Foundation folder, the warning "Prompt from an external link" shows and the owner can say why, and a prompt too long for a door shows the reason and copies cleanly instead.

## Complete when

**Fitted.** passes when the default door is the one the owner chose, and the folder or repository each door opens is the owner's own Foundation.

**Autopiloted.** passes when one press of Open in reaches Claude with the prompt typed and the Foundation selected, with no copying, pasting or folder hunting by hand, and the only step left to the owner is the read and the Enter.

**Visible.** passes when every prompt shows the Open in button, Copy beside it, and the repo line naming the Foundation under it.

**Connected.** passes when each door the owner uses opens on their own Foundation: the GitHub repository on claude.ai/code, and the folder on Claude Desktop and in Terminal.

**Recorded.** passes when `key/knowledge/system.md` says in plain words which doors the owner works from, with no path from their computer in it, and the receipt names what was proven.

**Tested.** passes when the run has opened a prompt through each door the owner chose and checked the repository or folder Claude selected against the repo line.

**Proven.** passes when Claude answered a real prompt from the owner's own command center, sent by the owner pressing Enter.

**Coherent.** passes when the repo line, the repository claude.ai/code selects, and the folder Claude Desktop confirms all name the same Foundation, and the folder path lives only in that browser.

**Reversible.** passes when the owner can change their default door in the menu, change or clear the saved folder, and the command center still opens every prompt through Copy with nothing remembered.

**Explained.** passes when the owner can say in one sentence which door they use, why they check the repo line, and that nothing is sent until they press Enter.

**Owner sends.** passes when no prompt was sent by the run, the link or any tool, and every message Claude received was sent by the owner's own Enter.

## Changing it

- **Modify.** Change your default door with the arrow beside Open in: choose another door, and it becomes the default for this browser. Change the saved folder from the same menu, in the folder field, when your Foundation moves on your computer. On another computer or browser, the menu asks again, because each browser keeps its own.
- **Upgrade.** Ask for Work with Claude again at the next tier. The run skips what you already have, such as a default you chose, and adds what the new tier lists, such as the Terminal door at Mastery.
- **Remove.** There is nothing in your repository or database to remove. To forget your default door and folder, clear this site's data in your browser's settings. The Open in buttons stay, because they are part of the command center, and they start again at Claude Desktop.

## How it is done

**The loop, every time.** Find the prompt. Press Open in. Claude opens with the prompt typed. Check the repository or folder Claude shows is your Foundation. Read the prompt. Press Enter. Four checks of your own eyes, and one key, and the rest of the dictionary flows from it.

**Why the owner presses Enter.** A prompt asks Claude to change your Foundation: to write files, to run commands, sometimes to take something live after your yes. The moment you press Enter is your yes to that conversation starting. A link that sent on its own would let any page, or any message with a link in it, start work in your business without you. So the links in your command center fill in the prompt and stop. This is the one rule of this entry, and it holds for every door.

**Choosing a door.** All three reach the same Claude and the same Foundation, so choose the one that fits your day.

- **Claude Desktop** suits most owners. It is a familiar app, it shows your files as Claude works, and it runs on your own computer, where your command center saves.
- **claude.ai/code** suits an owner who works from different computers, or who has not set up a folder yet. It needs only a browser and your GitHub, and it works from a deployed command center straight away.
- **Terminal** suits an owner who already works in a terminal. It is the quickest of the three once it is set up.

You can use more than one. Switching is one choice in the menu, and the door you choose stays your default in this browser until you choose another.

**Opening through Claude Desktop.**

1. When Claude Desktop is not your default yet, press the arrow beside Open in and choose it. The button now reads Open in Claude Desktop.
2. On a deployed command center, the first time, the menu asks "Where is your Foundation on this computer?" Type the full path to your Foundation folder, starting with `/` or a drive letter, and press Save. Typing `pwd` in a terminal inside the folder shows the path. The browser keeps it for next time. On your own computer, the command center already knows its folder and skips this.
3. Press Open in.
4. Your browser asks whether to open Claude. Allow it. You can tell your browser to remember the choice.
5. Claude Desktop opens on its Code tab and asks you to confirm the folder. Check it is your Foundation folder, and confirm. This is the habit worth keeping: the folder is where Claude will work.
6. The prompt is typed in. Read it, and press Enter.

**Opening through claude.ai/code.**

1. Choose claude.ai/code in the menu, then press Open in.
2. A new browser tab opens Claude Code on the web, with the prompt typed in and your GitHub repository selected.
3. Look at the repository Claude shows. It should match the name on the repo line under the button. If you have more than one repository, this is where a wrong one would show.
4. Read the prompt, and press Enter.

When the command center does not know your repository yet, the menu says so: "Your GitHub repo is not known yet. Connect GitHub in Setup, or copy the prompt." On Vercel, the repository comes from the project's own Git connection. On your computer, it comes from the folder's git remote, so a folder that was never pushed to GitHub has none.

**Opening through Terminal.**

1. Run Claude Code once in your terminal on this computer, from any folder, so your computer knows how to open it from a link. [Prep](prep.md) installs Claude Code at Mastery.
2. Choose Terminal in the menu. The first time on a deployed command center, the menu asks for your Foundation folder, the same as for Claude Desktop, and the browser keeps one path for both. Then press Open in.
3. Your browser asks whether to open Claude Code. Allow it.
4. Your terminal opens Claude Code in your Foundation folder, with the prompt typed, and a warning: "Prompt from an external link".
5. Read the prompt, and press Enter.

**What the warning means.** Claude Code shows "Prompt from an external link" whenever a prompt arrives from a link, so you know the words in front of you came from a page and were typed by no one at your keyboard. It is expected here: the link came from your own command center. It is also the reason to read every prompt before you send it. A prompt you did not expect, from a page you do not recognize, is one to close without sending.

**Checking the repo line.** Under every Open in button, a line names your Foundation: "Opens in <your repo> · check it is selected before you send." Glance at it before you press, and glance at Claude after it opens. Owners who build more than one business, or who have cloned more than one Foundation, are the ones this saves. Claude works in whatever folder or repository is selected, so the right one selected is the difference between building your business and building someone else's.

**Copy, for everything else.** Copy sits beside Open in on every prompt. It copies the prompt exactly, for any tool the three doors do not cover. It is also the way through for a long prompt. Claude Desktop and claude.ai/code take prompts up to about 14,000 characters, and Terminal up to 5,000. Most prompts in the dictionary are one line, far under both. A longer one, such as a first session's setup prompt, shows "This prompt is too long to open in <door>. Copy it instead." for the door it exceeds. Copy it, open Claude the way you usually do, paste, and send.

**The Claude button.** The Claude button in the top bar, and in the header on your phone, opens your default door on your Foundation with one short line already typed:

> <your chief of staff>, read CLAUDE.md and ninja/library.md. I want to work on <your business>'s command center. Ask me what I want to do.

The line starts with the name you gave your chief of staff, set on [Your team](../modules/agentic/agents.md), or with Claude until you choose one, and it names your business as your profile has it. Press Enter, and Claude reads your Foundation's instructions and the dictionary's library, then asks what you want to work on. Use it when you want to ask Claude something of your own: a question about your business, a change to a page, a "Check my system". Everything in this entry holds for it too. Check the repository or folder, read the line, then press Enter.

**When a door does not open.**

- **Nothing happens on Claude Desktop.** The Claude app is not installed on this computer, or your browser blocked the link. Install Claude Desktop, or allow the site to open it, and press again. Copy always works in the meantime.
- **Nothing happens on Terminal.** Claude Code has not run on this computer yet. Run it once in your terminal, then press again.
- **The wrong folder opens.** Your Foundation moved, or the path has a typo. Change it in the menu's folder field.
- **The wrong repository is selected.** Choose the right one in Claude before you send, then check the repo line in your command center names it. If the line names the wrong one, the command center is reading a different remote, and the run fixes that with you.
- **A different computer.** Each browser keeps its own default and its own folder, so a new computer asks again. That is how the path to your folder stays on the computer it belongs to.

**The first run of this entry.** The run lead reads where the owner is, asks the questions above, and opens one prompt with them through the door they chose, on their own command center. The owner checks the repo line, opens the prompt, checks the folder or repository, reads it, and presses Enter. Claude answers from inside the Foundation. At Complete the run repeats this through each door the owner wants, and at Mastery it adds the Terminal door and a long prompt through Copy. The scribe records which doors the owner uses in `key/knowledge/system.md`, in plain words and with no path from their computer, in one work commit and its build log entry, [the runner](../runner/run.md)'s way.

**Why the folder stays in the browser.** The path to your Foundation on your computer names your computer's user account. Your repository travels to GitHub, to Vercel and to anyone you share it with, and your database is read by every page. The browser on your own computer is the one place that path belongs, so that is the only place it is kept. [The rules](../foundation/rules.md) keep the same promise for your secrets.

## Next

Open your first real prompt. Your Setup page names the next setup step, and its prompt is ready with Open in beside it. When setup is done, ask for your first entry the same way, with "Install the Monday brief.", so your week lands in your Inbox on one screen. From here, every entry in this dictionary starts with the loop you just learned: press Open in, check your Foundation, read, and press Enter.
