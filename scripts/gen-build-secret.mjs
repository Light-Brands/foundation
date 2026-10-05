import { randomBytes } from "crypto";
import { writeFileSync, mkdirSync } from "fs";

const outDir = "src/generated";
const outFile = `${outDir}/build-secret.ts`;

mkdirSync(outDir, { recursive: true });

const secret = randomBytes(32).toString("hex");
const content = `export const BUILD_SECRET = "${secret}";\n`;

writeFileSync(outFile, content, "utf8");
console.log(`Generated ${outFile} with 256-bit secret`);
