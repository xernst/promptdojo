import type { Metadata } from "next";
import { ComparePage, type ComparisonConfig } from "../_compare";

export const metadata: Metadata = {
  title: "promptdojo vs scrimba — which free python course wins for ai builders",
  description:
    "two free in-browser python courses, two different bets. scrimba teaches python the classic way. promptdojo teaches you to read what claude and cursor wrote. compared side-by-side.",
  alternates: { canonical: "/vs/scrimba" },
  openGraph: {
    type: "article",
    title: "promptdojo vs scrimba",
    description:
      "two free in-browser python courses compared for ai builders.",
    url: "/vs/scrimba",
    siteName: "promptdojo",
    images: [{ url: "/og/launch/wedge", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "promptdojo vs scrimba",
    description:
      "two free in-browser python courses compared. one teaches python, one teaches you to catch ai-written python bugs.",
    creator: "@TFisPython",
    images: ["/og/launch/wedge"],
  },
};

const config: ComparisonConfig = {
  slug: "scrimba",
  competitorName: "Scrimba",
  competitorUrl: "https://scrimba.com/",
  competitorTagline: "interactive screencast-based course platform",
  verdict:
    "scrimba is the gold standard for learning python the classic way — recorded screencasts you can pause and edit. promptdojo is the alternative for people who already use cursor or claude code and don't need to learn how to type python from scratch. they need to learn what python the ai wrote means, and where it's wrong. scrimba teaches the language. promptdojo teaches the meta-skill.",
  whoEach: {
    promptdojo:
      "you already use cursor or claude code daily. ai writes most of your python. you need to read it, audit it, and stop accepting bugs you don't see.",
    competitor:
      "you want to learn python from zero, the classic way. you like screencasts you can pause and edit mid-stream. you have time to build the fundamentals before touching ai.",
  },
  rows: [
    { feature: "free tier", promptdojo: "3 chapters free forever", competitor: "free signup, paywalled deeper paths" },
    { feature: "runs in the browser", promptdojo: true, competitor: true },
    { feature: "pyodide / no install", promptdojo: true, competitor: "partial" },
    { feature: "no signup to start", promptdojo: true, competitor: false },
    { feature: "teaches reading ai-generated python", promptdojo: true, competitor: false },
    { feature: "catalogs ai-introduced bugs", promptdojo: true, competitor: false },
    { feature: "screencast-style lessons", promptdojo: false, competitor: true },
    { feature: "pace: 31 chapters / 800+ runnable steps", promptdojo: true, competitor: "varies" },
    { feature: "cursor / claude code workflow examples", promptdojo: true, competitor: false },
    { feature: "native mobile app", promptdojo: "coming · $9.99/mo", competitor: false },
    { feature: "lifetime founders price", promptdojo: "$129 (first 100)", competitor: false },
  ],
  lastUpdatedISO: "2026-05-11",
};

export default function VsScrimba() {
  return <ComparePage config={config} />;
}
