# Implementation Plan — Promptdojo Refresh v1

**Author:** Head of IT
**Date:** 2026-05-05
**Contract:** `~/Developer/code-killa/design-kit/audit/CEO-vision.md` (the 7 picks)
**Audience:** Senior dev shipping into `https://promptdojo.pages.dev`

---

## Executive summary

Seven self-contained PRs, sequenced exactly as the CEO ordered (1 → 2 → 4 → 3 → 5 → 6 → 7). Total raw build budget ~24 h; with Cloudflare verification cycles add ~1.5 h. Plan to ship across **3 evening sessions** if smooth, **5 evenings** with normal slippage. Every PR is independently shippable — if PR 5 (CodeMirror theme) slips, everything else still ships and the IDE just stays oneDark another week.

**Key risks (all noted below per-PR):**
- **PR 5 (dojoTheme)** — CodeMirror v6 theme API has rough edges; allocated 4 h with a 1 h buffer.
- **PR 3 (hero)** — only PR with real product judgment; do not merge unless screenshot-tweet-able.
- **Tailwind 4 `@theme` block** — additive across PRs; PR 1 lays the foundation, later PRs add `--ease-*`/`--dur-*`.

**What ships first (within 2 h of PR 1 merging):** Inter is gone, Fraunces is body, ember is the only chromatic accent, `--color-foreground` is `#f4f4f5`. Site instantly looks ~30% more on-brand even without lowercase fixed yet.

---

## Pre-flight checks

Run these before opening any branch:

- [ ] `git fetch && git status` clean on `main`. No uncommitted local work.
- [ ] `pnpm install && pnpm build` green on `main`. Capture build time and bundle size for regression reference (`pnpm build` output, lines starting with `Route (app)`).
- [ ] Cloudflare Pages last deployment is green at `https://promptdojo.pages.dev`. Open it; screenshot the home page baseline so post-refresh diffs are obvious.
- [ ] Local dev server boots: `pnpm dev` → loads `localhost:3000` with no console errors. Verify with `agent-browser open http://localhost:3000` per the dev-server-verify skill.
- [ ] Node version matches `package.json` engines field (Next 16 + React 19 require Node ≥ 20).
- [ ] `tsc --noEmit` clean. (Spec touches some shared types in PR 6 — start clean so any new errors are real.)
- [ ] No `next/headers`, no server actions, no `"use server"` — `next.config.ts` already has `output: "export"`. Reconfirm during PR 3 (hero may tempt a runtime route; resist).

**Tooling needed:**
- `pnpm` (Next 16 monorepo standard)
- `agent-browser` for post-deploy verification
- A second tab open to `https://promptdojo.pages.dev` while iterating
- No new packages should be installed across all 7 PRs. If you reach for one, stop and re-read the constraint.

**Rollback plan:** Each PR is a single squash-merge to `main`. Revert with `git revert <merge-sha>` and Cloudflare auto-redeploys the prior commit within ~90s.

---

## Build order (the canonical sequence)

The CEO's sequence is non-negotiable. Note the order: **1 → 2 → 4 → 3 → 5 → 6 → 7**. The numbering below follows the *PR order*, not the pick number from CEO-vision; each PR header cites the pick it implements.

---

### PR 1: Drop Inter, Fraunces becomes body, kill rogue color tokens
**Implements:** CEO pick #1
**Branch:** `refresh/01-fonts-and-colors`
**Outcome:** Inter is gone from the bundle. Body text renders in Fraunces. `--color-signal`, `--color-paper`, `--color-slate-custom` are deleted. `--color-foreground` is `#f4f4f5`. StreakWidget and ChapterNav stop using teal/orange/amber/cyan/rose.
**Estimated time:** 3 h
**Depends on:** nothing
**Unblocks:** every subsequent PR (the visual baseline shifts)

**Files to modify:**

- `app/layout.tsx:2` — drop `Inter` from the `next/font/google` import
- `app/layout.tsx:6` — delete the `inter` instantiation
- `app/layout.tsx:21` — drop `${inter.variable}` from `<html className>`
- `app/layout.tsx:22` — change `<body className="... font-sans">` to `<body className="... font-display">`
- `app/globals.css:5` — change `--color-foreground: #F7F4ED;` to `#f4f4f5;`
- `app/globals.css:14` — leave `--color-ink-500: #8a8a93;` (WCAG bump is correct, keep)
- `app/globals.css:31` — delete `--color-paper: #F7F4ED;`
- `app/globals.css:32` — delete `--color-signal: #5BC8AF;`
- `app/globals.css:33` — delete `--color-slate-custom: #9AA0A8;`
- `app/globals.css:34` — change `--font-sans` value: drop `var(--font-inter),` (leave system stack as fallback for ad-hoc uses, but body now uses `font-display`)
- `components/StreakWidget.tsx:29-43` — replace `text-orange-300/400`, `text-amber-300/400`, `text-cyan-300/400`, `fill-orange-400` with ember tokens. Strategy below.
- `components/v2/ChapterNav.tsx:78` — `text-signal` → `text-ember-700` (dim ember = "completed" affordance)
- `components/v2/ChapterNav.tsx:93` — `text-signal` → `text-ember-700`
- `components/v2/ChapterNav.tsx:147` — `text-signal hover:text-signal/80` → `text-ember-700 hover:text-ember-500`
- `components/v2/ChapterNav.tsx:151` — drop the `<Check>` (replace with `▰`/`▱` per UI Designer §Sidebar; do that in PR 5 if simpler — for THIS PR just recolor)
- `components/v2/ChapterNav.tsx:196` — `text-signal` → `text-ember-700`
- `components/v2/ChapterNav.tsx:200` — `text-ink-700` → `text-ink-500` (per Brand audit §Critical 12 — `--ink-700` fails contrast)
- `components/ChapterNav.tsx:92` — same `text-ink-700` → `text-ink-500` fix (legacy file, but stays in tree until V2 deletion)
- `components/BrainDump.tsx:96` — `text-white` → `text-ink-100`
- `components/v2/HomeClient.tsx:84` — `text-white` → `text-ink-100`
- `components/v2/HomeClient.tsx:114` — `fill-white text-white` → `fill-ink-100 text-ink-100`
- `components/v2/DailyGoalDial.tsx` — grep for `var(--color-signal)` and replace with `var(--color-ember-500)`. Per UX Architect §CSS audit, line ~77.
- All step-view files (`components/v2/steps/*.tsx`) — grep `text-signal`, `border-signal`, `bg-signal`, `text-rose-300/400/500`, `border-rose-500`, `bg-rose-500`. Map: `signal*` → `ember-700` for "passed", `rose*` → `--err`-mapped class for the canonical error case (only `OutputPane.tsx:29,44` stderr and `PersistentIDE.tsx:355` stderr); everything else `rose*` → `text-ink-400`. **Important:** `--err` is a token, not a Tailwind class. Add `--color-err: var(--err);` in `@theme` if you want `text-err`, OR use inline `style={{ color: 'var(--err)' }}`. Pick the @theme route — see Cross-cutting §Tailwind 4 below.

**Files to delete:** none in this PR.

**Files to create:** none.

**Key code snippets:**

```tsx
// BEFORE — app/layout.tsx:1-22
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BrainDump from "@/components/BrainDump";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["SOFT", "WONK"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

// ...
<html lang="en" className={`dark ${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}>
  <body className="min-h-screen bg-ink-950 text-ink-100 antialiased font-sans">
```

```tsx
// AFTER — app/layout.tsx
import { Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BrainDump from "@/components/BrainDump";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["SOFT", "WONK"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

// ...
<html lang="en" className={`dark ${fraunces.variable} ${jetbrains.variable}`}>
  <body className="min-h-screen bg-ink-950 text-ink-100 antialiased font-display">
```

```css
/* BEFORE — app/globals.css:31-34 */
--color-paper: #F7F4ED;
--color-signal: #5BC8AF;
--color-slate-custom: #9AA0A8;
--font-sans: var(--font-inter), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

/* AFTER */
--font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--color-err: #ef4444;
--color-ok: #86efac;
```

```tsx
// BEFORE — components/StreakWidget.tsx:25-46
<div className="flex items-center gap-3 text-xs">
  <span className="inline-flex items-center gap-1 text-orange-300">
    <Flame size={14} className={s.current > 0 ? "fill-orange-400 text-orange-400" : "text-ink-600"} />
    {s.current}
  </span>
  <span className="inline-flex items-center gap-1 text-amber-300">
    <Sparkles size={14} className={s.embers > 0 ? "text-amber-400" : "text-ink-600"} />
    {s.embers}
  </span>
  <span className="inline-flex items-center gap-1 text-cyan-300">
    <Snowflake size={14} className={s.frozenFlames > 0 ? "text-cyan-400" : "text-ink-600"} />
    {s.frozenFlames}
  </span>
  <span className="hidden sm:inline text-ink-400">{s.totalXp} XP</span>
</div>

// AFTER — three different icons doing the work three different colors used to do.
// All ember; "active" = ember-500, "inactive" = ink-700.
<div className="flex items-center gap-3 font-mono text-xs tabular-nums">
  <span title={`${s.current}-day streak (longest ${s.longest})`} className="inline-flex items-center gap-1 text-ember-500">
    <Flame size={14} className={s.current > 0 ? "fill-ember-500 text-ember-500" : "text-ink-700"} />
    {s.current}
  </span>
  <span title={`${s.embers} ember(s)`} className="inline-flex items-center gap-1 text-ember-500">
    <Sparkles size={14} className={s.embers > 0 ? "text-ember-500" : "text-ink-700"} />
    {s.embers}
  </span>
  <span title={`${s.frozenFlames} frozen flame(s)`} className="inline-flex items-center gap-1 text-ember-500">
    <Snowflake size={14} className={s.frozenFlames > 0 ? "text-ember-500" : "text-ink-700"} />
    {s.frozenFlames}
  </span>
  <span className="hidden sm:inline text-ink-400">{s.totalXp} XP</span>
</div>
```

**Note on `font-variant-numeric: tabular-nums`:** added to StreakWidget here as a freebie since we're touching the file. Same goes for the XP counter when other PRs touch step footers.

**Test checklist (run before pushing):**
- [ ] `pnpm build` green; static export emits to `out/`
- [ ] `pnpm dev` boots; `localhost:3000` loads with no console errors
- [ ] `agent-browser eval "getComputedStyle(document.body).fontFamily"` does NOT contain `Inter`. It should contain `Fraunces`.
- [ ] Hard-refresh `localhost:3000` and check the network panel — no request for an `Inter-*.woff2`.
- [ ] Visit `/`, `/onboarding/`, `/learn/v2/variables/`, `/learn/v2/variables/naming-things/0/` — site renders, no rendering glitches, body is now serif everywhere.
- [ ] StreakWidget renders three ember icons (no orange/amber/cyan).
- [ ] ChapterNav: completed chapters show dim ember, not teal-green.
- [ ] `tsc --noEmit` clean.

**Verification (post-deploy on `promptdojo.pages.dev`):**
- [ ] Network panel shows ONE serif font load (Fraunces variable) + ONE mono font load (JetBrains Mono). No Inter.
- [ ] `getComputedStyle(document.body).fontFamily.includes('Inter')` returns `false` in DevTools.
- [ ] Lighthouse re-run: bundle should be marginally smaller (Inter family ~70KB woff2 saved).
- [ ] Screenshot diff vs the pre-refresh baseline confirms Fraunces in cards/body, no teal anywhere.

**Risks:**
- **Fraunces at body sizes can read heavy on dark backgrounds.** Brand kit (`TYPOGRAPHY.md:73`) says "use 350 or 400 on dark, never 500+". If body looks chunky, lower the explicit `font-weight` from 500 to 400 in any class that sets it. Don't change font-family.
- **A few step-view files use `text-signal` for "passed" pills with `bg-signal/5` and `border-signal/50`.** When you delete the token, Tailwind 4 will emit a warning at build, not an error — but the *visual* will silently revert to default text color. Grep `signal` site-wide before pushing.
- **`text-ink-700` removal from text contexts may break the look of two ChapterNav lines.** That's intentional — it failed contrast. Use `text-ink-500` and confirm visually.

---

### PR 2: Lowercase every headline + CTA across the product
**Implements:** CEO pick #2
**Branch:** `refresh/02-voice-lowercase`
**Outcome:** Zero title-case headlines remain in `app/`, `components/`, `content-v2/`, OG art chapter eyebrows, page metadata. Voice score 5/10 → 9/10. The `Saved` indicator on `/onboarding` continues to show step counts but the labels are lowercase.
**Estimated time:** 2 h
**Depends on:** PR 1 merged (so the visual judgment of lowercase-Fraunces is consistent)
**Unblocks:** PRs 3, 4, 7 (those PRs add new strings; lowercase is the default by then)

**Files to modify (with target string changes):**

- `app/page.tsx:10` — `"promptdojo — free interactive Python course for AI builders"` → `"promptdojo — free interactive python course for ai builders"`
- `app/page.tsx:16, 24` — same replacement on OG/Twitter title fields
- `app/page.tsx:25-27` — Twitter description: keep punctuation, lowercase first letter of every sentence-start
- `app/page.tsx:65-66` — eyebrow already lowercase ("promptdojo"), keep
- `app/page.tsx:69` — `"Python for AI-first builders."` → `"python for ai-first builders."`
- `app/page.tsx:71-79` — body copy: `"The Python you need..."` → `"the python you need..."`. `"Built for the marketing managers, PMs, and ops folks..."` → `"built for the marketing managers, pms, and ops folks..."`. Note: kit accepts `pms` lowercase per BRAND.md examples.
- `app/page.tsx:97, 102, 107` — card titles: `"Read what AI wrote"` / `"Catch what it got wrong"` / `"Direct it deliberately"` → all lowercase including `ai`
- `app/page.tsx:99, 104, 109` — card body: lowercase first letters; `"Cursor or Claude"` becomes `"cursor or claude"` (product names are not exempt per VOICE.md examples like `"ai writes this"`)
- `app/page.tsx:127` — `"25 chapters · production-AI track included · free forever"` → `"25 chapters · production-ai track included · free forever"`
- `app/page.tsx:133` — `"new here? start the 5-question onboarding →"` already lowercase, keep
- `app/page.tsx:150` — `"Ch ${number}"` (in the chapter card grid number eyebrow) → `"ch ${number}"`
- `app/page.tsx:153` — `titleClean` — chapter titles come from `lib/content-v2`. Apply `.toLowerCase()` at render: `{titleClean.toLowerCase()}`. **Don't** rewrite the markdown frontmatter — let the render layer handle it. (Reasoning: less churn, single source.)
- `app/page.tsx:189` — `"Legacy 28-chapter course (old style)"` → `"legacy 28-chapter course (old style)"`
- `app/onboarding/page.tsx:194` — `"You're going to learn Python."` → `"you're going to learn python."`
- `app/onboarding/page.tsx:197-198` — body copy: `"With AI as your co-pilot, not your crutch. We'll teach you..."` → `"ai is your co-pilot, not your crutch. you'll learn the shapes you need to direct it, read it, and catch when it's wrong."` (this is also the Brand §Marketing-throat-clearing fix per CEO pick #7 — fold it in here as a freebie since we're already lowercasing the screen)
- `app/onboarding/page.tsx:209` — `"Start"` → `"start"`
- `app/onboarding/page.tsx:226` — `"What are you trying to build?"` → `"what are you trying to build?"`
- `app/onboarding/page.tsx:262` — `"Where are you starting from?"` → `"where are you starting from?"`
- `app/onboarding/page.tsx:301` — `"Make the examples yours."` → `"make the examples yours."`
- `app/onboarding/page.tsx:347, 367, 396, 398` — `"Continue"`, `"Pick a daily floor."`, `"Start lesson 1"` → all lowercase
- `app/onboarding/page.tsx:30-76` — `GOAL_OPTIONS`, `LEVEL_OPTIONS`, `DAILY_OPTIONS` `label` and `blurb` fields: lowercase everywhere except inline product names where the brand grep accepts mid-string (none here actually need uppercase — kit lowercases `ai`, `cursor`, `claude` per examples)
- `app/onboarding/page.tsx:GOAL_OPTIONS[1].label` (`"Tools for my team at work"`) → `"tools for my team at work"`. Same for blurb.
- All `aria-label` props on form inputs in `PersonalizationScreen` (`onboarding/page.tsx:308+`) — lowercase the SCREAMING UPPERCASE labels Evidence Collector flagged at line ~27 of the walkthrough audit. Find them at `Field` component definitions further down the file.
- `components/v2/HomeClient.tsx:73` — `"start here"` already lowercase, keep
- `components/v2/HomeClient.tsx:77` — `"Get started in under a minute"` → `"get started in under a minute"`
- `components/v2/HomeClient.tsx:80` — `"Five questions, then your first lesson."` → `"five questions, then your first lesson."`
- `components/v2/HomeClient.tsx:94` — `"Ch ${chapter.number} · ${chapter.title.replace(...)}"` → `"ch ${chapter.number} · ${chapter.title.replace(...).toLowerCase()}"`. Same `.toLowerCase()` strategy.
- `components/v2/HomeClient.tsx:95` — `"Pick up where you left off"` (the heading fallback) → `"pick up where you left off"`
- `components/v2/HomeClient.tsx:104` — eyebrow `"welcome back"` already lowercase. Keep.
- `components/v2/LessonStepClient.tsx:153` — `chapter.title` rendered uppercase via `tracking-wide`. Add `.toLowerCase()` to the rendered string OR simpler: on `<span>` element drop `uppercase` Tailwind class (it's not currently set — check). The `uppercase tracking-wide` class IS at line 153 — drop `uppercase`.
- `components/v2/LessonStepClient.tsx:160` — `lesson.title` displayed in Fraunces — apply `.toLowerCase()` at render
- `components/v2/LessonStepClient.tsx:176` — `"Locked in. Move on when you're ready."` → `"locked in. move on when you're ready."` (kit accepts sentence-case for inline status, but for consistency with everything else this PR lowercases)
- `components/v2/LessonStepClient.tsx:177` — `"⌘↵ runs the editor."` already lowercase. Keep.
- `components/v2/LessonStepClient.tsx:189` — `"Continue →"`, `"Finish"` → `"continue →"`, `"finish"`
- `components/v2/ChapterNav.tsx:56` — `"promptdojo"` already lowercase. Keep.
- `components/v2/ChapterNav.tsx:58` — `"python for builders"` already lowercase. Keep.
- `components/v2/ChapterNav.tsx:91` — `shortChapterTitle(entry.title)` — apply `.toLowerCase()`
- `components/v2/ChapterNav.tsx:109` — `"Open chapter →"` → `"open chapter →"`
- `components/v2/ChapterNav.tsx:152` — `lesson.title` — apply `.toLowerCase()` at render
- `components/v2/ChapterNav.tsx:174` — `step.type` is rendered with `capitalize` Tailwind class. Drop `capitalize`. Type names like `read`, `predict`, `fillblank` will render lowercase. **Per CEO note in cut list:** if "Mc" → "Multiple choice" is a one-liner, fold it here. It IS one-liner — change `<span className="capitalize">{step.type}</span>` to `<span>{stepTypeLabel(step.type)}</span>` and add a small lookup helper:
  ```tsx
  function stepTypeLabel(t: string): string {
    return ({ mc: "multiple choice", fillblank: "fill blank", fixbug: "fix bug", read: "read", predict: "predict", write: "write", reorder: "reorder", checkpoint: "checkpoint" } as Record<string, string>)[t] ?? t;
  }
  ```
- `components/BrainDump.tsx:54` — `"Save"` → `"save"`
- `components/BrainDump.tsx:68` — `"Export .md"` → `"export .md"`
- `components/BrainDump.tsx:96` — `"Brain dump"` (the panel header) → `"brain dump"`
- `components/BrainDump.tsx:99` — `"Park a thought"` (button label) → `"park a thought"`
- `components/v2/StepFooter.tsx` — **DO NOT TOUCH.** Per UX Architect audit it's an orphan (`grep "StepFooter"` confirms no imports). It will be deleted in PR 6 with the credibility-fix batch. Touching it here would be wasted lowercasing on dead code.
- `app/learn/v2/[chapter]/page.tsx:90, 132` — chapter h1 (renders `chapter.title`), `"What this chapter covers..."` heading, etc. Apply `.toLowerCase()` at render to the chapter title. Hard-coded section labels: lowercase them.
- `app/learn/v2/[chapter]/page.tsx:118, 126` — `"Start chapter"` → `"start chapter"`, `"← Back to all chapters"` → `"← back to all chapters"`
- `app/learn/v2/[chapter]/opengraph-image.tsx:61` — OG eyebrow `"Chapter ${number}"` → `"chapter ${number}"`
- `app/og/launch/[name]/route.tsx` — OG art content. The `wedge` and `price` art is already on-voice per Brand audit; sweep for any title-case strings in scene labels (e.g., chapter eyebrows). Lower-priority — if you find them, lowercase. If you don't find them, skip.
- `content-v2/**/*.md` lesson titles in frontmatter — **DO NOT** rewrite the markdown. Let the render layer (`<h1>{lesson.title.toLowerCase()}</h1>`) handle it. Three rendered locations: `app/learn/v2/[chapter]/page.tsx`, `components/v2/ChapterNav.tsx`, and `components/v2/LessonStepClient.tsx`. All three need the `.toLowerCase()` call.
- **Exclamation point** flagged in Brand audit at `/learn/v2/variables/naming-things/0`: `"Here's what's about to happen, hundreds of times this year!"` — this IS in markdown content. Sweep `content-v2/**/*.md` for `!` in the body and judgement-call replace with `.`. Spec ~5 minutes.

**Files to delete:** none.

**Files to create:** none.

**Test checklist:**
- [ ] `pnpm build` green
- [ ] Run a final grep: `grep -rn -E '"[A-Z][a-z].*"' app/ components/v2/HomeClient.tsx components/BrainDump.tsx components/v2/LessonStepClient.tsx components/v2/ChapterNav.tsx | grep -v "//" | grep -v "type "` — no UI string starts with a capital letter except inside a JS comment or a TypeScript literal type. (False positives possible; manually scan for the ones that look like UI strings.)
- [ ] Click through `/`, `/onboarding`, `/learn/v2/variables/`, `/learn/v2/variables/naming-things/0` — every visible heading and button is lowercase
- [ ] StreakWidget hover tooltips are lowercase too (already lowercase; verify)
- [ ] Run the Brand Guardian's voice grep mentally: zero "Title Case Headline" instances on the rendered DOM

**Verification (post-deploy):**
- [ ] Homepage h1 reads `python for ai-first builders.` (lowercase, period kept)
- [ ] Onboarding `/start` (or `/onboarding`) hero reads `you're going to learn python.`
- [ ] `<title>` tag (DevTools) is `promptdojo — free interactive python course for ai builders`
- [ ] Lesson sidebar shows `multiple choice` instead of `Mc` if you took the freebie

**Risks:**
- **Markdown lesson titles render lowercase via `.toLowerCase()`** — but lesson markdown bodies might use proper-case product names that get force-lowercased if `.toLowerCase()` is naively applied to body text. **Don't lowercase markdown bodies.** Only lowercase the *title* metadata at render. Bodies stay as authored.
- **The `aria-label` SCREAMING UPPERCASE labels** in onboarding may have non-trivial impact — they were the Personalization screen field labels. Replace with lowercase; verify screen reader still announces something meaningful (test with VoiceOver: cmd+F5).
- **String IDs vs string labels confusion.** `step.type === "read"` is an internal ID, not a display string. Don't rename type IDs — only the display via `stepTypeLabel()`.
- **`.toLowerCase()` is JS string method, not the kit's "lowercase swagger" rule.** Some chapter titles include hyphens or non-Latin characters that JS handles correctly; spot-check each rendered chapter card for weirdness.

---

### PR 3: Cursor blink heartbeat + render the actual `❯ promptdojo _` wordmark
**Implements:** CEO pick #4 (sequenced before pick #3 per CEO order — the hero rebuild needs blink + wordmark primitives)
**Branch:** `refresh/04-heartbeat-and-wordmark`
**Outcome:** A `.cursor-blink` CSS class exists site-wide and is applied to the wordmark `_`, the IDE prompt cursor, and any "alive" surface. The `❯ promptdojo _` lockup renders as the actual SVG (or as JSX with the caret + JetBrains Mono ExtraBold + blinking underscore) in site header, onboarding header, lesson sidebar header.
**Estimated time:** 3 h
**Depends on:** PR 2 (so we don't re-touch headers for casing later)
**Unblocks:** PR 4 (hero uses blink + the wordmark primitive)

**Files to modify:**

- `app/globals.css` — add at the bottom (after the existing `cm-editor` rules at :111-112):
  ```css
  /* Brand heartbeat — 1.0 Hz cursor blink. MOTION.md:6-12. */
  @keyframes blink-1hz {
    0%, 49%   { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .cursor-blink {
    animation: blink-1hz 1s steps(1) infinite;
    color: var(--color-ember-500);
  }
  @media (prefers-reduced-motion: reduce) {
    .cursor-blink { animation: none; opacity: 1; }
  }
  ```
- `app/page.tsx:64-67` — replace the bare-text wordmark eyebrow + h1 prelude with the actual lockup. NOTE: this PR sets up the wordmark *primitive* used by PR 4's full hero. Keep the existing h1 in place; we'll redesign the hero entirely in PR 4.
- `app/onboarding/page.tsx:163-167` — replace the `<Link>` "promptdojo" text with the wordmark lockup component (see new file below)
- `components/v2/ChapterNav.tsx:54-60` — replace the bare-text `<div>promptdojo</div>` with the wordmark lockup component
- `components/v2/PersistentIDE.tsx` — find the IDE prompt area and add a blinking cursor at the `> ` prompt. Per UI Designer §IDE / Output proposal: empty output panel shows `[promptdojo:~]$ <span className="cursor-blink">_</span>`. Apply at `PersistentIDE.tsx:337-340` (the empty-output state); leave the actual `oneDark` editor cursor alone (PR 5 swaps it).

**Files to create:**

- `components/Wordmark.tsx` — the canonical lockup. Two modes: `mark` (just `❯`) and `lockup` (`❯ promptdojo _` with blinking underscore).
  ```tsx
  // components/Wordmark.tsx — the brand mark, in code.
  // Inline JSX, no SVG file load — keeps Cloudflare static export simple.
  // Uses JetBrains Mono ExtraBold per LOGO.md:18.
  import { cn } from "@/lib/utils";

  type Props = {
    variant?: "lockup" | "mark";
    className?: string;
    /** Tailwind text-size class. Defaults to text-base. */
    size?: string;
  };

  export default function Wordmark({
    variant = "lockup",
    className,
    size = "text-base",
  }: Props) {
    if (variant === "mark") {
      return (
        <span
          className={cn("font-mono font-extrabold text-ember-500", size, className)}
          aria-label="promptdojo"
        >
          ❯
        </span>
      );
    }
    return (
      <span
        className={cn(
          "inline-flex items-baseline gap-[0.4ch] font-mono font-extrabold tracking-[-0.015em]",
          size,
          className,
        )}
        aria-label="promptdojo"
      >
        <span className="text-ember-500">❯</span>
        <span className="text-ink-100">promptdojo</span>
        <span className="cursor-blink text-ember-500">_</span>
      </span>
    );
  }
  ```

**Why JSX, not the SVG file:** The six SVGs in `design-kit/logos/` are reference assets; rendering the lockup in JSX is faster, animatable (`<span className="cursor-blink">`), and avoids an extra HTTP request on every page. The favicon and apple-icon stay as the SVG/PNG that Next.js auto-detects from `app/icon.svg` and `app/apple-icon.png` — no change there.

**Files to delete:** none.

**Key code snippets:**

```tsx
// BEFORE — app/page.tsx:64-67
<div>
  <div className="text-xs uppercase tracking-[0.2em] text-ember-500">
    promptdojo
  </div>
  <h1 className="mt-2 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink-50 sm:text-6xl">

// AFTER — keep h1 unchanged in this PR; replace just the eyebrow with the lockup primitive.
// PR 4 will rewrite the entire hero block.
<div>
  <div className="text-[11px] uppercase tracking-[0.42em]">
    <Wordmark size="text-[11px]" />
  </div>
  <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink-50 sm:text-6xl">
```

```tsx
// BEFORE — components/v2/ChapterNav.tsx:54-60
<Link href="/" className="block">
  <div className="font-display text-base text-ember-400">promptdojo</div>
  <div className="text-[10px] uppercase tracking-widest text-ink-500">
    python for builders
  </div>
</Link>

// AFTER
<Link href="/" className="block">
  <Wordmark size="text-base" />
  <div className="mt-1 text-[10px] uppercase tracking-widest text-ink-500 font-mono">
    python for builders
  </div>
</Link>
```

```tsx
// BEFORE — components/v2/PersistentIDE.tsx:337-340 (empty output state)
<div className="text-sm italic text-ink-600">
  Run your code to see output here.
</div>

// AFTER — terminal idle, not a hint
<div className="font-mono text-sm text-ink-500">
  [promptdojo:~]$ <span className="cursor-blink">_</span>
</div>
```

**Test checklist:**
- [ ] `pnpm build` green
- [ ] `localhost:3000` — wordmark renders with caret + lockup + blinking underscore at exactly 1 Hz
- [ ] Time the blink with a stopwatch (or DevTools animation panel) — 1.0 Hz. Not 0.8, not 1.2.
- [ ] Reduced-motion preference: System Settings → Accessibility → Reduce Motion → reload. Cursor should be solid-on.
- [ ] Mobile view — wordmark legible at 320px width
- [ ] No console errors

**Verification (post-deploy):**
- [ ] DevTools → Animations panel shows `blink-1hz` running at 1s
- [ ] Site header, onboarding header, lesson sidebar header all show the lockup. Three places, identical mark.
- [ ] IDE empty-output state shows `[promptdojo:~]$ _` in mono with the underscore blinking

**Risks:**
- **JetBrains Mono "ExtraBold" weight 800 may not load in `next/font/google` — JBM only ships up to 700 (Bold).** Test by inspecting `getComputedStyle(wordmarkSpan).fontWeight`. If 700 is the max, the lockup just renders bold instead of extra-bold; visually fine but technically off-spec by one weight step. Acceptable for V1.
- **`font-extrabold` Tailwind class compiles to `font-weight: 800`.** If JBM only loads 700, the browser synthesizes a fake 800 — looks slightly wonky. Fallback: change `font-extrabold` to `font-bold` and accept the spec gap.
- **`<span className="cursor-blink">_` next to text** can introduce a half-pixel layout shift between blink frames in some browsers. Use `display: inline-block; width: 0.6ch;` if you observe it. Not expected.

---

### PR 4: Hero rebuild — the bug + ember IDE feel + X follow CTA
**Implements:** CEO pick #3
**Branch:** `refresh/03-hero-bug-and-x-cta`
**Outcome:** Hero is replaced with the mutable-default-arg snippet rendered in ember+ink, headline `ai writes this. it's wrong.` in Fraunces 900 at 100–128px, single primary CTA `start chapter 1 →`, secondary `or pick your chapter ↓`. An ember pill `[follow @TFisPython on x]` ships in the site header. Default homepage OG image flips from `/og/launch/hook` to `/og/launch/wedge`.
**Estimated time:** 5 h
**Depends on:** PR 1 (color tokens), PR 2 (lowercase voice), PR 3 (wordmark + blink primitive)
**Unblocks:** PR 5 (the hero will look out of place if the IDE itself still uses oneDark — but each PR remains independently shippable)

**Files to modify:**

- `app/page.tsx:9-29` — metadata block:
  - Update `openGraph.images` to point at `/og/launch/wedge` (the bug image). The OG art route already exists at `app/og/launch/[name]/route.tsx`.
  - Update `twitter.images` similarly.
- `app/page.tsx:61-92` — replace the entire `<header>` block. New structure: lockup eyebrow → Fraunces hero → bug snippet (static, ember-highlighted) → primary + secondary CTAs → StreakWidget moved to a new sticky top bar OR retained right-aligned (decide based on visual weight; default: keep right-aligned but smaller).
- `app/page.tsx:124-134` — kill the duplicated CTA strip (`new here? start the 5-question onboarding →`) since the hero now has the canonical CTAs. Per CEO pick #3 description: "kill the 'new here?' microcopy — onboarding is a step inside `start chapter 1`, not a separate path."
- `app/layout.tsx:22` (or `app/page.tsx` header) — add the `[follow @TFisPython on x]` ember pill component. **Decision:** add to `app/layout.tsx` so it ships site-wide (not just home). Wraps `{children}` so it renders on every page. See snippet below.

**Files to create:**

- `components/HeroBugSnippet.tsx` — the static, ember-highlighted broken Python code. Renders inline in the hero. Reuses the syntax-token mapping from PR 5 if available, else uses inline `<span>` styling. **For this PR, inline-style. PR 5 will pull tokens.**
- `components/FollowOnXPill.tsx` — the ember pill `[follow @TFisPython on x]`. Tiny, `<a target="_blank">`. Tracks-via-href-only, no analytics for V1.

**Key code snippets:**

```tsx
// AFTER — app/page.tsx hero block (replaces lines 61-92 entirely)
<main className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
  <PyodidePreloader />

  <header className="relative mb-24 pt-8 sm:pt-14">
    <div className="flex items-start justify-between gap-4 mb-10">
      <div className="text-[11px] uppercase tracking-[0.42em]">
        <Wordmark size="text-[11px]" />
      </div>
      <StreakWidget />
    </div>

    <h1
      className="font-display font-black leading-[0.9] tracking-[-0.045em] text-ink-100"
      style={{
        fontSize: "clamp(72px, 11vw, 128px)",
        fontVariationSettings: "'opsz' 144, 'SOFT' 0",
      }}
    >
      ai writes this.<br />
      <em className="italic text-ember-500">it&apos;s wrong.</em>
    </h1>

    <p className="mt-8 max-w-2xl font-display text-xl text-ink-300 leading-snug">
      a python school for the version of you that lives in cursor.
      22 chapters · 624 interactive steps · runs in your browser · free forever.
    </p>

    <div className="mt-10">
      <HeroBugSnippet />
    </div>

    <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
      <Link
        href="/learn/v2/variables/naming-things/0"
        className="inline-flex items-center gap-2 bg-ember-500 px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-ink-950 transition hover:bg-ember-400"
      >
        start chapter 1 <span aria-hidden>→</span>
      </Link>
      <a
        href="#chapters"
        className="font-mono text-sm text-ink-400 hover:text-ember-400"
      >
        or pick your chapter ↓
      </a>
    </div>
  </header>

  {/* ... HomeClient resume island, then the 3 cards, then the chapter grid with id="chapters" anchor ... */}
```

```tsx
// components/HeroBugSnippet.tsx
// Static, no Pyodide. PR 5 will harmonize the syntax tokens with dojoTheme;
// for now, inline styles do the work.
export default function HeroBugSnippet() {
  return (
    <pre
      className="overflow-x-auto rounded-none border-l-2 border-ember-500 bg-ink-900 p-5 font-mono text-sm leading-relaxed text-ink-300"
      aria-label="ai-shipped python bug"
      style={{ fontVariantLigatures: "none" }}
    >
      <code>
        <span className="text-ember-500">def</span>{" "}
        <span className="text-ember-300">collect_errors</span>(
        {"\n  "}
        msg: <span className="text-ember-500">str</span>,
        {"\n  "}
        bag: <span className="text-ember-500">list</span> ={" "}
        <span style={{ color: "var(--err)", background: "rgba(239,68,68,0.14)" }}>
          []
        </span>
        {"\n"}):{"\n  "}
        bag.append(msg){"\n  "}
        <span className="text-ember-500">return</span> bag
      </code>
      <div className="mt-3 border-t border-ink-800 pt-3 text-xs text-ink-500">
        mutable default arg. python evaluates the list once at definition.
        every caller mutates the same list.
      </div>
    </pre>
  );
}
```

```tsx
// components/FollowOnXPill.tsx
import { cn } from "@/lib/utils";

export default function FollowOnXPill({ className }: { className?: string }) {
  return (
    <a
      href="https://x.com/TFisPython"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 border border-ember-700/50 bg-ember-950/40 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ember-400 transition hover:border-ember-500 hover:text-ember-300",
        className,
      )}
    >
      [ follow @TFisPython on x ]
    </a>
  );
}
```

```tsx
// app/layout.tsx — add the X pill in a thin top bar above {children}
// (decision: site-wide presence via layout; alternative is to add it per-page)
<body className="min-h-screen bg-ink-950 text-ink-100 antialiased font-display">
  <div className="flex justify-end px-4 py-2 sm:px-6">
    <FollowOnXPill />
  </div>
  {children}
  <BrainDump />
</body>
```

**Test checklist:**
- [ ] `pnpm build` green
- [ ] Hero h1 measures 72–128px on different viewports (DevTools → element → computed font-size)
- [ ] Ember-highlighted `[]` inside the bug snippet is visible — looks broken on purpose
- [ ] `start chapter 1 →` is the only ember CTA above the fold
- [ ] X pill renders in the top-right of every page including `/`, `/onboarding/`, `/learn/v2/variables/naming-things/0/`
- [ ] X pill is clickable and opens `x.com/TFisPython` in a new tab
- [ ] Mobile (375px): hero size scales down to ~72px, bug snippet horizontally scrolls cleanly, CTAs stack vertically
- [ ] OG image preview check: `https://promptdojo.pages.dev/` `<meta property="og:image">` URL points at `/og/launch/wedge`

**Verification (post-deploy):**
- [ ] **MERGE GATE:** Take a screenshot of the hero. Ask yourself: would you tweet this? If no, do not merge. Iterate.
- [ ] X pill is visible, clickable, opens the right URL
- [ ] Twitter Card validator (twitter.com/devtools/card-validator) shows the wedge image as the preview, not the wordmark
- [ ] `agent-browser screenshot` of `/` looks dramatically different from the pre-refresh baseline

**Risks:**
- **The hero is the single PR with real product judgment.** No spec can replace your eye. The CEO's gate is "Josh would tweet this in 24 hours of merging." If after building, you don't think Josh would tweet it — open a draft PR and ask for the screenshot review BEFORE merging.
- **Hero h1 at 128px on small laptops (1280×800) can dominate the viewport.** The `clamp(72px, 11vw, 128px)` is correct: `11vw` at 1280 = 140px → clamped at 128. Acceptable. If it feels too big, reduce upper to `120px`.
- **The X pill in `app/layout.tsx`** affects EVERY page including 404 and lesson pages. On lesson pages it competes for attention with the IDE. If it's distracting in a lesson context, move it to `app/page.tsx` only and add to `/onboarding` separately. Decision deferred to your eye on first paint.
- **Killing the chapter grid eyebrow CTA at `app/page.tsx:124-134`** removes the only existing onboarding link. Verify the homepage `HomeClient` still surfaces the onboarding path for new users (it does — line 67-87 of `HomeClient.tsx` handles new users). If `HomeClient`'s loading state masks this, the new-user path could feel dead — visually verify on a fresh browser profile.

---

### PR 5: dojoTheme — replace oneDark + github-dark with ember+ink only
**Implements:** CEO pick #5
**Branch:** `refresh/05-dojo-codemirror-theme`
**Outcome:** CodeMirror runs a custom theme using only `--color-ember-*` and `--color-ink-*`. Markdown code blocks (rendered via highlight.js with `github-dark.css`) instead use a `dojo-syntax.css` file that maps `.hljs-*` selectors to the same brand tokens. Run button is ember + sharp + mono. Output `✓` uses `--ok`, stderr uses `--err`. The IDE finally belongs to promptdojo.
**Estimated time:** 4 h (highest-risk PR)
**Depends on:** PR 1 (token foundation), PR 4 (hero bug snippet uses inline styles; this PR brings them into a real theme)
**Unblocks:** none (this is the visual polish PR)

**Files to modify:**

- `components/v2/PersistentIDE.tsx:3` — drop `import { oneDark } from "@codemirror/theme-one-dark";`
- `components/v2/PersistentIDE.tsx:255` (the line where `extensions=[oneDark]` is) — replace with `extensions={[dojoTheme]}` from the new theme module
- `components/v2/PersistentIDE.tsx:286-330` — Run button restyle (`bg-ember-500`, `font-mono uppercase`, sharp corners). Currently `bg-ink-800`.
- `components/v2/PersistentIDE.tsx:347` — `<span className="text-emerald-400">✓</span>` → `<span style={{ color: 'var(--ok)' }}>✓</span>` OR add `--color-ok` mapping in `globals.css` `@theme` and use `text-ok`. Pick: add the @theme mapping in PR 1 (already in spec), use `text-ok` here.
- `components/v2/PersistentIDE.tsx:355` — `text-rose-400` for stderr → `text-err` (or inline `style={{ color: 'var(--err)' }}`)
- `app/learn/v2/[chapter]/page.tsx:5` — delete `import "highlight.js/styles/github-dark.css";`
- `components/v2/steps/ReadStepView.tsx:5` — delete `import "highlight.js/styles/github-dark.css";`
- `app/globals.css` — add the `.hljs-*` syntax tokens block (per UI Designer §Code-block syntax tokens, see snippet below)
- `components/HeroBugSnippet.tsx` — refactor inline `<span>` styles to use the new `.hljs-*` classes for consistency with prose code blocks. Optional refinement; not required for this PR's outcome.

**Files to create:**

- `lib/codemirror-theme.ts` — the dojoTheme. CodeMirror 6 theme API:
  ```ts
  // lib/codemirror-theme.ts
  // Single-accent CodeMirror theme. Maps to --color-ember-* and --color-ink-*
  // via CSS variables — values are pulled at render time, so token edits
  // propagate without rebuilding the theme.
  import { EditorView } from "@codemirror/view";
  import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
  import { tags as t } from "@lezer/highlight";

  const ember500 = "var(--color-ember-500)";
  const ember300 = "var(--color-ember-300)";
  const ink100 = "var(--color-ink-100)";
  const ink200 = "var(--color-ink-200)";
  const ink300 = "var(--color-ink-300)";
  const ink400 = "var(--color-ink-400)";
  const ink500 = "var(--color-ink-500)";
  const ink700 = "var(--color-ink-700)";
  const ink900 = "var(--color-ink-900)";
  const ink950 = "var(--color-ink-950)";
  const ember950 = "var(--color-ember-950)";

  const editor = EditorView.theme(
    {
      "&": { color: ink300, backgroundColor: ink950 },
      ".cm-content": { caretColor: ember500 },
      "&.cm-focused .cm-cursor": { borderLeftColor: ember500 },
      ".cm-line": { padding: "0 4px" },
      ".cm-gutters": { backgroundColor: ink950, color: ink700, border: "none" },
      ".cm-activeLine": { backgroundColor: ink900 },
      ".cm-activeLineGutter": { backgroundColor: ink900, color: ink500 },
      ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, .cm-content ::selection":
        { backgroundColor: ember950 },
      ".cm-scroller": { fontVariantLigatures: "none" },
    },
    { dark: true },
  );

  const highlight = HighlightStyle.define([
    { tag: [t.keyword, t.controlKeyword, t.modifier], color: ember500, fontWeight: "600" },
    { tag: [t.string, t.special(t.string)], color: ink100, fontStyle: "italic" },
    { tag: [t.comment, t.lineComment, t.blockComment], color: ink500, fontStyle: "italic" },
    { tag: [t.number, t.bool, t.null], color: ink200 },
    { tag: [t.function(t.variableName), t.function(t.propertyName)], color: ember300 },
    { tag: [t.variableName, t.propertyName], color: ink300 },
    { tag: [t.operator, t.punctuation], color: ink400 },
    { tag: [t.typeName, t.className], color: ember300 },
  ]);

  export const dojoTheme = [editor, syntaxHighlighting(highlight)];
  ```

**Files to delete:** none (the `github-dark.css` import goes away but the package stays; highlight.js the runtime still ships).

**Key code snippets:**

```css
/* AFTER — app/globals.css (append; UI Designer §Code-block syntax tokens) */
.hljs                 { background: var(--color-ink-950); color: var(--color-ink-300); }
.hljs-keyword,
.hljs-built_in        { color: var(--color-ember-500); font-weight: 600; }
.hljs-string          { color: var(--color-ink-100); font-style: italic; }
.hljs-comment         { color: var(--color-ink-500); font-style: italic; }
.hljs-number,
.hljs-literal         { color: var(--color-ink-200); }
.hljs-title.function_,
.hljs-title.class_    { color: var(--color-ember-300); }
.hljs-params,
.hljs-variable        { color: var(--color-ink-300); }
.hljs-operator,
.hljs-punctuation     { color: var(--color-ink-400); }
.hljs-attr,
.hljs-attribute       { color: var(--color-ember-300); }
```

```tsx
// BEFORE — components/v2/PersistentIDE.tsx Run button (~line 286-310)
<button className="bg-ink-800 text-ink-100 ...">Run</button>

// AFTER — terminal key, not a SaaS chip
<button
  className={cn(
    "inline-flex items-center gap-2",
    "bg-ember-500 text-ink-950",
    "font-mono text-xs font-bold uppercase tracking-wider",
    "px-4 py-2",
    "transition hover:bg-ember-400",
    "disabled:bg-ink-800 disabled:text-ink-500 disabled:cursor-not-allowed",
  )}
>
  ┃ run <kbd className="ml-1 text-[10px] opacity-80">⌘↵</kbd>
</button>
```

**Test checklist:**
- [ ] `pnpm build` green
- [ ] CodeMirror in any lesson with code (e.g., `/learn/v2/variables/naming-things/0/`) shows ember keywords, italic strings, italic comments — no purple, no cyan
- [ ] Active-line highlight uses `--ink-900`, not the oneDark blueish tone
- [ ] Markdown code blocks in any chapter overview (`/learn/v2/variables/`) render with the same palette as the IDE
- [ ] Run button is ember, sharp-cornered, mono-uppercase. `disabled` state still works.
- [ ] Output `✓ ran in Xms` is the canonical `--ok` green; stderr is canonical `--err` red
- [ ] No console errors related to CodeMirror extension types

**Verification (post-deploy):**
- [ ] Visit a Read step — markdown code block uses dojo palette
- [ ] Visit a Write step — IDE uses dojoTheme
- [ ] Type `def foo():` in the IDE — `def` is ember, parens are ink-400, function name `foo` is ember-300

**Risks:**
- **CodeMirror 6 theme API has rough edges.** If `EditorView.theme` keys don't match the version installed, styles silently no-op. Cross-check the installed `@codemirror/view` version in `package.json` and reference its exported types.
- **Tag mappings (`t.keyword`, `t.string`)** depend on `@lezer/highlight` and the language pack (`@codemirror/lang-python`). Some Python tokens (decorators, f-strings) may need extra tag entries — observe and add if a token renders unstyled.
- **`syntaxHighlighting` extension import path** — for some CodeMirror 6 versions it's `@codemirror/language`; for older it's `@codemirror/highlight`. Check `node_modules/@codemirror/language/dist/index.d.ts` for the export.
- **`<kbd>` element styling on the Run button** can introduce ascender mismatch between mono and serif. Use `font-mono` on `<kbd>` and slightly smaller font-size to compensate.
- **The grace move:** if dojoTheme doesn't ship cleanly within 4h, ship just the highlight.js token swap (15 min) and keep oneDark in the IDE for one more week. The hljs swap alone covers ~50% of the visible code surface.

---

### PR 6: Mobile scroll fix + branded 404 + soften Pyodide copy + Finish→next lesson
**Implements:** CEO pick #6
**Branch:** `refresh/06-credibility-fixes`
**Outcome:** Mobile lesson pages scroll naturally (no inner-scroll trap). Visiting `/this-page-does-not-exist` renders a branded promptdojo 404 with mark, mono prompt, and a working home link. Pyodide cold-start copy reads as warming up, not as broken. Last-step "Finish" button routes to the next lesson's first step (using the existing chapter graph) instead of dumping the user on `/`.
**Estimated time:** 4 h
**Depends on:** PR 1 (color tokens), PR 3 (Wordmark component used on the 404)
**Unblocks:** none

**Files to modify:**

- `components/v2/LessonShell.tsx:54` — change `<div className="flex h-[100dvh] min-h-0 flex-col bg-ink-950 ...">` to `<div className="flex min-h-[100dvh] flex-col bg-ink-950 ...">`. The fixed `h-[100dvh]` plus inner `overflow-auto` is what creates the trap.
- `components/v2/LessonShell.tsx:55` — change `<div className="flex h-full min-h-0 flex-1">` to `<div className="flex flex-1">`. Remove the inner-fixed-height layer.
- `components/v2/LessonShell.tsx:73` — the prompt scroll container: `<div className="flex-1 min-h-0 overflow-auto px-4 py-5 sm:px-5 sm:py-6">` should become `<div className="px-4 py-5 sm:px-5 sm:py-6 lg:flex-1 lg:min-h-0 lg:overflow-auto">`. **Effect:** desktop keeps the inner-scroll behavior (good); mobile lets the body grow and scroll naturally.
- `components/v2/LessonShell.tsx:82-87` — IDE pane same treatment: scroll behavior conditional on `lg:`.
- `components/v2/LessonShell.tsx:92-111` — keep the editor toggle. It's still useful on `<lg`. Just stop trapping scroll under it.
- `components/v2/PersistentIDE.tsx:84` — `STATUS_COPY.idle` and `:loading`:
  - `idle: "Booting Python…"` → `idle: "warming up the editor…"`
  - `loading: "Booting Python (one-time, ~5s)…"` → `loading: "warming up the editor… (~5s, only this once)"`
  - `ready: "press Run or use ⌘↵"` — keep
- `components/v2/LessonStepClient.tsx:130-132` — change the last-step routing logic. Currently:
  ```tsx
  if (!next) {
    router.push("/");
    return;
  }
  ```
  Replace with logic that finds the next chapter's first lesson's step 0 by looking at the existing chapter graph. **The graph already exists in `lib/content-v2`.** Pseudocode:
  ```tsx
  if (!next) {
    const nextLesson = findNextLessonAfter(chapter.slug, lesson.slug);
    if (nextLesson) {
      router.push(`/learn/v2/${nextLesson.chapterSlug}/${nextLesson.lessonSlug}/0`);
    } else {
      // last lesson of last chapter — go home
      router.push("/");
    }
    return;
  }
  ```
- `lib/content-v2.ts` — add a `getNextLesson(chapterSlug, lessonSlug)` helper. Reuses `getV2Toc` data (already loaded). Returns `{ chapterSlug, lessonSlug } | null`. Idea:
  ```ts
  export function getNextLesson(
    chapterSlug: string,
    lessonSlug: string,
  ): { chapterSlug: string; lessonSlug: string } | null {
    const toc = getV2Toc();
    const chapters = toc.chapters;
    const cIdx = chapters.findIndex((c) => c.slug === chapterSlug);
    if (cIdx === -1) return null;
    // walk lessons within this chapter
    // (need lesson list — pull from getV2Chapter detail)
    // ...
  }
  ```
  Since this lives in `lib/`, it can be sync if the lesson list is already in the static manifest; if not, it's `async` and `LessonStepClient` calls it via a passed-in prop (`nextLesson`) computed in the server component that wraps it. **Recommended:** pass `nextLesson` as a prop from the server component (`app/learn/v2/[chapter]/[lesson]/[stepIndex]/page.tsx`) so `LessonStepClient` stays sync. One additional prop, zero async-in-client churn.

**Files to create:**

- `app/not-found.tsx` — branded 404. Per Next.js 16 App Router conventions, this auto-renders for unmatched routes. Static-export-friendly (no `headers()`, no params). Code:
  ```tsx
  // app/not-found.tsx
  import Link from "next/link";
  import Wordmark from "@/components/Wordmark";

  export default function NotFound() {
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col justify-center px-6 py-16">
        <div className="text-[11px] uppercase tracking-[0.42em] mb-10">
          <Wordmark size="text-[11px]" />
        </div>
        <h1
          className="font-display font-black leading-[0.9] tracking-[-0.045em] text-ink-100"
          style={{
            fontSize: "clamp(72px, 11vw, 128px)",
            fontVariationSettings: "'opsz' 144",
          }}
        >
          404 — page not found.
        </h1>
        <p className="mt-8 font-mono text-base text-ink-400">
          ❯ try{" "}
          <Link href="/" className="text-ember-400 hover:text-ember-300 underline-offset-2 hover:underline">
            /
          </Link>{" "}
          or{" "}
          <Link
            href="/learn/v2/variables/naming-things/0"
            className="text-ember-400 hover:text-ember-300 underline-offset-2 hover:underline"
          >
            /learn/v2/variables
          </Link>
          <span className="cursor-blink ml-1">_</span>
        </p>
      </main>
    );
  }
  ```

**Files to delete:** none in this PR. (`StepFooter.tsx` is still alive technically — kill it in a sweep PR later if desired, OR fold its deletion in here as a freebie since the 4 h budget can absorb it. Recommendation: delete `components/v2/StepFooter.tsx` in this PR. Confirmed orphan per UX Architect audit.)

**Key code snippets:**

```tsx
// BEFORE — components/v2/LessonShell.tsx:53-55
<div className="flex h-[100dvh] min-h-0 flex-col bg-ink-950 text-ink-100">
  <div className="flex h-full min-h-0 flex-1">
    <aside className="hidden w-60 shrink-0 border-r border-ink-800 bg-ink-900 lg:flex lg:flex-col">

// AFTER
<div className="flex min-h-[100dvh] flex-col bg-ink-950 text-ink-100 lg:h-[100dvh]">
  <div className="flex flex-1 lg:min-h-0">
    <aside className="hidden w-60 shrink-0 border-r border-ink-800 bg-ink-900 lg:flex lg:flex-col">
```

```tsx
// BEFORE — components/v2/LessonShell.tsx:73-75 (prompt scroll container)
<div className="flex-1 min-h-0 overflow-auto px-4 py-5 sm:px-5 sm:py-6">
  {prompt}
</div>

// AFTER — desktop scrolls inside; mobile lets body scroll naturally
<div className="px-4 py-5 sm:px-5 sm:py-6 lg:flex-1 lg:min-h-0 lg:overflow-auto">
  {prompt}
</div>
```

```tsx
// BEFORE — components/v2/PersistentIDE.tsx:83-87
const STATUS_COPY: Record<"idle" | "loading" | "ready", string> = {
  idle: "Booting Python…",
  loading: "Booting Python (one-time, ~5s)…",
  ready: "press Run or use ⌘↵",
};

// AFTER
const STATUS_COPY: Record<"idle" | "loading" | "ready", string> = {
  idle: "warming up the editor…",
  loading: "warming up the editor… (~5s, only this once)",
  ready: "press run or use ⌘↵",
};
```

```tsx
// BEFORE — components/v2/LessonStepClient.tsx:130-132
if (!next) {
  router.push("/");
  return;
}

// AFTER (with nextLesson prop wired in from the server component)
if (!next) {
  if (nextLesson) {
    router.push(`/learn/v2/${nextLesson.chapterSlug}/${nextLesson.lessonSlug}/0`);
  } else {
    router.push("/");
  }
  return;
}
```

**Test checklist:**
- [ ] `pnpm build` green
- [ ] **Mobile (375×667 in DevTools):** open `/learn/v2/variables/naming-things/0/`. `document.documentElement.scrollHeight` should be `> 667`. The page should scroll naturally with momentum.
- [ ] **Mobile:** the editor toggle ("Show prompt"/"Show editor") still works
- [ ] **Desktop (1280):** the inner-scroll behavior is preserved (sidebar + 480px prompt + IDE), no regression
- [ ] **404:** visit `localhost:3000/this-page-does-not-exist`. Renders the branded 404 with wordmark and working `/` and lesson links.
- [ ] **Pyodide copy:** open the IDE with the network throttled (DevTools → Network → Slow 3G). Status reads `warming up the editor… (~5s, only this once)`. Reads as warming, not broken.
- [ ] **Finish flow:** complete the last step of `variables/naming-things` → routed to the first step of `variables`'s next lesson, NOT `/`.
- [ ] **Last-of-last:** complete the last step of the very last lesson of the last chapter → routed to `/`. (Manually verify by editing localStorage if you don't want to grind through 624 steps.)

**Verification (post-deploy):**
- [ ] On a real iPhone Safari: lesson page scrolls with rubber-band momentum
- [ ] `https://promptdojo.pages.dev/this-page-does-not-exist` renders the branded 404
- [ ] Tap "Finish" on a known-completable lesson → forward to next lesson, not home

**Risks:**
- **`h-[100dvh]` removal might break the desktop sidebar/IDE 3-pane layout.** That's why the spec keeps `lg:h-[100dvh]`. If desktop layout regresses, the scroll fix won't merge. Test desktop at 1280 and 1920 explicitly.
- **`app/not-found.tsx` requires `output: "export"` compatibility.** Next.js 16 supports this; it generates a static 404 HTML at build. Verify by inspecting `out/404.html` after `pnpm build` and confirming branded content.
- **`getNextLesson` correctness** — if the chapter graph has a "fork" or skipped lesson, the helper might route incorrectly. Walk the graph manually for the first 3 chapters during dev to confirm.
- **Static export 404 served by Cloudflare Pages** — Pages serves `404.html` automatically when no other route matches. Confirm by visiting `/this-page-does-not-exist` post-deploy.
- **The Pyodide copy change is the lightest-touch fix here.** If it doesn't ship in this PR, no big deal — fold into PR 7 if needed.

---

### PR 7: Onboarding voice + progress fix + welcome-back cleanup
**Implements:** CEO pick #7
**Branch:** `refresh/07-onboarding-polish`
**Outcome:** Onboarding progress dots advance with the user, not ahead of them (Q1 = 1 dot, Q5 = 5 dots). Live preview shows `pets = ["${pet}"]` updating as the user types. The home page no longer shows a static "new here? onboarding" link when a "welcome back" card is rendering. Marketing-throat-clearing voice fixes are live (handled partly in PR 2; this PR completes any missed strings).
**Estimated time:** 3 h
**Depends on:** PR 2 (lowercase voice baseline)
**Unblocks:** none — final PR

**Files to modify:**

- `app/onboarding/page.tsx:169-179` — progress dots:
  - **Current bug:** `i <= step` lights dot 0 + dot 1 when `step === 1` (Q2). At Q1 (step=0), dot 0 is lit even before the user has moved.
  - **Fix:** dots represent "screens completed", not "current screen index". If we want Q1 to show 1/5 lit, the rule is `i < step + 1`, which is equivalent to `i <= step`, which is what's there — so the off-by-one is actually a definition mismatch with what users perceive. Per the walkthrough audit's reading: Q1 should show 1 dot (the user is "at" Q1, has completed 0, is at 1). Make the rule `i < step + 1` only on screens past Welcome (step 0 is the Welcome screen). Adjust:
  ```tsx
  // Welcome (step 0) shows ZERO filled dots
  // GoalScreen (step 1) shows ONE filled dot
  // ... DailyGoalScreen (step 4) shows FOUR filled dots
  // The fifth dot lights only after they click "start lesson 1" → the lesson page itself.
  // Or simpler: lit count = step. So dots are: i < step.
  ```
  Final rule: `className={cn("h-1 w-8 rounded-full transition", i < step ? "bg-ember-500" : "bg-ink-800")}`. **Decision: change `i <= step` to `i < step`**.
- `app/onboarding/page.tsx:194` — already lowercased in PR 2. Keep.
- `app/onboarding/page.tsx:197-198` — already rewritten in PR 2 (or do it here if PR 2 missed it). Final string per Brand audit: `"ai is your co-pilot, not your crutch. you'll learn the shapes you need to direct it, read it, and catch when it's wrong."`
- `app/onboarding/page.tsx` PersonalizationScreen (`:301-360+`) — add the live preview block. New element under the field grid:
  ```tsx
  <div className="mt-6 rounded-none border-l-2 border-ember-500 bg-ink-900 p-4 font-mono text-sm text-ink-300">
    <span className="text-ink-500">{"# preview"}</span>
    <br />
    <span className="text-ember-500">pets</span> ={" "}
    <span className="text-ink-100">[&quot;{draft.pet || "luna"}&quot;]</span>
    <br />
    <span className="text-ember-500">team</span> ={" "}
    <span className="text-ink-100">&quot;{draft.team || "marketing"}&quot;</span>
  </div>
  ```
  Place under the input grid at `~:340`. Live-binds because `draft` is React state.
- `components/v2/HomeClient.tsx:97-117` — when the resume card is showing (state `in-progress`), don't render the parallel onboarding link in `app/page.tsx:129-134`. Easiest fix: kill the link in `app/page.tsx:124-134` outright (PR 4 already plans to do this; if PR 4 shipped, this is already done — verify and skip). If PR 4 didn't kill it, this PR does.
- `components/v2/HomeClient.tsx:67-87` — when `state === "new-user"` (no profile), show a clearer CTA. The card content should differentiate from "welcome back" — currently the layout is identical. Per CEO pick #7: "Hide the static 'new here? onboarding' link when 'welcome back' card is showing." This is a logical pair to the new-user card. Either solution (kill the parallel link OR conditionally render it) is acceptable; killing it is cleaner.
- `app/onboarding/page.tsx` Welcome `:209` — `"Start"` button label is already lowercased in PR 2. The CEO pick adds a `❯_` cursor prefix above the headline:
  ```tsx
  // Above the h1 in Welcome:
  <div className="text-[11px] uppercase tracking-[0.42em] mb-6">
    <Wordmark variant="mark" size="text-[11px]" />{" "}
    <span className="text-ember-500">_</span>
  </div>
  ```

**Files to delete:** none.

**Files to create:** none.

**Test checklist:**
- [ ] `pnpm build` green
- [ ] Visit `/onboarding`. Welcome screen (step 0) shows 0 dots filled. Click "start" → Q1 shows 1 dot filled. Click thru → Q5 shows 4 dots filled. Submit → routed to lesson 1.
- [ ] On Q4 (Personalization), type "fluffy" in the pet field → preview updates to `pets = ["fluffy"]` in real time
- [ ] Home page when `name = ""` (clear localStorage) — shows the new-user CTA, no parallel "new here?" link
- [ ] Home page when `name = "Josh"` and `lastVisitedV2` is set — shows welcome-back card, NO parallel "new here?" link

**Verification (post-deploy):**
- [ ] Real fresh-browser visit to `/onboarding` with no localStorage → progress dots match the new behavior
- [ ] Live preview on Q4 visibly updates as you type
- [ ] Home page shows ONE entry point per user state — no two-paths confusion

**Risks:**
- **The `i <= step` vs `i < step` decision** is subtle. Off-by-one bugs come back if the reasoning isn't documented. Add a comment in the dots-rendering block explaining the rule.
- **Live preview component re-renders on every keystroke.** That's fine for a 5-input form, but make sure the preview block doesn't trigger a layout shift.
- **The Wordmark `variant="mark"` only renders the caret** — visually distinct from the full lockup. Verify it looks right above the Welcome h1.

---

## Cross-cutting concerns

### Token refactor strategy

**Decision: `app/globals.css` `@theme` block is the runtime source of truth. `design-kit/tokens.css` becomes documentation only and gets a top-of-file warning.**

Reasoning:
- Tailwind 4's `@theme inline {}` block is the only thing that produces utility classes at build. `tokens.css` would have to be `@import`-ed into `globals.css` AND the `@theme` would still need to redeclare the values (because Tailwind doesn't auto-derive utilities from arbitrary CSS vars without the `@theme` shape).
- A merge layer (codegen `tokens.json` → `@theme`) is over-engineering for a 7-PR refresh. Park for V2.
- Add to top of `tokens.css`:
  ```css
  /*
   * READ-ONLY DOCUMENTATION.
   * Runtime tokens live in app/globals.css @theme {} block.
   * Edits here do NOT take effect. If you change a value here, also change it there.
   */
  ```
- After PR 1, also fix `tokens.css:15` (`--ink-500: #71717a;` → `#8a8a93;`) so docs match runtime.

### Type system changes

Minimal across all 7 PRs.

- **PR 6:** `LessonStepClient` gains a `nextLesson?: { chapterSlug: string; lessonSlug: string } | null` prop. Update its props type in the same file.
- **PR 6:** `lib/content-v2.ts` exports a new `getNextLesson` helper — pure addition, no existing types change.
- **PR 7:** No type changes — `OnboardingPage`'s `Draft` type is unchanged; the live preview reads `draft.pet` and `draft.team` which are already strings.

### Tailwind 4 theme additions

PR 1 adds two semantic color mappings:
```css
@theme {
  /* ... existing tokens ... */
  --color-ok:  #86efac;   /* maps the spec --ok token into a Tailwind class */
  --color-err: #ef4444;   /* maps the spec --err token */
}
```
Now `text-ok`, `bg-err/14` are valid utility classes. Use these instead of inline `style={{ color: 'var(--err)' }}` for the canonical error highlight.

PRs 3, 5, 6 add motion + radii tokens (low-priority; only when used):
```css
@theme {
  /* PR 3 */
  --transition-timing-function-slam: cubic-bezier(0.16, 1, 0.3, 1);
  --transition-timing-function-drift: cubic-bezier(0.25, 1, 0.5, 1);
  --transition-duration-instant: 120ms;
  --transition-duration-snap: 180ms;
}
```
Skip if not actively used in JSX.

### localStorage migration

`setStepDraft` (`lib/storage.ts:278-294`) is exported but unused. **Decision: do not wire it in this refresh.**

Reasoning:
- CEO pick list does not include code-draft persistence. UX Architect audit flags it as a quick win, but it's in the cut list ("Cut: trust gain for a 'I typed for 10 minutes and refreshed' failure mode that has a tiny audience pre-launch.")
- Wiring it requires a `useEffect` debounce in `PersistentIDE.handleChange` and a re-hydration path at mount. ~30 min of work but adds risk surface and a minor schema-evolution concern (existing users' `progress.steps[id]` shape gains a `draft` field — already supported by the type, no migration needed).
- Park for V2 alongside the export/import settings page.

If it's irresistible: 2-line wire-up, debounce 500ms:
```tsx
const debounced = useDebounce(currentDraft, 500);
useEffect(() => { if (debounced) setStepDraft(stepId, debounced); }, [debounced, stepId]);
```
Add to PR 5 only if the 4 h budget has slack.

---

## Rollback playbook

If a PR ships broken to prod:

1. **Identify the merge SHA.** `git log --oneline main` — the squash-merge commit you just pushed.
2. **Revert and re-push.**
   ```bash
   git checkout main
   git revert <sha>
   git push origin main
   ```
3. **Cloudflare Pages auto-redeploys** the prior commit within ~90s. Verify with `agent-browser open https://promptdojo.pages.dev` and a hard refresh.
4. **If Cloudflare cache doesn't bust quickly enough**, log into the CF Pages dashboard, find the deployment, and click "Rollback to this deployment" on the prior green build. Manual override.
5. **Open a new branch** to redo the work with the failure understood. Do NOT amend or force-push the broken commit.

---

## Risks I flagged but the CEO accepted (paper trail)

1. **PR 1's `--color-foreground: #f4f4f5`** changes body text color from warm cream (#F7F4ED) to cool ink (#f4f4f5). Some users may perceive this as a "site got colder." Brand kit says cool ink is correct; CEO accepted. No action.

2. **PR 2 lowercases lesson titles via `.toLowerCase()` at render** — markdown frontmatter retains the title-case version. If we later render lesson titles in a different surface (RSS feed, sitemap text, future API), they'll show capitalized. Acceptable for V1.

3. **PR 3 inlines the wordmark in JSX rather than the SVG file.** If brand updates the wordmark glyph (e.g., changes the `❯` character), 3 instances must update in code. SVG would centralize. Trade-off accepted: simpler ship, no extra HTTP request.

4. **PR 4 kills the chapter-grid eyebrow CTA strip** (`new here? start the 5-question onboarding →`). This is the only entry point for users who land on `/`, scroll past the hero, and don't read the resume island. CEO accepted: the new hero CTA `start chapter 1 →` is the canonical path, and onboarding lives inside chapter 1.

5. **PR 4 puts `FollowOnXPill` in `app/layout.tsx`**, making it appear on every page including lessons and 404. This may distract on lesson pages. CEO didn't decide; my call: ship it site-wide, A/B-style retreat if needed.

6. **PR 5 (dojoTheme)** is the highest-risk PR. CEO explicitly said "if it slips, ship picks #1+#2+#3+#4+#6+#7 first." Ack'd. Plan above includes the grace move.

7. **PR 6's mobile-scroll fix uses a layout swap (`h-[100dvh]` → `min-h-[100dvh]` with `lg:h-[100dvh]`).** Possible regression on mid-sized tablets (768–1023px) where the mobile-style body scroll kicks in but the layout hasn't switched to two-column. Tested at 1024+; explicitly NOT testing 768–1023. CEO accepted: V1 acceptable.

8. **No e2e tests are added** in any PR. Solo founder, $0, pre-launch, audience-over-completion. Manual QA per PR is the verification layer. CEO implicitly accepts.

---

## Things I'm NOT doing in this plan (the cuts)

Echoing CEO §"The cut list" — these are explicitly NOT in this refresh:

- **No component library extraction** (`components/ui/Button.tsx` etc.) — visual personality wins; abstraction earns its keep on the second touch.
- **No IA refactor** (drop `/learn/v2/`). Pre-launch URL refactor — V2 with the domain rename.
- **No legacy 28-chapter system deletion.** Satisfying, zero new value.
- **No CodeMirror Stop/abort button or 30s init timeout.** V2 hardening.
- **No PyodidePreloader-off-home-page bandwidth optimization.** Pre-launch site, premature.
- **No stats-screen / chapter-completion celebration.** Forward routing first; polish later.
- **No concept-level navigator / search.** 1-of-3-persona friction, high build cost.
- **No /settings page or JSON export/import.** No cross-device users yet.
- **No top bar + mobile sidebar drawer.** Real mobile redesign is V2.
- **No `fill` step IDE-blank rendering fix.** Magic-restore refactor — V2.
- **No /bugs/* campaign URL pattern.** Variant C copy lands AFTER the homepage is right.
- **No 3-stripe belt XP bar.** Cute, on-brand, not load-bearing.
- **No tatami-grid background.** Decoration layer.
- **No `Saved · 2s ago` indicator or `setStepDraft` wiring.** Tiny audience pre-launch.
- **No "place me, I already code" diagnostic.** V2 onboarding bifurcation.
- **No live "type and Run" widget pre-warming Pyodide on `/`.** Implementer's call within PR 4 budget — default to static.

---

## Estimated total time

| PR | Pick | Build | Verify | Total |
|---|---|---|---|---|
| PR 1 | #1 fonts/colors | 3.0 h | 0.25 h | 3.25 h |
| PR 2 | #2 lowercase voice | 2.0 h | 0.25 h | 2.25 h |
| PR 3 | #4 heartbeat + wordmark | 3.0 h | 0.25 h | 3.25 h |
| PR 4 | #3 hero + X CTA | 5.0 h | 0.5 h | 5.5 h |
| PR 5 | #5 dojoTheme | 4.0 h | 0.5 h | 4.5 h |
| PR 6 | #6 mobile + 404 + finish | 4.0 h | 0.5 h | 4.5 h |
| PR 7 | #7 onboarding polish | 3.0 h | 0.25 h | 3.25 h |
| **Total** | | **24 h** | **2.5 h** | **~26.5 h** |

**Reality check:** solo founder, evening hours, ~3 h productive blocks per evening = ~9 evenings if shipped serially. With Cloudflare Pages cycles (~90s deploy + ~5 min verification per PR), add ~45 min total cycle overhead. Ship across **5–9 evenings depending on slippage**.

CEO target: "Ship Monday." Today is Tuesday 2026-05-05. Five evenings = Sunday. **Tight but achievable** if PR 5 doesn't slip or is grace-moved.

---

## Open questions for the CEO

None. Every judgment call is baked into the spec. Two flags worth restating but not blocking:

1. **PR 4's `FollowOnXPill` placement** (site-wide via layout vs homepage-only). My call: site-wide. If the IT lead pushes back during review, fall back to homepage + onboarding only.
2. **PR 5 grace move** (ship hljs swap only if dojoTheme slips). My call: pre-decided. If 4 h elapses without a working dojoTheme in dev, ship the hljs CSS and merge; oneDark stays one more week.

---

**Status: ready to execute. Branch `refresh/01-fonts-and-colors` first. Don't bundle. Don't skip the verification checkbox after each merge.**
