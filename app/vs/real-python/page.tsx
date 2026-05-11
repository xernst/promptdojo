import type { Metadata } from "next";
import { ComparePage, type ComparisonConfig } from "../_compare";

export const metadata: Metadata = {
  title: "promptdojo vs real python — free runnable lessons vs paid tutorial library",
  description:
    "real python is the deepest python tutorial library on the web, mostly behind a $19/mo paywall. promptdojo is free, runs in your browser, and is built for people whose code is already written by ai. compared side-by-side.",
  alternates: { canonical: "/vs/real-python" },
  openGraph: {
    type: "article",
    title: "promptdojo vs real python",
    description:
      "free runnable lessons vs paid tutorial library. compared for ai builders.",
    url: "/vs/real-python",
    siteName: "promptdojo",
    images: [{ url: "/og/launch/wedge", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "promptdojo vs real python",
    description:
      "the depth of real python is paywalled. promptdojo is free, runnable in-browser, and built for ai builders.",
    creator: "@TFisPython",
    images: ["/og/launch/wedge"],
  },
};

const config: ComparisonConfig = {
  slug: "real-python",
  competitorName: "Real Python",
  competitorUrl: "https://realpython.com/",
  competitorTagline: "comprehensive python tutorial library",
  verdict:
    "real python is the deepest, most respected python writing on the web. but the depth lives behind a $19/mo membership, and the format is long-form articles, not runnable code. promptdojo is built around the opposite trade-offs: every step is a runnable cell, the first three chapters are free with no signup, and the lessons are organized around how ai writes python wrong — not around python's reference manual.",
  whoEach: {
    promptdojo:
      "you write python with cursor or claude open. you need a fast feedback loop to test what ai wrote, not a 4000-word essay on iteration protocols. you want to start in the browser today, no signup.",
    competitor:
      "you want the encyclopedia. you read long-form, you take notes, and you're happy to pay $19/mo for the depth. you don't mind that almost every premium article is text + screenshots, not runnable.",
  },
  rows: [
    { feature: "free tier", promptdojo: "3 chapters free forever", competitor: "limited free articles" },
    { feature: "paid tier", promptdojo: "$9.99/mo native app", competitor: "$19/mo membership" },
    { feature: "runs in the browser", promptdojo: true, competitor: false },
    { feature: "pyodide / no install", promptdojo: true, competitor: false },
    { feature: "no signup to start", promptdojo: true, competitor: true },
    { feature: "teaches reading ai-generated python", promptdojo: true, competitor: "partial" },
    { feature: "catalogs ai-introduced bugs", promptdojo: true, competitor: false },
    { feature: "long-form reference articles", promptdojo: false, competitor: true },
    { feature: "video courses", promptdojo: false, competitor: true },
    { feature: "cursor / claude code workflow examples", promptdojo: true, competitor: "partial" },
    { feature: "lifetime founders price", promptdojo: "$129 (first 100)", competitor: false },
  ],
  lastUpdatedISO: "2026-05-11",
};

export default function VsRealPython() {
  return <ComparePage config={config} />;
}
