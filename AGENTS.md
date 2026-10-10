# Agents

Every AI tool working in this project follows `CLAUDE.md`. Read it first. The rules there apply to you in full.

<!-- lb-standards:start v1 2026-10-10 · synced from Light-Brands/qie _qie/core/templates/repo-standards/agents-block.md · edit there, then re-sync -->
## Light Brands standards

This repo is part of the Light Brands portfolio. Anything above this section that is specific to this repo takes precedence; everything below is the shared default. The source documents live in the private `Light-Brands/qie` repo (org access required). When this repo is opened through the QIE hub, the same files are reachable locally at `_qie/...`.

- **Stack.** New web builds follow the [Light Brands Web Development Standard](https://github.com/Light-Brands/qie/blob/main/_qie/core/data/lightbrands-web-development-standard-2026-06-10.md): Next.js App Router, TypeScript, Tailwind + shadcn/ui, Supabase, Vercel. A client's written tech spec wins; propose any alternative in writing and get sign-off before building.
- **Observability.** Next.js apps ship Sentry, PostHog, Vercel Analytics and Speed Insights. Template and wiring notes: [observability template](https://github.com/Light-Brands/qie/tree/main/_qie/core/templates/observability).
- **Creative.** User-facing surfaces follow the [Kaze build doctrine](https://github.com/Light-Brands/qie/blob/main/_qie/core/data/kaze-build-doctrine.md) and its Seven Laws (Breath, Tension, Presence, Honesty, Memory, Weight, Silence). Brand direction: [creative direction](https://github.com/Light-Brands/qie/blob/main/_qie/core/data/light-brands-creative-direction-2026-06-15.md).
- **Inputs.** Text inputs and chat composers use the [fluid-input pattern](https://github.com/Light-Brands/qie/tree/main/_qie/core/templates/fluid-input).
- **Secrets and privacy.** Keep keys, tokens and customer data in `.env*.local` (gitignored); document variable names in `.env.example`. Logs use generic categories, never personal information.
- **Git.** Work on a branch and open a PR. Stage files explicitly, pull and rebase on conflict, and leave history intact (no force pushes to shared branches).
- **Writing voice** for anything a person reads: US English, plain and direct, commas and colons in place of em dashes, and positive claims stated on their own.
- **Org rules.** New repos are created under the `Light-Brands` org. The canonical hub rules are in [QIE AGENTS.md](https://github.com/Light-Brands/qie/blob/main/AGENTS.md).
<!-- lb-standards:end -->
