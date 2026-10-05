# Layout

Every folder has one job. Put a file where its job is listed, and never where the "never" says.

- `CLAUDE.md`, `AGENTS.md`: the builder rules. Short, pointing to `docs/standards/`. Never long explanations that belong in a standards file.
- `docs/standards/`: the coding standards. Never member-facing steps or business facts.
- `key/`: the business's knowledge, roles and skills, kept in one folder. Never customer details, business records or secrets.
  - `key/key.yaml`: the ring, the list of the roles, skills, apps and workflows.
  - `key/CLAUDE.md`: one line, the business's own instruction.
  - `key/knowledge/`: `context-block.yaml` (the business facts) and `system.md` (what is built).
  - `key/agents/<role>/charter.md`: one charter per role.
  - `key/skills/<slug>/SKILL.md`: one skill per folder.
  - `key/workflows/<slug>.md`: one workflow per file.
  - `key/apps/<app>/`: `definition.yaml` and `migrations/` for each data app.
  - `key/log/<YYYY-MM>.md`: the monthly build log. Never edited out of order.
- `core/db/migrations/`: the tables every business has: contacts, cards (the Inbox) and the business profile. Never an app's tables.
- `modules/<category>/<module>/`: a module's `module.ts` and `ui/`, arriving with the module engine. Never anything else yet.
- `src/app/`: pages, layouts, route handlers and server actions. Never logic you could test without a page.
- `src/components/`: shared interface pieces. Never data access.
- `src/lib/`: logic, grouped by job (`auth`, `data`, `db`, `key`, `layout`, `setup`). Never a page or a component.
- `src/proxy.ts`: the request gate. Nothing else lives beside it.
- `src/generated/`: files the build writes. Never edited by hand.
- `prompts/`: member-facing prompts, one per step. Never part of the Key.
- `scripts/`: commands run from npm scripts, each taking flags. Never code the app imports at run time.
- `tests/unit/`: Vitest tests. `tests/e2e/`: Playwright tests. `tests/support/` and `tests/fixtures/`: shared helpers and sample data. Never a test next to the code it covers.
- `.data/`: local PGlite data and end-to-end scratch data. Never committed.
