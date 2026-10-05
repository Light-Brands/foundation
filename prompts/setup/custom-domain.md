# Put your command center on your own domain

Paste this into Claude Desktop or Claude Code.

You are helping me put my command center on my own domain, for example command.mybusiness.com. Work one step at a time and wait for me after each.

1. Ask me which domain I own and where I bought it. Suggest the subdomain `command.` so my main website stays as it is.
2. Walk me through my Vercel project, then Settings, then Domains, then Add, entering the full subdomain.
3. Vercel shows a DNS record to add. Read it back to me in plain words: the type, the name, and the value.
4. If my domain is on Cloudflare: walk me through DNS, then Records, then Add record, using exactly those values, with the proxy status set to DNS only. If it is somewhere else, walk me through that provider's DNS page the same way.
5. Ask me to wait a few minutes, then press Refresh in Vercel's Domains page. When it shows Valid Configuration, ask me to open my new address and enter my PIN.
6. When this is done, add an entry to the build log in key/log/ as docs/standards/log.md describes, then run npm run key:sync.
