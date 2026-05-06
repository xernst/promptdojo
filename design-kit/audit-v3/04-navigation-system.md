# Navigation System Audit — Josh-named priority area

**Auditor:** ArchitectUX (Navigation Lead)
**Date:** 2026-05-06
**Scope:** Every surface a user uses to move through promptdojo — the header, footer, lesson chrome, sidebar, breadcrumbs, prev/next, curriculum overview, resume mechanic, search, keyboard, URLs, 404 recovery.
**Builds on:** `design-kit/audit/06-ux-architecture.md` (Phase 1 §navigation), `design-kit/audit-v2/05-ia-architecture.md` (Phase 2 §breadcrumbs + §welcome-back), `design-kit/audit-v2/CEO-vision.md` (Phase 2 cuts).

> **Bar:** a Linear navigation designer should look at promptdojo and think *"yes, this is how a learning product navigates."* Today it does not — the lesson page has no top bar, the sidebar is invisible on mobile, there is no curriculum index, no way to search, no resume URL, no 404 page, no skip link, no prev step, and the chapter title in the lesson breadcrumb is the only crumb that links anywhere.

---

## Current navigation map (what exists today)

### Sitewide header (rendered globally on every route via `app/layout.tsx:23`)

`components/SiteHeader.tsx` — a single horizontal strip:
- **Left:** `❯ what is this?` linking to `/about` (`SiteHeader.tsx:16-22`). **Not a wordmark.** The actual wordmark only renders inside the home hero (`app/page.tsx:97`), the chapter sidebar (`ChapterNav.tsx:57`), and onboarding (`onboarding/page.tsx:163`). There is **no global home affordance** in the chrome — clicking "what is this?" sends you to `/about`, not to `/`.
- **Right cluster:** `GitHubStatsPill` · `CourseProgress` (only when done > 0, `CourseProgress.tsx:41`) · `LoginToSave` · `FollowOnXPill` (`SiteHeader.tsx:23-28`).
- **No mobile drawer.** `flex-wrap` (`SiteHeader.tsx:15`) makes pills stack vertically below 380px; there is no hamburger, no chapter access, no settings, no search.
- **No active-route highlight.** Header looks identical on `/`, `/about`, `/learn/v2/...`, `/onboarding`, `/changelog`.
- **Renders on `/onboarding`.** The pills appear above the 5-question profile flow — distracting; `CourseProgress` self-suppresses (`CourseProgress.tsx:40`), the others do not.

### Footer

- **Home only** (`app/page.tsx:202-219`) — `⌘⇧B` brain-dump tip + `last commit ${date}` + `changelog` link.
- **Absent on `/about`, `/learn/v2/*`, `/onboarding`, `/changelog`.** `/changelog` shows a single "← home" link (`changelog/page.tsx:29`) and nothing else — no GitHub, no MIT, no contact.
- **No site nav links.** The footer carries trust receipts but no navigational structure (about, curriculum, X, source).

### Breadcrumbs

- **Lesson page only** (`LessonStepClient.tsx:151-185`) — three-line strip rendered above the prompt panel: `phase NN · name` (label, no link) / `ch NN · title` (links to `/learn/v2/[chapter]`) / `lesson N of M · title` + `step N / M` (lesson-of-chapter is plain text, **not linked**). Plus a 1px `ProgressBar` underneath.
- **Absent on:** `/about`, `/changelog`, `/onboarding`, home, the chapter overview itself, the legacy `/learn/[chapter]/...` pages.
- **No phase link** — the eyebrow phase strip is decoration, not navigation.

### Lesson sidebar

- `components/v2/ChapterNav.tsx` — accordion of all 25 chapters, only the active one expanded. Mounted inside `LessonShell.tsx:56` and on the chapter overview page (`learn/v2/[chapter]/page.tsx:77-82`).
- **Header inside the sidebar** (`ChapterNav.tsx:55-61`) — wordmark linked to `/`. This is currently the **only `→ /` affordance on a lesson page**, and it lives at the top of the sidebar where eyes don't rest.
- **Chapter row toggles, doesn't navigate** (`ChapterNav.tsx:71-95`) — flagged in Phase 1 (`audit/06-ux-architecture.md:73`) and **still not fixed**. The chevron and the row title share a single click target that opens/closes the accordion. A user wanting to revisit `/learn/v2/lists-and-dicts` (the chapter overview) has to click the lesson, then the back-to-chapter crumb in the lesson header.
- **`hidden lg:flex`** (`LessonShell.tsx:56`) — invisible below 1024px. Mobile and tablet users have no chapter-to-chapter navigation while inside a lesson.
- **No phase grouping.** Sidebar lists 25 chapters as a flat list; the curriculum's own structure (5 phases) is invisible inside the lesson.

### Inter-step navigation

- **Continue / Finish button** in `LessonStepClient.tsx:194-209`. Disabled until step is passed (or step type === "read"). Last step says `that's all 624 →` and `router.push("/")` (`:131-134`). No "next chapter" interstitial, no celebration, no chapter→phase wrap.
- **`⌘↵` keyboard shortcut** is bound to **run code in the editor** (`PersistentIDE.tsx:178-188`), **not to advance**. The disabled `StepFooter.tsx` (`:55-66`) wires `⌘↵` to advance, but it is an orphan — never imported anywhere (`grep` confirms). So the only way to advance via keyboard is Tab to the button, then Enter.
- **No prev step affordance** — flagged Phase 1 (`audit/06-ux-architecture.md:65`), still missing. Users can click a previous step in the sidebar (desktop only); on mobile there is no path back.
- **No lesson→next-lesson seam.** When step N is the last in a lesson but not the last in the chapter, the button still says `continue →` and routes to the next lesson's step 0 (`LessonStepClient.tsx:135`). There is no "lesson complete · next lesson is X" beat.
- **No chapter→next-phase seam.** Final lesson of the chapter routes to `/`. The user is dumped on the home page with no signal that they finished a chapter or that phase 02 is next.

### Curriculum overview

- **There is none.** No `/curriculum` route. No single page that shows the whole tree. The closest thing is `app/page.tsx:164-172` — the home page mounts `<PhaseBandedRail>` under a `t-eyebrow` heading.
- **`#chapters` anchor** exists (`PhaseBandedRailClient.tsx:59`) and is linked from the hero CTA "or pick your chapter ↓" (`app/page.tsx:124-128`). This is the only *nameable* destination for "see the whole course" — and it requires landing on `/` first.
- **`/about` narrates phases as marketing prose** (`app/about/page.tsx`) — not navigational.
- **The chapter overview page** (`/learn/v2/[chapter]`) — only renders when the chapter has an `overview.md`. Otherwise it 302-redirects straight to lesson 1 step 0 (`learn/v2/[chapter]/page.tsx:65-68`). For the user, "what's in chapter 7" is a route that may or may not exist.

### Resume / welcome-back

- `components/v2/HomeClient.tsx` reads `lastVisitedV2` and renders one of 4 states (loading / guest / onboarded-not-started / in-progress, `HomeClient.tsx:40-130`). The in-progress card shows step + chapter + percent + recency, links to the deep step URL (`:101`).
- **The card only renders inside `app/page.tsx:132-135`.** A returning user who lands on `/about` or `/changelog` has no resume affordance — and there is no global "↵ continue" pill in the header.
- **`/lesson/resume` route does not exist** (Phase 2 cut, `CEO-vision.md:134`). The resume URL is the deep-link, which a user cannot type from memory.

### Search

- **None.** No `⌘K`, no `/search`, no inline filter on the curriculum rail. 624 steps × 22 chapters and zero way to find a concept. The only string-search a user has is browser Find on a single rendered page.

### Keyboard nav

- **`⌘↵`** — runs the editor (`PersistentIDE.tsx:178-188`).
- **`⌘⇧B`** — opens BrainDump (mentioned in footer `app/page.tsx:204-208`; bound somewhere in `BrainDump.tsx`).
- **`Enter`** in form inputs — submits in `FillBlankStepView.tsx:120` and `ReorderStepView.tsx:105`.
- **Tab order** — relies on DOM order. Header → main → footer is sensible on `/`. On a lesson page, Tab order is sidebar → progress bar → prompt → IDE → footer-button — long path to the primary action (Continue).
- **Focus indicators** — globals.css declares a `*:focus-visible` canon (per CEO V2 pick #1). Did not visually verify on live site, but the canon exists.
- **No `?` cheatsheet, no `Esc` to close drawers (mobile pane toggle has none), no `j`/`k` step nav, no `/` to focus search (because there is no search).**

### URL structure

- `/` — home.
- `/about` — about page.
- `/onboarding` — 5-question profile capture. **Not `/start`** (Phase 1 §IA proposed; not adopted).
- `/changelog` — prose changelog.
- `/learn/v2/[chapter]/` — chapter overview (or 302 → lesson 1 step 0).
- `/learn/v2/[chapter]/[lesson]/` — 302 → step 0.
- `/learn/v2/[chapter]/[lesson]/[stepIndex]/` — actual step. **0-indexed in URL, 1-indexed in UI.**
- `/learn/[chapter]/`, `/learn/[chapter]/[lesson]/` — **legacy v1 routes still live**, surfaced in a `<details>` disclosure on the home page (`app/page.tsx:174-200`). Two parallel content systems still ship.
- `v2` is leaked everywhere — every step URL a user shares contains `/learn/v2/`.

### Skip links

- **None.** No `<a href="#main">skip to content</a>` anywhere in `app/layout.tsx` or `SiteHeader.tsx`. Screen-reader and keyboard users tab through the entire pill cluster on every page load.

### 404 / dead-end recovery

- **No `app/not-found.tsx`.** Phase 1 flagged this (`audit/06-ux-architecture.md:268, 304`); still missing. A user landing on a broken chapter slug (`getV2Chapter` returns null → `notFound()` at `app/learn/v2/[chapter]/page.tsx:61`) sees the **default Next.js 404** — black-on-white, English-language, no brand voice, no nav, no "back to home", no "did you mean…".

---

## Per-surface gaps (where nav fails)

For each surface: severity (P0 = ships next sprint / P1 = ships next month / P2 = nice-to-have), what's wrong, why it matters.

### `SiteHeader.tsx` — global chrome — **P0**

1. **No global home link** (severity: P0). The wordmark is not in the chrome. Clicking "what is this?" sends to `/about`. Convention everywhere on the web: top-left wordmark goes home.
2. **No hamburger / drawer on mobile** (P0). Below 1024px, a user inside a lesson cannot reach another chapter without typing a URL or hitting back-to-home through the sidebar wordmark — which is itself hidden because the sidebar is `hidden lg:flex`. This is the primary mobile bug Josh named.
3. **No active-route indicator** (P1). User can't see at a glance whether they're on `/` or `/about` or inside a lesson — every header looks identical.
4. **`SiteHeader` renders on `/onboarding`** (P1). 5-question profile capture should not be polluted by `LoginToSave`, `FollowOnXPill`, `GitHubStatsPill`. `CourseProgress` self-hides; the others should follow.
5. **`flex-wrap` chaos on small screens** (P1). When the pill cluster wraps to two rows the header doubles in height; on a 375px iPhone the wordmark line and the pill line stack.

### Footer — **P1**

1. **Footer absent on 4 of 5 routes** (P1). Only `/` has a real footer. `/about`, `/changelog`, `/learn/v2/*`, `/onboarding` have nothing. `/changelog` has a single "← home" link.
2. **No site map links** (P1). Even on the home footer, there's no `about · curriculum · changelog · github · twitter · MIT` row. Footer is a brand-trust strip, not a nav strip.

### Lesson breadcrumb — **P0**

1. **`lesson N of M · title` is plain text, not a link** (`LessonStepClient.tsx:173-176`, P0). The user can click "ch NN" but cannot click "lesson 02 · reading-types" to go to the lesson root. Inconsistent affordance.
2. **`phase NN · name` is decoration** (`:158-162`, P1). No anchor to `/#phase-N` or to the curriculum tree position. The phase eyebrow promises navigability and delivers a label.
3. **No "back to home" on the lesson** (P1). Sidebar wordmark is the only affordance. Hidden below 1024px.

### Lesson sidebar — **P0**

1. **`hidden lg:flex`** (`LessonShell.tsx:56`, P0). Mobile and tablet users have no chapter switching while in a lesson.
2. **Chapter accordion header doesn't navigate** (`ChapterNav.tsx:71-95`, P0). Two-line fix flagged 2 phases ago. Still broken. A user wanting `/learn/v2/lists-and-dicts` from inside the chapter has no path that doesn't open every other chapter's accordion.
3. **No phase grouping** (P1). The curriculum's spine (5 phases, the entire `/about` narrative) is invisible inside the place users spend the most time.
4. **Step-status icons are subtle to the point of invisible** (`ChapterNav.tsx:189-202`, P2). `Lock` icon for unattempted, `Check` for passed, fill-circle for active. The `Lock` reads as "you can't go here" — but the link works fine. Misleading affordance.
5. **Sidebar wordmark `→ /`** is the only nav escape, and it sits at the top of the chrome where eyes don't rest. Should be in a top-bar.

### Inter-step nav — **P0**

1. **No prev step button** (P0). One-way street.
2. **`⌘↵` is overloaded** between "run editor" and "advance" — the orphan `StepFooter.tsx:55-66` wires advance to `⌘↵`; the live code wires run to `⌘↵`. If `StepFooter` ships, both fire. Fix: pick one chord (Phase 1 §interaction-patterns recommended `⇧↵` for advance). **P1.**
3. **No keyboard advance** today (P1). Tab order is long; Enter on a focused button is the only path. Should be `⇧↵` or `→` on a passed step.
4. **No "lesson complete · next lesson is X"** beat (P1). Lesson-end seam is silent.
5. **Last step in chapter dumps to `/`** (`LessonStepClient.tsx:131-134`, P0). No celebration, no chapter complete card, no "phase 01 · 5 chapters left."

### Curriculum overview — **P0**

1. **No standalone `/curriculum` route** (P0). Phase 2 proposed and CEO cut for V1 (`CEO-vision.md:31-36`). Cut was correct *for V2*; for V3 it's overdue. The home page is currently doing two jobs (marketing hero + course outline) and doing both compromised. A standalone `/curriculum` is what Slack pastes look like; what Google indexes; what an X follower clicks when Josh says "see the whole course."
2. **`#chapters` anchor isn't shareable** (P1). `promptdojo.dev/#chapters` works today but the URL doesn't promise the curriculum content; it promises whatever is on home.
3. **No phase deep-links** (P2). `/curriculum#phase-3` would let a "I'm here for the LLM track" user land directly on phase 3.

### Resume / welcome-back — **P0**

1. **Resume card lives only on `/`** (P0). Returning user landing on `/about` (e.g., from a tweet about the project) has no continue affordance.
2. **No `/lesson/resume` URL** (P1). Cannot share a stable continue link with self across devices. Phase 2 cut for V2; should ship in V3.
3. **No global "↵ continue" pill** in the header for in-progress users (P1). Linear has it. Notion has it. Khan has it. The user always knows they have one keypress to get back to where they were.

### Search — **P1**

1. **No search anywhere.** 624 steps. Recommend cmd-K palette over a `/search` route (see proposal §6).

### Keyboard nav — **P1**

1. **No `?` cheatsheet** (P1). User cannot discover `⌘↵` or `⌘⇧B` without reading the footer.
2. **No `Esc` close** for the mobile pane toggle (P2).
3. **Tab order on lesson** — sidebar tabs through 25 chapter buttons before reaching the prompt. Should skip-link past the sidebar.

### URL structure — **P2 (deferred per CEO)**

1. **`/learn/v2/` leaks** in every shared URL (P2 per CEO `CEO-vision.md:222`).
2. **0-indexed `[stepIndex]` URL vs 1-indexed UI** (P2). Same defer.
3. **`/onboarding` not `/start`** (P2). Two extra syllables in every link copy.
4. **Legacy `/learn/[chapter]/...` routes still live** (P2). Cut for V2, also overdue.

### Skip links — **P0** (a11y compliance is non-negotiable)

1. **No `skip to main content`** anywhere. Auto-fail for WCAG 2.4.1.

### 404 — **P1**

1. **No `app/not-found.tsx`.** Default Next.js 404 = brand-killer.

---

## Proposed navigation system (the full spec)

A complete system, not patches. Every surface specced. Every state covered. No JSX — behavior + visible elements + data + mobile + keyboard + states.

### 1. The header — `<SiteHeader>` (rebuilt)

**Mounted globally** in `app/layout.tsx:23` — same place as today, complete rebuild.

**Visible elements (left → right):**

- **Wordmark** — links to `/`. The single global home affordance. Always visible. On hover, the cursor underscore goes from blink to solid.
- **Section nav** — three text links: `curriculum` (→ `/curriculum`), `about` (→ `/about`), `changelog` (→ `/changelog`). Lowercase, mono, ink-400, with a 1px green underline on the active route. Visible ≥ 768px; collapses into the drawer below.
- **(spacer)**
- **Continue pill** — `↵ continue · ch 03 · step 4/9` — only renders if `lastVisitedV2` exists AND user is **not** currently inside that lesson. Click → deep step URL. Press `↵` anywhere on the page (when nothing else is focused) → same. The single most load-bearing piece of returning-user navigation.
- **GitHub-stars pill** — keep `GitHubStatsPill` as-is.
- **Search trigger** — `⌘K` mono kbd in a thin bracket pill. Click → opens cmd-K palette (see §6). Visible always.
- **Streak / `CourseProgress`** — keep, but only render in the right-cluster on the home and on lesson pages. On `/about` and `/changelog` and `/onboarding`, hide — those are read-mode contexts.
- **Follow on X** — keep `FollowOnXPill` as the validation-metric receipt. Always visible (validation metric is X followers, per Josh's memory `feedback_validation_metrics`).
- **Hamburger** — `≡` button visible **< 768px** only. Opens drawer (see §1c).

**Skip link** — `<a href="#main">skip to content</a>`, visually hidden until focused, then a green-on-ink-950 pill at top-left. Mounted as the **first focusable element** in `<body>`.

**Active-route indicator** — section-nav links underline when `pathname.startsWith(href)`. A user always knows where they are.

**Mobile drawer (≤ 768px):**

- Hamburger opens a full-width slide-in from the right.
- Top: wordmark, close (×).
- Section list: `curriculum · about · changelog · github · @TFisPython` (all the section nav + the X CTA + GitHub link).
- Below: a compact phase-banded chapter list (same data as the lesson sidebar, scrollable). This is the **mobile chapter switcher** that doesn't exist today.
- `Esc` closes. `Tab` cycles within drawer (focus trap). Click outside also closes.

**Keyboard:**
- `⌘K` — opens search palette.
- `↵` (when no input focused) — fires Continue pill if visible.
- `g h` — go home (vim-style, V3 polish — opt-in only).

**Empty / first-visit state:** no continue pill, no streak. Just wordmark, section nav, search, X-follow, GitHub.
**Returning state:** continue pill renders. Streak renders if `streak.current > 0`.
**Onboarding state:** header is **dimmed** — only the wordmark shows. No pills, no section nav, no search. Onboarding is a focused 5-question flow. (Achieved with a `usePathname().startsWith("/onboarding")` guard at the wrapper level.)
**Lesson state:** header collapses to a **slim 36px strip** to reclaim vertical space — wordmark + breadcrumb (see §3) + continue (irrelevant since user IS in a lesson, so hide) + streak + search. No section nav (drawer only).

**Data needs:**
- `lastVisitedV2` from `loadProgressV2()` — for the continue pill.
- `pathname` from `usePathname()` — for active-route + state-aware rendering.
- `streak.current` — for streak pill.
- TOC for the search palette (already imported in `CourseProgress.tsx:18`).

**Files affected:**
- `components/SiteHeader.tsx` — full rebuild (~150 lines client component, currently 31).
- New `components/SiteHeader/Drawer.tsx` (~80 lines).
- New `components/SiteHeader/ContinuePill.tsx` (~40 lines).
- New `components/SiteHeader/SearchTrigger.tsx` (~25 lines).
- `app/layout.tsx:23` — add `<a href="#main" class="skip-link">skip to content</a>` before `<SiteHeader>`. Add `id="main"` to the wrapper inside each `page.tsx`.

### 2. The footer — `<SiteFooter>` (new component)

**Mounted globally** in `app/layout.tsx` after `{children}`. Today there is no global footer; this **adds one** and **removes** the page-local footer in `app/page.tsx:202-219` (move its content into the global footer).

**Three rows:**

1. **Site map row** — text links: `curriculum · about · changelog · onboarding · github · @TFisPython`. Lowercase, mono, ink-500. Wraps on narrow viewports.
2. **Receipts row** — re-uses `<StatStrip>` content but inline: `25 chapters · 624 steps · 8–15h · MIT · last commit ${date}`. Already a primitive (`StatStrip.tsx`) — mount in footer.
3. **Brand / legal row** — wordmark + `© ${year} josh ernst · made on a m4 air at 11pm` (voice already in audit-v2 §03). Right-aligned `⌘⇧B brain dump` kbd hint (currently in home footer — move).

**Hidden states:**
- Hide on `/onboarding` (focused flow).
- Hide on `/learn/v2/*` lesson pages — `LessonShell` is `100dvh`; a footer below would push the IDE off-screen. **The lesson page replaces the footer with the prev/next chrome (§4).**

**Mobile:** rows stack vertically. Site map collapses into two columns on `< 480px`.
**Keyboard:** standard tab order. All links focusable.

### 3. The lesson breadcrumb — `<LessonBreadcrumb>` (extracted)

**Mounted inside the lesson `<LessonShell header>` slot** — replacing the inline strip at `LessonStepClient.tsx:151-185`.

**Visible elements (4-node breadcrumb):**

`promptdojo` (wordmark, → `/`)  ›  `phase 02 · real python` (→ `/curriculum#phase-2`)  ›  `ch 09 · iteration` (→ `/learn/v2/iteration`)  ›  `lesson 2 of 3 · for-each-loops` (→ `/learn/v2/iteration/for-each-loops/0`)  ·  `step 4 / 9` (text only)

**All four nodes link.** Today only ch is linked, lesson is plain text, phase is decoration. Fix: link all four except the trailing step counter.

**Below the crumb:** existing 1px progress bar (`LessonStepClient.tsx:223-238`).

**Mobile (<768px):** truncate phase + chapter into a single mono crumb `ch 09 › for-each-loops`, hide phase. Step counter stays. Click any segment to expand a sheet showing the full crumb (rare interaction; absence is fine).

**Keyboard:** standard tab. Each link is a discrete focus stop.

### 4. The lesson side rail — `<LessonSideRail>` (rebuilt `ChapterNav`)

**Three changes:**

1. **Phase-band the rail.** Instead of 25 flat accordion rows, render 5 collapsible phase headers, each containing its chapters. Default-expanded: the active phase. Collapsed: the others.
2. **Make the chapter row a `<Link>` with a chevron toggle to its right** (Phase 1 ask, never shipped). Click row title → chapter overview. Click chevron → toggle the lesson list. Three clicks become two.
3. **Visible on mobile via the header drawer (§1c)**. Same data, two mount points: desktop sidebar (≥1024px), mobile drawer (<768px). Tablet (768–1023px) shows a slim 240px sidebar — promote `lg:` breakpoint to `md:` (Phase 1 §responsive recommendation).

**Visible elements per row:**
- Phase header: `phase 01 · foundations  ·  ch 01–07  ·  ~2h 14m  ·  4/7 done` (chevron toggle).
- Chapter row: `▸ ch 03 · lists and dicts  ·  3 lessons · 26 steps · ~18m  ·  ◐ 67%`. Active chapter has a left-rail green border. Done chapter is rendered at 70% opacity with a `✓`.
- Lesson row (only when chapter expanded): `└ l02 · reading-types · 9 steps · ~6m · ◐`. Active lesson highlighted.
- Step row (only when lesson is the active lesson): `01 · prompt-preview-text…`, with status icon. Already exists (`ChapterNav.tsx:155-181`).

**Mobile:** rail moves into the global drawer (§1c). Same hierarchy, full-width.
**Keyboard:** chevron is a separate button from the link target. `←/→` collapses/expands phases when focused on a phase row.

### 5. The lesson prev/next chrome — `<LessonStepFooter>` (rebuilt)

**Replaces the inline footer at `LessonStepClient.tsx:194-209`.** The orphan `components/v2/StepFooter.tsx:1-157` is the canonical replacement skeleton — reuse it, do not delete it.

**Visible elements (left → right):**

- **`← prev step`** — disabled on step 0 of lesson 0 of chapter 0; otherwise routes to step N-1 (or last step of previous lesson, or last step of previous chapter).
- **Lesson XP / hint count** — center status. Same data as `LessonStepClient.tsx:194-200`.
- **`continue →`** or **`finish chapter →`** or **`start phase 02 →`** — context-aware label. The label is the navigational signal: "you're entering a new phase" reads as a real moment.

**Inter-step routing logic (lifted into a helper `lib/curriculum/navigate.ts`):**

```
function nextStepURL(currentStep, currentLesson, currentChapter, allChapters) {
  // 1. step has more steps in lesson → next step (same lesson)
  // 2. lesson has more lessons in chapter → next lesson, step 0
  // 3. chapter has more chapters in phase → next chapter, lesson 0, step 0
  // 4. phase has more phases → next phase first chapter
  // 5. last step of last phase → /complete (chapter capstone celebration)
}
```

Today this logic lives implicitly in the `next` prop computed by the route page; it is partial (only same-lesson + first-step-of-next-lesson, see `app/learn/v2/[chapter]/[lesson]/[stepIndex]/page.tsx`). Lift to a named helper, used by both prev and next.

**Keyboard:**
- `⇧↵` — advance (when step is passed). Distinguish from `⌘↵` which runs the editor.
- `⇧⌫` — prev step. Discoverable via `?`.
- `→`/`←` — same as ⇧↵ / ⇧⌫ when no input focused.

**Mobile:** prev/next are full-width buttons stacked vertically. Status row above them.

### 6. The curriculum overview — `/curriculum`

**New route: `app/curriculum/page.tsx`** (~30 lines server component) + reuses `<PhaseBandedRail>` from `components/v2/PhaseBandedRail.tsx` with a new `expanded` prop that opens lesson lists by default.

**Visible elements (top → bottom):**

- `<SiteHeader>` (global).
- Page header: `t-eyebrow` `the whole course` / `t-section` `25 chapters · 624 steps · ~12 hours` / `<StatStrip>`.
- Filter chips: `all phases · foundations · real python · llm apis · shipping · capstone` — clicking scrolls to phase. URL hash binds (`/curriculum#phase-2`).
- The `<PhaseBandedRail expanded>` — same component as home, with each chapter row pre-expanded to show its lessons (lesson rows render `lesson title · 9 steps · ~6m · prereq: ch01/l03 · status`).
- `<SiteFooter>` (global).

**Why this route:** Phase 2 cut it for V2 because there was no organic traffic. V3 has the same constraint, BUT: navigation is the priority area Josh named. A standalone `/curriculum` is what every "is this a real course?" answer points to. It is a 30-line file. Ship it.

**SEO:** `generateMetadata` with title `the curriculum · promptdojo`, description rolls up phase blurbs. Indexable. Likely the highest-organic-traffic page on the site post-launch.

**Deep-link states:**
- `/curriculum` — phase 1 expanded, others collapsed.
- `/curriculum#phase-3` — phase 3 expanded, scrolled into view, others collapsed. Smooth-scroll on hash change.
- `/curriculum?expand=all` — every chapter expanded, every lesson visible. The "shareable full syllabus" view.

**Mobile:** filter chips wrap; tiles stack to 1-col. Phase bands compress (16px gutter instead of 96px between).
**Keyboard:** Tab cycles phase headers → chapter rows → lesson rows. `Enter` on phase header toggles expand. `Enter` on chapter title → chapter overview. Search palette (§7) deep-links into curriculum search.

### 7. Search — `<SearchPalette>` — **opinionated YES**

**Build it. Cmd-K palette, not a `/search` page.**

**Why:** 624 steps + 22 chapters and no way to find anything is the loudest "this is a hobby project" signal a navigation-savvy user reads. Linear, Notion, Stripe Docs, Vercel — every product Josh's audience uses daily has cmd-K. Building it is small (~150 lines) because the data is small (624 steps) and ships build-time as a static index.

**Mounted globally** as a portal triggered by:
- Click on the header `⌘K` pill (§1).
- Keypress `⌘K` / `Ctrl+K` anywhere except inside an input.
- Tap on the mobile drawer search field.

**Visible elements:**

- Modal dialog, ink-950 with green border, centered, max-width 640px, max-height 480px.
- Top: search input with mono caret, placeholder `find a chapter, lesson, or concept…`.
- Below: result list grouped by section: `phases · chapters · lessons · concepts`. Each result shows mono badge + title + breadcrumb.
- Footer: kbd hints `↑↓ navigate · ↵ open · esc close`.

**Search index (build-time):**

Add `scripts/build-search-index.mjs` that walks `lib/generated/v2/chapters/*.json` and emits `lib/generated/v2/search-index.json` with one entry per phase (5), chapter (25), lesson (~70), and unique `step.concept` (~120 from `progress.conceptsTouched` aggregation). ~200 entries total. Tiny.

**Algorithm:** simple substring match with field weights (title × 3, breadcrumb × 2, concept × 1). No fuzzy matching needed at this corpus size. Fits in `~5KB` gzipped — embed inline, no fetch.

**Keyboard:**
- `⌘K` — open.
- `Esc` — close.
- `↑/↓` — move cursor.
- `↵` — open the highlighted result.
- `⌘↵` — open in new tab.
- Type anything else — searches.

**Mobile:** full-screen overlay. Same input + result list. The drawer's primary action.

**Empty state:** show `recent` (last 5 visited steps from `progress.steps`) + `top of curriculum` (phase 1 chapters).
**No-results state:** `no matches. try "loops" or "agents" or browse the curriculum →`.

### 8. The chapter index page — `/learn/v2/[chapter]` (kept, refined)

Already exists at `app/learn/v2/[chapter]/page.tsx`. Two changes:

1. **Replace the 302-redirect-to-step-0 fallback** (`:65-68`) with a real fallback render — a chapter page that shows lessons even when `overview.md` is empty. Today, chapters without overviews have no chapter index. Render the lesson list section unconditionally; the overview prose becomes optional.
2. **Add lesson-row meta:** `~6m · prereq: ch01 · 0/9 done · ◐` per row. Data exists, just unrendered.

The chapter overview is the **chapter-scoped curriculum view**; the lesson page sidebar is the **whole-course view**. Two different jobs, both useful.

### 9. The resume mechanic — three layers

1. **Header continue pill** (§1) — the global "↵ continue" affordance on every page except the lesson the user is currently inside.
2. **Home welcome-back card** — already exists in `HomeClient.tsx`. Keep.
3. **`/lesson/resume` route** — new file `app/lesson/resume/page.tsx`, client component (~25 lines). On mount: read `getLastVisitedV2()`, `router.replace` to deep step URL. Fallback to `/onboarding` if no profile, `/curriculum` if profile but no progress. **The shareable, copyable, type-from-memory continue link.** Phase 2 cut for V2; V3 needs it because "navigation" is a priority.

URL convention: every "continue" affordance on the site links to `/lesson/resume`, not the deep step URL. The deep step URL is for indexing and direct sharing of a specific lesson; `/lesson/resume` is for "wherever I left off."

### 10. Keyboard navigation map

A complete table of what every chord does. Discoverable via `?` cheatsheet.

| Chord | Action | Scope |
|---|---|---|
| `⌘K` | Open search palette | Global (except in inputs) |
| `?` | Open keyboard cheatsheet | Global |
| `↵` | Continue (when continue pill is visible) | Global, no input focused |
| `Esc` | Close palette / drawer / modal | Global |
| `⌘⇧B` | Brain dump | Global |
| `⌘↵` | Run editor code | Lesson page, IDE focused or not |
| `⇧↵` | Advance to next step (when passed) | Lesson page |
| `⇧⌫` | Previous step | Lesson page |
| `→` | Same as ⇧↵ | Lesson page, no input focused |
| `←` | Same as ⇧⌫ | Lesson page, no input focused |
| `g h` | Go home | Global, V3 polish |
| `g c` | Go curriculum | Global, V3 polish |
| `g a` | Go about | Global, V3 polish |
| `j` / `k` | Step nav within lesson sidebar | Lesson sidebar, V3 polish |

**`?` cheatsheet** — modal that lists this table. ~30 lines. Mount in `<SiteHeader>` portal.

### 11. The 404 page — `app/not-found.tsx`

**New file.** Branded 404. Same shell as home (header + footer). Body:

- `t-section` headline: `404 · this lesson does not exist (yet)`.
- `t-body` blurb: `the curriculum has 25 chapters and 624 steps, but not this one. try one of these:`.
- 3 cards: `← home` · `the curriculum →` · `↵ continue (if applicable)`.
- StatStrip below.
- If the URL contains `/learn/v2/` and the chapter slug is close to a real one, surface a "did you mean: chapter-slug?" hint via Levenshtein distance against the TOC slugs.

Same skeleton serves `app/global-error.tsx` for unhandled exceptions.

---

## Critical missing primitives

Components that **do not exist yet** but are required for the system above:

1. **`<Header>`** rebuild — `components/SiteHeader.tsx` is currently 31 lines; the new spec is ~150 lines + 3 sub-components.
2. **`<SiteFooter>`** — does not exist. New file `components/SiteFooter.tsx` (~80 lines).
3. **`<HeaderDrawer>`** — mobile drawer for the header. New file (~80 lines).
4. **`<ContinuePill>`** — the resume affordance in the header. New file (~40 lines).
5. **`<SearchPalette>`** — cmd-K. New file (~150 lines) + `components/SearchPalette/index.ts` + the build-time script.
6. **`<KeyboardCheatsheet>`** — `?` modal. New file (~50 lines).
7. **`<LessonBreadcrumb>`** — extract from `LessonStepClient.tsx:151-185` into `components/v2/LessonBreadcrumb.tsx` (~40 lines).
8. **`<LessonStepFooter>`** — replace the inline at `LessonStepClient.tsx:194-209`. Reuse the orphaned `StepFooter.tsx` skeleton; rebuild to spec. ~120 lines.
9. **`<LessonSideRail>`** — rebuild of `ChapterNav.tsx` with phase grouping + linked chapter rows. ~250 lines (today: 240 lines).
10. **`<NotFound>`** — `app/not-found.tsx`. ~60 lines.
11. **`<SkipLink>`** — `<a href="#main">…`. ~10 lines, mounted in `app/layout.tsx`.
12. **`/curriculum` page** — `app/curriculum/page.tsx`. ~50 lines (the `<PhaseBandedRail expanded>` does the heavy lifting).
13. **`/lesson/resume` page** — `app/lesson/resume/page.tsx`. ~30 lines.
14. **`lib/curriculum/navigate.ts`** — `prevStepURL(...)`, `nextStepURL(...)`, `crumbForStep(...)`. ~100 lines.

**Total new code:** ~1,200 lines.
**Total deletions:** ~200 lines (inline footers in `app/page.tsx`, the orphaned `StepFooter.tsx` shell — refactored, not removed).

---

## URL structure verdict

Builds on Phase 2's `URL structure migration verdict` (`audit-v2/05-ia-architecture.md:291-302`):

**Stays (this round):**
- `/learn/v2/[chapter]/[lesson]/[stepIndex]/` — keep the prefix and 0-indexing. Phase 2 + CEO both cut the migration. Agreed.
- `/about`, `/changelog`, `/onboarding` — keep slugs. `/start` rename is a P3.
- Legacy `/learn/[chapter]/...` — Phase 2 cut deletion; reaffirm.

**Adds (this round):**
- `/curriculum` — net-new. The shareable, indexable, single-source-of-truth course outline.
- `/lesson/resume` — net-new. The stable continue link.
- `/404` (`app/not-found.tsx`) — net-new.
- `/?expand=all` query param on `/curriculum` (no new route).
- `#phase-N` hash fragments on `/curriculum`.
- `#main` anchor on every page (skip-link target).

**Migrates (when traffic exists, V4):**
- `/learn/v2/[chapter]/[lesson]/[stepIndex]/` → `/[chapter]/[lesson]/[step]/` (1-indexed).
- `/onboarding` → `/start`.
- Static `_redirects` from old → new.

---

## Top 10 navigation moves to ship

Ranked by ROI (impact ÷ effort). Each: change · files affected · expected effect.

### 1. **Add the global continue pill in `<SiteHeader>`** — P0, ~3h
- **Change:** Insert a `<ContinuePill>` between section nav and right pill cluster. Reads `loadProgressV2().lastVisitedV2`. Hides if user is currently inside that lesson. Click → `/lesson/resume`.
- **Files:** `components/SiteHeader.tsx` (rebuild header to client component); new `components/SiteHeader/ContinuePill.tsx`.
- **Effect:** Returning user gets one-keypress continue from any page on the site. Linear/Notion-grade affordance. The biggest single navigation upgrade per dev-hour.

### 2. **Build `/lesson/resume`** — P0, ~1h
- **Change:** New `app/lesson/resume/page.tsx`. Client component, reads localStorage on mount, `router.replace` to deep step URL. 25 lines.
- **Files:** New `app/lesson/resume/page.tsx`; `lib/storage.ts` (export `getLastVisitedV2` if not already).
- **Effect:** Shareable, type-from-memory continue link. Pairs with #1.

### 3. **Build `/curriculum`** — P0, ~4h
- **Change:** New route, reuses `<PhaseBandedRail>` with an `expanded` prop. Adds filter chips for phase deep-links. Embeds StatStrip.
- **Files:** New `app/curriculum/page.tsx`; mod `components/v2/PhaseBandedRail.tsx` + `PhaseBandedRailClient.tsx` to accept `expanded` and lesson rows.
- **Effect:** Single canonical "see the whole course" URL. Indexable. The link Josh pastes in tweets. Replaces the implicit `/#chapters` anchor with a real route.

### 4. **Make the lesson side rail mobile + linkable** — P0, ~5h
- **Change:** (a) Drop `hidden lg:flex` (`LessonShell.tsx:56`), promote to `hidden md:flex`. (b) Mount the side rail in the global mobile drawer (§1c). (c) Make chapter accordion header a `<Link>` with chevron toggle — Phase 1 ask, finally shipped. (d) Phase-band the rail.
- **Files:** `components/v2/LessonShell.tsx`, `components/v2/ChapterNav.tsx`, new `components/SiteHeader/Drawer.tsx`.
- **Effect:** Mobile users get chapter switching for the first time. Tablet users get the desktop layout. Chapter overview reachable in 1 click instead of 3.

### 5. **Add skip-link + `app/not-found.tsx`** — P0, ~1.5h
- **Change:** Skip-link in `app/layout.tsx`. Branded 404 with header + footer + 3 recovery cards + Levenshtein "did you mean" hint.
- **Files:** `app/layout.tsx`, new `app/not-found.tsx`, new `app/global-error.tsx`, `app/globals.css` (add `.skip-link` class).
- **Effect:** WCAG 2.4.1 compliance. 404 stops being a brand-killer. Both ship in one PR.

### 6. **Lesson breadcrumb — link all four nodes** — P0, ~1h
- **Change:** In `LessonStepClient.tsx:151-185`, wrap the lesson-of-chapter span in a `<Link href={`/learn/v2/${chapter}/${lesson}/0`}>`. Wrap the phase eyebrow in `<Link href={`/curriculum#phase-${phase.number}`}>`. Add a `promptdojo` wordmark crumb at the front, linked to `/`.
- **Files:** `components/v2/LessonStepClient.tsx`.
- **Effect:** Lesson page suddenly has 4 working back-affordances instead of 1. Cheapest navigation win in the audit.

### 7. **Lesson prev/next chrome with keyboard** — P0, ~3h
- **Change:** Replace the inline footer at `LessonStepClient.tsx:194-209` with `<LessonStepFooter>` — adds `← prev step`, context-aware label (`continue → / finish chapter → / start phase 02 →`), `⇧↵` advance, `⇧⌫` prev. Reuse the orphan `components/v2/StepFooter.tsx` skeleton.
- **Files:** `components/v2/LessonStepClient.tsx`, `components/v2/StepFooter.tsx` (rebuild from skeleton), new `lib/curriculum/navigate.ts`.
- **Effect:** Two-way nav within lessons. Keyboard-only learners can complete a lesson without touching the trackpad. Phase / chapter seams become readable.

### 8. **Build the search palette** — P1, ~6h
- **Change:** `<SearchPalette>` portal, `⌘K` global handler, build-time `search-index.json`. ~200 entries, ~5KB gzipped. Substring match, field weights.
- **Files:** New `components/SearchPalette/*` (3 files); new `scripts/build-search-index.mjs`; mod `next.config.*` to wire the build script.
- **Effect:** 624 steps become discoverable. The single biggest "this is a real product" signal Josh can ship after the curriculum route.

### 9. **Global footer** — P1, ~1.5h
- **Change:** New `<SiteFooter>` mounted in `app/layout.tsx`. Three rows: site map, StatStrip, brand+legal. Hides on `/onboarding` and `/learn/v2/*`. Move `app/page.tsx:202-219` content into it.
- **Files:** New `components/SiteFooter.tsx`; `app/layout.tsx`; `app/page.tsx` (delete inline footer).
- **Effect:** Every page (except focused-flow ones) gets navigational structure at the bottom. Trust signals consolidate to one place instead of being scattered.

### 10. **Keyboard cheatsheet (`?` modal)** — P2, ~2h
- **Change:** `<KeyboardCheatsheet>` modal in the header portal. Triggered by `?` global keypress (when no input focused). Lists the 8-12 chords from §10.
- **Files:** New `components/KeyboardCheatsheet.tsx`, mod `components/SiteHeader.tsx` (portal mount + key handler).
- **Effect:** Keyboard shortcuts become discoverable. `⌘K` and `⇧↵` stop being secrets.

---

**Total budget for top 10:** ~28h. Three to four evenings if focused. Every move except #8 ships in under 6 hours; the search palette is the only week-shaped commitment, and it's the move that turns the navigation from "complete" to "linear-grade."

**Sequencing:** ship in order. #1+#2 together (the resume layer). #3 (curriculum). #4+#5+#6 (lesson chrome + a11y baseline). #7 (prev/next). #8 (search). #9+#10 (polish).

---

**ArchitectUX:** Navigation Lead
**Audit date:** 2026-05-06
**Bar:** a Linear navigation designer reads the spec, sees `⌘K` + `↵ continue` + skip-link + `/curriculum` + `/lesson/resume` + 4-node breadcrumb + phase-banded sidebar + prev step + 404 + cheatsheet, and concludes "yes, this is how a learning product navigates."
**The cuts:** vim-style `g h` chords are V4. Light mode is V4. Auth-backed cross-device resume is V4. Per-lesson keyboard maps inside step views are V4. Everything else ships now.
