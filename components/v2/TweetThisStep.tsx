"use client";

// Per-step "tweet this bug" share button. Each step is a potential X
// thread; this is the friction-removing shim that makes shipping one
// take 5 seconds instead of 5 minutes. Per growth audit 2026-05-07:
// 515 steps × share surface = direct path to the 100k-impression gate.
//
// Pre-fills a tweet via twitter.com/intent/tweet with the lesson title +
// the step's permalink. The user can edit before posting.

import { Share2 } from "lucide-react";

interface TweetThisStepProps {
  chapterTitle: string;
  chapterSlug: string;
  lessonTitle: string;
  lessonSlug: string;
  stepIndex: number;
}

const SITE = "https://promptdojo.dev";

function buildTweet({
  chapterTitle,
  lessonTitle,
  url,
}: {
  chapterTitle: string;
  lessonTitle: string;
  url: string;
}): string {
  // 280-char budget. Compose tightly.
  // Format: lesson title — chapter title (lower). url. via @TFisPython.
  const intro = `${lessonTitle.toLowerCase()} — ${chapterTitle.toLowerCase()}`;
  const tail = `\n\n(ai-shipped python bug. caught in 90 sec.)\n\n${url} via @TFisPython`;
  // If the intro is too long for tighter budget, truncate it.
  const remaining = 280 - tail.length;
  const finalIntro =
    intro.length > remaining ? intro.slice(0, remaining - 1) + "…" : intro;
  return finalIntro + tail;
}

export default function TweetThisStep({
  chapterTitle,
  chapterSlug,
  lessonTitle,
  lessonSlug,
  stepIndex,
}: TweetThisStepProps) {
  const url = `${SITE}/learn/v2/${chapterSlug}/${lessonSlug}/${stepIndex}`;
  const text = buildTweet({ chapterTitle, lessonTitle, url });
  const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={intent}
      target="_blank"
      rel="noopener noreferrer"
      title="Tweet this lesson on X"
      aria-label="Tweet this lesson on X"
      className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-ink-500 transition-colors hover:text-green-400"
    >
      <Share2 size={12} aria-hidden />
      <span className="hidden sm:inline">tweet this bug</span>
      <span className="sm:hidden">tweet</span>
    </a>
  );
}
