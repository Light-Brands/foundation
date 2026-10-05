# The Ninja home

The Ninja home is the folder a business lives in before it has a Foundation. It holds the business facts, the roles and their skills, in the same Key shape a Foundation uses, without the app. The Ninja framework session builds it, and [the home framework entry](../frameworks/home.md) installs it.

Read this before you act on a Ninja home. Every run obeys [the rules](rules.md).

## The structure

Everything lands in one folder, named after the business, in this shape and no other:

```
<business>/
  CLAUDE.md                     one line, given below
  key.yaml                      the ring: stage, roster, skills, runs, installed
  knowledge/
    context-block.yaml          what the business is, stated by the owner
  agents/<role>/charter.md      one per role, eight sections
  skills/<slug>/SKILL.md        one folder per skill, created with the first skill
  starter-kit.html              the rendered view of all of the above
```

- `CLAUDE.md` is this one line: "This folder follows the Ninja framework from dojo.lightbrands.ai. Read key.yaml, the knowledge folder and the charters key.yaml names, then follow the Ninja framework before you change anything here."
- `skills/` is created with the first skill, so a home with no skills yet has no `skills/` folder.
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
    added: <YYYY-MM-DD>
    version: 1
skills: []
runs: []
installed: []
provenance:
  stated_by: <the person's name>
  recorded: <YYYY-MM-DD>
  guide: dojo/agent
```

The lists `roster`, `skills` and `runs` only ever grow. Every date in the home is written YYYY-MM-DD.

- A `skills` row has `slug`, `path`, `agent` and `task`. Adding a role's skills moves its roster row to `version: 2`.
- A `runs` row is added the first time a task runs and passes its check: `date`, `agent`, `task`, the `input` used, and `check: passed`. That row marks the seed complete.
- An `installed` row is added for every entry installed from the Ninja framework dictionary: `entry` (such as `skills/write-the-brief`), `from` (the dictionary version, such as `dictionary@0.1.0`), `tier` (`essentials`, `complete` or `mastery`), `version` (the `version` in the entry's front matter), `files` (every file the entry put in place, as paths relative to the home folder) and `installed` (the date). It is what an upgrade compares the owner's files against. An upgrade updates its row, and removing the entry removes it.

## The files

- **`knowledge/context-block.yaml`** holds the business as the owner states it, with the same fields as a Foundation's context block, so it moves in as it is: `business`, `short_name`, `what_we_do`, `who_we_serve`, `how_we_sound`, `website`, `email`, `phone`, `city`, `timezone`, `owner` (`name`, `first`, `role`), `stated_by` and `recorded`. `how_we_sound` is three words in one line, separated by commas. `owner.role` is the role in the owner's own words. A fact the owner has not given stays an empty string, `""`.

```yaml
# key: knowledge/context-block.yaml
business: Harbor Studio
short_name: Harbor
what_we_do: A small yoga and pilates studio
who_we_serve: Adults in Portland who are new to yoga or pilates, and our regulars
how_we_sound: Warm, clear, grounded
website: https://harborstudio.example
email: hello@harborstudio.example
phone: 503 555 0100
city: Portland
timezone: America/Los_Angeles
owner:
  name: Jo Harbor
  first: Jo
  role: Owner and lead teacher
stated_by: Jo Harbor
recorded: 2026-10-05
```

- **A charter** has its path comment on the first line, a title line naming the agent, its role and the business, then eight `##` headings, in this order, every time: Role, Who I serve, How I work, What I know, What I never do, Tasks, Skills, Memory. A complete example:

```markdown
# key: agents/front-desk-lead/charter.md
# Wren, front desk lead at Harbor Studio

## Role
Answers every class question the same day and books new people into trial classes, so the owner can teach.

## Who I serve
Adults in Portland who are new to yoga or pilates, and the studio's regulars. I answer to Jo, the owner.

## How I work
I reply the same day, in a warm, clear and grounded voice.
I answer from the schedule and the studio's own words, and never guess.
I hand anything I cannot answer to Jo, with the question in one line.

## What I know
Harbor Studio is a small yoga and pilates studio in Portland. A trial class is the first step for every new person.

## What I never do
I never set prices, give refunds or make exceptions. Those are Jo's.
I never give medical advice or answer questions about injuries or health.
I never promise results.

## Tasks
Day two.

## Skills
Day two.

## Memory
```

- **A skill file** opens with front matter (`name`, `description`) and has four sections: Input, Steps, Output, Check.
- **The starter kit** is one HTML page that shows all of the above. It is a view of the folder, rebuilt whenever the folder changes.

## Reading the state

Look for `key.yaml` first. If it exists, work inside that folder and never make a second one. No `key.yaml` means no home yet. A roster row with empty `skills` means the role is built and its skills are next. A `key.yaml` with skills means the owner is back for more: a new role, a new task for a role, or a new skill for a task.

When the assistant cannot write files, each file becomes a code block with its path on its first line, and the owner saves them one at a time. When the owner cannot save files either, the business becomes a Claude Project: the business brief as its instructions and each file as a document in its knowledge.

## Moving into a Foundation

The home moves into a Foundation without being redone, because both use the same Key shape. Each file's path comment names where it lands: a home path is the same path under the Foundation's `key/` folder.

1. Copy `knowledge/context-block.yaml`, `agents/` and `skills/`, when there is one, into the Foundation's `key/`, at the same paths. The home's `key.yaml` is merged into the Foundation's `key/key.yaml` at step 3, never copied over it, because setup already wrote that file.
2. Read the copied `key/knowledge/context-block.yaml` and compare it with the Foundation's fields: `business`, `short_name`, `what_we_do`, `who_we_serve`, `how_we_sound`, `website`, `email`, `phone`, `city`, `timezone`, `owner` (`name`, `first`, `role`), `stated_by` and `recorded`. A home built by the original Ninja framework session holds only `business`, `what_we_do`, `who_we_serve`, `how_we_sound`, `website`, `owner` (`name`, `role`), `stated_by` and `recorded`. Ask for each missing field, one per message, with a default the owner confirms: `short_name` from the business name, `owner.first` from `owner.name`, and the time zone from the city. Then write the full shape, before the save in Settings, Preferences. Every value the old block holds is kept as it is.
3. Merge the home's `key.yaml` into `key/key.yaml`. Take the home's `roster`, `skills`, `runs` and `installed` as they are, and the home's `provenance` fields `stated_by`, `recorded` and `guide`. Keep the Foundation's own `client`, `home: repo`, `apps`, `routines` and `provenance.base`. `base` is the commit setup recorded, and the build log starts after it, so it never takes a value from the home. Each `installed` row's `files` stay correct, because a home path is the same path under `key/`.
4. A skill file must begin with its front matter. If a path comment sits above the opening `---`, move it below the front matter.
5. The owner opens Settings in the command center, enters the business facts from the home's context block, and presses Save. Settings is the only writer of the Foundation's context block, and its Save writes the full shape.
6. The home's own `CLAUDE.md` stays behind, because the Foundation has its own. The starter kit stays with the home folder, because it is a view of the home and never part of the Key.
7. Run `npm test`. The Key checks read every file and name anything that needs a fix. Then run `npm run key:sync`, make the move-in's own work commit on `main`, and add the build log entry, `Kind: setup`, in its own log-only commit. The move-in is one of the Foundation's own setup steps, so it keeps its own commits, as [Foundation](../frameworks/foundation.md) says.

Every role, skill and run the owner built keeps its name, its slug and its history. The [Foundation primer](primer.md) describes what the business gains next: the app, the departments and jobs, routines, apps and the build log.
