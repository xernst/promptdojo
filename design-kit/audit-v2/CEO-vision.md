# CEO Vision V2 — Promptdojo Legitimacy Refresh

**Author:** Studio Producer (CEO)
**Date:** 2026-05-06
**Audience:** Head of IT + senior dev shipping Monday
**Predecessor:** `design-kit/audit/CEO-vision.md` (V1 — punk shell shipped)

---

## The bet (1 paragraph)

**After V1, promptdojo looks like a punk artifact. After V2, it reads as a curriculum.** The site keeps every existing punk asset — lowercase headlines, the `❯_` heartbeat, ember-only accent, the bug-snippet hero, the senior-dev-at-11pm voice — and adds the *institutional layer underneath*: a 5-phase banded curriculum tree that finally renders the structure already authored in `/about`, time estimates and progress meters wired through every chapter card, a global type scale and card pattern that turn three hand-rolled visual languages into one designed system, a `/changelog` + last-commit timestamp + GitHub stars badge that prove this isn't a dead repo, and a Khan-grade `welcome-back` state that tells a returning user where they actually are. The bet is **punk + receipts**: a Codecademy designer landing cold sees lowercase confidence + last-commit-3-days-ago + 47 stars + 5 visible phases + per-chapter time + per-chapter progress, concludes "real product made on purpose," and either follows `@TFisPython` or screenshots a chapter card. Not a redesign. The institutional bones the punk shell has been hiding all along.

---

## Convergent findings (where all 6 reports agree)

- **The 5-phase arc is authored data that never renders.** All 6 reports flag this. `app/about/page.tsx:25-55` defines `foundations / real-python / llm-apis / shipping / capstone`; `/` shows a flat 25-card wallpaper. (01 §catalog patterns, 02 §1 inflection point, 03 §section labels, 04 §1 chapter rail, 05 §curriculum-tree, 06 §1 quick win)
- **Time estimates are authored on every lesson but rendered nowhere.** `Lesson.estMinutes` exists in `schema.ts:259` and ships in every manifest. Zero UI surfaces it. (01 §table-stakes #2, 02 §casual tell #2, 04 §chapter tile, 05 §asset 2, 06 §quick win 1)
- **Chapter cards have 4 fields when serious sites have 8–10.** No completion state, no time, no difficulty/phase, no prereqs. Data exists; cards refuse to render it. (01 §expandable syllabus, 02 §casual tell #4, 04 §2 tile density, 06 §curriculum tree)
- **Welcome-back state is "pick up where you left off" — no progress, no recency, no payoff.** Khan/Boot.dev/Codecademy all show "%Through · last visited Nd ago." (02 §casual tell #5, 04 §welcome-back rebuild, 06 §6-state machine)
- **No proof the repo is alive.** No last-commit timestamp, no GitHub stars surface, no `/changelog`, no shipping cadence visible. Reads as "weekend project that may be abandoned." (02 §institutional polish, 03 §trust signal #1, 04 §404 + states, 05 §asset 1 + ship-history, 06 §welcome-back)
- **Type scale + card pattern + button hierarchy are hand-rolled in 3 different ways across the site.** Three h1 sizes, two card patterns (one with a gradient that screams Spotify), two button visual languages (terminal-key + Material). (03 §sentence-case stragglers, 04 §5 + §7 + §8 — all three call this the highest-leverage system fix)
- **The X-follow CTA + GitHub badge belong in the global header on every page.** Validation metric is X followers; site doesn't ask for them on most pages. (03 §pill demotion, 05 §asset 3 + Top-10 #1+#2, 06 silent — agrees by absence)
- **Punk voice is the moat. Do not soften.** All 6 reports independently rule out the "make it Codecademy-like" reading. The fix is institutional underneath, not voice on top. (01 §what promptdojo does better, 02 §lens, 03 §the tension named, 04 §brief, 05 §honest position, 06 §architectural bet)

---

## Divergent findings (where reports disagree, and my call)

### 1. `/curriculum` as a standalone route vs. inline-only on `/`

- **06 (UX Architecture)** wants `/curriculum` as a canonical, deep-linkable, indexable standalone page that doubles as the home embed.
- **02 (UX Research)** is silent on the route — proposes phase dividers inline on `/` only.
- **04 (UI)** specs the phase-banded rail as the home replacement, not a separate route.
- **My call: Ship the inline embed on `/` only.** Reasoning: solo founder, $0, audience-over-completion. A separate `/curriculum` route with deep-linking + URL-hash expansion is V3 polish for an audience that doesn't yet exist. Inline phase bands on `/` deliver 90% of the institutional signal at 30% of the cost. When SEO actually matters (post-1000 followers), promote the embed to `/curriculum` in a single Next.js move. **Keep the component built so it can dual-mount later** — but ship one mount point now.

### 2. Progress data model: how much new schema?

- **06** proposes 4 new optional `ProgressV2` fields + 2 new lib modules (`sessions.ts`, `milestones.ts`) — backward-compatible but ~150 lines of new infrastructure.
- **02** proposes Khan-grade welcome-back using existing `lastVisitedV2` + step counts, no new fields.
- **04** wants a global `<CourseProgress />` header pill driven by existing data.
- **My call: Add ONE field — `lastSeenAt: string`. Skip sessions, skip milestones, skip the 6-state machine.** Reasoning: the full 06 model is correct; it's also V3. The ROI on `lastSeenAt` (unlocks "returning after break" copy + recency proof) is high; the rest (`chapterTimeMs`, `longestSessionMs`, milestone events) earns its keep when there's a user base to celebrate. Pick #6 below ships ONE quick win — derived progress percentage on chapter cards from `progress.steps` rollup. That's it.

### 3. Hard prereq lock vs. soft prereq chip vs. nothing

- **06** decisively soft-suggest, never block. Good reasoning (audience-over-completion).
- **01** notes Frontend Masters' inline prereq sentence as a top-10 pattern.
- **02** lists prereqs as gap #3.
- **My call: Soft chips on the curriculum tree only. Don't author the data yet.** Implementer applies the convention 06 proposes (`previous lesson in chapter` is implicit prereq; `previous chapter's last lesson` for cross-chapter). Zero authoring required for V2; chips render automatically. **No chapter-card prereq surface this round** — chip lives on the expanded chapter view only.

### 4. Counter strip vs. about-hero stat strip vs. both

- **03** wants a 5-receipt strip under the about hero.
- **05** wants a counter-strip row above the chapter grid on home.
- **04** is silent on strips, focuses on tile density.
- **My call: Both — same primitive, two mount points.** A single `<StatStrip>` component renders `25 chapters · 624 steps · 8–15h · MIT · last commit ${date}` on both surfaces. One component, two mount points, two screenshots that show the brand thinks in receipts everywhere.

### 5. Lesson chrome breadcrumb (3-node hierarchy)

- **06** proposes a 3-node breadcrumb in the lesson header (`ch 03 › l02 › step 4/9`) — no new chrome, repositions existing data.
- **02** lists this as quick win #4 (chapter number missing from lesson header).
- **04** wants a full lesson-chrome rebuild including pane labels (`❯ prompt`, `❯ editor`, `❯ stdout`).
- **My call: Ship the 3-node breadcrumb. Park the pane labels.** Breadcrumb is the "where am I" institutional fix — load-bearing for the curriculum-feel. Pane labels are visual polish that earns its keep in V3. ~15 lines vs. ~80 lines.

### 6. Voice: lowercase StepFooter labels, drop "production-ai track" eyebrow

- **03** wants both. Specific copy rewrites.
- **02** independently flags step-type sidebar labels.
- **My call: Both ship. Voice is free.** Voice changes are the cheapest brand wins on the property. Bundle with the visual sweep so the diff lands once.

---

## The picked list (the only things that ship in this refresh)

Ordered. Each pick unlocks the next.

### 1. Type scale + card pattern + button hierarchy codified — *the system PR*

- **Why this first:** Highest-leverage single change in the entire audit. Today the site has 3 h1 sizes, 2 card patterns (one of which is a gradient that breaks the brand), and 2 button visual languages. After this, ONE type scale, ONE card pattern (with 3 variants), ONE button hierarchy (3 tiers, all sharp+mono+uppercase). A Stripe/Linear designer reading the site after this PR concludes "real product"; before, it reads as "made by 3 people who didn't talk." Every other pick depends on this scaffolding being in place.
- **Touches:** `app/globals.css` (add `t-hero / t-section / t-h2 / t-h3 / t-body / t-body-sm / t-eyebrow / t-mono-meta / t-code` utility classes per 04 §5; add `space-y-3 / space-y-8 / space-y-24` rhythm; add `*:focus-visible` canon + `.dojo-hover` 140ms transition; add `.skeleton` pulse keyframe). Sweep `app/page.tsx`, `app/about/page.tsx`, `app/learn/v2/[chapter]/page.tsx`, all chapter cards → use `t-*` classes. Drop the resume-CTA gradient at `HomeClient.tsx:70` + replace with highlight-card pattern (`border-l-2 border-green-500`). Sweep `[chapter]/page.tsx:116`, `StepFooter.tsx:140`, `onboarding/page.tsx:205,244,280,350,401` — `rounded-md bg-green-500` Material buttons → sharp+mono+uppercase terminal-key per 04 §8. All `rounded-lg/rounded-xl` → `rounded-none`. Drop all gradients. Lowercase `StepFooter` labels (`Lesson XP / Hint / Skip / Continue / primaryLabel default`) per 03 §5.
- **Owners:** UI Designer (04) §5 + §6 + §7 + §8 + §9, Brand Guardian (03) §5 lowercase enforcement.
- **Estimated impact:** Single biggest "feels like a real product" lift per dev-hour. ~17h of UI work across the report compresses here. Brand fidelity 95% → 99%. **Without this pick, every other pick lands on inconsistent scaffolding.**

### 2. Phase-banded curriculum tree on `/` — *the institutional spine*

- **Why this first (after #1):** All 6 reports converge on this. The `/about` page already names 5 phases; `/` renders 25 cards in a flat grid as if they're equal-weight blog posts. The bet is curriculum-as-syllabus, not list-of-files. After #1's card pattern lands, this is just "promote the eyebrow + left-rail motif from `/about` to `/`."
- **Touches:** New `lib/curriculum/phases.ts` (single source of truth for phase→chapter mapping; replace inline array in `app/about/page.tsx:25-55` with import). New `components/v2/PhaseBandedRail.tsx` (~200 lines: 5 phase bands, each with eyebrow + chapter range + aggregate progress + ember left-rail; chapters render as `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` tiles within each band per 04 §1). Rewrite `app/page.tsx:158-203` to mount the rail. Add `estMinutes: number` rollup to `ChapterTocEntry` in `schema.ts:297-305` + emit in `scripts/build-content-v2.mjs` (5 lines per file).
- **Owners:** UX Architecture (06) §curriculum tree + §quick win 2, UX Research (02) §1 inflection point + §strategic bet A, UI Designer (04) §1 chapter rail.
- **Estimated impact:** Single highest "real curriculum" signal. PM Priya stops asking "is this a real course"; Indie Ian sees "phase 03 · llm apis" and clicks straight in. The arc that already exists in the data finally has gravity.

### 3. Chapter tile density upgrade + progress hairline primitive — *the data finally renders*

- **Why this first (after #2):** Once tiles live inside phase bands (#2), promoting them from 4 fields to 8 is the next institutional unlock. Time estimates, completion state, difficulty (via phase tier), and a 1px progress hairline make every chapter card answer "how long, how hard, how far in" without a click. Reuses #1's `t-mono-meta` + the new card pattern.
- **Touches:** Single new primitive `components/v2/ProgressHairline.tsx` (~30 lines; height + color props; replaces the bespoke `StepFooter.tsx:93-105` bar). Sweep `StepFooter.tsx` to use it. Render on chapter tiles (`PhaseBandedRail.tsx`) as `h-px`. Add a 3rd Tier `<CourseProgress />` mount in `app/layout.tsx` global header — same primitive, `h-1`. Wire `progress.steps` rollup → `done/total` per chapter in `lib/content-v2.ts`. Render `~Nm` from `chapter.estMinutes` (built in #2). Render phase-tier difficulty token (`foundations | core | advanced`) per 04 §2.
- **Owners:** UI Designer (04) §2 tile density + §3 progress sitewide, UX Research (02) §quick wins 2 + 5, UX Architecture (06) §quick wins 1 + 6.
- **Estimated impact:** Density done well = competence. Returning user sees `4/26 · ~22m · core` on every card and feels seen. The single highest-impact "expands signed-out value" change after the spine.

### 4. Welcome-back state upgrade — *the returning-user receipt*

- **Why this first (after #3):** With chapter progress now wired (#3), the home `welcome back` card has data to surface. Today it says "pick up where you left off" — Khan/Boot.dev say "47% through · 2 lessons remaining · last visited 3 days ago." This is a 30-line `HomeClient.tsx` rebuild that converts the entry-point card from marketing pill to personal dashboard.
- **Touches:** Add `lastSeenAt: string` (one optional field) to `ProgressV2` in `lib/storage.ts:133-148`; write on every `updateProgressV2` call. New `lib/home-state.ts` with a 4-state resolver: `loading | guest | onboarded-not-started | in-progress` (drop the 6-state machine — `phase-just-completed` and `returning-after-break` are V3). Rewrite `HomeClient.tsx:38-117` to render the 4 states. `in-progress` shows: `step N of M · X% through ${chapter.title} · last visited Nd ago` (per 02 §quick win 8). Hide the static "new here?" link when welcome-back card is showing (CEO V1 pick #7 — confirm it shipped). Drop the `Play` icon-circle; use a `↵ continue` mono keycap per 04 §11. Apply highlight-card pattern from #1.
- **Owners:** UX Architecture (06) §welcome-back state, UX Research (02) §quick win 8 + §casual tell #5, UI Designer (04) §11 welcome-back rebuild.
- **Estimated impact:** Returning user goes from "the site doesn't know me" to "the site knows exactly where I am." Compounds with daily-goal habit pull.

### 5. 3-node breadcrumb in lesson header + chapter number visible — *the in-product spine*

- **Why this first (after #4):** The home now expresses curriculum hierarchy (#2). The lesson page still doesn't. Inside a lesson, the user sees `chapter title · step 3/9` with no phase context, no chapter number, no lesson-of-chapter position. 02 and 06 both flag this. ~15 lines, no new chrome.
- **Touches:** `components/v2/LessonStepClient.tsx:151-162` — replace the 2-line header strip with: `phase 0X · ${phaseName}` (small mono eyebrow) / `ch ${n} · ${chapter.title}` (links to `/learn/v2/${chapter.slug}`) / `lesson ${i} of ${total} · ${lesson.title}` (links to lesson root) + existing progress bar. Use existing `chapter`, `lesson` props + `lib/curriculum/phases.ts` from #2. Replace `ChapterNav.tsx:175` step-type labels with `step.prompt.slice(0, 32)` content preview per 02 §quick win 3 + §casual tell #7.
- **Owners:** UX Architecture (06) §breadcrumbs, UX Research (02) §casual tell #6 + §quick wins 3+4, UI Designer (04) §4 lesson chrome (partial — pane labels deferred).
- **Estimated impact:** Every lesson page shows "where am I" at three levels. Mid-lesson learner stops feeling like they're inside an unlabeled shell.

### 6. GitHub-stars + last-commit pill in global header + StatStrip on `/` and `/about` + `/changelog` route — *the receipts layer*

- **Why this first (after #5):** With the curriculum, progress, and in-lesson hierarchy all expressing the institutional layer, the final receipt is "this isn't abandoned." The single highest-leverage credibility signal a solo project can ship is `last commit · 6h ago`. Bundles 3 trust moves into one PR because they share a build-time fetch.
- **Touches:** New `scripts/fetch-github-stats.mjs` (build-time fetch from `api.github.com/repos/xernst/promptdojo`, freeze to `lib/generated/github.json`, gitignored). New `components/SiteHeader.tsx` (extracted from inline `app/page.tsx` + `app/layout.tsx` headers; renders wordmark + `[★ N · committed Xh ago]` ember pill + `[follow @TFisPython on x]` ember pill + StreakWidget when present). New `components/StatStrip.tsx` rendering `25 chapters · 624 steps · 8–15h · MIT · last commit ${date}` — mount on `app/page.tsx` (above chapter grid) + `app/about/page.tsx` (under hero, after `:135`). New `app/changelog/page.tsx` (server component, reads `content/changelog.md` at build, renders entries) + new `content/changelog.md` (5 pre-filled entries per 05 §changelog template). Footer extension on `app/page.tsx` + `app/about/page.tsx` to show `· last commit ${date}` + link to `/changelog` per 03 §footer + 05 §asset 1.
- **Owners:** Trust Signals (05) §asset 1 + §asset 2 + §changelog + §Top-10 #1+#2+#3+#4+#8+#10, Brand Guardian (03) §trust signals to add #1+#2 + §footer + §FAQ "how often is it updated?", UX Research (02) §casual tell #14 + §strategic bet D.
- **Estimated impact:** Stranger lands, scans 5 seconds, sees: `★ 47 · 6h ago` in header + `25 ch · 624 steps · MIT · last commit 2026-05-04` strip + 5 phase bands + per-chapter progress. Concludes "real, maintained, open." Three trust signals before any scroll.

### 7. Voice cleanup pass — *while the diff is open*

- **Why this last:** Voice fixes are zero-risk character edits that ride the same PR cadence. Bundling here keeps reviews atomic.
- **Touches:** `app/page.tsx:155` eyebrow `25 chapters · production-ai track included · free forever` → `25 chapters · 624 steps · free forever` (drops the Coursera-tier-upsell read per 03 §5). `app/about/page.tsx:181` `what's inside` → `the curriculum`. `app/about/page.tsx:211` `how it works` → `the loop`. `app/about/page.tsx:158-163` WEDGE H2 tightened per 03 §about-wedge. New FAQ entry `how often is it updated?` after `:115` per 03 §about-FAQ. One-line founder credential between `i'm josh.` and the wrote-this paragraph at `:277-282` (founder writes the actual sentence — shape: one role + one tool stack + one frequency word per 03 §8). Demote `LoginToSave` pill on global header to ghost (no border) when logged-out, leaving `FollowOnXPill` as the lone bracket-pill per 03 §X-CTA + 05 §CTA hierarchy. Onboarding `:73` `keep the streak alive` → `one short read` per 03 §onboarding (contradicts ember-not-streak posture). `LessonStepClient.tsx:189` `finish` → `next chapter →` (CEO V1 finish→next routing already commits to this pull).
- **Owners:** Brand Guardian (03) §section-label naming + §specific copy rewrites + §Top-10 #3+#4+#6+#7+#8+#9+#10, Trust Signals (05) §CTA hierarchy.
- **Estimated impact:** Voice score 9/10 → 9.5/10. The remaining "Coursera-tier-upsell" tells get sanded; the founder voice gets one more receipt.

---

## The cut list (with reasoning)

- **`/curriculum` as a standalone route — Report 06.** Cut: inline embed on `/` delivers 90% of the signal at 30% of the cost. Promote to a standalone route in V3 when SEO matters (post-1000 followers). Component built dual-mount-ready.
- **Full progress data model (`chapterTimeMs`, `longestSessionMs`, `milestones`, `sessions`) — Report 06.** Cut: 150 lines of new infrastructure for celebration features that need a user base. Ship `lastSeenAt` only; the rest earns its keep in V3.
- **Phase-just-completed celebration / returning-after-break copy variants — Report 06.** Cut: 6-state machine collapsed to 4-state. Both variants need usage data to design well; ship the foundational `in-progress` improvement first, layer celebrations once we have humans completing phases.
- **`/lesson/resume` server-side redirect route — Report 06.** Cut: shareable resume link is a niche affordance pre-launch. The deep `/learn/v2/...` URL works fine.
- **Lesson completion / chapter completion interstitials — Report 04 §11.** Cut: V3. The `Finish → next` routing from V1 + the `next chapter →` voice fix from pick #7 captures 80% of the forward-pull. Stats-card celebration earns its keep when audience exists.
- **Pane labels in lesson chrome (`❯ prompt`, `❯ editor`, `❯ stdout`) — Report 04 §4.** Cut: visual polish that's 80 lines of code for a lesson-chrome upgrade that's not load-bearing for legitimacy. The 3-node breadcrumb (pick #5) carries the "named workspace" signal.
- **Mobile pane-tab pill redesign — Report 04 §4.** Cut: V1's mobile scroll fix landed; the deeper mobile-chrome rebuild stays parked for V3.
- **ASCII glyph swap (Lock → ▱, Check → ▰, etc.) — Report 04 §10.** Cut: cute, on-brand, but not load-bearing for legitimacy. Lucide is fine where it ships today; revisit when the brand does an icon polish pass in V3.
- **`/og/launch/wedge` per-chapter OG cards — Report 05 #6.** Cut: V3 marketing channel build. Per-chapter OG generation is 25 design judgments at zero pre-launch share volume. Single home OG is enough.
- **`</> source` link per lesson — Report 05 #7.** Cut: nice trust signal, low ROI on the surface where the user is most invested in the content, not the repo. Add when there's PR traffic to justify it.
- **`pyodide warm · ready` micropill — Report 05 #5.** Cut: the V1 boot-copy fix already softened the cold-start. A "ready" pill on the warm state adds nothing to a stranger.
- **Footer commit feed (3 most recent commits) — Report 05 #10.** Cut: `last commit · ${date}` pill in the header (#6) + `/changelog` (#6) already deliver "is this maintained" twice. A 3-commit footer feed is a 3rd surface for a question already answered.
- **$0 forever callout band on home — Report 05 #9.** Cut: the existing eyebrow + `/about` §"free forever" already carry this. A separate band between chapter grid and footer is a SaaS-landing-page move that contradicts the "no marketing wrapper" posture.
- **Launch trailer inline on `/about` — Report 05 §asset 4.** Cut: video on a learning page is a Codecademy-marketing-style move. Trailer lives on `/og` + X. Don't import it.
- **Author-defined `Chapter.learnedSkills` — Report 06 Tier 2.** Cut: derive-from-`step.concept` (Tier 1) is sufficient; hand-curated outcome statements need 25 author judgments per chapter. V3 when content settles.
- **Difficulty taxonomy per lesson — Report 06.** Cut: phase tier IS the difficulty signal. A 1-3 dot system requires 60+ author judgments and contradicts the "the numbering is the suggestion" posture. Implementer applies a phase-tier badge in the chapter tile (pick #3) — that's enough.
- **Hard prereq locks — Report 06.** Cut: explicit. Audience-over-completion forbids hard-blocking. Soft chip on the expanded chapter view only.
- **`Saved · Ns ago` indicator — Report 06.** Cut: pre-launch trust gain for a "I typed for 10 minutes and refreshed" failure mode at zero traffic. V3.
- **TopBar / mobile sidebar drawer / breadcrumb-everywhere — Report 06.** Cut: full mobile-chrome rebuild is V3.
- **Variant C `/bugs` aggressive landing page — Report 05 (referenced).** Cut: campaign-page bet for paid traffic. Worth doing AFTER homepage is right.
- **Custom illustration system / tatami background / 3-stripe belt motif — Report 04 §V2.** Cut: explicit V3 brand-decoration layer.
- **Light mode — `BRAND.md:44`.** Cut: explicit V3.

---

## Sequencing

Each pick is a single PR. Do not bundle. Reviews are smaller; regressions easier to bisect.

1. **Pick #1 — `refresh-v2/01-system-tokens`** ships first. ~6h. Type scale + spacing + card pattern + button hierarchy + focus canon + skeleton primitive. Touches ~20 files. Visual diff will look identical at first; the win is *consistency* — every subsequent PR lands on stable scaffolding. **Do not merge picks #2–#7 until #1 lands.**

2. **Pick #2 — `refresh-v2/02-phase-banded-rail`** ships next. ~4h. New `PhaseBandedRail` component + `lib/curriculum/phases.ts` extraction + `estMinutes` rollup. Replaces flat 25-card grid with 5 phase bands. The "real curriculum" moment.

3. **Pick #3 — `refresh-v2/03-tile-density-and-progress`** ships next. ~4h. `ProgressHairline` primitive + 8-field tile + global `<CourseProgress />` header pill. Density renders the data we already have.

4. **Pick #4 — `refresh-v2/04-welcome-back-resolver`** ships next. ~3h. `lib/home-state.ts` resolver + `lastSeenAt` field + `HomeClient.tsx` rebuild. Returning-user dashboard.

5. **Pick #5 — `refresh-v2/05-lesson-breadcrumb`** ships next. ~2h. Three-node breadcrumb in `LessonStepClient.tsx` + sidebar step-label content preview. Smallest PR; biggest in-lesson navigational lift.

6. **Pick #6 — `refresh-v2/06-receipts-layer`** ships next. ~4h. Build-time GitHub fetch + `SiteHeader` extraction + `StatStrip` + `/changelog` route + footer last-commit. The trust layer.

7. **Pick #7 — `refresh-v2/07-voice-cleanup`** ships last. ~2h. String-replacement PR. Eyebrow renames, FAQ entry, founder credential, pill demotion, `next chapter →`. Easy to review, easy to revert.

**Total estimated solo-founder budget: ~25h.** Three to four evenings if it goes smoothly, one week of evenings if reviews are tight.

**Handoff notes for the senior dev:**
- Pick #1 is the gate. Every other pick assumes its scaffolding. If #1 slips, hold all downstream PRs.
- Pick #2's `lib/curriculum/phases.ts` is the single source of truth. After it lands, `/about` page imports phases from it. Don't keep two arrays alive.
- Pick #3's `ProgressHairline` primitive replaces the bespoke bar at `StepFooter.tsx:93-105` AND ships as the chapter-tile hairline AND ships as the global header `<CourseProgress />`. One primitive, three sizes — don't fork it.
- Pick #6's GitHub fetch happens at *build time*, not runtime. Frozen JSON, gracefully fall back to hiding the pill if the API fails. Cloudflare Pages-friendly.
- Pick #7 is character-edit-only. No visual logic. Should be the smallest diff.
- The cuts are not "later" — they are "not this refresh." Park them in `docs/v3-backlog.md` so the audit authors see they were logged, not lost.

---

## Success criteria (so we know we won)

- **A stranger lands on `promptdojo.pages.dev`, scans 5 seconds, sees:** `★ N · committed Xh ago` in header + `25 ch · 624 steps · MIT · last commit ${date}` strip + 5 phase bands with chapter ranges + per-chapter time + per-chapter progress hairline. Concludes "real, maintained, structured course."
- **A returning user opens `/`** and the welcome-back card says `step 12 of 26 · 46% through chapter 03 · last visited 3 days ago` — not "pick up where you left off."
- **A mid-lesson learner sees their position at 3 levels of hierarchy** (`phase 02 · real python` / `ch 09 · iteration` / `lesson 2 of 3 · for-each-loops`) without leaving the page.
- **`/changelog` renders ≥ 5 dated entries** in the brand voice; `/about` shows `last shipped: ${date}` cross-link.
- **The site has ONE type scale, ONE card pattern (3 variants), ONE button hierarchy (3 tiers), ONE focus canon.** Re-running 04's audit returns 0 hand-rolled `text-5xl/6xl/7xl` h1s, 0 `rounded-md bg-green-500` Material buttons, 0 gradients. Brand fidelity 95% → 99%.
- **Voice score holds at 9.5/10.** No `production-ai track included`, no `what's inside`, no `Continue` (capital C), no `keep the streak alive`. New FAQ entry shipped. Founder credential shipped.
- **The single new schema field is `lastSeenAt`.** Backward-compatible. Zero migration.
- **The phase array exists in exactly one place** (`lib/curriculum/phases.ts`).
- **Validation metric — X followers — has 2 surfaces on every page** (header pill, footer link). The site asks for the follow everywhere.

---

## What we're NOT doing in this refresh (V3 problems)

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
- Author-defined `Chapter.learnedSkills` (derived-from-concept is V2; hand-curated is V3).
- Per-lesson difficulty (1-3 dots).
- Hard prereq locks. Explicit cut — audience-over-completion forbids it.
- Concept-level navigator / search.
- Auth / sync / cross-device progress.
- AI tutor / Copilot panel.
- IA refactor (drop `/learn/v2/` prefix).
- Custom illustration system / tatami background / 3-stripe belt motif.
- Light mode.
- `/settings` route + JSON export/import.

---

**Studio Producer**: CEO
**Review Date**: 2026-05-06
**Implementation handoff**: senior dev, branches `refresh-v2/01-*` through `refresh-v2/07-*`
**Strategic posture**: Punk + receipts. The voice is the moat. The institutional layer is the receipts.
**Vibe**: ship Monday. The phases were always there — render them. The data was always there — surface it. The repo is alive — say so.
