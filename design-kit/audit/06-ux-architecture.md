# UX Architecture Audit
**Auditor:** ArchitectUX (UX Specialist #2)
**Scope:** Information architecture, navigation, interaction patterns, state, CSS architecture, components, responsive, perf, loading/error states, Pyodide UX
**Date:** 2026-05-05

---

## Site map (current)

```
/                                              app/page.tsx                 — landing (home)
/onboarding/                                   app/onboarding/page.tsx      — 5-step profile capture
/learn/                                        app/learn/layout.tsx         — wraps both v1 + v2
  /learn/[chapter]/                            app/learn/[chapter]/page.tsx — LEGACY chapter index
  /learn/[chapter]/[lesson]/                   app/learn/[chapter]/[lesson]/page.tsx — LEGACY lesson
  /learn/v2/[chapter]/                         app/learn/v2/[chapter]/page.tsx — chapter overview (or 302 to lesson 1 step 0 if no overview)
  /learn/v2/[chapter]/[lesson]/                app/learn/v2/[chapter]/[lesson]/page.tsx — 302 → /0/
  /learn/v2/[chapter]/[lesson]/[stepIndex]/    app/learn/v2/[chapter]/[lesson]/[stepIndex]/page.tsx — actual step
/og/launch/[name]                              app/og/launch/[name]/route.tsx — OG image generation
```

**Issues:**
1. `/learn/v2/...` — `v2` is **a leaked implementation detail** in every step URL. It's the thing the user shares on Twitter, the thing Google indexes, and the thing they read in the address bar. From the user's perspective there is no v1 — they're just learning Python.
2. `/learn` is **redundant**. Every URL the user actually navigates to starts with `/learn/v2/...`. The `/learn/` prefix carries no meaning ("learn what?" — Python, which is the entire site).
3. The `[stepIndex]` segment is a **0-based integer**. Sitemap entries (`app/sitemap.ts:26`) are `…/lesson-slug/0/`, `…/lesson-slug/1/`. Users sharing "step 3" intuitively expect `…/3/`, not `…/2/`. Off-by-one in the URL.
4. **Two parallel content systems** are shipped. `/learn/[chapter]/[lesson]/` (LessonClient) is still in `app/page.tsx:184-211` as a `<details>` "Legacy 28-chapter course" disclosure, sitemapped at priority 0.3, and registered in `app/learn/layout.tsx:5-13`. Dead weight; cognitive overhead in the layout shell (`LearnChromeShell.tsx:23-26` exists only to suppress chrome on the v2 segment).
5. The chapter-overview redirect path (`app/learn/v2/[chapter]/page.tsx:65-68`) uses Next's `redirect()` — at static-export time this is a real 302 served by Cloudflare from an HTML meta-refresh (`trailingSlash: true` makes this a directory redirect). On slow networks the user sees a flash of blank.
6. There is no `/lesson/...` shortcut for resume — the deepest URL is the only way to land on a step. No way to deep-link to "current lesson" without reading localStorage.

## Site map (proposed)

```
/                                home (already good — keep)
/start                           /onboarding (rename — verb, half the syllables, search-friendly)
/[chapter]/                      chapter overview (e.g., /variables/)
/[chapter]/[lesson]/             lesson lands on step 1 (e.g., /variables/naming-things/)
/[chapter]/[lesson]/[step]/      step (1-indexed, e.g., /variables/naming-things/3/)
```

**What this changes:**
- Drops `/learn/` (zero info value), drops `/v2/` (implementation leak).
- 1-indexed step numbers — match the visible "3 / 9" UI.
- `/start` is what users will actually type / link to.
- Legacy 28-chapter route (`/learn/[chapter]/...`) is **deleted entirely**, not "kept around as an Easter egg" (see "files to delete" below).

**Migration:**
- Generate a static redirect map in `public/_redirects` (Cloudflare native): `/learn/v2/* /:splat 301` and `/learn/* / 301`.
- The `[stepIndex]` 0→1 shift is a one-time tax; ship it before any organic traffic accumulates. Internal links live in 4 files: `LessonStepClient.tsx:134`, `ChapterNav.tsx:138/162`, `app/learn/v2/[chapter]/page.tsx:67/115/138`, `HomeClient.tsx:91`. Plus content cross-refs in `lib/generated/v2/...`.

---

## Navigation system audit

### What's there
- **Global home link**: top-left wordmark in `V2ChapterNav.tsx:55-60` (lesson page) and `OnboardingPage:163-168`. Inconsistent — one is `promptdojo / python for builders`, the other is just `promptdojo`.
- **Sidebar chapter nav**: `components/v2/ChapterNav.tsx` — collapsed accordion, only the active chapter expands.
- **In-lesson breadcrumb**: `LessonStepClient.tsx:152-159` shows `CHAPTER TITLE   3 / 9` in the step header. No back-to-chapter link, no chapter→home crumb.
- **Continue/Finish CTA**: `LessonStepClient.tsx:179-191`. On the last step, "Finish" hard-routes to `/` (`:131`). No "next chapter" interstitial.
- **Resume card**: `HomeClient.tsx` — landing page island that reads `lastVisitedV2`.
- **Mobile drawer toggle**: `LessonShell.tsx:92-111` — bottom-bar "Show prompt / Show editor" toggle on `<lg`.

### What's missing
1. **Nothing visible above the sidebar.** No header on lesson pages — the sidebar IS the chrome. There is no top bar with logo + streak + settings. The streak widget (`StreakWidget.tsx`) only renders on the legacy `/learn/[chapter]/...` shell (`LearnChromeShell.tsx:36`) and on `/` — a v2 lesson page never shows it. Users can't see their streak while learning.
2. **No back-to-chapter.** The sidebar has the chapter as a clickable accordion header but it just toggles the accordion (`ChapterNav.tsx:71-72`), it doesn't navigate. There is no link back to `/learn/v2/[chapter]/` (the overview).
3. **No "previous step" affordance.** Forward-only. A user who skipped past something has no UI to go back — they have to click the step in the sidebar (which is fine on desktop, invisible on mobile).
4. **No mobile sidebar.** `LessonShell.tsx:56` — `<aside className="hidden ... lg:flex ...">`. On mobile/tablet, the only navigation is the prompt/editor toggle. To switch chapters or lessons on mobile, you must navigate to `/` and start over.
5. **No settings entry point.** `dailyGoalMinutes`, `reducedMotion`, `soundEnabled`, `name`, `flavor.*` are written once during onboarding (`app/onboarding/page.tsx:91-103`) and have no UI to edit afterward. The onboarding URL `/onboarding` still works, but it overwrites profile state instead of editing it.
6. **No global search.** 624 steps + 22 chapters and no way to jump to a known concept.
7. **No keyboard shortcut hint** other than the `⌘↵` kbd on Continue. No `?` overlay.

### Concrete proposal
- **Add `components/v2/TopBar.tsx`** — slim 44px header on every lesson page with: logo (→ `/`), breadcrumb (`Variables → Naming things`), streak widget, daily-goal dial, settings cog. Mounts inside `LessonShell.tsx` above the `<main>` row. Frees up vertical space currently wasted on the sidebar header (`ChapterNav.tsx:54-61`).
- **Make the chapter accordion header navigate**, not just toggle. Use a `<Link>` with a chevron-only toggle to its right. Files: `ChapterNav.tsx:70-94`.
- **Add `Prev step` button** in `LessonStepClient.tsx` footer alongside Continue. Disable on step 0.
- **Add a mobile sidebar drawer** (slide-in from left, hamburger in TopBar). Reuse `LessonShell.tsx`'s drawer state machine but split into two axes — vertical (prompt/editor) and horizontal (sidebar/main).
- **Add `/settings`** — same form components as `/onboarding`, prefilled. Single new file: `app/settings/page.tsx`.

---

## Interaction patterns

| Pattern | Current implementation | Inconsistencies | Proposed canonical |
|---|---|---|---|
| **Primary CTA button** | `bg-ember-500 text-ink-950 hover:bg-ember-400 rounded-md px-4 py-2 text-sm font-medium` — copy-pasted in 7 step views (`WriteStepView.tsx:70-71`, `FixBugStepView.tsx:85-86`, `PredictStepView.tsx:88-89`, `FillBlankStepView.tsx:147-148`, `MultipleChoiceStepView.tsx:122-123`, `CheckpointStepView.tsx:80-81`, `ReorderStepView.tsx:154-155`, `LessonStepClient.tsx:184-187`) | Footer button uses `disabled:bg-ink-800` — step views don't | Extract `<Button variant="primary">` in `components/ui/Button.tsx` |
| **Secondary text-link CTA** | `WriteStepView.tsx:81` ("Show solution →"), `LessonStepClient.tsx:124` ("← Back to all chapters"), home page footnote (`app/page.tsx:131`) | All slightly different — `text-xs text-ink-500 underline-offset-2 hover:underline`, vs `text-xs text-ember-400`, vs `text-xs text-ink-500 hover:text-ink-300` | Single `<Link variant="ghost">` |
| **Code run** | `⌘↵` shortcut + Run button. Bound twice — `PersistentIDE.tsx:178-188` AND `StepFooter.tsx:55-66` (StepFooter is wired but never mounted; see "files to delete") | Two separate listeners on `keydown`. If `StepFooter` ever ships, ⌘↵ does both run AND continue. | Single shortcut handler in IDE; footer "Continue" uses different chord (e.g., `⇧↵`). |
| **Lesson advance** | "Continue →" button in `LessonStepClient.tsx:179-191` calls `handleContinue` → `router.push` | "Read" steps mark themselves correct on click (`LessonStepClient.tsx:118-129`); other steps require an `onAttempt({correct:true})` from the step view | Document the "read auto-acks on continue" rule; consider lifting it into `StepRouter` so step views never need to emit synthetic attempts |
| **Chapter pick (home)** | Cards link to `/learn/v2/${slug}` if `hasOverview`, else `/learn/v2/${slug}/${firstLesson}/0` (`app/page.tsx:141-145`) | Two-tier link logic baked into the home page. Means a chapter without an `overview.md` jumps the user past the "intro" beat, but the URL no longer has a stable mental model | Always link to chapter root; have chapter root render a fallback hero if no overview |
| **Progress save** | Auto, every step attempt, every keystroke (drafts), into `localStorage` under two keys | No visible "saved" indicator anywhere | Subtle `Saved · 2s ago` text in TopBar |
| **Onboarding step** | Click-advance: GoalScreen and LevelScreen advance on pick (`app/onboarding/page.tsx:121-122, 132-133`), Personalization waits for explicit Continue | Two paradigms in five screens. Pick-advance is faster but skips the "did I want that?" beat | Pick to highlight, explicit Continue to advance — match form patterns the user has used elsewhere |
| **Hint reveal** | `_HintReveal.tsx` (used by step views) AND `StepFooter.tsx:38-66` (orphan) | Two implementations | Delete `StepFooter.tsx` (see below) |
| **Back-to-home** | `LessonStepClient.tsx:131` — `router.push("/")` after the last step. ChapterNav wordmark also links to `/`. | "Finish" silently resets context. No celebration, no "you finished Variables" beat | Add a chapter-completion screen at `/learn/v2/[chapter]/complete` |

---

## State management audit

### localStorage keys + shapes (from `lib/storage.ts`)

| Key | Schema | Written by | Read by |
|---|---|---|---|
| `promptdojo:progress:v1` | `GlobalProgress` (`lib/storage.ts:5,30-47`) — legacy | `setLesson`, `BrainDump`, `viewStreak` updates | `ChapterNav` (legacy), `StreakWidget`, `LessonClient`, `BrainDump` |
| `promptdojo:progress:v2` | `ProgressV2` (`lib/storage.ts:133-148`) | every v2 step attempt, lesson start/complete, profile, lastVisited | `V2ChapterNav`, `LessonStepClient`, `HomeClient`, `DailyGoalDial` |

### What's persisted
- v2: `userId` (random UUID), `profile` (name/goal/level/flavor/dailyGoalMinutes/reducedMotion/soundEnabled), every step's `attempts[]` (full payload, code, correctness, timestamps), per-lesson started/completed/abandoned timestamps, streak (current/longest/embers/frozenFlames/totalXp/todayXp), `conceptsTouched[]`, `completedChapters[]`, `lastVisitedV2`, code drafts (`StepProgress.draft` — currently NEVER WRITTEN; see `setStepDraft` is exported but unused. Drafts in `PersistentIDE.tsx:104-138` live in React state and are **lost on reload**).
- v1 only: `brainDump[]`.

### What isn't persisted (but should be)
1. **Code drafts in v2.** `setStepDraft` exists (`storage.ts:278-294`) but is never called. `PersistentIDE.tsx` keeps drafts in `useState` (`:104-106`) — refresh the page mid-write and your code is gone.
2. **IDE active tab.** `activeName` (`PersistentIDE.tsx:107-108`) resets to `files[0]` on every step nav.
3. **Sidebar accordion state.** `openChapter` (`ChapterNav.tsx:37`) resets to `activeChapter` every render. If you have Variables open and click a Loops lesson, your context disappears.
4. **Brain dump.** Only on v1 key — v2 storage doesn't carry it forward (`storage.ts:23` puts it on FRESH which is the v1 shape).

### Cross-device story
**There is none.** All state is local to the browser. Implications:
- A user who starts on phone and continues on laptop loses everything — onboarding, streak, progress.
- "Free forever, no signup" is a real product principle (per `BRAND.md` direction). Crossing that line is a strategic decision.
- Bridge available without auth: **export/import progress JSON** as a one-click button in /settings. Two power-user-grade buttons solve 80% of the cross-device pain without a backend. Wire to `loadProgressV2` / `saveProgressV2`.

### Resume-where-I-left-off UX
- `HomeClient.tsx:42-55` reads `lastVisitedV2`, falls back to `{variables, naming-things, 0}`.
- Branching: no `name` → "Get started" CTA. Has name + lastVisited → "Welcome back, Ch X · {title}". Has name, no lastVisited → silent fallback to Variables ch01 (`HomeClient.tsx:53-54`). The "has name but no lastVisited" branch shows "welcome back" copy without ever having visited a lesson — confusing.

### Proposal
1. **Wire `setStepDraft`** in `PersistentIDE.tsx:147-154` (`handleChange`) — debounce 500ms.
2. **Persist `openChapter` and `activeName`** to a new `ui` slice on `ProgressV2` (does not pollute the schema-versioned data).
3. **Add export/import** in /settings.
4. **Fix the "has name, no lastVisited" branch** — distinguish from real returning users; show "Pick up where you left off (Variables, ch01)" instead of "welcome back".
5. **Add a `Saved · N seconds ago` indicator** in TopBar, fed by a single shared "lastSavedAt" state.

---

## CSS architecture audit

### tokens.css vs globals.css consistency
**`design-kit/tokens.css` is never imported.** Grep returns zero references in `app/` or `components/`. It exists as documentation only; the actual runtime tokens are duplicated in `app/globals.css:3-37` as Tailwind's `@theme {}` block.

This means:
- The "source of truth" file (`tokens.css:2-7` claims it is) is shadow-truth.
- Any token added to `tokens.css` doesn't take effect unless also added to `globals.css`.
- They are **already out of sync**:

| Token | tokens.css | globals.css | Diff |
|---|---|---|---|
| `--ink-500` | `#71717a` | `#8a8a93` | globals bumped for WCAG (correct, but tokens.css is wrong) |
| `--ink-600` | (missing) | `#6e6e76` | only in globals |
| `--ink-50` | (missing) | `#fafafa` | only in globals |
| `--ink-200` | (missing) | `#e4e4e7` | only in globals |
| `--color-paper` | (missing) | `#F7F4ED` | only in globals |
| `--color-signal` | (missing) | `#5BC8AF` | only in globals (used in `ChapterNav.tsx:78,93,151` via `text-signal`) |
| `--ember-500` (vs `--ember`) | `--ember: #F2683C` | `--color-ember-500: #F2683C` | naming collision |
| Motion easings | Defined | Missing entirely | not usable as classes |
| Durations | Defined | Missing entirely | not usable as classes |
| Radii (`--radius-sm/md/lg/xl`) | Defined | Missing | components use Tailwind `rounded-md` etc., bypassing tokens |

### Use of CSS vars vs Tailwind vs hardcoded
- **Components** use Tailwind utility classes throughout (`bg-ink-950`, `text-ember-400`, `border-ink-800`). 230 token usages across `components/v2` and `app/`. Good — consistent with the `@theme` block.
- **OG image routes** (`app/og/launch/[name]/route.tsx:11-21`, `app/learn/v2/[chapter]/opengraph-image.tsx:14-18`, `twitter-image.tsx`) hardcode hex values. This is correct for ImageResponse (no Tailwind in @vercel/og), BUT they don't import the canonical color values — they re-typed them. Drift risk.
- **`design-kit/tokens.css`** has motion + radii tokens that are used nowhere in code. If a designer wants to use `var(--ease-slam)` or `var(--dur-snap)`, they can't — those names don't exist in the running stylesheet.

### Where the system breaks down
- **`app/globals.css:14`**: `--color-ink-500: #8a8a93` — comment says "bumped for WCAG AA". But `tokens.css:15` is still `#71717a`. Designers reading the brand kit will spec failing contrast.
- **`app/globals.css:32`**: `--color-signal: #5BC8AF` — has no equivalent in `tokens.css`. Used in `ChapterNav.tsx:78` (`text-signal`) and `DailyGoalDial.tsx:77` (via `var(--color-signal)`).
- **`PersistentIDE.tsx:5`**: imports `oneDark` from `@codemirror/theme-one-dark`. CodeMirror has its own color system that doesn't honor `--color-ink-*`. The editor-vs-prompt visual delta you see is partly this.

### Concrete cleanup plan
1. **Make `tokens.css` the single source.** Add the missing color tokens (`--ink-50/200/600`, `--color-paper`, `--color-signal`, `--color-ember-50…950`). Add a comment block at top of `globals.css` saying "DO NOT EDIT TOKENS HERE — see tokens.css".
2. **Either import tokens.css into globals.css** (`@import "../design-kit/tokens.css";` then use the `--ink-*` names directly in `@theme { --color-ink-X: var(--ink-X); }`), OR codegen the `@theme` block from `tokens.json`. Pick one.
3. **Add a CodeMirror theme** at `lib/codemirror-theme.ts` that maps `--color-ink-*` and `--color-ember-*` so the editor matches the page chrome.
4. **Centralize the OG colors** in `lib/og-tokens.ts` — exported constants, imported by the three route files.
5. **Add `var(--ease-*)` and `var(--dur-*)` to the @theme block** (Tailwind 4 supports `--transition-timing-function-*` and `--transition-duration-*`). Then `transition` classes can use brand easings.

---

## Component pattern library

### Inventory (lines = approx complexity)
**Active v2 components (`components/v2/`):**
- `LessonShell.tsx` (114) — page layout: sidebar + prompt + ide
- `LessonStepClient.tsx` (325) — orchestrates a step (load profile, handle attempts, advance)
- `PersistentIDE.tsx` (370) — CodeMirror + tabs + run + output
- `StepRouter.tsx` (91) — discriminated union over `step.type`
- `StepFooter.tsx` (157) — **ORPHAN** (see below)
- `ChapterNav.tsx` (206) — sidebar nav
- `HomeClient.tsx` (118) — resume card
- `DailyGoalDial.tsx` (116) — ring widget
- `steps/_grader.ts` — grading logic
- `steps/_HintReveal.tsx` (73) — reveal-next hint pattern
- `steps/_placeholder.tsx` (23) — fallback
- `steps/{Read, Mc, Fill, Predict, Fix, Write, Reorder, Checkpoint}StepView.tsx` — 8 step types

**Legacy components (`components/`):**
- `LessonClient.tsx` (56), `LessonView.tsx` (67), `CodeEditor.tsx` (155), `OutputPane.tsx` (68), `ChapterNav.tsx` (106), `ResumeCard.tsx` (59), `SessionTimer.tsx` (24)
- `BrainDump.tsx` (117), `StreakWidget.tsx` (47), `PyodidePreloader.tsx` (48) — these are SHARED, used on home page and v2.

### Duplicates / one-offs
1. **Two ChapterNav components.** `components/ChapterNav.tsx` (legacy v1) vs `components/v2/ChapterNav.tsx`. Different progress models, different shapes, different visuals.
2. **Two lesson layouts.** `components/LessonClient.tsx` 3-column grid vs `components/v2/LessonShell.tsx` sidebar+2-column grid. Both ship.
3. **StepFooter.tsx is orphaned.** Searched: no file imports `StepFooter` from `components/v2/StepFooter.tsx`. The lesson page footer is hand-rolled inline at `LessonStepClient.tsx:172-191`. StepFooter is 157 lines of dead code that was clearly the planned canonical footer (XP bar, hint cycler, skip, continue) but never wired.
4. **Primary button** — see Interaction Patterns table above. 7 copies of the same Tailwind string.
5. **Card pattern** — `rounded-lg border border-ink-800 bg-ink-950 p-{4,5,6}` appears: home page chapter cards (`app/page.tsx:114, 168, 196`), HomeClient resume card (`HomeClient.tsx:69, 100` with extra ember gradient), lesson list (`app/learn/v2/[chapter]/page.tsx:134`), onboarding option cards (`app/onboarding/page.tsx:237, 274, 381`). 8+ uses, no shared component.
6. **Progress bar** — `LessonStepClient.tsx:205-221` and `StepFooter.tsx:91-105`. Two implementations.
7. **Status pill** (passed/failed reason banner) — `WriteStepView.tsx:87-104`, `FixBugStepView.tsx`, `PredictStepView.tsx`, `MultipleChoiceStepView.tsx`. Same shape, copy-pasted.

### Recommended canonical set (`components/ui/`)
```
ui/Button.tsx         primary | secondary | ghost
ui/Card.tsx           default | accent (ember gradient) | option (selectable)
ui/ProgressBar.tsx    value, max, optional label
ui/StatusBanner.tsx   pass | fail variants
ui/TextLink.tsx       internal Link wrapper with consistent styling
ui/Kbd.tsx            <kbd> with consistent border + bg
ui/Field.tsx          label+input pair (already inline in onboarding:405)
```
~250-400 lines total to write, removes ~600 lines of duplicated Tailwind strings and unifies hover/focus states.

---

## Responsive strategy

### Breakpoints in use
Tailwind defaults: `sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`. Codebase uses primarily `sm:` and `lg:`. Almost no `md:` or `xl:`.

### Mobile gaps
1. **Sidebar invisible on mobile** (`LessonShell.tsx:56`, `ChapterNav.tsx`). The only nav on `<lg` is the prompt/editor toggle. To switch lessons or chapters, users must navigate back to `/`.
2. **Two-column main collapses to single column on `<lg`** (`LessonShell.tsx:59`). The prompt-editor toggle (`:92-111`) is the only way to switch. At 1023px the toggle bar shows but the desktop two-column layout was almost there — the breakpoint forces the entire flow to mobile mode for what is functionally a small-laptop viewport.
3. **Onboarding** — `app/onboarding/page.tsx:308`. Personalization grid is `sm:grid-cols-2`, fine. Daily goal is `sm:grid-cols-4` from `grid-cols-2`. On 320px-wide phones the option cards crowd.
4. **Home cards** — `sm:grid-cols-2 lg:grid-cols-3` (`app/page.tsx:136`). Fine.
5. **Header on home is `flex items-end justify-between`** (`app/page.tsx:63`). `StreakWidget` floats top-right; the hero text wraps under it on `<sm`. The layout doesn't `flex-col sm:flex-row`.
6. **`100dvh`** is used (`LessonShell.tsx:54`, `app/learn/v2/[chapter]/page.tsx:74`) — good. Avoids the iOS Safari `100vh` bug.

### Recommended baseline
- **Mobile-first, three real breakpoints**: `<640` phone, `640-1023` tablet, `1024+` desktop. Drop `md`-style mid-range optimization unless adding it solves a real layout problem.
- **Sidebar should be a drawer on `<lg`**, not absent. Hamburger in TopBar (proposed above) opens it.
- **Two-column lesson layout starts at `md:` (768)**, not `lg:`. Rationale: tablets have horizontal real estate, the toggle bar UX is jarring at that width.
- **Test rotated phones (812×375) and small tablets (1024×768) explicitly** — that's where the layout currently breaks.

---

## Loading / empty / error states

### Coverage matrix

| State | Where | Coverage |
|---|---|---|
| Initial page load (SSR) | All `app/**/page.tsx` | Static export — no loading state. ✓ |
| Pyodide cold load | `PersistentIDE.tsx:282-283` | "Booting Python (one-time, ~5s)…" copy. ✓ |
| Pyodide warm | `PersistentIDE.tsx:283` | "press Run or use ⌘↵". ✓ |
| Pyodide load failure | `usePyodide.ts` | **NOT HANDLED** — no error path. If wasm fetch fails, status sticks on "loading" forever. |
| Code execution running | `PersistentIDE.tsx:323-329, 342-344` | Spinner + "running…" + "Running your code…". ✓ |
| Code execution timeout | nowhere | **NOT HANDLED** — infinite loops in user code freeze the worker thread (technically the worker, not main thread, but no UI affordance to abort). |
| Code execution error | `PersistentIDE.tsx:354-356` | stderr in rose-400. ✓ |
| Code execution success, no stdout | `PersistentIDE.tsx:345-352` | Friendly "✓ Ran with no output" copy. ✓ Best handled state on the site. |
| Step view loading | `HomeClient.tsx:57-64` | Skeleton card on `state === "loading"`. ✓ for the resume card. Step views render synchronously from already-loaded data. ✓ |
| Empty progress (new user) | `HomeClient.tsx:66-87` | Onboarding CTA. ✓ |
| Step not found (404) | `app/learn/v2/[chapter]/[lesson]/[stepIndex]/page.tsx:61, 64` | `notFound()`. Default Next.js 404. **No custom not-found.tsx.** |
| Profile load on lesson page | `LessonStepClient.tsx:61-80` | Initial render uses `FRESH_PROFILE`, swapped in `useEffect`. **Flash of generic content** — `interpolate()` runs against fresh profile, then re-runs with real one. User sees `pets = ["luna"]` flicker to `pets = ["fluffy"]` on first paint. |
| ChapterNav initial state | `ChapterNav.tsx:36` | `progress = null`, suppresses all completion checkmarks until effect runs. Quiet, but means the nav looks "all incomplete" briefly. |
| StreakWidget initial | `StreakWidget.tsx:23` | Returns `null` until effect runs. **Layout shift** in header. |
| DailyGoalDial initial | `DailyGoalDial.tsx:58-67` | Empty placeholder ring. ✓ |
| Brain dump | `BrainDump.tsx` | None — opens empty if no items, fine. |

### Proposed coverage additions
1. **Pyodide load failure** — wire a `status === "error"` branch in `usePyodide`, render a "Python wouldn't load. Refresh, or use a different browser." banner over the IDE with a retry button.
2. **Long-running code abort** — add a "Stop" button that posts `{type:"reset"}` to the worker; worker terminates and reboots Pyodide. Currently the only escape is full page refresh.
3. **`app/not-found.tsx`** — branded 404 with home link.
4. **Suppress generic-profile flash** — render the prompt panel only after the profile effect resolves. Or pass `profile` via cookies into the SSR (impossible with `output: "export"`, so: gate prompt rendering on a `mounted` boolean).
5. **StreakWidget skeleton** — render an invisible spacer of equal width while loading, prevents header reflow.

---

## Pyodide UX

### Current load experience
- Pyodide files (~12MB) served same-origin from `/pyodide/*` with `Cache-Control: max-age=31536000` (`public/_headers`). Good — first cold load ~5-10s on broadband, repeat visits ~instant.
- `PyodidePreloader.tsx` mounts on home + onboarding. Uses `requestIdleCallback` (Safari fallback to 200ms `setTimeout`) to spawn a Worker that calls `init`. The worker is a singleton via `lib/use-pyodide.ts:14-23`, so when LessonStepClient eventually mounts PersistentIDE, the worker is already warm.
- IDE shows "Booting Python (one-time, ~5s)…" with spinner during load.
- Run button is **always enabled** during load — clicking queues, worker awaits `ensurePyodide()` internally (`PersistentIDE.tsx:158-161` comment). Smart — avoids the "broken on first impression" disabled state.

### Failure modes
1. **No fallback if Worker is blocked.** The PyodidePreloader catches Worker construction errors silently (`PyodidePreloader.tsx:31-33`). The lesson page's `lib/use-pyodide.ts:15-22` also throws synchronously and is not wrapped in a try/catch in `usePyodide`. A user with a Worker-blocking browser extension sees nothing useful.
2. **No timeout on init.** If `pyodide.asm.wasm` fetch hangs, "Booting Python" persists indefinitely.
3. **No version mismatch handling.** `_headers` notes "force-refresh must still revalidate after a pyodide version bump" but if a stale worker.js calls a pyodide-lock.json from a newer release, behavior is undefined.
4. **Network-aware loading absent.** A user on a metered cellular connection downloads 12MB on first home-page visit just because `PyodidePreloader` is mounted. No `connection.saveData` check.
5. **No telemetry.** No way to know whether real users see the cold-load failure mode.

### Proposed improvements
1. **Defer preload on cellular.** In `PyodidePreloader.tsx`, gate on `(navigator as any).connection?.effectiveType !== "slow-2g" && !navigator.connection?.saveData`. Saves bandwidth for users who are just browsing the home page.
2. **Add a 30s init timeout.** If `usePyodide` doesn't see "ready" within 30s, set `status === "error"` and render an actionable message in PersistentIDE.
3. **Surface a copy-line during cold load that's grounded** — current copy is "Booting Python (one-time, ~5s)…". On 3G it's 30s. Either add a progress bar (Pyodide doesn't natively expose progress) or change copy to "Booting Python (~5s on broadband, longer on slow networks)".
4. **Move PyodidePreloader off the home page**, onto onboarding only. Home-page visitors who bounce never wanted the wasm. Move the warm-up to start on `/onboarding` mount AND on the chapter card hover (intent signal). Saves ~12MB for ~70% of landing-page traffic.
5. **Add a banner offering "this site needs WebAssembly"** when worker construction fails.

---

## Quick architectural wins (< 1 day each)

1. **Delete `components/v2/StepFooter.tsx`** (157 lines, never imported). Confirmed orphan via grep. Search for ghosts across `app/` + `components/`. Frees a load-bearing-looking file from the canonical components list. Net: -157 lines, zero behavior change.
2. **Wire `setStepDraft` into `PersistentIDE.handleChange`** (`PersistentIDE.tsx:147-154`). Two lines. Code drafts now survive reload. Massive trust gain for "I typed for 10 minutes and refreshed."
3. **Make ChapterNav accordion header navigate.** Two-line change in `ChapterNav.tsx:70-94` — make the chapter row a `<Link>` with a chevron toggle to its right. Restores back-to-chapter-overview navigation.
4. **Sync `tokens.css` with `globals.css` and add a top-of-file warning.** Add `--color-signal`, `--color-ember-50/100/200/300/400/600/700/800/900/950`, `--color-paper`, fix `--ink-500`. ~30 minutes. Eliminates the "tokens.css lies" trap for future designers.
5. **Move PyodidePreloader from home to onboarding only.** One-line change in `app/page.tsx:62` (delete) and `app/onboarding/page.tsx:161` (already there). Save ~12MB of bandwidth per landing-page bounce.
6. **Add `app/not-found.tsx`** — branded 404 with home link. ~20 lines.
7. **Custom redirects for `/learn/v2/*` → `/*`** in `public/_redirects`. Cloudflare Pages native, ~10 lines. Decouples the URL clean-up from the route refactor.

## Strategic architectural bets (week-scale)

1. **IA refactor: drop `/learn/v2/`.** New routes `/[chapter]/[lesson]/[step]/`, 1-indexed. Static redirects from old paths. Touches: 4 component files, sitemap, route layout, all `<Link>` hrefs. Deliverable: shareable URLs that read like a book chapter, not a release branch.
2. **Component library extraction (`components/ui/`).** Button, Card, ProgressBar, StatusBanner, TextLink, Kbd, Field. ~400 lines of new code; deletes ~600 lines of duplicated Tailwind strings; future step types take half the time to author.
3. **Top bar + mobile drawer.** New `components/v2/TopBar.tsx` + drawer toggle in `LessonShell`. Settings entry point, breadcrumb, streak everywhere, mobile chapter nav. Unlocks mobile as a real experience instead of a "phone-emergency" surface.
4. **Settings page + export/import.** New `app/settings/page.tsx`. Reuse onboarding form components, prefill from profile. Add JSON export/import buttons that round-trip `ProgressV2`. Cross-device works without auth, without backend.
5. **Delete the legacy 28-chapter system.** `app/learn/[chapter]/...` + `components/Lesson{Client,View}.tsx`, `CodeEditor.tsx`, `OutputPane.tsx`, `ResumeCard.tsx`, legacy `components/ChapterNav.tsx`, `lib/storage.ts:promptdojo:progress:v1`, all v1 manifest content under `lib/generated/manifest.json`, the `<details>` accordion in `app/page.tsx:184-211`, the v1 chapter dirs `01-getting-started` through `17-inheritance-and-dunders` (or move them to a `legacy-content/` archive). Also simplifies `LearnChromeShell.tsx` (no more `if segment === "v2"` carve-out). Net deletion: ~600+ lines + 17 chapter directories.

## Files that should be deleted, consolidated, or refactored

**Delete outright** (orphan or legacy):
- `components/v2/StepFooter.tsx` (157 lines) — orphan, not imported
- `components/LessonClient.tsx`, `components/LessonView.tsx`, `components/CodeEditor.tsx`, `components/OutputPane.tsx`, `components/ResumeCard.tsx`, `components/SessionTimer.tsx`, `components/ChapterNav.tsx` — legacy v1 stack (~480 lines)
- `app/learn/[chapter]/page.tsx`, `app/learn/[chapter]/[lesson]/page.tsx` — legacy v1 routes
- `app/learn/_chrome/LearnChromeShell.tsx` — exists only to suppress chrome on `/learn/v2/*`; with v1 gone and v2 promoted to `/`, the entire shell collapses to a no-op
- `app/learn/layout.tsx` — same reason; if v2 → root, `app/layout.tsx` is enough
- 01-getting-started through 17-inheritance-and-dunders chapter directories — legacy v1 content (or move to `legacy-content/` for git history)

**Consolidate:**
- 7 step view "primary button" copies → `components/ui/Button.tsx`
- Card class strings (8+ uses across home, lesson list, onboarding) → `components/ui/Card.tsx`
- Two progress-bar implementations (`LessonStepClient.tsx:205-221`, `StepFooter.tsx:91-105`) → `components/ui/ProgressBar.tsx`
- Hex color constants in three OG image files → `lib/og-tokens.ts`
- `design-kit/tokens.css` and `app/globals.css` `@theme` block — pick one source of truth, codegen the other (or `@import` it directly)

**Refactor:**
- `app/learn/v2/[chapter]/[lesson]/[stepIndex]/page.tsx` → `app/[chapter]/[lesson]/[step]/page.tsx`, 1-indexed step
- `components/v2/LessonStepClient.tsx` (325 lines) — split: orchestration (state, attempts, advance) stays here; `<ProgressBar>` and inline footer button extract to `ui/`
- `components/v2/PersistentIDE.tsx` (370 lines) — fine for now; consider extracting the OutputPanel sub-tree (lines 314-358) when adding Stop/abort
- `lib/storage.ts` (384 lines) — solid, but split into `storage/v1.ts` (legacy) and `storage/v2.ts` once v1 is deleted

---

**Total proposed deletion:** ~1,200 lines, 17 chapter directories.
**Total proposed addition:** ~600 lines (component library + top bar + settings + redirects).
**Net:** smaller codebase, simpler IA, real mobile experience, durable cross-device story.
