---
id: frameworks/prep
kind: framework
title: Prep
target: any
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, integrations-engineer, qa-lead, guide]
specialists: []
level: 1
version: 1
---
# Prep

## What it is

Your computer and your AI tools, ready for everything that comes after. You choose how far to go: an AI assistant that knows your business, a connected setup where AI makes changes you approve, or the full set of tools on your own machine. Each depth ends with a check you see on your own screen, so you never build on a broken setup.

The job it takes off your plate: working out which tools you need, in which order, and whether they work. What you still decide: how far to go, which of your tools to connect, and every sign in and payment, which you make yourself in your own browser.

The guided, teaching version of this entry is the Dojo setup session, [on its own page](https://lb-share.lightbrands.ai/s/vz0jbzjt0a425cwn). It keeps its own words, and it is where to go when you want every term taught as you go.

## The bar

Every step is one small action, confirmed on screen before the next one. The owner never pastes a password, a key, a code from a text message or payment details into a chat. Each depth builds on the ones before it, and the check of each depth below is run again quickly, so the setup underneath is proven. At the end the owner can name what they now have, and every tool is signed in to their own account.

## Depth tiers

- **Essentials (Level 1, Beginner).** An account at claude.ai or chatgpt.com (free is enough), the interface learned, clear prompts, a Project named after the business with instructions that describe it, and the words that matter: prompt, context, model, Project, agent, skill, connector, hallucination.
- **Complete (Level 2, Experienced).** Adds a paid Claude plan (Pro or Max), your everyday tools connected to Claude, a GitHub account with two factor sign in, a private repository named after the business, and Claude Code on the web making changes through pull requests that you read and merge.
- **Mastery (Level 3, Ninja).** Adds the full toolchain on your own computer: Warp, Apple's developer tools, Homebrew, Node.js, Git with your name, the GitHub CLI, Claude Code and the Vercel CLI, all signed in, with a code editor if you want one.

## Questions

After the shared questionnaire, where the tier is the level you are preparing:

1. When the level is not clear yet: "Do you want to set up Level 1, 2 or 3?" with each level explained as in Depth tiers. Default: Level 1. When you are unsure and want help deciding, five questions place you, one at a time:
   1. How often do you use ChatGPT or Claude today: never, a few times, most weeks, or every day?
   2. Have you ever had an AI write or change a file for you, beyond answering a question in chat?
   3. Do you have a GitHub account, and have you used it to save or share work?
   4. Have you ever opened a terminal on your computer and typed a command?
   5. Do you have a paid Claude plan, Pro or Max?
2. "Which assistant are you using: Claude or ChatGPT?" Default: Claude. Level 1 works in either. Levels 2 and 3 need Claude, because Claude Code is part of them.
3. For Mastery only: "Are you on a Mac or on Windows?" Default: Mac.

Prep writes no files on your computer until the Mastery check, so the write consent is asked only at Mastery, for the copy of your repository where the check's page is written. At Complete, Claude Code on the web proposes its one file as a pull request, and you merge it yourself.

## Parts

Not part of this entry.

## Crew

- **Run lead.** Holds the stages and the gates, and finds which levels are already done so nothing is repeated.
- **Business analyst.** Places the owner at a level, asks the questions and drafts the run brief.
- **Integrations engineer.** Owns every sign in and connection: the assistant account, the Claude connectors, GitHub, the GitHub CLI and Vercel, each signed in by the owner in their own browser.
- **QA lead.** Owns the proof: the check of the chosen level, and the quick checks of the levels below it.
- **Guide.** Teaches each term the first time it appears, gives the receipt and offers the next move.

## Data

Not part of this entry.

## Screens and panels

Not part of this entry.

## Routines and Inbox cards

Not part of this entry.

## Connections

Every connection here uses the first door: the owner connects their own account, signing in themselves in their browser and telling the assistant when it is done.

- **The assistant.** claude.ai or chatgpt.com, at every tier.
- **Claude connectors** (Complete). In Claude, Settings, Connectors: the tools the owner already uses, such as Google Drive, Gmail or Google Calendar.
- **GitHub** (Complete). An account at github.com, then Claude Code on the web at claude.ai/code, given access to the business repository.
- **The GitHub CLI and Vercel** (Mastery). `gh auth login` with GitHub.com, HTTPS and the web browser sign in, and `vercel login`, finished in the browser.

## Proof

The check of the chosen level, seen on the owner's screen:

- **Essentials.** In their Project, the owner asks one real question from their week. The answer uses what they told the Project about their business.
- **Complete.** In claude.ai/code, with the repository selected, the owner asks: "Add a file called about-the-business.md describing my business in a few paragraphs, and open a pull request." They read the pull request on GitHub, merge it, open the repository and see the file.
- **Mastery.** From `~/code`, the Complete repository is cloned with `gh repo clone <their-username>/<repository>`, an `index.html` page that introduces the business is added, committed and pushed, and `vercel` deploys it. The owner opens the live link and the page loads.

Before a deeper level, the check of each level below it passes again, quickly.

## Changing it

- **Modify.** Connect or disconnect a tool, move to the other assistant for Level 1, or add the optional code editor.
- **Upgrade.** Prep leaves no row in `installed`, because the Key does not exist yet. To go deeper, ask for Prep again at the next tier. The run proves the levels below with their checks, then takes the new level step by step.
- **Remove.** Prep keeps no business records, so there is nothing to export. Accounts and plans belong to the owner: the owner signs out of or cancels any of them in their own browser, and the assistant never cancels a plan or deletes an account.

## How it is done

**Why levels.** One ladder runs through the Dojo, the same one the weekly calls follow. Level 1 makes the assistant fluent in the business. Level 2 lets AI build real things that the owner reviews and approves. Level 3 moves the work onto the owner's own computer, where Claude Code can see and run everything. Nothing in the dictionary is locked behind a level: the level only says which tools are ready.

**How the run keeps you safe.** The assistant never asks for a password, a key, a code from a text message or payment details, and tells the owner never to paste one into the chat. When a step needs a sign in or a payment, the owner does it in their browser and says when it is done. After each step, the assistant names what the owner should see, and when it is something else, fixes that before moving on. When the assistant is unsure what the screen shows, it asks for a description or a screenshot.

**Level 1, step by step.**

1. **The account.** Sign in at claude.ai or chatgpt.com, or create a free account.
2. **The interface.** Where to start a new chat, where past chats live, how to attach a file or a photo, and how to use voice. Start a new chat and say hello.
3. **Prompts.** A prompt is what you say to the assistant. Ask one vague thing, such as "help me with marketing", then the same thing clearly: who you are, what you want, what good looks like, and the format you want back. Compare the two answers.
4. **Context.** The assistant knows only what it is given. A Project gives it lasting context: instructions and files it reads every time. Create a Project named after the business, with instructions describing the business, who it serves and how you like to work. In ChatGPT, Settings, Personalization adds custom instructions as well.
5. **Agents.** An agent is an assistant with a role, knowledge, and tasks it runs the same way every time. A chat answers, and an agent does a job. The Project is where your agents will live.
6. **The words.** Prompt, context, model, Project, agent, skill, connector and hallucination, one plain sentence each.
7. **The mindset.** Treat it like a capable new hire: brief it well, give it the whole job, and check its work.

**Level 2, step by step.**

1. **The plan.** Claude Code needs a paid plan. In Claude, Settings, Billing, choose Pro or Max, entering payment yourself.
2. **Connectors.** A connector lets Claude read and act in a tool you already use. Connect yours in Settings, Connectors, then ask one question that needs one, such as "what is on my calendar this week", and confirm it answered from the real data.
3. **GitHub.** Create a free account at github.com and turn on two factor sign in under Settings, Password and authentication.
4. **Why GitHub matters.** GitHub is where work lives. Every change is recorded with a name and a reason, any change can be undone, and a person and an AI can work on the same thing without overwriting each other. The words: repository, commit, branch, pull request, merge.
5. **A first repository.** At github.com/new, a private repository named after the business, with "Add a README file" turned on.
6. **Claude Code on the web.** Open claude.ai/code, connect GitHub when asked, and give it access to the new repository.
7. **The loop.** Claude Code works on a branch, shows what it changed, and opens a pull request. You read the change, then merge it.

**Level 3, step by step.** These steps are for a Mac. On Windows, the same tools run inside WSL, the Windows Subsystem for Linux: install it first, then adapt each step. The owner runs each install command in their own terminal and says what it printed, because these tools install for the whole computer and the assistant writes only inside the business folder.

1. **The terminal.** A window where you type commands instead of clicking: `pwd` (where am I), `ls` (what is here), `cd` (go into a folder), and how to paste a command and press return.
2. **Warp.** Download it from warp.dev, install it and open it. It is the terminal you work in from now on.
3. **Apple's developer tools.** `xcode-select --install`, then accept the prompt. This brings Git and the basics.
4. **Homebrew.** Copy the install command from brew.sh, paste it into Warp, then run the "Next steps" lines it prints. Confirm with `brew --version`.
5. **Node.js.** `brew install node`. Confirm with `node --version`.
6. **Git, named.** `git config --global user.name "Your Name"` and `git config --global user.email "the email on your GitHub account"`.
7. **The GitHub CLI.** `brew install gh`, then `gh auth login`. Confirm with `gh auth status`.
8. **Claude Code.** Install it with the command in Anthropic's Claude Code documentation at docs.claude.com, then `mkdir -p ~/code && cd ~/code && claude`, and sign in with your Claude account.
9. **The Vercel CLI.** Vercel puts websites live. `npm install -g vercel`, then `vercel login`, finished in your browser.
10. **An editor.** Optional: a code editor to read files, such as Visual Studio Code.

**When someone wants it built for them.** Prep is for owners who learn and build. An owner who would rather have Light Brands build takes the setup session's other road: it interviews them and writes a Build Brief to send through dojo.lightbrands.ai/install.

**Going deeper.** The setup session is the same path taught at full length, and saying its sentence again picks up where you stopped. The weekly calls follow the same three levels.

## Next

Build your Ninja home: one folder that holds your business, the roles in it and their skills. Say "Install Home." It works at every level, and it is the step [Home](home.md) describes. When you are ready to go deeper first, say "Install Prep at Complete" or "Install Prep at Mastery."
