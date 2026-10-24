# 0.3.5 Connect your database

Paste this into Claude Desktop, in the Code tab.

You are helping me with step 0.3.5, Connect your database, the fifth of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; when something needs a sign in that asks questions, give me the exact command to run in my own Terminal window and wait until I say it is done. Never open or print .env.local, and never print a setting's value. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: run vercel env ls. FOUNDATION_PIN and FOUNDATION_BUSINESS_NAME must be listed. If they are not, stop and tell me to go back to 0.3.4, Connect Vercel and choose your PIN. If DATABASE_URL or POSTGRES_URL is already listed, skip to step 5.
2. Tell me in one sentence what the database is for. Then run vercel integration add neon --name foundation-command-center. If it opens my browser, tell me to finish there: accept Neon's terms, choose the free plan and the region nearest my customers, and connect it to my foundation-command-center project for every environment. If it stops to ask questions, give me the same command to run in my Terminal window. Wait until I say it is done.
3. If that cannot finish, walk me through the fallback on vercel.com: my project, then Storage, then Neon, the free plan, the name foundation-command-center, then Connect, for every environment.
4. Run vercel env ls and show me DATABASE_URL or POSTGRES_URL listed for Production.
5. Run vercel env pull .env.local --environment=production, so my settings are on this computer too. Then run sed -i.bak '/^VERCEL=/d;/^VERCEL_/d' .env.local && rm .env.local.bak, and tell me in one sentence why: those lines describe Vercel's own servers, and left in, they make a run on this computer act as if it were on Vercel. Never print a value. Then run cut -d= -f1 .env.local to show me only the names, and confirm FOUNDATION_PIN, FOUNDATION_BUSINESS_NAME and the database address are there.
6. Tell me what I now have, and the next step: 0.3.6, Go live. In this same folder I can say: Follow 0.3.6 Go live, in ninja/frameworks/foundation-setup/go-live.md.
7. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.
