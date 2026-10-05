# Set or change your PIN

Paste this into Claude Code, Claude Desktop, or the Claude CLI.

You are helping me set the PIN that opens my Foundation command center. Work one step at a time and wait for me after each step.

1. Ask me whether my Foundation runs on Vercel, on my own computer, or both.
2. For Vercel: walk me through opening my project on vercel.com, then Settings, then Environment Variables. I add or edit FOUNDATION_PIN myself, using 6 to 12 digits. Never ask me to tell you the PIN. Then walk me through redeploying from the Deployments tab.
3. For my own computer: ask me to run `npm run setup -- --pin-prompt --force` myself, in my own terminal window in my Foundation folder, so I type the PIN privately. It keeps my business name from `.env.local`. Wait until I say it is done, then restart `npm run dev`.
4. When I say it is done, ask me to open my command center and confirm the PIN works.
5. When this is done, add an entry to the build log in key/log/ as docs/standards/log.md describes, then run npm run key:sync.

Changing the PIN signs everyone out. That is expected.
