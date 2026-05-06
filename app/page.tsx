import type { Metadata } from "next";
import Link from "next/link";
import { getChapters } from "@/lib/content";
import { getV2Toc, getV2Chapter } from "@/lib/content-v2";
import HomeClient from "@/components/v2/HomeClient";
import PhaseBandedRail from "@/components/v2/PhaseBandedRail";
import StreakWidget from "@/components/StreakWidget";
import PyodidePreloader from "@/components/PyodidePreloader";
import Wordmark from "@/components/Wordmark";
import HeroBugSnippet from "@/components/HeroBugSnippet";

export const metadata: Metadata = {
  metadataBase: new URL("https://promptdojo.pages.dev"),
  title: "promptdojo — free interactive python course for ai builders",
  description:
    "free, open-source python course for pms, marketers, and ops folks who use cursor and claude code daily. 25 chapters, 624 interactive steps, runs in your browser. no signup, no paywall.",
  alternates: { canonical: "https://promptdojo.dev/" },
  openGraph: {
    type: "website",
    title: "promptdojo — free interactive python course for ai builders",
    description:
      "ai writes this. it's wrong. learn the python you need to read what ai wrote, catch what it got wrong, and direct it deliberately. 22 chapters, free forever.",
    url: "https://promptdojo.dev/",
    siteName: "promptdojo",
    images: [{ url: "/og/launch/wedge", width: 1600, height: 900, alt: "ai writes this. it's wrong." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "promptdojo — ai writes this. it's wrong.",
    description:
      "the python you need to direct ai agents, read what they wrote, and catch what they got wrong.",
    creator: "@TFisPython",
    images: ["/og/launch/wedge"],
  },
};

export default async function Home() {
  const toc = getV2Toc();

  const v2ChaptersWithStepIds = await Promise.all(
    toc.chapters.map(async (entry) => {
      const detail = await getV2Chapter(entry.slug);
      const firstLessonSlug = detail?.lessons[0]?.slug ?? null;
      const hasOverview = !!detail?.overview && detail.overview.trim().length > 0;
      const stepIds = detail
        ? detail.lessons.flatMap((l) => l.steps.map((s) => s.id))
        : [];
      const lessonSummaries = detail
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
          // PR 2 — drives chapter-tile time budget and phase-band aggregate.
          estMinutes: entry.estMinutes,
          firstLessonSlug,
          hasOverview,
        },
        stepIds,
        lessons: lessonSummaries,
      };
    }),
  );
  const v2Chapters = v2ChaptersWithStepIds.map((c) => c.meta);
  const stepIdsByChapter: Record<string, string[]> = Object.fromEntries(
    v2ChaptersWithStepIds.map((c) => [c.meta.slug, c.stepIds]),
  );
  // PR 4 — feeds the welcome-back resolver. Pure data, no chapter blob.
  const chapterSummaries = v2ChaptersWithStepIds.map((c) => ({
    slug: c.meta.slug,
    title: c.meta.title,
    number: c.meta.number,
    totalSteps: c.meta.stepCount,
    lessons: c.lessons,
  }));

  const legacyChapters = getChapters();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
      <PyodidePreloader />

      <header className="relative mb-24 pt-8 sm:pt-14">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div className="text-[11px] uppercase tracking-[0.42em]">
            <Wordmark size="text-[11px]" />
          </div>
          <StreakWidget />
        </div>

        <h1 className="t-hero">
          ai writes this.<br />
          <em className="italic text-green-500">it&apos;s wrong.</em>
        </h1>

        <p className="t-body mt-8 max-w-2xl">
          a python school for the version of you that lives in cursor.
          25 chapters · 624 interactive steps · runs in your browser · free forever.
        </p>

        <div className="mt-10">
          <HeroBugSnippet />
        </div>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Link
            href="/learn/v2/variables/naming-things/0"
            className="dojo-btn-primary"
          >
            start chapter 1 <span aria-hidden>→</span>
          </Link>
          <a
            href="#chapters"
            className="dojo-btn-tertiary"
          >
            or pick your chapter ↓
          </a>
        </div>
      </header>

      <HomeClient
        chapters={chapterSummaries}
        stepIdsByChapter={stepIdsByChapter}
      />

      <section className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          {
            title: "read what ai wrote",
            body:
              "most lessons start with code cursor or claude already produced. you learn to read it, predict its output, and judge whether it works.",
          },
          {
            title: "catch what it got wrong",
            body:
              "hallucinated apis, silent type bugs, off-by-one errors, broken imports. the bugs ai ships are different from the bugs humans ship. we drill those.",
          },
          {
            title: "direct it deliberately",
            body:
              "when you understand mutation, scope, and control flow, you can prompt the ai like a tech lead instead of a passenger.",
          },
        ].map((card) => (
          <div key={card.title} className="dojo-card">
            <div className="t-h3">{card.title}</div>
            <p className="t-body-sm mt-2">{card.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-24">
        <h2 className="t-eyebrow mb-12">
          25 chapters · production-ai track included · free forever
        </h2>
        <PhaseBandedRail
          chapters={v2Chapters}
          stepIdsByChapter={stepIdsByChapter}
        />
      </section>

      <details className="group mt-12 border border-ink-800 bg-ink-950">
        <summary className="cursor-pointer list-none px-4 py-3 t-mono-meta hover:text-ink-300">
          <span className="mr-2 inline-block transition group-open:rotate-90">
            ▸
          </span>
          legacy 28-chapter course (old style)
        </summary>
        <div className="grid grid-cols-1 gap-2 border-t border-ink-800 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {legacyChapters.map((c) => (
            <Link
              key={c.slug}
              href={`/learn/${c.slug}`}
              className="group dojo-card-interactive flex items-center justify-between"
            >
              <div>
                <div className="t-eyebrow text-ink-500">
                  ch {String(c.number).padStart(2, "0")}
                </div>
                <div className="t-h3 mt-1 text-ink-200 group-hover:text-green-300">
                  {c.title.replace(/^Chapter\s+\d+\s*[—\-]\s*/, "").toLowerCase()}
                </div>
              </div>
              <div className="t-mono-meta">{c.exercises.length} ex</div>
            </Link>
          ))}
        </div>
      </details>

      <footer className="mt-16 border-t border-ink-800 pt-6 text-xs text-ink-600">
        <p>
          Press{" "}
          <kbd className="rounded border border-ink-700 bg-ink-900 px-1 py-0.5 font-mono text-[10px] text-ink-300">
            ⌘⇧B
          </kbd>{" "}
          from anywhere to park a thought without losing your place.
        </p>
      </footer>
    </main>
  );
}
