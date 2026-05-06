# Code Quality + Refactor Audit

## Summary (TL;DR)

The codebase is architecturally sound and noticeably above the "solo hacker weekend project" baseline. The schema is Zod-validated end-to-end, immutable patterns are used consistently in storage helpers, the discriminated union on `Step.type` is correctly propagated through the whole stack, and the build pipeline degrades gracefully. The primary debt is **duplication across step views** — `WriteStepView`, `CheckpointStepView`, and `FixBugStepView` share ~70% of their bodies with no shared primitive, and the submit-button styling pattern repeats verbatim in at least 5 files using ad-hoc Tailwind rather than the `dojo-btn-primary` class already defined in globals.css.

The secondary concern is **two storage systems living at the same address**: v1 `GlobalProgress` and v2 `ProgressV2` share `lib/storage.ts`, share `StreakState`, but use different event names and keys. `awardPass()` writes v1 `GlobalProgress` while the entire learn UI reads v2 `ProgressV2`. This split is intentional per the comments but means streak XP awarded during a lesson does **not** appear in the v2 `streak.todayXp` or `DailyGoalDial` — a silent data correctness bug. The event-bus pattern (custom DOM events) works, but `ProgressV2.lastSeenAt` is stamped on every `updateProgressV2` write, meaning it reflects the last *any* field changed — not the last time the user was on-screen, which is semantically wrong.

---

## Top 5 Architectural Risks

### 1. `awardPass()` writes v1 streak; v2 UI reads v2 streak — XP is silently lost
**File**: `lib/streaks.ts:64` — `awardPass()` calls `updateProgress` (v1), updating `GlobalProgress.streak`. `DailyGoalDial` reads `loadProgressV2().streak.todayXp` (v2). The v2 streak is never updated when a step is passed.  
**Hurts when**: The daily-goal dial always shows 0 min even as the user completes steps. The streaks.ts v1 functions are vestigial in the v2 learning flow. Any user who has only used v2 routes will never have `streak.current > 0` shown in `DailyGoalDial`.  
**Timeline**: Shipping now. Every `awardPass()` call in `LessonStepClient.tsx:103` silently discards the XP from the v2 progress store.

### 2. Duplicate schema definition between `lib/content/schema.ts` and `scripts/build-content-v2.mjs`
**Files**: `lib/content/schema.ts:1-107` and `scripts/build-content-v2.mjs:48-185`. Every step type, grader type, and base field is defined twice. The build script explicitly comments "keep in sync with lib/content/schema.ts."  
**Hurts when**: A step type gains a new field. Author edits `schema.ts`. Forgets to mirror the change in the build script. The build script emits un-validated output; the Zod parse in `content-v2.ts:38` (`JSON.parse(raw) as Chapter`) has no runtime Zod guard, so a schema drift goes undetected until a rendering crash.  
**Timeline**: The next time a new step field is added.

### 3. `getV2Chapter` casts JSON without runtime validation
**File**: `lib/content-v2.ts:38` — `const chapter = JSON.parse(raw) as Chapter`. The generated JSON is Zod-validated at build time, but the cast is a type assertion, not a Zod parse. If the build script and the schema drift (risk #2), or if a generated file is corrupted, this will crash with an unhelpful runtime error at lesson render.  
**Hurts when**: A deploy ships a partially-written chapter JSON file (e.g., interrupted build). All lessons in that chapter become a hard crash.

### 4. Module-level worker singleton in `use-pyodide.ts` is not teardown-safe
**File**: `lib/use-pyodide.ts:14-23`. `workerSingleton` is a module-level variable. In development, Next.js hot-reloads modules but the old Worker is never terminated. Multiple `usePyodide()` instances each attach their own `message` listener to the same singleton worker, so results can route to the wrong component. There is no mechanism to drain pending runs on unmount.  
**Hurts when**: Hot reload in dev leaves ghost listeners. Two IDE components on the same page (if that ever happens) share one worker and corrupt each other's run results via `pendingRef`.

### 5. `LoginToSave` duplicates localStorage key constants that also live in `storage.ts`
**File**: `components/LoginToSave.tsx:7-9`. `PROGRESS_KEY = "promptdojo:progress:v2"` and `PROGRESS_EVENT = "promptdojo:progress-v2"` are hard-coded strings here, separate from `KEY_V2` and the event name in `lib/storage.ts:6-7`. If either key or event name changes in `storage.ts`, `LoginToSave` will silently write to and listen on the wrong key.  
**Hurts when**: The key is migrated to v3. The save/load component silently continues using the old key, and synced data is read from/written to a stale store.

---

## Refactor Opportunities (High ROI)

### A. Extract `useSubmitStep` hook — collapses 200+ lines of duplication across 3 step views

**The pattern**: `WriteStepView`, `CheckpointStepView`, and `FixBugStepView` share an identical state machine:
```
[submitting, submitted, solutionRevealed, hintsUsed, startedAtRef]
useEffect reset on step.id
handleSubmit: setSubmitting → ide.run() → gradeRunResult → onAttempt
```
- `components/v2/steps/WriteStepView.tsx:22-55`
- `components/v2/steps/CheckpointStepView.tsx:21-55`
- `components/v2/steps/FixBugStepView.tsx:22-61`

**Proposed factoring**:
```ts
// components/v2/steps/_useSubmitStep.ts
export function useSubmitStep(
  step: { id: string; grader: Grader; personalize: boolean },
  ide: StepIDEBridge,
  onAttempt: (a: StepAttempt) => void,
  opts?: { solutionRevealedFlag?: boolean }
): {
  submitting: boolean;
  submitted: { passed: boolean; reason?: string } | null;
  solutionRevealed: boolean;
  setSolutionRevealed: (v: boolean) => void;
  hintsUsed: number;
  setHintsUsed: Dispatch<SetStateAction<number>>;
  handleSubmit: () => Promise<void>;
}
```
**Files touched**: `WriteStepView.tsx`, `CheckpointStepView.tsx`, `FixBugStepView.tsx`, new `_useSubmitStep.ts`  
**Effort**: 2–3h. Low risk — pure extraction, no behavior change.

### B. Replace ad-hoc submit-button Tailwind with `dojo-btn-primary`

**The pattern**: Every code-graded step view renders this button with inline classes:
```tsx
// WriteStepView.tsx:66-72, CheckpointStepView.tsx:78-84, FixBugStepView.tsx:83-90
className={cn(
  "rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-ink-950 transition",
  "hover:bg-green-400",
  "disabled:cursor-not-allowed disabled:bg-ink-800 disabled:text-ink-500",
)}
```
`globals.css` already defines `.dojo-btn-primary` with identical semantics but with the correct sharp corners (`border-radius: 0`) and mono uppercase. These buttons use `rounded-md` instead, creating a visual inconsistency with every other primary button on the site.

**Fix**: Replace the three inline className strings with `className="dojo-btn-primary"`.  
**Files touched**: `WriteStepView.tsx`, `CheckpointStepView.tsx`, `FixBugStepView.tsx`, `MultipleChoiceStepView.tsx:121-127`  
**Effort**: 30min. Zero logic change.

### C. Export storage key constants from `storage.ts`; consume in `LoginToSave`

**The pattern**: `LoginToSave.tsx:7-9` re-declares `promptdojo:progress:v2` and `promptdojo:progress-v2` as local constants. `storage.ts:6-7` owns the canonical values.

**Fix**:
```ts
// lib/storage.ts — add exports
export const PROGRESS_KEY_V2 = "promptdojo:progress:v2";
export const PROGRESS_EVENT_V2 = "promptdojo:progress-v2";
```
Then import in `LoginToSave.tsx`.  
**Files touched**: `lib/storage.ts`, `components/LoginToSave.tsx`  
**Effort**: 15min.

### D. Merge build scripts into one entry point

**The pattern**: `package.json:6` runs `build-content.mjs && build-content-v2.mjs` as a sequential chain. Both scripts share the same `REPO` path resolution, `existsSync`-based graceful no-op, `mkdir` for `lib/generated`, and a `main().catch(exit(1))` wrapper.

**Fix**: A single `scripts/build-content-all.mjs` that imports `main` from each module and runs them sequentially. Reduces the prebuild chain from 4 `node` invocations to 3 (or 2 if `fetch-github-stats` is included). Eliminates drift in shared setup logic.  
**Files touched**: `package.json`, two existing build scripts become importable modules  
**Effort**: 1h.

### E. `LessonStepClient` header IIFE → named component

**The pattern**: `components/v2/LessonStepClient.tsx:151-185` passes `header` to `LessonShell` as an immediately-invoked function expression that computes phase/lessonIndex and returns JSX. This is undebuggable, untestable, and reads poorly.

```tsx
// LessonStepClient.tsx:151
header={(() => {
  const phase = phaseForChapter(chapter.slug);
  const lessonIndex = ...
  return (<div>...</div>);
})()}
```

**Fix**: Extract `<StepHeader chapter={chapter} lesson={lesson} stepIndex={stepIndex} totalSteps={totalSteps} />` as a sibling component or an internal named function component in the same file.  
**Files touched**: `components/v2/LessonStepClient.tsx`  
**Effort**: 30min.

---

## Type Safety Gaps

### 1. `getV2Chapter` casts without validation — silent any
- **File**: `lib/content-v2.ts:38`
- `const chapter = JSON.parse(raw) as Chapter` — `as Chapter` is a lie. The actual shape is `unknown`.
- **Better**: `const chapter = Chapter.parse(JSON.parse(raw))` — use the Zod schema at runtime to catch drift. Import `Chapter` schema from `lib/content/schema.ts`.
- **Migration**: Add a try/catch; on `ZodError`, return `undefined` so routes 404 cleanly.

### 2. `StepAttempt.payload` is `z.unknown()`
- **File**: `lib/content/schema.ts:331`
- The schema-level comment acknowledges this: "keep it loose at the schema level; step renderers know their own shape." The renderers then write untyped objects: `{ kind: "write", code: ... }`.
- **Better**: Export a discriminated union `StepAttemptPayload` from `schema.ts` and use it as the `payload` type. At minimum, define it as a type alias even if Zod validation stays loose.

### 3. `build-content-v2.mjs` is fully untyped JS
- **File**: `scripts/build-content-v2.mjs` — all function parameters are untyped (`loadStep(lessonDir, filename, stepIndex, lessonId)`).
- Converting to `build-content-v2.mts` and adding JSDoc `@param` types or migrating to a TS-first build (via `tsx`) would let the schema import be shared rather than duplicated.
- **Effort**: Medium — requires either `tsx` as a dev dependency or a `tsconfig` that covers scripts.

### 4. `lib/types.ts` has a name collision with `lib/content/schema.ts`
- `lib/types.ts:19` exports `Chapter` (v1 legacy shape). `lib/content/schema.ts:266` exports `Chapter` (v2 Zod shape). Any file that imports from both will have a conflict.
- `app/page.tsx` avoids this by importing from `lib/content` (which wraps v1) and `lib/content-v2` (which wraps v2), but the collision is a trap for any new file.
- **Fix**: Rename `lib/types.ts` exports to `LegacyChapter`, `LegacyExercise`, `LegacyManifest`.

### 5. `workerSingleton` in `use-pyodide.ts` has no error type
- **File**: `lib/use-pyodide.ts:35-42`. The `message` event handler uses `e: MessageEvent<WorkerMsg>` but never handles unexpected message shapes. A malformed worker message (`msg.type` not matching any case) silently does nothing. An `exhaustive-check` default or a Zod parse on the message would surface worker-side bugs during development.

---

## Dead Code to Delete

| File | Reason |
|---|---|
| `components/ChapterNav.tsx` | v1 chapter nav. Used only by `app/learn/[chapter]/page.tsx` (v1 route). Likely orphaned if v1 routes are deprecated. Verify before deleting. |
| `components/LessonClient.tsx` | v1 lesson client. Check if still imported. |
| `components/LessonView.tsx` | v1 lesson view. Same audit needed. |
| `components/CodeEditor.tsx` | v1 code editor. `PersistentIDE` is the canonical editor. |
| `components/OutputPane.tsx` | v1 output pane. Superseded by PersistentIDE's built-in output section. |
| `components/ResumeCard.tsx` | v1 resume card. Inspect usages — likely orphaned. |
| `components/SessionTimer.tsx` | v1 session timer. Check usages. |
| `app/learn/[chapter]/[lesson]/page.tsx` | v1 lesson route. If v1 is being deprecated, this and `app/learn/[chapter]/page.tsx` and `app/learn/layout.tsx` can be removed together. |
| `components/v2/steps/_placeholder.tsx` | Explicit placeholder for unimplemented step views. `StepRouter` now handles all 8 types. The `_placeholder` is no longer used. |
| `out/` directory | Contains `out/pyodide/` which appears to be a stale copy of the build output alongside `public/pyodide/`. If `out/` is the Next.js static export directory, the pyodide files inside it should not be committed. |

---

## State / Event-Bus Review

### Current shape

| System | Key | Event | Writer | Readers |
|---|---|---|---|---|
| v1 progress | `promptdojo:progress:v1` | `promptdojo:progress` | `saveProgress()` | `streaks.ts`, v1 components |
| v2 progress | `promptdojo:progress:v2` | `promptdojo:progress-v2` | `saveProgressV2()` | `HomeClient`, `CourseProgress`, `DailyGoalDial`, `V2ChapterNav`, `LoginToSave` |
| save email | `promptdojo:save-email` | none | `LoginToSave` only | `LoginToSave` only |

### Issues

1. **`awardPass()` and `grantFrozenFlame()` in `lib/streaks.ts` write v1 only** — called from `LessonStepClient.tsx:103,113` which is a v2 component. The v2 streak state (`ProgressV2.streak`) is never updated.

2. **`lastSeenAt` semantics** — `updateProgressV2` stamps `lastSeenAt = new Date()` on every write including draft saves (`setStepDraft`). This means "last seen" actually means "last time anything was written" — tab switches, hint reveals, draft keystrokes. It should be stamped only on navigation events (`setLastVisitedV2`).

3. **`LoginToSave` duplicates the v2 key and event name** (see type safety gap #5 above).

4. **No event for v1 writes** — the v1 event name (`promptdojo:progress`) is broadcast by `saveProgress()` but no current v2 component listens to it. The event can be removed when v1 is retired.

### Proposed cleanup

1. **Migrate streak award to v2**: Move `awardPass()` and `grantFrozenFlame()` to write `ProgressV2.streak` via `updateProgressV2`. Keep v1 equivalents only for v1 routes. This is a correctness fix, not a refactor.

2. **Stamp `lastSeenAt` only in `setLastVisitedV2`**, remove the stamp from `updateProgressV2`. All other callers should not update last-seen.

3. **Export key constants from `storage.ts`** (see refactor C above).

4. **Backward-compat strategy**: v1 and v2 keys are independent; no migration needed. When v1 routes are deleted, delete `KEY`, `FRESH`, `loadProgress`, `saveProgress`, `updateProgress`, `setLesson`, `getLesson`, `exerciseKey` from `storage.ts`. The v1 streak bridge in `loadProgressV2` (`loadProgress()` call at line 188) can be removed at the same time.

---

## Build Pipeline Review

### `scripts/build-content.mjs` (v1 build)
- **What it does**: Walks `~/python-course-2026`, runs `solutions/*.py` via `spawnSync`, emits `lib/generated/manifest.json`.
- **What's fragile**: `spawnSync` with a 10s timeout — if a solution script hangs (infinite loop), it blocks the entire build for 10s per exercise. There is no parallelism.
- **What's missing**: No hash or mtime check — every build re-runs all solution files even if nothing changed. On a 28-chapter course with 5 exercises each, that's up to 140 Python invocations serially.
- **Verdict**: Acceptable for a dev-only path (cloud builds emit an empty manifest). No action needed unless v1 is revived for production use.

### `scripts/build-content-v2.mjs` (v2 build)
- **What it does**: Walks `content/python/`, validates every step via Zod, emits per-chapter JSON and a TOC.
- **What's fragile**: `for (const folder of folders)` — serial chapter loading. For 25 chapters with many lessons each, `Promise.all` would be 5–10x faster. Currently the script reads and validates all steps sequentially.
- **What's missing**: The schema definition is duplicated (see architectural risk #2). No hash check — a full rebuild runs on every `predev`/`prebuild` even when no content changed. Consider writing a `lib/generated/v2/.build-hash` and skipping if content mtime is older.
- **Verdict**: Functional. The duplicate schema is the real risk. Parallelize `loadChapter` calls with `Promise.all` for a build time win.

### `scripts/copy-pyodide.mjs`
- **What it does**: Copies Pyodide runtime files from `node_modules/pyodide` to `public/pyodide/`.
- **What's fragile**: Idempotent (`copyFile` overwrites silently). No size/hash check — copies 100MB+ of Wasm on every `predev` even if pyodide hasn't changed. `python_stdlib.zip` alone is ~40MB.
- **What's missing**: Add an mtime/size guard: if `public/pyodide/pyodide-lock.json` exists and matches `node_modules/pyodide/pyodide-lock.json`, skip the copy.
- **Verdict**: Works. The skip-if-unchanged optimization would meaningfully improve `npm run dev` startup time.

### `scripts/fetch-github-stats.mjs`
- **What it does**: Fetches GitHub repo + commit API, writes `lib/generated/github.json`. Fails silently (exits 0 with null payload).
- **What's fragile**: The repo URL is hard-coded as `xernst/promptdojo` (`line 14`). If the repo moves or is renamed, the script silently emits nulls and the footer stat strip disappears with no build error.
- **What's missing**: Rate limit handling. Unauthed GitHub API allows 60 requests/hour. On rapid rebuild cycles (CI, preview deploys), this limit can be hit, producing silent nulls. A `GITHUB_TOKEN` env var check with a log message would surface this.
- **Verdict**: Robust by design (never fails the build). The hard-coded repo slug is a maintenance smell.

---

## TypeScript Config Recommendations

Current `tsconfig.json` has `strict: true` which enables most strictness flags. The following are not enabled and would catch real bugs:

| Flag | What it catches | Recommended? |
|---|---|---|
| `noUncheckedIndexedAccess` | `record[key]` returns `T \| undefined` instead of `T`. Would surface bugs in `storage.ts` where `p.steps[stepId]` is used without a null check in several places. | **Yes** — would catch real bugs |
| `exactOptionalPropertyTypes` | Distinguishes `{ x?: string }` from `{ x: string \| undefined }`. Low noise gain for this codebase. | No |
| `noPropertyAccessFromIndexSignature` | Requires bracket notation on index signatures. Minor ergonomics change. | No |

The `target: "ES2017"` is conservative given Next.js will transpile for the configured browsers anyway. It could be raised to `ES2022` without consequence, but this is cosmetic.

---

## Test Surface — Where to Actually Invest

| Surface | Test type | Value | Recommendation |
|---|---|---|---|
| `lib/home-state.ts` — `resolveHomeState()` | Unit | HIGH — pure function, 4 discriminated states, complex branching | **Write now**. ~10 test cases cover the whole branch surface. |
| `lib/streaks.ts` — `rollStreak()`, `awardPass()` | Unit | HIGH — date arithmetic with embers/flames; easy to introduce off-by-one bugs | **Write now**. Jest + fake timers. |
| `lib/storage.ts` — `loadProgressV2`, `setStepAttempt`, `markChapterCompleteIfNew` | Unit | HIGH — idempotency and merge logic is subtle; the v1→v2 bridge path in `loadProgressV2:186-189` is untested | **Write now**. Use `jsdom` or mock `localStorage`. |
| `components/v2/steps/_grader.ts` — `gradeRunResult`, `normalizeStdout` | Unit | HIGH — grader correctness is the core learning mechanic | **Write now**. Pure function, zero setup. |
| `scripts/build-content-v2.mjs` — schema validation | Integration | MEDIUM — a test that builds a fixture content folder and asserts the emitted JSON would catch schema drift immediately | **Write eventually**. Useful but requires fixture authoring. |
| `lib/use-pyodide.ts` — worker singleton | Unit | LOW — requires Worker mocking, tests would mostly test the mock | Skip. |
| Page rendering (app/page.tsx etc.) | E2E / snapshot | LOW — static export; page behavior is better tested via Playwright against the running site | Skip for now. |

**Minimum viable test suite**: `_grader.ts` + `home-state.ts` + `streaks.ts`. All pure functions, no DOM, no mocks. ~30 tests. Would have caught the `awardPass` → v1-only bug described in architectural risk #1.

---

## Accessibility-as-Code Gaps

### `LoginToSave.tsx` — dialog lacks focus trap and Escape key close
- **File**: `components/LoginToSave.tsx:172-274`
- The `role="dialog"` overlay has `aria-modal="true"` and `aria-labelledby="lts-title"` — correct. However:
  - Focus is not trapped inside the dialog (Tab can leave the modal).
  - `Escape` key does not close the dialog. The close button is `[ esc ]` but it's a `<button>` — pressing the `Escape` key does nothing.
- **Fix**: Add a `useEffect` that listens for `keydown` with `key === "Escape"` and calls `setOpen(false)`. For focus trap, use `inert` on the background or a small `useFocusTrap` hook.

### `StepFooter.tsx` — hint list uses `key={i}` (index key)
- **File**: `components/v2/StepFooter.tsx:76`
- `{hints.slice(0, hintsShown).map((h, i) => (<li key={i}>...` — uses array index as key. Hints are stable (authored content, not reordered), so this is low severity but should use `h.level` as the key since `Hint.level` is a 1|2|3 literal.

### `components/v2/LessonShell.tsx` — mobile drawer button missing explicit `type="button"`
- Actually present at line 93. Clean.

### `SiteHeader.tsx` — landmark missing
- **File**: `components/SiteHeader.tsx:14`
- The header renders as a `<div>`. It should be `<header>` to give the site a proper document landmark structure. The `<main>` in `app/page.tsx:91` is correct; a `<header>` here would complete the landmark set.

### `components/v2/ChapterNav.tsx` — chapter collapse button accessible name
- **File**: `components/v2/ChapterNav.tsx:71-88`
- The chapter toggle `<button>` has a visible text label (chapter title) but no `aria-expanded` attribute. Screen readers cannot determine whether the chapter's lesson list is open or closed.
- **Fix**: Add `aria-expanded={isOpen}` to the toggle button.

### `PersistentIDE.tsx` — tab bar uses `role="tab"` without `role="tabpanel"`
- **File**: `components/v2/PersistentIDE.tsx:229-247`
- The file tabs use `role="tab"` and `aria-selected` on each button, and `role="tablist"` on the container — correct. However, the associated editor panel has no `role="tabpanel"` and no `aria-labelledby` connecting it to the active tab. The ARIA tab pattern is incomplete.

---

## Top 15 Code Moves to Ship — Ranked

| # | Change | Files | Effort | Risk |
|---|---|---|---|---|
| 1 | **Fix `awardPass()` to write v2 streak** — migrate streak award to `updateProgressV2`. Correctness bug; `DailyGoalDial` always shows 0. | `lib/streaks.ts`, `lib/storage.ts` | 2h | Medium — touches streak state shape |
| 2 | **Export key + event constants from `storage.ts`**; delete duplicates in `LoginToSave` | `lib/storage.ts`, `LoginToSave.tsx` | 15min | Low |
| 3 | **Add `noUncheckedIndexedAccess` to tsconfig** and fix resulting type errors | `tsconfig.json`, ~5 files in `lib/` | 2h | Low — compile errors only |
| 4 | **Runtime-validate chapter JSON in `getV2Chapter`** using Zod `Chapter.parse` | `lib/content-v2.ts` | 30min | Low |
| 5 | **Write tests for `_grader.ts`** — 8 grader kinds, normalize rules | new `__tests__/_grader.test.ts` | 2h | None |
| 6 | **Write tests for `home-state.ts`** — 4 states × edge cases | new `__tests__/home-state.test.ts` | 1h | None |
| 7 | **Extract `useSubmitStep` hook** — collapse Write/Checkpoint/Fix duplication | `components/v2/steps/_useSubmitStep.ts`, 3 view files | 3h | Low |
| 8 | **Replace ad-hoc submit button classes with `dojo-btn-primary`** | 4 step view files | 30min | Low — visual: removes `rounded-md` |
| 9 | **Rename `lib/types.ts` exports** (`Chapter` → `LegacyChapter` etc.) to resolve collision with schema.ts | `lib/types.ts`, `lib/content.ts`, any v1 consumers | 1h | Low |
| 10 | **Stamp `lastSeenAt` only in `setLastVisitedV2`**, remove from `updateProgressV2` | `lib/storage.ts` | 30min | Low |
| 11 | **Add `aria-expanded` to chapter nav toggle** | `components/v2/ChapterNav.tsx` | 15min | None |
| 12 | **Add `Escape` key handler to `LoginToSave` dialog** | `components/LoginToSave.tsx` | 30min | None |
| 13 | **Extract `<StepHeader>` from the IIFE in `LessonStepClient`** | `components/v2/LessonStepClient.tsx` | 30min | None |
| 14 | **Parallelize `loadChapter` calls in `build-content-v2.mjs`** with `Promise.all` | `scripts/build-content-v2.mjs` | 30min | Low |
| 15 | **Add skip-if-unchanged guard to `copy-pyodide.mjs`** — compare lock file mtime | `scripts/copy-pyodide.mjs` | 30min | Low |
