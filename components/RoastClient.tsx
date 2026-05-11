"use client";

import { useMemo, useState } from "react";
import { Share2, Sparkles, RotateCcw } from "lucide-react";
import {
  roastPrompt,
  ROAST_EXAMPLES,
  type RoastReport,
  type RoastSeverity,
} from "@/lib/roast-rules";

const MAX_PROMPT_CHARS = 10_000;

const SEVERITY_STYLE: Record<RoastSeverity, string> = {
  low: "bg-ink-700/40 text-ink-200 ring-ink-600/40",
  med: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
  high: "bg-red-500/15 text-red-200 ring-red-500/30",
};

const SEVERITY_LABEL: Record<RoastSeverity, string> = {
  low: "nit",
  med: "warn",
  high: "crit",
};

function scoreColor(score: number): string {
  if (score >= 85) return "text-green-400";
  if (score >= 65) return "text-green-300";
  if (score >= 40) return "text-amber-300";
  if (score >= 20) return "text-amber-400";
  return "text-red-400";
}

function siteOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "https://promptdojo.dev";
}

function buildShareText(report: RoastReport): string {
  const top = report.hits[0];
  const lead = `roasted my prompt at promptdojo. score: ${report.score}/100. verdict: "${report.verdict}"`;
  const evidence = top ? `\n\ntop hit: ${top.title}` : "";
  const tail = `\n\n${siteOrigin()}/roast/ via @TFisPython`;
  const budget = 280;
  const text = lead + evidence + tail;
  if (text.length <= budget) return text;
  return lead.slice(0, budget - tail.length - 1) + "…" + tail;
}

export default function RoastClient() {
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const report = useMemo<RoastReport | null>(
    () => (submitted && submitted.trim().length > 0 ? roastPrompt(submitted) : null),
    [submitted],
  );

  function onRoast() {
    if (draft.trim().length === 0) return;
    setSubmitted(draft);
  }

  function reset() {
    setDraft("");
    setSubmitted(null);
  }

  function loadExample(prompt: string) {
    setDraft(prompt);
    setSubmitted(null);
  }

  function shareToX() {
    if (!report) return;
    const text = encodeURIComponent(buildShareText(report));
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-10">
      <label htmlFor="roast-input" className="t-mono-meta">
        your prompt
      </label>
      <textarea
        id="roast-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value.slice(0, MAX_PROMPT_CHARS))}
        placeholder="paste a prompt. anything you've been sending claude, cursor, chatgpt, or gemini."
        rows={6}
        spellCheck={false}
        maxLength={MAX_PROMPT_CHARS}
        aria-describedby="roast-input-counter"
        className="mt-2 w-full resize-y rounded-md border border-ink-700 bg-ink-950 px-4 py-3 font-mono text-sm leading-relaxed text-ink-100 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/40"
      />
      <div
        id="roast-input-counter"
        className="mt-1 text-right font-mono text-[10px] text-ink-500"
      >
        {draft.length.toLocaleString()} / {MAX_PROMPT_CHARS.toLocaleString()} chars
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {ROAST_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => loadExample(ex.prompt)}
              className="rounded-full border border-ink-700 bg-ink-900 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-300 transition-colors hover:border-green-500/60 hover:text-green-300"
            >
              try · {ex.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {submitted !== null && (
            <button
              type="button"
              onClick={reset}
              className="dojo-btn-tertiary inline-flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              reset
            </button>
          )}
          <button
            type="button"
            onClick={onRoast}
            disabled={draft.trim().length === 0}
            className="dojo-btn-primary inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            roast it
          </button>
        </div>
      </div>

      {report && (
        <div className="mt-10">
          <div className="dojo-card-highlight">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <div className="t-mono-meta">verdict</div>
                <p className="t-h2 mt-2 text-ink-100">{report.verdict}</p>
              </div>
              <div className="text-right">
                <div className="t-mono-meta">score</div>
                <div className={`mt-1 font-mono text-5xl font-medium leading-none ${scoreColor(report.score)}`}>
                  {report.score}
                  <span className="text-xl text-ink-500">/100</span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={shareToX}
                className="dojo-btn-secondary inline-flex items-center gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden />
                share the roast on x
              </button>
            </div>
          </div>

          {report.hits.length > 0 && (
            <section aria-labelledby="hits-heading" className="mt-8">
              <h2 id="hits-heading" className="t-eyebrow">
                {report.hits.length} hit{report.hits.length === 1 ? "" : "s"}
              </h2>
              <ul className="mt-3 grid gap-3">
                {report.hits.map((hit) => (
                  <li key={hit.id} className="dojo-card">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] font-medium text-ink-100">
                        {hit.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide ring-1 ${SEVERITY_STYLE[hit.severity]}`}
                      >
                        {SEVERITY_LABEL[hit.severity]}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[12px] text-ink-400">
                      evidence · {hit.evidence}
                    </p>
                    <p className="mt-3 text-[13px] text-ink-300">
                      <span className="text-ink-500">fix · </span>
                      {hit.fix}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {report.wins.length > 0 && (
            <section aria-labelledby="wins-heading" className="mt-8">
              <h2 id="wins-heading" className="t-eyebrow">
                what you did right
              </h2>
              <ul className="mt-3 grid gap-1.5 text-[13px] text-ink-300">
                {report.wins.map((w) => (
                  <li key={w} className="flex items-center gap-2">
                    <span aria-hidden className="text-green-400">✓</span>
                    {w}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {report.hits.length === 0 && (
            <div className="mt-8 dojo-card">
              <h3 className="text-[15px] font-medium text-ink-100">
                no hits. this is a tight prompt.
              </h3>
              <p className="mt-2 text-[13px] text-ink-300">
                this rule set is heuristic — it catches the patterns that
                trip cursor and claude most often, not every possible flaw.
                if the model still replies with vibes after a clean roast,
                the bug is probably in the context (chapter 22) or the
                eval gap (chapter 21), not the prompt.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
