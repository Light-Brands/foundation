import { randomBytes } from "crypto";
import { existsSync, writeFileSync, mkdirSync } from "fs";

const outDir = "src/generated";
const outFile = `${outDir}/build-secret.ts`;

// --if-missing keeps the secret already there. An owner command such as npm run auth:unlock uses it, because a new
// secret signs out a running dev session and orphans the limiter's keys. FOUNDATION_KEEP_BUILD_SECRET=on does the
// same for every script a unit test starts, so one test's script never changes the secret under another test.
const keep = process.argv.includes("--if-missing") || process.env.FOUNDATION_KEEP_BUILD_SECRET === "on";
if (keep && existsSync(outFile)) process.exit(0);

mkdirSync(outDir, { recursive: true });

const secret = randomBytes(32).toString("hex");
const content = `export const BUILD_SECRET = "${secret}";\n`;

writeFileSync(outFile, content, "utf8");
console.log(`Generated ${outFile} with 256-bit secret`);
