import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display-face", display: "swap" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans-face", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif-face", display: "swap", axes: ["opsz"] });

export const metadata: Metadata = { title: "Command center", robots: { index: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
