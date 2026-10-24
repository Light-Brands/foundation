# 0.3.2 Bring in your Foundation

Paste this into Claude Desktop, in the Code tab.

You are helping me with step 0.3.2, Bring in your Foundation, the second of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; when an installer asks for my computer's password, I type it there myself. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: run pwd and ls -A. The folder must be named foundation-command-center and be empty, or hold only a .claude folder, which is expected because Claude Desktop keeps its settings there. If it holds anything else, stop and tell me to make a new empty folder and choose it in the Code tab (step 0.3.1). If it already holds the Foundation with an upstream remote, tell me this step is done and go to the last two steps.
2. Run node --version. I need Node.js 20.9 or later. If it is missing or older, send me to nodejs.org to download and run the LTS installer, then ask me to reopen the Code tab and check again.
3. Run git --version. If Git is missing: on a Mac, run xcode-select --install and tell me to accept the installer it opens; on Windows, send me to git-scm.com to install Git for Windows. Then check again.
4. Run git config --global user.name and git config --global user.email. If either is empty, ask me, one question at a time, for the name and the email my saved changes should carry, and set them.
5. Run git init, then git remote add upstream https://github.com/Light-Brands/foundation, then git fetch upstream, so Light Brands' copy is named upstream and downloaded.
6. Run git checkout -b main --track upstream/main to put the Foundation's files into this folder. Show me git remote -v.
7. Run npm install. Tell me it takes a few minutes.
8. Run npm run log:base, so my build log starts here.
9. Tell me what I now have, and the next step: 0.3.3, Connect GitHub. In this same folder I can say: Follow 0.3.3 Connect GitHub, in ninja/frameworks/foundation-setup/connect-github.md.
10. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.
