# Accessibility Audit — WCAG 2.2 AA + keyboard + screen reader

Auditor: AccessibilityAuditor
Standard: WCAG 2.2 Level AA + practical AT testing
Scope: live site at https://promptdojo.pages.dev — read every interactive component file in `~/Developer/code-killa/app` and `~/Developer/code-killa/components`. No automated tool was run; review is source-level + spec compliance.

The bar I held the build to: an NVDA / VoiceOver user can complete a full lesson without barriers, tab order is logical sitewide, focus is always visible, no ARIA spam.

Headline: foundation is solid (focus canon, motion-reduce wired, ARIA live regions on most submit panels, semantic landmarks on `/` and `/learn/v2`). Most issues are **fixable in a single sitting** — landmark wrapping, a few aria-currents, and one contrast violation on chapter-done text.

## Methodology + scope

What I checked, file by file:

- `app/globals.css` (focus canon, contrast tokens, motion)
- `app/layout.tsx`, `app/page.tsx`, `app/onboarding/page.tsx`, `app/learn/_chrome/LearnChromeShell.tsx`
- `components/SiteHeader.tsx`, `LoginToSave.tsx`, `BrainDump.tsx`, `FollowOnXPill.tsx`, `GitHubStatsPill.tsx`, `Wordmark.tsx`, `StreakWidget.tsx`, `StatStrip.tsx`, `HeroBugSnippet.tsx`
- `components/v2/PersistentIDE.tsx`, `LessonShell.tsx`, `LessonStepClient.tsx`, `ChapterNav.tsx`, `CourseProgress.tsx`, `StepFooter.tsx`, `ProgressHairline.tsx`, `HomeClient.tsx`
- All step views: `ReadStepView`, `MultipleChoiceStepView`, `FillBlankStepView`, `WriteStepView`, `FixBugStepView`, `ReorderStepView`, `PredictStepView`, `CheckpointStepView`, `_HintReveal`
- `components/CodeEditor.tsx` (legacy v1 path)

Out of scope (would need live AT session): screen reader announcement timing on Pyodide stdout, focus visibility inside CodeMirror's `oneDark` theme on real devices, mobile pinch-zoom (not blocked by source — needs viewport meta verification on rendered HTML).

## Critical violations (block AA compliance)

### C1 — `<SiteHeader>` is not inside any landmark
**WCAG 1.3.1 Info and Relationships, 2.4.1 Bypass Blocks**
**Files**: `app/layout.tsx:23`, `components/SiteHeader.tsx:14`
SiteHeader renders a bare `<div>` directly under `<body>` containing the about link, GitHub pill, course progress, login, and X follow. Screen reader users get four interactive elements with no landmark context, and there is no skip link to bypass them on every page.
**Fix**: wrap with `<header role="banner">` (or just `<header>` at top level) in `SiteHeader.tsx:15`. Add a `<nav aria-label="site">` inside for the right-side cluster of four pills.

### C2 — No skip-to-content link
**WCAG 2.4.1 Bypass Blocks (Level A)**
**File**: `app/layout.tsx:19-29`
Every page begins with up to five interactive header items before main content. Keyboard / screen-reader users have to tab through them on every navigation. None of those tab into a `<main>` either, so there is no JS workaround.
**Fix**: prepend a visually-hidden-until-focus skip link in `RootLayout`:
```tsx
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 dojo-btn-primary">skip to content</a>
```
Then add `id="main"` to the page-level `<main>` in `app/page.tsx:91`, `app/onboarding/page.tsx:161`, `app/about/page.tsx:94`, `app/learn/v2/[chapter]/page.tsx:84`, `app/changelog/page.tsx:28`. Lesson page (`LessonShell.tsx:59`) already uses `<main>` — just add `id`.

### C3 — Lesson page has no `<h1>`
**WCAG 1.3.1 Info and Relationships, 2.4.6 Headings and Labels**
**File**: `components/v2/LessonStepClient.tsx:151-185` (header block)
The lesson chrome uses `t-mono-meta` spans for breadcrumb + step counter, and the step-prompt area uses markdown that may or may not start with a heading. There is no `<h1>` on a lesson route — every step page is heading-orphaned. NVDA's `H` quick-nav goes nowhere.
**Fix**: render an `<h1 className="sr-only">{lesson.title} — step {stepIndex + 1} of {totalSteps}</h1>` inside the header in `LessonStepClient.tsx` around line 156, before the breadcrumb row. Visible heading hierarchy stays untouched.

### C4 — `chapterDone` chapter title fails contrast
**WCAG 1.4.3 Contrast Minimum**
**File**: `components/v2/ChapterNav.tsx:79`
Completed chapters render in `text-green-700` (`#186b46`) on `bg-ink-900` (`#18181b`). That's ≈ **2.3:1** — well below 4.5:1 required for normal text. The same color is reused at lines 94, 148, 152, 197, and in step views' "passed" success line (`MultipleChoiceStepView.tsx:134`, `FillBlankStepView.tsx:160`, `WriteStepView.tsx:93`, `FixBugStepView.tsx:108`, `ReorderStepView.tsx:168`).
**Fix**: replace `text-green-700` with `text-green-400` (`#34d399` ≈ 9.0:1) for any text role; keep `text-green-700` only for non-text decoration like dimmed Check icons. If the design wants the muted-success feel, `text-green-500` (`#2aa06a` ≈ 5.0:1) clears AA.

### C5 — Modal close on backdrop click without focus return / focus trap
**WCAG 2.4.3 Focus Order, 2.1.2 No Keyboard Trap (inverse — escape exists, but focus management broken)**
**File**: `components/LoginToSave.tsx:172-274`
Dialog has `role="dialog" aria-modal="true"` and `aria-labelledby` (good). But:
- **No focus trap.** Tab from inside the dialog moves into hidden page content behind the backdrop. AT users lose place.
- **No Escape handler.** The "[ esc ]" button label is a lie — Escape doesn't close it. Only clicking the backdrop or the button does.
- **No focus return.** When the modal closes, focus disappears (browser default = body). The trigger button is no longer focused.
- The `autoFocus` on the input (line 216) is good but doesn't compensate.

**Fix**:
1. Add `useEffect` on `open` that listens for Escape and calls `setOpen(false)`.
2. Save `triggerRef = useRef<HTMLButtonElement>()`, attach to the open button (line 153). On close, call `triggerRef.current?.focus()`.
3. Add focus trap — easiest: import a small util (`focus-trap-react` ~3kb) or scope a tab-cycle handler that finds first/last focusable in the panel and wraps. The hand-rolled version is ~25 lines.

Same defects in `BrainDump.tsx:57-117`: Escape works (line 21) but no focus trap, no focus return, the Brain button (`bottom-4 right-4`) loses focus relationship.

## Major issues

### M1 — Active nav items have no `aria-current`
**WCAG 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value**
**Files**: `components/v2/ChapterNav.tsx:142-153` (lesson link), `:162-176` (step link)
The chapter nav highlights the active lesson with `text-green-400` and the active step with `bg-ink-800 text-green-400`. Visual only — no `aria-current="page"` or `aria-current="step"`. Screen readers don't announce "current."
**Fix**: add `aria-current={isActiveLesson ? "page" : undefined}` to the lesson `<Link>` at line 142, and `aria-current={here ? "step" : undefined}` to the step `<Link>` at line 162. Same for chapter button at line 71 (`aria-current={isActive ? "page" : undefined}`).

### M2 — Onboarding step indicator is decorative-only for AT
**WCAG 1.3.1 Info and Relationships, 4.1.2**
**File**: `app/onboarding/page.tsx:167-178`
The five-bar progress indicator has `aria-label="step ${step+1} of 5"` on the wrapper but the bars themselves are bare `<span>`s. That's actually fine semantically, but there's no `role="progressbar"` with `aria-valuenow/min/max`. Screen reader hears the label once at focus (and the wrapper isn't focusable, so it never announces).
**Fix**: change wrapper to `<div role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={5} aria-label="onboarding progress">` at line 167. Keep the bars as decorative.

### M3 — IDE tablist tabs miss `aria-controls` and arrow-key nav
**WCAG 4.1.2 Name, Role, Value (ARIA Authoring Practices: Tabs pattern)**
**File**: `components/v2/PersistentIDE.tsx:223-248`
The file tab strip uses `role="tablist"` with `role="tab"` and `aria-selected`, which is good. Missing:
- No `aria-controls={panelId}` on each tab — screen reader doesn't know which panel a tab governs.
- No matching `role="tabpanel"` + `id={panelId}` + `aria-labelledby={tabId}` on the editor container at line 250.
- **No arrow-key navigation between tabs.** The Tabs pattern requires Left/Right arrows to move between tab buttons, and Tab to move into the panel. Currently Tab cycles through every tab (annoying with multi-file lessons).
**Fix**: assign `id`/`aria-controls` pairs, add a `role="tabpanel"` wrapper around the CodeMirror at line 250-272, and add `onKeyDown` handler on tabs for ArrowLeft/ArrowRight to move focus + activeName.

### M4 — Run-button "ready" state never announces to AT
**WCAG 4.1.3 Status Messages**
**File**: `components/v2/PersistentIDE.tsx:273-283`
The status line ("Booting Python", "press Run or use ⌘↵") changes silently. Screen readers won't know when Pyodide is ready — a blind learner clicks Run and nothing seems to happen for ~5s.
**Fix**: add `role="status"` (or `aria-live="polite"`) to the wrapping `<div>` at line 274. The output panel at line 334 already has `aria-live="polite"` — same pattern.

### M5 — Run-button keyboard shortcut not labeled to AT
**WCAG 2.4.4 Link Purpose, 4.1.2**
**File**: `components/v2/PersistentIDE.tsx:287-310`
The Run button shows `<kbd>⌘↵</kbd>` visually. `aria-keyshortcuts="Meta+Enter Control+Enter"` is set (line 296) — ✓. But the global `keydown` listener in `useEffect` at line 178-188 fires from `window`, so a screen reader on the lesson rail can trigger Run from anywhere. That's a feature, but it isn't documented in the lesson header. NVDA users won't know about `⌘↵` because the kbd hint is inside a button they may never reach.
**Fix**: in `LessonStepClient.tsx:196-199`, the footer hint already says "⌘↵ runs the editor" for AT users. Good. But `BrainDump.tsx:50-56` and `LessonStepClient` lessons should also expose `⌘⇧B` similarly. Add an `<sr-only>` "Press Command Shift B to park a thought" to the floating button at `BrainDump.tsx:49-56`.

### M6 — `❯` and `_` chevron/cursor characters read aloud
**WCAG 1.3.1 Info and Relationships**
**Files**: `Wordmark.tsx:31`, `Wordmark.tsx:44-46`, `SiteHeader.tsx:20`, `app/page.tsx:178`, `CourseProgress.tsx:48`, `BrainDump.tsx:78` (etc.)
The `❯` chevron is decorative branding. Screen readers announce it as "right-pointing angle bracket" or "chevron right". Same for the `_` blinking cursor (announced as "low line"). These spans have no `aria-hidden`.
- `Wordmark.tsx:44`: `<span className="text-green-500">❯</span>` — needs `aria-hidden="true"`. The wrapping span has `aria-label="promptdojo"` already, so child characters should hide.
- `Wordmark.tsx:46`: `<span className="cursor-blink text-green-500">_</span>` — `aria-hidden="true"`.
- `Wordmark.tsx:31`: mark variant — same.
- `SiteHeader.tsx:20`: `<span className="text-green-500">❯</span>` inside the about link — `aria-hidden="true"` (the link text "what is this?" is sufficient).
- `app/page.tsx:178`: `▸` summary toggle — `aria-hidden="true"`.
- `CourseProgress.tsx:48`: `❯` — `aria-hidden="true"`.

### M7 — Stat strip uses `·` separators read as "middle dot"
**WCAG 1.3.1 (loose)**
**File**: `components/StatStrip.tsx:29-41`
"23 chapters · 624 steps · 8–15h · MIT · last commit ..." — the dots get announced. Wrapping spans with `aria-hidden="true"` keeps the visual cadence and silences AT.

### M8 — Drawer toggle button label flips with state but state never announced
**WCAG 4.1.3**
**File**: `components/v2/LessonShell.tsx:92-111`
The mobile drawer button toggles `aria-label="Show prompt"` ↔ "Show editor". Good. But the panes themselves don't communicate hidden state — both have classes that flip `hidden lg:flex`, so on mobile the hidden one is `display: none`. That's correct (browser hides from AT). The bigger issue: there's no announcement that the active pane changed. A blind user presses the button and the page reflows silently.
**Fix**: add `aria-pressed={drawerOpen}` and `aria-controls="lesson-prompt lesson-editor"` to the button. Add matching `id` on each `<section>`.

### M9 — Form input lacks visible label on `BrainDump`
**WCAG 1.3.1, 3.3.2 Labels or Instructions**
**File**: `components/BrainDump.tsx:78-94`
There's an `sr-only` label ✓, but the textarea has only a placeholder for sighted users. Placeholders disappear when typing, so re-entering the field offers no context. Acceptable here because the brain-dump is a low-criticality scratchpad, but per voice the dialog title says "brain dump" — that already labels the input. **Lower priority — leave as-is unless you want belt-and-suspenders.**

### M10 — `LoginToSave` email input has no visible `<label>` element
**WCAG 1.3.1, 3.3.2, 4.1.2**
**File**: `components/LoginToSave.tsx:212-228`
Input only has `placeholder="you@somewhere.dev"` and lives next to a `<p>` description. No `<label htmlFor=…>`. The description (line 200-203) is not programmatically tied to the input via `aria-describedby`.
**Fix**:
```tsx
<label htmlFor="lts-email" className="sr-only">your email</label>
<input id="lts-email" aria-describedby="lts-desc" ... />
```
And give the description `id="lts-desc"`. Error message at line 231 needs `id="lts-error"` + `aria-describedby` swap when in error, plus `role="alert"` so it announces immediately.

### M11 — Reorder step's drag UI has no `aria-grabbed` semantics
**WCAG 4.1.2 (ARIA Authoring Practices: Drag-and-drop)**
**File**: `components/v2/steps/ReorderStepView.tsx:99-117`
The grab button uses `aria-pressed={isGrabbed}` — workable but not standard. ArrowUp/Down move on the grab button only, never reaches the parent `<li>`. Up/Down arrows ✓. But there is no announcement of the new position when items reorder.
**Fix**: when an item moves, set a small offscreen live region with text like "moved to position 3 of 5". Either add a `<div role="status" className="sr-only" aria-live="polite">` to the component or attach `aria-live` to the `<ol>` itself.

### M12 — `prose` body link color marginal
**WCAG 1.4.3**
**File**: `app/globals.css:93`
Markdown links use `--color-green-400` (`#34d399`) on `--color-ink-300` paragraph text. That's link color on body bg `#14140f` ≈ 9.0:1 ✓ for the text, but link-vs-surrounding-text contrast (1.4.1 Use of Color requires a non-color signal) is met because links are also underlined ✓. **Pass** — keeping note as deliberate.

## Minor issues / polish

- `app/page.tsx:121,128`: arrows `→` and `↓` in CTAs already wrapped in `<span aria-hidden>` ✓ on first, but the CTA at line 207 (`that's all 624 →`) in `LessonStepClient.tsx` has unwrapped `→`. Wrap.
- `components/v2/CourseProgress.tsx:48,56`: `❯` and `~` are ornament — wrap.
- `components/StreakWidget.tsx:26-46`: relies on `title=` for full meaning ("3-day streak (longest 5)"). `title` is keyboard-inaccessible per WCAG 1.3.1 best practice. Surface "3 day streak, longest 5" as `aria-label` on the wrapper span.
- `components/HeroBugSnippet.tsx:11`: `<pre>` has `aria-label="ai-shipped python bug"` — but the explanation div at line 29-32 isn't tied to it. Fine, but consider `<figure>` + `<figcaption>` for proper semantics.
- `app/page.tsx:174-180`: `<details>/<summary>` is keyboard accessible by default ✓. The chevron `▸` should be `aria-hidden`.
- `components/BrainDump.tsx:51`: `title=` for the brain-dump trigger is a hint, not a label. `aria-label="park a thought (Cmd Shift B)"` is better.
- `app/page.tsx:124-128`: `<a href="#chapters">` jumps to the chapter section, but the `<section>` at line 164 has no `id="chapters"` — the in-page anchor is broken.
- `components/v2/StepFooter.tsx:138`: `<kbd>⌘↵</kbd>` color is `text-ink-950/70` on a green button — that's `rgb(20,20,15)` at 70% on `#2aa06a` ≈ 3.5:1. Marginal; fine for icon-sized text but avoid using as primary text.
- `components/LoginToSave.tsx:267-270`: footnote uses `text-ink-600` (`#6e6e76`) on `bg-ink-900` (`#18181b`) ≈ 3.3:1. Below 4.5:1 for normal text. Either bump to `text-ink-500` or call this "decorative metadata" and accept the spec gap. Same pattern at `app/page.tsx:202` (footer text-ink-600 on body), though body bg is darker so contrast is 3.5:1 — still failing.
- `components/v2/LessonShell.tsx:48`: drawer initial state depends on `window.innerWidth`. SSR vs client mismatch on small screens flickers. Hydration mismatches can confuse AT — add `suppressHydrationWarning` or render the toggle button only after mount.

## Per-component audit

| Component | Keyboard | Focus visible | Labeled | ARIA | Contrast | Verdict |
|---|---|---|---|---|---|---|
| `SiteHeader` | ✓ | ✓ (canon) | ✓ | ✗ no landmark | ✓ | **Major** (C1) |
| `Wordmark` | n/a | n/a | partial | ✗ chevron read | ✓ | **Minor** (M6) |
| `FollowOnXPill` | ✓ | ✓ | ✓ link text | ✓ | ✓ green-400 on green-950 ≈ 9:1 | Pass |
| `GitHubStatsPill` | ✓ | ✓ | ✓ aria-label | ✓ | ✓ | Pass |
| `LoginToSave` button | ✓ | ✓ | ✓ aria-label | ✓ | ✓ | Pass |
| `LoginToSave` modal | ✗ no trap, no escape | ✓ | ✗ input unlabeled | partial | ✓ | **Critical** (C5, M10) |
| `BrainDump` button | ✓ | ✓ | partial (title only) | ✓ aria-label needed | ✓ | Minor |
| `BrainDump` panel | ✓ | ✓ | ✓ sr-only label | partial | ✓ | Minor (no focus trap) |
| `CourseProgress` | n/a | n/a | ✗ no label on bar | ✗ chevron read | ✓ | Minor |
| `StreakWidget` | n/a | n/a | ✗ title-only | partial | ✓ | Minor |
| `PersistentIDE` tablist | partial (no arrows) | ✓ | ✓ aria-label | partial | ✓ | **Major** (M3) |
| `PersistentIDE` Run button | ✓ | ✓ | ✓ | ✓ aria-busy/keyshortcuts | ✓ | Pass |
| `PersistentIDE` output | ✓ scroll | ✓ | ✓ live region | ✓ aria-live | ✓ | Pass |
| `PersistentIDE` status line | n/a | n/a | ✗ silent | ✗ no live | ✓ | **Major** (M4) |
| CodeMirror editor | ✓ (built-in) | ✓ (oneDark cursor) | ✓ default | ✓ | needs runtime check on theme tokens | Likely pass |
| `ChapterNav` | ✓ | ✓ | ✓ truncated titles still labeled | ✗ no aria-current | ✗ green-700 contrast | **Critical** (C4, M1) |
| `LessonShell` drawer | ✓ | ✓ | ✓ aria-label flips | ✗ no aria-pressed/controls | ✓ | Minor (M8) |
| `LessonStepClient` header | n/a | n/a | ✗ no h1 | n/a | ✓ | **Critical** (C3) |
| `LessonStepClient` continue | ✓ | ✓ | ✓ | partial | ✓ | Pass |
| `MultipleChoiceStepView` | ✓ digits 1-9 + Enter | ✓ | ✓ radiogroup | ✓ aria-checked, aria-live | ✗ green-700 success | Major |
| `FillBlankStepView` | ✓ Enter submits | ✓ | ✓ aria-label per blank | ✓ aria-live | ✗ green-700 success | Major |
| `WriteStepView` | ✓ | ✓ | ✓ | ✓ aria-live | ✗ green-700 success | Major |
| `FixBugStepView` | ✓ | ✓ | ✓ | ✓ aria-live | ✗ green-700 success | Major |
| `ReorderStepView` | ✓ Up/Down arrows | ✓ | partial | ✗ no live announce on move | ✓ | Major (M11) |
| `StepFooter` hints | ✓ | ✓ | ✓ aria-label | ✓ aria-keyshortcuts | ✓ | Pass |
| `HintReveal` | ✓ | ✓ | ✓ | ✓ | ✓ amber-100 on amber-700/5 ~10:1 | Pass |
| `HeroBugSnippet` | n/a | n/a | ✓ aria-label | n/a | ✓ | Pass |
| Onboarding screens | ✓ | ✓ | ✓ fieldset/legend | ✗ no progressbar role | ✓ | Minor (M2) |

## Keyboard navigation map

### Home `/`
1. Skip link (**missing** — C2)
2. About link "what is this?"
3. GitHub stats pill (external link, new tab)
4. CourseProgress (decorative, no focus)
5. Login to save button
6. Follow on X (external)
7. StreakWidget (no focus, decorative)
8. h1 (not focusable)
9. "start chapter 1" CTA → `/learn/v2/variables/naming-things/0`
10. "or pick your chapter ↓" anchor → broken (no `#chapters` target)
11. HomeClient resume card (single Link)
12. Three info cards (decorative)
13. PhaseBandedRail chapter tiles
14. Legacy `<details>` summary → expand → 28 legacy chapter links
15. Footer changelog link
16. BrainDump floating button (always at end of body)

**Order is logical.** No traps. Focus visible everywhere via `globals.css:343-354` canon. Skip link is the one missing piece.

### Lesson `/learn/v2/{ch}/{lesson}/{n}`
1. Skip link (missing)
2. Header pills (about, GitHub, progress, login, X)
3. Sidebar `Wordmark` link (home)
4. Sidebar chapter buttons (collapsed)
5. Active chapter expands → lesson links → step links (active step inline)
6. Daily-goal dial button
7. Lesson breadcrumb chapter link
8. Step prompt area (markdown — links/code copy buttons if any)
9. Step-specific submit / check / hint / skip buttons
10. Continue button
11. IDE: file tabs (Tab cycles each — no arrow nav per M3)
12. CodeMirror editor (Tab into → Tab out via Escape per default keymap)
13. Run button (`⌘↵` global shortcut also fires)
14. Output panel (scrollable, focusable for keyboard scroll)
15. Drawer toggle (mobile only)
16. BrainDump floating button

**Breaks**:
- Tab order through 4 file tabs is annoying with multi-file lessons (M3)
- No `aria-current` so AT users navigating the chapter rail by Tab don't know which step is current (M1)
- CodeMirror's "Escape to exit edit mode" is not documented in UI; learners may feel trapped in the editor

### Modal `LoginToSave` (open)
1. autoFocus on email input ✓
2. Tab → Save button
3. Tab → "forget my email" button (when present)
4. Tab → **escapes the modal entirely** (focus leaks to header) — C5 break
5. Escape key → does nothing — C5 break

### Onboarding `/onboarding`
1. Wordmark link
2. Step indicator (decorative)
3. Welcome → Start CTA
4. Goal screen → 4 buttons (Tab cycles, Enter picks; no arrow-nav between options — listbox semantics not used, treated as buttons, OK)
5. Level screen → same shape
6. Personalization → 4 inputs in fieldset, skip link, continue
7. Daily goal → 4 buttons, continue
**Clean.** No traps. Logical.

## Screen reader story

What a NVDA user hears on the home page:
> "promptdojo, free interactive python course, web page. Banner — wait, no, just main." [no `<header>` landmark wrapping site header] "Link, what is this. Right-pointing angle bracket. Link, 23 stars on GitHub, last commit two days ago. Right-pointing angle bracket. 47 slash 624. Region. Tilde 7 percent. Button, login to save progress. Link, follow at TFisPython on x." [pages of receipts and dashes]

Goal: clean it up so the sequence becomes:
> "Skip to content, link. Banner. Link, what is this. Link, 23 stars on GitHub, last commit two days ago. Region, course progress, 47 of 624. Button, login to save progress. Link, follow at TFisPython on x. Main. Heading level 1, ai writes this. it's wrong."

What an NVDA user hears on a lesson:
> "Step 3 of 8. Naming things. Region, prompt." [no h1 — C3 break]

Should be:
> "Heading level 1, naming things, step 3 of 8. Region, prompt. Heading level 2, [step prompt heading]."

What VoiceOver hears on `MultipleChoiceStepView` after submitting wrong answer:
> "Live region: not that one." ✓
> But the option that flipped to "incorrect" has no announcement of *why* it was wrong unless `option.explain` is filled. The disabled state announces. Decent.

What happens when CodeMirror is focused: the editor announces "edit, multi-line, code, blank" — good. CodeMirror 6 ships with an off-screen aria-live announcer for line/column moves, so navigating the buffer announces fine. Syntax token color contrast inside `oneDark` is the editor library's responsibility — verify on real device but `oneDark` is generally compliant.

## Reduced motion

Animations in the codebase:
1. **Cursor blink** (`globals.css:135-145`) — 1 Hz hard step. **✓ respected** at line 143-145.
2. **Skeleton pulse** (`globals.css:365-376`) — 1.6s ease-in-out. **✓ respected** at line 374-376.
3. **Loader2 spin** (Lucide icon, `animate-spin`) used in `PersistentIDE.tsx:281,304,327` and `CodeEditor.tsx:129,144`. **✓** — `motion-reduce:animate-none` applied at PersistentIDE; **✗ missing** at `CodeEditor.tsx:129,144` (legacy v1 path — lower priority but real user can hit `/learn/{slug}` legacy routes).
4. **Progress bar transitions** (`LessonStepClient.tsx:234`, `ProgressHairline.tsx:51`) — `motion-reduce:transition-none` ✓.
5. **Chevron rotation** (`app/page.tsx:177`, `details/summary` group-open) — uses Tailwind `transition` without motion-reduce gate. Minor.
6. **Card hover transitions** (`globals.css:240-269`) — 140ms color/border transitions. Per spec these are below the threshold for vestibular concern. Pass.
7. **Skeleton in `HomeClient.tsx:41`** — uses `.skeleton` class which respects motion ✓.

Verdict: **strong**. Brand heartbeat (cursor blink) is the right thing to gate first, and you did. One legacy `Loader2` lacks the gate; everything else is correct.

## Top 10 a11y moves to ship

Ranked by impact × ease:

1. **Add skip-to-content link** — `app/layout.tsx:22` prepend `<a className="sr-only focus:not-sr-only ..." href="#main">skip to content</a>`; add `id="main"` to every `<main>`. (C2, 5 min)
2. **Wrap `SiteHeader` in `<header>` + add nav landmark** — `components/SiteHeader.tsx:15` change wrapping div to `<header>`, wrap right-side cluster in `<nav aria-label="site">`. (C1, 3 min)
3. **Add `<h1 className="sr-only">` to lesson chrome** — `components/v2/LessonStepClient.tsx:156` insert before breadcrumb. (C3, 2 min)
4. **Replace every `text-green-700` text use with `text-green-400`** — 9 files (`ChapterNav.tsx`, all five step views, etc.). Use replace_all on the codebase: `text-green-700` → `text-green-400` for text contexts; verify Check icons stay `text-green-700` for muted decoration. (C4, 10 min)
5. **Fix LoginToSave modal: focus trap + Escape + return focus** — `components/LoginToSave.tsx:172-274`. Add Escape handler in useEffect, save trigger ref, return focus on close, install `focus-trap-react` or hand-roll. (C5, 30 min)
6. **Add `aria-current="page"` / `"step"` to ChapterNav links** — `components/v2/ChapterNav.tsx:71,142,162` wherever an active item is highlighted. (M1, 5 min)
7. **Make IDE tablist a real WAI-ARIA tabs widget** — `components/v2/PersistentIDE.tsx:223-272` add `aria-controls`, `role="tabpanel"`, ArrowLeft/Right keyboard handler. (M3, 25 min)
8. **Wrap decorative `❯` `_` `▸` `→` in `aria-hidden="true"`** — site-wide ornament cleanup. Search for those literal characters in JSX. (M6, 10 min)
9. **Add `aria-live="polite"` to PersistentIDE status line** — `components/v2/PersistentIDE.tsx:274` add `role="status"` to wrapping `<div>`. (M4, 1 min)
10. **Properly label the LoginToSave email input** — `components/LoginToSave.tsx:212` add `<label htmlFor="lts-email" className="sr-only">your email</label>`, `id="lts-email"`, `aria-describedby="lts-desc"` + matching id on the description, `role="alert"` on error. (M10, 5 min)

Total: ~95 minutes of work to clear every Critical and most Major issues. After that, a NVDA learner can complete a lesson without barriers.

## What's working well

- **Focus canon (`globals.css:343-354`)**: one rule, double-ring on buttons/links, sharp corners. Best-in-class.
- **Reduced-motion respect**: cursor blink, skeleton, transitions all gated. Brand-defining motion is the first thing to gate, and it is.
- **`aria-live="polite"` on every step view's submit feedback**: 7 of 8 step types announce results correctly.
- **Lucide icons inside buttons with text**: never bare-icon buttons in primary actions — text always present.
- **`aria-busy` on Run button while running**: `PersistentIDE.tsx:295`. Correct pattern.
- **Form input `autoComplete="email"` / `inputMode="email"`** on LoginToSave: helps password managers and mobile keyboards.
- **Onboarding fieldsets with `<legend className="sr-only">`**: real form semantics.
- **Modal `aria-labelledby` + `aria-modal="true"`**: structurally correct, just needs focus management fixes.
- **Heading hierarchy on `/`**: single h1 (line 102), h2s for sections.
- **Lessons sidebar uses `<nav>`** (`ChapterNav.tsx:54`): real landmark.
- **CodeMirror is built on accessible primitives**: passes basic AT smoke tests by default.

The hardest part of accessibility is the foundation, and the foundation here is solid. The findings above are largely surface fixes on a structurally sound build.
