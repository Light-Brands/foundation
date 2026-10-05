import { execFileSync } from "node:child_process";
import path from "node:path";
import { setKeyBase } from "../src/lib/key/write";
import { COMMIT_ID } from "../src/lib/key/formats";

// Records the commit the build log starts after, for a Foundation whose setup did not record one.
const i = process.argv.indexOf("--root");
const root = path.resolve(i >= 0 ? process.argv[i + 1] : process.cwd());
const force = process.argv.includes("--force");

let head = "";
try {
  head = execFileSync("git", ["rev-parse", "--verify", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
} catch {
  head = "";
}
if (!COMMIT_ID.test(head)) {
  console.log("No git history yet. Make the first commit, then run npm run log:base again.");
  process.exit(1);
}

setKeyBase(root, head, { force }).then((r) => {
  if (r.status === "set") console.log(`log:base set provenance.base in key/key.yaml to ${r.base}. The build log starts after this commit.`);
  else if (r.status === "same") console.log(`provenance.base is already ${r.base}. Nothing changed.`);
  else if (r.status === "moved") console.log(`log:base moved provenance.base in key/key.yaml from ${r.was} to ${r.base}. The build log now starts after this commit.`);
  else {
    console.log(`provenance.base is already ${r.base}. Nothing changed. To start the build log after ${head} instead, run npm run log:base -- --force.`);
    process.exit(1);
  }
}, (e: Error) => {
  console.log(`log:base could not read key/key.yaml: ${e.message}`);
  process.exit(1);
});
