// The whole course on one page. Server component using the same
// PhaseBandedRail data the home page builds, but expanded so each
// chapter shows its lesson list. Static-export safe — pure server
// component reading the build-time manifest.
//
// Per design-kit/audit-v3/04-navigation-system.md PR 5.

import type { Metadata } from "next";

import StatStrip from "@/components/StatStrip";
import CurriculumAccordion from "@/components/v2/CurriculumAccordion";
import JsonLd, { SITE_URL } from "@/components/JsonLd";
import { getV2Toc, getV2Chapter } from "@/lib/content-v2";

// Dynamic metadata so chapter/step counts always match getV2Toc.
// Per UI audit 2026-05-07.
export async function generateMetadata(): Promise<Metadata> {
  const toc = getV2Toc();
  const chapters = toc.chapters.length;
  const steps = toc.chapters.reduce((a, c) => a + c.stepCount, 0);
  return {
    title: "the curriculum · promptdojo",
    description: `${chapters} chapters, ${steps} runnable steps. read · run · fix. free preview on the web, paid app coming after.`,
    alternates: { canonical: "/curriculum" },
  };
}

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
  const lessonsByChapter = Object.fromEntries(
    chaptersWithExtras.map((c) => [c.meta.slug, c.lessons]),
  );

  const totalSteps = chapters.reduce((a, c) => a + c.stepCount, 0);

  // CollectionPage + ItemList of all chapters. Lets AI engines see the full
  // syllabus at one URL and link chapter titles back to their detail pages.
  const collectionSchema = {
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/curriculum/#page`,
    url: `${SITE_URL}/curriculum/`,
    name: "the curriculum · promptdojo",
    description: `the full ${chapters.length}-chapter path from cursor-passenger to cursor-driver. ${totalSteps} runnable steps.`,
    isPartOf: { "@id": `${SITE_URL}/#site` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "curriculum", item: `${SITE_URL}/curriculum/` },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: chapters.length,
      itemListElement: chapters.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.title,
        url: `${SITE_URL}/learn/v2/${c.slug}/`,
      })),
    },
  };

  return (
    <main id="main" className="mx-auto max-w-6xl px-6 pt-20 pb-10 sm:pt-24 sm:pb-16">
      <JsonLd data={collectionSchema} />
      <div className="t-eyebrow">the whole school</div>
      <h1 className="t-section mt-3">
        {chapters.length} chapters · {totalSteps} runnable steps · 8–15h
      </h1>
      <StatStrip className="mt-6" />
      <CurriculumAccordion
        chapters={chapters.map((c) => ({
          slug: c.slug,
          title: c.title,
          number: c.number,
          blurb: c.blurb,
          stepCount: c.stepCount,
          estMinutes: c.estMinutes,
          firstLessonSlug: c.firstLessonSlug,
          hasOverview: c.hasOverview,
          lessons: lessonsByChapter[c.slug] ?? [],
        }))}
        className="mt-12"
      />
    </main>
  );
}
