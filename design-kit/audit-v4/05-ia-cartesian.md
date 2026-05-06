# UX Architecture V4 — IA lift from Cartesian

**Auditor:** ArchitectUX (V4 IA Lead)
**Date:** 2026-05-06
**Scope:** Information architecture, navigation surfaces, and interaction patterns Cartesian does well that Promptdojo could (and shouldn't) adopt.
**Builds on:** `audit-v3/04-navigation-system.md` (the nav spine that shipped — sticky header, `/curriculum`, `/lesson/resume`, mobile drawer, 4-node breadcrumb, branded 404). `audit-v3/05-ia-architecture.md` (V2/V3 URL verdict). `audit-v4/01-cartesian-walkthrough.md` (Cartesian patterns).
**Bias:** simpler IA wins. Promptdojo's surface count is already low; the question is whether it can go lower without losing the IDE.

---

## The IA thesis

**Cartesian is a sales letter. Promptdojo is a school.** That's the load-bearing distinction that decides every IA question below.

A sales letter has one job: convert a curious reader to a $35 buyer. It optimizes for **scroll-depth-as-engagement** — the longer you stay on the page, the more pricing, FAQ, and TOC you read, the more likely you are to buy. Single-page IA is correct for sales letters because the page IS the funnel; every section is a funnel stage; bouncing between routes resets the conversion arc.

A school has a different job: get a curious reader from "what's this?" to "I just shipped a Python script" inside an IDE. The IDE cannot live on a single-page sales letter — it needs its own URL (for sharing a step), its own chrome (sidebar + breadcrumb + prev/next), its own keyboard surface (`⌘↵` run, `⇧↵` advance), and its own off-ramp (resume from anywhere). The IDE is the product; the marketing page is the lobby.

So the question is **never** "should Promptdojo become single-page like Cartesian?" — that collapses the school into a brochure. The question is: **which of Promptdojo's marketing surfaces should consolidate**, and **which Cartesian patterns translate to a school's lobby** without leaking into the IDE.

The IA thesis in one line: **Promptdojo keeps a multi-route shape because the IDE demands it, but the marketing surfaces (`/`, `/about`, `/changelog`) should consolidate into a Cartesian-shaped sales letter on `/`, with `/about` and `/changelog` becoming anchor sections of `/` rather than full routes.** The IDE keeps its own URL space (`/learn/v2/...`) and its own chrome. The lobby gets simpler; the school stays a school.

---

## Single-page vs multi-route — decisive recommendation

**Recommendation: hybrid. Consolidate `/about` and `/changelog` into anchor sections on `/`. Keep `/curriculum`, `/lesson/resume`, `/onboarding`, `/learn/v2/*`, and `/not-found` as real routes. Net change: 5 routes → 4 routes (or 5 with `/start` rename). Add 3 anchor sections to home: `#what-is-this`, `#curriculum`, `#changelog`.**

### What goes single-page (collapses to anchors on `/`)

| Today's route | Becomes | Why |
| --- | --- | --- |
| `/about` | `/#what-is-this` (anchor section on home) | About is currently 90% on-brand prose narrating the curriculum's 5-phase spine. It has zero content that requires its own URL. Per Cartesian Pattern 7 (TOC accordion as syllabus), the about narrative IS the syllabus framing; folding it into home turns the home page from "info card + chapter rail" into "info card + framing prose + chapter rail" — the Cartesian shape. |
| `/changelog` | `/#changelog` (anchor section on home, with "see full history →" link to a deep route if it grows past ~10 entries) | Changelog is currently a single static `<p>` page with one `← home` link. It's a 12-line file. It's not a route; it's a footnote. Per Cartesian's "Updated May 8, 2025" microcopy pattern, the changelog can live as a small `last shipped: 2026-05-06 · see what changed` block at the foot of home. |
| Home hero "what is this?" header link → `/about` | Same link, but `href="#what-is-this"` (smooth-scroll) | Inverts a route navigation into a scroll. Cartesian-shaped. |

### What stays multi-route (keep these)

- **`/`** — home / sales letter / lobby. Now carries the about + changelog content as anchor sections. This is the page Josh pastes in tweets when he's pitching the school.
- **`/curriculum`** — the canonical "see the whole course" URL (shipped V3). This is what Josh pastes in tweets when he's pitching the syllabus. Different intent from `/`, different OG card, different audience moment. Cartesian doesn't have an equivalent because Cartesian's TOC IS its sales-letter centerpiece; Promptdojo's hero is the bug snippet, not the TOC, so the TOC needs its own URL.
- **`/learn/v2/[chapter]/[lesson]/[stepIndex]/`** — the IDE. Cannot single-page. Has to be deep-linkable (a learner shares a specific step, an X reply links to a specific exercise). The IDE owns the bottom 80% of all session time; collapsing it is unthinkable.
- **`/lesson/resume`** — the stable continue link (shipped V3). Type-from-memory URL. Cartesian doesn't have one because Cartesian doesn't have user state; Promptdojo does.
- **`/onboarding`** — kept as a route (see "Onboarding" section below for the keep/kill/merge decision).
- **`/not-found`** — branded 404 (shipped V3). Cartesian silently rewrites; Promptdojo should not regress to that.

### The honest count

Today: `/`, `/about`, `/changelog`, `/curriculum`, `/onboarding`, `/learn/v2/*`, `/lesson/resume`, `/not-found` = **8 distinct route patterns** (treating learn as one).

After this proposal: `/`, `/curriculum`, `/onboarding`, `/learn/v2/*`, `/lesson/resume`, `/not-found` = **6 distinct route patterns** (a 25% reduction).

The reduction is small but **load-bearing for tweet-paste posture**. Today, three URLs (`/`, `/about`, `/changelog`) compete for "this is what Promptdojo is." After, one URL (`/`) carries all three jobs and `/curriculum` carries the syllabus job — clean two-URL story.

### Pros / cons of full single-page consolidation (the more aggressive cut, NOT recommended)

| Pro of going full-Cartesian (kill `/curriculum` too) | Con of going full-Cartesian |
| --- | --- |
| One URL to remember | `/curriculum` is the most indexable, SEO-promising page on the site — it's 25 chapter slugs in the DOM. Folding it into home means home gets long, scroll-jacked, and the curriculum content competes with the hero. |
| Cartesian-shape parity | Home becomes a 5+ viewport-tall scroll with hero → about → curriculum → FAQ → footer. Mobile scroll fatigue. |
| One canonical share URL | "I started this Python school" tweet can no longer link to a clean `/curriculum` URL that shows just the syllabus. |

**My call: do NOT go full-Cartesian. Keep `/curriculum` as a route.** The two-URL story (`/` for the pitch, `/curriculum` for the syllabus) is cleaner than the one-URL story when half the audience comes from a tweet that says "look at this curriculum →".

---

## Floating nav + anchor system — proposal

Cartesian's nav is a single floating glass pill with 3 elements (book icon, FAQs anchor, Purchase anchor). It's anchor-based because Cartesian is single-page. Promptdojo's nav is a sticky `<header>` with section links + continue pill + GitHub pill + X pill (shipped V3). The question is whether Promptdojo's nav can borrow the **glass pill aesthetic** + **hybrid anchor/route behavior** without losing what V3 added.

### Component spec — `<FloatingNavPill>` (proposed V4 component)

**Purpose:** replace the current `<SiteHeader>` (full-width sticky bar with `border-b`) with a centered, floating, glass-blurred pill that hovers over the page and contains the same elements at half the visual weight.

**Mounting:** `app/layout.tsx`, replaces current `<SiteHeader>`. Same data dependencies (`pathname`, `lastVisitedV2`, `streak`).

**Visible structure (left → right, desktop ≥ 768px):**

| Slot | Element | Behavior | Anchor or route? |
| --- | --- | --- | --- |
| 1 | `pyloft` wordmark (or book-icon equivalent) | `→ /` if not on home; `→ #top` smooth-scroll if on home | **Hybrid** — same affordance, different behavior per page |
| 2 | `what is this?` | `→ /#what-is-this` if not on home; `#what-is-this` scroll if on home | **Hybrid** |
| 3 | `the curriculum` | `→ /curriculum` always (real route) | **Route** |
| 4 | `changelog` | `→ /#changelog` if not on home; scroll if on home | **Hybrid** |
| 5 | (spacer) | — | — |
| 6 | `↵ continue · ch 03 · step 4/9` (when applicable) | `→ /lesson/resume` | **Route** |
| 7 | `★ N` GitHub pill | external | external |
| 8 | `@TFisPython` X pill | external | external |

**Visual properties (lifting Cartesian Pattern 2):**

- Position: `fixed; top: 12px; left: 50%; transform: translateX(-50%);`
- Width: `min(1080px, calc(100vw - 32px))`. Centered.
- Height: `48px` (slightly taller than Cartesian's ~32px because Promptdojo has more elements).
- Background: `rgba(<ink-950 channel>, 0.6)` + `backdrop-filter: blur(12px) saturate(1.2)`. Not white-glass like Cartesian — Promptdojo is dark-mode-default, so the glass is **smoked glass**, not frosted.
- Border: `1px solid rgba(<green-500>, 0.15)` — barely-there green-tinted hairline.
- Border-radius: `24px` (pill — but less radical than Cartesian's `50px`; Promptdojo's lowercase voice doesn't want full-pill).
- Box-shadow: `0 8px 32px rgba(0,0,0,0.4)` — soft floating.
- Z-index: `60`.

**Hybrid anchor/route behavior (the load-bearing design):**

```
On click of "what is this?":
  if (pathname === "/") {
    e.preventDefault();
    document.getElementById("what-is-this").scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", "/#what-is-this");
  } else {
    // default <Link href="/#what-is-this"> route navigation
  }
```

This pattern (Pattern 2 in the Cartesian walkthrough) is what makes Cartesian's nav feel native: clicking "Pricing" never reloads the page when you're already on Cartesian. Promptdojo's home page links should never reload when the destination is on the same page. This is **a UX delta**, not just an aesthetic delta.

**State-aware rendering (carry over from V3 spec):**

| State | Pill renders |
| --- | --- |
| Home (`/`) | All 8 slots; section links scroll-to-anchor; continue pill if `lastVisitedV2` |
| Curriculum (`/curriculum`) | All 8 slots; section links route to `/#anchor`; continue pill if applicable |
| Onboarding (`/onboarding`) | **Wordmark only** (focused flow — Cartesian doesn't dim, but Cartesian doesn't have onboarding) |
| Lesson (`/learn/v2/*`) | Slim variant — wordmark + breadcrumb (replaces section links) + streak + GitHub. **No continue pill** (you ARE in a lesson) |
| 404 (`/not-found`) | All 8 slots; treats as if on `/` for anchor links (route navigation) |

**Mobile (< 768px):**

- Pill collapses to: `wordmark · ≡ hamburger · ↵ continue (if applicable)`
- Hamburger opens a full-screen drawer (already specced in V3 §1c) with the section list + chapter switcher + GitHub/X.
- The pill stays floating top, doesn't fade on scroll (Cartesian fades; Promptdojo should not — beginners need persistent escape).

**Keyboard:**

- `⌘K` — opens search palette (V3 deferred to V3.5 — not in V4 scope).
- `↵` (no input focused) — fires Continue pill if visible. Already V3.
- `Esc` — closes drawer / modal.

**Files affected:**

- `components/SiteHeader.tsx` — rewrite as `<FloatingNavPill>` (~180 lines, currently ~150).
- `components/SiteHeader/Drawer.tsx` — minor tweaks for new pill mount point.
- `app/page.tsx` — add `id="what-is-this"`, `id="curriculum-preview"`, `id="changelog"` on the new anchor sections.
- `app/about/page.tsx` — **delete** (content moves to home anchor section).
- `app/changelog/page.tsx` — **delete** (content moves to home anchor section, optionally keep `/changelog` as a redirect to `/#changelog` for any in-the-wild links).
- `app/globals.css` — add `.float-pill` utility, smoked-glass blur recipe, scroll-margin-top on anchor targets.

**What NOT to lift from Cartesian's nav:**

1. **The 50px full-pill radius** — too round for Promptdojo's lowercase voice. Use 24px.
2. **The white-frosted glass** — Promptdojo is dark-mode-default; frosted-white reads as "marketing site," smoked-dark reads as "developer tool."
3. **The shrink-on-scroll behavior** — Cartesian's pill fades opacity on scroll; Promptdojo's pill should stay visible (the continue pill is too load-bearing to fade).
4. **The Boxicons book icon** — Promptdojo has its own wordmark identity; don't import an icon library for one glyph.
5. **The single primary CTA in the nav** — Cartesian has `[Purchase]` as the lone bright pill. Promptdojo's equivalent is `[↵ continue]`, but it's conditional (only renders for returning users). For first-visit users, there's no equivalent CTA in the nav (correct — the hero CTA is `[install pyloft]` or whatever Phase 4 lands on).

---

## Onboarding — keep, kill, or merge into /about?

**Recommendation: keep `/onboarding` as its own route, but rename to `/start` and trim its scope. Do NOT merge into `/about`.**

### Why Cartesian doesn't have onboarding

Cartesian's user journey is: read → click `[Purchase $35]` → checkout → download `.dmg` → open app. There is **nothing** to onboard because the product is a downloadable book; preferences are set in the app, not the website. The website's job ends at the purchase button.

Promptdojo's product is a **stateful, browser-based learning app**. The onboarding step (`/onboarding/page.tsx` — the 5-question profile capture) feeds the recommendation engine that decides:

1. Which chapter the user starts on (a beginner starts at ch01; a "I know Python, want to vibe-code with Claude" user starts at ch13).
2. The voice register of the lesson copy (toned-down vs. punk).
3. Whether the IDE shows the "press ⌘↵ to run" hint or assumes you know.
4. The default tone of error-handling copy.

This is **product-load-bearing personalization**, not a marketing dark pattern. Killing it would cost real product value. Per Josh's memory `feedback_validation_metrics`, Promptdojo's success metric is X-followers (audience growth), not user finishers — but personalization is what makes the SHOWN screenshots good ("look how it remembers I'm a vibe-coder").

### Why it shouldn't merge into `/about`

`/about` is a marketing surface (currently a route, proposed-above to fold into home). `/onboarding` is a product surface (the first step of using the product). Merging them would:

1. **Break the "lobby vs. school" distinction** that the IA thesis depends on. The lobby is browseable, scrollable, scannable. The school requires committed input (`Enter your name. Pick your level. Confirm.`) — that's a different mode entirely.
2. **Force `/about` to handle stateful form input** — currently `/about` is static prose. Adding a 5-question form to a marketing page kills the page's SEO clarity and adds JS bloat.
3. **Be a slowdown for first-time visitors** who land on home from a tweet — they want to see the bug snippet + chapter rail first, not a form gate.

### Why it should be a real route (not embedded in home)

The current `/onboarding` is correct: it's an **interstitial**, mounted between home and the IDE. A first-time user lands on `/`, sees the hero, scrolls the chapter rail, picks chapter 1, gets routed to `/onboarding` (5 questions, 90 seconds), then routed to `/learn/v2/foundations/...`. This is **the right shape** — the form lives where it belongs, the lobby stays browseable, the school stays committed.

### What changes in V4

1. **Rename `/onboarding` → `/start`** (V3 cut as P3; promote to V4 — Cartesian's `Purchase` button is 8 letters, `/start` is 6 letters, `/onboarding` is 11 letters and reads as bureaucratic). Static `_redirects` from old to new.
2. **Trim from 5 questions to 3 questions.** Audit which 5 questions feed which downstream personalization decision. Per Cartesian's "Who is this for?" pattern (4 audiences in 4 sentences), the onboarding form should produce `audience` + `level` + `goal` — three decisions, three questions. The other two questions (something about preferred IDE? something about prior bootcamp experience?) probably feed nothing or feed something that could read from defaults.
3. **Keep the hide-the-nav behavior** (V3 spec §1d — onboarding dims the header to wordmark-only). Cartesian-style focused flow.
4. **Add a "skip for now →" affordance** at the bottom of `/start` that routes directly to `/learn/v2/foundations/intro/0` with `level: "unknown"`. Today there's no escape hatch; a user who wants to just see the IDE has to fill the form. **This is a velocity steal that V4 fixes.**

### The "does it add value or steal velocity?" verdict

**It adds value AND steals velocity. Both are true. The fix is to make it skippable, not to kill it.** The personalization is real product value (it changes what the user sees in the lesson). The velocity steal is real (a tweet-driven user wants to see the IDE in 1 click, not 6). The skip-link compromise is the correct V4 move.

---

## Mobile IA collapse strategy

Cartesian's mobile (`cartesian-pricing-mobile.png` referenced in walkthrough) collapses cleanly because it's single-page: the same hero + features + TOC + pricing + FAQ stack vertically with no nav reorg needed. The floating pill stays floating, the hamburger doesn't even render (the pill IS the nav).

Promptdojo's mobile has **three different IAs that need to collapse differently** depending on which route the user is on. V3 specced the mobile drawer; V4 needs to specify the collapse behavior per-route.

### Mobile IA per-route (V4 spec)

| Route | Pill behavior | Drawer behavior | Section link behavior |
|---|---|---|---|
| `/` (home) | Pill collapses to `[wordmark · ≡ · ↵ continue?]` | Hamburger opens full-screen drawer with: section anchors (`what is this`, `the curriculum`, `changelog`) → tap scrolls to anchor on home and closes drawer | All section links are anchor-scrolls (no route nav from drawer when on home) |
| `/curriculum` | Same pill | Drawer shows: `← home` + phase filter chips (`foundations`, `real python`, etc.) + the same section anchors as home (`what is this`, `changelog`) | Section anchors route to `/#anchor`; phase chips smooth-scroll within `/curriculum` |
| `/onboarding` (`/start` after rename) | Wordmark only — no hamburger | No drawer | n/a |
| `/learn/v2/*` (lesson) | Slim pill: `[wordmark · breadcrumb-truncated · ≡]`. Continue pill HIDDEN (you're in a lesson) | Drawer shows: phase-banded chapter switcher (replaces the desktop sidebar, V3 spec §1c) + `← home` + `the curriculum →` | Tap chapter → routes to chapter overview; tap step → routes to step |
| `/lesson/resume` | Brief flash, redirects | n/a | n/a |
| `/not-found` | Same as `/` | Same as `/` | Same as `/` |

### The Cartesian pattern that DOES translate: pill stays glass, doesn't become a bar

Most sites collapse a floating pill to a full-width sticky bar on mobile (because pill + hamburger + content squeeze gets tight). Cartesian keeps the pill at small viewports (`cartesian-faqs-1920.png` shows the pill behavior is consistent at narrow widths). **Promptdojo should do the same** — the floating pill is a recognizable signature; converting to a flat bar at 768px loses the brand mark.

**Implementation note:** at 375px, the pill becomes `[wordmark · ≡ · ↵]` — wordmark abbreviates to its first character or icon, hamburger opens drawer, continue pill compresses to just the `↵` symbol with the lesson name in `aria-label`. Keep the pill shape; sacrifice text labels.

### What collapses, what doesn't (mobile-only behaviors)

**Collapses (mobile-specific):**

1. The "section nav" (4 text links: home/curriculum/about/changelog) collapses into the hamburger.
2. The continue pill compresses to just `↵` symbol.
3. The streak pill hides below 480px (low signal, low pixel budget).
4. The breadcrumb (in lesson chrome) truncates phase + lesson, shows only `ch › step` (V3 spec §3 mobile rule).

**Does NOT collapse (always visible regardless of viewport):**

1. The wordmark (always tappable to home).
2. The hamburger (the only escape on mobile lessons).
3. The `↵` continue affordance when applicable (load-bearing for returning users).
4. The skip-link (a11y baseline; V3 shipped).

### The 375px stress-test scenario

A user on a 375px iPhone, scrolled deep into chapter 9 lesson 3 step 5, wants to:

1. Switch to chapter 12 → tap `≡` → drawer opens → tap "ch 12" → routes. **3 taps.** Today: impossible (sidebar `hidden lg:flex` regression — V3 fixed this with `md:` + drawer).
2. Get back to home → tap wordmark in pill. **1 tap.** Today: wordmark only in sidebar (hidden on mobile) — escape was via browser back. V3 fixed this.
3. Resume next session → tap `↵` in pill → routes to `/lesson/resume` → routes to deep step. **1 tap.** Today: only available on `/`. V3 fixed this.
4. See the curriculum page → tap `≡` → drawer → tap "the curriculum →" → routes. **3 taps.** Today: no route. V3 added.

V4's mobile job is mostly to **maintain the V3 wins** under the new floating pill chrome — not to redesign the mobile IA again. The pill aesthetic is the V4 delta; the mobile mechanics are inherited from V3.

---

## Top 8 IA moves ranked

Ranked by impact ÷ effort. Each: change · why · effort · audit receipts.

### 1. Consolidate `/about` and `/changelog` into anchor sections on `/` — **P0, ~3h**

- **Change:** Move the contents of `app/about/page.tsx` into a `<section id="what-is-this">` block on `app/page.tsx`. Move `app/changelog/page.tsx` into a `<section id="changelog">` block. Delete the two route files. Add `_redirects` from `/about` → `/#what-is-this` and `/changelog` → `/#changelog`.
- **Why:** Reduces 8 routes to 6. Gives `/` the Cartesian-shaped sales-letter density that scrolls cleanly. The existing about/changelog content is short enough (about ~3 viewports, changelog ~1 viewport) that the consolidated home is ~5 viewports tall — cleaner than Cartesian's ~12 viewports.
- **Receipts:** Cartesian Pattern 7 (TOC accordion as syllabus, single-page IA), Cartesian walkthrough §1 ("the site is single-page"). Counter-receipt: Promptdojo audit-v3 §6 (`/curriculum` exists as own route — keep it).

### 2. Floating glass nav pill (replace sticky bar) — **P0, ~5h**

- **Change:** Rebuild `<SiteHeader>` as `<FloatingNavPill>` per spec above. Smoked-glass dark blur, 24px radius pill, hybrid anchor/route behavior on section links.
- **Why:** Aesthetic delta but ALSO functional delta — the hybrid anchor/route behavior makes home feel native (no reload on `what is this?` click). Visual signature of "indie-built, premium-craft" that maps Cartesian's letterpress aesthetic into Promptdojo's dark-mode-developer aesthetic.
- **Receipts:** Cartesian Pattern 2 (floating glass nav pill with one primary CTA). V3 audit §1 (header rebuild already done — V4 just changes the chrome).

### 3. Rename `/onboarding` → `/start` + add skip-link + trim to 3 questions — **P1, ~2h**

- **Change:** Move `app/onboarding/page.tsx` to `app/start/page.tsx`. Add `_redirects`. Trim form from 5 questions to 3. Add "skip for now →" link routing to `/learn/v2/foundations/.../0`.
- **Why:** Cartesian doesn't have onboarding; Promptdojo needs it but should make it skippable. `/start` is shorter, Cartesian-shaped voice-wise. Skip-link removes the velocity steal for tweet-driven traffic.
- **Receipts:** V3 audit URL §3 ("`/onboarding` → `/start` is P3" — promote to P1 for V4). Cartesian §2 (no onboarding step).

### 4. Add `<section id="curriculum-preview">` to home with accordion-collapsed chapter list — **P1, ~4h**

- **Change:** Mount a collapsed-by-default version of `<PhaseBandedRail>` on home, between hero and `#what-is-this`. Each phase shows `+ phase 01 · foundations · 7 chapters · 2h 14m`. Click to expand. Mirrors Cartesian's Pattern 7 (TOC accordion as syllabus).
- **Why:** Today the home page chapter rail is fully-expanded, eats ~4 viewports. Collapsing it to phase headers makes home scannable in 1-2 viewports. The full curriculum already exists at `/curriculum` (V3) — home gets the **preview**, the route gets the **complete view**. Two surfaces, two jobs.
- **Receipts:** Cartesian Pattern 7. Promptdojo's existing `<PhaseBandedRail>` has the data structure already; just needs an `expanded` prop default.

### 5. Hybrid anchor/route behavior on section nav links — **P1, ~1.5h**

- **Change:** Wrap section nav `<Link>` clicks in a handler that checks `pathname === "/"` and switches to scroll-into-view + `history.replaceState`. Same `href`, different behavior.
- **Why:** Cartesian feels native because clicking "FAQs" never reloads the page when you're on home. Promptdojo's home should never reload when the click destination is a same-page anchor.
- **Receipts:** Cartesian behavior observed in walkthrough §1 (single-page IA, all nav is hashbangs).

### 6. `/curriculum` page — change default phase-expand state from `all expanded` to `phase 1 expanded, others collapsed` — **P2, ~1h**

- **Change:** `app/curriculum/page.tsx` currently passes `expanded` (all expanded). Change to `expanded={false}` with phase 1 as default-open. Add `?expand=all` query param for the "show me everything" view.
- **Why:** Cartesian's TOC defaults to collapsed; users open chapters of interest. Currently `/curriculum` is a wall of every chapter expanded — overwhelming. Default-collapsed turns it into a scannable index, with `?expand=all` for the "I want to see it all" share URL.
- **Receipts:** Cartesian Pattern 7 (accordion default-closed). V3 audit §6 (the `?expand=all` query param is already specced).

### 7. Branded 404 enhancement: add Cartesian-style "did you mean" — **P2, ~1h**

- **Change:** V3 already shipped a branded `app/not-found.tsx`. Cartesian's 404 silently rewrites to home (`cartesian-404.png` confirms) — Promptdojo's is better. V4 enhancement: confirm the Levenshtein "did you mean: about?" hint specced in V3 actually shipped, and surface it for `/learn/v2/<typo>` paths.
- **Why:** Cartesian's silent rewrite is lazy; Promptdojo's branded 404 is a feature. Polish the V3 ship rather than regress to Cartesian's pattern.
- **Receipts:** V3 audit §11 (branded 404 specced). Cartesian §9 (silent rewrite — anti-pattern).

### 8. Hide the IDE-prep "Pyodide preloader" call from `/about` and `/changelog` (now-deleted) routes — **P2, ~0.5h**

- **Change:** Currently `<PyodidePreloader>` mounts on `/` and `/onboarding`. After the route consolidation, ensure `/start` (renamed from `/onboarding`) keeps the preloader and the new `/` keeps it. No change to `/curriculum` — keep the preloader off (`/curriculum` is high-bounce traffic, no IDE intent).
- **Why:** Janitorial. Route consolidation can leave preloader mounting in the wrong places.
- **Receipts:** V1 IDE audit §2 (Pyodide preloading strategy).

---

## Files to delete / consolidate

### Delete (route consolidation)

- `app/about/page.tsx` — content moves to `app/page.tsx` as `<section id="what-is-this">`. Delete after content migrates.
- `app/changelog/page.tsx` — content moves to `app/page.tsx` as `<section id="changelog">`. Delete after content migrates.
- `app/onboarding/` directory — moves to `app/start/`. Delete `app/onboarding/` after move.

### Add (new files)

- `app/start/page.tsx` — moved from `app/onboarding/page.tsx`, trimmed from 5 to 3 questions, adds skip-link.
- `public/_redirects` (or framework equivalent) entries:
  - `/about /#what-is-this 301`
  - `/changelog /#changelog 301`
  - `/onboarding /start 301`

### Modify (in place)

- `components/SiteHeader.tsx` — rebuild as `<FloatingNavPill>` (~30% rewrite — keep state-aware logic, change visual chrome + add hybrid anchor/route handler).
- `components/SiteHeader/Drawer.tsx` — minor: update mount point references.
- `app/page.tsx` — add 3 anchor sections (`#what-is-this`, `#curriculum-preview`, `#changelog`); add `<section>` wrappers; add `scroll-margin-top` for offset under floating pill.
- `app/curriculum/page.tsx` — flip default expansion from `all` to `phase 1 only`; add `?expand=all` URL handler.
- `app/globals.css` — add `.float-pill` smoked-glass utility, `scroll-margin-top: 80px` on anchor targets, mobile pill responsive rules.
- `components/v2/PhaseBandedRail.tsx` — accept `defaultExpanded` prop (string `"all" | "first" | "none"`).
- `components/v2/LessonStepClient.tsx` — update breadcrumb wordmark click to use new pill mount.
- `app/not-found.tsx` — verify Levenshtein hint shipped (V3); enhance for `/learn/v2/*` typos.

### Keep (no V4 change)

- `app/curriculum/page.tsx` exists — keep as a route. Don't fold into home.
- `app/lesson/resume/page.tsx` — keep, no change.
- `app/learn/v2/[chapter]/[lesson]/[stepIndex]/page.tsx` — keep, no IA change. V4 IDE work is a separate audit.
- `app/learn/[chapter]/...` legacy routes — V3 cut deletion; V4 reaffirms the cut. They still ship; the consolidation work is V5.
- `components/v2/ChapterNav.tsx` — V3 changes shipped; no V4 IA change.
- `components/v2/LessonShell.tsx` — V3 changes shipped; no V4 IA change.

### Total V4 IA delta (file count)

- **Routes deleted:** 3 (`/about`, `/changelog`, `/onboarding`).
- **Routes added:** 1 (`/start`).
- **Routes modified:** 2 (`/`, `/curriculum`).
- **Components rebuilt:** 1 (`SiteHeader` → `FloatingNavPill`).
- **Net route count:** 8 → 6 (25% reduction).
- **Net code delta:** ~+200 lines, ~-300 lines = net -100 lines (consolidation reduces total surface area).

---

## What V4 IA explicitly does NOT do

The bias is "simpler IA wins." Several Cartesian patterns are aesthetically appealing but should NOT translate. Listing them so the next agent doesn't rebuild them:

1. **Do NOT collapse `/curriculum` into home.** Two-URL story (`/` for the pitch, `/curriculum` for the syllabus) beats one-URL story.
2. **Do NOT add a `/free` or pricing-equivalent page.** Cartesian has pricing because it's a $35 product. Promptdojo is free; the equivalent of "pricing" is the `$0 forever` band on home (V3 pick #7). That's the pricing surface. No dedicated route.
3. **Do NOT silently rewrite 404 → home** like Cartesian does. The branded 404 (V3 ship) is a real signal of craft; killing it for "Cartesian parity" would be a regression.
4. **Do NOT remove `/lesson/resume`.** Cartesian doesn't have one because Cartesian doesn't have user state. Promptdojo's stable continue link is a load-bearing feature.
5. **Do NOT remove the chapter sidebar from lesson pages.** Cartesian doesn't have chapter navigation inside the product because Cartesian's product is a downloaded `.dmg`. Promptdojo's product is a browser app where chapter switching is a primary interaction.
6. **Do NOT add `<details>/<summary>` legacy course disclosures back to home.** V2/V3 cut that. Reaffirm the cut.
7. **Do NOT build the cmd-K search palette.** V3 cut to V3.5/V4 — V4 IA work doesn't depend on it; the consolidated `/` + `/curriculum` two-URL story carries the discovery load.
8. **Do NOT redesign the lesson IDE chrome.** That's the IDE auditor's beat. V4 IA work stops at the lesson route; the lesson chrome is owned downstream.

---

## Open questions for the V4 team

Things this audit can't decide alone:

1. **Brand Guardian:** does the smoked-glass-dark variant of Cartesian's pill match Promptdojo's voice? (My read: yes; the dark glass is more "developer tool" than "marketing site." Confirm.)
2. **Visual Storyteller:** when home consolidates to ~5 viewports tall (hero + curriculum-preview accordion + what-is-this + changelog + footer), does the scroll narrative work? (My read: yes — it follows the Cartesian shape of hero → features → TOC → buy-once → FAQ → footer, but Promptdojo replaces "buy-once" with "what is this?" prose and "FAQ" with the changelog footnote.)
3. **Growth Hacker:** does the `/about` URL deletion hurt SEO? (My read: 301 redirects preserve link equity; the consolidated home likely RANKS BETTER for "promptdojo about" because it's the same content on a higher-authority URL. But verify.)
4. **Copy:** does Promptdojo's lowercase voice pair with Cartesian's "+" divider pattern? Or does the divider need to be `→` or `&` instead?

---

**ArchitectUX — V4 IA Lead**
**Audit date:** 2026-05-06
**Bias confirmed:** simpler IA won. 8 routes → 6 routes. The IDE stays multi-route (correct). The lobby goes single-page (correct). The pill goes floating-glass (Cartesian-shaped). Everything else is unchanged from V3 — V3 already shipped the nav spine; V4 polishes the chrome.
**The one-line summary if you read nothing else:** *Cartesian's IA fits a sales letter. Promptdojo's IDE doesn't. Consolidate the marketing pages onto home; keep `/curriculum` as the syllabus URL; rename `/onboarding` to `/start` with a skip-link; replace the sticky header with a smoked-glass floating pill; never touch the lesson IDE.*
