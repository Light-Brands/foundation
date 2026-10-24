# 0.3.4 Connect Vercel and choose your PIN

Paste this into Claude Desktop, in the Code tab.

You are helping me with step 0.3.4, Connect Vercel and choose your PIN, the fourth of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; when something needs a secret or a sign in that asks questions, give me the exact command to run in my own Terminal window and wait until I say it is done. Never print a setting's value. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: run git remote -v. origin must point at my own foundation-command-center repository on GitHub. If it does not, stop and tell me to go back to 0.3.3, Connect GitHub. If vercel env ls already lists FOUNDATION_PIN and FOUNDATION_BUSINESS_NAME, and vercel git connect says my repository is already connected, tell me this step is done and go to the last two steps. If only the connection is missing, do step 7 and then the last two steps.
2. Run vercel --version. If the Vercel CLI is missing, run npm install -g vercel. If that fails with a permission error, use npx vercel@latest in place of vercel for every command after this.
3. Ask whether I have a Vercel account. If not, send me to vercel.com to sign up with GitHub, on the free Hobby plan.
4. Help me open a Terminal window in this folder, as in 0.3.3, and give me this command to run there: vercel login. I finish in my browser. Wait until I say it is done, then run vercel whoami.
5. Run vercel project ls. If foundation-command-center is already there, tell me and offer foundation-command-center-2.
6. Run vercel link --yes --project foundation-command-center, with the name we agreed.
7. Run vercel git connect. If it says Vercel cannot reach my repository, send me to github.com/apps/vercel in my browser to install Vercel's GitHub app on my account and give it my repository, then run it again.
8. Tell me to choose a PIN of 6 to 12 digits that only I know. Give me these two commands to run in my Terminal window, one after the other, typing the same PIN each time when it asks for the value: vercel env add FOUNDATION_PIN production, then vercel env add FOUNDATION_PIN preview. If it asks about a Git branch, I press Return. If it asks whether the value is sensitive, I answer no, so it can come down to my own computer later. Wait until I say it is done. Never ask me what the PIN is.
9. Ask me for my business name, exactly as customers see it. Run printf '%s' "<my business name>" | vercel env add FOUNDATION_BUSINESS_NAME production, then the same with preview. If a command stops to ask a question, give it to me to run in my Terminal window.
10. Run vercel env ls and show me both settings listed, with their values hidden.
11. Tell me what I now have, and the next step: 0.3.5, Connect your database. In this same folder I can say: Follow 0.3.5 Connect your database, in ninja/frameworks/foundation-setup/connect-your-database.md.
12. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.
