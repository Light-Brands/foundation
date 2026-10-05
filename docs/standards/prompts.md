# Prompts

A prompt is a file in `prompts/` that a member pastes into Claude to do one step of building their command center. `prompts/README.md` lists them.

- **Give every member step its own prompt in `prompts/`.** Put setup steps in `prompts/setup/`. Add the new prompt to the table in `prompts/README.md`. Why: a step with no prompt is a step the member has to figure out alone.
- **Work one step at a time, and say what the person should see.** After each step, tell them what appears on their screen when it worked. Why: a person who cannot tell whether a step worked stops trusting the rest.
- **Never ask for a PIN, key, password or token in the conversation.** Tell the member to type it in their own terminal, with a command such as `npm run setup -- --pin-prompt`. Why: the chat keeps what is typed into it.
- **Make every script a prompt runs take flags.** Claude cannot answer an interactive question. `scripts/setup.mjs` is the pattern: every answer has a flag, and a secret has a `--pin-prompt` style flag for the member's own terminal. Why: a script that waits for typing hangs when Claude runs it.
- **Ask before changing anything the member owns.** A prompt that edits files says so first and waits for a yes. Why: the repository is the member's business, and surprises cost trust.
- **Keep the language plain.** The member is a business owner (see `copy.md`). Why: a prompt in developer words loses the person it is for.
- **End every prompt with the build log step.** The last step runs `npm run key:sync`, makes the work commit with `key/knowledge/system.md` in it, then adds an entry to `key/log/` as `docs/standards/log.md` describes in a log-only commit naming the work commit. A test (`tests/unit/prompts-log-step.test.ts`) fails when a prompt's last step is anything else or takes these in another order. Why: the log only stays complete if every step ends by writing it.
- **Keep prompts out of the Key.** Prompts are for building the Key and never part of it. Why: the Key holds the business, and prompts belong to the Foundation.
