---
id: frameworks/home
kind: framework
title: Home
target: any
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, builder, qa-lead, scribe, guide]
specialists: []
level: 1
version: 1
---
# Home

## What it is

Your Ninja home: one folder, named after your business, that holds what your business is, the roles in it and the skills each role uses. Any AI that opens the folder knows your business, your roles and your skills, and keeps building inside the same shape. When you deploy your Foundation, the folder moves in as it is.

The job it takes off your plate: explaining your business again to every AI you use, and keeping track of which role does what and how. What you still decide: what your business is in your own words, which roles it has, what each one never does, and which tasks they take on.

The guided, teaching version of this entry is the two day Ninja framework session from the Dojo. It keeps its own words, and it teaches what an agent and a skill are by building yours.

## The bar

The home is built in exactly the structure [the Ninja home](../foundation/ninja-home.md) defines, and in no other shape. Every fact in it is stated by the owner. Every role has a charter with the same eight headings, every skill has the same four sections, and every file but two carries its path on its first line. The owner sees the exact folder and file list and says yes before anything is written. The work is finished when the agent, asked in a fresh conversation, says what it knows about the business and its role, and the owner agrees with the answer.

## Depth tiers

- **Essentials.** The home and one role: the folder, `key.yaml`, the one line `CLAUDE.md`, `knowledge/context-block.yaml`, the charter for the role you play with its Tasks and Skills marked "Day two", and the starter kit. Working within the hour, and in about ten minutes at its quickest.
- **Complete.** A starter roster with one skill each: the roles you choose beyond your own, each with a charter, one task and the skill for that task.
- **Mastery.** A full roster, each role with its three daily tasks and one skill per task, and a first run logged in `runs`: task one run with a real input, its check passed.

## Questions

After the shared questionnaire, one per message:

1. "What is your name, the name of your business, and one line on what it does? If you have a website, share it." The assistant reads the site and says back, in three sentences, what it offers, who it is for and one thing that stands out, saying only what it found.
2. The write consent for this entry, word for word: "Before we build: may I set your workspace up in the standard shape? It is the same shape a full operating system uses, so anything we build today moves there later without being redone. It adds a folder named after your business and nothing outside it." Default: yes. On no, the business becomes a Claude Project instead, and the shape can be added later by asking for it.
3. "What role do you play in your business?" Then three to five questions, one at a time, until the role is concrete: who you serve, what a good week looks like, and what only you can do.
4. "What shall we call the agent?" with three persona names that fit the role and the business. Default: the first of the three.
5. "Which three words describe how your business sounds?"
6. At Complete and Mastery: "Which other roles would you like on your roster?" Default: the roles the business analyst suggests from what you have said.
7. At Complete, for each role: "What is one thing this role does every day that could be automated?" Then what goes in, what comes out, and how you would know it was done right.
8. At Mastery, for each role: "What do you do every day in this role that you think could be automated?" until there are exactly three, each with its input, output and check. Then: "What is one real input from today for task one?"

## Parts

Not part of this entry.

## Crew

- **Run lead.** Reads the state first, never makes a second home, holds the plan and the gates.
- **Business analyst.** Asks the questions, plays the role back in two sentences, and drafts the business brief and each charter for the owner to edit.
- **Builder.** Writes the folder and every file in the plan, each with its path comment.
- **QA lead.** Checks the shape (every file in its place, every path comment right, every file `key.yaml` names on disk) and runs the proof.
- **Scribe.** Writes the `key.yaml` rows, the `installed` row and the `runs` row, and rebuilds the starter kit.
- **Guide.** Teaches agent, skill and task inside the owner's own business, gives the receipt and offers the next move.

## Data

The home keeps no records and no database. Its data is the Key shape, in files:

- **`key.yaml`.** `key: 1`, `client` (the business slug), `name`, `stage: seed`, `home: folder`, and the lists `roster` (`persona`, `role`, `charter`, `added`, `version`), `skills` (`slug`, `path`, `agent`, `task`), `runs` (`date`, `agent`, `task`, `input`, `check: passed`) and `installed`, with `provenance` (`stated_by`, `recorded`, `guide: dojo/agent`).
- **`knowledge/context-block.yaml`.** `business`, `what_we_do`, `who_we_serve`, `how_we_sound`, `website`, `owner` (`name`, `role`), `stated_by` and `recorded`.
- **A charter.** Role, Who I serve, How I work, What I know, What I never do, Tasks, Skills, Memory.
- **A skill.** Front matter with `name` and `description`, then Input, Steps, Output and Check.

## Screens and panels

The home's one view is the starter kit, `starter-kit.html`: one page that shows the business and its brief, the roster as the org chart, each agent, the tasks, the skills, how to run it, and every file in the folder with its path. It is rebuilt whenever the folder changes. The command center arrives with the Foundation.

## Routines and Inbox cards

Not part of this entry.

## Connections

Not part of this entry.

## Proof

The first check. In the folder, or in a new chat opened in it, the owner says: "<Agent persona name>, tell me what you know about <Business name> and what your role is." The answer matches the business brief and the charter, and the owner agrees. When anything is off, the charter is fixed and the question asked again. At Complete, every role on the roster answers the same question.

At Mastery the proof adds the first run: "<Agent persona name>, run task one with <a real input>." The output matches the task's check, and the scribe appends the `runs` row to `key.yaml`. That row marks the seed complete.

## Changing it

- **Modify.** Edit the business brief, a charter or a skill, change a persona name, or add a Memory line. A role's slug and folder never change, because the role is its key everywhere. The lists `roster`, `skills` and `runs` only ever grow.
- **Upgrade.** A deeper tier adds what its tier lists: more roles with one skill each at Complete, the full roster with three tasks and three skills each and the first logged run at Mastery. Adding a role's skills moves its roster row to `version: 2`. Every file you edited is kept.
- **Remove.** The home is the business's own folder, so the folder is its own export. The owner keeps a copy, then moves or deletes the folder themselves. The run never deletes it.

## How it is done

**Three words, one meaning each.** The Project is the business, named after the business, or after the person when they are the business. An agent is a role in the business, with a persona name of its own, a way of working and knowledge of the business. A skill is a procedure an agent runs the same way every time: what goes in, the steps, what comes out, and a check that it worked. A task is one thing you hand an agent. The Project is never named after the agent, and the agent is never named after the business.

**The structure.** Everything lands in one folder, in [the Ninja home](../foundation/ninja-home.md) shape:

```
<business>/
  CLAUDE.md
  key.yaml
  knowledge/
    context-block.yaml
  agents/<role>/charter.md
  skills/<slug>/SKILL.md
  starter-kit.html
```

`CLAUDE.md` is one line: "This folder follows the Ninja framework from dojo.lightbrands.ai. Read it before you change anything here." Folder and file names are lowercase, with words joined by hyphens. A role's folder is the role, never the persona. Every file except `CLAUDE.md` and the kit carries its path on its first line as a comment, such as `# key: agents/client-care/charter.md`. This is how every business built through the Dojo lines up, so it can move into a Foundation later without being redone.

**Reading the state first.** The run looks for `key.yaml` before it asks anything. No `key.yaml` means no home yet. A roster row with empty `skills` means the role is built and its skills are next. A `key.yaml` with skills means the owner is back for more: a new role, a new task for a role, or a new skill for a task.

**The order of the build.** The home folder comes first: `key.yaml` with stage seed and empty lists, the one line `CLAUDE.md`, and the empty `knowledge/`, `agents/` and `skills/` folders. Then the business brief, written to the context block. Then the charter for the role, with a roster row in `key.yaml`. Then the starter kit. At Complete and Mastery, each skill goes to `skills/<slug>/SKILL.md`, the charter's Skills section lists each slug with its task number, `key.yaml` gets a `skills` row per skill, and the role's roster row moves to `version: 2`. At the close, the scribe adds the `installed` row: `entry: frameworks/home`, `from` (the dictionary version), `tier`, `files` (the context block and every charter and skill the run wrote, as paths relative to the home folder) and `installed` (the date). `key.yaml`, `CLAUDE.md` and the kit are left out of `files`, because they belong to the home itself.

**The starter kit.** One HTML page on a dark ground, phone first, printable, with every block copied to the clipboard when it is tapped. It shows everything in the folder, and its roster is the org chart. A later run reads the roster, adds a row and rebuilds the kit.

**Where you are working.** With files, the home is written as real files, in the current folder unless the owner names another place. With text only, each file comes back as a code block with its path on its first line, one file per message, for the owner to save. When the owner cannot save files either, the business becomes a Claude Project: the business brief as its instructions and each file as a document in its knowledge, and the first check is asked in a chat inside that Project.

**Why the first check.** An agent is only as good as what it knows. Asking it, in a fresh conversation, what it knows about the business and its role shows at once whether the brief and the charter carry the business, and fixing the charter there is cheaper than finding the gap in real work.

**After that, endless.** A new role in the business, a new task for a role, a new skill for a task: each is the same request, from inside the folder, and the run picks up where the roster says you are.

**Moving into a Foundation.** The home moves in without being redone, because both use the same Key shape: a home path is the same path under the Foundation's `key/` folder. [The Ninja home](../foundation/ninja-home.md) lists the steps, and [Foundation](foundation.md) runs them.

## Next

Deploy your Foundation, the command center for your business, and move your home into it as it is. Say "Install Foundation." It is the step [Foundation](foundation.md) describes. When you would rather grow the home first, say "Upgrade Home to Complete" for a starter roster with a skill for each role.
