# Visual Storytelling Audit — composition + hierarchy

**Auditor:** Visual Storyteller (Designer #2 of 2)
**Live target:** https://promptdojo.pages.dev
**Source:** `~/Developer/code-killa/`
**Companion audits:** `audit-v2/04-ui-design.md` (system tokens, type scale, button hierarchy), `audit/04-ui-design.md` (brand-fidelity drift)
**Scope:** layout, hierarchy, attention flow, narrative structure. Not type sizes, not color values, not copy.

---

## The compositional brief (1 sentence)

**Promptdojo reads top-to-bottom like a long, faithful blog post — every section a flat-weighted slab with the same rhythm — when it should read like a *book*: a thunderous title page, a one-page table of contents you can scan in three seconds, chapter-openers that earn their air, and a humble running footer; the fix is not more components but a deliberate hierarchy of *page roles* — Title, ToC, Reading Spread, Workspace, Status — each with its own compositional law.**

The site has solved the type scale and the card primitives (PRs 1–3 landed). What hasn't been solved is the **macro composition**: which sections own the page, which sections serve them, and which sections are scaffolding the eye should glide past. Right now every section is treated as a peer. A book without a hierarchy of pages is a manuscript.

---

## Per-surface composition critique

### 1. Home (`/`)

**3-second read.** A first-time visitor sees, in order: `❯ promptdojo` mono eyebrow, then the giant **"ai writes this. *it's wrong.*"** hero, then a short tagline. After 3 seconds they have the slogan but don't yet know it's a course. The bug snippet appears too late in the F-pattern to register before scroll-decision. Verdict: punk *vibe* lands; product *category* doesn't. We sell "manifesto" before "school."

**Hierarchy diagnosis (where the eye lands).**
1. **First** — hero headline (correctly biggest thing on the page).
2. **Second** — the StreakWidget pinned top-right pulls the eye away from the hero almost as hard as the hero itself, because it's the only thing with a number. For a first-time visitor with no streak, this is a phantom signal.
3. **Third** — the StatStrip and the chapter rail compete because they're vertically stacked but typographically peer-weight. The eye doesn't know which one is the answer to "is this a real course?"

**Compositional issues.**
- **Six peer slabs stacked vertically** (header → resume CTA → 3-up "what you do" cards → StatStrip → phase-banded rail → legacy-course `<details>` → footer). Visually they all weigh the same — same width, same padding rhythm, same border. The page reads as *list*, not as *narrative*. There's no "this is the moment" beat.
- **The hero, the ToC, and the receipts are all `max-w-6xl` blocks at the same indent.** A book uses width to express hierarchy: title page is centered and narrow, ToC is denser and wider, body is set to a measure. Promptdojo flattens all three to the same column.
- **The 3-up "read / catch / direct" cards sit *between* the resume CTA and the chapter rail.** That's a sales pitch dropped between two product surfaces. Either it belongs on the about page or it belongs *first* (the pitch before the receipts), not stuffed in the middle.
- **The legacy-course `<details>` element at the bottom** is a 28-chapter blob that, when opened, dwarfs the v2 rail above it. From a narrative POV it's an "ignore this" footnote that visually behaves like an Act III. Either move to footer-link or hide entirely.
- **The footer is a single line of fine print** after a page that's been a tone poem of declarative confidence. It deflates the close. A book ends with a colophon, not a faint mumble.
- **Whitespace is sized like prose** (mt-16, mt-24) when this should be a *poster*. The hero deserves a 50–60vh negative-space envelope around it. Currently `pt-8 sm:pt-14` then content starts immediately.

**Recommended layout shift.**
The home becomes a **three-act page**:
- **Act I — The Title Page** (≈ 90vh). Eyebrow, hero, tagline, bug snippet, primary CTA — and *nothing else*. No widgets. No StatStrip. No 3-up. No streak in the corner. Centered or hard-left, but bordered by air on every side. This is the brand standing in a doorway.
- **Act II — The Syllabus** (the ToC moment). Above it, a single line of receipts (StatStrip, full-width hairline-bordered, `font-mono` micro). Below it, the phase-banded rail — but with **phase-headlines that are bigger than they are now**, so the page reads like 5 *chapters of a table of contents*, each with its own opening, instead of one undifferentiated grid.
- **Act III — The Quiet Receipts.** Last-commit, changelog link, ⌘⇧B hint, MIT license — set as a **status-bar / colophon** at the page bottom, full-width, monospace, subtle. Lights-out close.

The "read / catch / direct" 3-up moves to **about** (it's a pitch, not a product surface). The streak widget is hidden on first visit (no progress yet) and the welcome-back card replaces the hero entirely on return — different page for different reader, same skeleton.

### 2. About (`/about`)

**3-second read.** Visitor sees the hero `a python school built for the version of you that lives in cursor.` and gets it immediately. About pages rarely score a clean 3-second read; this one does. Best-composed page on the site.

**Hierarchy diagnosis.**
1. **First** — the hero (correctly).
2. **Second** — the eyebrow `❯ what is this?` because the ember caret is the only chromatic mark above the fold.
3. **Third** — the next eyebrow on scroll: `the wedge`. The eyebrow rhythm carries the eye downward.

**Compositional issues.**
- **Every section has the same shape**: eyebrow → t-section h2 → grid of cards (or table). Six sections, six variations of the same composition. Faithful, but **monotone**. A book has chapters that *look different* — a spread of pull-quotes, a comparison table, a numbered list, a hero illustration. Promptdojo's about page has all of these moments *as content*, but they're rendered with the same chrome.
- **The wedge section uses 3 cards of equal width.** This should be the page's *aria* — the punk hook. A 2-column asymmetric layout (a giant pull-quote left, the three contrasts right as a stacked list) would make this section *the moment* of the page instead of one slab among six.
- **The "old way vs. promptdojo" comparison table is the strongest section** but it's buried in the middle. Visually it's the only non-card surface on the page — the eye stops there. Should be promoted: either earlier, or scaled up.
- **The FAQ at the bottom is a `<dl>` with a left-rail border** (the canonical motif). Good. But the FAQ is the last section, and it competes with the page footer for "the close." A FAQ's job is *resolution*, but it's sandwiched, not anchored.
- **The page is 8 sections × ~py-16 of vertical padding** = monotonous rhythm. Stripe / Linear / Vercel about-pages vary section heights aggressively (a hero is 80vh, a feature row is 40vh, a receipts strip is 8vh). Variation = melody.

**Recommended layout shift.**
Treat about as a **5-spread book**:
- **Spread 1 — The Hero** (40–50vh, centered, the school's thesis statement).
- **Spread 2 — The Wedge** (60vh, asymmetric — pull-quote left at hero-scale, three small mono labels right). The page's aria.
- **Spread 3 — The Curriculum** (the 5-phase grid, but **as a 1-page poster** — fixed-height tiles, `aspect-square` or `aspect-[4/5]`, mat-tile feel, ASCII numbering). One panoramic view of what the course is.
- **Spread 4 — The Method** (the loop, "read / run / fix" — a horizontal sequence with arrows, not 3 stacked cards. Process *flows*).
- **Spread 5 — The Comparison + FAQ + Founder + Receipts** (resolution. Tighter rhythm, denser type, settles the page).

Verdict: about is closest to a book of any surface; it just needs the *tempo changes*.

### 3. Chapter index (`/learn/v2/variables/`)

**3-second read.** Visitor sees `variables — what AI reaches for first` and the metadata `3 lessons · 26 steps · 88 XP`. They know they're inside a chapter, they know its scale. Strong.

**Hierarchy diagnosis.**
1. **First** — the chapter headline.
2. **Second** — the metadata line directly under it (mono, ember-tinged).
3. **Third** — the introductory paragraphs (which are *long*).

**Compositional issues.**
- **The intro is 3 paragraphs deep before the lesson list appears.** That's a magazine *opener*, not a chapter index. A returning visitor who knows what variables are has to scroll past three paragraphs to find the click. Order is reversed for the dominant user.
- **Lesson list is rendered as a flat numbered list.** No card, no metadata strip, no progress hairline. The home page's chapter tiles got an 8-field density upgrade; the lesson tiles inside a chapter got nothing. **The hierarchy inverted itself**: the macro list (chapters on `/`) is denser than the micro list (lessons inside a chapter). Should be the other way around.
- **No "you are here" position marker** at the page top — no breadcrumb, no phase eyebrow, no "phase 01 · ch 01 · variables." The user knows they're at *a* chapter; they don't see they're at chapter 01 of 25 in phase 01 of 5.
- **No visual divider between intro prose and lesson list.** The two genres of content (reading vs. doing) are typographically peer, so the lesson list reads as more prose, not as the *menu*.
- **No call-to-action above the fold.** The "start chapter" button is below the lesson list, which is below 3 paragraphs of intro. A returning learner who wants to continue has to scroll past the marketing.

**Recommended layout shift.**
Chapter index becomes **two-column on desktop**:
- **Left column (60%, primary):** lesson tiles as **3 dense cards** (eyebrow `lesson 01`, lesson title, blurb, mono metadata `8 steps · ~5m`, hairline progress bar) — the same density treatment as the home rail tiles. *This is the menu.*
- **Right column (40%, secondary):** the chapter intro prose, set as a magazine sidebar — narrower measure, italic pull-quote at top, normal body below, "start chapter" sticky CTA at bottom of column.

On mobile the columns stack (lessons first, intro second). Above both columns, a single mono breadcrumb strip: `❯ phase 01 · foundations / ch 01 · variables`.

### 4. Lesson page (`/learn/v2/variables/naming-things/0`)

**3-second read.** Visitor sees three panes: a sidebar with chapter tree, a center pane with prompt, a right pane with IDE. They understand it's a workspace immediately. Composition correctly signals "you are doing, not reading."

**Hierarchy diagnosis.**
1. **First** — the prompt headline in the center pane.
2. **Second** — the IDE filename tab + Run button (right pane).
3. **Third** — the sidebar chapter list (left pane), peripheral.

**Compositional issues.**
- **The three panes are equally weighted by border treatment.** Same `border-ink-800` divider, same density, same flat fill. There's no figure-ground — no signal that the **center pane is the protagonist**. In a book, the body column is wider than the marginalia; here, the center is artificially capped at `minmax(0,480px)` while the IDE eats the rest. The protagonist is being cropped.
- **The sidebar (left pane) has too much content for peripheral status.** It lists 25 chapters with nested lesson trees and step previews. It's reading like a *primary surface* (Like a code-editor file tree) when it should be a *map you glance at*. The cognitive cost of the sidebar competes with the prompt.
- **No header on the prompt pane that anchors "where am I."** PR 5 ships a 3-node breadcrumb — but until it lands, a learner mid-lesson sees *no chapter number, no phase, no lesson-of-chapter index* on the page itself. The URL is the only signal.
- **The IDE pane has its own internal hierarchy** (filename tab → editor → output), and that hierarchy is *louder* than the prompt pane's hierarchy (headline → body → footer). The doing-surface visually outweighs the reading-surface. For a teaching app, that's inverted.
- **The mobile collapse** swaps panes (`Show prompt` / `Show editor`). The toggle is at the bottom, full-width, which is fine — but it's pill-shaped and chevron-iconed when the rest of the brand is sharp + ASCII. Small composition, big tone violation.
- **The DailyGoalDial sits in the prompt header.** It's a peripheral reward widget occupying central real estate. CEO has it parked to move to sidebar footer; visually that's correct.

**Recommended layout shift.**
The lesson chrome stays 3-pane, but with **explicit pane personalities**:
- **Sidebar** = a quiet *map*. Collapses to `w-12` rail by default with just chapter numbers; expands on hover/focus to `w-60`. Density inverts: the map is *peripheral* and *glanceable*, not a primary surface.
- **Prompt pane** = a *page from a book*. Wider (`minmax(0, 600px)` not 480), generous left/right margin inside the pane, a clear "you are here" header strip with mono breadcrumb, and a typographic measure that *invites reading*. Visually the heaviest pane.
- **IDE pane** = a *workshop bench*. Always present, always visible, but visually quieter than the prompt — `bg-ink-950` (one shade darker than the prompt's `bg-ink-900`), so figure-ground reads correctly. The Run button stays ember (it's the page's heartbeat).
- **The vertical divider between prompt and IDE thickens by 1px on focus** (already in audit-v2). This is the only piece of chrome that should ever change weight.

Net effect: the eye knows the prompt is the page, the IDE is the shop, the sidebar is the map. Right now they all read as peers.

### 5. IDE (in-pane on lesson page)

**3-second read.** A learner scanning the IDE sees: filename tab `main.py`, code editor, Run button, output panel. They understand the loop — write, run, see output — instantly. Compositionally clean.

**Hierarchy diagnosis.**
1. **First** — the Run button (ember, sharp, mono — the only chromatic statement).
2. **Second** — the code editor area (monumental, takes most of the height).
3. **Third** — the output panel (below editor).

**Compositional issues.**
- **The Run button is correct, but it's the *only* moment of vertical hierarchy.** The filename tab strip and the output panel header read as identical-weight chrome strips. A code editor that did this well (Linear's command bar, Stripe Workbench) gives each strip a different *role* through tiny composition cues — the "where you are" strip is left-anchored, the "what just happened" strip is right-anchored, the "what you're doing" strip dominates the middle.
- **The output panel sits *under* the editor in a fixed split.** When output is short (3 lines) the empty space dominates; when output is long it scrolls. Either extreme reads as wasteful. A *collapsible* output (sliding up to ~30% of pane on demand, hidden when empty) would let the editor own the pane until it has output to show.
- **The boot/loading state** (`Booting Python (one-time, ~5s)…`) currently lives *as text inside the editor area*, which conflates "the IDE is ready" and "the program ran." A separate boot strip (top of the IDE pane, dismissible) would isolate the system state from the program state.
- **No "shape" to the IDE.** Every other surface on the site has a typographic identity (headlines, eyebrows, monos, italics). The IDE is structurally a black-box-with-controls. Adding a single mono header strip per pane (`❯ main.py`, `❯ stdout`) — already specced in audit-v2 §4 — gives the IDE a *typographic* signature, not just a functional one. From a storytelling POV, the IDE today is a *tool*; with three small ❯ labels it becomes *part of the brand*.

**Recommended layout shift.**
- Three mono pane labels (`❯ editor`, `❯ stdout`, `❯ pyodide`) — small, top-aligned, ember caret, ink label.
- Output panel collapses to a 24px-tall strip when empty (`❯ stdout — press ⌘↵ to run`), expands to 30–40% of pane when populated, with a draggable handle.
- Boot state hoists out of the editor area into a horizontal status strip across the top of the IDE pane that fades out on ready.
- The Run button gets a 1px ember underline on focus that *connects visually* to the eyebrow `❯ editor` above — small move, makes the pane feel like a single composed object.

---

## Sitewide compositional patterns

### Eyebrow → headline → body → CTA rhythm

The kit-correct rhythm is **eyebrow (mono ember) → t-section headline (Fraunces 800, lowercase) → body (t-body) → CTA (sharp mono key)**. About page nails this in 6 sections. Home nails it in the hero. Chapter index breaks it (no eyebrow, headline goes straight to long body). Lesson page breaks it (no eyebrow inside the prompt pane, just an h2). **The home and lesson page should adopt the about page's discipline**: every meaningful content section opens with a mono eyebrow. That single move turns the site from "page with sections" into "book with chapters."

### Section dividers — what's the canon?

Currently three dividers coexist:
- **Border-bottom `border-ink-800`** (about page, between sections — quiet, kit-correct).
- **Whitespace only** (home page — sections separated by `mt-16/24`, no rule).
- **Background-shift** (lesson page panes — `bg-ink-900` vs `bg-ink-950`).

Pick one canon per surface role:
- **Reading surfaces** (home, about, chapter index) → **whitespace as the primary separator**, with a 1px hairline `border-ink-800` *only* between act-level breaks (not between every section). About page over-uses the rule; home under-uses it.
- **Workspace surfaces** (lesson, IDE) → **background-shift as separator**, hairline-thin borders. Already correct.
- **Status surfaces** (footer, header) → **single full-width hairline above + below**. Frame the chrome.

Rule: **one divider type per surface role**. Mixing rules within a surface = the eye reads fragmentation.

### Card grids vs. lists vs. tables — where each is right

Currently:
- **Card grid** is overused. Home uses it for resume-CTA, "what you do" cards, chapter tiles, legacy course list. About uses it for wedge, curriculum, loop. Chapter index uses *no card* for lessons (which is exactly backwards).
- **List** is rare. Lesson list on chapter index is a flat numbered list (under-styled). Sidebar tree is a list (over-densified).
- **Table** is one moment (about page comparison). It works because it's the *only* table on the site — the eye flags it as different and pays attention.

Recommendation:
- **Use card grid** for the macro ToC (the home phase rail, the about curriculum spread). Cards = peers in a set.
- **Use a styled list** for the micro menu (lessons inside a chapter, steps inside a lesson). Lists = sequence, not equivalence. Promote the lesson list to a styled-list primitive: number eyebrow + title + meta + hairline progress, *no border box*, just rows. This is the missing primitive.
- **Use a table** sparingly — once per page, max — when the content is genuinely tabular comparison. Don't add more.
- **Stop using cards for non-collection content.** The "read / catch / direct" 3-up on home is editorial copy in card form. It should be a numbered editorial spread (`01. read what ai wrote.` — Fraunces, large, with body underneath, no border box).

### Hero scale — too big, too small, too text-heavy?

**Home hero**: t-hero is now 64–120px clamp (post-PR-1). Size is right. **Composition around it is wrong** — it's missing *the breath*. A great hero is 70% air, 30% type. Promptdojo's hero starts at `pt-8 sm:pt-14` and content begins ~120px from the headline. Should be 25–35vh of clear air above the eyebrow, and 25vh below the bug snippet before the next surface starts. Right now the hero is correctly *sized* but compositionally *cramped*.

**About hero**: smaller (t-section, not t-hero). Correct — about pages don't need to declaim. Composition around it is fine.

**Chapter index hero**: `text-4xl sm:text-5xl` — about half the home hero. Reads as a chapter opener, not a page opener. Correct in spirit. But it's followed immediately by long body — should have an eyebrow and a moment of air first.

**Lesson page hero**: there *isn't* one. The prompt headline is the local hero. It's an h2-ish size in the brand, which is right for a workspace, not a homepage. Correct.

Verdict: the home hero needs *more air*, not more size. Everything else scales appropriately.

### Asymmetric layouts — would they help?

Yes, in two specific places:

1. **About page wedge section.** The "every course teaches you what python *is* / you need to know what it *isn't*" pull-quote should anchor a 60/40 asymmetric spread — pull-quote left at gigantic scale, three contrast columns right at small scale. The asymmetry signals **this is the page's moment**.
2. **Chapter index page.** Two-column 60/40 (lessons primary left, intro prose secondary right) breaks the "everything is centered max-w-6xl" monotony and gives the page a magazine feel.

Everywhere else, symmetric is correct. Asymmetric should be a *moment*, not a system — used twice, the asymmetry becomes a *signature of the special section*. Used everywhere, it becomes noise.

### Text density goldilocks zone

- **Home**: currently slightly under-dense. Hero is air-correct, but the chapter rail tiles still feel sparser than Boot.dev's. PR 3's 8-field tiles will close this.
- **About**: correctly dense. Each section has enough content to earn its slab.
- **Chapter index**: over-dense in the *intro* (3 paragraphs), under-dense in the *menu* (flat numbered list). Inverted.
- **Lesson prompt pane**: capped at 480px wide, which forces text into a narrow column. For long-form teaching prose this is too narrow — book-measure is 60–75 characters per line, the current cap puts you closer to 45–55. Bump to 600px for the prompt pane.
- **IDE**: density is functional, not aesthetic — correct.

---

## Where to add visual anchors (images / illustrations / motion)

Promptdojo currently ships near-zero imagery — only the wordmark, the bug snippet on the home hero, and the OG card. That's a deliberate posture (the kit explicitly defers illustration to V2) and **the punk-typography aesthetic depends on it**. Adding stock illustrations would destroy the brand. But there are 3–4 places where **a single brand-native anchor** would raise perceived production value massively without violating the kit.

### Home — *one anchor visual*

**The bug snippet** (`HeroBugSnippet`) is the right anchor and it's already there. The composition issue is that it sits *between* the hero CTA and the next section, so it reads as evidence-after-claim instead of as the visual hook. Move it to **immediately under the eyebrow, beside or above the headline** — the bug becomes the headline's image, not its footnote. It's the only "illustration" the home page needs.

If a second anchor is wanted, the **phase-banded rail itself becomes the visual** — 5 phase bands rendered with enough air and enough scale that the *shape of the curriculum* is the image. No new asset needed. Just compose the rail to fill 60–70vh on desktop instead of 40vh.

### About — *one anchor per spread*

About is the page that most benefits from anchors because it's currently 8 prose-equivalent slabs. Two on-brand anchors:
1. **A typographic OG-style poster between the hero and the wedge.** Reuse the OG-card art (`/og/launch/wedge` already exists at high resolution). Inline it as a 16:9 art block. It's the brand's only existing illustration; ship it on its own home page.
2. **A "course-as-shape" diagram for the curriculum spread** — 5 phase bars stacked with chapter ticks, like a long horizontal Gantt. Pure CSS, no asset. Acts as the visual *summary* of what 25 chapters means. Boot.dev does this; Pyloft hasn't.

### Chapter index — *one symbol*

A small chapter mark — a lowered-opacity giant chapter number behind the headline (`01` set at ~300px in `--ink-800`, decorative, ghosted). This is the typographic equivalent of a chapter-opener illustration in a book. Cheap, kit-correct, instant production-value lift. The audit-v1 already proposed this for chapter cards; promote it from card to *page header*.

### Lesson — *zero new anchors*

The lesson page is a workspace. Adding imagery breaks the focus. The visual anchor on a lesson page should always be the *user's own code* in the IDE — the canvas IS the anchor. Discipline here.

### Sitewide — *the cursor blink as motion anchor*

The 1Hz cursor blink is the brand's only motion. It already lives in the wordmark. **Promote it to one more place per page** as a compositional signature — the home hero's terminal eyebrow, the about page's section eyebrow on hover, the chapter-index breadcrumb, the IDE's editor pane label. Five blinks across the site = a *heartbeat*. Currently it lives in 1–2 places; promoting to 5 transforms it into a sitewide motif.

---

## Compositional moves to ship (top 8, ranked by impact)

Each move ranked by visual storytelling impact (not engineering cost). Each is *layout, hierarchy, attention flow* — none touch type values, color values, or copy.

### 1. Break the home into three acts with deliberate vertical rhythm

- **Surface:** `/`
- **Compositional change:** Restructure home as Act I (Title — hero only, 90vh of air), Act II (Syllabus — receipts strip + phase rail at scale), Act III (Status bar — quiet receipts close). Move "read / catch / direct" 3-up to about. Hide legacy `<details>` (or move to footer link). Hide StreakWidget for guests. Promote bug snippet beside the headline, not below the CTA.
- **Expected effect:** Site stops reading as "long faithful blog" and starts reading as "book opening." First scroll-decision is now between *manifesto* and *menu*, not between six interchangeable slabs. The single highest impact compositional move on the site.

### 2. Promote the chapter index from "long intro + flat list" to "menu primary, intro secondary"

- **Surface:** `/learn/v2/[chapter]/`
- **Compositional change:** Two-column desktop layout — 60% lesson cards (left, primary, dense with metadata + hairline progress, the same primitive as home rail tiles), 40% intro prose (right, magazine-style sidebar, italic pull-quote, "start chapter" sticky CTA at column bottom). Mobile stacks lessons-first. Add mono breadcrumb above both columns.
- **Expected effect:** The micro list (lessons inside a chapter) becomes denser than the macro list (chapters on `/`) — current hierarchy inversion gets fixed. Returning learner clicks from above the fold, not after scrolling past 3 paragraphs.

### 3. Give the about page tempo changes — vary section heights instead of monotone slabs

- **Surface:** `/about`
- **Compositional change:** Five spreads instead of eight peer sections. Hero (40–50vh), Wedge (60vh asymmetric pull-quote), Curriculum-as-poster (panoramic 5-phase grid, fixed-height tiles), Method-as-flow (horizontal 3-step sequence with arrows, not vertical cards), Resolution (comparison + FAQ + founder + receipts at tighter cadence). Inline OG poster between hero and wedge.
- **Expected effect:** Page goes from "8 chapters at the same volume" to "5 chapters with melody." A reader who scrolls 30% has felt 2 pacing changes already.

### 4. Establish pane personalities on the lesson page (figure / ground / map)

- **Surface:** `/learn/v2/[chapter]/[lesson]/[step]`
- **Compositional change:** Sidebar collapses to `w-12` rail by default (peripheral *map*), expands on hover/focus. Prompt pane widens to `minmax(0, 600px)` and gets `bg-ink-900` (the *page*, the protagonist). IDE pane gets `bg-ink-950` (one shade quieter, the *workshop bench*). Add 3 mono pane labels (`❯ prompt`, `❯ editor`, `❯ stdout`) — gives each pane a typographic role.
- **Expected effect:** Lesson chrome stops reading as "three equal panes" and starts reading as "page + bench + map." Eye knows where to land. PR 5's breadcrumb compounds with this.

### 5. Promote the bug snippet from below-the-CTA to beside-the-headline

- **Surface:** `/`
- **Compositional change:** Move `<HeroBugSnippet />` from `mt-10` after the tagline to a 2-column layout *with* the headline — headline left at 60%, bug snippet right at 40% on desktop. On mobile, bug appears under tagline (current).
- **Expected effect:** The headline says `ai writes this. it's wrong.` The image right next to it shows the bug. The two compose into a single thought instead of a claim followed by evidence. 3-second read time drops from "manifesto" to "manifesto + product category" because the bug image signals *code* immediately.

### 6. Reframe the home footer as a status bar (vim-style colophon)

- **Surface:** `/`
- **Compositional change:** Replace the current `border-t pt-6 text-xs` strip with a full-width `bg-ink-900` mono status bar at the page bottom — sections separated by `│` — `❯ promptdojo · free forever · open source · ⌘⇧B park a thought · last commit Xd ago · changelog`. Visually rhymes with the IDE's status strip and the StatStrip.
- **Expected effect:** The page closes with a confident exhale instead of a faint mumble. Three "receipts strips" on the site (StatStrip, IDE status, footer status) become the same primitive at three sizes — system signature.

### 7. Add a chapter-mark anchor to chapter index pages

- **Surface:** `/learn/v2/[chapter]/`
- **Compositional change:** Behind the chapter headline, set a giant `01` ghost-glyph at ~300px in `--ink-800` (decorative, low-z). Eyebrow `❯ phase 01 · foundations` above. Headline overlays the ghost.
- **Expected effect:** Every chapter page has a typographic chapter-opener moment. Reader scrolling through chapters in sequence sees the numbers count up — *narrative shape*. Zero new assets, kit-correct (typography only), instant book-feel.

### 8. Vary section dividers by surface role — one canon per surface

- **Surface:** sitewide
- **Compositional change:** Reading surfaces (home, about, chapter index) → whitespace primary, hairlines only at act-level breaks. Workspace surface (lesson) → background-shift, hairline borders. Status surfaces (footer, header, StatStrip) → full-width hairline above and below to frame as chrome. Sweep the about page to remove `border-b` from every section (currently overused) — keep only between Act-level boundaries.
- **Expected effect:** The site's compositional grammar becomes legible. A typographer at Apple opening any page knows what kind of page it is in 1 second from the divider canon alone.

---

## What to preserve (do not change)

These are the compositional decisions that already work. **Do not reopen them in this round:**

- **The hero's italic-ember punchword** (`it's wrong.`) — single sharpest compositional moment on the site.
- **The phase-banded rail's eyebrow + left-rail motif** (post-PR-2) — already promotes the 5-phase arc cleanly.
- **The about page's eyebrow rhythm** (`❯ what is this?` / `the wedge` / `the curriculum` / `the loop` / `why this, not codecademy`) — canonical eyebrow pattern; should propagate, not change.
- **The about page's `<dl>` border-left FAQ pattern** — the seed of the entire "left rail = code-fold marker" motif. Keep + promote.
- **The IDE's three-pane structure** — bones are right; only the pane personalities need tuning.
- **The wordmark's `❯ promptdojo _` lockup with 1Hz blink** — brand heartbeat, do not reflow.
- **The Run button's compositional placement** (top-right of editor, ember, sharp, mono) — the page's heartbeat-in-a-button.
- **The `[promptdojo:~]$ _` empty output state** — the only on-brand empty state already shipping.
- **The StatStrip primitive** (post-PR-6) — the receipts surface is correctly composed; just needs to mount in two more places (home Act III footer rhyme, about resolution spread).

---

**Auditor notes:** The composition story compounds with the system tokens (audit-v2). PR 1 codified the type scale; this audit asks the *macro composition* to use that scale with deliberate variation — heroes that breathe, ToCs that feel like ToCs, workspaces that have figure-ground. None of the 8 moves above introduces a new primitive. They all *use existing primitives at different volumes*. The bar — a typographer at Apple opening the site and feeling it reads like a book — is hit when the page-roles (Title, ToC, Reading Spread, Workspace, Status) become visually distinct *as roles*, not just as URLs. Today they're URL-distinct and visually peer. The fix is composition, not paint.

Total estimated compositional effort if all 8 moves ship: ~12–15h. Brand storytelling fidelity goes from "tasteful indie blog" to "self-evident curriculum." Punk preserved 100%.
