import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ArrowRight } from "lucide-react";
import {
  getV2Chapter,
  getV2Toc,
  listAllV2ChapterRoutes,
} from "@/lib/content-v2";
import V2ChapterNav, {
  type ChapterNavTree,
} from "@/components/v2/ChapterNav";

export async function generateStaticParams() {
  return listAllV2ChapterRoutes();
}

// Per-chapter OG cards for the three story chapters that ship hand-designed
// art (Marketing #4 / PR 7). Other chapters fall back to the wedge OG.
const OG_BY_CHAPTER: Record<string, string> = {
  "mutation-and-state": "/og/launch/wedge",
  "llm-apis": "/og/launch/ide",
  capstone: "/og/launch/capstone",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter: chapterSlug } = await params;
  const chapter = await getV2Chapter(chapterSlug);
  if (!chapter) return {};

  const title = `${chapter.title} · promptdojo`;
  const description = chapter.blurb;
  const url = `/learn/v2/${chapter.slug}`;
  const ogImage = OG_BY_CHAPTER[chapterSlug] ?? "/og/launch/wedge";

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
      images: [{ url: ogImage, width: 1600, height: 900 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@TFisPython",
      images: [ogImage],
    },
  };
}

export default async function V2ChapterOverviewPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: chapterSlug } = await params;
  const chapter = await getV2Chapter(chapterSlug);
  if (!chapter) notFound();

  // No overview body? Fall back to the lesson list page that ships today —
  // jump straight to lesson 1 step 0 so the route stays useful.
  const firstLesson = chapter.lessons[0];
  if (!chapter.overview && firstLesson) {
    redirect(`/learn/v2/${chapter.slug}/${firstLesson.slug}/0`);
  }

  const toc = getV2Toc();
  const tree: ChapterNavTree = { toc, detail: chapter };

  return (
    <div className="flex h-[calc(100dvh-40px)] min-h-0 flex-col bg-ink-950 text-ink-100">
      <div className="flex h-full min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-ink-800 bg-ink-900 lg:flex lg:flex-col">
          <V2ChapterNav
            tree={tree}
            activeChapter={chapter.slug}
            activeLesson=""
            activeStepIndex={-1}
          />
        </aside>
        <main id="main" className="flex min-h-0 w-full flex-1 flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
              <div className="t-eyebrow">
                chapter {String(chapter.number).padStart(2, "0")}
              </div>
              <h1 className="t-section mt-2">
                {chapter.title.replace(/\s*—.*$/, "").toLowerCase()}
              </h1>
              {chapter.blurb && (
                <p className="t-body mt-3">{chapter.blurb}</p>
              )}
              <div className="t-mono-meta mt-2">
                {chapter.lessons.length}{" "}
                {chapter.lessons.length === 1 ? "lesson" : "lessons"} ·{" "}
                {chapter.lessons.reduce((a, l) => a + l.steps.length, 0)} steps
                · {chapter.xpTotal} XP
              </div>

              <div className="prose prose-invert mt-8 max-w-none text-ink-200">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {chapter.overview}
                </ReactMarkdown>
              </div>

              <div className="mt-10 flex items-center gap-3 border-t border-ink-800 pt-6">
                {firstLesson && (
                  <Link
                    href={`/learn/v2/${chapter.slug}/${firstLesson.slug}/0`}
                    className="dojo-btn-primary"
                  >
                    start chapter
                    <ArrowRight size={14} />
                  </Link>
                )}
                <Link href="/" className="dojo-btn-tertiary">
                  ← back to all chapters
                </Link>
              </div>

              <div className="mt-10">
                <h2 className="t-eyebrow text-ink-500">
                  lessons in this chapter
                </h2>
                <ol className="mt-2 flex flex-col divide-y divide-ink-800 border border-ink-800 bg-ink-950">
                  {chapter.lessons.map((lesson, idx) => (
                    <li key={lesson.slug}>
                      <Link
                        href={`/learn/v2/${chapter.slug}/${lesson.slug}/0`}
                        className="flex items-center justify-between px-4 py-3 text-sm transition hover:bg-ink-900"
                      >
                        <span className="flex items-center gap-3">
                          <span className="t-mono-meta">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-ink-200">{lesson.title.toLowerCase()}</span>
                        </span>
                        <span className="t-mono-meta">
                          {lesson.steps.length} steps
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
