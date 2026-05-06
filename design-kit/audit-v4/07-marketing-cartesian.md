# Marketing V4 — Cartesian's confidence translated for follower-growth

**Auditor**: Growth Hacker
**Date**: 2026-05-06
**Live URL**: https://promptdojo.pages.dev
**Validation metric**: X follower count on @TFisPython (current → 1,000)
**Predecessors**: V3 marketing audit (`audit-v3/06-marketing.md`) — already shipped picks 1, 2, 3, 4, 6, 9. This V4 is the *confidence layer* on top of those receipts.
**Source brief**: `audit-v4/01-cartesian-walkthrough.md`

---

## The marketing thesis (1 sentence)

Cartesian sells $35 with the calm of a textbook because every page declares **what the product refuses to do**; promptdojo's free + open + no-login posture is structurally the same anti-marketing move, but the live site whispers it where Cartesian shouts it — V4 turns the whisper into a single declarative page that a vibe-coder follows on X within 5 seconds because the page sounds like a person who has nothing to sell.

---

## Per-pattern proposals (top 8)

### Pattern 1 — Single-CTA confidence

- **Cartesian source**: hero ships exactly ONE button (`Purchase $35 ~~$59~~`). No "Learn more," no "Free preview," no "Watch demo." The page IS the learn-more. The whole site is a single sales letter and a single button. Confidence by subtraction.
- **Promptdojo translation**: the analog is `[follow @TFisPython on x]` as the lone hero CTA, with `start chapter 1 →` demoted into the hero copy as a low-emphasis text link. This is heretical — the site has always centered "start chapter 1" — but the validation metric is followers, not finishers. If the page is selling a relationship (audience-growth), the hero button must ASK for the relationship.
- **Concrete change**: hero block in the home page. Replace the current two CTAs (primary `start chapter 1 →` + tertiary `or pick your chapter ↓`) with ONE pill `[follow @TFisPython on x]` rendered in the same shape as Cartesian's coral pill but using promptdojo's green accent. Below it, one tertiary text-link, lowercase: `or just start chapter 1 →`. The relationship is the ask; the course is the sweetener.
- **Expected lift**: ~3-4x raw follow-clicks on the hero. Today the X-follow lives in the header and competes with five other items; promoting it to lone hero CTA is the cleanest attributable move toward the 1000-follower gate. Estimated +120-200 followers across a 60-day window if the screenshot rate also climbs from picks below.

### Pattern 2 — Anti-feature litany

- **Cartesian source**: "Buy Once. Own Forever." block — six stacked single-line statements, all centered, equal weight: `No Subscriptions. No In-App purchases. No Signups. No Tracking. No DRM. Accessible Offline.` Each line is a relief. The "+" character separates this block from "Free Updates for Life." Rhythmic, poetic, addresses subscription dread without naming it.
- **Promptdojo translation**: the existing PriceBand says `no login · no streaks · no upsell · open source` on one line. Four tokens. Cartesian uses six on six lines. **Promptdojo should expand to eight stacked lines, vertical not horizontal.** Each line addresses a specific dread of an indie-coder visitor scarred by Codecademy/DataCamp/Boot.dev/Coursera.
- **Concrete change**: PriceBand component. Keep the giant `$0` and the eyebrow `FOREVER`. Below the price, replace the four-token horizontal strip with eight stacked single-line statements (lowercase, period-terminated, sentence per line):

  ```
  no login.
  no email gate.
  no streaks.
  no certificate store.
  no upsell.
  no tracking.
  no zoom calls.
  open source. forever.
  ```

  Below those eight lines, render a single `+` character (Cartesian's exact divider) centered, then the line `pull requests welcome.` This is the promptdojo equivalent of "Free Updates for Life" — the open-source moat in five letters. Ship the entire block in dojo-green eyebrow + ink-100 body, no accent flourishes.
- **Expected lift**: this becomes the cleanest single-frame meme on the page. ~2x screenshot rate on PriceBand vs the current four-token line. Quote-tweetable as a reply to ANY paid course marketing tweet. Estimated +50-80 followers per quote-tweet thread that breaks 1000 impressions, and the band converts 3-5x more replies-with-screenshot than the current band would.

### Pattern 3 — Stat-row authority

- **Cartesian source**: `670+ Interactive Pages · 22 Comprehensive Chapters · 300+ Customizable Visualizations · 100+ Solved Problems · 250+ Interactive Code Snippets`. Five large display-serif numbers in cool brilliant blue against warm cream. Stats establish *credibility* — "this is a real textbook, not a blog post."
- **Promptdojo translation**: promptdojo already ships StatStrip but the numbers establish *scale*, not *uniqueness*. Cartesian's stats answer "is this dense enough?" Promptdojo's stats need to answer "does this exist anywhere else?" — which is the audience-growth wedge. Add ONE token to StatStrip that no competitor can claim.
- **Concrete change**: StatStrip currently shows `25 chapters · 624 steps · 8-15h · MIT licensed`. Add a fifth token, dojo-green: `0 backend · 100% browser`. Or alternatively: `13 chapters not on codecademy`. The tokens that establish scale (chapters, steps, hours) need a sibling token that establishes *uniqueness*. The "no backend" claim is structurally true and screenshot-able as a flex. Pick ONE — don't add both.
- **Expected lift**: modest standalone (~1.2x screenshot rate on StatStrip), but the differentiation token is what makes the strip *quotable* in an X reply. Today the strip says "this is a real course." After the change, it says "this is a real course AND it's structurally different from the courses you're tired of." Worth ~30-60 followers across the validation window.

### Pattern 4 — What Cartesian uses INSTEAD of fake social proof

- **Cartesian source**: no testimonials, no "trusted by" logos, no "5-star reviews." Cartesian uses three trust substitutes: (a) the **22-chapter accordion TOC** as a syllabus that proves comprehensiveness, (b) the **founder byline** with animated heart and @-handle ("Crafted with ♥ by Elias Yilma / [@ElijahYilma]"), (c) a **datestamped FAQ** ("Updated May 8, 2025") that proves the product is maintained.
- **Promptdojo translation**: promptdojo can borrow all three. Curriculum proof is already shipping (PhaseBandedRail). Founder byline isn't on the home page. Datestamp lives in `last commit` but is buried in the footer.
- **Concrete change**: three additions, none new components.
  1. **Founder byline**, footer of home page, replace or sit beside the changelog link: `built by josh · ai consultant who ships python alongside cursor and claude every day · [@TFisPython on x]`. One line, lowercase, mono. The @-handle is the second X-follow CTA on the page (hero is the first).
  2. **Datestamped maintenance signal**, top of the page (eyebrow above hero or as a single line in the header pill area): `updated 2026-05-06 · 5 ships in 30 days`. Mono. Not a marketing claim — a receipt.
  3. **Promote the chapter TOC accordion** (already proposed by V3) so curriculum-as-syllabus does the heavy lifting that testimonials would do on a marketing-stack site.
- **Expected lift**: founder byline alone converts ~5-10% more first-time visitors into "person to follow" perception (vs "course to consider"). The datestamp removes the "is this abandoned?" doubt that the 5-second scan can plant. Combined ~20-40 follower lift per 1000 visitors.

### Pattern 5 — "Watch the film" microcopy + trailer placement

- **Cartesian source**: above the YouTube embed, a 3-word display-serif label `Watch the film.` Calling it a "film" instead of "video" or "demo" is voice-positive — it claims artistry without ego. Three words. Present tense. Lowercase-ish.
- **Promptdojo translation**: promptdojo just shipped V2 of the launch trailer at `launch-trailer-v2/renders/`. It's invisible on the live site. The trailer should surface, but NOT in Cartesian's exact spot (Cartesian's trailer is below the CTA — a "while you're here" surface). For promptdojo's audience-growth metric, the trailer is the *deepest* qualifier — the visitor who watches it is the visitor most likely to follow.
- **Concrete change** (trailer placement on multiple surfaces):
  1. **Home page**: a small label-link below the hero bug snippet, before the value-prop cards. Display serif, lowercase: `or watch the trailer →`. Click expands an inline `<details>` that lazy-loads an MP4 element (no YouTube iframe — the trailer renders are in `launch-trailer-v2/renders/`, ship them as a self-hosted poster + MP4 with `<video poster="">`). NOT autoplay.
  2. **About page**: same label, same placement, top of the page. About visitors are deeper-funnel; they'll watch.
  3. **Per-chapter overview pages** (when those ship): no trailer; chapter pages get a chapter-specific OG card and that's enough.
  4. **/curriculum page** (V3 ship): same label-link, top of the page.
  - Microcopy is `or watch the trailer →` (lowercase, present-tense, sentence case violations consistent with promptdojo's voice). NOT `Watch the film.` — that's Cartesian's voice. The brand uses `→` arrows; honor that.
- **Expected lift**: ~10-15% of unique home-page visitors will click "watch the trailer" if it's surfaced this lightly (vs ~1% if it's a separate video-page CTA). Of those, ~3-5x more likely to follow on X than non-watchers (deeper-funnel attention). Worth ~30-50 followers across the validation window if the trailer is genuinely good (which V2 renders should be).

### Pattern 6 — Three-card pattern as "phases" not "tiers"

- **Cartesian source**: 3 pricing cards (Purchase / Multi Platform Bundles / Preview Free Chapter). Different highlight color per card title (coral / purple / gray). No "Most Popular" ribbon — the colors carry the hierarchy.
- **Promptdojo translation**: promptdojo doesn't sell. But the **3-card pattern is a confidence shape**, not a pricing shape. Translate it as "what you get at each phase of your read." Three cards: `read the curriculum (free)` / `run the code (browser)` / `ship your own (the agent capstone)`. Each card has a different highlight color (dojo-green / ember-red / dojo-purple). No "Most Popular" — they're sequential, not competitive.
- **Concrete change**: insert a 3-card row between the value-prop cards section and StatStrip. Card 1 (green title): "read the curriculum" — `25 chapters · 5 phases · 8-15h.` Subhead: `every chapter is a real bug AI ships, and the python that catches it.` Card 2 (ember title): "run the code" — `python in your browser · no install · no backend.` Subhead: `the IDE boots once, every step runs locally.` Card 3 (purple title): "ship your own agent" — `chapter 25 capstone · ~100 lines.` Subhead: `you finish this and you've shipped a real agent.`
- **Expected lift**: this card row is the *outcome* surface — it sells what the visitor will *do* in three frames. Each card is screenshot-able as a single asset. The ember-red middle card especially functions as quote-tweet bait ("python in your browser. no install. no backend." is six tokens of tech-flex). Worth ~40-70 followers via the screenshot funnel; the per-card framing also reduces bounce rate by giving the value prop three legible sub-stories.

### Pattern 7 — Confidence in anti-buying behavior (the "Buy Once. Own Forever." analog)

- **Cartesian source**: the entire "Buy Once. Own Forever." block is structurally the company telling buyers NOT to subscribe — it's anti-buying-behavior copy that makes the buyer feel respected. Cartesian leaves money on the table by explicitly refusing the recurring-revenue model.
- **Promptdojo translation**: the analogous move for a free product is to refuse the *attention-economy* model. Encourage the visitor to actually engage rather than skim. Not in a self-help "be present" way — in a builder-class "the surface won't drown you" way. The promptdojo equivalent of "Buy Once. Own Forever." is **"Read Once. Run It. Don't Skim."**
- **Concrete change**: a single eyebrow + one-line block, placed AFTER PriceBand and BEFORE PhaseBandedRail. Display serif eyebrow: `read once. run it. don't skim.` Below, three tight lines, all lowercase:

  ```
  the lessons run in your browser. the bugs are real.
  the agent at chapter 25 actually ships.
  if you scroll without running anything, this site doesn't work.
  ```

  This block is THE tone differentiator vs every "watch our 30-min YouTube tutorial" content tweet. It explicitly tells the visitor to slow down — anti-engagement-bait, anti-completion-streak, anti-everything-promptdojo-refuses. The third line is the punchline: the site is opinionated about how to use it.
- **Expected lift**: highest-leverage *brand* line on the page. It won't directly drive screenshot volume (it's text-heavy), but it makes the FOLLOW decision easier — the visitor reads this block and knows they're following a person with taste, not a course factory. Estimated +5% follow-conversion on visitors who reach this depth.

### Pattern 8 — The "+" divider (free upgrade, drop in)

- **Cartesian source**: a single `+` character centered between the "No DRM. Accessible Offline." block and "Free Updates for Life." Refuses standard `<hr>` conventions. Tiny visual signature.
- **Promptdojo translation**: replace any current `<hr>` or padded-divider element with `+` characters, especially between the new anti-feature litany and the "pull requests welcome" closer. Aligns with the lowercase / restrained voice.
- **Concrete change**: across PriceBand and any future section dividers on home, /about, /curriculum — use `+` (display serif, ink-500 color, ~24px) instead of `<hr>` or whitespace dividers. Costs nothing. Adds a tiny brand signature.
- **Expected lift**: brand-fingerprint level only. Doesn't drive followers directly; signals "this is a person who notices typography" to the few visitors who DO notice. ~5-10 followers via deep-funnel taste recognition.

---

## Single-CTA decision

Promptdojo's hero currently has these CTAs:
1. `start chapter 1 →` (primary, green pill)
2. `or pick your chapter ↓` (tertiary, anchor link)
3. `[login to save]` (header, ghost)
4. `[follow @TFisPython on x]` (header, ghost)
5. `[view source · committed 1m ago]` (header, mono link)

**Proposed ONE button**: `[follow @TFisPython on x]` — promoted from the header to the hero. Same pill shape as the current `start chapter 1`. Green-on-ink, tall, single focal point.

**Rationale**: the V1→V2 gate is 1000 X followers, not 1000 lesson finishers. The hero button has to ask for the metric the company is measured on. `start chapter 1` becomes a low-emphasis text-link below the pill: `or just start chapter 1 →`. The header X-follow demotes to a secondary slot (or removes entirely once the hero carries it).

**Anti-pattern to avoid**: don't ship two pills side-by-side ("follow on x" + "start chapter 1") — that's two CTAs again, just rearranged. The Cartesian discipline is ONE pill. The course-start link survives as text-link only. If the founder pushes back on this, the fallback is `start chapter 1 →` as the lone pill, and the X-follow stays in the header — but the header pill needs a green-accent treatment so it reads as primary, not as another header item.

**Header cleanup that ships with the single-CTA decision**:
- `[login to save]` — hide entirely until a profile exists (V3 already proposed this; verify it shipped)
- `[view source · committed 1m ago]` — keep, it's the build-in-public proof
- `[follow @TFisPython on x]` — only in header if NOT in hero. Pick one.

---

## Anti-feature litany — final form

Building on the existing `no login · no streaks · no upsell · open source` (four tokens, horizontal). Final form is **eight stacked lines, vertical, period-terminated, lowercase, in PriceBand below the giant `$0`**:

```
no login.
no email gate.
no streaks.
no certificate store.
no upsell.
no tracking.
no zoom calls.
open source. forever.

+

pull requests welcome.
```

**Why these eight specifically**:
- `no login.` — already shipping. The technical flex (every step runs anonymously).
- `no email gate.` — direct shot at Codecademy / Boot.dev. They cannot say this.
- `no streaks.` — existing brand position. Anti-Duolingo. Earned.
- `no certificate store.` — direct shot at Coursera. They cannot say this.
- `no upsell.` — existing brand position. The price IS the position.
- `no tracking.` — Cartesian's exact line, structurally true for promptdojo (no analytics on the live site? verify; if there's PostHog or similar, change this to `analytics opt-in only.`).
- `no zoom calls.` — direct shot at every cohort-based course. Promptdojo is async-forever.
- `open source. forever.` — closer line. Two words, two truths. The `forever.` echoes the eyebrow.

**The `+ pull requests welcome.` closer** is the open-source moat in three words. It's promptdojo's equivalent of Cartesian's "Free Updates for Life." — same structural move (the company commits to ongoing value), but adapted to the open-source posture (the *community* is the update channel, not the founder).

**Visual treatment**: same display-serif eyebrow `FOREVER` already shipping, giant mono `$0`, then the eight stacked lines in body weight (not display — Cartesian uses weight 700 body for these, which reads as confident-conversational, not headline-grand). Vertical rhythm: line-height ~1.7 between statements so they breathe. The `+` divider is display serif size ~28px, ink-500, centered.

---

## Where the trailer should live

The V2 trailer renders at `launch-trailer-v2/renders/` just shipped. It needs surfaces.

**Surface 1 — Home page (highest priority)**:
- Placement: directly below the hero bug snippet, ABOVE the value-prop cards. Single label-link in display serif: `or watch the trailer →`. Click expands an inline `<details>` that lazy-loads a `<video>` element (self-hosted MP4 + poster from the renders folder). No autoplay, no YouTube iframe.
- Why here: the visitor who lands on home and is intrigued by the bug snippet but not ready to start a chapter has ONE alternate-path. The trailer is that path. It's deeper-funnel than "scroll past" but lighter than "click chapter 1."

**Surface 2 — /about page (second priority)**:
- Placement: top of the page, after the founder credential sentence (`i'm josh. ai consultant...`). Same label `or watch the trailer →`.
- Why here: /about visitors are *already* qualified — they clicked "what is this?" or arrived from a tweet. The trailer earns its keep on /about more than anywhere else.

**Surface 3 — /curriculum page (V3 ship; if it lands)**:
- Placement: top of the page, before the expanded PhaseBandedRail. Same label.
- Why here: visitors arriving from a tweet that links to /curriculum are looking at the syllabus first. The trailer is the "show me the vibe before I read 25 chapter titles" path.

**NOT on**:
- Per-chapter overview pages — those have chapter-specific OG cards, that's enough deep-funnel asset.
- /changelog — wrong audience.
- Lesson pages — the IDE is the experience; the trailer would be a regression.

**Microcopy**: `or watch the trailer →` everywhere. Lowercase. Display serif. Three tokens. Present-tense. Don't borrow Cartesian's "Watch the film." — that's Cartesian's voice; promptdojo's voice is always lowercase + arrows.

**Technical**: `<video controls preload="metadata" poster="/trailer/poster.jpg" src="/trailer/v2.mp4">`. Browser-only, self-hosted, no third-party tracking. Aligns with the "no tracking" anti-feature line.

---

## Top 10 marketing moves ranked

By follower-acquisition impact / dev-hour cost.

| # | Move | Surface | Effort | Estimated follower lift |
| --- | --- | --- | --- | --- |
| 1 | Anti-feature litany expansion to 8 stacked lines + `+ pull requests welcome.` closer in PriceBand | home page | XS (~30 min copy + 15 min layout) | +50-80 quote-tweet driven |
| 2 | Single-CTA hero: promote `[follow @TFisPython on x]` to hero pill, demote `start chapter 1` to text-link | home hero | S (~1h component shuffle) | +120-200 direct follow-clicks |
| 3 | Trailer surfaced on home + /about with `or watch the trailer →` label, inline `<details>` + self-hosted MP4 | home + /about | S (~2h video element + poster generation) | +30-50 deep-funnel |
| 4 | Three-card pattern: read / run / ship — between value-props and StatStrip | home page | S (~2h component build) | +40-70 screenshot-driven |
| 5 | Founder byline in home footer: `built by josh · ai consultant... · [@TFisPython on x]` | home footer | XS (~15 min copy) | +20-40 trust + second-CTA |
| 6 | Datestamped maintenance signal in header eyebrow: `updated 2026-05-06 · 5 ships in 30 days` | site-wide header | XS (~30 min) | +15-25 trust-side |
| 7 | "Read Once. Run It. Don't Skim." block between PriceBand and PhaseBandedRail | home page | XS (~30 min copy + layout) | +15-30 brand-loyalty |
| 8 | Add fifth StatStrip token: `0 backend · 100% browser` (uniqueness, not scale) | StatStrip site-wide | XS (~15 min) | +30-60 differentiation-driven |
| 9 | Replace `<hr>` and padded dividers with `+` character site-wide | site-wide | XS (~30 min) | +5-10 brand-fingerprint |
| 10 | Hide `[login to save]` until profile exists; demote `view source · committed Xh ago` to right-rail mono link only | header | XS (~30 min) | +0 direct, but unblocks #2 |

**Total effort**: ~9 dev-hours across all 10 moves. Solo evening across 2 nights.
**Total estimated lift**: ~325-585 followers across a 60-day validation window if all 10 ship and the screenshot-driven ones get amplified by ≥1 quote-tweet thread breaking 5000 impressions.

**Single-PR bundles**:
- PR-A: moves 1, 7, 8, 9 (PriceBand + dividers + StatStrip + brand block) — ~2h, copy-and-component edits, low risk
- PR-B: moves 2, 5, 10 (single-CTA hero + footer byline + header cleanup) — ~2h, header surgery, founder-approval gate
- PR-C: moves 3, 4, 6 (trailer + 3-card row + datestamp eyebrow) — ~5h, three new surfaces

PR-A ships first and lowest-risk. PR-B is the contentious one — it changes what the hero asks for. PR-C is the largest but lands last.

---

## Don't lift these from Cartesian

1. **Title Case headlines** ("Buy Once. Own Forever.", "A Comprehensive Treatment.") — promptdojo runs lowercase. Lifting Title Case breaks the brand.

2. **The word "film"** — Cartesian's "Watch the film." is voice-positive for a textbook with academic credibility implied. Promptdojo says "trailer" because promptdojo is a builder-class school, not a literary press. Use `or watch the trailer →`, not `or watch the film →`.

3. **Three competing pricing tiers** — Cartesian has Purchase / Bundles / Preview. Promptdojo doesn't sell, so don't simulate purchase optionality. The 3-card "read / run / ship" pattern is acceptable (it's outcome cards, not price cards); a 3-card "Free / Coffee / Cohort" structure is NOT (it forces a paid future Cartesian doesn't yet have committed to).

4. **The pixel-art footer signature** ("Crafted with ♥ by Elias Yilma" with stick-figure illustration and animated heartbeat) — adorable for a solo academic-product, off-brand for a builder-class school. Founder byline in plain mono is enough. No heart emoji, no animation, no doodle. (Pattern 12 in the walkthrough — explicit "do not lift.")

5. **Strikethrough discount baked into the CTA** — Cartesian uses `Purchase $35 ~~$59~~`. Promptdojo is free; there's no analog. Don't simulate fake urgency by inventing a "limited time" line on a free product. That's the marketing-stack move the brand explicitly rejects.

6. **"Available for a Limited Time!"** copy on any tier card — Cartesian uses this on the bundles card. Promptdojo's bundles don't exist; the urgency claim is a lie if borrowed.

7. **Single-author credential signaling** ("Crafted with ♥ by Elias Yilma" — implying scholarly authority) — promptdojo's voice is `built by josh`, lowercase, no honorific, no flourish. The credential is in the work (commits, changelog, ship velocity), not in the byline ornamentation.

8. **The dense Abril Fatface display serif** — already covered in the walkthrough's "do not lift" list. Worth restating: the visual brand stays promptdojo's existing system, not Cartesian's textbook-press aesthetic. Borrow structural confidence; do not borrow visual language.

9. **The 9-question FAQ accordion** — Cartesian's FAQ addresses paid-product doubts (refund policy, system requirements, future versions). Promptdojo's audience has different doubts (is this maintained? do I need to log in? is this real?). If/when promptdojo ships a FAQ, design the questions for the audience-growth funnel — NOT by copying Cartesian's question list.

10. **The "Updated May 8, 2025" pattern as a hero-area datestamp** — Cartesian's datestamp is in the FAQ section, low-emphasis. The walkthrough's "datestamp at top of page" recommendation translates to a header eyebrow, NOT a giant hero element. Don't make the maintenance signal compete with the brand promise.

---

## Closing note

The Cartesian translation is mostly a **subtraction** exercise. Every Cartesian pattern that adds confidence to a paid product translates to promptdojo as a refusal — refusing logins, refusing streaks, refusing certificates, refusing the marketing-stack apparatus. The 10 ranked moves above all encode some refusal. The site after V4 says less, asks for one thing, and respects the visitor's time.

The bar from the brief: a vibe-coder lands on V4 promptdojo, scans for 5 seconds, immediately follows on X. The single-CTA hero (move 2) is what makes that mechanically possible. Everything else (anti-feature litany, datestamp, trailer, 3-card row, founder byline) is what makes the visitor *want* to.

**Growth Hacker**
Audit date: 2026-05-06
Strategic posture: Cartesian's confidence is structural, not visual. Promptdojo lifts the structure (single CTA, anti-feature litany, datestamped trust, trailer microcopy, 3-card outcomes) and refuses the visual borrowing (Title Case, strikethrough discounts, pixel-art ornaments). V4 is the page that sounds like a person with nothing to sell.
