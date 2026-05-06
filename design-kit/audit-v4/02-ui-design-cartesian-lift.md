# UI Design V4 — Cartesian-Inspired Visual Moves

**Auditor:** UI Designer (V4)
**Source:** `design-kit/audit-v4/01-cartesian-walkthrough.md` (Cartesian.app deep walkthrough, 21 screenshots)
**Live target:** https://promptdojo.pages.dev
**Date:** 2026-05-06

---

## The translation thesis (1 sentence)

**Cartesian is a letterpress textbook in cream + coral; promptdojo is a terminal in warm-dark + green — so we lift Cartesian's *structural confidence* (single-CTA hero, framed visuals, anti-feature litany, hairline-rule lists, accordion TOC, colored-word titles, glass nav pill, fat-numeral stat row, page-rhythm pacing) and translate every coral pill / Abril-serif headline / cream paper bezel into ink-950 / Fraunces-900 / ink-800 hairline so the bones land but the vocabulary stays dojo.**

---

## Per-pattern proposals (top 10)

### 1. Glass nav pill — replace the full-width sticky bar with a floating pill

- **Cartesian source:** `cartesian-nav-1920.png` — fixed `top: 10px`, centered, ~1020×64px, `rgba(255,255,255,0.2) + backdrop-filter: blur(10px)`, `border-radius: 50px`, soft `0 4px 10px rgba(0,0,0,0.1)` shadow. Three elements only: book icon (left), `[FAQs]` (dark-grey pill), `[Purchase]` (coral pill).
- **Promptdojo target:** `components/SiteHeader.tsx:27` — currently `sticky top-0 ... border-b border-ink-800 bg-ink-950/95 backdrop-blur-sm`, full-bleed strip butting against `<main>`. The wrapping `flex flex-wrap items-center justify-between gap-2` (`SiteHeader.tsx:28`) wraps to two rows on narrow viewports.
- **Translation:** Cartesian's white-glass-on-cream becomes `bg-ink-950/60 + backdrop-blur(12px) + border border-ink-800`; the 50px pill radius stays at **0px** (sharp corners are kit canon, `audit-v3/02-ui-polish.md:218`); the coral `[Purchase]` becomes the dojo-green `[install]` / `[start →]` primary in `dojo-btn-primary` shape (already 0-radius mono uppercase).
- **Concrete change:**
  - `SiteHeader.tsx:27` — replace outer `<header>` className with:
    ```tsx
    <header className="fixed left-1/2 top-3 z-40 -translate-x-1/2 transform border border-ink-800 bg-ink-950/60 backdrop-blur-md">
      <div className="flex h-11 items-center gap-3 px-3 sm:px-4">
        ...
      </div>
    </header>
    ```
  - Add a constant 11px-padding shim in `app/layout.tsx` so the floating pill doesn't overlap the first element of `<main>` — wrap `{children}` in a `<div className="pt-16">`.
  - On `/learn/v2/*`, **opt out** of floating pill (the IDE shell needs full vertical real estate). Gate via `if (onLesson) return <FlatHeader />` and keep today's flat sticky version for lessons only.
  - Hide secondary pills below `md:` (already wraps); show only `[❯ promptdojo]` + `[start →]` + hamburger.
- **Why it works for promptdojo's positioning:** A floating pill telegraphs "this is a finished product, not a wireframe." Today's sticky header reads as "WordPress theme." Compressing the chrome to a 44px pill also reclaims ~24px of vertical room on every page above the fold — the hero `t-hero` headline finally gets to be the loudest thing.
- **Effort:** **M** — ~3h. Two new components (`FloatingNav.tsx`, `FlatHeader.tsx`), one layout shim, one pathname gate.

---

### 2. Hairline-rule lists — replace `border + bg-ink-900` cards with `border-b border-ink-800` rows on accordion-y surfaces

- **Cartesian source:** `cartesian-stats-row-1920.png` (lower half — 22 chapter accordion) and `cartesian-faqs-1920.png` (9-question accordion). Each row: `+` icon + 16px title + 1px hairline at bottom. **No card. No background. No shadow.** Reads as a textbook index page.
- **Promptdojo target:**
  - `app/about/page.tsx:299-310` — FAQ list is currently `border-l-2 border-ink-800 pl-5` per item (good — already directional), but each item is a `<div>` *block* with a `space-y-6`. There's no shared horizontal rule between rows.
  - `app/curriculum/page.tsx` (via `PhaseBandedRailClient.tsx:108-126`) — when `expanded`, lessons render as a `<ul>` inside each chapter tile, but the chapter tiles themselves are `dojo-card-interactive` (full border + bg-ink-950 + 16px padding). With 25 chapter tiles, the page reads as 25 floating boxes.
- **Translation:** Cartesian's cream-paper rows with grey hairlines become **transparent rows** (no bg) on `bg-ink-950`, separated by `border-b border-ink-800`. Replace the FAQ + (one variant of) the curriculum list with this shape. The accordion `+` glyph becomes a mono `❯` that rotates 90° on open (already proven in the legacy course `<details>` at `app/page.tsx:179`).
- **Concrete change:**
  - **FAQ rebuild** — `app/about/page.tsx:299-310`:
    ```tsx
    <dl className="mt-8 divide-y divide-ink-800 border-y border-ink-800">
      {faqs.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer items-baseline gap-3 list-none">
            <span className="font-mono text-green-500 transition group-open:rotate-90">❯</span>
            <span className="t-h3">{f.q}</span>
          </summary>
          <dd className="mt-3 pl-6 t-body-sm text-ink-300">{f.a}</dd>
        </details>
      ))}
    </dl>
    ```
  - **New `<ChapterAccordionList>` for `/curriculum`** as an *alternate* view (toggle pill `[grid] [list]` at top of page, default `list`) — server component rendering 25 rows with `border-b border-ink-800 py-4` each, mono chapter number + lowercase title + step-count, expandable to lesson list on click. Keep `PhaseBandedRail` grid view as the home-page surface; the new list is canonical for `/curriculum`.
- **Why it works for promptdojo's positioning:** Cards-with-shadows = SaaS landing page. Hairline rows = textbook / docs site. Promptdojo's anti-Coursera posture is *closer to docs than SaaS* — Stripe Docs, Linear's changelog, Vercel guides all use hairline-row lists. This single move shifts the perception from "course product" to "reference work."
- **Effort:** **S** — ~2h FAQ rewrite + ~3h chapter accordion list = ~5h.

---

### 3. Framed visuals — pre-render Cursor / Claude / pyodide screenshots with chrome baked in

- **Cartesian source:** `cartesian-features-1920.png` + every per-feature visual. Cartesian takes screenshots from inside its actual app, mats them on a soft cream bezel with a 1px paper-grey border, exports as PNG/GIF with chrome baked in. `editor.png`, `space_time3.png`, `playback.gif` — none of the chrome is recreated in CSS. The viewer reads "real software window" without the dev needing to build it.
- **Promptdojo target:** `components/HeroBugSnippet.tsx:14-53` — currently `border border-ink-800 bg-ink-900` panel with a hand-coded two-row chrome (`cursor.py` filename label + `ai-generated` eyebrow at `:16-21`, code body at `:22-44`, annotation strip at `:46-52`). The chrome is *good* — it's already mimicking Cursor's tab strip — but it's the only such surface on the site. Three other surfaces have IDE-ish content with no chrome:
  - `app/page.tsx:138-160` — three concept cards ("read what ai wrote / catch what it got wrong / direct it deliberately") — no visual evidence, just `dojo-card` text.
  - `/about` "the loop" 3-step row at `app/about/page.tsx:171-185` — read/run/fix as text-only cards.
  - PriceBand at `components/PriceBand.tsx` — `$0` is huge mono, no chrome.
- **Translation:** Cartesian's cream-bezel-with-baked-chrome becomes a reusable `<Frame>` primitive: 1px `border-ink-800` + `bg-ink-900` + a 28px chrome strip on top with a filename label + eyebrow tag (matching `HeroBugSnippet` `:16-21`). One component, used everywhere a screenshot or code-like artifact appears.
- **Concrete change:**
  - **New primitive** `components/Frame.tsx`:
    ```tsx
    type Props = {
      filename: string;             // e.g. "cursor.py", "claude.md", "stdout"
      eyebrow?: string;             // e.g. "ai-generated", "your fix", "passes"
      children: React.ReactNode;
      tone?: "neutral" | "ok" | "err";  // for left-border color
    };
    export default function Frame({ filename, eyebrow, children, tone = "neutral" }: Props) {
      const leftRail =
        tone === "ok" ? "border-l-2 border-green-500"
        : tone === "err" ? "border-l-2 border-err"
        : "border-l border-ink-800";
      return (
        <figure className={`overflow-hidden border border-ink-800 bg-ink-900 ${leftRail}`}>
          <figcaption className="flex items-center justify-between border-b border-ink-800 px-4 py-2">
            <span className="font-mono text-[11px] text-ink-500">{filename}</span>
            {eyebrow && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                {eyebrow}
              </span>
            )}
          </figcaption>
          <div>{children}</div>
        </figure>
      );
    }
    ```
  - **Refactor `HeroBugSnippet.tsx`** — wrap its current pre-block in `<Frame filename="cursor.py" eyebrow="ai-generated" tone="err">`. Drop ~20 lines of duplicate chrome markup.
  - **Apply to the three home concept cards** (`app/page.tsx:138-160`) — each becomes a `<Frame>` with a fake filename: `read.py` / `bug.py` / `agent.py`. Inside each: 3-line code snippet showing the *idea* in code, not prose. The body text moves below the frame as a caption (`t-body-sm text-ink-400 mt-3`). Now the home page has **four framed evidence panels** instead of one.
  - **Apply to the `/about` "the loop" trio** (`app/about/page.tsx:171-185`) — `read.md` / `run.py` / `fix.py` filenames; 3-line snippet inside each.
- **Why it works for promptdojo's positioning:** The single most under-used asset on promptdojo is **the IDE itself**. Every concept card today is sans-serif prose claiming things the IDE could *show*. Framed visuals turn claims into evidence. Cartesian gets away with claiming "interactive!" because there's a framed playback.gif right there. Promptdojo can do the same with 8-line Python snippets that *are* the proof.
- **Effort:** **M** — ~5h. New `Frame.tsx` primitive (~40 lines), refactor `HeroBugSnippet` (~15 min), populate 6 home-and-about frames with snippet content (~3h of writing 8-line Python micro-stories).

---

### 4. Anti-feature litany — sister "no list" band beneath the $0 band

- **Cartesian source:** `cartesian-buy-once-1920.png` — `Buy Once. Own Forever.` H3 (40px Abril) above six stacked single-line statements: `No Subscriptions. / No In-App purchases. / No Signups. / No Tracking. / No DRM. / Accessible Offline.` Each is `font-weight: 700, color: #666666, ~22px Abril`. **Centered, no bullets, no commas.** Each line a relief. A literal `+` character (NOT `<hr>`) divides this block from `Free Updates for Life.`
- **Promptdojo target:** `components/PriceBand.tsx` already has the `$0` billboard (perfect) but the `no login · no streaks · no upsell · open source` row is **a horizontal mono-meta strip** at `:16-24` — visually a footnote, not a litany. The negation is the most differentiating thing promptdojo says, but it reads as fine-print today.
- **Translation:** Cartesian's vertical anti-litany in centered cream-Abril 22px becomes a vertical anti-litany in centered Fraunces 32-40px (one of the rare uses of the display serif at this mid-size). One statement per line. Eight lines instead of four. Each line full sentence with period. Dojo voice: lowercase + period.
- **Concrete change:**
  - **Refactor `PriceBand.tsx`** — split the strip into a stacked block beneath the `$0`:
    ```tsx
    <section className="my-24 flex min-h-[60vh] flex-col items-center justify-center border-y border-ink-800 py-24 text-center">
      <div className="t-eyebrow tracking-[0.6em]">forever</div>
      <div className="mt-6 font-mono font-black leading-none text-ink-100"
           style={{ fontSize: "clamp(72px, 22vw, 360px)" }}>
        $0
      </div>

      {/* NEW — anti-feature litany. Cartesian's "Buy Once. Own Forever." pattern */}
      <div className="mt-16 flex flex-col items-center gap-4">
        {[
          "no signup.",
          "no streaks.",
          "no email gate.",
          "no certificate store.",
          "no upsell.",
          "no zoom calls.",
          "no tracking.",
          "open source.",       // the one positive — Cartesian inverts the last line too
        ].map((line, i) => (
          <p key={line}
             className={`font-display font-light leading-none ${
               i === 7
                 ? "text-green-500 italic"
                 : "text-ink-400"
             }`}
             style={{ fontSize: "clamp(20px, 2.4vw, 32px)" }}>
            {line}
          </p>
        ))}
      </div>

      {/* Cartesian's "+" divider, not <hr> */}
      <div className="mt-16 font-mono text-2xl text-ink-700" aria-hidden>+</div>

      {/* the one positive promise, mirroring "Free Updates for Life." */}
      <p className="mt-12 font-display text-2xl text-ink-200 italic"
         style={{ fontVariationSettings: "'opsz' 144" }}>
        free forever. updates land most weeks.
      </p>
    </section>
    ```
  - Drop the `t-mono-meta` strip at `PriceBand.tsx:16-24` (replaced by the litany).
- **Why it works for promptdojo's positioning:** This is **the** line of separation between promptdojo and Codecademy / boot.dev / Coursera. Cartesian proves you can spend a viewport-tall band on *what you don't have* and people read it. The `$0` is the meme; the litany is the receipt that the `$0` won't change. Together they're the cleanest single-frame screenshot a reply-bomber can crop.
- **Effort:** **S** — ~1.5h. Pure CSS, one file edit, no new component.

---

### 5. Stat row in display blue — promote `<StatStrip>` from one-line meta to viewport block with fat-numeral display

- **Cartesian source:** `cartesian-stats-row-1920.png` — five large display-serif numbers in `#3B69FF` brilliant blue, `Abril Fatface 56px`. Labels under each are `Abril 20.8px / 400` (smaller serif, *not* sans). Numbers dominate; labels stay tiny. The cool blue against warm cream is the color tension that sells it.
- **Promptdojo target:** `components/StatStrip.tsx:22-43` — currently a single horizontal `flex flex-wrap items-center gap-x-4 gap-y-2 t-mono-meta` strip rendering all 5 stats inline as 11px mono text with `·` separators. It's *information*, not *evidence*. On `app/page.tsx:163` it's `mt-24 mb-12` between concept cards and PriceBand — exactly where Cartesian places its analogous block.
- **Translation:** Cartesian's blue-on-cream becomes **green-500 on ink-950** (cool color tension survives — green against warm-dark plays the same role coral-blue plays against cream). Cartesian's Abril 56px numerals become **Fraunces 900 at clamp(64px, 10vw, 144px)** (the same scale as `t-hero`, optical-size 144 pinned). Cartesian's 20.8px Abril labels become **t-mono-meta** (already 11px mono ink-500 — labels stay quiet).
- **Concrete change:**
  - **New variant `<StatStrip variant="display">`** — keep the inline default; add a display variant for the home page:
    ```tsx
    // components/StatStrip.tsx
    type Props = { className?: string; variant?: "inline" | "display" };

    export default function StatStrip({ className, variant = "inline" }: Props) {
      const stats = [
        { num: "25", label: "chapters" },
        { num: "624", label: "interactive\nsteps" },
        { num: "8–15h", label: "to complete" },
        { num: "$0", label: "forever" },
        { num: "MIT", label: "license" },
      ];
      if (variant === "display") {
        return (
          <div className={cn("grid grid-cols-2 gap-y-10 sm:grid-cols-5 sm:gap-x-8", className)}>
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display font-black text-green-500 tabular-nums leading-none"
                     style={{ fontSize: "clamp(48px, 7vw, 96px)",
                              fontVariationSettings: "'opsz' 144",
                              letterSpacing: "-0.04em" }}>
                  {s.num}
                </div>
                <div className="mt-3 t-mono-meta whitespace-pre-line">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        );
      }
      // existing inline render unchanged ...
    }
    ```
  - `app/page.tsx:163` — `<StatStrip className="mt-24 mb-12" />` → `<StatStrip variant="display" className="mt-24 mb-24" />`.
  - Keep `inline` variant for `/about:118`, `/curriculum:75`, footer — those surfaces don't need viewport.
- **Why it works for promptdojo's positioning:** Promptdojo's claim is *abundance* (624 steps, 25 chapters, 8-15 hours, free, MIT). Today that abundance is *whispered* in 11px mono. Cartesian proves that fat numerals in a display face make abundance felt, not just stated. `624` in Fraunces 900 at 96px does more for "this is a real curriculum" than 200 words of marketing copy.
- **Effort:** **S** — ~2h. One component variant, one home-page swap.

---

### 6. Accordion TOC — alternate `list` view of `/curriculum` as the canonical syllabus

- **Cartesian source:** `cartesian-stats-row-1920.png` (lower half) — 22 chapters as accordion items, full-width rows with `+` (rotates 45° → `x` on open), 16px chapter title, 2-3 line description on expand. Smooth `max-height 0.5s cubic-bezier(0.4,0,0.2,1)`. Hairline rules between rows (no card boxes). Reads like a physical book's index.
- **Promptdojo target:** `/curriculum` (`app/curriculum/page.tsx`) currently renders a *grid* via `PhaseBandedRail expanded` — phase headers + chapter tiles + lesson `<ul>` inside each tile. The grid is fine for the home page (where there's competing real estate); on `/curriculum` it loses the *index-page* feel that says "syllabus." A user landing here from a tweet wants to see the whole shape on one scroll.
- **Translation:** Cartesian's `+` becomes `❯` (rotates 90° on open — same convention as `app/page.tsx:179` legacy course details). Cartesian's hairline rules become `border-b border-ink-800` between every chapter row. Cartesian's 22 flat chapters become 25 chapters **grouped by 5 phase headers** (Cartesian doesn't have phases — promptdojo does, so we honor that hierarchy with `<details>`-on-`<details>` nesting). On expand, show chapter blurb + lesson list.
- **Concrete change:**
  - **New component** `components/v2/CurriculumAccordion.tsx` (server component, ~120 lines):
    ```tsx
    // Pseudo-shape — server-rendered nested <details> elements.
    <article className="divide-y divide-ink-800 border-y border-ink-800">
      {PHASES.map((phase) => (
        <details key={phase.number} className="group" open={phase.number === 1}>
          <summary className="flex cursor-pointer items-baseline gap-4 py-6 list-none">
            <span className="font-mono text-2xl text-green-500 transition group-open:rotate-90">❯</span>
            <div className="flex-1">
              <div className="t-eyebrow">phase {pad(phase.number)}</div>
              <h2 className="t-section mt-1">{phase.name}</h2>
              <p className="t-body-sm mt-2 max-w-2xl">{phase.blurb}</p>
            </div>
            <div className="t-mono-meta self-center text-right">
              {phase.range}<br/>~{formatMinutes(phaseMinutes)}
            </div>
          </summary>
          <div className="divide-y divide-ink-800 border-t border-ink-800">
            {phaseChapters.map((c) => (
              <details key={c.slug} className="group/c py-4 pl-9">
                <summary className="flex cursor-pointer items-baseline gap-3 list-none">
                  <span className="font-mono text-ink-500 transition group-open/c:rotate-90">+</span>
                  <span className="font-mono text-[11px] text-ink-500 tabular-nums">
                    ch {pad(c.number)}
                  </span>
                  <span className="t-h3">{titleClean(c.title)}</span>
                  <span className="ml-auto t-mono-meta">{c.stepCount} steps · ~{formatMinutes(c.estMinutes)}</span>
                </summary>
                <div className="mt-3 pl-9">
                  <p className="t-body-sm">{c.blurb}</p>
                  <ol className="mt-3 space-y-1 font-mono text-[11px] text-ink-400">
                    {lessons.map((l, i) => <li key={l.slug}>{pad(i+1)} · {l.title.toLowerCase()}</li>)}
                  </ol>
                </div>
              </details>
            ))}
          </div>
        </details>
      ))}
    </article>
    ```
  - `app/curriculum/page.tsx:76-82` — replace `<PhaseBandedRail expanded ... />` with `<CurriculumAccordion ... />`. Keep `PhaseBandedRail` for the home page only.
  - Smooth open/close: native `<details>` is fine for V4. CSS `transition` on `max-height` doesn't work on `<details>` without JS — leave that polish for V5 unless it lands free.
- **Why it works for promptdojo's positioning:** The grid view on `/curriculum` shows promptdojo as a *product*. The accordion view shows it as a *syllabus*. The accordion is what someone copy-pastes into a "is this a real course?" reply. It's also dramatically more SEO-rich (every chapter title + blurb + lesson title in DOM = ~200 indexable phrases). Cartesian's TOC is, by their own measurement, the chapter-list-as-skeptic-converter — promptdojo's audience does the same scan.
- **Effort:** **M** — ~5h. One new server component, one route swap. The grid stays for the home page.

---

### 7. Three-color section title pattern — colored-display-word + plain-finish at section headings

- **Cartesian source:** `cartesian-features-1920.png` — `<span style="color:#FF5F5F">Visualize</span> Everything.` `<span color:#BD4ABD>Code</span> Playback.` `<span color:#4DCB7D>Test</span> Your Might.` `<span>Edit. Run. Test. Repeat.</span>` (each word a different color). One word colored, the rest deep-grey, all in heavy display serif, all sentence-case with period.
- **Promptdojo target:** Promptdojo *already does this once* in the hero (`app/page.tsx:103-106`):
  ```tsx
  <h1 className="t-hero">
    ai writes this.<br />
    <em className="italic text-green-500">it&apos;s wrong.</em>
  </h1>
  ```
  But the pattern is **abandoned everywhere else**. `app/page.tsx:168` "25 chapters · 624 steps · free forever" — full ember (overuse). `app/about/page.tsx:124-130` `every course teaches you what python *is*. you need to know what it *isn't*` — uses italic + green-400 on `is`/`isn't`, which is the *closest* honoring. `/about` section heads `:148, :170, :192, :256, :298, :315` — none use the colored-word pattern.
- **Translation:** Cartesian uses 5 different highlight colors (red / purple / green / magenta / soft-red). Promptdojo has **one** chromatic accent (`--ember`, `COLORS.md:24`). So the translation isn't 5 colors — it's **one ember word per section heading**, with the rest in `--ink-100`. Section-identity comes from *which word* is colored, not *which color*.
- **Concrete change:**
  - **Pick one display-word per section heading on `/` and `/about`**. Apply `<em className="not-italic text-green-500">word</em>` (or `italic` if the brand voice wants the wonky tilt). Examples:
    - `app/page.tsx:168` `25 chapters · 624 steps · free forever` → `25 <em>chapters</em>. 624 steps. <em>free</em> forever.` (two highlights — one per concept). Actually use the t-section voice instead of full ember.
    - `app/about/page.tsx:148` `25 chapters. 624 interactive steps. zero install.` → `25 chapters. 624 <em>interactive</em> steps. zero install.`
    - `app/about/page.tsx:170` `read. run. fix. repeat 624 times.` → `<em>read</em>. <em>run</em>. <em>fix</em>. repeat 624 times.` (3 ember verbs — Cartesian's `Edit. Run. Test. Repeat.` exactly, but lowercase).
    - `app/about/page.tsx:191-195` `the old way assumes you'll write the code. you won't.` → `the old way assumes you'll <em>write</em> the code. you <em>won't</em>.`
    - `app/about/page.tsx:256` `$0. open source. no upsell. ever.` → `$0. <em>open source</em>. no upsell. <em>ever</em>.`
    - `app/about/page.tsx:298` `quick answers.` → `quick <em>answers</em>.`
    - `app/about/page.tsx:315` `stop reading. start fixing.` → `stop reading. start <em>fixing</em>.`
  - **Add a utility class** in `globals.css`:
    ```css
    .t-emph {
      color: var(--color-green-500);
      font-style: italic;       /* Fraunces italic axis = the wonky character */
      font-variation-settings: 'opsz' 144;
    }
    ```
    Then `<em className="t-emph">word</em>` everywhere instead of inline `text-green-500` strings.
  - **Audit-v3 already proposed splitting `t-eyebrow` into `t-eyebrow` (ink-500) + `t-eyebrow-accent` (green-500)** (`audit-v3/02-ui-polish.md` §19). **Bundle the two patterns: `t-eyebrow` becomes ink, `t-emph` becomes the only place ember-on-display lives.** This makes ember at section-heading scale a *deliberate spotlight*, not a default.
- **Why it works for promptdojo's positioning:** Right now ember-on-display happens unconsciously (eyebrows everywhere). Cartesian's discipline: *one* word colored per heading, *every* heading. That makes color a *meaning* (this word matters), not a default. For promptdojo's single-accent palette it's even cleaner than Cartesian's 5-color riot — same pattern, more restraint.
- **Effort:** **S** — ~2h. One CSS utility, ~9 className edits across 2 files.

---

### 8. Pricing card chrome — apply Cartesian's letterpress card detail to the curriculum chapter tiles

- **Cartesian source:** `cartesian-pricing-card-detail.png` — `1px solid #4B4B4B`, paper-cream `#F5F1EB` bg, **square corners**, no shadow. Title in colored serif (coral / purple / grey). Inside: 3 OS spec tiles, each square-bordered, each with a logo + tiny mono spec text. **Print-receipt aesthetic — no shadow, no rounding, every line drawn.**
- **Promptdojo target:** `components/v2/PhaseBandedRailClient.tsx:134-218` — the `ChapterTile` is currently `dojo-card-interactive`: `bg-ink-950 + border-ink-800 + radius-0 + 16px padding`, hover thickens the left rail. Tile contents (`:154-184`): eyebrow (`ch 0X` + `tier`), title, blurb, meta strip (steps · time + done/total), 1px hairline. The shape is *fine* — but it doesn't *feel* like a receipt. It feels like a default Tailwind card with a left-rail hover. Cartesian's pricing cards are denser, more *catalogued*.
- **Translation:** Cartesian's cream paper bg + solid grey border becomes ink-950 bg + `border-ink-700` (one stop brighter than current `border-ink-800` — the border becomes a *drawn line*, not a hairline shadow). Add a `❯ ch 0X` prefix to the eyebrow (the chevron is the dojo's "OS logo" equivalent). Add a 1-row "spec strip" beneath the meta: `runs in browser · pyodide · tab to autocomplete` (the chapter's "OS support row").
- **Concrete change:**
  - **Add `dojo-card-receipt` variant to `globals.css`** (alongside `dojo-card-interactive`):
    ```css
    .dojo-card-receipt {
      background: var(--color-ink-950);
      border: 1px solid var(--color-ink-700);  /* one shade brighter — drawn line */
      border-radius: 0;
      padding: 1.25rem;
      transition: border-color 140ms ease-out, background-color 140ms ease-out;
    }
    .dojo-card-receipt:hover {
      border-color: var(--color-green-500);
      background: var(--color-ink-900);
    }
    /* Inner spec tiles — Cartesian's OS tiles, dojo'd. */
    .dojo-card-receipt__spec {
      display: flex; align-items: center; gap: 0.5rem;
      border: 1px solid var(--color-ink-800);
      padding: 0.375rem 0.625rem;
      font-family: var(--font-mono); font-size: 10px;
      letter-spacing: 0.05em; text-transform: lowercase;
      color: var(--color-ink-500);
    }
    ```
  - `PhaseBandedRailClient.tsx:213` — swap `dojo-card-interactive` → `dojo-card-receipt`.
  - `PhaseBandedRailClient.tsx:158-160` — eyebrow becomes `<span className="t-eyebrow text-ink-500">❯ ch {pad(c.number)}</span>` (chevron prefix, like Cartesian's book icon prefix).
  - **Add a 1-row spec strip** between the meta strip (`:169`) and the hairline (`:178`):
    ```tsx
    <div className="mt-3 flex flex-wrap gap-1.5">
      <span className="dojo-card-receipt__spec">browser</span>
      <span className="dojo-card-receipt__spec">pyodide</span>
      {c.lessonCount > 1 && (
        <span className="dojo-card-receipt__spec">{c.lessonCount} lessons</span>
      )}
    </div>
    ```
- **Why it works for promptdojo's positioning:** Cartesian's pricing cards are the most *trust-signal-rich* surface on their site — the cards alone tell you "this is a real product, not a landing page." Promptdojo's chapter tiles are doing the same job (each represents a buyable unit of attention) but currently look generic. The drawn-line border + spec strip makes each tile feel *catalogued*, like an entry in a real curriculum book.
- **Effort:** **S** — ~2h. CSS utility + className swap + 1 new sub-row.

---

### 9. Single-CTA hero — kill the secondary "or pick your chapter ↓" link

- **Cartesian source:** `cartesian-home-1920-fold.png` — `[Purchase $35 ~~$59~~]` is the **only** button above the fold. No "Learn more." No "Watch demo." No "Free preview" link. The page itself is the learn-more. The strikethrough old price lives *inside* the button.
- **Promptdojo target:** `app/page.tsx:117-130` — currently TWO CTAs side-by-side:
  ```tsx
  <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
    <Link href="/learn/v2/variables/naming-things/0" className="dojo-btn-primary">
      start chapter 1 <span aria-hidden>→</span>
    </Link>
    <a href="#chapters" className="dojo-btn-tertiary">
      or pick your chapter ↓
    </a>
  </div>
  ```
  The tertiary link is doing two jobs at once: signaling that more chapters exist AND offering an alternate path. Both are arguably wrong — the chapter rail is **two screens down anyway** (anyone scrolling will reach it), and offering "pick your chapter" before someone knows what the chapters *are* is offering choice without information.
- **Translation:** Cartesian's coral pill becomes the existing `dojo-btn-primary` (already correct shape). Cartesian's strikethrough discount baked into the button becomes a **mono kbd hint baked into the button**: `[start chapter 1 →  ⌘ ↵]` — the discoverability of the keyboard shortcut lives inside the button instead of in a separate footnote. Drop the secondary link entirely.
- **Concrete change:**
  - `app/page.tsx:117-130` — replace the two-CTA row with:
    ```tsx
    <div className="mt-10 flex items-center gap-3">
      <Link
        href="/learn/v2/variables/naming-things/0"
        className="dojo-btn-primary group"
      >
        <span>start chapter 1</span>
        <span aria-hidden>→</span>
        <span className="ml-2 hidden border-l border-ink-950/30 pl-3 font-mono text-[10px] opacity-70 sm:inline">
          5 sec to pyodide
        </span>
      </Link>
    </div>
    ```
  - Drop the `or pick your chapter ↓` link. The chapter rail at `app/page.tsx:171` is reachable by scroll (and `/curriculum` is now reachable from the floating nav per pattern #1).
  - **Optional:** above the CTA, add a single-line `t-mono-meta` reassurance that does the job the secondary link was doing: `25 chapters · runs in your browser · no signup` — already in the body copy at `:108-111` so this is redundant, *cut it*.
- **Why it works for promptdojo's positioning:** Two CTAs split conversion intent. Cartesian's "one button" rule respects the reader: there's only one next thing to do. The site itself is the learn-more. Cutting the secondary link also cleans up the visual rhythm of the hero — the green primary button becomes the only colored object below the headline, and the eye lands on it without competition. Bonus: kills a CTA/CTA hierarchy bug Marketing #6 already flagged.
- **Effort:** **XS** — ~30 min. One file edit.

---

### 10. Page rhythm — Cartesian's section-to-section pacing as a `<SectionDivider />` system

- **Cartesian source:** Across `cartesian-home-1920-full.png` — sections are separated by **120-180px** of vertical rhythm (vs. promptdojo's `mt-12` / `mt-16` / `mt-24` ad-hoc system). Cartesian uses a literal `+` as a section divider (`cartesian-buy-once-1920.png`) between value-prop blocks instead of `<hr>`. The `+` is centered, ink-tone, ~20px — refuses standard divider conventions.
- **Promptdojo target:** Section spacing across `app/page.tsx`:
  - `:95` `mb-24` (header bottom)
  - `:113` `mt-16` (hero → bug snippet)
  - `:133` (HomeClient — variable)
  - `:138` `mt-16` (concept cards)
  - `:163` `mt-24 mb-12` (StatStrip)
  - `:165` (PriceBand — owns its own `my-24`)
  - `:167` (chapter rail — no top margin, follows PriceBand)
  - `:177` `mt-12` (legacy course)
  - `:205` `mt-16` (footer)
  Six different vertical-spacing values (12 / 16 / 24 / mb-24). No section dividers — sections butt against each other or rely on internal section padding.
- **Translation:** Cartesian's 120-180px rhythm becomes a single utility `--space-section: clamp(96px, 14vh, 192px)` applied between every major section. Cartesian's `+` divider becomes a tiny `<SectionDivider />` component: a centered `+` (or `❯` / `&` / `·` rotation) at `t-mono-meta` color and 20-24px size, with breathing room above and below. Don't use it everywhere — use it where two ideas are *related but distinct* (between `$0` band and chapter rail; between concept cards and stat strip).
- **Concrete change:**
  - **Add CSS variable in `globals.css` `@theme`:**
    ```css
    --space-section: clamp(96px, 14vh, 192px);
    ```
  - **Add utility class:**
    ```css
    .section-rhythm > * + * {
      margin-top: var(--space-section);
    }
    ```
  - **Add `<SectionDivider />` component:**
    ```tsx
    // components/SectionDivider.tsx
    type Props = { glyph?: "+" | "❯" | "&" | "·" };
    export default function SectionDivider({ glyph = "+" }: Props) {
      return (
        <div
          className="my-24 flex items-center justify-center font-mono text-2xl text-ink-700"
          aria-hidden
        >
          {glyph}
        </div>
      );
    }
    ```
  - `app/page.tsx:91` — wrap the page body in `<main id="main" className="mx-auto max-w-6xl px-6 py-10 section-rhythm">` and **drop every per-section `mt-N` value** (`:113, :138, :163, :177, :205`). The utility handles vertical rhythm uniformly.
  - **Insert `<SectionDivider />` at three deliberate moments:**
    - Between concept cards and StatStrip — softens the leap from "what we teach" to "by the numbers."
    - Between PriceBand and the chapter rail — pairs the `$0` claim with the *evidence* (the rail) via Cartesian's "+".
    - In `/about`, between the FAQ section and the closing CTA — Cartesian's exact "Buy Once. + Free Updates" pattern.
  - **The hero exception:** keep `mb-24` on the `<header>` because Cartesian's hero does have an unusually generous bottom space (~120px). Match that.
- **Why it works for promptdojo's positioning:** Inconsistent vertical rhythm reads as "assembled in pieces over time." Uniform rhythm + deliberate dividers reads as "one editorial spread." Cartesian feels *paced* because every section gets the same breath; promptdojo today feels *crammed* because spacing varies per author intuition. The `+` divider is also brand-voice perfect — it's the kind of low-key punctuation that fits the lowercase-with-period voice (`BRAND.md:10`).
- **Effort:** **S** — ~2h. One CSS variable, one utility, one component, one page rewrite (drop ~5 className margin overrides).

---

## What Cartesian does that promptdojo should NOT lift

These are anti-patterns. Each was tempting; each gets cut.

1. **Abril Fatface / Recoleta / cdnfonts loading.** `cartesian-home-1920-fold.png` runs 7 stylesheets from 5 CDNs. Promptdojo's `next/font/google` loads Fraunces + JetBrains Mono and that's it. Stay there. (Brand: `TYPOGRAPHY.md:8-13` — Fraunces *is* the editorial serif. Don't add a second display face.)

2. **Cream / coral / blue accent palette.** Cartesian uses 7+ accent hexes (`#FB6A59` coral, `#3B69FF` blue, `#FF5F5F`, `#BD4ABD`, `#4DCB7D`, etc., `audit-v4/01-cartesian-walkthrough.md:27-35`). Promptdojo's brand kit is locked to **one accent** (`COLORS.md:23` — "Ember is the only chromatic accent"). The "colored-display-word" pattern (#7) is lifted, but it uses `--ember` only, never multiple hues.

3. **Title Case headlines.** Cartesian uses Title Case throughout: "Buy Once. Own Forever.", "A Comprehensive Treatment.", "Visualize Everything." Promptdojo is **all-lowercase** (`BRAND.md:14`). Every Cartesian copy pattern lifted in this doc is rewritten lowercase. Don't slip on this.

4. **Pill border-radius `50px`.** Cartesian's nav and CTAs use 20-50px radii (pill-shaped). Promptdojo is **sharp corners** site-wide (`audit-v3/02-ui-polish.md:218` + `globals.css:258, 265, 305, 331`). The glass nav pill (#1) keeps the *floating* + *backdrop-blur* + *centered + small width* properties, but `border-radius: 0`.

5. **Single-page-sales-letter structure.** Cartesian has zero subpages — `/about`, `/curriculum`, `/changelog`, `/learn/v2/*` all redirect to `/`. Promptdojo's content lives in real routes (`/about`, `/curriculum`, 25 chapters × N lessons × M steps). The lift is *the home-page composition* of single-page-sales-letter, not the IA collapse. **Keep all routes.**

6. **"Buy Once" framing.** Cartesian sells a one-time download for $35. Promptdojo is free-forever, open-source. The "Buy Once. Own Forever." Litany pattern is lifted (#4) but the *frame* shifts from "no subscription = ownership" to "no signup = freedom." Don't accidentally suggest there's a paid tier.

7. **"Crafted with ♥ by Founder Name" footer signature.** Cartesian's solo-author byline works because Elias is selling academic credibility. Promptdojo is open-source — credit lives in `/about` and `git log`, not in marketing. `BRAND.md` voice rejects this register ("Crafted by Master Joshua Ernst" — no).

8. **Pre-rendered framed PNGs/GIFs of product UI.** Pattern #3 lifts the *frame*, not the *medium*. Cartesian bakes chrome into the screenshot at export time. Promptdojo should build chrome in CSS via the `<Frame>` primitive and put **live code** inside (it's an interactive product — show interactivity, don't simulate it with PNGs). The exception: if a screenshot of *Cursor itself* is needed (the IDE that promptdojo trains people to use), that PNG can live framed.

9. **Mild typos preserved as charm.** Cartesian has "techincal" in their FAQ. Don't ship typos. Promptdojo's audience (PMs, vibe-coders, builders) reads typos as "indie hobby project," not "human passion." Voice = casual, spelling = accurate (also in `audit-v4/01-cartesian-walkthrough.md:362`).

10. **Square print-receipt corners on EVERYTHING including buttons.** Promptdojo already uses square corners on cards/buttons (`globals.css`). But Cartesian extends square to hero CTAs too. Promptdojo's `dojo-btn-primary` is `border-radius: 0` — fine. Don't get tempted to add a lower-case `[ ]` bracket-frame on every button to "letterpress it up." That's costuming.

---

## System-level moves (token + utility + component additions)

To support the 10 patterns above, add these to the system. Naming follows the existing `--color-*` / `t-*` / `dojo-*` conventions.

### CSS tokens (add to `app/globals.css` `@theme` block)

```css
/* New section-rhythm token — Cartesian's 120-180px between major blocks. */
--space-section: clamp(96px, 14vh, 192px);

/* Glass surface for the floating nav pill. Two-stop alpha
   so the pill reads as a translucent layer, not a solid bar. */
--surface-glass-bg: rgba(20, 20, 15, 0.6);     /* ink-950 @ 60% */
--surface-glass-border: var(--color-ink-800);
```

### CSS utilities (add to `app/globals.css` after the `t-*` / `dojo-*` blocks)

```css
/* Pattern #7 — colored-display-word emphasis at heading scale. */
.t-emph {
  color: var(--color-green-500);
  font-style: italic;
  font-variation-settings: "opsz" 144;
}

/* Pattern #10 — section rhythm utility. */
.section-rhythm > * + * {
  margin-top: var(--space-section);
}

/* Pattern #8 — letterpress-receipt card variant. */
.dojo-card-receipt {
  background: var(--color-ink-950);
  border: 1px solid var(--color-ink-700);
  border-radius: 0;
  padding: 1.25rem;
  transition: border-color 140ms ease-out, background-color 140ms ease-out;
}
.dojo-card-receipt:hover {
  border-color: var(--color-green-500);
  background: var(--color-ink-900);
}
.dojo-card-receipt__spec {
  display: inline-flex; align-items: center; gap: 0.5rem;
  border: 1px solid var(--color-ink-800);
  padding: 0.375rem 0.625rem;
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.05em; text-transform: lowercase;
  color: var(--color-ink-500);
}
```

### New components

| File | Purpose | LOC |
| --- | --- | --- |
| `components/Frame.tsx` | Pattern #3 — universal IDE-chrome wrapper for any code/screenshot artifact | ~40 |
| `components/SectionDivider.tsx` | Pattern #10 — `+` glyph divider, centered, ink-700 mono | ~15 |
| `components/FloatingNav.tsx` | Pattern #1 — the floating glass pill (non-lesson routes) | ~70 |
| `components/v2/CurriculumAccordion.tsx` | Pattern #6 — `<details>`-on-`<details>` syllabus list for `/curriculum` | ~120 |

### Component refactors (no new files)

| File | Change | Pattern |
| --- | --- | --- |
| `components/SiteHeader.tsx` | Split into `<FloatingNav>` (default) and `<FlatHeader>` (lesson routes); pathname gate | #1 |
| `components/HeroBugSnippet.tsx` | Wrap pre-block in `<Frame filename="cursor.py" eyebrow="ai-generated" tone="err">` | #3 |
| `components/PriceBand.tsx` | Replace inline strip with vertical anti-litany + `+` divider + closing positive | #4 |
| `components/StatStrip.tsx` | Add `variant="display"` for fat-numeral home use | #5 |
| `components/v2/PhaseBandedRailClient.tsx` | Swap `dojo-card-interactive` → `dojo-card-receipt`, add chevron prefix + spec strip | #8 |
| `app/page.tsx` | Drop secondary CTA; add `section-rhythm` wrapper; insert `<SectionDivider />` × 2 | #9 + #10 |
| `app/about/page.tsx` | Apply `<em className="t-emph">` to ~6 section heads; insert `<SectionDivider />` | #7 + #10 |
| `app/about/page.tsx:299-310` | FAQ → hairline-rule `<details>` accordion | #2 |
| `app/curriculum/page.tsx:76-82` | Swap `<PhaseBandedRail expanded>` → `<CurriculumAccordion>` | #6 |

---

## Top 8 changes ranked by ROI

Ranking is impact-per-dev-hour, weighted toward repostability and brand-fidelity. Cartesian-pattern numbers in brackets.

| # | Change | Effort | ROI rationale | Pattern |
| --- | --- | --- | --- | --- |
| 1 | **Anti-feature litany inside PriceBand** | ~1.5h | The `$0` band is the cleanest single-frame meme; the litany makes it *unbluffable*. Single highest screenshot-per-dev-hour move on the property. | #4 |
| 2 | **Single-CTA hero (drop "or pick your chapter ↓")** | ~30 min | One line of code. Kills CTA hierarchy bug. Immediate composition cleanup. | #9 |
| 3 | **`<StatStrip variant="display">` for home** | ~2h | Promotes "624 / 25 / 8-15h / $0" from whispered meta to viewport receipt. Earns its own crop-able screenshot. | #5 |
| 4 | **`<Frame>` primitive + apply to 4 home/about surfaces** | ~5h | Turns prose claims ("read what ai wrote") into framed evidence. Multiplies the screenshot library 4×. The hero bug snippet stops being the only IDE-shaped thing on the page. | #3 |
| 5 | **`<SectionDivider />` + `section-rhythm` utility** | ~2h | Single cheap move that lifts the whole page from "assembled" to "paced." Visible to any designer in the first 100ms of scrolling. | #10 |
| 6 | **Colored-display-word pattern via `t-emph`** | ~2h | Section identity from word-coloring instead of separate eyebrows. ~9 className edits. The brand already does this in the hero — extending it everywhere makes it a pattern, not a one-off. | #7 |
| 7 | **Floating glass nav pill (non-lesson routes)** | ~3h | The first 100ms moment-of-truth. Today's flat sticky bar reads as default theme; the floating pill reads as designed product. The single biggest "this is pristine" signal in the chrome. | #1 |
| 8 | **`<CurriculumAccordion>` for `/curriculum`** | ~5h | Turns `/curriculum` from "another grid view" into "the syllabus." The link Josh actually pastes into tweets becomes self-justifying. Major SEO surface — every chapter blurb + lesson title in DOM. | #6 |

**Out of top 8 but still worthwhile:** patterns #2 (FAQ hairline rebuild — already shipped 80% via existing `border-l` style), #8 (`dojo-card-receipt` for chapter tiles — incremental polish on an already-good surface).

**Total budget for top 8:** ~21h. Three to four evenings if focused. Sequence matters: ship #1+#2+#3 first (the repostable cluster, ~4h), then #4+#5+#6 (the hero/page-rhythm cluster, ~9h), then #7+#8 (the chrome + curriculum cluster, ~8h). Each cluster is a single PR.

---

## Preserve list (don't touch these)

These are working as intended. Cartesian inspiration MUST NOT push us to "improve" them.

1. **Hero headline composition** — `app/page.tsx:103-106` `ai writes this. / it's wrong.` The two-line, italic-emphasized closer is already a perfect Cartesian-style "colored-display-word" before the pattern was named. Italic green-500 on `it's wrong.` honors `--ember`. Don't touch the typography or layout of these 4 lines.

2. **Wordmark** — `components/Wordmark.tsx`. The `❯ promptdojo _` lockup with 1Hz blinking underscore is THE brand anchor (`BRAND.md:79`, `MOTION.md:6-12`). It already does what Cartesian's heart-icon-byline does (signature + heartbeat) better than Cartesian. Don't replace with a logomark. The optical-baseline tweak from `audit-v3/02-ui-polish.md:33` is fine to ship; that's the only change.

3. **`dojo-btn-primary` / `dojo-btn-secondary` / `dojo-btn-tertiary`** — `globals.css:298-365`. The 3-tier button hierarchy is locked. Cartesian's coral `[Purchase]` pill does NOT translate into "add a coral variant." `--ember` is the only accent (`COLORS.md:23`). Resist the urge to add `dojo-btn-coral`.

4. **`--ember` as the single accent** — `COLORS.md:23-24`. Cartesian uses 7+ hues for personality. Promptdojo's posture is *one accent, used sparingly*. Every Cartesian pattern in this report routes through `--green-500` only. Adding a second accent kills the brand.

5. **Sharp corners site-wide** — Cartesian's pricing cards happen to share square corners (charm: letterpress). But Cartesian's nav pill and buttons are 20-50px radius. Promptdojo stays sharp on EVERY surface, including the floating nav pill (#1). `border-radius: 0` is `audit-v3/02-ui-polish.md:218` canon.

6. **JetBrains Mono in IDE + wordmark + eyebrows + meta** — `TYPOGRAPHY.md:8-13`. Cartesian uses Cascadia Code in their editor frame and SF Pro for body. Promptdojo's two-voice system (Fraunces + JetBrains Mono) is locked. Don't swap, don't add a third.

7. **`<HeroBugSnippet>` content (the mutable-default-arg bug)** — `components/HeroBugSnippet.tsx:30-42`. The Python snippet itself is canonical narrative — the `bag: list = []` evaluated-once-at-definition bug is THE story (`audit-v3/CEO-vision.md:60` "the screenshot machine"). The chrome wrapper changes per pattern #3 (becomes `<Frame>`-wrapped); the **code stays identical**. Refactor moves only the wrapper, never the contents.

8. **Cursor 1Hz blink** — `globals.css:135-145` + `MOTION.md:6-12`. The hard-step blink at exactly 1.0 Hz is brand-defining. Cartesian's heart icon is `@keyframes heartbeat` at a different cadence — irrelevant. The cursor is the one motion that ships in V4. Don't add a second.

9. **PARA-style URL routes** (`/about`, `/changelog`, `/curriculum`, `/learn/v2/*`) — `audit-v3/04-navigation-system.md:451-473`. Cartesian collapses everything to `/` with anchor scrolls. Promptdojo's IA is multi-route by design — share-able URLs are part of the validation-metric ladder (X followers see deep links). Don't lift Cartesian's IA collapse.

10. **The `t-eyebrow` token (after the pending split per `audit-v3/02-ui-polish.md` §19)** — once `t-eyebrow` becomes ink-500 default and `t-eyebrow-accent` becomes the green-500 spotlight, that pair is locked. Cartesian uses no eyebrows; promptdojo's voice does. Don't drop eyebrows just because Cartesian doesn't have them.

---

**UI Designer**: V4 audit team
**Date**: 2026-05-06
**The bar**: a designer at Stripe should look at the Cartesian-inspired Promptdojo and think "they understood what to lift and what NOT to lift."
**The thesis**: lift Cartesian's *bones* (single-CTA hero, framed visuals, anti-feature litany, hairline rules, accordion TOC, colored-word titles, glass nav pill, fat-numeral stat row, page-rhythm pacing); keep Promptdojo's *muscles* (lowercase, ember-only, sharp corners, Fraunces+JetBrains, dark-first, multi-route IA, `❯ promptdojo _` heartbeat). Borrow the bones, keep the muscles.
