// The three ways to open a prompt in Claude. Nothing is sent by any of them: the owner reads the prompt and presses
// Enter. Sources: code.claude.com/docs/en/web-quickstart (prefill), support.claude.com article 14729294 (Desktop links),
// code.claude.com/docs/en/deep-links (the terminal).

export type Target = "desktop" | "web" | "terminal";
export const TARGETS: Target[] = ["desktop", "web", "terminal"];
export const TARGET_LABEL: Record<Target, string> = { desktop: "Claude Desktop", web: "claude.ai/code", terminal: "Terminal" };
export const TARGET_HINT: Record<Target, string> = {
  desktop: "Opens the Code tab in the Claude app, in your Foundation folder.",
  web: "Opens Claude Code on the web with your GitHub repo selected.",
  terminal: "Opens Claude Code in your terminal, in your Foundation folder. Works once Claude Code has run on this computer.",
};
// Desktop truncates near 14,000 characters and the terminal stops at 5,000. The web limit matches Desktop's.
export const LIMIT: Record<Target, number> = { desktop: 14000, web: 14000, terminal: 5000 };

export type Where = { repo: string | null; folder: string | null };
export type Built = { ok: true; href: string } | { ok: false; reason: string };

function query(pairs: Record<string, string>): string {
  return new URLSearchParams(pairs).toString().replace(/\+/g, "%20");
}

export function openInLink(target: Target, prompt: string, where: Where): Built {
  if (prompt.length > LIMIT[target]) return { ok: false, reason: `This prompt is too long to open in ${TARGET_LABEL[target]}. Copy it instead.` };
  if (target === "web") {
    if (!where.repo) return { ok: false, reason: "Your GitHub repo is not known yet. Connect GitHub in Setup, or copy the prompt." };
    return { ok: true, href: `https://claude.ai/code?${query({ prompt, repositories: where.repo })}` };
  }
  if (!where.folder) return { ok: false, reason: "Add where your Foundation folder is on this computer, or copy the prompt." };
  if (target === "desktop") return { ok: true, href: `claude://code/new?${query({ q: prompt, folder: where.folder })}` };
  return { ok: true, href: `claude-cli://open?${query({ q: prompt, cwd: where.folder })}` };
}
