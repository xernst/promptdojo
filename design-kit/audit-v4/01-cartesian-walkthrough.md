# Cartesian.app — Deep Walkthrough for V4 Refresh Inspiration

**Source URL**: https://cartesian.app/
**Captured**: 2026-05-06
**Screenshots**: `~/Developer/code-killa/design-kit/audit-v4/screenshots/cartesian/`
**Tool**: agent-browser CLI (CDP) at 1920×1080@2x retina; spot-checks at 1280, 768, 375.

---

## What is Cartesian (3-second read)

Cartesian is a **paid downloadable interactive book** ($35, was $59) that teaches Data Structures & Algorithms through embedded Python execution, animated visualizations, and challenge problems. Solo built by **Elias Yilma** (@ElijahYilma). Native desktop app for MacOS / Windows / Linux. The site is a single-page sales letter with a hero, five feature blocks, a stats row, a complete chapter accordion, a "buy once / no subscriptions" pitch, three pricing cards, an institutional license, and a FAQ. No login, no signup, no dashboard — purchase → download. **Same shape as Promptdojo**: educational, beginner-friendly, fundamentals-focused, opinionated voice, single founder. **Different positioning**: paid premium product vs. Promptdojo's free open-source.

---

## Design system — extracted hex / fonts / sizes

| Property | Value | Where observed |
| --- | --- | --- |
| Background primary (page) | `#E4E3E2` (rgb 228,227,226) | body bg, full-page warm light gray |
| Background card / paper | `#F5F1EB` (rgb 245,241,235) | pricing cards, OS spec tiles |
| Background nav (glass) | `rgba(255,255,255,0.2)` + `backdrop-filter: blur(10px)` | floating top nav pill |
| Background nav button (FAQs) | `#5D5250` (rgb 93,82,80) | FAQs pill button |
| Foreground primary text | `#494949` (rgb 73,73,73) | body, h1, h3 |
| Foreground secondary | `#666666` (rgb 102,102,102) | feature descriptions |
| Foreground tertiary / meta | `#999999` (rgb 153,153,153) | spec text under OS names |
| Accent: coral CTA | `#FB6A59` (rgb 251,106,89) | Purchase button |
| Accent: tomato display | `#FE491C` (rgb 254,73,28) | "Interactive" word in h1 |
| Accent: stat blue | `#3B69FF` (rgb 59,105,255) | "670+", "22", "300+" stat numbers |
| Accent: highlight red 2 | `#FF5F5F` (rgb 255,95,95) | "Visualize" section title |
| Accent: highlight purple | `#BD4ABD` (rgb 189,74,189) | "Playback" section title + Multi Platform Bundles |
| Accent: highlight green | `#4DCB7D` (rgb 77,203,125) | "Test", "Edit" section titles |
| Accent: highlight magenta | `#C54DCB` (rgb 197,77,203) | "Test." in "Edit. Run. Test." |
| Accent: pink-coral header | `#FF6B47` (rgb 255,107,71) | "Purchase" pricing card title |
| Accent: lavender header | `#B36DFF` (rgb 179,109,255) | "Multi Platform Bundles" pricing title |
| Card border | `1px solid #4B4B4B` (rgb 75,75,75) | all pricing cards, OS spec tiles — square corners |
| Box shadow (nav) | `rgba(0,0,0,0.1) 0px 4px 10px 0px` | floating nav pill |
| Border-radius nav pill | `50px` | top floating navbar |
| Border-radius button | `20px` (Purchase), `25px` (FAQs) | CTAs are pill-shaped |
| Border-radius pricing card | `0px` (square corners) | print-receipt aesthetic |
| Font display (primary) | `"Abril Fatface"` 400/700 | h1 (71.68px), h3, stat numbers, all section titles |
| Font display (secondary) | `Recoleta` 400 | "A Comprehensive Treatment." h1 (49.6px) |
| Font body | `"SF Pro Display"` 400/600 | feature descriptions, FAQ text — falls back to system sans |
| Font mono (code in panels) | `"Cascadia Code"` 200-700 | code block in editor.png frame (loaded via @font-face) |
| Font alt serif | `"Bodoni Moda"` 400-900 var | loaded but not visibly used (likely fallback) |
| h1 hero size | 71.68px | "The Interactive Handbook…" |
| h1 hero line-height | 71.68px (1.0 — extremely tight) | hero, all big section titles |
| h1 hero weight | 700 | hero |
| h1 letter-spacing | normal (0) | hero — the display serif is dense already |
| Section feature title | 59.2px | "Visualize Everything." |
| h1 stat | 56px | "670+" — Abril Fatface 500 |
| h2 secondary section title | 49.6px Recoleta | "A Comprehensive Treatment." |
| h3 section title | 40.32px | "Buy Once. Own Forever.", "Free Updates for Life." |
| h2 pricing card title | 42px | "Purchase" / "Multi Platform Bundles" |
| Body large paragraph | 22.4px (display Abril) | hero subline "Learning the fundamentals shouldn't be a chore." (yes — body uses SERIF here) |
| Body description | 19.2px / line-height 1.5ish, weight 600, SF Pro | feature bullet rows |
| Body small (TOC items) | 16px, weight 400 | accordion list item text |
| Stat label | 20.8px Abril Fatface 400 | "Interactive Pages", "Comprehensive Chapters" — serif label under number |
| Cta button text | 16px / 600 | Purchase, FAQs |
| Cta button padding | 10px 20px | both nav CTAs |
| OS spec tile | 13.33px / 400 / system sans | small tiles inside pricing card |
| Update meta (FAQ date) | 20px / 400 SF Pro | "Updated May 8, 2025" |
| Footer copyright | 12px / 400 | "Copyright © 2025 by Elias Yilma" |
| Section vertical rhythm | ~120-180px between major sections | full-page scroll |
| Page max-width | ~1100px main panel container | 1920 viewport leaves big margins |
| Section side padding | `0 15px` | `.section` class |
| Accordion content | `transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1)` | TOC + FAQ expand |
| Accordion icon | `transition: transform 0.3s cubic-bezier(0.4,0,0.2,1)` rotates 45deg ("+"→"x") | TOC + FAQ |
| Nav pill | `transition: background 0.3s, top 0.3s` | shrinks/hides on scroll |
| Heart icon | `@keyframes heartbeat` | "Crafted with [♥] by Elias Yilma" |
| Stylesheets loaded | boxicons, Outfit (Google), FA6, Abril Fatface (Google), Recoleta (cdnfonts), Bodoni Moda + Cascadia Code (Google), SF Pro Display (cdnfonts) | 7 external CSS bundles |
| Iconography | Boxicons (`bx-book`, `bx-message-detail`) for nav; Font Awesome 6; small inline SVG/PNG OS logos | mixed-source, no custom set |
| Imagery strategy | **Pre-rendered framed PNGs/GIFs** with chrome baked in — no CSS window mockups | `visualisation.gif`, `playback.gif`, `editor.png`, `space_time3.png`, `foot_guys.png` |

---

## Per-surface walkthrough

The site is **single-page**. There's no /pricing, /about, /docs, /signup. A 404 (e.g. `/this-is-a-fake-page-404`) silently rewrites to home (Cloudflare-style fallback — see `cartesian-404.png`). All "navigation" is in-page anchor scrolls.

### 1. Floating nav pill (`cartesian-nav-1920.png`, fixed across scroll)

- **Layout**: One floating glass pill, fixed top:10px, centered via `transform: translateX(-50%)`. Width 1020px on desktop, ~32px tall + 32px padding = ~64px overall.
- **Contents** (left → right): book icon (Boxicons `bx-book`, links to top), `[FAQs]` pill (dark warm-gray bg, light gray text), `[Purchase]` pill (coral bg, white-ish text)
- **Visual feel**: like a Mac OS Tahoe / iPhone Dynamic Island — translucent glass pill floating over content. The blur is subtle (10px), the shadow is soft.
- **Mobile**: same pill, takes full width with margin, hamburger replaced by just the book icon (no menu).

### 2. Hero (`cartesian-home-1920-fold.png`)

- **Eyebrow**: none (unusual — no "Now available" or "Released 2025")
- **H1** (Abril Fatface 71.68px / 700, two lines centered):
  > "The **Interactive** [book-icon] Handbook on Data Structures and Algorithms"
  - "Interactive" is colored `#FE491C` (tomato). Inline book icon sits between "Interactive" and "Handbook" — weirdly cute, treats the icon like part of the headline.
- **Tagline (sub-h1)** in `Abril Fatface 40.32px`:
  > "Learning the fundamentals shouldn't be a chore."
  - **Critical observation**: the subline IS ALSO the display serif — not a sans-serif sub. This is a strong choice — the whole hero is "newspaper headline" feel.
- **Body description** (system sans, ~16-22px, ~75-char width centered):
  > "This one-of-a-kind interactive book offers a hands-on approach to learning data structures and algorithms, featuring rich visualizations, code execution playback, an assortment of problems and an embedded Python environment. It's designed to support both beginners and more experienced learners through active exploration and interactivity."
- **CTA**: single coral pill `[Purchase $35 ~~$59~~]` — the strikethrough old price is inside the button itself, smaller and right-aligned. **One CTA only.** No "Learn more" or "Free preview" competing.
- **Below CTA**: "Watch the film." (Abril 40.32px) — labels the YouTube embed below.
- **YouTube embed**: `0AnbRhdWuAU` — a hand-illustrated isometric city scene where each building/element corresponds to a data structure (graphs, trees, hash tables, queues). The thumbnail itself is high-charm illustration.
- **Vertical rhythm in hero**: H1 → tagline (~30px gap) → description (~30px) → CTA (~30px) → "Watch the film." (~60px). Generous but not luxurious.

### 3. Feature section: "Visualize Everything." (`cartesian-features-1920.png`)

Pattern repeats 5 times for: Visualize / Code Playback / Test Your Might / Edit. Run. Test. Repeat. / Master Space-Time. Each follows:

- **Two-column row**, asymmetric. Title + bullet text on one side (~40-50% width), framed visual on the other (~50%).
- **Title format**: `<colored display word> <plain finish>.` — eg `<span style="color:#FF5F5F">Visualize</span> Everything.`
- **Each section uses a different highlight color** for the colored word: red, purple, green, green/red/magenta tri-color, soft red. **No dot grid system or design tokens** — just `style="color:rgb(...)"` inline per word.
- **Bullets are not bullets**: they're just stacked `<p class="feat-description">` lines, no marker, line-height ~1.5, with extra paragraph spacing. Reads like a magazine list.
- **The framed visual**: a GIF (visualisation, playback, questions) or PNG (editor, space_time3) with the **window chrome baked into the image** — a soft cream/gray bezel, dotted/grid background visible inside the panel. Not recreated in CSS. Looks like screenshots taken from inside the actual app, then matted on a paper background.
- **Alternation**: text-left/image-right and text-right/image-left alternate every section. (Confirmed visually in `cartesian-home-1920-full.png`.)

### 4. Stats row + Comprehensive Treatment (`cartesian-stats-row-1920.png`)

- **H1 secondary**: "A Comprehensive Treatment." — Recoleta 49.6px, 500. **Different display font from the hero** — quieter, more elegant, paired with the data row.
- **Stats**: 5 numbers in a row, all `Abril Fatface 56px` in `#3B69FF` brilliant blue:
  - `670+` Interactive Pages
  - `22` Comprehensive Chapters
  - `300+` Customizable Visualizations
  - `100+` Solved Problems
  - `250+` Interactive Code Snippets
- **Labels under each stat**: Abril Fatface 20.8px / 400 (smaller serif) — labels are also serif, not sans. Stack 2-3 lines tall ("Interactive\nCode\nSnippets").
- **Critical**: the labels stay tiny, the numbers dominate. Blue against the warm cream bg pops without feeling jarring (cool blue against warm gray).

### 5. Table of Contents accordion (`cartesian-stats-row-1920.png`, lower half)

- **H1**: "Table of Contents" — Abril Fatface 71.68px (same size as hero h1) — left-aligned this time.
- **22 chapters** as accordion items, full-width rows. Each row:
  - `+` icon (left, 30px) + `1. Complexity Analysis` (chapter name, 16px+).
  - Click → expands with smooth max-height transition, `+` rotates 45° → `x`.
  - Content: 2-3 line description in 16px / 400 / dark gray.
- **Visual**: hairline horizontal rules between rows — feels like a physical book's index page. No card boxes, no background, no shadow.
- **Why it works**: This serves as both content scroll-bait AND a reference. Browsing the chapter list converts skeptics — it's the syllabus.

### 6. "Buy Once. Own Forever." (`cartesian-buy-once-1920.png`)

- **H3**: "Buy Once. Own Forever." — Abril Fatface 40.32px, centered.
- **Body**: 6 stacked single-line statements (700 weight, `#666666`, ~22px), one per line, all centered:
  > No Subscriptions.
  > No In-App purchases.
  > No Signups.
  > No Tracking.
  > No DRM.
  > Accessible Offline.
- **Divider**: literally a "+" character. Not an `<hr>`. Just a `+` between this block and the next.
- **H3**: "Free Updates for Life." (with "Updates" emphasized via `.highlight-red` class — though here it's actually rendered same color)
- **Tiny meta line**: "Planned updates include additional solved problems and interactive content, Dark Mode, Improved QOL features, Support for more programming languages and more…"
- **Why it works**: addresses subscription-fatigue and DRM-fear without saying those words. The "No X." litany is poetic and rhythmic.

### 7. Pricing cards (`cartesian-pricing-1920.png`, `cartesian-pricing-card-detail.png`, `cartesian-pricing-mobile.png`)

- **Section pre-title** (Abril 40.32px): "The Interactive [book-icon] Handbook on Data Structures & Algorithms" — same brand reaffirmation
- **3-card row** at desktop, stacked at mobile:
  1. **Purchase** (orange title): ~~$59~~ → **$35** Personal License → 3 OS tiles (MacOS, Windows, Linux) with logo + minimum spec text
  2. **Multi Platform Bundles** (purple title): same ~~$59~~ → **$35**, "Available for a Limited Time!", 2 tiles (Universal / MacOS+Windows)
  3. **Preview Free Chapter** (gray title): no price block, same 3 OS tiles
- **Card chrome**: `1px solid #4B4B4B`, paper-cream `#F5F1EB` bg, **square corners**, no shadow. The OS tiles inside are also square-bordered. Very print/letterpress aesthetic.
- **Below the row**, centered: a single small **Institutional License** card with envelope icon + "Contact Me — Suitable for Schools, Universities, Businesses, and Other Institutions"
- **No comparison table**, no checkmark feature lists per tier. The differentiation is entirely about platform coverage and price elasticity.

### 8. FAQs (`cartesian-faqs-1920.png`)

- **H1**: "FAQs" — Abril Fatface 71.68px, left-aligned.
- **Sub-meta**: "Updated May 8, 2025" — 20px SF Pro 400, gray.
- **Same accordion as TOC**: `+` icon + question, expand to reveal 2-4 line answer. Hairline rules between.
- **9 questions** (verbatim — see Content patterns section below).
- **Fixed footer below FAQs**:
  - Tiny pixel-art illustration: 4 stick-figure students looking at a presentation with shapes (the 300×75 PNG `foot_guys.png`)
  - "Crafted with [♥, animated heartbeat] by Elias Yilma / [@ElijahYilma]" (the @-handle is a blue link — the only un-styled blue link on the whole page; default browser styling)
  - "Privacy Policy | Terms of Use" (14px gray)
  - "Copyright © 2025 by Elias Yilma" (12px)

### 9. 404 (`cartesian-404.png`)

URL `/this-is-a-fake-page-404` resolves to the home page (page title and content unchanged). **Silent fallback, no /404 page**. Treats single-page as canonical.

---

## Design patterns worth lifting (the meat)

### Pattern 1 — The colored-display-word + plain-finish title

- **Where**: every feature section title (`<span color>Visualize</span> Everything.`)
- **What makes it work**: A two-tone title where ONE word carries the color and the rest is the same heavy serif in dark gray. Reads like a magazine pull-quote. Creates section identity (the colored word becomes a label) without an eyebrow + title pattern. Cheaper visual cost than full gradient text. Works because the display serif (Abril Fatface) already commands attention — the color is just a flag.
- **How it could land in Promptdojo**: `<colored>vibe</colored> coding.` `<colored>build</colored> things.` `<colored>ship</colored> python.` Apply it to any chapter heading or value-prop title to get instant visual hierarchy without needing eyebrows or kickers.

### Pattern 2 — Floating glass nav pill with one primary CTA

- **Where**: top of every viewport, fixed-position
- **What makes it work**: tiny surface (~64px tall × ~1020px wide on desktop), three elements only (logo, secondary action, primary action), heavy `backdrop-filter: blur(10px)` against the warm cream bg makes it feel premium. Pill shape + 50px radius is the iPhone Dynamic Island move. The dark FAQs button + bright coral Purchase button creates clear CTA hierarchy.
- **How it could land in Promptdojo**: replace any current full-bleed nav with a pill. lowercase-style version: `[pyloft]` book icon + `[discord]` + `[install]` (where install is the primary coral). Floats on the warm Promptdojo background.

### Pattern 3 — "Buy Once. Own Forever." anti-subscription litany

- **Where**: between TOC and pricing
- **What makes it work**: rhythmic short-line poetry. Six "No X." lines stacked centered, all weighted equally, each addressing a specific dread (subscription, DRM, signup, tracking). It's not a feature comparison — it's an emotional reset. Plus the "+" separator instead of `<hr>` is unhinged and great.
- **How it could land in Promptdojo**: `pyloft is.` then stacked: `free.` `open source.` `no signup.` `no tracking.` `no upsell.` `forever.` (or whatever Promptdojo's actual values are — the BG founder's anti-Coursera posture maps perfectly).

### Pattern 4 — Pre-rendered framed visuals (skip the CSS window chrome)

- **Where**: every feature row's right-column visual
- **What makes it work**: instead of recreating a code editor / browser / app window in CSS (which is fiddly and never quite right), Cartesian takes screenshots from inside the actual product, mats them on a soft paper background with a pencil-line frame, and exports as a GIF or PNG. The viewer immediately reads "this is a real software window" without you needing to build chrome.
- **How it could land in Promptdojo**: every feature visualization on Promptdojo is a screenshot of Cursor, Claude, or actual Python output. Frame each one with a 1px hairline border + ~20px paper-cream padding + a soft drop shadow on the wrapper, OR bake the frame into the screenshot itself. Stop recreating IDE chrome in CSS.

### Pattern 5 — Stat row in display serif blue

- **Where**: "A Comprehensive Treatment." section
- **What makes it work**: 5 large display-serif numbers in cool brilliant blue against the warm cream bg = beautiful color tension. Labels stay tiny and below each number so the numbers dominate. The "+" suffix on most stats is a nice tease ("670+ pages, this thing is dense"). No icons, no animation, just typography doing all the work.
- **How it could land in Promptdojo**: Stats like `7+` chapters, `100+` exercises, `0` cost, `4.9/5` (if it had ratings). lowercase labels under big serif numbers. The blue-on-cream contrast translates directly.

### Pattern 6 — Single-CTA hero with strikethrough price baked in

- **Where**: hero CTA `Purchase $35 ~~$59~~`
- **What makes it work**: ONE button, not two competing ones. The strikethrough old price lives INSIDE the button, smaller and right-aligned, telling the discount story without a separate "Save 40%!" badge. No "Learn more" link nearby — the page itself is the learn-more.
- **How it could land in Promptdojo**: Promptdojo is free, so the analog is `[install pyloft]` as the only CTA. Resist the temptation to add `[learn more]` or `[github]` next to it. Or borrow the structure for a "buy me a coffee" surface later: `[support pyloft $5 ~~$5/mo~~]`.

### Pattern 7 — Accordion-based TOC as a chapter syllabus

- **Where**: "Table of Contents" — 22 numbered chapters, each expandable to a 2-line description
- **What makes it work**: it doubles as social proof (look how comprehensive), preview (read a chapter description without buying), and SEO content (22 chapter names in the DOM = search hits). Hairline rules instead of cards keep it textbook-quiet. Smooth max-height + 45° icon rotation feels native.
- **How it could land in Promptdojo**: Pyloft's curriculum chapters as an accordion list. Each chapter's expanded view is a 2-3 line description of what you'll learn. This replaces a "course outline" graphic with something better.

### Pattern 8 — "+" as a section divider

- **Where**: between "No DRM. Accessible Offline." and "Free Updates for Life."
- **What makes it work**: it's NOT an `<hr>`, it's just a centered "+" character. Refuses standard divider conventions. Tiny, charming, signals "and also."
- **How it could land in Promptdojo**: Use `+` (or `→`, or `&`) as transitional dividers between value-prop blocks instead of `<hr>`. Aligns with Promptdojo's lowercase / restrained voice.

### Pattern 9 — Different highlight color per pricing card title

- **Where**: "Purchase" (coral), "Multi Platform Bundles" (purple), "Preview Free Chapter" (gray)
- **What makes it work**: instead of "highlight the recommended tier" with a yellow ring or "Most Popular" badge, the colors give each card identity without ranking them. The free-preview being gray (not coral) signals "this is the lower-stakes path" without being lower-quality.
- **How it could land in Promptdojo**: if/when Promptdojo has tiers (Free / Coffee Tier / Cohort), use different display colors for each title rather than a "Most Popular" ribbon.

### Pattern 10 — Hairline-rule list, no cards

- **Where**: TOC accordion, FAQ accordion, pricing OS tiles
- **What makes it work**: borders without backgrounds keep the page feeling like a single piece of paper. Cards-with-shadows would chop the page into floating boxes. Cartesian instead uses 1px borders on a cream paper bg — letterpress, archival, intentional.
- **How it could land in Promptdojo**: replace any heavy card-with-shadow grids with hairline-rule rows for lists (chapter list, FAQ, install steps). Reserve cards for actual purchase tiers.

### Pattern 11 — "Watch the film." labeled YouTube embed

- **Where**: above the YouTube iframe
- **What makes it work**: calling it a "film" instead of "video" or "demo" is voice-positive. Three words. Display serif. The illustrated city thumbnail does the rest.
- **How it could land in Promptdojo**: if/when there's a demo video, the eyebrow is something like `watch the demo.` or `here's a tour.` — keep it 2-3 words, lowercase, present tense.

### Pattern 12 — Micro pixel-art footer signature

- **Where**: above "Crafted with ♥ by Elias Yilma"
- **What makes it work**: a tiny 300×75 illustration of stick-figure students looking at a chart-on-presentation. Adds personality at the very end without taking real estate. The `@keyframes heartbeat` on the heart emoji = small motion delight.
- **How it could land in Promptdojo**: Promptdojo could put a tiny doodle in the footer (a Python snake illustration, an anti-bootcamp cartoon, a Cursor IDE icon, whatever). Plus an animated heartbeat on a `[♥]` next to "made with love by josh ernst."

### Pattern 13 — Strikethrough discount inside the button

- **Where**: hero CTA, pricing cards
- **What makes it work**: the old price lives INSIDE the button (or above the new price in cards), as a smaller strikethrough span. Keeps everything in one focal point. No separate "Save $24!" badge needed.
- **How it could land in Promptdojo**: not directly applicable to free product, but if there's ever a paid tier, the pattern travels.

### Pattern 14 — Display serif EVERYTHING (not just titles)

- **Where**: hero subline ("Learning the fundamentals shouldn't be a chore."), stat labels, "Buy Once. Own Forever.", footer pricing pretitle
- **What makes it work**: most sites pair big display + sans body. Cartesian uses the display serif for AT LEAST SIX size scales: hero (71.68), section (59.2), stats (56), pricing card title (42), section subhead (40.32), stat label (20.8). The body sans is reserved only for prose paragraphs. This makes the whole page feel like a single typeset document, not a SaaS landing page.
- **How it could land in Promptdojo**: extend the display family deeper — use it for stat labels, section subheads, pricing card titles, eyebrow taglines. Reserve sans only for prose / inputs / code.

### Pattern 15 — Anti-feature feature list ("No X.")

- **Where**: "Buy Once. Own Forever." block
- **What makes it work**: leads with what the product DOESN'T have. In a category drowning in feature creep, this is differentiation by subtraction. Each "No X." is a relief.
- **How it could land in Promptdojo**: Promptdojo's anti-Coursera positioning maps cleanly. `no certificates.` `no homework deadlines.` `no email gating.` `no upsell.` `no zoom calls.` `no stress.`

---

## Content patterns worth lifting

### Voice qualities

- **Sentence-case display headlines** with a single colored word for emphasis. ("**Visualize** Everything." not "Visualize Everything")
- **Period-terminated short titles**: "Visualize Everything." "Code Playback." "Test Your Might." "Master Space-Time." Each ends with a full stop. Confident, declarative.
- **Tagline as a vibe statement, not a feature claim**: "Learning the fundamentals shouldn't be a chore." — speaks to the reader's frustration, not the product's features.
- **Mixed register**: "Test Your Might." (Mortal Kombat / arcade reference!) sits next to "Master Space-Time." (physics-y) — playful, not corporate.
- **Mild typos preserved**: "techincal" in "techincal interviews" — the page feels human, not over-polished.
- **"Crafted with ♥ by ElixYilma"**: explicit single-author attribution, with handle linked.

### Hero copy (verbatim)

- H1: `The Interactive [book-icon] Handbook on Data Structures and Algorithms`
- Tagline: `Learning the fundamentals shouldn't be a chore.`
- Description: `This one-of-a-kind interactive book offers a hands-on approach to learning data structures and algorithms, featuring rich visualizations, code execution playback, an assortment of problems and an embedded Python environment. It's designed to support both beginners and more experienced learners through active exploration and interactivity.`
- CTA: `Purchase $35 $59` (with $59 strikethrough)
- Sub-CTA label: `Watch the film.`

### Section feature title patterns (verbatim)

- `Visualize Everything.` (red)
- `Code Playback.` (purple "Playback")
- `Test Your Might.` (green "Test")
- `Edit. Run. Test. Repeat.` (each word separately colored: green / red / magenta / dark)
- `Master Space-Time.` (red "Master") — a complexity-analysis pun

### Anti-subscription block (verbatim)

```
Buy Once. Own Forever.

No Subscriptions.
No In-App purchases.
No Signups.
No Tracking.
No DRM.
Accessible Offline.

+

Free Updates for Life.
```

### FAQ questions (verbatim — the order matters, this is the priority of buyer doubts)

1. What makes this book different from other resources?
2. Who is this book for?
3. What are the recommended system requirements to use the book?
4. Do I need an internet connection to use the book?
5. Will I have access to future versions of the book?
6. How do I get updates for the book?
7. Is there a refund policy?
8. What should I do if I encounter a bug?
9. What will future updates for the book include?

### "Who is this for?" answer (verbatim — masterclass in audience inclusion)

> "This book is perfect for several audiences: Students and self-learners can use it to understand fundamental concepts in an engaging manner. Those who are preparing for their techincal interviews, can benefit from a comprehensive but succinct treatment of all topics they might encounter during their interviews. The challenges and their corresponding interactive solution guides will also prove invaluable for those pressed for time. Finally, the book can be also used as a dependable reference for experienced developers and competitive programmers."

Notice: 4 distinct audience personas in 4 sentences — students, interview-preppers, time-pressed, experienced devs. Each gets a use-case sentence.

### Differentiation claim (verbatim)

> "The book prioritizes active learning as opposed to reading swaths of information. The reading material has been thoughtfully supplemented with interactive diagrams that allow for the reader to actively engage with the concepts discussed. Unlike regular computer science textbooks of the same vein, all of the code fragments and diagrams included in the book can be interacted with."

The pattern: `[Cartesian does X. Ours has Y. Unlike regular Z, ours can W.]`

### Microcopy worth pocketing

- "Available for a Limited Time!" (bundle card)
- "Suitable for Schools, Universities, Businesses, and Other Institutions" (institutional license)
- "Updated May 8, 2025" (FAQ datestamp — adds trust without a changelog)
- "Crafted with ♥ by Elias Yilma" (footer)

---

## What NOT to lift (anti-patterns for Promptdojo)

1. **The dense / ornate display serif**. Abril Fatface is gorgeous but a) extremely Title-Cased, and b) feels like a literary press / textbook publisher. Promptdojo's "vibe-coder, anti-Coursera, builder-class" voice would clash. Keep Promptdojo's lighter, more contemporary serif (or sans) — DON'T swap to Abril Fatface.

2. **Title Case headlines**. Cartesian uses Title Case ("Buy Once. Own Forever.", "A Comprehensive Treatment.") which fits a textbook brand. Promptdojo runs lowercase — preserve that.

3. **System sans body fallback**. Cartesian's body falls back to Arial / SF Pro because Outfit and Red Hat Display are loaded but apparently not applied. Sloppy. Promptdojo should specify body font deterministically.

4. **The 3-pricing-card layout**. Promptdojo is free. Don't force a card row just because Cartesian has one.

5. **The "techincal" typo / casual editing posture**. While charming for a solo academic-product, Promptdojo's audience (PMs, vibe-coders) expects polish. Don't intentionally leave typos. Voice = casual; spelling = accurate.

6. **Loading 7 stylesheets from 5 CDNs**. boxicons + FA + Google Fonts (3 separate calls) + cdnfonts (2). Heavy. Promptdojo should keep its current static-export performance posture.

7. **Print-receipt square corners on EVERYTHING**. Square card corners work in Cartesian's letterpress aesthetic. In Promptdojo's brand, slightly rounded corners (4-8px) likely fit better.

8. **Single founder name signed in brand**. "Crafted with ♥ by Elias Yilma" works because Elias is selling a textbook with academic credibility implied. For Promptdojo, "by josh ernst" is fine, but the framing should be lighter — `[built by josh]` or `[made by @joshernstdev]`, not "Crafted by Master Joshua Ernst."

---

## Top 15 specific patterns to consider for V4

Ranked by impact-to-effort ratio (highest first). Each has a Cartesian receipt and a candidate Promptdojo surface.

| # | Pattern | Cartesian receipt | Promptdojo surface | Effort |
| --- | --- | --- | --- | --- |
| 1 | Single-CTA hero (kill secondary CTA) | `cartesian-home-1920-fold.png` | hero — drop any "learn more" | XS |
| 2 | Colored-display-word + plain-finish section titles | `cartesian-features-1920.png` | every feature/value section | S |
| 3 | "Buy Once. Own Forever." anti-feature litany | `cartesian-buy-once-1920.png` | "pyloft is.\nfree.\nopen.\nyours." | S |
| 4 | Floating glass nav pill | `cartesian-nav-1920.png` | replace top nav | M |
| 5 | Stat row in display blue | `cartesian-stats-row-1920.png` | "the curriculum, by the numbers" — chapters / exercises / hours | S |
| 6 | TOC accordion as syllabus | `cartesian-stats-row-1920.png` lower half | full chapter list as expandable accordion | M |
| 7 | Hairline-rule lists, no cards | `cartesian-stats-row-1920.png`, `cartesian-faqs-1920.png` | FAQ + chapter list reformat | S |
| 8 | Pre-rendered framed visuals (no CSS window chrome) | `cartesian-features-1920.png`, `cartesian-edit-run-test-1920.png` | every code/IDE screenshot section | M |
| 9 | Extend display serif to mid-size labels (not just h1) | observed throughout | stat labels, section eyebrows | XS |
| 10 | "Watch the film." labeled embed | hero | demo video surface | XS |
| 11 | "+" as section divider | between Buy Once and Free Updates | between major sections | XS |
| 12 | Micro pixel-art footer signature with heartbeat | `cartesian-faqs-1920.png` | Promptdojo footer | M |
| 13 | FAQ datestamp ("Updated May 8, 2025") | FAQ section | "last updated" line on FAQ | XS |
| 14 | Different highlight color per pricing card (no "Most Popular") | `cartesian-pricing-1920.png` | future pricing tiers if any | S |
| 15 | Strikethrough discount baked into button | hero CTA + pricing card | future paid tier discount UI | XS |

---

## Quick visual identity comparison

**Cartesian feels like**: a hand-set letterpress textbook from a small university press. Warm cream paper, dense display serif, square borders, charm-via-restraint. The single-author byline and the heartbeat-animated heart at the bottom both confirm: this is a solo passion project shipped at high craft. The interactive demos (GIFs framed in paper-tone bezels) feel like a museum exhibit's interactive kiosk.

**Promptdojo feels like** (per V3 audit context): a pristine, brand-aligned (9.2/10) static landing page for a free open-source python school. Lowercase, builder-class voice, anti-Coursera. Audience: vibe-coders, PMs, Cursor users. Modern technical aesthetic, but per the brief, hasn't yet borrowed the textbook-press seriousness that signals "this is a real curriculum, not a TikTok hot take."

**The delta worth exploring**: Cartesian shows that an indie technical educator can earn premium-trust signals (pricing card credibility, comprehensive TOC, FAQ depth, founder byline) without hiding behind marketing-stack templates — by leaning hard into print/textbook tropes. Promptdojo could absorb the **structural confidence** (single-page sales-letter shape, accordion TOC, anti-feature litany, stat row, framed visuals) without copying the textbook-press visual language. Borrow the bones, keep the lowercase muscles.

---

**Walkthrough complete.** 21 screenshots saved at `~/Developer/code-killa/design-kit/audit-v4/screenshots/cartesian/`. Next agents (UI Designer, Visual Storyteller, UX Architect, Brand Guardian, Growth Hacker) should read this report first, reference the screenshot files for visual evidence, and pull patterns from the Top 15 table by impact tier.
