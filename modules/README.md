# Modules

This folder is empty today. It holds the modules that arrive with the module engine in a later update from Light Brands.

A module is a product that sets up one sub-category of the business, such as booking inside Delivery. When the engine arrives, each module lives in its own folder:

```
modules/<department id>/<job id>/
  module.ts     what the module is, and what it needs
  ui/           the screens it adds
```

A module holds no business data and no copy of a role, skill, routine or app. It points at them in `key/`: its role in `key/agents/<role>/`, its skills in `key/skills/`, its routines in `key/routines/` and its app in `key/apps/<app>/`. The Key stays the one place the business's knowledge lives.

Every module joins one of the eleven categories (Command center, Marketing, Sales, Delivery, Customer care, Finance, People, Leadership, Operations, Protection, Settings), and the list of categories never grows. See `docs/standards/layout.md` and `docs/standards/glossary.md`.
