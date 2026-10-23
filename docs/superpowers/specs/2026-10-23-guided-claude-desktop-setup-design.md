# Foundation: free, public, set up step by step with Claude Desktop

Design agreed with Lawless on 2026-10-23. **Supersedes** `2026-10-23-public-one-click-deploy-design.md` (the one click Deploy Button, the Supabase Marketplace and the 1234 starting PIN are all dropped). Builds on the approved, never built 2026-10-05 guided install design (QIE branch `dojo/foundation-ten-minute-install`, `docs/superpowers/specs/2026-10-05-foundation-ten-minute-install-design.md`): its principles and its four part step page are reused here.

## Intent

The Foundation is a free public repository (`Light-Brands/foundation`, public since 2026-10-23). A business owner sets up their own copy by working in Claude Desktop, one copied prompt per step, and ends with their command center live and Claude connected through the command line to their GitHub, Vercel and database, so from then on they build and deploy by asking. The one click Deploy Button was tried and was too fragile (Vercel's clone flow and the Supabase Marketplace failed with errors nobody could act on); with Claude at the command line, every failure shows its real message and Claude works through it with them.

## Who it is for

A business owner, not a developer. They may have no GitHub, Vercel or database account yet.

## The path

Every step is one prompt the owner copies, pastes into Claude Desktop, and follows until it proves itself. Each step lives on its own page in the Ninja dictionary, linked from entry 0.3 Foundation, so the owner copies what they need for the step they are on, applies it, and keeps going.

| Step | What happens | Ends with |
|---|---|---|
| 1. Get Claude Desktop | Download, install, sign in, open Claude Desktop; create a new folder for the command center and open it in Claude. Links to entry 0.1 Prep for anything more. | Claude Desktop open in their new, empty folder |
| 2. Bring in your Foundation | Claude checks Node.js 20.9+ and Git and helps install what is missing, clones `Light-Brands/foundation` into the folder, keeps it as the `upstream` remote, runs `npm install`, and runs it locally once. | The command center opening on their own computer |
| 3. Connect GitHub | `gh auth login` in their own browser; Claude creates **their own private repository `foundation-command-center`** and pushes. | Their repository on GitHub, with `origin` theirs and `upstream` ours |
| 4. Connect Vercel and choose your PIN | `vercel login`; Claude links a Vercel project named **`foundation-command-center`** to their repository; the owner types their PIN of 6 to 12 digits themselves into `vercel env add FOUNDATION_PIN` (hidden input, never in the chat); Claude sets `FOUNDATION_BUSINESS_NAME`. | The project on Vercel with their PIN and name |
| 5. Connect your database | Claude adds **Neon through Vercel** (`vercel integration add neon`), named `foundation-command-center`, connected to the project; the owner confirms anything Vercel opens in their browser. The app connects from the settings Neon adds, with nothing copied. | A database connected to the project |
| 6. Go live | Claude deploys, opens their site; they sign in with their PIN, save Preferences, send a test message from their contact page and see it in their Inbox. | Their command center live, saving, behind their PIN |

Then, any time:

- **Change my PIN:** the owner types the new one into `vercel env add FOUNDATION_PIN` (after Claude removes the old one), and Claude redeploys.
- **Update my Foundation:** Claude pulls `upstream` into their repository, keeps their own work (`key/` and their changes), shows what changed, and redeploys on their yes.
- **Put it on my own domain:** the existing `prompts/setup/custom-domain.md`.

## Numbers in the Ninja dictionary (Lawless, 2026-10-23)

The steps join the dictionary as sub-numbers of **0.3 Foundation**, so nothing else is renumbered (three level numbers such as 2.7.1 already exist, and section 0 has no sub-numbers yet):

| # | Title |
|---|---|
| 0.3.1 | Get Claude Desktop |
| 0.3.2 | Bring in your Foundation |
| 0.3.3 | Connect GitHub |
| 0.3.4 | Connect Vercel and choose your PIN |
| 0.3.5 | Connect your database |
| 0.3.6 | Go live |
| 0.3.7 | Change my PIN |
| 0.3.8 | Update my Foundation |
| 0.3.9 | Put it on my own domain |

Each step page links back to 0.1 Prep, 0.2 Home and 0.3 Foundation and forward to the next number, and the 0.3 entry lists all nine. An owner can say "Claude, follow 0.3.4" the same way they say "follow 2.3 Story and voice". The numbers are added at the dictionary's source in QIE (where `numbers.yaml`, `numbers.lock` and the publisher live), and reach this repository as a dictionary update, since `ninja/` is never edited here. They go into `numbers.lock` so they never move. The 2026-10-05 design's step numbers (1.1, 3.1 and so on) are retired in favor of these.

## Every step page has four parts (from the 2026-10-05 design)

1. **Check:** confirm the steps before this one are done, from what the owner can see or what Claude can test; when a check fails, name the step to return to.
2. **Do:** one small action at a time, each confirmed before the next.
3. **Prove:** what the owner should see when the step is done.
4. **Next:** the next step's link and its copyable prompt.

Every page works cold: a fresh Claude that has never seen the conversation can open it, run the check and continue.

## Rules every prompt keeps

- The owner signs in, pays and types every secret in their own browser or their own terminal prompt. Claude never asks for a password, PIN, key or code in the chat, and tells them never to paste one.
- Every new repository is the owner's own, private by default, named `foundation-command-center`; the Vercel project and the database share that name. If the name is taken in their account, Claude offers `foundation-command-center-2` and says so.
- Claude explains each command in one plain sentence before running it.
- When a step fails, Claude reads the real error, explains it plainly and works the fix with the owner (for example a free plan limit, a name already taken, a sign in that did not finish) before moving on.
- Copy follows `docs/standards/copy.md` and `docs/standards/prompts.md`: US English, commas, colons and periods, no dashes.

## Where things live

- **Source:** each step is a prompt file in the Foundation repository under `prompts/setup/`, so every copy carries them. The existing `deploy.md` (which describes the retired Deploy button), `run-locally.md` and `set-pin.md` are rewritten into the steps above; `custom-domain.md` stays.
- **The Ninja dictionary:** each step is published as its own page and linked, in order, from entry 0.3 Foundation (`ninja/frameworks/foundation.md`, whose Depth tiers, Questions and Connections sections describe the retired Deploy button and are rewritten to this path) and from the Dojo Dictionary's 0.3 row. The dictionary's own publisher produces the pages and `ninja/foundation/links.yaml`.
- **The demo:** on foundation.lightbrands.ai, the home page's "Get in touch" becomes **"Build your own with Claude"**, linking to step 1's page. It shows only where `FOUNDATION_DEMO_DEPLOY=on` (that setting name is kept), so no owner's copy shows it.
- **The README** opens with the same path: what it is, then step 1's link, then "fork it" for developers.

## Also in this work

- **Have Light Brands build it for you:** unchanged from the superseded design. Inside the command center only (never the public home page), a short form that opens the owner's own email to hello@lightbrands.ai with their answers: name; business and what it does (filled from the profile); email; phone; what they want built; how soon; and "What would it be worth to you to have this built and running?" with Under $2,500, $2,500 to $10,000, $10,000 to $30,000, $30,000 to $100,000, $100,000 or more, Not sure yet, plus an optional "Anything you'd like us to know about that?". Never the word "budget". With no email app, it offers to copy the message.
- **The database connects from Neon's settings.** The app reads `FOUNDATION_DATABASE_URL` today; it also reads the address Neon's Vercel integration sets (confirmed on a real setup in the first task), with `FOUNDATION_*` always winning.
- **Undo the database PIN work:** commit `aa7a733` (PIN state in the database, 1234, Supabase Marketplace settings) is reverted. The PIN stays in `FOUNDATION_PIN`, as today.
- **Clean up the failed tests,** each on Lawless's yes: the `Light-Brands/foundation-step-zero` repository, the `foundation-step-zero` Vercel project, the `step-zero` branch, and the empty Supabase organization "Autod3v's projects" created by the Marketplace attempt.

## Non-goals

- No Deploy button, no Vercel Marketplace provisioning from a button, no default PIN, no PIN stored in the database.
- No mention of the $19 workshop.
- No new app screens beyond the build request dialog and the demo button.

## Anti-goals

- A step that leaves the owner stuck on an error with no plain next move.
- Any secret passing through the chat.
- A repository created in the wrong account, or public by accident.
- An owner's copy showing "Build your own with Claude".

## Left to the builder

- Exact wording of each prompt, within the rules above and the existing prompt standard.
- The URL slugs and the publisher mechanics for the dictionary pages.
- How the update prompt presents conflicts with the owner's own changes, as long as their `key/` and data are never overwritten.

## Done when

- A person with fresh GitHub and Vercel accounts, starting from step 1's page, reaches a live, saving command center behind their own PIN by copying each step's prompt, with no secret in the chat.
- Every step page works cold in a new Claude Desktop chat.
- "Change my PIN" and "Update my Foundation" work on that copy.
- The demo shows "Build your own with Claude"; the copy does not.
- The build request opens a filled email to hello@lightbrands.ai.
- `aa7a733` is reverted and the test leftovers are cleaned up on Lawless's yes.
