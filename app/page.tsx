import type { Metadata } from "next";
import Link from "next/link";
import { getV2Toc, getV2Chapter } from "@/lib/content-v2";
import HomeClient from "@/components/v2/HomeClient";
import PhaseBandedRail from "@/components/v2/PhaseBandedRail";
import PriceBand from "@/components/PriceBand";
import EmailSignup from "@/components/EmailSignup";
import StatStrip from "@/components/StatStrip";
import StreakWidget from "@/components/StreakWidget";
import PyodidePreloader from "@/components/PyodidePreloader";
import Wordmark from "@/components/Wordmark";
import HeroBugSnippet from "@/components/HeroBugSnippet";
import { formatDateShort, githubStats } from "@/lib/github-stats";

// Dynamic metadata so the description always reflects the actual chapter
// + step counts at build time. Per audit-v5/code-review.md (the hardcoded
// "25 chapters, 624 steps" lied — actual was 26 / 515).
export async function generateMetadata(): Promise<Metadata> {
  const toc = getV2Toc();
  const chapters = toc.chapters.length;
  const steps = toc.chapters.reduce(
    (a: number, c: { stepCount: number }) => a + c.stepCount,
    0,
  );
  return {
    metadataBase: new URL("https://promptdojo.dev"),
    title: "promptdojo — free runnable python course for ai builders",
    description: `free, open-source python course for pms, marketers, and ops folks who use cursor and claude code daily. ${chapters} chapters, ${steps} runnable steps, runs in your browser. no signup, no paywall.`,
    alternates: { canonical: "https://promptdojo.dev/" },
    openGraph: {
      type: "website",
      title: "promptdojo — free runnable python course for ai builders",
      description: `ai writes this. it's wrong. learn the python you need to read what ai wrote, catch what it got wrong, and direct it deliberately. ${chapters} chapters, free forever.`,
      url: "https://promptdojo.dev/",
      siteName: "promptdojo",
      images: [{ url: "/og/launch/wedge", width: 1600, height: 900, alt: "ai writes this. it's wrong." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "promptdojo — ai writes this. it's wrong.",
      description: "the python you need to direct ai agents, read what they wrote, and catch what they got wrong.",
      creator: "@TFisPython",
      images: ["/og/launch/wedge"],
    },
  };
}

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
  const totalChapters = v2Chapters.length;
  const totalSteps = v2Chapters.reduce((a, c) => a + c.stepCount, 0);
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

  return (
    <main id="main" className="mx-auto max-w-6xl px-5 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-16">
      <PyodidePreloader />

      <header className="relative mb-16 pt-2 sm:pt-6">
        <div className="mb-10 flex items-start justify-between gap-4">
          <Wordmark size="text-base sm:text-lg" className="lowercase tracking-tight" />
          <StreakWidget />
        </div>

        <h1 className="t-hero">
          ai writes this.<br />
          <em className="italic text-green-500">it&apos;s wrong.</em>
        </h1>

        <p className="t-body mt-12 max-w-2xl">
          a python school for builders whose code is mostly written by ai now.
          {" "}{totalChapters} chapters · {totalSteps} runnable steps · runs
          in your browser · free preview, paid in the app.
        </p>
        <p className="t-body-sm mt-3 max-w-2xl text-ink-400">
          free preview · full python school in the app. $9.99/mo · $59/yr · $129 founders.
        </p>

        <div className="mt-10">
          <HeroBugSnippet />
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Link
            href="/learn/v2/agent-loops/the-loop/0"
            className="dojo-btn-primary"
          >
            catch ai&apos;s first bug <span aria-hidden>→</span>
          </Link>
          <a
            href="https://x.com/intent/follow?screen_name=TFisPython"
            target="_blank"
            rel="noopener noreferrer"
            className="dojo-btn-secondary"
          >
            follow on x for daily bugs <span aria-hidden>↗</span>
          </a>
        </div>
        <div className="mt-3">
          <Link
            href="/pro"
            className="t-mono-meta text-ink-300 underline decoration-ink-700 underline-offset-4 hover:text-green-400 hover:decoration-green-500"
          >
            see the app · join early access →
          </Link>
        </div>
        <p className="mt-4 t-mono-meta">
          new to python?{" "}
          <Link
            href="/learn/v2/variables/naming-things/0"
            className="text-ink-300 underline decoration-ink-700 underline-offset-4 hover:text-green-400 hover:decoration-green-500"
          >
            start at chapter 1
          </Link>
          {" · or "}
          <a
            href="#chapters"
            className="text-ink-300 underline decoration-ink-700 underline-offset-4 hover:text-green-400 hover:decoration-green-500"
          >
            pick a chapter ↓
          </a>
        </p>
      </header>

      <HomeClient
        chapters={chapterSummaries}
        stepIdsByChapter={stepIdsByChapter}
      />

      <section className="mt-16">
        <div className="t-eyebrow mb-6">the three things you actually learn</div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              title: "read what ai wrote",
              body:
                "ai wrote most of your codebase. you can't read it. that's the new illiteracy.",
            },
            {
              title: "catch what it got wrong",
              body:
                "the bugs ai ships are not the bugs humans ship. you've never been trained on them.",
            },
            {
              title: "direct it deliberately",
              body:
                "if you don't understand mutation, you're a passenger in your own ide.",
            },
          ].map((card) => (
            <div key={card.title} className="dojo-card">
              <div className="t-h3">{card.title}</div>
              <p className="t-body-sm mt-2">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <StatStrip className="mt-24 mb-12" />

      <PriceBand />

      <EmailSignup />

      <section>
        <h2 className="t-eyebrow mb-12">
          the {totalChapters}-chapter path from cursor-passenger to cursor-driver.
        </h2>
        <PhaseBandedRail
          chapters={v2Chapters}
          stepIdsByChapter={stepIdsByChapter}
        />
      </section>

      <footer className="mt-16 flex flex-wrap items-baseline justify-between gap-3 border-t border-ink-800 pt-6 t-mono-meta">
        {/* Lesson keyboard hint hidden on the home page — it has no
            "spot in the lesson" yet, so the kbd promise is unearned.
            UI audit 2026-05-07. The hint stays on lesson pages where
            it's contextual. */}
        <span className="text-ink-500">the python school for the ai era · $9.99/mo in the app</span>
        <div className="t-mono-meta flex flex-wrap items-baseline gap-x-3 sm:gap-x-2">
          {(() => {
            const lc = formatDateShort(githubStats.lastCommitISO);
            return lc ? <span>shipped {lc}</span> : null;
          })()}
          <span className="text-ink-700">·</span>
          <Link href="/changelog" className="hover:text-green-400">
            changelog
          </Link>
          <span className="text-ink-700">·</span>
          <a
            href="https://github.com/xernst/promptdojo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400"
          >
            github
          </a>
          <span className="text-ink-700">·</span>
          <a
            href="https://x.com/TFisPython"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400"
          >
            @TFisPython
          </a>
        </div>
      </footer>
    </main>
  );
}
