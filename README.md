# Your command center

The Dojo Foundation is a free command center that is yours and runs one business. You set it up with Claude, one step at a time, and then build it out with prompts.

## Start at 0.3.1

[0.3.1 Get Claude Desktop](https://lb-share.lightbrands.ai/s/2o3nlvcnkvhs0y59) is where you begin. Claude Pro is expected, because the Code tab in Claude Desktop needs a paid plan. Each step has a page in the Dojo Dictionary and a prompt you paste into Claude Desktop, and each step tells you what you should see when it worked.

## The nine steps

1. [0.3.1 Get Claude Desktop](https://lb-share.lightbrands.ai/s/2o3nlvcnkvhs0y59)
2. [0.3.2 Bring in your Foundation](https://lb-share.lightbrands.ai/s/y4ntiar75zp5pe11)
3. [0.3.3 Connect GitHub](https://lb-share.lightbrands.ai/s/a5npei1dp7n09v8y)
4. [0.3.4 Connect Vercel and choose your PIN](https://lb-share.lightbrands.ai/s/zurernrj8p8tx01h)
5. [0.3.5 Connect your database](https://lb-share.lightbrands.ai/s/0qyv9ikal6e3n7s5)
6. [0.3.6 Go live](https://lb-share.lightbrands.ai/s/oavoxcfdyaow0ozj)
7. [0.3.7 Change my PIN](https://lb-share.lightbrands.ai/s/3aqox8s4j4179dyl)
8. [0.3.8 Update my Foundation](https://lb-share.lightbrands.ai/s/0smbulr9sh1gmrkw)
9. [0.3.9 Put it on my own domain](https://lb-share.lightbrands.ai/s/ndgtx0ln4k1bt4cg)

The prompts for these steps are also in `prompts/setup/`.

## Developers: fork it

```bash
git clone https://github.com/Light-Brands/foundation.git
cd foundation
npm install
npm run dev
```

It runs at http://localhost:3000 with a local database in `.data/`, so nothing else needs setting up. Run `npm run setup -- --name "<business>" --pin-prompt` first to create `.env.local` and choose a PIN. Read `CLAUDE.md` and `docs/standards/` before you change code.
