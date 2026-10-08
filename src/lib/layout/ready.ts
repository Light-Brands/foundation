// What each Brand and Agentic page will hold once it is built, in two or three plain lines. The prompt an owner copies
// to work on it today comes from the page's number in the Ninja dictionary (src/lib/dictionary).

export type Ready = { holds: string[] };

export const READY: Record<string, Ready> = {
  overview: { holds: ["How complete your brand is, as one clear measure.", "The next missing piece, and the sentence that fills it."] },
  identity: { holds: ["Your logo, with a light version for dark bands.", "A color for each part of your palette, and your font pairing.", "A live preview of your command center and your site."] },
  story: { holds: ["Who you are and what you stand for.", "How you sound, with the words you use and the words you avoid."] },
  offers: { holds: ["Each offer's promise, price and what is included.", "Who each offer is for, and its guarantee."] },
  audience: { holds: ["Who you serve.", "Their problems and their objections, in their own words."] },
  proof: { holds: ["Testimonials and results, each with its source and consent.", "Only what real customers said. It fills as reviews arrive."] },
  "assets-library": { holds: ["Every logo, photo and image you have, tagged, with its source.", "Where each one is used."] },
  "assets-upload": { holds: ["Files and phone photos: SVG, PNG, WebP and JPG up to 10 MB."] },
  "assets-kit": { holds: ["A favicon and a social share image.", "Light and dark logos, and the standard social sizes."] },
  "assets-website": { holds: ["The logos and images on your current website, brought into your library."] },
  "assets-generate": { holds: ["New images in your brand's style, for your pages and posts."] },
  "assets-rights": { holds: ["Where each asset came from and how it can be used.", "Recorded consent for anyone shown, before their photo appears on a public page."] },
  agents: { holds: ["Every agent working for your business, and what each one does.", "The crew that builds with Claude Code."] },
  skills: { holds: ["What your agents know how to do.", "Where each skill is used."] },
  recipes: { holds: ["Everything you can add to your command center, with a search in plain words and one sentence to install each."] },
  routines: { holds: ["Each routine with its schedule and the job it serves.", "Its last run and how it went, with a switch to pause it."] },
  runs: { holds: ["Every run in order, with what it produced and how long it took.", "Any run that failed, with the reason and the sentence that fixes it."] },
  workflows: { holds: ["Each workflow's trigger and its steps, in order.", "The steps that wait for your approval, and who decides each one."] },
  weaves: { holds: ["Each weave and the departments it connects.", "What starts it, such as a signed contract, and what it starts next."] },
};
