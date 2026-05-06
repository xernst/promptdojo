# Browser Walkthrough — promptdojo.pages.dev

## Methodology

- **Tool**: `agent-browser` 0.26.0 (CDP-attached real Chrome)
- **Date**: 2026-05-05
- **Viewports tested**: 1920×1080 (desktop), 1280×800 (laptop), 768×1024 (tablet, iPad portrait), 375×667 (mobile, iPhone SE)
- **Routes walked**: `/`, `/onboarding/`, `/learn/v2/variables/`, `/learn/v2/variables/naming-things/`, `/learn/v2/variables/naming-things/0/`, `/learn/v2/variables/naming-things/3/`, `/learn/v2/mcp/`, `/learn/v2/capstone/`, `/this-page-does-not-exist`
- **Interactions tested**: clicked through full onboarding (5 questions), opened "Park a thought" widget, typed into prediction textarea, submitted prediction, ran code in the editor, toggled "Show editor" panel on mobile, tab-keyed for focus rings
- **Probes**: `getComputedStyle()` for fonts/colors, `performance.getEntriesByType()` for resources, `getBoundingClientRect()` for layout positions, fetch checks for asset 404s
- **Screenshots**: 47 captures saved to `/Users/joshernst/Developer/code-killa/design-kit/audit/screenshots/`

---

## Critical issues (BLOCKERS — broken UX, errors, crashes)

- **Mobile pages have an inner-scroll trap (375px width)** — `<main>` contains a single `<div>` with `overflow: auto` and a fixed viewport-height. `document.documentElement.scrollHeight === 667` despite ~4000px of real content (lesson list at top: 3917px). The page body never grows; everything scrolls inside an inner div. Breaks: iOS rubber-band, momentum scroll, scroll-to-top, pull-to-refresh, browser address-bar auto-hide. Reproduced on `/learn/v2/variables/` and `/learn/v2/variables/naming-things/3/`. Evidence: `chapter-variables-mobile-full.png` (only first viewport visible), `chapter-variables-mobile-scrolled-inner.png` (proves content exists but only via inner scroll). Repro: open `/learn/v2/variables/` at 375×667, eval `document.documentElement.scrollHeight` → 667; manually try to swipe-scroll past first viewport.

- **404 page is the default Next.js fallback** — pure black background, generic "404 / This page could not be found." in plain Inter. No promptdojo wordmark, no nav back to chapters/home, no ember accent, no "park a thought" CTA voice. Identical at desktop and mobile. The "Park a thought" floating button is the ONLY clickable element, which is a dead-end (it opens the brain dump but doesn't take you home). Evidence: `404-laptop.png`, `404-mobile.png`. Repro: visit any non-existent URL, e.g. `/this-page-does-not-exist`.

- **No global navigation on lesson/chapter sub-pages on mobile** — On mobile the chapter page (`/learn/v2/variables/`) has no header link back to `/`, no chapters list, no sidebar. The wordmark is gone. The only way back is the browser back button. Same on lesson step pages. Evidence: `chapter-variables-mobile-full.png`, `lesson-step-0-mobile.png`. Repro: open chapter on 375 viewport — scan for any home link.

- **Sidebar step-type labels are truncated to garbage on lesson pages** — At 1280/1920, the lesson sidebar shows step labels: "01 Read · 02 Mc · 03 Read · 04 Predict · 05 Fill · 06 Fix · 07 Write · 08 Checkpoint". "Mc" is clearly a chopped abbreviation (likely "Multiple choice" or "MCQ"). "Fill" and "Fix" next to two "Read" steps are ambiguous without context. Reads broken. Evidence: `lesson-step-3-desktop.png` (left sidebar). Confirmed via DOM probe — these are the literal innerText of the `<li>` elements.

- **Onboarding progress indicator is one step ahead** — On Q1 ("What are you trying to build?") the indicator shows 2 of 5 dots filled (orange). On Q2 ("Where are you starting from?") it shows 3 of 5. On Q4 (form: name/pet/team/city) it shows 4 of 5. The first dot lights up before the user has answered anything. Evidence: `onboarding-q1.png` (dots 1+2), `onboarding-q2.png` (dots 1+2+3), `onboarding-q3.png` (4 dots). Repro: visit `/onboarding/`, count filled dots before clicking anything.

- **Onboarding form on Q4 ("Make the examples yours") has no field labels above inputs that match what the user actually sees** — Placeholders ("Josh", "Luna", "Marketing", "Brooklyn") are personalization examples, not labels. Above each is a tiny SCREAMING uppercase label ("YOUR NAME", "A PET'S NAME", "TEAM OR COMPANY", "YOUR CITY") which contradicts the all-lowercase swagger. Also, `aria-label` count on the homepage is `0` — these inputs likely have no accessible names either. Evidence: `onboarding-q3.png`.

---

## Visual glitches (LAYOUT — overlap, overflow, broken responsive)

- **At 1920px, page content is anchored to a ~1100px center column with massive empty negative space on either side** — Looks like an unfinished max-width layout. The content compresses but the dark canvas around it makes it feel like the page never loaded. Hero "Python for AI-first builders." sits awkwardly small in the upper-left of a vast field. Evidence: `home-desktop-1920.png`, `home-1920-fold.png`.

- **"Get started in under a minute" hero CTA card is bizarrely tall and wide on the homepage** — A full-width orange-bordered banner with a small `→` button at the right end. Disproportionate to the much smaller body text below. Spec calls for "no soft SaaS marketing energy" but this is exactly that — a hero callout banner. Evidence: `home-desktop-full.png`.

- **Chapter card grid has visual inconsistency**: Card 03 ("Lists and dicts") spans wider than the others on the right column on tablet/desktop — looks like a 2-col span when others are 1-col, then column reflows. Evidence: `home-desktop-full.png` (top of card grid). Hard to tell if intentional but reads as a layout glitch.

- **Lesson page sidebar (left) and editor pane (right) waste space at 1280px** — On a 1280-wide laptop, the left chapter nav consumes ~240px, the prompt column ~480px, and the editor ~560px. The middle prompt area's text wraps awkwardly short ("Read the code on the right. The second line uses score on `both sides` of the `=`. What does this print?" wraps to 3 lines despite the column having room). Evidence: `lesson-step-3-desktop.png`.

- **Step counter circle ("0") is unlabeled and visually disconnected** — The conic-gradient progress ring at top-right of lesson page contains a "0" that has no `aria-label`/`title`/explanatory text. New users have no idea what it is (XP? streak? steps complete?). It also remains "0" after a correct prediction submission and a successful code run — feedback never updates. Evidence: `lesson-step-3-desktop.png`, `lesson-prediction-correct.png` (still "0" after success).

- **"Submit prediction" button stays visually disabled-styled even after clicking and showing success** — The button never changes to a "Submitted" state. Lock-in feedback comes only as a separate green-bordered "That's the output." card below. Continue button below also stays orange-but-grey-text in a confusing in-between state. Evidence: `lesson-prediction-correct.png`.

- **Tab-key focus rings use the default browser blue (`rgb(0, 95, 204)`)** — Clashes with the dark/ember design system. Every focus state will look like a Windows-95 dialog. Evidence: `lesson-tab-focus.png`. Probe: `getComputedStyle(document.activeElement).outline` returned `rgb(0, 95, 204) auto 1px`.

- **Onboarding "Pick a daily floor" tile uses Fraunces serif for "5 min / 10 min / 20 min / 40 min"** — Time durations rendered as elegant serif numerals reads like a Sotheby's auction lot, not "terminal swagger". Evidence: `onboarding-q5.png`.

- **The `Park a thought` brain-dump panel header reads "Brain dump" in title case** — Breaks the all-lowercase swagger. Should be "brain dump." Same for the panel buttons "Save" and "Export .md" (mixed case). Evidence: `park-thought-open.png`.

- **"main.py" tab in the editor has a lock icon prefix on closed-tab style with no contextual meaning** — Reads as "this file is read-only" but it's actually the active editable file. Evidence: `lesson-step-3-desktop.png`.

---

## UX pain points (FRICTION — confusing flow, unclear CTA, dead ends)

- **Lesson copy says "Read the code on the right" but on mobile there is no "right"** — The editor is hidden behind a "Show editor" toggle at the bottom. The prompt copy contradicts the layout. Evidence: `lesson-step-3-mobile.png`. Same instruction on tablet (`lesson-step-0-tablet.png`) where editor is also collapsed.

- **Onboarding skips a question silently** — On Q2 ("Where are you starting from?") I clicked "I haven't written code before" and was sent directly to Q4 (the "Make the examples yours" form), bypassing what should be Q3 (a frequency or commitment question). The progress indicator shows dot 4 of 5 lit. Evidence: clicked through `onboarding-q1.png` → `onboarding-q2.png` → `onboarding-q3.png` (which is actually Q4 by indicator). May be branching logic but feels like a bug to the user — no transition cue.

- **"Skip — generic examples" affordance on Q4 is buried, low-contrast, and uses different verbiage than expected ("generic" not "default")** — Most users will fill the form not realizing skip exists. The "Continue" orange button magnetically pulls focus. Evidence: `onboarding-q3.png`.

- **`⌘↵ runs the editor` shortcut hint shown on mobile** — Mobile users have no Cmd key. The hint persists even at 375px. Evidence: `lesson-step-3-mobile.png` (bottom-left tooltip).

- **No "previous step" / "back" affordance inside a lesson** — Bottom bar has `Continue →` but nothing for going back a step except keyboard `←` arrow (undocumented) or sidebar (hidden on mobile). Evidence: `lesson-step-3-desktop.png` bottom bar.

- **"Or run the code →" inline link next to disabled "Submit prediction" looks like a CTA but is an unstyled text link with no visual hierarchy** — Reads as throwaway. Evidence: `lesson-step-3-desktop.png`.

- **Park-a-thought widget has Save AND Export .md buttons but no clear difference** — Save persists where? To localStorage? To a server? Export downloads what? Both are unexplained. Evidence: `park-thought-open.png`.

- **"new here? start the 5-question onboarding" link on homepage** — Bottom copy uses lowercase but the onboarding it links to is title-case ("You're going to learn Python."). Voice mismatch. Evidence: `home-desktop-full.png` + `onboarding-laptop.png`.

- **Homepage hero subhead is a brick of body copy** — 4 lines: "The Python you need to direct AI agents, read what they wrote, and catch what they got wrong. Built for the marketing managers, PMs, and ops folks who use Cursor daily and have hit the ceiling of what they can do without code literacy. Free forever, open source. No certificate, no leaderboards, no journal." Reads like a product description, not "terminal-room confidence". Evidence: `home-desktop-1920.png`.

- **"Fraunces serif + JetBrains Mono pairing" not honored — body is Inter** — Computed styles show `font-family` on body resolves to `Inter, ...`. JetBrains Mono only appears in code blocks and inline ` ` ticks. Spec implies the body voice itself should be mono, or at minimum pair Fraunces with JetBrains Mono — not Fraunces + Inter + JetBrains. Evidence: probe returned `body: Inter, h1: Fraunces, code: JetBrains Mono`.

- **All-lowercase swagger broken in headings** — Probed every h1/h2/h3 on home: `lowercaseHeadCount: 0`. H1 is "Python for AI-first builders." Onboarding is all title case. Card headings ("Read what AI wrote", "Catch what it got wrong", "Direct it deliberately") are all sentence case. Evidence: `home-desktop-full.png`, `onboarding-laptop.png`, all chapter pages.

---

## Minor polish (NICE-TO-HAVE)

- **Two Read steps in Variables sidebar** ("01 Read", "03 Read") with no distinction — needs subtitle or distinct iconography. Evidence: `lesson-step-3-desktop.png`.
- **The orange CTA "Get started in under a minute" border uses a glowing-ember effect that looks like a CSS box-shadow leak rather than intentional design** — see homepage hero card. Evidence: `home-desktop-full.png`.
- **Footer is a single `Press 1-5 / from anywhere to jump 5 chapters at a time` hint** — feels orphaned, no copyright/about/source-code link despite "open source" claim in hero. Evidence: bottom of `home-desktop-full.png`.
- **Hero shows an icons row (`⌘ ⌥ ⏎ esc ?`) with no hover affordance, label, or context** — looks like a keybinding cheat-sheet but is unclickable on the homepage. Evidence: `home-1920-fold.png`.
- **Two ember tones in use** — `rgb(242, 104, 60)` (#F2683C, the spec accent) AND `rgb(227, 76, 28)` (deeper) AND `rgb(249, 139, 105)` (lighter hover). Spec says ember is the *only* accent — strict reading would mean one tone. Evidence: getComputedStyle probe.
- **"PROMPTDOJO" wordmark on `/onboarding/` is uppercase and orange — but on home/lesson it is lowercase and orange** — voice inconsistent. Evidence: `onboarding-laptop.png` vs `lesson-step-3-desktop.png` (top-left).
- **Page document `<title>` tags on chapter pages use ` · ` separator, but lesson step pages use ` · ` too with parentheses** — `Variables — what AI reaches for first · promptdojo` vs `Naming things you'll point AI at (step 1/8) · Variables · promptdojo`. Inconsistent breadcrumb shape.
- **Park-a-thought floating button appears on the 404 page** — the only thing on an otherwise dead page is a brain-dump button. Random.
- **Onboarding Q1 has 4 options but Q2 has 3** — visual layout shift. Evidence: `onboarding-q1.png` vs `onboarding-q2.png`.

---

## Console errors / network failures

- **No JS console errors observed** on home, lesson, or chapter pages (probed `console.error` / `window.onerror` hook).
- **`/_next/static/chunks/main-app.js` returns 404** — guessed Next.js bundle path; site appears to be hosted statically and does not expose this conventional path. Not user-visible but tells me the deploy is custom.
- **`pyodide-worker.js` shows `transferSize: 0` on initial load** — likely cached/304 (Cloudflare Pages CDN), not an error.
- **`html lang="en"` is set, viewport meta correct.** No accessibility skip-link (`<a href="#main">`). `[aria-label]` count on homepage = 0. `<nav>` element count = 0 (uses `<header>` + `<footer>` only). The streak ring `<span role="img" aria-hidden="true">` hides a meaningful UI element from screen readers.

---

## Performance observations

- **Excellent core load times** — DOMContentLoaded: 121ms, load: 147ms on warm cache (probed `performance.timing`).
- **HTML payload: 61KB** — small, fast.
- **55 resources on home** — reasonable.
- **No `slowResources` over 1s** in the Performance API.
- **Pyodide worker preloaded on every lesson page** — heavy for users who never run code. Could be lazy-loaded on first Run click. Evidence: resource entry for `pyodide-worker.js`.
- **TTFB: 62ms** on a fresh `fetch("/")` — Cloudflare Pages doing its job.

---

## What works well (so the implementer doesn't break it)

- **Submit prediction → "That's the output." green confirmation card with "Locked in. Move on when you're ready." footer copy** — voice nails it. Pleasing immediate feedback. Evidence: `lesson-prediction-correct.png`.
- **Code editor (CodeMirror) renders fast, syntax-highlights cleanly, "ran in 3ms" badge is satisfying** — Evidence: `lesson-after-run-direct.png`.
- **Onboarding card hover states have a clean ember outline-only treatment** that fits the dark canvas. Evidence: `onboarding-q1.png` (the "Just curious" outlined card).
- **Variables hero "Variables" Fraunces is genuinely beautiful** — large serif on dark works. Evidence: `chapter-variables-mobile-full.png`.
- **Lesson chapter sidebar uses leading zeros and clean monospace numerals** — correct vibe. Evidence: `lesson-step-3-desktop.png` left rail.
- **Park-a-thought is a clever feature concept** — letting users dump distractions mid-lesson is empathetic UX (assuming Save persists somewhere).
- **Onboarding "Pick a daily floor" microcopy nails it**: "It's a floor, not a target. Going over is fine. Missing a day costs an ember, not the streak." That's the voice the rest of the site is reaching for. Evidence: `onboarding-q5.png`.
- **404 returns `200 OK` for the /onboarding/ asset chain, no console crash spam** — quiet failure.
- **Output panel "Run your code to see output here." italic placeholder is correctly styled** — the only "empty state" copy I found that landed the dry-confident tone.

---

## Top 5 things to fix first

1. **Fix the mobile inner-scroll trap on `<main>`** — remove the `overflow: auto` + fixed-height container so the page scrolls naturally. This is breaking iOS UX on every chapter and lesson page.
2. **Replace the default Next.js 404** with a branded promptdojo 404 (ember accent, wordmark, "lost the thread? jump to chapter 01" CTA, link home). Currently a dead page.
3. **Fix the onboarding progress indicator off-by-one** — first dot should not light until user advances past Q1.
4. **De-truncate / re-label the lesson sidebar step-types** — "Mc" → "Multiple choice", differentiate the two "Read" steps, give "Fill" / "Fix" / "Write" stronger semantics.
5. **Decide the typography rule and apply it sitewide** — body should be JetBrains Mono (per spec) OR Inter (current). Pick. Then fix the all-lowercase rule across H1/H2/H3/buttons/sidebar — currently zero headings honor it.

---

**QA Agent**: EvidenceQA
**Evidence Date**: 2026-05-05
**Screenshots**: `/Users/joshernst/Developer/code-killa/design-kit/audit/screenshots/`
**Realistic rating**: C+ — strong typography vibes and great microcopy in spots, but mobile is broken in a fundamental way, the brand voice is only ~40% applied, and the 404 + sidebar truncation + onboarding indicator off-by-one all feel like ship-it-without-QA defects. Production readiness: NEEDS WORK.
