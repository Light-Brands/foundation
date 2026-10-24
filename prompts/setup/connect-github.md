# 0.3.3 Connect GitHub

Paste this into Claude Desktop, in the Code tab.

You are helping me with step 0.3.3, Connect GitHub, the third of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; when something needs a sign in that asks questions, give me the exact command to run in my own Terminal window and wait until I say it is done. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on. My repository is always mine and private.

1. Check where we are: run git remote -v. upstream must point at github.com/Light-Brands/foundation. If it does not, stop and tell me to go back to 0.3.2, Bring in your Foundation. If origin already points at my own repository, tell me this step is done and go to the last two steps.
2. Ask whether I have a GitHub account. If not, send me to github.com to create one in my browser.
3. Run gh --version. If the GitHub CLI is missing, help me install it from cli.github.com, or with brew install gh on a Mac that has Homebrew.
4. Help me open a Terminal window: on a Mac, Command and Space, type Terminal, press Return; on Windows, the Start menu, type PowerShell. Run pwd and give me the exact cd line for this folder.
5. Give me this command to run in that Terminal window: gh auth login --hostname github.com --git-protocol https --web. Tell me to press Return, then finish in my browser, typing the code it shows there and never here. Wait until I say it is done.
6. Run gh auth status to confirm, then gh auth setup-git so Git can push with that sign in.
7. Run gh repo view foundation-command-center. If it already exists in my account, tell me and offer foundation-command-center-2.
8. Run gh repo create foundation-command-center --private --source . --remote origin --push, with the name we agreed.
9. Show me git remote -v, then run gh repo view --web so I see my repository, marked Private, with my files.
10. Tell me what I now have, and the next step: 0.3.4, Connect Vercel and choose your PIN. In this same folder I can say: Follow 0.3.4 Connect Vercel and choose your PIN, in ninja/frameworks/foundation-setup/connect-vercel.md.
11. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.
