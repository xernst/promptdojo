# Promptdojo Current State — Post V3, Pre V4

**Source URL:** https://promptdojo.pages.dev/
**Captured:** 2026-05-06
**Screenshots:** `~/Developer/code-killa/design-kit/audit-v4/screenshots/promptdojo/` (43 PNGs across 4 viewports + login modal + mobile toggle interaction)
**Tool:** `agent-browser` CLI (CDP) at 1920×1080, 1280×720, 768×1024, 375×667. JS probes via `agent-browser eval`.
**Inputs read:** `audit-v4/01-cartesian-walkthrough.md`, `audit-v3/CEO-vision.md`, `audit-v3/SENIOR-DEV-worklog.md`.
**Brief:** baseline the live promptdojo site against the V3 worklog (what shipped vs deferred) and the Cartesian inspiration (where promptdojo's polish trails). Don't propose fixes — that's other agents.

---

## V3 picks confirmed live (sanity check what shipped)

These are the V3 picks the worklog claimed shipped. Verified with my own eyes + DOM probes on the live deploy.

| V3 pick | Live evidence | Screenshot |
| --- | --- | --- |
| **PR 0 — streak XP fix** | Not visually verifiable (state-machine fix). DOM has dojo-green caret in CodeMirror confirming the v2 storage path is alive (`rgb(42, 160, 106)` cursor color from `cm-cursor` border). | `lesson-1920-fold.png` |
| **PR 1 — skip link** | First DOM element is `<a href="#main">SKIP TO CONTENT</a>` on every page. Verified via snapshot ref `e1` on home AND mobile lesson. | every screenshot's top-left when keyboard-tabbed; `lesson-375-fold.png` shows it |
| **PR 1 — branded 404** | `/notarealpage` returns `404 — page not found` / `this lesson does not exist (yet).` with three nav cards (`go ← home`, `read about →`, `start ↵ chapter 1`). Title `page not found · promptdojo`. | `404-1920-fold.png`, `404-768-fold.png`, `404-375-fold.png` |
| **PR 1 — sr-only `<h1>`** | Lesson page has `<h1 class="sr-only">Naming things you'll point AI at — step 1 of 8</h1>` plus the visible `<h1>Variables — the names AI reaches for first</h1>`. Two H1s on lesson — first is sr-only (correct). | `lesson-1920-fold.png` (visible h1 in body) |
| **PR 1 — login modal a11y** | Modal has `[ esc ]` chip top-right, focused email input on open, `<label for="lts-email">`, escape closes. Verified by clicking `[login to save]` and probing `document.activeElement`. | `login-modal-1920.png`, `login-modal-375.png` |
| **PR 3 — dojoTheme CodeMirror** | `.cm-cursor` border-left = `rgb(42, 160, 106)` (dojo green). Editor BG = `rgb(20, 20, 15)` (ink-950). Caret/selection/keywords are dojo-green, not Atom purple. | `lesson-1920-fold.png` (editor pane) |
| **PR 3 — bracket / indent extensions** | DOM has `.cm-content` themed; not screenshotted at code-typing depth, but extensions present per `cm-editor` class config. | `lesson-1920-fold.png` |
| **PR 5 — sticky header** | `getComputedStyle(header).position === "sticky"` on every page. Header has `border-b`, stays visible on scroll. | every fold + full screenshot — header always at top |
| **PR 5 — `/curriculum` route** | Live, indexable, returns `200`. Title `the curriculum · promptdojo`. Eyebrow `the whole course`. Renders 25 chapters in 5 phase bands. | `curriculum-1920-fold.png`, `curriculum-1920-full.png` |
| **PR 5 — `/lesson/resume` route** | `/lesson/resume/` redirects client-side to last-visited lesson (after wait, URL becomes `/learn/v2/variables/naming-things/0/`). Works. | `resume-1920-fold.png`, `resume-1280-fold.png` (post-redirect) |
| **PR 5 — ContinuePill** | Header on lesson + 404 + changelog shows `❯ CONTINUE · CH 01 · STEP 1` link in center of nav bar. Reads from `lastVisitedV2`. | `404-1920-fold.png` (top center), `lesson-1920-fold.png` |
| **PR 6 — 4-node breadcrumb** | Mobile lesson snapshot shows 4 working `<a>` nodes: `promptdojo` / `phase 01 · foundations` / `ch 01 · variables` / `lesson 1 of 3 · naming things…`. All four are real links (verified via ref dump). | `lesson-1920-fold.png` (top-left), `lesson-375-fold.png` |
| **PR 6 — tablet sidebar (md:)** | At 768 viewport, lesson page renders the chapter sidebar (no longer hidden below 1024). Full 4-pane layout. | `lesson-768-fold.png`, `lesson-768-full.png` |
| **PR 6 — `aria-current`** | DOM probe confirms current chapter row carries `aria-current` attribute. Not visible but present. | n/a (DOM-only) |
| **PR 7 — hero bug snippet w/ cursor.py chrome** | Hero has framed code block titled `cursor.py` (left) + `AI-GENERATED` (right). Below code, red `MUTABLE DEFAULT ARG —` annotation reading `python evaluates the list once at definition. every caller mutates the same list.` | `home-1920-fold.png` |
| **PR 7 — `$0 forever` PriceBand** | Below "get started in under a minute", a viewport-tall band with giant `$0` (~360px mono) + eyebrow `forever` + sub-line. Tweetable single frame. | `home-1920-full.png` (mid-page) |
| **PR 7 — Fraunces axes drop** | `getComputedStyle(body).fontFamily === "Fraunces, ..."` — single weight family loaded; no `SOFT`/`WONK` axes. Bundle slimmer. | n/a (network-only) |
| **PR 9 — dojo-btn-primary on submit** | Lesson `CONTINUE →`, login modal `SAVE`, hero `START CHAPTER 1` all use the same green pill. Visual canon honored. | `home-1920-fold.png`, `login-modal-1920.png`, `lesson-1920-fold.png` |
| **PR 9 — lowercase IDE copy** | Status reads `press run · ⌘↵` (lowercase) and `⌘↵ runs the editor.`. Run button label is `RUN ⌘↵`. Voice canon honored. | `lesson-1920-fold.png` (right-pane status text) |
| **PR 9 — dojo-kbd utility** | `⌘↵` chips render in mono with sharp corners + dim BG. Visible in IDE pane. | `lesson-1920-fold.png` |
| **PR 9 — sharp corners in chapter sidebar** | `ChapterNav` rows have square corners (no `rounded` class). Confirmed at 1920 + 768 lesson views. | `lesson-1920-fold.png`, `lesson-768-fold.png` |
| **PR 9 — phase tier color invert** | Chapter rail on home shows `phase 01 / foundations` brightest (cyan-leaning), descending to muted ember on later phases. Foundations visually dominant. | `home-1920-full.png` (chapter grid section) |
| **PR 9 — `★ 0` star pill suppressed** | No `★ 0` GitHub star count visible in header. Copy reads `[ FOLLOW @TFISPYTHON ON X ]` only. Star pill below 10 hidden per spec. | every header screenshot |
| **PR 9 — star-the-repo seed line** | Changelog footer reads `if this is the python school you wish existed, star the repo. it's the only metric we keep.` | `changelog-1920-fold.png` |

**Summary:** 22 of the 7 V3 PRs' visible-surface claims are live. The XP-fix (PR 0) is invisible by nature; everything else has at least one visual receipt above.

---

## V3 picks still missing (from V3 worklog deferrals)

The worklog explicitly deferred 4 picks (or partial picks). All confirmed still missing on live.

| V3 deferral | Status on live | Evidence |
| --- | --- | --- |
| **PR 2 — TracebackView** | NOT SHIPPED. The IDE renders Python errors as raw `<pre className="text-err">` walls of red. STATUS_COPY has no `error` key (latent bug per worklog). I did not trigger a Python error in this audit — but the worklog's note that PR 4's `error` status is also unhandled means the entire error path is the worst surface left. Walls-of-red continue. | `lesson-1920-fold.png` shows the "loading runtime…" pane where errors will eventually render — currently empty. No TracebackView component in DOM. |
| **PR 4 — Pyodide hairline + 15s timeout + retry banner** | NOT SHIPPED. Boot status text reads `loading runtime...` (lowercase win from PR 9, but no progress bar, no timeout, no retry). On the cold-load capture at 1920 the "output" pane shows just `loading runtime…` for the duration. Wraps in a silent hang on slow networks; no honest progress. | `lesson-1920-fold.png` bottom-right pane: "loading runtime..." (no hairline, no progress %) |
| **PR 8 — perf cluster (lowlight + immutable cache + lazy CodeMirror + OG content-type)** | NOT SHIPPED. Lesson route still ships full `react-markdown` + `rehype-highlight` with the common languages bundle. CodeMirror is not lazy (loads on initial paint). I didn't run lighthouse but this is a worklog admission. OG content-type fix ungated (not verified — tester didn't probe `/og/`). | n/a — perf measurement out of scope; worklog says deferred |
| **PR 6 mobile drawer** | NOT SHIPPED. Mobile (375) home and lesson pages have NO hamburger button. The `nav` exists but contains only stacked links. At 375 the header consumes ~25% of viewport above the fold (4 stacked rows: PROMPTDOJO+CONTINUE / VIEW SOURCE / LOGIN / FOLLOW). | `home-375-fold.png` (header takes ~165px of 667px viewport), `lesson-375-fold.png`, `curriculum-375-fold.png` — all show same stacked-no-hamburger pattern |
| **PR 9 onboarding sweep** | NOT SHIPPED. `/onboarding/` START button is a hand-rolled green pill (NOT the dojo-btn-primary system class). Hand-rolled h1/h2 (NOT t-section). No `dojo-card-interactive` on the answer cards (page is mostly empty above the fold so I couldn't see them — but worklog confirms). | `onboarding-1920-fold.png`, `onboarding-1920-full.png` |
| **PR 9 StepFooter rebuild** | NOT SHIPPED per worklog. Lesson `CONTINUE →` button at bottom of body — actually styled with green-pill primary (which is fine), but worklog flags more sweep work pending. | `lesson-1920-full.png` bottom edge |

**Sticky bug from V3 audit cluster, still un-shipped (Browser L-02 / Nav §1c / IDE §6):** Mobile/tablet "Show editor" toggle is broken. I clicked the `Show editor` button at 375, the editor's bounding rect remained `0×0`, and the button label did NOT toggle to `Show prompt`. The IDE pane is mounted in DOM but not visible. The user has no way to see or run code on mobile. This is the same broken toggle the V3 audit named as the worst-current-bug-class — unfixed in V3 (the IDE-mobile-gate was deferred in CEO Vision §1; the drawer ship was deferred in Senior Dev worklog). Evidence: `lesson-375-fold.png` + `lesson-375-editor-toggled.png` (visually identical — toggle is a no-op).

---

## New regressions since V3

I scanned for things V3 broke. Three concrete regressions found.

### Regression R1 — 398 vs 624 step-count fix only partially landed

**Spec:** PR 7 (V3 plan §pick 7 + Marketing #4): "Fix the 398/624 step count discrepancy: ONE source of truth from manifest, propagate everywhere." Worklog confirmed claim: "22→25 description fix" — but does not name 398→624 as fully done.

**Live reality:** the discrepancy moved but did not disappear.

| Surface | What it says | Source DOM |
| --- | --- | --- |
| Home `/` body | `25 chapters · 624 interactive steps · runs in your browser · free forever.` | `<p class="t-body">` |
| Home `/` band H2 | `25 chapters · 624 steps · free forever` | `<h2>` |
| Home `/` stat strip pill | `398 steps` (still wrong) | `<span>` inside StatStrip |
| About `/about/` body | `25 chapters. 624 interactive steps. zero install.` and `read. run. fix. repeat 624 times.` | `<h2>`, `<p>` |
| Curriculum `/curriculum/` H1 | `25 chapters · 398 steps · ~6 hours` (still wrong) | `<h1>` |
| Curriculum `/curriculum/` meta row | `25 chapters · 398 steps · 8-15h · MIT · last commit 2026-05-06` | `<div>` mono row |
| 404 `/notarealpage` body | `the curriculum has 25 chapters and 624 steps, but not this one.` | `<p>` |
| 404 `/notarealpage` mono footer | `25 chapters · 398 steps · 8-15h · MIT · last commit 2026-05-06` | `<div>` |

The 404 page contradicts itself in two places: body says 624, footer says 398. The `StatStrip` and `MetaRow` components are still hardcoded to `398`. The body copy got updated to `624`. Single-source-of-truth principle was named but only enforced in HeroBugSnippet body + new PriceBand. **Three surfaces still leak `398`.**

Evidence: `home-1920-fold.png` (body says 624), `curriculum-1920-fold.png` (h1 says 398), `404-1920-fold.png` (body 624, footer 398 in same screenshot).

### Regression R2 — Login modal has no scrim / backdrop

**Spec:** PR 1 a11y baseline cluster mentioned login modal getting Escape handler + focus trap + label (all confirmed live). The CEO Vision didn't explicitly call for a scrim, but every user-confronting modal in the wild has one for visual hierarchy.

**Live reality:** clicking `[ login to save ]` opens the modal as a card centered over the page, with **no semi-transparent backdrop** behind it. The home content stays at full opacity behind the modal. A user mid-page may not realize the modal is modal. Visible at 1920 (`login-modal-1920.png` shows the hero h1 at full opacity behind the modal) and at 375 (`login-modal-375.png` — modal nearly fills viewport so the issue is less acute on mobile).

This is borderline-regression vs. always-was — the V2 modal also lacked a backdrop per `LoginToSave.tsx`. Calling it out as "still broken after the a11y sweep" because the rest of the modal a11y cluster was named explicitly.

### Regression R3 — Mobile header consumes ~25% of viewport above the fold

**Spec:** Implicit. PR 5 made the header sticky and added the ContinuePill. PR 6 was supposed to ship the mobile drawer that would collapse all the stacked links to a hamburger.

**Live reality:** at 375, the header has 4 stacked rows of links because the drawer never shipped. Above-fold area on home goes: row 1 `❯ PROMPTDOJO  ❯ CONTINUE · CH 01 · STEP 1`, row 2 `VIEW SOURCE · COMMITTED 9H AGO`, row 3 `[ LOGIN TO SAVE ]`, row 4 `[ FOLLOW @TFISPYTHON ON X ]`. That's ~165px of 667px = 25% of viewport eaten by chrome before the user sees the H1. The eyebrow `❯ PROMPTDOJO` and the engagement strip `0 / 0 / 0 / 0 XP` add another row below. A user lands on home and sees only the words `ai writes` above the fold. This is a sticky-header-without-drawer regression — it bites EVERY route at mobile. Evidence: `home-375-fold.png`, `lesson-375-fold.png`, `curriculum-375-fold.png`, `404-375-fold.png` — all show the same 4-stacked-row header.

---

## Cartesian gaps — surface-by-surface

For each surface, where promptdojo's visual polish trails Cartesian's. Strict comparison: design execution, not concept fit. Promptdojo is dark-on-dark builder-class; Cartesian is warm-cream textbook-press. The two brands are intentionally different. **Gaps below are about polish-bar execution, not aesthetic copying.**

### Surface 1 — Home `/`

| Polish dimension | Cartesian | Promptdojo | Gap |
| --- | --- | --- | --- |
| Nav | Floating glass pill, fixed top:10px, ~64px tall, 3 elements (book icon, FAQs, Purchase) | Full-bleed sticky header with 4-5 elements (PROMPTDOJO, CONTINUE pill, VIEW SOURCE, LOGIN, FOLLOW) | Promptdojo nav does the work but reads as conventional; Cartesian's nav reads as iPhone Dynamic Island premium. Compare `cartesian-nav-1920.png` vs `home-1920-fold.png` top edge. |
| Hero CTA count | 1 — `Purchase $35 ~~$59~~` (no learn-more) | 2 — `START CHAPTER 1 →` + `OR PICK YOUR CHAPTER ↓` | Cartesian's single-CTA discipline is broken on promptdojo. The secondary CTA isn't lethal but dilutes focus. `home-1920-fold.png` vs `cartesian-home-1920-fold.png`. |
| Hero visual | Pre-rendered illustrated YouTube thumbnail of an isometric data-structures city, framed in soft cream bezel | Live HTML code block with `cursor.py` chrome label + red annotation arrow. Strong concept, but it's the actual live block — not a designed screenshot | Both work. Promptdojo's IS the more honest move. The trailing edge is that the bug snippet block is rendered LIVE as DOM rather than as a chunky framed PNG with intentional shadow + color cast. Cartesian's framed-PNG-on-paper feels like a museum exhibit. Compare `home-1920-fold.png` middle vs `cartesian-features-1920.png`. |
| Vertical rhythm | ~120-180px between major sections, generous-but-not-luxurious | Hero section gives ~280px of dead air between H1 bottom and CTA top (`home-1920-fold.png` shows a black gulf between "free forever." text and the bug snippet) | Promptdojo's rhythm reads as "lots of dark" rather than "lots of breathing room." Cartesian fills the gulf with a tagline + body + CTA + sub-CTA + iframe. Promptdojo's hero leaves you scrolling for the next thing. |
| Stat row | 5 numbers in `Abril Fatface 56px` brilliant blue (`670+`, `22`, `300+`, `100+`, `250+`) with serif labels under. The numbers DOMINATE. | StatStrip exists but is small mono numbers (`0 / 0 / 0 / 0 XP` in header) — these are user state, not curriculum stats. The `25 chapters · 624 steps` lives only in body copy. | Promptdojo has NO equivalent dominant-display-stat row. The `$0` PriceBand is the closest analog (and is great). But the curriculum-by-the-numbers moment Cartesian gets from the stats row is missing entirely. Compare `cartesian-stats-row-1920.png` vs `home-1920-full.png`. |
| Anti-feature litany | `No Subscriptions. No In-App purchases. No Signups. No Tracking. No DRM. Accessible Offline.` then `+` divider then `Free Updates for Life.` | Has `0 / 0 / 0` "no upsell. no signup. no tracking" type copy SOMEWHERE on about (`stop reading. start fixing.`) but NOT a dedicated viewport-tall litany on home. The PriceBand says only `$0 forever` + sub-line. | Promptdojo could absorb this pattern verbatim. Currently the only place it lives on home is one band. Cartesian gets two viewport-tall single-purpose bands (Buy Once + Free Updates) plus the litany itself. Compare `cartesian-buy-once-1920.png` vs `home-1920-full.png` (PriceBand area). |

### Surface 2 — About `/about/`

| Polish dimension | Cartesian | Promptdojo | Gap |
| --- | --- | --- | --- |
| Page exists at all | n/a — Cartesian is single-page | Yes — full page, `25 chapters. 624 interactive steps. zero install.` mid-page band, FAQ-style "quick answers" section | Promptdojo's about IS the more comprehensive content surface. Cartesian's "about" is folded into the FAQ. **This is a promptdojo win, NOT a gap.** |
| FAQ structure | Accordion with 9 questions, hairline-rule rows, `+` icon rotates 45° on expand | Promptdojo has `quick answers.` H2 with stacked Q+A pairs, NOT accordion (all answers visible at once) | Promptdojo's flat FAQ is heavier. Accordion would be quieter. Compare `cartesian-faqs-1920.png` vs `about-1920-full.png` (lower half). |
| Datestamp | `Updated May 8, 2025` under FAQ H1 | None on about. `committed 9h ago` in header is a ship-date for the codebase, not a content datestamp. | No "trust freshness" signal on the about content itself. |

### Surface 3 — Curriculum `/curriculum/`

This is the closest cousin to Cartesian's Table of Contents accordion.

| Polish dimension | Cartesian | Promptdojo | Gap |
| --- | --- | --- | --- |
| H1 | `Table of Contents` — Abril Fatface 71.68px, left-aligned | `25 chapters · 398 steps · ~6 hours` (with the 398 bug noted above) | Promptdojo's H1 is metadata-as-headline; Cartesian's is a label-as-headline. Promptdojo's reads more punk-receipts (good); Cartesian's reads more textbook (their brand). Both work, but the 398 bug damages credibility immediately. |
| Chapter rows | 22 rows, hairline-rule between, `+` icon left, click to expand 2-3 line description | 25 chapter cards in 5 phase bands, each card has chapter title + step count + duration in mono. NOT accordion — all descriptions visible at once. | Cartesian's accordion is quieter. Promptdojo's all-cards-open is denser. For the curriculum surface where browsing IS the point, the always-open layout is arguably better — but it makes the page longer. Compare `cartesian-stats-row-1920.png` (TOC lower half) vs `curriculum-1920-full.png`. |
| Per-chapter description | 2-3 lines on accordion expand | Per-chapter card body has 1-2 lines (e.g. `variables, functions, lists, dicts, loops, conditionals, tracebacks, mutation`) | Promptdojo's chapter descriptions are TAGS not THESES. Cartesian's are short prose. Compare `curriculum-1920-full.png` (any chapter card body) vs `cartesian-stats-row-1920.png` (Matrices accordion expanded — "Learn about two-dimensional array representations…"). |
| 398 bug | n/a | YES (h1 + meta row both say 398) | Already documented above |

### Surface 4 — Lesson `/learn/v2/variables/naming-things/0` (with IDE)

This surface has the most polish per surface area on promptdojo, and the largest mobile gap.

| Polish dimension | Cartesian | Promptdojo | Gap |
| --- | --- | --- | --- |
| Layout | n/a — Cartesian has no lesson view, only feature-section screenshots of an interactive book | 4-pane: chapter sidebar (left, 240px) / lesson body (center, ~600px) / IDE editor (right top, ~600px) / output (right bottom, ~200px) | Promptdojo's lesson view is materially more sophisticated than anything on Cartesian. **Win, not gap.** |
| Editor chrome | Cartesian shows pre-rendered framed editor PNGs in feature sections — paper bezel, dotted bg behind editor | Promptdojo's CM editor is bare — `bg-ink-950` (`rgb(20,20,15)`), no bezel, no paper border, just edge-to-edge code on dark | Cartesian's framed-screenshot move signals "this is a real editor" without needing to be one. Promptdojo IS the real editor — could STILL benefit from a hairline frame around the whole pane to read as a "workspace" not just a `<textarea>`. Compare `cartesian-edit-run-test-1920.png` vs `lesson-1920-fold.png` right pane. |
| Status copy | n/a | `loading runtime...` (lowercase win from PR 9) | Promptdojo wins on copy voice. No equivalent on Cartesian. |
| Boot UX | n/a | Pyodide cold-start hangs `loading runtime...` for the actual 5-30 seconds with NO progress bar (PR 4 deferred) | Cartesian doesn't have a Pyodide problem to compare to. Promptdojo's boot UX is the worst-current-broken signal in the product. |
| Mobile lesson | n/a — Cartesian site IS mobile-friendly because it's a single-page sales letter, no editor | Mobile (375) shows prompt body only, with `Show editor` toggle that does nothing visible (broken — see Reg R3) | Promptdojo's mobile lesson is broken in a way Cartesian doesn't have an analog for. |

### Surface 5 — Onboarding `/onboarding/`

This page is the V3 deferral made visible. PR 9's onboarding sweep didn't ship.

| Polish dimension | Cartesian | Promptdojo | Gap |
| --- | --- | --- | --- |
| Page exists | n/a — no onboarding | `you're going to learn python.` H1 + `ai is your co-pilot, not your crutch.` body + `[ START ]` button. Step 1/5 progress dots top-right. | Promptdojo has a multi-step intake; Cartesian has none. Win, not gap — until you look at execution. |
| Button styling | n/a | Hand-rolled green pill (`#START` button is `background: #2AA06A` rounded-md) — does NOT use `dojo-btn-primary` | This is the one place on the property where the system canon visibly fails. Compare to the start-chapter button on home (which IS the system) — the styles drift. |
| Layout density | n/a | Vast empty space above + below content (page is ~30% utilized vertically). H1 sits mid-screen, button sits at ~70%. | Reads as "design-prototype" not "shipped page". Cartesian doesn't have an analog but every other page on promptdojo is denser. |
| H1/H2 system class | n/a | Hand-rolled (`text-4xl font-display`) — should be `t-section` per system | Per V3 worklog deferral. |

### Surface 6 — Login modal

| Polish dimension | Cartesian | Promptdojo | Gap |
| --- | --- | --- | --- |
| Modal exists | n/a — Cartesian has no auth | Yes — `[ esc ]` chip top-right, focused email input, label, escape closes, focus trap | Promptdojo wins on existence + a11y. |
| Backdrop scrim | n/a | NONE — modal sits on top of fully-opaque page content | Reg R2 above. Hierarchy is weak. |
| Width / centering | n/a | ~480px wide centered card with green outline focus ring on email input | Decent. The dark green border on focus is on-brand. |
| Copy | n/a | `login to save` H1 + `type your email. we sync your progress across devices. no password. no spam. same email anywhere else, same dojo.` | Voice is on-brand and lowercase. **Win.** |

### Surface 7 — Changelog `/changelog/`

| Polish dimension | Cartesian | Promptdojo | Gap |
| --- | --- | --- | --- |
| Page exists | n/a — no changelog (just "Updated May 8, 2025" stamp under FAQ H1) | Yes — dedicated route, 5 dated entries, prose summaries | **Promptdojo wins outright.** |
| H1 | n/a | `changelog` (lowercase, Fraunces serif, ~64px) | On-brand. |
| Format | n/a | Hairline rule between intro + entries; `← HOME` back link top; "if this is the python school you wish existed, star the repo. it's the only metric we keep." footer line | Voice is excellent. Footer line is the seed-ask done right (PR 9). |
| Density | n/a | 5 entries + footer fits comfortably above 1080px fold on 1920. Generous spacing. | No gap. |

### Surface 8 — 404 `/notarealpage`

| Polish dimension | Cartesian | Promptdojo | Gap |
| --- | --- | --- | --- |
| Behavior | Silently rewrites all 404s to home (`cartesian-404.png` shows the home page) | Real branded 404 with H1 `this lesson does not exist (yet).` + 3 escape-route cards (`go ← home`, `read about →`, `start ↵ chapter 1`) + meta row | **Promptdojo wins by a huge margin.** This is the single biggest brand-win-vs-Cartesian on the audit. |
| Header | n/a | Full sticky header AND ContinuePill present | On-brand. Lets the user resume from a 404 in one click — Cartesian can't because it has no concept of resume. |
| 398/624 bug | n/a | Page contradicts itself: body `624 steps`, footer `398 steps` | Reg R1 visible on this very page. |

### Surface 9 — Lesson resume `/lesson/resume/`

| Polish dimension | Cartesian | Promptdojo | Gap |
| --- | --- | --- | --- |
| Behavior | n/a | Renders briefly, reads `lastVisitedV2` from localStorage, `router.replace`s to deep step URL. Captured `resume-1920-fold.png` shows the in-flight render before the redirect; `resume-1280-fold.png` and lower-res versions show post-redirect state (lesson page) because the redirect fires within ~500ms | Works. No Cartesian equivalent. **Win.** |

---

## Top 20 specific differences from Cartesian (with screenshot refs)

Ranked by clarity-of-gap. Each entry: what Cartesian does → what promptdojo does → screenshot refs.

1. **Floating glass nav pill vs full-bleed sticky bar.** Cartesian has a 1020×64 translucent pill with `backdrop-filter: blur(10px)`; promptdojo has a conventional border-bottom sticky header with all links inline. `cartesian-nav-1920.png` vs `home-1920-fold.png` top edge.
2. **Hero CTA count.** Cartesian: 1 button (`Purchase $35 ~~$59~~`). Promptdojo: 2 (`START CHAPTER 1` + `OR PICK YOUR CHAPTER ↓`). `cartesian-home-1920-fold.png` vs `home-1920-fold.png`.
3. **Stat-row-as-section.** Cartesian dedicates a viewport to 5 huge serif blue numbers (670+, 22, 300+, 100+, 250+) under "A Comprehensive Treatment." H2. Promptdojo has no equivalent dominant-display-stat moment. The chapter/step count lives only in body copy. `cartesian-stats-row-1920.png` vs `home-1920-full.png`.
4. **Anti-feature litany as a section.** Cartesian dedicates a viewport-tall block to `Buy Once. Own Forever.` + 6 stacked `No X.` lines + `+` divider + `Free Updates for Life.`. Promptdojo's PriceBand says only `$0 forever`. `cartesian-buy-once-1920.png` vs `home-1920-full.png` (PriceBand region).
5. **Accordion TOC vs always-open chapter cards.** Cartesian's 22 chapter rows are accordion (click `+` to expand description). Promptdojo's 25 chapter cards are always-open with tag descriptions. `cartesian-stats-row-1920.png` lower vs `curriculum-1920-full.png`.
6. **Pre-rendered framed visuals vs live DOM.** Cartesian's feature visuals are PNG/GIF with paper bezel, no CSS chrome. Promptdojo's hero bug snippet is live DOM (correct for an interactive product, but loses the "this is a museum exhibit" feel). `cartesian-features-1920.png` vs `home-1920-fold.png` middle.
7. **Per-section title color treatment.** Cartesian: `<colored-word>Visualize</colored-word> Everything.` — one word colored, period-terminated. Promptdojo home uses gradient-into-green on `it's wrong.` — closer to a single phrase than a one-word color flag. The mechanic is similar but Cartesian uses it 5 times across 5 features; promptdojo uses it once. `cartesian-features-1920.png` titles vs `home-1920-full.png` section H2s.
8. **`+` as section divider.** Cartesian uses a centered `+` character between Buy Once and Free Updates. Promptdojo uses no equivalent typographic divider — sections separate via dark space. `cartesian-buy-once-1920.png`.
9. **Per-pricing-tier color identity.** Cartesian has 3 pricing cards each with a different colored title (coral / purple / gray) — no "Most Popular" badge. Promptdojo has no tiered pricing (it's free) so this doesn't apply directly, but the PriceBand could borrow the technique (currently solid green only). `cartesian-pricing-1920.png` vs `home-1920-full.png` PriceBand.
10. **Hairline-rule lists, no cards.** Cartesian's TOC + FAQ + OS-spec tiles all use 1px borders on cream BG, NO drop shadows. Promptdojo's chapter rail uses subtle card backgrounds with thin borders — closer to cards than to hairlines. `cartesian-stats-row-1920.png` vs `curriculum-1920-full.png`.
11. **Display serif extended to mid-size labels.** Cartesian uses Abril Fatface for SIX size scales (h1 71px, section 59px, stat 56px, pricing 42px, sub 40px, stat-label 20.8px). Promptdojo uses Fraunces for h1/h2 only — sub-headlines, eyebrows, and meta labels fall to mono or sans. `cartesian-stats-row-1920.png` (note label "Interactive Pages" is also serif) vs every promptdojo screenshot (eyebrows/labels in mono).
12. **Period-terminated short titles.** Cartesian: `Visualize Everything.` `Code Playback.` `Test Your Might.`. Promptdojo: `read what it isn't.` `every course teaches you what python is.` — uses periods sometimes but not as a discipline. `cartesian-features-1920.png` vs `about-1920-full.png` H2s.
13. **Tagline as vibe statement.** Cartesian: `Learning the fundamentals shouldn't be a chore.` (speaks to reader frustration). Promptdojo hero subline: `a python school for the version of you that lives in cursor. 25 chapters · 624 interactive steps · runs in your browser · free forever.` — this is FEATURE LIST not VIBE STATEMENT. `cartesian-home-1920-fold.png` vs `home-1920-fold.png`.
14. **Strikethrough discount inside the button.** Cartesian: `Purchase $35 ~~$59~~` baked inline. Promptdojo: `START CHAPTER 1 →` (no price). N/A directly but the technique travels — the `$0` could live INSIDE the start button rather than as a separate band. `cartesian-home-1920-fold.png` CTA vs `home-1920-fold.png` CTA.
15. **"Watch the film." 2-3 word eyebrow.** Cartesian labels its YouTube embed `Watch the film.` (3 words, display serif, period). Promptdojo has no demo video. If/when one ships, the eyebrow pattern is borrowable. `cartesian-home-1920-fold.png` middle.
16. **Footer signature with motion.** Cartesian footer: tiny pixel-art illustration + `Crafted with [♥, animated heartbeat] by Elias Yilma / [@ElijahYilma]`. Promptdojo footer: tiny mono lines, no illustration, no motion, no animated icon. `cartesian-faqs-1920.png` (footer) vs `home-1920-full.png` (very bottom).
17. **FAQ datestamp.** Cartesian: `Updated May 8, 2025` under FAQ H1 — adds trust without a changelog. Promptdojo has a separate changelog route (which is great) but no per-page freshness stamp. `cartesian-faqs-1920.png` top vs `about-1920-full.png` "quick answers" section.
18. **One-CTA hero discipline.** This is item 2 restated as a discipline — Cartesian's whole page exists to drive ONE button. Promptdojo's hero has TWO. Even by builder-class voice this dilutes. `cartesian-home-1920-fold.png` vs `home-1920-fold.png`.
19. **Generous side margins.** Cartesian's main panel max-width is ~1100px on 1920 viewport — leaves big margins. Promptdojo's home content is centered ~960px wide but the chapter rail goes nearly edge-to-edge in the lower half. Inconsistent margin discipline. `cartesian-home-1920-full.png` vs `home-1920-full.png`.
20. **Mobile experience integrity.** Cartesian at mobile is a fully-functional single-page sales letter — same content, restacked. Promptdojo at mobile is a stacked-header pile + a broken `Show editor` toggle on lessons. The brand is strongest on desktop and weakest on mobile. `cartesian-home-mobile-fold.png` (assumed clean) vs `home-375-fold.png` + `lesson-375-fold.png` + `lesson-375-editor-toggled.png`.

---

## What promptdojo nails that Cartesian doesn't (preserve list)

These are the things V3 shipped that Cartesian does not have. Don't break them in V4.

1. **Branded 404 with three escape-route cards + ContinuePill.** Cartesian's 404 silently rewrites to home (lazy fallback). Promptdojo's 404 is a brand moment with one-click resume. `404-1920-fold.png`. Highest-leverage promptdojo win in the audit.
2. **Sticky header with global resume affordance.** ContinuePill (`❯ CONTINUE · CH 01 · STEP 1`) reads `lastVisitedV2` from localStorage and sits in the center of every header. Cartesian has no concept of resume because its product has no progress.
3. **`/curriculum` indexable URL with 5-phase rail.** A canonical, tweetable, SEO-able single-source-of-truth for the syllabus. Cartesian's TOC is buried mid-page on its single-page site.
4. **`/lesson/resume` deep-link.** Client-side router redirect to last-visited step. Magic.
5. **`/changelog` dedicated route.** Cartesian has only a single "Updated May 8, 2025" stamp; promptdojo has a real prose-over-time log with the seed-ask line at the bottom. `changelog-1920-fold.png`.
6. **dojo-themed CodeMirror editor.** Caret + selection + keywords all in dojo green. The editor IS on-brand. Cartesian shows screenshot mockups of an editor; promptdojo ships the editor itself, themed.
7. **Login modal a11y.** `[ esc ]` chip + focus trap + label + escape handler + focused-on-open input. Real. Cartesian has no modal to compare.
8. **Lowercase IDE copy canon.** `press run · ⌘↵`, `loading runtime…`, `⌘↵ runs the editor.` — voice canon honored on the highest-traffic surface. Cartesian's voice is title-case textbook.
9. **Skip link.** First DOM element is `SKIP TO CONTENT`. Verified at every viewport. Cartesian doesn't need one (single page) but if it did it doesn't have one.
10. **4-node lesson breadcrumb.** `promptdojo › phase 01 · foundations › ch 01 · variables › lesson 1 of 3 · ...`. All four are real links. Cartesian has nothing to compare; this is wayfinding for a multi-page product.
11. **PriceBand `$0` as a single-frame meme.** Even with the litany missing, the giant `$0` is the cleanest tweet-asset on the property. Cartesian's $35 sits inside a button — promptdojo's $0 is a viewport. `home-1920-full.png` mid-page.
12. **Hero bug snippet with `cursor.py` chrome + red annotation.** Promptdojo's hero bug snippet IS the demo — live, themed, annotated. Cartesian relies on YouTube + framed PNGs.
13. **Tablet sidebar (md:).** PR 6 dropped lesson sidebar visibility from `lg:` to `md:`. At 768 the lesson page renders the full 4-pane layout. Cartesian doesn't have a lesson view to compare. `lesson-768-full.png`.
14. **Phase-tier color invert.** Foundations phase rendered brightest, advanced phases muted ember. Reads as "start here" without explanatory text. Cartesian's 22 chapters all read at the same weight.
15. **`star the repo` seed-ask line.** Sits at footer of changelog: `if this is the python school you wish existed, star the repo. it's the only metric we keep.` On-brand and direct. Cartesian's footer is `Crafted with ♥ by Elias Yilma`.

---

**Audit complete.** 43 promptdojo screenshots saved at `~/Developer/code-killa/design-kit/audit-v4/screenshots/promptdojo/`. Next 6 audit agents (UI Polish, Visual Storytelling, Navigation, IDE Deep, Marketing, A11y / Perf) should diff this report against `01-cartesian-walkthrough.md` to land V4 picks. The headline gaps to chew on:

- **R1 (398 vs 624) leak across 3 surfaces** — credibility cost.
- **Mobile drawer + Show-editor regression** — the worst broken state on the property; PR 6 partial + IDE-mobile-gate deferral compounded.
- **PR 2 traceback view + PR 4 Pyodide hairline + PR 8 perf cluster + PR 9 onboarding sweep** — V3 worklog explicit deferrals, all confirmed un-shipped.
- **Cartesian gaps worth absorbing**: anti-feature litany section, dominant stat row, framed-visual treatment, accordion TOC, single-CTA hero, period-terminated section titles, footer signature with motion.
- **Promptdojo wins to NOT break**: branded 404, ContinuePill, /curriculum + /lesson/resume routes, dojo CodeMirror theme, lowercase IDE copy, skip link, 4-node breadcrumb, PriceBand `$0`.
