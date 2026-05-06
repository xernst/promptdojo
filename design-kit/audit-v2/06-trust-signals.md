# Trust Signals — feel serious without faking it

Auditor: Marketer / Trust-Signals Lead
Live URL: https://promptdojo.pages.dev
Validation metric: X follower count on @TFisPython (44 → 1,000). Every recommendation laddered to that.
Phase 1 reference: `design-kit/audit/05-marketing.md` (do not repeat).

---

## The honest position

Codecademy has 50M users, Y Combinator backing, "as featured in TechCrunch," 4.6-star reviews, and a paid certificate gate. We have a working product, a real GitHub repo, 624 actual interactive steps, an OG image people can screenshot, and one founder with an X handle. Codecademy's trust is borrowed (press, scale, money); ours has to be **earned in the first paint** — the page itself has to read like a real engineer shipped it last Tuesday.

The trap is faking the wrong signals. We can't put "trusted by 50,000 builders" on the page. We can put "GitHub commit 2 hours ago" — and that signal is rarer and reads more credible to the audience we want.

---

## What signals legitimacy without lies

For each asset we actually have, where to surface it and what it earns.

### Asset 1 — the GitHub repo (open-source, real history)

- **Where to surface:** persistent header pill `[github stars: N]` (right of the wordmark, left of the X-follow pill). Footer `view source on github →`. Lesson sidebar tiny `</> source` link that deep-links to the lesson markdown file in the repo. About page §"free forever" already has `github →` — keep it.
- **How to render:** dynamic at build time — fetch `api.github.com/repos/xernst/promptdojo` once during the Next.js build, freeze the star count + last-commit timestamp into a static JSON. Re-render on every deploy. `[★ 47 · last commit 6h ago]` mono pill. No live JS fetch (would slow page, look broken if rate-limited, and Cloudflare-static-export-friendly).
- **Expected effect:** This is the single highest-signal trust move for the audience. PMs/marketers/ops people shopping for an AI-era Python course in 2026 are sophisticated enough to know that "open source on GitHub with recent commits" is the actual moat. It signals (1) the maker is real, (2) the project is alive, (3) you can audit the source, (4) it can't disappear behind a paywall next quarter. Estimated lift: +5-8% on follow-back rate, because the same person who clicks "github" also clicks "x".

### Asset 2 — 624 interactive steps (real curriculum scale)

- **Where to surface:** hero subhead (already there: `25 chapters · 624 interactive steps`). Add a counter strip directly above the chapter grid as its own row: `25 chapters · 624 steps · ~5,800 lines of python · 100% in your browser · MIT-licensed`. Mirror the OG-art counter pattern.
- **How to render:** mono pill row, dim ink-500, ember accent on the differentiators (`100% in your browser`, `MIT-licensed`). No icons. Specificity is the trust.
- **Expected effect:** Codecademy's homepage says "thousands of lessons." Ours says "624." The smaller, sharper number reads as truer. Lifts perceived production value because vague numbers read as marketing, specific numbers read as inventory.

### Asset 3 — the founder with a real X handle

- **Where to surface:** persistent header pill `[follow @TFisPython on x]` (already in the CEO Vision pick #3 — verify it ships). About page §"who built it" already has `i'm josh.` — keep but extend: add a one-line ship-cadence anchor: `posting daily build notes at @TFisPython.`
- **How to render:** ember-outline pill, mono uppercase, wraps to its own row on mobile under the wordmark. `follow on x` not `Twitter` not `𝕏`.
- **Expected effect:** Validation metric is followers; without an X-follow surface in the header, conversion is leaking. This is the single line item the CEO Vision flagged — and it is the validation-metric unblock.

### Asset 4 — the launch trailer (28-second motion artifact)

- **Where to surface:** about page, section §"how it works" inline as a `<video>` autoplay-muted-loop poster. Optionally the `/learn` index above the chapter grid as a "watch 28s" affordance.
- **How to render:** ember-bordered 16:9 frame, lazy-loaded, no controls visible by default, click expands. No big "WATCH NOW" overlay — the existence of the loop is the affordance.
- **Expected effect:** PMs scrolling on phones see motion before they read text. Motion is rare on Python-course landing pages. The trailer signals "this isn't a personal-blog hobby project, someone made the Vision." Don't over-invest — one placement, not a marquee.

### Asset 5 — the actual product running in-browser (Pyodide)

- **Where to surface:** hero (already partially there with `HeroBugSnippet`). The CEO Vision pick #3 mentions a "live(ish) IDE" — the trust-signal version is: even if the snippet isn't live in the hero (V1 budget), make the chapter cards on `/learn` deep-link to a step-1 that runs in <2s. The trust signal is "I clicked something and code ran" — the time-to-first-Run.
- **How to render:** PyodidePreloader (already in `app/page.tsx`) starts the worker on load; the first lesson click should feel instant. Surface a `pyodide warm · ready in <1s` pill on the hero once preload completes (ink-500 mono, tiny). Don't show the cold copy if it's <500ms.
- **Expected effect:** "Software runs" is the trust signal. Most courses are videos — the moment a stranger sees Python execute in their browser without signup is the moment they trust the technical claim.

### Asset 6 — the /about page (positioning depth)

- **Where to surface:** already deep, already strong. Current pain: header link reads `[❯what is this?]` — fine — but the about page has no breadcrumb back to "ship history" or "what's new." Add one cross-link from `/about` § "who built it" to `/changelog` (see §Founder + ship-history).
- **How to render:** small anchor `↳ see what shipped this week` at the end of the §"who built it" paragraph. Lowercase, mono, ember on hover.
- **Expected effect:** /about converts the curious skim into the "this is a serious project" read; the changelog converts the "is this still maintained?" question. The two pages support each other.

### Asset 7 — the $0 promise (genuine differentiator)

- **Where to surface:** already strong on /about §"free forever." Currently absent on home page chapter-grid eyebrow. Add the four-word counter to the eyebrow row: `· $0 forever · no login · no upsell ·`. The OG `/og/launch/price` already contains this exact list — render its content as a section on the homepage between the chapter grid and the footer.
- **How to render:** as a callout band, ink-900 background, mono `$0` at clamp(96px, 14vw, 200px) center-stage, supporting text in ink-400.
- **Expected effect:** Confidence signal. Every Codecademy / Boot.dev / DataCamp ad in the audience's feed leads with "free trial." Ours leads with "free forever." Forever is the trust signal — it's a statement of intent that competitors structurally can't make.

---

## Real numbers to surface

Every concrete, verifiable number we own. Where each goes.

| Number | Source of truth | Where to display |
| --- | --- | --- |
| **25 chapters** | `lib/generated/v2/manifest.toc.json` | hero subhead ✅, chapter-grid eyebrow ✅, OG art ✅, /about §"what's inside" ✅ |
| **624 interactive steps** | sum of `chapter.stepCount` from manifest | hero subhead ✅, chapter-grid eyebrow ✅, OG art ✅, /about ✅ |
| **88 chapter XP / 2,000+ total XP** (estimate from sum) | per-chapter XP in manifest | NEW: counter-strip row above chapter grid |
| **~5,800 lines of curriculum python** (count from `content-v2/**/*.md` code fences) | grep against repo | NEW: counter-strip row, "production grade" subtle proof |
| **~12 minutes per chapter** (avg time, can derive from step count × 30s) | derived | NEW: per-chapter card metadata `~12 min` |
| **GitHub commit count / star count / last-commit timestamp** | GitHub API at build time | NEW: header pill `★ N · committed Xh ago` |
| **Pyodide cold-start time (~5s first time, <500ms after)** | measured | NEW: hero `pyodide warm · ready` micropill (only after warm) |
| **Number of bug-classes drilled (a curated list of ~12)** | author-defined | NEW: `/about` §"the wedge" reframe — list the 12 explicitly |
| **MIT licensed** | `LICENSE` file | counter-strip ✅ implicit, make explicit |
| **Zero backend / browser-only** | architectural fact | counter-strip ✅, OG art ✅ |
| **$0 forever** | policy | hero subhead ✅, /about ✅, NEW: callout band on home |

The pattern: the audit is not "add more numbers." It is "the same numbers, in more places, with sharper specificity." A visitor scanning at 5 seconds should hit at least three numbers without scrolling.

---

## Open-source as the brand foundation

The single best trust differentiator we have. Codecademy is closed-source. Boot.dev is closed-source. DataCamp is closed-source. Every single competitor ships a black box. We ship a glass box.

### Specific moves

1. **Header GitHub-stars badge.** Position: between wordmark and X-follow pill. Format: `[★ 47]` ember-outlined, hovers reveal `47 stars · last commit 6h ago`. Rebuild on every deploy via build-time fetch. File: extend `components/Wordmark.tsx`-adjacent into a new `components/GitHubBadge.tsx` (server component, no client JS). Falls back to `[★ ?]` if the API hits a build-time rate limit (graceful, never breaks the deploy).

2. **`view source on github` link on every lesson.** Position: lesson sidebar footer or step-card meta-row. Format: tiny mono `</> source` anchor that deep-links to `https://github.com/xernst/promptdojo/blob/main/content-v2/<chapter>/<lesson>.md`. File: `components/v2/StepFooter.tsx` or `components/v2/ChapterNav.tsx`. The link signals (1) the lesson is editable in plain markdown, (2) you can audit what the course teaches, (3) you could send a PR to fix a typo.

3. **Footer commit feed.** Position: site-wide footer (where `Press ⌘⇧B…` currently lives — replace it on the home, keep that hint elsewhere). Format: 3 most recent commits as `[6h ago] feat: add chapter 14 step 3 · 2d ago refactor: …`. Build-time fetch, frozen as JSON, re-render on deploy. Lazy-render below the fold so it doesn't add page weight.

4. **Contributor wall (if and when there's >1 contributor).** Skip until there are at least three real contributors. Until then, an empty contributor wall reads as desperation. Park.

5. **MIT-licensed badge in counter-strip.** One row. `MIT-licensed` ember-tinted token among the rest of the proofs. Single-character signal, big trust delta vs a closed-source competitor.

6. **`pyodide v0.x.y · python 3.12.1` micro-credit** in the IDE chrome on lesson pages. Specificity = trust. The audience knows "Pyodide" is a real WebAssembly project; the version number says "we know what we're using."

### What NOT to do with open-source

- Do not link to a 404 GitHub README. Confirm the README has the same hero pitch as the homepage before exposing the badge.
- Do not show a forks/issues count. Pre-launch, "0 open issues" reads as "no one cares." Stars are the only safe metric.
- Do not put `Made with ❤️ in San Francisco` anywhere. Builder-class slang doesn't include hearts.

---

## Founder + ship-history

`/about` § "who built it" is good — `i'm josh.` is enough voice-wise. What's missing is **proof of recency**. A first-time visitor reads "i'm josh" and asks "did Josh build this in 2024 and abandon it, or did Josh push code today?" The site doesn't answer.

### Recommendation: ship `/changelog`

A separate route, not a homepage section. Pros, cons, and copy template below.

**Pros:**
- Dedicated surface for "this is alive" signal. Every visit converts the question "is this maintained?" into a yes.
- Becomes the third internal page (home / about / changelog) — gives the X bio link more depth to land in.
- Feeds the build-in-public X cadence — every X "shipped today" tweet has a permalink.
- Cheap to maintain: one markdown file appended to per ship, parsed at build time. Solo-founder-friendly.

**Cons:**
- Empty changelog is worse than no changelog. Don't ship until there are at least 5 entries.
- Tempting to skip dates that should be skipped (silent days). Discipline trap.
- Risk of becoming a vanity surface ("shipped a typo fix today!"). Solve with a 1-line-per-day cap.

**Decision: ship `/changelog`, with a 5-entry pre-fill rule before going live.** Cap each entry at one line. Date-stamped, lowercase, mono.

### Copy template

```
# changelog

what shipped, when. the source is on github; this is the prose version.

---

2026-05-06 · added an x-follow pill to every page. the validation metric is followers, the site finally asks.

2026-05-05 · refreshed the hero. the bug snippet renders inline above the fold; the subhead names the wedge in 22 words.

2026-05-03 · chapter 14 (llm apis) shipped — 28 steps, calls openai + anthropic from a pyodide-loaded http worker.

2026-04-29 · pyodide preloader moved to home; first lesson runs in ~600ms after warm-up.

2026-04-21 · v0.1 deployed to promptdojo.pages.dev. 22 chapters live. 502 steps in the manifest. zero accounts.

---

> latest source: github.com/xernst/promptdojo
> daily build notes: x.com/TFisPython
```

### Where it lives

- `app/changelog/page.tsx` (server component, reads `content/changelog.md` at build time, renders the entries)
- linked from /about §"who built it" (`↳ see what shipped this week`)
- linked from the footer of every page (`changelog · github · x`)
- NOT linked from the home hero (would dilute the start-chapter-1 CTA)

### What goes on /about that doesn't need a changelog

The `i'm josh.` paragraph stays. Add **one sentence** after `built solo. open source. free forever. follow the build at @TFisPython.`:

> last shipped: 2026-05-06 · 4 commits this week · see [changelog](/changelog).

Build-time injection. Reads as "this is moving."

---

## Trust-signal placements (concrete)

| Signal | Surface | Mode | Estimated lift |
| --- | --- | --- | --- |
| `[follow @TFisPython on x]` ember pill | site header (every page) | static link, mono | +primary on validation metric (X follows) |
| `[★ N · committed Xh ago]` GitHub pill | site header (every page) | build-time fetch, mono | +trust, +click-through to repo |
| Counter-strip row (`25 ch · 624 steps · ~5,800 lines · MIT · zero backend`) | home, above chapter grid | static, ink-500 mono | +scan-time confidence |
| Hero `HeroBugSnippet` | home, above the fold | already shipped — verify | +screenshot rate, +X impressions |
| `/og/launch/wedge` as default OG | home `<meta>` | already configured ✅ | +click-through on tweet previews |
| Per-chapter OG card | each `/learn/v2/[chapter]` route | verify it works | +chapter-link click-through on X |
| `</> source` per lesson | lesson sidebar | static link to repo blob | +trust on the in-product surface |
| `/changelog` page | dedicated route + footer link | build-time markdown render | +"is this maintained" answer |
| `last shipped: <date>` line on /about | `/about` §"who built it" | build-time injection | +recency proof |
| `pyodide warm · ready` micropill | hero (post-preload) | client-side after warm event | +"software runs" trust |
| Footer commit feed (3 most recent) | site-wide footer | build-time fetch, frozen | +signal of life |
| `$0 forever` callout band | home, between chapters and footer | static section, big type | +confidence on the differentiator |
| Launch trailer inline | /about §"how it works" | autoplay-muted-loop video | +production-value signal |

---

## Hero rewrite

The hero is already in the CEO Vision pick #3 ("ai writes this. it's wrong." + bug snippet + start-chapter-1 CTA) and it's already shipped per the live site fetch. Trust-wise, it lands the screenshot but **misses the proof-of-life signal**. Two surgical adds, no rewrite.

### Current

```
[wordmark]                                     [streak widget]

ai writes this.
it's wrong.

a python school for the version of you that lives in cursor.
25 chapters · 624 interactive steps · runs in your browser · free forever.

[bug snippet — mutable default arg]

[start chapter 1 →]    or pick your chapter ↓
```

### Proposed (additive only, no copy rewrites)

```
[wordmark]    [★ 47 · 6h ago]    [follow @TFisPython on x]    [streak]

ai writes this.
it's wrong.

a python school for the version of you that lives in cursor.
25 chapters · 624 interactive steps · runs in your browser · free forever.

[bug snippet — mutable default arg]

[start chapter 1 →]    or pick your chapter ↓

· · ·

25 chapters · 624 steps · ~5,800 lines of python · MIT-licensed · zero backend
```

What the proposed lands that current doesn't:
1. **Header GitHub pill = recency signal.** Stranger sees "6h ago" in the first paint. Question "is this alive?" answered.
2. **Header X-follow pill = validation-metric surface.** Currently only on /about. Should be on every page including home.
3. **Counter-strip below CTA = scan-mode confidence.** A visitor who reads only the hero gets all the proof numbers without scrolling to /about.

No copy rewrite to the headline / subhead / snippet — those already do the work.

---

## CTA hierarchy cleanup

The brief lists "4 buttons in the layout header + hero CTAs" as cluttered. Live audit:

**Currently visible in the header on home page:**
- `[❯what is this?]` — link to /about
- `[login to save]` — opt-in account
- `[follow @TFisPython on x]` — X follow
- `[streak widget]` — progress hint

**Hero:**
- `[start chapter 1 →]` — primary
- `or pick your chapter ↓` — secondary

That's 4 header items + 2 hero items = 6 affordances. Cluttered for a stranger.

### Recommended hierarchy (legitimacy-first)

**Tier 1 (every page header — keep):**
- Wordmark (left)
- `[★ N]` GitHub pill (NEW — middle-left)
- `[follow on x]` ember pill (middle-right) — strongest CTA after the chapter CTA
- Streak widget OR login (right, conditional — see below)

**Tier 2 (home hero only):**
- `[start chapter 1 →]` — only strong CTA in the hero
- `or pick your chapter ↓` — secondary, mono link

**Demote / remove:**
- `[❯what is this?]` — move into the footer or surface as a "new here?" inline link below the X-pill on mobile only. On desktop, the wordmark itself can link to /about (the brand mark IS the "what is this" link). Saves a header slot.
- `[login to save]` — already opt-in per project rules. Demote to a tiny mono "login" link in the footer when no profile exists. When a profile exists, replace with the streak widget. Never both. Currently both can render simultaneously.

### Rule of thumb

A first-time visitor should see exactly **two** CTAs above the fold: `start chapter 1` (the action) and `follow on x` (the relationship). Everything else is utility, demoted.

The CEO Vision §1 picked the same logic ("Single primary CTA `start chapter 1 →` + secondary `or pick your chapter ↓`") — extend it to the header.

---

## What NOT to add (anti-trust)

These would actively erode trust. Keep the page free of them.

- **Testimonials we don't have.** No "this course changed my career, ★★★★★ — Alex P., PM at Acme" placeholders. Better to show a real X reply screenshot once we have one than to fake a quote.
- **Star ratings we can't earn yet.** No "4.9/5 from 12 reviews" — pre-launch this is a rounding error. Skip until we have a real review surface.
- **Generic "join thousands" claims.** "Trusted by builders" with no list of builders reads as filler. The audience is too sophisticated.
- **Fake badges.** "As featured in" with no actual feature. "Built on AWS" is true but signals nothing. "Cloudflare Pages" is true but irrelevant.
- **Paid cert gates.** Already off-limits per project rules — no certificates, paid or free. The trust comes from the product, not a credential.
- **Logo soup.** "Used at companies like Google, Meta, Stripe" with no source. Even if true, unverifiable.
- **Counter that goes up live ("students online: 47").** Either it's truthful and embarrassing pre-launch, or it's faked and gets caught.
- **"Coming soon" badges on chapters.** VOICE.md explicitly bans "coming soon." Either the chapter is in the manifest or it isn't.
- **Email-capture popup.** Kills the no-signup promise. Even an opt-in newsletter modal contradicts the "no upsell ever" anchor.
- **Discord / Slack invite as a primary CTA.** Pre-launch, an empty Discord is worse than no Discord. Add only when validation metric (X followers) is past 500.
- **A medium / substack badge.** No external blog yet — don't pretend.
- **A chatbot widget.** "Got questions? Chat with us!" — opposite of the brand.
- **Cookie banner with "we value your privacy" copy.** We don't track. Don't add a banner that suggests we do. (If GDPR forces something, make it one line, deadpan: `we don't set cookies. there is nothing to consent to.`)
- **`#1 Python course for AI builders` superlatives.** Even if true (it's a defensible claim), saying it ourselves erodes trust. Let the X feed say it.
- **A "press kit" page pre-press.** Empty press surfaces signal desperation. Add when there's actual press.
- **A "what's new" carousel that auto-rotates.** Use the changelog instead — static, scannable, lower-effort.

---

## Top 10 trust moves to ship

Ranked by leverage on the validation metric (X follows) and on the "is this real?" question. Each is concrete, scoped, and ladders to a follower.

1. **Add `[follow @TFisPython on x]` ember pill to the site header on every page.**
   - Change: insert a Link component in the `<header>` block on `app/page.tsx`, `app/about/page.tsx` already has its own footer link — extend to the persistent header in a new `components/SiteHeader.tsx` and use it across all top-level routes.
   - File: `app/page.tsx:69-75` (replace the inline header div with `<SiteHeader />`), new `components/SiteHeader.tsx`, `app/about/page.tsx` adoption, lesson layout adoption.
   - Expected effect: Currently 0 X-follow surfaces on home. Adds the validation-metric ask to every page. CEO Vision pick #3 already calls this out — confirm it shipped.

2. **Add `[★ N · committed Xh ago]` GitHub pill to the site header.**
   - Change: build-time fetch from `api.github.com/repos/xernst/promptdojo`, freeze into a `lib/generated/github.json`, render in `SiteHeader`. Graceful fallback: hide the timestamp if older than 30 days; hide the whole pill if the build fetch fails.
   - File: `scripts/fetch-github-stats.mjs` (new, runs at build), `lib/generated/github.json` (new, gitignored), `components/SiteHeader.tsx`, `next.config.ts` build hook.
   - Expected effect: Strongest "is this alive?" signal in 5 seconds of scan time. Differentiates from every closed-source competitor.

3. **Insert counter-strip row directly above chapter grid on home.**
   - Change: render a single mono row `25 chapters · 624 steps · ~5,800 lines of python · MIT · zero backend` between `HomeClient` and the value-prop cards. Pull line count from a build-time `wc -l content-v2/**/*.md` (or count code-fence lines specifically).
   - File: `app/page.tsx:122` (insert section above the value-prop grid), `scripts/build-content-v2.mjs` (extend to emit a `stats.json` with line count), `lib/generated/v2/stats.json`.
   - Expected effect: Visitor scanning at 5s gets 5 proof numbers in one row. Lifts perceived production value.

4. **Ship `/changelog` page with 5 pre-filled entries.**
   - Change: new `app/changelog/page.tsx` server component, reads `content/changelog.md` at build time. Lowercase voice, one line per entry, date-stamped. Linked from /about and from the footer of every page.
   - File: `app/changelog/page.tsx` (new), `content/changelog.md` (new), `app/page.tsx` footer extend, `app/about/page.tsx:283` (add changelog cross-link).
   - Expected effect: Answers "is this maintained?" with a permalink. Becomes the third inbound landing page when an X tweet says "shipped today."

5. **Change default OG for home to `/og/launch/wedge`** (verify; config in `app/page.tsx:24` already points to `wedge` — confirm the deployed page actually serves it on Twitter).
   - Change: validate the existing `metadata.openGraph.images[0].url` config is rendering on share. Run a tweet-card-validator check against `https://promptdojo.dev/`.
   - File: `app/page.tsx:24` (already configured).
   - Expected effect: Wedge bug image stops scrolls on X far better than the wordmark. Already wired — verify it works post-deploy.

6. **Ship per-chapter OG cards** (verify in `app/og/launch/[name]/route.tsx` whether chapter-specific OG generation exists; if not, add one route handler that takes a chapter slug and renders an OG card with the chapter title + step count + a sample bug from that chapter).
   - Change: new `app/og/chapter/[slug]/route.tsx` if absent. Wire each chapter's metadata to use it.
   - File: new `app/og/chapter/[slug]/route.tsx`, `app/learn/v2/[chapter]/page.tsx` metadata config.
   - Expected effect: Every chapter URL becomes a distinct screenshot when shared. Chapter-link tweets look different from home-link tweets, increasing the tweet-asset library to 25.

7. **Add `</> source` link in lesson sidebar / step footer.**
   - Change: tiny mono link to `github.com/xernst/promptdojo/blob/main/content-v2/<chapter>/<lesson>.md`. Right-aligned in `StepFooter` next to the XP indicator.
   - File: `components/v2/StepFooter.tsx`.
   - Expected effect: Trust signal on the surface where the user is most invested. Reinforces "this is open source" beyond the marketing pages.

8. **Add `last shipped: <date>` line to /about §"who built it".**
   - Change: build-time inject the most recent commit date below the `built solo. open source. free forever.` line. Format: `last shipped: 2026-05-06 · 4 commits this week · see changelog →`.
   - File: `app/about/page.tsx:283` (extend the paragraph), `lib/generated/github.json` (built in move 2).
   - Expected effect: Recency proof on the page where someone reads about the project. Cheaper than a full changelog, lands the signal.

9. **Add `$0 forever` callout band between chapter grid and footer on home.**
   - Change: re-render the OG `/og/launch/price` content as a flat homepage section. Big mono `$0`, supporting text `no login · no streaks · no upsell · open source.`
   - File: `app/page.tsx:204` (insert section after `details` legacy chapter accordion, before `footer`).
   - Expected effect: The strongest differentiator (forever-free) currently lives in the OG image and on /about. Render on home for the visitor who never clicks /about.

10. **Add footer commit feed (3 most recent commits) site-wide.**
    - Change: replace or augment the `Press ⌘⇧B…` footer hint on home with a 3-line commit feed `[6h ago] feat: x · [2d ago] refactor: y · [3d ago] fix: z`. Build-time fetch (already cached from move 2).
    - File: `app/page.tsx:234-241` (replace footer content), shared `components/SiteFooter.tsx` if extending across routes.
    - Expected effect: Final scan signal before the visitor leaves. The footer — usually dead space — becomes the third "this is alive" proof point.

---

## Sequencing note

Trust moves 1, 2, 3 are the ones that change the 5-second scan. Ship them as a single PR, branch `refresh/08-trust-signals-header-and-counters`. Moves 4, 8, 10 are the recency layer — second PR, `refresh/09-changelog-and-ship-history`. Moves 5, 6 verify and extend the OG pipeline — third PR. Moves 7, 9 are polish — bundle into the next general refresh.

Total estimated solo-founder budget: ~6 hours across three PRs. Cheap.

---

## Success criteria (so we know we won)

- A stranger lands on `promptdojo.pages.dev`, scans for 5 seconds, and sees: GitHub stars + last commit + 624 steps + MIT + the bug snippet. That's 5 trust signals before any scroll.
- The X-follow ember pill is visible on every page in the top header.
- /changelog renders with at least 5 real entries, dated, in the brand voice.
- /about answers "is this maintained?" via the `last shipped:` line without requiring a click to /changelog.
- Tweet share previews render `/og/launch/wedge` for home and chapter-specific OG cards for chapter URLs (verified on X via the card validator).
- The home page footer has a 3-line commit feed instead of the keyboard-shortcut hint.
- Zero fake testimonials, zero placeholder logos, zero "trusted by thousands" claims.
- The `[login to save]` and `[❯what is this?]` header items are demoted; only `[follow on x]` and `[★ N]` ride alongside the wordmark.

The bar: a stranger lands, scans for 5 seconds, concludes "this is a real, maintained product." If the GitHub pill is missing or the X pill is missing, the bar is not cleared.

---

**Marketer / Trust-Signals Lead**
Audit date: 2026-05-06
Next handoff: Head of IT picks moves 1-3 into the next sprint as a single PR.
Strategic posture: Audience-over-completion. Trust signals exist to convert the X-bio click into the X follow. Every move ladders to a follower the site doesn't yet earn.
