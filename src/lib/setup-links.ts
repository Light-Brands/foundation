/**
 * Where an owner starts setting up their own command center with Claude: step 0.3.1, Get Claude Desktop. The address
 * is the one recorded for it in ninja/foundation/links.yaml.
 */
export const SETUP_START_URL = "https://lb-share.lightbrands.ai/s/2o3nlvcnkvhs0y59";

/** The three steps on the public start page (/start). Copy and links live here so they change in one place. */
export const CLAUDE_PRO_URL = "https://claude.com/pricing";
export const DESKTOP_MAC_URL = "https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect";
export const DESKTOP_WINDOWS_URL = "https://claude.ai/api/desktop/win32/x64/setup/latest/redirect";

export const START_PROMPT = `Set up my Foundation command center with me, one step at a time.

The Foundation is a free command center for running my business, from Light Brands. Its setup has five steps. Read each step's page when we reach it, adding /raw to the address, and follow the prompt on that page:

0.3.2 Bring in your Foundation: https://lb-share.lightbrands.ai/s/y4ntiar75zp5pe11
0.3.3 Connect GitHub: https://lb-share.lightbrands.ai/s/a5npei1dp7n09v8y
0.3.4 Connect Vercel: https://lb-share.lightbrands.ai/s/zurernrj8p8tx01h
0.3.5 Connect your database: https://lb-share.lightbrands.ai/s/0qyv9ikal6e3n7s5
0.3.6 Go live: https://lb-share.lightbrands.ai/s/oavoxcfdyaow0ozj

I am not a developer, so use plain words. Before each step, tell me in two sentences what it does and what I will need, and wait for my yes. Explain each command in one sentence before you run it. When a step needs me to sign in or choose a PIN, I type it myself in my own Terminal window, never in this chat. Start by checking that this folder is the empty foundation-command-center folder I just made.`;

// Claude Desktop's documented link: it opens the Code tab with the prompt filled in, and the owner presses send.
// https://support.claude.com/en/articles/14729294-open-claude-desktop-with-a-link
export const START_DEEP_LINK = `claude://code/new?q=${encodeURIComponent(START_PROMPT)}`;
