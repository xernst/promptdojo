# Marketing & Conversion Audit — promptdojo

Auditor: Growth Hacker
Live URL: https://promptdojo.pages.dev
Validation metric: X follower count on @TFisPython (44 → 1,000). Every recommendation laddered to that.

---

## What the page is currently selling

A polite, well-mannered Python course for office workers. The hero leads with "Python for AI-first builders" and immediately names "marketing managers, PMs, and ops folks who use Cursor daily." It's accurate but soft. The page reads like a professionally-produced curriculum landing page — three value-prop cards, a chapter grid, an onboarding link tucked into a meta-row above the chapters. Nothing on the page screenshots well. There is no single moment of "wait, what?" that earns a screenshot or a follow. The brand voice in BRAND.md and VOICE.md is pugnacious and lowercase — the live site is title-case-ish, balanced, and reasonable. It's underselling the product.

## What it SHOULD be selling

A specific belief: AI is writing your code, AI is shipping bugs you can't see, and there is exactly one school built for the version of you that lives in Cursor all day. The page should hand a stranger three things in the first five seconds — (1) a real bug AI just shipped, (2) the chapter that drills it, (3) a "try this in your browser, no signup, free forever" affordance that they can act on without thinking. The page should feel like the senior dev at 11 PM described in VOICE.md: short, sharp, slightly tired, slightly funny. Right now it feels like the dean of students.

---

## Conversion gaps (highest leverage first)

### Gap 1 — The hero is positioning, not a hook

- **Symptom:** Visitor lands. Reads three abstract value props ("read what AI wrote / catch what it got wrong / direct it deliberately"). Nothing concrete. No bug, no code, no proof. Bounces or scrolls past.
- **Root cause:** Hero is selling a category ("Python for AI-first builders"), not demonstrating the product. The wedge — that AI ships specific, predictable bugs — is buried 600px down inside a card.
- **Fix:** Replace the hero subhead area with a live, ember-highlighted code block showing the mutable-default-arg bug from `og/launch/wedge`. Headline: `ai writes this. it's wrong.` Render the actual broken `def collect_errors(msg: str, bag: list = [])` snippet with the bug line highlighted red. One sentence under it: `mutable default args. ch07 fixes you.` The OG image already does this — the homepage doesn't.
- **Expected lift:** Bounce rate drops, dwell time goes up, screenshot-rate (which becomes X impressions) goes up. This is the single image people will tweet.

### Gap 2 — The page wants two things at once

- **Symptom:** "Start the 5-question onboarding" lives as a tiny ember link above the chapter grid. The chapter grid itself is huge and clickable. A returning visitor clicks a chapter; a new visitor doesn't know which path is "for them."
- **Root cause:** No CTA hierarchy. Onboarding link is treated as utility text. Chapter grid is treated as the conversion surface. They cannibalize each other.
- **Fix:** One primary CTA above the fold: `start chapter 1 →` (ember button, large). One secondary text link below it: `or pick your chapter` that scrolls to the grid. Kill the "new here? start the 5-question onboarding →" microcopy — onboarding is a step inside `start chapter 1`, not a separate path. Five questions in under a minute is a feature, not a fork in the road.
- **Expected lift:** Click-through to first lesson goes up. Decision fatigue drops. One funnel, not two.

### Gap 3 — No social proof, no proof of life

- **Symptom:** Page says "free forever, open source" and lists 25 chapters. There is zero evidence anyone has ever used this, built this, or stands behind it.
- **Root cause:** Pre-launch, this is fine. Post-launch (today), there's no GitHub star count, no "built by" line with an X handle, no count of lessons run, no quote, no anything that says "real."
- **Fix:** Two additions, both above the chapter grid:
  1. A counter strip: `624 interactive steps · runs 100% in your browser · zero backend · MIT-licensed`. (Already in OG image; pull it onto the page.)
  2. A "built by" line: `built by [@joshernst](https://x.com/TFisPython) — [follow on x](https://x.com/TFisPython) for daily build-in-public posts.` This is the entire point of the site existing. The link to the X account should be on every page.
- **Expected lift:** X follow-through rate from site visitors. This is the validation metric. Right now the site has no X follow surface.

### Gap 4 — The onboarding asks for a name and team but doesn't earn it

- **Symptom:** Onboarding screen 4 asks for name, pet, team, city. Friendly. But the user has no idea the examples will actually use these. They skip.
- **Root cause:** The "magic" — Cursor-rewriting examples to use your pet's name — is described in the README, not shown on the onboarding screen. Users skip what they can't preview.
- **Fix:** Add a one-line preview under the field grid: `pets = ["luna"]` updates live to whatever they typed for "pet." Show, don't tell. Already nearly there — the helper text mentions it; the screen should demo it.
- **Expected lift:** Personalization completion rate goes up, which means deeper engagement on lesson 1, which means screenshot-able "this course knows my dog's name" tweets.

### Gap 5 — Funnel friction from landing to first lesson is too long

- **Symptom:** Land → read hero → read 3 cards → scroll past 25 chapters → click "new here?" → 5 onboarding screens → first lesson. That's 6+ decisions and ~90 seconds before any code runs.
- **Root cause:** Every gate is well-intended. The aggregate kills momentum.
- **Fix:** Add an "instant try" affordance in the hero — an embedded mini-IDE with a 4-line broken Python snippet and a `run` button. They run it in the browser before they ever click anything. After one run, an ember-button appears: `start chapter 1 →`. This collapses the funnel from 6 decisions to 1.
- **Expected lift:** Lesson-1 click rate, time-to-first-code-run. Both correlate with willingness to follow on X (people follow makers whose product they've actually touched).

### Gap 6 — Shareability is zero on the homepage

- **Symptom:** Nothing on the homepage is screenshot-bait. The chapter grid is dense and gray. The 3 cards are abstract. There's no single visual moment.
- **Root cause:** Page is laid out for completeness, not virality. There's no "the bug" / "the price" / "the trace" hero card that someone wants to tweet.
- **Fix:** The homepage should re-use the OG art series as **inline scrollable sections**. Currently `og/launch/hook`, `wedge`, `ide`, `capstone`, `price` exist as social-share images and nowhere on the page. Render them as five vertical screen-tall sections, each one its own meme. The "wedge" section is the bug. The "price" section is `$0 forever`. The "capstone" section is the agent trace. People screenshot one section and post it — that's the loop.
- **Expected lift:** Inbound shares from organic site visits. Currently zero.

### Gap 7 — Audience signals are 60% there

- **Symptom:** Hero says "Cursor daily," "code literacy," "marketing managers, PMs, ops folks." Good. Then the rest of the page reverts to generic course language ("25 chapters," "production-AI track included," "5-question onboarding").
- **Root cause:** Voice is consistent in the brand doc, inconsistent on the page. Lots of generic language survived the rebrand from Pyloft.
- **Fix:** See the audience-language audit below.
- **Expected lift:** Audience self-recognition. A vibe-coder reading the page should think "this person knows what I do all day."

---

## Above-the-fold rewrite (concrete copy)

### Variant A (current, for reference)

```
PROMPTDOJO

Python for AI-first builders.

The Python you need to direct AI agents, read what they wrote,
and catch what they got wrong.

Built for the marketing managers, PMs, and ops folks who use
Cursor daily and have hit the ceiling of what they can do
without code literacy. Free forever, open source. No certificate,
no leaderboards, no paywall.
```

Reasonable. Reads like a brochure. Doesn't earn an X follow.

### Variant B (sharper hook — recommended default)

```
PROMPTDOJO

ai writes this. it's wrong.

[ inline code block, mono, ember-highlighted bug line ]
def collect_errors(
    msg: str,
    bag: list = []      ← mutable default. every caller mutates the same list.
):
    bag.append(msg)
    return bag

a python school for the version of you that lives in cursor.
22 chapters, 624 interactive steps, runs in your browser, free forever.

[ start chapter 1 → ]    or pick your chapter ↓
```

Why: leads with the bug (specificity = trust per VOICE.md), shows the product is about the bug class, and gives one CTA. Earns the screenshot. Earns the follow if the X handle is in the footer.

### Variant C (most aggressive — "you're using ai wrong" energy)

```
PROMPTDOJO

your ai shipped you a bug last tuesday.
you didn't catch it.

it was probably one of these six:
mutable default args · missing await · stale os.path · silent except: pass ·
off-by-one slice · wrong return type

22 chapters that drill exactly these. runs in your browser. no signup. forever free.

[ start with the bug list → ]
```

Why: most confrontational, best for X virality, riskiest for first-time visitors who don't recognize the failure modes. Use this as a campaign landing page (e.g. a `/bugs` route) for paid traffic and Twitter replies — not necessarily the default homepage.

**Pick:** Variant B as the homepage default. Variant C as a campaign page that lives at `/bugs` and gets linked from X replies and Reddit comments. Variant A is what we have and it's not earning the follow.

---

## Audience-language audit

Ten places where copy uses generic-edu language vs builder-class slang. All edits keep the meaning, swap the register.

| # | Location | Current (generic) | Proposed (builder-class) |
|---|---|---|---|
| 1 | Hero h1 | `Python for AI-first builders.` | `python for the version of you that lives in cursor.` |
| 2 | Hero subhead | `The Python you need to direct AI agents, read what they wrote, and catch what they got wrong.` | `read what cursor wrote. catch what it got wrong. ship it.` |
| 3 | Chapter grid label | `25 chapters · production-AI track included · free forever` | `25 chapters · 624 steps · the wedge no codecademy clone teaches in 2026` |
| 4 | Onboarding link | `new here? start the 5-question onboarding →` | `first time? 5 questions, then you write code →` |
| 5 | Card 1 title | `Read what AI wrote` | `read what cursor wrote` |
| 6 | Card 1 body | `Most lessons start with code Cursor or Claude already produced. You learn to read it, predict its output, and judge whether it works.` | `every lesson starts with code claude or cursor already shipped. you read it, predict the output, ship the fix.` |
| 7 | Card 2 body | `Hallucinated APIs, silent type bugs, off-by-one errors, broken imports.` | `hallucinated `httpx` calls. `def f(x=[])`. missing `await`. `except: pass`. the bugs ai ships confidently and you miss in review.` |
| 8 | Card 3 body | `When you understand mutation, scope, and control flow, you can prompt the AI like a tech lead instead of a passenger.` | `prompt cursor like a tech lead, not a passenger. the four-part prompt is in ch19.` |
| 9 | Onboarding goal option | `Tools for my team at work — Internal scripts, dashboards, AI plumbing.` | `tools for my team — internal scripts, dashboards, ai plumbing that doesn't break.` |
| 10 | Onboarding daily-floor screen | `Pick a daily floor.` | `how much time do you actually have.` |

Plus title-case fixes throughout: `Python for AI-first builders.` → `python for ai-first builders.` (BRAND.md says lowercase headlines, always). The site is currently mixed-case.

---

## OG / Twitter share audit

### Does the OG image stop a scroll on X?

The current default OG (`/og/launch/hook`) reads:

```
SHIPPING JUNE 2026
promptdojo
a python course for people whose code is mostly written by ai now.
22 chapters · 624 interactive steps · free forever
```

Honest take: it's competent but not arresting. The eyebrow says `shipping june 2026` — but the site is live now. That eyebrow is **lying to scrollers** and looks like every other "soon" SaaS. Kill it.

The much better OG image already exists at `/og/launch/wedge` (the mutable-default-arg bug). **That should be the default OG for the homepage, not `hook`.** The bug image stops scrolls. The wordmark image doesn't.

The `og/launch/price` image (`$0 forever, no login, no streaks, no upsell, open source`) is also stronger than `hook`. Either of those two should rotate as the homepage OG, not the wordmark.

**Action:** Change the default OG referenced in `app/page.tsx` metadata from the implicit homepage OG to `/og/launch/wedge` for the home, `/og/launch/price` for `/learn`, and `/og/launch/capstone` for any chapter 25 link. The wordmark image is for the about page, not the homepage.

### Does the tweet preview hook? Three alternative tweet drafts.

The drafts in `LAUNCH_TWEETS.md` are good, but they were written for "Pyloft." Three rewrites tuned for promptdojo + the validation goal:

**Tweet A — bug-first (highest expected reply rate):**

> cursor wrote me this last tuesday:
>
> def collect_errors(msg, bag=[]):
>     bag.append(msg); return bag
>
> mutable default args. python evaluates the list once at definition. every caller mutates the same list. ai ships this confidently and humans miss it in review.
>
> built a python school that drills exactly these. 22 chapters, runs in your browser, free forever.
>
> promptdojo.dev
>
> [og/launch/wedge image attached]

Why: hooks on a real bug, names the failure pattern, ends with a low-friction CTA. The OG image is the bug. The tweet is the bug. Both reinforce.

**Tweet B — price-as-the-hook:**

> $0. no login. no streaks. no upsell. open source.
>
> python school for people whose code is mostly written by ai now.
>
> promptdojo.dev
>
> [og/launch/price image attached]

Why: clean. The price OG is a screenshot meme. Works as a quote-tweet reply to any Codecademy / Boot.dev / DataCamp marketing post.

**Tweet C — wedge-as-positioning:**

> codecademy teaches python like it's 1995. boot.dev gamifies the same curriculum. both assume you want to be a software engineer.
>
> promptdojo is for the version of you that lives in cursor and needs to know what it got wrong.
>
> 22 chapters, 624 interactive steps, browser-only, free forever.
>
> promptdojo.dev

Why: confrontational positioning. Names competitors. Lifts the README's strongest line ("Codecademy teaches Python like it's 1995") onto the timeline. High repost rate from the AI-builder crowd.

---

## Top 5 changes that would move follower numbers

1. **Replace the hero with the bug.** Show the mutable-default-arg snippet (or a rotation of three real AI-shipped bugs) inline above the fold, with the headline `ai writes this. it's wrong.` This is the single highest-leverage change because it converts every site visit into a potential screenshot, and screenshots-with-source-link is how X followers compound. *Reasoning: site needs ONE shareable moment. The bug is it.*

2. **Put the X handle on every page, in the header AND the footer, with a `follow` CTA.** Not "Twitter" — a styled `[follow @TFisPython on x]` ember pill. The validation metric is followers; the site has no follow surface today. *Reasoning: you can't grow what you don't ask for.*

3. **Change the default OG image from `hook` to `wedge`.** Kill the `shipping june 2026` eyebrow on the hook image (it's already shipped). Make `wedge` the default for `/`, `price` the default for `/learn`. *Reasoning: tweet previews are 50% of why someone clicks a link. The wordmark OG doesn't earn a click.*

4. **Add a `/bugs` campaign page using Variant C copy.** Use it as the link in every X reply you make to a Cursor/Claude-shipped-bug tweet. The homepage stays welcoming; `/bugs` is the spear for paid attention. *Reasoning: Twitter reply marketing needs a more aggressive landing page than the homepage. Two doors, two audiences.*

5. **Embed a 4-line live IDE in the hero with a `run` button.** Pyodide is already loaded. They run code before they click "start chapter 1." The site stops being something you read and becomes something you used. People who used your product before they signed in tweet about your product. *Reasoning: time-to-first-Python-execution is the activation metric. Currently 90 seconds; should be 5.*

---

## V0 → V2 path through marketing

**Single best lever: turn every chapter URL into a tweetable claim that someone wants to dunk on or amplify, then reply-bomb the AI-builder timeline with them.**

The site currently treats chapters as "lessons." For X growth, every chapter should also be a thesis statement that fits in 280 characters and lives at a clean URL. Examples:

- `promptdojo.dev/bugs/mutable-default-args` → "the bug ai ships in 1 of every 47 functions"
- `promptdojo.dev/bugs/missing-await` → "the bug that turns 200ms into a 30-second timeout"
- `promptdojo.dev/wedge/the-four-part-prompt` → "the prompt template that works on cursor + claude code"

Each of those pages = one OG image + one piece of running Pyodide code + one CTA to "start chapter N." Each is its own tweet asset. Each is a reply hook for any Cursor / Claude / agent thread.

Then the daily build-in-public cadence from `LAUNCH_TWEETS.md` runs against these assets — except now every tweet can attach a real screenshot of a real page, not a screenshot of a marketing image.

The tightest 30-day path from current followers to 1,000:
- Week 1: ship Variant B hero + bug-section + X follow CTA on every page.
- Week 2: ship `/bugs/*` + `/wedge/*` URL pattern (12 pages = 12 assets).
- Week 3: 2x daily X reply-bomb in Cursor/Claude timelines, link into the relevant `/bugs` page, follow back everyone who follows.
- Week 4: One-tweet-a-day "ai shipped me this" thread series, each tweet linking to the chapter that drills it.

That's the marketing path. The build path (writing the bug pages) is the head of IT's call. The visual path (rendering the bug pages) is the UI Designer's. The thesis-per-URL pattern is the unlock.
