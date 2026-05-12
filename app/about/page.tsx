import Link from "next/link";
import type { Metadata } from "next";
import Wordmark from "@/components/Wordmark";
import StatStrip from "@/components/StatStrip";
import { PHASES } from "@/lib/curriculum/phases";
import { formatDateShort, githubStats } from "@/lib/github-stats";
import { getV2Toc } from "@/lib/content-v2";

// Dynamic metadata + body counts. Per UI audit (2026-05-07): the about page
// previously lied "25 chapters, 624 steps" while home derives from getV2Toc.
// Counts now flow from a single source.
export async function generateMetadata(): Promise<Metadata> {
  const toc = getV2Toc();
  const chapters = toc.chapters.length;
  const steps = toc.chapters.reduce((a, c) => a + c.stepCount, 0);
  return {
    title: "what is promptdojo? — about the project",
    description: `promptdojo is the python school for the ai era. the web is the preview. the app is the school. ${chapters} chapters, ${steps} runnable steps, free preview on the web.`,
  };
}

const wedgeColumns = [
  {
    k: "the old job",
    v: "memorize syntax, write loops by hand, build a calculator from scratch.",
  },
  {
    k: "the new job",
    v: "read what the model wrote, find where it lied, ship the fix in five lines.",
  },
  {
    k: "the gap",
    v: "you can vibe-code a hundred features without learning python. then one bug ships and you can't read the traceback.",
  },
];

const steps = [
  {
    n: "01",
    t: "read",
    c: "every step shows you a small piece of code or concept. plain english explanation, no walls of theory.",
  },
  {
    n: "02",
    t: "run",
    c: "python runs in your browser via pyodide. no install, no venv. the editor is right there. click run.",
  },
  {
    n: "03",
    t: "fix",
    c: "most steps end with a buggy snippet. you fix it. you run it. you move on. you never write a fizzbuzz.",
  },
];

const comparison: Array<[string, string]> = [
  ["watch a video", "read 100 words and run code"],
  [
    "write fizzbuzz from scratch",
    "fix the model's broken fizzbuzz in three lines",
  ],
  [
    "learn syntax for two weeks",
    "learn the syntax you trip on, ignore the rest",
  ],
  ["hello-world your way to a job", "ship a cli agent by chapter 25"],
  ["sign up, lose streak, pay $19/mo", "free preview on the web, the school lives in the app"],
];

const faqs = [
  {
    q: "is the web preview really free?",
    a: "yes. three full chapters, no signup, no time limit. about 30 minutes of content. it's a preview, not a trial — it doesn't expire.",
  },
  {
    q: "what does the app cost?",
    a: "$9.99/mo, $59/yr, or $129 lifetime for the first 100 buyers. then lifetime jumps to $199. apple and google take 15-30% of every sale. the rest funds the build.",
  },
  {
    q: "why isn't it on udemy / coursera / boot.dev?",
    a: "because i wanted it to look how i wanted, run in the browser, and never gate-keep behind a streak.",
  },
  {
    q: "do i need python experience?",
    a: "no. chapter 01 starts at variables. if you've used cursor or claude to write code, you know enough to begin.",
  },
  {
    q: "do i have to log in?",
    a: "no. progress saves to your browser. login only syncs across devices — same email anywhere else, same dojo. no list, no upsell.",
  },
  {
    q: "how long does it take?",
    a: "most steps are 30 seconds. realistically: 8–15 hours total spread over a few weeks.",
  },
  {
    q: "how often is it updated?",
    a: "commits land most weeks. content gets revised when models change shape — the agent-loop chapter looks different in 2026 than it did in 2025. follow the build at @TFisPython.",
  },
  {
    q: "what if i find a bug?",
    a: "open an issue or a pr at github.com/xernst/promptdojo. or dm me on x.",
  },
];

export default async function AboutPage() {
  const toc = getV2Toc();
  const chapterCount = toc.chapters.length;
  const totalSteps = toc.chapters.reduce((a, c) => a + c.stepCount, 0);
  return (
    <main id="main" className="mx-auto max-w-4xl px-6 pt-20 pb-12 sm:pt-24 sm:pb-16">
      {/* ───────── 1. HERO ─────────────────────────────────────── */}
      <section className="pb-16">
        <div className="mb-6 inline-flex items-center gap-2 t-eyebrow">
          <span>❯</span>
          <span>what is this?</span>
        </div>
        <h1 className="t-hero">
          you live in cursor now. <em className="t-emph">read what it wrote.</em>
        </h1>
        <p className="t-body mt-8 max-w-2xl">
          promptdojo is the python school for the new job — directing ai
          agents, reading what they wrote, catching what they got wrong.{" "}
          <em className="italic text-ink-100">it&apos;s not a syntax course.</em>{" "}
          it&apos;s a school for editing the model.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/learn/v2/variables" className="dojo-btn-primary">
            start chapter 1 →
          </Link>
          <Link href="/" className="dojo-btn-secondary">
            ← home
          </Link>
        </div>
        <StatStrip className="mt-10" />
      </section>

      {/* ───────── 2. THE WEDGE ─────────────────────────────────── */}
      <section className="py-16">
        <div className="t-eyebrow mb-3">the wedge</div>
        <h2 className="t-section">
          every course teaches you what python{" "}
          <em className="t-emph">is</em>.
          <br />
          you need to know what it{" "}
          <em className="t-emph">isn&apos;t</em>.
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {wedgeColumns.map((c) => (
            <div key={c.k} className="border border-ink-800 bg-ink-900 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-400">
                {c.k}
              </div>
              <p className="mt-2 font-display text-base leading-snug text-ink-200">
                {c.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── 3. WHAT'S INSIDE ─────────────────────────────── */}
      <section className="py-16">
        <div className="t-eyebrow mb-3">the curriculum</div>
        <h2 className="t-section">
          {chapterCount} chapters. {totalSteps} <em className="t-emph">runnable</em> steps. zero install.
        </h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PHASES.map((p) => (
            <div key={p.number} className="border border-ink-800 bg-ink-900 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="t-eyebrow">
                  phase {String(p.number).padStart(2, "0")}
                </div>
                <div className="t-mono-meta">{p.range}</div>
              </div>
              <h3 className="t-h2 mt-1">{p.name}</h3>
              <p className="t-body-sm mt-2">{p.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── 4. HOW IT WORKS ──────────────────────────────── */}
      <section className="py-16">
        <div className="t-eyebrow mb-3">the loop</div>
        <h2 className="t-section">
          <em className="t-emph">read</em>. <em className="t-emph">run</em>. <em className="t-emph">fix</em>. repeat {totalSteps} times.
        </h2>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {steps.map((c) => (
            <div key={c.n} className="border border-ink-800 bg-ink-900 p-5">
              <div className="font-mono text-[11px] tracking-wider text-ink-500">
                {c.n}
              </div>
              <h3 className="mt-1 font-display text-2xl font-black tracking-[-0.02em] text-ink-100">
                {c.t}
              </h3>
              <p className="mt-3 font-display text-sm leading-snug text-ink-300">
                {c.c}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── 5. NOT CODECADEMY ────────────────────────────── */}
      <section className="py-16">
        <div className="t-eyebrow mb-3">why this, not codecademy</div>
        <h2 className="t-section">
          the old way assumes you&apos;ll <em className="t-emph">write</em> the code.
          <br />
          you <em className="t-emph">won&apos;t</em>.
        </h2>
        <div className="mt-8 overflow-hidden border border-ink-800">
          <table className="w-full border-collapse font-display text-sm">
            <thead>
              <tr className="border-b border-ink-800 bg-ink-900 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-400">
                <th className="p-4 text-left font-bold">old way</th>
                <th className="p-4 text-left font-bold text-green-400">
                  promptdojo
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(([a, b], i) => (
                <tr
                  key={a}
                  className={
                    "border-b border-ink-800 " +
                    (i % 2 ? "bg-ink-950" : "bg-ink-900")
                  }
                >
                  <td className="p-4 text-ink-500">{a}</td>
                  <td className="p-4 text-ink-100">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ───────── 6. WHO BUILT IT ──────────────────────────────── */}
      <section className="py-16">
        <div className="t-eyebrow mb-3">who built it</div>
        <div className="font-display text-lg leading-relaxed text-ink-300">
          <p>
            i&apos;m josh. ai consultant. i ship python with cursor and claude
            every day for client work. i wrote this because every other course
            felt like a museum tour and i wanted the workshop floor.
          </p>
          <p className="mt-4">
            i ship to this site weekly. follow the build at{" "}
            <a
              href="https://x.com/TFisPython"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 underline underline-offset-2 hover:text-green-300"
            >
              @TFisPython
            </a>
            .
          </p>
        </div>
      </section>

      {/* ───────── 7. THE PIVOT ─────────────────────────────────── */}
      <section className="py-16">
        <div className="t-eyebrow mb-3">why a paid app?</div>
        <h2 className="t-section">
          the web is the <em className="t-emph">preview</em>. the app is the{" "}
          <em className="t-emph">school</em>.
        </h2>

        <p className="t-body mt-8 max-w-2xl text-ink-300">
          honest update: this site used to promise &ldquo;free forever, no
          paid tier, ever.&rdquo; the web preview part stays true forever.
          but the native app is coming after, and that one costs money.{" "}
          <em className="italic text-ink-100">
            i&apos;d rather tell you the trade than hide it.
          </em>
        </p>
        <p className="t-body mt-4 max-w-2xl text-ink-400">
          the web launches now. the app drops once enough of you are in. you
          can{" "}
          <Link href="/pro" className="text-green-400 underline underline-offset-2 hover:text-green-300">
            join early access
          </Link>
          {" "}to lock in the founders rate before iOS ships.
        </p>

        <div className="mt-10 space-y-6 font-display text-lg leading-relaxed text-ink-300">
          <div>
            <div className="t-eyebrow mb-2">why now</div>
            <p>
              i&apos;m one person. i ship to this site weekly between client
              work and i can&apos;t keep doing that on weekends alone.
              charging for the app pays for the next chapter, the next
              revision, the ai tutor compute. no charge, no school.
            </p>
          </div>

          <div>
            <div className="t-eyebrow mb-2">why a paid tier</div>
            <p>
              apple and google take 15-30% of every sale. the ai tutor calls
              claude on every failed attempt and that&apos;s metered tokens.
              the apple developer fee is $99/yr just to exist on the store.
              this isn&apos;t a business — it&apos;s a school that has to
              cover its own bill.
            </p>
          </div>

          <div>
            <div className="t-eyebrow mb-2">what stays free</div>
            <p>
              the web preview: three full chapters — variables, llm apis,
              agent loops. read every step, no signup, no time limit. about
              30 minutes of content. enough to know if the school is for you
              before you pay for it.{" "}
              <em className="italic text-ink-100">
                the preview is the preview, not a trial. it doesn&apos;t
                expire.
              </em>
            </p>
          </div>
        </div>

        <p className="t-body mt-10 max-w-2xl">
          the app: 31 chapters, the full python ide, ai tutor on every
          failed attempt, cloud sync, offline mode.{" "}
          <span className="text-green-400">
            $9.99/mo · $59/yr · $129 lifetime (first 100 buyers).
          </span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/pro" className="dojo-btn-primary">
            see pricing →
          </Link>
          <a
            href="https://github.com/xernst/promptdojo"
            target="_blank"
            rel="noopener noreferrer"
            className="dojo-btn-secondary"
          >
            github →
          </a>
          <a
            href="https://x.com/TFisPython"
            target="_blank"
            rel="noopener noreferrer"
            className="dojo-btn-secondary"
          >
            @TFisPython on x →
          </a>
        </div>
      </section>

      {/* ───────── 8. FAQ ───────────────────────────────────────── */}
      <section className="py-16">
        <div className="t-eyebrow mb-3">faq</div>
        <h2 className="t-section">quick <em className="t-emph">answers</em>.</h2>
        <p className="t-mono-meta mt-3">last revised 2026-05-06</p>
        <div className="mt-8 divide-y divide-ink-800 border-y border-ink-800">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-baseline gap-3">
                <span className="font-mono text-green-500 transition group-open:rotate-90">
                  ❯
                </span>
                <h3 className="t-h3 font-display">{f.q}</h3>
              </summary>
              <div className="mt-3 pl-6 t-body-sm">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ───────── 9. CTA + FOOTER ──────────────────────────────── */}
      <section className="py-16">
        <h2 className="t-section">stop reading. start <em className="t-emph">fixing</em>.</h2>
        <p className="t-body mt-4 max-w-xl">
          chapter 01 is variables. chapter 25 is a working cli agent. the only
          step that matters is the next one.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/learn/v2/variables" className="dojo-btn-primary">
            start chapter 1 →
          </Link>
          <Link href="/" className="dojo-btn-tertiary">
            ← home
          </Link>
        </div>

        <footer className="mt-16 flex flex-wrap items-baseline justify-between gap-4 border-t border-ink-800 pt-6 font-mono text-[11px] tracking-wider text-ink-500">
          <Wordmark />
          <div className="flex flex-wrap items-baseline gap-3">
            <span>github.com/xernst/promptdojo · x.com/TFisPython</span>
            {(() => {
              const lc = formatDateShort(githubStats.lastCommitISO);
              return lc ? <span>· last commit {lc}</span> : null;
            })()}
            <Link href="/changelog" className="hover:text-green-400">
              · changelog
            </Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
