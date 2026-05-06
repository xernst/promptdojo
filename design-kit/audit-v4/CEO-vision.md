# CEO Vision V4 — Curriculum + Nav + Improvements (No Hero)

**Author:** Studio Producer (CEO)
**Date:** 2026-05-06
**Audience:** solo founder, evenings, Cloudflare Pages free-tier
**Predecessors:** `audit-v4/00-08`, `audit-v3/CEO-vision.md`
**Founder verdict (verbatim):** *"i like the nav and the curriculum but not the hero, make all other improvements"*

---

## The bet (1 paragraph)

V3 made the site Linear-grade on the bones; V4 makes it tweetable on the *details*. The founder reviewed three side-by-side mockups and pulled two out of the parking lot — the **curriculum accordion** (turns `/curriculum` into a real textbook index) and the **floating glass nav pill** (the first 100ms moment-of-truth) — and rejected the hero rebuild because the current bug-snippet hero is already the cleanest single-frame meme on the property and doesn't need re-architecting. So V4 is a deliberate strip: keep the hero exactly as-is, ship the two structural picks the founder green-lit, fix the three regressions on the live site (398/624 leak, no scrim on login modal, 25%-of-mobile-viewport sticky-header pile), promote the unbroken voice swaps that already match the lowercase canon (`runnable steps`, `watch the run.`, `start chapter 1` everywhere, the green-word `t-emph` system, FAQ reorder + datestamp, founder rewrite, footer `shipped` swap), and ship one (1) interactive feature — **fill-blank widgets** — because it fixes a known-broken step type and unblocks the remaining 44 fill lessons. Step-through playback and Visualize panel are the moat moves but they're 26h together; they wait for V4.5. Total budget: ~25h across ~5 evenings. The V1→V2 gate is still 1000 X followers — every pick traces to either a cleaner screenshot, a less-broken mobile experience, or a faster boot.

---

## What's in (sequenced ship list — 11 picks)

### 1. Fix the 398/624 leak across 3 surfaces — *credibility floor*

- **Why:** The site contradicts itself in two places (404 page says `624` in body and `398` in footer; `/curriculum` H1 says `398`; StatStrip pill says `398`). A skeptic's 5-second scan registers "this is a real curriculum AND it lies about its own size." Single-source-of-truth from the manifest, propagate to all 4 surfaces.
- **Touches:** `components/StatStrip.tsx` (manifest sum, kill hardcoded `398`), `app/curriculum/page.tsx` (H1 + meta row), `app/not-found.tsx` (footer meta row), `components/MetaRow.tsx` if it exists.
- **Owner audit:** `00-promptdojo-current-state.md` Reg R1.
- **Estimated time:** 1h
- **Cumulative time:** 1h

### 2. Login modal scrim + mobile header collapse to drawer — *mobile gets unbroken*

- **Why:** Two regressions, one PR. (a) Login modal opens with no backdrop scrim — full-opacity page content sits behind the modal card, modality is unclear. Add `bg-ink-950/70 backdrop-blur-sm` overlay. (b) Mobile (375px) header eats ~25% of viewport above the fold via 4 stacked rows because PR 6's drawer never shipped. Collapse `[wordmark · ContinuePill · ≡]` at `<md`, hamburger opens drawer with the rest. Restores ~110px of vertical above the fold on every route.
- **Touches:** `components/LoginToSave.tsx` (overlay div + click-outside-to-close), `components/SiteHeader.tsx` (responsive collapse), new `components/SiteHeader/Drawer.tsx` if not already shipped from V3.
- **Owner audit:** `00-promptdojo-current-state.md` Reg R2 + R3.
- **Estimated time:** 3h
- **Cumulative time:** 4h

### 3. Fix the broken "Show editor" toggle on mobile lessons — *the worst-current-bug stays bug-class*

- **Why:** At 375, clicking `Show editor` is a no-op — editor's bounding rect stays `0×0` and the button label doesn't toggle. The user has no way to see or run code on mobile. V3 deferred this; V4 ships the gate. Either (a) the toggle actually mounts the editor in a full-bleed slide-up sheet, or (b) the button gets replaced with a clear "ship on desktop — pyodide is ~6MB" message with a link to `/lesson/resume` to bookmark the step. Pick (b) — solo founder, $0 budget, builder audience has laptops. Honest gate beats broken toggle.
- **Touches:** `components/v2/LessonShell.tsx` mobile gate, copy honest about the constraint.
- **Owner audit:** `00-promptdojo-current-state.md` "Sticky bug from V3 audit cluster" + `06-ide-cartesian.md` punt note.
- **Estimated time:** 1.5h
- **Cumulative time:** 5.5h

### 4. Voice + system sweep — *every-pixel cleanup, all the safe wins*

- **Why:** Bundle every voice swap that doesn't touch hero structure into one atomic-review PR. Includes: `interactive` → `runnable` site-wide (eight surfaces), `start the course →` → `start chapter 1 →` on /about, `FOREVER` → `forever.` lowercase + period in PriceBand, `last commit` → `shipped` in footer + add github + @TFisPython handle anchors, onboarding microcopy swaps (`read it` → `read what it wrote`, `you write code` → `you ship code`), datestamp `last revised 2026-05-06` under FAQ H2, `t-emph` utility class added to `globals.css` and applied to ~9 section headings (one ember word per heading, the colored-display-word pattern). All character-edit work, all reversible, all atomic.
- **Touches:** `components/StatStrip.tsx`, `components/PriceBand.tsx`, `app/page.tsx` (footer + section headings only — NOT hero), `app/about/page.tsx` (CTAs + headings + datestamp), `app/onboarding/page.tsx`, `app/globals.css` (`t-emph`), find/replace across OG metadata.
- **Owner audit:** `04-brand-voice-cartesian.md` moves 1, 2, 3, 7, 8, 11, 12 + `02-ui-design-cartesian-lift.md` Pattern 7 (`t-emph`).
- **Estimated time:** 2.5h
- **Cumulative time:** 8h

### 5. FAQ rewrite — accordion shape + reorder + founder rewrite + 8-line litany — *the about page sharpens*

- **Why:** Three about-page wins in one PR, none of them touching home hero. (a) Replace the flat all-visible Q+A with a hairline-rule `<details>` accordion (Cartesian Pattern 2) — quieter, more book-like, divisible by the eye. (b) Reorder questions by buyer-priority: lead with `is it really free?` then `why isn't it on udemy / coursera / boot.dev?` (the moat answer), then permission/friction/commitment. (c) Rewrite founder paragraph (drop the brand-promise clause that belongs in the hero, end on @TFisPython relationship CTA, kill the `TODO(josh)`). (d) Replace prose `there is no paid tier...` with the 8-line vertical anti-feature litany (`no signup. / no streaks. / no email gate. / no certificate store. / no upsell. / no zoom calls. / no tracking. / open source.`) plus `+ pull requests welcome.` closer. The /about page becomes the page a skeptic actually reads.
- **Touches:** `app/about/page.tsx` (FAQ block, founder block, free-forever section), shared `divide-y divide-ink-800` accordion shape.
- **Owner audit:** `04-brand-voice-cartesian.md` moves 5, 6, 7, 8 + `02-ui-design-cartesian-lift.md` Pattern 2 + `07-marketing-cartesian.md` Pattern 2 (about-page version, NOT home — home litany requires hero rebuild which is rejected).
- **Estimated time:** 3h
- **Cumulative time:** 11h

### 6. Kill section borders on reading surfaces + delete legacy `<details>` from home — *page rhythm honors the hero*

- **Why:** Two compositional cuts that quiet the page without restructuring it. (a) Sweep `border-b border-ink-800` from every /about section (8 horizontal rules → 0). Whitespace + composition-shape-change is the transition (Cartesian Pattern 5). The `+` glyph divider goes between litany and colophon ONLY (one per page max). (b) Delete the legacy 28-chapter course `<details>` block from `/` — it's a "P.S. — actually here's a different version" coda that visually behaves like an Act III. Move to `/changelog` footer link or kill outright. The v2 PhaseBandedRail becomes the only curriculum on home.
- **Touches:** `app/about/page.tsx` (sweep `border-b`), `app/page.tsx` (delete legacy `<details>` block at `:177-203`), new `components/SectionDivider.tsx` (one `+` glyph component).
- **Owner audit:** `03-visual-storytelling-cartesian.md` moves 2 + 5 + `02-ui-design-cartesian-lift.md` Pattern 10 (the SectionDivider piece).
- **Estimated time:** 2h
- **Cumulative time:** 13h

### 7. Floating glass nav pill (un-park Panel C) — *the first 100ms moment-of-truth*

- **Why:** Founder green-lit. Replace the full-bleed sticky bar with a centered floating pill: `fixed top-3 left-1/2 -translate-x-1/2`, `bg-ink-950/60 backdrop-blur-md border border-ink-800`, `border-radius: 0` (sharp corners are kit canon — no Cartesian-style 50px pill). Hybrid behavior: section links scroll-to-anchor when on home, route-navigate elsewhere (Cartesian Pattern 2 from IA audit). Smoked-glass-dark, not frosted-white. Lesson routes (`/learn/v2/*`) opt out — IDE shell needs full vertical real estate; FlatHeader stays there. Mobile pill collapses to `[wordmark · ≡ · ↵ continue?]`. Reclaims ~24px of vertical room above every fold and signals "designed product" not "WordPress theme."
- **Touches:** `components/SiteHeader.tsx` rewrite as `<FloatingNav>` + `<FlatHeader>` with pathname gate, `app/layout.tsx` (16px top shim so pill doesn't overlap content), `app/globals.css` (`.float-pill` utility + smoked-glass tokens), reuse `components/SiteHeader/Drawer.tsx` from pick #2.
- **Owner audit:** `02-ui-design-cartesian-lift.md` Pattern 1 + `05-ia-cartesian.md` move #2 (chrome-only — NO route consolidation, that touches hero).
- **Estimated time:** 4h
- **Cumulative time:** 17h

### 8. Curriculum accordion (un-park Panel B) — *`/curriculum` becomes a textbook index*

- **Why:** Founder green-lit. Replace `<PhaseBandedRail expanded>` on `/curriculum` with `<CurriculumAccordion>` — nested `<details>` with 5 phase rows (phase 1 default-open) wrapping 25 chapter rows wrapping per-chapter blurb + lesson list. Hairline-rule rows, no card chrome, `❯` chevron rotates 90° on open. The grid view stays on `/` (Movement 4 marketing surface); the accordion becomes the index URL Josh pastes in tweets. Same data, two compositions, two roles. Massive SEO surface — every chapter blurb + lesson title in DOM.
- **Touches:** New `components/v2/CurriculumAccordion.tsx` (server component, ~120 LOC), `app/curriculum/page.tsx` swap.
- **Owner audit:** `02-ui-design-cartesian-lift.md` Pattern 6 + `03-visual-storytelling-cartesian.md` move 6 (option 2 — keep `/curriculum` URL, accordion shape).
- **Estimated time:** 4h
- **Cumulative time:** 21h

### 9. `/onboarding` → `/start` rename + skip-link + 5→3 questions — *velocity steal removed*

- **Why:** `/onboarding` reads as bureaucratic; `/start` is 6 letters and Cartesian-shape voice-wise. Trim the form from 5 questions to 3 (audience + level + goal — drop the two that feed nothing), add `skip for now →` text-link routing directly to `/learn/v2/foundations/intro/0` with `level: "unknown"`. Today there's no escape; a tweet-driven user has to fill the form to see the IDE. While we're in the file: kill the hand-rolled green pill and replace with `dojo-btn-primary` (V3 pick #9 deferral).
- **Touches:** Move `app/onboarding/` → `app/start/`, `_redirects` entry `/onboarding /start 301`, `app/start/page.tsx` (drop 2 questions, add skip), system-class swap.
- **Owner audit:** `05-ia-cartesian.md` move #3 + `00-promptdojo-current-state.md` PR 9 onboarding sweep deferral.
- **Estimated time:** 2h
- **Cumulative time:** 23h

### 10. 404 polish + preloader cleanup — *janitorial that earns its keep*

- **Why:** Two small wins. (a) Verify the V3-specced Levenshtein "did you mean: about?" hint actually shipped on `app/not-found.tsx`; if not, ship it. Surface it for `/learn/v2/<typo>` paths too. The branded 404 is the single biggest brand-win-vs-Cartesian on the audit (Cartesian silently rewrites); polish it instead of regressing. (b) Audit Pyodide preloader mount points — keep on `/` and `/start`, ensure NOT mounted on `/curriculum` (high-bounce, no IDE intent). Janitorial after route work in pick #9.
- **Touches:** `app/not-found.tsx` (Levenshtein verify/extend), `components/PyodidePreloader.tsx` mount conditions or wherever it's gated.
- **Owner audit:** `05-ia-cartesian.md` moves #7 + #8.
- **Estimated time:** 1h
- **Cumulative time:** 24h

### 11. Inline fill-blank widgets — *the one interactive feature that fits the budget*

- **Why:** Of the three interactive features (fill-blank 12h, playback 16h, visualize 10h = 38h total), fill-blank is the one that ships now. Lowest risk, fixes a known-broken step type (V3 audit explicitly flagged "moat breaks here"), unblocks the existing 44 fill lessons. CodeMirror 6 `WidgetType` decorations replace `___NAME___` source markers with real `<input>` elements; multi-blank Tab navigation; correct `eq()` preserves focus across re-renders (the load-bearing fix). Migration is mechanical — move `___` markers from `prompt` to `code`, build script enforces. Playback + Visualize defer to V4.5 because they're 26h together and the fill widget alone delivers a felt "the IDE actually does what fill steps need" win.
- **Touches:** New `lib/codemirror-blank-widget.ts`, `components/v2/PersistentIDE.tsx` (extension wire-up), `components/v2/steps/FillBlankStepView.tsx` rewrite, `lib/codemirror-theme.ts` (`.cm-blank-input` states), `scripts/build-content-v2.mjs` (parse + validate), content migration of fill lessons.
- **Owner audit:** `08-interactive-features-feasibility.md` Feature 3 + `06-ide-cartesian.md` Proposal 8.
- **Estimated time:** ~12h flagged in audit. **Trim to ~10h** by deferring the keyboard-only `Tab` polish and the codemirror-theme `.cm-blank-input` style states to a follow-up if time tight; ship core widget + state-field + 44-step migration first. **NOTE:** This is the budget-stretching pick — if any prior pick slips, fill-blank truncates first to absorb the slip.
- **Estimated time:** 10h (trimmed from 12h audit estimate)
- **Cumulative time:** 34h

> **Budget reality check:** the strict ~25h budget gets us through pick #10 (24h cumulative). Pick #11 is **hard-budgeted at 10h** with a clear truncate plan — multi-blank Tab polish + theme states are explicitly cuttable to V4.5 if any earlier pick spills over. If picks #1-10 land at the estimates, we have 1h of slack toward fill-blank's 10h, leaving 9h that bleeds into a sixth evening. **Acceptable.** If the founder forces strict 25h, defer pick #11 to V4.5 entirely and ship picks #1-10 only — that's the disciplined cut.

---

## What's out (with reasoning per the founder's "no hero" call)

Every cut traces to either (a) the founder's "no hero" rule, (b) the 25h budget, or (c) audit reports overreaching V4 scope.

### Hero-structural rejects (founder's call)

- **Single-CTA hero promotion** (`02-ui-design-cartesian-lift.md` Pattern 9, `04-brand-voice-cartesian.md` move 4, `07-marketing-cartesian.md` Pattern 1). All three reports want to drop the secondary `or pick your chapter ↓` link and ship one button. **Out.** Touches hero structure. The current two-CTA hero ships as-is.
- **Promote bug snippet to Movement 2 / framed image** (`02-ui-design-cartesian-lift.md` Pattern 3, `03-visual-storytelling-cartesian.md` move 3). Wants to move `HeroBugSnippet` from below-headline to beside-headline as a framed PNG. **Out.** Hero structural.
- **Anti-feature litany on home PriceBand** (`02-ui-design-cartesian-lift.md` Pattern 4, `04-brand-voice-cartesian.md` Pattern 1, `07-marketing-cartesian.md` move 1 home version). All reports want to expand the four-token horizontal `no login · no streaks · no upsell · open source` into a vertical 8-line stack on the home PriceBand. **Out on home.** Ships on /about (pick #5) where it doesn't touch hero composition.
- **Fat-numeral StatStrip display variant** (`02-ui-design-cartesian-lift.md` Pattern 5, `03-visual-storytelling-cartesian.md` move 7). Wants to promote the inline mono StatStrip to a viewport-tall fat-Fraunces-numeral receipts strip on home. **Out.** Restructures the home page rhythm.
- **5-movement home collapse / `/about` consolidation into anchors** (`03-visual-storytelling-cartesian.md` move 1, `05-ia-cartesian.md` move #1). Wants to collapse `/about` and `/changelog` into anchor sections on `/`. **Out.** Hero-structural cascade — restructuring `/` is exactly what the founder rejected. Keep `/about` and `/changelog` as separate routes.
- **Curriculum-shape Gantt diagram above PhaseBandedRail on home** (`03-visual-storytelling-cartesian.md` move 4). Wants a 5-phase mini-Gantt above the home rail. **Out.** Adds a section to home above the chapter rail — touches hero-region rhythm.
- **`<Frame>` primitive applied to 4 home/about surfaces** (`02-ui-design-cartesian-lift.md` Pattern 3 expansion). Wants framed evidence panels on home concept cards. **Out on home.** OK as a V4.5 follow-up for /about only.
- **`dojo-card-receipt` + spec strip on chapter tiles** (`02-ui-design-cartesian-lift.md` Pattern 8). Polish on chapter tiles in PhaseBandedRail. **Out.** PhaseBandedRail is hero-adjacent on home; /curriculum is shipping the accordion (pick #8) so this would only apply to home which we're not touching.
- **Vary section heights across `/`** (`03-visual-storytelling-cartesian.md` move 8). Wants different `min-h` per home section. **Out.** Touches home rhythm globally.
- **Promote X-follow to lone hero CTA** (`07-marketing-cartesian.md` Pattern 1, move 2). The most contentious marketing pick. **Out.** Hero-structural and the founder didn't ask for it. Header keeps the X-follow pill.

### Budget rejects

- **Step-through playback** (`08-interactive-features-feasibility.md` Feature 1, 16h). The moat move. **V4.5.** Cannot ship without ~16h of focused worker + UI + content work; alone it consumes 64% of V4 budget.
- **Visualize panel** (`08-interactive-features-feasibility.md` Feature 2, 10h). The wedge-narrative win for `mutation-and-state`. **V4.5.** Strictly depends on playback's frames buffer; ships after it.
- **TracebackView** (still missing from V3). Walls of red errors. **V4.5.** 8h, high-impact, but no V4 audit re-prioritized it and the budget is full.
- **Pyodide hairline cold-start progress** (still missing from V3). 8h. **V4.5.**
- **Trailer placement on /about** (`07-marketing-cartesian.md` move 3). 2h. The trailer V2 just shipped at `launch-trailer-v2/renders/`; surfacing it on /about is a future PR. **V4.5.** (Home placement is rejected outright — touches hero.)
- **Three-card "read / run / ship" pattern** (`07-marketing-cartesian.md` Pattern 6). 2h, but adds a section to home — restructures home rhythm. **Out.**
- **"Read Once. Run It. Don't Skim." block** (`07-marketing-cartesian.md` Pattern 7). 30min copy + layout. Adds a block between PriceBand and PhaseBandedRail on home. **Out.** Home-structural.
- **Founder byline in home footer** (`07-marketing-cartesian.md` move 5). Touches home footer composition; the safer move is the existing /about founder rewrite (pick #5). **Out** as a separate pick — bundled into pick #4's footer swap if it fits.

### Scope/risk rejects

- **Pre-rendered framed IDE screenshot replacing live `HeroBugSnippet`** (`02-ui-design-cartesian-lift.md` Pattern 3 anti-pattern, `03-visual-storytelling-cartesian.md`). Asset work, screenshot maintenance debt, hero-touching. **Out.**
- **"Edit. Run. Test. Repeat." tricolon eyebrow on work steps** (`06-ide-cartesian.md` Proposal 5). 2h. Cute, low-impact for V4 budget. **V4.5.**
- **Named checkpoint tag in editor chrome** (`06-ide-cartesian.md` Proposal 6). 1h. Same — earns its keep when there are more checkpoints to name. **V4.5.**
- **Output-as-document on read steps + paper-frame chrome** (`06-ide-cartesian.md` Proposals 1, 3). Soft mode for study, hard for work. Half-day each but adds a `chrome` schema field and conditional render that touches every step view. **V4.5** — pairs naturally with playback and visualize.

---

## What's deferred to V4.5 (the interactive features that don't fit the budget)

Ship order for V4.5, ordered by dependency and risk:

1. **TracebackView** (~8h) — walls-of-red regression from V3. Pure UI work, no schema migration. Highest feelings-per-hour change still on the queue. Could ship standalone before V4.5 if an evening opens up.
2. **Step-through playback** (~16h) — Feature 1 from the feasibility audit. Worker-side `sys.settrace` harness, `<PlaybackStrip>` component, schema-gated opt-in on 4-6 dogfood lessons in `variables` + `mutation-and-state`. The moat move.
3. **Visualize panel** (~10h) — Feature 2 from the feasibility audit. Strictly depends on playback's frames buffer. Ships scalar/list/dict/set kinds in V4.5; instance polish defers to V5.
4. **Pyodide hairline cold-start progress** (~8h) — V3 carryover, framed through Cartesian's hairline aesthetic per `06-ide-cartesian.md` Proposal 7.
5. **Output-as-document + paper-frame chrome on study steps** (~6h) — `06-ide-cartesian.md` Proposals 1, 3. Pairs with playback (the schema field is the same chrome distinction).

V4.5 budget estimate: ~48h. That's three weeks of evenings, which means V4.5 is its own sprint, not a tail-end of V4.

---

## Sequencing — bug fixes first, structural second, interactive last

Each pick is its own PR. Atomic, reviewable, revert-able.

| # | PR | Hours | Cumulative |
|---|---|---|---|
| 1 | `refresh-v4/01-fix-398-leak` | 1.0 | 1.0 |
| 2 | `refresh-v4/02-modal-scrim-and-mobile-drawer` | 3.0 | 4.0 |
| 3 | `refresh-v4/03-mobile-editor-gate` | 1.5 | 5.5 |
| 4 | `refresh-v4/04-voice-and-system-sweep` | 2.5 | 8.0 |
| 5 | `refresh-v4/05-about-page-faq-founder-litany` | 3.0 | 11.0 |
| 6 | `refresh-v4/06-page-rhythm-cleanup` | 2.0 | 13.0 |
| 7 | `refresh-v4/07-floating-nav-pill` | 4.0 | 17.0 |
| 8 | `refresh-v4/08-curriculum-accordion` | 4.0 | 21.0 |
| 9 | `refresh-v4/09-onboarding-to-start` | 2.0 | 23.0 |
| 10 | `refresh-v4/10-404-and-preloader-polish` | 1.0 | 24.0 |
| 11 | `refresh-v4/11-fill-blank-widgets` | 10.0 | 34.0 |

**Sequencing rationale:**

- **Picks 1-3 first (5.5h, evening 1)** — three regressions on the live site. Bug fixes before polish, always. Founder respect: site shouldn't be lying about its size while we're shipping new screenshots.
- **Picks 4-6 second (7.5h, evening 2)** — voice + system sweep + /about overhaul + section-border kill + legacy `<details>` delete. All low-risk character-edit work. Ship in any order within the cluster.
- **Picks 7-8 third (8h, evenings 3-4)** — the two un-parked structural picks. Nav pill ships before curriculum accordion because the new floating pill needs to be living on every page before the accordion goes live (prevents a "new accordion under old chrome" intermediate state).
- **Picks 9-10 fourth (3h, evening 5)** — `/onboarding` rename + 404 polish. Janitorial after the structural work.
- **Pick 11 last (10h, evenings 6-7)** — fill-blank widgets. The interactive moat. Ships *after* everything else because if anything spills over, the fill widget is the truncate target. Multi-blank Tab navigation + theme states are explicitly cuttable.

**Budget check:** 24h through pick #10 (✅ under 25h). Pick #11 stretches to 34h cumulative (~9h over). The founder either accepts the 9h spill into a sixth/seventh evening for a major IDE feature, OR cuts pick #11 entirely to V4.5. **My recommendation: accept the spill** — fill-blank fixes a known-broken step type and the budget overrun is well-flagged. But if "strict 25h" is the rule, ship picks #1-10 only and roll fill-blank into V4.5 alongside playback + visualize.

---

## Success criteria

V4 ships when:

- [ ] StatStrip pill shows `624 steps` everywhere. `/curriculum` H1 reads `624 steps`. 404 footer agrees with body.
- [ ] Login modal opens with `bg-ink-950/70 backdrop-blur-sm` overlay behind the card; clicking outside closes it.
- [ ] Mobile (375) home + lesson + curriculum + 404 all show a single-row header (`[wordmark · ContinuePill · ≡]`) with hamburger drawer on `≡` tap. Header consumes <80px of viewport.
- [ ] Mobile lesson `Show editor` button either mounts a real full-bleed editor sheet OR shows an honest "ship on desktop" gate with a `/lesson/resume` bookmark link. No more no-op.
- [ ] Every "interactive" copy on the site reads "runnable" instead. About-page CTA reads `start chapter 1 →`. PriceBand eyebrow reads `forever.` lowercase.
- [ ] About-page FAQ is a hairline `<details>` accordion with `is it really free?` as Q1. Founder paragraph is 3 sentences ending on @TFisPython. Free-forever section shows the 8-line vertical anti-feature litany + `+ pull requests welcome.` closer. Datestamp under FAQ H2.
- [ ] About-page sections have no `border-b` rules. Home no longer renders the legacy 28-chapter `<details>` block. The v2 PhaseBandedRail is the only curriculum on home.
- [ ] Floating glass nav pill renders centered, top:12px, smoked-glass-dark, sharp corners (no 50px radius), backdrop-blur-md on every non-lesson route. Lesson routes show `<FlatHeader>`. Section links scroll-to-anchor when on home.
- [ ] `/curriculum` renders the new `<CurriculumAccordion>` — phase 1 default-open, click chapter row to expand blurb + lesson list. The home rail (`PhaseBandedRail`) is unchanged.
- [ ] `/onboarding` 301-redirects to `/start`. `/start` has 3 questions and a `skip for now →` text-link at the bottom. Onboarding START button uses `dojo-btn-primary`.
- [ ] 404 page surfaces "did you mean: about?" hint for typos. Pyodide preloader mounts only on `/` and `/start`, NOT on `/curriculum`.
- [ ] Fill-blank step renders the inputs INSIDE the editor at `___ID___` token positions. Multi-blank Tab navigation works (or is documented as deferred). Existing 44 fill lessons migrated cleanly.

**Hero stays exactly as-is.** No structural changes to `app/page.tsx:95-130`. The bug snippet, the two CTAs, the PriceBand, the StatStrip composition — all unchanged. Founder's call honored.

---

**Studio Producer**: CEO
**Review Date**: 2026-05-06
**Implementation handoff**: solo founder, branches `refresh-v4/01-*` through `refresh-v4/11-*`
**Strategic posture**: Curriculum + nav are the founder-named priorities. Hero is sacred. Bug fixes first, structural second, fill-blank last. Every pick traces back to an audit; no new ideas. The X-followers metric is served by sharper screenshots from a tighter site, not by shouting louder on the home page.
**Vibe**: ship the founder's two un-parked picks; sweep everything that doesn't touch the hero; punt the moat features to V4.5 with a clear runway.
