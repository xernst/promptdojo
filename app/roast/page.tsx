import type { Metadata } from "next";
import RoastClient from "@/components/RoastClient";
import Link from "next/link";

export const metadata: Metadata = {
  title: "roast my prompt · promptdojo",
  description:
    "paste a prompt. get a brutal, specific critique in under a second. no api key, no signup. then learn the chapter that fixes the problem.",
  alternates: { canonical: "https://promptdojo.dev/roast/" },
  openGraph: {
    type: "website",
    title: "roast my prompt · promptdojo",
    description:
      "paste a prompt. get a brutal, specific critique. no api key, no signup.",
    url: "https://promptdojo.dev/roast/",
    siteName: "promptdojo",
    images: [
      {
        url: "/og/launch/roast",
        width: 1600,
        height: 900,
        alt: "roast my prompt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "roast my prompt · promptdojo",
    description:
      "paste a prompt. get a brutal critique. no signup. then fix it.",
    creator: "@TFisPython",
    images: ["/og/launch/roast"],
  },
};

export default function RoastPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-6 pt-20 pb-10 sm:pt-24 sm:pb-16">
      <div className="t-eyebrow">/roast ─ free prompt critic</div>
      <h1 className="t-section mt-4">
        roast my prompt.
      </h1>
      <p className="t-body mt-6 text-ink-300">
        paste any prompt you&apos;ve been sending to claude, cursor, or chatgpt.
        in under a second this page tells you exactly what the model is
        about to misread, in what way, and how to tighten it. no api key,
        no signup, no telemetry. the audit runs in your browser.
      </p>
      <RoastClient />
      <div className="mt-16 dojo-card-highlight">
        <div className="t-mono-meta">why this exists</div>
        <h2 className="mt-2 t-h2">
          most &ldquo;bad ai output&rdquo; is a prompt problem the model couldn&apos;t fix.
        </h2>
        <p className="t-body mt-4 text-ink-300">
          promptdojo is the free open-source python school for pms, marketers,
          and ops folks who use cursor every day. chapter 19 is the full
          version of this page. every rule, with runnable examples, in
          your browser.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/learn/v2/prompting/the-prompt-craft/0"
            className="dojo-btn-primary"
          >
            start chapter 19 →
          </Link>
          <Link href="/" className="dojo-btn-secondary">
            see the full curriculum
          </Link>
        </div>
      </div>
    </main>
  );
}
