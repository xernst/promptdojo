# Accessibility Audit (WCAG 2.2 AA)
_Date: 2026-05-06_
_Method: Static analysis only — no live screen-reader / keyboard run on the deployed site. Findings noted as `[STATIC]` are read off the source; anything labelled "untested" needs verification on https://promptdojo.pages.dev._

This audit covers: `app/page.tsx`, `app/curriculum/page.tsx`, `app/layout.tsx`, `components/v2/LessonShell.tsx`, `components/v2/LessonStepClient.tsx`, `components/v2/PersistentIDE.tsx`, `components/v2/ChapterNav.tsx`, `components/v2/StepRouter.tsx`, all eight `components/v2/steps/*.tsx`, `components/SiteHeader/{FloatingNav,FlatHeader,Drawer,ContinuePill}.tsx`, `components/{LoginToSave,EmailSignup,BrainDump,StreakWidget,StatStrip,PriceBand,GitHubStatsPill,FollowOnXPill,Wordmark,HeroBugSnippet,ChapterNav}.tsx`, `components/v2/{HomeClient,CourseProgress,DailyGoalDial,PhaseBandedRail,PhaseBandedRailClient,CurriculumAccordion,ProgressHairline,StepFooter}.tsx`, and `app/globals.css`.

---

## Blockers (a real user cannot complete a lesson)

### Two `<main>` landmarks with the same `id="main"` on every lesson page
- **SC 4.1.1 Parsing / 4.1.2 Name, Role, Value / 1.3.1 Info & Relationships** (Level A)
- **Where:** `components/v2/LessonShell.tsx:51-101`
  - Line 51-74: desktop `<main id="main">` (rendered, hidden via `hidden md:grid`)
  - Line 77-101: mobile `<main id="main">` (rendered, hidden via `md:hidden`)
- **What fails:** Both `<main>` elements ship in the DOM — Tailwind `hidden` is `display:none` so they're CSS-hidden but still present. There are now (a) two main landmarks and (b) two elements with the same `id`. The skip-link in `app/layout.tsx:23` (`href="#main"`) targets an ambiguous ID; behavior depends on browser source-order. Some screen readers list both landmarks; some announce "main, main".
- **User impact:** A blind learner arrives, hits Tab, takes the skip link, and lands on whichever `#main` the browser picks first — on desktop that's the mobile-only one (display:none). Focus moves into a hidden tree. The "skip to content" promise breaks the moment the user trusts it.
- **Fix:** Render only one `<main>` (or wrap both with a single `<main>` and use child `<div>`s for the responsive split). Move the responsive layout decision inside one `main`. Same applies to `components/v2/LessonShell.tsx` — collapse to a single landmark.
- **Verification:** With NVDA/VoiceOver: open a lesson, list landmarks (VO+U on macOS, NVDA+F7 on Windows), confirm exactly one `main`. Tab from page top, take the skip link, confirm focus lands in the visible content.

### Step-grading "wrong answer" feedback on fill-blanks is invisible
- **SC 1.4.1 Use of Color / 3.3.1 Error Identification / 3.3.3 Error Suggestion** (Level A / AA)
- **Where:** `components/v2/steps/FillBlankStepView.tsx:108-131`
- **What fails:** When a blank is wrong, the input gets `border-ink-700` — which is the *same* color as the unfilled default (`border-ink-700` at line 128). The wrong-answer state is visually identical to the unsubmitted state. The aria-live message at line 157 ("Not yet — read the line above the blank") is announced, but there is no per-field error association — `aria-invalid`, `aria-errormessage`, and a label-error binding are all missing.
- **User impact:** A sighted learner with three blanks gets "Not yet" but no visual signal pointing at *which* blank is wrong. A screen-reader user gets no per-field error binding — they have to retype every blank.
- **Fix:** On wrong, add a high-contrast border (e.g. `border-err`/`border-rose-500`) AND `aria-invalid="true"` + `aria-errormessage` referencing the per-blank error text. Show inline per-blank micro-error text under the wrong blank, not just one global "Not yet."
- **Verification:** Submit a fill-blank with one wrong blank; confirm the wrong blank has a distinct visual border AND that NVDA reads "blank 2, invalid entry, …error message…".

### Step transitions (Continue → next step) are not announced to screen readers
- **SC 4.1.3 Status Messages / 2.4.6 Headings & Labels** (Level AA / AA)
- **Where:** `components/v2/LessonStepClient.tsx:120-137` (`router.push` after Continue), and `LessonShell` has no live region or focus-management for SPA navigation.
- **What fails:** Continue triggers a Next.js client-side route change. The new step's content swaps in-place. No focus is moved to the new step heading, no `aria-live` region announces "step 4 of 12: predict the output", and the visible h1 is `sr-only` (LessonStepClient.tsx:159) — which already exists, just doesn't trigger an announcement on update.
- **User impact:** A screen-reader learner clicks Continue, hears nothing, has no idea the page changed, and re-reads the same step content. They abandon the lesson because every step transition is silent.
- **Fix:** After `router.push`, programmatically focus the new lesson `<h1 sr-only>` (give it `tabIndex={-1}` and call `.focus()` in a `useEffect` keyed off `step.id`). OR: render an `aria-live="polite"` region that updates with "step N of M: <step-type>" each time `step.id` changes. Both is best.
- **Verification:** With VoiceOver on, navigate three steps in a row using Continue. Each transition should announce the new step number + type without the user moving focus.

### IDE Run button traps `⌘↵` keyboard binding *globally* — interferes with text input
- **SC 2.1.2 No Keyboard Trap / 2.1.4 Character Key Shortcuts** (Level A / AA)
- **Where:** `components/v2/PersistentIDE.tsx:181-191` — `window.addEventListener("keydown")` for `⌘↵`/`Ctrl+↵` is *global*, not scoped to the IDE.
- **What fails:** A blind user typing into the BrainDump textarea (`BrainDump.tsx:84-94` already uses `⌘↵` for save), the Login email field, the EmailSignup form, OR a Predict step's prediction textarea who happens to press `⌘↵` will *also* trigger an IDE run. Multiple components compete for the same chord. There is also no way to turn off / remap the shortcut. SC 2.1.4 requires single-character shortcuts to be turn-off-able or remappable; chords with modifiers are exempt, but the *unscoped* binding is still a UX hazard.
- **User impact:** Voice-control users (Dragon, Voice Control on macOS) who utter "press command return" hit unpredictable behaviour depending on focus.
- **Fix:** Bind `⌘↵` on the IDE container element only (use `onKeyDown` on the editor wrapper, not `window`). Same for `BrainDump`'s `⌘↵`. The continue-step `⌘↵` in `StepFooter.tsx:57-67` has the same global pattern — same fix.
- **Verification:** Focus the email field in the LoginToSave dialog; press `⌘↵`. Should not run python or advance step.

### Reorder step "grab" interaction is mouse-shaped, broken on keyboard, silent on AT
- **SC 2.1.1 Keyboard / 4.1.2 Name, Role, Value / 1.3.1 Info & Relationships** (Level A)
- **Where:** `components/v2/steps/ReorderStepView.tsx:99-117`
- **What fails:** The `GripVertical` button uses `aria-pressed` to imply "grabbed", and `onKeyDown` to listen for ArrowUp/Down — but only fires *while focused on the grip*. There's no announcement of the new position after a move. The list has no `aria-live`. There IS a working fallback via the explicit Move-up/Move-down buttons (lines 124-143) — that part is OK — but the grip-and-arrow pattern is misleading and inaccessible.
- **User impact:** A keyboard or screen-reader user who follows the visual "grab" affordance gets stranded — pressing arrow keys appears to do nothing because the button needs focus AND the user has no audible feedback about the new position.
- **Fix:** Either remove the grip "grab" pattern entirely (the up/down buttons are sufficient) OR implement WAI-ARIA Authoring Practices "Listbox with rearrangeable options" pattern (roving tabindex on the list, `aria-activedescendant`, ArrowUp/Down on the list container, and an `aria-live` announcement of new position).
- **Verification:** Tab through a reorder step; confirm the up/down arrow buttons are reachable and operable. With VoiceOver, confirm each move announces "moved to position 3 of 5".

### Decorative "step icon" placeholder uses 1.78:1 text on dark
- **SC 1.4.3 Contrast Minimum** (Level AA)
- **Where:** `components/v2/ChapterNav.tsx:206-211`
- **What fails:** A `<span class="text-ink-700">·</span>` is rendered as the step-status indicator for un-attempted steps (line 207). `#3f3f46` on `#18181b` (sidebar bg `bg-ink-900`) is roughly 1.5:1.
- **User impact:** Low-vision learners can't see which steps are unstarted. They appear identical to "no step".
- **Fix:** Use `aria-hidden` AND make the visual decoration much higher contrast (ink-500 minimum), OR remove the `·` and use whitespace.

### IDE has no accessible name; CodeMirror editor is a black box to AT
- **SC 4.1.2 Name, Role, Value / 2.4.6 Headings & Labels** (Level A / AA)
- **Where:** `components/v2/PersistentIDE.tsx:259-274`
- **What fails:** The CodeMirror `<CodeMirror>` is rendered without `aria-label` or `aria-labelledby`. Screen readers announce the underlying contenteditable as "edit text, multi-line" with no context — a learner cannot tell they're inside the Python editor vs the prompt panel. The output panel at line 341 has `aria-live="polite"` but no `aria-label` either.
- **User impact:** A screen reader user navigating the lesson page hears "edit text" with no indication of what they'd be editing. They will type into the prompt panel by mistake.
- **Fix:** Wrap the editor in a `<section aria-label="Python editor — main.py">` and the output panel in `<section aria-label="Run output">`. Pass `aria-label` to CodeMirror via `basicSetup` or wrap it.

---

## Serious (degraded but workable)

### Visible "headings" on home + cards are `<div>`, not `<hN>`
- **SC 1.3.1 Info & Relationships / 2.4.6 Headings & Labels** (Level A / AA)
- **Where:**
  - `app/page.tsx:153` — three feature cards use `<div class="t-h3">` instead of `<h3>`
  - `components/v2/PhaseBandedRailClient.tsx:165` — chapter tile titles use `<div class="t-h3">`
  - `components/v2/CurriculumAccordion.tsx:97` — chapter rows use `<span class="t-h3">`
  - `components/v2/HomeClient.tsx:53,77,111` — welcome-back headings use `<div class="t-h2">`
- **What fails:** A screen-reader user pressing `H` (next heading) jumps straight from the home `<h1>` ("ai writes this. it's wrong.") to the `<h2>` "25 chapters · 624 runnable steps" and skips every chapter title in between. The phase headings are correct (`<h2 class="t-section">` in CurriculumAccordion line 72) but chapters/lessons are silent.
- **User impact:** Heading navigation — the primary way blind users skim a page — surfaces a dozen entries instead of a hundred. They cannot triage chapters.
- **Fix:** Make the type-scale a polymorphic component or use `<h2>`/`<h3>` everywhere `t-h2`/`t-h3` appears in content (not navigation chrome). Alternatively, accept the visual style as a class but require a semantic element.

### Step body markdown can render arbitrary `<h1>` inside a step that already has an `<h1 sr-only>`
- **SC 1.3.1 Info & Relationships / 2.4.6 Headings & Labels** (Level A / AA)
- **Where:** `components/v2/LessonStepClient.tsx:159` (`<h1 class="sr-only">…step N of M</h1>`) + step body markdown rendered via `ReactMarkdown` in every step view; lesson body content (e.g. `lib/generated/v2/chapters/debugging-output.json`) starts with `# When the model lies, the trace tells you why` which becomes `<h1>` in the prose.
- **What fails:** Two `<h1>`s per lesson page is now standard. The visual heading is the body `# heading`, not the sr-only one.
- **User impact:** Heading hierarchy reads as h1 → h1 → h2 → h3, which is a 1.3.1 violation and disorients screen-reader navigation.
- **Fix:** Down-shift markdown headings by one level using `rehype-slug`/`rehype-shift-headings` so `#` becomes `<h2>`. The lesson `<h1 sr-only>` stays as the canonical h1 for SR users. (Or remove the sr-only and use the body's `#` as h1, but the breadcrumb context is lost.)

### Color contrast: `text-ink-600` (#6e6e76) used as text in many places — fails 4.5:1
- **SC 1.4.3 Contrast Minimum** (Level AA)
- **Where (selected):**
  - `components/v2/CurriculumAccordion.tsx:110,115` — lesson numbers + step counts
  - `components/v2/PhaseBandedRailClient.tsx:192,196` — lesson list numbers
  - `components/v2/DailyGoalDial.tsx:111` — `/ {goal} min` label
  - `components/ChapterNav.tsx:66,71` — chapter number + completion count
  - `components/v2/LessonStepClient.tsx:170,180` — breadcrumb separators (decorative is OK)
- **What fails:** ~3.58:1 on `#14140f`. Comment in `globals.css:13-15` says "ink-600 is now reserved for non-text decorative borders only" — but it's used as `text-ink-600` for real text in 8+ places.
- **Fix:** Either bump `--color-ink-600` to clear 4.5:1 (around `#828289`) or rename uses of `text-ink-600` → `text-ink-500`. Decorative `·` separators are exempt from contrast.

### Color contrast: `text-green-700` (#186b46) used as text label
- **SC 1.4.3 Contrast Minimum** (Level AA)
- **Where:** `components/v2/PhaseBandedRailClient.tsx:88` — `tierColor = "text-green-700"` for phases 2-3 ("core" label) on dark
- **What fails:** ~2.97:1 on `#14140f`/`#18181b`. Below 4.5:1 normal text and below 3:1 large text.
- **Fix:** Use `text-green-500` or higher. The intent ("dim for advanced") can be expressed via opacity or weight without dropping below contrast minimum.

### Form inputs' `focus:outline-none` overrides the global focus canon
- **SC 2.4.7 Focus Visible / 2.4.11 Focus Not Obscured** (Level AA)
- **Where:** `components/LoginToSave.tsx:284`, `components/EmailSignup.tsx:39`, `components/BrainDump.tsx:92`, `components/v2/steps/FillBlankStepView.tsx:129`, `components/v2/steps/PredictStepView.tsx:76`
- **What fails:** Despite the strong `*:focus-visible` rule in `globals.css:375-379`, each of these inputs adds `focus:outline-none` and relies only on `focus:border-green-500` to indicate focus. Border color change alone is dim against `bg-ink-950`. `BrainDump.tsx:92` uses bare `outline-none` (no `:focus` qualifier) which is unconditional. `:focus-visible` *is* more specific so the outer outline should still appear — but it depends on whether Tailwind generates `outline:none` with sufficient specificity to override.
- **User impact:** Keyboard users may lose visible focus on inputs depending on browser/Tailwind version. Mouse users in BrainDump can't see focus at all (unconditional `outline-none`).
- **Fix:** Remove every `focus:outline-none` / `outline-none` on inputs. Trust the global `*:focus-visible` rule. If the outer ring is visually too aggressive, adjust the global rule, don't override per-element.

### Streak/ember/frozen-flame icons rely on `title` attribute alone
- **SC 1.1.1 Non-text Content / 4.1.2 Name, Role, Value** (Level A)
- **Where:** `components/StreakWidget.tsx:27-41`
- **What fails:** Three icon+number pairs (Flame, Sparkles, Snowflake). Only `title=` is provided — no `aria-label`, no `<span class="sr-only">`. `title` is widely under-supported by screen readers and not guaranteed.
- **User impact:** A screen-reader user hears "5, 2, 1" with no idea what those numbers mean.
- **Fix:** Add `aria-label="5-day streak"` etc. to each `<span>`. Better: combine into a single labelled group: `<div role="group" aria-label="streak summary"><span aria-label="current streak: 5 days">5</span>…</div>`.

### LessonShell wraps the chapter sidebar in `<aside>` — but contents are navigation
- **SC 1.3.1 Info & Relationships** (Level A)
- **Where:** `components/v2/LessonShell.tsx:47-49` — `<aside>` wraps `V2ChapterNav` which renders its own `<nav>`.
- **What fails:** `<aside>` is for tangentially-related content; chapter navigation is primary navigation. Wrapping `<nav>` inside `<aside>` creates two landmarks where one belongs.
- **Fix:** Replace the `<aside>` with a plain `<div>`. The inner `<nav>` already provides the landmark.

### Mobile drawer scrim has no focus trap
- **SC 2.4.3 Focus Order / 2.1.2 No Keyboard Trap (inverse)** (Level A)
- **Where:** `components/SiteHeader/Drawer.tsx`
- **What fails:** Drawer renders `role="dialog" aria-modal="true"` (good), Escape closes (good), but no Tab focus trap. A keyboard user inside the drawer can Tab past the close button into the underlying page (which is hidden behind the scrim but still focusable). Also: focus is not moved into the drawer on open, and not restored to the trigger on close (`onClose` is called but doesn't `triggerRef.current?.focus()`).
- **User impact:** Keyboard user opens menu, tabs through 4 items, then Tab disappears off-screen because the body content is still focusable but invisible behind the scrim.
- **Fix:** Mirror the focus-trap pattern from `LoginToSave.tsx:107-126`. Capture the trigger, focus the close button on open, restore focus on close.

### Run-output panel `aria-live` reads the entire pre-block on every run
- **SC 1.3.1 / 4.1.3 Status Messages** (Level A / AA)
- **Where:** `components/v2/PersistentIDE.tsx:341-366`
- **What fails:** A `<div aria-live="polite">` that contains the full stdout `<pre>` plus the empty/running/ranEmpty states. On each run, the entire DOM tree changes — screen readers may either re-read everything or skip changes depending on engine.
- **User impact:** A blind learner runs Python with `print("hello")` and hears the entire surrounding chrome ("`[promptdojo:~]$ _`") read every time.
- **Fix:** Make `aria-live` a sibling status node that only contains the announcement text (e.g. "Ran successfully in 240ms. Output: hello"). Keep the visual stdout `<pre>` outside the live region. Use `aria-atomic="true"` on the live node.

---

## Moderate

### `<kbd class="dojo-kbd">` has no semantic mapping for SR
- **SC 1.3.1** (Level A)
- **Where:** `app/page.tsx:178-180`, `HomeClient.tsx:57,81,120`, `StepFooter.tsx:138-140`, `PersistentIDE.tsx:313`
- **What fails:** `<kbd>⌘⇧B</kbd>` is announced as "command shift B" or "splat shift B" depending on the SR. Glyphs like `↵` and `⌘` aren't always read meaningfully.
- **Fix:** Pair with an `aria-label="press Command Shift B"` or a visually-hidden expansion span.

### Drawer trigger button uses `aria-expanded` without an associated `aria-controls`
- **SC 4.1.2** (Level A)
- **Where:** `components/SiteHeader/FloatingNav.tsx:82-90`, `components/SiteHeader/FlatHeader.tsx:48-56`
- **Fix:** Add `aria-controls="site-drawer"` and an `id="site-drawer"` on the panel.

### Daily-goal dial has both `title` AND `aria-label` with the same string
- **SC 1.1.1** (Level A — passes, but verbose)
- **Where:** `components/v2/DailyGoalDial.tsx:88-91`
- **What fails:** Some SR engines double-announce when both attributes are present. The inner `<span role="img" aria-hidden>` correctly hides the visual ring, but the parent's `aria-label` repeats the title.
- **Fix:** Drop the `title` (it's mouse-tooltip bait that AT often re-announces).

### Multiple-choice radio group is built from `<button role="radio">` rather than real radios
- **SC 4.1.2** (Level A)
- **Where:** `components/v2/steps/MultipleChoiceStepView.tsx:78-114`
- **What fails:** `role="radiogroup"` on a `<ul>` with `<button role="radio">` children is *technically* valid ARIA, but: the keyboard pattern for a radio group is "Tab to enter, then Arrow keys to move between radios" — not Tab between each. The current implementation lets Tab move between radios (because they're real `<button>`s). That's confusing for AT users expecting WAI-ARIA radio behaviour.
- **Fix:** Either use real `<input type="radio">` (best — native a11y) or implement the full ARIA Authoring Practices radio-group pattern (roving tabindex, arrow keys move selection, Tab exits). Currently the digit-key shortcut at line 64-66 *does* select but doesn't move focus, which is a separate inconsistency.

### Mobile gate at <md viewport tells the user "desktop required" but doesn't link them home
- **SC 2.4.5 Multiple Ways / 3.3.5 Help** (Level AA / AAA)
- **Where:** `components/v2/LessonShell.tsx:84-100`
- **Note:** Soft moderate — the link to `/lesson/resume` is present, but there's no explicit way back to home / browse without resuming. Acceptable for the audience, but worth a "browse the curriculum on mobile" affordance.

### `prefers-reduced-motion` honored on cursor blink + skeleton, but NOT on the conic-gradient ring fill animation
- **SC 2.3.3 Animation from Interactions** (Level AAA — but we're at AA, so soft)
- **Where:** `components/v2/DailyGoalDial.tsx:79` — conic-gradient updates without `motion-reduce` consideration. Doesn't auto-animate, only on state change, so probably OK.
- **Fix:** Verify on a live build. Probably fine.

### Focus indicator on `dojo-card-interactive` chapter tiles is the global ring — but card hover *also* shifts left padding by 1px (layout shift)
- **SC 2.4.7 Focus Visible / 2.4.11 Focus Not Obscured** (Level AA)
- **Where:** `app/globals.css:268-284`
- **What fails:** Hovering shifts content 1px. Not a contrast issue per se but on focus the same shift fires, plus the outer focus ring — visually cluttered. Acceptable; flag for design review.

### `<details>` accordion without `aria-controls` between summary and content
- **SC 4.1.2** (Level A — `<details>` is native and self-describes; fine)
- **Where:** `components/v2/CurriculumAccordion.tsx:62-135`
- **Note:** Native `<details>`/`<summary>` is fully accessible by default. Just verify the `transition: rotate-90` on the chevron honours `prefers-reduced-motion`.

---

## What's already done well

- **Skip-to-content link** at `app/layout.tsx:23` — properly hidden until focus, rendered first thing in `<body>`. Pattern is correct.
- **Strong global focus canon** in `app/globals.css:375-386` — double-ring on buttons/links survives any background. Excellent.
- **`prefers-reduced-motion` honored** on cursor blink (`globals.css:143-145`), CodeMirror caret (`globals.css:148-151`), skeleton (`globals.css:425-427`), progress hairline transitions (`ProgressHairline.tsx:51`). That's the right discipline.
- **`html lang="en"`** correctly set on `app/layout.tsx:21` (SC 3.1.1).
- **Login dialog focus trap + restoration** in `LoginToSave.tsx:88-130` is the model implementation — focus trap with shift-tab handling AND `triggerRef.current?.focus()` on close. **Use this as the template for fixing the mobile drawer.**
- **Login dialog form a11y** — `aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-errormessage`, `role="alert"` on the error. Best-in-class on this codebase.
- **Email signup live region** on `EmailSignup.tsx:50` — `aria-live="polite"` properly scoped to the status text only, with a `min-h-6` to prevent layout shift.
- **Color tokens already audited once** — `globals.css:11-15` shows ink-500/600 were already bumped for contrast. Just need to finish the migration (uses of `text-ink-600` for body text).
- **ProgressHairline guards against duplicate progress announcements** — only adds `role="progressbar"` when `ariaLabel` is provided. `ProgressHairline.tsx:39-43` does this right.
- **Mobile gate is honest** — `LessonShell.tsx:75-100` doesn't fake-collapse the IDE, it tells the user to come back on a laptop. Accessibility-friendly because half-broken IDEs are worse than refusal.
- **`aria-current="page"` and `aria-current="step"`** correctly applied in `components/v2/ChapterNav.tsx:75,145,167`.
- **Wordmark SVG** correctly uses `aria-hidden="true"` on the SVG and `aria-label` on the wrapping `<span>` (`Wordmark.tsx:31-33,77`).

---

## Untested (need live keyboard / screen reader run)

- [ ] **End-to-end keyboard pass through one lesson** — Tab from `/`, take skip link, navigate sidebar to a chapter, click into a step, complete a fill-blank, run the IDE, advance via Continue — without a mouse. Verify no traps. Verify tab order matches visual order.
- [ ] **VoiceOver pass on macOS Safari** — open a lesson, list landmarks (VO+U), confirm exactly one `main`. Read full step. Run the IDE. Confirm output is announced. Advance; confirm step transition is announced.
- [ ] **NVDA pass on Windows Firefox/Chrome** — same flow. NVDA's heading-jump (H key) should land on every chapter title on the homepage. Currently it won't (see "Visible headings are divs").
- [ ] **VoiceOver iOS** — confirm the mobile gate is announced; confirm the resume link is reachable.
- [ ] **200% browser zoom** — open the homepage and a lesson. Verify nothing overflows horizontally, the floating glass pill doesn't cover content, the IDE remains usable.
- [ ] **400% / reflow at 320 CSS px** — stricter zoom (SC 1.4.10 Reflow). The desktop-only IDE layout is already gated; verify the homepage `<h1 class="t-hero">` (clamp 64-120px) doesn't horizontal-scroll.
- [ ] **High contrast / Forced Colors mode** (Windows) — verify `outline` survives, `bg-ink-*` colors are replaced by system colors without losing structure. The double-ring focus uses `box-shadow` which doesn't respect Forced Colors — that's a known WCAG concern.
- [ ] **Dragon NaturallySpeaking voice command** — try "click run", "click submit fix", "click continue" on a lesson page. Voice control depends on visible accessible names; many buttons have lowercase text labels which should work.
- [ ] **CodeMirror keyboard escape** — verify `Tab` inside the editor inserts a tab character, but `Escape` then `Tab` exits to the next focusable element (run button). If `Escape`+`Tab` doesn't work, that's a soft keyboard trap.
- [ ] **`prefers-reduced-motion` end-to-end** — set the OS setting; verify all animations stop including any not yet caught (the conic-gradient ring update, any future SVG path animations, transition timings on cards).
- [ ] **Pyodide loading state announcement** — `PersistentIDE.tsx:286-291` shows "loading wasm…" visibly. With AT, is that announced? It's not in a live region.

---

## Remediation priority

### Immediate (Blockers — fix before any further launch push)
1. Collapse the duplicate `<main id="main">` in `LessonShell.tsx`.
2. Add visible + AT-announceable wrong-answer feedback to `FillBlankStepView`.
3. Add step-transition announcement on lesson `router.push`.
4. Scope the IDE `⌘↵` and BrainDump `⌘↵` and StepFooter `⌘↵` keybindings to their containers, not `window`.
5. Replace the reorder grip "grab" with the native up/down buttons or implement WAI-ARIA listbox-rearrange properly.
6. Add `aria-label` to the CodeMirror editor and to the run-output region.

### Short-term (Serious — next sprint)
7. Promote `<div class="t-h2">` and `<div class="t-h3">` to real `<hN>` elements site-wide.
8. Down-shift markdown `#` headings inside step bodies via `rehype` so the lesson sr-only h1 is the canonical h1.
9. Migrate every `text-ink-600` for *text content* to `text-ink-500`. Audit every `text-green-700`-as-text.
10. Remove `focus:outline-none` from all input fields. Trust the global rule.
11. Add `aria-label` to each StreakWidget icon. Same for any other icon-only chip.
12. Add focus trap + focus restoration to the mobile drawer (mirror `LoginToSave`).
13. Replace `<aside>` with `<div>` in `LessonShell` (the inner `<nav>` is the landmark).
14. Restructure the IDE output `aria-live` so it announces a status string, not the whole pre-block.

### Ongoing (Moderate — backlog)
15. Resolve `<kbd>` glyph announcement. Add `aria-label` expansions.
16. Add `aria-controls` to drawer/menu triggers.
17. MultipleChoice → real `<input type="radio">` or full ARIA radio-group keyboard pattern.
18. Decorative `text-ink-700` placeholders in step-status icons → `aria-hidden` and visual noise reduction.

### Process
19. Add an axe-core / pa11y automated check to CI for the homepage, curriculum, and one representative lesson route.
20. Run a manual keyboard + VoiceOver pass before each launch tweet — this audit is static-analysis only and will miss interactive bugs.
