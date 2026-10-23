# Foundation set up step by step in Claude Desktop: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A business owner copies nine numbered prompts (0.3.1 to 0.3.9) from the Ninja dictionary into Claude Desktop's Code tab and ends with their own `foundation-command-center` live on their GitHub, Vercel and Neon, behind a PIN they typed into Vercel themselves; the demo links to step 0.3.1; the command center offers "Have Light Brands build it for you".

**Architecture:** Two repositories. In Light-Brands/foundation (this worktree, branch `claude/public-one-click`): undo the database PIN work, read Neon's settings, add the demo button and the build request dialog, and take the dictionary update. In QIE (a new worktree branched from `ninja/category-masters`): add numbers 0.3.1 to 0.3.9 and nine step entries to the dictionary source, rewrite entry 0.3 Foundation, extend the publisher only where it rejects the new numbers, and publish.

**Tech Stack:** Next.js 16, postgres.js, Vitest, Playwright; QIE `ninja.py` (Python) with its tests; lb-share publishing; GitHub CLI, Vercel CLI, Neon through the Vercel Marketplace.

**Spec:** `docs/superpowers/specs/2026-10-23-guided-claude-desktop-setup-design.md` (supersedes `2026-10-23-public-one-click-deploy-design.md`; the plan `2026-10-23-public-one-click-deploy.md` is superseded by this one).

## Global Constraints

- Names: the owner's repository, Vercel project and database are all `foundation-command-center`; if taken, `foundation-command-center-2`, said aloud.
- The PIN is 6 to 12 digits, typed by the owner into `vercel env add FOUNDATION_PIN` in their own Terminal window, chosen once at 0.3.4. Claude never asks for a password, PIN, key or code in the chat.
- Every step page has Check, Do, Prove, Next, and works cold in a new Claude Desktop chat. 0.3.1 states first that Claude Pro (about $20 a month) is required.
- Numbers 0.3.1 Get Claude Desktop, 0.3.2 Bring in your Foundation, 0.3.3 Connect GitHub, 0.3.4 Connect Vercel and choose your PIN, 0.3.5 Connect your database, 0.3.6 Go live, 0.3.7 Change my PIN, 0.3.8 Update my Foundation, 0.3.9 Put it on my own domain. Nothing else is renumbered; each goes into `numbers.lock`.
- Build request: to `hello@lightbrands.ai`; worth question "What would it be worth to you to have this built and running?" with Under $2,500, $2,500 to $10,000, $10,000 to $30,000, $30,000 to $100,000, $100,000 or more, Not sure yet, plus optional "Anything you'd like us to know about that?"; never the word "budget"; inside `/admin` only.
- The demo button reads "Build your own with Claude" and shows only where `FOUNDATION_DEMO_DEPLOY=on`.
- No mention of the $19 workshop. Copy: US English, commas, colons, periods, no dashes (`docs/standards/copy.md`, `docs/standards/prompts.md`).
- `ninja/` is never edited by hand in the Foundation repository; it arrives as a dictionary update. The QIE worktree `/Users/lawless/Documents/qie-wt-category-masters` belongs to another session: read it, never write it.
- No push to `main`, no merge, no deletion and no live setting change without Lawless's yes.

## Review Focus

1. **A Neon address with `sslmode=require`.** Expected: the app connects with full certificate checks; today it refuses that address as insecure. Test in Task 2.
2. **Both `FOUNDATION_DATABASE_URL` and `DATABASE_URL` set.** Expected: `FOUNDATION_DATABASE_URL` wins. Test in Task 2.
3. **A step page opened cold, steps out of order.** Expected: its Check finds the missing earlier step and names it. Checked per page in Task 4.
4. **The build request with an apostrophe, an ampersand or a line break.** Expected: the email body arrives intact. Test in Task 3.
5. **An owner's copy, where `FOUNDATION_DEMO_DEPLOY` is unset.** Expected: "Get in touch" as before, no "Build your own with Claude". Test in Task 3.

---

### Task 1: Undo the database PIN work

**Files:** revert commit `aa7a733`; mark `docs/superpowers/plans/2026-10-23-public-one-click-deploy.md` superseded in its first lines.

- [ ] **Step 1:** `git revert --no-edit aa7a733`.
- [ ] **Step 2:** Run `npm test && npm run typecheck`; expect PASS with the suite as it was before `aa7a733` (the `person.test.ts` change reverts too).
- [ ] **Step 3:** Add to the old plan's top: `> **Superseded on 2026-10-23** by 2026-10-23-guided-claude-desktop-setup.md.` Commit `docs(plan): the one click plan is superseded`.

### Task 2: Read Neon's settings

**Files:** Modify `src/lib/env.ts` (`readEnv`). Test: `tests/unit/env.test.ts`.

**Interfaces:**
- Produces: `readEnv` takes the database address from `FOUNDATION_DATABASE_URL`, else `DATABASE_URL`, else `POSTGRES_URL`. For an address from `DATABASE_URL` or `POSTGRES_URL` whose host ends `.neon.tech`, an `sslmode` of `require` (and `channel_binding=require`) is accepted by rewriting it to `sslmode=verify-full`, so `insecureSslMode` still refuses `disable`, `allow`, `prefer` and `no-verify` everywhere and `FOUNDATION_DATABASE_URL` keeps today's rule exactly. Add `demoDeploy: boolean` (`FOUNDATION_DEMO_DEPLOY === "on"`).

- [ ] **Step 1: Write failing tests:** `"reads DATABASE_URL when FOUNDATION_DATABASE_URL is unset"`, `"falls back to POSTGRES_URL"`, `"FOUNDATION_DATABASE_URL wins over DATABASE_URL"`, `"a neon.tech address with sslmode=require is accepted as verify-full"`, `"a neon.tech address with sslmode=disable is still refused"`, `"FOUNDATION_DATABASE_URL with sslmode=require is still refused, as today"`, `"demoDeploy is on only for the exact value on"`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/env.test.ts`; expect FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run; expect PASS, then `npm test`.
- [ ] **Step 5:** Commit `feat(db): the command center connects to the Neon database Vercel adds`.

### Task 3: The demo button and the build request

**Files:** Create `src/lib/setup-links.ts`, `src/lib/build-request.ts`, `src/components/BuildRequest.tsx`. Modify `src/app/page.tsx`, the console layout `src/app/admin/(console)/layout.tsx` (sidebar entry) and the admin home screen (one card). Test: `tests/unit/home-page.test.ts`, `tests/unit/build-request.test.ts`.

**Interfaces:**
- Produces: `SETUP_START_URL: string` in `setup-links.ts`, the public page of 0.3.1. Until Task 4 publishes it, the value is the Dojo Dictionary's address `https://lb-share.lightbrands.ai/s/dvsaxjofhnyr9bb6`; Task 5 replaces it with 0.3.1's own link from `ninja/foundation/links.yaml`.
- Produces: `type BuildRequest = { name: string; business: string; whatItDoes: string; email: string; phone: string; want: string; when: string; worth: WorthPick; worthNote: string }`, `WORTH_PICKS` (the six labels, in order), `buildRequestMailto(r: BuildRequest): string` (to `hello@lightbrands.ai`, subject `Build request: <business>`, a plain text body with each question and answer), `buildRequestText(r: BuildRequest): string` (the same body, for Copy).
- The dialog prefills business and what it does from the profile and offers "Open email" and "Copy message". The button reads "Have Light Brands build it for you".

- [ ] **Step 1: Write failing tests:** home page: `"with demoDeploy the home page offers Build your own with Claude linking SETUP_START_URL"`, `"without demoDeploy it stays Get in touch"`, `"the public home page never shows the build request"`; build request: `"the mailto goes to hello@lightbrands.ai with every answer"`, `"apostrophes, ampersands and line breaks are encoded"`, `"the worth question reads exactly What would it be worth to you to have this built and running?"`, `"the word budget appears nowhere"`, `"WORTH_PICKS are the six bands in order"`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/home-page.test.ts tests/unit/build-request.test.ts`; expect FAIL.
- [ ] **Step 3:** Implement in the existing styles (the home page keeps its rise sequence).
- [ ] **Step 4:** Run; expect PASS, then `npm test && npm run typecheck && npm run lint`.
- [ ] **Step 5:** Commit `feat: Build your own with Claude on the demo, and a build request to Light Brands`.

### Task 4: The nine steps in the Ninja dictionary (QIE)

**Files:** in a new QIE worktree `/Users/lawless/Documents/qie-wt-foundation-setup` on branch `ninja/foundation-setup`, created from `ninja/category-masters` (`git -C /Users/lawless/Documents/qie worktree add ../qie-wt-foundation-setup -b ninja/foundation-setup ninja/category-masters`):
- Modify: `_qie/core/data/ninja-framework/foundation/numbers.yaml`, `foundation/numbers.lock`, `frameworks/foundation.md` (Depth tiers, Questions, Connections and Data rewritten to this path; a list of the nine steps), the Dojo Dictionary map row 0.3 (`_qie/core/data/dojo-dictionary-map.md` on that branch, if present there; else the main checkout's copy is updated in Task 5's QIE commit).
- Create: one entry per step, `frameworks/foundation-setup/<n>.md` for 0.3.1 to 0.3.9 (or the closest id shape the publisher accepts, decided by reading `ninja.py`), each with Check, Do, Prove, Next, the copyable prompt, links back to 0.1, 0.2 and 0.3 and forward to the next number.
- Modify only if needed: `_qie/core/tools/ninja/ninja.py` and `test_ninja.py`, where an entry id or a number under 0.3 is rejected.

Content each step carries (from the spec's path table and its settled calls):
- 0.3.1: Claude Pro first; download and install Claude Desktop; sign in; open the Code tab; create a folder named `foundation-command-center` and open it.
- 0.3.2: check Node.js 20.9+ and Git, help install; `git clone https://github.com/Light-Brands/foundation .`; rename the remote to `upstream`; `npm install`. No PIN, no local run.
- 0.3.3: the owner runs `gh auth login` (browser); Claude runs `gh repo create foundation-command-center --private --source . --remote origin --push`.
- 0.3.4: `vercel login`; `vercel link --project foundation-command-center`; `vercel git connect` (installs Vercel's GitHub app in the browser); the owner, in their own Terminal window, runs `vercel env add FOUNDATION_PIN production` then `preview`; Claude runs `vercel env add FOUNDATION_BUSINESS_NAME` with the name the owner says.
- 0.3.5: `vercel integration add neon --name foundation-command-center`; if it stops for the browser, the owner finishes there; fallback: Storage tab on vercel.com, Neon, Connect. Then `vercel env pull .env.local`.
- 0.3.6: `vercel --prod`; open the address; sign in; Settings, Preferences, Save; a test message from `/contact` arrives in Handle what needs you; optional `npm run dev` locally with the pulled settings.
- 0.3.7: Claude runs `vercel env rm FOUNDATION_PIN production --yes` (and preview); the owner adds the new one in their Terminal; Claude redeploys.
- 0.3.8: `git fetch upstream`, merge `upstream/main`, keep `key/`, `.env*` and the owner's own files, explain any conflict in plain words, push on the owner's yes (the push deploys).
- 0.3.9: today's `prompts/setup/custom-domain.md`, as a step page.

- [ ] **Step 1:** Create the worktree. Read `ninja.py`'s entry id and number checks and `test_ninja.py`.
- [ ] **Step 2: Write failing checks first** if `ninja.py` changes: a test that numbers `0.3.1` to `0.3.9` with entries pass the number and lock checks, and that a number under a retired or missing parent still fails. Run `python3 -m pytest _qie/core/tools/ninja/test_ninja.py`; expect FAIL; then extend `ninja.py`.
- [ ] **Step 3:** Write the nine entries and the rewritten `frameworks/foundation.md`; add the numbers and lock rows.
- [ ] **Step 4:** Run the publisher's own check command (`python3 _qie/core/tools/ninja/ninja.py check`, or what its help names) and the tests; expect PASS with no problems.
- [ ] **Step 5:** Commit on `ninja/foundation-setup`: `feat(ninja): Foundation setup in nine numbered steps, 0.3.1 to 0.3.9`.
- [ ] **Step 6:** Publish with the publisher's publish command, which writes the lb-share links into `foundation/links.yaml`; commit that as `chore(ninja): publish the Foundation setup steps`. Do not push the QIE branch.

### Task 4b: 2.1.2 Identity, the front end design prompt (QIE)

**Files:** in the same QIE worktree and branch as Task 4. Create the entry `modules/brand/identity.md` (the id shape the publisher accepts beside `modules/brand/story`); set `entry: modules/brand/identity` on number 2.1.2 in `foundation/numbers.yaml` and its lock row. Input: `.superpowers/sdd/2026-10-23-guided-claude-desktop-setup/design-recipe.md` in the Foundation worktree (the research of the demo design quality recipe).

- [ ] **Step 1:** Read `design-recipe.md`, `modules/brand/story.md` (the house shape of a brand entry) and the spec's 2.1.2 section.
- [ ] **Step 2:** Write the entry: the questions first, one at a time; then the full recipe as a builder brief carrying the feeling; the order of work from brand settings to screens and components, going as far as the owner chooses; the proof (before and after screenshots of the same screens, contrast, mobile, speed); links to 2.2.3 Brand kit, 2.1.3 Story and voice and 0.3.8.
- [ ] **Step 3:** Run the publisher's check and tests; expect PASS.
- [ ] **Step 4:** Commit `feat(ninja): 2.1.2 Identity, bring your command center up to demo design quality`; publish with Task 4's publish step.

### Task 4c: An owner brand layer and brand tinted neutrals (Foundation)

Found by Task 4b's review: the Identity prompt had no safe place to put the owner's look, so it wrote into `DEFAULT_BRAND` and a fourth admin tone, which breaks pinned tests. This task gives it one.

**Files:** Modify `src/lib/brand/` (tokens and css, and where the brand is loaded: `loadBrand` in `src/lib/data/brand.ts` or `safe.ts`), the brand preview if it reads the brand. Create the reader for `key/brand.yaml`. Test: new `tests/unit/brand-owner-layer.test.ts`; existing brand, admin tone, pwa and frame tests stay byte for byte unchanged and passing.

**Interfaces:**
- Produces: `key/brand.yaml`, optional, holding any subset of the existing brand fields by their current names. Order of layers: `DEFAULT_BRAND`, then `key/brand.yaml`, then the saved `core_brand` row. Each value passes the same range checks the row's values pass today; an invalid or unknown key is ignored and named once in the server log, never thrown at a visitor.
- Produces: a new closed brand lever `neutrals: "slate" | "brand"`, default `"slate"`, so today's look is unchanged. With `"brand"`, the admin chrome's neutral grays take the brand's hue at low chroma, applied on top of the current tone; `ADMIN_TONES`, `TONES` and every existing test are unchanged.
- The Key checks accept `key/brand.yaml` (document it in `docs/standards/key.md`); `system.md` mentions it when present.

- [ ] **Step 1: Write failing tests:** `"without key/brand.yaml the brand equals DEFAULT_BRAND"`, `"key/brand.yaml values override DEFAULT_BRAND"`, `"the saved row overrides key/brand.yaml"`, `"an out of range or unknown key is ignored and logged once"`, `"neutrals defaults to slate and leaves every tone's colors unchanged"`, `"neutrals brand tints the neutral grays with the brand hue and keeps text contrast at 4.5 to 1"`, `"the Key checks accept key/brand.yaml"`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/brand-owner-layer.test.ts`; expect FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run, then `npm test && npm run typecheck && npm run lint && npm run build`; expect PASS with no existing test changed.
- [ ] **Step 5:** Commit `feat(brand): an owner brand layer in key/brand.yaml, and brand tinted neutrals`.

### Task 5: The dictionary update in the Foundation, and the README

**Files:** Modify `ninja/` (the dictionary update, copied from the QIE branch's published output by the publisher's sync to the Foundation, or by the same copy the dictionary has used before, found in `ninja.py`), `prompts/setup/` (the nine step prompts as copies; `deploy.md`, `run-locally.md`, `set-pin.md` replaced), `prompts/README.md`, `README.md`, `src/lib/setup-links.ts` (`SETUP_START_URL` set to 0.3.1's link from `ninja/foundation/links.yaml`). Test: the existing dictionary and prompt tests (`tests/unit/dictionary.test.ts` and any prompt checks).

- [ ] **Step 1:** Bring the dictionary update in; set `SETUP_START_URL`.
- [ ] **Step 2:** Rewrite `README.md`: what the Foundation is, then "Start at 0.3.1" with its link, the nine steps as a numbered list of links, then "Developers: fork it". No Deploy button.
- [ ] **Step 3:** Run `npm test && npm run typecheck && npm run lint && npm run build`; expect PASS.
- [ ] **Step 4:** Commit `docs: setup in nine steps from the Ninja dictionary`.

### Task 6: The real run (needs a person with fresh accounts)

No code. Lawless or a teammate, on fresh GitHub and Vercel accounts and Claude Pro, starting from 0.3.1's page.

- [ ] **Step 1:** Push `claude/public-one-click` so 0.3.2 can clone it (0.3.2 temporarily names this branch for the test; the published page names `main`).
- [ ] **Step 2:** Run 0.3.1 to 0.3.6, each in a new chat. Record in `docs/superpowers/plans/2026-10-23-real-run.md`: every place the person had to guess, every error and how the step handled it, the exact settings Neon's integration set (names only), and whether the site saved data.
- [ ] **Step 3:** Run 0.3.7 and 0.3.8 on the same copy.
- [ ] **Step 4:** Fix what the run found (in the entries, the prompts or Task 2's settings code) through the same review loop, and republish.

### Task 7: Finish (each on Lawless's yes)

- [ ] **Step 1:** Run `npm test && npm run typecheck && npm run lint && npm run build && rm -rf .data/e2e && npm run e2e`; all pass. Open the pull request into `main`.
- [ ] **Step 2:** On his yes: merge; push `ninja/foundation-setup` and open its pull request into its parent line, telling the department masters session.
- [ ] **Step 3:** On his yes: set `FOUNDATION_DEMO_DEPLOY=on` on the demo deployment (foundation.lightbrands.ai) and redeploy; confirm the button opens 0.3.1.
- [ ] **Step 4:** On his yes: delete `Light-Brands/foundation-step-zero`, the `foundation-step-zero` Vercel project, the `step-zero` branch, and the empty Supabase organization "Autod3v's projects".
