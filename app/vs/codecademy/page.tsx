import type { Metadata } from "next";
import { ComparePage, type ComparisonConfig } from "../_compare";

export const metadata: Metadata = {
  title: "promptdojo vs codecademy — no-signup free python vs gated paid path",
  description:
    "codecademy's python path needs a signup before lesson one and gates the depth behind a $19.99/mo pro plan. promptdojo's free preview is three chapters, no account, no email. compared side-by-side.",
  alternates: { canonical: "/vs/codecademy" },
  openGraph: {
    type: "article",
    title: "promptdojo vs codecademy",
    description:
      "no-signup free python vs gated paid path. compared for ai builders.",
    url: "/vs/codecademy",
    siteName: "promptdojo",
    images: [{ url: "/og/launch/wedge", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "promptdojo vs codecademy",
    description:
      "codecademy makes you sign up before lesson one. promptdojo doesn't. and it's built for people whose code is already written by ai.",
    creator: "@TFisPython",
    images: ["/og/launch/wedge"],
  },
};

const config: ComparisonConfig = {
  slug: "codecademy",
  competitorName: "Codecademy",
  competitorUrl: "https://www.codecademy.com/",
  competitorTagline: "gamified interactive coding lessons",
  verdict:
    "codecademy invented the modern interactive coding lesson. but its python path now requires a signup before lesson one, and most of the depth lives in pro plus ($19.99/mo). promptdojo's free preview is three chapters with no email and no account, and the curriculum is built around the workflows of someone who already uses cursor — not the workflows of a career switcher learning to code.",
  whoEach: {
    promptdojo:
      "you've used cursor or claude code at least once. you want to learn enough python to read what they wrote without signing up to an account today.",
    competitor:
      "you're a career switcher. you want a gamified streak-based experience, structured tracks, and certificates. you're fine paying $19.99/mo for the depth and the badges.",
  },
  rows: [
    { feature: "free tier", promptdojo: "3 chapters free forever", competitor: "limited intro, then paywall" },
    { feature: "paid tier", promptdojo: "$9.99/mo native app", competitor: "$19.99/mo pro plus" },
    { feature: "runs in the browser", promptdojo: true, competitor: true },
    { feature: "pyodide / no install", promptdojo: true, competitor: "partial" },
    { feature: "no signup to start", promptdojo: true, competitor: false },
    { feature: "teaches reading ai-generated python", promptdojo: true, competitor: false },
    { feature: "catalogs ai-introduced bugs", promptdojo: true, competitor: false },
    { feature: "gamification / streaks / badges", promptdojo: false, competitor: true },
    { feature: "career-switcher tracks", promptdojo: false, competitor: true },
    { feature: "cursor / claude code workflow examples", promptdojo: true, competitor: false },
    { feature: "lifetime founders price", promptdojo: "$129 (first 100)", competitor: false },
  ],
  lastUpdatedISO: "2026-05-11",
};

export default function VsCodecademy() {
  return <ComparePage config={config} />;
}
