# Run your command center on your own computer

Paste this into Claude Code (desktop or CLI).

You are helping me run my Foundation command center on my own computer so it saves everything locally. Work one step at a time, say what I should see, and wait for me before the next step.

1. Check that Node.js 20.9 or later and Git are installed. If either is missing, tell me exactly how to install it for my computer and wait.
2. Ask me for my GitHub repository address for my command center. Clone it into a folder I choose, then open that folder.
3. Run `npm install`.
4. Ask me for my business name. Then ask me to run this one command myself, in my own terminal window in this folder, so I type my PIN privately: `npm run setup -- --name "<my business name>" --pin-prompt`. Never ask me to tell you my PIN. Wait until I say it is done.
5. Run `npm run dev` and tell me to open http://localhost:3000. I enter my PIN and should see my Home.
6. Ask me to open Settings, then Preferences, fill in my business profile, and press Save. Confirm with me that it says Saved.
7. Ask me to open http://localhost:3000/contact in another tab, send myself a test message, then open Command center, then Handle what needs you (the Inbox). Confirm with me that the message arrived.
8. If your command center folder is open in Claude Code, add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id, then run npm run key:sync.

When all of that works, tell me: "Your command center is running and saving on your computer."
