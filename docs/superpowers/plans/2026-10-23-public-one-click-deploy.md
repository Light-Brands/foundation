> **Superseded on 2026-10-23** by 2026-10-23-guided-claude-desktop-setup.md.

# Free public Foundation, one click to running: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A business owner presses "Deploy your own" on the demo and, typing nothing, gets their own Foundation in their GitHub, Vercel and Supabase, signs in with 1234, must choose their own PIN and email, and starts building; every copy keeps receiving updates; and the repository goes public clean.

**Architecture:** The PIN moves from a hosting-only setting to a PIN state read from the database (`core_settings`), with the hosting PIN kept as the owner's recovery key and as the unchanged path for existing copies. Sessions stay HMAC tokens, keyed by whichever credential signed in, so a PIN change signs everyone out. The Supabase Marketplace settings are read directly, so nothing is copied by hand.

**Tech Stack:** Next.js 16 (proxy in `src/proxy.ts`), postgres.js and PGlite, Vitest, Playwright, GitHub Actions, Vercel Deploy Button with the Supabase Marketplace integration, Supabase Auth email.

**Spec:** `docs/superpowers/specs/2026-10-23-public-one-click-deploy-design.md`

## Global Constraints

- Default PIN `1234`; it opens a copy only while no PIN has been chosen and for **7 days** after the database first opened; chosen PINs are **6 to 12 digits** (`PIN_FORMAT`).
- The deploy asks for nothing: no `env` parameter on the Deploy Button.
- A copy with `FOUNDATION_PIN` set keeps signing in exactly as today and is never forced to choose a PIN.
- Build requests go to `hello@lightbrands.ai` by `mailto:`; the question is "What would it be worth to you to have this built and running?" with picks Under $2,500, $2,500 to $10,000, $10,000 to $30,000, $30,000 to $100,000, $100,000 or more, Not sure yet, plus optional "Anything you'd like us to know about that?". Never the word "budget".
- The build request button is inside `/admin` only; "Deploy your own" shows only when `FOUNDATION_DEMO_DEPLOY=on`.
- No mention of the $19 workshop anywhere.
- Copy: `docs/standards/copy.md` (US English, commas, colons, periods, no dashes). Standards in `docs/standards/` apply, especially `security.md`, `testing.md` (see each guard fail first), `commits.md`.
- Never add a category (`CLAUDE.md`); new screens sit under existing ones.
- Nothing is made public, deleted or set on a live deployment without Lawless's yes.

## Review Focus

1. **The database is down at sign in.** Expected: sign in answers 503 and never falls back to 1234 or to no check. Test in Task 3.
2. **Two people sign in with 1234 at once and both choose a PIN.** Expected: the first choice wins, the second is refused and sent to sign in. Test in Task 4.
3. **Someone guesses at 1234 or at a reset code.** Expected: the existing limiter counts every try, and a reset code dies after 5 wrong tries. Tests in Tasks 3 and 5.
4. **A deploy without a database (preview) and without a hosting PIN.** Expected: no 1234 anywhere (nothing could be stored), the sign in page explains setup as today. Test in Task 3.
5. **The owner changes the PIN while signed in on another device.** Expected: the other device is signed out within seconds. Test in Task 2.

---

### Task 1: Step zero, a real deploy

Confirms what the code would otherwise guess. No product code. Needs Lawless (or a team member) to press the clone button into a fresh Vercel account or a scratch team.

**Files:**
- Create: `docs/superpowers/plans/2026-10-23-step-zero-findings.md`

- [ ] **Step 1:** Find the Supabase Marketplace integration's id for the Deploy Button (`integration-ids=oac_...`, or the Marketplace product parameter if Vercel now uses one) and build a clone URL for this branch with no `env` parameter.
- [ ] **Step 2:** Deploy it into a fresh Vercel account. Record, by name only (never values), every environment variable the integration set, and for each Postgres address: host suffix, port, and its `sslmode`.
- [ ] **Step 3:** Record which address is Supabase's **session pooler on port 5432** (the transaction pooler on 6543 stalls postgres.js; the direct host is IPv6 only). Record whether its certificate verifies against Supabase's root CA.
- [ ] **Step 4:** Confirm Supabase Auth email from that project reaches the deploying account's own address with no setup: call `POST <SUPABASE_URL>/auth/v1/otp` with the secret key and that email. Record whether the email carries a **6 digit code** (the default Magic Link template may carry only a link) and, if only a link, where it redirects (Site URL) and whether `POST /auth/v1/verify` accepts its `token_hash`.
- [ ] **Step 5:** In the cloned repository, confirm whether a workflow using `GITHUB_TOKEN` may open a pull request (new repositories default "Allow GitHub Actions to create and approve pull requests" to off), and whether it may open an issue.
- [ ] **Step 6:** Write the findings file and commit. **Stop and bring Lawless the fallback** if: the button cannot require Supabase; no session pooler address is available; Supabase email cannot reach the owner with neither a code nor a working link. Later tasks read their concrete values from this file.

```bash
git add docs/superpowers/plans/2026-10-23-step-zero-findings.md
git commit -m "docs(plan): step zero findings from a real one click deploy"
```

### Task 2: Settings from the Marketplace, and the PIN state

**Files:**
- Modify: `src/lib/env.ts` (readEnv), `src/lib/auth/pin-token.ts`
- Create: `src/lib/db/supabase-ca.ts` (Supabase root CA as a PEM string constant, from step zero), `src/lib/auth/owner-pin.ts`, `core/db/migrations/0021_core_owner_pin.sql`
- Test: `tests/unit/env.test.ts`, `tests/unit/owner-pin.test.ts`

**Interfaces:**
- Produces, in `env.ts`: `readEnv` also reads the Marketplace names when the `FOUNDATION_*` ones are unset: `databaseUrl` from the session pooler address step zero names (normalized: sslmode removed, verified with `databaseCa`), `databaseCa` defaults to `SUPABASE_ROOT_CA` when the host ends `.supabase.com`, `supabaseUrl` from `SUPABASE_URL`, `supabaseSecretKey` from `SUPABASE_SECRET_KEY`, and `fixedSecret` and `secret` from `deriveSecret(SUPABASE_JWT_SECRET)` when `FOUNDATION_SECRET` is unset. `FOUNDATION_*` values always win. Add `demoDeploy: boolean` (`FOUNDATION_DEMO_DEPLOY === "on"`).
- Produces `deriveSecret(jwtSecret: string): string` (HMAC-SHA256 of the fixed label `foundation-secret:v1` under the JWT secret, hex, 64 characters).
- Produces, in `owner-pin.ts`:
  - `DEFAULT_PIN = "1234"`, `DEFAULT_PIN_DAYS = 7`
  - `type PinState = { kind: "hosting"; credential: string; chosen: boolean } | { kind: "chosen"; credential: string; email: string } | { kind: "default"; credential: string; expiresAt: Date } | { kind: "expired" } | { kind: "none" }`
  - `readPinState(db: Queryable | null, env: FoundationEnv, now?: Date): Promise<PinState>`: hosting PIN set → `hosting`; else no database → `none`; else chosen hash stored → `chosen`; else `default` until `pin_default_from + 7 days`, then `expired`. A database error throws (callers fail closed).
  - `pinAccepts(state: PinState, candidate: string): Promise<string | null>`: the credential to sign with, or null.
  - `hashPin(pin: string): string` and `checkPinHash(pin: string, stored: string): boolean` (node `scrypt`, random salt, constant time).
  - `choosePin(db: Queryable, pin: string, email: string, now?: Date): Promise<"ok" | "taken">` (insert on conflict do nothing; `taken` when a PIN already exists).
  - `cachedPinState(env, now?)`: `readPinState` behind a 5 second in-memory cache, cleared by `choosePin` in the same process.
- `pin-token.ts`: `signSession(credential, secret, now?)` and `verifySession(token, credential, secret, now?)` keep their shape; the argument is now the credential (`hosting:<pin>`, `chosen:<hash>`, `default`), so any PIN change invalidates sessions.
- Migration `0021_core_owner_pin.sql`: no new table; seeds `core_settings` row `pin_default_from` = now() on conflict do nothing, and documents keys `pin_hash`, `pin_email`, `pin_set_at`, `pin_reset` in its header comment.

- [ ] **Step 1: Write failing tests** in `tests/unit/env.test.ts`: `"reads the Marketplace session pooler address when FOUNDATION_DATABASE_URL is unset"`, `"FOUNDATION_DATABASE_URL wins over the Marketplace address"`, `"derives a stable 64 character secret from SUPABASE_JWT_SECRET"` (same input twice gives the same value; differs from the build secret), `"demoDeploy is on only for the exact value on"`. In `tests/unit/owner-pin.test.ts` (with `coreDb()`): `"a fresh database is in default with expiry seven days after pin_default_from"`, `"default turns expired after seven days"`, `"a hosting PIN wins and reports whether a PIN was chosen"`, `"no database and no hosting PIN is none"`, `"choosePin stores a hash, never the PIN, and a second choosePin is taken"`, `"pinAccepts takes 1234 only in default"`, `"a database error throws"`, `"changing the PIN changes the credential so an old session no longer verifies"`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/env.test.ts tests/unit/owner-pin.test.ts`; expect FAIL.
- [ ] **Step 3:** Implement the interfaces above.
- [ ] **Step 4:** Run the same command; expect PASS. Run `npm test`; existing PIN tests still pass.
- [ ] **Step 5:** Commit: `feat(auth): the PIN state, read from the database, with the Marketplace settings read directly`.

### Task 3: Sign in on the PIN state

**Files:**
- Modify: `src/lib/auth/gate.ts` (`handleGatePost`), `src/app/api/gate/route.ts`, `src/proxy.ts`
- Test: `tests/unit/gate.test.ts`

**Interfaces:**
- Consumes: `cachedPinState`, `pinAccepts`, `signSession`, `verifySession` (Task 2).
- Produces: `handleGatePost(body, state: PinState, secret, now?, gate?)` returns `{ status, token?, error?, retryAfterMs?, next?: "/admin/choose-pin" }`; `next` is set for `default`, and for `hosting` when `chosen` is false and a database exists. The proxy reads the state once per request (cached), sends a `default` session to `/admin/choose-pin` for every `/admin` path except that page and `/api/gate`, and lets `chosen` and `hosting` sessions through as today.

- [ ] **Step 1: Write failing tests:** `"1234 signs in during default and lands on choose-pin"`, `"1234 is refused once expired, with error expired"`, `"none answers 503 setup and never accepts 1234"`, `"a database error answers 503 and checks nothing"`, `"every wrong 1234 try is counted by the limiter"`, `"a hosting PIN copy signs in exactly as before and is never sent to choose-pin when no database exists"`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/gate.test.ts`; expect FAIL.
- [ ] **Step 3:** Implement; the route reads the state with `cachedPinState(readEnv())` and fails closed (503 `unavailable`) when it throws.
- [ ] **Step 4:** Run; expect PASS, then `npm test`.
- [ ] **Step 5:** Commit: `feat(auth): sign in reads the PIN state and sends a first sign in to choose a PIN`.

### Task 4: Choose your PIN

**Files:**
- Create: `src/app/admin/choose-pin/page.tsx`, `src/app/admin/choose-pin/actions.ts`
- Modify: `src/lib/auth/gate.ts` (`PUBLIC` is unchanged; the page sits behind a `default` or `hosting` session)
- Test: `tests/unit/choose-pin.test.ts`, `tests/e2e/first-run.spec.ts`

**Interfaces:**
- Consumes: `choosePin`, `PIN_FORMAT`, `signSession`.
- Produces: server action `choosePinAction(form: FormData): Promise<{ ok: true } | { ok: false; error: "format" | "mismatch" | "email" | "taken" }>` with fields `pin`, `confirm`, `email`. On ok it sets a new session cookie for the `chosen` credential and redirects to `/admin`, where the first session prompt is pointed at.

- [ ] **Step 1: Write failing tests:** `"refuses a PIN outside 6 to 12 digits"`, `"refuses 1234 as the new PIN"`, `"refuses a mismatch"`, `"refuses an address that is not an email"`, `"the second of two choices at once is taken"`, and the e2e `"fresh copy: home shows 1234, sign in, must choose, then /admin; 1234 then fails"`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/choose-pin.test.ts`; expect FAIL.
- [ ] **Step 3:** Implement the page in the sign in page's visual language (`chamber.module.css`), with copy: heading "Choose your PIN", lines "6 to 12 digits. It replaces 1234 for good." and "Your email, so you can reset your PIN if you forget it."
- [ ] **Step 4:** Run unit tests, then `rm -rf .data/e2e && npm run e2e -- first-run`; expect PASS.
- [ ] **Step 5:** Commit: `feat(auth): a first sign in chooses its own PIN and email`.

### Task 5: Forgot PIN, by emailed code

**Files:**
- Create: `src/lib/auth/pin-reset.ts`, `src/app/api/gate/reset/route.ts`
- Modify: `src/app/admin/login/page.tsx`, `src/lib/auth/gate.ts` (`PUBLIC` adds `^/api/gate/reset$`)
- Test: `tests/unit/pin-reset.test.ts`

**Interfaces:**
- Consumes: `chosen` state's `email`, the limiter, `choosePin` semantics for the new PIN (replacing, not inserting).
- Produces: `startReset(db, env, now?): Promise<{ sentTo: string }>` (masked address, for example `d***@lightbrands.ai`) sending through Supabase Auth exactly as step zero found works; `finishReset(db, code: string, newPin: string, now?): Promise<"ok" | "wrong" | "expired" | "locked">` with a code that is single use, lives **15 minutes**, and locks after **5** wrong tries. If step zero found link only email, the code becomes the link's `token_hash` verified through `/auth/v1/verify`, and the page flow follows the link; the outcomes stay the same.
- Login page: "Forgot PIN?" shows only in `chosen`; in `expired` the page explains recovery through Vercel (add `FOUNDATION_PIN`, Redeploy) and shows the `setup/set-pin` prompt box.

- [ ] **Step 1: Write failing tests:** `"sends only to the stored email and returns it masked"`, `"a right code sets the new PIN and signs out old sessions"`, `"a code is single use"`, `"a code expires after 15 minutes"`, `"five wrong codes lock it"`, `"no reset exists before a PIN is chosen"`. Supabase is reached through an injected `send` function; tests use a stand in.
- [ ] **Step 2:** Run `npx vitest run tests/unit/pin-reset.test.ts`; expect FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run; expect PASS.
- [ ] **Step 5:** Commit: `feat(auth): a forgotten PIN resets by an emailed code`.

### Task 6: The home page: 1234, and Deploy your own on the demo

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/lib/deploy-button.ts`
- Test: `tests/unit/home-page.test.ts`

**Interfaces:**
- Consumes: `cachedPinState`, `env.demoDeploy`.
- Produces: `DEPLOY_URL: string` in `deploy-button.ts`, the clone URL from step zero (repository `https://github.com/Light-Brands/foundation`, the Supabase integration required, no `env`).

- [ ] **Step 1: Write failing tests:** `"default shows: Your command center is ready. Here is your PIN: 1234, with a Sign in link"`, `"chosen, hosting, expired and none show no PIN"`, `"demoDeploy replaces Get in touch with Deploy your own linking DEPLOY_URL"`, `"without demoDeploy the button stays Get in touch"`, `"the public home page never shows the build request button"`. A state read that throws renders the page without the notice.
- [ ] **Step 2:** Run `npx vitest run tests/unit/home-page.test.ts`; expect FAIL.
- [ ] **Step 3:** Implement within the existing rise sequence and styles.
- [ ] **Step 4:** Run; expect PASS.
- [ ] **Step 5:** Commit: `feat(home): a fresh copy shows its starting PIN, and the demo offers Deploy your own`.

### Task 7: Have Light Brands build it for you

**Files:**
- Create: `src/lib/build-request.ts`, `src/components/BuildRequest.tsx`
- Modify: the console layout `src/app/admin/(console)/layout.tsx` (sidebar entry) and the admin home screen (one card)
- Test: `tests/unit/build-request.test.ts`

**Interfaces:**
- Produces: `type BuildRequest = { name: string; business: string; whatItDoes: string; email: string; phone: string; want: string; when: string; worth: WorthPick; worthNote: string }`, `WORTH_PICKS` (the six labels in Global Constraints, in order), `buildRequestMailto(r: BuildRequest): string` (`mailto:hello@lightbrands.ai` with subject `Build request: <business>` and a plain text body listing each answer under its question), `buildRequestText(r): string` (the same body, for Copy).
- The dialog prefills business and what it does from the profile, offers "Open email" (the mailto) and "Copy message".

- [ ] **Step 1: Write failing tests:** `"the mailto goes to hello@lightbrands.ai with every answer in the body"`, `"special characters and new lines are encoded"`, `"the worth question reads exactly What would it be worth to you to have this built and running?"`, `"the word budget appears nowhere"`, `"WORTH_PICKS are the six bands in order"`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/build-request.test.ts`; expect FAIL.
- [ ] **Step 3:** Implement; the button reads "Have Light Brands build it for you".
- [ ] **Step 4:** Run; expect PASS.
- [ ] **Step 5:** Commit: `feat(console): a build request to Light Brands, sent from the owner's own email`.

### Task 8: Updates reach every copy

**Files:**
- Create: `.github/workflows/foundation-updates.yml`
- Test: `tests/unit/ci.test.ts` (extend the existing workflow checks)

**Interfaces:**
- The workflow runs weekly and on `workflow_dispatch`; it does nothing in `Light-Brands/foundation` itself or in a fork (`github.event.repository.fork`); otherwise it fetches `https://github.com/Light-Brands/foundation` `main`, merges into branch `foundation-updates`, resolving any conflict under `key/` to the owner's side, and opens a pull request titled "Foundation update". If step zero found pull requests are blocked for `GITHUB_TOKEN`, it pushes the branch and opens an issue with the one click compare link instead.

- [ ] **Step 1: Write failing tests** in `ci.test.ts`: `"the update workflow skips the upstream repository and forks"`, `"it never overwrites key/"`, `"it pins every action to a commit"`.
- [ ] **Step 2:** Run `npx vitest run tests/unit/ci.test.ts`; expect FAIL.
- [ ] **Step 3:** Write the workflow.
- [ ] **Step 4:** Run; expect PASS. Then prove it in the step zero copy: publish a trivial upstream change on this branch's preview and watch the request open.
- [ ] **Step 5:** Commit: `feat(updates): every deployed copy receives Foundation updates as a pull request`.

### Task 9: README and prompts

**Files:**
- Modify: `README.md`, `prompts/setup/set-pin.md`, `prompts/setup/deploy.md`, `prompts/first-session.md` (only lines the new flow makes untrue)
- Test: `tests/unit/prompts.test.ts` if prompt format tests exist; otherwise the existing copy checks

- [ ] **Step 1:** README opens with the Deploy button (`DEPLOY_URL`), then three lines: deploy, open your site, sign in with 1234 and choose your PIN. Add "Fork this repository" for developers, and how updates arrive.
- [ ] **Step 2:** `set-pin.md` walks the expired 1234 and lost email recovery through Vercel (add `FOUNDATION_PIN`, Redeploy), never asking for the PIN in chat.
- [ ] **Step 3:** Run `npm test` and `npm run lint`; expect PASS.
- [ ] **Step 4:** Commit: `docs: the one click start, PIN recovery and updates`.

### Task 10: Whole check, then the branch goes up

- [ ] **Step 1:** Run `npm test && npm run typecheck && npm run lint && npm run build && rm -rf .data/e2e && npm run e2e`; all pass.
- [ ] **Step 2:** Repeat the spec's "Done when" on a fresh clone deploy from this branch's preview: 1234 shown, forced choice, saving (no preview banner), 1234 then fails, Forgot PIN code works, build request email opens filled, an update request arrives.
- [ ] **Step 3:** Push the branch and open the pull request with the results. It merges on Lawless's yes.

### Task 11: Going public (each step on Lawless's yes)

No code.

- [ ] **Step 1:** List every remote branch with merged or stale status and every open pull request and issue, with anything private found in their text. Bring the list to Lawless; delete only what he approves.
- [ ] **Step 2:** Run `gitleaks detect --log-opts="--all"` over every ref; fix anything found before going further.
- [ ] **Step 3:** Delete old Actions run logs.
- [ ] **Step 4:** On Lawless's yes: make `Light-Brands/foundation` public, set `FOUNDATION_DEMO_DEPLOY=on` on the demo deployment (foundation.lightbrands.ai), redeploy it, and press its "Deploy your own" once to confirm the whole path from the live demo.
