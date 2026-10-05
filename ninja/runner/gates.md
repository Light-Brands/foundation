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
- **Passes when:** in a Foundation, `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` all pass on the finished work, and `npm run e2e` too when the run changes a screen or app code. A run that changes only the Key needs the first four. In a Ninja home, every file is in its place, every path comment is right, and every file `key.yaml` names is on disk. An entry with no Key files and no app, such as Prep, skips this gate and the review gate, because there is nothing to test or review.
- **When it does not pass:** "One check is still failing: <check>, because <cause in plain words>. I am fixing it now, and nothing goes out until every check is green."

## Deploy

- **Stage:** 8, for the preview only.
- **Owner:** the [release engineer](../crew/release-engineer.md).
- **Passes when:** the test gate has passed, the run's work commit and log-only commit are on its run branch, and the owner gave the preview consent. The preview is a push of the run branch, which Vercel builds as a preview deployment. A Foundation without a remote has no preview, and its proof runs on the owner's computer.
- **When it does not pass:** without the consent: "Everything is green. Would you like a preview, a separate copy of your command center on its own link, to try it before it goes live?" With checks failing: "The preview waits until every check is green."

## Production

- **Stage:** 10, after the run's work commit, because production goes out from committed work.
- **Owner:** the [release engineer](../crew/release-engineer.md).
- **Passes when:** the owner says yes to going live at that moment, after the preview is checked, or after the proof on a Foundation without a remote. An earlier yes, including the preview consent, never counts. Going live is merging the run branch into `main` and pushing `main`, or the local merge into `main` without a remote. Nothing reaches `main` without this yes.
- **When it does not pass:** "The preview is ready at <link>. When you have tried it and want your customers to see it, say 'go live' and I will put it live." Without a remote: "It is proven on your computer. When you want it in your command center for good, say 'go live' and I will add it." Until then the work waits on its run branch.

## Proof

- **Stage:** 9.
- **Owner:** the [QA lead](../crew/qa-lead.md).
- **Passes when:** one real item has gone end to end as the entry's Proof section describes, and its completion test passed. A test message counts only when the messages consent was given. The proof is the entry's own Proof section, in every environment. For Home, that is the first check, plus the first run at Mastery. For a modify, it is the entry's Proof section at the installed version, or the installed routine's own Check when that proof needs a tool the installed version does not have, as [modify](verbs/modify.md) says.
- **When it does not pass:** "It is built, and it is not done yet: the proof has not gone through, because <cause>. Let us run one real <item> now. <The one thing the owner does next.>"
