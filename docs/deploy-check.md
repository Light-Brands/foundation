# Deploy check

Date: 2026-10-04
Project: autod3vs-projects/foundation (Vercel, linked to Light-Brands/foundation)
Method: `npx vercel@latest deploy --yes --scope autod3vs-projects`, from the local folder.

## Timings

- Deploy 1, with `--env FOUNDATION_PIN=246810`: 48 seconds, including the first-time project link and the build.
- Deploy 2, no PIN: 26 seconds.

## Notes

- The preview URLs sit behind Vercel Deployment Protection (Vercel Authentication). Plain curl returned `302` to vercel.com/sso-api. Every check below ran through `npx vercel@latest curl <path> --deployment <url> -- <curl args>`. Protection stayed on.
- The CLI assigned the project's first deployment to the production target, with no `--prod` flag from us. Both deployments are now removed and the project has none.

## Deploy 1 (PIN set): https://foundation-2xq2tybt0-autod3vs-projects.vercel.app

| Check | Expected | Result |
|---|---|---|
| GET `/` | `307 .../gate?next=%2F` | `307 https://foundation-2xq2tybt0-autod3vs-projects.vercel.app/gate?next=%2F` |
| `/gate` lines matching "Your PIN" | `1` | `1` |
| POST `/api/gate` wrong PIN | `401` | `401` |
| POST `/api/gate` right PIN | `200` | `200` |
| `/` with cookie, lines matching "Live preview" | `1` | `1` |
| `/system/setup` with cookie, lines matching "Your stack, step by step" | `1` | `2` |

The last count is `2`. The page is present and renders the heading once; the phrase appears twice in the response body, once in the HTML and once in the embedded Next.js payload, and `grep -c` counts each as a line. Same behavior as the PIN-missing check below.

## Deploy 2 (no PIN): https://foundation-qroq3tiai-autod3vs-projects.vercel.app

| Check | Expected | Result |
|---|---|---|
| `/gate` lines matching "One step left: set your PIN" | `1` | `2` (two occurrences of the same text in the body; the text is present) |

## Cleanup

Both deployments removed with `npx vercel@latest remove <url> --yes`. The project was kept.
