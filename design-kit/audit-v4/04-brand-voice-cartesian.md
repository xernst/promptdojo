# Brand Voice V4 — Adapt Cartesian's confidence to lowercase

**Auditor:** Brand Guardian
**Date:** 2026-05-06
**Sources:** `design-kit/audit-v4/01-cartesian-walkthrough.md`, `design-kit/BRAND.md`, `design-kit/VOICE.md`, live site fetch (5 routes), `app/page.tsx`, `app/about/page.tsx`, `components/PriceBand.tsx`, `components/SiteHeader.tsx`, `components/HeroBugSnippet.tsx`, `components/LoginToSave.tsx`.
**Predecessor brand priors:** the V3 audit's marketing-frame (`design-kit/audit-v3/06-marketing.md`) supplies the unique-position list and the "STOP saying" inventory; this report does not repeat them. The V3 brand-fidelity file does not exist on disk — `audit-v3/` ships marketing/UI/perf instead, no brand-only doc.

---

## The voice thesis (1 sentence)

cartesian writes like a textbook publisher with one author and zero apology — promptdojo should write like that author's nephew, ten years younger, lowercase, on cursor at midnight, and certain.

---

## Per-pattern adaptations

### Pattern 1 — Anti-feature litany

- **cartesian source (verbatim):**
  > Buy Once. Own Forever.
  > No Subscriptions.
  > No In-App purchases.
  > No Signups.
  > No Tracking.
  > No DRM.
  > Accessible Offline.
  > +
  > Free Updates for Life.
- **promptdojo current:** `components/PriceBand.tsx:17-23` — `no login · no streaks · no upsell · open source` (single line, four tokens, dot-separated, the green-source-tag at the end).
- **proposed adaptation:** keep the four-token pill as the homepage screenshot anchor. add a vertical-stack version on /about §"free forever" that mirrors cartesian's rhythm. the dot-separated horizontal version is for screenshots; the vertical stack is for the page that already has space to breathe.

  vertical (for /about, replacing the prose at `app/about/page.tsx:258-264`):
  ```
  no paid tier.
  no premium chapters.
  no certificate store.
  no streak shame.
  no email list.
  no upsell.
  open source.
  forever.
  ```
  eight lines. each ends in a period. each is a fact. the green word `open source` and the closing `forever.` are the only punctuated emphases — colored in `--ember`. no `+` divider (cartesian's `+` is a textbook tic, not ours). a single hairline rule does the same job.

- **why this works:** cartesian's litany is six negations + one positive (`Accessible Offline.`). that ratio matters — too many `no` lines and the brand reads bitter. our existing 3-no-1-yes ratio in the homepage pill is correct; the /about expanded version goes 6-no-2-yes (`open source.` + `forever.`) to match cartesian's relief beat.

---

### Pattern 2 — Single-CTA hero

- **cartesian source (verbatim):** one button. `Purchase $35 ~~$59~~`. no `Learn more`. no `Free preview` next to it. the page itself is the learn-more.
- **promptdojo current:** `app/page.tsx:120-129` ships TWO CTAs above the fold:
  - primary: `start chapter 1 →`
  - tertiary: `or pick your chapter ↓` (an in-page anchor link)
  plus the header carries: `[❯ what is this?]`, `[★ 0 · committed Xh ago]`, `[login to save]`, `[follow @TFisPython on x]`. seven competing affordances on first paint.
- **proposed adaptation:** the ONE button is `start chapter 1 →`. demote the tertiary anchor to a small text link below the bug snippet, not next to the primary CTA. specifically: kill the side-by-side `or pick your chapter ↓` next to `start chapter 1 →`. let the primary CTA stand alone with ~80px clear space below it before any other text. the tertiary anchor can live as a tiny `↓ all 25 chapters` link 60px below the primary, dim text, no button styling. one button gets the spotlight.
- **why this works:** cartesian's CTA discipline is the reason their hero feels expensive. two CTAs above the fold is a SaaS landing page. one CTA is a confident product. promptdojo's `start chapter 1 →` is already perfect copy — it just needs the rest of the hero to step back.

---

### Pattern 3 — Anti-marketing framing (the "Buy Once. Own Forever." beat)

- **cartesian source (verbatim):** `Buy Once. Own Forever.` — title-cased, periods, two phrases, declarative, no "FREE FOR LIFE!" energy. textbook publisher confidence.
- **promptdojo current:** `app/about/page.tsx:256` — `$0. open source. no upsell. ever.` (already on-voice, lowercase, period-terminated, four phrases instead of two).
- **proposed adaptation:** keep the four-phrase line on /about. for the homepage `$0 forever` band (`components/PriceBand.tsx`), the cartesian equivalent in lowercase is:

  ```
  $0.
  forever.
  ```

  two lines, two periods, two facts. that's it. the `forever` lives below `$0` in mono, sized down ~40%, letter-spaced wide. the four-token pill (`no login · no streaks · no upsell · open source`) sits ~40px under that. the proposition reads top-to-bottom: price, duration, what's not in the box.

- **why this works:** cartesian commits two words to the entire anti-subscription frame. ours commits two as well. the `forever` is the move — it's a one-token brand promise that maps 1:1 to "Own Forever" without the textbook capitalization. competitors structurally cannot say `forever` because they have venture capital.

---

### Pattern 4 — Stat-row copy

- **cartesian source (verbatim):**
  > 670+ Interactive Pages
  > 22 Comprehensive Chapters
  > 300+ Customizable Visualizations
  > 100+ Solved Problems
  > 250+ Interactive Code Snippets
- **promptdojo current:** `components/StatStrip.tsx` — `25 chapters · 624 steps · 8–15h · MIT · last commit 2026-05-06`. the strip is dot-separated, single-line, no labels-under-numbers structure. also: `25 chapters · 5 phases · 624 steps` rendered as the homepage hero subhead (`app/page.tsx:110`).
- **proposed adaptation:** the labels need sharpening. specifically the words `chapters`, `steps`, `phases` are correct but generic — every course has chapters and steps. the cartesian move is the LABEL doing voice work alongside the number. proposed labels:

  | number | current label | proposed label | why |
  | --- | --- | --- | --- |
  | 25 | chapters | chapters | keep — generic but accurate |
  | 624 | interactive steps | runnable steps | "interactive" is a 2014 codecademy word (V3 already flagged at line 243). "runnable" is what they actually are. |
  | 5 | phases | phases | keep |
  | 8–15h | (none) | hours, give or take | adds voice without adding noise; the "give or take" is the human tell |
  | MIT | (none) | mit, do whatever | parens-style permission line; reads like a license haiku |
  | last commit | last commit | shipped Xh ago | "shipped" is builder-class slang per VOICE.md; "last commit" is a git-term, "shipped" is a brand term |

  the `0` in cartesian's missing `0` slot is our flex: a sixth stat that competitors can't claim.

  ```
  $0 · forever
  ```

  the price-as-stat is the punchline.

- **why this works:** cartesian's labels are sentence-case serif at ~20px under big blue numbers. ours are mono at ~12px. the number-dominates-label hierarchy is already right. what's missing is the lowercase voice trickling into the labels themselves. `runnable steps` reads as a flex; `interactive steps` reads as a feature.

---

### Pattern 5 — Section title pattern (colored-word emphasis)

- **cartesian source (verbatim):** `<span color:red>Visualize</span> Everything.` — one word colored, the rest dark gray, period-terminated. five sections each get a different highlight color (red, purple, green, magenta, soft red).
- **promptdojo current:** section titles are mostly single-color. `t-section` class renders headlines in `--ink-100` flat. one exception: the hero h1 colors `it's wrong.` in green ember (`app/page.tsx:106` — `<em className="italic text-green-500">it&apos;s wrong.</em>`). this is exactly the pattern, already in the wild — but applied only once.
- **proposed adaptation:** extend the green-word pattern to every value-prop section title. pick ONE word per title to color in `--ember` (`#2aa06a`). do NOT use a different color per section (cartesian uses 4 colors because they have a wide palette; we have one accent — use it). examples:

  - `read what ai <span ember>wrote</span>.`
  - `catch what it got <span ember>wrong</span>.`
  - `direct it <span ember>deliberately</span>.`
  - on /about: `the <span ember>loop</span>: read · run · fix.`
  - on /curriculum: `25 chapters. one <span ember>thesis</span>.`
  - on /changelog: `what <span ember>shipped</span>, when.`

  rule: the colored word is always the verb or the noun-of-action. never the article, never the preposition. the green word IS the section identity — when a section is cropped to a screenshot, the green word tells you what's happening in 1 word.

- **why this works:** cartesian uses color to label sections without an eyebrow line. we already have eyebrow labels (`t-eyebrow` class). the green-word pattern adds a SECOND layer of section identity that survives cropping — the eyebrow is at the top of the section (often clipped off in a screenshot), the green word lives in the headline (always in frame).

---

### Pattern 6 — FAQ copy

- **cartesian source (verbatim — 9 questions, ordered by buyer doubt priority):**
  1. What makes this book different from other resources?
  2. Who is this book for?
  3. What are the recommended system requirements to use the book?
  4. Do I need an internet connection to use the book?
  5. Will I have access to future versions of the book?
  6. How do I get updates for the book?
  7. Is there a refund policy?
  8. What should I do if I encounter a bug?
  9. What will future updates for the book include?

  notable: every Q starts with a verb-phrase ("What", "Who", "Do", "Will", "How", "Is"), every Q ends in `?`, every Q is title-cased.

- **promptdojo current:** `app/about/page.tsx:62-90` — 8 questions, all lowercase, all end in `?`, voice is sharp and on-brand.
  ```
  do i need python experience?
  is it really free?
  do i have to log in?
  how long does it take?
  what if i find a bug?
  why isn't it on udemy / coursera / boot.dev?
  how often is it updated?
  ```
  (one missing in extract — there are 8 total in source.)

- **proposed adaptation:** the voice is right. the ORDER and the ANSWERS need cartesian-discipline edits.

  **order fix (priority of doubt):** lead with the differentiator, not the prerequisite. cartesian opens with "what makes this different?" — the highest-stakes question. ours opens with "do i need python experience?" — a permission question. swap.

  proposed order:
  1. `is it really free?` (kill the doubt that drives 80% of bouncers)
  2. `why isn't it on udemy / coursera / boot.dev?` (the moat answer — cartesian's Q1 equivalent)
  3. `do i need python experience?` (permission)
  4. `do i have to log in?` (friction)
  5. `how long does it take?` (commitment)
  6. `how often is it updated?` (trust)
  7. `what if i find a bug?` (community signal)

  **answer fix (one specific line):** `is it really free?` currently answers `yes. no paid tier, no premium content. the only money this site costs me is the domain.` — the third sentence is the voice tell. KEEP it. cartesian doesn't have lines like "the only money this site costs me is the domain" — that's our edge over them.

  **add datestamp microcopy:** under the FAQ h2, render `last revised 2026-05-06`. cartesian does this (`Updated May 8, 2025`). it's a 6-word trust signal that costs nothing.

- **why this works:** the voice doesn't change. the discipline does. cartesian's FAQ converts because the order is buyer-priority, not author-priority. ours should too.

---

### Pattern 7 — Microcopy (button hover, form labels, error states, empty states)

- **cartesian source:** sparse. cartesian has roughly 4 microcopy surfaces — `Available for a Limited Time!` (bundle card), `Suitable for Schools, Universities, Businesses, and Other Institutions` (institutional), `Updated May 8, 2025` (FAQ datestamp), `Crafted with ♥ by Elias Yilma` (footer). all four are sentence-fragment-as-statement, no exclamation except the bundle (which is the only Cartesian microcopy that breaks brand).
- **promptdojo current:** density is HIGHER than cartesian's, mostly correct. examples:
  - `[ login to save ]` (`components/LoginToSave.tsx:193`) — square brackets, lowercase, on-brand
  - `[ follow @TFisPython on x ]` (`components/FollowOnXPill.tsx:20`) — same pattern
  - `park a thought` (`app/page.tsx:211`) — footer note, on-voice
  - `or pick your chapter ↓` (`app/page.tsx:128`) — tertiary CTA, fine
  - `skip to content` (skip link) — accessibility, fine
- **proposed adaptation:** four targeted additions/swaps, no overhaul.
  1. **empty state for /lesson when nothing's saved:** `nothing parked yet. write something. it'll outlive the tab.` (replaces a generic empty state — adds personality to the BrainDump primitive).
  2. **error state for python execution:** today the IDE shows tracebacks raw. add a one-line wrapper: `python disagreed. read the trace.` above the traceback. doesn't editorialize the error, just labels the fact.
  3. **login modal copy:** the LoginToSave component has a button `login to save`. the modal that opens needs a one-line subhead: `optional. progress already saves to this browser.` directly addresses the "is this gating?" doubt before it forms.
  4. **github star ask (per V3 marketing fix #5):** `if this is the python school you wish existed, star the repo. it's the only metric we keep.` — already in `app/changelog/page.tsx`. clone it to /about §"free forever" footer.

- **why this works:** cartesian is sparse because it's a sales letter. we're a learning surface — we have more screens, more states, more moments. the right ratio is 2-3x cartesian's microcopy density, all of it carrying voice, none of it being clever for clever's sake.

---

### Pattern 8 — Founder voice in /about

- **cartesian source (verbatim):** `Crafted with ♥ by Elias Yilma / @ElijahYilma` — that's it. no /about page. no founder paragraph. the entire founder voice is in the heart and the @-handle. confidence-by-restraint.
- **promptdojo current:** `app/about/page.tsx:228-247` — a real founder paragraph. on-brand:
  > i'm josh. i ship python alongside cursor and claude every day for client work. i wrote this because i wanted to learn python the way i actually use python — alongside an llm, fixing what it got wrong, not memorizing what it already knows. every other course felt like a museum tour. this one is the workshop floor.
  >
  > built solo. open source. free forever. follow the build at @TFisPython.
  there's a `TODO(josh)` at line 228 noting the credential sentence is provisional.
- **proposed adaptation:** the V3 marketing audit (line 156-158) proposed the credential rewrite. i agree with the structure but tighten further:

  ```
  i'm josh. ai consultant. i ship python with cursor and claude
  every day for client work. i wrote this because every other
  course felt like a museum tour and i wanted the workshop floor.
  ```

  three sentences. three facts. drops `the way i actually use python — alongside an llm, fixing what it got wrong, not memorizing what it already knows` because it's the WHOLE BRAND PROMISE crammed into a clause — that line belongs in the hero, not in the founder paragraph. the founder paragraph should answer "is this person real" in 4 seconds, not re-pitch the product.

  **second paragraph stays mostly as-is**, with one swap: drop `built solo. open source. free forever.` (those facts are everywhere else on the page) and replace with a recency anchor:

  ```
  i ship to this site weekly. follow the build at @TFisPython.
  ```

  cartesian's `Crafted with ♥` works because cartesian sells a textbook with implied academic credibility. we have to do the work cartesian skips — but tighter than today.

- **why this works:** the existing paragraph is good but does too much. the proposed version is two sentences shorter, one fact tighter, and ends with a relationship CTA (the X follow) instead of a self-summary.

---

### Pattern 9 — "Watch the film" (non-marketing video invitation)

- **cartesian source (verbatim):** `Watch the film.` — three words, display serif, period. labels the YouTube embed below.
- **promptdojo current:** no demo video on the live site. if/when one ships, the placeholder is something like "watch the trailer" or "see how it works."
- **proposed adaptation:** when the demo video lands (V4 or later), the label is:

  ```
  watch the run.
  ```

  three words, lowercase, period. `run` is the verb. `the run` is the artifact — what python does in the browser is "a run." not a "demo," not a "tour," not a "trailer." the video shows code running. the label says so.

  alternatives ranked by voice fidelity:
  1. `watch the run.` (best — single word matches the verb on every IDE button)
  2. `here's the trace.` (good — agentic, references the agent-trace pattern)
  3. `90 seconds. python in browser.` (good — specific, time-anchored, no instruction word at all)

- **why this works:** cartesian called their video "the film" because the embed is an illustrated short, not a screencast. ours is a screencast — call it what it is. `the run` carries dual meaning (a python execution + a long-distance habit) without working too hard.

---

## Specific copy rewrites (the meat)

### Surface 1 — homepage hero

- **current** (`app/page.tsx:104-110, 122-128`):
  ```
  ai writes this.
  it's wrong.

  a python school for the version of you that lives in cursor.
  25 chapters · 624 interactive steps · runs in your browser · free forever.

  [start chapter 1 →]   [or pick your chapter ↓]
  ```
- **proposed:**
  ```
  ai writes this.
  it's wrong.

  a python school for the version of you that lives in cursor.
  25 chapters · 624 runnable steps · runs in your browser · forever.

  [start chapter 1 →]
  ```
- **1-line why:** swap `interactive` for `runnable` (V3 line 243 already flagged). swap `free forever` for `forever` — the `free` is implied by everything else on the page, the `forever` is the single-word brand promise. demote tertiary CTA to a small text link 60px below.

### Surface 2 — homepage `$0 forever` price band

- **current** (`components/PriceBand.tsx`):
  ```
  $0
  FOREVER
  no login · no streaks · no upsell · open source
  ```
- **proposed:**
  ```
  $0.
  forever.
  no login · no streaks · no upsell · open source
  ```
- **1-line why:** lowercase the eyebrow (`forever` not `FOREVER` — uppercase is shouting per VOICE.md). add periods to both. the period is the brand's confidence tell.

### Surface 3 — about-page hero CTA

- **current** (`app/about/page.tsx:112, 322`):
  ```
  start the course →
  ```
- **proposed:**
  ```
  start chapter 1 →
  ```
- **1-line why:** V3 line 247 flagged this. `the course` is generic; `chapter 1` is specific. the CTA copy must match across surfaces or it reads as inconsistent. align /about to /'s wording.

### Surface 4 — about-page founder block

- **current** (`app/about/page.tsx:230-247`):
  ```
  i'm josh. i ship python alongside cursor and claude every day for client work.
  i wrote this because i wanted to learn python the way i actually use python —
  alongside an llm, fixing what it got wrong, not memorizing what it already
  knows. every other course felt like a museum tour. this one is the workshop floor.

  built solo. open source. free forever. follow the build at @TFisPython.
  ```
- **proposed:**
  ```
  i'm josh. ai consultant. i ship python with cursor and claude every day for
  client work. i wrote this because every other course felt like a museum tour
  and i wanted the workshop floor.

  i ship to this site weekly. follow the build at @TFisPython.
  ```
- **1-line why:** tighter, ends on a relationship CTA, drops the brand-promise clause (`the way i actually use python — alongside an llm, fixing what it got wrong`) which belongs in the hero — not duplicated here.

### Surface 5 — about-page §"free forever"

- **current** (`app/about/page.tsx:256-264`):
  ```
  $0. open source. no upsell. ever.

  there is no paid tier. no premium chapters. no certificate-store. login is
  optional and only saves your progress across devices — it doesn't unlock
  anything. the source is on github. fork it. break it. open a pr.
  ```
- **proposed (replace prose paragraph with cartesian-style stack):**
  ```
  $0. open source. no upsell. ever.

  no paid tier.
  no premium chapters.
  no certificate store.
  no streak shame.
  no email list.
  no upsell.
  open source.
  forever.

  fork it. break it. open a pr.
  ```
- **1-line why:** the prose paragraph is a wall; the cartesian-style stack is a poem. each `no X.` is a specific dread addressed. the closing `fork it. break it. open a pr.` keeps the existing voice while letting the litany do the heavy lifting.

### Surface 6 — about FAQ datestamp

- **current:** none.
- **proposed:** under the FAQ section h2, add:
  ```
  last revised 2026-05-06
  ```
- **1-line why:** cartesian's `Updated May 8, 2025` is a 4-word trust signal. ours costs one component edit and signals "this is maintained."

### Surface 7 — login modal subhead

- **current** (`components/LoginToSave.tsx:236`): button label `login to save`. modal opens with no subhead context.
- **proposed:** add directly under the modal title:
  ```
  optional. progress already saves to this browser.
  ```
- **1-line why:** the modal's biggest doubt is "are you about to gate me?" answer it before the form fields render.

### Surface 8 — homepage footer

- **current** (`app/page.tsx:211-215`):
  ```
  press ⌘⇧B anywhere to park a thought without losing your place.
  last commit 2026-05-06 · changelog
  ```
- **proposed:**
  ```
  press ⌘⇧B anywhere to park a thought without losing your place.
  shipped 2026-05-06 · changelog · github · @TFisPython
  ```
- **1-line why:** `last commit` is git-language; `shipped` is brand-language. add github + X handles to the footer so every page closes with the four anchor identities (commit date, changelog, source, x).

### Surface 9 — onboarding intro

- **current** (`app/onboarding/page.tsx`):
  ```
  you're going to learn python.
  ai is your co-pilot, not your crutch. you'll learn the shapes you need to
  direct it, read it, and catch when it's wrong.
  five questions. under a minute. then you write code.
  [start]
  ```
- **proposed:**
  ```
  you're going to learn python.
  ai is your co-pilot, not your crutch. you'll learn the shapes you need to
  direct it, read what it wrote, and catch when it's wrong.
  five questions. under a minute. then you ship code.
  [start]
  ```
- **1-line why:** two surgical word swaps. `read it` → `read what it wrote` (the brand's wedge phrase, used 3x on the home page). `you write code` → `you ship code` (builder-class slang per VOICE.md). leaves the structure intact.

### Surface 10 — changelog intro

- **current** (`app/changelog/page.tsx`):
  ```
  what shipped, when. the source is on github; this is the prose version.
  ```
- **proposed:**
  ```
  what shipped, when.
  the source is on github. this is the prose version.
  ```
- **1-line why:** break into three sentences. the semicolon is doing connective work the voice doesn't want — confident voice uses periods. each sentence stands.

### Surface 11 — every chapter overview page (when shipped per V3 fix #7)

- **current:** does not exist yet.
- **proposed template:**
  ```
  ch 07 · phase 01 · foundations

  mutable default args ship in 1 of every 47 ai-written functions.

  [bug snippet]

  3 lessons · 15 steps · ~6 min

  [start chapter 7 →]
  ```
- **1-line why:** chapter pages are the per-chapter screenshot library. each one is a thesis tweet with a URL behind it. lowercase eyebrow (`ch 07 · phase 01 · foundations`), one-line thesis as the headline, one bug snippet, lesson count, single CTA. this is cartesian's section-feature pattern compressed into a chapter overview.

---

## Anti-feature litany — final form

**current:** `no login · no streaks · no upsell · open source`

**proposed:** keep the four-token homepage version EXACTLY AS-IS. it's the cleanest single-frame meme on the site (per V3 marketing). don't touch it.

what changes is the /about expanded version (Surface 5 above) — eight lines, vertical stack, two positive closes (`open source.` `forever.`).

**reasoning:** two versions for two contexts.
- the homepage band is for screenshots → horizontal pill, four tokens, optimized for cropping.
- the about page is for readers → vertical stack, eight lines, optimized for rhythm.

cartesian does both — `Buy Once. Own Forever.` is the headline (horizontal-feel even though stacked), the six `No X.` lines below are the rhythm.

**rhythm test:** read the eight-line stack out loud. each line is 2-4 syllables. the closing two lines (`open source. / forever.`) are the relief beat after six negations. that's the cartesian move — six no's earn one yes, then one promise.

---

## CTA hierarchy — single CTA proposal

**the ONE button:** `start chapter 1 →`

**where it lives:** dead center of the homepage hero, ~80px clear space below it before any other competing element. only CTA above the fold.

**what gets demoted:**

| element | current location | proposed location |
| --- | --- | --- |
| `or pick your chapter ↓` | side-by-side with primary CTA (`app/page.tsx:128`) | small dim text link, 60px below primary, no button styling |
| `[★ 0 · committed Xh ago]` | header, every page (`SiteHeader.tsx:24`) | hide entirely below 10 stars (V3 fix #6); replace with `view source · shipped Xh ago` text-only link |
| `[login to save]` | header, every page (`SiteHeader.tsx:26`) | demote to footer when no profile exists; promote to header when profile exists |
| `[follow @TFisPython on x]` | header, every page (`FollowOnXPill.tsx:20`) | keep in header — this is the relationship CTA per V3 marketing line 195. ONE non-content header CTA. |
| `[❯ what is this?]` | header (`app/about/page.tsx:99` link) | hide on viewport <600px; the wordmark itself routes to /about on mobile |

**post-cleanup, first paint of /:**
- header: `[wordmark]` `[view source · shipped Xh ago]` `[follow @TFisPython on x]`
- hero: `[start chapter 1 →]` ... `↓ all 25 chapters` (small text link)

three header tokens, one primary CTA, one tertiary text link. five total affordances vs current seven. cartesian-discipline applied without copying cartesian's pricing-card structure (we're free, we don't have one).

---

## Don't lift these from Cartesian

1. **Title Case headlines.** `Buy Once. Own Forever.`, `A Comprehensive Treatment.`, `Visualize Everything.` — every Cartesian title is title-cased. lowercase is the brand. no exceptions, no "just this once for emphasis." per VOICE.md line 13: "all-lowercase headlines. always." even product names sometimes (`promptdojo`, never `Promptdojo`).

2. **`Buy Once. Own Forever.` caps energy.** the structure is great, the casing is not. we already adapted this — `$0. forever.` is our version.

3. **Ornate display copy in non-headline surfaces.** cartesian uses Abril Fatface for stat labels, eyebrows, body subheads, six size scales total. that works for letterpress; it suffocates a builder brand. our type stack stays system-only per BRAND.md.

4. **Single-founder byline framing as the brand seal.** `Crafted with ♥ by Elias Yilma` is great for cartesian because cartesian's product is one-author intrinsic. our brand is `built solo` (a fact) but not `crafted by josh ernst` (a seal). josh is the author, not the icon. the X handle does the byline work without ceremony.

5. **The `+` divider between sections.** cartesian's `+` works because the whole page is letterpress. ours would read as twee. use hairline rules or just whitespace.

6. **Mild typos as charm.** cartesian has `techincal` in the FAQ. that's a publishing-house tic. our audience (vibe-coders, PMs) reads typos as "they don't ship clean." no intentional typos, ever.

7. **The exclamation point on `Available for a Limited Time!`** the only place cartesian breaks its own voice. don't replicate the exception. zero exclamation points in our copy. (VOICE.md: one per quarter, max, and only ironically.)

8. **`Watch the film.` exact phrasing.** `film` is cartesian's word — their video IS an illustrated short. ours is a screencast. `watch the run.` is the lowercase-builder equivalent.

---

## Top 12 voice moves ranked

ranked by impact on brand-voice consistency. each is shippable in one PR.

| # | move | surface | effort | impact |
| --- | --- | --- | --- | --- |
| 1 | swap `interactive steps` → `runnable steps` everywhere | hero subhead, statstrip, /about, /curriculum, og descriptions | XS | foundational — kills the codecademy 2014 word |
| 2 | replace `start the course →` with `start chapter 1 →` on /about | `app/about/page.tsx:112, 322` | XS | removes cross-surface CTA inconsistency |
| 3 | lowercase the price band eyebrow (`FOREVER` → `forever.`) | `components/PriceBand.tsx:9` | XS | brings the price band into voice compliance |
| 4 | promote the bug snippet to single-CTA hero (kill side-by-side tertiary) | `app/page.tsx:120-129` | S | one button. one focal point. cartesian-discipline. |
| 5 | rewrite founder paragraph (drop credential-sentence TODO at `:228`) | `app/about/page.tsx:230-247` | S | tightens 5 sentences to 3 + 1 |
| 6 | replace /about §"free forever" prose with 8-line vertical litany | `app/about/page.tsx:258-264` | S | the cartesian "Buy Once" beat in lowercase |
| 7 | reorder FAQ to lead with `is it really free?` then `why not udemy?` | `app/about/page.tsx:62-90` | XS | cartesian-style buyer-priority order |
| 8 | add `last revised 2026-05-06` datestamp under FAQ h2 | `app/about/page.tsx` | XS | trust microcopy at zero cost |
| 9 | extend green-word emphasis pattern to every section title | every `t-section` headline | S | section identity that survives cropping |
| 10 | add login modal subhead `optional. progress already saves to this browser.` | `components/LoginToSave.tsx` modal body | XS | answers the gating doubt before it forms |
| 11 | swap homepage footer `last commit` → `shipped`; add github + x handles | `app/page.tsx:211-215` | XS | builder-class slang + four anchor identities |
| 12 | rewrite onboarding to `read what it wrote` and `then you ship code` | `app/onboarding/page.tsx` | XS | two surgical swaps to align onboarding with hero voice |

**total effort across all 12:** ~4-5 hours of edit work, no new components, no new routes.

**sequencing recommendation:** moves 1-3 + 7-8 + 10-12 (the eight XS items) ship as a single PR `refresh-v4/01-voice-alignment`. moves 4-6 + 9 (the four S items) ship as a second PR `refresh-v4/02-cartesian-structure` because they touch multiple files and need the green-word color decision in `globals.css`.

---

## Closing voice diagnostic

cartesian's voice works because every word is necessary. `Buy Once. Own Forever.` is four words for the entire anti-subscription frame. `Watch the film.` is three words for the video invitation. `Crafted with ♥ by Elias Yilma` is six words for the founder seal. economy + period = confidence.

promptdojo's voice ALREADY has this discipline in pockets — `ai writes this. it's wrong.` is six words for the entire wedge. `forever.` is one word for the price story. `park a thought` is three words for the BrainDump primitive.

what V4 does is propagate that discipline across the surfaces that haven't received it yet:
- the homepage tertiary CTA (delete)
- the about-page CTAs (align)
- the about-page free-forever prose (litany-ify)
- the FAQ order (priority-sort)
- the onboarding copy (sharpen two verbs)
- the section headlines (one green word each)
- the founder paragraph (cut a clause)
- the microcopy density (modal subheads, footer anchors, datestamps)

every promptdojo line should pass the cartesian out-loud test: read it, then read cartesian's nearest equivalent. if cartesian's reads tighter, rewrite. if ours does, ship.

---

**Brand Guardian**
**Audit date:** 2026-05-06
**Bar from the brief:** every promptdojo line should feel like the same person who shipped cartesian wrote it — lowercase, builder-class, no apology.
**Status:** voice thesis set. 12 moves ranked. 11 specific copy rewrites with file:line citations. ready for implementation handoff.
