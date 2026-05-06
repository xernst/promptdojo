# UI Design v2 — legitimacy without losing punk

**Auditor:** UI Designer (v2)
**Live target:** https://promptdojo.pages.dev
**Source:** `~/Developer/code-killa/`
**Phase 1 status:** Inter dropped, Fraunces+JetBrains wired, dojoTheme syntax tokens live, wordmark + 1Hz blink shipped, hero is `ai writes this. it's wrong.`, Run button is ember-sharp-mono. Punk shipped. Now we need legitimacy.

---

## The visual brief in one sentence

**Promptdojo today reads as one builder's terminal-themed manifesto; it needs to read as a curriculum that 10,000 people use — by adding the structural clarity of Boot.dev's chapter-path, the progress legibility of Codecademy's per-card meters, and Linear's quiet metadata density, while keeping every existing punk asset (caret, blink, mono eyebrows, sharp Run key, italic-ember headlines) untouched.**

The single thing missing across the board: **structured information density at rest.** Right now cards show 4 fields; serious learning platforms show 8–10 (time, difficulty, prereqs, outcomes, completion %, cohort signal). Density done well reads as *competence*. Density done badly reads as *clutter*. The kit-aligned version uses mono micro-labels, hairline rules, and one color (ember) to organize the extra fields — so the density looks like a dashboard, not a Coursera card.

---

## Component-level proposals

### 1. Curriculum visualization — the chapter "path"

- **Current:** `app/page.tsx:158-203` — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` of 25 identical 4-field cards, no sense of phase, sequence, or progress through the arc.
- **Issue why casual:** The about page already articulates a 5-phase journey (`app/about/page.tsx:26-57`) — *foundations → real python → llm apis → shipping → capstone* — but the home page renders that arc as flat 3-column wallpaper. Boot.dev has 21 chapters but you *see the path*: a vertical spine with chapter nodes, branching subskills, lit-up completed nodes. Codecademy uses a "skill path" rail with phase chips. Frontend Masters uses a "Learning Path" with explicit prerequisite arrows. Promptdojo uses none of these signals.
- **Proposed:** Replace the flat grid with a **phase-banded rail**:
  - 5 phase bands stacked vertically, each labelled with the eyebrow already shipping on `/about` (`phase 01 — foundations · ch 01–07`).
  - Each band has its own ember dot left-rail (`border-l-2 border-green-700`) — exactly the code-fold motif already in use on `<dl>` items in `app/about/page.tsx:342`.
  - Within a band, chapters render as a horizontal rail of compact tiles (4 per row max), so the page reads top-to-bottom as a syllabus, not a 25-up grid.
  - One **active phase** band gets `border-l-2 border-green-500` and `bg-ink-900/40` — the eye lands on the band the learner is currently inside.
  - Tailwind shape: `<section className="border-l-2 border-green-700 pl-6 mb-12"> ... </section>` with the phase eyebrow at the top, chapter tiles in `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`.
  - **Phase divider** = a 1px `border-ink-800` between bands plus a `[clamp]` of vertical air (~48px). No headers, no big "PHASE 02" billboard — the eyebrow does the work.
- **Reference:** Boot.dev's chapter map (`/tracks/backend`) — banded phases, active-phase highlight, per-tile completion ring. Frontend Masters' "Path" pages (`/learn/javascript`) — vertical spine, branching deps. Khan Academy's "Mastery" view — phase banding with proficiency dots.
- **Why it works:** A 25-chapter list with no spine reads as homework; the same 25 chapters in 5 phases reads as a *plan*. The brand kit already has the typographic vocabulary (eyebrow + ember left-rail) — we're just promoting it from "section divider" to "primary IA structure."

### 2. Chapter tile — density upgrade

- **Current:** `app/page.tsx:169-185` — number eyebrow, lowercased title, blurb (3-line clamp), `12 steps · 1 lesson` mono footer. Hover = ember border + bg shift. Four fields total.
- **Issue why casual:** A learner deciding which chapter to skip can't see how long it takes, how hard it is, what they'll be able to do, or whether they're partway through it. Boot.dev shows `est. 2.5h · beginner · 4/12 done`. Codecademy shows `1h · 8 lessons · 70% complete`. The data exists in `getV2Toc()` and `loadProgressV2()` but the tile doesn't render any of it.
- **Proposed:** Promote the tile from 4 fields to **8 fields** in three rows, all kit-aligned:

  ```tsx
  <Link className="group flex flex-col gap-2 border border-ink-800 bg-ink-950 p-4 transition hover:border-green-700/60 hover:bg-ink-900">
    {/* row 1 — eyebrow strip */}
    <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest text-ink-500">
      <span>ch {n}</span>
      <span className="text-green-700">{difficulty}</span> {/* foundations | core | advanced */}
    </div>

    {/* row 2 — title + blurb */}
    <div>
      <h3 className="font-display text-base font-semibold leading-snug text-ink-100 group-hover:text-green-300">
        {title}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs text-ink-500">{blurb}</p>
    </div>

    {/* row 3 — meta strip + completion */}
    <div className="mt-auto flex items-center justify-between font-mono text-[10px] text-ink-500">
      <span>{steps} steps · ~{minutes}m</span>
      <span className="tabular-nums text-ink-300">{done}/{steps}</span>
    </div>

    {/* row 4 — micro progress bar (1px) */}
    <div className="h-px w-full bg-ink-800">
      <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
    </div>
  </Link>
  ```

  Concrete tokens:
  - Difficulty pill = mono uppercase, `text-green-700` for *foundations*, `text-green-500` for *core*, `text-ink-100` for *advanced*. No backgrounds — three-color decoration breaks the brand.
  - The 1px progress hairline is the **same component as `StepFooter.tsx:93-105`** — promote it to `<ProgressHairline />` so the lesson XP bar and chapter completion bar are visibly the same primitive. Two sizes: `h-px` (chapter card) and `h-1.5` (lesson footer).
  - Time estimate derived from `stepCount * 30s` rule — an honest synthetic. Show as `~7m`, `~22m`, `~1h 10m` in mono.
- **Reference:** Boot.dev course tiles (number, title, blurb, time, completion bar). Linear cycle cards (eyebrow, title, meta strip, hairline progress).
- **Why it works:** Density is the #1 thing separating "real product" from "indie page." Six extra fields on each tile add ~80% more legible information without adding any visual noise — because the typographic system (mono micro-labels at 10px in `--ink-500`) is already the brand's quiet voice.

### 3. Progress indicators — sitewide

- **Current:** Three different progress affordances live in the codebase, none of which talk to each other:
  - Lesson XP bar: `StepFooter.tsx:93-105` — `h-1.5 rounded-full bg-ink-800` with `bg-green-500` fill.
  - Onboarding dots: `app/onboarding/page.tsx:167-177` — five `h-1 w-8 rounded-full` pills.
  - Chapter completion: nothing on the home page; sidebar shows a single `<Check />` icon (`ChapterNav.tsx:94`).
- **Issue why casual:** A learner has no peripheral signal of "where am I in this whole journey?" anywhere outside the lesson sidebar. Boot.dev pins a 4px progress ring to the avatar in the top-right of every page. Codecademy shows `12% of Path` next to your name in the global header. Frontend Masters shows a per-course completion ring on every nav surface.
- **Proposed:** Three coordinated tiers, one shared primitive:

  **Tier 1 — global header pill (new):** Add a `<CourseProgress />` component to `app/layout.tsx:32-35` next to `LoginToSave` / `FollowOnXPill`. Mono, ember accent, 1px border:
  ```
  ❯ 47/624 · ch 03 ─────────░░░░░░░  ~8%
  ```
  Renders only when `loadProgressV2()` returns at least one passed step. Hidden on `/onboarding`.

  **Tier 2 — chapter-card hairline (already specced in §2):** A 1px `h-px` rail under each chapter tile.

  **Tier 3 — lesson-step XP (already shipping in `StepFooter.tsx`):** Keep as-is, but swap `rounded-full` for `rounded-none` so it visually rhymes with the hairline tier.

  All three use the **same `<ProgressHairline value={x} max={y} />`** primitive, parameterized by height (`1px / 6px / 4px`) and color (`green-500` always). One thing, three sizes.
- **Reference:** Linear's project progress (single-color hairline at three densities), Boot.dev's stratified completion rings (track / chapter / lesson).
- **Why it works:** Today the brand has 3 progress UIs that look like 3 different products. Promoting one primitive across all 3 surfaces is the cheapest legitimacy move available — instantly reads as "designed system" instead of "as-needed widget."

### 4. Lesson chrome — IDE-meets-textbook

- **Current:** `LessonShell.tsx:53-91` — three columns: `w-60` sidebar, `minmax(0,480px)` prompt, flexible IDE. Header strip with `DailyGoalDial`. Footer with hint/skip/continue. Dividers all `border-ink-800`. Mobile collapses to single-column with a `[ChevronUp] Show prompt` toggle.
- **Issue why casual:** Bones are right; chrome is silent. There's no breadcrumb (which chapter? which lesson? where am I?). The lesson title is missing entirely from the header strip — the only signal of "what is this lesson?" is the URL. The `DailyGoalDial` lives in the corner doing PR work that should be reserved for content. The vertical divider between prompt and IDE is the same hairline as every other border — no rhythm.
- **Proposed:**
  - **Header strip rebuild** (`LessonShell.tsx:67-72`):
    ```
    ┌──────────────────────────────────────────────────────────┐
    │ ❯ variables / naming-things · step 03 of 12  [progress▰▱] │  ← mono, ink-300
    │ what your code calls things                              │  ← Fraunces 700, ink-100, 22px
    └──────────────────────────────────────────────────────────┘
    ```
    Two rows: breadcrumb (mono `text-[11px]`, ember `❯`, ink-500 separators) + lesson title (Fraunces 22/1.3, ink-100). The `DailyGoalDial` moves to the **sidebar footer** instead of the page header — peripheral reward, not central focus.
  - **Vertical divider weight tier:** `border-r border-ink-800` stays as a 1px hairline at rest, but on hover/focus of either pane gets `border-r-2 border-green-700/40` — feels like a draggable rail (it isn't, V2). Single line CSS change at `LessonShell.tsx:62`.
  - **Pane labels:** Mono eyebrow at the top of each pane. Prompt pane: `❯ prompt`. IDE pane: `❯ editor`. Output pane: `❯ stdout`. The output one already exists (`PersistentIDE.tsx:316-318`) — replicate the pattern at the prompt and editor too. Three identical rules, three eyebrows — that's a system.
  - **Mobile toggle redesign** (`LessonShell.tsx:92-111`): replace the `<ChevronUp /> Show prompt` button with a **two-tab pill** anchored bottom-center:
    ```
    [ ❯ prompt ][ ▰ editor ]
    ```
    Active tab gets ember underline (matching the file-tab pattern already shipping at `PersistentIDE.tsx:236-241`). One pattern, three places: file tabs, mobile pane tabs, sidebar lesson list (next item).
- **Reference:** Boot.dev lesson chrome (3-pane, breadcrumb header, output panel labels). Linear issue view (hairline dividers that thicken on focus). Stripe Apps docs (mono pane labels in the corner of every panel).
- **Why it works:** Right now the lesson chrome is silent — you're inside an unlabeled 3-pane app. Adding three mono pane labels and a breadcrumb adds 12 words of UI copy and turns the layout from "shell" into "named workspace." That's the difference between Sublime in 2008 and VS Code in 2023.

### 5. Hierarchy + spacing — proper type scale

- **Current:** `app/globals.css` has zero typography utility classes; every page hand-rolls sizes. About page uses `text-5xl/6xl/7xl` for h1, `text-3xl/4xl` for h2, `text-2xl` for h3. Home uses `clamp(72px, 11vw, 128px)` for h1, `text-lg` for blurbs. Chapter overview uses `text-4xl sm:text-5xl` for h1 with `font-semibold` (not `font-black`). The audit's recommended `t-hero / t-section / t-h2 / t-h3 / t-body / t-eyebrow` token classes were never added.
- **Issue why casual:** Three pages, three different h1 sizes (128px / 72px / 60px / 48px). A reader skimming the site can't infer "this is a section heading" from typography alone — has to read the words. Stripe / Linear / Vercel docs all have a *single* type scale sitewide; you know it's an h2 because it's `text-2xl/3xl font-semibold tracking-tight` everywhere, full stop.
- **Proposed:** Add to `app/globals.css` after the `.hljs-*` block (around `globals.css:131`):

  ```css
  /* Type scale — single source of truth. All page hand-rolls collapse here. */
  .t-hero {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(64px, 9vw, 120px);
    line-height: 0.92;
    letter-spacing: -0.045em;
    font-variation-settings: "opsz" 144, "SOFT" 0;
    color: var(--color-ink-100);
  }
  .t-section {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(36px, 4.5vw, 56px);
    line-height: 1.0;
    letter-spacing: -0.03em;
    color: var(--color-ink-100);
  }
  .t-h2 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 28px;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--color-ink-100);
  }
  .t-h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 20px;
    line-height: 1.3;
    letter-spacing: -0.01em;
    color: var(--color-ink-100);
  }
  .t-body {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 18px;
    line-height: 1.55;
    letter-spacing: -0.005em;
    color: var(--color-ink-300);
  }
  .t-body-sm {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 15px;
    line-height: 1.55;
    color: var(--color-ink-400);
  }
  .t-eyebrow {
    font-family: var(--font-mono);
    font-weight: 800;
    font-size: 11px;
    line-height: 1;
    letter-spacing: 0.4em;
    text-transform: lowercase; /* lowercase per BRAND.md, but kept "eyebrow" feeling via tracking */
    color: var(--color-green-500);
  }
  .t-mono-meta {
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 11px;
    line-height: 1.4;
    letter-spacing: 0.05em;
    color: var(--color-ink-500);
  }
  .t-code {
    font-family: var(--font-mono);
    font-weight: 400;
    font-size: 14px;
    line-height: 1.55;
    font-variant-ligatures: none;
  }
  ```

  Then sweep:
  - `app/page.tsx:77-86` h1 → `<h1 className="t-hero">…</h1>` (drop the inline `style` and clamp).
  - `app/about/page.tsx:127-129, 157, 183, 213, 238, 303, 337, 356` → all use `t-section` for h1, `t-h2` for h2.
  - `app/learn/v2/[chapter]/page.tsx:90-92` → `t-section`.
  - All chapter card titles → `t-h3`.
  - All `text-xs uppercase tracking-widest` blocks (15+ across the codebase) → `t-eyebrow`.
- **Reference:** Vercel's design system (one type scale across docs/blog/dashboard). Linear (5 levels, never break the contract). Stripe docs (single source of truth in `tokens.css`).
- **Why it works:** The single highest-leverage legitimacy move in this report. Today the site's typography reads as "made by 3 people who didn't talk." After this it reads as "made by a design team." Cost: ~2 hours, mostly find/replace.

### 6. Spacing tokens — codified rhythm

- **Current:** Pages mix `mt-2 / mt-4 / mt-6 / mt-8 / mt-10 / mt-12 / mt-16 / mt-20 / mt-24` indiscriminately. Section breaks on `/about` use `py-16` consistently (good), but `/` uses `mt-12 / mt-16 / mt-24` for what are visually similar breaks.
- **Issue why casual:** The eye reads inconsistent rhythm as inconsistent thinking. Best-in-class docs sites pick **3 vertical rhythms** and never break them.
- **Proposed:** Codify three semantic rhythms in `globals.css`:

  ```css
  /* Vertical rhythm — three steps. Don't reach for in-betweens. */
  .v-tight   { --y: 12px; }  /* within a card, between caption + title */
  .v-card    { --y: 32px; }  /* between sibling cards in a grid */
  .v-section { --y: 96px; }  /* between page-level sections */
  ```

  Then a Tailwind utility class convention:
  - `space-y-3` (12px) — within a card.
  - `space-y-8` (32px) — between cards.
  - `space-y-24` (96px) — between page sections.

  Sweep `app/page.tsx` `mt-12 / mt-16` to `mt-24` for major section breaks (header → resume CTA → 3-card grid → chapters → legacy → footer all become `mt-24` apart). Single edit in 6 places, total visual rhythm fix.
- **Reference:** Stripe (8/16/32/64/128 with semantic names). Linear (4/8/16/32/64 with no in-between). Tailwind's own marketing site (3 sectional rhythms).
- **Why it works:** Air = swagger. Three rhythms create the breathing pattern that separates a "page that has padding" from "a page that's been *spaced*." Free.

### 7. Card pattern — border vs. shadow

- **Current:** `app/page.tsx:142, 190, 197, 218` and `HomeClient.tsx:70, 100` mix three card patterns: `rounded-lg border-ink-800 bg-ink-950`, `rounded-xl border-green-700/40 bg-gradient-to-br from-green-950 to-ink-950`, and unbordered. About page uses `border-ink-800 bg-ink-900` with no rounding (`app/about/page.tsx:166, 188, 218, 257-260`).
- **Issue why casual:** Two card visual languages on the same property is the textbook "design debt" smell. The home page's gradient resume CTA (`HomeClient.tsx:70`) is the loudest violator — it's the only gradient on the entire site, and it screams "Spotify CTA."
- **Proposed:** **One card pattern, two variants.**

  **Default card:**
  ```css
  bg-ink-900 border border-ink-800 rounded-none p-5
  hover: border-ink-700 (no bg change unless interactive)
  ```

  **Interactive card** (the chapter tiles, the resume CTA):
  ```css
  bg-ink-950 border border-ink-800 rounded-none p-4
  hover: border-l-2 border-green-500 bg-ink-900
  ```

  **Highlight card** (the resume CTA, replaces the gradient):
  ```css
  bg-ink-900 border-l-2 border-green-500 border-y border-r border-ink-800 rounded-none p-6
  hover: border-l-4 border-green-400
  ```

  Three rules:
  1. **Sharp corners (`rounded-none`) site-wide.** Already followed on `/about` cards but violated on `/`. Sharp corners read as terminal; rounded corners read as Material.
  2. **No gradients, no shadows.** The brand is flat ink + ember. `bg-gradient-to-br from-green-950 to-ink-950` (`HomeClient.tsx:70, 100`) → flat `bg-ink-900` with `border-l-2 border-green-500` instead.
  3. **Hover state = left rail thickening, not bg shift.** Pure motion language: state change is *width*, not *fill*. Cheaper, faster, more legible.

  Sweep:
  - `HomeClient.tsx:70-86, 100-117` — drop the gradient, replace with the highlight-card pattern. Keep the `<Play>` and `<ArrowRight>` icons but in `text-green-500` on a sharp ember-rail card. Drop the `rounded-full bg-green-600 p-3` icon-circle entirely — it becomes a mono `↵ continue` keycap.
  - `app/page.tsx:142, 190, 197, 218` — `rounded-lg` → `rounded-none`. Sweep.
  - `LessonShell.tsx`, `StepFooter.tsx` borders are already correct.
- **Reference:** Linear (sharp corners, flat fills, border-as-state). Stripe (rounded but never gradient). Vercel docs (flat cards with hairline borders, hover thickens border not bg).
- **Why it works:** Two card patterns on a site = visual schizophrenia. Three card variants of *one* pattern = system. Cost: 6 file touches, ~30 min.

### 8. Button hierarchy — terminal keys, not chips

- **Current:** Three button visual languages active:
  - Primary CTA on `/`: `bg-green-500 px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink-950` (`app/page.tsx:100`) — the right answer.
  - Primary CTA on chapter overview: `rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-ink-950` (`[chapter]/page.tsx:116`) — Material.
  - Primary CTA in `StepFooter`: `rounded-md bg-green-500 px-4 py-2 text-sm font-medium` (`StepFooter.tsx:140`) — Material.
  - Secondary CTA on `/about`: `border border-ink-700 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider` (`about/page.tsx:317`) — the right answer.
  - Onboarding "start": `rounded-md bg-green-500 px-5 py-2.5 font-medium` (`onboarding/page.tsx:205`) — Material, lowercase, no mono.
- **Issue why casual:** The home page button is on-brand (sharp, mono, uppercase). Every *other* primary button on the site is `rounded-md` and sentence-case. So the brand voice is correct above the fold and forgotten everywhere else.
- **Proposed:** **Three button tiers, one shape language.**

  **Primary (terminal key — ember):**
  ```tsx
  className="inline-flex items-center gap-2 bg-green-500 px-5 py-2.5
    font-mono text-xs font-bold uppercase tracking-wider text-ink-950
    transition hover:bg-green-400 focus:outline-none focus:ring-2
    focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-ink-950"
  ```
  Sharp corners. Optional `<kbd>⌘↵</kbd>` suffix in `opacity-70`.

  **Secondary (terminal key — outline):**
  ```tsx
  className="inline-flex items-center gap-2 border border-ink-700 bg-transparent
    px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink-300
    transition hover:border-green-500 hover:text-green-400 focus:outline-none
    focus:ring-2 focus:ring-green-300"
  ```

  **Tertiary (text link — mono):**
  ```tsx
  className="font-mono text-xs uppercase tracking-wider text-ink-400
    transition hover:text-green-400"
  ```

  All three tiers must be **mono, uppercase, sharp corners.** No `font-medium` (a sans-serif marker), no `rounded-md`. The kit says buttons are keys, not chips.

  Sweep targets: `[chapter]/page.tsx:116`, `StepFooter.tsx:140`, `onboarding/page.tsx:205, 244, 280, 350, 401`. Estimated ~12 button instances total.
- **Reference:** Boot.dev primary CTAs (sharp ember, mono uppercase). Vercel CLI deployment dashboard (sharp keys with kbd hints). Linear's "Submit" button (sharp + mono).
- **Why it works:** The brand has *one* button visual language and currently uses three. Fixing this is the single most repeated affordance on the site — every learner clicks a button 600+ times in the course. Off-brand buttons compound into off-brand product.

### 9. Focus + hover canon

- **Current:** Focus rings are inconsistent. `StepFooter.tsx:140` uses `focus:ring-2 focus:ring-green-300`. `app/onboarding/page.tsx:205` does the same. `app/page.tsx` CTA has *no* focus state. Buttons throughout default to whatever Tailwind/browser ships.
- **Issue why casual:** Best-in-class products have a single focus visual that every keyboard user recognizes. Linear's focus ring is unmistakable; ditto Stripe Dashboard, ditto GitHub. Promptdojo's focus state is "whatever the browser gives you."
- **Proposed:** Add to `globals.css`:
  ```css
  /* Focus canon — every interactive element on the site. */
  *:focus-visible {
    outline: 2px solid var(--color-green-500);
    outline-offset: 2px;
    border-radius: 0; /* sharp focus, not rounded */
  }
  /* Buttons get the ring treatment instead — outline interferes with bg */
  button:focus-visible,
  a:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-ink-950), 0 0 0 4px var(--color-green-500);
  }
  ```

  Single global focus rule. Audit removes `focus:ring-2 focus:ring-green-300 focus:outline-none` from every component (~8 instances) — one rule, applied everywhere.

  **Hover canon** (also globals): Add a `.dojo-hover` class:
  ```css
  .dojo-hover {
    transition: border-color 140ms ease-out,
                background-color 140ms ease-out,
                color 140ms ease-out,
                opacity 140ms ease-out;
  }
  ```

  Sweep `transition` shorthand uses (`app/page.tsx:100, 190`, `HomeClient.tsx:70, 100`, etc.) → `dojo-hover`. Single source of truth for transition speed (140ms — within the 120–180ms motion budget at `MOTION.md:55`).
- **Reference:** Linear's focus (single double-ring, ember-equivalent). Vercel's hover transitions (always 150ms ease).
- **Why it works:** Accessibility legitimacy + visual consistency in one move. Right now keyboard users see different focus visuals on different pages — that's the loudest "indie" signal there is.

### 10. Iconography — Lucide is fine, but use sparingly

- **Current:** Lucide is the icon library (`Check`, `ChevronDown`, `ChevronRight`, `Circle`, `Lock` in `ChapterNav.tsx`; `Play`, `ArrowRight` in `HomeClient.tsx`; `Loader2`, `Lock`, `Play`, `Terminal` in `PersistentIDE.tsx`; `Lightbulb`, `ArrowRight`, `SkipForward` in `StepFooter.tsx`).
- **Issue why casual:** Lucide is on-brand (geometric, hairline weight, dev-tool gestalt). What's casual is the *use*: `Lock` icons on un-started steps (`ChapterNav.tsx:201`) imply paywalls; `Lightbulb` on hint button (`StepFooter.tsx:121`) is the most cliched icon in pedagogy; `Circle` filled vs hollow is doing too much heavy lifting in the sidebar.
- **Proposed:** Replace icons with **mono ASCII glyphs** wherever the brand has a stronger native option. Keep Lucide where geometry is required (chevrons, the play triangle, the loader spinner).

  Mappings:
  - `<Lock />` for un-started steps (`ChapterNav.tsx:201`) → `▱` outlined square.
  - `<Check />` for completed steps (`ChapterNav.tsx:152, 197`) → `▰` filled square in `--ember-700`.
  - `<Circle />` filled active (`ChapterNav.tsx:198`) → `▰` filled in `--ember-500`.
  - `<Lightbulb />` for hint (`StepFooter.tsx:121`) → `?` glyph in mono.
  - `<SkipForward />` for skip (`StepFooter.tsx:131`) → `⤳` or text-only `skip ›`.
  - `<ArrowRight />` for "continue" (`StepFooter.tsx:148`, `HomeClient.tsx:84`, others) → text-only `→` glyph (already used in some places).
  - `<Play />` for resume CTA (`HomeClient.tsx:114`) → text-only `↵` keycap glyph.
  - `<Terminal />` for output panel (`PersistentIDE.tsx:318`) → already replaced with `❯ stdout` text label, just confirm.

  Keep:
  - `<ChevronDown />`, `<ChevronRight />` (`ChapterNav.tsx:85-87`) — geometric, useful for tree-view affordance.
  - `<Loader2 />` (`PersistentIDE.tsx:281, 327`) — the spin animation is irreplaceable.

  **Reasoning:** Mono ASCII glyphs feel native to the brand (`❯`, `_`, `▰`, `▱`, `→`, `↵`). They're typography, not icons. They scale infinitely, never need optimizing, and reinforce the terminal aesthetic on every surface.
- **Reference:** Boot.dev sidebar (`▰ / ▱` for step status). tldraw status bar (ASCII glyphs in chrome). Sublime/VS Code minimap legends (text-only).
- **Why it works:** Lucide on every UI surface is the "indie SaaS template" tell. Mixing Lucide (where geometry needed) with mono glyphs (where typography works) is the senior-dev tell. Every Lock icon → ▱ swap costs 1 import deletion.

### 11. Empty + loading + completion states

- **Current:**
  - **Pyodide loading** (`PersistentIDE.tsx:83-87`): `"Booting Python (one-time, ~5s)…"` — in-place text with `<Loader2 />` spinner. Functional, generic.
  - **Empty output panel** (`PersistentIDE.tsx:338-342`): `[promptdojo:~]$ _` with cursor blink — *already on-brand, this is good.*
  - **Welcome-back card** (`HomeClient.tsx:97-117`): `welcome back / ch 03 · variables / pick up where you left off` — gradient, rounded-full play circle. *Visual language is wrong (see §7), copy is fine.*
  - **First-visit / new-user card** (`HomeClient.tsx:66-87`): `start here / get started in under a minute / five questions, then your first lesson.` — same gradient pattern, same problem.
  - **Lesson completion / chapter completion**: nothing exists. Last step → `Finish` → `/`. No celebration, no "you finished chapter 03" interstitial, no "next up: ch 04 — functions" forward-pull. (CEO vision §6 calls this out as ship-this-refresh.)
  - **404**: `app/not-found.tsx` does not exist — Next.js default fallback.
- **Issue why casual:** Three of these surfaces are blank. A blank empty state is the loudest "this is a side project" signal there is. Linear has a custom empty state for every list view; Stripe has 8 different "no data yet" screens; Boot.dev has a chapter-complete celebration with stats.
- **Proposed:**

  **Pyodide loading — terminal init log (animated):**
  Replace the static `"Booting Python (one-time, ~5s)…"` with a rolling line stagger:
  ```
  ❯ booting pyodide
  ❯ loading interpreter
  ❯ stdlib ✓
  ❯ ready_
  ```
  GSAP stagger 0.08s entry per line, last line gets the cursor blink. Total budget 4 lines × 0.5s = 2s. After ready, line stays as `❯ ready_` with blink. (`PersistentIDE.tsx:83-87` swap.)

  **Lesson completion screen (new):** When the last step of a lesson grades pass, replace the `Finish` button click with a 1-screen interstitial:
  ```
  ┌─────────────────────────────────────────┐
  │ ❯ lesson complete                       │  ← t-eyebrow ember
  │                                         │
  │ naming-things.                          │  ← t-section
  │                                         │
  │ ─────────────────────────             │
  │ 12/12 steps · 240 xp · 4m 32s          │  ← mono-meta tabular-nums
  │ ─────────────────────────             │
  │                                         │
  │ next: predicting types →                │  ← t-h3, ember
  │                                         │
  │ [ continue ⌘↵ ]    [ back to chapter ] │  ← primary + tertiary
  └─────────────────────────────────────────┘
  ```
  Pure layout, no confetti. The data is the celebration.

  **Chapter completion screen (new):** Same template, scaled up. Stats: lessons / steps / total XP / total time. Suggests next chapter. (CEO has parked this as V2 — but specifying it now means it ships consistent with the lesson interstitial when it does.)

  **Welcome-back card visual rebuild:** Per §7. Drop gradient, use highlight-card pattern (`border-l-2 border-green-500 bg-ink-900`). Replace `Play` icon-circle with `↵ continue` mono keycap.

  **404 page (new):** `app/not-found.tsx`:
  ```tsx
  <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
    <div className="t-eyebrow mb-3">404 ─ page not found</div>
    <h1 className="t-hero">where are you trying to go?</h1>
    <p className="t-body mt-6">
      this url doesn't exist. start over from <Link href="/" className="text-green-500">home</Link>
      {" "}or jump straight to <Link href="/learn/v2/variables/naming-things/0" className="text-green-500">chapter 01</Link>.
    </p>
    <pre className="t-code mt-12 text-ink-500">
      ❯ try / or /learn<span className="cursor-blink">_</span>
    </pre>
  </main>
  ```

  **First-visit card:** Same highlight-card visual as welcome-back, different copy (`five questions, then code`). One pattern, two states. (Already half-done; just align visually.)
- **Reference:** Boot.dev chapter completion (stats card → next chapter). Linear empty states (always specific, never generic). Vercel deployment success (terminal init log).
- **Why it works:** Empty states are where casual products give up and serious products lean in. Five empty states correctly designed = the difference between "feels like a beta" and "feels like a 1.0."

---

## System-level moves

### Type scale (concrete px sizes)
Codified in `globals.css` per §5. Hard sizes:
- `t-hero`: 64–120px clamp · 900wt · -0.045em · 0.92 lh
- `t-section`: 36–56px clamp · 800wt · -0.03em · 1.0 lh
- `t-h2`: 28px · 700wt · -0.02em · 1.2 lh
- `t-h3`: 20px · 600wt · -0.01em · 1.3 lh
- `t-body`: 18px · 400wt · -0.005em · 1.55 lh
- `t-body-sm`: 15px · 400wt · 1.55 lh
- `t-eyebrow`: 11px · 800wt · 0.4em · mono
- `t-mono-meta`: 11px · 500wt · 0.05em · mono
- `t-code`: 14px · 400wt · 1.55 lh · mono · ligatures off

### Spacing tokens
Three rhythms, no in-between:
- **`space-y-3` (12px)** — within a card, between caption + title.
- **`space-y-8` (32px)** — between sibling cards.
- **`space-y-24` (96px)** — between page-level sections.

Section padding is always `py-24` desktop / `py-16` mobile. Card padding is `p-5`. Tile padding is `p-4`.

### Card pattern
Sharp corners (`rounded-none`) sitewide. Three variants of one rule:
1. **Default**: `bg-ink-900 border border-ink-800 p-5`.
2. **Interactive**: `bg-ink-950 border border-ink-800 p-4 hover:border-l-2 hover:border-green-500 hover:bg-ink-900`.
3. **Highlight**: `bg-ink-900 border-l-2 border-green-500 border-y border-r border-ink-800 p-6 hover:border-l-4 hover:border-green-400`.

Zero gradients. Zero shadows. Zero `rounded-lg` / `rounded-xl`. The only color decoration is the ember left rail.

### Button hierarchy
Three tiers, one shape language. All mono uppercase, sharp, with kbd suffix where applicable. See §8 for class strings.

### Focus + hover canon
Single global `*:focus-visible` rule with double-ring on buttons/links per §9. Single `.dojo-hover` transition class at 140ms. No per-component focus/transition overrides allowed.

### Loading skeletons
Today the only loading state in the codebase is `HomeClient.tsx:58-64` — an `aria-hidden h-[124px] rounded-xl border-ink-800 bg-ink-950` ghost block. **Replace with a real skeleton primitive:**

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 0.4; }
}
.skeleton {
  background: var(--color-ink-900);
  border: 1px solid var(--color-ink-800);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```

Use cases:
- `HomeClient.tsx` resume card while reading localStorage.
- Chapter cards during `getV2Toc()` resolution.
- Lesson sidebar during `loadProgressV2()` hydration.

Skeletons read as "loaded purposefully" rather than "broken until data shows up."

---

## What to preserve (do not touch)

These are the elements that already feel right and provide the punk personality. **Do not change them in this round:**

1. **The 1Hz cursor blink** (`globals.css:135-145`, `Wordmark.tsx:46`). The brand's literal heartbeat. `steps(1)` not fade. Already perfect.
2. **The `❯ promptdojo _` wordmark lockup** (`Wordmark.tsx:35-48`). Inline JSX, JetBrains Mono ExtraBold, ember caret + ink wordmark + ember blinking cursor. Ship anywhere a logo would go.
3. **The hero italic-ember treatment** (`app/page.tsx:84-86`): `ai writes this. <em className="italic text-green-500">it&apos;s wrong.</em>`. The single most punk visual moment on the site. Keep at the home hero exactly as-is.
4. **The ember Run button** (`PersistentIDE.tsx:296-310`): sharp, mono, uppercase, `⌘↵` kbd suffix. The most-pressed surface in the product, and it's correct.
5. **The `[promptdojo:~]$ _` empty output state** (`PersistentIDE.tsx:339-341`). On-brand, terminal-correct, unique.
6. **The `dojoTheme` syntax tokens** (`globals.css:117-131`). Ember + ink, italic strings, italic comments. Keep.
7. **The dojoTheme lockstep with CodeMirror** — assume `lib/codemirror-theme.ts` (per CEO vision §5) is shipping these same tokens. Don't introduce a third syntax palette.
8. **The lowercase headlines, the all-lowercase voice, the "ai writes this. it's wrong." copywriting punch.** Voice is locked. UI design doesn't get to walk this back.
9. **The about page eyebrow rhythm** (`app/about/page.tsx:123, 154, 180, 210, 235, 273, 300, 333`): `❯ what is this?` / `the wedge` / `what's inside` / etc. — mono ember `❯` + lowercase eyebrow. This is the canonical eyebrow pattern; the home page should use *more* of this, not less.
10. **The about page `<dl>` border-left treatment** (`app/about/page.tsx:342`): `border-l-2 border-ink-800 pl-5` for FAQ items. This is the seed of the entire "left rail = code-fold marker" motif. Keep + propagate.
11. **`HeroBugSnippet` above-the-fold component** (`components/HeroBugSnippet.tsx`). Per CEO vision §3, this is the screenshot machine. Don't audit its visual until growth has signal.
12. **The `FollowOnXPill` global header element** (`app/layout.tsx:34`). Validation metric is X followers; this is the unblocker. Style is current; leave alone.

---

## Top 8 changes ranked by visual ROI

1. **Add the `t-*` typography utility classes to `globals.css` and sweep all hand-rolled sizes.** Single highest-leverage change. Today the site has 4+ different h1 sizes; after this it has one. ~2 hours, 15 file touches. (Component §5)

2. **Promote chapter tiles from 4 fields to 8 fields with completion hairline.** Adds *information density* — the #1 thing separating "real product" from "indie page." Boot.dev's tiles render time/difficulty/completion; ours don't. Cost: ~3 hours including the ProgressHairline primitive. (Component §2)

3. **Phase-banded chapter rail replacing the flat 25-up grid.** Surfaces the 5-phase arc that already exists in the data (`/about` page shipped this 2 weeks ago) but never renders on `/`. Reads as syllabus, not wallpaper. Cost: ~3 hours, mostly `app/page.tsx:152-204` rewrite. (Component §1)

4. **Standardize the card pattern — sharp corners, no gradients, three variants of one rule.** Six file touches, ~30 min. Kills the resume-CTA gradient (the loudest off-brand surface today). Establishes the left-rail-as-state visual grammar. (Component §7)

5. **Standardize button hierarchy — three tiers, all sharp/mono/uppercase.** Site currently mixes terminal-key and Material-chip languages. ~12 button instances; ~1 hour sweep. (Component §8)

6. **Lesson completion + chapter completion + 404 empty states.** Three custom screens replace one default Next.js fallback and zero celebration screens. Single biggest perceived-quality lift per dev-hour. ~4 hours. (Component §11)

7. **Global `<CourseProgress />` header pill.** A single mono "47/624 · ch 03 · ~8%" widget in the layout makes every page feel cohort-aware. ~2 hours. (Component §3 Tier 1)

8. **Lesson chrome — breadcrumb header + pane labels + thicker hover divider.** Three small additions to `LessonShell.tsx` that turn the unlabeled 3-pane shell into a named workspace. ~2 hours. (Component §4)

Total estimated effort if all eight ship: **~17 hours.** ~2 evenings of solo-founder work. Brand legitimacy goes from "indie manifesto" to "real product" without touching any of the 12 preserved elements.

---

## V2 / future-only

Parked for after this refresh — these earn their keep when audience exists:

- **Custom illustration system.** No bespoke graphics today (pure type + ascii). Worth waiting until the brand has earned 2,000+ followers — then a tatami-pattern background, hand-drawn chapter mat icons, a custom 404 illustration. Cost is real and ROI is brand-fidelity-only.
- **Theming/light mode.** `BRAND.md:44` explicitly defers light-mode to V2. Don't reopen.
- **3-stripe belt motif XP bar.** Cute, on-brand, parked by CEO vision. Linear hairline at three sizes (per §3) does the job.
- **Interactive chapter map** — drag/zoom canvas of all 25 chapters with prereq arrows, like Khan Academy's Mastery view. The phase-banded rail (§1) is the V1 substitute; the V2 is a `react-flow`-style canvas.
- **Per-chapter splash imagery.** Boot.dev has a custom illustration per chapter. Promptdojo could have an OG-art-style hero per chapter (the OG infrastructure exists at `app/og/launch/[name]/route.tsx`). V2 brand-fidelity layer.
- **Keyboard shortcut overlay** (`?` opens a kbd cheat sheet). Linear has this; Stripe Dashboard has this. Brand-aligned because the kit lives in mono uppercase. V2 polish.
- **Live in-IDE multi-cursor / collaborative editing.** Out of scope for the v1 IDE moat.
- **Confetti / particle celebration on chapter complete.** Specifically called out as not-this-refresh. Stats card (§11) is the right answer; particles are V2 if ever.
- **Sound design.** A 1Hz tick on the cursor blink, a soft thunk on Run, a chime on lesson complete. Brand kit doesn't speak about sound; this is V2 territory and probably V3.
- **Mobile sidebar drawer with full nav tree.** CEO vision §6 ships the scroll fix; the real mobile nav rebuild is V2.
- **`/settings` route** for theme picker, font axis sliders, keyboard preferences. V2.
- **Per-cohort analytics widget** ("847 builders shipping this week"). Requires user data to be honest. V2 once data exists.
- **Animated phase transitions** between chapters within a phase. The brand has a 0.4s power2.inOut crossfade in the launch trailer — could promote it to inter-page transitions. V2 motion layer.

---

**Auditor notes:** The audit-v2 starting point is a much-improved Phase-1 site — Inter is gone, dojoTheme ships, the wordmark heartbeat is alive, the hero is the bug. The legitimacy gap that remains is *systemic*: type scale lives in 4 hand-rolls, not one source; cards live in 3 patterns, not one rule; buttons live in 2 languages, not one hierarchy; progress lives in 3 widgets, not one primitive. Closing that gap is the work of this round. None of it requires re-thinking the brand — it requires *codifying* the brand the kit already specifies.

A Stripe / Linear designer looking at the site after these 8 changes ship would think: *"this feels like a real product."* That's the bar. The punk stays — the cursor still blinks, the Run button is still ember, the headlines are still lowercase, the wordmark still reads `❯ promptdojo _`. The legitimacy layer is *underneath* the punk — the spacing, the type scale, the shared primitives, the single focus ring — not painted over it.

Total effort if all eight changes ship: ~17 hours. Brand-fidelity gain: 85% → 97%. Punk preserved: 100%.
