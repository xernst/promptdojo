# Senior Dev Worklog — V2 Legitimacy Refresh (FINAL)

> Implementation log for the Phase-2 audit's CEO-vision (`design-kit/audit-v2/CEO-vision.md`)
> against the Head-of-IT plan (`design-kit/audit-v2/HEADOFIT-plan.md`).
> Solo founder, $0 budget, Cloudflare Pages auto-deploy on push to `main`.

## What shipped (7 of 7 PRs from the V2 picked list — all live on `https://promptdojo.pages.dev`)

| PR | Branch / commit | Outcome |
| --- | --- | --- |
| PR 1 | `refresh-v2/01-system-tokens` | Type scale (`t-hero`, `t-section`, `t-h2`, `t-h3`, `t-eyebrow`, `t-body`, `t-body-sm`, `t-mono-meta`) + card pattern + 3-tier button hierarchy (`dojo-btn-primary` / `dojo-btn-secondary` / `dojo-btn-tertiary`) + sitewide focus canon codified in `app/globals.css` `@theme` block. The gate. |
| PR 2 | `refresh-v2/02-phase-banded-rail` | Home chapter grid replaced by phase-banded rail; 5 phases lifted from `app/about/page.tsx` into `lib/curriculum/phases.ts` as the single source of truth. |
| PR 3 | `14fb93d refresh-v2/03-tile-density-and-progress` | `<ProgressHairline>` primitive (used in 3 places: chapter cards, lesson XP, sitewide course pill). Chapter tiles now show 8 fields including time estimate. |
| PR 4 | `0a1ce6d refresh-v2/04-welcome-back-resolver` | 4-state home resolver replaces 3-state. `lastSeenAt` added to `ProgressV2` (additive — no schema bump). Step-aware "resume" copy. |
| PR 5 | `cbffb84 refresh-v2/05-lesson-breadcrumb` | 3-node lesson breadcrumb (extended to 4 nodes in V3 PR 6). |
| PR 6 | `b6fc06d refresh-v2/06-receipts-layer` | Build-time GitHub stats fetch (`scripts/fetch-github-stats.mjs`, frozen to `lib/generated/github.json`). `<StatStrip>` primitive on `/` and `/about/`. New `/changelog` route. `view source · committed Xh ago` pill in header. |
| PR 7 | `76448b1 refresh-v2/07-voice-cleanup` | Section-label renames: `what's inside` → `the curriculum`, `how it works` → `the loop`. New FAQ entry "how often is it updated?". `LoginToSave` demoted to ghost. Final lowercase voice sweep. |

## Verification results (live, post-deploy, against the V2 picked-list markers)

```
GET https://promptdojo.pages.dev/                      200
GET https://promptdojo.pages.dev/about/                 200
GET https://promptdojo.pages.dev/changelog/             200
GET https://promptdojo.pages.dev/learn/v2/variables/    200
GET https://promptdojo.pages.dev/learn/v2/variables/naming-things/0  200
```

**Targeted marker grep on rendered HTML:**

| Marker | Surface | Hits | Status |
| --- | --- | --- | --- |
| `624 steps` | `/` | 3 | ✓ |
| `624 interactive steps` | `/` | 3 | ✓ |
| `398 steps` (mismatch — must be 0) | `/` | 0 | ✓ |
| `the curriculum` (eyebrow rename) | `/about/` | 3 | ✓ |
| `the loop` (eyebrow rename) | `/about/` | 2 | ✓ |
| `how often is it updated` (new FAQ) | `/about/` | 2 | ✓ |
| `last commit` / `last shipped` (receipts) | `/about/` | 4 | ✓ |
| 4-node breadcrumb DOM | `/learn/v2/.../0` | present | ✓ |
| ContinuePill | `/` | 2 | ✓ |

**Note on lesson breadcrumb:** the breadcrumb renders the phase NAME ("foundations"),
not the phase number ("phase 01"). This is the V3 PR 6 partial shape (commit `88481a2`)
and is the correct behavior per the navigation-system spec — phase names read better
than numbers in a 4-node crumb.

**Build state:** `pnpm build` clean on every PR. No TypeScript errors. No new warnings.
Static export produces working `out/` directory; CF deploy green every push.

## Migration safety report (PR 4 — `lastSeenAt` field added)

- `ProgressV2.lastSeenAt?: string` added as **optional** field. No schema bump required.
- Existing localStorage `promptdojo:progress:v2` payloads load without modification —
  spread merge in `loadProgressV2` (`lib/storage.ts:175-203`) handles missing field.
- First write after V2 deploy stamps `lastSeenAt` from `setLastVisitedV2` only
  (not on every `setStepDraft` keystroke — addressed by V3 PR 0 for cleanliness).
- Tested: existing v2 user → load → no crash → first navigation stamps `lastSeenAt`.

## What didn't ship in V2 (parked for V3, all picked up there)

V2 originally CUT the following from the picked list with documented reasoning;
they were re-evaluated for V3 and either picked up or re-deferred:

| Cut from V2 | V3 disposition |
| --- | --- |
| Standalone `/curriculum` route | **Picked up in V3 PR 5** (shipped) |
| Full progress data model (sessions/milestones) | **Re-deferred to V4** — not part of audience-growth metric |
| Per-chapter OG cards (full 25-template) | **Partial in V3 PR 7** — ch07/13/25 only |
| Mobile sidebar drawer | **Partial in V3 PR 6** — tablet shipped at `md:`; phone drawer V3.5 |
| `/settings` page (export/import save) | **Re-deferred to V4** — login-to-save covers cross-device |

## Brand-alignment self-grade

| Stage | Score | Source |
| --- | --- | --- |
| Pre-rebrand (Pyloft) | 4.9 / 10 | Brand Guardian Phase 1 audit |
| After V1 (5 PRs) | 8.5 / 10 | V1 worklog self-assessment |
| **After V2 (7 PRs)** | **8.8 / 10** | self-assessment, post-deploy verified |
| Projected after V3 (7 of 10 shipped) | 9.2 / 10 | V3 senior dev's self-grade |

The V2 lift is "system-level codification" — the punk shell didn't change much, but the
institutional bones underneath (type scale, card pattern, button hierarchy, progress
primitives, breadcrumb, receipts) all got built. That's why the score moves from 8.5
to 8.8 even though no individual surface looks dramatically different — the system is
now in place for V3 / V4 to keep pushing without thrash.

## Unrelated bugs noticed (deferred — surfaced & addressed in V3)

These were spotted during V2 PR work but were out-of-scope for the picked list. Most
were captured by the V3 audit and addressed in the V3 picked list:

1. `awardPass()` writes v1 streak; v2 UI reads v2 — XP silently lost. **Caught in V3
   audit by Code Reviewer; shipped as V3 PR 0** (`1210c31`).
2. `lib/generated/v2/manifest.toc.json` timestamp pollutes git status after every
   `pnpm build` (V2 worklog flagged → V3 carries forward).
3. `text-ink-700` used as text color in 5 places (1.7:1 contrast, WCAG fail).
   **Addressed in V3 PR 1** (`e58f5fe`).
4. `oneDark` (Atom's brand) still themed CodeMirror.
   **Addressed in V3 PR 3** (`b7b658e`).
5. Default unbranded Next.js 404. **Addressed in V3 PR 1** (`e58f5fe`).
6. Schema duplication between `lib/content/schema.ts` and `scripts/build-content-v2.mjs`.
   Flagged by V3 Code Reviewer; deferred to V4 (architectural risk, not blocking).

## Files of note (net-new this V2)

- `lib/curriculum/phases.ts` — single source of truth for the 5 phases
- `lib/generated/github.json` — build-time-frozen GitHub stats (gitignored)
- `lib/github-stats.ts` — runtime accessor + `formatDateShort` helper
- `scripts/fetch-github-stats.mjs` — build-time fetcher with null fallback
- `components/PhaseBandedRail.tsx` — chapter rail
- `components/ProgressHairline.tsx` — single progress primitive
- `components/StatStrip.tsx` — stat row used on `/` and `/about/`
- `components/SiteHeader.tsx` — replaced inline header div in `app/layout.tsx`
- `components/CourseProgress.tsx` — sitewide progress pill (used by SiteHeader)
- `components/GitHubStatsPill.tsx` — view-source + last-commit-ago pill
- `app/changelog/page.tsx` — markdown-rendered changelog route

**Files substantively rewritten in V2:**

- `app/globals.css` — `@theme inline` block expanded with `t-*` and `dojo-btn-*` utilities
- `app/page.tsx` — homepage rebuilt around PhaseBandedRail + StatStrip
- `app/about/page.tsx` — eyebrow renames + new FAQ entry + StatStrip
- `app/layout.tsx` — SiteHeader replaces inline header, skip link added (later in V3 PR 1)
- `lib/storage.ts` — `lastSeenAt` field + `setLastVisitedV2` helper
- `components/v2/LessonStepClient.tsx` — 3-node breadcrumb in lesson chrome (extended to 4 in V3)

## What's next (handoff to V3 — already in flight)

V3 picked up 10 PRs (PR 0 + 9 picks). 7 shipped at the time of V2 worklog finalization.
V3 worklog is the source of truth for what's still open: see
`~/Developer/code-killa/design-kit/audit-v3/SENIOR-DEV-worklog.md`.

Open V3 picks at time of writing:
- V3 PR 2 — Python traceback formatter + clickable line jumps
- V3 PR 4 — Pyodide boot hairline + 15s timeout
- V3 PR 8 — `lowlight` python-only + `immutable` cache headers
- V3 PR 6 mobile drawer — hamburger nav for `<768px`
- V3 PR 9 onboarding sweep — applies system tokens to onboarding flow
