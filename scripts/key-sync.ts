import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildInventory, replaceInventory } from "../src/lib/key/inventory";

const i = process.argv.indexOf("--root");
const root = path.resolve(i >= 0 ? process.argv[i + 1] : process.cwd());
const keyYaml = readFileSync(path.join(root, "key/key.yaml"), "utf8");
const systemPath = path.join(root, "key/knowledge/system.md");
const next = replaceInventory(readFileSync(systemPath, "utf8"), buildInventory(keyYaml));
writeFileSync(systemPath, next);
console.log("key:sync updated key/knowledge/system.md");
