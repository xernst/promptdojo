# Browser Walkthrough — pristine bar

Audit date: 2026-05-06 · Browser: Chromium via agent-browser · Viewports: 1920×1080, 1280×800, 768×1024, 375×812
Site: https://promptdojo.pages.dev (V2 legitimacy refresh shipped 2026-05-06)

## Methodology

- Walked all 10 surfaces called out in the brief. Captured 35 screenshots in `screenshots/` (paths referenced inline).
- Tested each at desktop-large (1920) and where layout shifts, at 1280 / 768 / 375.
- Probed interactions: Run button on lesson IDE, quiz answer submit, Continue, sidebar chapter expand, GitHub-pill hover, chapter-card hover, login modal open, park-a-thought popover, onboarding step transition, scroll-to-bottom, keyboard Tab focus traversal.
- DOM-inspected: console errors (none captured), perf entries (33 resources, fast — slowest 102ms), CSS tokens (font stacks, primary color, sticky header), header `position: static` confirmed.
- Viewport switching uses `agent-browser set viewport W H`.
- The lesson-IDE textbox refused both `keyboard type` and `keyboard inserttext` from outside (CodeMirror 6 swallows synthetic input events) — that itself is a finding (see L-09).
- Bar applied: would Linear / Stripe / Vercel ship this on their main marketing or product surface? If no, it goes on the list.

---

## CORE: lesson IDE (deepest dive — most issues here)

URL tested: `/learn/v2/variables/naming-things/0/` (and step `/1/`)
Reference shots: `lesson-ide-1920.png`, `lesson-ide-1920-full.png`, `lesson-ide-1920-after-run.png`, `lesson-ide-step2.png`, `lesson-ide-quiz-wrong.png`, `lesson-ide-1280.png`, `lesson-ide-1280-focus.png`, `lesson-ide-tablet-768.png`, `lesson-ide-mobile-375.png`, `lesson-ide-mobile-prompt-open.png`, `lesson-ide-bottom.png`, `lesson-sidebar-expand.png`

### L-01 · Code lines clip horizontally with no scroll affordance — CRITICAL
- **Where**: Editor pane, line 5 (`print(f"...{user['p` cut off)
- **Evidence**: `lesson-ide-1920.png`, `lesson-ide-1920-after-run.png`
- **Pristine bar**: VS Code / Stripe Workbench wrap or virtual-scroll with a clear gradient fade + horizontal scrollbar that auto-shows on hover. Here the line just dies mid-string with no fade, no scroll, no word-wrap toggle.
- **Severity**: critical (this is the first impression — the centerpiece widget eats your code)

### L-02 · Mobile + tablet hide the entire lesson copy behind a "Show prompt" button that does nothing — CRITICAL
- **Where**: ≤768px viewport, lesson IDE
- **Evidence**: `lesson-ide-mobile-375.png` and `lesson-ide-mobile-prompt-open.png` are pixel-identical after clicking "Show prompt"
- **Pristine bar**: Linear collapses panes into a tabbed/segmented control with persistent state. Stripe Workbench shows code-first on mobile but with a peek-out drawer that animates over the editor. Here the toggle is broken — the button exists but does not reveal the lesson.
- **Severity**: critical (mobile users get an editor with code they can't understand; entire course copy is unreachable)

### L-03 · "park a thought" floating CTA overlaps Output panel and quiz feedback — MAJOR
- **Where**: Bottom-right at all viewports
- **Evidence**: `lesson-ide-1920-after-run.png` (overlaps OUTPUT line), `lesson-ide-mobile-375.png` (overlaps OUTPUT/REPL prompt), `lesson-ide-quiz-wrong.png` (also intrudes)
- **Pristine bar**: Intercom/Linear floating CTAs collide-detect with content and either fade out, dock to a tray, or shrink to an icon. Here it's a fixed pill that always sits over data.
- **Severity**: major

### L-04 · Phase rail / progress hairline shows two competing bars at the top of the lesson — MAJOR
- **Where**: Top of lesson copy area (the "step 1 / 8" bar) and the new global progress hairline in header (1/398, ~0%)
- **Evidence**: `lesson-ide-1920.png` — see green stripe under "phase 01 · foundations" + thin hairline at top right of header next to "1/398 ~0%"
- **Pristine bar**: One progress system. Linear has one. Notion has one. The two bars here read as either redundant (same data?) or contradictory ("step 1/8" vs "1/398") — the user has to do the math to know which is the lesson and which is the course.
- **Severity**: major

### L-05 · Mystery floating "0" badge top-right of phase rail — MAJOR
- **Where**: Just above the "step 1/8" indicator
- **Evidence**: `lesson-ide-1920.png` (small green "0" in a circle sitting alone in upper-right of breadcrumb area)
- **Pristine bar**: Aria label says "Today: 0 of 10 min" but visually it's a stand-alone "0" with no icon, no orbit ring, no tooltip-on-hover affordance, no label. It looks like an accidental render.
- **Severity**: major (key streak/goal element is invisible and unbranded)

### L-06 · "Check" button on quiz disappears after wrong answer; no retry CTA — MAJOR
- **Where**: Step 2 quiz (multiple choice)
- **Evidence**: `lesson-ide-quiz-wrong.png` — Check button gone, "Not that one." text alone, no Try Again or Reset
- **Pristine bar**: Khan/Brilliant keep the CTA visible but transition state ("Check" → "Try again"). Here the affordance vanishes — user has to figure out they need to click another radio to bring it back.
- **Severity**: major

### L-07 · Wrong-answer feedback uses heavy outline on a different option than the one selected — CONFUSING
- **Where**: Step 2 quiz after picking option 2
- **Evidence**: `lesson-ide-quiz-wrong.png` — option 2 shows the explanation panel, but option 3 has a solid bright outline that reads as "selected/correct"
- **Pristine bar**: Selected = one color. Correct/incorrect feedback = another. Don't double-encode in a way that competes for attention.
- **Severity**: major

### L-08 · Code editor uses `monospace` system fallback, not a designed code face — MAJOR
- **Where**: Every code surface (lesson IDE, output, hero code block on home, OG image)
- **Evidence**: `getComputedStyle(.cm-line).fontFamily === "monospace"` — falls back to OS default (Menlo / Consolas / Courier depending on OS)
- **Pristine bar**: Linear uses Berkeley Mono. Vercel uses Geist Mono. Stripe uses Söhne Mono. A "Python school" without a designed code face on its core editor is unfinished.
- **Severity**: major

### L-09 · CodeMirror editor blocks programmatic input from CDP — likely also blocks IME, paste-from-context-menu — INVESTIGATE
- **Where**: `.cm-content` textbox in editor
- **Evidence**: `agent-browser keyboard type` and `keyboard inserttext` after focus = no change to editor contents (DOM check returned identical text). Active element drops back to BODY after click.
- **Pristine bar**: The editor should accept focus and respond to standard keyboard events from any source (assistive tech, paste, IME). If CM6 is configured as `EditorState.readOnly` or wrapped in something that swallows events, mobile keyboards may struggle.
- **Severity**: major (a11y + mobile typing risk — needs manual test on a real iPhone keyboard)

### L-10 · Sidebar lesson titles truncate to one line with `...` — POLISH
- **Where**: Left sidebar in lesson view (`02 cursor just wrote you f...`, `04 read the code on the r...`)
- **Evidence**: `lesson-ide-1920.png`, `lesson-ide-1920-full.png` (left column)
- **Pristine bar**: Linear/Notion sidebars wrap to 2 lines with consistent truncation. Single-line `...` cuts mid-word, hiding the value of the lesson title. The titles are evocative ("= doesn't mean what it did in math") and shouldn't be hidden.
- **Severity**: minor → major (these titles are *the marketing*)

### L-11 · Sidebar has no visible focus ring; tab order is unclear — MAJOR (a11y)
- **Where**: Lesson sidebar buttons (chapters 02–25 are "buttons" in the a11y tree but inert until expanded)
- **Evidence**: `lesson-ide-1280-focus.png` after 3× Tab — focused element is "LOGIN TO SAVE" but no visible outline
- **Pristine bar**: Linear's outline is a 2px ring offset 2px in mint. Stripe uses a 3px primary-tinted ring. Default `outline: rgb(...) none 3px` here has `none` style — invisible.
- **Severity**: critical (WCAG 2.4.7 fail)

### L-12 · Output panel only renders ~1 line of stdout — MINOR
- **Where**: Output below editor, after Run
- **Evidence**: `lesson-ide-1920-after-run.png` — `Alex has 3 tickets left on the free plan.` fits, but a longer print loop would clip with no visible scroll. Panel is fixed-height (~80px tall).
- **Pristine bar**: Replit/CodePen output grows or has visible scroll + clear button. Here there's no clear, no copy, no scroll affordance.
- **Severity**: minor (becomes critical the moment a lesson prints >3 lines)

### L-13 · Run button has no idle → loading → success state transition — POLISH
- **Where**: RUN ⌘↵ button after click
- **Evidence**: `lesson-ide-1920-after-run.png` — button visually identical pre and post run
- **Pristine bar**: Stripe/Linear buttons cross-fade label, show inline spinner, then green check. Here Pyodide-warmup is invisible to the user.
- **Severity**: minor

### L-14 · Tab "main.py" is selected but there are no other tabs — wasted chrome — MINOR
- **Where**: Top of editor pane
- **Evidence**: `lesson-ide-1920.png` — single tab "main.py" with lock icon, no + button, no other tabs
- **Pristine bar**: Either remove the tab strip and replace with a static label (Linear does this for single-context), or actually let users add tabs (test.py, scratch.py). Right now it's tab-strip cosplay.
- **Severity**: minor

### L-15 · The lesson page is viewport-locked (no scroll) but the lesson body still overflows internally — MAJOR on small screens
- **Where**: Lesson body column at 1080–1280 height
- **Evidence**: `lesson-ide-bottom.png` — page is 1123px tall (≈ viewport) but middle column has its own scroll, hidden inside the layout
- **Pristine bar**: Linear/Notion pick one scroll container per pane and clearly show scrollbars on hover. Here you can't tell the lesson body has more text without trying to scroll inside it.
- **Severity**: major (people miss content)

---

## CORE: navigation system

Reference shots: `home-1920-fold.png`, `home-mobile-375-fold.png`, `home-tablet-768-fold.png`, `lesson-ide-1920.png`, `lesson-ide-mobile-375.png`, `about-1920.png`, `changelog-1920.png`, `404-1920.png`, `onboarding-1920.png`

### N-01 (desktop) · Site header is `position: static` — disappears on scroll — MAJOR
- **Where**: Every page, scroll any distance
- **Evidence**: `getComputedStyle(header).position === "static"`; verified by scrolling home and watching header leave viewport
- **Pristine bar**: Linear, Stripe, Vercel: persistent / collapsing / blur-backdrop sticky header. Marketing sites either keep it pinned or animate it back on scroll-up. Here it's gone.
- **Severity**: major

### N-02 (desktop) · Header progress hairline ("1/398, ~0%") shows on `/about`, `/changelog`, `/404` where it has no meaning — MAJOR
- **Where**: Site header right side
- **Evidence**: `about-1920.png`, `changelog-1920.png`, `404-1920.png` all show "1/398 ~0%" in header
- **Pristine bar**: Progress is contextual — it appears on lesson pages, hides elsewhere. Linear's breadcrumbs/state are page-aware. Showing "you're on step 1/398" while viewing the changelog is misleading.
- **Severity**: major

### N-03 (desktop) · GitHub pill, login button, follow-on-X button have no hover state — POLISH
- **Where**: Header right cluster
- **Evidence**: `home-github-hover.png` (hovered with mouse — no visual change)
- **Pristine bar**: Stripe pills tint background on hover. Linear underlines text. Here hover is a dead state.
- **Severity**: minor

### N-04 (desktop) · No breadcrumbs on lesson pages above the lesson copy — MAJOR
- **Where**: Lesson view, between header and lesson body
- **Evidence**: `lesson-ide-1920.png` — has "phase 01 · foundations" then "ch 01 · variables · lesson 1 of 3 · naming thi…" but the third segment truncates mid-word, and there's no clickable up-the-tree affordance (e.g. clicking "ch 01 · variables" should jump to that chapter's overview)
- **Pristine bar**: Notion: clickable breadcrumb with hover affordance per segment. Here you can't even tell which parts are clickable.
- **Severity**: major

### N-05 (desktop) · No persistent "back to course" / "back to home" affordance from lesson — MAJOR
- **Where**: Lesson view
- **Evidence**: `lesson-ide-1920.png` — only way out is the small "❯ promptdojo" wordmark in the upper-left of the sidebar
- **Pristine bar**: A clear "← Course home" or "← Chapter overview" link, persistently visible. Right now the brand wordmark doubles as that link with zero affordance.
- **Severity**: major

### N-06 (desktop) · Curriculum sidebar overflows the viewport with no scroll indicator — MAJOR
- **Where**: Lesson left sidebar, chapters 02–25 list
- **Evidence**: `lesson-ide-1920-full.png` — chapters 02 through 25 are listed, but at 1080 height they exceed the viewport with no "more below" indicator. The sidebar scrolls internally, not obviously.
- **Pristine bar**: Linear/Notion show fade-out gradient at edges of an internally-scrollable nav.
- **Severity**: major

### N-07 (desktop) · Sidebar chapter expand has no animation; layout jumps — POLISH
- **Where**: Click a collapsed chapter button
- **Evidence**: `lesson-sidebar-expand.png` (after clicking ch 02) — content snaps open without easing
- **Pristine bar**: Linear/Notion ease the height transition. Here it's a hard pop.
- **Severity**: minor

### N-08 (mobile) · No nav drawer / hamburger — header buttons stack vertically taking 200+ px before content — CRITICAL
- **Where**: 375px viewport, every page
- **Evidence**: `home-mobile-375-fold.png`, `lesson-ide-mobile-375.png` — 4 stacked buttons (WHAT IS THIS, GitHub pill, LOGIN TO SAVE, FOLLOW ON X) with no hamburger
- **Pristine bar**: Linear/Vercel: hamburger that opens a slide-in drawer with all nav. Here every page wastes the top fifth of the screen on an un-collapsible header.
- **Severity**: critical

### N-09 (mobile) · Lesson IDE has zero curriculum nav — sidebar is invisible, no way to switch chapters/lessons — CRITICAL
- **Where**: 375 / 768 lesson IDE
- **Evidence**: `lesson-ide-mobile-375.png`, `lesson-ide-tablet-768.png` — no chapter list, no step list, no "next/prev lesson" beyond what's in the body, no breadcrumbs
- **Pristine bar**: A bottom sheet, drawer, or segmented switcher. Mobile learners are now stuck on whatever lesson they landed on.
- **Severity**: critical

### N-10 · Footer is one line ("press ⌘B... last commit · changelog") with no nav, no socials, no MIT link, no copyright — MAJOR
- **Where**: Bottom of home (long-form pages only)
- **Evidence**: `home-footer-1920.png`
- **Pristine bar**: Vercel/Stripe footers have at minimum: nav columns, socials, legal, ©. Here: nothing.
- **Severity**: major

### N-11 · 404 page is unbranded Next.js default — CRITICAL
- **Where**: Any nonexistent URL
- **Evidence**: `404-1920.png` — black background, monospace "404" + "This page could not be found." sans-serif default
- **Pristine bar**: Stripe and Vercel both ship signature 404s. For a school that markets in lowercase voice with serif display type, this 404 has none of that. No CTA, no search, no curriculum nudge.
- **Severity**: critical

### N-12 · No theme toggle anywhere — MAJOR (claim mismatch)
- **Where**: Site-wide
- **Evidence**: No button labeled light/dark/system in any snapshot or interactive tree
- **Pristine bar**: If the v2 refresh shipped "system tokens" as the changelog claims, exposing a theme switch is the natural payoff. Otherwise: dark-only is fine, but say so explicitly.
- **Severity**: major (could be intentional — flag for product call)

---

## Home page

Reference shots: `home-1920.png`, `home-1920-fold.png`, `home-curriculum-1920.png`, `home-tablet-768.png`, `home-tablet-768-fold.png`, `home-mobile-375.png`, `home-mobile-375-fold.png`, `home-footer-1920.png`, `home-chapter-card-hover.png`

### H-01 · Hero is under-filled at 1920 — half the screen above the H1 is empty — MAJOR
- **Evidence**: `home-1920-fold.png` — H1 ("ai writes this. it's wrong.") starts ~250px down; everything from header (60px) to H1 is dead vertical space
- **Pristine bar**: Stripe/Linear marketing pages fill above the fold with hero + supporting visual + signal. Here at 1920 the page reads as ⅓ empty, ⅓ headline, ⅓ code block.
- **Severity**: major

### H-02 · Stat strip is doubled — "25 chapters · 398 steps · 8-15h · MIT · last commit" vs "25 chapters · 624 steps · free forever" — CRITICAL DATA INCONSISTENCY
- **Evidence**: `home-curriculum-1920.png` — both labels visible within ~80px of each other, with different step counts (398 vs 624)
- **Pristine bar**: Numbers must agree. This is a credibility kill — and the home hero says 624 steps while the curriculum stat strip says 398.
- **Severity**: critical

### H-03 · "ch 01-07 · ~2h 14m" total contradicts the sum of card durations — DATA
- **Evidence**: `home-curriculum-1920.png` — ch01–07 cards say 22+21+21+21+14+21+14 = 134 minutes; phase-level label says ~2h 14m, which checks (134m = 2h 14m). OK, this one math-checks. **REVISED**: This one is fine. Removing from list.
- (kept entry for transparency; not a finding)

### H-04 · Chapter cards have no hover affordance — POLISH
- **Evidence**: `home-chapter-card-hover.png` after hovering ch 01 — no border highlight, no scale, no shadow
- **Pristine bar**: Notion templates / Stripe docs cards lift, highlight border, or reveal a chevron on hover. Cards that don't react to mouse feel static.
- **Severity**: minor

### H-05 · Chapter card descriptions ellipsis-cut at varied positions, creating visual rivers — POLISH
- **Evidence**: `home-curriculum-1920.png` — ch 02 ends `...silently forgets the \`return…`, ch 06 ends `...exactly what happened an…`, irregular line ends
- **Pristine bar**: Linear truncates after a fixed line count or wraps and shows full text on hover. Here truncation is mechanical character-cut.
- **Severity**: minor

### H-06 · "1/26" progress on ch 01 is visually identical to "0/27" on others — no in-progress emphasis — MAJOR
- **Evidence**: `home-curriculum-1920.png`
- **Pristine bar**: Linear shows in-progress items with a left vertical bar accent, an icon, or a fill state. Here only one card has a faint extra hairline bottom-edge — but that's so subtle on `home-curriculum-1920.png` it reads as a render glitch, not a status indicator.
- **Severity**: major

### H-07 · "Read what AI wrote / Catch what it got wrong / Direct it deliberately" three-card row sits in nowhere-land — POLISH
- **Where**: Below "get started in under a minute"
- **Evidence**: `home-1920.png` — three short marketing cards with no header above, no eyebrow, no separator from the curriculum below
- **Pristine bar**: A clear section heading ("how this works", "what you'll learn") would anchor them. Right now they read as orphaned content.
- **Severity**: minor

### H-08 · "legacy 28-chapter course (old style)" disclosure is publicly visible at bottom — MAJOR (brand)
- **Where**: Home, scrolled to bottom, just above footer
- **Evidence**: `home-footer-1920.png` — "▸ legacy 28-chapter course (old style)" expandable
- **Pristine bar**: Don't expose deprecated content paths to public visitors. Keep redirects but remove the visible cruft.
- **Severity**: major

### H-09 · Stat icons "🔥 1, ⊙ 0, ❉ 0, 10 XP" are right-aligned, tiny, and unlabeled at 1920 — MAJOR
- **Where**: Above the H1, right side
- **Evidence**: `home-github-hover.png` — three icons + a number each, then "10 XP"
- **Pristine bar**: Either label them ("streak: 1 day"), make them tooltipable on hover with a clear pointer, or hide them on the marketing home (move to a profile/dashboard pill). At a glance they read as "1 0 0 10" — meaningless.
- **Severity**: major

### H-10 (mobile) · Stat icons drop XP entirely — three-icon bar with no label — POLISH
- **Evidence**: `home-mobile-375-fold.png` — only three icons, no XP value
- **Severity**: minor

### H-11 (tablet) · Chapter cards have inconsistent left-stripe accent — random highlighting — POLISH
- **Evidence**: `home-tablet-768-fold.png` — ch 03 card shows a thicker green left bar than its siblings; pattern repeats inconsistently across other phases
- **Pristine bar**: Visual hierarchy must encode meaning. If the accent means "next up" or "in progress", apply it consistently; if not, remove it.
- **Severity**: minor

---

## About page

Reference shots: `about-1920.png`, `about-1920-full.png`

### A-01 · Hero H1 is so large it blows out the layout at 1920 — MAJOR
- **Where**: H1 "a python school built for the version of you that lives in cursor."
- **Evidence**: `about-1920.png` — H1 occupies ~700px tall, fills horizontally, with awkward word wraps and large gutters
- **Pristine bar**: Stripe / Linear hero typography respects an upper bound (typically ~96–120px). Going bigger creates poster typography that's beautiful in print but breaks on screen — especially with serif descenders on `g`/`y`/`p`.
- **Severity**: major

### A-02 · Header still shows misleading "1/398, ~0%" progress hairline on /about — MAJOR
- **Evidence**: `about-1920.png` (also covered as N-02)
- **Severity**: major

### A-03 · Two CTAs ("START THE COURSE", "BACK TO HOME") have inconsistent visual weight — POLISH
- **Where**: Below About hero
- **Evidence**: `about-1920.png` — primary green vs ghost outline, both small, no preferred path
- **Pristine bar**: One primary CTA with maybe one ghost secondary; sizes should signal hierarchy.
- **Severity**: minor

### A-04 · Stat strip ("25 chapters · 398 steps · 8-15h · MIT · last commit 2026-05-06") again disagrees with home's 624 steps — DATA
- **Evidence**: `about-1920.png` and `home-1920-fold.png` (also covered as H-02)
- **Severity**: critical (counted under H-02)

### A-05 · No "what's coming next / roadmap" section, no testimonials, no team, no philosophy callout — UNDER-FILLED
- **Evidence**: `about-1920-full.png`
- **Pristine bar**: For an open-source education project, About is the trust page. Stripe/Linear/Notion have founder photos, vision, principles, hiring callout, press. Here it's hero + CTAs + stats. That's a landing page, not an About.
- **Severity**: major

---

## Curriculum / chapter list

Reference shots: `home-curriculum-1920.png`, `home-tablet-768-fold.png`

(Covered above under Home — there is no standalone `/curriculum` route. The curriculum tree lives on `/`.)

### C-01 · No standalone curriculum URL means deep-linking to "phase 02" is impossible — MAJOR (info architecture)
- **Evidence**: Snapshot of all internal links contained no `/curriculum` or `/courses`; only `/learn/v2/<chapter>/<lesson>/<step>/` paths
- **Pristine bar**: A discoverable route per phase ("real python", "agents and apis") with anchor links would let blog posts, X threads, and recruiters point at exact sections. Right now you can only point at home or at a step.
- **Severity**: major

### C-02 · No filter / sort / search across the 25 chapters — MAJOR (scale problem already)
- **Evidence**: `home-curriculum-1920.png`
- **Pristine bar**: At 25 chapters / 624 steps, "I want to find the lesson on f-strings" has no path beyond cmd+F. Linear, Stripe docs, and Notion gallery all have search at this scale.
- **Severity**: major

---

## Onboarding

Reference shots: `onboarding-1920.png`, `onboarding-1920-full.png`, `onboarding-step2.png`

### O-01 · Step 1 is vertically centered with massive empty space above — MINOR
- **Evidence**: `onboarding-1920.png` — H1 "you're going to learn python." sits at vertical center of the screen with ~500px empty above
- **Pristine bar**: Onboarding flows by Linear/Notion anchor content nearer the top with a tight container. Centering here makes it feel like a placeholder.
- **Severity**: minor

### O-02 · Header still includes "GitHub stars / login / follow on X" during onboarding — MAJOR
- **Evidence**: `onboarding-1920.png`, `onboarding-step2.png` — full marketing header on every onboarding step
- **Pristine bar**: Stripe/Linear onboarding strips chrome down to just brand + step indicator + maybe Skip. Here every distraction stays in view.
- **Severity**: major

### O-03 · No back button between steps — MAJOR
- **Evidence**: `onboarding-step2.png`
- **Pristine bar**: Multi-step flows must let users go back. Required.
- **Severity**: major

### O-04 · No "skip onboarding" affordance — MINOR (intentional?)
- **Evidence**: `onboarding-1920.png`
- **Pristine bar**: Lever for power users. Could be intentional product call.
- **Severity**: minor

### O-05 · Step indicator (5 segments top-right) is tiny, unlabeled, easy to miss — POLISH
- **Evidence**: `onboarding-1920.png`
- **Pristine bar**: Linear's onboarding shows "Step 2 of 5" with an animated fill. Here it's 5 muted dashes most users will never notice.
- **Severity**: minor

---

## Login modal

Reference shots: `login-modal-1920.png`

### LM-01 · Modal is offset upper-left of center, not centered horizontally or vertically — POLISH
- **Evidence**: `login-modal-1920.png`
- **Pristine bar**: Modals center on viewport (or at most slightly above center for shorter modals). Here it sits in the upper-left quadrant.
- **Severity**: minor

### LM-02 · No close button (X) — only ESC or click-outside (assumed) — MAJOR (a11y)
- **Evidence**: `login-modal-1920.png` — only `[ esc ]` text in upper-right of modal as the close hint
- **Pristine bar**: Touch users (no esc key) and mouse-only users expect an X. Linear, Stripe, Notion all ship both.
- **Severity**: major

### LM-03 · SAVE button looks disabled / muted even when input is focused — POLISH
- **Evidence**: `login-modal-1920.png` — green is desaturated, no obvious primary state
- **Pristine bar**: Primary CTAs in modals get the strongest brand hue. This green reads gray-green.
- **Severity**: minor

### LM-04 · Input has only a focus outline — no label — MINOR (a11y)
- **Evidence**: `login-modal-1920.png` — "you@somewhere.dev" placeholder is the only label; no visible `<label>`
- **Pristine bar**: Visible labels are a WCAG SC 3.3.2 best practice. Floating label or a proper label element is standard.
- **Severity**: minor

### LM-05 · Body of the page behind the modal is dimmed but not blurred; lesson code is still partially readable — POLISH
- **Evidence**: `login-modal-1920.png`
- **Pristine bar**: Stripe/Linear apply backdrop-filter blur for clear visual hierarchy.
- **Severity**: minor

---

## Changelog

Reference shots: `changelog-1920.png`, `changelog-1920-full.png`

### CL-01 · Plain-prose paragraphs with date prefix — no version pills, no diff/screenshot, no per-entry permalinks — MAJOR
- **Evidence**: `changelog-1920.png`
- **Pristine bar**: Linear / Vercel / Stripe changelogs have: type tags (improvement / fix / new), thumbnails, expandable details, permalinks (#2026-05-06). This one is `/dev/null > prose.md`.
- **Severity**: major

### CL-02 · No RSS / atom / "follow updates" — MAJOR (audience-over-completion mismatch)
- **Evidence**: Page source / footer
- **Pristine bar**: For an indie project optimizing for audience growth (per Josh's product memos), `/changelog/feed.xml` + a "subscribe to updates" CTA = compounding distribution. Right now the audience has no way to follow shipping cadence except checking the page.
- **Severity**: major

### CL-03 · Footer-callout "latest source: github.com/xernst/promptdojo" is a static line — MINOR
- **Evidence**: `changelog-1920.png`
- **Pristine bar**: Could pull "last commit X minutes ago" live and link directly to /commits feed.
- **Severity**: minor

---

## 404

Reference shot: `404-1920.png`

### F-01 · Default unbranded Next.js 404 — CRITICAL
- **Evidence**: `404-1920.png` (covered as N-11)
- **Severity**: critical

### F-02 · No "back to home" or "search the curriculum" CTA — MAJOR
- **Evidence**: `404-1920.png`
- **Severity**: major

### F-03 · No signature voice ("ai wrote this URL. it's wrong." would write itself) — MAJOR
- **Pristine bar**: 404 is the cheapest brand-personality moment in any product.
- **Severity**: minor → major opportunity

---

## OG share preview

Reference shot: `og-wedge.png`

### OG-01 · Returned content-type is `application/octet-stream`, not `image/png` — MAJOR (silent breakage on some platforms)
- **Evidence**: `curl -I https://promptdojo.pages.dev/og/launch/wedge` returns `application/octet-stream`
- **Pristine bar**: Most modern crawlers tolerate octet-stream but Slack, Mastodon, and some link-preview services require explicit `image/*`.
- **Severity**: major

### OG-02 · OG image renders site copy in sans-serif, but homepage hero uses Fraunces serif — brand inconsistent — MAJOR
- **Evidence**: `og-wedge.png` shows sans-serif "ai writes this. it's wrong." vs the home page's Fraunces serif
- **Pristine bar**: Linear/Stripe OG images use the same display face as their hero. The OG should look like a screenshot of the brand, not a different brand.
- **Severity**: major

### OG-03 · OG always shows "CHAPTER 07 · MUTATION AND STATE" regardless of which page is being shared — DATA
- **Evidence**: `og-wedge.png` shows ch07 mutation hero but the shared URL was `/` (home)
- **Pristine bar**: Per-route OG variants. `/` should show home-tier hero, `/learn/v2/variables/...` should show variables.
- **Severity**: major

### OG-04 · Footer of OG just says "promptdojo" with no URL — MINOR
- **Evidence**: `og-wedge.png`
- **Pristine bar**: Brand mark + URL is standard.
- **Severity**: minor

---

## Cross-cutting issues (apply everywhere)

### X-01 · Code font is system `monospace` (no designed code face loaded) — affects every code surface
- **Evidence**: `getComputedStyle(.cm-line).fontFamily === "monospace"`; visible in OG image, lesson IDE, home hero code block
- **Severity**: major (covered as L-08, but it's a global brand decision)

### X-02 · No focus rings visible anywhere; outline style is `none` even when active element has outline color/width
- **Evidence**: `lesson-ide-1280-focus.png` — Tab traversal landed on "LOGIN TO SAVE" but no visible ring
- **Severity**: critical (WCAG 2.4.7) — covered as L-11

### X-03 · "park a thought" floating CTA persists on every page including 404 and login modal — should hide contextually
- **Evidence**: visible in `404-1920.png`, `lesson-ide-1920-after-run.png`, `home-1920.png`, `about-1920.png`, `changelog-1920.png`, `login-modal-1920.png`
- **Severity**: major (cluttering on pages where note-taking makes no sense)

### X-04 · Header is `position: static` — the brand wordmark and progress disappear on scroll
- **Evidence**: every long page (home, about long, curriculum scroll) — covered as N-01
- **Severity**: major

### X-05 · Color palette feels muted: primary green is solid mint, but everything else is grays — under-saturated
- **Evidence**: every screenshot. Hero `it's wrong.` is the only off-mint accent. Buttons, badges, hairlines all use the same green or muted neutrals.
- **Pristine bar**: Linear: 4–6 functional accents (red destructive, yellow warning, blue info, green success, purple highlight). Promptdojo currently has ~2 (mint, ink). When everything is the same green, status loses meaning.
- **Severity**: major

### X-06 · Lowercase voice is inconsistent: "WHAT IS THIS?" / "FOLLOW @TFISPYTHON ON X" are uppercase ASCII pills, but the body is all lowercase serif — voice clash
- **Evidence**: `home-1920-fold.png` header
- **Pristine bar**: Pick one register for navigation. Mixing terminal-uppercase pills with editorial-lowercase prose reads like two products glued together.
- **Severity**: minor → major brand decision

### X-07 · Spacing rhythm uneven across surfaces — H1 → subhead → CTA gaps differ between Home / About / Onboarding
- **Evidence**: compare `home-1920-fold.png`, `about-1920.png`, `onboarding-1920.png` — the air around hero / sub / CTA has no shared rhythm
- **Severity**: minor

### X-08 · Touch targets on mobile fail 44px minimum in several places
- **Evidence**: `home-mobile-375-fold.png` — "❯ promptdojo _" wordmark is ~32px tall; sidebar disclosure carets in lesson view at 1280 are ~24px (lesson-ide-1280.png)
- **Severity**: major (WCAG 2.5.5)

### X-09 · No skeleton or loading states observed anywhere — Pyodide first-warmup runs silent
- **Evidence**: clicked Run on a fresh page; no spinner, no "warming up Python..." message
- **Severity**: major (per L-13, but globally — load states are uniformly missing)

### X-10 · Network: 33 resources on home, fastest at 102ms. Performance is fine. But there is no preload of code font / no `font-display: swap` evidence — needs source check
- **Evidence**: `performance.getEntriesByType("resource")` showed only 33 entries, none of them visibly `*.woff2` for a code font
- **Severity**: minor (performance is healthy; flagging because designer won't know what code font to spec when there isn't one)

### X-11 · No console errors, no failed network requests, no 4xx in the resource list — this is the one thing that's clean
- **Evidence**: `window.__consoleErrors` returned `none captured` on home and lesson page
- **Severity**: ✅ none — note this in "what's already pristine"

---

## Top 25 things to fix to reach pristine

Ranked by impact-to-effort. Each: 1 line + screenshot ref.

1. **Fix mobile/tablet "Show prompt" toggle (it does nothing)** — `lesson-ide-mobile-prompt-open.png` [L-02]
2. **Reconcile 398 vs 624 step counts across hero / curriculum / about** — `home-curriculum-1920.png` [H-02]
3. **Replace default Next.js 404 with branded page in lowercase voice** — `404-1920.png` [N-11]
4. **Add visible focus rings (currently `outline-style: none`)** — `lesson-ide-1280-focus.png` [L-11]
5. **Add mobile nav drawer / hamburger; collapse stacked header buttons** — `home-mobile-375-fold.png` [N-08]
6. **Add curriculum nav on mobile lesson IDE (sidebar / bottom-sheet)** — `lesson-ide-mobile-375.png` [N-09]
7. **Hide/contextualize "1/398 ~0%" progress hairline outside lesson pages** — `about-1920.png`, `404-1920.png` [N-02]
8. **Load a designed code font (Berkeley Mono / Geist Mono / JetBrains Mono)** — `lesson-ide-1920.png` [L-08, X-01]
9. **Make site header sticky / collapsing** — every long-page screenshot [N-01]
10. **Fix horizontal code clipping on lesson editor (wrap or scrollbar+fade)** — `lesson-ide-1920-after-run.png` [L-01]
11. **Per-route OG images with consistent serif display face** — `og-wedge.png` [OG-02, OG-03]
12. **Remove or hide the "legacy 28-chapter course" disclosure on home** — `home-footer-1920.png` [H-08]
13. **Distinguish in-progress chapter cards (1/26) from untouched (0/27)** — `home-curriculum-1920.png` [H-06]
14. **Build a real changelog: type tags, screenshots, permalinks, RSS** — `changelog-1920.png` [CL-01, CL-02]
15. **Auto-show retry CTA after wrong quiz answer (don't hide Check)** — `lesson-ide-quiz-wrong.png` [L-06]
16. **Fix wrong-answer feedback: don't outline the wrong-untouched option** — `lesson-ide-quiz-wrong.png` [L-07]
17. **Add explicit close (×) on login modal + center modal on viewport** — `login-modal-1920.png` [LM-01, LM-02]
18. **Strip marketing chrome from onboarding header (brand + step only)** — `onboarding-1920.png` [O-02]
19. **Add back button between onboarding steps** — `onboarding-step2.png` [O-03]
20. **Label the "0" streak badge or attach an icon (currently looks like a render bug)** — `lesson-ide-1920.png` [L-05]
21. **Add hover state to chapter cards + GitHub pill + nav links** — `home-chapter-card-hover.png`, `home-github-hover.png` [H-04, N-03]
22. **Keep "park a thought" out of pages where it's noise (404, login, onboarding)** — `404-1920.png` [X-03]
23. **Wrap sidebar lesson titles to 2 lines (don't `…` mid-word — these titles are the marketing)** — `lesson-ide-1920.png` [L-10]
24. **Fix OG content-type to `image/png`** — covered above [OG-01]
25. **Add focus ring + visible scroll indicator on lesson sidebar overflow** — `lesson-ide-1920-full.png` [N-06, L-11]

---

## What's already pristine (don't break these)

- **Voice on the home hero**: "ai writes this. it's wrong." is iconic, brand-defining, and immediately legible at every viewport. (`home-1920-fold.png`)
- **Onboarding step 2 single-question card pattern**: clean, focused, four well-written options with sub-copy. (`onboarding-step2.png`)
- **Login modal copy**: "no account, no auth. anyone with your email can load your progress. don't use a shared mailbox if that bothers you." — terrific, honest microcopy. (`login-modal-1920.png`)
- **Lesson copy density and tone**: lesson 1 of variables reads like a great mid-career engineer's blog post — confident voice, concrete examples, strong rhythm. (`lesson-ide-1920-full.png`)
- **Quiz wrong-answer microcopy**: "Hyphens are subtraction in Python — that line is `user` minus `score`, not a name." (`lesson-ide-quiz-wrong.png`)
- **Phase headers**: "phase 01 · foundations · variables, functions, lists, dicts, loops, conditionals, tracebacks, mutation" lockup is excellent. (`home-curriculum-1920.png`)
- **No console errors, no 4xx, no slow assets**: 33 resources on home, fastest 102ms, no errors captured. The runtime is clean — every issue above is design/UX, not performance/bug.
- **OG image's actual hero content** (the `def collect_errors` mutable-default-arg gag): smart, on-brand, technical. Just needs the right typeface and per-route variants. (`og-wedge.png`)
- **Color discipline on the dark theme**: the `bg-ink-950 → ink-100` hierarchy is consistent and readable; the issue is breadth not depth (X-05 — too few accent hues, but the ones present are well-tuned).
- **The serif/display face choice (Fraunces)**: works beautifully for editorial headers. Don't lose it.

---

End of walkthrough. 35 screenshots in `/Users/joshernst/Developer/code-killa/design-kit/audit-v3/screenshots/`. ~57 distinct findings catalogued. The headline takeaway: at 1920 the site has good bones and great voice, but the moment you (a) shrink the viewport, (b) hit any non-happy-path, or (c) try to navigate, the experience falls off a cliff. The 30% number Josh cited tracks.
