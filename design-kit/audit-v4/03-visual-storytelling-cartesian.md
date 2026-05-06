# Visual Storytelling V4 — Composition lift from Cartesian

**Auditor:** Visual Storyteller (V4)
**Inspirational target:** https://cartesian.app/ (see `01-cartesian-walkthrough.md` + `screenshots/cartesian/*`)
**Live target:** https://promptdojo.pages.dev (`/`, `/about/`, `/curriculum/`, `/learn/v2/[ch]/[lesson]/[step]`)
**Source surveyed:** `app/page.tsx`, `app/about/page.tsx`, `app/curriculum/page.tsx`, `components/v2/HomeClient.tsx`, `components/v2/PhaseBandedRail*.tsx`
**Companion:** UI Designer audits surface-level polish; this audit owns macro composition, page rhythm, narrative flow.
**Out of scope:** color/type/spacing values (UI Designer), copy (Brand Guardian).
**Priors honored — do NOT repeat:** `audit-v3/03-visual-storytelling.md` already specced three-act home, two-column chapter index, lesson-pane personalities, status-bar footer, chapter-mark anchor, divider canon. This V4 starts where V3 stopped — the question now is what *Cartesian specifically* changes about those moves, not whether to make them.

---

## The compositional thesis (1 sentence)

**Cartesian proves a single-page sales-letter (one URL, ten acts, vertical pacing as melody) earns more authority than a multi-page site of equal-weight slabs — Promptdojo's V4 move is to *collapse `/about` into `/`* as a long sales-letter, *demote `/curriculum` to a deep-link target inside that page*, and *re-orchestrate the home as a typeset document with five distinct page-roles* (Title → Sales pitch → Receipts → Syllabus → Anti-feature litany → Colophon) instead of the current six peer slabs across three URLs.**

V3 already knew the home should be three acts. Cartesian's evidence makes a stronger move available: it should be **one act per scroll-section across one page**, not three acts across three URLs.

---

## Per-page composition critique

### Home (`/`)

**3-second read (current).** Wordmark eyebrow → giant `ai writes this. it's wrong.` → tagline → bug snippet → primary CTA + secondary "or pick your chapter ↓" → welcome-back/guest card → 3-up "read / catch / direct" cards → StatStrip → PriceBand → eyebrow `25 chapters · 624 steps · free forever` → PhaseBandedRail (5 phase sections) → legacy `<details>` → footer line. That's **eleven peer surfaces stacked vertically** on one page. The hero lands. Everything after lands as *another slab* because none of the surfaces visually outranks its neighbors. (V3 called this "six peer slabs"; PR 4 + PR 6 + the legacy `<details>` brought it to eleven.)

**Cartesian's analogous surface (`screenshots/cartesian/cartesian-home-1920-full.png`).** Cartesian also runs ~10 sections, but each one *looks like a different page*: the hero is centered + airy + film-embed; the feature rows are two-column asymmetric with framed visuals; the stats row is a horizontal blue numerical strip; the TOC is a hairline-ruled accordion list with no card; "Buy Once. Own Forever." is centered short-line poetry; the pricing block is three square-bordered receipt cards; the FAQ is another accordion; the footer is an illustration + heartbeat. **Same number of sections, ten different compositions.** Promptdojo runs eleven sections in one composition (max-w-6xl card grid) — the eye reads it as a list, not as a document.

**What Cartesian does compositionally that promptdojo doesn't.**
1. Each section has a *signature shape*. Two-column asymmetric, full-bleed numerical row, hairline accordion, square-corner card row, centered poetry stack, illustration footer. The signature shape *is* the section's identity — before the words land, the shape says "this is a different chapter."
2. The container width *changes per section*. The hero is narrow-centered (~700px copy column inside a ~1100px outer). The TOC accordion is full ~1100px width. The pricing row uses the full width. Promptdojo holds every section at `max-w-6xl px-6` (`app/page.tsx:92`) — same outer chrome on the hero, the 3-up, the rail, and the footer.
3. Visual anchors land *inside* sections (framed GIFs, embedded film, illustration). Promptdojo has one anchor (`HeroBugSnippet`) and it sits *between* the tagline and the CTA — between the verbal claim and the verbal CTA, instead of beside the headline as visual evidence.
4. The "anti-feature litany" gets its own dedicated section (a centered six-line stack with a `+` divider). Promptdojo has the same energy fragmented across the StatStrip's `$0 forever`, the about-page comparison table, and the PriceBand — three places, three compositions, no single moment of "no signup. no tracking. forever."

**Recommended layout shift.** Restructure home into **five compositional movements**, each with its own signature shape:

- **Movement 1 — Title page (≈85vh).** Centered eyebrow, hero, tagline, single primary CTA. The bug snippet **leaves Movement 1** entirely (moves to Movement 2). Massive air above and below. No StreakWidget mounted for guests. No secondary "pick your chapter" link. **Container: narrow-centered, ~720px text column.**
- **Movement 2 — The pitch (asymmetric two-column).** Headline left ("read what ai wrote / catch what it got wrong / direct it deliberately" repurposed as a single 3-line headline), bug snippet right at 40% width as the visual evidence. The 3-up cards collapse into this section as three short paragraphs flowing under the headline (no card chrome). **Container: asymmetric 60/40, full ~1080px.**
- **Movement 3 — Receipts strip (full-bleed horizontal).** StatStrip promoted to full-width hairline-bordered section divider — `25 · chapters / 624 · steps / 8h · est. / $0 · forever`. Zero left/right padding inside the strip; numbers dominate. This is the section that *signals "real curriculum,"* the way Cartesian's blue-stat row signals "comprehensive treatment." **Container: edge-to-edge within max-w, four numbers in a horizontal row.**
- **Movement 4 — The syllabus (hairline accordion + rail).** Eyebrow `the curriculum`, then the PhaseBandedRail at scale. This is the page's longest section by height. The legacy `<details>` is killed entirely from `/` — moved to a footer link on `/changelog`. **Container: full ~1080px, generous internal phase rhythm.**
- **Movement 5 — The litany + colophon.** A centered `pyloft is.` pull-quote followed by a six-line stack (`free.` `open source.` `no signup.` `no tracking.` `no upsell.` `forever.`), a literal `+` glyph divider, then the colophon strip (mono status bar with last-commit, ⌘⇧B hint, MIT license). **Container: narrow-centered for the litany, full-bleed for the colophon.**

The PriceBand (currently between the 3-up and the rail) folds into Movement 5's litany — it's the same idea told twice today.

### About (`/about/`)

**3-second read (current).** Eyebrow `❯ what is this?` → hero `a python school built for the version of you that lives in cursor.` → CTAs → StatStrip → 8 sections, each with eyebrow + t-section h2 + content (wedge cards / curriculum cards / loop cards / comparison table / founder prose / free-forever block / FAQ dl / final CTA + footer). **Eight peer sections, all `max-w-4xl`, all with `border-b border-ink-800` divider, all `py-16` padding, all eyebrow-then-h2-then-grid rhythm.** Reads as a faithful brochure. V3 already flagged this; Cartesian's evidence sharpens the diagnosis.

**Cartesian's analogous surface.** Cartesian *has no /about*. The about content lives in the home page's middle three sections (the 5 feature blocks + "Buy Once. Own Forever." + the FAQ). The author byline + footer doodle replaces an "about the founder" page. **Cartesian deletes /about by inlining its functions into /.**

**What Cartesian does compositionally that promptdojo doesn't.** Cartesian doesn't *separate* "what is this" from "what's inside" from "who built it" from "FAQ" — it *interleaves* them in one scroll. A skeptic doesn't have to navigate to learn; the answers arrive in the order doubts do. Promptdojo currently asks the skeptic to (a) land on `/`, (b) get curious, (c) navigate to `/about/`, (d) get convinced, (e) navigate back to `/`, (f) start. Three URL transitions for one decision.

**Recommended layout shift.** **Collapse `/about/` into `/`** (see "Single-page-sales-letter question" below for the decisive recommendation). On `/`:
- The wedge content (`wedgeColumns` in `app/about/page.tsx:14-27`) becomes Movement 2's pitch (replacing the current 3-up).
- The comparison table becomes a sub-section inside Movement 5's litany (the table IS an anti-feature visual — old way / new way is a structural cousin of "no X. no X.").
- The "loop" (read / run / fix) becomes a horizontal sequence with arrows above the syllabus in Movement 4 (process flows into menu).
- The founder prose becomes a single paragraph in the colophon (Cartesian-style "crafted with ♥ by elias yilma" — one line, one byline, one link).
- The FAQ becomes a hairline-ruled accordion (matching Cartesian's TOC pattern) at the bottom of Movement 4, before Movement 5.

If `/about/` survives V4 at all (see decision below), it becomes a **redirect to `/#what-is-this`** rather than a separate page.

### Curriculum (`/curriculum/`)

**3-second read (current).** Eyebrow `the whole course` → headline `25 chapters · 624 steps · ~8 hours` → StatStrip → PhaseBandedRail with all chapters expanded showing lesson lists. **Single-purpose page, two layers (header + rail).** Composition is fine — this page already has *one shape*, which is more than the home or about can say. But the page exists *only* because the home page's PhaseBandedRail is collapsed-by-default and there was no other place to surface the full lesson tree.

**Cartesian's analogous surface (`screenshots/cartesian/cartesian-stats-row-1920.png` lower half, `cartesian-faqs-1920.png`).** Cartesian's TOC is **inline on `/`**, with 22 chapter accordions that expand to 2-3 line descriptions. There is no `/toc` URL. The accordion *replaces* a "course outline" page. **Same content density as Promptdojo's `/curriculum/`, zero URL cost, more discoverable, doubles as scroll-bait on the homepage.**

**What Cartesian does compositionally that promptdojo doesn't.** The accordion-on-home is a *compositional primitive* — hairline-ruled rows, `+` icon, expand-to-description, 22 items in a single uninterrupted list. It feels like a textbook's index page. Promptdojo's PhaseBandedRail is grid-of-cards with phase-headlines, which reads as a *grid* (peers in a set), not as a *list* (sequence). Both are valid; only the list reads as "table of contents."

**Recommended layout shift.** Two options, equally defensible:

1. **Replace `/curriculum/` with `/#syllabus`** — kill the URL. Movement 4 of `/` mounts the PhaseBandedRail with `expanded` prop on (lesson lists visible by default for desktop, collapsed on mobile). The page becomes one anchor scroll on `/`. Cartesian-pure.
2. **Keep `/curriculum/` but reshape it as a hairline-accordion list** — 25 chapter rows, full-width, no card chrome, `+` icon expands to lesson list + blurb. The page becomes the "textbook index" surface, distinct from `/` (which is the marketing surface). Promptdojo-honest (the curriculum is the product; it earns a URL).

I lean **option 2** because Promptdojo's curriculum is genuinely the product (Cartesian's TOC is sales material; Promptdojo's curriculum is the noun). But the page composition needs to shift from "PhaseBandedRail at full bore" to "hairline-ruled accordion list" — same content, different shape. The PhaseBandedRail stays on `/` (Movement 4) as the marketing view; `/curriculum/` becomes the index view. Two shapes, two purposes.

### Lesson page (`/learn/v2/[chapter]/[lesson]/[step]`)

**3-second read (current).** Three panes: sidebar (chapter tree), prompt pane (centered ~480px), IDE pane (filename tab + editor + Run + output). Workspace surface — already correctly scoped per V3.

**Cartesian's analogous surface.** Cartesian has *no workspace*. The downloaded app has interactive panels (the framed GIFs are the marketing simulation), but the website never shows a pane layout. **Cartesian doesn't help us here directly.** What it *does* offer is **the discipline of pre-rendered framed visuals** — the marketing site never tries to recreate the IDE in CSS; it screenshots the real one and frames it. Promptdojo's lesson page IS the IDE, so the analog is inverted: the IDE-as-shipped should *visually rhyme with the framed-visual treatment* on the marketing page, so the home-page screenshots and the live IDE feel like the same object at two scales.

**What Cartesian does compositionally that promptdojo doesn't (the indirect lift).** Cartesian's framed-visual aesthetic — paper-cream mat, hairline border, baked-in window chrome — is the visual signature of the product. When you see the GIF on the marketing site, the IDE you eventually open *looks like the GIF*. Promptdojo's marketing has near-zero IDE imagery (`HeroBugSnippet` is a code block, not a framed IDE screenshot), so the marketing surface and the workspace surface don't visually rhyme. The lesson page reads as a generic dark IDE; the home page reads as a punk landing page; they don't share a visual signature.

**Recommended layout shift.** No changes to the lesson page's *internal* composition (V3's pane-personality recommendation stands). The change is to the *marketing surface*: add **one framed IDE screenshot** to Movement 2 of `/` — a pre-rendered PNG of the actual lesson page with hairline border + ink-900 mat, replacing or augmenting `HeroBugSnippet`. The home-page screenshot of the IDE *establishes* what the user is buying. When they click "start chapter 1" and land in the workspace, the workspace looks like the picture. Visual continuity = trust.

The discipline: **stop CSS-recreating IDE chrome on the marketing page**. Screenshot the real one. Frame it. Ship it as a static asset. (Cartesian Pattern 4, applied inverted.)

---

## Single-page-sales-letter question

**Decisive recommendation: collapse `/about/` content into `/` as a long-form scroll. Keep `/curriculum/` as a deep secondary URL.**

### Why collapse

1. **Cartesian's evidence is empirical:** a paid premium product ($35) sells from one URL. Promptdojo is a free product with weaker conversion friction; if Cartesian doesn't need /about, neither does Promptdojo.
2. **The about page's eyebrow rhythm is already the home page's missing voice.** `/about/`'s 8 sections each open with `❯ what is this?` / `the wedge` / `the curriculum` / `the loop` / `why this, not codecademy` — that rhythm IS the brand, and it currently lives on the page no first-time visitor reads.
3. **The wedge section is the strongest content on the site and it's hidden behind a click.** "every course teaches you what python *is*. you need to know what it *isn't*." That's the headline that should be visible on `/` above the fold, not buried in section 2 of `/about/`.
4. **Three URLs of equal-weight content fragments the brand voice.** The home, about, and curriculum pages all teach the reader something different about what Promptdojo is. A single scroll teaches one thing in one order.
5. **The footer and StatStrip duplicate across pages.** Each duplication is a maintenance debt; collapse halves it.

### Why keep `/curriculum/` separate

1. The curriculum is the *product noun* — search traffic, share traffic, and "give me the table of contents" all want a stable URL. Cartesian's TOC works inline because the product is `the book`, not `the table of contents`. Promptdojo's curriculum is the product.
2. A 25-chapter expanded accordion list is too dense to inline on `/` without breaking the home page's pacing. The home gets the marketing view of the rail; `/curriculum/` gets the index view.
3. The split mirrors a textbook: cover page (`/`) and table of contents page (`/curriculum/`). Two pages is the smallest unit of "this is a real book."

### What about `/about/` long-tail SEO

The current `/about/` page can survive as a redirect (301 → `/#what-is-this`) for ~6 months to preserve any inbound links, then retire. Or — if wanted — `/about/` becomes a one-line page that says `/about/ is at /#what-is-this` with an anchor link, preserving the URL while killing the duplicate composition. Either way the *content* lives on `/`.

### The new URL surface

```
/                  — long-form sales letter (5 movements)
/curriculum/       — hairline-accordion table of contents (25 chapters expanded)
/learn/v2/...      — workspace (unchanged)
/changelog         — changelog (unchanged)
```

Three pages. Down from four. Each with one composition.

---

## Section-to-section pacing

### How Cartesian transitions between sections

**Cartesian uses *whitespace* + *shape change* + *background-tone constancy* as transitions.** No `<hr>` rules, no border-bottom dividers. Section A ends; ~120-180px of warm cream paper bg; Section B starts with a fundamentally different composition (a wide stat row after a narrow text column, or a hairline accordion after a card grid). The shape change *is* the transition. The one explicit divider on the entire page is a literal `+` glyph between "No DRM. Accessible Offline." and "Free Updates for Life." — refused as a visual rule, used as a punctuation mark.

The background never shifts. The container width *does*. The composition shape *always* shifts. The transition is felt as *melody*, not as *cuts*.

### How Promptdojo currently transitions between sections

**About page**: every section ends with `border-b border-ink-800` (`app/about/page.tsx:96, 122, 146, 168, 189, 225, 254, 296`). 8 horizontal rules in 8 sections = monotonous. Reads as "section, rule, section, rule, section, rule." Eye reads the rules as page chrome, not content.

**Home page**: pure whitespace transitions between sections (`mt-16`, `mt-24`). No rules. But the sections all share the same composition shape (max-w-6xl card grid), so the whitespace transitions *don't change the perceived composition*. Eye reads it as "section, gap, section, gap" — continuous, no melody.

**Curriculum page**: only one section, no transitions to evaluate.

**Lesson page**: pane-to-pane uses `border-ink-800` vertical dividers. Correct for workspace (panes need explicit edges).

### Concrete proposal

Adopt **the Cartesian transition canon** sitewide:

1. **Reading surfaces (`/`, `/curriculum/`, future long-form pages):** *No section dividers at all.* Whitespace + composition-shape-change is the transition. Sweep `border-b border-ink-800` from every `/about/` section (when content collapses into `/`, the border goes away with it). Pacing variation: alternate section heights (40vh hero, 30vh pitch, 25vh receipts strip, 60vh syllabus, 35vh litany, 20vh colophon) so the reader feels rhythm.
2. **Workspace surface (`/learn/v2/...`):** *Background-shift dividers between panes* (already correct per V3 — `bg-ink-900` for prompt pane, `bg-ink-950` for IDE pane). Hairline borders only at pane edges. No change.
3. **Status strips (StatStrip, footer colophon, IDE pane labels):** *Single full-width hairline above and below the strip* — the rule frames chrome, not content. This is the one place rules are correct.
4. **The literal `+` glyph as a punctuation divider** between Movement 5's litany lines and the colophon. One per page maximum. The `+` becomes the brand's secondary mark (after `❯`), used only here. Cartesian Pattern 8.

Net effect: the page reads as a typeset document with melody, not as a stack of slabs separated by horizontal rules.

---

## Visual anchors to add

Promptdojo currently ships **near-zero imagery** by deliberate kit choice (no web fonts, no illustrations, no stock). The kit explicitly defers illustration to V2. **Don't break that.** But Cartesian shows three places where a *single brand-native framed visual* per surface raises perceived production value massively without violating the kit. Each anchor below is a screenshot or diagram, not an illustration.

### Movement 1 (title page) — *the framed bug*

**Current state.** `HeroBugSnippet` is rendered in CSS as a code block with terminal chrome, mounted at `mt-16` after the tagline (between the tagline and the CTA). It works as code, but it reads as *another piece of body copy* — the eye doesn't register it as an image.

**Cartesian's evidence (`screenshots/cartesian/cartesian-features-1920.png`).** Cartesian's framed visuals (`visualisation.gif`, `editor.png`, `space_time3.png`) read as *images* because they have (a) a hairline border, (b) a paper-cream mat around the content, (c) baked-in window chrome (filename tab, traffic-light buttons in the screenshot). They don't try to BE the IDE; they're a *picture of* the IDE.

**Recommendation.** Replace the CSS-rendered `HeroBugSnippet` with a **pre-rendered framed PNG** of the same bug snippet — exported from the actual IDE (or designed to look like a framed screenshot of the IDE), with: 1px `border-ink-800` frame, ~16-24px ink-900 mat inside the frame, the bug snippet rendered in mono inside the mat, optional baked-in `❯ main.py` filename tab strip at top of the frame. **Move the frame to Movement 2 (the pitch)**, not Movement 1, so the title page stays uncluttered and the bug functions as evidence-beside-the-pitch instead of decoration-beside-the-claim.

Movement 1 has *zero* visual anchors. Pure typography. Air. The brand standing in a doorway. (Cartesian's hero has the YouTube embed below — Promptdojo's analog is to leave Movement 1 as a pure typographic hero and put the bug-frame in Movement 2.)

### Movement 2 (the pitch) — *the framed lesson screenshot + the framed bug*

**Current state.** Three flat cards, no images.

**Cartesian's evidence (`cartesian-edit-run-test-1920.png`).** Each feature row pairs prose-left with a framed visual-right. The visual carries 50% of the section's communication weight.

**Recommendation.** Add **one framed PNG screenshot of the actual lesson page** (the prompt pane + IDE pane + Run button visible) to Movement 2's right column at 40% width. This is the picture that says "this is what the workshop floor looks like." Combined with the framed bug (now in Movement 2 from above), Movement 2 has two visual anchors — the *evidence* (bug) and the *workspace* (lesson screenshot). The prose left tells *why*; the visuals right show *what*.

Effort: zero new design work. Open a real lesson page, screenshot it with browser chrome cropped, frame in Photoshop with hairline + mat, export at 2x. Drop in.

### Movement 3 (receipts) — *zero anchors, typography is the anchor*

The numbers ARE the visuals. Cartesian's blue-on-cream stat row works for the same reason — typography commands the eye when set at scale. Don't add icons, don't add charts, don't add illustrations. The four numbers `25 / 624 / 8h / $0` are the section.

### Movement 4 (syllabus) — *the curriculum-as-shape diagram*

**Current state.** PhaseBandedRail renders 5 phase sections with `border-l-2 border-green-700 pl-6` left-rail (`PhaseBandedRailClient.tsx:94`) and a card grid per phase. The rail *shape* is the visual — but it's only legible from a 50,000-foot zoom (you have to see the whole page to feel the 5-phase shape).

**Cartesian's evidence.** Cartesian's TOC is *just* a list — no diagram. But the **stats row right above the TOC** functions as the visual anchor for the syllabus section ("670+ pages, 22 chapters, 300+ visualizations" — the numbers paint the syllabus's shape before the list begins).

**Recommendation.** Above the PhaseBandedRail in Movement 4, add a **curriculum-shape diagram** — 5 phase bars stacked horizontally with chapter ticks (mini-Gantt), showing relative phase lengths and current position. Pure CSS, no asset. Acts as the visual *summary* of "what 25 chapters across 5 phases feels like." The diagram answers "how big is this?" before the rail answers "what's in it?"

This is V3's "course-as-shape" recommendation, promoted from optional to required.

### Movement 5 (litany + colophon) — *the brand glyph as punctuation*

**Current state.** No visuals. Founder line is text only. PriceBand is text only.

**Cartesian's evidence (`cartesian-faqs-1920.png`).** Cartesian's footer has a tiny pixel-art doodle (300×75 stick figures), an animated heartbeat heart, and the byline. Total visual cost: one PNG + one CSS animation. Production-value lift per pixel: enormous.

**Recommendation.** Two anchors:
1. The literal `+` glyph between the litany lines and the colophon — set at scale (~120px), centered, ember caret-blink at 1Hz on the cross-stroke. The `+` becomes the brand's secondary mark.
2. A tiny inline SVG/PNG glyph in the colophon — *not* stick figures (off-brand), but maybe an ember `❯` set at 24px next to "made by josh" with the existing 1Hz blink. Reuses the wordmark caret as a sigil.

No illustrations. No stock. No pixel-art. The brand's existing typographic vocabulary, promoted to ornament once at the page bottom.

### Sitewide motion anchor — *the cursor blink as heartbeat*

The 1Hz ember caret blink lives in the wordmark today. **Promote it to one place per movement** — five blinks across `/`. The hero eyebrow caret, Movement 2's bug-frame filename tab caret, Movement 4's eyebrow caret, Movement 5's `+` glyph, the colophon's `❯` sigil. Five blinks at the same Hz = a sitewide heartbeat. The brand's *only* motion stays consistent across the page; nothing else animates. Discipline = signature.

(V3 made this recommendation; V4 makes it *count* by reducing to 5 specific positions.)

---

## Top 8 compositional moves ranked

Ranked by storytelling impact. Each is composition only — not type values, not color values, not copy. Each is implementable from existing primitives.

### 1. Collapse `/about/` into `/` as a 5-movement sales letter

- **Surface:** `/`, `/about/` retired (or 301-redirected).
- **Compositional change:** Restructure home as five movements with five distinct shapes — Title (narrow centered, 85vh), Pitch (asymmetric 60/40 with framed bug + framed lesson), Receipts (full-bleed numerical strip), Syllabus (phase-banded rail at scale, with curriculum-shape diagram on top), Litany + Colophon (centered short-line stack, `+` divider, mono status bar). Each movement gets its own container width and composition law. The 3-up cards and PriceBand fold into the litany; the wedge content from `/about/` becomes the Pitch's headline.
- **Expected effect:** The site becomes one document instead of three slab-stacks. A first-time visitor scrolls through the entire pitch in one motion; a returning visitor sees Movement 4 (the syllabus) as the front door once ProgressV2 fires. Brand voice unifies around a single composition, not three. Highest-impact move on the site.

### 2. Delete the legacy `<details>` block from `/`

- **Surface:** `/` (`app/page.tsx:177-203`).
- **Compositional change:** The 28-chapter legacy course `<details>` is a 28-row grid of cards that, when opened, dwarfs the v2 PhaseBandedRail above it. From a narrative POV it's an "ignore this" footnote that visually behaves like an Act III. Move it to a footer link on `/changelog` (or kill it entirely if not still referenced). Movement 4 ends with the v2 rail; nothing else.
- **Expected effect:** Page stops having a "P.S. — actually here's a different version" coda. The v2 curriculum becomes the *only* curriculum visible on `/`. Highest cleanup-to-effort ratio on the page.

### 3. Promote the bug snippet from below-the-CTA to beside-the-headline (in Movement 2, framed)

- **Surface:** `/` (`HeroBugSnippet` currently at `app/page.tsx:113-115`).
- **Compositional change:** Remove the bug from Movement 1 entirely. In Movement 2, render it as a *framed* image (hairline border + ink-900 mat + baked-in `❯ main.py` tab) at 40% column width, with the pitch headline + body at 60% width left. The bug becomes evidence beside the pitch, not decoration between claim and CTA.
- **Expected effect:** Movement 1 becomes pure typography (the brand standing in a doorway, Cartesian-pure). Movement 2 gains a visual anchor that signals *code* immediately, dropping the 3-second-read time from "manifesto" to "manifesto + product category." The frame treatment makes the bug read as an *image* instead of as more body copy.

### 4. Add a curriculum-shape diagram above the PhaseBandedRail in Movement 4

- **Surface:** `/` Movement 4, optionally also `/curriculum/`.
- **Compositional change:** A horizontal 5-phase Gantt diagram — 5 bars stacked, each bar shows chapter ticks, relative phase lengths, current position (if ProgressV2 fires). Pure CSS, no new asset. Above the eyebrow `the curriculum`, below the receipts strip.
- **Expected effect:** The reader sees the shape of the course before they see the contents. Borrows Cartesian's stat-row trick (paint the size before the list) and applies it to syllabus structure. Doubles as a navigation device — clicking a phase bar scrolls to that phase in the rail.

### 5. Establish the divider canon — kill section borders on reading surfaces

- **Surface:** `/about/` (which is collapsing) and any future long-form pages.
- **Compositional change:** Sweep `border-b border-ink-800` from every reading-surface section. Whitespace + composition-shape-change is the transition. Reserve `border` for: pane edges (workspace), strip frames (StatStrip, colophon), and tile chrome (chapter cards inside the rail). Movement 5's `+` glyph is the only mid-page divider.
- **Expected effect:** Pages stop reading as "section, rule, section, rule" and start reading as "movement, breath, movement, breath." Eye reads composition changes, not chrome. Cartesian-canonical.

### 6. Reshape `/curriculum/` from "rail-at-scale" to "hairline accordion list"

- **Surface:** `/curriculum/`.
- **Compositional change:** Replace the PhaseBandedRail-with-`expanded` prop with a hairline-ruled accordion list — 25 chapter rows, full-width, no card chrome, `+` icon per row that rotates to `x` on expand, expand reveals lesson list + blurb at body-text density. Phase headlines as `<h2>` between groups of chapters, no left-rail border. Mimics Cartesian's TOC pattern exactly (`screenshots/cartesian/cartesian-stats-row-1920.png` lower half).
- **Expected effect:** `/curriculum/` becomes a textbook index page, distinct in shape from `/`'s Movement 4 (which keeps the rail as marketing view). Same data, two compositions, two roles. The accordion list is also more SEO-dense (25 chapter names + blurbs in DOM) than the collapsed rail today.

### 7. Promote the StatStrip to a full-bleed receipts strip in Movement 3

- **Surface:** `/` Movement 3 (currently `app/page.tsx:163` `StatStrip className="mt-24 mb-12"`).
- **Compositional change:** Remove `max-w-6xl` constraint on this section only — full-width bg-ink-900 strip with 1px hairline above and below, four numbers + labels in horizontal row, edge-to-edge inside the viewport, breaking the `max-w-6xl` rhythm of every other section. The strip *is* the section divider between Movement 2 (pitch) and Movement 4 (syllabus). Cartesian Pattern 5 (stat row in display blue) — but in Promptdojo's ember + ink-100 palette.
- **Expected effect:** The receipts moment gets a *signature shape* (full-bleed horizontal numerical strip) that no other section uses. The numbers do all the work; no icons, no charts. The reader feels "real curriculum" before they see the syllabus.

### 8. Vary section heights across `/` — break the monotone vertical rhythm

- **Surface:** `/`.
- **Compositional change:** Currently every section uses `mt-16` or `mt-24` and similar internal padding — all sections are roughly the same height. New rhythm: Movement 1 = 85vh (hero owns the viewport), Movement 2 = 50vh (pitch reads dense), Movement 3 = 20vh (receipts is a thin strip), Movement 4 = 100vh+ (syllabus is the page's longest section), Movement 5 = 40vh (litany + colophon settle the page). Reader who scrolls 30% has felt 3 pacing changes already.
- **Expected effect:** The page reads with melody — short, long, short, very long, medium. Cartesian's vertical rhythm is varied for the same reason: a one-dimensional stack of equal-height slabs reads as a list, a stack of varied heights reads as a composition. Lowest-engineering-cost move on the list (just changes `min-h-*` and `py-*` per section).

---

## What to preserve (do not change)

V3's preservation list still holds. Adding from V4 inspection:

- **The PhaseBandedRail's left-rail + eyebrow motif.** Already canonical. Keep it for `/`'s Movement 4. Don't apply it to `/curriculum/` (which gets the accordion treatment instead — two shapes for two roles is the win).
- **The about page's eyebrow rhythm.** It's the brand's voice. When `/about/` content folds into `/`, the eyebrows come with it (`❯ what is this?`, `the wedge`, `the curriculum`, `the loop`, `why this, not codecademy`) — they become Movement 1-5 eyebrows on `/`.
- **The `<dl>` border-left FAQ pattern from `/about/`.** The seed of the "left rail = code-fold marker" motif. Keep it; promote it as the FAQ accordion's collapsed-state treatment in Movement 4.
- **Single-CTA discipline** (V3) — Cartesian's hero has ONE button. Promptdojo's hero has two (`start chapter 1` + `or pick your chapter ↓`). V4 doubles down on V3: Movement 1 has one CTA, the syllabus link is implicit (scroll down) or moved to Movement 4 entry.
- **The wordmark + 1Hz ember caret blink.** Don't touch. Promote the blink to 4 more positions per page — that's the addition, not a replacement.

---

**Auditor's close.** Cartesian's lesson is not "use Abril Fatface" or "go warm cream." It's *one URL, one document, ten compositions, varied rhythm*. Promptdojo's V3 audit (which I authored) saw three acts on the home page; V4 with Cartesian as evidence sees five movements across one page that absorbs `/about/` and demotes `/curriculum/` to a deep-link textbook index. The bar — a typographer at Apple opening promptdojo and feeling it reads like a confident magazine spread — is hit when the page-roles are *visible as roles within a single document*, not separated across URLs. Three URLs, three compositions: today. One URL, five compositions, plus a textbook-index URL: V4. Punk preserved, structure inherited from a paid premium product.

Total estimated compositional effort if all 8 moves ship: ~16-20h (the `/about/` collapse is the bulk; everything else is hours, not days). Brand storytelling fidelity goes from "tasteful indie blog with an about page" to "one-page sales letter for a real curriculum." Free forever. No subscriptions. No DRM.
