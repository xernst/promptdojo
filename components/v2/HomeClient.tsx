"use client";

// Welcome-back hero card. Reads the new ProgressV2.lastSeenAt + step
// rollups and renders one of 4 discriminated-union states from
// resolveHomeState(). All visual decisions live here; resolver is pure
// (lib/home-state.ts).
//
// Per design-kit/audit-v2/HEADOFIT-plan.md PR 4 +
// design-kit/audit-v2/CEO-vision.md §Divergent #2.

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProgressV2 } from "@/lib/storage";
import {
  recencyLabel,
  resolveHomeState,
  type ChapterSummary,
  type HomeState,
} from "@/lib/home-state";
import ProgressHairline from "./ProgressHairline";

type Props = {
  chapters: ChapterSummary[];
  stepIdsByChapter: Record<string, string[]>;
};

export default function HomeClient({ chapters, stepIdsByChapter }: Props) {
  const [state, setState] = useState<HomeState>({ kind: "loading" });

  useEffect(() => {
    function refresh() {
      setState(resolveHomeState(loadProgressV2(), chapters, stepIdsByChapter));
    }
    refresh();
    window.addEventListener("promptdojo:progress-v2", refresh);
    return () =>
      window.removeEventListener("promptdojo:progress-v2", refresh);
  }, [chapters, stepIdsByChapter]);

  if (state.kind === "loading") {
    return <div aria-hidden className="skeleton h-[124px]" />;
  }

  if (state.kind === "guest") {
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

  if (state.kind === "onboarded-not-started") {
    const { firstChapter, firstLessonSlug } = state;
    const chapterTitle = firstChapter.title
      .replace(/\s*—.*$/, "")
      .toLowerCase();
    return (
      <Link
        href={`/learn/v2/${firstChapter.slug}/${firstLessonSlug}/0`}
        className="group dojo-card-highlight flex items-center justify-between"
      >
        <div className="min-w-0">
          <div className="t-eyebrow">ready when you are</div>
          <div className="t-h2 mt-2">
            start chapter 1 — {chapterTitle}
          </div>
          <div className="t-body-sm mt-1">first lesson, no warm-up.</div>
        </div>
        <kbd className="ml-4 shrink-0 border border-ink-700 px-2 py-1 font-mono text-xs uppercase tracking-wider text-ink-300">
          ↵ start
        </kbd>
      </Link>
    );
  }

  // in-progress
  const {
    chapter,
    lessonTitle,
    stepNumber,
    totalStepsInLesson,
    chapterPctDone,
    chapterDoneSteps,
    daysAway,
    target,
  } = state;
  const chapterTitleClean = chapter.title.replace(/\s*—.*$/, "").toLowerCase();
  const recency = recencyLabel(daysAway);
  const link = `/learn/v2/${target.chapterSlug}/${target.lessonSlug}/${target.stepIndex}`;

  return (
    <Link
      href={link}
      className="group dojo-card-highlight flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="t-eyebrow">welcome back</div>
          <div className="t-h2 mt-2 truncate">
            ch {chapter.number} · {chapterTitleClean}
          </div>
          <div className="t-mono-meta mt-2">
            step {stepNumber} of {totalStepsInLesson} · {chapterPctDone}%
            through · {lessonTitle.toLowerCase()}
            {recency ? ` · last visited ${recency}` : ""}
          </div>
        </div>
        <kbd className="ml-4 shrink-0 border border-ink-700 px-2 py-1 font-mono text-xs uppercase tracking-wider text-ink-300">
          ↵ continue
        </kbd>
      </div>
      <ProgressHairline
        value={chapterDoneSteps}
        max={chapter.totalSteps}
        height="xs"
      />
    </Link>
  );
}
