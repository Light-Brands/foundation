# 0.3.6 Go live

Paste this into Claude Desktop, in the Code tab.

You are helping me with step 0.3.6, Go live, the sixth of nine steps that set up my Foundation command center. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; I type my PIN only on my command center's sign in page. Never open or print .env.local. When a command fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: run vercel env ls. FOUNDATION_PIN, FOUNDATION_BUSINESS_NAME and DATABASE_URL or POSTGRES_URL must be listed. If the database address is missing, stop and tell me to go back to 0.3.5, Connect your database; if the PIN or the name is missing, to 0.3.4, Connect Vercel and choose your PIN.
2. Run vercel --prod. Tell me it takes about two minutes, then show me the live address it prints.
3. Open that address in my browser. Ask me to sign in with my PIN and tell you when I see See your day with my business name.
4. Walk me to Settings, Preferences. I fill in my business profile and press Save. I should see Saved.
5. Ask me to open the address with /contact at the end in another tab, send a short test message to myself, then open Command center, Handle what needs you. I should see my message as a card.
6. Ask whether I also want it running on this computer. If yes, first run sed -i.bak '/^VERCEL=/d;/^VERCEL_/d' .env.local && rm .env.local.bak and tell me in one sentence why: those lines describe Vercel's own servers and would make this computer act as if it were on Vercel. Never print a value. Then run npm run dev and tell me to open http://localhost:3000 and sign in with the same PIN. Tell me plainly that it uses the same live database, so what I save there shows online too. Stop it when I say so.
7. Tell me what I now have, and that from here I build my business out by asking. Name the three steps I can come back to any time: 0.3.7 Change my PIN, 0.3.8 Update my Foundation and 0.3.9 Put it on my own domain, each in ninja/frameworks/foundation-setup/.
8. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits. Then ask me before you run git push; on my yes, push, so GitHub holds the same history, and tell me it deploys again, which is expected.
