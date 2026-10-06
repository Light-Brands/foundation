import type { Db } from "@/lib/db/types";
import { openScriptDb } from "@/lib/db/script";
import { isPaused } from "@/lib/data/pause";
import { PAUSED_MESSAGE, recordDraftSkip } from "@/lib/drafts/command";

// The frame every new drafting handler uses: it reads the step and its flags, opens the database,
// prints machine output as one JSON object per line, and turns a failure into a plain message.

export type HandlerContext = {
  db: Db;
  root: string;
  flags: Record<string, string>;
  rest: string[];
  now: Date;
  readStdin: () => Promise<string>;
  out: (value: unknown) => void;
};
export type Subcommand = (ctx: HandlerContext) => Promise<void>;

/** A failure the owner can act on. Its message is printed as it is. */
export class HandlerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HandlerError";
  }
}

export function parseFlags(args: string[]): { flags: Record<string, string>; rest: string[] } {
  const flags: Record<string, string> = {};
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const m = /^--([a-z][a-z0-9-]*)(?:=(.*))?$/.exec(args[i]);
    if (!m) { rest.push(args[i]); continue; }
    if (m[2] !== undefined) flags[m[1]] = m[2];
    else if (i + 1 < args.length && !args[i + 1].startsWith("--")) flags[m[1]] = args[++i];
    else flags[m[1]] = "true";
  }
  return { flags, rest };
}

async function readAll(stream: AsyncIterable<string | Buffer>): Promise<string> {
  let text = "";
  for await (const chunk of stream) text += typeof chunk === "string" ? chunk : chunk.toString("utf8");
  return text;
}

export async function runHandler(
  argv: string[],
  subs: Record<string, Subcommand>,
  deps: { root?: string; openDb?: () => Promise<Db>; now?: Date; stdin?: AsyncIterable<string | Buffer>; write?: (s: string) => void; writeError?: (s: string) => void } = {},
): Promise<number> {
  const write = deps.write ?? ((s: string) => { process.stdout.write(s); });
  const writeError = deps.writeError ?? ((s: string) => { process.stderr.write(s); });
  const [sub, ...args] = argv;
  if (!sub || !Object.hasOwn(subs, sub)) {
    writeError(`Use one of these steps: ${Object.keys(subs).join(", ")}.\n`);
    return 2;
  }
  const root = deps.root ?? process.cwd();
  const db = await (deps.openDb ?? (() => openScriptDb(root)))();
  try {
    // A handler started directly (npm run brief, say) still respects the pause switch.
    if (await isPaused(db)) {
      await recordDraftSkip(db, deps.now ?? new Date());
      writeError(`${PAUSED_MESSAGE}\n`);
      return 3;
    }
    const { flags, rest } = parseFlags(args);
    await subs[sub]({
      db, root, flags, rest, now: deps.now ?? new Date(),
      readStdin: () => readAll(deps.stdin ?? process.stdin),
      out: (value) => write(`${JSON.stringify(value)}\n`),
    });
    return 0;
  } catch (err) {
    writeError(`${err instanceof HandlerError ? err.message : `Something went wrong: ${(err as Error).message}`}\n`);
    return 1;
  } finally {
    await db.close();
  }
}
