# UX Audit (beginner walkthrough)
_Date: 2026-05-06_

Scope: read-only walk through promptdojo as a brand-new visitor (PM/marketer/ops, daily Cursor user, never written Python). No code changes — every observation is grounded in the source files cited.

---

## The user's first 90 seconds (narrated)

**0:00–0:08 — They land.** The viewport is dark. A floating glass pill sits at the top with `promptdojo · curriculum · about · changelog · [login to save] · [follow @TFisPython on x]` (`components/SiteHeader/FloatingNav.tsx:54-72`). Below it the wordmark and a 3-character flame/snowflake/sparkle row of zeroes (`components/StreakWidget.tsx:25-46`) — to a brand-new visitor those icons say nothing. Then the headline: **"ai writes this. _it's wrong._"** (`app/page.tsx:99-102`). The italicized green "it's wrong" carries the punch.

**0:08–0:20 — They orient.** Subhead: *"a python school for the version of you that lives in cursor. 25 chapters · 624 runnable steps · runs in your browser · free forever."* (`app/page.tsx:104-107`). This is the line that earns the click. It tells a Cursor-using PM exactly why this exists. Strong.

**0:20–0:35 — The hook lands (or fails).** A code card titled `cursor.py · ai-generated` shows a 7-line Python function with `bag: list = []` highlighted red, captioned "MUTABLE DEFAULT ARG — python evaluates the list once at definition" (`components/HeroBugSnippet.tsx:14-53`). For a developer this is gold. For a non-developer who has never touched Python, the words *"mutable default arg"* are a wall. They might recognize "this is a bug" because it's red, but they won't understand the bug. They scroll.

**0:35–0:50 — Two CTAs.** `start chapter 1 →` (filled green button) and `or pick your chapter ↓` (`app/page.tsx:113-126`). Below that, the **welcome-back card** — but this is where it breaks for a fresh visitor. `HomeClient.tsx:44-61` renders a `dojo-card-highlight` linking to `/onboarding`. **That route does not exist.** Confirmed: `find app -name "page.tsx"` shows no `/onboarding` route — the actual onboarding lives at `/start` (`app/start/page.tsx`). A first-click on the most prominent card on the page 404s. This is the highest-severity bug in the build.

**0:50–1:05 — Three value cards.** "read what ai wrote · catch what it got wrong · direct it deliberately" (`app/page.tsx:134-156`). Concise and on-brand.

**1:05–1:30 — They scroll past:** stat strip ("17 chapters · 624 steps · 8–15h · MIT" `components/StatStrip.tsx:29-41` — note: stat-strip says **17 chapters** because `toc.chapters.length` returns whatever the manifest holds, but the headline above said **25 chapters** twice — a numbers mismatch on first scroll) → giant `$0` price band that says "no login · **no streaks** · no upsell · open source" (`components/PriceBand.tsx:6-26`) → email signup → 25-chapter rail.

**The price-band claim "no streaks" directly contradicts the streak widget rendered in the header at line 96 of `app/page.tsx`.** The hero shows flames and embers; the price band brags about not having them. A skeptical reader notices.

**1:30 — They click "start chapter 1".** They land on `/learn/v2/variables/naming-things/0`. The screen splits: left pane is markdown (`# Variables — the names AI reaches for first` — five paragraphs of dense prose, ~300 words, `content/python/01-variables/01-naming-things/01-intro.read.md:14-66`); right pane is a CodeMirror editor seeded with a 5-line dict-and-f-string example. The editor pane shows "booting python…" then "loading wasm…" then "press run · ⌘↵" (`components/v2/PersistentIDE.tsx:86-90`). The Continue button is enabled (it's a `read` step — `LessonStepClient.tsx:225` allows continue without grading). Most learners will read 1–2 paragraphs, hit Run, see the f-string output, and click Continue. That part works.

**On a phone:** `LessonShell.tsx:77-100` renders the prompt panel only and a "**desktop required**" gate explaining "the editor runs python in your browser via pyodide (~6 mb of webassembly). it ships clean on a laptop; on a phone it is a battery tax." Honest copy, but for the audience (lunch-break, phone-in-hand) the answer is "come back later" — and most of those visits will not come back. Treat mobile as a billboard, not a course.

---

## Top friction points

### 1. Broken `/onboarding` route on the home-page hero card
- **Where:** `components/v2/HomeClient.tsx:46` and `app/lesson/resume/page.tsx:31`
- **What:** The most prominent card on the homepage for a guest visitor — the `dojo-card-highlight` "get started in under a minute · five questions, then your first lesson" — links to `/onboarding`. That route doesn't exist; the actual onboarding flow is at `/start` (`app/start/page.tsx`). `app/lesson/resume/page.tsx:31` has the same bug — fresh users with no profile get routed to a 404. The header logic in `components/SiteHeader.tsx:17-18` and `components/v2/CourseProgress.tsx:40` *also* reference `/onboarding` — those checks silently fail too (chrome shows on `/onboarding` because the path never matches; this isn't visible to the user but is a code smell).
- **Why it hurts:** This is the single click most likely to lose a first-time visitor. They click the loudest card on the page and hit a 404. Every share of the homepage carries this risk. Of the 1000-X-followers V1→V2 gate, every new follower checking out the project hits this if their JS-disabled scrape or share preview lands on the welcome-back card.
- **Fix sketch:** Search-replace `/onboarding` → `/start` across the four files (`HomeClient.tsx`, `lesson/resume/page.tsx`, `SiteHeader.tsx`, `CourseProgress.tsx`). 15 minutes. Add a redirect in `next.config.ts` from `/onboarding` → `/start` as a belt-and-suspenders fallback so old shared links don't rot. **Effort: 30 minutes.**

### 2. The hero bug is unreadable to the target audience
- **Where:** `components/HeroBugSnippet.tsx:14-53` + `app/page.tsx:109-111`
- **What:** The hero "screenshot anchor" is a Python mutable-default-arg bug with a function signature using `:` type hints, `def`, and a return statement. The annotation calls it "MUTABLE DEFAULT ARG." Every word in that annotation is jargon. The audience (Josh's stated audience — non-dev PMs who use Cursor daily) does not know what `def` means, what `: list` is, or what "mutable" means. They look at it, register "it's red, so it's broken," and scroll. The screenshot-shareability of the hero — the founder's stated V1→V2 gate metric is X-follower growth — is therefore narrow: it shares to people who already know Python.
- **Why it hurts:** This is the page's screenshot moment. The whole copy strategy ("ai writes this. it's wrong.") promises a payoff in the visual proof below it. The proof is technically correct but socially mute. PMs won't tweet it because they can't articulate why it's interesting. Engineers already know. The hero earns no shares from the audience that's supposed to drive growth.
- **Fix sketch:** Replace the mutable-default-arg with a bug a non-developer can _feel_ — e.g., AI invents a Stripe API method that doesn't exist (`stripe.charges.calculate_total(...)`), or AI writes `if user.plan == "free" or "pro":` (a real, common, AI-shipped truthiness bug — every Python writer ships this one). Annotate it like a tweet: *"ai shipped this. it doesn't do what you think. tap to see why."* The lesson is the same — the bug is legible. **Effort: 1–2 hours** (replace snippet + write 1-paragraph caption + ship).

### 3. "no streaks" promise broken by the streak widget
- **Where:** `components/PriceBand.tsx:18-22` ("no login · **no streaks** · no upsell · open source") vs. `components/StreakWidget.tsx:25-46` rendered in the page header at `app/page.tsx:96`, plus the entire `lib/streaks.ts` ember/frozen-flame economy.
- **What:** Page renders flames, embers, frozen-flames, total-XP in the upper-right (`components/StreakWidget.tsx:31-45`). 800px lower the price band brags "**no streaks**." The product clearly has streaks — `lib/streaks.ts` is a 137-line streak engine with awardPass, embers, frozen flames. The voice is dishonest in a small, specific way that the brand voice (`design-kit/BRAND.md` — dry, no-exclamation, no-marketing) cannot afford.
- **Why it hurts:** Trust dip. The brand sells skepticism ("ai writes this. it's wrong.") — it lives or dies on being credibly truthful. A $0-no-strings page that contradicts itself in 6 lines of body copy invites the visitor to discount everything else.
- **Fix sketch:** Either (a) drop the streak widget from the homepage header and keep "no streaks" honest, or (b) change the price band copy to "no login · no guilt · no upsell · open source." **(b) is the right call** — the streak system is well-designed (embers absorb missed days, frozen flames are earned not bought, no gem economy by design — all written into `lib/streaks.ts:5-9`). It's not a punitive streak. Sell the difference instead of denying it. **Effort: 5 minutes.**

### 4. First-lesson intro is a 300-word essay before any interaction
- **Where:** `content/python/01-variables/01-naming-things/01-intro.read.md:14-66`
- **What:** Step 1, type `read`, runnable. The prompt panel is a 5-paragraph essay on labels-stuck-on-values mental models. The IDE on the right has a 5-line dict-and-f-string example. The Continue button is enabled from the start (the `read` step in `LessonStepClient.tsx:225` doesn't gate on anything). The only call-to-action ("Hit **Run**") is the literal last sentence of the essay (line 66) — the user has to read past everything to find the action.
- **Why it hurts:** The audience is "attention-poor on lunch break." They scan, don't read. The first 90 seconds need to deliver a Run-and-see-output reward; instead they get a textbook chapter. The Codecademy / Boot.dev pattern (which this project models on, per `components/v2/LessonStepClient.tsx:271-276` "Codecademy-style") puts the call-to-action _first_, then the explanation. Step 1 here inverts that.
- **Fix sketch:** Restructure step 1: lead with **"Hit Run on the right. We'll explain after."** as the first line. Then 3 paragraphs of explanation, not 5. The "labels stuck on values" mental model is good — keep it as step 3 of the lesson (after the user has run something), not step 1. **Effort: 1 hour** (one author rewriting one file).

### 5. The mobile gate is a dead-end with no follow-up
- **Where:** `components/v2/LessonShell.tsx:77-100`
- **What:** Below `md` breakpoint the lesson route renders the prompt + an honest "desktop required" message + a "↵ resume on desktop" button + "we save your spot. open this same url on a laptop." There's no email-capture, no "I'll text myself the link," no "follow on X for when chapter 2 ships." The visitor came on mobile, can't run it, and leaves.
- **Why it hurts:** The audience profile says lunch-break and Slack-lull — a high share of first visits are mobile. The brand cannot afford to convert these to nothing. The follow-on-X pill exists site-wide (`components/FollowOnXPill.tsx`) but isn't on the mobile gate; the email signup component exists (`components/EmailSignup.tsx`) but isn't on the mobile gate either. Both surface elsewhere on the site.
- **Fix sketch:** On the mobile gate, replace "↵ resume on desktop" with three stacked CTAs: (1) "email me the link to open on my laptop" (reuses `EmailSignup.tsx`), (2) "follow on X — i'll post when ch 2 ships" (reuses `FollowOnXPill.tsx`), (3) "or `cmd+L` and try anyway." This converts the dead-end into a follower or email — the V1→V2 metric. **Effort: 2–3 hours** (compose existing components into the mobile gate, write 3 lines of copy).

### 6. StatStrip says "17 chapters" while the headline says "25 chapters"
- **Where:** `components/StatStrip.tsx:29` (`{chapters} chapters` reads from `lib/generated/v2/manifest.toc.json`) vs. `app/page.tsx:106, 167` (hardcoded "25 chapters").
- **What:** The home page has the number 25 in the hero subhead, the price-band-anchor section header, and meta-description ("25 chapters · 624 runnable steps"). The receipt-style stat strip 12 sections later reads from the live manifest — currently 17 chapters built (verified: `find content/python -type d -mindepth 2 | wc -l` shows 62 directories total but 17 chapters). The visitor sees both numbers in the same scroll.
- **Why it hurts:** Two numbers for the same thing on the same page makes the page feel unfinished — which it is, but the visitor doesn't need to know that. Trust dip #2 in the same scroll as the streak-promise contradiction.
- **Fix sketch:** Decide one canonical phrasing. If the curriculum spans 25 chapters but only 17 are built, copy reads "17 of 25 chapters live · 624 steps shipped." Or hardcode `25` in StatStrip. The first is more honest and on-brand. **Effort: 15 minutes.**

### 7. The `read` step's "you can edit this" affordance is silent
- **Where:** `components/v2/LessonStepClient.tsx:271-287` (recent change makes `read` and `mc` editor editable) + `components/v2/PersistentIDE.tsx:251` (only shows a `<Lock>` icon when `readOnly`)
- **What:** The recent UX upgrade — making the IDE editable on `read` and `mc` steps so learners can poke at the example — has no UI signal. The `<Lock>` icon shows when read-only; nothing shows when editable. The user sees a code block that looks identical to a static rendered code snippet. The "you can change the values and re-run" insight is hidden behind a click-and-find-out.
- **Why it hurts:** The single most addictive moment in learning to code is "wait, I can change this and see what happens?" It's the screenshot-able moment that drives X shares. Hiding it forfeits the moment.
- **Fix sketch:** When a `read` or `mc` step has an editable IDE, add a one-line hint above the editor or in the run-bar status copy: e.g. swap `"press run · ⌘↵"` (`PersistentIDE.tsx:90`) for `"edit anything · press run · ⌘↵"` on these step types. Or render a thin green ribbon on the editor's left edge to signal "you own this." **Effort: 1 hour** (1 prop, 1 string, 1 visual touch).

### 8. The streak widget's icons are unreadable on first encounter
- **Where:** `components/StreakWidget.tsx:25-45`
- **What:** Three icons (Flame, Sparkles, Snowflake) all sized 14px, all green, all rendering `0` to a fresh user. Tooltips explain — but tooltips on touch devices don't fire, and on desktop most users don't hover the upper-right of the page. A returning user with a streak benefits; a brand-new visitor sees three meaningless emoji-zeroes that compete with the wordmark for visual real estate.
- **Why it hurts:** First impression real estate is finite. Three opaque numbers in the header burn attention without paying it back for the people who haven't earned them.
- **Fix sketch:** Hide the StreakWidget on the home page when `current === 0 && embers === 0 && frozenFlames === 0`. It already gates rendering on `s` being null (`StreakWidget.tsx:23`); add an empty-state gate. Show it on lesson pages only — that's where it earns its space. **Effort: 30 minutes.**

---

## Hidden gems (great features users might miss)

- **Brain Dump (`components/BrainDump.tsx`):** ⌘⇧B from anywhere parks a thought without leaving the lesson. Genuinely well-designed for ADHD use. Surfaced only as a small pill bottom-right and one footer line ("press ⌘⇧B anywhere to park a thought without losing your place" — `app/page.tsx:178-181`). Surface this in the onboarding flow ("we built this for ADHD brains — here's how to capture a tangent without losing your place"). It's a brand asset.

- **Login-to-Save with no auth (`components/LoginToSave.tsx`):** Type your email, sync across devices, no password. The disclosure footer is honest — "no account, no auth. anyone with your email can load your progress." This is genuinely radical for the demographic, who have password-fatigue. But the trigger is `[ login to save ]` — a label that triggers password-trauma exactly because it says "login." Rename to `[ sync across devices ]` or `[ save to email ]`. Same UX, different word, different reaction.

- **Frozen Flames as chapter trophy (`lib/streaks.ts:114-123`):** Earned, not bought. No gem economy by design. This is the anti-Duolingo positioning the brand needs — but it's invisible to a fresh user. A one-line marketing footer somewhere ("flames you can't buy. no gem store. ever.") would tell the story.

- **Hint reveal escalation (`components/v2/steps/_HintReveal.tsx`):** Multi-level hint reveal that only counts the highest level used. Self-paced help, no shame. Excellent. But the button label is just `Show hint` / `Show hint 2` — it doesn't telegraph that hints are free and don't penalize. Add the smallest reassurance: `Show hint (free, no streak hit)`.

- **Pyodide preloader (`components/PyodidePreloader.tsx`):** Aggressive WASM warmup on the home page so the first lesson IDE is ready instantly. This is invisible engineering excellence. The user only feels its absence. Worth a one-line developer-blog post on launch — _"why our Python school feels instant"_ — because that's a Hacker News headline in itself.

---

## "If you ship one thing this week" — the single highest-leverage UX change

**Fix the broken `/onboarding` route.** (Friction #1.)

Reasoning, ranked:

1. **It is the only outright bug in the audit.** Everything else is taste and tradeoff. This one is a 404 on the most prominent first-click for guest visitors. Until it's fixed, every X-share or word-of-mouth referral burns a non-zero fraction of visitors at the door.
2. **The fix is 30 minutes.** Search-replace `/onboarding` → `/start` in 4 files plus a `next.config.ts` redirect for old links. Lower effort than any other item.
3. **The audit's #1 stated goal is X-follower growth (V1→V2 gate at 1000).** Every dropped-at-the-door visitor is a follower not earned. This is the highest leverage on the explicit success metric.
4. **Once the door works, friction #2 (hero bug legibility) becomes the next leverage point** — but that's a 1–2 hour copy + design rewrite, not a same-day ship. The order of operations is: unblock the door this afternoon, then spend a week on the hero.

The sequence is: **unbreak `/onboarding` (today, 30 min) → rewrite the hero bug for non-developers (this week, 1–2 hr) → fix the "no streaks" contradiction (next push, 5 min) → harvest the mobile dead-end with email/X capture (next sprint, 2–3 hr)**.

Everything else is polish. The door comes first.
