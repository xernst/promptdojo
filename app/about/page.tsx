import Link from "next/link";
import type { Metadata } from "next";
import Wordmark from "@/components/Wordmark";
import StatStrip from "@/components/StatStrip";
import { PHASES } from "@/lib/curriculum/phases";
import { formatDateShort, githubStats } from "@/lib/github-stats";

export const metadata: Metadata = {
  title: "what is promptdojo? — about the project",
  description:
    "promptdojo is a free, open-source python school for builders in the ai era. read what it is, why it exists, what's inside, and how it works.",
};

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
  ["sign up, lose streak, pay $19/mo", "no signup, no streak shame, $0 forever"],
];

const faqs = [
  {
    q: "do i need python experience?",
    a: "no. chapter 01 starts at variables. if you've used cursor or claude to write code, you know enough to begin.",
  },
  {
    q: "is it really free?",
    a: "yes. no paid tier, no premium content. the only money this site costs me is the domain.",
  },
  {
    q: "do i have to log in?",
    a: "no. progress saves to your browser. login only syncs across devices — same email anywhere else, same dojo. no list, no upsell.",
  },
  {
    q: "how long does it take?",
    a: "624 steps. most steps are 30 seconds. realistically: 8–15 hours total spread over a few weeks.",
  },
  {
    q: "what if i find a bug?",
    a: "open an issue or a pr at github.com/xernst/promptdojo. or dm me on x.",
  },
  {
    q: "why isn't it on udemy / coursera / boot.dev?",
    a: "because i wanted it to look how i wanted, run in the browser, and never gate-keep behind a streak.",
  },
  {
    q: "how often is it updated?",
    a: "commits land most weeks. content gets revised when models change shape — the agent-loop chapter looks different in 2026 than it did in 2025. follow the build at @TFisPython.",
  },
];

export default function AboutPage() {
  return (
    <main id="main" className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
      {/* ───────── 1. HERO ─────────────────────────────────────── */}
      <section className="border-b border-ink-800 pb-16">
        <div className="mb-6 inline-flex items-center gap-2 t-eyebrow">
          <span>❯</span>
          <span>what is this?</span>
        </div>
        <h1 className="t-hero">
          a python school built for the version of you that lives in cursor.
        </h1>
        <p className="t-body mt-8 max-w-2xl">
          promptdojo teaches you the python you need to direct ai agents, read
          what they wrote, and catch what they got wrong.{" "}
          <em className="italic text-ink-100">it&apos;s not a syntax course.</em>{" "}
          it&apos;s a school for the new job: editing the model.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/learn/v2/variables" className="dojo-btn-primary">
            start the course →
          </Link>
          <Link href="/" className="dojo-btn-secondary">
            back to home
          </Link>
        </div>
        <StatStrip className="mt-10" />
      </section>

      {/* ───────── 2. THE WEDGE ─────────────────────────────────── */}
      <section className="border-b border-ink-800 py-16">
        <div className="t-eyebrow mb-3">the wedge</div>
        <h2 className="t-section">
          every course teaches you what python{" "}
          <em className="italic text-green-400">is</em>.
          <br />
          you need to know what it{" "}
          <em className="italic text-green-400">isn&apos;t</em>.
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
      <section className="border-b border-ink-800 py-16">
        <div className="t-eyebrow mb-3">the curriculum</div>
        <h2 className="t-section">
          25 chapters. 624 interactive steps. zero install.
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
      <section className="border-b border-ink-800 py-16">
        <div className="t-eyebrow mb-3">the loop</div>
        <h2 className="t-section">read. run. fix. repeat 624 times.</h2>
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
      <section className="border-b border-ink-800 py-16">
        <div className="t-eyebrow mb-3">why this, not codecademy</div>
        <h2 className="t-section">
          the old way assumes you&apos;ll write the code.
          <br />
          you won&apos;t.
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
      <section className="border-b border-ink-800 py-16">
        <div className="t-eyebrow mb-3">who built it</div>
        <div className="font-display text-lg leading-relaxed text-ink-300">
          {/* TODO(josh): replace credential sentence with your final shape —
              one role + one tool stack + one frequency word, lowercase. */}
          <p>
            i&apos;m josh. i ship python alongside cursor and claude every
            day for client work. i wrote this because i wanted to learn
            python the way i actually use python — alongside an llm, fixing
            what it got wrong, not memorizing what it already knows. every
            other course felt like a museum tour. this one is the workshop
            floor.
          </p>
          <p className="mt-4">
            built solo. open source. free forever. follow the build at{" "}
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

      {/* ───────── 7. FREE FOREVER ──────────────────────────────── */}
      <section className="border-b border-ink-800 py-16">
        <div className="t-eyebrow mb-3">free forever</div>
        <h2 className="t-section">$0. open source. no upsell. ever.</h2>
        <p className="t-body mt-6 max-w-2xl">
          there is no paid tier. no premium chapters. no certificate-store.
          login is optional and only saves your progress across devices —
          it doesn&apos;t unlock anything. the source is on github. fork it.
          break it. open a pr.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
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
      <section className="border-b border-ink-800 py-16">
        <div className="t-eyebrow mb-3">faq</div>
        <h2 className="t-section">quick answers.</h2>
        <dl className="mt-8 space-y-6">
          {faqs.map((f) => (
            <div key={f.q} className="border-l-2 border-ink-800 pl-5">
              <dt className="font-display text-lg font-bold text-ink-100">
                {f.q}
              </dt>
              <dd className="mt-2 font-display leading-snug text-ink-300">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ───────── 9. CTA + FOOTER ──────────────────────────────── */}
      <section className="py-16">
        <h2 className="t-section">stop reading. start fixing.</h2>
        <p className="t-body mt-4 max-w-xl">
          chapter 01 is variables. chapter 25 is a working cli agent. the only
          step that matters is the next one.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/learn/v2/variables" className="dojo-btn-primary">
            start the course →
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
