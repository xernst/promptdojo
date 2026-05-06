# V2 Implementation Plan — Legitimacy Refresh

**Author:** Head of IT
**Date:** 2026-05-06
**Audience:** Senior dev, shipping Monday
**Contract:** `design-kit/audit-v2/CEO-vision.md` — 7 picks, sequenced, additive-only
**Branches:** `refresh-v2/01-*` … `refresh-v2/07-*`

---

## Executive summary

Seven independent PRs, ~25h total, ship sequentially. PR 1 is the gate — every other PR assumes its tokens exist. Every PR is independently shippable, independently revertable, and produces a clean `pnpm build` + working `out/` for Cloudflare Pages.

Risk surface is small because the contract is additive: ONE new schema field (`lastSeenAt`), ONE new build script (GitHub stats), ONE new route (`/changelog`), ONE new lib module (`lib/curriculum/phases.ts`), ONE new home-state resolver, plus three new presentational components (`PhaseBandedRail`, `ProgressHairline`, `StatStrip`, `SiteHeader`). No deps added. localStorage shape extended only.

What ships first: PR 1 (system tokens) lands a tokens-only diff. Visual diff at the pixel level is small; the real win is consistency for everything downstream.

**Key risks:**
- **PR 1** sweeps ~20 files. Brittle if globbed; explicit file list below to bound it.
- **PR 6** depends on a build-time GitHub fetch. Cloudflare Pages build env may rate-limit the unauthed `api.github.com` call (60/hr per IP). Plan: graceful fallback writes `{ stars: null, lastCommitISO: null }` and components hide the pill if either is null. No `GITHUB_TOKEN` introduced (solo founder, $0).
- **PR 2** introduces `chapter.estMinutes` rollup at build time. Needs to land before PR 3 consumes it from `ChapterTocEntry`.

---

## Pre-flight

- **Main is green:** `pnpm build` produces `out/` and `out/_headers` keeps Pyodide long-cache rule. Verify before branching: `git status` clean, `pnpm build` exits 0, `out/index.html` exists.
- **Rollback plan:** every PR is a single-purpose squash-merged commit. `git revert <sha> && git push origin main` triggers Cloudflare auto-redeploy (~2 min). No data migrations to undo because all schema changes are optional / additive.
- **localStorage contract:** `promptdojo:progress:v2` and `promptdojo:save-email` keys frozen. `lastSeenAt` is the only new optional field added in PR 4.
- **Pyodide path frozen:** `/pyodide/*` long-cache rule in `public/_headers` untouched across all 7 PRs.

---

## Build order

PR 1 is the gate. Hold PRs 2–7 until PR 1 merges. After that, 2 → 3 → 4 → 5 → 6 → 7 sequentially.

---

### PR 1: System tokens — type scale, card pattern, button hierarchy, focus canon, skeleton primitive

**Branch:** `refresh-v2/01-system-tokens`
**Outcome:** One type scale, one card pattern (3 variants), one button hierarchy (3 tiers), one focus canon, one hover transition class, one skeleton primitive — all in `app/globals.css` plus a single sweep through 6 files to adopt them. Visual diff small; consistency win huge.
**Estimated time:** 6h
**Depends on:** none — gates everything
**Unblocks:** PRs 2–7 all assume `t-*`, `dojo-hover`, the card variants, and the button tiers exist.

**Files to modify:**
- `app/globals.css:131` (after `.cursor-blink` block) — append the type scale, vertical-rhythm utilities, focus canon, hover canon, card variants, button tiers, skeleton keyframes. ~120 lines added; nothing removed.
- `app/page.tsx:69-111` (header + hero) — h1 → `t-hero`, sub-blurb → `t-body`, CTA → keep (already on-brand) but add the focus canon classnames so it stops being the only un-focus-styled CTA per `04-ui-design.md:313`.
- `app/page.tsx:140-149` (the 3 value-prop cards) — `rounded-lg border-ink-800 bg-ink-950 p-5` → use `dojo-card` default variant. Title `text-lg font-semibold text-ink-50` → `t-h3`. Body `text-sm text-ink-400` → `t-body-sm`.
- `app/page.tsx:153-156` (chapters eyebrow `<h2>`) — `text-xs uppercase tracking-widest text-ink-400` → `t-eyebrow`.
- `app/page.tsx:158-202` (chapter tile grid) — drop `rounded-lg`, switch tile to `dojo-card-interactive`. Title → `t-h3`, eyebrow → `t-eyebrow`, mono meta → `t-mono-meta`.
- `app/page.tsx:206-232` (legacy `<details>`) — `rounded-lg` → `rounded-none`. Inner cards same.
- `app/about/page.tsx:127` h1 `text-5xl/6xl/7xl` → `t-hero`. `app/about/page.tsx:157,183,213,238,303,337,356` h2s → `t-section`. `app/about/page.tsx:154,180,210,235,273,300,334` eyebrows → `t-eyebrow`. CTAs at `:139, 317, 325, 366` → already mono+uppercase; just align to the new `dojo-btn-primary` / `dojo-btn-secondary` class names so future edits don't drift.
- `app/learn/v2/[chapter]/page.tsx:90-92` h1 → `t-section`. `:88` eyebrow `text-xs uppercase tracking-[0.2em] text-green-400` → `t-eyebrow`. `:96-101` mono meta → `t-mono-meta`. `:116` start-chapter button `rounded-md bg-green-500 px-4 py-2 text-sm font-medium` → `dojo-btn-primary`. `:131` lessons eyebrow → `t-eyebrow`. `:134-153` lesson list `rounded-md` → `rounded-none`; lesson row remains a list, no card.
- `components/v2/HomeClient.tsx:58-117` — `rounded-xl` cards → `dojo-card-highlight`. `bg-gradient-to-br from-green-950 to-ink-950` removed entirely (drops the only gradient on the site per `04-ui-design.md:238`). Eyebrow → `t-eyebrow`, heading → `t-h2`, sub → `t-body-sm`. Replace `rounded-full bg-green-600 p-3` icon-circle with a `↵ continue` mono keycap (`<kbd className="font-mono text-xs uppercase tracking-wider border border-ink-700 px-2 py-1">↵ continue</kbd>`). Drop the `<Play>` and `<ArrowRight>` lucide imports if no longer used.
- `components/v2/StepFooter.tsx:93-105` — XP bar wrap `rounded-full` → `rounded-none` (lines up visually with the 1px hairline tier so PR 3's `ProgressHairline` is a drop-in primitive). Lowercase the labels in the same diff: `:88` `Lesson XP` → `lesson xp`, `:122` `Hint` → `hint`, `:132` `Skip` → `skip`. **Default prop `primaryLabel = "Continue"` (line 33) → `primaryLabel = "continue"`.** Sweep the button at `:139-152` from `rounded-md ... text-sm font-medium` → `dojo-btn-primary`.
- `components/v2/LessonStepClient.tsx:183-187` — Continue button `rounded-md ... text-sm font-medium` → `dojo-btn-primary`.
- `app/onboarding/page.tsx:205, 244, 280, 343, 350, 394` — `rounded-md bg-green-500 px-5 py-2.5 font-medium` → `dojo-btn-primary`. `:235, 271, 379` — option cards `rounded-lg border bg-ink-950 p-4` → `rounded-none`; keep the green-500 selected-state border.

**Files to create:** none.

**Files to delete:** none.

**Key code snippets:**

`app/globals.css` (append after line 145) — copy the CSS verbatim from these audit-doc anchors. Do not retype:
- **Type scale** (`t-hero`, `t-section`, `t-h2`, `t-h3`, `t-body`, `t-body-sm`, `t-eyebrow`, `t-mono-meta`, `t-code`): `04-ui-design.md:128-202`.
- **Card variants** (`.dojo-card`, `.dojo-card-interactive`, `.dojo-card-highlight`): translate `04-ui-design.md:240-262` into bare CSS with `border-radius: 0`, the three padding/border specs above, and the hover rules `border-left` thickening.
- **Button hierarchy** (`.dojo-btn-primary`, `.dojo-btn-secondary`, `.dojo-btn-tertiary`): translate `04-ui-design.md:282-303`. All `font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 0;`. Primary green-500 bg + ink-950 text + green-400 hover. Secondary transparent + ink-700 border + green-500 hover. Tertiary transparent + ink-400 text + green-400 hover.
- **Focus + hover canon** (`*:focus-visible` outline; `button:focus-visible, a:focus-visible` double-ring; `.dojo-hover` 140ms transition): copy verbatim from `04-ui-design.md:317-340`.
- **Skeleton primitive** (`@keyframes skeleton-pulse` + `.skeleton` + `prefers-reduced-motion`): copy verbatim from `04-ui-design.md:476-487`.

**Critical:** classes are bare CSS, not Tailwind layers — they sit alongside `.cursor-blink` in `globals.css`, not in `@theme`. Do not register as Tailwind utilities this round.

`components/v2/HomeClient.tsx:66-87` BEFORE → AFTER (the gradient kill — the loudest off-brand surface today):
```tsx
// BEFORE — components/v2/HomeClient.tsx:66-87
if (resolved.state === "new-user") {
  return (
    <Link
      href="/onboarding"
      className="group flex items-center justify-between rounded-xl border border-green-700/40 bg-gradient-to-br from-green-950 to-ink-950 p-6 transition hover:border-green-600 hover:from-green-900"
    >
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-widest text-green-500">start here</div>
        <div className="mt-1 text-2xl font-semibold text-ink-50">get started in under a minute</div>
        <div className="mt-1 text-sm text-ink-500">five questions, then your first lesson.</div>
      </div>
      <div className="ml-4 shrink-0 rounded-full bg-green-600 p-3 transition group-hover:bg-green-500">
        <ArrowRight size={20} className="text-ink-100" />
      </div>
    </Link>
  );
}

// AFTER
if (resolved.state === "new-user") {
  return (
    <Link href="/onboarding" className="group dojo-card-highlight flex items-center justify-between dojo-hover">
      <div className="min-w-0">
        <div className="t-eyebrow">start here</div>
        <div className="t-h2 mt-2">get started in under a minute</div>
        <div className="t-body-sm mt-1">five questions, then your first lesson.</div>
      </div>
      <kbd className="ml-4 shrink-0 border border-ink-700 px-2 py-1 font-mono text-xs uppercase tracking-wider text-ink-300">
        ↵ continue
      </kbd>
    </Link>
  );
}
```

`components/v2/StepFooter.tsx:33` BEFORE → AFTER:
```tsx
// BEFORE
primaryLabel = "Continue",

// AFTER
primaryLabel = "continue",
```

**Test checklist (dev runs before pushing):**
- [ ] `pnpm build` exits 0; `out/index.html` written.
- [ ] `pnpm dev` → localhost:3000 loads; no console errors.
- [ ] Visit `/`, `/about`, `/onboarding`, `/learn/v2/variables`, `/learn/v2/variables/naming-things/0` — every primary button is sharp + mono + uppercase. No `rounded-md` survives on a button.
- [ ] No gradient anywhere in the rendered tree (`grep -r "bg-gradient" app/ components/` → empty).
- [ ] Tab around the home hero — focus ring is the green double-ring on buttons/links, the green outline on form fields.
- [ ] Resize home → headline scales from 64px to 120px without breaking lockup.

**Verification (post-deploy on promptdojo.pages.dev):**
- [ ] DevTools → Computed Styles on `/` h1 → `font-size: 120px` at desktop width.
- [ ] DevTools → search `border-radius: 0` count > 30 (every card + button).
- [ ] No `bg-gradient-to-` in the rendered HTML.
- [ ] StepFooter on any lesson page shows `lesson xp` lowercase, `hint` / `skip` lowercase.

**Risks:**
- The CTA at `app/page.tsx:100` is already on-brand; the sweep should NOT change its visible style. Diff cleanly.
- Tailwind 4 `@theme` block must come BEFORE the appended utilities — preserve the file order.
- The `*:focus-visible` global rule may cause minor visual changes on form inputs across the site. Verify the `LoginToSave` modal email field still looks correct (`components/LoginToSave.tsx:222`).
- `t-body` and `t-body-sm` use `var(--font-display)` (Fraunces). Don't apply to mono surfaces.

---

### PR 2: Phase-banded curriculum tree on `/` — the institutional spine

**Branch:** `refresh-v2/02-phase-banded-rail`
**Outcome:** Replace the flat 25-card grid on `/` with a phase-banded rail (5 bands × N chapters per band) that promotes the eyebrow + left-rail motif from `/about`. Single source of truth `lib/curriculum/phases.ts` consumed by both `/about` and `/`.
**Estimated time:** 4h
**Depends on:** PR 1 (uses `t-eyebrow`, `t-h3`, `t-mono-meta`, `dojo-card-interactive`).
**Unblocks:** PR 3 (tile density assumes the band wrapper exists), PR 5 (lesson breadcrumb imports `phases.ts`).

**Files to modify:**
- `app/about/page.tsx:26-57` — delete the inline `phases` array, replace with `import { PHASES } from "@/lib/curriculum/phases";` and use `PHASES` in the `.map()` at `:187`. The shape changes slightly — see below.
- `app/page.tsx:152-204` — the existing `<section id="chapters">` is replaced by `<PhaseBandedRail chapters={v2Chapters} />`. The legacy `<details>` block at `:206-232` stays intact.
- `lib/content/schema.ts:297-305` — extend `ChapterTocEntry` Zod object with `estMinutes: z.number().int().nonnegative()`.
- `scripts/build-content-v2.mjs:386-394` — emit `estMinutes` per chapter into the TOC: `estMinutes: c.lessons.reduce((acc, l) => acc + l.estMinutes, 0)`.

**Files to create:**
- `lib/curriculum/phases.ts` — the single source of truth for phase → chapter mapping. Server-importable. Pure data, zero deps.
- `components/v2/PhaseBandedRail.tsx` — server component (no `"use client"` — reads no localStorage). Renders 5 phase bands; each band has eyebrow + chapter range + chapter tiles in `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`. ~150 lines.

**Files to delete:** none. Inline `phases` array at `app/about/page.tsx:26-57` is replaced, not deleted from a separate file.

**Key code snippets:**

`lib/curriculum/phases.ts` (NEW):
```ts
// Single source of truth for phase → chapter mapping.
// Both /about and / read from here. Authored once, drift-proof.
//
// chapterSlugs MUST exist in lib/generated/v2/manifest.toc.json.
// Mismatch is a build-time error (PhaseBandedRail asserts).

export type Phase = {
  number: number;        // 1..5
  name: string;          // lowercase
  blurb: string;         // lowercase, comma-separated topics
  range: string;         // e.g. "ch 01–07"
  chapterSlugs: string[];
};

export const PHASES: Phase[] = [
  {
    number: 1,
    name: "foundations",
    blurb: "variables, functions, lists, dicts, loops, conditionals, tracebacks, mutation",
    range: "ch 01–07",
    chapterSlugs: [
      "variables",
      // ...senior dev: fill in the 7 slugs in TOC order from
      // lib/generated/v2/manifest.toc.json. The first phase covers
      // the first 7 chapters per app/about/page.tsx:32.
    ],
  },
  {
    number: 2,
    name: "real python",
    blurb: "modules, error handling, files & i/o, classes, http",
    range: "ch 08–12",
    chapterSlugs: [/* 5 slugs */],
  },
  {
    number: 3,
    name: "llm apis",
    blurb: "calling models, structured output, mcp, agent loops",
    range: "ch 13–16",
    chapterSlugs: [/* 4 slugs */],
  },
  {
    number: 4,
    name: "shipping discipline",
    blurb: "git, secrets, prompting, traces, evals, retrieval, tradeoffs",
    range: "ch 17–24",
    chapterSlugs: [/* 8 slugs */],
  },
  {
    number: 5,
    name: "capstone",
    blurb: "ship a working cli agent in 12 steps. ~100 lines of python.",
    range: "ch 25",
    chapterSlugs: [/* 1 slug */],
  },
];

export function phaseForChapter(slug: string): Phase | undefined {
  return PHASES.find((p) => p.chapterSlugs.includes(slug));
}
```

> **Note to senior dev:** populate `chapterSlugs` arrays from `cat lib/generated/v2/manifest.toc.json | jq '.chapters[] | .slug'`. Don't hand-author the slugs; copy them from the manifest. The TOC is the ground truth.

`components/v2/PhaseBandedRail.tsx` (NEW, server component) — shape:

```tsx
import Link from "next/link";
import { PHASES } from "@/lib/curriculum/phases";

type ChapterMeta = { slug; title; number; blurb; lessonCount; stepCount; estMinutes; firstLessonSlug; hasOverview };

export default function PhaseBandedRail({ chapters }: { chapters: ChapterMeta[] }) {
  const bySlug = new Map(chapters.map((c) => [c.slug, c]));
  return (
    <div id="chapters" className="scroll-mt-8 space-y-24">
      {PHASES.map((phase) => {
        const phaseChapters = phase.chapterSlugs.map((s) => bySlug.get(s)).filter(Boolean);
        const phaseMinutes = phaseChapters.reduce((a, c) => a + c.estMinutes, 0);
        return (
          <section key={phase.number} className="border-l-2 border-green-700 pl-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
              <div>
                <div className="t-eyebrow">phase {String(phase.number).padStart(2, "0")} · {phase.name}</div>
                <p className="t-body-sm mt-2 max-w-2xl">{phase.blurb}</p>
              </div>
              <div className="t-mono-meta">{phase.range} · ~{formatMinutes(phaseMinutes)}</div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {phaseChapters.map((c) => <ChapterTile key={c.slug} chapter={c} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

`<ChapterTile>` in PR 2 keeps current 4-field density (eyebrow + title + blurb + steps/min). PR 3 promotes to 8 fields. **Tile inner is `dojo-card-interactive flex flex-col` wrapping a `<Link href={href}>` (or unbordered fallback at `opacity-60` if no `firstLessonSlug`).** `formatMinutes(m)` returns `${m}m` under 60, else `${h}h ${r}m`.

`app/page.tsx:39-55` BEFORE → AFTER (extend the toc map to surface `estMinutes` and the new fields):
```tsx
// BEFORE
const v2Chapters = await Promise.all(
  toc.chapters.map(async (entry) => {
    const detail = await getV2Chapter(entry.slug);
    const firstLessonSlug = detail?.lessons[0]?.slug ?? null;
    const hasOverview = !!detail?.overview && detail.overview.trim().length > 0;
    return {
      slug: entry.slug, title: entry.title, number: entry.number, blurb: entry.blurb,
      lessonCount: entry.lessonCount, stepCount: entry.stepCount,
      firstLessonSlug, hasOverview,
    };
  }),
);

// AFTER — adds estMinutes from the new TOC field
const v2Chapters = await Promise.all(
  toc.chapters.map(async (entry) => {
    const detail = await getV2Chapter(entry.slug);
    const firstLessonSlug = detail?.lessons[0]?.slug ?? null;
    const hasOverview = !!detail?.overview && detail.overview.trim().length > 0;
    return {
      slug: entry.slug, title: entry.title, number: entry.number, blurb: entry.blurb,
      lessonCount: entry.lessonCount, stepCount: entry.stepCount,
      estMinutes: entry.estMinutes,                     // NEW (PR 2)
      firstLessonSlug, hasOverview,
    };
  }),
);
```

`app/page.tsx:152-204` BEFORE → AFTER:
```tsx
// BEFORE — flat grid (47 lines)
<section id="chapters" className="mt-16 scroll-mt-8">
  <div className="mb-4 flex items-baseline justify-between">
    <h2 className="text-xs uppercase tracking-widest text-ink-400">
      25 chapters · production-ai track included · free forever
    </h2>
  </div>
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {v2Chapters.map((c) => { /* …47 lines… */ })}
  </div>
</section>

// AFTER — phase bands. (Eyebrow line stays for now; rewrites in PR 7.)
<section className="mt-24">
  <h2 className="t-eyebrow mb-12">
    25 chapters · production-ai track included · free forever
  </h2>
  <PhaseBandedRail chapters={v2Chapters} />
</section>
```

**Test checklist:**
- [ ] `pnpm build` exits 0. `lib/generated/v2/manifest.toc.json` shows `estMinutes` on every chapter entry.
- [ ] `/` renders 5 phase bands with the green left-rail. Each band has `phase 0X · name` eyebrow + chapter range + tiles.
- [ ] `/about` still renders; phase cards at `:188-204` look identical to before (now reading from the same module).
- [ ] Click any chapter tile — same destinations as before (overview if present, lesson 1 step 0 otherwise).
- [ ] Mobile (390px) — bands stack, tiles go single-column.
- [ ] `pnpm build` log shows no Zod parse failures from the new `estMinutes` requirement on `ChapterTocEntry`.

**Verification (post-deploy):**
- [ ] DevTools — count `<section>` with `border-l-2 border-green-700` → 5.
- [ ] Each band has the chapter range pill on the right (`ch 01–07`, `ch 08–12`, etc.).
- [ ] No tile shows up in two bands; no chapter slug missing from any band (count of tiles = 25).

**Risks:**
- If `lib/curriculum/phases.ts` `chapterSlugs` lists a slug that's not in the TOC, the tile silently disappears. PhaseBandedRail filters with `.filter((c): c is ChapterMeta => !!c)` — verify count totals 25 manually.
- `/about` continues to render the same UI but now reads from `phases.ts`. If the about-page card layout depends on `c.p / c.t / c.c / c.span` field names, rename via destructuring at the call site rather than adding aliases to `phases.ts`. Recommended import shape:
  ```tsx
  import { PHASES } from "@/lib/curriculum/phases";
  // Then: {PHASES.map((c) => ( ... <div>{c.range}</div> ...
  ```
- `ChapterTocEntry` schema change is technically a breaking change to a Zod consumer — confirm `lib/content-v2.ts` doesn't `parse()` the TOC strictly (it currently does an `as ManifestToc` cast at line 25 — safe).

---

### PR 3: Chapter tile density upgrade + ProgressHairline primitive

**Branch:** `refresh-v2/03-tile-density-and-progress`
**Outcome:** Tiles go from 4 fields to 8 (eyebrow + difficulty tier + title + blurb + steps · time + done/total + 1px hairline). One `<ProgressHairline>` primitive used in 3 places: chapter tile (1px), `StepFooter` XP bar (6px), global header `<CourseProgress>` pill (4px).
**Estimated time:** 4h
**Depends on:** PR 1 (tokens), PR 2 (`PhaseBandedRail` is the consumer).
**Unblocks:** PR 4 (welcome-back resolver references `progress.steps` rollups using the same helpers).

**Files to modify:**
- `components/v2/PhaseBandedRail.tsx` — promote the `ChapterTile` from 4 fields to 8. Add a `<DifficultyTag>` deriving from `phase.number` (`foundations` for phase 1, `core` for phases 2–3, `advanced` for phases 4–5). Add the `<ProgressHairline>` at the bottom. Need access to `progress.steps` — wrap the tile in a thin client component (`"use client"`) that subscribes to localStorage. Alternative: add an outer `<ChapterTileClient>` wrapper that takes `chapter: ChapterMeta` + `progress: number` and pulls `progress` from a single `useProgressV2()` hook at the rail level. Choose the rail-level hook to avoid 25 individual subscriptions.
- `app/layout.tsx:32-35` — insert `<CourseProgress />` between `LoginToSave` and `FollowOnXPill` (will be replaced wholesale by `<SiteHeader />` in PR 6 — for now, edit `app/layout.tsx` directly to keep the diff bounded).
- `components/v2/StepFooter.tsx:93-105` — replace the bespoke XP bar div with `<ProgressHairline value={earnedXp} max={totalXp} height="md" ariaLabel="Lesson XP progress" />`.

**Files to create:**
- `components/v2/ProgressHairline.tsx` — ~30 lines. Three height props: `xs` (1px), `md` (6px — current `StepFooter`), `sm` (4px — header pill).
- `components/v2/CourseProgress.tsx` — `"use client"`. Reads `loadProgressV2()`, computes total passed steps / total steps from the manifest. Renders `❯ 47/624 · ch 03 ─────░░░ ~8%` per `04-ui-design.md:88`. Hides on `/onboarding` (use `usePathname()`). Hides until at least 1 passed step exists. ~60 lines.
- `lib/curriculum/progress-rollup.ts` — pure helpers: `chapterDoneCount(progress, chapterSlug, lessonStepIds): number`, `totalStepsCompleted(progress): number`. ~30 lines. Server-safe (no `window`). Takes a manifest-like input.

**Files to delete:** none.

**Key code snippets:**

`components/v2/ProgressHairline.tsx` (NEW, ~30 lines):

```tsx
import { cn } from "@/lib/utils";
type Props = { value: number; max: number; height?: "xs" | "sm" | "md"; ariaLabel?: string; className?: string };
const HEIGHT = { xs: "h-px", sm: "h-1", md: "h-1.5" } as const;

export default function ProgressHairline({ value, max, height = "xs", ariaLabel, className }: Props) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role={ariaLabel ? "progressbar" : undefined}
      aria-valuemin={ariaLabel ? 0 : undefined}
      aria-valuemax={ariaLabel ? max : undefined}
      aria-valuenow={ariaLabel ? value : undefined}
      aria-label={ariaLabel}
      className={cn("w-full overflow-hidden bg-ink-800", HEIGHT[height], className)}
    >
      <div className="h-full bg-green-500 transition-[width] duration-300 ease-out motion-reduce:transition-none" style={{ width: `${pct}%` }} />
    </div>
  );
}
```

`components/v2/StepFooter.tsx:93-105` BEFORE → AFTER:
```tsx
// BEFORE
<div
  className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-800"
  role="progressbar" aria-valuemin={0} aria-valuemax={totalXp} aria-valuenow={earnedXp}
  aria-label="Lesson XP progress"
>
  <div className="h-full bg-green-500 transition-[width] duration-300 ease-out" style={{ width: `${xpPct}%` }} />
</div>

// AFTER
<ProgressHairline
  value={earnedXp}
  max={totalXp}
  height="md"
  ariaLabel="Lesson XP progress"
  className="mt-1"
/>
```

`<ChapterTile>` upgrade in PR 3 — promote from 4 to 8 fields. New shape:
- **Row 1 eyebrow strip:** `<span>ch NN</span>` left, `<span className={tierColor}>{tier}</span>` right. `tier = phase.number === 1 ? "foundations" : phase.number <= 3 ? "core" : "advanced"`. Colors: green-700 / green-500 / ink-100.
- **Row 2:** `<div className="t-h3">` title + `<p className="t-body-sm line-clamp-2">` blurb.
- **Row 3 meta strip:** `<span>{stepCount} steps · ~{formatMinutes(estMinutes)}</span>` left, `<span className="tabular-nums text-ink-300">{doneSteps}/{stepCount}</span>` right (both `t-mono-meta`).
- **Row 4:** `<ProgressHairline value={doneSteps} max={stepCount} height="xs" className="mt-3" />` (no `ariaLabel` — decoration).

**Subscription pattern:** `PhaseBandedRail` (server) wraps `<PhaseBandedRailClient>` (`"use client"`) which owns ONE `loadProgressV2()` subscription via `useEffect` + `promptdojo:progress-v2` event listener and computes `doneStepsBySlug: Record<string, number>` once per change. Tiles receive `doneSteps` prop. **Avoid 25 individual subscriptions.**

`stepIdsByChapter` is computed server-side once at `app/page.tsx`:
```tsx
const stepIdsByChapter: Record<string, string[]> = {};
for (const entry of toc.chapters) {
  const detail = await getV2Chapter(entry.slug);
  if (!detail) continue;
  stepIdsByChapter[entry.slug] = detail.lessons.flatMap((l) => l.steps.map((s) => s.id));
}
```

`components/v2/CourseProgress.tsx` (NEW, `"use client"`, ~40 lines):
- Import `toc` from `lib/generated/v2/manifest.toc.json`; compute `const TOTAL_STEPS = toc.chapters.reduce((a, c) => a + c.stepCount, 0)` at module scope. **Sidesteps prop threading through `app/layout.tsx`.**
- `useEffect` + `loadProgressV2()` + `promptdojo:progress-v2` listener; `done = Object.values(p.steps).filter(s => s.status === "passed").length`.
- Hide via `usePathname()?.startsWith("/onboarding")`; hide if `done === 0`.
- Render: `<div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-ink-400">` containing `❯ {done}/{TOTAL_STEPS}`, `<ProgressHairline value={done} max={TOTAL_STEPS} height="sm" className="w-24" />`, `~{pct}%`.

**Test checklist:**
- [ ] `pnpm build` exits 0.
- [ ] `/` chapter tiles show 8 fields including the 1px hairline at the bottom.
- [ ] `StepFooter` XP bar visually identical to before (height + green fill); width-transition unchanged.
- [ ] After completing one step, refresh `/` — tile shows `1/N` instead of `0/N`; hairline has 1/N% green fill.
- [ ] Header pill `❯ X/624 ── ~Y%` renders on `/` and `/about` and `/learn/v2/...`. Hides on `/onboarding`. Hides for fresh users (no passed steps).

**Verification (post-deploy):**
- [ ] All 25 chapter tiles render the difficulty tier (`foundations | core | advanced`) at top-right of the eyebrow row.
- [ ] No tile reads `~NaNm` — all `estMinutes` populated.
- [ ] After the first lesson is passed, header pill shows non-zero count.

**Risks:**
- 25-tile localStorage subscriptions could be slow on poor devices. Hoist into a single `useProgressV2()` subscription at the rail level and pass `doneSteps` per tile down via prop.
- The `<CourseProgress>` insertion at `app/layout.tsx:32-35` will be replaced by `<SiteHeader>` in PR 6. Marker comment on the inserted line: `{/* TODO PR 6: replaced by SiteHeader */}`.
- ARIA: The 1px hairline on tiles should NOT be a progressbar (no `aria-label`) — it's decoration. The `StepFooter` and header pill instances DO get `aria-label`. The component supports both via the optional `ariaLabel` prop.

---

### PR 4: Welcome-back state upgrade

**Branch:** `refresh-v2/04-welcome-back-resolver`
**Outcome:** Pull `HomeClient.tsx` from a 3-state machine to a 4-state machine driven by a pure resolver in `lib/home-state.ts`. Adds ONE optional schema field (`lastSeenAt`) and writes it on every `updateProgressV2`. Welcome-back card shows `step N of M · X% through ${chapter.title} · last visited Nd ago`.
**Estimated time:** 3h
**Depends on:** PRs 1 + 3 (uses `dojo-card-highlight`, `t-*`, and the per-chapter step counts from PR 3's manifest reads).
**Unblocks:** none — terminal change.

**Files to modify:**
- `lib/storage.ts:133-148` — add one optional field to `ProgressV2`:
  ```ts
  lastSeenAt?: string;  // ISO timestamp; written on every updateProgressV2.
  ```
- `lib/storage.ts:175-203` (`loadProgressV2`) — pass `lastSeenAt: parsed.lastSeenAt` through the merge spread (no migration needed; missing → `undefined` → handled in resolver).
- `lib/storage.ts:211-218` (`updateProgressV2`) — stamp `lastSeenAt` on every write:
  ```ts
  export function updateProgressV2(fn: (p: ProgressV2) => ProgressV2): ProgressV2 {
    const cur = loadProgressV2();
    const next = { ...fn(cur), lastSeenAt: new Date().toISOString() };  // NEW
    saveProgressV2(next);
    return next;
  }
  ```
- `components/v2/HomeClient.tsx:33-117` — full rewrite of the resolver and render branches.
- `app/page.tsx:36-55` — pass `chaptersFull` (with `lessons[].slug` + `steps.length` per lesson) into `HomeClient` so the resolver can compute `step N of M`. Cheapest path: pass `chapterSummaries: { slug, title, number, totalSteps, lessons: { slug, title, stepCount }[] }[]` rather than the full `Chapter` blob. ~30 lines added in `app/page.tsx`.

**Files to create:**
- `lib/home-state.ts` — pure resolver, fully testable, no DOM access. ~80 lines. Returns one of 4 discriminated-union states.

**Files to delete:** none.

**Key code snippets:**

`lib/storage.ts` BEFORE → AFTER (the additive field + write stamp):
```ts
// BEFORE — lib/storage.ts:133-148 (excerpt)
export type ProgressV2 = {
  schemaVersion: 2;
  userId: string;
  profile: Partial<UserProfile>;
  steps: Record<string, StepProgress>;
  lessons: Record<string, LessonProgressV2>;
  streak: StreakState;
  lastVisitedV2?: LastVisitedV2;
  conceptsTouched: string[];
  completedChapters?: string[];
  createdAt: string;
};

// AFTER
export type ProgressV2 = {
  schemaVersion: 2;
  userId: string;
  profile: Partial<UserProfile>;
  steps: Record<string, StepProgress>;
  lessons: Record<string, LessonProgressV2>;
  streak: StreakState;
  lastVisitedV2?: LastVisitedV2;
  conceptsTouched: string[];
  completedChapters?: string[];
  createdAt: string;
  lastSeenAt?: string;   // NEW (PR 4) — ISO; written on every updateProgressV2.
};
```

```ts
// BEFORE — lib/storage.ts:211-218
export function updateProgressV2(fn: (p: ProgressV2) => ProgressV2): ProgressV2 {
  const cur = loadProgressV2();
  const next = fn(cur);
  saveProgressV2(next);
  return next;
}

// AFTER
export function updateProgressV2(fn: (p: ProgressV2) => ProgressV2): ProgressV2 {
  const cur = loadProgressV2();
  const next = { ...fn(cur), lastSeenAt: new Date().toISOString() };
  saveProgressV2(next);
  return next;
}
```

`lib/home-state.ts` (NEW, ~80 lines, pure — no DOM, no localStorage). **Spec:** `05-ia-architecture.md §welcome-back state`; CEO collapsed 6-state to 4-state per `CEO-vision.md §Divergent #2`.

**Exports:**
- `type ChapterSummary = { slug; title; number; totalSteps; lessons: { slug; title; stepCount }[] }`
- `type HomeState = { kind: "loading" } | { kind: "guest" } | { kind: "onboarded-not-started"; firstChapter: ChapterSummary; firstLessonSlug: string } | { kind: "in-progress"; chapter; lessonTitle; lessonSlug; stepIndex; stepNumber; totalStepsInLesson; chapterPctDone; chapterDoneSteps; daysAway: number | null; target: LastVisitedV2 }`
- `resolveHomeState(progress: ProgressV2 | null, chapters: ChapterSummary[], stepIdsByChapter: Record<string, string[]>): HomeState`

**Resolver logic:**
1. `progress === null` → `loading`.
2. No `progress.profile?.name?.trim()` → `guest`.
3. No `progress.lastVisitedV2` → `onboarded-not-started` with `firstChapter = chapters[0]` and `firstLessonSlug = firstChapter.lessons[0].slug`.
4. `lastVisitedV2` exists → `in-progress`. Lookup chapter + lesson by slug; if either missing → fall back to `guest` (defensive). Compute:
   - `chapterStepIds = stepIdsByChapter[chapter.slug] ?? []` — passed in, NOT derived inline.
   - `chapterDoneSteps = Object.values(progress.steps).filter(s => s.status === "passed" && chapterStepIds.includes(s.stepId)).length`.
   - `chapterPctDone = Math.round((chapterDoneSteps / chapter.totalSteps) * 100)`.
   - `daysAway = progress.lastSeenAt ? Math.floor((Date.now() - new Date(progress.lastSeenAt).getTime()) / 86_400_000) : null`. Guard with `Number.isFinite`.

> **Implementer note:** thread `stepIdsByChapter: Record<string, string[]>` from `app/page.tsx` (already computed in PR 3) into both `<HomeClient>` and the resolver. Single source of truth — do not derive stepIds inline from `chapter.number` / `lesson.slug` patterns. The build script's id format is opaque to the runtime.

`components/v2/HomeClient.tsx` rewrite — keep `"use client"`, accept `{ chapters: ChapterSummary[], stepIdsByChapter }` props, subscribe to `promptdojo:progress-v2`, dispatch on `state.kind`:

- **loading** → `<div aria-hidden className="skeleton h-[124px]" />`.
- **guest** → `<Link href="/onboarding">` rendering `dojo-card-highlight` with eyebrow `start here`, h2 `get started in under a minute`, body `five questions, then your first lesson.`, `↵ continue` keycap.
- **onboarded-not-started** → `<Link href="/learn/v2/${firstChapter.slug}/${firstLessonSlug}/0">` rendering `dojo-card-highlight` with eyebrow `ready when you are`, h2 `start chapter 1 — ${firstChapter.title.toLowerCase()}`, body `first lesson, no warm-up.`, `↵ start` keycap.
- **in-progress** → `<Link href="/learn/v2/${target.chapterSlug}/${target.lessonSlug}/${target.stepIndex}">` rendering `dojo-card-highlight flex-col gap-3`. Inside: row with eyebrow `welcome back`, h2 `ch ${chapter.number} · ${titleClean}`, mono-meta `step ${stepNumber} of ${totalStepsInLesson} · ${chapterPctDone}% through · ${lessonTitle.toLowerCase()}` plus `· last visited ${recency}` when `daysAway !== null`. `↵ continue` keycap right. `<ProgressHairline value={chapterDoneSteps} max={chapter.totalSteps} height="xs" />` at bottom of card.

`recency` derivation: `daysAway === null → null; === 0 → "today"; === 1 → "yesterday"; else → "${daysAway}d ago"`.

**`app/page.tsx` wires props:** build `chapterSummaries: ChapterSummary[]` by mapping `toc.chapters` through `getV2Chapter()` for `lessons[].slug/title/stepCount`. Reuse `stepIdsByChapter` from PR 3. Pass both to `<HomeClient>`. Replace the existing `fallback` + `chapters` props.

**Test checklist:**
- [ ] Fresh-incognito visit → `guest` card renders with "start here". No console errors.
- [ ] Run onboarding → home renders `onboarded-not-started` (no `lastVisitedV2` yet).
- [ ] Open lesson 1 step 0 → home renders `in-progress` with `step 1 of M · X% through ${chapter.title} · last visited today`.
- [ ] Manually advance localStorage `lastSeenAt` to 5 days ago in DevTools → home shows `last visited 5d ago`.
- [ ] `pnpm build` — TypeScript happy with the new optional field.

**Verification (post-deploy):**
- [ ] DevTools → localStorage → `promptdojo:progress:v2` shows `lastSeenAt` ISO string after any lesson interaction.
- [ ] Welcome-back card shows the percentage; no `NaN%`.
- [ ] No layout-shift between `loading` skeleton and resolved state (skeleton matches resolved card height ~124px).

**Risks:**
- **Backward compat:** `lastSeenAt` is optional. Old localStorage shapes load fine because of the spread merge in `loadProgressV2:175-203`.
- The recency text could display as "last visited NaNd ago" if `lastSeenAt` is malformed — guard with `Number.isFinite(daysAway)`.
- The `updateProgressV2` write stamp will trigger on every save, including step drafts. That's fine — it's the intended definition of "last seen."

---

### PR 5: 3-node breadcrumb in lesson header + sidebar step content preview

**Branch:** `refresh-v2/05-lesson-breadcrumb`
**Outcome:** Lesson page header strip becomes a 3-node breadcrumb (`phase 0X · ${phaseName}` / `ch ${n} · ${chapter.title}` / `lesson ${i} of ${total} · ${lesson.title}`). Sidebar step labels go from generic step-type names (`multiple choice`, `fill blank`) to a 32-char content preview from `step.prompt.slice(0, 32)`.
**Estimated time:** 2h
**Depends on:** PRs 1 + 2 (uses `t-eyebrow` / `t-mono-meta` and `phaseForChapter()` from `lib/curriculum/phases.ts`).
**Unblocks:** none.

**Files to modify:**
- `components/v2/LessonStepClient.tsx:151-162` — replace the existing 2-line header strip with the 3-node breadcrumb. Pull `phaseForChapter(chapter.slug)` from `lib/curriculum/phases.ts`. Lessons inside Chapter render: phase eyebrow → chapter link → lesson link with step counter.
- `components/v2/ChapterNav.tsx:170-178` — replace `<span>{stepTypeLabel(step.type)}</span>` with a content preview. Need `step.prompt` exposed to the nav. Trim to 32 chars + ellipsis. Read steps don't have `prompt` — fall back to `body.slice(0, 32)`. Helper: `stepPreview(step): string`.
- `components/v2/LessonStepClient.tsx:144-149` — pass `chapterTree` (already there as `tree`) and `chapter` (already there) — no signature change. But the props passed into `<V2ChapterNav>` already have everything needed; the change is internal to `ChapterNav.tsx`.
- `components/v2/ChapterNav.tsx:209-220` — `stepTypeLabel` stays as a fallback for steps with no extractable preview text (defensive). Add `stepPreview(step)` helper that prefers `step.prompt`, then `step.body`, then falls back to `stepTypeLabel`.

**Files to create:** none.

**Files to delete:** none.

**Key code snippets:**

`components/v2/LessonStepClient.tsx:150-163` BEFORE → AFTER:
```tsx
// BEFORE
header={
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between text-xs text-ink-400">
      <span className="tracking-wide">{chapter.title.toLowerCase()}</span>
      <span className="font-mono">{stepIndex + 1} / {totalSteps}</span>
    </div>
    <h1 className="font-display text-xl text-ink-100">{lesson.title.toLowerCase()}</h1>
    <ProgressBar value={(stepIndex + 1) / totalSteps} />
  </div>
}

// AFTER
header={
  <div className="flex flex-col gap-1.5">
    <div className="t-mono-meta flex items-center gap-2">
      {(() => {
        const phase = phaseForChapter(chapter.slug);
        return phase ? (
          <span>
            phase {String(phase.number).padStart(2, "0")} · {phase.name}
          </span>
        ) : null;
      })()}
    </div>
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-baseline gap-2 truncate">
        <Link
          href={`/learn/v2/${chapter.slug}`}
          className="t-mono-meta text-ink-300 hover:text-green-400 transition-colors"
        >
          ch {String(chapter.number).padStart(2, "0")} · {chapter.title.replace(/\s*—.*$/, "").toLowerCase()}
        </Link>
        <span className="t-mono-meta text-ink-600">›</span>
        <span className="t-mono-meta truncate">
          lesson {chapter.lessons.findIndex((l) => l.slug === lesson.slug) + 1} of {chapter.lessons.length} · {lesson.title.toLowerCase()}
        </span>
      </div>
      <span className="t-mono-meta tabular-nums">step {stepIndex + 1} / {totalSteps}</span>
    </div>
    <ProgressBar value={(stepIndex + 1) / totalSteps} />
  </div>
}
```

> **Imports added at the top of `LessonStepClient.tsx`:**
> ```tsx
> import Link from "next/link";
> import { phaseForChapter } from "@/lib/curriculum/phases";
> ```

`components/v2/ChapterNav.tsx:170-178` BEFORE → AFTER:
```tsx
// BEFORE
<span>{stepTypeLabel(step.type)}</span>

// AFTER
<span className="truncate">{stepPreview(step)}</span>
```

`components/v2/ChapterNav.tsx:209-220` (extend the file with `stepPreview`):
```tsx
// AFTER (add new helper, keep stepTypeLabel as fallback)
import type { Step } from "@/lib/content/schema";

function stepPreview(step: Step): string {
  // Prefer authored prompt/body — falls back to step-type label so the sidebar
  // never goes blank for an unhandled step shape.
  const raw =
    "prompt" in step && typeof step.prompt === "string" ? step.prompt :
    "body" in step && typeof step.body === "string"     ? step.body   : "";
  const cleaned = raw.replace(/[`*_#>-]/g, "").replace(/\s+/g, " ").trim();
  if (!cleaned) return stepTypeLabel(step.type);
  const max = 32;
  return cleaned.length > max ? cleaned.slice(0, max).trimEnd() + "…" : cleaned.toLowerCase();
}
```

**Test checklist:**
- [ ] `pnpm build` exits 0; TypeScript narrowing on the discriminated `Step` union passes for both `prompt` and `body` properties.
- [ ] `/learn/v2/variables/naming-things/0` shows the breadcrumb with phase + chapter + lesson + step counter.
- [ ] Click the chapter breadcrumb → navigates to `/learn/v2/variables` (overview).
- [ ] Sidebar shows content previews (e.g. `what's a variable in py…`) instead of `multiple choice`.
- [ ] No console errors when opening a Read step (which has `body`, not `prompt`).

**Verification (post-deploy):**
- [ ] DevTools → look at any lesson step → header shows 3 lines: phase eyebrow / chapter+lesson link row / step counter.
- [ ] Sidebar step entries are content-meaningful, not type-meaningful.

**Risks:**
- `step.prompt` and `step.body` are discriminated-union properties; using `"prompt" in step` for narrowing avoids the casts the rest of the codebase uses. Prefer property checks over `as`.
- 32 chars is intentionally tight — wider sidebar is V3.
- If `phaseForChapter()` returns `undefined` (a chapter not registered in `lib/curriculum/phases.ts`), the phase eyebrow simply won't render. Won't crash. Sanity-check: every of the 25 slugs is in PHASES.

---

### PR 6: GitHub stars + last-commit pill in global header + StatStrip + `/changelog` route

**Branch:** `refresh-v2/06-receipts-layer`
**Outcome:** Build-time GitHub stats fetch produces a frozen JSON; `<SiteHeader>` (extracted from inline) renders `★ N · committed Xh ago` plus the existing X-pill plus the wordmark; `<StatStrip>` renders `25 chapters · 624 steps · 8–15h · MIT · last commit ${date}` on `/` and `/about`; new `/changelog` route renders pre-filled markdown entries.
**Estimated time:** 4h
**Depends on:** PRs 1 + 3 (tokens + `<CourseProgress>` is replaced wholesale by `<SiteHeader>` here — clean handoff).
**Unblocks:** none — receipts layer is the cap.

**Files to modify:**
- `package.json:5` — add to the `prebuild` chain: `"prebuild": "node scripts/copy-pyodide.mjs && node scripts/build-content.mjs && node scripts/build-content-v2.mjs && node scripts/fetch-github-stats.mjs"`. Also add the same to `predev` so dev mode has fresh stats when network is up.
- `app/layout.tsx:23-36` — replace the inline header `<div>` block with `<SiteHeader />`.
- `app/page.tsx:122` (after the existing value-prop section) — insert `<StatStrip />`. Prefer mounting it directly above the chapter-grid section: `<StatStrip className="mt-24 mb-12" />`.
- `app/about/page.tsx:135` (under the sub-hero, before the WEDGE section starts at `:152`) — insert `<StatStrip />` so the hero shows 5 receipts before any scroll.
- `app/page.tsx:234-242` (footer) — append `· last commit {date} · changelog` link.
- `app/about/page.tsx:378-381` (footer) — append `· last commit {date} · changelog`.
- `.gitignore` — add `lib/generated/github.json`.

**Files to create:**
- `scripts/fetch-github-stats.mjs` — node script run at build time. Fetches `https://api.github.com/repos/xernst/promptdojo`. Writes `{ stars, lastCommitISO, fetchedAt }` to `lib/generated/github.json`. Network failure / non-200 / rate limit → write `{ stars: null, lastCommitISO: null, fetchedAt: <iso> }` and exit 0 (build does not fail). ~50 lines.
- `lib/generated/github.json` — gitignored. Build emits it.
- `lib/github-stats.ts` — typed accessor: `import data from "./generated/github.json"; export const githubStats = data as { stars: number | null; lastCommitISO: string | null; fetchedAt: string };` plus a `formatRelative(iso, now): string` helper (`6h ago`, `2d ago`, `3w ago`).
- `components/SiteHeader.tsx` — server component (one server-side import of `githubStats`). Renders wordmark + stars/committed pill + X-pill + the existing `<LoginToSave>` (demoted to ghost in PR 7) + `<StreakWidget>` + `<CourseProgress>` (passed as props or composed). ~80 lines.
- `components/StatStrip.tsx` — server component. Renders `25 chapters · 624 steps · 8–15h · MIT · last commit ${date}` from `lib/generated/v2/manifest.toc.json` totals + `githubStats.lastCommitISO`. The `8–15h` value is a constant for now (per `06-trust-signals.md` table). ~40 lines.
- `app/changelog/page.tsx` — server component. Reads `content/changelog.md` at build time using `fs/promises` (works under static export). Renders entries with the `prose-invert` styles already defined in `globals.css`. Adds a back-link. ~60 lines.
- `content/changelog.md` — pre-filled with 5 entries per `06-trust-signals.md` template. Lowercase voice, dated, one line per entry. ~30 lines.

**Files to delete:** none.

**Key code snippets:**

`scripts/fetch-github-stats.mjs` (NEW, ~50 lines, ESM, no deps beyond node built-ins):
- Imports: `writeFile`, `mkdir` from `node:fs/promises`; `join`, `resolve` from `node:path`.
- Constants: `REPO_API = "https://api.github.com/repos/xernst/promptdojo"`, `COMMITS_API = "${REPO_API}/commits?per_page=1"`, output at `lib/generated/github.json`.
- Fetch both URLs with `headers: { "User-Agent": "promptdojo-build" }`. Extract `stargazers_count` from repo response, `commit.author.date` from commits[0].
- Wrap entire body in `try/catch`. On any error, log `[fetch-github-stats] soft-fail: ${err.message}` and continue.
- ALWAYS write the JSON (success or fallback): `{ stars: number | null, lastCommitISO: string | null, fetchedAt: ISO }`. Top-level `.catch()` on `main()` writes the null fallback and `process.exit(0)`. **Build NEVER fails.**

`lib/github-stats.ts` (NEW): export `type GitHubStats`, `const githubStats = (raw as GitHubStats)` from the generated JSON, plus `formatRelative(iso, now = new Date()): string | null` (returns `${m}m ago` < 60min, `${h}h ago` < 24h, `${d}d ago` < 14d, `${w}w ago` < 8w, else `iso.slice(0, 10)`; guard `Number.isFinite`) and `formatDateShort(iso): string | null` (`iso?.slice(0, 10) ?? null`).

`components/SiteHeader.tsx` (NEW, server component, ~30 lines): preserve the existing `app/layout.tsx:24-36` markup verbatim — `<a href="/about">` left, right cluster `<div className="flex flex-wrap items-center gap-2">`. Cluster contents in order: `<GitHubStatsPill />`, `<CourseProgress />`, `<LoginToSave />`, `<FollowOnXPill />`.

`components/GitHubStatsPill.tsx` (NEW): server component reading `githubStats`. Returns `null` when both fields null. Else `<a href="https://github.com/xernst/promptdojo" target="_blank" rel="noopener noreferrer">` styled identically to `FollowOnXPill` (green-700/50 border, mono uppercase, ember). Label: `[ ★ ${stars} · ${rel} ]` when both present; `[ ★ ${stars} ]` if only stars; `[ committed ${rel} ]` if only commit. `aria-label` describes both.

`components/StatStrip.tsx` (NEW, server component, ~25 lines): imports `toc` from generated JSON + `githubStats`. Computes `chapters = toc.chapters.length`, `steps = toc.chapters.reduce((a, c) => a + c.stepCount, 0)`. `HOURS = "8–15h"` constant. Renders `<div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 t-mono-meta", className)}>` with separators `<span className="text-ink-700">·</span>` between: `${chapters} chapters`, `${steps} steps`, `${HOURS}`, `<span className="text-green-500">MIT</span>`, optional `last commit ${formatDateShort(githubStats.lastCommitISO)}`.

`content/changelog.md` (NEW — pre-filled per `06-trust-signals.md` template):
```markdown
# changelog

what shipped, when. the source is on github; this is the prose version.

---

2026-05-06 · v2 refresh — phase-banded curriculum tree on home, ProgressHairline primitive across three surfaces, welcome-back card knows what step you're on. punk + receipts.

2026-05-05 · system tokens landed. one type scale, one card pattern, one button hierarchy. dropped the gradient. focus ring is the same shape on every surface.

2026-05-03 · github pill + statstrip ship. last-commit-3-days-ago appears in the header. /changelog route exists. fewer mysteries.

2026-04-29 · pyodide preloader moved to home; first lesson runs in ~600ms after warm-up.

2026-04-21 · v0.1 deployed to promptdojo.pages.dev. 25 chapters live. zero accounts.

---

> latest source: github.com/xernst/promptdojo
> daily build notes: x.com/TFisPython
```

`app/changelog/page.tsx` (NEW, ~25 lines, server component): export `metadata` (title + description). Default export `async function ChangelogPage()` reads `content/changelog.md` via `await readFile(join(process.cwd(), "content", "changelog.md"), "utf8")`. Renders `<main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">` with a `<Link href="/" className="t-mono-meta">← home</Link>` plus `<article className="prose prose-invert mt-6 max-w-none">` wrapping `<ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>`. (`react-markdown` + `remark-gfm` are existing deps per `package.json`.)

**Test checklist:**
- [ ] `pnpm build` exits 0. `lib/generated/github.json` present and JSON-valid.
- [ ] Disconnect network and run `pnpm build` again — script logs `soft-fail` but writes a `null/null` payload; build still completes; pill hidden on the rendered page.
- [ ] `/`, `/about`, every `/learn/v2/...` route renders the GitHub pill (when API returned data).
- [ ] StatStrip on `/` (above chapter grid) and `/about` (under sub-hero) render the same 5 receipts.
- [ ] `/changelog` renders 5 entries; back-link to `/` works.
- [ ] Footer on `/` and `/about` shows `· last commit 2026-05-XX · changelog`.

**Verification (post-deploy):**
- [ ] curl `https://promptdojo.pages.dev/changelog/` returns 200 with the entries.
- [ ] DOM inspector: `★ N · committed Xh ago` pill visible in header on every page.
- [ ] DOM inspector: `<div class="t-mono-meta">` containing `MIT` rendered exactly twice on the property (`/` once, `/about` once).
- [ ] No console errors mentioning hydration, undefined, or null.

**Risks:**
- **Cloudflare Pages CI may not have outbound network.** Most modern CI platforms do, but if Pages restricts: the script's hard-fail handler writes a null payload + exits 0. Pill auto-hides. **No build break, ever.** Verify on first deploy by checking the Pages build log for the `[fetch-github-stats]` line.
- `content/changelog.md` is dev-authored. Senior dev should fill the entries with real commit summaries before merging — placeholder entries are MORE damaging than no changelog.
- `app/changelog/page.tsx` reads `content/changelog.md` via `fs/promises` at build time. Static export bundles this into the resulting HTML. Confirm by checking `out/changelog/index.html` exists post-build.
- `<CourseProgress>` was inserted at `app/layout.tsx:32-35` in PR 3 directly. **PR 6 deletes that direct insertion and moves it inside `<SiteHeader>`**. Don't double-mount it. The diff for PR 6 should explicitly remove the PR 3 marker.
- Replacing the inline header in `app/layout.tsx` removes the `flex-wrap` div — verify mobile layout (390px) still wraps both pills under the wordmark.
- The `<a>` inside `<SiteHeader>` for "what is this?" is an `<a>`, not a `<Link>` — preserve the existing implementation (it's a top-level layout element, not a route transition). Don't introduce client-side navigation here.

---

### PR 7: Voice cleanup pass

**Branch:** `refresh-v2/07-voice-cleanup`
**Outcome:** String-replacement-only diff. Eyebrow renames, FAQ entry, founder credential, pill demotion, `next chapter →` rename. Lowest-risk PR. Easy to revert.
**Estimated time:** 2h
**Depends on:** PRs 1–6 all landed.
**Unblocks:** none.

**Files to modify:**
- `app/page.tsx:155` — `25 chapters · production-ai track included · free forever` → `25 chapters · 624 steps · free forever`.
- `app/about/page.tsx:181` `what's inside` → `the curriculum`.
- `app/about/page.tsx:211` `how it works` → `the loop`.
- `app/about/page.tsx:158-163` — tighten the WEDGE H2 from `every other course teaches you what python is. this one teaches you what it isn't.` → `every course teaches you what python is. you need to know what it isn't.`. Drops `every other` (redundant) and shifts "this one teaches" → "you need to know" (per `03-brand-fidelity.md:96`).
- `app/about/page.tsx:91-115` — replace the FAQ array. Add a NEW entry after the `why isn't it on udemy` block at array index 5: `{ q: "how often is it updated?", a: "commits land most weeks. content gets revised when models change shape — the agent-loop chapter looks different in 2026 than it did in 2025. follow the build at @TFisPython." }`. Plus the `do i have to log in?` and `why isn't it on udemy` micro-edits per `03-brand-fidelity.md:104,108`.
- `app/about/page.tsx:277-282` — insert one founder-credential sentence between `i'm josh.` and `i wrote this...`. Senior dev (Josh) writes the actual sentence per `03-brand-fidelity.md:189` shape: `i'm josh. ${one role + one tool stack + one frequency word}. i wrote this because...`. **Implementer prompt to Josh:** "Write the one-line credential. Format: I'm an AI consultant; I ship Python alongside Cursor and Claude every day for client work. (Lowercase. One sentence.)"
- `components/v2/LessonStepClient.tsx:189` — `next ? "continue →" : "finish"` → `next ? "continue →" : "next chapter →"`. Note: when `next === null` for THE absolute last lesson of the absolute last chapter (capstone, lesson last), this still says `next chapter →`. The CEO vision (§Voice §10) suggests `that's all 624 →` for that absolute terminus. Implementation: detect "no `next`" + "this is the final chapter (capstone)" using `getV2Toc()` — but that's a server-side call; for the client component, the simpler rule is `next ? "continue →" : "that's all 624 →"`. **Pick `that's all 624 →` for null next**, since the only path to `next === null` is finishing capstone.
- `components/v2/StepFooter.tsx:33,88,122,132` — already lowercased in PR 1. **In PR 7, double-check the diff and re-lowercase any that snuck back.**
- `app/onboarding/page.tsx:73` — `a coffee. keep the streak alive.` → `a coffee. one short read.`.
- `app/onboarding/page.tsx:336-338` — `skip — generic examples` → `skip — use generic names`.
- `components/LoginToSave.tsx:160` — demote the global LoginToSave pill to ghost (no border, ember text only) when logged-out. The internal modal styling stays the same.

  ```tsx
  // BEFORE — components/LoginToSave.tsx:160
  className="inline-flex items-center gap-1.5 border border-green-700/50 bg-green-950/40 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-green-400 transition hover:border-green-500 hover:text-green-300"

  // AFTER — when email is null (logged-out), drop the border + bg.
  className={cn(
    "inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition",
    email
      ? "border border-green-700/50 bg-green-950/40 text-green-400 hover:border-green-500 hover:text-green-300"
      : "text-ink-500 hover:text-green-400"
  )}
  ```

- `components/LoginToSave.tsx:194-198` — body copy tighten: `type your email. we'll sync your progress here and on any other device. no password. no spam. type the same email anywhere else and your dojo loads.` → `type your email. we sync your progress across devices. no password. no spam. same email anywhere else, same dojo.`.
- `app/page.tsx:240` — `Press ⌘⇧B from anywhere to park...` → `press ⌘⇧B anywhere to park...`.

**Files to create:** none.

**Files to delete:** none.

**Test checklist:**
- [ ] `pnpm build` exits 0.
- [ ] grep for `production-ai track` → empty.
- [ ] grep for `what's inside` in `app/about/page.tsx` → empty.
- [ ] grep for `keep the streak alive` → empty.
- [ ] grep for `Continue` (capital C) in components — should be 0.
- [ ] `/about` FAQ has 7 entries, including `how often is it updated?`.
- [ ] `/about` `who built it` paragraph has the credential sentence.
- [ ] Final-lesson Continue button reads `that's all 624 →`. Sub-final reads `continue →`. Mid-lesson reads `continue →`.

**Verification (post-deploy):**
- [ ] DevTools → search the rendered DOM for `Continue`, `Hint`, `Skip`, `Lesson XP` — none found.
- [ ] `/about` renders 7 FAQ items.
- [ ] LoginToSave pill (when logged out) shows no border. After login, it gains the bracket-pill border again.

**Risks:**
- The founder credential is the only line in this PR that requires Josh's personal input. Without it, leave a `// TODO(josh): credential sentence` comment in the JSX and ship the rest.
- `LoginToSave` styling change is a cn() merge — verify the modal trigger button on logged-out state actually loses the border (visual test).
- The `next chapter →` rename: confirm `next === null` case via the navigation library — `getNextV2Step()` at `lib/content-v2.ts:73` returns `null` only at the absolute end. Safe.

---

## Cross-cutting concerns

### Token migration strategy — `tokens.css` (doc-only) vs `globals.css` (runtime)

The contract: `design-kit/tokens.css` continues to be the published spec / preview; `app/globals.css` is the runtime source of truth. **Keep this convention.** PR 1 adds the `t-*` / button / card / focus / hover / skeleton classes to `app/globals.css` only. `design-kit/tokens.css` is reference documentation; the senior dev does not need to keep both files in lockstep this round. (If they want to — small win — add the `t-*` rules to `design-kit/tokens.css` as a side commit. Not load-bearing.)

### TypeScript interface changes (the full list)

| File:line | Field | Direction | Migration |
|---|---|---|---|
| `lib/content/schema.ts:297-305` | `ChapterTocEntry.estMinutes: number` | NEW required | PR 2 — emitted by `build-content-v2.mjs`, no runtime change |
| `lib/storage.ts:133-148` | `ProgressV2.lastSeenAt?: string` | NEW optional | PR 4 — no migration; missing → `undefined` |
| `lib/curriculum/phases.ts` | `Phase`, `PHASES`, `phaseForChapter` | NEW exports | PR 2 — pure data |
| `lib/home-state.ts` | `HomeState`, `ChapterSummary`, `resolveHomeState` | NEW exports | PR 4 — pure resolver |
| `lib/github-stats.ts` | `GitHubStats`, `githubStats`, `formatRelative`, `formatDateShort` | NEW exports | PR 6 |

### Tailwind 4 `@theme` additions

PR 1 does NOT add new colors or fonts to `@theme` — uses existing `--color-ink-*` / `--color-green-*` / `--font-mono` / `--font-display`. The `t-*` utility classes are bare CSS rules, not Tailwind utilities. They do NOT need `@theme` registration. If senior dev wants `text-t-hero` Tailwind syntax, that's an add for V3.

### localStorage shape extension

ONE additive optional field: `ProgressV2.lastSeenAt?: string`. Backward-compatible; missing keys load as `undefined` because of the existing spread merge in `loadProgressV2`. **No `schemaVersion` bump.** Old saved sessions read fine. No migration code added or needed.

### Build-time data fetching for GitHub stars / last commit

`scripts/fetch-github-stats.mjs` runs in the `prebuild` chain. Output JSON is gitignored. The script:
1. Hits `api.github.com/repos/xernst/promptdojo` and `.../commits?per_page=1`.
2. On success: writes `{ stars, lastCommitISO, fetchedAt }` to `lib/generated/github.json`.
3. On any failure (network, rate limit, 4xx, 5xx, JSON parse): writes `{ stars: null, lastCommitISO: null, fetchedAt }` and exits 0.
4. Components hide gracefully when both fields are null.

This is consistent with the static-export constraint: data is frozen at build time. Cloudflare Pages re-runs `prebuild` on every deploy, so the data is at most one deploy stale. No runtime API calls. No client-side fetches.

---

## Rollback playbook

Each PR is one squash-merged commit on `main`. Rollback per PR:

1. `git revert <sha>` on `main`. (Use `--no-edit` to skip the editor; or write a 1-line revert message.)
2. `git push origin main`.
3. Cloudflare Pages auto-redeploys (~2 min).
4. Verify the previous PR's behavior is back via the verification checklist for the prior PR.

**Special cases:**
- If reverting **PR 4** (`lastSeenAt`) and a user has already saved a `lastSeenAt` value: harmless. Old code reads it as junk but ignores; never crashes (additive contract).
- If reverting **PR 2** (`ChapterTocEntry.estMinutes` is now required by Zod): **this WILL fail Zod parsing** unless the manifest still has the field. Solution: revert PR 2 + run `pnpm build:content` to regenerate a manifest WITHOUT `estMinutes`. Or: keep the manifest's `estMinutes` field; the Zod schema in the reverted state allows extra unknowns by default in `as ManifestToc` casts (not strict-parsed). Confirmed safe.
- If reverting **PR 6** + the github fetch script is gone: `lib/generated/github.json` may still exist from a previous build. Add it to `.gitignore` removal too, or `rm lib/generated/github.json`.

---

## Risks I flagged but the CEO accepted (paper trail)

- **Soft-fallback GitHub fetch on Cloudflare Pages.** If Pages CI ever blocks outbound network, the pill is invisible site-wide until the script can run from CI. Mitigation: the script never fails the build; the site still ships, just without the pill. Acceptable per CEO §6 "Cloudflare-friendly."
- **`lastSeenAt` writes on every save.** In a chatty step-draft session this is potentially dozens of writes per minute. localStorage ops are sync but cheap; <1ms per write. Acceptable.
- **`/curriculum` standalone route deferred to V3.** SEO impact is real but pre-1000-followers it doesn't matter. CEO §Divergent #1 explicit cut.
- **Hard prereq locks rejected; soft chips deferred.** A user can click into ch20 from a fresh start and bounce. Audience-over-completion accepts the leak. CEO §Divergent #3 explicit.
- **Pane labels (`❯ prompt`, `❯ editor`, `❯ stdout`) deferred.** The 3-node breadcrumb (PR 5) carries the "named workspace" signal. CEO §Divergent #5 explicit cut.
- **No GitHub PAT introduced.** Unauthed `api.github.com` is rate-limited at 60/hr per IP. Cloudflare Pages CI shares IPs with other tenants — under load, the build could see 403s. Soft-fallback handles it; star count temporarily shows hidden. Acceptable for $0 budget.
- **No SiteFooter component yet.** The footer additions on `/` and `/about` are duplicated edits, not extracted. Extraction earns its keep when there are >2 surfaces (V3 will likely add `/changelog` footer). Footer DRY-ing is V3 polish.

---

## Things explicitly NOT done in this plan (the cuts — echoing CEO)

- Standalone `/curriculum` route with deep-link expansion + URL hash state.
- Full progress data model: `chapterTimeMs`, `longestSessionMs`, `totalSessionMs`, `milestones[]`, `sessions[]`.
- Phase-just-completed celebration / returning-after-break copy variants (the 5th + 6th home states).
- `/lesson/resume` server-side redirect route.
- Lesson-complete / chapter-complete interstitial screens (Boot.dev-style stats card).
- Pane labels (`❯ prompt`, `❯ editor`, `❯ stdout`) in lesson chrome.
- Mobile pane-tab pill / mobile sidebar drawer / TopBar.
- ASCII glyph icon swap (Lock → ▱, Check → ▰, etc.).
- Per-chapter OG cards (`/og/chapter/[slug]`).
- `</> source` per-lesson link to GitHub blob.
- `pyodide warm · ready` micropill.
- Footer 3-commit feed (the header pill + `/changelog` cover this).
- `$0 forever` callout band on home.
- Launch trailer inline on `/about`.
- Author-defined `Chapter.learnedSkills`.
- Per-lesson difficulty (1-3 dots).
- Hard prereq locks.
- `Saved · Ns ago` indicator.
- Concept-level navigator / search.
- Auth / sync / cross-device progress.
- AI tutor / Copilot panel.
- IA refactor (drop `/learn/v2/` prefix).
- Custom illustration system / tatami background / 3-stripe belt motif.
- Light mode.
- `/settings` route + JSON export/import.

These are parked, not killed. Senior dev: do not let in-PR scope creep pull them into this round. If the urge is strong, append the row to `docs/v3-backlog.md` and move on.

---

## Estimated total time

| PR | Time |
|---|---|
| PR 1 — system tokens | 6h |
| PR 2 — phase-banded rail | 4h |
| PR 3 — tile density + ProgressHairline | 4h |
| PR 4 — welcome-back resolver | 3h |
| PR 5 — lesson breadcrumb | 2h |
| PR 6 — receipts layer (GitHub + StatStrip + /changelog) | 4h |
| PR 7 — voice cleanup | 2h |
| **Total** | **25h** |

Reality check: solo founder + Cloudflare Pages deploy cycle (2 min) + review-yourself-overnight cycles. **3–5 evenings if it goes smoothly, ~1 week of evenings if the GitHub fetch needs CI poking.**

---

## Open questions for the CEO

None blocking. Two non-blocking:

1. **`8–15h` constant on `<StatStrip>`.** Authored once in `components/StatStrip.tsx`. When it shifts, edit one constant. CEO confirm: leave hardcoded vs. derive from `chapter.estMinutes` sums (the derived value would say `~12.5h` which loses the range). **Default: leave hardcoded.** Honest range > derived precision.
2. **The founder credential sentence (PR 7).** Senior dev needs the line from Josh before the PR can land. Recommended shape per `03-brand-fidelity.md:189` — one role + one tool stack + one frequency word, lowercase, one sentence. Submitted via PR comment is fine; no scope change.

— **Head of IT**, 2026-05-06
