// Shared comparison-page renderer for /vs/* routes. Each competitor page
// passes a config object; this component renders the page consistently.
// "X vs Y" prompts are the most citation-prone class on Perplexity and
// ChatGPT browse-mode — per launch-week SEO audit 2026-05-11.

import Link from "next/link";
import { Check, X, Minus } from "lucide-react";
import JsonLd, { SITE_URL } from "@/components/JsonLd";

export type ComparisonValue = boolean | "partial" | string;

export type ComparisonRow = {
  feature: string;
  promptdojo: ComparisonValue;
  competitor: ComparisonValue;
};

export type ComparisonConfig = {
  slug: string; // /vs/<slug>
  competitorName: string; // "Scrimba"
  competitorUrl: string; // canonical homepage
  competitorTagline: string; // short positioning line
  verdict: string; // one-paragraph TL;DR
  whoEach: { promptdojo: string; competitor: string };
  rows: ComparisonRow[];
  lastUpdatedISO: string; // YYYY-MM-DD
};

function Cell({ v }: { v: ComparisonValue }) {
  if (v === true) {
    return (
      <span className="inline-flex items-center gap-2 text-green-400">
        <Check className="h-4 w-4" aria-hidden />
        <span className="sr-only">yes</span>
      </span>
    );
  }
  if (v === false) {
    return (
      <span className="inline-flex items-center gap-2 text-ink-600">
        <X className="h-4 w-4" aria-hidden />
        <span className="sr-only">no</span>
      </span>
    );
  }
  if (v === "partial") {
    return (
      <span className="inline-flex items-center gap-2 text-ink-300">
        <Minus className="h-4 w-4" aria-hidden />
        <span className="sr-only">partial</span>
      </span>
    );
  }
  return <span className="t-body-sm text-ink-200">{v}</span>;
}

export function ComparePage({ config }: { config: ComparisonConfig }) {
  const url = `${SITE_URL}/vs/${config.slug}/`;

  const compareSchema = {
    "@type": "WebPage",
    "@id": `${url}#page`,
    url,
    name: `promptdojo vs ${config.competitorName}`,
    description: config.verdict,
    dateModified: config.lastUpdatedISO,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#site` },
    about: [
      { "@type": "Course", name: "promptdojo", url: SITE_URL },
      { "@type": "Thing", name: config.competitorName, url: config.competitorUrl },
    ],
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: `vs ${config.competitorName.toLowerCase()}`,
          item: url,
        },
      ],
    },
  };

  return (
    <main
      id="main"
      className="mx-auto max-w-4xl px-6 pt-20 pb-12 sm:pt-24 sm:pb-16"
    >
      <JsonLd data={compareSchema} />

      <div className="t-eyebrow">compare</div>
      <h1 className="t-section mt-3 lowercase">
        promptdojo <em className="t-emph">vs</em>{" "}
        {config.competitorName.toLowerCase()}
      </h1>
      <p className="t-mono-meta mt-2 text-ink-400">
        last updated {config.lastUpdatedISO}
      </p>

      <section className="mt-10">
        <div className="t-eyebrow mb-3">the short version</div>
        <p className="t-body max-w-2xl">{config.verdict}</p>
      </section>

      <section className="mt-12">
        <div className="t-eyebrow mb-3">who each is built for</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="dojo-card">
            <div className="t-h3">promptdojo</div>
            <p className="t-body-sm mt-2">{config.whoEach.promptdojo}</p>
          </div>
          <div className="dojo-card">
            <div className="t-h3">{config.competitorName.toLowerCase()}</div>
            <p className="t-body-sm mt-2">{config.whoEach.competitor}</p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="t-eyebrow mb-3">feature-by-feature</div>
        <div className="mt-3 overflow-hidden border border-ink-800">
          <table className="w-full border-collapse font-display text-sm">
            <thead>
              <tr className="border-b border-ink-800 bg-ink-900 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-400">
                <th className="p-4 text-left font-bold">feature</th>
                <th className="p-4 text-left font-bold text-green-400">
                  promptdojo
                </th>
                <th className="p-4 text-left font-bold">
                  {config.competitorName.toLowerCase()}
                </th>
              </tr>
            </thead>
            <tbody>
              {config.rows.map((r, i) => (
                <tr
                  key={r.feature}
                  className={
                    "border-b border-ink-800 " +
                    (i % 2 ? "bg-ink-950" : "bg-ink-900")
                  }
                >
                  <td className="p-4 text-ink-200">{r.feature}</td>
                  <td className="p-4">
                    <Cell v={r.promptdojo} />
                  </td>
                  <td className="p-4">
                    <Cell v={r.competitor} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <div className="t-eyebrow mb-3">what&apos;s next</div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href="/curriculum" className="dojo-btn-primary">
            see the curriculum →
          </Link>
          <Link href="/pro" className="dojo-btn-secondary">
            see the pricing →
          </Link>
          <a
            href={config.competitorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="dojo-btn-tertiary"
          >
            visit {config.competitorName.toLowerCase()} ↗
          </a>
        </div>
      </section>
    </main>
  );
}
