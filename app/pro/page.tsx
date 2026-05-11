// /pro — early access page. the school is launching on the web; the
// native app comes after we have a customer base. this page sets the
// pricing anchor (so the eventual app store price isn't a surprise),
// captures email for the waitlist, and offers a founders pre-order
// signup that locks in the $129 lifetime rate before iOS ships.
//
// no live IAP wiring yet — buttons funnel into the email waitlist.
// when the app ships, the same /pro page flips to in-app purchase
// CTAs and Stripe checkout for web users (one-time founders payment
// goes through Stripe on the web; recurring goes through IAP in app).

import Link from "next/link";
import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import EmailSignup from "@/components/EmailSignup";

export const metadata: Metadata = {
  title: "early access · the python school for the ai era — promptdojo",
  description:
    "the web is launching now. the app comes after. join early access for the app drop, or lock in the $129 founders lifetime rate before iOS ships. 26 chapters, pyodide ide, ai tutor, cloud sync.",
  alternates: { canonical: "/pro" },
};

const FOUNDERS_CLAIMED = 0; // counts climb once founders form ships
const FOUNDERS_TOTAL = 100;

type Tier = {
  id: "monthly" | "yearly" | "founders";
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  cta: string;
  loud: boolean;
  highlight?: string;
};

const tiers: Tier[] = [
  {
    id: "monthly",
    name: "monthly",
    price: "$9.99",
    cadence: "/ mo",
    blurb: "try the whole school. cancel any month.",
    cta: "notify me at launch",
    loud: false,
  },
  {
    id: "yearly",
    name: "yearly",
    price: "$59",
    cadence: "/ yr",
    blurb: "$4.91/mo equivalent. 41% off monthly. the default tier.",
    cta: "notify me at launch",
    loud: true,
    highlight: "best value",
  },
  {
    id: "founders",
    name: "founders",
    price: "$129",
    cadence: "once",
    blurb: "lifetime. no renewal. first 100 only — then $199.",
    cta: "reserve a founders spot",
    loud: false,
    highlight: `${FOUNDERS_CLAIMED} / ${FOUNDERS_TOTAL} reserved`,
  },
];

type Row = {
  feature: string;
  free: boolean | string;
  pro: boolean | string;
};

const featureRows: Row[] = [
  { feature: "chapters", free: "3 free", pro: "26 pro" },
  { feature: "pyodide ide on phone", free: false, pro: true },
  { feature: "ai tutor on 2nd failure", free: false, pro: true },
  { feature: "cloud sync across devices", free: false, pro: true },
  { feature: "offline mode", free: false, pro: true },
];

function Cell({ v }: { v: boolean | string }) {
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
  return <span className="t-body-sm text-ink-200">{v}</span>;
}

export default function ProPage() {
  return (
    <main
      id="main"
      className="mx-auto max-w-5xl px-6 pt-20 pb-12 sm:pt-24 sm:pb-16"
    >
      {/* ───────── 1. HERO ─────────────────────────────────────── */}
      <section className="pb-12">
        <div className="mb-6 inline-flex items-center gap-2 t-eyebrow">
          <span>❯</span>
          <span>early access</span>
        </div>
        <h1 className="t-hero">
          the app is <em className="t-emph">coming.</em>
        </h1>
        <p className="t-body mt-8 max-w-2xl">
          the web launches now — three chapters, free, no signup. the native
          app — 26 chapters, pyodide on your phone, ai tutor —{" "}
          <em className="italic text-ink-100">ships when there are enough of you to ship for.</em>
        </p>
        <p className="t-body-sm mt-4 max-w-2xl">
          drop your email. you&apos;ll get the build updates, the launch ping,
          and a founders code if you reserve a spot below.
        </p>
      </section>

      {/* ───────── 2. EMAIL WAITLIST ──────────────────────────── */}
      <section id="waitlist" className="pb-16 scroll-mt-20">
        <EmailSignup />
      </section>

      {/* ───────── 3. PRICING TILES (anchored, not live) ──────── */}
      <section className="pb-16">
        <div className="t-eyebrow mb-3">launch pricing</div>
        <h2 className="t-section">
          what it&apos;ll cost in the app. <em className="t-emph">pick early.</em>
        </h2>
        <p className="t-body-sm mt-4 max-w-2xl">
          web preview stays free forever — every visitor reads three chapters
          with no signup. the prices below are what the app charges once it
          ships.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => {
            const isLoud = t.loud;
            const cardClass = isLoud
              ? "dojo-card-highlight flex flex-col"
              : "dojo-card flex flex-col";
            return (
              <div key={t.id} className={cardClass}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="t-eyebrow">{t.name}</div>
                  {t.highlight ? (
                    <div
                      className={
                        "t-mono-meta " +
                        (isLoud ? "text-green-400" : "text-ink-400")
                      }
                    >
                      {t.highlight}
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-black tracking-[-0.03em] text-ink-100">
                    {t.price}
                  </span>
                  <span className="t-mono-meta">{t.cadence}</span>
                </div>

                <p className="t-body-sm mt-4">{t.blurb}</p>

                <div className="mt-6">
                  <a
                    href="#waitlist"
                    className={
                      isLoud
                        ? "dojo-btn-primary w-full inline-flex items-center justify-center"
                        : "dojo-btn-secondary w-full inline-flex items-center justify-center"
                    }
                  >
                    {t.cta} <span aria-hidden className="ml-1">↑</span>
                  </a>
                </div>

                {t.id === "founders" ? (
                  <div className="mt-4 t-mono-meta">
                    locked-in. no subscription. all future chapters included.
                  </div>
                ) : (
                  <div className="mt-4 t-mono-meta">
                    auto-renews until canceled. cancel anytime in settings.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────── 4. FEATURE COMPARISON ───────────────────────── */}
      <section className="pb-16">
        <div className="t-eyebrow mb-3">what you get</div>
        <h2 className="t-section">
          free preview <em className="t-emph">vs</em> pro.
        </h2>

        <div className="mt-8 overflow-hidden border border-ink-800">
          <table className="w-full border-collapse font-display text-sm">
            <thead>
              <tr className="border-b border-ink-800 bg-ink-900 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-400">
                <th className="p-4 text-left font-bold">feature</th>
                <th className="p-4 text-left font-bold">free preview</th>
                <th className="p-4 text-left font-bold text-green-400">pro (in the app)</th>
              </tr>
            </thead>
            <tbody>
              {featureRows.map((r, i) => (
                <tr
                  key={r.feature}
                  className={
                    "border-b border-ink-800 " +
                    (i % 2 ? "bg-ink-950" : "bg-ink-900")
                  }
                >
                  <td className="p-4 text-ink-200">{r.feature}</td>
                  <td className="p-4">
                    <Cell v={r.free} />
                  </td>
                  <td className="p-4">
                    <Cell v={r.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ───────── 5. WHEN'S IT COMING? ─────────────────────────── */}
      <section className="pb-16">
        <div className="t-eyebrow mb-3">when&apos;s it coming</div>
        <h2 className="t-section">
          rough timeline. <em className="t-emph">honest.</em>
        </h2>
        <ul className="mt-8 space-y-4 t-body-sm max-w-2xl">
          <li>
            <span className="font-bold text-green-400">now</span> — web launches.
            three free chapters. read every step. no signup, no streak shame.
          </li>
          <li>
            <span className="font-bold text-green-400">+ 4 weeks</span> — testflight
            beta for early-access subscribers. you get a slot if you signed up above.
          </li>
          <li>
            <span className="font-bold text-green-400">+ 8 weeks</span> — app store
            + play store launch. founders pricing closes at 100 spots. then $199 lifetime.
          </li>
        </ul>
        <p className="t-mono-meta mt-6 max-w-2xl">
          these are best-guesses. the launch slips if i find a bug worth
          fixing first. you&apos;ll get an email either way.
        </p>
      </section>

      {/* ───────── 6. FINE PRINT ───────────────────────────────── */}
      <section className="pb-16">
        <div className="t-eyebrow mb-3">fine print</div>
        <ul className="mt-6 space-y-3 t-body-sm max-w-2xl">
          <li>
            joining the waitlist is free. no charge today. no auto-enrollment
            in anything paid.
          </li>
          <li>
            founders is a one-time charge (taken at app launch, not now). no
            subscription. all future chapters included for life. first 100
            buyers only — then $199.
          </li>
          <li>
            monthly and yearly will be apple in-app purchase + google play
            billing. cancel anytime in your device settings.
          </li>
          <li>
            data handling is in the{" "}
            <Link
              href="/privacy"
              className="text-green-400 underline underline-offset-2 hover:text-green-300"
            >
              privacy policy
            </Link>
            . subscription terms are in the{" "}
            <Link
              href="/terms"
              className="text-green-400 underline underline-offset-2 hover:text-green-300"
            >
              terms
            </Link>
            .
          </li>
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/" className="dojo-btn-tertiary">
            ← home
          </Link>
          <Link href="/about" className="dojo-btn-tertiary">
            about →
          </Link>
        </div>
      </section>
    </main>
  );
}
