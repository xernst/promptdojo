# CEO Vision V3 — The Pristine Bet

**Author:** Studio Producer (CEO)
**Date:** 2026-05-06
**Audience:** Head of IT + dev shipping the V3 sprint
**Predecessors:** `audit/CEO-vision.md` (V1 punk shell), `audit-v2/CEO-vision.md` (V2 receipts layer)
**Bar:** Stripe / Linear / Vercel / Notion / Figma — *pristine*. Founder verdict: site, navigation, IDE are at 30%.

---

## The bet (1 paragraph)

**V1 made the brand. V2 made it real. V3 makes it Linear-grade.** After V3, the IDE feels like Replit — not Codecademy-1998 — because tracebacks render as structured frames instead of walls of red, the editor is themed in dojo-green instead of Atom-purple, autocomplete + bracket-pairs + tab-indents-spaces close the "did a beginner write this?" gap, and a hairline boot progress bar means "loading wasm" stops reading as "site broken." Navigation finally moves: every page gets a sticky header with `↵ continue`, a `/curriculum` URL exists for tweets and Google, the lesson breadcrumb has four working links, mobile users can switch chapters from a hamburger drawer, and the 404 stops being a brand-killer. The repostable surfaces — bug-band hero, `$0 forever` band, per-chapter OG cards, the 398/624 number lie corrected — turn the home page from "informational" into "screenshot library." And before any of that ships, **PR 0 fixes the silent XP-loss bug** the code reviewer flagged, because data correctness comes before everything. The audit authors should look at this list and see their work landed; the dev should look at it and know exactly what Monday looks like; an X reply-bomber should crop any band on the new home and post it without explanation.

---

## CRITICAL: data-correctness bug (PR 0, ships before everything)

**Reference:** `audit-v3/07-code-quality.md` §1 — HIGH issue
**Bug:** `awardPass()` in `lib/streaks.ts:64` writes v1 `GlobalProgress.streak` via `updateProgress`. The entire v2 learn UI reads `loadProgressV2().streak.todayXp`. Every step a learner passes silently discards XP from the v2 store. The `DailyGoalDial` shows `0 min` no matter what the learner does. The streak the user sees can never go up.
**Why this can't wait:** Every other change in V3 — repostable bands, sticky header, IDE polish — assumes the progress system is honest. Shipping pristine UI on top of a state machine that drops writes is malpractice. **PR 0 lands before any V3 PR. Non-negotiable.**
**Fix:** Migrate `awardPass()` and `grantFrozenFlame()` to write `ProgressV2.streak` via `updateProgressV2`. Bundle in the same PR: export `PROGRESS_KEY_V2` / `PROGRESS_EVENT_V2` constants from `storage.ts` so `LoginToSave.tsx` stops re-declaring them (refactor C). Stamp `lastSeenAt` only in `setLastVisitedV2`, not on every write (refactor 10).
**Effort:** 2.5h. Highest-priority work in the entire V3 cycle.

---

## Convergent findings (where multiple audits agree)

These are the things every report independently named. Picking these is just executing on consensus.

- **The IDE editor is themed in Atom's brand, not the dojo's.** UI Polish §12, IDE Deep §1, Visual Storytelling §5. Ships in V1 spec, V2 spec, V3 spec — never landed. `oneDark` import → `dojoTheme` is the single highest-leverage pixel-per-dev-hour change on the property.
- **The mobile/tablet "Show prompt" toggle is broken.** Browser Walkthrough L-02, Navigation §1c, IDE §6, A11y M8. Tablet and mobile users get an editor with code they can't read, and the only way out is to type a URL. This is the worst current bug-class on the site.
- **No skip link, no `<h1>` on lesson pages, no 404, focus rings invisible.** A11y C1/C2/C3, Browser L-11, Navigation §11. Five WCAG AA fails in one cluster. Cluster fixes in ~95 minutes.
- **The 398 vs 624 step-count discrepancy.** Marketing #4, Browser H-02. Same component renders different numbers on `/` vs `/about`. Credibility leak in the 5-second scan.
- **Tracebacks render as a wall of red text.** IDE §2, UI Polish §13, Visual Storytelling §5. The single biggest "the IDE feels alive" win in the report — every error a learner sees is currently shown as raw `traceback.print_exc()` output with no syntax highlighting, no clickable line numbers, no folded internal frames.
- **Header is `position: static` + no mobile drawer + no global continue affordance.** Browser N-01/N-08, Navigation §1, UI Polish §1. Every page on every viewport ships a non-sticky header that disappears on scroll, no hamburger, no `↵ continue` pill. Returning users have no resume affordance unless they happen to be on `/`.
- **`/curriculum` URL doesn't exist; chapter sidebar hidden below 1024px.** Navigation §6/§4, Browser C-01, Marketing #7. The single canonical "see the whole course" URL — the link Josh pastes in tweets — is missing. Mobile lesson users have zero curriculum nav.
- **Lesson breadcrumb has one working link out of four.** Navigation §3, Browser N-04, A11y C3. `phase`, `lesson title`, and the `promptdojo` wordmark are all decoration; only `ch NN` is a real link. Cheapest navigation win in the audit.
- **Pyodide cold-start UX reads as broken.** IDE §6, Performance §11, Visual Storytelling §5. "Booting Python (one-time, ~5s)…" hangs unchanged for 5–60 seconds with no progress and no failure handling. On corp proxies the user concludes the page is broken.

---

## Divergent findings (where audits disagree, my call)

### 1. Mobile editor: ship a real one vs. ship a graceful gate
- **IDE Deep §6** — gate the editor below 768px; show "ship on desktop" for runnable steps. ~1 day.
- **Navigation §4** — promote the sidebar from `lg:` to `md:`, mount it in a hamburger drawer, mobile users get full chapter switching. ~5h.
- **Visual Storytelling §4** — sidebar collapses to `w-12` rail with hover-to-expand.
- **My call: ship the gate (IDE §6) AND the drawer (Nav §4). Don't ship the sidebar collapse.** Reasoning: the gate is honest ("the editor is desktop only — for now"); the drawer fixes the chapter-switching gap; the hover-to-expand sidebar is V4 polish for an audience that hasn't shown up. Solo founder + builder audience + $0 = "desktop only" reads as posture, not apology. Builders carry laptops.

### 2. `$0 forever` band on home
- **V2 CEO** cut it explicitly: "contradicts the no-marketing-wrapper posture."
- **Marketing #2** wants it: "the cleanest single-frame meme on the page."
- **My call: uncut it. Ship the band.** Reasoning: V2's posture was right when the site needed to read "real product." V3's metric is X followers, and `$0` in 360px mono is the most quote-tweetable single frame the site can ship. The band lives between StatStrip and chapter rail; the *rest* of the page stays no-marketing. One band of declared posture isn't a wrapper; it's a punchline.

### 3. Hero rebuild: bug-band-as-anchor vs. air-around-current-hero
- **Marketing #1** — promote the bug snippet to viewport-dominant centerpiece, add the `cursor.py` chrome label + red annotation arrow ("← evaluated once. every caller mutates the same list.").
- **Visual Storytelling §1** — three-act page, hero gets 90vh of air with *only* eyebrow + headline + tagline.
- **UI Polish §3** — keep the current composition, fix the gap rhythm (40 → 48 → 64 → 40).
- **My call: Marketing #1 wins, then UI Polish §3's spacing applies inside it.** Reasoning: the audience-growth metric demands a screenshot-perfect hero. Visual Storytelling's air-only hero is editorially correct but generates zero meme assets. Promoting the bug snippet to centerpiece + adding the annotation is the single highest-leverage move for the X-followers metric. Apply Polish's gap rhythm inside the new layout.

### 4. CodeMirror autocomplete: static dictionary vs. Pyodide introspection
- **IDE §3** — phase 1 ships static dict (Python builtins + 200 stdlib names). Phase 2 ships `dir(__main__)` after each run.
- **My call: Ship phase 1 only.** Reasoning: 1 dev-day vs. 2. Static dict closes 80% of the "Replit-feel" gap. Phase 2 introspection earns its keep when there's user data to validate that beginners actually want function-scoped completion vs. typing `pri` and pressing Tab. V4 problem.

### 5. Run history (last 5 runs in the IDE)
- **IDE §8** wants it: "compare runs without losing state."
- **My call: cut.** Reasoning: 4 dev-hours for a feature that solves a problem (ring buffer of past stdouts) most beginners don't experience. The traceback formatter (PR 2) makes single-run output 10x more legible; that's where the budget goes. Run history is a nice-to-have when intermediates outnumber beginners. Not now.

### 6. Per-chapter OG cards: 3 hand-designed vs. 25 templated
- **Marketing #3** — wire the 3 existing variants (`wedge`/`ide`/`capstone`) for ch07/ch13/ch25 first; templated 22 in a second PR.
- **My call: Marketing #3 exactly. Ship the 3, defer the 22 to V3.5 or V4.** Reasoning: the 3 hand-designed cards are 30 minutes of metadata wiring; the templated 22 are a real engineering project that requires authoring 22 thesis lines and shipping a templated OG generator. The 3 are the chapters most likely to be linked in X replies anyway.

---

## The picked list (9 changes, in ship order)

After PR 0 (the data-correctness bug) lands. Each pick traces to the audit reports cited.

### 1. Sweep the WCAG AA fails — skip link, lesson `<h1>`, focus rings, 404, `text-green-700` contrast — *the a11y baseline cluster*
- **Why this:** Five WCAG AA violations in one cluster. None individually heroic; together, they're the floor for "real product." Includes the branded 404 page (Browser N-11/F-01), the skip link (A11y C2), the lesson `<h1 className="sr-only">` (A11y C3), the `text-green-700` → `text-green-400` contrast sweep across 9 files (A11y C4), and the `*:focus-visible` outline-style fix (Browser L-11). Audience-growth metric demands the site work for keyboard + screen-reader users — every barrier is a reply that doesn't happen.
- **Touches:** `app/layout.tsx` (skip link), new `app/not-found.tsx` (branded 404 with header + footer + "did you mean" Levenshtein hint), `components/v2/LessonStepClient.tsx:156` (sr-only h1), `components/v2/ChapterNav.tsx` + 5 step views (`text-green-700` → `text-green-400`), `app/globals.css` (focus canon `outline-style: solid`), `components/SiteHeader.tsx:15` (`<div>` → `<header>`), `components/LoginToSave.tsx` (Escape handler + focus trap + label on email input — A11y C5/M10).
- **Owner audit:** `audit-v3/09-accessibility.md` Top 10 #1, #2, #3, #4, #5, #10 + `01-browser-walkthrough.md` N-11 + L-11.
- **Estimated impact:** Lifts a11y from "auto-fail WCAG 2.4.1" to "AA-clean on all critical paths." Branded 404 stops being the brand-killer Marketing flagged. ~2.5h cluster. Single highest credibility-per-dev-hour PR in V3.

### 2. Format Python tracebacks (`<TracebackView>`) — *the IDE feels alive*
- **Why this:** The single biggest "feelings-per-dev-hour" change in the entire audit. Every error a learner sees today is `traceback.print_exc()` dumped raw into a `<pre className="text-err">`. Linear / Replit / Codespaces parse traceback structure: collapse Pyodide internal frames, syntax-highlight code in frame snippets, link `line N` to scroll the editor. Beginners' confidence is forged or broken at the moment of an error — this is *the* moment of truth.
- **Touches:** New `lib/python-traceback.ts` (~120 lines parsing `File "<exec>", line N, in <module>` + `^` carets + final `ExceptionType: message`), new `components/v2/TracebackView.tsx`, `components/v2/PersistentIDE.tsx:355-356` (swap raw `<pre>` for `<TracebackView>`). Wire `EditorView.dispatch({ effects: scrollIntoView(line(N)) })` for clickable line numbers.
- **Owner audit:** `audit-v3/05-ide-deep-dive.md` IDE move #2.
- **Estimated impact:** Errors stop being a wall of red. Lifts IDE feel from 30% → 55% in one PR. ~1 day.

### 3. Replace `oneDark` with the dojo CodeMirror theme + add `closeBrackets` / `bracketMatching` / `indentWithTab` — *the editor is finally on-brand*
- **Why this:** The most-looked-at surface in the entire product is currently themed in Atom's brand. V1 specced `lib/codemirror-theme.ts`, V2 specced it, V3 ships it. Bundle the three free extensions (`closeBrackets` + `bracketMatching` + `indentWithTab`) because they're 5 lines of code each and Tab-indents-spaces is the single biggest beginner-Python ergonomics fix on the property.
- **Touches:** New `lib/codemirror-theme.ts` (token map: `caret = green-500`, `selection = green-500/18`, `keyword = green-500`, `string = ink-100 italic`, `comment = ink-500 italic`, `builtin/function = green-300`, `background = ink-950`, `activeLine = ink-900`, `gutter = ink-700`). `components/v2/PersistentIDE.tsx:5,255` (swap import). Add `keymap.of([indentWithTab])` + `closeBrackets()` + `bracketMatching()` to extensions array (`PersistentIDE.tsx:206-215`). Strip `@codemirror/theme-one-dark` from deps. CSS for `.cm-cursor` 1Hz blink in `globals.css`.
- **Owner audit:** `audit-v3/05-ide-deep-dive.md` IDE moves #1 + #4 + `02-ui-polish.md` §11 + §12.
- **Estimated impact:** Brand fidelity 92% → 99% on the highest-traffic surface. Lifts IDE feel from 55% → 70%. ~5h.

### 4. Pyodide cold-start hairline + honest copy + 15s timeout — *boot stops reading as broken*
- **Why this:** "Booting Python (one-time, ~5s)…" hangs unchanged for the actual 5–30 seconds the user waits. On corp proxies it hangs forever. The user concludes the page is broken. A 1px ember hairline animating from 0% → 100% across the IDE top edge converts the boot from "is this broken?" to "this is the tool warming up." Drop the lying "(one-time)" claim; ship a 15s timeout that surfaces a retry banner instead of hanging silently.
- **Touches:** `public/pyodide-worker.js:32` (replace `loadPyodide({indexURL:'/pyodide/'})` with manual `fetch().then(response.body.getReader())` + bytes-streamed wrapper, postMessage percentage). `components/v2/PersistentIDE.tsx:273-284` (replace status string with `<ProgressHairline>` primitive — already shipped in V2). Wrap `ensurePyodide()` in `Promise.race([ensure, timeout(15000)])`. Lowercase voice fix while we're in there: `STATUS_COPY.ready = "press run · ⌘↵"`, `STATUS_COPY.idle = "booting python…"` (UI Polish §11).
- **Owner audit:** `audit-v3/05-ide-deep-dive.md` IDE move #6 + `02-ui-polish.md` §11 + `08-performance.md` #11.
- **Estimated impact:** Removes the worst false-broken signal in the product. Lifts IDE feel from 70% → 78%. ~1 day.

### 5. Sticky header + global `↵ continue` pill + `/curriculum` route + `/lesson/resume` route — *the navigation spine*
- **Why this:** Founder named navigation as a priority area. This PR does the four highest-ROI navigation moves in one cluster: (a) make `<SiteHeader>` sticky with `border-b`, (b) ship the `<ContinuePill>` reading `lastVisitedV2` so every page has one-keypress resume, (c) build `/curriculum` (30-line server component reusing `<PhaseBandedRail expanded>`) — the canonical URL Josh pastes in tweets, (d) build `/lesson/resume` (25-line client component, reads localStorage, `router.replace` to deep step URL). Hide the "1/398 ~0%" hairline outside lesson pages (Browser N-02). Add `<header>` landmark from a11y cluster.
- **Touches:** `components/SiteHeader.tsx` (rebuild to client component, add sticky + `border-b`, add `<ContinuePill>`, gate progress hairline by `pathname.startsWith("/learn/v2")`), new `components/SiteHeader/ContinuePill.tsx`, new `app/curriculum/page.tsx`, new `app/lesson/resume/page.tsx`, `components/v2/PhaseBandedRail.tsx` (accept `expanded` prop). Demote `LoginToSave` ghost when logged-out + hide `★ 0` GitHub pill when stars < 10 (Marketing #6 + V2 §CTA hierarchy that didn't fully ship).
- **Owner audit:** `audit-v3/04-navigation-system.md` moves #1 + #2 + #3 + N-02 contextualization + `01-browser-walkthrough.md` N-01 + `06-marketing.md` #6.
- **Estimated impact:** Returning user gets one-keypress continue from any page. `/curriculum` URL becomes the indexable, shareable, tweet-pasteable single-source-of-truth. ~5h.

### 6. Mobile drawer + lesson sidebar `md:` + linked chapter rows + 4-node breadcrumb — *navigation works below 1024px*
- **Why this:** The current mobile lesson IDE has zero curriculum navigation. The chapter accordion header doesn't navigate (Phase 1 ask, never shipped). The lesson breadcrumb has 1 working link of 4. This cluster fixes all three: (a) mount `<HeaderDrawer>` on `<SiteHeader>` for hamburger access on mobile, (b) drop `hidden lg:flex` to `hidden md:flex` on the sidebar so tablet gets desktop nav, (c) make `ChapterNav.tsx` chapter row a `<Link>` with chevron toggle to its right, (d) wrap `phase`, `lesson title`, and `promptdojo` wordmark in the lesson breadcrumb in `<Link>` (4 working nodes instead of 1). Bonus from a11y: add `aria-current` to active nav items.
- **Touches:** New `components/SiteHeader/Drawer.tsx`, `components/v2/LessonShell.tsx:56` (md: breakpoint), `components/v2/ChapterNav.tsx:71-95` (split row title from chevron toggle, add `aria-current` + `aria-expanded`), `components/v2/LessonStepClient.tsx:151-185` (link all four breadcrumb nodes).
- **Owner audit:** `audit-v3/04-navigation-system.md` moves #4 + #6 + `01-browser-walkthrough.md` N-04/N-08/N-09 + `09-accessibility.md` M1.
- **Estimated impact:** Mobile users get chapter switching for the first time. Tablet users get the desktop layout. Lesson page goes from 1 working back-affordance to 4. ~5h.

### 7. Repostable hero rebuild + `$0 forever` band + 398/624 fix + per-chapter OG (3 hand-designed) — *the X-followers PR*
- **Why this:** Direct ladder to the validation metric. (a) Promote `<HeroBugSnippet>` to the visual centerpiece, add `cursor.py` chrome label + red annotation arrow `← evaluated once. every caller mutates the same list.` (mirror the OG art at `route.tsx:266`). (b) Ship a `$0 forever` viewport-tall band between StatStrip and chapter rail — `renderPrice()` OG content as live HTML. (c) Fix the 398/624 step count discrepancy: ONE source of truth from manifest, propagate everywhere. (d) Wire per-chapter `openGraph.images` for ch07/ch13/ch25 pointing to existing OG variants.
- **Touches:** `components/HeroBugSnippet.tsx` (add label + annotation), `app/page.tsx` hero block (reorder, apply UI Polish §3 spacing 40 → 48 → 64 → 40), new `components/PriceBand.tsx`, `components/StatStrip.tsx` (single source of truth from manifest sum), `app/learn/v2/[chapter]/page.tsx` metadata generation (per-chapter OG for the 3 story chapters). Bonus: drop `axes: ["SOFT", "WONK"]` from `Fraunces({...})` if unused (Performance #6) — saves 10-15kb on the preloaded font.
- **Owner audit:** `audit-v3/06-marketing.md` moves #1 + #2 + #3 + #4 + `02-ui-polish.md` §3 + §4 + `08-performance.md` #6.
- **Estimated impact:** Hero becomes the canonical promptdojo screenshot. `$0` becomes the cleanest single-frame meme. Per-chapter URLs in X replies show the right card. Estimated 3-5x screenshot rate on the hero alone. ~5h.

### 8. Performance cluster — `lowlight` for python only + `immutable` cache headers + lazy CodeMirror + OG content-type fix — *lesson route halves its JS*
- **Why this:** Performance is fine for a static blog, broken for an IDE. The 246 KB highlight.js chunk is the killer; it's loading 35 languages for a Python-only school. Bundle 4 fixes: (a) Replace `rehype-highlight` (`common` languages) with `lowlight` configured for `python` only — saves ~50-70 KB br on every lesson. (b) Add `Cache-Control: max-age=31536000, immutable` for `/_next/static/*`, `/og/*`, and bump `/pyodide/*` — repeat-visit LCP drops from 0.65s to 0.15s. (c) Lazy-load CodeMirror with `next/dynamic({ ssr: false })` — saves 72 KB br off lesson initial wave. (d) Fix OG content-type from `application/octet-stream` → `image/png` (Browser OG-01) — unblocks Slack/Mastodon link previews.
- **Touches:** New `lib/markdown.ts` (shared lowlight + python config), all 7 `*StepView.tsx` files (use shared markdown renderer), `public/_headers` (cache rules), `components/CodeEditor.tsx` (dynamic import wrapper).
- **Owner audit:** `audit-v3/08-performance.md` moves #1 + #2 + #3 + #5 + #8 + `01-browser-walkthrough.md` OG-01.
- **Estimated impact:** Lesson initial JS drops from 520 KB br → ~290 KB br. Lesson TTI improves 600-900ms on broadband, 3-5s on mobile 4G. Repeat-visit LCP drops below 200ms. ~4h.

### 9. Voice + system sweep — `dojo-btn-primary` everywhere + lowercase IDE copy + lesson sidebar polish + sharp corners + `dojo-kbd` utility — *every-pixel cleanup*
- **Why this:** The system was built and then not used. Hand-rolled buttons, capital-R "Run", `rounded` in the sidebar (brand violation — sharp corners are kit), `oneDark`-themed Atom-purple in the IDE, `text-ink-600` text usages that fail AA. This is the per-pixel sweep that converts "the system exists" to "the system is honored." Bundle character-edit-only changes (lowercase, system class swaps, contrast fixes) so reviews stay atomic.
- **Touches:** Replace ad-hoc submit-button Tailwind with `dojo-btn-primary` in 4 step views (Code Quality refactor B). New `dojo-kbd` utility in `globals.css` + apply to `HomeClient.tsx`, `app/page.tsx`. Drop `rounded` everywhere in `ChapterNav.tsx`. Lowercase + system-class sweep in `app/onboarding/page.tsx` (UI Polish §15). Replace lesson `★ Lock` icon with neutral middle dot (UI Polish §10). `text-ink-600` text → `text-ink-500` sweep (UI Polish §18). Tier-color invert in `PhaseBandedRailClient.tsx` (UI Polish §8 — foundations brightest, advanced muted). Drop `★ 0` star count below 10 (Marketing #6).
- **Owner audit:** `audit-v3/02-ui-polish.md` §1, §6, §10, §11, §14, §15, §18, §20 + `07-code-quality.md` refactors B + C + `06-marketing.md` #6.
- **Estimated impact:** The site that already reads "real product" reads "Linear-grade" after this sweep. ~3h. Easy to review, easy to revert.

---

## The cut list (with reasoning)

The audit authors should see their work was read. Every cut here is intentional, with reasoning.

- **Real mobile editor** — IDE Deep §6. Cut: $0 budget, 3-week project, builder audience has laptops. Ship the gate. V4.
- **Run history (last 5 runs)** — IDE §8. Cut: 4 dev-hours for a feature beginners don't experience; the traceback formatter solves the same "what just happened?" problem at 10× the impact.
- **Pyodide-introspection autocomplete** — IDE §3 phase 2. Cut: static dictionary closes 80% of the gap at 1/2 the cost. V4.
- **Lint squiggles + stop button + service-worker cache + editable ranges + show-solution-in-IDE-chrome** — IDE moves #9, #11, #14, #12, #13. Cut as a cluster: each is correct, none are load-bearing for "the IDE feels alive." Picks 2/3/4 deliver the perceived 30% → 70% lift; these earn V4.
- **`SearchPalette` (cmd-K)** — Navigation §7. Cut: ~6h for a feature that solves a problem (find a step among 624) at the audience scale of zero. V3.5 when there's actual returning-user volume to justify it. The `/curriculum` route delivers the indexable structure; search lives in V3.5.
- **Keyboard cheatsheet + `?` modal + vim-style `g h` chords** — Navigation §10. Cut: V4 polish. `↵ continue` and `⌘↵ run` are enough for V3.
- **Per-chapter "thesis URL" pages with one-line theses (all 25)** — Marketing #7. Cut: requires authoring 25 thesis lines + chapter-overview rebuild. The 3 hand-designed OG cards (pick #7) deliver 80% of the X-reply-asset value at 10% of the cost.
- **The capstone agent-trace home band** — Marketing #8. Cut: lovely, but the `$0` band (pick #7) is the cleaner single-frame meme. One viewport-tall band per home page. V4.
- **The "open source — star the repo" seed ask** — Marketing #5. Cut: literally one line of copy. **Bundle into pick #9 instead** — character-edit. Treating as a pick steals a slot.
- **The 22 templated per-chapter OG cards** — Marketing implementation note. Cut: ship the 3 hand-designed first. Templated 22 = V4.
- **Editable ranges for `fix` steps** — IDE #12. Cut: requires schema field + content-authoring sweep. V4.
- **Test suite for `_grader.ts` + `home-state.ts` + `streaks.ts`** — Code Quality #5/#6. Cut from V3 ship list, but encouraged as background work. The streak bug (PR 0) being a test-that-would've-caught-this is the strongest case for tests. Park as `v3.5/tests-foundation`.
- **Asymmetric layouts (about wedge, chapter index 60/40)** — Visual Storytelling §3. Cut: editorially correct, $0-evening-budget incorrect. Picks 7 + 9 deliver the brand-grade home; about + chapter-index polish is V4.
- **About page rebuild as 5-spread book** — Visual Storytelling §2. Cut: about is the *closest to pristine* page on the site (90% on-brand per UI Polish §17). Sweep to system tokens lands in pick #9. The 5-spread rebuild is V4 if it earns its keep.
- **Lesson chrome rebuild with pane labels + workspace personalities** — Visual Storytelling §4 + UI Polish §9. Cut: the 4-node breadcrumb (pick #6) carries the "named workspace" signal at 1/10 the budget. V4.
- **Reset-to-starter button + ANSI color in output + run-button idle-loading-success transitions** — IDE #7 + UI minor. Cut as a cluster: each is correct polish, none are load-bearing. V3.5/V4.
- **Pre-render markdown content at build time (drop react-markdown)** — Performance #4. Cut: ~90-110 KB br savings, but requires real refactoring across 7 step views and the build pipeline. The `lowlight` swap (pick #8) gets us 50-70 KB at 1/4 the risk. V4.
- **`<details>/<summary>` legacy course disclosure removal** — Browser H-08. Cut: trivial removal but defer to pick #9's character-edit sweep if there's room; otherwise V4. Don't elevate to a pick.
- **Site footer rebuild (3-row global footer)** — Navigation §2. Cut: footer matters less than header for nav-priority work. The home footer is fine; lesson page doesn't render one (correct — `100dvh`). V4.
- **Stamp `lastSeenAt` only in `setLastVisitedV2`** — Code Quality refactor 10. **Bundled into PR 0** (data-correctness). Don't elevate.
- **Add `noUncheckedIndexedAccess` to tsconfig** — Code Quality #3. Cut: 2h to chase compile errors across 5 files for "would catch real bugs" with no observed real bug. V4.

---

## Sequencing

Each pick is one PR. Don't bundle. Sequenced for dependency + risk.

| # | PR | Hours |
|---|---|---|
| 0 | `refresh-v3/00-fix-xp-bug` (PR 0 — data correctness) | 2.5 |
| 1 | `refresh-v3/01-a11y-baseline` (skip link, 404, h1, contrast, focus, header landmark, login modal) | 2.5 |
| 2 | `refresh-v3/02-traceback-view` | 8 |
| 3 | `refresh-v3/03-codemirror-theme` (theme + brackets + indent) | 5 |
| 4 | `refresh-v3/04-pyodide-boot-progress` | 8 |
| 5 | `refresh-v3/05-nav-spine` (sticky header, continue pill, /curriculum, /lesson/resume) | 5 |
| 6 | `refresh-v3/06-mobile-drawer-and-breadcrumb` (drawer, md:, chapter row link, 4-node breadcrumb) | 5 |
| 7 | `refresh-v3/07-repostable-hero` (hero, $0 band, 398/624 fix, 3 OG cards) | 5 |
| 8 | `refresh-v3/08-perf-cluster` (lowlight, immutable, lazy CM, OG content-type) | 4 |
| 9 | `refresh-v3/09-voice-and-system-sweep` (dojo-btn, lowercase IDE, sharp corners, ink-600, star-the-repo) | 3 |

**Total: ~48h. Over budget by 18h.** Solo evening cadence is ~6h × 5 evenings/week. **Plan A:** ship picks 0–6 in week 1 (38h — the IDE + nav cluster is the founder-named priority and PR 0 is non-negotiable). Ship picks 7–9 in week 2 (12h — repostability + perf + voice). **Plan B if week 1 slips:** drop pick #4 (Pyodide boot progress, 8h) to V3.5 — it's the single biggest cut candidate. Boot UX reads as broken today; it'd still read as broken without #4, but the *other* picks all individually move the needle more than #4 alone.

**Don't merge picks 1–9 until PR 0 lands.** Every pick assumes streak XP writes correctly.

**Pick 1 (a11y baseline) is also a soft gate** for picks 5/6 — sticky header rebuild (5) needs the `<header>` landmark from 1; mobile drawer (6) needs `aria-current` patterns from 1.

---

## Success criteria

The pristine bar passing tests:

- [ ] Replit dev opens `promptdojo.pages.dev/learn/v2/variables/naming-things/0/`, runs broken code, sees the rendered traceback frame, and does not laugh.
- [ ] Linear nav designer opens any page on mobile, hits the hamburger, switches chapters, hits the `↵ continue` pill — never gets stuck.
- [ ] X reply-bomber crops the `$0 forever` band, posts as reply to a Codecademy marketing tweet, gets ≥ 5 "wait what is this" replies in 24h.
- [ ] Stranger lands on `/about`, hits a 404 by typing `/aboot`, sees the branded 404 with "did you mean: about?" and laughs.
- [ ] Anyone tabs through any page — focus ring visible at every stop, skip link first stop, `<h1>` reads on lesson pages.
- [ ] StatStrip shows the same step count on `/`, `/about`, and the lesson breadcrumb. ONE number propagates.
- [ ] `lib/streaks.ts` `awardPass()` writes `ProgressV2.streak`. `DailyGoalDial` shows minutes accumulating as the user passes steps.
- [ ] CodeMirror editor renders dojo-green caret + green selection + ember syntax tokens. No purple. No cyan.
- [ ] Pyodide cold-start shows a hairline progress bar animating from 0% → 100%. On a 15s timeout, surfaces a retry banner.
- [ ] Per-chapter URL `/learn/v2/mutation/` shared on X shows the wedge OG card, not the generic one.
- [ ] Repeat-visit lesson page LCP < 200ms (immutable cache hit).

---

## What we're NOT doing in V3 (V4 problems)

- Real mobile editor (3-week project; ship the gate).
- `SearchPalette` cmd-K (no audience volume yet).
- 25 templated per-chapter OG cards (ship the 3 hand-designed).
- Per-chapter "thesis URL" pages (Marketing #7 — 25 thesis lines + chapter overview rebuild).
- Capstone agent-trace home band (one viewport-tall band per home; `$0` wins).
- Run history in IDE.
- Lint squiggles, stop/abort button, service-worker cache for Pyodide.
- Pyodide-introspection autocomplete (static dict ships in V3).
- Editable ranges for `fix` steps.
- `noUncheckedIndexedAccess` tsconfig sweep.
- Test suite for graders/state/streaks (encouraged as background work; not on the V3 ship list).
- About page 5-spread rebuild + chapter-index 60/40 asymmetric.
- Lesson chrome workspace rebuild (`bg-ink-950` IDE pane, hover-thicken dividers, `❯ stdout` pane labels).
- Site footer rebuild (3-row global footer with nav).
- Light mode.
- `/settings` route + JSON export/import.
- Auth / sync / cross-device progress.
- AI tutor / Copilot panel.
- `Saved · Ns ago` indicator.
- Keyboard `?` cheatsheet + vim-style `g h` chords.
- Pre-render markdown at build time (`react-markdown` removal).
- IA refactor (drop `/learn/v2/` prefix; fold legacy `/learn/[chapter]` route).
- Custom illustration system / tatami background / 3-stripe belt motif.

---

**Studio Producer**: CEO
**Review Date**: 2026-05-06
**Implementation handoff**: senior dev, branches `refresh-v3/00-*` through `refresh-v3/09-*`
**Strategic posture**: Pristine = data correctness + IDE + navigation + repostability. Voice is the moat (don't soften). The receipts shipped in V2 (don't redo). V3 is the surface that makes a Replit dev nod, a Linear designer say "yes," and an X reply-bomber screenshot.
**Vibe**: PR 0 is non-negotiable. Picks 1-6 are the founder-named priorities (IDE + nav). Picks 7-9 are the repostability + perf + sweep. Ship the bug fix Monday morning before anything else.
