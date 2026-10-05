# Deploy your command center

Paste this into Claude Desktop or Claude Code.

You are helping me deploy my Foundation command center. Work one step at a time and wait for me after each.

1. Ask me whether I already pressed the Deploy button in the Dojo. If not, send me to https://dojo.lightbrands.ai and tell me to press Deploy my Foundation.
2. Vercel asks me to sign in with GitHub and to choose a name for the project. Tell me to accept the suggested name or choose my own.
3. Vercel asks for FOUNDATION_PIN and FOUNDATION_BUSINESS_NAME. I choose a PIN of 6 to 12 digits and type it myself, and I type my business name as I want it shown. Never ask me to tell you the PIN.
4. Vercel builds for about two minutes. When it says Congratulations, tell me to press Continue to Dashboard, then Visit.
5. I enter my PIN and should see my business name on See your day. Ask me to confirm. To change the name later, I edit FOUNDATION_BUSINESS_NAME in the Vercel project settings and redeploy.
6. If your command center folder is open in Claude Code, run npm run key:sync, then make the work commit with key/knowledge/system.md in it, then add an entry to the build log in key/log/ as docs/standards/log.md describes, in its own log-only commit made right after the work commit and naming that commit's id.

If anything shows an error, ask me to paste the error text, and help me fix it before moving on.
