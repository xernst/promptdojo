// The whole course on one page. Server component using the same
// PhaseBandedRail data the home page builds, but expanded so each
// chapter shows its lesson list. Static-export safe — pure server
// component reading the build-time manifest.
//
// Per design-kit/audit-v3/04-navigation-system.md PR 5.

import type { Metadata } from "next";

import StatStrip from "@/components/StatStrip";
import PhaseBandedRail from "@/components/v2/PhaseBandedRail";
import { getV2Toc, getV2Chapter } from "@/lib/content-v2";

export const metadata: Metadata = {
  title: "the curriculum · promptdojo",
  description:
    "25 chapters, 624 runnable steps. read · run · fix. free, open-source, no signup.",
  alternates: { canonical: "/curriculum" },
};

export default async function Curriculum() {
  const toc = getV2Toc();
  const chaptersWithExtras = await Promise.all(
    toc.chapters.map(async (entry) => {
      const detail = await getV2Chapter(entry.slug);
      const firstLessonSlug = detail?.lessons[0]?.slug ?? null;
      const hasOverview =
        !!detail?.overview && detail.overview.trim().length > 0;
      const stepIds = detail
        ? detail.lessons.flatMap((l) => l.steps.map((s) => s.id))
        : [];
      const lessons = detail
        ? detail.lessons.map((l) => ({
            slug: l.slug,
            title: l.title,
            stepCount: l.steps.length,
          }))
        : [];
      return {
        meta: {
          slug: entry.slug,
          title: entry.title,
          number: entry.number,
          blurb: entry.blurb,
          lessonCount: entry.lessonCount,
          stepCount: entry.stepCount,
          estMinutes: entry.estMinutes,
          firstLessonSlug,
          hasOverview,
        },
        stepIds,
        lessons,
      };
    }),
  );

  const chapters = chaptersWithExtras.map((c) => c.meta);
  const stepIdsByChapter = Object.fromEntries(
    chaptersWithExtras.map((c) => [c.meta.slug, c.stepIds]),
  );
  const lessonsByChapter = Object.fromEntries(
    chaptersWithExtras.map((c) => [c.meta.slug, c.lessons]),
  );

  const totalSteps = chapters.reduce((a, c) => a + c.stepCount, 0);

  return (
    <main id="main" className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
      <div className="t-eyebrow">the whole course</div>
      <h1 className="t-section mt-3">
        {chapters.length} chapters · {totalSteps} runnable steps · 8–15h
      </h1>
      <StatStrip className="mt-6" />
      <PhaseBandedRail
        chapters={chapters}
        stepIdsByChapter={stepIdsByChapter}
        lessonsByChapter={lessonsByChapter}
        expanded
        className="mt-12"
      />
    </main>
  );
}
