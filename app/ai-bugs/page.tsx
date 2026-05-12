// /ai-bugs — the AEO wedge page. Per launch-week SEO audit 2026-05-11:
// no other python edu site publishes a continuously-updated catalog of
// AI-introduced python failure modes. This page is the page Claude /
// ChatGPT / Perplexity want to cite when a user asks "what kinds of
// python bugs does ai ship?" — because it answers them, names the bug,
// and links to a runnable chapter on the fix.
//
// Entries here are hand-curated for now. As lessons are written we add
// more rows + link each one to the relevant /learn/v2/* lesson.

import type { Metadata } from "next";
import Link from "next/link";
import JsonLd, { SITE_URL } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "python bugs ai writes (and how to catch them) · promptdojo",
  description:
    "a hand-curated catalog of python bugs cursor, claude code, and copilot ship. updated weekly. each bug links to a free, runnable chapter on the fix.",
  alternates: { canonical: "/ai-bugs" },
  openGraph: {
    type: "article",
    title: "python bugs ai writes (and how to catch them)",
    description:
      "a hand-curated catalog of python bugs cursor, claude code, and copilot ship.",
    url: "/ai-bugs",
    siteName: "promptdojo",
    images: [{ url: "/og/launch/hook", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "python bugs ai writes",
    description:
      "a catalog of python bugs ai keeps shipping. each one links to a runnable fix.",
    creator: "@TFisPython",
    images: ["/og/launch/hook"],
  },
};

type Bug = {
  id: string;
  title: string;
  surface: string; // claude code, cursor, copilot, etc.
  why: string; // one-line bug summary
  fix: string; // where the fix lives
  lessonUrl: string | null; // promptdojo lesson, when available
  addedISO: string;
};

const BUGS: Bug[] = [
  {
    id: "falsy-filter",
    title: "filters falsy values out of a list, deletes valid zeros",
    surface: "claude code, cursor, copilot",
    why: "asked to filter `None` from `[0, 1, None, 2]`, the ai writes `[x for x in xs if x]` and silently drops `0`. shipped a `user_id` outage at one company.",
    fix: "use `if x is not None` for nullable checks. never use truthiness for nullable id checks.",
    lessonUrl: "/learn/v2/conditionals/truthiness-bugs/0",
    addedISO: "2026-05-11",
  },
  {
    id: "mutable-default-arg",
    title: "shared mutable default argument",
    surface: "all ai coders",
    why: "writes `def add(item, items=[]):` and the same list gets reused across every call. classic python footgun, ai writes it weekly.",
    fix: "use `items: list | None = None` and create the list inside the function.",
    lessonUrl: "/learn/v2/mutation-and-state/why-it-breaks/0",
    addedISO: "2026-05-11",
  },
  {
    id: "equality-vs-identity",
    title: "`==` where `is` was meant",
    surface: "claude code, cursor",
    why: "writes `if items == None:` six times in one file. `__eq__` can lie. `is` cannot.",
    fix: "use `is None` always. it's not a style choice.",
    lessonUrl: "/learn/v2/conditionals/truthiness-bugs/0",
    addedISO: "2026-05-11",
  },
  {
    id: "sort-default-direction",
    title: "`sorted(..., key=...)` with no `reverse=True`",
    surface: "claude code, cursor",
    why: "ask for the top 3 best sellers, get the 3 worst. `sorted()` is ascending by default and the ai never asks.",
    fix: "always pass `reverse=True` when you want largest-first, or use `heapq.nlargest`.",
    lessonUrl: "/learn/v2/lists-and-dicts/list-comprehensions/0",
    addedISO: "2026-05-11",
  },
  {
    id: "generator-vs-list",
    title: "claims a function is a generator, returns a list",
    surface: "claude code",
    why: "asks for a streaming generator, gets a function that builds the full list in memory and returns it. memory blows up at scale.",
    fix: "look for `yield`. no yield, not a generator.",
    lessonUrl: null,
    addedISO: "2026-05-11",
  },
  {
    id: "dict-key-iteration",
    title: "modifies a dict while iterating over it",
    surface: "cursor, copilot",
    why: "`for k in d:` then `del d[k]` raises `RuntimeError: dictionary changed size during iteration`. ai writes it confidently anyway.",
    fix: "iterate over `list(d.keys())` if you need to mutate while looping. or build a new dict.",
    lessonUrl: "/learn/v2/lists-and-dicts/nested-data-shapes/0",
    addedISO: "2026-05-11",
  },
  {
    id: "exception-too-broad",
    title: "`except Exception:` swallowing everything",
    surface: "all ai coders",
    why: "writes `try: ... except Exception: pass` and hides real bugs forever. the call site reports success.",
    fix: "catch the specific exception. if you need a wide net, log + reraise. never silent.",
    lessonUrl: "/learn/v2/error-handling/catching-specific-errors/0",
    addedISO: "2026-05-11",
  },
];

export default function AiBugsPage() {
  // ItemList of bugs lets AI engines see this as a structured catalog and
  // surface individual bug entries when a user asks "python ai bug for X".
  const itemList = {
    "@type": "ItemList",
    "@id": `${SITE_URL}/ai-bugs/#list`,
    name: "python bugs ai writes (and how to catch them)",
    description:
      "a hand-curated catalog of python bugs cursor, claude code, and copilot ship.",
    numberOfItems: BUGS.length,
    itemListElement: BUGS.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TechArticle",
        name: b.title,
        url: `${SITE_URL}/ai-bugs/#${b.id}`,
        about: b.surface,
        datePublished: b.addedISO,
      },
    })),
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "ai bugs", item: `${SITE_URL}/ai-bugs/` },
    ],
  };

  return (
    <main
      id="main"
      className="mx-auto max-w-4xl px-6 pt-20 pb-12 sm:pt-24 sm:pb-16"
    >
      <JsonLd data={[itemList, breadcrumb]} />

      <div className="t-eyebrow">the wedge</div>
      <h1 className="t-section mt-3">
        python bugs ai writes <em className="t-emph">(and how to catch them).</em>
      </h1>
      <p className="t-mono-meta mt-2 text-ink-400">
        updated {BUGS[0].addedISO} · {BUGS.length} entries
      </p>

      <p className="t-body mt-8 max-w-2xl">
        every bug below is one your ai coding assistant will ship to you.
        most of them, more than once. each entry names the bug, shows where
        it shows up, and links to a runnable chapter on the fix when one
        exists.
      </p>
      <p className="t-body-sm mt-4 max-w-2xl text-ink-400">
        send a bug to <a className="text-green-400 underline" href="https://x.com/TFisPython" target="_blank" rel="noopener noreferrer">@TFisPython</a>. the best ones land here, anonymized.
      </p>

      <section className="mt-16 space-y-12">
        {BUGS.map((b, i) => (
          <article key={b.id} id={b.id} className="border-l-2 border-ink-800 pl-6">
            <div className="t-mono-meta text-ink-500">
              #{String(i + 1).padStart(2, "0")} · {b.surface}
            </div>
            <h2 className="t-h2 mt-2 lowercase">{b.title}</h2>
            <p className="t-body-sm mt-3">
              <span className="t-eyebrow text-green-400 mr-2">why:</span>
              {b.why}
            </p>
            <p className="t-body-sm mt-2">
              <span className="t-eyebrow text-green-400 mr-2">fix:</span>
              {b.fix}
            </p>
            {b.lessonUrl ? (
              <div className="mt-4">
                <Link
                  href={b.lessonUrl}
                  className="t-mono-meta text-ink-200 underline decoration-ink-700 underline-offset-4 hover:text-green-400 hover:decoration-green-500"
                >
                  runnable chapter → {b.lessonUrl}
                </Link>
              </div>
            ) : (
              <div className="mt-4 t-mono-meta text-ink-500">
                chapter coming
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="mt-20">
        <div className="t-eyebrow mb-3">what&apos;s next</div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/curriculum" className="dojo-btn-primary">
            see the curriculum →
          </Link>
          <a
            href="https://x.com/TFisPython"
            target="_blank"
            rel="noopener noreferrer"
            className="dojo-btn-secondary"
          >
            send me a bug ↗
          </a>
        </div>
      </section>
    </main>
  );
}
