import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getNextV2Step,
  getV2Step,
  getV2Toc,
  listAllV2StepRoutes,
} from "@/lib/content-v2";
import LessonStepClient from "@/components/v2/LessonStepClient";
import JsonLd, { SITE_URL } from "@/components/JsonLd";

export async function generateStaticParams() {
  return listAllV2StepRoutes();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string; lesson: string; stepIndex: string }>;
}): Promise<Metadata> {
  const { chapter, lesson, stepIndex } = await params;
  const idx = Number.parseInt(stepIndex, 10);
  if (!Number.isFinite(idx) || idx < 0) return {};

  const found = await getV2Step(chapter, lesson, idx);
  if (!found) return {};

  const stepNum = idx + 1;
  const totalSteps = found.lesson.steps.length;
  const chapterTitleClean = found.chapter.title.replace(/\s*—.*$/, "");
  const title = `${found.lesson.title} (step ${stepNum}/${totalSteps}) · ${chapterTitleClean} · promptdojo`;
  const description = `step ${stepNum} of ${totalSteps} in ${found.lesson.title}. interactive python lesson, runs in your browser. free.`;
  const url = `/learn/v2/${chapter}/${lesson}/${idx}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "promptdojo",
    },
    twitter: {
      card: "summary_large_image",
      title: `${found.lesson.title} · promptdojo`,
      description,
      creator: "@TFisPython",
    },
  };
}

export default async function V2StepPage({
  params,
}: {
  params: Promise<{ chapter: string; lesson: string; stepIndex: string }>;
}) {
  const { chapter, lesson, stepIndex } = await params;
  const idx = Number.parseInt(stepIndex, 10);
  if (!Number.isFinite(idx) || idx < 0) notFound();

  const found = await getV2Step(chapter, lesson, idx);
  if (!found) notFound();

  const next = await getNextV2Step(chapter, lesson, idx);

  const stepNum = idx + 1;
  const totalSteps = found.lesson.steps.length;
  const stepUrl = `${SITE_URL}/learn/v2/${chapter}/${lesson}/${idx}/`;
  const chapterUrl = `${SITE_URL}/learn/v2/${chapter}/`;

  // LearningResource is the right type for an interactive lesson step. Pairs
  // with BreadcrumbList so AI engines can place this in the school hierarchy
  // and link back up to chapter + curriculum + home.
  const lessonSchema = {
    "@type": "LearningResource",
    "@id": `${stepUrl}#resource`,
    name: `${found.lesson.title} — step ${stepNum} of ${totalSteps}`,
    url: stepUrl,
    isPartOf: { "@id": `${chapterUrl}#course` },
    inLanguage: "en",
    educationalLevel: "Beginner",
    learningResourceType: "Interactive Tutorial",
    interactivityType: "active",
    isAccessibleForFree: true,
    provider: { "@id": `${SITE_URL}/#org` },
    teaches: found.lesson.title,
  };

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "curriculum",
        item: `${SITE_URL}/curriculum/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: found.chapter.title,
        item: chapterUrl,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: found.lesson.title,
        item: stepUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[lessonSchema, breadcrumbSchema]} />
      <LessonStepClient
        tree={{ toc: getV2Toc(), detail: found.chapter }}
        chapter={found.chapter}
        lesson={found.lesson}
        step={found.step}
        stepIndex={found.stepIndex}
        next={next}
      />
    </>
  );
}
