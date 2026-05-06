// Pure resolver for the home-page hero state. No DOM, no localStorage —
// fully testable. Returns one of 4 discriminated-union states:
//   loading | guest | onboarded-not-started | in-progress
//
// Per design-kit/audit-v2/05-ia-architecture.md §welcome-back state.
// CEO collapsed the 6-state proposal to 4 in audit-v2/CEO-vision.md.

import type { LastVisitedV2, ProgressV2 } from "./storage";

export type ChapterSummary = {
  slug: string;
  title: string;
  number: number;
  totalSteps: number;
  lessons: { slug: string; title: string; stepCount: number }[];
};

export type HomeState =
  | { kind: "loading" }
  | { kind: "guest" }
  | {
      kind: "onboarded-not-started";
      firstChapter: ChapterSummary;
      firstLessonSlug: string;
    }
  | {
      kind: "in-progress";
      chapter: ChapterSummary;
      lessonTitle: string;
      lessonSlug: string;
      stepIndex: number;
      stepNumber: number;
      totalStepsInLesson: number;
      chapterPctDone: number;
      chapterDoneSteps: number;
      daysAway: number | null;
      target: LastVisitedV2;
    };

const MS_PER_DAY = 86_400_000;

export function resolveHomeState(
  progress: ProgressV2 | null,
  chapters: ChapterSummary[],
  stepIdsByChapter: Record<string, string[]>,
): HomeState {
  if (progress === null) return { kind: "loading" };
  if (!progress.profile?.name?.trim()) return { kind: "guest" };

  const lastVisited = progress.lastVisitedV2;
  if (!lastVisited) {
    const firstChapter = chapters[0];
    if (!firstChapter || !firstChapter.lessons[0]) return { kind: "guest" };
    return {
      kind: "onboarded-not-started",
      firstChapter,
      firstLessonSlug: firstChapter.lessons[0].slug,
    };
  }

  const chapter = chapters.find((c) => c.slug === lastVisited.chapterSlug);
  const lesson = chapter?.lessons.find((l) => l.slug === lastVisited.lessonSlug);
  if (!chapter || !lesson) {
    // Defensive: a chapter or lesson disappeared from the manifest. Fall
    // back to the guest state instead of crashing the home page.
    return { kind: "guest" };
  }

  const chapterStepIds = stepIdsByChapter[chapter.slug] ?? [];
  const passedIds = new Set(
    Object.entries(progress.steps)
      .filter(([, s]) => s.status === "passed")
      .map(([id]) => id),
  );
  const chapterDoneSteps = chapterStepIds.reduce(
    (acc, id) => (passedIds.has(id) ? acc + 1 : acc),
    0,
  );
  const chapterPctDone =
    chapter.totalSteps > 0
      ? Math.round((chapterDoneSteps / chapter.totalSteps) * 100)
      : 0;

  let daysAway: number | null = null;
  if (progress.lastSeenAt) {
    const t = new Date(progress.lastSeenAt).getTime();
    if (Number.isFinite(t)) {
      const d = Math.floor((Date.now() - t) / MS_PER_DAY);
      if (Number.isFinite(d) && d >= 0) daysAway = d;
    }
  }

  return {
    kind: "in-progress",
    chapter,
    lessonTitle: lesson.title,
    lessonSlug: lesson.slug,
    stepIndex: lastVisited.stepIndex,
    stepNumber: lastVisited.stepIndex + 1,
    totalStepsInLesson: lesson.stepCount,
    chapterPctDone,
    chapterDoneSteps,
    daysAway,
    target: lastVisited,
  };
}

export function recencyLabel(daysAway: number | null): string | null {
  if (daysAway === null) return null;
  if (daysAway === 0) return "today";
  if (daysAway === 1) return "yesterday";
  return `${daysAway}d ago`;
}
