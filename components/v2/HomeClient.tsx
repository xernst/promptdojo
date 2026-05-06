"use client";

// Resume / Start CTA — the localStorage-dependent island on the marketing
// home page. Replaces the older auto-redirect-to-onboarding behavior so the
// landing page actually has a chance to render. New users see "Start onboarding";
// returning users see "Continue Ch N · …"
//
// Decisions live here, not in app/page.tsx, because Server Components can't
// read localStorage.

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLastVisitedV2, loadProgressV2 } from "@/lib/storage";

type Fallback = {
  chapterSlug: string;
  lessonSlug: string;
  stepIndex: number;
};

type ChapterMeta = {
  slug: string;
  title: string;
  number: number;
};

type Props = {
  fallback: Fallback;
  chapters: ChapterMeta[];
};

type Resolved =
  | { state: "loading" }
  | { state: "new-user" }
  | { state: "in-progress"; target: Fallback };

export default function HomeClient({ fallback, chapters }: Props) {
  const [resolved, setResolved] = useState<Resolved>({ state: "loading" });

  useEffect(() => {
    const progress = loadProgressV2();
    const name = progress.profile?.name?.trim();
    if (!name) {
      setResolved({ state: "new-user" });
      return;
    }
    const last = getLastVisitedV2();
    if (last) {
      setResolved({ state: "in-progress", target: last });
      return;
    }
    // Has profile but no lastVisited — finished onboarding, hasn't started a lesson yet.
    setResolved({ state: "in-progress", target: fallback });
  }, [fallback]);

  if (resolved.state === "loading") {
    return <div aria-hidden className="skeleton h-[124px]" />;
  }

  if (resolved.state === "new-user") {
    return (
      <Link
        href="/onboarding"
        className="group dojo-card-highlight flex items-center justify-between"
      >
        <div className="min-w-0">
          <div className="t-eyebrow">start here</div>
          <div className="t-h2 mt-2">get started in under a minute</div>
          <div className="t-body-sm mt-1">
            five questions, then your first lesson.
          </div>
        </div>
        <kbd className="ml-4 shrink-0 border border-ink-700 px-2 py-1 font-mono text-xs uppercase tracking-wider text-ink-300">
          ↵ continue
        </kbd>
      </Link>
    );
  }

  const { target } = resolved;
  const link = `/learn/v2/${target.chapterSlug}/${target.lessonSlug}/${target.stepIndex}`;
  const chapter = chapters.find((c) => c.slug === target.chapterSlug);
  const heading = chapter
    ? `ch ${chapter.number} · ${chapter.title.replace(/\s*—.*$/, "").toLowerCase()}`
    : "pick up where you left off";

  return (
    <Link
      href={link}
      className="group dojo-card-highlight flex items-center justify-between"
    >
      <div className="min-w-0">
        <div className="t-eyebrow">welcome back</div>
        <div className="t-h2 mt-2 truncate">{heading}</div>
        <div className="t-body-sm mt-1 truncate">
          pick up where you left off
        </div>
      </div>
      <kbd className="ml-4 shrink-0 border border-ink-700 px-2 py-1 font-mono text-xs uppercase tracking-wider text-ink-300">
        ↵ continue
      </kbd>
    </Link>
  );
}
