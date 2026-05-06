# CEO Vision — Promptdojo UI/UX Refresh v1

**Author:** Studio Producer (CEO)
**Date:** 2026-05-05
**Audience:** Head of IT + implementation team
**One-pager mood:** terminal-room confidence, ember heartbeat, ship Monday.

---

## The bet

Promptdojo becomes the Python school that **looks like a terminal, sounds like a senior dev at 11 PM, and ships you a real bug above the fold.** After this refresh, a stranger landing on `promptdojo.pages.dev` sees a live, broken AI-shipped Python snippet pulse with an ember cursor, screenshots it, follows `@TFisPython` from the wordmark, and lands in lesson 1 having already pressed Run. We are not refreshing a course site — we are dropping the marketing wrapper and letting the product be the marketing. The site stops whispering "Python for AI-first builders" and starts saying "ai writes this. it's wrong."

---

## Convergent findings (where all 6 reports agree)

- **Inter is loaded and is winning** — every non-mono surface renders in the banned font. (Reports 01, 03, 04, 06)
- **Headlines are title-case; the brand demands all-lowercase** — zero of the live H1/H2/H3s honor the rule. (Reports 01, 03, 04, 05)
- **Multiple chromatic accents are leaking** (signal-teal, cyan, amber, rose, orange-not-ember). The kit says ember is the only chromatic. (Reports 01, 03, 04, 06)
- **The hero is positioning, not a hook** — no live IDE, no real bug, no shareable moment above the fold. The screenshot-bait OG art (`/og/launch/wedge`) exists but lives nowhere on the actual page. (Reports 01, 04, 05)
- **"Finish" → `/` kills the endorphin moment** — every persona drops off here. The site has the chapter graph and refuses to recommend the next move. (Reports 02, 06)
- **Mobile is fundamentally broken** — inner-scroll trap on `<main>` plus no sidebar/nav on lesson pages on mobile. iOS rubber-band + momentum scroll fail. (Reports 01, 06)
- **404 page is the default Next.js fallback** — pure black, no brand, dead end. (Reports 01, 04, 06)
- **No 1Hz cursor blink anywhere** — the brand's literal heartbeat is missing. No `@keyframes blink` in any CSS file. (Reports 03, 04)
- **The wordmark never renders as the actual SVG lockup `❯ promptdojo _`** — it's bare text in CSS everywhere. Six logo SVGs exist in `design-kit/logos/` and none ship. (Reports 03, 04)
- **CodeMirror runs `oneDark` and Markdown code blocks run `github-dark`** — the most-looked-at surfaces in the product use someone else's brand colors. (Report 04, mentioned in 03/06)
- **No X follow surface exists on a site whose validation metric is X followers.** (Report 05)
- **Onboarding progress indicator is off-by-one** — first dot lights before user advances past Q1. Voice mismatch between onboarding (title-case) and home (lowercase-ish). (Reports 01, 03)

---

## Divergent findings (where reports disagree, and my call)

- **Hero treatment** — UI Designer (04) wants a 100–128px Fraunces hero with `❯_` mono eyebrow. Growth (05) wants the hero to BE a live runnable IDE showing a real AI-shipped bug. UX Research (02) says "make `/` the IDE." **Decision: Growth wins, with UI Designer's typography applied to the supporting text.** The hero is the bug, rendered in a live (or live-looking) ember-highlighted code block with the headline `ai writes this. it's wrong.` above it in Fraunces 900 at 100–128px. Reasoning: the validation metric is X followers, not brand-fidelity scores. The bug is the screenshot. The screenshot is the follower. Type beauty serves the hook, not vice-versa.

- **`fill` step IDE breakage** — UX Research (02) says blanks rendering outside the IDE breaks the persistent-IDE moat and is a top-3 friction point. UX Architecture (06) lists it as a refactor without urgency. **Decision: NOT this refresh.** Reasoning: Solo founder, $0, audience-over-completion validation. We are not refactoring step views to fix a magic-feeling regression that none of the 10 friends will articulate. Park for V2. We need followers, not a perfect IDE rhythm on `fill` steps.

- **IA refactor (drop `/learn/v2/`)** — UX Architecture (06) treats it as a strategic bet. Brand/Growth/UX Research barely mention it. **Decision: NOT this refresh.** Reasoning: Pre-launch, no organic traffic to migrate, and the URL refactor touches 4 component files + sitemap + redirects. Time better spent on hero/voice/wordmark. Park for the V2 window when we'll also rename the site URL anyway.

- **Component library extraction (`components/ui/`)** — UX Architecture (06) wants Button/Card/ProgressBar canonicalized. UI Designer (04) wants the *visual* of buttons rethought (sharp corners, mono labels, ember). **Decision: Visual personality wins; library extraction parks.** Reasoning: I want every primary CTA to look like a terminal key by next week. I do not need the abstraction layer to land that. Extract the component when we're touching it the second time, not now.

- **Pyodide cold-start copy** — UX Research (02) says "Booting Python (one-time, ~5s)…" reads as broken. UX Architecture (06) wants timeout handling, error states, network-aware loading. **Decision: Soften the copy, that's it.** Reasoning: One-line change buys 80% of the perceived-quality win. Network-aware Pyodide loading is V2.

- **Stats screen / chapter completion** — UX Research (02) says the right fix for "Finish → /" is a stats screen. The minimal fix is "Next lesson →." **Decision: Minimal fix this refresh.** Reasoning: Build the right `nextLesson` routing this week. Stats screen is a beat we can layer in once routing is forward-pulling. Solo founder cannot ship a celebration interstitial on the same sprint as the brand refresh.

- **Streak widget chromatic redesign** — Brand (03) wants ember-only across Flame/Sparkles/Snowflake. UI Designer (04) is silent on this specific redesign but agrees on ember-only. **Decision: ember-only, three different icons doing the work that three different colors did.** This is a one-component fix that ships with the color cleanup.

---

## The picked list (the only things that ship in this refresh)

### 1. Drop Inter, switch body to Fraunces, kill rogue color tokens — *one PR, ~30% brand jump*
- **Why this first:** Highest leverage, lowest risk, unblocks every visual judgment that follows. Brand (03) and UI Designer (04) both rate this the single most valuable change. Cannot judge the hero typography until Inter is dead.
- **What it touches:** `app/layout.tsx` (drop Inter import + variable), `app/globals.css` (delete `--color-signal`, `--color-paper`, `--color-slate-custom`; fix `--color-foreground` to `#f4f4f5`; switch `--font-sans` default to Fraunces stack), `components/StreakWidget.tsx` (replace orange/amber/cyan with ember tokens), `components/v2/ChapterNav.tsx` + `components/ChapterNav.tsx` (replace `text-signal` with dim-ember `text-ember-700`, fix `text-ink-700`-as-text), `components/BrainDump.tsx` (`text-white` → `text-ink-100`), `components/v2/HomeClient.tsx` (same).
- **Owners:** Brand Guardian (Report 03) §Critical 1–3, UI Designer (Report 04) §Drift 1+5+11.
- **Estimated impact:** Brand fidelity 30% → 65% on a single commit. Removes the four most-cited visual violations.

### 2. Lowercase every headline + CTA across the product — *the voice fix*
- **Why this first:** Without it the brand has no personality regardless of how the colors and fonts land. ~25 string replacements. Highest ROI per character edited.
- **What it touches:** `app/page.tsx` (h1, card titles, eyebrow), `app/onboarding/page.tsx` (every headline + button label + form helper), `components/v2/HomeClient.tsx` (resume card heading, "Get started in under a minute"), `components/v2/StepFooter.tsx` ("Lesson XP", "Hint", "Skip", "Continue"), `app/learn/v2/[chapter]/page.tsx` (chapter h1, "Start chapter", "Back to all chapters"), `components/v2/ChapterNav.tsx` ("Open chapter →"), `components/BrainDump.tsx` ("Brain dump", "Save", "Export .md", "Park a thought"), lesson markdown frontmatter (sweep `content-v2/*` for title-case lesson titles), OG art chapter eyebrow, page metadata title (`promptdojo — free interactive python course for ai builders`).
- **Owners:** Brand Guardian (Report 03) §Voice violations, Evidence Collector (Report 01) §UX pain points.
- **Estimated impact:** Voice score 5/10 → 9/10. Entire product personality flips from Coursera to senior-dev-at-11pm.

### 3. Replace the hero with the bug + live(ish) IDE + X follow CTA — *the screenshot machine*
- **Why this first:** This is the marketing engine. Validation metric is followers; without a screenshot-able above-the-fold moment, every other change is decoration. Growth (05) and UX Research (02) both rate this their #1 strategic bet.
- **What it touches:** `app/page.tsx:61-92` (hero block), new ember `[follow @TFisPython on x]` pill in header, swap the "Get started in under a minute" gradient card for a flat ember-rail CTA, change default OG image metadata from `hook` to `/og/launch/wedge`, add the `❯ promptdojo _` mono eyebrow with 1Hz blink, render the mutable-default-arg snippet inline (re-using OG-art content patterns from `app/og/launch/[name]/route.tsx`), headline `ai writes this. it's wrong.` in Fraunces 900 at clamp(72px, 11vw, 128px) with `font-variation-settings: 'opsz' 144`. Single primary CTA `start chapter 1 →` + secondary `or pick your chapter ↓`.
- **Owners:** Growth (Report 05) §Gap 1+2+3+5+6, UX Research (Report 02) §Strategic bet 1, UI Designer (Report 04) §Hero proposal.
- **Estimated impact:** Adds the missing X-follow surface (validation metric unblocker). Bounces drop, dwell rises, screenshot-rate becomes non-zero. Lifts the homepage from "category positioning" to "specific shareable claim."

### 4. Add the 1Hz cursor blink + render the actual `❯ promptdojo _` wordmark SVG — *the heartbeat*
- **Why this first:** The brand's literal heartbeat is missing. UI Designer (04) and Brand Guardian (03) both call this the single defining motion — without it the brand has no pulse, with it every page suddenly feels alive. Cheap to ship.
- **What it touches:** `app/globals.css` (add `@keyframes blink-1hz` + `.cursor-blink` class with `1s steps(1)` per MOTION.md), site header in `app/page.tsx:64-67`, onboarding link in `app/onboarding/page.tsx:163-167`, lesson sidebar header in `components/v2/ChapterNav.tsx:55-60`, IDE prompt in `PersistentIDE.tsx`, OG footer wordmarks. Inline the actual SVG from `design-kit/logos/wordmark.svg` (or render the `❯ + JetBrains Mono ExtraBold + _` lockup directly in JSX) — bare CSS text everywhere becomes the actual mark.
- **Owners:** Brand Guardian (Report 03) §Critical 5+6+7, UI Designer (Report 04) §Drift 4+12.
- **Estimated impact:** Brand fidelity 65% → 85%. The wordmark is the brand's signature; right now it's a string. After this it's the lockup.

### 5. Replace `oneDark` + `github-dark` with a single `dojoTheme` (ember + ink only) — *the IDE belongs to us*
- **Why this first:** The site is ~60% code blocks. Right now the most-looked-at surfaces use Atom's and GitHub's brand palettes — three rainbow themes fighting on every lesson page. Single biggest visual ROI per dev-hour after the Inter drop.
- **What it touches:** New `lib/codemirror-theme.ts` (custom dojoTheme using `--color-ink-*` + `--color-ember-*`), `PersistentIDE.tsx:3+255` (replace `oneDark` import + extension), `app/learn/v2/[chapter]/page.tsx:5` and `components/v2/steps/ReadStepView.tsx:5` (delete `import "highlight.js/styles/github-dark.css"`), `app/globals.css` (add `.hljs-*` token mapping per UI Designer §Code-block syntax tokens). Run button gets `bg-ember-500 text-ink-950 font-mono uppercase` per UI Designer §Run button. Output `✓ ran in Xms` uses `--ok` token, `text-rose-400` stderr becomes `--err`.
- **Owners:** UI Designer (Report 04) §Drift 9+10 + §Code/IDE blocks + §Run button + Top-8 #2.
- **Estimated impact:** The IDE — the moat — finally feels like promptdojo. Brand fidelity 85% → 95%. Strongest visual ROI per dev-hour after #1.

### 6. Fix mobile inner-scroll trap + ship a branded 404 + soften Pyodide boot copy — *the credibility patch*
- **Why this first:** These are three small fixes that each remove a "ship it without QA" defect. Mobile is fundamentally broken (inner-scroll trap on `<main>` means iOS Safari can't even scroll lesson pages naturally). The 404 is a dead-end Next.js default. Pyodide "Booting Python (one-time, ~5s)…" reads as broken to a PM.
- **What it touches:** `LessonShell.tsx:54+59+92-111` (remove `overflow: auto` + fixed-height container; let the body scroll naturally; keep the editor toggle but stop trapping scroll), new `app/not-found.tsx` (Fraunces 404 + `❯ try /` mono prompt + ember home link + park-a-thought removed), `PersistentIDE.tsx:83-88` (copy: "warming up the editor… (~5s, only this once)" — silent on metered/saveData connections is V2), fix `LessonStepClient.tsx:131` so "Finish" routes to next lesson via the existing chapter graph instead of `/`.
- **Owners:** Evidence Collector (Report 01) §Critical 1+2 + §Top-5 #1+#2, UX Research (Report 02) §Quick wins 1+3, UX Architecture (Report 06) §Loading-states proposal 3.
- **Estimated impact:** Mobile becomes usable (was a hard-block on the entire mobile audience). 404 stops being a dead end. Lesson completion stops dumping users on marketing home — the single highest-severity friction (rated 3/3 across all personas). Each is small; together they remove 3 of the 5 top drop-off risks.

### 7. Onboarding voice + progress fix + `welcome-back` cleanup — *the front-door fix*
- **Why this first:** Onboarding is where Maya/Priya/Charlie meet the brand for the first time. The progress indicator is mathematically wrong (off-by-one), the headlines are title-case, the personalization payoff is invisible, and the home page shows a "welcome back" pill while still showing "new here? start onboarding" below it. Cheap polish that lifts every persona's first 90 seconds.
- **What it touches:** `app/onboarding/page.tsx` (lowercase every screen headline + CTA per Report 03; fix progress dots so they advance with the user not ahead of them; add live preview under the personalization grid showing `pets = ["luna"]` updating as they type — Growth §Gap 4); `components/v2/HomeClient.tsx` (hide the static "new here? onboarding" link when `welcome-back` card is showing — UX Research §Quick win 7); rewrite "We'll teach you the shapes…" to "ai is your co-pilot, not your crutch. you'll learn the shapes…" per Brand §Marketing throat-clearing.
- **Owners:** Brand Guardian (Report 03) §Voice violations + §Marketing throat-clearing, Evidence Collector (Report 01) §Critical 5+6, Growth (Report 05) §Gap 4, UX Research (Report 02) §Quick win 7.
- **Estimated impact:** Onboarding goes from 3.4/5 friction to 2/5 average. Removes one of the top "ship it without QA" embarrassments (the off-by-one dots).

---

## The cut list (with reasoning so authors don't relitigate)

- **Component library extraction (Button/Card/ProgressBar/StatusBanner/TextLink/Kbd/Field) — Report 06.** Cut: visual personality wins this refresh; abstraction earns its keep on the second touch. Park for V2.
- **IA refactor: drop `/learn/v2/` → flat `/[chapter]/[lesson]/[step]/` — Report 06.** Cut: pre-launch, no organic traffic to migrate. Touches 4 files + sitemap + redirects for low pre-launch ROI. Park for V2 with the URL/domain rename.
- **Delete legacy 28-chapter v1 system + 17 chapter directories — Report 06.** Cut: deletion is satisfying but ships zero new value. Useful when we touch storage. Park for V2.
- **Custom CodeMirror Stop/abort button + 30s init timeout + Worker-blocked banner — Report 06.** Cut: V2 hardening, not V1 refresh. The "always-enabled Run that queues the click" pattern is good enough.
- **Move PyodidePreloader off home page (cellular bandwidth) — Report 06.** Cut: 12MB bandwidth optimization for a pre-launch site with sub-100 daily visits is premature. Park for V2.
- **End-of-lesson "stats screen" celebration (Duolingo-style) — Report 02.** Cut: minimal fix is `Finish → next lesson`. Stats screen is a polish layer once forward-routing is in.
- **Concept-level navigator (`step.concept` based search) — Reports 02 + 06.** Cut: solves Indie Ian's friction (1 of 3 personas) at significant build cost. Park.
- **`/settings` page + JSON export/import — Report 06.** Cut: cross-device pain doesn't exist for users who don't yet exist. Park for V2.
- **Top bar + mobile sidebar drawer — Report 06.** Cut: mobile sidebar drawer is V2 — a real mobile experience overhaul. The top bar with breadcrumb + streak everywhere is part of the same package. The mobile inner-scroll fix in pick #6 buys us mobile credibility for now.
- **Fix `fill` step rendering — blanks inside the IDE — Report 02.** Cut: V2 magic restoration. Costs significant refactor of `FillBlankStepView`. Park.
- **`/bugs/*` campaign URL pattern with 12 thesis pages — Report 05.** Cut: Variant C aggressive copy is a campaign-page bet for paid traffic / X reply marketing. Worth doing AFTER the homepage is right. Park for late this month.
- **Variant C `/bugs` aggressive landing page — Report 05.** Cut: same as above. Default homepage stays welcoming (Variant B); aggressive page gets built once we're using it.
- **3-stripe belt motif XP bar — Report 04.** Cut: cute, on-brand, but not load-bearing. Linear bar with ember tint is fine. Park.
- **Tatami-grid background pattern — Report 04.** Cut: motif layer. The hero treatment in pick #3 carries enough dojo energy. Park.
- **`Saved · 2s ago` indicator + `setStepDraft` wiring — Report 06.** Cut: trust gain for a "I typed for 10 minutes and refreshed" failure mode that has a tiny audience pre-launch. Park.
- **Step-type sidebar label re-labeling ("Mc" → "Multiple choice") — Report 01.** Cut: should be a one-line lookup table change but I'm not adding it to the picked list because I'm reserving solo-founder cycles. If it's literally one switch in `ChapterNav.tsx:174`, fold into pick #2 as a freebie. If it's structural, park.
- **Real "place me, I already code" diagnostic — Report 02.** Cut: V2 onboarding bifurcation. Solves Ian's discovery friction; not load-bearing for the validation metric.
- **Live "type and Run" widget pre-warming Pyodide on `/` — Report 02.** Cut: subsumed by pick #3's hero treatment. The hero will look like a runnable IDE; whether the Run button literally fires Pyodide on `/` is a pick-#3 implementation choice the implementer can make. Static ember-highlighted snippet with a fake-looking Run is acceptable; truly runnable is better. Implementer's call within pick #3 budget.

---

## Sequencing

The picks are ordered such that each unlocks the next. Implement in this order; do not parallelize.

1. **Pick #1 (Drop Inter + kill rogue colors)** ships first as a single clean PR. After this lands, every visual judgment in #2–#7 is judged against the new baseline. *Branch: `refresh/01-fonts-and-colors`. ~3 hours.*

2. **Pick #2 (Lowercase voice sweep)** ships next. This is a string-replacement PR with no visual logic. Easy to review, easy to revert. *Branch: `refresh/02-voice-lowercase`. ~2 hours, mostly find/replace.*

3. **Pick #4 (Cursor blink + wordmark SVG lockup)** ships next, before the hero rebuild. The hero in #3 will use both. *Branch: `refresh/04-heartbeat-and-wordmark`. ~3 hours.* (Note: I'm sequencing pick #4 before pick #3 because the hero rebuild relies on the blink + wordmark primitives.)

4. **Pick #3 (Hero rebuild + X follow CTA + OG swap)** ships next. With the type, color, voice, and heartbeat in place, the hero treatment finally has scaffolding to work against. *Branch: `refresh/03-hero-bug-and-x-cta`. ~5 hours.*

5. **Pick #5 (dojoTheme for CodeMirror + highlight.js)** ships next. The hero is the screenshot; the IDE is the moat. With the brand language locked, the IDE redesign is now constrained correctly. *Branch: `refresh/05-dojo-codemirror-theme`. ~4 hours.*

6. **Pick #6 (Mobile scroll fix + branded 404 + Pyodide copy + Finish→next)** ships next. Three small defect fixes batched into one PR; review burden is small but each is unblocking for credibility. *Branch: `refresh/06-credibility-fixes`. ~4 hours.*

7. **Pick #7 (Onboarding polish + welcome-back cleanup)** ships last. Onboarding is the entry-point polish layer that makes the most sense to land once everything it depends on (typography, voice, color) has settled. *Branch: `refresh/07-onboarding-polish`. ~3 hours.*

**Total estimated solo-founder budget: ~24 hours.** Three evening sessions if it goes smoothly; a week of evenings if reviews are tight.

**Handoff notes for the Head of IT:**
- Each pick is a single PR. Do not bundle. Reviews are smaller, regressions easier to bisect.
- Pick #1 may look weird in production for ~30 minutes if other picks haven't shipped yet — Fraunces-as-body without lowercase headlines reads as "fancy serif marketing." That's expected. Ship #2 within the same evening.
- Pick #3's hero is the only pick with real product judgment in it. The implementer should screenshot the result and post it before merging. If the hero doesn't feel like a screenshot you'd tweet, do not merge.
- Pick #5 (dojoTheme) is the highest-risk pick because CodeMirror theming has rough edges. Allocate the most buffer there. If it slips, ship picks #1+#2+#3+#4+#6+#7 first; pick #5 can ship alone the following week.
- The cuts are not "later" — they are "not this refresh." Park them in `docs/v2-backlog.md` so the team sees they were logged, not lost.

---

## Success criteria (so we know we won)

- **Brand fidelity score climbs 30% → 95%.** Measured by re-running the Brand Guardian audit (Report 03) — Inter gone, signal/cyan/amber/rose gone, headlines lowercase, wordmark rendering as the lockup, blink alive on the wordmark + IDE prompt.
- **The homepage produces ONE shareable screenshot above the fold.** A stranger looking at the page should screenshot the hero — `ai writes this. it's wrong.` + the bug snippet — and want to tweet it. Test: Josh personally tweets it within 24 hours of the refresh shipping; if he doesn't want to, the hero is wrong.
- **Every page surfaces a `[follow @TFisPython on x]` ember pill.** Validation metric is X followers; you cannot grow what you do not ask for. Header presence is the unblock.
- **Mobile lesson pages scroll naturally.** `document.documentElement.scrollHeight > 667` on `/learn/v2/variables/` at 375×667. iOS rubber-band works. Verified by re-running Evidence Collector's mobile probes (Report 01).
- **404 stops being a dead-end.** A non-existent URL renders the branded 404 with home + first-chapter links and the wordmark. Verified by visiting `/this-page-does-not-exist`.
- **"Finish" pulls the user forward.** Last step of a lesson routes to the next lesson's first step, not `/`. Only the last-lesson-of-last-chapter goes home. Verified by completing variables → naming-things and landing in variables → next lesson, not `/`.
- **The IDE belongs to promptdojo.** Run button is ember + sharp + mono. CodeMirror theme is ember + ink. No more github-dark, no more oneDark. Verified by visual diff of the IDE before/after.
- **Onboarding off-by-one is fixed.** Q1 shows 1 of 5 dots, Q2 shows 2 of 5, etc. Verified by clicking through onboarding fresh.
- **Voice score 5/10 → 9/10.** Re-run Brand Guardian's voice grep against `app/`, `components/`, OG art, lesson markdown — zero title-case headlines remain.

---

## What we're NOT doing in this refresh (V2 problems)

- **Building accounts / sync / cross-device progress.** Locked decision per MASTER-PLAN §1 #11 — V1 is local-only. Auth is a V2 problem.
- **AI tutor / Copilot Panel powered by Claude Haiku 4.5.** V2 per MASTER-PLAN §5.
- **Refactoring the IA away from `/learn/v2/`.** Pre-launch URL refactor with low ROI. V2 with the domain rename.
- **Deleting the legacy 28-chapter v1 system and 17 chapter directories.** Satisfying, zero new user value. V2.
- **Stats screen / chapter completion celebration interstitial.** Right answer; not the minimum-ROI answer this week. Once `Finish → next lesson` is shipped, the next layer to add.
- **Mobile sidebar drawer + Top bar + breadcrumb.** Real mobile experience requires more than scroll-fix. V2.
- **`/settings` page + JSON export/import.** Cross-device for users who don't exist yet. V2.
- **Concept-level navigation / search.** Solves 1-of-3 persona's friction at high build cost. V2.
- **Fix step IDE-blank rendering.** Magic-restore refactor. V2.
- **`/bugs/*` campaign page with 12 thesis URLs.** Marketing channel build for AFTER the homepage is right. Late May.
- **Stop button + Pyodide error/timeout handling.** V2 hardening.
- **Component library extraction.** When we touch the components a second time. Likely V2.
- **3-stripe belt XP motif + tatami background pattern.** Brand decoration layer. V2.
- **`Saved · Ns ago` + `setStepDraft` wiring.** Trust gain for a tiny pre-launch audience. V2.
- **"Place me, I already code" diagnostic onboarding fork.** V2 onboarding bifurcation.
- **Promptdojo domain + trademark sweep.** Tracked in MASTER-PLAN §9. Separate from this refresh; runs in parallel.

---

**Studio Producer**: CEO
**Review Date**: 2026-05-05
**Implementation handoff**: Head of IT, branch `refresh/01-*` through `refresh/07-*`
**Strategic posture**: Audience-over-completion. Every pick traces to a follower the site doesn't yet earn.
**Vibe**: Ship Monday. The bug is the marketing. The wordmark is the heartbeat. Drop Inter and don't look back.
