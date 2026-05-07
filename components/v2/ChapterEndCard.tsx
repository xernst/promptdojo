"use client";

// Renders at the very last step of a chapter, after the user has passed.
// The X follow is the single biggest lever on the V1→V2 audience-growth
// gate (1k @TFisPython followers). Per growth audit 2026-05-07, the site
// previously never asked for the follow — only mentioned the handle in
// the footer. This card asks, with a concrete reason: tomorrow's AI bug.

import Link from "next/link";

interface ChapterEndCardProps {
  chapterTitle: string;
  isCourseEnd: boolean;
}

const X_FOLLOW_URL = "https://x.com/intent/follow?screen_name=TFisPython";

export default function ChapterEndCard({
  chapterTitle,
  isCourseEnd,
}: ChapterEndCardProps) {
  return (
    <section className="my-8 flex flex-col items-start gap-4 border border-green-500/40 bg-ink-900 p-6">
      <div className="t-eyebrow text-green-500">
        {isCourseEnd ? "you finished the course." : "chapter complete."}
      </div>
      <h2 className="t-h2 max-w-2xl">
        you finished{" "}
        <em className="t-emph">{chapterTitle.toLowerCase()}</em>.
      </h2>
      <p className="t-body-sm max-w-2xl text-ink-400">
        tomorrow&apos;s ai-shipped bug, the one that broke a real
        codebase this week — pinned at the top of <span className="text-ink-200">@TFisPython</span>{" "}
        every weekday. follow once, get the daily version of this lesson.
      </p>
      <div className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <a
          href={X_FOLLOW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="dojo-btn-primary"
        >
          follow @tfispython <span aria-hidden>→</span>
        </a>
        <Link href="/" className="dojo-btn-secondary">
          back to home
        </Link>
      </div>
    </section>
  );
}
