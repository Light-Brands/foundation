# The questionnaire

Stage 2 of [the runner](run.md). Six shared questions open every run that builds or changes something. Ask them word for word, one per message, and wait for each answer. `learn` and `check` ask only the first.

## The skip rule

Skip any question already answered by the request, the Key, or anything the owner has said in this conversation, and say in one line what you took as the answer, so the owner can correct it. "Install Capture leads at Essentials" answers the first two questions. "Essentials, for everything" said during an earlier entry of the same request answers the tier for every entry after it. A run being resumed from its brief skips every question the brief already answers.

**One request, asked once.** When an install or upgrade runs an entry's parts first, as [the runner](run.md) describes, the parts and the entry are one request. The tier, anything else at the same time and each consent are asked in the first run that needs them, and hold for every run in the request. Every other answer the owner gave carries forward too, so a later run never asks it again.

## The six questions

**1. The verb and the entry.**

> So we are on the same page: you would like me to <verb> <entry title>, which <the job it does, in one line>. Is that right?

When the request fits two entries, ask this instead:

> I can see two that fit: <first title>, which <its job>, and <second title>, which <its job>. Which one would you like?

**2. The tier.**

> How far shall we take it? <Entry title> comes in three depths:
>
> **Essentials.** <the entry's Essentials line>
>
> **Complete.** <the entry's Complete line>
>
> **Mastery.** <the entry's Mastery line>
>
> I suggest <default tier>. You can upgrade later, and upgrading keeps your own changes.

Offer only the tiers the entry lists in its `tiers`. For `modify` and `remove`, the tier stays as installed, so skip this question.

**3. Anything else at the same time.**

> Is there anything else you would like at the same time? I recommend finishing this one first and lining the others up as the next moves.

When the owner names more, add them to the next moves. When they insist on all of them now, say they will run one after another, each start to finish, never mixed together.

**4. Consent for outward actions.** Ask each as its own question, and record each answer as a separate yes or no.

> May I write files in this folder, <folder name>, once you have approved the plan? I write nothing outside it.

In a text only chat, ask this instead:

> Once you have approved the plan, I will give you each file as a block with its path, for you to save in your business folder. Is that all right?

When the owner says no to writing, give every file as a block with its path for them to save. When they cannot save files either and the run builds a Ninja home, the home becomes a Claude Project instead, as [the Ninja home](../foundation/ninja-home.md) describes.

When the entry's Questions section has its own write consent, as [Home](../frameworks/home.md) does, skip this question: the entry's sentence replaces it, and it is asked once the folder name is known.

> May I put up a preview, a separate copy of your command center on its own link, so you can try it before it goes live?

> May I send test messages, to you only, so we can see one go out for real?

Ask the preview question only in a Foundation, and the messages question only when the entry sends messages. Going live is never asked here: it is asked at the moment it would happen.

**5. Your tools.**

> Which tools do you use for this today?

Each tool the owner names is a connection to try before anything is built: the run connects what the owner already uses first, and builds only what no connection does. The answers go in the run brief, and the target at stage 3 starts from them. When the entry's Questions section has its own "Your tools" question, as [the Monday brief](../routines/monday-brief.md) does, skip this one: the entry's question replaces it, and it is asked in its place among the entry's questions. "None yet" is a full answer, and the run builds what the job needs. For `remove`, skip this question, the same way the tier is skipped. For an entry whose Questions already ask about tools, as Prep does, skip this one too.

**6. The entry's own questions.** Ask the questions in the entry's Questions section, in its order, one per message, with the entry's default for each.

## The default tier

The owner's level suggests the default. Take it from the context block when it records one, or from the owner's answer when they have told you their level. Never ask for it only to choose a tier.

| Level | Default tier |
|---|---|
| 1, or not known | Essentials |
| 2 | Complete |
| 3 | Mastery |

When the default is a tier the entry does not offer, suggest the deepest tier it offers below that one.

## What it produces

The answers become the run brief: the verb, the entry, the tier, the three consents, the owner's tools and the brief in the owner's words. Its format and where it is kept are in [resuming a run](resume.md).
