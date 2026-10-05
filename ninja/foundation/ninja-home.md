# The Ninja home

The Ninja home is the folder a business lives in before it has a Foundation. It holds the business facts, the roles and their skills, in the same Key shape a Foundation uses, without the app. The Ninja framework session builds it, and [the home framework entry](../frameworks/home.md) installs it.

Read this before you act on a Ninja home. Every run obeys [the rules](rules.md).

## The structure

Everything lands in one folder, named after the business, in this shape and no other:

```
<business>/
  CLAUDE.md                     one line: This folder follows the Ninja framework from dojo.lightbrands.ai. Read it before you change anything here.
  key.yaml                      the ring: stage, roster, skills, runs, installed
  knowledge/
    context-block.yaml          what the business is, stated by the owner
  agents/<role>/charter.md      one per role, eight sections
  skills/<slug>/SKILL.md        one folder per skill
  starter-kit.html              the rendered view of all of the above
```

- Folder and file names are lowercase, words joined with hyphens.
- A role's folder is the role, never the persona.
- Every file except `CLAUDE.md` and the kit carries its path on its first line as a comment, for example `# key: agents/client-care/charter.md`.
- Write only inside that folder. Never touch anything else.

## key.yaml

```yaml
# key: key.yaml
key: 1
client: <business-slug>
name: <Business name>
stage: seed
home: folder
roster:
  - persona: <Agent persona name>
    role: <role-slug>
    charter: agents/<role-slug>/charter.md
    added: <date>
    version: 1
skills: []
runs: []
installed: []
provenance:
  stated_by: <the person's name>
  recorded: <date>
  guide: dojo/agent
```

The lists `roster`, `skills` and `runs` only ever grow.

- A `skills` row has `slug`, `path`, `agent` and `task`. Adding a role's skills moves its roster row to `version: 2`.
- A `runs` row is added the first time a task runs and passes its check: `date`, `agent`, `task`, the `input` used, and `check: passed`. That row marks the seed complete.
- An `installed` row is added for every entry installed from the Ninja framework dictionary: `entry` (such as `skills/write-the-brief`), `from` (the dictionary version, such as `dictionary@0.1.0`), `tier` (`essentials`, `complete` or `mastery`), `files` (every file the entry put in place, as paths relative to the home folder) and `installed` (the date). It is how an upgrade keeps the owner's own edits. An upgrade updates its row, and removing the entry removes it.

## The files

- **`knowledge/context-block.yaml`** holds the business as the owner states it: `business`, `what_we_do`, `who_we_serve`, `how_we_sound` (three words), `website`, `owner` (`name`, `role`), `stated_by` and `recorded`.
- **A charter** has eight headings, in this order, every time: Role, Who I serve, How I work, What I know, What I never do, Tasks, Skills, Memory.
- **A skill file** opens with front matter (`name`, `description`) and has four sections: Input, Steps, Output, Check.
- **The starter kit** is one HTML page that shows all of the above. It is a view of the folder, rebuilt whenever the folder changes.

## Reading the state

Look for `key.yaml` first. If it exists, work inside that folder and never make a second one. No `key.yaml` means no home yet. A roster row with empty `skills` means the role is built and its skills are next. A `key.yaml` with skills means the owner is back for more: a new role, a new task for a role, or a new skill for a task.

When the assistant cannot write files, each file becomes a code block with its path on its first line, and the owner saves them one at a time. When the owner cannot save files either, the business becomes a Claude Project: the business brief as its instructions and each file as a document in its knowledge.

## Moving into a Foundation

The home moves into a Foundation without being redone, because both use the same Key shape. Each file's path comment names where it lands: a home path is the same path under the Foundation's `key/` folder.

1. Copy `key.yaml`, `knowledge/context-block.yaml`, `agents/` and `skills/` into the Foundation's `key/`, at the same paths.
2. In `key/key.yaml`, change `home: folder` to `home: repo`. Keep `roster`, `skills`, `runs`, `installed` and `provenance` as they are, and add the Foundation's lists `apps: []` and `routines: []`. Each `installed` row's `files` stay correct, because a home path is the same path under `key/`.
3. A skill file must begin with its front matter. If a path comment sits above the opening `---`, move it below the front matter.
4. The owner opens Settings in the command center, enters the business facts from the home's context block, and presses Save. Settings is the only writer of the Foundation's context block, and its Save writes the full shape.
5. The home's own `CLAUDE.md` stays behind, because the Foundation has its own. The starter kit stays with the home folder, because it is a view of the home and never part of the Key.
6. Run `npm test`. The Key checks read every file and name anything that needs a fix. Then make the commit, add the build log entry and run `npm run key:sync`.

Every role, skill and run the owner built keeps its name, its slug and its history. The [Foundation primer](primer.md) describes what the business gains next: the app, the departments and jobs, routines, apps and the build log.
