# 0.3.7 Change my PIN

Paste this into Claude Desktop, in the Code tab.

You are helping me with step 0.3.7, Change my PIN, one of the nine steps for my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; I type my new PIN only in my own Terminal window and on my sign in page. Never open or print .env.local, and never print a setting's value. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: .vercel/project.json must exist, vercel whoami must name my account, and vercel env ls must list FOUNDATION_PIN. If the folder is not linked, stop and tell me to go back to 0.3.4, Connect Vercel and choose your PIN.
2. Tell me that changing the PIN signs everyone out, and that my live site keeps the old PIN until we redeploy. Tell me not to push anything to GitHub until the new PIN is added, because every push deploys.
3. Run vercel env rm FOUNDATION_PIN production --yes, then vercel env rm FOUNDATION_PIN preview --yes.
4. Help me open a Terminal window in this folder and give me these two commands to run there, one after the other, typing the same new PIN of 6 to 12 digits each time: vercel env add FOUNDATION_PIN production, then vercel env add FOUNDATION_PIN preview. If it asks about a Git branch, I press Return. If it asks whether the value is sensitive, I answer no. Wait until I say it is done. Never ask me what the PIN is.
5. Run vercel env ls and show me FOUNDATION_PIN listed again for Production and Preview, value hidden.
6. Run vercel --prod to put it live with the new PIN.
7. Ask whether I also run it on this computer. If yes, run vercel env pull .env.local --environment=production, then sed -i.bak '/^VERCEL=/d;/^VERCEL_/d' .env.local && rm .env.local.bak to remove the lines about Vercel's own servers, then restart npm run dev.
8. Ask me to open my live address: the old PIN should be refused, and the new one should open my command center.
9. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.

Changing the PIN signs everyone out. That is expected.
