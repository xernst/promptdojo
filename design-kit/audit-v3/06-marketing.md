# Marketing & Repostability Audit V3

Auditor: Growth Hacker
Live URL: https://promptdojo.pages.dev
Validation metric: X follower count on @TFisPython (44 → 1,000). Every recommendation laddered to that.
Predecessors: `design-kit/audit/05-marketing.md` (V1), `design-kit/audit-v2/06-trust-signals.md` (V2).
Posture: V2 shipped the receipts (system tokens, phase rail, StatStrip, /changelog, GitHub pill). The site reads "real" now. It still does not read "repostable."

---

## What promptdojo currently sells (a marketer's read of the live site)

A real, maintained, well-structured Python course. The home page now does what V2 promised: a lowercase hero (`ai writes this. it's wrong.`), a bug snippet, two CTAs, three value-prop cards, a StatStrip, a 5-phase banded curriculum tree, a /changelog with five real entries, and a GitHubStatsPill in the header that says `★ 0 · committed 1m ago`. The tone is consistent. The institutional layer landed.

But on a phone, scrolled past in 1.2 seconds on someone's X timeline, what does this site *say*? It says: "competent course, clean dark theme, by a real builder." That earns a click, not a screenshot. Nothing on the page is *meme-shaped*. Nothing makes a vibe-coder pause mid-scroll, hit the camera button, crop, post, and write "wait what is this." The bug snippet is the closest thing — but it's framed as a small inline block, not as a hero anchor that fills the screenshot frame.

The site sells "this is real." It does not yet sell "this is the one weird Python school made for the way I actually code now."

## What it SHOULD sell (the repostable bet)

One belief, repeated five different ways across the page: **AI writes 70% of your Python now and the school for that doesn't exist anywhere except here.** Each chapter is a *thesis tweet* with a URL behind it. Each phase is a *meme strip*. The home page is a screenshot library where every viewport-sized vertical band is its own X post. A returning visitor doesn't read the page — they scroll it, screenshot one panel, and tweet it. The page is the megastore, every band is a SKU, every screenshot is the SKU's product photo.

The bar from the brief: every screenshot a vibe-coder takes gets ≥10 replies asking "wait what is this?" Today, screenshots of promptdojo would draw 0–2 of those because every band is *informational*, not *confrontational*. The fix is not "more polish." It's "give every band a punchline."

---

## The repostability moments

Eight specific phone-screenshot frames. For each: where it lives now, what it's missing, expected lift on follower acquisition.

### Moment 1 — The hero bug ("ai writes this. it's wrong.")

- **Where it lives now:** `app/page.tsx:102-114`. Hero h1 + subhead + `HeroBugSnippet` component below. Bug snippet is below the headline, not framed as the hero anchor. On a phone viewport (~390px wide × 844px tall), the bug snippet is below the fold for most devices because the wordmark + "what is this?" + StatStrip header eat ~140px.
- **How to make it phone-screenshot-perfect:** Promote the bug snippet to be the visual centerpiece of the hero, sized so the snippet, the headline, and the `start chapter 1 →` CTA all sit inside one ~844px tall frame on iPhone 15. The h1 sits ABOVE the snippet at ~clamp(40px, 9vw, 72px). The snippet has a window-chrome label `cursor.py` (already in the OG art at `route.tsx:230` — pull it onto the live page). Add ONE annotation arrow with red ember-tinted text pointing at the bug line: `← evaluated once. every caller mutates the same list.` Single sentence. The annotation is what makes the screenshot self-explanatory. Right now the snippet *shows* the bug but doesn't *name* it visually. The OG image already does this in `renderWedge()` — copy it to the page.
- **Expected lift on follower acquisition:** Highest single-frame lift. This is THE screenshot. If exactly one frame on this site goes viral over the next 90 days, this is it. Estimate: 3–5x the screenshot rate vs the current hero, which means 3–5x more "what is this" replies, which means 3–5x more profile clicks, which is the only thing that matters for X follower growth.

### Moment 2 — The `$0 forever` band

- **Where it lives now:** Nowhere on the homepage. Lives in the OG art at `route.tsx:553-615` (`renderPrice()`). Lives in copy on `/about` §"free forever" at `app/about/page.tsx:254-281`. The home page mentions `free forever` only as the third bullet in a tiny eyebrow line at `app/page.tsx:166`.
- **How to make it phone-screenshot-perfect:** Render the `renderPrice()` OG content as a viewport-tall section on the homepage, between the StatStrip and the chapter rail (or after the rail, before the legacy-course details disclosure). Big mono `$0` at clamp(96px, 26vw, 360px) center. Eyebrow `FOREVER` letter-spaced. Below: `no login · no streaks · no upsell · open source`. The CEO Vision V2 explicitly cut this band ("contradicts the no-marketing-wrapper posture") — disagree. Keep the page's no-marketing-wrapper feel everywhere ELSE; this single band is the price-as-meme moment. Boot.dev's homepage doesn't have this. Codecademy's structurally cannot.
- **Expected lift on follower acquisition:** Second-highest. The price band is the cleanest single-frame meme on the page — six tokens in mono, no narrative needed. Quote-tweetable as a reply to any Codecademy / DataCamp / Boot.dev marketing tweet. Estimate: ~2x screenshot rate vs current home, but 4–5x the *quote-tweet* rate because price is universally legible.

### Moment 3 — The agent trace (chapter 25 capstone)

- **Where it lives now:** OG art only, at `route.tsx:444-551` (`renderCapstone()`). Lists user → tool_use → tool_result → tool_use → stop_reason → agent. Beautiful, specific, looks like a real agent log. **Not on the home page anywhere.**
- **How to make it phone-screenshot-perfect:** Add a "what you ship" band on the home page, above the legacy-course disclosure. Headline: `chapter 25. you ship this.` Below: render the `renderCapstone()` trace verbatim as a code block with the same color-coded labels (user/tool_use/tool_result/agent/stop_reason). One footer line: `~100 lines of python.` This band tells a stranger in 4 seconds that this course produces a working AI agent. Today, a stranger has to read 25 chapter titles and infer.
- **Expected lift on follower acquisition:** This is the band that makes a recruiter or PM say "wait, you finish this and you've actually shipped an agent?" It's the single best frame for the *outcome* story (vs the bug-class story in moment 1). Estimate: ~1.5x screenshot rate but disproportionately high follow-through to /about (the "is this real?" follow-up question gets answered immediately by the existing /about page).

### Moment 4 — The IDE running real Python

- **Where it lives now:** OG art only (`route.tsx:291-442`, `renderIde()`). Lessons render the live IDE inside `LessonStepClient`. The home page does not show an IDE running.
- **How to make it phone-screenshot-perfect:** Either embed a live mini-IDE in the hero with one 4-line snippet and a `run` button (V1 audit recommendation, V2 cut as too expensive), OR — cheaper — render the static `renderIde()` OG art as an inline image band on the home page between the value-prop cards and the StatStrip, captioned `python runs in your browser. 187ms.`. This band sells "this is real software, not a YouTube playlist." A frozen image is 80% as good as a live IDE for screenshot purposes — the screenshot looks identical either way.
- **Expected lift on follower acquisition:** Modest standalone, multiplicative when paired with moment 1. The bug + the IDE = "they show you a real bug and you fix it in real Python in a real browser." That story is screenshot-able as a 2-band crop.

### Moment 5 — The phase rail (5 bands, named)

- **Where it lives now:** `PhaseBandedRail` component, mounted at `app/page.tsx:168-171`. Renders 5 phases with chapter ranges and aggregate time. This shipped in V2 and is good. But it's not screenshot-bait — it's catalog.
- **How to make it phone-screenshot-perfect:** Honestly, leave it. The phase rail is a *navigation* surface, not a *meme* surface. It earns its keep by answering "is this a real curriculum?" in the scan, then yields the spotlight to bands 2/3/4. The one tweak: each phase eyebrow should include a one-line *thesis* alongside the chapter range, e.g. `phase 03 · llm apis · the part no codecademy clone teaches in 2026`. The thesis line is what becomes screenshot-able when someone crops a single phase band. Today the bands are dense but neutral; add the thesis and each band becomes its own micro-meme.
- **Expected lift on follower acquisition:** Low standalone, useful as a *cropped quote-tweet asset* when the thesis lines are added. Estimate: small contribution to the asset library; high contribution to scan-time confidence.

### Moment 6 — The `/changelog` page itself

- **Where it lives now:** `/changelog/`, 5 entries dated 2026-04-21 through 2026-05-06, lowercase voice, scrollable. Verified live.
- **How to make it phone-screenshot-perfect:** It is *almost* there. What's missing: the page should screenshot like a Linear or Vercel changelog — three things needed:
  1. The MOST RECENT entry should have a small ember `NEW` chip next to its date and a one-line "what changed for users" headline distinct from the body. Today: `2026-05-06 — v2 refresh — phase-banded curriculum tree on home...`. Better: `2026-05-06 · NEW · the home page shows phases now / phase-banded curriculum tree, ProgressHairline primitive across three surfaces, welcome-back card knows what step you're on. punk + receipts.`
  2. A counter at the top: `5 ships in 30 days · last commit 6h ago · view source on github.` The counter is the screenshot anchor — a stranger crops the top of the page and the counter alone tells the story.
  3. Each entry should have an optional `screenshot:` field showing a 16:9 thumbnail of what changed. This is the Linear/Vercel pattern. V3 if expensive; V2-equivalent: include the OG image of the most recent ship as the entry's accompanying image.
- **Expected lift on follower acquisition:** Medium. /changelog itself is not the hot screenshot — it's the *trust* page. But once it earns one screenshot per ship cycle ("look at this changelog from a solo open-source course"), it becomes a recurring asset. Estimate: 1 screenshot per shipped feature × 4 ships per month = 4 free repostability moments per month.

### Moment 7 — Per-chapter "thesis URL"

- **Where it lives now:** `/learn/v2/<chapter>/<lesson>/<step>` URLs work. There is no `/learn/v2/<chapter>` index page that's screenshot-able. There are 25 chapters; each one *could* be its own thesis tweet with its own OG card and its own page-level meme.
- **How to make it phone-screenshot-perfect:** Each chapter's overview page (e.g. `/learn/v2/mutation/`) should render as a single screenshot-perfect frame: chapter eyebrow (`ch 07 · phase 01 · foundations`), thesis headline (`mutable default args ship in 1 of every 47 ai-written functions.`), one bug snippet, lesson list (~3 lessons, ~15 steps), `start chapter 7 →` CTA. That's it. No fluff. The page is a *trailer* for the chapter.
- **Expected lift on follower acquisition:** The big multiplier. 25 chapters × 1 thesis page = 25 screenshot assets, each tied to a real URL, each shareable as a reply hook. This is the V1 "tweet-able URL pattern" recommendation finally built into the IA. Estimate: scales proportional to reply-bombing volume — every X reply you make on a Cursor / Claude bug thread can link to a *specific* chapter URL with a specific OG card.

### Moment 8 — The "wait, this is open source" beat

- **Where it lives now:** The header `★ 0` GitHubStatsPill at `components/SiteHeader.tsx:24`. The /about §"free forever" at `app/about/page.tsx:254`. The footer `· last commit ${date}` at `app/page.tsx:210-215`.
- **How to make it phone-screenshot-perfect:** The `★ 0` is currently a credibility *liability*. With 0 stars, the pill says "no one has noticed yet." Two fixes:
  1. Hide the star count when stars < 10. Show only `view source · committed Xh ago`. Once stars cross 10, show the count. Once stars cross 100, lead with the count.
  2. Add a one-line `seed` ask on /about and on /changelog: `if this is the python school you wish existed, star the repo. it's the only metric we keep.` That sentence is screenshot-able by itself; it is also the cheapest way to convert a curious visitor into a Github star, which then re-flywheels the pill.
- **Expected lift on follower acquisition:** Direct: the GitHub-star ask converts ~2-5% of curious visitors into stars. Indirect: each star is a public X profile that often follows the maker too. The seed ask is the highest-ROI line of copy on the entire site that doesn't currently exist.

---

## Per-route OG strategy

### Default OG today

`metadata.openGraph.images[0].url` on `app/page.tsx:27` points to `/og/launch/wedge` — verified, this is the strongest possible default. Good.

`/og/launch/<name>/route.tsx` ships 5 static OG variants: `hook`, `wedge`, `ide`, `capstone`, `price`. All are well-designed. `wedge` and `price` are the strongest. `hook` is dated by the `shipping june 2026` eyebrow at `route.tsx:124` — **that copy is now actively wrong** since the site has shipped. Fix: change the eyebrow to `live now · open source` or kill the eyebrow entirely.

### Chapter-specific OG opportunities

**Critical gap.** Today every chapter URL shares a screenshot on X using `/og/launch/wedge`. So a tweet linking to `/learn/v2/llm-apis` shows a screenshot of `mutable default args` — wrong chapter, wrong promise. This is a confidence-killer for anyone who clicks expecting the LLM APIs chapter and sees the wedge bug.

The CEO Vision V2 cut per-chapter OG ("V3 marketing channel build"). For the audience-growth validation metric, **uncut it.** The marginal cost is low and the ROI is high — every chapter URL becomes a distinct shareable asset. Three chapters specifically have story-worthy OG art that already exists in the codebase:

- `mutation` (ch07) → use `/og/launch/wedge` (already designed for this exact chapter)
- `llm-apis` (ch13) → use `/og/launch/ide` (already designed for this exact chapter)
- `capstone` (ch25) → use `/og/launch/capstone` (already designed for this exact chapter)

For the other 22 chapters, ship a templated OG generator at `app/og/chapter/[slug]/route.tsx` that takes the chapter slug, looks up `phase`, `chapter.title`, `stepCount`, `estMinutes`, and renders a frame matching the existing OG art system. The frame template is straightforward — eyebrow `ch NN · phase NN · ${phaseName}`, headline (the chapter title), three-token meta strip (`${stepCount} steps · ~${estMinutes}m · open source`), bug snippet OR thesis line, footer `promptdojo.dev`.

### Implementation note

Three discrete OG cards (wedge, ide, capstone) for the three story-chapters can be wired today by adding `openGraph.images` per-chapter in `app/learn/v2/[chapter]/page.tsx` metadata. The other 22 templated cards can ship in a second PR. **Don't block on the templated 22 — wire the 3 hand-designed ones first because they're the chapters most likely to be linked from X replies.**

---

## Real-numbers placement audit

| Number | Source of truth | Currently shown | Should be shown |
| --- | --- | --- | --- |
| **25 chapters** | `lib/generated/v2/manifest.toc.json` | hero subhead, StatStrip, /about hero | also: every chapter overview ("ch 07 of 25"), header crumb if stranger lands deep |
| **624 interactive steps** | manifest sum | hero subhead, StatStrip | also: every chapter card, every lesson sidebar foot ("step 12 of 624") |
| **398 steps (live count discrepancy)** | live site /about renders `398 steps` | /about StatStrip | **bug**: /about shows 398 while / shows 624. ONE source of truth. Pick the live count from the manifest and propagate. Inconsistency is a confidence killer in the 5-second scan. |
| **Last commit timestamp** | build-time GitHub fetch | header pill, home footer, /about footer | already well-placed; no change |
| **GitHub stars** | build-time GitHub fetch | header pill (`★ 0`) | hide when <10; show prominently when ≥100; until then, the pill should read `view source · ${time}` |
| **Total XP / Total chapter XP** | per-chapter XP in manifest | nowhere | add to phase rail eyebrow: `phase 03 · llm apis · ~440 xp` (if lower-effort, skip; XP is internal currency, not a stranger-facing metric) |
| **Lines of Python in curriculum** | grep code-fences in `content-v2/**` | nowhere | StatStrip OPTIONAL 6th token: `~5,800 lines of python`. CEO Vision V2 picked the StatStrip primitive but capped it at 5 receipts. Adding line-count is +1 receipt, +1 trust signal. Borderline; skip if it bloats the strip. |
| **8–15 hours total** | hardcoded in StatStrip | StatStrip on / and /about | already placed; good |
| **MIT licensed** | `LICENSE` file | StatStrip ember-tinted | already placed; good |
| **Browser-only / zero backend** | architectural fact | OG art, /about | NEW: counter-strip should make this explicit token (`browser-only`) — currently implicit |
| **Phase count (5)** | `lib/curriculum/phases.ts` | implicit in phase rail render | NEW: `5 phases · 25 chapters · 624 steps` makes the structure legible; right now "5" is invisible |
| **Number of bug-classes drilled (~12)** | author-curated list | nowhere | NEW: `/about` should list them explicitly. The bug-class list IS the wedge. Hiding it is leaving the punchline off-stage. |

**Top fix from this table:** the 398 vs 624 discrepancy is a credibility leak. Fix the source-of-truth before any other number tweak. The bug-class list on /about is the next-highest-leverage add (cheap, high-trust).

---

## Build-in-public assets

### `/changelog` status

Live. Five entries. Lowercase. Dated. Already a meaningful trust artifact. Three improvements above and beyond what shipped:

1. **A "shipped this week" stat at the top.** `5 ships in 30 days · last commit 6h ago.` Mono pill. Makes the page itself screenshot-able as a single frame.
2. **An RSS feed** at `/changelog/feed.xml`. Tiny effort, opens the door for /r/programming, Hacker News, Lobsters auto-discovery. Solo founder build-in-public depends on aggregators noticing.
3. **A "how I'm shipping" link** at the bottom that points to the X account. `daily build notes at @TFisPython.` That last line is the exit ramp from /changelog into the X follower funnel.

### Last-updated visibility

Solid. Footer of `/` and `/about` both show `last commit ${date}`. Header GitHubStatsPill shows `committed Xh ago`. Three surfaces is the right number — don't add a fourth.

### Recent-commit visibility

Currently only the most-recent commit timestamp shows. Three commits feed (V2 cut) is genuinely overkill — keep the cut. But: the changelog currently shows 5 commit-equivalent entries; padding to 8–10 entries over the next month makes the changelog itself the recent-commit feed. Discipline trap is real, per V2.

### Founder build-log

The `/about` §"who built it" paragraph is the founder voice. It's good — single-paragraph, lowercase, no resume. The TODO comment at `app/about/page.tsx:228` says "replace credential sentence with your final shape — one role + one tool stack + one frequency word, lowercase." That sentence is *not yet shipped*. Until Josh writes it, the credential read is "vibe-builder making a course." Ship the credential. Suggested shape:

```
i'm josh. ai consultant. ship python alongside cursor and claude every day for client work. write here weekly.
```

Three sentences. Each is a fact. The third is the shipping-cadence anchor that makes the rest of the page believable.

---

## CTA hierarchy cleanup

### Current state (from the live-site fetch + source)

Header (every page via SiteHeader):
- `[❯ what is this?]` link to /about
- `[★ 0 · committed 1m ago]` GitHubStatsPill
- `<CourseProgress />` (renders only when there's progress)
- `[login to save]` LoginToSave pill
- `[follow @TFisPython on x]` FollowOnXPill

Hero (home only):
- `[start chapter 1 →]` primary
- `or pick your chapter ↓` tertiary

Hero (about only):
- `[start the course →]` primary
- `[back to home]` secondary

Footer (home):
- `press ⌘⇧B...` keyboard hint
- `last commit ${date} · changelog` link

That's 5 header items + 2 hero items = 7 affordances on first paint of /. Cluttered.

### Proposed ONE-CTA-rules-them-all

Above the fold, a stranger should see exactly **two CTAs**:

1. **`start chapter 1 →`** — the action.
2. **`[follow @TFisPython on x]`** — the relationship.

Everything else demoted or hidden until interaction:

- `[❯ what is this?]` — keep but visually demote (already small mono in SiteHeader, but on mobile it competes with the X-pill for attention; consider hiding behind a hamburger on viewports <600px)
- `[★ 0]` GitHub pill — hide when stars <10 (per moment 8 above); after that, keep
- `<CourseProgress />` — only renders when progress exists, so already conditionally hidden
- `[login to save]` — demote to footer when no profile exists, header when profile exists. Currently always shows. The CEO Vision V2 §CTA-hierarchy already proposed this; verify it shipped (it has not, per `components/SiteHeader.tsx:26`)
- The hero `or pick your chapter ↓` — keep, it's already tertiary styling

### What gets demoted

- `[login to save]` — to footer when no profile (current location: header always). Keeps the X-follow as the lone non-content CTA in the header for first-time visitors.
- `[★ 0]` — hide entirely below 10 stars (replace with `view source · committed Xh ago` text-only link).
- `[❯ what is this?]` on viewport <600px — hide; the wordmark itself can route to /about on mobile.

The bar: a stranger lands, sees four header tokens (wordmark, GitHub-source-link, X-follow, optional progress) and two hero CTAs. The site asks for the action and the follow. Nothing else competes.

---

## What promptdojo OWNS (the unique-position list)

Things only promptdojo can credibly say. Lean into ALL of these in copy.

1. **"Free forever" — not "free trial," not "free tier."** Codecademy/Boot.dev/DataCamp structurally cannot make this claim. The word `forever` is the entire moat compressed into one token.

2. **"Open source" — not "transparent," not "auditable."** The repo is on GitHub. The lessons are markdown. Anyone can fork it. No competitor in the Python-course space ships this. The /about page says it; the homepage barely whispers it.

3. **"No login required."** Codecademy gates the third lesson. Boot.dev gates everything behind an account. Promptdojo runs all 624 steps anonymously in localStorage. The phrase "runs all 624 steps without an account" is screenshot-bait.

4. **"Built for the version of you that lives in cursor."** Hyper-specific audience targeting that no general-purpose Python course can match. PMs/marketers/ops folks who vibe-code with Cursor/Claude daily. The phrase is already in the hero — keep it.

5. **"The bug AI ships you, not the bug humans ship."** A bug-class taxonomy specifically calibrated for AI-shipped Python (mutable defaults, hallucinated APIs, missing await, off-by-one slices, silent except: pass). No traditional course teaches this — they teach Python-the-language, not Python-as-AI-output.

6. **"Browser-only. CPython compiled to WebAssembly. 187ms cold-start."** The technical novelty is real — Pyodide running locally without a backend is a flex. Most courses are videos or sandboxed-server REPLs.

7. **"25 chapters. The last 13 don't exist anywhere else."** Phase 03 (LLM APIs, Structured Output, MCP, Agent Loops) and Phase 04 (Prompting Cursor, Agent Traces, Eval-Driven Development, Context and Retrieval) are the wedge. No Codecademy clone has this curriculum because Codecademy's curriculum was authored before MCP existed.

8. **"Punk-stack: lowercase, ember-only, no streak shame, no certificate store."** The brand identity itself is unique in the category. Every competitor leans on gamification (streaks, badges, leaderboards) or credentialing (paid certificates). Promptdojo refuses both — that refusal is brand.

9. **"Solo-built, alongside Cursor."** The maker uses the tool he's teaching, every day, on client work. Authenticity proof is the build-log itself. Codecademy is owned by Skillsoft. Boot.dev is a team. Promptdojo is one guy and you can read his commits.

10. **"$0. Forever. No upsell. Ever."** Said in five different words on /about. Should be said louder on /. The price is the position.

---

## What we should STOP saying

Things that read generic / done-by-everyone. Edit out, replace, or never write.

- **"interactive steps"** — every coding course says "interactive." Replace specific instances with `runnable steps` or `python that runs in your browser`. The word "interactive" is a Codecademy 2014 phrase.

- **"learn python"** anywhere on the page — Promptdojo is for people who already write Python (badly, via Cursor) and need to learn what AI got wrong. The word "learn" reads as beginner-aimed. Replace with `read · run · fix` (already on /about §"the loop") or `drill the bugs ai ships`.

- **"course"** as the noun — borderline. The word "course" is generic. The /about page already uses `school` and `dojo`. The homepage says `python school for the version of you that lives in cursor` — keep that. Anywhere that says `start the course →` could be `start chapter 1 →` (more specific, more punchy). Verify: `app/about/page.tsx:111` and `:309` both still say `start the course →`. Change to `start chapter 1 →` to align with /.

- **"a python school for ai builders"** in the SEO title (`app/page.tsx:16`) — the phrase is fine but the brief for the audience is sharper than "ai builders." Try `free interactive python course for people who code with cursor` or `python school for the version of you that lives in cursor.` The OG description at `:24` already uses `ai writes this. it's wrong.` — pull that up to the title.

- **"production-ai track"** — already removed from the eyebrow at `app/page.tsx:166`. Check that no copy elsewhere still uses it. Coursera-tier-upsell read.

- **"start the 5-question onboarding"** — V1 audit flagged this. Verify it's gone. Onboarding should be a step inside chapter 1, not a separate fork.

- **"shipping june 2026"** on the OG `hook` art at `route.tsx:124` — actively wrong since the site is live. Either kill the OG variant or change the eyebrow. Recommendation: leave `hook` in the file but stop using it; `wedge` is the default and should stay the default.

- **"streak"** anywhere — punk brand says no streak shame. Verify the StreakWidget in `app/page.tsx:99` is opt-in only and the copy never mentions streaks as a forcing function. Title-cased or capital-S "Streak" ANYWHERE is a brand bug.

- **"thousands"** of anything. Don't pre-claim audience size.

- **"trusted by"**. Don't claim trust until X followers > 1,000 and at least one named builder is willing to be quoted publicly.

---

## Top 12 marketing moves to ship

Ranked by follower-acquisition impact. Each: change, file path, expected effect.

### 1. Promote the bug snippet to the hero anchor with an annotation arrow

- **Change:** Reorder the hero so the `HeroBugSnippet` is the visual centerpiece, sized to dominate the iPhone viewport. Add the `cursor.py` window-chrome label and a single red annotation `← evaluated once. every caller mutates the same list.` mirroring `route.tsx:266` (the OG art's annotation).
- **File path:** `/Users/joshernst/Developer/code-killa/app/page.tsx` (hero block lines 102–129) and `/Users/joshernst/Developer/code-killa/components/HeroBugSnippet.tsx` (add label + annotation).
- **Expected effect:** Hero becomes the canonical promptdojo screenshot. 3–5x lift on screenshot rate. THE meme.

### 2. Add a `$0 forever` viewport-tall band on the home page

- **Change:** Insert a section between StatStrip and chapter rail (or after the rail) rendering the `renderPrice()` OG content as live HTML. Big mono `$0`, eyebrow `FOREVER`, four-token strip below.
- **File path:** `/Users/joshernst/Developer/code-killa/app/page.tsx` (insert section ~line 162 or ~line 200) — likely a new component `components/PriceBand.tsx` referencing the existing OG color tokens.
- **Expected effect:** Cleanest single-frame meme on the page. ~2x screenshot rate, 4–5x quote-tweet rate (especially as a reply to competitor marketing tweets).

### 3. Wire chapter-specific OG cards for ch07 / ch13 / ch25

- **Change:** Add per-chapter `openGraph.images[0].url` in chapter metadata pointing to the existing OG variants (`/og/launch/wedge` for `mutation`, `/og/launch/ide` for `llm-apis`, `/og/launch/capstone` for `capstone`).
- **File path:** `/Users/joshernst/Developer/code-killa/app/learn/v2/[chapter]/page.tsx` (metadata generation function).
- **Expected effect:** Chapter URLs in X replies show the right screenshot. Eliminates the "wrong-OG" confidence leak. ~1.5x click-through on chapter-link tweets.

### 4. Fix the 398-vs-624 step-count discrepancy

- **Change:** Audit StatStrip rendering at `/about` — live site shows `398 steps` but home shows `624 steps`. Trace to a stale build, a different manifest, or hardcoded fallback. Pick ONE source of truth.
- **File path:** `/Users/joshernst/Developer/code-killa/components/StatStrip.tsx` (uses `lib/generated/v2/manifest.toc.json`) and verify build pipeline at `scripts/build-content-v2.mjs` runs before /about renders.
- **Expected effect:** Removes a credibility leak in the 5-second scan. Inconsistent numbers are the single fastest way to read as "not real."

### 5. Add the "open source — star the repo" seed ask

- **Change:** Add one sentence to /about §"free forever" and to /changelog footer: `if this is the python school you wish existed, star the repo. it's the only metric we keep.` Link the word `star` to GitHub.
- **File path:** `/Users/joshernst/Developer/code-killa/app/about/page.tsx:262` (after the existing free-forever paragraph) and `/Users/joshernst/Developer/code-killa/app/changelog/page.tsx` (footer).
- **Expected effect:** Converts ~2-5% of curious visitors into stars. Each star is a public X profile that often follows the maker. Cheapest unshipped line of copy.

### 6. Hide the `★ 0` star count below 10 stars

- **Change:** GitHubStatsPill renders `view source · committed Xh ago` when stars <10, full pill when stars ≥10, lead-with-count when stars ≥100.
- **File path:** `/Users/joshernst/Developer/code-killa/components/GitHubStatsPill.tsx` (verify the file exists and edit the render branch).
- **Expected effect:** Removes the only current credibility liability in the header. `★ 0` reads worse than no number at all.

### 7. Add per-chapter "thesis URL" pages with one-line theses

- **Change:** Each chapter overview page (e.g. `/learn/v2/mutation/`) renders a single screenshot-perfect frame: chapter eyebrow, thesis headline, bug snippet, lesson list, `start chapter N →` CTA. Author the 25 thesis lines (one-time copy task; ~30 minutes of writing).
- **File path:** `/Users/joshernst/Developer/code-killa/app/learn/v2/[chapter]/page.tsx` and a new `lib/curriculum/theses.ts` mapping chapter slug → one-line thesis.
- **Expected effect:** 25 new screenshot assets, each tied to a real URL with a real OG card. Backbone of any X reply-bombing strategy.

### 8. Render the chapter-25 agent trace as a homepage band

- **Change:** Insert a "what you ship" band on the home page above the legacy-course disclosure. Render the `renderCapstone()` trace verbatim with the same color-coded labels.
- **File path:** `/Users/joshernst/Developer/code-killa/app/page.tsx` (insert section after PhaseBandedRail) — likely a new component `components/CapstoneBand.tsx`.
- **Expected effect:** Sells the *outcome* in 4 seconds. The single best frame for "you finish this and you've shipped an agent."

### 9. Ship the founder credential sentence on /about

- **Change:** Replace the TODO at `app/about/page.tsx:228-229` with the final credential. Suggested: `i'm josh. ai consultant. ship python alongside cursor and claude every day for client work. write here weekly.` (Founder owns the exact words.)
- **File path:** `/Users/joshernst/Developer/code-killa/app/about/page.tsx:230-237`.
- **Expected effect:** Closes the "is this person real" loop. Converts /about from a strong page into a great page.

### 10. Add thesis lines to each phase eyebrow

- **Change:** In `PhaseBandedRail`, append a one-line thesis to each phase header. `phase 03 · llm apis · the part no codecademy clone teaches in 2026.` Author 5 thesis lines (one per phase).
- **File path:** `/Users/joshernst/Developer/code-killa/lib/curriculum/phases.ts` (add a `thesis` field), `/Users/joshernst/Developer/code-killa/components/v2/PhaseBandedRail.tsx` (render it).
- **Expected effect:** Makes each phase band screenshot-able as its own micro-meme. Adds 5 cropped-quote-tweet assets to the library.

### 11. Update the home OG description copy and twitter title

- **Change:** `app/page.tsx:24` description still says "22 chapters" — should be `25 chapters` (V2 added 3 chapters and the OG metadata didn't update). Twitter title at `:31` is good.
- **File path:** `/Users/joshernst/Developer/code-killa/app/page.tsx:24` (and the twitter description if mismatched).
- **Expected effect:** Tweet preview accuracy. Tiny but important — "22 chapters" in the preview vs "25 chapters" on the page reads as stale.

### 12. Add "ships in 30 days" counter at top of /changelog

- **Change:** Render a single mono pill at the top of `/changelog`: `5 ships in 30 days · last commit 6h ago · view source on github`.
- **File path:** `/Users/joshernst/Developer/code-killa/app/changelog/page.tsx`.
- **Expected effect:** Makes /changelog itself screenshot-able as one frame. Becomes the third recurring screenshot asset (after hero bug and price band).

---

## Sequencing note

Moves 1, 2, 8 are the hero-band rebuild — should land as a single PR `refresh-v3/01-repostable-bands`. ~5h of work. **Single highest-leverage PR for the validation metric.**

Moves 3, 4, 11 are the OG-pipeline correctness layer — single PR `refresh-v3/02-og-truth-and-counts`. ~2h.

Moves 5, 6, 9, 12 are copy + small component edits — single PR `refresh-v3/03-trust-polish`. ~2h.

Moves 7, 10 are the per-chapter thesis layer — single PR `refresh-v3/04-thesis-urls`. ~4h (most of the time is writing 25 thesis lines).

Total: ~13h across four PRs. Solo founder evening across one week.

---

## Success criteria

- A vibe-coder lands on `/`, scrolls 2 viewports on their phone, screenshots the bug-band (moment 1) or the $0-band (moment 2), posts on X. The reply rate on that screenshot exceeds 10 "wait what is this" replies within 24 hours.
- Every chapter URL shared on X shows the correct chapter-specific OG card, not the generic wedge.
- /changelog has 8+ entries within 30 days. Top of page reads `8 ships in 30 days · last commit 6h ago.`
- Hero bug snippet is screenshot-perfect on iPhone 15 viewport — bug visible, label visible, annotation visible, CTA visible, ALL above the fold.
- The 398/624 step-count discrepancy is gone. ONE number propagates everywhere.
- The credentials TODO at `app/about/page.tsx:228` is closed.
- The home page footer still has the changelog link. The /about footer still has the changelog link. The header X-pill is the only X-follow CTA on first paint of /; everything else is demoted.
- GitHub stars: ≥10 within 14 days of shipping the seed-ask line. ≥100 within 60 days.

The bar from the brief: every screenshot a vibe-coder takes gets ≥10 "wait what is this" replies. Today: 0–2. After moves 1/2/8 ship: 5–15 expected. After moves 7/10 ship: every reply-bombing thread can land a chapter-specific screenshot, multiplying the assets to 25+.

---

**Growth Hacker**
Audit date: 2026-05-06
Strategic posture: Audience-over-completion. The site reads "real" after V2; V3 makes it read "spreadable." Every move ladders to a follower the site doesn't yet earn.
