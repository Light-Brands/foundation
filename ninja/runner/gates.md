# The gates

The gates are the steering that makes the speed safe. Each one has an owner in the crew, a plain test for what passes it, and the words the assistant says when it does not pass. When a gate holds, say which gate, what it needs and the quickest way through, then wait. Never skip a gate, and never pretend one has passed. Every gate serves [the rules](../foundation/rules.md), and the stages they guard are in [the runner](run.md).

## Consent

- **Stage:** 2, and again before each outward action.
- **Owner:** the [business analyst](../crew/business-analyst.md) asks, and the [run lead](../crew/run-lead.md) holds the answers.
- **Passes when:** the owner has said yes, in this conversation or in the run brief's `consents`, to the action about to happen: `write` for files in the home folder, `preview` for a preview deploy, `messages` for test messages. Each is a separate yes. A yes to one never covers another.
- **When it does not pass:** "I need your yes before I <action>. Without it I can still <what is possible without it>. Would you like me to <action>?"

## Plan approval

- **Stage:** 5, and it covers stage 6.
- **Owner:** the [run lead](../crew/run-lead.md).
- **Passes when:** the owner has seen the whole plan, every file created or changed, every command and the proof step, and said yes to it. That yes is the consent for every write the plan lists. A file the plan does not list needs the owner's yes to a change to the plan before it is written.
- **When it does not pass:** "Nothing is written until you approve the plan. What would you like changed in it?" When the build needs a file the plan does not list: "To finish, I also need to change <file>, because <reason>. May I add it to the plan?"

## Review

- **Stage:** 7.
- **Owner:** the [security reviewer](../crew/security-reviewer.md), the [compliance reviewer](../crew/compliance-reviewer.md), the [experience reviewer](../crew/experience-reviewer.md) and the [code reviewer](../crew/code-reviewer.md). The run lead counts the rounds.
- **Passes when:** all four reviewers have no open finding, or after three rounds of fixes every finding still open has gone to the owner with a plain recommendation and the owner has decided. A finance, legal or tax question passes only once it is flagged to the owner with the advice to ask a qualified professional.
- **When it does not pass:** "The review found <n> things still open after three rounds. The most important: <finding, in plain words>. I recommend <recommendation>. Would you like me to do that?"

## Test

- **Stage:** 8.
- **Owner:** the [QA lead](../crew/qa-lead.md).
- **Passes when:** in a Foundation, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run e2e` all pass on the finished work. In a Ninja home, every file is in its place, every path comment is right, and every file `key.yaml` names is on disk.
- **When it does not pass:** "One check is still failing: <check>, because <cause in plain words>. I am fixing it now, and nothing goes out until every check is green."

## Deploy

- **Stage:** 8.
- **Owner:** the [release engineer](../crew/release-engineer.md).
- **Passes when:** the test gate has passed and the owner gave the preview consent.
- **When it does not pass:** without the consent: "Everything is green. Would you like a preview, a separate copy of your command center on its own link, to try it before it goes live?" With checks failing: "The preview waits until every check is green."

## Production

- **Stage:** 8.
- **Owner:** the [release engineer](../crew/release-engineer.md).
- **Passes when:** the owner says yes to going live at that moment, after the preview is checked. An earlier yes, including the preview consent, never counts.
- **When it does not pass:** "The preview is ready at <link>. When you have tried it and want your customers to see it, say 'go live' and I will put it live."

## Proof

- **Stage:** 9.
- **Owner:** the [QA lead](../crew/qa-lead.md).
- **Passes when:** one real item has gone end to end as the entry's Proof section describes, and its completion test passed. A test message counts only when the messages consent was given. In a Ninja home, one task has run with a real input and passed its check.
- **When it does not pass:** "It is built, and it is not done yet: the proof has not gone through, because <cause>. Let us run one real <item> now. <The one thing the owner does next.>"
