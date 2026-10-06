# Glossary

One meaning for each word. If a word has two meanings in the code or a prompt, one of them is wrong.

- **Category**: one of the eleven top-level areas of the business. The founder reads a category as a department: Command center, Marketing, Sales, Delivery, Customer care, Finance, People, Leadership, Operations, Protection, Settings. The list lives in `src/lib/layout/categories.ts` and never grows.
- **Sub-category**: one screen area inside a category. The founder reads it as a job done in that department, such as Book appointments inside Delivery. Ids stay the same (`deliver`, `booking`); only the words a founder sees changed.
- **Module**: a product that sets up one sub-category, such as booking. A module points at a role, skills, routines and an app in the Key.
- **The Key**: the `key/` folder, the business's knowledge, roles and skills kept in one place.
- **Role**: a job in the business, such as front desk. Its slug is the agent's key everywhere.
- **Agent**: Claude working in a role, following that role's charter.
- **Persona**: the name given to a role's agent. A persona is a label on a role, and the role slug is what code uses.
- **Skill**: a written procedure for one repeatable task, in `SKILL.md`, with Input, Steps, Output and Check.
- **Routine**: a written job an agent runs on a trigger, in `key/routines/`. Routines were called workflows before, and a Key that still says workflows is told to rename it.
- **Automation**: a routine's trigger and policy inside an app's definition, such as "when a booking is added, run the reminders routine".
- **App**: a data app inside the Key, with a definition and its own tables, such as Booking.
- **The app**: this command center, the Next.js project the owner opens in a browser.
- **Card**: one item in the Inbox, with a kind, a category, a title and a status.
- **Card kind**: the type of a card, such as `booking-request`. The installed Key declares each one with the job it belongs to, whether only the owner decides it, and when it lapses.
- **Inbox**: the list of cards from every part of the business. It is where the job "Handle what needs you" (Command center) lives, and Inbox cards land there.
- **Request**: something a visitor or a member asks for through a form or a Dojo door. A request becomes a card.
- **Build log**: the monthly files in `key/log/`, one entry for each thing built.
- **System document**: `key/knowledge/system.md`, the plain-words record of what is running, built from the Key and the build log.
