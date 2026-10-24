---
id: modules/brand/identity
kind: module
title: Identity
lead: brand-lead
state: drafted
target: foundation
tiers: [essentials, complete, mastery]
uses: []
crew: [run-lead, business-analyst, experience-designer, experience-reviewer, builder, code-reviewer, qa-lead, scribe, guide]
specialists: []
level: 2
version: 1
---

# Identity

Section: Context.

**The job it takes off your plate:** making your command center look and feel like your business. Your real logo, your colors, your type and the feeling you want are carried into every screen, to the design standard of Light Brands' own demo command centers, so the room you open each morning is yours.

**What you still decide:** how it should feel and how far it goes. You choose what to change, you approve the direction before anything is built, and you see each screen before and after. Nothing is saved to your history without your yes.

You start it from the Identity page in your command center, by copying its one line into Claude Code. The line opens with your chief of staff's name, the one you chose at Setup, or "Claude" until you choose one. You can also paste the prompt under How it is done into the Code tab of Claude Desktop, with your command center folder open.

## What it is

A module, which is a whole job with its screen, its data and the work that runs on its own. This one is the look of your whole command center: the colors every neutral is drawn from, the faces your titles and numbers are set in, the surfaces, the light, the motion, the navigation, and the one signature moment on your Today screen that says what needs you.

Your Foundation already has a careful brand system with real range: eleven brand color slots, six font pairings, a type ratio, density, four surface styles, three motion levels, three ways to mark where you are in the navigation, three sign in atmospheres and three command center tones. It already checks contrast in code for every tone and every brand, keeps every tap target at 44px, has a designed phone frame with its own tab bar, and turns motion off for anyone who asks their device for less. What this entry adds is your presence inside the room. Light Brands' demo command centers feel like the business's own place: the canvas, the ink and the hairlines carry the brand's hue before a single accent appears, the sidebar is the brand's deepest color, titles are set large in a display face, the biggest numbers are the loudest thing on their cards, and Today opens with a dark band that greets you by name and tells you in one sentence what needs you. Your Foundation today is a well made neutral tool with your accent on it. This entry closes that gap with your brand and your real data.

It goes as far as you choose. It can retune your brand settings and stop there, or carry on into type, chrome and the signature band, or redesign any screen or component you name. Every change is yours to keep: when Light Brands sends a new Foundation, [Update my Foundation](../../frameworks/foundation-setup/update-my-foundation.md) shows you, in plain words, every place our change meets one of yours, and your version is the default.

**How it runs today.** You ask, on your own computer, with the command center running so you can watch each screen change. Claude takes before captures, builds one layer at a time, shows you each layer, and saves the run once you say yes. The look reaches your live command center when you push, the way every change does.

**What you do by hand.** Answer the questions, one at a time. Point Claude at your logo files when your site does not hold them. Look at each before and after pair and say yes, or say what to change. Press Save in Settings, then Preferences, only if you change a business fact along the way.

## The bar

The world class version is the command center a top interactive studio would hand a founder at the end of an engagement: open it first thing in the morning and the first thought is "this is my business, elevated." The command center, the sign in page and the public page read as one world. Every color on screen comes from the brand, and every one passes contrast in every tone. The type has a peak: a display title large enough to be an image, a calm sans for the work, and numbers you can read from across the room. The page breathes: one roomy opening, a tighter band of numbers, then the working cards. Motion has weight and means something, and a person who asks for less motion gets a composed still page with the same story. The phone is designed for a thumb. It is no slower than it was. And it is honest: real logo, real data, a designed empty state wherever there is nothing yet, and never an invented figure.

## Depth tiers

**Essentials.** Your brand settings, retuned, with no code changed. Your real colors, your font pairing, your type ratio, radii, density, surface, motion level, navigation marker, sign in atmosphere and tone, chosen from your site and your answers, written into your own brand file, `key/brand.yaml`. With `neutrals: brand`, every gray in the command center takes your brand's hue, softened wherever contrast needs it. Color alone closes most of the gap.

Adds: `key/brand.yaml` with your values, your direction in `key/knowledge/identity.md`, and a contrast test of your brand in `tests/unit/identity.test.ts`.

**Complete.** Adds type, light, chrome and the signature. Display titles set larger than the type ratio alone allows, your own display face self hosted when it is outside the six pairings, big numbers in the display face, eyebrows in the brand color, light pools and a fine film grain on the canvas, glass on the top bar, a deep brand sidebar with your crest, card shadows tinted by your deepest brand color, pill buttons that press, designed empty states, and the Today brief: a dark band with one glow, a greeting by your first name, one sentence built from your real Inbox and setup state, and two actions.

Adds: your own stylesheet, `src/app/owner.css`, imported once after the Foundation's styles; your own font file, `src/owner/fonts.ts`, when you choose a face outside the pairings; the new `src/owner/TodayBrief.tsx`; and the few lines that wire them in, each named in the plan. Every Foundation value stays as it is: your look is a layer on top.

**Mastery.** Adds the whole room. Stat cards with sparklines that draw in and numbers that count to their value, a navigation marker that slides on a spring, presses that land, receipts with Undo after every decision, live states that breathe, tables and pills with a state palette drawn from your brand, a full phone pass, the public page matched to the room, and any screen or component you name, redesigned to the same standard.

Adds: `StatCard`, `Sparkline` and `CountUp` in `src/owner/`, the state palette in `owner.css`, the toast, and the screens you named, each listed in the plan.

## Questions

Asked after [the questionnaire](../../runner/questionnaire.md), one at a time, each with its default. Before the first question, the run looks for your website address in your Key, in `key/knowledge/context-block.yaml`. When the Key holds none, it asks first: "What is your website address? I will read it for your logo, colors and fonts." Then it reads your website and your Key and reflects back in three or four sentences what it found: your logo files, the colors your site actually paints with, the faces it sets its titles and body in, and one thing about how it feels. It requests each page as a browser does, asking for HTML, and names the pages it read. It says only what it actually found, and says plainly when the site could not be read. After each answer it reflects back in one sentence what it heard before asking the next.

1. **What to change.** "What would you most like to change about how your command center looks or feels right now?" The default is the whole look, starting with color. Your answer sets the tier the run proposes: a few settings is Essentials, the feel of the room is Complete, and named screens or components are Mastery. There is no limit on how far it goes.
2. **Your tools.** "Where does your brand already live: your website, logo files, a light and a dark version of your logo, brand guidelines, or the Brand kit page in your command center?" The default is your website. Your logo is always your real file, taken from your site or your folder, and never drawn. Colors and faces come from what your site actually paints with, and anything the run inferred is marked **Proposed** until you confirm it.
3. **The feeling.** "When you open this first thing in the morning, what three words do you want to feel?" The default is your profile's three sound words, when you have saved them. The words set the palette's temperature, the type's character and how much movement the room has.
4. **The hour.** "Do you want it light, dusk or dark?" The default is light. Light, dusk and dark are your Foundation's tones `light`, `dim` and `dark`, set as `adminTone` in `key/brand.yaml`. Each recomputes the whole palette: dark is a different hour, with its own near black canvas and softer accents, and never an inversion.
5. **What you love.** "Name one or two apps or sites whose look you love, and what about them. Is there one whose look you dislike?" The default is none. What you love shapes the choices, and the run never copies another brand's logo, words or images.
6. **Movement.** "How much movement do you like: still, gentle, or alive?" The default is gentle. Still, gentle and alive map to your motion levels still, subtle and full, and your device's own reduced motion setting always wins.
7. **Room.** "Do you prefer to see a lot at once, or a calm screen with room around each thing?" The default is a calm screen. It sets density and the content width.
8. **Where you use it.** "Where do you use it most, on your phone or at a desk, and does anyone else on your team use it?" The default is both. The phone pass is part of every tier, and a team that uses it on phones moves the phone captures to the front.
9. **What stays.** "Is there anything on the current screens you want to keep exactly as it is?" The default is none. Everything you name is listed in the direction as kept, and the run leaves it as it is.

Then the run writes back the direction in one short paragraph: the palette, the two faces, the feeling, the one signature moment and the motion level. It builds only after you say yes.

**For example, the Dojo.** The Light Brands Dojo is the business this entry was shaped around, and these answers come only from its own operating facts. Anything they leave open is marked *to confirm*.

- **The read.** The run reads the Dojo's site for its logo files, colors and faces, and names the pages it read. Each color and face it reports is *to confirm* until Dan Lawless confirms it.
- **Question 1.** What Dan wants changed is *to confirm*. The default, the whole look starting with color, proposes Essentials first.
- **Question 3.** The Dojo's three words are *to confirm*. When its profile has none, the run proposes three from the site, marked **Proposed**.
- **Question 9.** What stays is Dan's to name. Until he names something, nothing is marked kept.
- **Who decides.** Dan approves the direction, each layer, and the push that puts it live.

Everything from here on is the build plan your assistant follows.

## Parts

Not part of this entry. Identity builds on the Foundation's own brand system and needs no other entry first.

## Crew

The Brand lead directs this entry when the owner has the Master Agent Library, the paid set of section leads and specialists, and reviews the direction before anything is built.

- **Run lead:** owns the ten stages, the direction, the layer order and the gates, and is the only one who commits.
- **Business analyst:** the website read, the logo files, the questions, and the direction paragraph.
- **Experience designer:** the direction made real, layer by layer: palette, type, surfaces, chrome, the signature band, the data pieces, motion and the phone, every state on a laptop and on a phone, and the reduced motion page.
- **Experience reviewer:** walks every captured screen as the owner would, at desk and phone size, and names any place that reads as a neutral tool with an accent, any decoration that carries no meaning, and any moment that moves without a reason.
- **Builder:** the brand values in `key/brand.yaml`, and every deeper change as a new file of the owner's own: `src/app/owner.css`, `src/owner/fonts.ts`, the components in `src/owner/`, with only the few lines that wire them in added to Foundation files. A new test file first for each new piece, so it fails before the code that passes it.
- **Code reviewer:** that `DEFAULT_BRAND`, `ADMIN_TONES`, `TONES`, the pairings, the font list and every existing test are exactly as they were, that fonts are self hosted, that only cheap properties animate, and that nothing in `ninja/` changed.
- **QA lead:** the before and after captures, the contrast checks, the phone checks, the motion inventory and the speed comparison.
- **Scribe:** the direction in `key/knowledge/identity.md`, the `installed` row, the run brief and the build log entries.
- **Guide:** lays the before and after pairs in front of the owner, screen by screen, with one plain line on what changed.

## Data

No new table. Your look is a layer on top of the Foundation's own: one brand file in your Key, one direction file, and, at Complete and Mastery, code files that are yours alone. Every Foundation value stays as it is, so the Foundation's tests keep proving what they prove and a later Foundation update meets as few of your lines as possible.

**Source of truth.** Each piece of your identity lives in one place, and nothing keeps a second copy:

- **Your brand values:** the Key file `key/brand.yaml`. It holds any of the brand fields you choose, by these exact names: `colors` (any of `canvas`, `canvasMuted`, `ink`, `inkMuted`, `hairline`, `primary`, `primaryDeep`, `accent`, `highlight`, `onHighlight` and `glow`, each a quoted `"#rrggbb"`), `pairing`, `radiusCard` and `radiusControl` (whole pixels from 0 to 32), `logoUrl` and `logoLightUrl`, `typeRatio`, `density`, `surface`, `motion`, `navActive`, `chamber`, `type` (`displayWeight`, `headingWeight`, `headingTracking`, `headingCase`), `adminTone` (`light`, `dim` or `dark`) and `neutrals` (`slate`, the Foundation's own grays, or `brand`, grays tinted with the hue of `colors.primary`). The Foundation reads the layers in this order, each field on its own: its own default look, then `key/brand.yaml`, then a brand saved in the app, in the core table `core_brand`, row id 1. A field the file leaves out keeps the Foundation's value. The file travels with your code to every copy, local and live.
- **A brand saved in the app:** the `core_brand` row wins over the file, field by field. Nothing in the Foundation writes that row today. The run reads it first, and when it holds values, says which fields they shadow and, with your yes, clears those fields so one source remains.
- **Your logo:** your own files, kept in `public/brand/` and named in `logoUrl` and `logoLightUrl` in `key/brand.yaml`.
- **Your own styles, faces and components,** at Complete and Mastery: `src/app/owner.css`, `src/owner/fonts.ts` and the components in `src/owner/`. Each is a new file that only you change.
- **The approved direction:** the Key file `key/knowledge/identity.md`: the palette, the two faces, the feeling, the signature moment, the motion level, the hour, what stays, and any line still **Proposed**. Every later run reads it before it changes the look.

The Foundation's own brand system is read, never edited: `DEFAULT_BRAND` and `parseBrand` in `src/lib/brand/tokens.ts`, `ADMIN_TONES` and `TONES` in `src/lib/brand/admin-tone.ts`, the families in `src/lib/brand/fonts.ts`, the pairings in `src/lib/brand/pairings.ts`, `brandCss` in `src/lib/brand/css.ts`, and `src/app/globals.css`. Their tests pin their values, and they are what remove returns to.

`key/brand.yaml`, for a business with a deep teal brand and a warm gold highlight:

```yaml
colors:
  canvas: "#f7f8f6"
  ink: "#1c2421"
  primary: "#164e63"
  primaryDeep: "#0c2f3d"
  accent: "#0e7490"
  highlight: "#f2c14e"
  onHighlight: "#1c2421"
pairing: editorial
radiusCard: 16
radiusControl: 10
typeRatio: 1.333
density: comfortable
surface: raised
navActive: rail
type:
  headingWeight: 500
adminTone: light
neutrals: brand
```

After each change to the file, the run runs `npm run key:sync`, then `npm test`, which names any field outside its range or any name the file does not know. A field the Foundation cannot read is ignored and named, never guessed.

What the entry builds at Essentials:

- **Key files:** `key/brand.yaml` and `key/knowledge/identity.md`.
- **Code:** none.
- **Tests:** `tests/unit/identity.test.ts`, a new file: the brand the Foundation builds from `key/brand.yaml` passes `contrastProblems` with nothing returned, in every tone the owner may use, and the file passes the Key checker. It is seen to fail first, with a deliberately weak ink in a test copy of the file. Every existing test stays exactly as it is.

At Complete and Mastery the plan lists every file it adds and every line it adds to a Foundation file, from the table under How it is done.

`key/knowledge/identity.md`, the shape the run writes. The headings are fixed, so a later run can find each part:

```markdown
# <Business> identity

## Feeling
<the three words, and one sentence on the room they describe>

## Palette
<each role and its color, with where it came from: the site, the logo, or Proposed>

## Type
<the display face, the body face, the mono, and the title and number sizes>

## Signature
<the one signature moment, in a sentence>

## Motion
<still, subtle or full, and the hour: light, dusk or dark>

## Kept as it is
<everything the owner named at question 9>

## Proposed
<every line the owner has not confirmed yet>
```

The entries in `key.yaml` after an Essentials install, for a run on October 26, 2026 from dictionary 0.4.0. Essentials creates no app code, so the row has no `code`:

```yaml
installed:
  - entry: modules/brand/identity
    from: dictionary@0.4.0
    tier: essentials
    version: 1
    files: [brand.yaml, knowledge/identity.md]
    installed: 2026-10-26
```

- The tests are named in the plan and stay out of `code`.
- At Complete and Mastery, `code` lists the owner's new files, such as `src/app/owner.css` and `src/owner/TodayBrief.tsx`. A line added to a Foundation file to wire one in, such as the import in `src/app/layout.tsx`, is named in the plan and never in `code`, and [Update my Foundation](../../frameworks/foundation-setup/update-my-foundation.md) shows you any later change Light Brands makes beside it.

## Screens and panels

Every screen of the command center wears the identity, because every page reads the same brand. The captures cover the sign in page (`/admin/login`), Today (`/admin`), a section hub (`/admin/business?stage=grow`), a ready to set up job page with its three doors, the Inbox (`/admin/command/inbox`), Settings, and the public page `/`.

**Identity** (`/admin/context/identity`), in the Brand group of Context, keeps its ready state and its Copy prompt at this version, so the next round of changes is one sentence away, and its kicker, `DictionaryKicker` with `page="context/identity"`. The Copy prompt is built with `pagePrompt` and `chiefName`, so it opens with the chief of staff's name.

**Today** (`/admin`) gains the Today brief at Complete: the page's one dark band, described under How it is done, with its own empty state. With nothing waiting and setup complete, its sentence says the day is clear, and its actions point to the Inbox and to the next job worth setting up.

## Routines and Inbox cards

Not part of this entry. Nothing runs on a timer, and nothing arrives in the Inbox. A design change is approved in the conversation, screen by screen.

## Connections

Essentials uses none. It reads your public website pages, as a browser does, and the logo files you point at. Nothing this entry does posts, sends or replies.

## Autopilot

**What runs on its own.** Once the identity is in place, every screen wears it with no one applying it: each page reads the one brand on every load, so a screen built next month arrives in your colors and faces. The contrast checks run in `npm test` on every build, so a later change that breaks a contrast pair in any tone fails before it can go live. Your visitors' devices set the motion: anyone who asks for less motion gets the still page, with no step from you.

**The trigger.** Every page load reads the brand. Every `npm test` and `npm run build` runs the contrast checks.

**The rung.** Drafts for approval. The run proposes the direction and each layer, shows you the before and after, and saves nothing to your history until you say yes. The push that puts it live waits for your yes too.

**The next rung.** None for this entry. How your business looks is always yours to approve.

**What stays with the owner.** The direction, every layer, the logo files, the push, and any change to a business fact, made in Settings, then Preferences.

## Proof

### Essentials

**Before.** Before the first change, the QA lead captures the screens listed under Screens and panels at 1440 by 900, 390 by 844 and 390 by 667, in every tone the owner might use, with full motion after the entrances settle, waiting 1200ms because the arrival starts near clear, and once more with reduced motion. The Foundation already has Playwright, and `tests/e2e/frame.spec.ts` shows the sign in helper. The captures run on the measuring server described under Speed, before, signed in with its throwaway PIN, so before and after compare the same screens on the same throwaway data and never reach your real database. Captures go in `.data/identity/before/`, which git ignores. Then you walk the same screens with your real data in your own browser on `npm run dev`, signing in yourself with your own PIN.

**Speed, before.** Lighthouse is no dependency of the Foundation, so the QA lead runs it through `npx`. It measures a production build on a measuring server of its own: port 3200, a throwaway local database in `.data/identity-measure`, and a throwaway PIN that opens only that database, the same way the Foundation's end to end tests sign in. The owner's real PIN is never used or asked for. Three runs each, desktop and mobile, on `/`, `/admin/login` and, signed in, `/admin`, keeping the middle score:

```sh
mkdir -p .data/identity/before .data/identity/after
npm run build
FOUNDATION_BUSINESS_NAME="Measure" FOUNDATION_PIN=246810 FOUNDATION_SECRET=identity-measure-only-secret-of-32-chars \
FOUNDATION_DATA_DIR=.data/identity-measure FOUNDATION_DATABASE_URL= DATABASE_URL= POSTGRES_URL= \
FOUNDATION_SUPABASE_URL= FOUNDATION_SUPABASE_SECRET_KEY= npm run start -- -p 3200
```

The three database addresses, `FOUNDATION_DATABASE_URL`, `DATABASE_URL` and `POSTGRES_URL`, are set to empty on purpose: this keeps every measurement and capture off your real database, even though your `.env.local` holds its address.

In a second window, sign in the way `tests/e2e/frame.spec.ts` does and save the session as a header file, from a script kept in `.data/identity/signin.mjs`:

```js
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:3200/admin");
await page.getByLabel("Your PIN").fill("246810");
await page.getByRole("button", { name: "Open" }).click();
await page.waitForURL(/\/admin$/);
const cookie = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
writeFileSync(".data/identity/headers.json", JSON.stringify({ Cookie: cookie }));
await browser.close();
```

```sh
node .data/identity/signin.mjs
npx --yes lighthouse http://localhost:3200/ --only-categories=performance --chrome-flags="--headless=new" --output=json --output-path=.data/identity/before/lh-home-mobile.json
npx --yes lighthouse http://localhost:3200/admin/login --only-categories=performance --chrome-flags="--headless=new" --output=json --output-path=.data/identity/before/lh-login-mobile.json
npx --yes lighthouse http://localhost:3200/admin --extra-headers=.data/identity/headers.json --only-categories=performance --chrome-flags="--headless=new" --output=json --output-path=.data/identity/before/lh-admin-mobile.json
```

Add `--preset=desktop` and a `-desktop` file name for the desktop runs. Stop the measuring server when done, so it releases its database.

**After.** The same screens, sizes, tones and motion settings, in `.data/identity/after/`, laid side by side for the owner, screen by screen, with one plain line on what changed, and the same Lighthouse runs into `.data/identity/after/`.

**Contrast.** `npm test` passes with `tests/unit/identity.test.ts`, and the test was seen to fail first, with a deliberately weak ink. The Key checker reports nothing for `key/brand.yaml`. By measurement: text on the hero band and over each glow, the current navigation item, every pill on its fill, and the focus ring on every background.

**Phone.** No sideways scroll at 390. Every tap target is 44px. Inputs are 16px. The tab bar clears the home indicator.

**Speed.** Each Lighthouse score, on `/`, `/admin/login` and signed in `/admin`, is the same or higher than before, and never below desktop 95 and mobile 90 on the two public pages; layout shift is 0; zero console errors.

**Every existing test.** Every test that passed before still passes, unchanged. When one fails, the run stops, tells the owner in plain words what that test protects, and changes the approach. An existing test is never edited or deleted.

### Complete

All of Essentials, plus: the Today brief's sentence and its first action are visible at 390 by 667; text on the dark band passes AA on its brightest pixel; the deep sidebar's color pairs are checked in `tests/unit/identity.test.ts` and pass; at most one more font family preloads than before; scrolling stays smooth on a mid range phone with the glass on.

### Mastery

All of Complete, plus the **motion inventory**: every moving moment before (the arrival rise, hover lifts, the sidebar accordion, the setup bar fill, the sign in chamber's light) and after, side by side. Each one from before is still there or replaced by something richer, and the reduced motion captures show a complete still page. Every redesigned screen the owner named has its own before and after pair at all three sizes.

## Complete when

**Fitted.** passes when every answer shows: the palette and faces match the direction, everything named at question 9 is unchanged, and the owner's real logo is on the sign in page, in the brand block and on the public page.

**Autopiloted.** passes when a screen the run did not touch wears the identity with no change of its own, and `npm test` fails on a contrast pair broken on purpose in a test copy of the brand.

**Visible.** passes when the owner has seen every captured screen before and after, at desk and phone size, and said yes.

**Connected.** passes when the command center, the sign in page and the public page read as one world, drawn from the same brand.

**Recorded.** passes when `key/brand.yaml` holds the brand values, `key/knowledge/identity.md` holds the approved direction, `key.yaml` has the entry's `installed` row with its tier, version, files, any code and the dictionary it came from, and the build log has each run's entries.

**Tested.** passes when the tests in `tests/unit/identity.test.ts` failed before the work that passes them existed, every existing test passes unchanged, and `npm test`, `npm run typecheck` and `npm run build` pass.

**Proven.** passes when the Proof ran on the owner's own brand and real data, with before and after captures, contrast, phone and speed.

**Coherent.** passes when each brand field has one source: `key/brand.yaml`, with no saved `core_brand` field shadowing it unless the owner chose that, and the Foundation's own values untouched beneath.

**Reversible.** passes when the owner knows the two ways back, and one was tried on a test copy. Removing `key/brand.yaml`, or one field from it, and setting `neutrals` back to `slate` restores the Foundation's own look for those fields at the next load, because the Foundation's values were never changed. Deeper changes, the owner's stylesheet, fonts, components and redesigned screens, are undone with `git revert` of the commits that made them, on the owner's yes.

**Explained.** passes when the owner can say in one sentence what changed and what stays theirs, such as "My command center now looks like my business in every screen, and my changes stay mine when the Foundation updates."

## Changing it

**What modify may change.** Each change lives in as few files as it can, so the owner's edits stay easy to keep at upgrade.

| Change | File | What changes |
|---|---|---|
| A color, the pairing, a radius, the ratio, density, surface, motion, marker, sign in atmosphere, tone or neutrals | `key/brand.yaml` | The one field, then `npm run key:sync` and `npm test`. |
| The direction | `key/knowledge/identity.md` | The line, under its fixed heading. A confirmed line leaves `## Proposed`. |
| A display face outside the six pairings | `src/owner/fonts.ts` and `src/app/owner.css` | One self hosted family, and the display face variable pointed at it. |
| Titles, light, grain, chrome, shadows | `src/app/owner.css` | The one rule. |
| The Today brief's sentence | `src/owner/TodayBrief.tsx` | The words, built only from real counts. |
| A screen the owner names | That screen's files | Named in the plan, with its own before and after. |

Anything beyond the table is an upgrade, or a new run of this entry naming the screen.

**From the command line.** In Claude Code or Claude Desktop, with the command center folder open:

- "Show me my identity" reads `key/knowledge/identity.md` and `key/brand.yaml`, and opens the Identity page.
- "Change my accent to the green on my logo" changes `accent` under `colors` in `key/brand.yaml`, runs `npm run key:sync` and `npm test`, and shows the before and after of Today.
- "Put my command center back to the Foundation's colors" removes the `colors` from `key/brand.yaml` and sets `neutrals` to `slate`, with your yes.
- "Redesign my Inbox to the same standard" starts a run of this entry at Mastery for that one screen.
- `npm test` runs every contrast check and the Key checker, and `npm run dev` shows the change at http://localhost:3000.

A change made from the command line is on every screen at the next load, because every page reads the same brand.

**What upgrade adds, tier by tier.** Upgrading compares each file in the row's `files` and `code` three ways, from the commit that added the entry's newest install or upgrade brief, so the owner's own edits stay.

To Complete:

- `src/app/owner.css`, new: the display title size, the brand colored eyebrow, the light pools, the grain, glass on the top bar, the deep sidebar and its crest, brand tinted shadows and pill buttons, each overriding the Foundation's classes through the cascade.
- `src/owner/fonts.ts`, new, when the owner chose a face outside the pairings.
- `src/owner/TodayBrief.tsx`, new, and the designed empty state as `src/owner/EmptyNote.tsx`.
- `src/app/layout.tsx`: one import of `owner.css` after `globals.css`, and the owner font's variable on the page, when there is one. `src/app/admin/(console)/page.tsx`: one line placing the Today brief. Both named in the plan.
- `tests/unit/identity.test.ts`: the sidebar and band color pairs.

To Mastery, from Complete:

- `src/owner/StatCard.tsx`, `Sparkline.tsx`, `CountUp.tsx` and the toast, the state palette in `owner.css`, and each screen the owner named.
- No data change.

**What remove does.** Remove deletes `key/brand.yaml`, which takes every brand field and `neutrals` back to the Foundation's own look at the next load. With the owner's yes it keeps the file and removes only the fields they name. Then it takes out what the deeper tiers added with `git revert` of the commits that added them, the owner's stylesheet, fonts, components and the lines that wire them in, so every Foundation file is as it was and `npm test` stays green. Your logo files and `key/knowledge/identity.md` stay unless you say to delete them. Nothing is exported, because the entry keeps no records.

## How it is done

This is the recipe Light Brands' demo command centers are built to, written as a brief any brand can follow. Read it whole before building. It is organized by the Seven Laws of Living Platforms, the creative law every Light Brands build answers to: BREATH, the page is alive at rest; TENSION, contrast makes attention; PRESENCE, the person and their business are the sharpest thing on screen; HONESTY, real logo, real words, real data; MEMORY, the room is recognizably theirs and motifs return; WEIGHT, things have mass, easing has inertia, a click lands; SILENCE, what you leave out. Each rule names the law it serves. The numbers are the demo values; a builder may move within the ranges given.

**The feeling it is aiming for.** The owner opens their command center at seven in the morning with a coffee. Before they read a word, the room is warm in their own brand's hue, the sidebar is their deepest color, and their logo sits in a crest at the top. A large title in their display face says good morning to them by name, with the date as a small eyebrow above it. Below it, one dark band glows softly and says, in a single sentence, what needs them today, with the one action that matters in their accent color. The numbers that matter to their business are big, calm and clear. Nothing shouts, nothing is frozen, and every press lands with a small, satisfying weight. On their phone in line at the bank, the same room fits their thumb. That is the bar for every decision below.

### Type

1. **Two faces and a whisper.** A display face with character for titles, hero sentences and the biggest numbers; a calm sans for everything else; mono only for timestamps, IDs and codes. One demo pairs a high contrast display serif with a geometric sans and uses a script flourish exactly once; another pairs a condensed sans with a sturdy grotesk. Choose the display face from the brand's own site first. (MEMORY)
2. **Scale with a peak.** Page titles 36 to 46px on a phone and 48 to 72px on a desk, set tight, weight 500 for a serif and 600 to 700 for a condensed sans. Card headings 17 to 24px. Body 15px with generous leading. Captions 12 to 13px. The Foundation's largest type ratio lifts the desk title only to about 47px, so anything larger needs a small code change, made in your own stylesheet: a rule in `src/app/owner.css` that sets `.page-title` in the display face, sized with `clamp()`. The Foundation's type ratio and its title sizes stay as they are. (TENSION)
3. **Eyebrows over titles.** 11 to 12px, uppercase, widely tracked, in the brand color or soft ink. The Foundation's `.kicker` already has the shape; give it the brand color on page headers in `owner.css`.
4. **Big numbers in the display face or a heavy tabular sans,** with tabular figures and slightly tight tracking. A number is the loudest thing on its card. Mono stays for times. (WEIGHT)
5. **Two tone titles.** Where a title has two words, the second sits at about 55% ink.
6. **The greeting is personal.** Today opens with the owner's first name and the time of day, the full date as the eyebrow. (PRESENCE)

### Color

1. **The brand paints the neutrals.** Canvas, card, hover, hairlines, ink and muted ink all carry the brand's hue, so the room is the brand before any accent shows. The card is a few steps lighter than the canvas; hover is about 4% ink mixed into the canvas, a hairline 8% to 14%; ink is a brand hued near black, never pure black; muted ink is a brand hued mid tone nudged until it passes AA on every ground. In a Foundation this is one line in `key/brand.yaml`, `neutrals: brand`: every admin gray keeps its lightness and takes the hue of `colors.primary`, softened step by step wherever a contrast pair needs it, so a gray brand stays gray. (MEMORY)
2. **Every role filled, by role and never by hue:** canvas, canvas muted, card, ink, ink muted, hairline, brand (current states, positive values, the first chart line), brand strong (headings, the main button, the hero band, the sidebar, the brand's darkest color), emphasis (eyebrows, flags), action (the one call to action and the focus ring), highlight (soft fills and text selection), a sidebar set, five chart colors, and two shadow colors made from brand strong at about 4% and 22% alpha. The Foundation's slots map onto these: `primaryDeep` is brand strong, `accent` is action, `highlight` and `glow` are highlight and emphasis.
3. **One accent means act.** The action color appears on the main call of a screen, on money moments and on focus, and nowhere decorative. (HONESTY, SILENCE)
4. **State has its own palette.** Good, drifting and at risk; paid, due and overdue: fixed hues pulled about 10% toward the brand's emphasis, then lightened or darkened step by step until their ink passes. A state color never decorates.
5. **Glow is light, never paint.** Light pools on the canvas are two large radial gradients, emphasis at 12% and brand at 9%. Inside a dark band, one blurred orb of the action color at 30%. Text never sits on the brightest part of a pool. (BREATH)
6. **Three hours of the day.** Light, dusk and dark each recompute the whole set. Dark is a different hour: a near black canvas, surfaces one or two lightness steps apart, ink off white, accents 10% to 15% less saturated. In a Foundation, light is the tone `light`, dusk is `dim` and dark is `dark`, chosen with `adminTone` in `key/brand.yaml`, and `neutrals: brand` tints whichever tone is chosen.
7. **Contrast in every tone, for every pair.** The floors are in the block below.

```text
Body and any text under 24px      4.5 to 1 on canvas, card and hover
Large display text                3 to 1 at least, aim for 4.5 to 1
Icons, field borders, focus mark  3 to 1 on their surface
Ink on every state fill           4.6 to 1
Text on the hero band or a glow   4.5 to 1, measured on the brightest pixel behind it
```

### Spacing and density

1. Card padding 20 to 22px; the hero band 28 to 36px.
2. 16px between cards in a grid, 22 to 24px between a page's blocks, 32px before a new band.
3. Content width 1150 to 1360px, centered, set in `owner.css`. The Foundation's 1600px lets lines run long on a big screen.
4. Vary density down the page: one roomy opening, a tighter band of numbers, then working cards. Never three equal grids in a row. (BREATH)
5. Rows keep a 44px floor on phones; the Foundation's `--spacing-row` already does.

### Radii, borders and shadows

1. Cards 16 to 28px; hero bands 24px; side panels 28 to 30px; icon tiles 12 to 15px; buttons, chips, search and category bars are full pills.
2. Borders are hairlines in the brand's hue, often at 70% opacity. Prefer shadow over line to separate. (WEIGHT)
3. Shadows in two layers, a contact line and a long soft drop tinted by brand strong, with panels and drawers going deeper. A colored card gets a soft sheen. The values are in the block below.

```css
/* soft = brand strong at about 4% alpha, deep = brand strong at about 22% alpha */
--shadow-rest:  0 1px 0 var(--shadow-soft), 0 12px 32px -20px var(--shadow-deep);
--shadow-lift:  0 2px 0 var(--shadow-soft), 0 30px 60px -28px var(--shadow-deep);
--shadow-panel: 0 40px 90px -30px rgba(0, 0, 0, 0.55);
--sheen:        linear-gradient(160deg, rgba(255, 255, 255, 0.18), transparent 40%);
```

### Surfaces and texture

1. **Grain.** A fixed full screen noise layer at about 2.5% opacity that ignores the pointer. The Foundation already ships the same noise in its sign in chamber: the `.grain` rule in `src/app/admin/login/chamber.module.css`, an inline `feTurbulence` image, which runs there much stronger, through `--chamber-grain`. Copy that image into a rule of your own in `owner.css`, a pseudo element on the admin frame, with its own strength variable, so the chamber keeps its own and `AdminFrame.tsx` stays as it is:

```css
:root { --owner-grain: 0.025; }
/* the background-image is the chamber's own noise, copied from chamber.module.css */
```
2. **Glass where layers overlap.** The top bar at 85% to 92% canvas with a soft blur; floating cards at 78% card. Glass only where something scrolls beneath it; elsewhere a solid card is lighter for phones.
3. **One dark band per page at most.** The hero band in brand strong is the page's loudest moment; everything else stays light so it carries. (TENSION, SILENCE)
4. **The crest.** The real logo on a brand strong circle with a thin ring in the action color, or at 56px beside the business name in the display face with "Business Command Center" as an eyebrow. The logo is always the owner's real file, never drawn.

### Motion

1. **One hand.** Every arrival uses the same hard deceleration. Hover and press 150 to 200ms; a page, a panel or a card settling 300ms; card entrances 500 to 600ms; a number counting 600ms; the one hero arrival 800 to 1000ms. Stagger 45 to 80ms. Exits about 30% faster than entrances. (WEIGHT)

```css
--ease-arrive: cubic-bezier(0.16, 1, 0.3, 1);
/* every duration is multiplied by the Foundation's --motion, so still is 0 and reduced motion is instant */
transition-duration: calc(300ms * var(--motion));
```

2. **What moves.**
   - The page rises 14px into place with its cards staggered. Keep the Foundation's `.rise` opacity start, which protects first paint; shorten it to 600ms with a 60ms stagger by overriding its timing in `owner.css`.
   - The current navigation marker slides to the new item on a spring, with a 4px action colored bar beside it: one indicator element positioned from the current item and moved with `translate`.
   - Numbers count to a new value over 600ms, and show still on first paint and under reduced motion.
   - Sparklines draw left to right over 1000ms.
   - Cards lift 2 to 4px on hover with the lift shadow; buttons press to 96% scale; a finished item leaves sideways as the list closes up.
   - Live states breathe: a soft pulse every 2 seconds on running routines and the live dot.
   - Drawers and panels slide on a spring over a dimmed, blurred page.
   - Every action leaves a receipt: a toast in brand strong with Undo in the action color.
   - Ambient light: the hero band's orb drifts slowly, over 18 to 40 seconds, and pauses off screen. A dashboard is read for minutes at a time, so the canvas pools stay still.
3. **Only cheap properties.** Animate `transform`, `opacity`, `filter` and `clip-path` only. One `requestAnimationFrame` loop at most, the count up. No motion library is needed: CSS transitions, `@keyframes`, `@starting-style` and one small client component for counting cover every item. Read `node_modules/next/dist/docs/` before reaching for view transitions in Next 16.
4. **Reduced motion is a composed still page.** Every duration instant, hover lifts off, counters at their final value, pools and orbs still, toasts in place. The Foundation's `globals.css` already sets `--motion` to 0 for reduced motion; tie every new duration to it so the brand's still, subtle and full levels scale it too.
5. **Nothing flashes,** and nothing loops faster than every 2 seconds.

### Imagery and icons

1. Icons at 16 to 19px inside tiles: 36 to 40px squares, radius 12 to 14, tinted with ink at 7%; or 36 to 48px circles in highlight with the icon in emphasis. Bare icons only in dense rows.
2. Avatars are initials on a brand color chosen by a stable hash over four brand hues.
3. No stock photography in the command center. Photos belong to the owner's own world: their logo, their team, their work. Generated imagery only for places and objects, never a person. (HONESTY)
4. Charts use the five chart colors, grid lines dashed in the hairline color, axis text 12px in muted ink, and a gradient under an area line from 32% to 2%.

### Data display

1. **The stat card:** a 12px uppercase label in muted ink; the value large in the display face; one line of change in the brand color; a 64 by 32 sparkline, 2px, round caps; the whole card a link to the records behind the number.
2. **One page grammar:** title, three numbers, one hero object, supporting cards. Learn one page, know them all. (MEMORY)
3. **Lists:** hairline dividers, 44px rows, title left and time right in 12px mono, hover fills with ink at 4%. The Foundation's `NeedsYouCard.tsx` already has this shape.
4. **Tables:** 12px uppercase headers in soft ink; cells padded 10 to 16px; numbers right aligned in tabular figures; a 4px bar in the row's state color on the first cell; the whole row opens its record.
5. **Pills:** 24px tall, full radius, 12px text at weight 600 to 650, state fill with its ink; quiet pills at 12% to 15% of a brand color.
6. **Progress:** a 6px track in canvas muted with a brand fill; a ring for a single ratio.
7. **Empty states:** a dashed hairline panel on canvas muted, a 48px circle in highlight holding the icon, a display face title, one line saying what will arrive here, and one action. "New drafts from your routines land here for your yes."
8. **Loading:** skeleton blocks in canvas muted with a soft shimmer, each lower block a little fainter.
9. **Honesty about data.** The demos show sample figures with a "Sample data" chip because they are simulated. A Foundation shows only the owner's real data, and where there is none yet, the designed empty state. Never invent a figure to fill a card. (HONESTY)

### Navigation and chrome

1. **A deep brand sidebar.** Light ink at 70% at rest and full for the current item; 40 to 44px rows at 12px radius; the current item filled with the sidebar accent and a 4px action colored bar on its left edge; icons nudging 2px right on hover.
2. **The brand block** at the top of the sidebar: the crest, the business name in the display face, and "Business Command Center" as a 10 to 11px eyebrow.
3. **A sticky top bar** in canvas at 85% with blur: where you are, a search pill, and the assistant as a pill button.
4. **Places and actions stay apart.** Navigation holds places; the bars hold actions.
5. **The assistant is present.** On wide screens a panel that opens with a greeting in display italic and three questions the owner would really ask; a drawer elsewhere.
6. **Focus** is a 2px ring in the action color, offset 2 to 3px, on every interactive element.

### Phone

1. Design at 390 by 844 and check 390 by 667: 16px gutters, 44px taps, 16px inputs.
2. The Foundation's 56px tab bar is already right; give it the brand's surface and blur.
3. Rows of chips and numbers scroll sideways with scroll snap and bleed to the screen edge, and never wrap into a tall stack.
4. Panels become full height sheets with a 28px top radius; tables drop their least needed columns; titles step down to 46px.
5. The Today brief keeps its sentence and its first action above the fold at 390 by 667.
6. Hover never carries meaning: anything that appears on hover at a desk is always visible on a phone.

### Where each rule goes

Your look is a layer over the Foundation's own. The brand values live in your Key; everything deeper lives in files that are yours alone; a Foundation file gains at most the one line that wires your file in.

| Rule | Where it goes | Kind of change |
|---|---|---|
| Colors, pairing, radii, ratio, density, surface, motion, marker, sign in atmosphere, tone | `key/brand.yaml` | Values |
| Brand hued neutrals | `neutrals: brand` in `key/brand.yaml` | Value |
| Brand tinted card shadows and the sheen | `src/app/owner.css`, shadow colors from `--color-primary-deep` | Your stylesheet |
| Pools and grain | `src/app/owner.css`: the pools on the admin canvas, the chamber's noise copied with its own `--owner-grain` | Your stylesheet |
| Display titles, brand eyebrows, content width | `.page-title`, `.kicker` and the page width, overridden in `src/app/owner.css` | Your stylesheet |
| A display face outside the six pairings | `src/owner/fonts.ts` through `next/font`, its variable on the page from `src/app/layout.tsx`, and `--font-display` pointed at it in `owner.css` | New file and one line |
| Two tone titles and display numbers | Your stylesheet first; a component change only for a screen the owner names | Your stylesheet |
| Greeting and Today brief | New `src/owner/TodayBrief.tsx`, in `primaryDeep` with one orb, placed by one line in `src/app/admin/(console)/page.tsx` | New component and one line |
| Deep sidebar, brand block, glass top bar, tab bar surface | `src/app/owner.css`, with the sidebar and band pairs in `tests/unit/identity.test.ts` | Your stylesheet |
| Pill buttons and the press | `.btn-primary` and `.btn-quiet` overridden in `owner.css`, the press scaled by `--motion` | Your stylesheet |
| Stat cards, sparklines, count up, toast | New files in `src/owner/` | New components |
| Empty states | New `src/owner/EmptyNote.tsx`, used where the owner chooses | New component |
| Navigation slide, receipts, phone rows, any screen redesign | The files of the screen the owner named, listed in the plan | The owner's chosen redesign |
| The public page matching the room | The same pools and grain in `owner.css`, applied to the public page | Your stylesheet |

### The rules of the house

- **Never edit a pinned value.** `DEFAULT_BRAND`, `parseBrand` and the closed lists in `src/lib/brand/tokens.ts`, `ADMIN_TONES` and `TONES` in `src/lib/brand/admin-tone.ts`, the families in `src/lib/brand/fonts.ts`, the pairings in `src/lib/brand/pairings.ts` and every existing test stay exactly as they are. Tests across the Foundation pin them, and they are what remove returns to.
- **An existing test that fails means stop.** When a test that passed before fails, tell the owner in plain words what it protects, and change the approach. Never edit or delete an existing test to make the work pass.
- **Fonts are self hosted.** The Foundation's security policy allows fonts from its own address only (`font-src 'self' data:` in `src/lib/security/csp.ts`), so a Google Fonts stylesheet link is blocked. Add a face in your own `src/owner/fonts.ts`, through `next/font/google`, which downloads it at build time and serves it from your own address, or `next/font/local` with the brand's own files, with `display: "swap"` and `preload: true` only for the one display face.
- **Only checked values reach the page.** The Foundation reads `key/brand.yaml` field by field, keeps only known names and values in range, and names everything it ignores. `npm test` runs the same check through the Key checker.
- **The brand row is the owner's record.** A brand saved in the app, the `core_brand` row, wins over `key/brand.yaml` field by field. Changing or clearing it is a change to the owner's data: say exactly what will change and wait for their yes.
- **Additions merge cleanly.** New files and one line wiring each in leave the Foundation's own lines alone, so a later Foundation update rarely meets yours, and [Update my Foundation](../../frameworks/foundation-setup/update-my-foundation.md) explains any place it does.
- **`ninja/` is never edited.** The copy rules, US English with no dash characters and positive statements, are tested in `tests/unit/copy-text.test.ts` and `frame-ui.test.ts`.

### The order of work

1. **Ask and gather.** The website address first when the Key has none, then the questions, one at a time. Read the owner's site for the real logo files, colors and type. Write the direction paragraph and get a yes. Write `key/knowledge/identity.md`.
2. **Before captures and speed,** so the change can be proven.
3. **Color.** The brand values in `key/brand.yaml`, `neutrals: brand`, the tone the owner chose, then `npm run key:sync` and `npm test`, contrast clean in every tone. This alone closes most of the gap. Essentials ends here.
4. **Type.** The pairing, a self hosted face when needed, the ratio, display titles and display numbers.
5. **Surfaces.** Radii, shadows, pools, grain and glass on the top bar.
6. **Chrome.** Sidebar, brand block, top bar and tab bar.
7. **The signature.** The greeting and the Today brief. Complete ends here.
8. **Data pieces.** Stat cards, sparklines, empty states, pills and tables.
9. **Motion.** Navigation slide, count up, sparkline draw, press, receipts and pulse, then the reduced motion pass.
10. **The screens the owner named,** each to the same standard. Mastery ends here.
11. **Phone pass** at 390 by 844 and 390 by 667, at every tier.
12. **Proof,** then `npm test`, `npm run typecheck`, `npm run build`, the work commit and the log entry.

Show the owner each layer before starting the next, so any one can be changed or undone before the run is saved. A run is one work commit, so an owner who wants each layer in its own commit takes one layer per run: "Modify my Identity: the sidebar."

### The last check

Open it as the owner would, first thing in the morning, and ask whether a person would feel it. The answer the work is aiming for is "this is my business, elevated", with the command center, the public page and the sign in page reading as one world.

**Going deeper.** Ask to [learn](../../runner/verbs/learn.md) how `neutrals: brand` tints the grays, how `key/brand.yaml` layers over the Foundation's own look, or how the contrast checks work.

**The prompt to copy.** Paste this into the Code tab of Claude Desktop, with your command center folder open.

```text
You are helping me with 2.1.2 Identity: bringing my Foundation command center up to the design quality of Light Brands' demo command centers, with my own brand and my real data. Read ninja/modules/brand/identity.md in full first, including the recipe under How it is done, and follow it as your brief. I run a business, so keep the language plain. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole run: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat. Use my real logo files and never draw a logo. Show only my real data, and a designed empty state where there is none. Fonts are self hosted through next/font, because my security policy blocks Google Fonts links. Put my brand values in key/brand.yaml, and make every deeper change a new file of mine, wired in with as few lines as possible. Never edit DEFAULT_BRAND, ADMIN_TONES, TONES, the pairings, the font list or any existing test, and never edit anything in ninja/. Never push without my yes. When a command fails, read the real error, tell me what it means, and work the fix with me.

1. Look for my website address in key/knowledge/context-block.yaml. If it is not there, ask me for it first. Then read my website as a browser does, and my Key, and tell me in three or four sentences what you found: my logo files, my colors, my fonts, and how it feels. Name the pages you read.
2. Ask me the questions in the entry, one at a time, starting with what I would most like to change about how my command center looks or feels. After each answer, tell me in one sentence what you heard. There is no limit on how far we go.
3. Write back the direction in one short paragraph: palette, two faces, the feeling, the one signature moment and the motion level. Wait for my yes, then write it into key/knowledge/identity.md.
4. Take the before captures listed in the entry's Proof, at 1440 by 900, 390 by 844 and 390 by 667, and the Lighthouse scores, before you change anything.
5. Build in the entry's order of work, as far as I chose. Show me each layer before the next, with before and after side by side and one plain line on what changed.
6. Prove it as the entry's Proof says: the same screens after, contrast in every tone, the phone checks, and speed no slower than before, signed in on /admin too. Run npm test, npm run typecheck and npm run build, and fix anything in my own new work that fails. If a test that passed before fails, stop and tell me in plain words what it protects, then change the approach with me. Never edit or delete an existing test.
7. Tell me in two or three plain sentences how my command center feels now, and that my changes stay mine: when Light Brands sends a new Foundation, 0.3.8 Update my Foundation shows me every place their change meets mine, and my version is the default.
8. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. Then ask me: Shall I push? Pushing puts the new look live. Only on my yes, run git push.
```

## Next

- Draw out your story and the way you sound, so your words match the room: [Story and voice](story.md). "Install Story and voice."
- [Modify](../../runner/verbs/modify.md) the look as your business changes: "Modify my Identity: make the accent the green on my logo."
- [Upgrade](../../runner/verbs/upgrade.md) it a tier deeper: "Upgrade Identity to Complete."
- Keep your Foundation current with your changes kept: [Update my Foundation](../../frameworks/foundation-setup/update-my-foundation.md). In the same folder, you can say:

```text
Follow 0.3.8 Update my Foundation, in ninja/frameworks/foundation-setup/update-my-foundation.md.
```

- The Brand kit page, when it arrives in the dictionary, keeps your logo files, colors and faces in one place, and this entry reads them from there.
