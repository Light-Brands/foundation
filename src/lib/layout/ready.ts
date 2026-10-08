// What each Brand and Agentic page will hold once it is built, in two or three plain lines, and the sentence an
// owner copies into Claude Code to work on it today. The sentences use the Ninja framework's verbs (ninja/guide.md).

export type Ready = { holds: string[]; sentence: string };

export const READY: Record<string, Ready> = {
  overview: { holds: ["How complete your brand is, as one clear measure.", "The next missing piece, and the sentence that fills it."], sentence: "Modify my brand to match my website." },
  identity: { holds: ["Your logo, with a light version for dark bands.", "A color for each part of your palette, and your font pairing.", "A live preview of your command center and your site."], sentence: "Modify my brand identity." },
  story: { holds: ["Who you are and what you stand for.", "How you sound, with the words you use and the words you avoid."], sentence: "Modify my brand story and voice." },
  offers: { holds: ["Each offer's promise, price and what is included.", "Who each offer is for, and its guarantee."], sentence: "Modify my brand offers." },
  audience: { holds: ["Who you serve.", "Their problems and their objections, in their own words."], sentence: "Modify my brand audience." },
  proof: { holds: ["Testimonials and results, each with its source and consent.", "Only what real customers said. It fills as reviews arrive."], sentence: "Install Collect reviews at Essentials." },
  "assets-library": { holds: ["Every logo, photo and image you have, tagged, with its source.", "Where each one is used."], sentence: "Learn how my brand assets work." },
  "assets-upload": { holds: ["Files and phone photos: SVG, PNG, WebP and JPG up to 10 MB."], sentence: "Learn how my brand assets work." },
  "assets-kit": { holds: ["A favicon and a social share image.", "Light and dark logos, and the standard social sizes."], sentence: "Modify my brand kit from my logo." },
  "assets-website": { holds: ["The logos and images on your current website, brought into your library."], sentence: "Pull my images from my website." },
  "assets-generate": { holds: ["New images in your brand's style, for your pages and posts."], sentence: "Generate an image for my landing page." },
  "assets-rights": { holds: ["Where each asset came from and how it can be used.", "Recorded consent for anyone shown, before their photo appears on a public page."], sentence: "Learn how asset rights work." },
  agents: { holds: ["Every agent working for your business, and what each one does.", "The crew that builds with Claude Code."], sentence: "Learn how agents work." },
  skills: { holds: ["What your agents know how to do.", "Where each skill is used."], sentence: "Learn how skills work." },
  recipes: { holds: ["Everything you can add to your command center, with a search in plain words and one sentence to install each."], sentence: "Check my system." },
  routines: { holds: ["The work that runs on its own: what it does, when it runs and how it went."], sentence: "Learn how routines work." },
  runs: { holds: ["Every run, and what each one produced."], sentence: "Learn how routines work." },
  workflows: { holds: ["Steps that run on a trigger, with your approval wherever a person decides."], sentence: "Learn how workflows run." },
  weaves: { holds: ["Workflows across departments, such as a signed contract starting a project."], sentence: "Learn how weaves work." },
};
