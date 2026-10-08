# Testing

- **Make every test able to fail.** After you write a test, break the code it guards once and watch the test go red, then restore the code. Why: a test that cannot fail gives confidence it has not earned, and several of ours did.
- **Write a test for every security fix and every review finding.** The test names the problem it prevents. Why: a fix without a test is undone by the next refactor without anyone noticing.
- **Put logic in pure functions that take their clock and their store as arguments.** `siteWait` and `clientStep` in `src/lib/auth/limit.ts`, `safeNext` and `sessionIsValid` are the pattern. Why: a function that takes `now` as a parameter is tested in milliseconds, with no waiting and no mocks.
- **Write an end-to-end test for every win a member can see.** Playwright drives the built app through the PIN gate and does what a member does. Why: unit tests prove the parts, and only an end-to-end test proves a member can finish the task.
- **Delete `.data/e2e` before an end-to-end run.** The run uses `.data/e2e` for its database and `.data/e2e-key` for its Key. Why: leftover data from an earlier run makes a test pass or fail for the wrong reason.
- **Run tests with `npm test`, `npm run typecheck`, `npm run lint` and `npm run e2e`.** The `test` and `typecheck` scripts run the build-secret hook first, and `e2e` builds the app, which runs it. Why: calling `vitest` or `tsc` directly skips the hook the tests need.
- **Keep the output free of new noise.** A passing `npm test` prints the test summary and one Vite notice about the config file format, and nothing else. Fix the cause of any other warning, deprecation notice or stray log, or remove it. Why: a run that always shows warnings teaches everyone to ignore the one that matters.
- **Keep tests in `tests/unit/` and `tests/e2e/`, with shared helpers in `tests/support/` and sample data in `tests/fixtures/`.** Why: one place to look.
- **Test the Key with fixtures, and the real Key with the same checks.** `checkKeyFolder` reads `tests/fixtures/` for the good and bad cases and `key/` for the real folder. Why: the checks are proven able to fail on the bad fixtures, and then guard the real files.
- **Use no real customer data in a test.** Use invented names and addresses such as Harbor Studio. Why: test files are committed and shared.
