# Foundation: free, public, one click to running

> **Superseded on 2026-10-23** by `2026-10-23-guided-claude-desktop-setup-design.md`: the Deploy Button path proved too fragile, and Lawless moved setup into Claude Desktop.

Design agreed with Lawless on 2026-10-23.

## Intent

The Foundation becomes a free public repository anyone can clone or fork. The base is the hook: a business owner sees the demo, presses one button, and minutes later has their own command center running in their own GitHub, Vercel and Supabase, signs in with a PIN, and starts building with the prompts inside it. The measure is the least friction between the button and configuring their build. (The $19 Dojo offer is now the live weekly workshop, which is kept entirely out of the product.)

## Who it is for

A business owner, not a developer, who wants their own command center running fast. They may have no Vercel, GitHub or Supabase account yet.

## The experience

1. **The button.** On the demo site (foundation.lightbrands.ai), the home page's "Get in touch" button becomes "Deploy your own". It opens Vercel's clone flow for `Light-Brands/foundation`.
2. **Vercel.** They sign up or sign in (free) and connect GitHub. Their own copy of the repository lands in their GitHub.
3. **Supabase, created for them.** In the same flow, Vercel adds Supabase through its Marketplace integration. This creates their own Supabase account (signed in through Vercel, on the same email), organization and free project, and syncs the connection settings into their Vercel project. They never visit supabase.com. Lawless chose this route over a separate Supabase sign up.
4. **Deploy.** The deploy asks for nothing: no PIN, no business name. About two minutes.
5. **First open.** The home page says their command center is ready and shows the PIN: "Here is your PIN: 1234." It has a way into sign in.
6. **First sign in.** They sign in with 1234. Before anything else opens, they must choose their own PIN of 6 to 12 digits. Then they land in the command center, pointed at the first session prompt (`prompts/first-session.md`) to start their build.
7. **After the change.** The "Here is your PIN" message is gone for good, and 1234 never opens that command center again.
8. **Have Light Brands build it for you.** Inside the command center (after sign in, never on the public home page), a button worded along the lines of "Have Light Brands build it for you" opens a short form, then their own email app with a message to hello@lightbrands.ai already written from their answers. They press send from their own address, so we can reply directly. Nothing goes through a server.

The same flow works for someone who clones or forks the repository and runs it on their own computer (`npm run dev` with the local database): first open shows 1234, the first sign in requires the change.

## The 1234 window and recovery

A fresh copy is unclaimed until someone signs in with 1234 and chooses a PIN, and its home page is public. To keep a stranger from claiming it first, **1234 expires 7 days after the deploy** (Lawless, 2026-10-23). After that, the home page stops showing it and the sign-in page explains recovery.

Recovery has two paths (Lawless, 2026-10-23, after the Vercel only route was judged too much friction):

- **Forgot PIN, the common case: an emailed code.** The screen where they choose their PIN on first sign in also asks for their email (one field). "Forgot PIN?" on the sign in page sends a 6 digit code to that email; entering it lets them choose a new PIN. Sending uses the Supabase project created at deploy (its built-in auth email), so the owner sets up nothing. Supabase's built-in sender is rate limited and only delivers to addresses on the Supabase account; the owner's own address is on it because the account was created through their Vercel sign in. Confirm this in the early end-to-end test, and if it does not hold, stop and bring the fallback to Lawless before building around it. The code expires quickly, is single use and goes through the existing sign in limiter.
- **1234 expired before they ever signed in, the rare case: their Vercel account.** No email is known yet, so the proof is the owner's own Vercel account, which only they can open: add `FOUNDATION_PIN` (6 to 12 digits) under the project's Environment Variables, press Redeploy (about a minute, nothing is lost), and sign in with it, which leads straight to choosing a PIN and giving an email. The sign in page explains this when 1234 has expired, and `prompts/setup/set-pin.md` is rewritten to walk it with Claude.

How a hosting PIN and a chosen PIN live together is the builder's to design, as long as the owner always has exactly one way back in and nobody else has any.

## Updates keep flowing

Every copy keeps receiving foundational updates from Light Brands (Lawless, 2026-10-23). A GitHub fork gets GitHub's own Sync fork. A copy made by the Deploy button is a standalone repository with no link back, so the repository ships a scheduled check (a GitHub Actions workflow) that opens a pull request in the owner's repository when `Light-Brands/foundation` has new releases; the owner accepts it like any change, and Vercel redeploys. Their own work in `key/` and their data are never overwritten. How releases are marked upstream and how conflicts with the owner's own changes are presented is the builder's to design.

## The build request form

Fields, short for low friction: name; business name and what the business does (filled from the profile when set); email; phone; what they want built, in their own words; how soon; and **"What would it be worth to you to have this built and running?"** (Lawless asked for worth, never "budget") with picks Under $2,500, $2,500 to $10,000, $10,000 to $30,000, $30,000 to $100,000, $100,000 or more, Not sure yet, plus an optional "Anything you'd like us to know about that?". The bands follow Light Brands' ladder (the $2,500 done-for-you install, the $5,000 audit, the AI Native track at $30k, $60k, $120k) and are Quinn's call. The mail goes to hello@lightbrands.ai via `mailto:`; when the device has no email app, the form offers to copy the message instead.

## Goals

- One button from the demo to a running, saving command center, with no settings typed during the deploy.
- A database from minute one, so nothing they do lands in the no-database preview mode.
- The PIN is shown once, used once, and replaced before anything is reachable.
- The repository is public and safe to be public: no secrets, no client material, a README built around the one-click start.

## Non-goals

- No mention or link to the $19 workshop. The build request button is the only Light Brands door in the product.
- No features from foundation-build (chief of staff, integrations, Stripe, emailed sign-in for clients). Connecting the two lines is a later decision.
- No custom domain setup, no email sending setup in this work.
- No change to the prompts or the Ninja dictionary beyond what the new PIN flow makes untrue.

## Anti-goals (a failure even if it technically works)

- The deploy flow asks the owner to type or copy anything.
- 1234 still opens a command center after its owner chose a PIN, or "Here is your PIN" still shows.
- An owner's copy shows "Deploy your own" on its own home page.
- A stranger can claim a copy after its 7 day window, or the build request button shows on an owner's public pages.
- Any secret, client name or private Light Brands detail is readable in the public repository or its history.
- The owner lands in "Live preview" with nothing saving, because the database did not connect.

## Decided

- **Repository:** `Light-Brands/foundation` itself goes public, with its history. A history scan on 2026-10-23 found no client names, no committed settings files and no real keys (only fake keys in tests); the only traces of Light Brands are a few old preview deploy addresses in history, which are harmless. A full secrets scan (gitleaks over every commit) still runs before the switch, and anything it finds is fixed before going public.
- **Database:** Supabase through the Vercel Marketplace integration, required in the Deploy Button so the deploy cannot finish without it.
- **Default PIN:** 1234, shown on the home page until the owner sets their own.
- **The change is required,** not optional, before any other page opens. Its rule stays 6 to 12 digits. (Lawless's request was a prompt to change; requiring it is Quinn's call, because the home page is public and 1234 is printed on it. Lawless was told.)
- **The demo button replaces "Get in touch"** and is switched on only by a setting the demo deployment has, so no owner's copy ever shows it.
- **Free:** no workshop pointer anywhere; the build request button is the one Light Brands door, inside the command center only.
- **Before going public, clean up** (Lawless approved): delete branches that are merged or stale (14 remote branches today, including `core/l3`, `feat/mountable-shell`, `ninja/spine`, `claude/foundation-open-in`), review every pull request and issue body and comment for client or private material, and clear old Actions logs. Each deletion is listed for Lawless before it happens. The secrets scan covers every ref, not only main.

## Constraints and facts the builder needs

- **Today's PIN** lives only in the `FOUNDATION_PIN` hosting setting (6 to 12 digits, `PIN_FORMAT` in `src/lib/env.ts`); a missing PIN shows "Your command center is deployed. One step left: set your PIN." on `/admin/login`. A site cannot rewrite its own hosting settings, so a PIN the owner changes in the app must be stored in the database, hashed, never in plain text.
- **Existing copies keep working.** A deployment that already sets `FOUNDATION_PIN` keeps signing in with it exactly as today; the default and the required change apply only when no PIN has been chosen.
- **Database settings.** The app reads `FOUNDATION_DATABASE_URL` (and `FOUNDATION_DATABASE_CA` for the Supabase certificate). The Marketplace integration injects its own names instead: `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_PRISMA_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET` and others. The app must connect from those with no copying by the owner.
- **Known connection trap.** Light Brands has seen postgres.js stall on Supabase's transaction pooler (port 6543); the session pooler (port 5432) works, and the direct host is IPv6 only, which Vercel cannot reach. Which address the integration's variables carry must be confirmed against a real install, and the app must end up on a working one.
- **Sessions across deploys.** `FOUNDATION_SECRET` (32 characters at least) keeps sessions alive across deploys; without it the app falls back to a per-build secret. The deploy asks for nothing, so a stable secret must come from somewhere the owner never types.
- **Sign-in limits.** The existing limiter (`src/lib/auth/limit.ts`) and `npm run auth:unlock` apply to the default PIN and the change screen as they do today.
- **The deploy button** lives in the README today (`vercel.com/new/clone?...&env=FOUNDATION_PIN,FOUNDATION_BUSINESS_NAME`). Both env prompts go. The business name is set in the first session, which already asks for it, and the profile defaults to "Your business" until then.
- **Prompts made untrue:** `prompts/setup/set-pin.md` (changing the PIN through hosting settings) and the README's "choose a PIN" line.
- Copy follows `docs/standards/copy.md`: US English, commas, colons and periods, no dashes.

## Left to the builder

- How the Deploy Button requires Supabase (the `integration-ids` parameter or the Marketplace product parameter), confirmed early with a real end-to-end deploy into a fresh Vercel account. If Vercel cannot require it from the button, stop and bring the fallback to Lawless before building around it.
- Where the stable session secret comes from, as long as the owner never types it.
- The exact wording and layout of the home page PIN notice and the change screen, in the existing visual language.
- The setting name that turns on the demo's "Deploy your own" button.
- How the stored PIN is hashed and how a lost PIN is recovered (today: `npm run auth:unlock` and the set-pin prompt).

## Done when

- A fresh Vercel account presses the demo's button and, with no typing beyond account sign up, reaches a deployed command center whose home page shows 1234, signs in, is made to choose a PIN, and saves data (no preview banner).
- 1234 then fails, and the home page no longer shows it.
- The same holds when the repository is cloned and run locally.
- The demo shows "Deploy your own"; the fresh copy does not.
- 1234 stops working 7 days after the deploy, and recovery through Vercel works.
- "Forgot PIN?" emails a code to the owner's address and lets them set a new PIN, with no hosting step.
- The build request form opens a correctly filled email to hello@lightbrands.ai.
- An update published upstream reaches a Deploy button copy as a pull request, and a fork can sync.
- The secrets scan over every commit is clean, and the repository is public.
