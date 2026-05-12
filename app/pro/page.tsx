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
import JsonLd, { SITE_URL } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "early access · the python school for the ai era — promptdojo",
  description:
    "the web is launching now. the app comes after. join early access for the app drop, or lock in the $129 founders lifetime rate before iOS ships. 31 chapters, pyodide ide, ai tutor, cloud sync.",
  alternates: { canonical: "/pro" },
  openGraph: {
    type: "article",
    title: "promptdojo pro — the python school in the app",
    description:
      "the web preview stays free forever. the full school ships in the native app at $9.99/mo, $59/yr, or $129 founders lifetime.",
    url: "/pro",
    siteName: "promptdojo",
    images: [{ url: "/og/launch/price", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "promptdojo pro — early access",
    description:
      "free web preview forever. paid native app at $9.99/mo, $59/yr, or $129 founders lifetime.",
    creator: "@TFisPython",
    images: ["/og/launch/price"],
  },
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

// FAQPage schema is the highest-yield AEO pattern for yes/no pricing intent
// ("is promptdojo free?", "do i need an account?"). Answers are short and
// direct so AI engines extract them cleanly. Per launch-week SEO audit
// 2026-05-11.
const FAQ_ITEMS = [
  {
    q: "is promptdojo free?",
    a: "the web preview is free forever. three chapters, runs in your browser via pyodide, no signup. the full 26-chapter school ships in the native app at $9.99/mo, $59/yr, or $129 founders lifetime.",
  },
  {
    q: "do i need to sign up to use the free preview?",
    a: "no. the web preview requires no account. open the page, run the code. signup is only needed if you want progress to sync across devices, which is a pro feature.",
  },
  {
    q: "do i need to install python?",
    a: "no. every lesson runs in your browser via pyodide. no python install, no virtualenv, no anaconda. mobile and desktop both work.",
  },
  {
    q: "is there a paid tier?",
    a: "yes — the native app. $9.99/mo, $59/yr (41% off monthly), or $129 founders lifetime (first 100 only). the web preview remains free forever for the first three chapters.",
  },
  {
    q: "what do i get for $129 founders?",
    a: "lifetime access to every chapter promptdojo ever ships, in the native app. no renewal. first 100 reservations only, then the price moves to $199.",
  },
  {
    q: "who is this for?",
    a: "people who use cursor, claude code, copilot, or windsurf every day and need to read what the ai writes, catch the bugs ai introduces, and direct the ai deliberately. pms, marketers, ops folks, and beginners who already build with ai assistance.",
  },
  {
    q: "when does the native app ship?",
    a: "when the waitlist clears 1,000. join the waitlist on this page for the launch ping and a founders code.",
  },
];

const PRODUCT_SCHEMA = {
  "@type": "Product",
  "@id": `${SITE_URL}/pro/#product`,
  name: "promptdojo — the python school for the ai era",
  description:
    "31 chapters, 800+ runnable steps. read what ai wrote, catch what it got wrong, direct it deliberately. pyodide ide, ai tutor, cloud sync. free web preview, paid native app.",
  url: `${SITE_URL}/pro/`,
  brand: { "@id": `${SITE_URL}/#org` },
  offers: [
    {
      "@type": "Offer",
      name: "monthly",
      price: "9.99",
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
      url: `${SITE_URL}/pro/`,
    },
    {
      "@type": "Offer",
      name: "yearly",
      price: "59.00",
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
      url: `${SITE_URL}/pro/`,
    },
    {
      "@type": "Offer",
      name: "founders lifetime",
      price: "129.00",
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
      url: `${SITE_URL}/pro/`,
      description: "lifetime, first 100 only, then $199",
    },
  ],
};

const FAQ_SCHEMA = {
  "@type": "FAQPage",
  "@id": `${SITE_URL}/pro/#faq`,
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const BREADCRUMB_SCHEMA = {
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "early access", item: `${SITE_URL}/pro/` },
  ],
};

export default function ProPage() {
  return (
    <main
      id="main"
      className="mx-auto max-w-5xl px-6 pt-20 pb-12 sm:pt-24 sm:pb-16"
    >
      <JsonLd data={[PRODUCT_SCHEMA, FAQ_SCHEMA, BREADCRUMB_SCHEMA]} />

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
          app — 31 chapters, pyodide on your phone, ai tutor —{" "}
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

      {/* ───────── 5b. FAQ — paired with FAQPage schema ─────────── */}
      <section className="pb-16">
        <div className="t-eyebrow mb-3">questions people actually ask</div>
        <h2 className="t-section">
          the short answers. <em className="t-emph">no fluff.</em>
        </h2>
        <dl className="mt-10 space-y-8 max-w-2xl">
          {FAQ_ITEMS.map((f) => (
            <div key={f.q}>
              <dt className="t-h3">{f.q}</dt>
              <dd className="t-body-sm mt-2">{f.a}</dd>
            </div>
          ))}
        </dl>
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
