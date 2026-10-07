import {
  Fraunces, Source_Sans_3, DM_Sans, Inter, Inter_Tight, Playfair_Display,
  Space_Grotesk, Libre_Baskerville, Plus_Jakarta_Sans, JetBrains_Mono,
} from "next/font/google";

// Every family the six pairings use. The default pairing (Sanctuary) preloads; the rest download only when chosen.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--ff-fraunces", display: "swap", axes: ["opsz"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--ff-source-sans", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--ff-dm-sans", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--ff-jetbrains", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--ff-inter", display: "swap", preload: false });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--ff-inter-tight", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--ff-playfair", display: "swap", preload: false });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--ff-space-grotesk", display: "swap", preload: false });
const libre = Libre_Baskerville({ subsets: ["latin"], weight: ["400", "700"], variable: "--ff-libre-baskerville", display: "swap", preload: false });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--ff-jakarta", display: "swap", preload: false });

export const FONT_VARIABLES = [fraunces, sourceSans, dmSans, jetbrains, inter, interTight, playfair, spaceGrotesk, libre, jakarta]
  .map((f) => f.variable)
  .join(" ");
