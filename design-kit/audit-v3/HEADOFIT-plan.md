# V3 Implementation Plan — The Pristine Refresh

**Author:** Head of IT
**Date:** 2026-05-06
**Audience:** the dev who picks this up Monday morning
**Contract:** `design-kit/audit-v3/CEO-vision.md` (PR 0 + picks 1–9). Don't add, don't substitute.
**Stack:** Next.js 16 App Router, `output: "export"`, React 19, Tailwind 4, Pyodide 0.28.3, deployed on Cloudflare Pages free tier.

---

## Executive summary

10 PRs, ~48h total, sequenced for dependency + risk. PR 0 ships first and alone — it's a silent-data-loss bug. After PR 0 lands and is verified on Cloudflare, picks 1–9 ship in order: a11y baseline, traceback view, dojo CodeMirror theme, Pyodide boot hairline, sticky header + `/curriculum` + `/lesson/resume`, mobile drawer + linked breadcrumb, repostable hero + `$0` band, perf cluster, voice/system sweep. Plan A: PRs 0–6 in week 1 (38h), PRs 7–9 in week 2 (12h). Plan B if week 1 slips: drop PR 4 (Pyodide hairline) to V3.5 — single biggest cut candidate per CEO.

**Key risks:**
1. PR 0 touches localStorage shape — needs a one-shot v1→v2 streak migrator so existing users don't lose their fire.
2. PR 5 (sticky header) and PR 6 (mobile drawer) both rebuild `<SiteHeader>`. Must land in order — PR 5 ships the rebuild, PR 6 adds the drawer to it.
3. PR 8 swaps `rehype-highlight` for `lowlight` across 7 step views — easy to miss one and ship a regression.

**Ships first:** PR 0. Don't merge anything else until it's green on prod.

---

## Pre-flight

- **Main:** `git checkout main && git pull && pnpm install && pnpm build` must be green before starting any PR. If main is red, fix that first — don't stack work on a broken trunk.
- **Prior PRs:** V2 ships are at `design-kit/audit-v2/HEADOFIT-plan.md`; the last V2 PR landed the welcome-back card + StatStrip + PhaseBandedRail. The `dojo-btn-primary`/`dojo-card`/`t-*` system tokens are live in `app/globals.css:131-420`. The CodeMirror theme spec was specced in V1, V2 — never shipped.
- **Branch convention:** `refresh-v3/00-fix-streak-writes`, `refresh-v3/01-a11y-baseline`, …, `refresh-v3/09-voice-and-system-sweep`. One PR per branch. Squash-merge.
- **Verification per PR:** `pnpm build` clean, hand-test the touched flow on `localhost:3000`, push to a Cloudflare preview deploy, smoke-test prod after merge.
- **Rollback plan (one sentence):** every PR is a single squash-merged commit on `main`; if a deploy ships broken, `git revert <sha> && git push origin main` and Cloudflare Pages auto-redeploys the previous green build (~5 min).

---

## Build order

---

### PR 0: refresh-v3/00-fix-streak-writes [DATA CORRECTNESS — SHIPS FIRST]

**Branch:** `refresh-v3/00-fix-streak-writes`
**Outcome:** XP awarded for completed steps lands in v2 streak that the v2 UI reads. `DailyGoalDial` shows minutes accumulating; `StreakWidget.current` increments after a passing day. Currently silently lost per `audit-v3/07-code-quality.md` §1 (HIGH).
**Estimated time:** 2.5h
**Depends on:** none
**Unblocks:** every other PR (CEO-vision: "every pick assumes streak XP writes correctly")

**Files to modify:**
- `lib/streaks.ts` — rewrite `awardPass()` and `grantFrozenFlame()` to write v2
- `lib/storage.ts` — export `PROGRESS_KEY_V2` + `PROGRESS_EVENT_V2` constants; remove `lastSeenAt` stamp from `updateProgressV2`; add it to `setLastVisitedV2`
- `components/LoginToSave.tsx:7-9` — import constants instead of duplicating
- `components/v2/LessonStepClient.tsx:103,113` — verify call sites compile (no logic change here)

**The bug, mechanical:**
- `lib/streaks.ts:11` imports `updateProgress` (v1) from storage
- `lib/streaks.ts:64` `awardPass()` calls `updateProgress((p) => …)` — this writes `GlobalProgress.streak` at key `promptdojo:progress:v1`
- `components/v2/DailyGoalDial.tsx` reads `loadProgressV2().streak.todayXp` at key `promptdojo:progress:v2`
- Two different keys → XP earned never appears in the UI.

**Implementation:**

1. **`lib/storage.ts:5-7` — export the constants**
   ```ts
   // BEFORE
   const KEY = "promptdojo:progress:v1";
   const KEY_V2 = "promptdojo:progress:v2";

   // AFTER
   const KEY = "promptdojo:progress:v1";
   export const PROGRESS_KEY_V2 = "promptdojo:progress:v2";
   export const PROGRESS_EVENT_V2 = "promptdojo:progress-v2";
   const KEY_V2 = PROGRESS_KEY_V2;
   ```
   Update `saveProgressV2` (`lib/storage.ts:212-216`) to use `PROGRESS_EVENT_V2` instead of the inline string `"promptdojo:progress-v2"`.

2. **`lib/storage.ts:218-228` — remove `lastSeenAt` from every write**
   ```ts
   // BEFORE
   export function updateProgressV2(fn) {
     const cur = loadProgressV2();
     const next = { ...fn(cur), lastSeenAt: new Date().toISOString() };
     saveProgressV2(next);
     return next;
   }

   // AFTER
   export function updateProgressV2(fn) {
     const cur = loadProgressV2();
     const next = fn(cur);
     saveProgressV2(next);
     return next;
   }
   ```

3. **`lib/storage.ts:374-376` — stamp `lastSeenAt` only on real navigation**
   ```ts
   // BEFORE
   export function setLastVisitedV2(visited: LastVisitedV2): ProgressV2 {
     return updateProgressV2((p) => ({ ...p, lastVisitedV2: visited }));
   }

   // AFTER
   export function setLastVisitedV2(visited: LastVisitedV2): ProgressV2 {
     return updateProgressV2((p) => ({
       ...p,
       lastVisitedV2: visited,
       lastSeenAt: new Date().toISOString(),
     }));
   }
   ```

4. **`lib/streaks.ts` — full rewrite of `awardPass()` and `grantFrozenFlame()`**
   - Drop `import { … updateProgress } from "./storage"` (v1).
   - Import `updateProgressV2`, `loadProgressV2`, `loadProgress` (v1, for migration), `todayISO`, `FRESH_STREAK`.
   - Migrate the helper signatures: `awardPass(): ProgressV2` and `grantFrozenFlame(): ProgressV2` (callers in `LessonStepClient.tsx` discard the return value, so this is safe).
   - Migration shim: at the top of `awardPass`, if `loadProgressV2().streak.totalXp === 0 && loadProgressV2().streak.current === 0`, seed v2 streak from v1 streak before applying the new pass. Cheap, idempotent, runs once per device.
   - Same for `grantFrozenFlame` (no migration needed — flames are pure increment).

   ```ts
   // AFTER (replace lines 10-103)
   import type { StreakState } from "./types";
   import type { ProgressV2 } from "./storage";
   import {
     FRESH_STREAK,
     loadProgress,
     loadProgressV2,
     todayISO,
     updateProgressV2,
   } from "./storage";

   const XP_PER_PASS = 10;
   const XP_PER_EMBER = 30;
   const MAX_EMBERS = 2;
   const MAX_FROZEN_FLAMES = 4;

   function daysBetween(a: string, b: string): number { /* unchanged */ }
   function rollStreak(s: StreakState): StreakState { /* unchanged */ }

   /** One-shot bridge: if the v2 streak is fresh but v1 has a streak,
    *  carry it forward so a returning v1 user doesn't lose their fire.
    *  Idempotent — second call sees v2 already populated and is a no-op. */
   function seedV2FromV1IfEmpty(p: ProgressV2): ProgressV2 {
     if (p.streak.totalXp > 0 || p.streak.current > 0) return p;
     const v1 = loadProgress();
     if (v1.streak.totalXp === 0 && v1.streak.current === 0) return p;
     return { ...p, streak: { ...FRESH_STREAK, ...v1.streak } };
   }

   export function awardPass(): ProgressV2 {
     return updateProgressV2((raw) => {
       const p = seedV2FromV1IfEmpty(raw);
       const today = todayISO();
       const s0 = rollStreak(p.streak);
       const todayXp = (s0.todayDate === today ? s0.todayXp : 0) + XP_PER_PASS;
       const earnedEmbers =
         Math.floor(todayXp / XP_PER_EMBER) -
         Math.floor((todayXp - XP_PER_PASS) / XP_PER_EMBER);
       const embers = Math.min(MAX_EMBERS, s0.embers + Math.max(0, earnedEmbers));
       const isNewActivityDay = s0.lastActivityDate !== today;
       let current = s0.current;
       if (isNewActivityDay) {
         const gap = daysBetween(s0.lastActivityDate || today, today);
         current = gap <= 1 ? s0.current + 1 : 1;
       }
       const longest = Math.max(s0.longest, current);
       return {
         ...p,
         streak: {
           ...s0,
           lastActivityDate: today,
           current,
           longest,
           embers,
           totalXp: s0.totalXp + XP_PER_PASS,
           todayXp,
           todayDate: today,
         },
       };
     });
   }

   export function grantFrozenFlame(): ProgressV2 {
     return updateProgressV2((p) => ({
       ...p,
       streak: {
         ...p.streak,
         frozenFlames: Math.min(MAX_FROZEN_FLAMES, p.streak.frozenFlames + 1),
       },
     }));
   }

   export function viewStreak(p: ProgressV2): StreakState {
     return rollStreak(p.streak);
   }

   export const STREAK_RULES = { XP_PER_PASS, XP_PER_EMBER, MAX_EMBERS, MAX_FROZEN_FLAMES };
   export { FRESH_STREAK };
   ```

5. **`components/LoginToSave.tsx:7-9` — import constants**
   ```ts
   // BEFORE
   const EMAIL_KEY = "promptdojo:save-email";
   const PROGRESS_KEY = "promptdojo:progress:v2";
   const PROGRESS_EVENT = "promptdojo:progress-v2";

   // AFTER
   import { PROGRESS_KEY_V2 as PROGRESS_KEY, PROGRESS_EVENT_V2 as PROGRESS_EVENT } from "@/lib/storage";
   const EMAIL_KEY = "promptdojo:save-email";
   ```

6. **`components/v2/LessonStepClient.tsx`** — `awardPass()` and `grantFrozenFlame()` call sites at `:103,114` are unchanged. The functions now write v2 directly. No logic change at the call site.

7. **`components/StreakWidget.tsx`** — verify it reads `loadProgressV2().streak`, not `loadProgress().streak`. If it reads v1, repoint to v2 in this PR (this is the *visible* receipts surface — must show new XP). Same for any other v1-streak readers found via `grep -rn "loadProgress\b" components/` — repoint to `loadProgressV2`.

**Test checklist:**
- [ ] open in incognito, complete one `write` step → `DailyGoalDial` shows 10 XP / 1 min
- [ ] complete 3 more steps → 40 XP / 4 min, 1 ember earned (XP_PER_EMBER=30)
- [ ] reload page → progress persists; localStorage `promptdojo:progress:v2` shows `streak.totalXp: 40`
- [ ] open `localStorage` devtools → no writes to `promptdojo:progress:v1` from `awardPass`
- [ ] complete a chapter (mark all lessons complete) → frozen flame increments in `progress.streak.frozenFlames`
- [ ] simulate v1→v2 user: pre-set v1 streak to `{current: 3, totalXp: 90}`, leave v2 fresh, complete one step → v2 streak shows `current: 4` (carried + incremented), `totalXp: 100`
- [ ] `pnpm build` green

**Verification:**
- [ ] DevTools → Application → Local Storage → `promptdojo:progress:v2` → `streak.totalXp` increments on pass
- [ ] no calls to `updateProgress` (v1) from `streaks.ts` (`grep "updateProgress\b" lib/streaks.ts` returns empty)
- [ ] `LoginToSave` no longer declares its own key/event strings (`grep "promptdojo:progress:v2" components/LoginToSave.tsx` returns empty)

**Risks:**
- **Migration safety:** `seedV2FromV1IfEmpty` runs only when v2 is empty. Idempotent — once v2 has any XP, the bridge is a no-op. Existing v2-only users untouched. Existing v1-only users (rare; v1 is the legacy route) get their streak ported on first v2 pass.
- **Type ripple:** `awardPass` return type changes from `GlobalProgress` → `ProgressV2`. Callers (`LessonStepClient.tsx:103,114`) ignore the return value. Confirmed via grep — no other callers.
- **`updateProgress` (v1) still exists** — keep it; `LessonClient.tsx`/v1 routes still use it.

**Rollback:** if anything regresses, `git revert <sha>`. v2 progress data forward-compatible (no key change, no shape change other than additive `lastSeenAt` semantics). Existing users see their fire either way.

---

### PR 1: refresh-v3/01-a11y-baseline

**Branch:** `refresh-v3/01-a11y-baseline`
**Outcome:** Five WCAG AA fails fixed in one cluster: skip link, lesson `<h1>`, focus rings (already canon — verify), `text-green-700` text contrast, branded `app/not-found.tsx`. Header becomes a real `<header>` landmark. `LoginToSave` modal gets Escape + focus return + labeled email input.
**Estimated time:** 2.5h
**Depends on:** PR 0 merged
**Unblocks:** soft gate for PR 5 (`<header>` landmark), PR 6 (`aria-current` patterns)

**Files to modify:**
- `app/layout.tsx` — add `<a href="#main" className="skip-link">skip to content</a>` before `<SiteHeader />` (line 23)
- `app/page.tsx:91` — add `id="main"` to the `<main>`
- `app/about/page.tsx` — add `id="main"` to the `<main>`
- `app/onboarding/page.tsx:161` — add `id="main"`
- `app/changelog/page.tsx:28` — add `id="main"`
- `app/learn/v2/[chapter]/page.tsx:84` — add `id="main"` (the `<main>` already exists)
- `components/v2/LessonShell.tsx:59` — add `id="main"` to the `<main>` already there
- `components/SiteHeader.tsx:14-15` — wrap outer `<div>` in `<header>` (or change `<div>` → `<header>`); wrap right-cluster `<div>` (line 23) in `<nav aria-label="site">`
- new `app/not-found.tsx` — branded 404 with header + StatStrip + 3 recovery cards + Levenshtein "did you mean: <slug>?" hint against the v2 TOC chapter slugs
- `components/v2/LessonStepClient.tsx:156` — insert `<h1 className="sr-only">{lesson.title} — step {stepIndex + 1} of {totalSteps}</h1>` inside the header IIFE, before the breadcrumb row
- **Contrast sweep:** replace `text-green-700` → `text-green-400` for **text** usages (keep for decoration like `<Check />` icons) in:
  - `components/v2/ChapterNav.tsx:79,148` (chapter-done text, lesson-done text — text contexts)
  - `components/v2/steps/FillBlankStepView.tsx:160`
  - `components/v2/steps/FixBugStepView.tsx:108`
  - `components/v2/steps/WriteStepView.tsx:93`
  - `components/v2/steps/ReorderStepView.tsx:168`
  - `components/v2/steps/CheckpointStepView.tsx:103`
  - `components/v2/steps/MultipleChoiceStepView.tsx:97,134`
  - `components/v2/steps/PredictStepView.tsx:109`
  - **Keep** `text-green-700` on the `<Check />` icons at `ChapterNav.tsx:94,152,197` (decorative). The audit-v3 §C4 fix explicitly preserves icon color.
- `app/globals.css` — add `.skip-link` utility (visually hidden until focused)
- `components/LoginToSave.tsx` — add Escape handler, focus return, label the email input (see implementation below)

**Implementation highlights:**

- **`.skip-link` utility (`app/globals.css`, after the focus canon block ~line 354):**
  ```css
  .skip-link {
    position: absolute;
    left: 0.5rem;
    top: 0.5rem;
    transform: translateY(-200%);
    z-index: 50;
    background: var(--color-green-500);
    color: var(--color-ink-950);
    padding: 0.5rem 0.75rem;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: transform 140ms ease-out;
  }
  .skip-link:focus { transform: translateY(0); outline: none; }
  ```

- **`app/layout.tsx:22-24`:**
  ```tsx
  // BEFORE
  <body className="...">
    <SiteHeader />
    {children}

  // AFTER
  <body className="...">
    <a href="#main" className="skip-link">skip to content</a>
    <SiteHeader />
    {children}
  ```

- **`components/SiteHeader.tsx:14-30` — `<header>` + `<nav>` landmarks:**
  ```tsx
  // BEFORE: outer <div>
  // AFTER:
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
      <a href="/about" ...>…</a>
      <nav aria-label="site" className="flex flex-wrap items-center gap-2">
        <GitHubStatsPill /> <CourseProgress /> <LoginToSave /> <FollowOnXPill />
      </nav>
    </header>
  );
  ```
  This is *just* the landmark fix — the sticky/border/`<ContinuePill>` rebuild lands in PR 5.

- **`components/v2/LessonStepClient.tsx:156` — sr-only h1 inside the header IIFE:**
  ```tsx
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="sr-only">
        {lesson.title} — step {stepIndex + 1} of {totalSteps}
      </h1>
      {phase && (<div className="t-mono-meta">phase ...</div>)}
      {/* …rest unchanged… */}
    </div>
  );
  ```

- **`app/not-found.tsx` (new file, ~60 lines):** server component, renders header (already global via layout), eyebrow `404 ─ page not found`, `t-section` headline, three `dojo-card-interactive` recovery cards (`← home`, `the curriculum →` (PR 5; for PR 1 link to `/about` since `/curriculum` doesn't exist yet), `↵ start chapter 1`), `<StatStrip />`, plus a Levenshtein "did you mean: `<slug>`?" hint computed against `getV2Toc().chapters.map(c => c.slug)`. Distance ≤ 2 only, against the last URL segment via `usePathname` is *not* available in a `not-found.tsx` (it has no path). Use a plain "did you mean: variables, functions, lists-and-dicts?" static "popular chapters" footer instead. Don't over-engineer.

  Skeleton:
  ```tsx
  // app/not-found.tsx — server component, no 'use client'
  import Link from "next/link";
  import StatStrip from "@/components/StatStrip";

  export default function NotFound() {
    return (
      <main id="main" className="mx-auto max-w-2xl px-6 py-16">
        <div className="t-eyebrow">404 ─ page not found</div>
        <h1 className="t-section mt-4">this lesson does not exist (yet).</h1>
        <p className="t-body mt-6">
          the curriculum has 25 chapters and 624 steps, but not this one.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Link href="/" className="dojo-card-interactive">← home</Link>
          <Link href="/about" className="dojo-card-interactive">about →</Link>
          <Link href="/learn/v2/variables/naming-things/0" className="dojo-card-interactive">↵ start chapter 1</Link>
        </div>
        <StatStrip className="mt-12" />
      </main>
    );
  }
  ```

- **`components/LoginToSave.tsx` — Escape + focus trap + labeled input:**
  - Add `useRef<HTMLButtonElement>(null)` for the trigger button (line 153). Attach `ref={triggerRef}` on the trigger.
  - Add `useEffect` listening for `keydown` while `open === true`; if `e.key === "Escape"`, `setOpen(false)`.
  - On `setOpen(false)`, call `triggerRef.current?.focus()` to return focus.
  - Wrap the email input at `:212-228` with a `<label htmlFor="lts-email" className="sr-only">your email</label>`. Add `id="lts-email"` to the input.
  - Add `id="lts-desc"` to the `<p>` description at `:200-203`. Add `aria-describedby="lts-desc"` to the input.
  - Wrap the error `<p>` at `:230-232` with `id="lts-error"` + `role="alert"`.
  - For focus trap, hand-roll: in the modal `<div onKeyDown={...}>`, listen for `Tab` / `Shift+Tab`; query `panel.querySelectorAll('button, input, [href]:not([disabled])')` and wrap. ~25 lines, no new dep.

**Test checklist:**
- [ ] tab from a fresh page load → first focus is "skip to content" pill (visible, ember on ink)
- [ ] press Enter on skip → focus moves to `<main>`
- [ ] visit `/aboot` → branded 404 renders, three cards reachable by tab
- [ ] open `LoginToSave` → tab cycles within the modal, never leaves
- [ ] Escape closes the modal AND focus returns to the trigger button
- [ ] NVDA / VoiceOver smoke test: lesson page reads "heading level 1, naming things — step 3 of 8" before the breadcrumb meta
- [ ] every `text-green-700` text use replaced; `<Check />` icons unchanged
- [ ] `pnpm build` green; CF preview deploy clean

**Verification:**
- [ ] axe-cli or Lighthouse a11y score ≥ 95 on `/`, `/learn/v2/variables/naming-things/0`, `/about`, 404 page
- [ ] manual: keyboard-only completion of step 1 of chapter 1 (no mouse touched)

**Risks:**
- Focus-trap implementation can subtly break iframe/embed cases — none of those exist on promptdojo today, so low risk.
- Adding `id="main"` to multiple `<main>` elements — these are on different pages, so no duplicate-id conflicts. Verify via DevTools per route.

---

### PR 2: refresh-v3/02-traceback-view

**Branch:** `refresh-v3/02-traceback-view`
**Outcome:** Python tracebacks render as structured frames — collapsed Pyodide internal frames, syntax-highlighted code in user frames, clickable `line N` links that scroll the editor. Errors stop being a wall of red text.
**Estimated time:** 8h (1 day)
**Depends on:** PR 0
**Unblocks:** none — feels-per-dev-hour landmark per CEO

**Files to modify:**
- new `lib/python-traceback.ts` (~120 lines) — pure parser, no React
- new `components/v2/TracebackView.tsx` (~80 lines) — renders parsed frames
- `components/v2/PersistentIDE.tsx:355-356` — swap raw `<pre className="text-err">{stderr}</pre>` for `<TracebackView raw={stderr} onJumpToLine={...} />`
- `components/v2/PersistentIDE.tsx` — expose a `scrollToLine(n: number)` method via the existing `PersistentIDEHandle` ref OR add an internal `editorViewRef` that `TracebackView` can call through a callback prop

**Parser spec (`lib/python-traceback.ts`):**

The Pyodide stderr output looks like:
```
Traceback (most recent call last):
  File "<exec>", line 7, in <module>
  File "<exec>", line 4, in collect_errors
KeyError: 'name'
```

(Pyodide internal frames are `File "/lib/python311.zip/...", line N, in <fn>` — we collapse those.)

```ts
// lib/python-traceback.ts
export type Frame = {
  file: string;       // "<exec>" for user code, otherwise pyodide internal
  line: number;
  func: string;       // e.g. "<module>", "collect_errors"
  isUser: boolean;    // file === "<exec>"
};

export type ParsedTraceback = {
  frames: Frame[];
  exceptionType: string; // "KeyError"
  exceptionMessage: string; // "'name'"
  raw: string; // unchanged, for fallback
};

export function parseTraceback(raw: string): ParsedTraceback | null {
  if (!raw.trim().startsWith("Traceback")) return null;
  const lines = raw.split("\n");
  const frames: Frame[] = [];
  const FRAME_RE = /^\s*File "([^"]+)", line (\d+), in (.+)$/;
  let lastLine: { type: string; message: string } | null = null;

  for (const line of lines) {
    const m = line.match(FRAME_RE);
    if (m) {
      frames.push({
        file: m[1],
        line: parseInt(m[2], 10),
        func: m[3],
        isUser: m[1] === "<exec>",
      });
    } else if (line.match(/^[A-Z][a-zA-Z]*Error|^[A-Z][a-zA-Z]*Exception|^SyntaxError/)) {
      const colonIdx = line.indexOf(":");
      lastLine = colonIdx > 0
        ? { type: line.slice(0, colonIdx), message: line.slice(colonIdx + 1).trim() }
        : { type: line.trim(), message: "" };
    }
  }

  if (frames.length === 0 && !lastLine) return null;
  return {
    frames,
    exceptionType: lastLine?.type ?? "Error",
    exceptionMessage: lastLine?.message ?? "",
    raw,
  };
}
```

**Component spec (`components/v2/TracebackView.tsx`):**

- Render `<div className="border-l-2 border-err pl-3">`.
- Render `<div className="t-mono-meta text-err">{exceptionType}</div>` then `<div className="font-mono text-sm text-ink-200">{exceptionMessage}</div>`.
- Render frame list: `<ol className="mt-3 space-y-1">`; each frame is `<li>`. User frames get a clickable `<button onClick={() => onJumpToLine(frame.line)}>line {frame.line}</button>`; internal frames are wrapped in a `<details>` "show internal frames (n)" disclosure (closed by default).
- Render the original `raw` traceback inside a `<details className="mt-3"><summary className="t-mono-meta text-ink-500">show raw traceback</summary><pre className="mt-2 whitespace-pre-wrap text-err text-xs">{raw}</pre></details>` for "I want the unfiltered output" cases.
- Fallback: if `parseTraceback` returns `null` (e.g. stderr is `print("oops", file=sys.stderr)` not a traceback), render the original `<pre>{stderr}</pre>` unchanged.

**Click-to-jump in editor:**

In `PersistentIDE.tsx`, capture the CodeMirror `EditorView` via `onCreateEditor` callback (uiw/react-codemirror exposes this). Store in a ref. Add a method to `PersistentIDEHandle`:
```ts
scrollToLine: (line: number) => void;
```
Implementation:
```ts
const view = editorViewRef.current;
if (!view) return;
const pos = view.state.doc.line(line).from;
view.dispatch({ selection: { anchor: pos }, effects: EditorView.scrollIntoView(pos, { y: "center" }) });
view.focus();
```

In `LessonStepClient.tsx`, the IDE bridge already has `ide.run()` and `ide.getActiveCode()` — add `ide.scrollToLine(n)` and pass through to TracebackView.

For the simpler ship: TracebackView accepts `onJumpToLine?: (line: number) => void` as a prop, and `PersistentIDE` passes it directly to TracebackView using the local `editorViewRef`. No need to thread through `LessonStepClient` for V3.

**Test checklist:**
- [ ] step that throws `KeyError`: error renders with framed UI, exception type at top, user frame clickable
- [ ] click "line 7" → editor scrolls to line 7, cursor positions there, editor focuses
- [ ] internal Pyodide frames hidden behind disclosure (closed by default)
- [ ] step that prints to stderr without raising (e.g. `import sys; print("warn", file=sys.stderr)`) → renders the raw fallback
- [ ] empty stderr → no TracebackView mounted (no empty container)
- [ ] `pnpm build` green; bundle delta < 5KB br

**Verification:**
- [ ] visual smoke on `/learn/v2/mutation/...` step that has a known error path
- [ ] `parseTraceback` unit-testable (pure function); add 2-3 quick tests in `__tests__/python-traceback.test.ts` if test infra exists; otherwise eyeball

**Risks:**
- `<details>` disclosure inside `aria-live="polite"` region (`PersistentIDE.tsx:335`) re-announces on every state change. Mitigation: scope the live region to just the output text, not the structured TracebackView. Move `aria-live` to a child `<div>` that wraps stdout only.

---

### PR 3: refresh-v3/03-codemirror-theme

**Branch:** `refresh-v3/03-codemirror-theme`
**Outcome:** CodeMirror editor renders dojo-green caret + green selection + ember syntax tokens. Tab indents 4 spaces. Brackets auto-close. `oneDark` is gone.
**Estimated time:** 5h
**Depends on:** PR 0

**Files to modify:**
- new `lib/codemirror-theme.ts` (~80 lines) — `dojoTheme` export
- `components/v2/PersistentIDE.tsx:5` — drop `oneDark` import, add `dojoTheme` import; drop `Lock` import (still used for tab read-only icon — keep)
- `components/v2/PersistentIDE.tsx:255` — `theme={oneDark}` → `theme={dojoTheme}`
- `components/v2/PersistentIDE.tsx:206-215` — extend `extensions` array with `closeBrackets()`, `bracketMatching()`, `keymap.of([indentWithTab])`
- `package.json` — remove `@codemirror/theme-one-dark` dep, add `@codemirror/autocomplete` (provides `closeBrackets`), add `@codemirror/commands` (provides `indentWithTab`). `@codemirror/language` (provides `bracketMatching`) is already pulled transitively via `@codemirror/lang-python` — verify.
- `app/globals.css` — add `.cm-cursor` 1Hz blink rule (matches brand heartbeat)

**Implementation:**

- **`lib/codemirror-theme.ts`** — token map per CEO §pick3:
  ```ts
  import { EditorView } from "@codemirror/view";
  import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
  import { tags as t } from "@lezer/highlight";

  // CSS variables read at runtime via getComputedStyle would work but is
  // overkill — we have the hex values from app/globals.css @theme block
  // and they're stable across the brand. Mirror them here.
  const ink100 = "#f4f4f5";
  const ink200 = "#e4e4e7";
  const ink300 = "#d4d4d8";
  const ink400 = "#a1a1aa";
  const ink500 = "#8a8a93";
  const ink700 = "#3f3f46";
  const ink900 = "#18181b";
  const ink950 = "#14140f";
  const green300 = "#6ee7b7";
  const green500 = "#2aa06a";

  const dojoEditorTheme = EditorView.theme(
    {
      "&": { color: ink300, backgroundColor: ink950 },
      ".cm-content": { caretColor: green500 },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: green500, borderLeftWidth: "2px" },
      "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "rgba(42, 160, 106, 0.18)",
      },
      ".cm-activeLine": { backgroundColor: ink900 },
      ".cm-gutters": { backgroundColor: ink950, color: ink700, border: "none" },
      ".cm-activeLineGutter": { backgroundColor: ink900, color: ink400 },
      ".cm-lineNumbers": { color: ink700 },
    },
    { dark: true },
  );

  const dojoHighlightStyle = HighlightStyle.define([
    { tag: t.keyword, color: green500, fontWeight: "600" },
    { tag: t.string, color: ink100, fontStyle: "italic" },
    { tag: t.comment, color: ink500, fontStyle: "italic" },
    { tag: [t.number, t.bool, t.null], color: ink200 },
    { tag: [t.function(t.variableName), t.function(t.propertyName)], color: green300 },
    { tag: [t.standard(t.variableName), t.className], color: green300 },
    { tag: t.operator, color: ink400 },
    { tag: t.variableName, color: ink300 },
    { tag: t.propertyName, color: ink300 },
    { tag: t.punctuation, color: ink400 },
  ]);

  export const dojoTheme = [dojoEditorTheme, syntaxHighlighting(dojoHighlightStyle)];
  ```

- **`components/v2/PersistentIDE.tsx:5,206-215,255`:**
  ```ts
  // BEFORE (line 5)
  import { oneDark } from "@codemirror/theme-one-dark";

  // AFTER
  import { dojoTheme } from "@/lib/codemirror-theme";
  import { closeBrackets } from "@codemirror/autocomplete";
  import { bracketMatching } from "@codemirror/language";
  import { keymap } from "@codemirror/view";
  import { indentWithTab } from "@codemirror/commands";
  ```

  ```ts
  // BEFORE (lines 206-215)
  const extensions = useMemo(() => {
    const baseExtensions =
      activeFile?.language === "python" || activeFile?.language === undefined
        ? [python()]
        : [];
    if (activeFile?.readOnly) {
      return [...baseExtensions, EditorView.editable.of(false)];
    }
    return baseExtensions;
  }, [activeFile]);

  // AFTER
  const extensions = useMemo(() => {
    const baseExtensions =
      activeFile?.language === "python" || activeFile?.language === undefined
        ? [python(), bracketMatching(), closeBrackets(), keymap.of([indentWithTab])]
        : [bracketMatching(), closeBrackets()];
    if (activeFile?.readOnly) {
      return [...baseExtensions, EditorView.editable.of(false)];
    }
    return baseExtensions;
  }, [activeFile]);
  ```

  Line 255: `theme={oneDark}` → `theme={dojoTheme}`.

- **`app/globals.css`** — add at the bottom:
  ```css
  /* CodeMirror caret blink — 1Hz brand heartbeat. */
  .cm-cursor { animation: blink-1hz 1s steps(1) infinite; }
  @media (prefers-reduced-motion: reduce) {
    .cm-cursor { animation: none; }
  }
  ```

- **`package.json`** — remove `"@codemirror/theme-one-dark"`. Add `"@codemirror/autocomplete": "^6.x"` and `"@codemirror/commands": "^6.x"`. Run `pnpm install`. Verify `@codemirror/language` resolves (it's a peer dep of `@codemirror/lang-python`; if not direct, add it explicitly: `"@codemirror/language": "^6.x"`).

**Test checklist:**
- [ ] open any lesson: caret is ember green, blinks at 1Hz, selection is translucent green
- [ ] type `(` in editable file → `()` auto-completes; type `"` → `""`
- [ ] place cursor on `(` → matching `)` is highlighted
- [ ] press Tab in editable file → 4 spaces inserted (not tab character, since CodeMirror uses indentWithTab + tabSize: 4)
- [ ] press Tab in read-only file → focus moves out (CodeMirror default for read-only)
- [ ] keywords (`def`, `return`, `if`) are ember green; strings are italic ink-100; comments are italic ink-500
- [ ] `prefers-reduced-motion: reduce` → cursor is solid (no blink)
- [ ] `pnpm build` green
- [ ] check bundle: `@codemirror/theme-one-dark` not in `node_modules` (`pnpm why @codemirror/theme-one-dark` returns nothing)

**Risks:**
- `bracketMatching` and `closeBrackets` may double-up if `python()` already includes them — verify by inspecting the resulting extension array; CodeMirror's reconciler handles duplicates but it's wasteful. (As of `@codemirror/lang-python@6.2.x`, neither is included by default.)
- `indentWithTab` traps Tab inside the editor — for keyboard users, document the `Esc → Tab` escape pattern in V3.5 cheatsheet (cut from V3 per CEO).

---

### PR 4: refresh-v3/04-pyodide-boot-progress

**Branch:** `refresh-v3/04-pyodide-boot-progress`
**Outcome:** "Booting Python…" replaces with a 1px ember hairline animating 0% → 100%, lowercase honest copy, 15s timeout that surfaces a retry banner. Stops reading as broken.
**Estimated time:** 8h (1 day) — biggest cut candidate per CEO if week 1 slips.
**Depends on:** PR 0

**Files to modify:**
- `public/pyodide-worker.js` — replace `loadPyodide({indexURL:'/pyodide/'})` (line 32) with a manual fetch-stream wrapper that reports byte progress; add 15s timeout race
- `lib/use-pyodide.ts` — extend `WorkerMsg` union with `{ type: "progress"; payload: number }` and `{ type: "error"; payload: string }`; expose `progress: number` and `error: string | null` from the hook
- `components/v2/PersistentIDE.tsx:84-87,273-284` — replace `STATUS_COPY` strings with lowercase, replace status text with `<ProgressHairline>` primitive (already shipped V2 — `components/v2/ProgressHairline.tsx`); render retry banner on error
- voice fix while in there: `STATUS_COPY.ready = "press run · ⌘↵"`, `STATUS_COPY.idle = "booting python…"`, drop the `(one-time)` claim, lowercase "Running your code…" → "running your code…", "Ran with no output." → "ran with no output." (per UI Polish §11)

**Worker-side fetch streaming (`public/pyodide-worker.js`):**

Pyodide ≥ 0.24 supports providing pre-fetched WASM via `loadPyodide({indexURL, ...})` — but the cleanest approach for byte progress is the new `loadPyodide({fullStdLib: false})` doesn't help here. Instead, fetch `pyodide.asm.wasm` and `python_stdlib.zip` ourselves, post progress, then hand the `Response` to `loadPyodide` via `lockFileURL` doesn't accept arbitrary content.

Pragmatic implementation: wrap `loadPyodide` and pre-fetch the two largest assets while reporting progress. Pyodide's internal cache (Module FS) picks them up on subsequent `loadPyodide`. Confirm against Pyodide 0.28.3 docs (`node_modules/pyodide/dist/pyodide.d.ts`). If the API doesn't allow injection, fall back to **timer-based fake progress**: estimate boot duration from prior runs (median ~6s on broadband) and animate the hairline against that estimate; switch to 100% on actual ready. The user-felt outcome — "loading is making progress" — is identical, and the dev-cost drops from "real streaming" to "1 hour of `setInterval`". CEO's goal is "stops reading as broken," not "byte-accurate progress."

**Recommended approach (pragmatic):**

```js
// public/pyodide-worker.js — additions
const BOOT_BUDGET_MS = 8000; // p50 broadband
let progressTimer = null;

function startProgressTimer() {
  const t0 = performance.now();
  progressTimer = setInterval(() => {
    const elapsed = performance.now() - t0;
    // Asymptotic curve: rises fast, slows near 95%. Never hits 100% from timer
    // alone — the actual ready event sets 100%.
    const pct = Math.min(95, Math.round((1 - Math.exp(-elapsed / BOOT_BUDGET_MS)) * 100));
    self.postMessage({ type: "progress", payload: pct });
  }, 100);
}

function stopProgressTimer(final = 100) {
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = null;
  self.postMessage({ type: "progress", payload: final });
}

async function ensurePyodide() {
  if (pyodide) { self.postMessage({ type: "status", payload: "ready" }); return pyodide; }
  if (loading) { self.postMessage({ type: "status", payload: "loading" }); return loading; }
  loading = (async () => {
    self.postMessage({ type: "status", payload: "loading" });
    startProgressTimer();
    const TIMEOUT_MS = 15000;
    try {
      pyodide = await Promise.race([
        self.loadPyodide({ indexURL: "/pyodide/" }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("boot-timeout")), TIMEOUT_MS),
        ),
      ]);
      // ...existing __ck_run setup...
      stopProgressTimer(100);
      self.postMessage({ type: "status", payload: "ready" });
      return pyodide;
    } catch (err) {
      stopProgressTimer(0);
      self.postMessage({ type: "error", payload: String(err) });
      loading = null; // allow retry
      throw err;
    }
  })();
  return loading;
}
```

Add a new message handler:
```js
} else if (type === "retry") {
  pyodide = null; loading = null;
  await ensurePyodide();
  self.postMessage({ type: "result", id, payload: { ok: true } });
}
```

**Hook-side (`lib/use-pyodide.ts`):**

```ts
type WorkerMsg =
  | { type: "status"; payload: "loading" | "ready" }
  | { type: "progress"; payload: number }
  | { type: "error"; payload: string }
  | { type: "result"; id: number; payload: RunResult };

export function usePyodide() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // ...existing pendingRef, idRef...

  // in onMsg:
  if (msg.type === "progress") setProgress(msg.payload);
  if (msg.type === "error") { setStatus("error"); setError(msg.payload); }
  if (msg.type === "status") {
    setStatus(msg.payload === "ready" ? "ready" : "loading");
    if (msg.payload === "ready") setError(null);
  }

  const retry = useCallback(() => {
    setError(null); setStatus("loading"); setProgress(0);
    getWorker().postMessage({ type: "retry", id: -2 });
  }, []);

  return { status, progress, error, run, retry };
}
```

**IDE-side (`components/v2/PersistentIDE.tsx`):**

```ts
// BEFORE (lines 84-87)
const STATUS_COPY: Record<"idle" | "loading" | "ready", string> = {
  idle: "Booting Python…",
  loading: "Booting Python (one-time, ~5s)…",
  ready: "press Run or use ⌘↵",
};

// AFTER
const STATUS_COPY: Record<"idle" | "loading" | "ready" | "error", string> = {
  idle: "booting python…",
  loading: "loading wasm…",
  ready: "press run · ⌘↵",
  error: "python failed to load.",
};
```

```ts
// BEFORE (lines 273-284) — status line in run bar
<div className={cn(...)}>
  {!ready && <Loader2 size={11} ... />}
  {ready ? STATUS_COPY.ready : STATUS_COPY[status]}
</div>

// AFTER — wrap in role="status" + render hairline + retry
<div role="status" aria-live="polite" className="flex flex-1 items-center gap-3">
  <span className={cn("inline-flex items-center gap-1.5 text-xs",
    ready ? "text-ink-500" : status === "error" ? "text-err" : "text-green-300")}>
    {!ready && status !== "error" && <Loader2 size={11} className="animate-spin motion-reduce:animate-none" />}
    {STATUS_COPY[status as keyof typeof STATUS_COPY] ?? STATUS_COPY.idle}
  </span>
  {!ready && status === "loading" && (
    <ProgressHairline value={progress} className="flex-1 max-w-[180px]" />
  )}
  {status === "error" && (
    <button type="button" onClick={retry} className="dojo-btn-tertiary text-xs">retry</button>
  )}
</div>
```

(`ProgressHairline` is at `components/v2/ProgressHairline.tsx` from V2.)

Lowercase the rest:
- Line 344: `"Running your code…"` → `"running your code…"`
- Line 347: `"Ran with no output."` → `"ran with no output."`

**Test checklist:**
- [ ] hard refresh `/learn/v2/...` → status reads "booting python…" then "loading wasm…", hairline animates 0→95% asymptotically, snaps to 100% on ready
- [ ] simulate slow net (DevTools throttle to "Slow 3G") → hairline keeps moving, never appears stuck
- [ ] simulate offline (DevTools offline) → 15s later, status flips to "python failed to load." with a retry button; click retry → boot starts again
- [ ] reduced motion → hairline transition still works (transitions are 140ms, within budget); spinner respects `motion-reduce:animate-none`
- [ ] `pnpm build` green

**Risks:**
- The asymptotic timer is honest UX but not a real progress bar — if Pyodide caches improve, animation might overshoot reality and snap. Acceptable: snap-to-100 on ready is the only honest endpoint.
- `loading = null` on error allows retry, but a stuck `pyodide` ref could leak. Verify on retry that fresh `ensurePyodide()` re-instantiates cleanly.

---

### PR 5: refresh-v3/05-nav-spine

**Branch:** `refresh-v3/05-nav-spine`
**Outcome:** Sticky `<SiteHeader>` with `border-b`, global `<ContinuePill>` reading `lastVisitedV2`, new `/curriculum` route, new `/lesson/resume` route. Returning user has one-keypress resume from any page; `/curriculum` becomes the canonical course outline URL.
**Estimated time:** 5h
**Depends on:** PR 0, PR 1 (`<header>` landmark from a11y baseline)

**Files to modify:**
- `components/SiteHeader.tsx` — convert from server component to **client component** (`"use client"` at top); add sticky positioning + `border-b border-ink-800`; add `<ContinuePill>` between left link and right cluster; gate progress hairline by route (lesson pages only — see N-02 contextualization in CEO §5); demote `LoginToSave` to ghost when logged-out (Marketing #6 + V2 §CTA hierarchy never fully shipped); hide `★ 0` GitHub pill when stars < 10 (Marketing #6)
- new `components/SiteHeader/ContinuePill.tsx` (~40 lines) — reads `getLastVisitedV2()`, hides if currently inside that lesson (compare against `usePathname()`), links to `/lesson/resume`
- new `app/curriculum/page.tsx` (~50 lines) — server component, reuses `<PhaseBandedRail>` with new `expanded` prop; reuses `<StatStrip>`; metadata `title: "the curriculum · promptdojo"`
- new `app/lesson/resume/page.tsx` (~25 lines) — client component, reads `getLastVisitedV2()` on mount, `router.replace` to deep step URL; fallback to `/onboarding` if no profile, `/curriculum` if profile but no progress
- `components/v2/PhaseBandedRail.tsx` + `components/v2/PhaseBandedRailClient.tsx` — accept `expanded?: boolean` prop; when true, render lesson rows under each chapter tile
- `components/GitHubStatsPill.tsx` — render `view source · committed Xh ago` (text-only) when `stars < 10`; full bracketed pill when ≥ 10; lead-with-count when ≥ 100 (Marketing #6 / Moment 8)

**Implementation highlights:**

- **`components/SiteHeader.tsx` rebuild:**
  ```tsx
  "use client";
  import { usePathname } from "next/navigation";
  import Link from "next/link";
  import FollowOnXPill from "@/components/FollowOnXPill";
  import LoginToSave from "@/components/LoginToSave";
  import GitHubStatsPill from "@/components/GitHubStatsPill";
  import CourseProgress from "@/components/v2/CourseProgress";
  import ContinuePill from "@/components/SiteHeader/ContinuePill";

  export default function SiteHeader() {
    const pathname = usePathname();
    const onLesson = pathname?.startsWith("/learn/v2") ?? false;
    const onOnboarding = pathname?.startsWith("/onboarding") ?? false;

    if (onOnboarding) {
      // Focused flow — header dimmed to wordmark only.
      return null;
    }

    return (
      <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/95 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <Link href="/" className="...wordmark style...">
            <span className="text-green-500">❯</span> promptdojo
          </Link>
          <ContinuePill />
          <nav aria-label="site" className="flex flex-wrap items-center gap-2">
            <GitHubStatsPill />
            {onLesson && <CourseProgress />}
            <LoginToSave />
            <FollowOnXPill />
          </nav>
        </div>
      </header>
    );
  }
  ```

  Wordmark slot replaces the "what is this?" eyebrow at `SiteHeader.tsx:16-22` — `/about` link is still reachable via the global footer (V2) and via the lesson breadcrumb (PR 6).

- **`components/SiteHeader/ContinuePill.tsx`:**
  ```tsx
  "use client";
  import Link from "next/link";
  import { useEffect, useState } from "react";
  import { usePathname } from "next/navigation";
  import { getLastVisitedV2, type LastVisitedV2 } from "@/lib/storage";

  export default function ContinuePill() {
    const [last, setLast] = useState<LastVisitedV2 | null>(null);
    const pathname = usePathname();
    useEffect(() => {
      setLast(getLastVisitedV2() ?? null);
      const refresh = () => setLast(getLastVisitedV2() ?? null);
      window.addEventListener("promptdojo:progress-v2", refresh);
      return () => window.removeEventListener("promptdojo:progress-v2", refresh);
    }, []);
    if (!last) return null;
    const insideThisLesson = pathname?.startsWith(
      `/learn/v2/${last.chapterSlug}/${last.lessonSlug}`,
    );
    if (insideThisLesson) return null;
    return (
      <Link
        href="/lesson/resume"
        className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-300 transition hover:text-green-400"
      >
        <kbd className="dojo-kbd">↵</kbd>
        continue · ch {/* compute from chapter slug */} · step {last.stepIndex + 1}
      </Link>
    );
  }
  ```
  (For V3, abbreviate the chapter label to the slug — `ch variables · step 4`. Computing chapter number requires the manifest TOC; defer the polish to V3.5 if it's slow to wire.)

- **`app/curriculum/page.tsx`:**
  ```tsx
  import type { Metadata } from "next";
  import { getV2Toc, getV2Chapter } from "@/lib/content-v2";
  import PhaseBandedRail from "@/components/v2/PhaseBandedRail";
  import StatStrip from "@/components/StatStrip";

  export const metadata: Metadata = {
    title: "the curriculum · promptdojo",
    description:
      "25 chapters, 624 steps. read · run · fix. free, open-source, no signup.",
    alternates: { canonical: "/curriculum" },
  };

  export default async function Curriculum() {
    const toc = getV2Toc();
    const v2ChaptersWithStepIds = await Promise.all(
      toc.chapters.map(async (entry) => {
        const detail = await getV2Chapter(entry.slug);
        return {
          meta: {
            slug: entry.slug, title: entry.title, number: entry.number,
            blurb: entry.blurb, lessonCount: entry.lessonCount,
            stepCount: entry.stepCount, estMinutes: entry.estMinutes,
            firstLessonSlug: detail?.lessons[0]?.slug ?? null,
            hasOverview: !!detail?.overview,
          },
          stepIds: detail?.lessons.flatMap(l => l.steps.map(s => s.id)) ?? [],
        };
      }),
    );
    const v2Chapters = v2ChaptersWithStepIds.map(c => c.meta);
    const stepIdsByChapter = Object.fromEntries(
      v2ChaptersWithStepIds.map(c => [c.meta.slug, c.stepIds]),
    );
    return (
      <main id="main" className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
        <div className="t-eyebrow">the whole course</div>
        <h1 className="t-section mt-3">25 chapters · 624 steps · ~12 hours</h1>
        <StatStrip className="mt-6" />
        <PhaseBandedRail chapters={v2Chapters} stepIdsByChapter={stepIdsByChapter} expanded />
      </main>
    );
  }
  ```

- **`app/lesson/resume/page.tsx`:**
  ```tsx
  "use client";
  import { useRouter } from "next/navigation";
  import { useEffect } from "react";
  import { getLastVisitedV2, loadProgressV2 } from "@/lib/storage";

  export default function Resume() {
    const router = useRouter();
    useEffect(() => {
      const last = getLastVisitedV2();
      if (last) {
        router.replace(`/learn/v2/${last.chapterSlug}/${last.lessonSlug}/${last.stepIndex}`);
        return;
      }
      const profile = loadProgressV2().profile;
      const hasProfile = profile && Object.keys(profile).length > 0;
      router.replace(hasProfile ? "/curriculum" : "/onboarding");
    }, [router]);
    return null; // empty client transition page
  }
  ```

- **`components/v2/PhaseBandedRail.tsx`** + **`PhaseBandedRailClient.tsx`** — add `expanded?: boolean` prop; thread through; when true, render lesson list under each chapter tile (data already exists in `lessons` summary). Default false (home page unchanged).

- **`components/GitHubStatsPill.tsx`** — branch on `stars`:
  ```tsx
  if (stars < 10) {
    return <a className="t-mono-meta hover:text-green-400">view source · committed {ago}</a>;
  }
  if (stars >= 100) {
    return <a className="...pill style...">★ {stars} · committed {ago}</a>;
  }
  return <a className="...current pill...">★ {stars} · committed {ago}</a>;
  ```

**Test checklist:**
- [ ] header is sticky on scroll on `/`, `/about`, `/changelog`
- [ ] header is **hidden** on `/onboarding` (focused flow)
- [ ] continue pill renders on `/about` after completing a step on a lesson; click → routes to deep step URL
- [ ] continue pill hides when on the lesson it points to
- [ ] visit `/curriculum` → renders 5 phases with all 25 chapters expanded with their lessons
- [ ] visit `/lesson/resume` with no progress → redirects to `/onboarding`
- [ ] visit `/lesson/resume` with progress → redirects to deep step URL
- [ ] GitHub pill shows "view source · committed Xh ago" when stars < 10
- [ ] `pnpm build` green; static export emits `/curriculum/index.html` and `/lesson/resume/index.html`

**Risks:**
- `usePathname()` requires the header to be a client component — increases initial JS by ~3-5 KB (next/navigation client). Acceptable trade for the resume affordance.
- Sticky header + `100dvh` lesson shell: verify the lesson page shell at `LessonShell.tsx:54` (`h-[100dvh]`) accounts for header height. If sticky header overlaps the IDE, `LessonShell` needs `h-[calc(100dvh-headerH)]`. Current header is ~40px; adjust accordingly. Easiest: keep header `position: sticky; top: 0; height: 40px;` and `LessonShell` uses `h-[calc(100dvh-40px)]`.
- `/curriculum` route adds to static export — the `output: "export"` config emits it without server runtime; verify CF Pages serves the route.

---

### PR 6: refresh-v3/06-mobile-drawer-and-breadcrumb

**Branch:** `refresh-v3/06-mobile-drawer-and-breadcrumb`
**Outcome:** Mobile users can switch chapters via a hamburger drawer; tablet (768px–1023px) gets the desktop sidebar layout; lesson breadcrumb has 4 working links instead of 1; chapter accordion row navigates to chapter overview while chevron toggles the lesson list.
**Estimated time:** 5h
**Depends on:** PR 0, PR 1 (aria-current patterns), PR 5 (header rebuild)

**Files to modify:**
- new `components/SiteHeader/Drawer.tsx` (~80 lines) — slide-in mobile drawer
- `components/SiteHeader.tsx` — add hamburger button visible `<768px`, mounts `<Drawer>`; pass curriculum data into drawer (or have drawer fetch via `getV2Toc()` directly — server-side helper, but drawer is client; pass in via prop from a parent server component or read from a build-time JSON import)
- `components/v2/LessonShell.tsx:56` — `hidden lg:flex` → `hidden md:flex` (tablet gets the sidebar)
- `components/v2/LessonShell.tsx:59` — adjust grid breakpoint similarly: `lg:grid lg:grid-cols-...` → `md:grid md:grid-cols-...`
- `components/v2/ChapterNav.tsx:71-95` — split chapter row: title becomes a `<Link>` to chapter overview; chevron becomes a separate `<button>` toggle. Add `aria-current` and `aria-expanded`.
- `components/v2/LessonStepClient.tsx:151-185` — wrap `phase`, `lesson title`, and prepend a `promptdojo` wordmark crumb in `<Link>` so all 4 nodes work

**Implementation:**

- **Mobile drawer (`components/SiteHeader/Drawer.tsx`):**
  - Slide-in from right, `position: fixed`, full height.
  - Top: wordmark + close button.
  - Section list: `curriculum · about · changelog · github · @TFisPython` (text links).
  - Below: a compact chapter list (read from `lib/generated/v2/manifest.toc.json` directly — it's a static import).
  - `Esc` closes; click outside closes; focus trap (mirror PR 1 LoginToSave focus-trap).
  - Hamburger button in `SiteHeader` is `md:hidden` (visible <768px only).

- **`components/v2/ChapterNav.tsx:71-95` — split row:**
  ```tsx
  // BEFORE: single <button> with chevron + title
  <button onClick={() => setOpenChapter(isOpen ? "" : entry.slug)} className={...}>
    <span>...chevron...{title}</span>
    {chapterDone && <Check />}
  </button>

  // AFTER: row = link to chapter overview; chevron = sibling button
  <div className={cn("flex w-full items-center text-left text-xs transition", ...)}>
    <button
      type="button"
      aria-expanded={isOpen}
      aria-label={isOpen ? `collapse ${title}` : `expand ${title}`}
      onClick={() => setOpenChapter(isOpen ? "" : entry.slug)}
      className="flex shrink-0 items-center px-1.5 py-2 hover:text-green-400"
    >
      {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
    </button>
    <Link
      href={`/learn/v2/${entry.slug}`}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex flex-1 items-center justify-between px-1 py-2",
        isActive ? "bg-ink-800 text-ink-100"
                 : chapterDone ? "text-green-400 hover:bg-ink-800/50"
                              : "text-ink-400 hover:bg-ink-800/50 hover:text-ink-200",
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="font-mono text-[10px] text-ink-500">
          {String(entry.number).padStart(2, "0")}
        </span>
        <span className="truncate">{shortChapterTitle(entry.title).toLowerCase()}</span>
      </span>
      {chapterDone && <Check size={11} className="shrink-0 text-green-700" />}
    </Link>
  </div>
  ```

  Note: contrast sweep from PR 1 already changed `text-green-700` → `text-green-400` for the row text; the `<Check />` keeps `text-green-700` (decoration).

- **Lesson links (`ChapterNav.tsx:142-153, 162-176`)** — add `aria-current`:
  ```tsx
  <Link
    href={`/learn/v2/${chapter.slug}/${lesson.slug}`}
    aria-current={isActiveLesson ? "page" : undefined}
    className={...}
  >...</Link>

  <Link
    href={`/learn/v2/${chapter.slug}/${lesson.slug}/${idx}`}
    aria-current={here ? "step" : undefined}
    className={...}
  >...</Link>
  ```

- **`components/v2/LessonShell.tsx:56,59` — tablet breakpoint:**
  ```tsx
  // BEFORE
  <aside className="hidden w-60 shrink-0 border-r border-ink-800 bg-ink-900 lg:flex lg:flex-col">

  // AFTER
  <aside className="hidden w-60 shrink-0 border-r border-ink-800 bg-ink-900 md:flex md:flex-col">
  ```

  Same for the grid: line 59 `lg:grid lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]` → `md:grid md:grid-cols-[minmax(0,420px)_minmax(0,1fr)]` (tighter prompt column on tablet, since less viewport).

  And the drawer toggle at line 92-111 changes from `lg:hidden` → `md:hidden`.

- **`components/v2/LessonStepClient.tsx:151-185` — 4-node breadcrumb:**
  ```tsx
  // BEFORE (around line 158): phase is plain text
  {phase && (
    <div className="t-mono-meta">
      phase {String(phase.number).padStart(2, "0")} · {phase.name}
    </div>
  )}
  // ...
  // lesson is plain text:
  <span className="t-mono-meta truncate">
    lesson {lessonIndex + 1} of {chapter.lessons.length} ·{" "}
    {lesson.title.toLowerCase()}
  </span>

  // AFTER: all 4 nodes link
  <div className="t-mono-meta flex items-center gap-1.5">
    <Link href="/" className="text-ink-400 hover:text-green-400 transition-colors">
      promptdojo
    </Link>
    <span className="text-ink-600">›</span>
    {phase && (
      <Link
        href={`/curriculum#phase-${phase.number}`}
        className="text-ink-400 hover:text-green-400 transition-colors"
      >
        phase {String(phase.number).padStart(2, "0")} · {phase.name}
      </Link>
    )}
  </div>
  // ...keep ch link as-is (line 165-171)...
  // lesson link (replace plain span at 173-176):
  <Link
    href={`/learn/v2/${chapter.slug}/${lesson.slug}/0`}
    className="t-mono-meta truncate text-ink-300 hover:text-green-400 transition-colors"
  >
    lesson {lessonIndex + 1} of {chapter.lessons.length} ·{" "}
    {lesson.title.toLowerCase()}
  </Link>
  ```

  Add `#phase-N` anchor IDs in `app/curriculum/page.tsx` from PR 5 (or piggyback this PR — small change to `PhaseBandedRailClient` to render `id="phase-1"` etc. on each band).

**Test checklist:**
- [ ] resize to 800px wide (tablet) → sidebar is visible (was hidden before)
- [ ] resize to 600px wide (mobile) → sidebar gone, hamburger visible in header
- [ ] click hamburger → drawer slides in from right; click chapter → routes to chapter overview, drawer closes
- [ ] inside a lesson, click chapter title in sidebar → routes to `/learn/v2/{slug}` (chapter overview), NOT toggling the accordion
- [ ] inside a lesson, click chevron → toggles accordion only, stays on current step
- [ ] lesson breadcrumb: click `promptdojo` → home, click `phase 02` → `/curriculum#phase-2`, click `ch 03` → chapter overview, click `lesson 2 of 3` → lesson root
- [ ] active chapter row has `aria-current="page"`; active step has `aria-current="step"`
- [ ] `pnpm build` green

**Risks:**
- Drawer + sticky header z-index conflict — verify drawer `z-50` > header `z-40`.
- `<aside>` at `md:` breakpoint may compress prompt column too much; verify on iPad portrait (768px). If cramped, drop the drawer toggle at `md:` and keep `lg:hidden` for the toggle, but `md:flex` for the sidebar — i.e., tablet has both sidebar AND prompt + IDE in 3-col layout. That's the spec's intent.

---

### PR 7: refresh-v3/07-repostable-hero

**Branch:** `refresh-v3/07-repostable-hero`
**Outcome:** Hero rebuilt around `<HeroBugSnippet>` as the visual centerpiece with `cursor.py` chrome label + red annotation arrow. New `$0 forever` band between StatStrip and chapter rail. 398/624 step-count discrepancy fixed (one source of truth from manifest). Per-chapter OG cards wired for `mutation` (ch07), `llm-apis` (ch13), `capstone` (ch25) using existing OG variants.
**Estimated time:** 5h
**Depends on:** PR 0

**Files to modify:**
- `components/HeroBugSnippet.tsx` — add `cursor.py` chrome label at top (mirror OG art at `app/og/launch/[name]/route.tsx:266`); add red annotation arrow `← evaluated once. every caller mutates the same list.` next to the bug line
- `app/page.tsx:94-130` — apply UI Polish §3 spacing rhythm 40 → 48 → 64 → 40 (mt-10 mb-24 → mt-12 mb-28 etc.); promote `<HeroBugSnippet>` size so it dominates iPhone 15 viewport
- `app/page.tsx:24` — fix `description` "22 chapters" → "25 chapters" (Marketing #11)
- new `components/PriceBand.tsx` (~50 lines) — viewport-tall band: big mono `$0` at `clamp(96px, 26vw, 360px)`, eyebrow `FOREVER` letter-spaced, four-token strip `no login · no streaks · no upsell · open source`
- `app/page.tsx` — insert `<PriceBand />` between `<StatStrip>` (line 162) and the `<section>` chapter rail (line 164)
- `components/StatStrip.tsx:14-20` — single source of truth verified (it already reads from `lib/generated/v2/manifest.toc.json`); audit `app/about/page.tsx:149` to ensure it uses `<StatStrip />` or imports the same manifest sum (live deployment shows 398 mismatch — likely a stale build artifact; force a fresh build by bumping a comment in manifest builder + redeploy)
- `app/learn/v2/[chapter]/page.tsx` `generateMetadata` — add per-chapter `openGraph.images` for the 3 story chapters:
  ```ts
  const OG_BY_CHAPTER: Record<string, string> = {
    "mutation-and-state": "/og/launch/wedge",
    "llm-apis": "/og/launch/ide",
    capstone: "/og/launch/capstone",
  };
  // in metadata:
  openGraph: {
    type: "article", title, description, url, siteName: "promptdojo",
    images: [{ url: OG_BY_CHAPTER[chapterSlug] ?? "/og/launch/wedge", width: 1600, height: 900 }],
  }
  ```
  (Verify exact slug for chapter 7 against `lib/curriculum/phases.ts:24` — `mutation-and-state`, not `mutation`.)
- `app/layout.tsx:7` — drop `axes: ["SOFT", "WONK"]` from `Fraunces({...})` if unused. Quick grep `font-variation-settings.*SOFT` or `WONK` — if no matches, drop. Saves 10–15 KB on the preloaded Fraunces woff2 (Performance #6).

**`HeroBugSnippet.tsx` rebuild (preserve content; add chrome + annotation):**

```tsx
export default function HeroBugSnippet() {
  return (
    <div className="overflow-hidden border border-ink-800 bg-ink-900">
      {/* cursor.py chrome label — mirror OG art */}
      <div className="flex items-center justify-between border-b border-ink-800 px-4 py-2">
        <div className="font-mono text-[11px] text-ink-500">cursor.py</div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-600">
          ai-generated
        </div>
      </div>
      <div className="relative">
        <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-ink-300"
             aria-label="ai-shipped python bug"
             style={{ fontVariantLigatures: "none" }}>
          {/* …existing code unchanged… */}
        </pre>
        {/* red annotation arrow, absolute positioned to the right of the bug line */}
        <div className="absolute right-4 top-[calc(50%-12px)] hidden font-mono text-xs text-err md:block">
          ← evaluated once. every caller mutates the same list.
        </div>
      </div>
      <div className="border-t border-ink-800 px-4 py-3 font-mono text-xs text-ink-500">
        <strong className="text-err font-mono uppercase tracking-wider">mutable default arg</strong>
        {" — python evaluates the list once at definition. every caller mutates the same list."}
      </div>
    </div>
  );
}
```

(On mobile, the absolute annotation is hidden; the bottom annotation block is the fallback. Desktop gets both — the inline annotation is the screenshot anchor.)

**`PriceBand.tsx`:**
```tsx
export default function PriceBand() {
  return (
    <section className="my-24 flex min-h-[60vh] flex-col items-center justify-center border-y border-ink-800 py-24 text-center">
      <div className="t-eyebrow tracking-[0.6em]">forever</div>
      <div className="mt-6 font-mono font-black leading-none text-ink-100"
           style={{ fontSize: "clamp(96px, 26vw, 360px)" }}>
        $0
      </div>
      <div className="mt-10 t-mono-meta flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <span>no login</span><span className="text-ink-700">·</span>
        <span>no streaks</span><span className="text-ink-700">·</span>
        <span>no upsell</span><span className="text-ink-700">·</span>
        <span className="text-green-500">open source</span>
      </div>
    </section>
  );
}
```

**Hero spacing (`app/page.tsx:94-130`):**
- Line 94 `<header className="relative mb-24 pt-8 sm:pt-14">` — keep
- Line 95 `<div className="mb-10 ...">` — wordmark eyebrow row keep
- Line 102 `<h1 className="t-hero">` — keep
- Line 107 `<p className="t-body mt-8 ...">` → `mt-12` (40 → 48)
- Line 112 `<div className="mt-10"><HeroBugSnippet /></div>` → `mt-16` (40 → 64)
- Line 116 `<div className="mt-10 ...CTAs">` → `mt-10` (keep — 64 → 40 step-down)

Net rhythm: 40 → 48 → 64 → 40 per UI Polish §3. Headline-favored.

**Test checklist:**
- [ ] iPhone 15 viewport (390×844): hero h1 + bug snippet (with `cursor.py` chrome + annotation) + CTA all visible above the fold
- [ ] desktop: red annotation appears next to bug line
- [ ] `<PriceBand>` renders ~60vh tall between StatStrip and chapter rail
- [ ] `/learn/v2/mutation-and-state/` shared on Twitter card validator → renders `wedge` OG art (not generic)
- [ ] `app/page.tsx:24` description says "25 chapters"
- [ ] StatStrip on `/about` and `/` show identical step counts (both 624 from manifest)
- [ ] Fraunces preload in DevTools → font file ~10–15 KB smaller post-`axes` drop
- [ ] `pnpm build` green

**Risks:**
- 398/624 mismatch on `live` may be a stale CF deploy of `/about`; force a fresh build by touching the StatStrip file + redeploy.
- `clamp(96px, 26vw, 360px)` for `$0` may push horizontal scroll on very narrow screens — test at 320px, fall back to `clamp(72px, 22vw, 360px)` if so.

---

### PR 8: refresh-v3/08-perf-cluster

**Branch:** `refresh-v3/08-perf-cluster`
**Outcome:** Lesson initial JS drops ~50–70 KB br by switching `rehype-highlight` from `common` languages (35) to `lowlight` python-only. CodeMirror lazy-loaded with `next/dynamic`. `Cache-Control: max-age=31536000, immutable` on `_next/static/*` and `og/*`. OG images get `Content-Type: image/png` (currently `application/octet-stream`).
**Estimated time:** 4h
**Depends on:** PR 0

**Files to modify:**
- new `lib/markdown.ts` (~40 lines) — shared `lowlight` config + helper that exports the configured `rehypeHighlight` instance
- 7 step view files — swap their per-file `import rehypeHighlight from "rehype-highlight"` for the shared one:
  - `components/v2/steps/ReadStepView.tsx:5`
  - `components/v2/steps/MultipleChoiceStepView.tsx` (no rehype; skip)
  - `components/v2/steps/FillBlankStepView.tsx:6`
  - `components/v2/steps/PredictStepView.tsx:6`
  - `components/v2/steps/FixBugStepView.tsx:6`
  - `components/v2/steps/WriteStepView.tsx:6`
  - `components/v2/steps/CheckpointStepView.tsx:6`
  - `components/v2/steps/_HintReveal.tsx:7`
  - `app/learn/v2/[chapter]/page.tsx:6` (chapter overview also uses `rehypeHighlight`)
- `package.json` — replace `"rehype-highlight": "^7.0.2"` with `"rehype-highlight": "^7.0.2"` (keep the dep; just change config) AND add `"lowlight": "^3.x"` if not auto-pulled. Drop `"highlight.js"` if no longer needed (lowlight bundles its own python grammar).
- `components/CodeEditor.tsx` (legacy v1 path) — wrap CodeMirror import with `next/dynamic({ ssr: false })`. **NOTE:** the canonical IDE is `PersistentIDE.tsx` (v2). It imports `CodeMirror` directly at the top of file; lazy-loading there breaks the `<PersistentIDE>` server-component import chain (it's a client component, so `next/dynamic` works). Wrap the CodeMirror import in `PersistentIDE.tsx:3` via `next/dynamic`.
- `public/_headers` — add immutable rules for `_next/static/*`, bump `pyodide/*` to add `immutable`, add `og/*` rules with `Content-Type: image/png`

**`lib/markdown.ts`:**
```ts
import { createLowlight } from "lowlight";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import rehypeHighlight from "rehype-highlight";

const lowlight = createLowlight();
lowlight.register("python", python);
lowlight.register("py", python);
lowlight.register("bash", bash);
lowlight.register("sh", bash);

// Pre-configured rehype-highlight: only python + bash registered.
// Saves ~50–70 KB br vs the default `common` set.
export const rehypeHighlightConfigured = [
  rehypeHighlight,
  { languages: { python, bash }, ignoreMissing: true },
] as const;
```

**Step view swap (example, `ReadStepView.tsx:5`):**
```ts
// BEFORE
import rehypeHighlight from "rehype-highlight";
// ...
<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>

// AFTER
import { rehypeHighlightConfigured } from "@/lib/markdown";
// ...
<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlightConfigured]}>
```

(Note: pass the `[plugin, options]` tuple as a single rehype-plugins entry.)

**Lazy CodeMirror (`components/v2/PersistentIDE.tsx`):**
```ts
// BEFORE (line 3)
import CodeMirror from "@uiw/react-codemirror";

// AFTER
import dynamic from "next/dynamic";
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-ink-500">
      <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
    </div>
  ),
});
```

**`public/_headers` update:**
```
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/og/*
  Cache-Control: public, max-age=86400
  Content-Type: image/png

/pyodide/*
  Cache-Control: public, max-age=31536000, immutable

/pyodide-worker.js
  Cache-Control: public, max-age=31536000, immutable
```

(Static export emits OG files with no extension; the `Content-Type: image/png` rule fixes social card previews. Twitter / Mastodon validators currently fail per Performance #5.)

**Test checklist:**
- [ ] `pnpm build` → check `out/_next/static/chunks/` — the 246 KB highlight.js chunk drops to ~75 KB br (verify via `wc -c` and `brotli -kc | wc -c`)
- [ ] lesson page initial JS drops from 520 KB br → ~290 KB br
- [ ] DevTools Network on repeat visit to `/` → `_next/static/*` files served from disk cache (304 not seen because of `immutable`)
- [ ] OG image validator (`https://cards-dev.twitter.com/validator`) shows the wedge card for `promptdojo.pages.dev`
- [ ] python code blocks in lessons still highlight correctly (keywords, strings, comments)
- [ ] non-python code blocks still render (just unstyled)
- [ ] `pnpm build` green

**Risks:**
- `rehype-highlight` + `lowlight` API: confirm against the rehype-highlight 7.x docs that the `[plugin, options]` config form works inside `rehypePlugins=[...]`. Alternative: import `rehype-highlight/lib` for direct lowlight config.
- `next/dynamic` with `ssr: false` inside `PersistentIDE.tsx` — `PersistentIDE` is already `"use client"`, so `dynamic` works. Verify the editor still mounts with ref forwarding (it should — `forwardRef` survives `dynamic` wrap).

---

### PR 9: refresh-v3/09-voice-and-system-sweep

**Branch:** `refresh-v3/09-voice-and-system-sweep`
**Outcome:** `dojo-btn-primary` everywhere instead of hand-rolled buttons. Lowercase IDE copy. Sharp corners in sidebar. New `dojo-kbd` utility applied. `text-ink-600` → `text-ink-500` for text. `★ 0` GitHub pill demoted (already shipped in PR 5; double-check). `<Lock>` lesson icon → middle dot. Tier-color invert in chapter rail.
**Estimated time:** 3h
**Depends on:** PR 0, ideally lands after PR 3 (CodeMirror theme) + PR 5 (header rebuild)

**Files to modify:**
- `components/v2/PersistentIDE.tsx:296-310` — replace hand-rolled run button className with `className="dojo-btn-primary"`. Keep the disabled treatment if `dojo-btn-primary:disabled` doesn't cover it (it does, at `globals.css:294-298`).
- `components/v2/PersistentIDE.tsx:317-319` — drop `<Terminal size={11} />` icon, replace `Output` text with `<span className="text-green-500">❯</span> stdout`
- `components/v2/PersistentIDE.tsx:322` — wrap success/error glyph: `<span className={stderr ? "text-err" : "text-ok"}>{stderr ? "✗" : "✓"}</span> ran in {ms}ms`
- `components/v2/steps/WriteStepView.tsx:66-72`, `CheckpointStepView.tsx:78-84`, `FixBugStepView.tsx:83-90`, `MultipleChoiceStepView.tsx:121-127` — replace ad-hoc `rounded-md bg-green-500 ...` submit button classes with `className="dojo-btn-primary"` (Code Quality refactor B)
- `app/globals.css` — add `.dojo-kbd` utility (UI Polish §5):
  ```css
  .dojo-kbd {
    display: inline-flex; align-items: center;
    padding: 0.125rem 0.5rem;
    border: 1px solid var(--color-ink-700);
    border-bottom: 2px solid var(--color-ink-700);
    background: var(--color-ink-900);
    font-family: var(--font-mono); font-size: 11px;
    font-weight: 600; letter-spacing: 0.05em;
    text-transform: uppercase; color: var(--color-ink-300);
    line-height: 1; border-radius: 0;
  }
  ```
- `components/v2/HomeClient.tsx:57-59,81-83,120-122` — replace inline kbd className with `className="dojo-kbd"`
- `app/page.tsx:205-207` — same replacement
- `components/v2/ChapterNav.tsx:75,144,165` — drop `rounded` everywhere in sidebar (sharp corners, brand kit)
- `components/v2/ChapterNav.tsx:201` — replace `<Lock size={10} className="text-ink-500" />` with `<span className="font-mono text-[10px] text-ink-700" aria-hidden>·</span>` (UI Polish §10)
- `components/v2/PhaseBandedRailClient.tsx:76-81` — invert tier color: `foundations: text-green-500`, `core: text-green-700`, `advanced: text-ink-500` (UI Polish §8). Bright = "start now"; dim = "future."
- `app/page.tsx:202` — `text-xs text-ink-600` → `t-mono-meta` (UI Polish §16, AA fix)
- `components/v2/PersistentIDE.tsx:321,349` — `text-ink-600` → `text-ink-500` for text; keep `text-ink-600` only for non-text decorative borders
- `components/LoginToSave.tsx:267` — `text-ink-600` → `text-ink-500` for the footnote text (placeholder ink-600 at line 227 is fine — it's decoration on an empty input)
- `app/onboarding/page.tsx` — system sweep (UI Polish §15):
  - Line 172: drop `rounded-full` on progress dots → sharp segments
  - Lines 191, 223, 259, 299: replace hand-rolled h1/h2 sizes with `t-section`
  - Line 194: `mt-4 max-w-xl text-lg text-ink-300` → `t-body mt-6 max-w-xl`
  - Lines 230-244, 265-280: replace card buttons with `dojo-card-interactive` + a `[aria-pressed=true]` selected-state CSS rule (add to `globals.css`)
  - Line 336: `text-xs ... underline` → `dojo-btn-tertiary`
- `components/HeroBugSnippet.tsx:11` — content-vs-action border discipline (UI Polish §20): `border-l-2 border-green-500` → `border-l border-ink-700` (already replaced by PR 7's chrome-rebuild — verify; if still 2px after PR 7, dial back to 1px ink-700)
- **Star-the-repo seed ask** (Marketing #5, bundled here per CEO cut list): add one sentence to `/about` after the existing free-forever paragraph (`app/about/page.tsx:262`) and to `/changelog` footer:
  > if this is the python school you wish existed, [star the repo](https://github.com/xernst/promptdojo). it's the only metric we keep.
- `components/v2/StepFooter.tsx` — visual sweep (UI Polish §14):
  - Line 74: `rounded-md` → `rounded-none`
  - Line 87: `text-[10px] uppercase tracking-widest text-ink-500` → `t-mono-meta`
  - Lines 103-118 hint button: hand-rolled → `dojo-btn-secondary`
  - Line 115: `<Lightbulb size={14} />` → `<span className="font-mono font-bold" aria-hidden>?</span>`
  - Lines 119-128 skip button: hand-rolled → `dojo-btn-tertiary` (drop the icon)

**Test checklist:**
- [ ] visual diff on `/learn/v2/...` step: run button matches the `start chapter 1` button on home (`dojo-btn-primary`); IDE output header reads `❯ stdout`
- [ ] sidebar chapter rows have sharp corners (no `rounded`); locked steps show middle-dot, not lock icon
- [ ] phase rail: foundations chapters have brightest tier label; advanced chapters dimmed
- [ ] no `text-ink-600` on text content (decoration only); `pnpm exec rg "text-ink-600" -g "*.tsx"` shows only acceptable decoration uses (placeholders, borders)
- [ ] kbd glyphs across the site (`HomeClient` + footer + `ContinuePill`) render with bottom-border-press-depth via `dojo-kbd`
- [ ] `pnpm build` green; no visual regression on `/about` or `/changelog`

**Risks:**
- The `★ 0` demote logic shipped in PR 5 — if PR 9 re-edits `GitHubStatsPill.tsx`, ensure no merge conflict.
- Onboarding sweep is the largest single-file edit in this PR. If it slips, defer onboarding-only changes to V3.5 — the rest of the sweep ships independently.

---

## Cross-cutting concerns

- **New deps schedule:**
  - PR 3: `+@codemirror/autocomplete`, `+@codemirror/commands`, possibly `+@codemirror/language`. `−@codemirror/theme-one-dark`.
  - PR 8: `+lowlight`. Possibly `−highlight.js` (lowlight bundles its own python grammar).
  - No other PRs add deps. Anything else needs CEO approval — flag in Open Questions.
- **`tsconfig.json` strict mode (`noUncheckedIndexedAccess`):** explicitly **cut** by CEO ("V4 — chase compile errors across 5 files for no observed real bug"). Do not enable in PR 0 or anywhere.
- **localStorage migration safety:** PR 0 ships a one-shot v1→v2 streak bridge in `awardPass()`. No data migration in any other PR. The `lastSeenAt` timestamp shape change is additive (optional field in `ProgressV2`) — backward-compatible.
- **Tailwind 4 `@theme` additions:** PR 9 adds `.dojo-kbd` as a bare CSS rule alongside `.cursor-blink`, not in the `@theme` block. Per the existing pattern at `globals.css:131-+` ("v2 system tokens — bare CSS, not Tailwind utilities"). Don't introduce new `@theme` colors — palette is locked.
- **Pages Functions vs static:** every change must remain static-export compatible. PR 5's `/curriculum` and `/lesson/resume` are both static (server component reading build-time JSON, and client component reading localStorage respectively). No `next/headers`, no server actions, no dynamic routes that depend on request data. `LoginToSave` already uses Pages Functions at `/api/save` and `/api/load` — leave alone.
- **Build-time data freezing:** no new build scripts. The `lib/generated/v2/manifest.toc.json` + per-chapter JSON are emitted by `scripts/build-content-v2.mjs` (already runs in `predev`/`prebuild`). Per-chapter OG metadata in PR 7 is computed at render time from existing data.
- **`/curriculum` SEO:** PR 5 makes it a static page indexable by Google. Add to `app/sitemap.ts` if that file enumerates routes (verify; if it auto-discovers, no action).
- **`<details>` legacy course disclosure removal:** UI Polish §misc had a "trivial cleanup" suggestion. CEO **cut** ("if there's room in pick #9; otherwise V4"). PR 9 has minimal headroom — leave for V4.

---

## Rollback playbook

If a PR ships broken (a user-facing regression appears on prod within an hour of deploy):

1. `git log --oneline -5` to find the merge SHA.
2. `git revert <sha> --no-edit` (creates a new revert commit; preserves history).
3. `git push origin main`.
4. Cloudflare Pages auto-redeploys the previous green build; takes ~3-5 minutes.
5. Watch the CF deploy log: `wrangler pages deployment list --project-name promptdojo` (or the CF dashboard).
6. Smoke-test prod: `curl -I https://promptdojo.pages.dev/learn/v2/variables/naming-things/0` returns 200; load in browser; complete one step.
7. Open a follow-up issue capturing the root cause; do not re-ship the same PR until the issue is fixed in a new branch.

For PR 0 specifically (data correctness), if a regression occurs **after merge** that loses streak data:
- Revert immediately.
- Existing v1 + v2 keys are untouched (PR 0 only changes which writes happen). Reverting restores the broken-but-stable status quo (XP silently lost, but streak data not corrupted).
- Do not attempt forward-fix on prod — diagnose locally, ship a new PR.

---

## Risks I flagged but the CEO accepted (paper trail)

- **Real mobile editor cut.** PR 6 ships the drawer, not a real mobile editor. Mobile users on `write/fix/checkpoint` steps still get a partially-broken IDE. CEO accepted: "$0 budget, builder audience has laptops."
- **No autocomplete in PR 3.** CEO cut Pyodide-introspection autocomplete (V4). Static dictionary also cut for V3 — the brackets + indent + theme is the IDE-feel landmark. Implication: tab-press in editable file inserts spaces but doesn't suggest `print(`.
- **No run history, no stop button, no lint squiggles.** CEO cut the IDE polish cluster. Implication: `while True:` still kills the tab; syntax errors only surface on Run, not while typing.
- **No SearchPalette `⌘K`.** CEO cut: "no audience volume yet." Implication: 624 steps remain non-searchable.
- **No keyboard cheatsheet `?` modal.** CEO cut to V4. Implication: `⌘↵` and `⌘⇧B` discoverability is poor.
- **Per-chapter "thesis URL" pages cut.** PR 7 ships only the 3 hand-designed OG cards (ch07/ch13/ch25); the 22 templated cards are V3.5 / V4.
- **No noUncheckedIndexedAccess strict-mode upgrade.** Code Quality #3 cut by CEO; index-access bugs may slip through static checks.
- **`StepFooter` skeleton rebuild deferred.** Navigation pick #7 (prev step + ⇧↵ advance) is **cut** — not in CEO's 9 picks. The orphan `components/v2/StepFooter.tsx` stays orphaned until V3.5.
- **No lesson chrome workspace rebuild.** Visual Storytelling §4 cut. Implication: prompt and IDE panes still asymmetric.
- **Pyodide service-worker cache cut.** Performance #14. Repeat-visit boot still costs network for `pyodide.asm.wasm` on cache eviction.
- **`react-markdown` runtime keep.** CEO cut the build-time markdown render (Performance #4). PR 8 swap to `lowlight` saves 50–70 KB but the bigger 90-110 KB win sits on the table for V4.
- **Test suite cut.** No tests for `_grader.ts`, `home-state.ts`, `streaks.ts` in V3 ship list. The PR 0 bug being caught by a streak test is the cited justification — CEO parked as `v3.5/tests-foundation`. Implication: PR 0 ships untested.

---

## Things explicitly NOT done in this plan (echo CEO cuts)

- Real mobile editor (3-week project; ship the gate).
- `SearchPalette` cmd-K.
- 25 templated per-chapter OG cards.
- Per-chapter "thesis URL" pages (Marketing #7 — 25 thesis lines).
- Capstone agent-trace home band (one viewport-tall band per home; `$0` wins).
- Run history in IDE.
- Lint squiggles, stop/abort button, service-worker cache for Pyodide.
- Pyodide-introspection autocomplete (static dict also cut).
- Editable ranges for `fix` steps.
- `noUncheckedIndexedAccess` tsconfig sweep.
- Test suite for graders/state/streaks.
- About page 5-spread rebuild + chapter-index 60/40 asymmetric.
- Lesson chrome workspace rebuild.
- Site footer rebuild (3-row global footer).
- Light mode.
- `/settings` route + JSON export/import.
- Auth / sync / cross-device progress.
- AI tutor / Copilot panel.
- Keyboard `?` cheatsheet + vim-style `g h` chords.
- Pre-render markdown at build time.
- IA refactor (drop `/learn/v2/` prefix; fold legacy `/learn/[chapter]` route).

---

## Estimated total time

- **PR 0:** 2.5h (data correctness — non-negotiable)
- **PR 1:** 2.5h (a11y baseline)
- **PR 2:** 8h (traceback view)
- **PR 3:** 5h (CodeMirror theme + brackets + indent)
- **PR 4:** 8h (Pyodide hairline + retry)
- **PR 5:** 5h (sticky header + curriculum + resume)
- **PR 6:** 5h (mobile drawer + 4-node breadcrumb)
- **PR 7:** 5h (repostable hero + $0 band + OG cards)
- **PR 8:** 4h (perf cluster)
- **PR 9:** 3h (voice + system sweep)
- **Total: ~48h** (~9 evenings of focused work)

**Reality check:** solo founder + Cloudflare Pages deploy cycle adds ~5–10 min per PR for verification (push to preview, smoke-test, merge, watch prod build, smoke-test prod). 10 PRs × 8 min = ~80 min of pure deploy-watch. Add a 20% planning/research buffer on top of code time. **Realistic budget: 55–60h across 8–10 evenings over two weeks.**

**Plan A (CEO):** PRs 0–6 in week 1 (38h — IDE + nav cluster, founder-named priority). PRs 7–9 in week 2 (12h).
**Plan B (if week 1 slips):** drop PR 4 (Pyodide hairline, 8h) to V3.5. Boot UX still reads as broken without it, but PRs 1/2/3 individually move the needle more per dev-hour.

---

## Open questions for the CEO

None blocking. One flag:

1. **`/curriculum` page header — is the wordmark crumb necessary on `/curriculum`?** PR 5 doesn't add a `<LessonBreadcrumb>` to `/curriculum`; the global `<SiteHeader>` carries the wordmark→home affordance. If you want a phase-specific eyebrow ("part of the curriculum") on each phase band, that's a 15-min add — flag if it's wanted.

2. **PR 7's $0 band placement — between StatStrip and chapter rail (CEO §pick7), OR after the chapter rail before the legacy disclosure?** Both work; the spec says "between StatStrip and chapter rail (or after the rail, before the legacy-course details disclosure)." Plan defaults to the first placement (between StatStrip and chapter rail). Confirm or correct.

That's it. Build order is locked. PR 0 ships Monday morning before anything else.

---

**Head of IT**
**Plan date:** 2026-05-06
**Implementation handoff:** senior dev, branches `refresh-v3/00-*` through `refresh-v3/09-*`
**Posture:** Pristine = data correctness + IDE + navigation + repostability. PR 0 is the gate. The rest sequences for dependency, not preference.
