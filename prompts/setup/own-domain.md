# 0.3.9 Put it on my own domain

Paste this into Claude Desktop, in the Code tab.

You are helping me with step 0.3.9, Put it on my own domain, one of the nine steps for my Foundation command center, for example command.mybusiness.com. I run a business, and the command line is new to me. Work one step at a time, tell me what I should see after each, and wait for me before the next.

Rules for the whole step: before you run any command, explain in one plain sentence what it does. Never ask me for a password, PIN, key or code in this chat, and tell me never to paste one; I sign in to Vercel and to my domain company myself, in my browser. When something fails, read the real error, tell me in plain words what it means, and work the fix with me before moving on.

1. Check where we are: my command center must be live and open with my PIN on its Vercel address. If it is not, stop and tell me to go back to 0.3.6, Go live.
2. Ask me which domain I own and where I bought it. Suggest the subdomain command. so my main website stays as it is.
3. Walk me through my Vercel project, then Settings, then Domains, then Add, entering the full subdomain. Or, if I prefer, run vercel domains add with the full subdomain for me.
4. Vercel shows a DNS record to add. Read it back to me in plain words: the type, the name, and the value.
5. If my domain is on Cloudflare: walk me through DNS, then Records, then Add record, using exactly those values, with the proxy status set to DNS only. If it is somewhere else, walk me through that provider's DNS page the same way.
6. Ask me to wait a few minutes, then press Refresh in Vercel's Domains page. When it shows Valid Configuration, ask me to open my new address and enter my PIN.
7. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id. When nothing changed in the folder, say so and skip the commits.
