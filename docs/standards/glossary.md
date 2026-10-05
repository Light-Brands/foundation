# Glossary

One meaning for each word. If a word has two meanings in the code or a prompt, one of them is wrong.

- **Category**: one of the eleven top-level areas of the business: Command, Attract, Sell, Deliver, Keep, Money, Team, Plan, Vendors and assets, Risk, System. The list lives in `src/lib/layout/categories.ts` and never grows.
- **Sub-category**: one screen area inside a category, such as Booking inside Deliver.
- **Module**: a product that sets up one sub-category, such as booking. A module points at a role, skills, workflows and an app in the Key.
- **The Key**: the `key/` folder, the business's knowledge, roles and skills kept in one place.
- **Role**: a job in the business, such as front desk. Its slug is the agent's key everywhere.
- **Agent**: Claude working in a role, following that role's charter.
- **Persona**: the name given to a role's agent. A persona is a label on a role, and the role slug is what code uses.
- **Skill**: a written procedure for one repeatable task, in `SKILL.md`, with Input, Steps, Output and Check.
- **Workflow**: a written job an agent runs on a trigger, in `key/workflows/`.
- **Automation**: a workflow's trigger and policy inside an app's definition, such as "when a booking is added, run the reminders workflow".
- **App**: a data app inside the Key, with a definition and its own tables, such as Booking.
- **The app**: this command center, the Next.js project the owner opens in a browser.
- **Card**: one item in the Inbox, with a kind, a category, a title and a status.
- **Inbox**: the list of cards from every part of the business, in Command.
- **Request**: something a visitor or a member asks for through a form or a Dojo door. A request becomes a card.
- **Build log**: the monthly files in `key/log/`, one entry for each thing built.
- **System document**: `key/knowledge/system.md`, the plain-words record of what is running, built from the Key and the build log.
