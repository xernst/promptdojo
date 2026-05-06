# UX Architecture v2 — make the curriculum visible

**Auditor:** ArchitectUX (IA / Architecture Lead)
**Date:** 2026-05-06
**Scope:** Information architecture, curriculum hierarchy, progress data model, IA-native nav, prereqs/skills/time surfaces, URL structure verdict.

> Build on Phase 1 (`design-kit/audit/06-ux-architecture.md`) — do not repeat. This report addresses the strategic-ask the CEO **deferred** in Phase 1: "make this feel like a real, structured course." The bet is on **curriculum visibility**, not new chrome.

---

## The architectural bet in one sentence

**Phases become a real navigational unit, the flat 25-card grid is replaced by a single canonical `/curriculum` tree page that doubles as the home-page chapter section, and the existing `Chapter.lessons[].prerequisites` + `Lesson.estMinutes` fields stop being dead schema and start rendering — no new data, no new routes beyond `/curriculum`, no auth, no backend.**

Codecademy and Boot.dev don't feel structured because they have more data than us — they feel structured because they *show the data they have*. We have phases (`app/about/page.tsx:25-55`), lesson-level `estMinutes` (`lib/content/schema.ts:259`), `prerequisites` (`schema.ts:260`), and `step.concept` (`schema.ts:122`). None of it ships to the user. That is the entire wedge.

---

## Site map (proposed)

```
/                        home — hero + welcome-back + phase-banded curriculum tree (collapsed)
/curriculum              standalone full-tree page (expanded by default; deep-linkable, indexable)
/about                   unchanged (the "why")
/start                   /onboarding renamed (Phase 1 proposal — adopt)
/learn/v2/[chapter]/                     unchanged URL (verdict §URL)
/learn/v2/[chapter]/[lesson]/[step]/     unchanged URL (verdict §URL)
/lesson/resume           server-side 302 to lastVisitedV2 (NEW; one server file, two lines)
```

**What changed vs Phase 1 site map:**
- Adds `/curriculum` as the canonical course-outline page. Single source of truth for the tree.
- Adds `/lesson/resume` as a stable shareable "continue" URL — no localStorage read needed at the link site.
- Does **not** flatten `/learn/v2/...` (see verdict §URL — CEO already cut this; I agree, with one nuance).
- Does **not** add a `/phase/[n]` route — phases are bands inside `/curriculum`, not first-class pages. Premature taxonomy.

---

## Curriculum-tree page (centerpiece)

### Route
`/curriculum` — static, prerendered at build via `generateMetadata` + a single Server Component reading `getV2Toc()` and `getV2Chapter(slug)` for each chapter (already what `app/page.tsx:39-55` does).

### Component spec (high-level, no JSX)
A vertically-banded tree with 5 phase sections. Each phase is a band; each chapter is a row inside its band; each row expands inline to reveal its lessons.

**Hierarchy rendered:**

```
PHASE 01  · foundations          · ch 01–07  · ~ X min · N% done
  ├ ch 01  variables             · 3 lessons · 26 steps · ~18 min · ✓ 67%
  │   ├ l01 naming-things        · 8 steps   · ~6 min  · ✓ done
  │   ├ l02 reading-types        · 9 steps   · ~6 min  · ◐ in progress
  │   └ l03 mutating-vs-rebinding· 9 steps   · ~6 min  · ○ locked (prereq: l02)
  ├ ch 02  functions             · …
  …
PHASE 02  · real python          · ch 08–12  · …
…
```

Three render layers:
1. **Phase band header** (always visible) — phase number, name, chapter range, aggregate progress (% complete = passed-steps / total-steps), aggregate est. minutes.
2. **Chapter row** (always visible) — chapter number, title, lesson/step counts, est. minutes (sum of `lesson.estMinutes`), progress ring or %, status icon (locked/available/in-progress/done), and a chevron toggle.
3. **Lesson list** (revealed when chapter row expanded; expanded-by-default for the active chapter) — lesson number, title, step count, est. minutes, status icon, deep link to `/learn/v2/[chapter]/[lesson]/0`.

State: which chapters are expanded → URL hash (`#ch01`, `#ch02`) so a shared `/curriculum#ch07` link lands a teammate on Mutation. Server can render every chapter expanded if `?expand=all` is set.

### Data needs
**All already authored:**
- `getV2Toc()` → 25 chapter entries (`lib/generated/v2/manifest.toc.json:4`).
- `getV2Chapter(slug)` → `chapter.lessons[].slug, title, estMinutes, prerequisites, steps.length, xpTotal` (`schema.ts:256-264`).
- `loadProgressV2().steps` → per-step `status` for completion math (`storage.ts:137,228-258`).
- `loadProgressV2().completedChapters` for chapter-done rollup (`storage.ts:146`).

**One new derived value (computed, not stored):**
- `chapter.estMinutes` = `sum(lesson.estMinutes)` — derive in `lib/content-v2.ts` or in a new `lib/curriculum-tree.ts` helper. Do not add to schema; chapter-est is a view concern.

**One thing missing from the manifest TOC** (`schema.ts:297-305`): `lessonCount` and `stepCount` are exposed but `estMinutes` rollup is not. Add `estMinutes: number` to `ChapterTocEntry` so the home page can render time without forcing a full chapter fetch. ~5 lines in `scripts/build-content-v2.mjs` + 1 line in `schema.ts`.

### How it differs from current home / learn
- **vs current home** (`app/page.tsx:152-204`): Today's home is a flat 3-column card grid of 25 chapters with no phase grouping, no lesson list, no time, no progress, no prereq visibility. It signals "blog index," not "course." The new `/curriculum` shows the *whole course at once*, banded by phase, with progress per row. Same component embeds on `/` (collapsed by default) and on `/curriculum` (expanded by default) — one component, two mount points.
- **vs current `/learn/v2/[chapter]`** (`app/learn/v2/[chapter]/page.tsx:130-154`): Today's chapter overview shows a flat lesson list for *one* chapter. The new tree shows everything. Chapter overview stays as-is (it's the "intro narrative" surface) — `/curriculum` is the "see the whole course" surface. Different jobs.
- **vs `/about` phases** (`app/about/page.tsx:25-55`): About narrates phases as marketing prose. `/curriculum` makes them navigational. About becomes the "why," curriculum becomes the "what."

**Critical:** define phases in **one place**, `lib/curriculum/phases.ts`, as a static map `{phase: number, name: string, chapterSlugs: string[]}`. Both `/about` and `/curriculum` import from it. Today the phase→chapter mapping lives only in `/about` JSX (`app/about/page.tsx:26-54`) — duplicating it in `/curriculum` would guarantee drift on the next chapter add.

---

## Progress data model

### What we have today
From `lib/storage.ts:133-148`:

```ts
type ProgressV2 = {
  schemaVersion: 2;
  userId: string;
  profile: Partial<UserProfile>;
  steps: Record<string, StepProgress>;   // status, attempts[], hintsUsed, draft, firstSeenAt, passedAt
  lessons: Record<string, LessonProgressV2>; // startedAt, completedAt, abandonedAt
  streak: StreakState;                   // current, longest, embers, frozenFlames, totalXp, todayXp, lastActivityDate
  lastVisitedV2?: { chapterSlug, lessonSlug, stepIndex };
  conceptsTouched: string[];
  completedChapters?: string[];
  createdAt: string;
};
```

We already track: total XP, streak, last-activity-date, longest streak, concepts touched, per-step pass timestamps, per-lesson started/completed timestamps, last-visited deep link, completed chapters.

### What we need to add (with type signatures)

The CEO ask listed: time-spent-per-chapter, last-active-timestamp, longest-session, total-XP, streak, milestone-reached. Mapped against current state:

| Asked-for | Status | Action |
|---|---|---|
| total-XP | ✅ `streak.totalXp` (`storage.ts:14`) | none |
| streak | ✅ `streak.current/longest` | none |
| last-active-timestamp | ⚠️ implicit in `streak.lastActivityDate` (date only, no time) | upgrade to ISO timestamp; add `lastSeenAt: string` at the `ProgressV2` root, written on every `updateProgressV2` call |
| time-spent-per-chapter | ❌ not tracked | add `chapterTimeMs: Record<string, number>` |
| longest-session | ❌ not tracked | add `longestSessionMs: number` |
| milestone-reached | ⚠️ partial via `completedChapters[]` | add `milestones: Milestone[]` (typed events) |

Proposed additive shape (all optional → backward-compatible, no migration):

```ts
type Milestone =
  | { kind: "phase-complete"; phase: number; at: string }
  | { kind: "chapter-complete"; chapterSlug: string; at: string }
  | { kind: "first-lesson"; at: string }
  | { kind: "streak-7"; at: string }
  | { kind: "streak-30"; at: string };

type SessionTick = {
  startedAt: string;          // ISO
  endedAt: string;            // ISO; closed on idle ≥ 60s or unload
  chapterSlug?: string;       // best-effort attribution from lastVisitedV2
  ms: number;
};

type ProgressV2 = {
  // …existing fields unchanged…
  lastSeenAt?: string;                       // NEW — written on every updateProgressV2
  chapterTimeMs?: Record<string, number>;    // NEW — slug → cumulative ms
  longestSessionMs?: number;                 // NEW
  totalSessionMs?: number;                   // NEW — for "you've spent N hours" copy
  milestones?: Milestone[];                  // NEW — append-only
  sessions?: SessionTick[];                  // NEW — keep last 30, then drop
};
```

Two new modules pull their weight:

- **`lib/sessions.ts`** — a single `useSessionTracker(chapterSlug?)` hook called from `LessonShell.tsx:54`. Tracks an active tick; closes it on `visibilitychange`/`beforeunload`/idle≥60s; on close updates `chapterTimeMs[slug]`, `longestSessionMs`, `totalSessionMs`. Pure client. ~80 lines.
- **`lib/milestones.ts`** — a single `recordMilestone(p, m)` function called from `markChapterCompleteIfNew` (`storage.ts:324`) and from streak-update sites. Also exports `evaluateMilestones(p): Milestone[]` for completeness checks. ~50 lines.

### Migration plan
**No schema migration is needed.** All four new fields are optional. `loadProgressV2` (`storage.ts:175-203`) already merges parsed JSON over a `freshV2()` seed via spread, so missing keys read as `undefined`. The "migration" is one Edit to `freshV2()` (`storage.ts:157-169`) to default the new fields to empty values, plus an optional one-time backfill on first read after release: if `chapterTimeMs` is missing, write `{}`; if `milestones` is missing, derive `chapter-complete` events from `completedChapters[]` with `at = lessons[lastLesson].completedAt`. ~25 lines, idempotent, runs once.

This avoids the localStorage-versioning trap: do not bump `schemaVersion: 2` to `3`. Additive fields are free.

---

## Welcome-back state

### Detection logic
Today's `HomeClient.tsx:38-55` has three branches: `loading` → `new-user` (no `profile.name`) → `in-progress` (has name). The `in-progress` branch falls back to `{variables, naming-things, 0}` if `lastVisitedV2` is missing — meaning a user who finished onboarding but never opened a lesson sees "welcome back ch 01 · variables" before they've ever visited a lesson. Phase 1 flagged this (`audit/06-ux-architecture.md:123,129`).

Proposed five-state machine (replaces the three-state in `HomeClient.tsx:33-36`):

```ts
type Resolved =
  | { kind: "loading" }
  | { kind: "guest" }                                       // no profile.name
  | { kind: "onboarded-not-started"; firstChapter: string } // name set, lastVisitedV2 missing, completedChapters empty
  | { kind: "in-progress"; target: LastVisitedV2; chapter: ChapterMeta; lessonTitle: string; stepNumber: number; totalSteps: number }
  | { kind: "phase-just-completed"; phase: number; nextChapter: ChapterMeta; completedAt: string }  // last milestone is phase-complete and < 7d old
  | { kind: "returning-after-break"; daysAway: number; target: LastVisitedV2 };  // lastSeenAt > 3d ago
```

Detection precedence (highest → lowest):
1. `phase-just-completed` if `milestones[last]` is `{kind:"phase-complete"}` and `at` is within 7 days.
2. `returning-after-break` if `lastSeenAt` is > 3 days ago and `lastVisitedV2` exists.
3. `in-progress` if `lastVisitedV2` exists.
4. `onboarded-not-started` if `profile.name` exists but no `lastVisitedV2`.
5. `guest` otherwise.

### UI states
Six islands, one component (`HomeClient.tsx`). Specs (no copy — that's Brand Guardian's job):

- **`loading`** — skeleton card, same height as the largest variant. Already correct (`HomeClient.tsx:57-64`).
- **`guest`** — primary CTA pill linking to `/start` (a.k.a. `/onboarding`).
- **`onboarded-not-started`** — primary pill linking to `/learn/v2/[firstChapter]/[firstLesson]/0`. Distinct copy from "welcome back" — this user has not technically been back.
- **`in-progress`** — pill showing chapter number, lesson title, "step N of M". Two CTAs: "resume" (primary, deep link) and "see all chapters" (secondary, `#chapters` anchor).
- **`phase-just-completed`** — celebratory variant. Shows phase name and offers "start phase NN" CTA into the next phase's first chapter. This is the only piece of *new* IA-affordance — converts the existing `markChapterCompleteIfNew` event into a visible payoff.
- **`returning-after-break`** — same shape as `in-progress` but with a soft re-orient prefix. The diff is one line of copy + a different icon. Detection alone earns its keep — without it we tell a user who's been gone 11 days that they're "in progress."

### Component spec
`HomeClient.tsx` already exists. Refactor in-place — no new file. Function signature stays the same; replace the `useEffect` block with a single `resolveHomeState(progress, fallback)` pure function in `lib/home-state.ts` (testable, no DOM). Render-side branches go from 3 to 6. Net add: ~80 lines, ~30 deleted. Same `<Link>` pattern; reuse the existing card chrome from `HomeClient.tsx:69-86,98-117`.

---

## Breadcrumbs + lesson nav

Phase 1 already proposed a TopBar (`audit/06-ux-architecture.md:72`) that the CEO **cut** from V1 (`audit/CEO-vision.md:107`). I won't relitigate the TopBar. But the *breadcrumb itself* is data, not chrome — it can ride inside the existing in-lesson header at `LessonStepClient.tsx:152-159` without a new global bar.

**Today** that strip shows `CHAPTER TITLE   3 / 9`. **Proposed**:

```
ch 03 · lists and dicts   ›   l02 · reading-types   ›   step 4 / 9
```

Three nodes:
1. `ch 03 · lists and dicts` — `<Link href="/learn/v2/lists-and-dicts">`. Reactivates the deep-route that the redirect at `app/learn/v2/[chapter]/page.tsx:65-68` makes only conditionally accessible. (See URL verdict for the implication.)
2. `l02 · reading-types` — `<Link href="/learn/v2/lists-and-dicts/reading-types/0">`. Lesson-root.
3. `step 4 / 9` — text only. Optionally a tiny dotted progress (•••○○○○○○) that doubles as the existing progress bar at `LessonStepClient.tsx:205-221`.

Three benefits, no new chrome:
- A user who tabs back into the page sees *where they are* in the tree.
- "Back to chapter overview" stops being a hidden affordance (Phase 1 §nav-missing-2).
- Search/share URLs become legible — every breadcrumb node is a real route the user can copy-paste.

**File:** `components/v2/LessonStepClient.tsx:152-159` only. ~15 lines edited. Reuses existing `chapterTitle`, `lessonTitle` props.

---

## Prerequisites

### Soft-suggest vs hard-block — decisive recommendation

**Soft-suggest. Always render. Never block.** Reasoning, in order:

1. **Audience-over-completion** is Josh's stated validation metric (`memory_validation_metrics`). Hard-blocking ch07 until ch01–06 are ≥80% done is a friction tax on the people we want most: the "I already code in JS, I'm here for the LLM/MCP track" subset. They'll bounce.
2. **The course is already strictly authored** in chapter order; users intuit this from `ch 01`/`ch 02` numbers in cards. The numbering *is* the suggestion. The schema's `lesson.prerequisites` field (`schema.ts:260`) is currently empty across all 25 chapters — meaning hard-blocking would require authoring prereqs that don't exist yet (week-scale content work for a wedge that may not pay off).
3. **Boot.dev hard-blocks; Codecademy soft-suggests.** Boot.dev gets to do that because they monetize completion. We don't.
4. **The fastest signal of "real course" is a visible prereq, not an enforced one.** A `prereq: ch04 loops` chip on a locked-looking lesson row reads as structured. Clicking it anyway and bouncing into the lesson reads as autonomous.

### Visual surfaces (data already exists, just unused)
- **Lesson row in `/curriculum`:** if `lesson.prerequisites.length > 0`, show a `prereq: ch04/loops/predict-output` chip beneath the title. Not a button — a label.
- **Chapter row in `/curriculum`:** derive `chapterPrereqs` from `min(prereq.chapterSlug)` across all its lessons. Render same chip.
- **No state changes.** Locked-state styling can mirror the chapter `completedChapters[]` rollup: chapters whose required prior chapter is `< 50% complete` render at 60% opacity with a small unlock-on-progress hint. Click still works.

### What this requires from authoring
The `prerequisites` arrays are empty today. **Don't backfill all 25 chapters in this audit cycle.** Define a default convention in `lib/content-v2.ts`: if `lesson.prerequisites` is empty, treat the previous lesson in the same chapter as the implicit prereq, and the previous chapter's last lesson as the implicit cross-chapter prereq. Authors override by writing the array. Zero migration; ships chip rendering on day one.

---

## Skill / outcome surface

### Verdict on the schema field
**Confirmed: `learnedSkills` does not exist in the schema.** Searched `lib/content/schema.ts` — only `concept` (per-step, `schema.ts:122`) and `prerequisites` (per-lesson, `schema.ts:260`) exist. The CEO ask asked me to "verify if `learnedSkills` exists" — it doesn't.

The closest existing surface is **`step.concept`** (`schema.ts:122`), which is a free-form string per step and *is* tracked at runtime as `progress.conceptsTouched[]` (`storage.ts:141,247-251`). A user *already accumulates a list of concepts* — we just never show it.

### Two-tier proposal (no schema change)
**Tier 1 — derive, don't author (ships this week):**
- For each chapter, compute `learnedSkills: string[]` = the unique `step.concept` values across that chapter's steps. Already in the build pipeline mentally — add ~10 lines to `scripts/build-content-v2.mjs` to emit this onto the chapter manifest.
- Render on `/curriculum` chapter-row expansion as a "you'll learn:" chip row.
- Render on `/learn/v2/[chapter]` overview page beneath the blurb (`app/learn/v2/[chapter]/page.tsx:93-101`).
- Render the user's *own* `conceptsTouched[]` count as "X of Y skills" on `/curriculum` chapter rows. Free progress signal.

**Tier 2 — author-defined (V2, when content has settled):**
- Optional `Chapter.learnedSkills?: string[]` field in `schema.ts:266-282`. When present, override the derived list. Authors add 3-6 hand-curated outcome statements per chapter (Codecademy-style).
- Single zod-schema line plus build-script pass-through.

Tier 1 is sufficient for the "real course" signal. Tier 2 is a brand polish that earns its keep when 25 chapters become 35 and curation matters.

---

## Time / difficulty estimates

### Time
**Already authored** — `Lesson.estMinutes` (`schema.ts:259`) defaults to 6 and is in every lesson manifest (`lib/generated/v2/chapters/variables.json` confirms). Currently rendered **nowhere** in the UI.

Three cheap surfaces, all use the same value:
- `/curriculum` lesson row: `~6 min` after the step count.
- `/curriculum` chapter row: `~18 min` (sum, derived). Add `estMinutes` to `ChapterTocEntry` (5 lines, build-time) so home cards can render it without a chapter fetch.
- `/learn/v2/[chapter]` lesson list (`app/learn/v2/[chapter]/page.tsx:135-152`): add a `~6 min` column.
- Phase band header in `/curriculum`: `~ 2.5 hr` total (sum across phase chapters). The single most "real course" signal of all of these — phases get gravity when they have a budget.

### Difficulty
**Not authored. Do not author yet.** A 1-3 dot difficulty per lesson is a Codecademy crutch when courses are 100+ items; we have 25 chapters and `phase` already does the difficulty work for free (foundations easier, capstone hardest). Adding per-lesson difficulty would require:
- A new schema field (`Lesson.difficulty: 1|2|3`).
- 60+ author judgments across content-v2.
- A taste call on what "hard" means at promptdojo scale.

**Park.** If the `/curriculum` page lands and users still ask "is this hard?", *then* author difficulty. Don't pre-build a knob no one's reaching for.

---

## URL structure migration verdict

The CEO **cut** the v2-prefix flatten in V1 (`audit/CEO-vision.md:38-39`) because there's no organic traffic to migrate and the refactor touches 4 component files + sitemap + redirects. I agree with the cut — but with one nuance:

**Keep `/learn/v2/...` for lesson-step URLs. Add `/curriculum` and `/lesson/resume` as net-new routes. Don't touch the existing tree.**

This buys most of the "real course" feeling at none of the migration cost:
- The home page link from a chapter card stays `/learn/v2/[chapter]` — fine. The user's mental model is "I'm on chapter 7," not "I'm on `/learn/v2/`."
- `/curriculum` becomes the *shareable* URL — the one that gets indexed, the one a teammate gets pasted in Slack. It does not contain `v2`. Press appears clean.
- `/lesson/resume` is a stable continue-link that hides the deep `/learn/v2/.../[step]/` path entirely from anyone sharing it.

**Verdict on the 0-indexed step problem** (`audit/06-ux-architecture.md:25`): also park. Same reasoning as the CEO. The "step 3 / 9" UI text in `LessonStepClient.tsx` already 1-indexes the visible counter; the URL leak is cosmetic until traffic exists. When the IA refactor ships in V2, fold the 1-indexing in then.

---

## Quick wins (< 1 day)

1. **Render `lesson.estMinutes` everywhere it's already authored.** Three sites: `/curriculum` (new), `app/learn/v2/[chapter]/page.tsx:142-150`, home chapter cards (`app/page.tsx:180-183`). Single field, ~10 lines per site, biggest "this is a real course" hit per minute spent.
2. **Add `lib/curriculum/phases.ts`** — single source of truth for phase→chapter mapping. Replace the inline `phases` array in `app/about/page.tsx:25-55` with an import from this module. Two-line refactor.
3. **Define `lib/home-state.ts`** with the 6-state machine. Wire `HomeClient.tsx:41-55` through it. Fixes the "welcome back ch01" false positive flagged in Phase 1.
4. **Add `lastSeenAt: string` to `ProgressV2`** and write it inside `updateProgressV2` (`storage.ts:211-218`). One line. Unlocks "returning-after-break" and "you've been here X days."
5. **Breadcrumb upgrade in `LessonStepClient.tsx:152-159`** — replace `CHAPTER TITLE   3 / 9` with the three-node version. ~15 lines.
6. **Derive `chapter.learnedSkills` at build time** from `step.concept[]`. Add to chapter manifest. Render on `/learn/v2/[chapter]` overview body (`app/learn/v2/[chapter]/page.tsx:101`) and on `/curriculum` rows.
7. **Add `/lesson/resume` route** — `app/lesson/resume/page.tsx`, client component reads `getLastVisitedV2()`, redirects via `router.replace`. Fallback to `/`. ~25 lines, ~1 hour. Now the resume URL is shareable across devices (paste into other browsers — onboarding flow needed for actual cross-device, but the URL becomes the primitive).

---

## Strategic bets (week-scale)

1. **Ship `/curriculum` as the centerpiece.** New file: `app/curriculum/page.tsx`. New component: `components/v2/CurriculumTree.tsx` (~250 lines). Adds the single most "real course" signal in one route. Embeds collapsed at `app/page.tsx:152-204` — same component, two mount modes (`mode="overview" | "full"`).
2. **Wire the progress data model additions.** `lib/sessions.ts` (~80 lines) + `lib/milestones.ts` (~50 lines) + 4 new optional fields in `ProgressV2`. Backward-compatible. Unlocks all 6 home states *and* future "you've spent N hours" copy.
3. **Soft-suggest prereqs as chips.** `/curriculum` lesson rows show `prereq:` chips derived from `lesson.prerequisites` (with sensible defaults when empty). No blocking, no schema migration. ~40 lines.
4. **Render phases as bands in `/curriculum`.** Centerpiece UX moment — phases stop being a marketing-page list and become navigational. Drives directly off `lib/curriculum/phases.ts`. ~50 lines of new component logic.

---

## Files to delete / consolidate

**Delete:**
- Inline `phases` array at `app/about/page.tsx:25-55` — replaced by `lib/curriculum/phases.ts` import.
- `HomeClient.tsx:53-54` fallback branch (the "has name, no lastVisited" case) — replaced by explicit `onboarded-not-started` state.

**Consolidate:**
- Lesson-row rendering shows up at `/curriculum` (new), `app/learn/v2/[chapter]/page.tsx:135-152` (existing), and the sidebar accordion in `components/v2/ChapterNav.tsx:96-100` (existing). All three render the same data with different chrome. After `/curriculum` ships, extract a `<LessonRow>` primitive in `components/v2/curriculum/LessonRow.tsx` and have all three import it. Net delete: ~60 lines of duplicated JSX. (Defer until the second touch — the CEO's principle from `audit/CEO-vision.md:41` — but flag now so the second author doesn't build a fourth copy.)
- `chapter` card rendering at `app/page.tsx:159-202` and the upcoming `/curriculum` rows. Same consolidation pattern. Same defer rationale.

**Don't delete (Phase 1 already proposed; CEO cut for V1):**
- `/learn/[chapter]/...` legacy v1 routes — the CEO parked legacy deletion for V2 (`CEO-vision.md:101`). I agree.
- `components/v2/StepFooter.tsx` — orphan flagged in Phase 1; re-flag here. 157 lines, never imported. Free deletion. *Move into one of the quick wins above if it fits a sprint.*

---

## Coda — what this report is NOT proposing

- Not a `/phase/[n]` route. Phases are bands, not pages.
- Not auth, not cross-device, not a backend. All progress stays in localStorage.
- Not a difficulty system. Phase ordering already does that work.
- Not a hard prereq lock. Soft suggestion only.
- Not a TopBar / mobile drawer / settings page — Phase 1 proposed; CEO cut for V1; staying cut.
- Not a 0→1 step-index URL fix. Park with the CEO's V2 IA refactor.
- Not new copy for any state. Brand Guardian owns voice; this report is shapes and data.
- Not visual specs. UI Designer owns chrome; this report is what surfaces exist and what data they bind to.

The bet: render the data we already have, in one tree, banded by the phases we already wrote, on a route called `/curriculum`. Then make `welcome back` know more than `name + lastVisited`. That is the difference between "a free course" and "a real, structured course," and it ships in days, not weeks.

---

**ArchitectUX**: IA / Architecture Lead
**Audit date**: 2026-05-06
**Total proposed addition:** ~600 lines (one route, one component, two lib helpers, four schema-additive fields, six render sites).
**Total proposed deletion:** ~80 lines (duplicated phase array + dead fallback branch).
**Net:** the curriculum becomes visible. The data we already author finally renders. No new auth, no new chrome, no schema migration.
