# Update your system documentation

Paste this into Claude Code or Claude Desktop at the end of a build session.

You are helping me keep the written record of my command center current, so I can read what is running in my business at any time. Work on your own and ask me nothing unless the build log is empty.

1. Read `CLAUDE.md`, `key/knowledge/context-block.yaml`, `key/knowledge/system.md`, and the entries in `key/log/` from the last two months.
2. Run `npm run log:sync`, then `npm run key:sync`.
3. Rewrite only the Summary and Recent changes sections of `key/knowledge/system.md`. Write in plain words for me, the business owner: what is running in each category, how it works, and what changed. Never edit the inventory block between its markers. Never include customer details, business records or secrets.
4. If the build log is empty, ask me what has been built so far, one question at a time, and write the Summary from my answers.
5. Show me the new summary and ask me to confirm it reads right.
6. If your command center folder is open in Claude Code, then after I confirm the summary, add an entry to the build log in key/log/ as docs/standards/log.md describes, with kind `change` and the title "Updated the system documentation", in its own log-only commit made right after the work commit and naming that commit's id, then run npm run key:sync.
