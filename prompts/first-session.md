# Your first session with Claude

Paste this into Claude Code inside your command center folder, or into Claude Desktop with the folder open.

Read CLAUDE.md in this project. Then look at my command center and tell me, in plain words:

1. If your command center folder is open in Claude Code, first, before any other work, run `git status` and show me what setup changed: key/key.yaml, key/knowledge/context-block.yaml, key/knowledge/system.md, and anything my Preferences save changed. When I say yes, commit those files by name as one commit with the message `chore: set up <business>`, where `<business>` is my business name.
2. What is running today.
3. Which setup step is next, and what it gives my business.
4. Which three parts of my business, from the categories in my command center, would give me the most time back first, based on what I tell you about my business.
5. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id.

If I upgraded from an earlier version, ask me to open Settings, then Preferences, and press Save once so my Key holds my business details.

Ask me about my business one question at a time before you answer part 4. Do not change any files except the build log and key/knowledge/system.md, and commit nothing beyond the setup commit, the work commit and its log entry.
