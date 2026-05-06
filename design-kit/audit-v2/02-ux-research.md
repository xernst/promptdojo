# UX Research v2 — casual vs serious

**Auditor:** UX Researcher (Phase 2)
**Site:** https://promptdojo.pages.dev
**Date:** 2026-05-06
**Lens:** does this feel like a real curriculum (Codecademy / Khan Academy / boot.dev) or a really sharp solo hobby site?
**Posture:** the punk-rock voice is the moat. Don't sand it. Find where the *system* feels casual — institutional layer is missing, not personality.

---

## Methodology

Walked the live site as Charlie / Priya / Ian against eight "serious-tool" criteria below. For each persona, found the single inflection point where the page reads "this is a real product" or "this is one guy's side project."

Source-walked: `app/page.tsx`, `app/about/page.tsx`, `app/layout.tsx`, `app/learn/v2/[chapter]/page.tsx`, `app/learn/v2/[chapter]/[lesson]/[stepIndex]/page.tsx`, `app/onboarding/page.tsx`, `components/v2/HomeClient.tsx`, `LessonStepClient.tsx`, `LessonShell.tsx`, `ChapterNav.tsx`, `StepFooter.tsx`, `PersistentIDE.tsx`, `Wordmark.tsx`, `HeroBugSnippet.tsx`, `FollowOnXPill.tsx`, `StreakWidget.tsx`, `ReadStepView.tsx`. Live-fetched `/`, `/about/`, `/learn/v2/variables/`, `/learn/v2/variables/naming-things/0/`, `/onboarding/`.

**Did NOT** redo Phase 1 friction work (`Finish→/`, fill-step IDE break, Pyodide cold-start copy, etc. — see §"What we already fixed" below). Those issues exist; CEO-vision picked which to ship in this refresh. This phase is strictly *casual-vs-legitimate*: the texture of the wrapper around an already-strong product.

**Eight "serious learning tool" criteria evaluated:**
1. Real curriculum vs disconnected exercises
2. Progress always visible
3. Time estimates anywhere
4. Prerequisites clear
5. Site knows me when I return
6. Accomplishments celebrated
7. Learning arc through chapters
8. Navigation feels institutional vs hand-built

**Working assumption:** Josh-the-PM will recognize "Codecademy energy" when he sees it. The brand should *out-credible* Codecademy without becoming Codecademy. The bet is institutional layer + dojo voice — not voice swap.

---

## Per-persona walkthrough — the inflection point

### Cursor Charlie — vibe-coder, 6mo in Cursor

- **Inflection point: the chapter card grid** (`app/page.tsx:158-203`). Hero is strong — the bug snippet plus `ai writes this. it's wrong.` reads like a product. Three value cards still hold. Then he hits the chapter grid: 25 cards, identical visual weight, ordered by chapter number, no phase grouping, no "you should start here," no step counts implying time, no prerequisites. The grid screams "list of files," not "syllabus." A Codecademy track has Phase 1 / Phase 2 / Phase 3 visual blocks; promptdojo has a flat 25-card wall. **The product narrative collapses into a directory listing.**
- **Verdict:** product → directory.

### PM Priya — Claude writes the prototype

- **Inflection point: clicking into Chapter 1 overview** (`app/learn/v2/[chapter]/page.tsx:84-110`). The page tells her this is "the keystone for the rest of the course" and lists three lessons with step counts. **No time estimate, no "before you start: nothing required," no chapter-of-25 breadcrumb, no phase context.** A PM evaluating a tool reads this and asks: *"How long is this going to take me? Should I do this in a coffee shop or commit a Saturday?"* The site doesn't answer. About-page says "8–15 hours total spread over a few weeks" but that signal **does not appear on `/`, on the chapter page, or anywhere in-product** — it lives in an FAQ on a page she has to click to find.
- **Verdict:** mature curriculum → "here are some lessons, good luck."

### Indie Ian — building agents on weekends

- **Inflection point: search for the agent stuff** (`app/page.tsx:152-203`). He scans 25 chapter cards looking for "agent loops." There's no phase grouping, no "production-ai track" sub-grid, no concept index. The eyebrow above the grid says `25 chapters · production-ai track included · free forever` (`app/page.tsx:155`) but the grid below treats Ch 13 (LLM APIs) the same as Ch 1 (Variables). The "track" is rhetorical, not visible. He has to read 25 blurbs to find his entry point.
- **Verdict:** specialized track → marketing claim with no IA expression.

---

## Top 15 "casual" tells

Ranked by impact on Josh's "feels like a real product" gut-check. Each item: *page · file:line · why it reads casual · fix category.*

| # | Page | File:line | Why it reads casual | Fix category |
|---|---|---|---|---|
| 1 | Home — chapter grid | `app/page.tsx:158-203` | 25 chapters rendered as a flat 3-col card grid with identical visual weight. No phase divider, no "Phase 01 · Foundations" header, no track grouping. About-page (`about/page.tsx:26-57`) defines the 5 phases — they exist as data — but the home page IA refuses to express them. Codecademy wouldn't ship this; boot.dev wouldn't either. Reads as "list of files" not "syllabus." | Curriculum visualization (high-leverage) |
| 2 | Home + chapter + step pages | global | **Zero time estimates anywhere in-product.** A PM evaluating "should I commit to this" has no per-chapter "~30 min" or per-lesson "~5 min." The only time signal exists in FAQ #4 (`about/page.tsx:106`: "8–15 hours total"). Step counts are a proxy but require math. Real curricula always show time. | Time estimates |
| 3 | Chapter overview | `app/learn/v2/[chapter]/page.tsx:96-101` | Meta-row reads `3 lessons · 26 steps · 88 XP`. **No time, no prerequisites, no "this chapter follows X" or "X comes next."** XP without a target reads as gamification cosplay. | Time + prerequisites + arc |
| 4 | Home — chapter cards | `app/page.tsx:177-183` | Each card shows `26 steps · 3 lessons` but no completion state, no "started," no "0/26." The site has the data (`progress.steps`, `progress.completedChapters`) and refuses to surface it on the cards. Returning user sees zero evidence the site knows them. | Progress visibility |
| 5 | Home — `welcome back` card | `components/v2/HomeClient.tsx:97-117` | The card says `welcome back · ch 1 · variables · pick up where you left off`. **It does not say what step they were on, what % through they are, what they did last time, or how long ago.** Khan Academy: "You're 47% through Chapter 1 · last visited 3 days ago · 2 lessons remaining." Promptdojo: "pick up where you left off." | Welcome-back state |
| 6 | Lesson step header | `components/v2/LessonStepClient.tsx:151-162` | Header shows `chapter title · 1 / 8` and a thin progress bar. **Zero context on lesson-of-chapter or chapter-of-course position.** A learner deep in Ch 7 has no "Phase 01 → Foundations → Ch 7 of 7 → Lesson 2 of 4 → Step 3 of 8" breadcrumb. The site flattens hierarchy at every level. | Curriculum visualization + arc |
| 7 | Sidebar — step labels | `components/v2/ChapterNav.tsx:175, 209-220` | Labels are step *types*: "multiple choice", "fill blank", "fix bug", "read", "predict". **The first 30 chars of the prompt would be 10x more useful** ("which is a list?", "name the type"). Right now the sidebar is an implementation-model leak — the user sees the schema, not the content. Codecademy lists lessons by what they teach. | Navigation polish |
| 8 | End-of-lesson "finish" | `components/v2/LessonStepClient.tsx:189` | Button copy is `finish` then routes to `/`. CEO-vision picks "Finish→next" routing fix. Even after that ships, **there is no completion screen, no "lesson complete · you spotted 2 bugs · earned 88 XP · 22 steps left in chapter 1."** Real LMSs always celebrate. promptdojo silently advances. | Completion mechanics (deferred to V2 in CEO-vision) |
| 9 | Onboarding | `app/onboarding/page.tsx:167-177` | Progress dots are off-by-one — `i <= step` lights dot 0 immediately on render before user advances past Q1. CEO-vision pick #7 fixes this. Adding here for completeness — lighting dot 1 on Q1 is a "ship it without QA" tell. | Quick win (already in CEO-vision) |
| 10 | Sidebar — chapter list | `components/v2/ChapterNav.tsx:64-116` | Sidebar lists 25 chapters as a flat collapsible list. **No phase headers ("phase 01 · foundations") between groups of chapters.** The about-page already names them (`phases` array, `about/page.tsx:26-57`). Real curricula put visible dividers. | Curriculum visualization |
| 11 | Home — eyebrow above grid | `app/page.tsx:154-156` | Reads `25 chapters · production-ai track included · free forever`. The phrase "production-ai track included" is a *claim* with no visual expression below it — there's no `[track: production-ai]` colored marker on Chapters 13-22. The track is asserted, not shown. | Curriculum visualization |
| 12 | Lesson step — header context | `components/v2/LessonStepClient.tsx:153-160` | Header shows `chapter title` (lowercase, `chapter.title.toLowerCase()`) but **no chapter number**. A learner mid-Ch-7 doesn't see "ch 07" anywhere except the sidebar pill. Khan Academy/Codecademy always show the chapter number in-frame. The voice rule for lowercase is fine; the missing number is the casual tell. | Navigation polish |
| 13 | Home — footer | `app/page.tsx:234-242` | Footer is one line: a `⌘⇧B` keyboard hint. **No "about · github · @TFisPython · changelog · what's new"** institutional links. About-page is reachable only via the tiny `❯ what is this?` in the global header (`app/layout.tsx:24-31`). A real product ships a footer with multiple anchors; this ships one keyboard shortcut. | Institutional layer |
| 14 | Home — "what's next on the roadmap" | global | **No public changelog, no "shipped this week," no "next: ch 13 going live MM/DD."** A free OSS curriculum gains credibility from velocity-as-evidence. Right now there's no way to tell if the site shipped yesterday or 6 months ago. | Institutional layer |
| 15 | Lesson — daily-goal dial | `components/v2/LessonShell.tsx:70` | `DailyGoalDial` is rendered in the lesson header (top-right), but **never on home** despite onboarding asking for the daily goal. A returning user opens `/`, sees streak/embers/snowflake icons (`StreakWidget`) but no "today: 7 / 10 min," no daily progress bar. Daily goal is collected, then mostly hidden. | Welcome-back state |

---

## Top 10 "legitimate" moments — don't break these

These are the things that already feel like a real product. Phase 2 work must preserve every one.

1. **Hero bug snippet (`HeroBugSnippet.tsx`).** The mutable-default-arg snippet with the ember-rail border and the explanatory line below it is the strongest "we built this with intention" signal on the site. It's curriculum-as-marketing in 8 lines.
2. **`ai writes this. it's wrong.` H1 (`app/page.tsx:84-86`).** Pairs with the bug snippet to make a complete thesis above the fold. Voice is locked.
3. **Wordmark with 1Hz blink (`Wordmark.tsx`).** `❯ promptdojo _` rendered as the JetBrains-Mono lockup with cursor-blink underscore. The brand has a heartbeat.
4. **Five-phase curriculum framing in /about (`about/page.tsx:26-57`).** Phase 01 Foundations through Phase 05 Capstone is real-curriculum language. The data exists; just needs to ship to home.
5. **Capstone framing — "ship a working cli agent in 12 steps. ~100 lines of python."** Specific, concrete, shippable. No other Python school finishes here.
6. **Persistent IDE on read steps (`LessonStepClient.tsx:223-302`).** The IDE doesn't empty between steps. Cursor users register this immediately as builder-tier.
7. **Step types (`fix`, `predict`, `write`, `reorder`, `checkpoint`).** Pedagogy that respects the audience. Reads like a thought-through curriculum.
8. **`⌘↵ runs the editor` footer hint (`LessonStepClient.tsx:177`).** Keyboard-first affordance. Codecademy doesn't ship this.
9. **Free-forever framing (`about/page.tsx:298-329`).** "$0. open source. no upsell. ever." with GitHub + X links. Builder-credible.
10. **Header consistency — `[ follow @TFisPython on x ]` ember pill (`FollowOnXPill.tsx`).** Site-wide validation surface. Already shipped.

---

## Critical gaps for "feels like a real curriculum"

Each gap is the absence of a thing every serious LMS ships. Listed in order of `casual-tell impact × effort to fix`.

### 1. Curriculum visualization — the 5 phases never render on `/`

The about page defines 5 phases (`about/page.tsx:26-57`). Home page renders 25 chapters as one flat grid (`app/page.tsx:158-203`). **The data is in the codebase; the home page IA refuses to express it.** Add phase dividers above the chapter grid: "phase 01 · foundations (ch 01–07)" / "phase 02 · real python (ch 08–12)" / "phase 03 · llm apis (ch 13–16)" / "phase 04 · shipping discipline (ch 17–24)" / "phase 05 · capstone (ch 25)". This single change does more for "real curriculum" perception than any other.

### 2. Progress indicators on chapter cards

Cards on `/` show `26 steps · 3 lessons` (`app/page.tsx:180-183`) — never `0 / 26 done` or a 22% bar. The progress data is loaded by `HomeClient.tsx` for the welcome-back card and is then thrown away. Surfacing per-chapter completion state on the cards converts the home from "marketing site" to "your curriculum." Returning user feels seen.

### 3. Prerequisite hints

Zero in-product mentions. Every chapter page should ship a one-liner: "needs: chapter 1 (variables), chapter 2 (functions)." `chapter.lessons[i].concept` data exists per step. Even a stub — "best done after chapters 1–6" rendered on Ch 7's header — flips the perception.

### 4. Time estimates

Zero. About-page FAQ has the only time signal in product (`about/page.tsx:106`: "8–15 hours total"). Add `~3 min` per step (or computed `~N min` per lesson based on step types — `read` 1m, `fix` 4m, etc.) on chapter overview, lesson cards, and home. Codecademy / Khan / boot.dev all ship this.

### 5. Learning arc / phase narrative

The about page has the arc; the in-product flow doesn't. After "Finish→next" lands (CEO-vision pick #6), add a one-line phase context to the lesson header: "phase 01 · foundations · ch 1 of 7." Right now the lesson header (`LessonStepClient.tsx:151-162`) shows only chapter title + step counter. No way to feel forward motion through phases.

### 6. Welcome-back state

The pill (`HomeClient.tsx:97-117`) says "welcome back · ch 1 · variables · pick up where you left off." Missing: % through chapter, step count, last-visited recency, "next milestone in N steps." Khan-Academy-grade welcome-back: "you're 47% through chapter 1 · last visited 3 days ago · 2 lessons remaining."

### 7. Completion mechanics

CEO-vision parks the stats screen for V2. Acknowledged. The casual tell will persist until then. Even a silent visual badge on the chapter card after completion (`StreakWidget`-style green check) buys 30% of the win without the interstitial work. Use existing `progress.completedChapters` data.

### 8. Institutional polish layer

No proper site footer with about / github / changelog / RSS / sitemap. No "what's new" surface. No per-chapter "last updated MM/DD" timestamp. No "chapters released this month" velocity proof. Real free-OSS products ship at least 2 of these — they convert "is this maintained?" doubt to "this ships every week."

---

## Quick wins (< 1h each)

1. **Add phase dividers above the chapter grid on `/`.** Insert 5 lowercase phase labels — "phase 01 · foundations" through "phase 05 · capstone" — between the corresponding chapter cards in `app/page.tsx:158-203`. Use the existing `phases` data shape from `about/page.tsx:26-57`. Single highest-leverage UX change for "feels like a real curriculum."
2. **Surface chapter completion state on cards.** Read `progress.completedChapters` (already loaded in `HomeClient`), pass to the cards rendered in `app/page.tsx:159-201`, render an ember check at top-right of completed cards. ~30 lines.
3. **Replace step-type labels in sidebar with prompt-first-line preview.** `ChapterNav.tsx:175` currently calls `stepTypeLabel(step.type)`. Change to `step.prompt.slice(0, 32)` (or `step.title` if it exists). Keep type as an icon, not the label.
4. **Add chapter number to lesson header.** `LessonStepClient.tsx:153-155` renders `chapter.title.toLowerCase()`. Prepend `ch ${chapter.number}` so a mid-lesson learner always sees their position.
5. **Add per-chapter time estimate to chapter cards + chapter overview.** `~N min` derived from step counts (read=1, mc=2, fill=3, fix=4, write=5, predict=2, reorder=2, checkpoint=5). Compute once in `lib/content-v2.ts`, render in `app/page.tsx:180-183` and `app/learn/v2/[chapter]/page.tsx:96-101`.
6. **Add a 4-link footer to home and about** — `about · github · @TFisPython · changelog`. Replace the current single-line `⌘⇧B` keyboard hint footer (`app/page.tsx:234-242`).
7. **Show daily-goal progress on home.** `DailyGoalDial` already exists (`components/v2/DailyGoalDial.tsx`). Render it in the home hero next to `StreakWidget` (`app/page.tsx:74`) so a returning user sees today's progress without entering a lesson.
8. **Replace `welcome back` body copy with progress sentence.** `HomeClient.tsx:104-111` currently says "pick up where you left off." Compute and render: "step ${index + 1} of ${total} · ${progress}% through ${chapter.title}." Data already loaded.

---

## Strategic UX bets (1–2 day each)

### Bet A — Curriculum-as-syllabus home page

Reorder home as: hero (already strong) → 5-phase syllabus (collapsible by default, expanded on hover/click) → chapter grid as fallback. The phase syllabus is the institutional layer — like a Khan Academy course tree. Expected outcome: PM Priya stops asking "is this a real course"; Indie Ian sees `phase 03 · llm apis` and clicks straight in. Touches `app/page.tsx`, adds a `Phases` component. ~1.5 days.

### Bet B — Real-time curriculum context in lesson header

Replace the current 2-line lesson header (`LessonStepClient.tsx:151-162`) with a 3-line breadcrumb: `phase 01 · foundations` (small mono eyebrow) / `ch 01 · variables` (chapter line) / `lesson 1 of 3 · naming things` (lesson line) + the existing progress bar. Adds zero new components, repositions existing data. Result: every lesson page shows "where am I" at three levels of hierarchy. ~1 day.

### Bet C — Chapter overview becomes a single-screen syllabus

Phase 1's friction note (chapter overview is a wall of text) was real but CEO-vision didn't pick it. Re-pitch as a casual-vs-legitimate fix: replace the prose body of `app/learn/v2/[chapter]/page.tsx:84-156` with a structured syllabus card — one-line "what you'll do," prerequisite line, time estimate, lesson list with concept tags + step counts + checkmarks for completed. Khan-Academy-grade. ~1.5 days.

### Bet D — `last shipped MM/DD` velocity strip on home + chapter pages

Add a thin top-strip on home and chapter overviews: `last lesson published · 2 days ago · ch 13 lessons 4–7`. Build it from git commit metadata at build time. Single-line change to `lib/content-v2.ts` to read `mtime` per content file, render strip via a `LastShippedStrip` component. Buys "this is maintained" trust for free. ~1 day.

### Bet E — Phase complete celebration (lighter than stats screen)

Stats screen is V2 per CEO-vision. As a halfway measure: when a user completes the last lesson of the last chapter in a phase, show a 3-second toast: "phase 01 complete · 5 chapters · next: phase 02 · real python →." Use existing `markChapterCompleteIfNew` + new `markPhaseCompleteIfNew`. No interstitial route, no new component beyond a toast. ~1 day.

---

## What we already fixed in Phase 1 (don't redo)

The following are addressed in Phase 1 (`audit/02-ux-research.md`) and CEO-vision picks. Phase 2 does **not** re-litigate them. Listing for cross-team awareness.

- **`Finish` → `/` dumps user on marketing home.** CEO-vision pick #6 ships forward-routing. *Still recommend pairing with strategic bet E above.*
- **Pyodide cold-start copy reads as broken.** CEO-vision pick #6 softens to "warming up the editor… (~5s, only this once)."
- **Chapter overview wall of text.** Phase 1 quick win #4 cuts to one paragraph + "Start chapter." CEO-vision parked the deeper rework. *Strategic bet C above re-pitches it as a casual-vs-legitimate gap.*
- **`fill` step IDE goes decorative.** Phase 1 §10. CEO-vision parks for V2.
- **Three competing CTAs on home** (welcome-back / "new here?" link / 25 chapter cards). CEO-vision pick #7 hides the static "new here?" link when welcome-back card is showing.
- **Audience copy ("Built for marketing managers, PMs, ops folks") is buried in tertiary paragraph.** Phase 1 quick win #2. CEO-vision pick #3 rebuilds the hero entirely (ships).
- **Hero is positioning, not a hook.** CEO-vision pick #3 ships the live(ish) IDE + bug snippet hero. **Already shipped per current `app/page.tsx:69-111`.**
- **Onboarding off-by-one progress dots.** CEO-vision pick #7. *Listed above as casual tell #9 for completeness only.*
- **Live-preview personalization on onboarding.** Phase 1 §3. CEO-vision pick #7.
- **Step-type sidebar labels leak implementation.** Phase 1 friction #8. CEO-vision deferred ("fold into pick #2 if one-line"). *Quick win #3 above re-pitches as content preview, not just relabel.*
- **Concept-level navigator.** Phase 1 strategic bet 5. CEO-vision parks for V2.
- **Place-me diagnostic onboarding fork.** Phase 1 strategic bet 2. CEO-vision parks for V2.
- **Welcome-back card needs more than "pick up where you left off."** Phase 1 §10 noted; this report sharpens to a Khan-Academy-grade upgrade (quick win #8).
- **End-of-lesson stats screen.** Phase 1 strategic bet 3. CEO-vision parks. *Strategic bet E above is a lighter alternative.*

---

## The takeaway in one paragraph

The product is real. The wrapper is casual. promptdojo's hero, IDE, voice, and step-type pedagogy are all builder-credible — they pass the "did one person actually think about this" test. What's missing is the *institutional* layer that signals "this is a maintained curriculum, not a really sharp one-off": phase grouping on home, time estimates anywhere, prerequisite hints, progress on chapter cards, breadcrumbs in lesson headers, a real footer. The voice doesn't need to soften — Codecademy-isms remain forbidden. What needs to ship is the *evidence* that a curriculum exists, expressed in lowercase-dojo language. "phase 01 · foundations · ch 1 of 7 · ~30 min" is institutionally legible AND on-brand. The fix is additive, not corrective.

---

**Auditor:** UX Researcher (Phase 2)
**Boundaries:** No visual treatments (UI Designer's lane). No IA refactors of routes/sidebar tree (UX Architect's lane). No copy at the line level (Brand Guardian's lane).
**Handoff signals:** Quick wins 1, 2, 3 are highest-leverage; ship in that order. Strategic bets A and B compound with each other and should be sequenced together.
