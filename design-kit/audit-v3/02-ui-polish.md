# UI Polish Audit — pristine bar

**Auditor:** UI Designer (V3)
**Live target:** https://promptdojo.pages.dev
**Bar:** Stripe / Linear / Vercel / Notion / Figma — *pristine*, not "more punk."
**Phase 1+2 status:** Inter dropped, Fraunces+JetBrains wired, dojoTheme syntax tokens live, wordmark blink shipped, t-* type scale shipped, dojo-card/dojo-btn-* utilities shipped, phase-banded rail shipped, ProgressHairline primitive shipped, StatStrip shipped, /changelog shipped, lesson breadcrumb shipped. *Bones are in. Surface is at 30% of pristine because the bones aren't being honored.*

---

## The visual brief (1 sentence)

**The system is built but not yet executed — the t-\* utilities exist but `app/onboarding/page.tsx`, `components/v2/PersistentIDE.tsx`, `components/v2/ChapterNav.tsx`, and `components/v2/LessonShell.tsx` are still hand-rolling sizes/borders/buttons; pristine = sweep every surface to the system, tighten the seven micro-rhythms (hairline radius, monoscale colorways, eyebrow color discipline, hover state language, focus visibility, optical alignment, sidebar density) that Linear/Stripe nail and Promptdojo currently fakes.**

---

## Component-level polish gaps

### 1. Site header strip — `components/SiteHeader.tsx`

- **Current** (`SiteHeader.tsx:14-30`): four pills + one "what is this?" eyebrow link, all with different visual treatments. `GitHubStatsPill` and `FollowOnXPill` use `border-green-700/50 bg-green-950/40 text-green-400`; `LoginToSave` uses `border-green-700/50 bg-green-950/40 text-green-400` *only when logged in* and bare ink-500 text otherwise; `CourseProgress` uses no border at all and bare ink-400 text. Result: header reads as four UIs assembled at four different times. There is no horizontal divider rule between header and page (`app/layout.tsx:23` — `<SiteHeader />` butts directly against `<main>` content).
- **Pristine equivalent**: Linear's top bar = ONE rail with hairline `border-b border-ink-800` separating it from the canvas, all interactive elements at the same vertical metric (28px tall), pill borders only on the *one* CTA the design wants pulled. Stripe Dashboard top bar = a single divider hairline + everything else is ghost.
- **Concrete change**:
  - Add `border-b border-ink-800` on the outer `<div>` at `SiteHeader.tsx:15`. One line.
  - Standardize pill height: replace `px-3 py-1` (≈26px) on `GitHubStatsPill.tsx:35`, `FollowOnXPill.tsx:16`, `LoginToSave.tsx:162` to `h-7 px-3 inline-flex items-center` so all three sit at exactly 28px regardless of font metrics.
  - Demote `GitHubStatsPill` to ghost — drop `bg-green-950/40` and `border-green-700/50`, keep just `text-green-400 hover:text-green-300` so the **only** pill with a border is `FollowOnXPill` (the validation-metric CTA). One bordered pill = the eye lands on it. Three bordered pills = visual schizophrenia.
  - Move `CourseProgress` to the *left side* immediately after the wordmark (`SiteHeader.tsx:16-22`). Right cluster gets the social cluster (LoginToSave + FollowOnXPill). This is Linear's pattern: identity + status on the left, account + outbound on the right.
- **ROI**: HIGH. This is the first 100ms a stranger sees. Currently it reads "indie shop." After: "real product."

### 2. Wordmark spacing — `components/Wordmark.tsx`

- **Current** (`Wordmark.tsx:38`): `gap-[0.4ch]` between `❯`, `promptdojo`, `_`. The `_` underscore sits *baseline-aligned* but the `❯` glyph in JetBrains Mono renders as a chevron whose *visual* center is ~1px above the x-height. At `text-base` it's invisible; at `text-lg` and up (sidebar header `ChapterNav.tsx:57` uses `text-base`, but the lesson IDE could surface this larger), the optical misalignment is the kind of detail Stripe / Linear catch.
- **Pristine equivalent**: Stripe wordmark uses optical-baseline tweaks via `transform: translateY(0.5px)` on glyph-only chars when they sit next to letterforms.
- **Concrete change**: Add `style={{ transform: "translateY(-0.05em)" }}` to the `❯` span at `Wordmark.tsx:44`. Ditto the `_` at `Wordmark.tsx:46` — currently the underscore visually drops below the descender line of `promptdojo` because JetBrains Mono's `_` glyph sits below the baseline by design. Add `inline-block translate-y-[-0.15em]` to the underscore span.
- **ROI**: LOW absolute, HIGH per-pixel. The wordmark renders 5+ places per session.

### 3. Hero block — `app/page.tsx:94-130`

- **Current**: Header has wordmark eyebrow row (`mb-10`) → `t-hero` h1 → `t-body` tagline (`mt-8`) → `HeroBugSnippet` (`mt-10`) → CTA row (`mt-10`). The four vertical gaps are 40 / 32 / 40 / 40 — visually one of them wants to be 48 or 64 to give the headline its breathing room. Linear's hero rhythm is 16 → 24 → 64 → 32; the *one* big gap below the headline is what makes it feel pristine.
- **Pristine equivalent**: Stripe's marketing hero gives the H1 ~80px of bottom space before the next element. Linear's gives 64px. Promptdojo's is 32px (`mt-8` on the tagline). The headline can't breathe.
- **Concrete change**:
  - `app/page.tsx:107` — change `mt-8` (32px) to `mt-12` (48px) below the `t-hero`. The headline is the loudest element on the property and currently abuts the body too tightly.
  - `app/page.tsx:112` — change `mt-10` (40px) before `HeroBugSnippet` to `mt-16` (64px). The bug snippet is a narrative beat — needs separation from the tagline so the eye reads it as evidence, not a continuation.
  - `app/page.tsx:116` — keep `mt-10` (40px) above the CTA row.
  - Net rhythm: 40 → 48 → 64 → 40. Three steps, asymmetric, headline-favored.
- **ROI**: HIGH. Hero is the room.

### 4. HeroBugSnippet — `components/HeroBugSnippet.tsx`

- **Current** (`HeroBugSnippet.tsx:10-33`): `bg-ink-900` panel with `border-l-2 border-green-500`, `p-5`, leading-relaxed. The bug `[]` highlight uses inline `style={{ color: 'var(--err)', background: 'rgba(239,68,68,0.14)' }}` — works, but the highlight box has no padding inset (`HeroBugSnippet.tsx:22-24`), making the highlight cling tight to the brackets. The annotation line at `:29-32` reads `"mutable default arg. python evaluates the list once at definition. every caller mutates the same list."` — three sentences crammed on one row, ink-500 at `text-xs`, hits ink-500 contrast (✓ AA) but the typography fights the panel's mono-Python content above.
- **Pristine equivalent**: Linear's code-callout pattern uses an inset highlight (`padding: 0 4px`) on the bug character so the colored background reads as a *highlighter mark* not a fill. Annotation line is a separated `<small>` block with its own micro-rhythm.
- **Concrete change**:
  - `HeroBugSnippet.tsx:22-24` — add `padding: '1px 4px', borderRadius: '2px'` to the inline style on the `[]` span. The highlight needs to *contain* the brackets, not be flush with them.
  - `HeroBugSnippet.tsx:29-32` — split the annotation: bold-mono first phrase + body second. Two-tier: `<strong className="text-err font-mono text-[11px] uppercase tracking-wider">mutable default arg</strong>` then `<span className="text-ink-400">— python evaluates the list once at definition. every caller mutates the same list.</span>`. Reads as "label → explanation" rhythm instead of run-on prose.
  - `HeroBugSnippet.tsx:11` — bump `p-5` (20px) to `p-6` (24px) for desktop air. The container is doing hero-scene work; tighter padding makes it feel like a doc block.
- **ROI**: HIGH. This is the screenshot machine.

### 5. Resume / welcome-back card — `components/v2/HomeClient.tsx:44-130`

- **Current**: All three states (`guest`, `onboarded-not-started`, `in-progress`) use `dojo-card-highlight` (good — system honored). But the `↵ continue` keycap at `HomeClient.tsx:57-59, 81-83, 120-122` uses `border border-ink-700 px-2 py-1 font-mono text-xs uppercase tracking-wider text-ink-300`. The kbd has the *exact same* visual weight as the bracketed `[ ★ N · committed Xh ago ]` GitHub pill in the header — confusing two distinct affordances (status pill vs. action keycap).
- **Pristine equivalent**: Linear / Notion keycaps are visually distinct from status pills: keycaps have a subtle *bottom shadow* (1px inset) suggesting press depth; status pills have a flat border. The two affordances must not look identical.
- **Concrete change**: Add a `dojo-kbd` utility to `globals.css`:
  ```css
  .dojo-kbd {
    display: inline-flex; align-items: center;
    padding: 0.125rem 0.5rem; /* 2/8 */
    border: 1px solid var(--color-ink-700);
    border-bottom: 2px solid var(--color-ink-700);  /* the press depth */
    background: var(--color-ink-900);
    font-family: var(--font-mono); font-size: 11px;
    font-weight: 600; letter-spacing: 0.05em;
    text-transform: uppercase; color: var(--color-ink-300);
    line-height: 1; border-radius: 0;
  }
  ```
  Replace the inline kbd classNames at `HomeClient.tsx:57-59, 81-83, 120-122` and `app/page.tsx:205-207` with `className="dojo-kbd"`.
- **ROI**: MEDIUM. Tiny but pristine — keycaps reading as keycaps is a Linear-grade detail.

### 6. Three-card "what we teach" row — `app/page.tsx:137-160`

- **Current**: `grid-cols-1 sm:grid-cols-3 gap-6`. Each card is `dojo-card` with `t-h3` title + `t-body-sm` body. Card backgrounds = ink-900 (matches `dojo-card` default). The padding is `p-5` (`globals.css:234`). Cards have *no* hover state because `dojo-card` is the static variant. Visual diff: these three cards look *identical* to the `dojo-card-highlight` resume CTA above — same ink-900, same border-ink-800. The only differences are the highlight's left rail and the resume card's height.
- **Pristine equivalent**: Linear's marketing pages distinguish "concept tile" (decorative) from "interactive tile" (clickable). Concept tiles have a slightly recessed feel — Vercel uses `bg-ink-950/50` with `border-ink-900` (one shade darker than interactive cards). Stripe uses gradient backgrounds with the gradient running from token to token of *the same hue family*.
- **Concrete change**:
  - These three cards are non-interactive *concept* cards. They should read as quieter than the chapter tiles below. Change `dojo-card` to a new `dojo-card-quiet` variant in `globals.css`:
    ```css
    .dojo-card-quiet {
      background: transparent;
      border: 1px solid var(--color-ink-800);
      border-radius: 0;
      padding: 1.5rem; /* 24px — quieter air, longer scan */
    }
    ```
  - Apply at `app/page.tsx:155`: `<div key={card.title} className="dojo-card-quiet">`.
  - Add a numbered eyebrow above each title: `01 / 02 / 03` in `t-mono-meta` color `text-ink-600`. Three concept tiles need *order signaling* — readers tend to skip the middle when nothing tells them sequence. Linear does this on every "how it works" trio.
- **ROI**: HIGH. These three cards sit in the highest-engagement zone of the home page.

### 7. Chapter rail bands — `components/v2/PhaseBandedRailClient.tsx:82-110`

- **Current**: Five phase bands, each with `border-l-2 border-green-700` and `pl-6`. The phase eyebrow + blurb sits left, the `phase.range · ~Nh Nm` mono meta sits right (`PhaseBandedRailClient.tsx:87-97`). Then a 4-col grid of chapter tiles. **The five bands have *identical* left-rail color** (`border-green-700`) regardless of which phase the user is in. `audit-v2` §1 (`04-ui-design.md:28`) called for an active-phase highlight: `border-l-2 border-green-500 bg-ink-900/40`. Not implemented.
- **Pristine equivalent**: Boot.dev's track view = the active phase band gets `bg-ink-900/40` + `border-l-green-500` (1 stop brighter); Khan's mastery view = the in-progress phase has its label bumped one weight + the rail brightens. The eye lands on "where you are."
- **Concrete change**:
  - Compute the active phase in `PhaseBandedRailClient.tsx:62` from `doneBySlug` — the phase whose chapter set has *some but not all* completion is "active." Pseudocode logic, not implementation.
  - Apply `border-l-green-500 bg-ink-900/40 -ml-6 pl-6` (negative margin to keep grid aligned) on the active band; keep `border-green-700` on inactive bands.
  - Demote the inactive `border-green-700` to `border-ink-800` for far-future phases (phases 4+ for a fresh learner). Three rail tints — green-500 active / green-700 done / ink-800 future — gives the curriculum *temporal* legibility, not just structural.
- **ROI**: HIGH. The single highest-leverage "I see where I am" signal in the entire layout.

### 8. Chapter tile — `components/v2/PhaseBandedRailClient.tsx:116-179`

- **Current** (`PhaseBandedRailClient.tsx:134-164`): Eyebrow row (ch 0X / tier) → title → blurb (line-clamp-2) → meta strip → progress hairline. **Issue 1**: the title at `:145` uses `t-h3` which is `font-weight: 600 / 20px`. At a 4-col layout (~240px wide) with `p-4` padding, the 20px title creates 1-line wraps that look like orphan widows because most chapter titles are 2-4 words. Compare to Linear's project tiles which use a `text-sm font-medium` (14px/500) — *smaller, denser, calmer*. **Issue 2**: the tier color `text-green-700` for foundations / `text-green-500` for core / `text-ink-100` for advanced (`PhaseBandedRailClient.tsx:76-81`) gives advanced chapters the *brightest* tier label, which is backwards — advanced chapters should be the most muted because they're the least-likely-to-be-clicked-by-a-stranger. **Issue 3**: the blurb `line-clamp-2` at `:146` is `t-body-sm` = 15px / `--ink-400`. That's a body size in a card 240px wide — too dominant, eats vertical space, makes the tile feel cramped.
- **Pristine equivalent**: Linear cycle / project tiles use a 3-tier hierarchy: 11px mono eyebrow → 14px regular title → 12px secondary body. Three sizes, all small. The tile is dense, scannable, calm.
- **Concrete change**:
  - `PhaseBandedRailClient.tsx:145` — `t-h3` (20px/600) → custom `font-display text-[15px] font-semibold leading-snug text-ink-100`. Tightens the tile, kills the widow problem.
  - `PhaseBandedRailClient.tsx:146` — `t-body-sm` → `t-mono-meta` (11px mono ink-500) for the blurb. **Reasoning**: blurbs in tiles aren't paragraphs, they're labels. Mono micro-text reads as metadata not prose. Compare Linear's tile descriptions.
  - `PhaseBandedRailClient.tsx:76-81` — invert the tier color: `foundations: text-green-500` / `core: text-green-700` / `advanced: text-ink-500`. The brightest tier is the one you can start now. Future chapters dim.
  - `PhaseBandedRailClient.tsx:142` — the tier label `{tier}` is right-aligned mono. Strip its background; it's already restrained but loses against the chapter number on the left because both are the same scale. Right-aligning a `text-[10px]` mono tier vs. a `text-[11px]` mono "ch 03" creates the wrong size hierarchy. Drop tier to `text-[10px]` to match the eyebrow tracking.
  - `PhaseBandedRailClient.tsx:163` — `mt-3` (12px) above the hairline. Tile bottom is too tight; bump to `mt-4` (16px). Hairlines need air to read as a primitive instead of a footer rule.
- **ROI**: HIGH. 25 tiles render every visit. Every gap matters.

### 9. Lesson chrome — `components/v2/LessonShell.tsx`

- **Current** (`LessonShell.tsx:53-91`): 3-pane layout. The sidebar is `w-60 border-r border-ink-800 bg-ink-900`. Center prompt pane is `border-r border-ink-800` (`:62`). The IDE pane has *no* separator from the prompt because the prompt pane already owns the `border-r`. The header strip at `:67-72` is `border-b border-ink-800 bg-ink-900 px-5 py-3` — but the `DailyGoalDial` floats in the top-right corner of the prompt panel header, **competing** with the breadcrumb for prominence (`:70`). The footer `border-t border-ink-800 bg-ink-900` (`:77`). Vertical rhythm of the chrome is fine. **Issue**: the IDE pane has no equivalent header strip — it's a tablist (`PersistentIDE.tsx:223-248`) butted directly against the lesson shell's top edge. Asymmetric chrome.
- **Pristine equivalent**: VS Code / Cursor / Linear all give every pane the same chrome treatment. Top strip on the prompt = top strip on the editor. The shell looks like *workspace*, not "two web pages glued together."
- **Concrete change**:
  - Hide the `DailyGoalDial` from the lesson header strip. Per CEO vision §6 it was already cut, but it's still there at `LessonShell.tsx:70`. Move to the sidebar footer (small ring + minutes) so the lesson title gets the full header width.
  - The IDE pane top is the file-tab strip in `PersistentIDE.tsx:223-227`. Add a thin (1px) `border-b border-ink-800` line at the very top of the IDE pane container (`PersistentIDE.tsx:222`) so the editor "starts" with the same horizontal rule the prompt pane has. Symmetry sells "designed."
  - Vertical divider thickening on hover — `LessonShell.tsx:62` — was specced in `audit-v2` §4 but never landed. Add `hover:border-r-green-700/40` to the prompt section so the rail thickens when the pane is focused. Tiny, but it's the kind of detail Linear ships.
- **ROI**: MEDIUM. Lesson chrome is where users spend 95% of their time.

### 10. Sidebar (ChapterNav) — `components/v2/ChapterNav.tsx`

- **Current**:
  - Header `:55-62` — wordmark + `python for builders` tag. Header is `px-4 py-4 border-b border-ink-800`. Clean.
  - Chapter row `:71-95` — `rounded px-2 py-1.5 text-xs`. Why `rounded`? Sharp corners are the brand kit posture. `rounded` here is a Tailwind default that sneaked through.
  - Active chapter `:77` uses `bg-ink-800 text-ink-100`. Done chapters use `text-green-700`. Active *and* done would render as `bg-ink-800 text-ink-100` (the active branch wins in the cn cascade). No visual signal for "active and done" — but with 25 chapters that's a real state.
  - Step rows `:165-176` — `rounded px-1.5 py-1 text-xs`, here state uses `bg-ink-800 text-green-400`. **Mixing**: the active *chapter* is ink-100 on ink-800, but the active *step* is green-400 on ink-800. Two different "active" colorways at two levels of the tree.
  - Lock icon at `:201` — `<Lock size={10} className="text-ink-500" />`. The audit-v2 §10 explicitly cut the ASCII glyph swap (Lock → ▱), but the lock icon on un-started steps still reads as paywall. It's the *only* lock-shape on the entire site (the LoginToSave pill is text-only `[ login to save ]`), so its semantic weight is "you can't have this," which contradicts the `$0 forever` posture.
  - Active step row indent — `:134` `ml-5 mt-1 border-l border-ink-800 pl-3`. The `border-l border-ink-800` here is the same hairline as the chapter card border. Good. But the step list `ol` at `:156` uses `mt-1 flex flex-col gap-0.5` — the gap is *3px* (gap-0.5 = 2px in Tailwind 4 default). At 11-13px text, that's claustrophobic. Linear's tree views use a 4-6px row gap.
- **Pristine equivalent**: Linear's sidebar = sharp corners, monochromatic active state (no hue shift between levels — both use ink-100 on a single tinted bg), generous row gaps (6-8px), no lock icons (uses opacity instead).
- **Concrete change**:
  - `ChapterNav.tsx:75, 144, 165` — drop `rounded` everywhere in the sidebar. Sharp corners site-wide.
  - `ChapterNav.tsx:166-168` — unify the active state colorway. Active chapter and active step should both be `bg-ink-800 text-ink-100` (chapter is already; step uses `text-green-400`). Change `text-green-400` → `text-ink-100` and add a 2px ember left rail on the active step row (`border-l-2 border-green-500`) to carry the "active" signal *via geometry*, not hue. Step gets `pl-3` to compensate. Now the active state language is: ink-800 bg + ink-100 fg + ember left rail. *One* visual, *two* tree levels.
  - `ChapterNav.tsx:201` — replace `<Lock size={10} />` with `<span className="font-mono text-[10px] text-ink-700" aria-hidden>·</span>`. A neutral middle dot is the universal "nothing happened here yet" affordance. Locks imply paywall. (The `audit-v2` cut said "lucide where shipped today is fine," but lock semantics specifically clash with the brand.)
  - `ChapterNav.tsx:156` — `gap-0.5` (2px) → `gap-1` (4px). Step rows breathe.
  - `ChapterNav.tsx:75` — chapter row padding `py-1.5` (6px) → `py-2` (8px). 25 chapters × 2 extra px = 50px of total air, and chapter rows are the highest-density surface in the app.
- **ROI**: HIGH. Sidebar is on every lesson page. Every learner sees it 600+ times.

### 11. Run button + IDE chrome — `components/v2/PersistentIDE.tsx:286-311`

- **Current**:
  - Run button `:296-310` is `bg-green-500 text-ink-950 ... px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider`. **Inconsistent with `dojo-btn-primary`** (`globals.css:273-298`) which is `padding: 0.625rem 1.25rem` (10/20) and `font-size: 12px`. The Run button is `px-4 py-1.5` (16/6) and `text-xs` (12px). Almost the same but not exactly — every other primary button on the site uses `dojo-btn-primary`; this one alone hand-rolls.
  - Status copy at `:283`: `STATUS_COPY.ready = "press Run or use ⌘↵"`. **Sentence case + capital R + capital "Run."** Brand voice is all-lowercase (`BRAND.md:14`).
  - Output panel header `:316-318` uses `<Terminal size={11} />` + literal text "Output." Capital O. Same brand-voice violation. The audit-v1 §IDE §run-button proposed `❯ stdout` lowercase mono — not implemented.
  - File tab `:236-241` uses `border-b-2 border-green-500` for active, `border-b-2 border-transparent` for inactive. Good — visual hierarchy via border thickness, not bg fill. But the tab `px-3 py-2 text-xs` (12/8/12) is slightly off from the tablist's parent `px-2 py-2` (8/8) padding, creating a 4px asymmetric overhang on hover. Tighten to `px-3 py-2` outer + tab `px-3 py-1.5` so the hover area is contained.
- **Pristine equivalent**: Linear / Stripe IDE-style components have *one* shared button utility, lowercase or sentence-case voice locked, and tab strips with mathematically clean padding ratios.
- **Concrete change**:
  - `PersistentIDE.tsx:296-310` — replace the hand-rolled className with `className="dojo-btn-primary"`. Move the disabled treatment (`disabled:bg-ink-800 disabled:text-ink-500`) into the `dojo-btn-primary:disabled` rule (already at `globals.css:294-298`). Strip the inline duplicate.
  - `PersistentIDE.tsx:84` — `STATUS_COPY.ready: "press Run or use ⌘↵"` → `"press run · ⌘↵"`. Lowercase + middot separator (mono-friendly, brand-aligned).
  - `PersistentIDE.tsx:84-85` — `STATUS_COPY.idle: "Booting Python…"` and `loading: "Booting Python (one-time, ~5s)…"` → `"booting python…"` and `"booting python · one-time · ~5s"`. Sentence-case Python and Booting are voice violations.
  - `PersistentIDE.tsx:317-319` — `<Terminal size={11} /> Output` → drop the icon, use `<span className="text-green-500">❯</span> stdout`. Single-glyph eyebrow per brand kit. Already proposed in `audit-v1`, never landed.
  - `PersistentIDE.tsx:322` — `✗ ran in 53ms` and `:323` `✓ ran in 53ms` — the `✗` mark uses default text color (ink-600 from parent). Should use `text-err`. Currently the success/error states have *equal* visual weight. Add `<span className={stderr ? "text-err" : "text-ok"}>{stderr ? "✗" : "✓"}</span>`. The `--ok` and `--err` tokens are reserved for exactly this surface (`COLORS.md:25`).
  - `PersistentIDE.tsx:344` — `"Running your code…"` → `"running your code…"`. Lowercase.
  - `PersistentIDE.tsx:347` — `"Ran with no output."` → `"ran with no output."`. Lowercase.
- **ROI**: HIGH. Most-pressed surface in the product. Every voice violation is repeated thousands of times per learner.

### 12. CodeMirror IDE theme — `components/v2/PersistentIDE.tsx:5, 255`

- **Current**: `import { oneDark } from "@codemirror/theme-one-dark"` at `:5` and `theme={oneDark}` at `:255`. Despite the audit-v1 §IDE-theme call to replace with `dojoTheme`, the IDE still ships Atom's purple/cyan/blue palette. The `globals.css:117-131` shipping the dojo `.hljs-*` syntax tokens means *prose* code blocks are on-brand, but the *editor* — the most-watched surface — is on Atom's brand.
- **Pristine equivalent**: Stripe Apps editor / Linear's terminal / Vercel's AI playground all theme their CodeMirror with their own brand tokens.
- **Concrete change**:
  - Create `lib/codemirror-theme.ts` exporting `dojoTheme` using the EditorView.theme + HighlightStyle / tags from `@codemirror/language`. Token mapping (concrete CSS variables):
    ```ts
    // pseudocode shape — concrete CSS vars listed
    background: var(--color-ink-950)
    foreground: var(--color-ink-300)
    caret:      var(--color-green-500) /* with 1Hz blink via CSS animation on .cm-cursor */
    selection:  rgba(42, 160, 106, 0.18) /* green-500 at 18% */
    activeLine: var(--color-ink-900)
    gutter:     var(--color-ink-700)
    keyword:    var(--color-green-500) /* def, class, return, if */
    string:     var(--color-ink-100) /* italic */
    comment:    var(--color-ink-500) /* italic */
    number:     var(--color-ink-200)
    builtin:    var(--color-green-300) /* str, list, int */
    function:   var(--color-green-300)
    operator:   var(--color-ink-400)
    ```
  - Replace `theme={oneDark}` at `PersistentIDE.tsx:255` with `theme={dojoTheme}`.
  - Add CSS for the cursor blink in `globals.css`:
    ```css
    .cm-cursor { animation: blink-1hz 1s steps(1) infinite; }
    ```
  - Remove the `@codemirror/theme-one-dark` import + dependency.
- **ROI**: HIGHEST. The most-looked-at surface in the entire product is currently themed in someone else's brand. This is the single largest pristine gap on the property.

### 13. Output panel — `components/v2/PersistentIDE.tsx:315-360`

- **Current**: `h-44` fixed height (176px). On mobile vertical screens this halves the editor; on a tall desktop monitor the panel feels cramped at 176px. Padding is `p-3` (12px). Stdout uses `text-ink-200` (`:354`); stderr uses `text-err` (`:356`). Output formats inconsistently — stdout text is `pre.whitespace-pre-wrap` but stderr is also `pre.whitespace-pre-wrap` with a `mt-2` margin (`:356`). When both stdout AND stderr render, the divider between them is just 8px of margin — no rule.
- **Pristine equivalent**: Linear's "execution output" panes have a horizontal hairline rule between stdout and stderr sections + ember/red corner badges that label each block.
- **Concrete change**:
  - `PersistentIDE.tsx:354` — wrap stdout in a `<div className="border-l-2 border-ink-700 pl-3">` so it visually claims its territory.
  - `PersistentIDE.tsx:355-357` — wrap stderr in a `<div className="border-l-2 border-err pl-3 mt-3 pt-3 border-t border-ink-800">` — left rail + top rule when both blocks coexist. The `--err` left rail is the canonical reserved-color usage (`COLORS.md:25`).
  - `PersistentIDE.tsx:315` — `h-44` → `h-48 md:h-44` so mobile gets slightly more output room and desktop stays tight.
- **ROI**: MEDIUM. Output is the moment of truth for every step.

### 14. StepFooter — `components/v2/StepFooter.tsx`

- **Current**:
  - Hint button `:103-118` uses `border border-ink-800 bg-ink-950 px-3 py-2 text-xs text-ink-300` — **doesn't follow `dojo-btn-secondary`** (which is `border-ink-700`, `font-mono uppercase tracking-wider`, `text-[12px]`). Hand-rolled.
  - Skip button `:119-128` same problem — hand-rolled `border-ink-800 ... text-ink-400`. Should be `dojo-btn-tertiary` (`globals.css:321-340`) which is text-only, no border.
  - Lightbulb icon `:115` — universal pedagogy cliche per audit-v2 §10. Cut was deferred but the pristine bar means revisit. Replace with a `?` glyph in mono.
  - Hint reveal panel `:73-83` uses `rounded-md border border-ink-800 bg-ink-950 p-3` — `rounded-md` is a brand violation, sharp corners only (`audit-v2` §7).
  - The XP eyebrow row `:87-91` uses `text-[10px] uppercase tracking-widest text-ink-500` — should be `t-mono-meta` (which is 11px). Slightly smaller hand-roll.
  - The whole footer container `:71` is `flex flex-col gap-3` — the gap between the hint reveal panel and the bottom row is 12px. When 4 hints are revealed, the panel grows tall and the 12px gap reads as cramped. Bump to `gap-4`.
- **Pristine equivalent**: Linear modal action rows use one button utility per tier. Promptdojo has the utilities; the StepFooter just doesn't use them.
- **Concrete change**:
  - `StepFooter.tsx:103-118` — replace hand-rolled hint button className with `dojo-btn-secondary`. Inline disabled: add `disabled:cursor-not-allowed disabled:opacity-50` to the `dojo-btn-secondary:disabled` selector in `globals.css`.
  - `StepFooter.tsx:115` — `<Lightbulb size={14} />` → `<span className="font-mono font-bold" aria-hidden>?</span>`. The `?` glyph has the right semantic weight (a question, not a discovery).
  - `StepFooter.tsx:119-128` — replace hand-rolled skip with `dojo-btn-tertiary` (text-only) per audit-v1 §StepFooter. Strip the icon — `skip` as text alone is more brand-honest than `<SkipForward />`.
  - `StepFooter.tsx:74` — `rounded-md` → `rounded-none`. Sharp corners.
  - `StepFooter.tsx:87` — `text-[10px] uppercase tracking-widest text-ink-500` → `t-mono-meta` (11px / 0.05em / ink-500). Use the system token.
  - `StepFooter.tsx:71` — `gap-3` → `gap-4`. Footer breathes.
- **ROI**: HIGH. StepFooter is on every step screen.

### 15. Onboarding flow — `app/onboarding/page.tsx:160-348`

- **Current**: The whole file uses pre-system styles. Specifically:
  - Progress dots `:167-177` — `h-1 w-8 rounded-full` ember/ink-800 pills. `rounded-full` is a brand violation; sharp = brand. Eight dots is also one short of belt-stripes vibe (5 dots × 1 = the loading bay metaphor).
  - Welcome screen `:191` — `font-display text-4xl font-semibold tracking-tight text-ink-50 sm:text-5xl`. **Hand-rolled** despite `t-section` and `t-hero` existing. Five hand-rolled h1/h2 sizes across the onboarding flow: `:191` 4xl/5xl, `:223` 3xl, `:259` 3xl, `:299` 3xl. These all want `t-section` (the `:191` one wants `t-hero`).
  - Body copy `:194` — `mt-4 max-w-xl text-lg text-ink-300`. Should be `t-body mt-6 max-w-xl` (18px is the body token).
  - Card buttons `:230-244, :265-280` — `border bg-ink-950 p-4 text-left transition` with selected state `border-green-500 bg-ink-900` and unselected `border-ink-800 hover:border-ink-600 hover:bg-ink-900`. **No `dojo-card-interactive` use** — the system was built but not adopted. The whole onboarding screen reads as "pre-system" while the rest of the site reads as "post-system."
  - Skip link `:336` — `text-xs text-ink-500 underline-offset-4 hover:text-ink-300 hover:underline`. Should be `dojo-btn-tertiary` for visual consistency with footer skips elsewhere.
- **Pristine equivalent**: A user landing on `/onboarding` for the first time should see the **same** type scale, **same** card pattern, **same** button hierarchy as the home page they came from. Currently the `/onboarding` route looks like it was made by a different designer at a different time.
- **Concrete change**:
  - `app/onboarding/page.tsx:172` — `rounded-full` → drop. Sharp progress segments.
  - `:191` — replace `font-display text-4xl font-semibold tracking-tight text-ink-50 sm:text-5xl` with `t-section`. The welcome screen H1 is *not* the page hero — it's a step title in a wizard. `t-section` is the right token.
  - `:223, 259, 299` — same swap to `t-section`.
  - `:194` — `mt-4 max-w-xl text-lg text-ink-300` → `t-body mt-6 max-w-xl`.
  - `:230-244, :265-280` — replace card buttons with `dojo-card-interactive` + an inner `t-h3` for label and `t-body-sm text-ink-500` for blurb. The `selected` state would override the hover styles — needs a new `dojo-card-interactive--selected` modifier:
    ```css
    .dojo-card-interactive[aria-pressed="true"],
    .dojo-card-interactive--selected {
      border-left: 2px solid var(--color-green-500);
      background: var(--color-ink-900);
      padding-left: calc(1rem - 1px);
    }
    ```
  - `:336` — `text-xs ... underline` → `dojo-btn-tertiary`.
- **ROI**: HIGH. Onboarding is a 5-screen sequence — every learner experiences it once, and it's the only place where the brand has *time* (multiple screens) to land.

### 16. Footer (home) — `app/page.tsx:202-219`

- **Current**: `flex flex-wrap items-baseline justify-between gap-3 border-t border-ink-800 pt-6 text-xs text-ink-600`. The kbd at `:205` uses `rounded border border-ink-700 bg-ink-900 px-1 py-0.5 font-mono text-[10px] text-ink-300` — should be `dojo-kbd` (proposed in §5). The `text-ink-600` color of the surrounding text fails the `--ink-600` decorative-only rule (`COLORS.md:60` — "ink-600 is now reserved for non-text decorative borders only" per `globals.css:11-13` comment). Body text on ink-950 needs ≥ ink-500 to clear AA.
- **Pristine equivalent**: Vercel / Linear footers use a single mono micro-text color (ink-500) and clearly distinguish kbd glyphs from body text.
- **Concrete change**:
  - `app/page.tsx:202` — `text-xs text-ink-600` → `t-mono-meta` (already 11px ink-500, AA-compliant per `globals.css:11`).
  - `:205-207` — `rounded border border-ink-700 bg-ink-900 px-1 py-0.5 font-mono text-[10px] text-ink-300` → `className="dojo-kbd"` (proposed §5).
- **ROI**: MEDIUM-HIGH. AA fix + system honor in one move.

### 17. About page — `app/about/page.tsx`

- **Current**: Mostly system-honored — uses `t-hero / t-section / t-eyebrow / t-body / dojo-btn-primary / dojo-btn-secondary`. **Drift points**:
  - WEDGE column body `:137` — `font-display text-base leading-snug text-ink-200`. Should be `t-body-sm` (15px ink-400). Hand-roll.
  - WEDGE column eyebrow `:134` — `font-mono text-[10px] uppercase tracking-[0.3em] text-ink-400`. Tracking is `0.3em` not `0.4em`; size is `10px` not `11px`. Doesn't match `t-mono-meta` or `t-eyebrow`. Hand-roll.
  - "the loop" step cards `:174-182` — `font-mono text-[11px] tracking-wider text-ink-500` (the number) → `t-mono-meta`. The title `mt-1 font-display text-2xl font-black tracking-[-0.02em] text-ink-100` → `t-h2`. The body `mt-3 font-display text-sm leading-snug text-ink-300` → `t-body-sm`.
  - Comparison table `:199-219` — `font-mono text-[11px] uppercase tracking-[0.25em]` headers → `t-eyebrow` (with adjusted tracking) or `t-mono-meta`. The table uses `0.25em` tracking, eyebrow uses `0.4em`, mono-meta uses `0.05em`. Three custom tracking values for what's structurally one role. Pick `t-mono-meta`.
  - FAQ list border `:289` — `border-l-2 border-ink-800 pl-5`. **Good**: this is the seed of the code-fold-rail motif. Honor it elsewhere.
  - About page footer `:317-329` — `font-mono text-[11px] tracking-wider text-ink-500`. Should be `t-mono-meta`. Hand-roll.
- **Pristine equivalent**: Stripe / Linear docs have ZERO hand-rolled `font-mono text-[Nx]` patterns — they all flow through utility classes.
- **Concrete change**: Sweep `app/about/page.tsx` to use only `t-*` and `dojo-*` utilities. Specifically the lines noted above (`:134, 137, 174, 177, 180, 199, 215-216, 317`). Roughly 8 className edits.
- **ROI**: MEDIUM. About page is high-share but already 90% on-brand; the last 10% is the pristine bar.

### 18. Color use of `--ink-600` and `text-ink-200` — sitewide

- **Current**: `globals.css:11-13` documents that `--color-ink-600` is "reserved for non-text decorative borders only" (because `#52525b` failed AA at 2.48:1 against ink-950). `--color-ink-500` was bumped to `#8a8a93` to clear 4.5:1. **But text uses of ink-600 still ship**: `app/page.tsx:202` (`text-ink-600`), `PersistentIDE.tsx:321, 349, 350` (`text-ink-600`), `LoginToSave.tsx:267` (`text-ink-600`), `DailyGoalDial.tsx:111` (`text-ink-600`), `ChapterNav.tsx` no occurrences (clean). Five places where text fails AA against ink-950.
- **Pristine equivalent**: AA compliance is the floor for "real product." Stripe / Vercel / Linear all clear AA on every body-text surface. WCAG AAA where feasible.
- **Concrete change**: Find/replace all `text-ink-600` with `text-ink-500` for *text* usages. Keep `border-ink-600` if it appears (decorative). One pass, ~8 file touches.
- **ROI**: HIGH. AA compliance is non-negotiable for pristine.

### 19. Eyebrow color — `t-eyebrow` vs hand-rolls

- **Current**: `globals.css:210` — `t-eyebrow color: var(--color-green-500)`. **All eyebrows are ember-green by token.** Then several eyebrows in the codebase override the color: `PhaseBandedRailClient.tsx:138` (`text-ink-500` on the chapter-tile eyebrow), `app/page.tsx:189` (`text-ink-500` on legacy chapter eyebrow), `StepFooter.tsx:87` (no green), and on the home `<section>` heading at `app/page.tsx:165` the `t-eyebrow` reads "25 chapters · 624 steps · free forever" in *full ember*. Three different eyebrow color states (ember / muted ink-500 / ink-400) for what should be *one* role.
- **Pristine equivalent**: Linear's eyebrow color = always ink-400; their `accent` eyebrow gets a separate utility (`t-eyebrow-accent`). Stripe similarly.
- **Concrete change**: Split the eyebrow into two roles:
  ```css
  .t-eyebrow { /* unchanged base — but switch to ink-500 default */
    color: var(--color-ink-500);
  }
  .t-eyebrow-accent {
    color: var(--color-green-500);
  }
  ```
  Sweep: pages that want emphasis (`app/page.tsx:165`, hero eyebrow, about hero eyebrow) get `t-eyebrow-accent`. Pages that want metadata (`PhaseBandedRailClient.tsx:138`, `StepFooter.tsx:87`) get `t-eyebrow` (now ink-500). The brand thesis is *one accent* — eyebrows that claim ember should be reserved for moments where the eye is *meant to land*. Today it's everywhere.
- **ROI**: HIGH. Single highest-leverage hue-discipline fix on the property.

### 20. Border rhythm — hairline vs heavier

- **Current**: Hairlines (`border` = 1px) ship in 95% of contexts. Heavier borders ship in 4 places: card-highlight left rail (`border-l-2`, good), phase band left rail (`border-l-2`, good), file-tab active underline (`border-b-2`, good), focus-visible double-ring (`box-shadow: 0 0 0 4px`, good). **Inconsistent**: `HeroBugSnippet.tsx:11` uses `border-l-2 border-green-500` — same treatment as the resume CTA highlight card. The snippet is *content*, the resume card is an *action*. Same border weight conflates them.
- **Pristine equivalent**: Linear distinguishes "content callout" (1px hairline + tinted bg) from "primary action" (2px ember left rail + plain bg). Same hue, different weights = different roles.
- **Concrete change**: `HeroBugSnippet.tsx:11` — `border-l-2 border-green-500` → `border-l border-ink-700` and add `bg-ink-900` (already shipping). The snippet is content; ink-700 left rail is enough. Reserve the 2px ember left rail for *clickable* highlight cards. Then there's *one* visual rule: 2px ember = "click me," 1px ink = "read me."
- **ROI**: MEDIUM. Disambiguates content vs action across the page.

### 21. Loading + empty + error states

- **Current**:
  - **Pyodide loading** (`PersistentIDE.tsx:83-87`) — static text with spinner. Voice still title-case (Booting Python). Per §11 fix above, lowercase. **No animation upgrade** to the rolling terminal init log. The audit-v1 §loading proposed it; not landed. *Still casual.*
  - **Empty output** (`PersistentIDE.tsx:339-341`) — `[promptdojo:~]$ _` with `cursor-blink`. **On-brand. Keep.**
  - **Skeleton primitive** (`globals.css:369-373`) — exists, used at `HomeClient.tsx:41` only. Good ship; not yet propagated to chapter tiles during getV2Toc resolution.
  - **404** — `app/not-found.tsx` does not exist (per audit-v1 §404). Next.js default fallback ships. **Pristine miss.**
  - **Error states** in StepFooter / lesson — no design exists for "your code threw an error and we want to surface it gently." Stderr renders as `text-err` raw text in the IDE output (per §13 fix above, add a left rail).
  - **Loading state for the chapter rail** — `PhaseBandedRailClient.tsx:42-55` reads progress on mount, but doesn't render skeletons during the fetch. The first paint shows 0/N for every chapter while progress hydrates. Visible flicker.
- **Concrete change**:
  - **Pyodide init log** — refactor `PersistentIDE.tsx:84-87` STATUS_COPY to a sequence rendered with GSAP stagger:
    ```tsx
    {/* idle/loading state replacement */}
    <div className="font-mono text-[12px] text-ink-500">
      <div>❯ booting pyodide</div>
      <div className="opacity-80">❯ loading interpreter</div>
      <div className="opacity-60">❯ stdlib ✓</div>
      <div>❯ ready<span className="cursor-blink">_</span></div>
    </div>
    ```
    Lines fade in over 2s (`stagger: 0.5`). Last line gets the blink. Replace lines 280-283 of `PersistentIDE.tsx`. This is the brand's exact moment.
  - **404 page** — create `app/not-found.tsx`:
    ```tsx
    export default function NotFound() {
      return (
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
          <div className="t-eyebrow">404 ─ page not found</div>
          <h1 className="t-hero mt-6">where are you trying to go?</h1>
          <p className="t-body mt-8">
            this url doesn't exist. start over from{" "}
            <Link href="/" className="text-green-400 underline-offset-2 hover:text-green-300 underline">home</Link>.
          </p>
          <pre className="t-code mt-12 text-ink-500">
            ❯ try / or /learn<span className="cursor-blink">_</span>
          </pre>
        </main>
      );
    }
    ```
  - **Chapter rail skeleton** — add to `PhaseBandedRailClient.tsx:99-107` an `if (Object.keys(doneBySlug).length === 0)` branch that renders 25 `skeleton`-class divs. Eliminates the 0/N flicker.
- **ROI**: HIGH. Pristine is judged on the edges. 404 + boot-log are the tells.

### 22. Animation craft — hover, transitions, reveals

- **Current**:
  - Hover transitions use `dojo-hover` class at `globals.css:357-362` (140ms), but adoption is thin. Most components use Tailwind's default `transition` which is 150ms cubic-bezier — close but not aligned.
  - The `cursor-blink` keyframe is correct (1Hz steps(1)) — the brand heartbeat. ✓
  - **Missing**: entrance animations on the hero (per `MOTION.md:25` — `gsap.from(el, { y: 60, ... ease: "expo.out" })`). The hero just paints in. No GSAP timeline for `app/page.tsx:102-114`.
  - **Missing**: Run-button "depress" animation. The button has `hover:bg-green-400` (color shift only). A proper key affordance would translate-y 1px on `:active` so it feels pressable.
  - **Missing**: scroll-jacked or restrained reveals on the chapter rail. Stripe / Linear marketing pages use a single 200ms fade-up on each section as it enters viewport. Promptdojo just appears.
  - **Bad**: `ProgressHairline.tsx:51` — `transition-[width] duration-300 ease-out`. 300ms is *outside* the 120-180ms motion budget (`MOTION.md:55`). Progress bars are an exception per audit-v1 (slower because users want to *see* the fill), but the duration was never updated to use a consistent token.
- **Pristine equivalent**: Linear has *one* duration for hover (120ms), one for entrance (300ms ease-out), one for celebration (600ms back.out). Three tokens, locked.
- **Concrete change**:
  - Codify durations in `globals.css`:
    ```css
    :root {
      --t-hover: 140ms;
      --t-enter: 280ms;
      --t-celebrate: 580ms;
      --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
      --ease-back: cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    ```
  - Switch every `transition` to use these vars or the `dojo-hover` class.
  - Add a `:active` state to `.dojo-btn-primary`: `transform: translateY(1px); transition-duration: 80ms`. Tiny — but keys press.
  - Bump `ProgressHairline` transition to a custom `transition-[width] duration-[280ms] ease-out` using `--t-enter`.
  - Add a single GSAP entrance to the home hero (`app/page.tsx:102-114`) — `slam` pattern from `MOTION.md:21` for the `t-hero` headline only. No other elements animate on entrance — restraint is pristine.
- **ROI**: MEDIUM. Animations are the difference between "tasteful static page" and "alive product."

---

## System-level moves

### Type scale

The existing `t-hero / t-section / t-h2 / t-h3 / t-body / t-body-sm / t-eyebrow / t-mono-meta / t-code` (`globals.css:154-226`) are correct shipping sizes. Verifications:

| Token | Size | Weight | LH | LS | Usage check |
|-------|------|--------|----|----|----|
| `t-hero` | clamp(64-120px) | 900 | 0.92 | -0.045em | ✓ home + about hero |
| `t-section` | clamp(36-56px) | 800 | 1.0 | -0.03em | ⚠ onboarding hand-rolls instead |
| `t-h2` | 28px | 700 | 1.2 | -0.02em | ⚠ HomeClient uses for resume card title (works, but resume-card titles want 24px feel) |
| `t-h3` | 20px | 600 | 1.3 | -0.01em | ⚠ chapter tile uses (per §8, downsize to 15px font-semibold) |
| `t-body` | 18px | 400 | 1.55 | -0.005em | ✓ honored |
| `t-body-sm` | 15px | 400 | 1.55 | 0 | ✓ honored |
| `t-eyebrow` | 11px | 800 | 1 | 0.4em | ⚠ color discipline (per §19, split into `t-eyebrow` + `t-eyebrow-accent`) |
| `t-mono-meta` | 11px | 500 | 1.4 | 0.05em | ✓ honored |
| `t-code` | 14px | 400 | 1.55 | 0 | ✓ honored |

**Add**: a `t-h4` at 16px / 600 / 1.4 / -0.005em. The chapter tile title (per §8) needs a downsize from `t-h3` 20px to ~15-16px. `t-h4` is the missing token.

**Add**: `t-eyebrow-accent` for ember-colored eyebrows (per §19).

### Spacing tokens

Concrete pixel values used across the site:

| Tailwind | Pixels | Rule | Honored? |
|----------|--------|------|----|
| 1 | 4px | within mono labels | ✓ |
| 2 | 8px | tight gap (icon + text) | ✓ |
| 3 | 12px | within a card | ⚠ inconsistent — some cards use 12, some 16 |
| 4 | 16px | between caption + title | ✓ |
| 6 | 24px | card padding (highlight) | ✓ |
| 8 | 32px | between sibling cards | ⚠ home page uses `gap-6` (24px) for the 3-card row at `:137` |
| 12 | 48px | major intra-section break | ⚠ rare |
| 16 | 64px | between hero elements | ⚠ proposed in §3, not adopted |
| 24 | 96px | between page sections | ✓ on home |

**Tighten**:
- `app/page.tsx:137` — `gap-6` (24px) → `gap-8` (32px) on the 3-card row to match the card-rhythm rule.
- `PhaseBandedRailClient.tsx:98` — `gap-3` (12px) → `gap-4` (16px) on the chapter tile grid. 12px gaps feel cramped at 4-col density on a wide screen.

The `space-y-3 / space-y-8 / space-y-24` semantic rhythms specced in audit-v2 §6 were never codified as utility classes. They should ship as Tailwind utilities so reviewers can grep for "non-rhythm" gaps:

```css
/* In globals.css after the t-* block */
.v-tight   { row-gap: 12px; }
.v-card    { row-gap: 32px; }
.v-section { row-gap: 96px; }
```

### Card variants — count + characteristics

Currently in `globals.css`: 3 variants.

| Variant | Background | Border | Use |
|---------|-----------|--------|-----|
| `dojo-card` | ink-900 | ink-800 1px | static content (3-card row) |
| `dojo-card-interactive` | ink-950 | ink-800 + 1px left | clickable (chapter tile) |
| `dojo-card-highlight` | ink-900 | 2px ember left + ink-800 elsewhere | primary CTA (resume) |

**Proposed addition**: `dojo-card-quiet` (per §6) — *transparent* background, ink-800 1px border, used for non-interactive concept tiles where the brand wants air, not weight.

```css
.dojo-card-quiet {
  background: transparent;
  border: 1px solid var(--color-ink-800);
  border-radius: 0;
  padding: 1.5rem; /* 24px */
}
```

Four variants. Each visually distinct at a glance. Each reusable. No new variant unless a strictly new role appears.

### Button hierarchy — three tiers

Already codified in `globals.css:273-340`. Adoption gap:

| Component | Current | Should be |
|-----------|---------|-----------|
| `PersistentIDE.tsx:296-310` Run | hand-rolled | `dojo-btn-primary` |
| `StepFooter.tsx:103-118` Hint | hand-rolled `border-ink-800` | `dojo-btn-secondary` |
| `StepFooter.tsx:119-128` Skip | hand-rolled | `dojo-btn-tertiary` |
| `LoginToSave.tsx:236-253` Save | hand-rolled | `dojo-btn-primary` |
| `app/onboarding/page.tsx:336` Skip | hand-rolled `text-xs underline` | `dojo-btn-tertiary` |

Five button instances still off-system. One sweep.

**Add a `:active` state** to `dojo-btn-primary` (`globals.css:291`):
```css
.dojo-btn-primary:active {
  transform: translateY(1px);
  transition-duration: 80ms;
}
```

### Focus + hover canon

`globals.css:343-354` codifies `*:focus-visible` (single rule) and `button/a:focus-visible` (double-ring). **Verified**: shipping correctly.

`globals.css:357-362` codifies `.dojo-hover` at 140ms. **Adoption gap**: most hand-rolled `transition` uses on `LoginToSave.tsx`, `FollowOnXPill.tsx`, `GitHubStatsPill.tsx`, `Wordmark.tsx` — Tailwind's `transition` default is 150ms cubic-bezier. 10ms off but the timing function differs. Sweep all `transition` shorthand → `dojo-hover` for sitewide alignment.

### Loading skeletons — concrete patterns

Add per surface:

| Surface | Skeleton shape | File |
|---------|--------------|----|
| Resume card | `h-[124px] skeleton` (already shipping) | `HomeClient.tsx:41` ✓ |
| Chapter tile (during getV2Toc) | `h-[180px] skeleton` (4-col grid × 25) | `PhaseBandedRailClient.tsx` add |
| Lesson sidebar (during loadProgressV2) | 25 `h-7 skeleton` rows | `ChapterNav.tsx` add |
| IDE pane (Pyodide booting) | n/a — has the terminal init log per §21 | — |

Skeletons need a real "loading" trigger — the rail and sidebar currently render with empty progress on first paint, then update. Wrap the post-mount render in `if (!hydrated) return <SkeletonGrid />`.

### Animation tokens

Codify three durations + two eases in `:root`:

```css
:root {
  --t-hover: 140ms;
  --t-enter: 280ms;
  --t-celebrate: 580ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-back: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

Use them everywhere `transition` is hand-rolled. The cursor-blink keyframe stays distinct (1Hz, steps(1) — it's the brand heartbeat, not a transition).

### Iconography — Lucide audit

Already covered in audit-v2 §10 (cut). The pristine bar argues for revisiting two specific swaps:

- `<Lightbulb />` in `StepFooter.tsx:115` → `?` glyph. Cliche.
- `<Lock />` in `ChapterNav.tsx:201` → middle-dot `·`. Lock implies paywall, contradicts free-forever.

The remaining Lucide usage (`ChevronUp/Down/Right`, `Check`, `Circle`, `Loader2`, `Play`, `Terminal`, `ArrowRight`, `SkipForward`, `Flame/Sparkles/Snowflake`, `Sun`) — keep where geometric or animated; replace `Terminal` (§11) and `SkipForward` (§14) with text-only glyphs.

---

## What stays (don't touch)

These are pristine-grade already. Do not regress them in the polish sweep:

1. **`Wordmark.tsx`** lockup — `❯ promptdojo _` with 1Hz blink. The brand mark in code. Already perfect (modulo §2 baseline tweak, which is a translateY of 1px).
2. **`globals.css:117-131` dojo `.hljs-*` syntax tokens** — ember + ink, italic strings, italic comments. Pristine.
3. **`globals.css:135-145` `.cursor-blink` heartbeat** — `steps(1)`, 1Hz, prefers-reduced-motion handled. Pristine.
4. **`globals.css:343-354` focus canon** — single `*:focus-visible` rule + double-ring on buttons/links. Pristine.
5. **`PersistentIDE.tsx:339-341` `[promptdojo:~]$ _` empty output** — terminal-correct, brand-aligned, unique. Keep.
6. **`PersistentIDE.tsx:236-241` file tab active-underline** — `border-b-2 border-green-500` for active, transparent for inactive. Correct visual hierarchy. Keep.
7. **`HomeClient.tsx`** discriminated-union state machine (`guest / onboarded-not-started / in-progress`) rendering `dojo-card-highlight`. State machine + card pattern correctly composed. Keep.
8. **`StatStrip.tsx`** — single mono row, ink-700 separators, ember MIT, last-commit. Concise + on-brand. Keep.
9. **`PhaseBandedRail` shell** — phase bands with green-700 left rail are the right structural primitive. The polish (§7) is on the *active phase* state, not the band concept itself.
10. **`ProgressHairline.tsx`** primitive — three sizes, single color, aria-aware. Keep.
11. **`/changelog` page** — minimal, prose-rendered, dated. Receipts layer working. Keep.
12. **The `h-1 w-8` onboarding progress segments at `app/onboarding/page.tsx:172`** — *aside from the `rounded-full` violation*, the 5-segment ember/ink-800 rhythm is on-brand. Drop the rounding (§15), keep the rest.
13. **The about-page WEDGE column eyebrows + body structure** (`about/page.tsx:131-142`) — the asymmetric wedge layout reads sharply. Token cleanup per §17, structure stays.
14. **Voice locks**: lowercase headlines, italic-ember `it's wrong.`, `❯` prefix, `_` blinking cursor in eyebrows — the punk DNA. Polish doesn't walk back voice.

---

## Top 12 highest-ROI polish wins ranked

1. **Replace `oneDark` with custom `dojoTheme` in CodeMirror.** `PersistentIDE.tsx:5, 255` + new `lib/codemirror-theme.ts`. The most-watched surface in the product is currently themed in Atom's brand. Single largest pristine gap. Lift: 30% pristine on its own.

2. **Sweep `app/onboarding/page.tsx` to use `t-section / t-body / dojo-card-interactive / dojo-btn-tertiary`.** `app/onboarding/page.tsx:172, 191, 194, 223, 230-244, 259, 265-280, 299, 336`. The `/onboarding` route currently looks like a different designer's work. ~12 className edits. Lift: HIGH.

3. **Voice sweep — every "Booting Python" / "Output" / "Run" / "Running…" lowercased.** `PersistentIDE.tsx:84-86, 318, 308, 322-323, 344, 347`. Six string edits. Brand voice is locked elsewhere; the IDE surface speaks Title Case. Lift: HIGH (the IDE prints these thousands of times per learner).

4. **Apply `dojo-btn-primary / -secondary / -tertiary` to every hand-rolled button.** `PersistentIDE.tsx:296-310` (run), `StepFooter.tsx:103-118` (hint), `StepFooter.tsx:119-128` (skip), `LoginToSave.tsx:236-253` (save), `onboarding:336` (skip). Five swaps. Single largest button-language consistency win. Lift: HIGH.

5. **Active phase highlight on the chapter rail.** `PhaseBandedRailClient.tsx:62, 85` — compute active phase and apply `border-l-green-500 bg-ink-900/40`. Highest-leverage "I see where I am" signal. Lift: HIGH.

6. **Tighten chapter-tile typography + tier color inversion.** `PhaseBandedRailClient.tsx:76-81, 145, 146`. Smaller title (15px instead of 20px), mono-meta blurb (11px instead of 15px), tier color inversion (foundations brightest, advanced muted). Lift: HIGH (25 tiles × every visit).

7. **Split `t-eyebrow` into `t-eyebrow` (ink-500) + `t-eyebrow-accent` (green-500).** `globals.css:203-211` + sweep ~12 eyebrow uses across `app/page.tsx`, `app/about/page.tsx`, `PhaseBandedRailClient.tsx`. The brand thesis is "one accent" — eyebrows that claim ember should be the moments where the eye is *meant to land*. Today they're everywhere. Lift: HIGH.

8. **Header strip discipline — single bordered pill (FollowOnXPill), demote GitHubStatsPill to ghost, add `border-b border-ink-800`.** `SiteHeader.tsx:15` + `GitHubStatsPill.tsx:35` + standardize `h-7` on all pills. First 100ms of every visit. Lift: HIGH.

9. **AA compliance sweep — `text-ink-600` → `text-ink-500` everywhere it's text.** `app/page.tsx:202`, `PersistentIDE.tsx:321, 349, 350`, `LoginToSave.tsx:267`, `DailyGoalDial.tsx:111`. Five files, ~8 edits. Pristine = AA non-negotiable. Lift: HIGH.

10. **Sidebar polish — drop `rounded` on chapter/step rows, unify active state to ink-800 bg + ink-100 fg + 2px ember left rail, replace `<Lock />` with neutral `·` glyph, bump row gap to 4px.** `ChapterNav.tsx:75, 144, 156, 165-168, 201`. Sidebar lives on every lesson page. Lift: HIGH.

11. **Pyodide boot init-log animation.** `PersistentIDE.tsx:280-283` — replace static "Booting Python…" with the 4-line stagger. The exact moment a stranger evaluates the IDE. The single highest perceived-quality lift in the loading-state class. Lift: MEDIUM-HIGH.

12. **Create `app/not-found.tsx` 404 page** + `dojo-kbd` utility for keycaps. The 404 is a pristine litmus test — Stripe / Linear / Vercel all have branded 404s. The `dojo-kbd` utility (§5) cleans up 4 keycap surfaces in one shot. Lift: MEDIUM.

---

**Auditor notes:** The system was built well. The audit-v3 polish gap is *adoption discipline*, not new design. Specifically: the `t-*` and `dojo-*` utilities exist but `app/onboarding/page.tsx`, `PersistentIDE.tsx`, `StepFooter.tsx`, `ChapterNav.tsx`, and a handful of header components still hand-roll. A Stripe designer scanning the live site sees:

- The hero is right
- The chapter rail is right (pending active-phase highlight)
- The about page is mostly right
- But the IDE — *the most-watched surface* — is themed in Atom's purple/cyan/blue
- The onboarding wizard reads as pre-system
- The header has 4 different pill treatments
- 5 places where text fails AA against ink-950
- 5 buttons hand-roll instead of using the system tier
- "Booting Python" / "Run" / "Output" — Title Case voice violations on the most-pressed surface

These are sweep-class fixes, not redesign-class. ~6-8 hours of focused work to close the entire pristine bar. Brand fidelity goes from 99% (existing system) × 60% (adoption) = 60% effective → 99% × 95% adoption = 94% effective. The 5% remaining is illustration / motion / sound design, which is V3 territory by every prior audit's call.

**The pristine punchline:** what the audit reveals isn't that the design is wrong — it's that the *execution* of the design is incomplete. The bones are pristine. Make the surface honor the bones.
