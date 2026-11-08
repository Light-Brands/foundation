# 0.3.2 Bring in your Foundation

Paste this into Claude Desktop, in the Code tab.

You are helping me with step 0.3.2, Bring in your Foundation, the second of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time and tell me what I should see after each. Go on to the next step by yourself; stop only when you need an answer from me or something only I can do, and when I do it outside this chat, watch for it as the watching rule below says.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; when an installer asks for my computer's password, I type it there myself. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

How you watch: when I do something outside this chat, such as accepting an installer, finishing a sign in in my browser or typing into my Terminal window, never ask me to tell you it is done. Run that step's check every 5 seconds in rounds of two minutes, for example for i in $(seq 24); do CHECK && break; sleep 5; done, where CHECK is the step's check. After a round that has not passed, tell me in one line that you are still watching and start another. The moment it passes, tell me what you saw and go on to the next step by yourself. If it has not passed after 10 minutes, or 30 for Apple's installer or a new domain, ask me what I see on my screen.

1. Check where we are: run pwd and ls -A. The folder must be named foundation-command-center and be empty, or hold only a .claude folder, which is expected because Claude Desktop keeps its settings there. If it holds anything else, stop and tell me to make a new empty folder and choose it in the Code tab (step 0.3.1). If it already holds the Foundation with an upstream remote, tell me this step is done and go to the last two steps.
2. Run node --version. I need Node.js 20.9 or later. If it is missing or older, send me to nodejs.org to download and run the LTS installer, then watch until node --version shows 20.9 or later. If the installer has finished and node is still not found, ask me to reopen the Code tab and check again.
3. On a Mac, run xcode-select -p to check for Apple's command line tools, which bring Git and what the other tools need to build. If they are missing, run xcode-select --install and tell me to click Install in the window it opens and agree to the license; it takes 5 to 15 minutes. Watch until xcode-select -p passes, then run git --version. On Windows, if git --version fails, send me to git-scm.com to install Git for Windows, then watch until git --version passes.
4. Run git config --global user.name and git config --global user.email. If either is empty, ask me, one question at a time, for the name and the email my saved changes should carry, and set them.
5. Run git init, then git remote add upstream https://github.com/Light-Brands/foundation, then git fetch upstream, so Light Brands' copy is named upstream and downloaded.
6. Run git checkout -b main --track upstream/main to put the Foundation's files into this folder. Show me git remote -v.
7. Run npm install. Tell me it takes a few minutes.
8. Run npm run log:base, so my build log starts here.
9. Tell me what I now have, and the next step: 0.3.3, Connect GitHub. In this same folder I can say: Follow 0.3.3 Connect GitHub, in ninja/frameworks/foundation-setup/connect-github.md.
10. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.
