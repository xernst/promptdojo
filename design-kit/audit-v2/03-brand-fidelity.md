# Brand Fidelity v2 — punk + serious

> Live: https://promptdojo.pages.dev — audited post-refresh (after picks #1–#7 of CEO-vision shipped).
> Scope: voice attribute calibration, not visual or IA.
> Phase 1 (`audit/03-brand-audit.md`) found Title-Case + Inter + rogue-color leaks. Those landed. This pass is the next-order question: now that the voice is consistent, **which voice attributes signal "serious learning tool" vs "indie hobbyist," and which to keep, soften, or sharpen?**

---

## The tension, named precisely

Promptdojo's voice today reads **dev-Twitter shitpost** more than **product**. That's a feature when you're in the feed; it's a liability when a Codecademy designer lands on the homepage cold and has to decide in 4 seconds whether this is a real school or someone's weekend repo.

The punk attributes (lowercase, fragments, `❯`, brackets, "fork it. break it.") all do the same job: they signal *"this was made by someone who codes, not a content team."* That signal is load-bearing for the audience (cursor-using PMs / marketers / indie devs) and unfaked-able by Coursera. **We do not retreat from it.**

What we *don't* have, and what Codecademy / Khan / Boot.dev / freeCodeCamp all do have, is **operator-level proof.** Real numbers. Real outcomes. Real "last updated." Real GitHub commit cadence. Real founder credentials. The punk voice without the proof reads as a hobbyist who's *performing* indieness. The same punk voice plus visible substrate ("624 steps, runs on pyodide 0.27, last commit 3 days ago, MIT, 47 stars") reads as **a senior dev who chose this aesthetic on purpose.**

The fix is not "soften the voice toward Codecademy." The fix is **add the receipts.** Punk + receipts = legitimate. Punk without receipts = hobby project. We are building the receipts layer.

A second, smaller fix: a few punk moves are doing nothing for us and one is actively fighting comprehension. Those get sharpened or retired below.

---

## Voice attributes — keep / soften / sharpen

### 1. all-lowercase headlines
- **Keep.** Permanent brand mark. `ai writes this. it's wrong.` only works lowercase. Codecademy designers will read it as a deliberate choice, not a typo, *because the rest of the page is internally consistent.*
- **Sharpen** by holding the line everywhere — the few remaining sentence-case stragglers (StepFooter `"Lesson XP"`, `"Hint"`, `"Skip"`, primaryLabel default `"Continue"` at `components/v2/StepFooter.tsx:33,88,122,132`) are not on the home/about path Phase 1 swept. They're inside the product. A returning user who hits `Hint (3)` capitalized after lowercase everything else loses the spell. Lowercase those too.
- The lesson header `chapter.title.toLowerCase()` + `lesson.title.toLowerCase()` at `LessonStepClient.tsx:154,160` already does this at runtime — good. No change needed there.

### 2. sentence fragments ("ai writes this. it's wrong.")
- **Keep.** The single highest-leverage punk move. The hero (`app/page.tsx:84-86`) renders `ai writes this.` then `it's wrong.` as a two-beat reveal. That IS the brand. Don't touch.
- **Sharpen** by deploying the same two-beat structure on chapter overviews and the WEDGE section — currently the about page WEDGE headline (`app/about/page.tsx:158-163`) buries the fragment shape inside a long sentence: *"every other course teaches you what python is. this one teaches you what it isn't."* The shape is right; the line is too long. Tightened version below.

### 3. `[ login to save ]` bracketed mono pills
- **Keep, but make them earn it.** Brackets on mono evoke terminal output / IRC. Used twice: `LoginToSave.tsx:148,190` and `FollowOnXPill.tsx:20`. Both read as terminal affordances, not buttons — that's the right metaphor for a school-shaped-like-a-terminal.
- **Soften** the *pattern's frequency* — three pills (login, X, "[ esc ]" close) clustered in the layout header at `app/layout.tsx:24-36` is one pill too many. The `[ esc ]` close-button at `LoginToSave.tsx:190` is fine inside the modal, but on the global header, two ember-bracket pills competing visually next to each other (LoginToSave + FollowOnX) makes both feel less special. Demote one to ghost (no border, ember text only) so the brackets become a hierarchy, not a stripe.
- **Hard rule going forward:** brackets are reserved for *system affordances* (login, follow, esc, run). Never use them for narrative copy. If you find yourself bracketing `[ start chapter 1 ]`, you've broken the rule.

### 4. `❯` prefix everywhere
- **Sharpen.** Currently used at `app/layout.tsx:29` (header link), `app/about/page.tsx:124` (about hero eyebrow), `LoginToSave.tsx:263` (modal disclaimer), `Wordmark.tsx:31,44` (the lockup itself). Five surfaces. Good — but **none of them blink.** The CEO vision (`audit/CEO-vision.md:71-75`) calls the 1Hz blink the brand's heartbeat. Without it, `❯` is a static glyph; with it, it's a live cursor. Codecademy doesn't have a heartbeat. We do — but we have to ship it. (Phase 1 §Critical 5 already lists this; no new finding, just: *sharpen by activating it on the wordmark and the about-hero `❯` at minimum, before adding more `❯` instances elsewhere.*)
- **Don't sprinkle more `❯` into prose.** The disclaimer at `LoginToSave.tsx:263` (`"❯ no account, no auth..."`) is borderline — it's narrating in caret-prefix as if the user is reading shell output. Read aloud, it works. Keep it. But this is the ceiling. One per surface, not per paragraph.

### 5. section labels — "the wedge", "what's inside", "how it works", "free forever", "who built it", "why this, not codecademy", "faq"
- **Keep most, retire two.** The `tracking-[0.35em]` ember-mono eyebrow pattern at `app/about/page.tsx:154,180,210,235,273,300,334` is excellent — this is the most "real product" thing on the site. Codecademy has H2s; we have eyebrows. That's a brand asset.
- **"the wedge"** — keep. It's the YC-blooded language and reads as builder vocabulary. Good.
- **"what's inside"** — soften. Reads slightly product-pageish ("what's inside the box?"). Suggest **`the curriculum`** or **`the 25 chapters`**. More school, less subscription box.
- **"how it works"** — soften. This phrase is the most generic line on the page. Every SaaS landing page has one. Suggest **`the loop`** (read · run · fix; "the loop" is dev vocabulary and matches the body content already at `app/about/page.tsx:214` "read. run. fix. repeat 624 times.").
- **"free forever"** — keep. On-brand. Codecademy charges; we're permanent free. The label *is* the wedge.
- **"who built it"** — keep. Direct, anti-corporate.
- **"why this, not codecademy"** — sharpen. This is the strongest section eyebrow on the property. The competitor name is the punch. *Keep verbatim.*
- **"faq"** — keep. Lowercase and three letters. Maximum economy.
- **Page-1 home "25 chapters · production-ai track included · free forever"** at `app/page.tsx:155` — this is doing eyebrow duty + value-prop duty in one line, which is fine, but **`production-ai track included`** is the only pre-existing punk phrase that doesn't *mean* something to a Codecademy designer. The phrase "production-ai track" suggests a separately-priced upsell — read it as a Coursera designer would. Recommend: **`25 chapters · 624 steps · free forever`.** Drops the marketing pseudo-tier and adds a number.

### 6. no social proof — honest or unconvincing?
- **Sharpen by replacing missing-social-proof with operator-proof.** The current state (zero testimonials, zero "10K students," zero badges) is an *honest* punk move and we keep that posture forever. But "no proof" is only legible as confidence if there *is* visible proof of *substance*: GitHub activity, run-time numbers, last-updated stamp, the founder's actual face/name/track record.
- The about page does some of this already — `i'm josh`, `624 interactive steps`, `8–15 hours`, `~100 lines of python`, links to GitHub + X — but the home page does almost none of it. The home hero at `app/page.tsx:88-91` says `25 chapters · 624 interactive steps · runs in your browser · free forever` — that's four numbers. **Add a fifth: the GitHub stars or the last-commit date.** One more receipt is the difference between "indie" and "indie *and shipping*." See "Trust signals" section below.
- **Hard NO** on adding fake testimonials or "join 10,000 builders." Numbers we don't have are worse than no numbers at all.

### 7. casual asides ("fork it. break it. open a pr.")
- **Keep.** That line at `app/about/page.tsx:309-310` is the strongest about-page sentence and reads as builder vocabulary, not casual filler. It's a directive, not a wink — three imperatives in a row.
- **Soften** the volume of casual filler elsewhere. `LoginToSave.tsx:194-198` (`"type your email. we'll sync your progress here and on any other device. no password. no spam. type the same email anywhere else and your dojo loads."`) has six sentences when three would do. The repeated "type the same email" at the end is a tell that the writer over-explained. Shorter version below.
- The disclaimer at `LoginToSave.tsx:263-265` (`"no account, no auth. anyone with your email can load your progress. don't use a shared mailbox if that bothers you."`) is **on-voice and protects the user.** Keep verbatim. *Especially* the "don't use a shared mailbox" line — that is exactly the senior-dev-at-11pm voice the kit asks for.

### 8. first-person founder voice on /about ("i'm josh")
- **Keep + sharpen.** First person on /about is correct — Codecademy can't do this because "Codecademy" is not a person. We have one founder; the voice should sound like that founder. *That is the moat.*
- **Sharpen** by adding *one sentence of operator-credentialing.* Right now `app/about/page.tsx:277-282` says: *"i'm josh. i wrote this because i wanted to learn python the way i actually use python..."* — good shape, missing receipt. Codecademy designers reading this think *who's josh and why does this matter?* Add a one-line bona fides: *what you've shipped, what you do day-to-day, why you're qualified to teach python-via-AI specifically.* See rewrite below.
- **Do NOT** turn it into a LinkedIn paragraph. One line. Specific. No brag-stacking. Specific role / specific company / specific count.

### 9. sentence-case button labels (`start the course →`)
- **Keep.** Lowercase CTAs are the brand and the home/about/onboarding all comply. The mono-uppercase tracking-wider treatment at the actual button level (`font-mono text-xs font-bold uppercase tracking-wider`) — see `app/page.tsx:100`, `app/about/page.tsx:139,317,325`, `LoginToSave.tsx:237` — pulls the *visual* weight back up to "this is a real button" while the *text* stays lowercase. That dual-encoding (mono+uppercase visually, lowercase semantically) is the single smartest punk-vs-serious move on the property. Don't touch.
- **Sharpen** the inconsistency in the `StepFooter.tsx:33` default `primaryLabel = "Continue"` and the in-modal `<button>{primaryLabel}` at `:147` — that string is sentence-case `"Continue"` and bypasses the mono-uppercase visual treatment. Inside the lesson chrome, that button reads more "save document" than "advance the lesson." Lowercase the default + apply the same mono-bold visual the home buttons use. (The Phase 1 audit caught this; just confirming it's still the right call from the v2 perspective.)

---

## Specific copy rewrites (the meat)

### Home hero

| Surface | File:line | Current | Proposed | Why |
|---|---|---|---|---|
| Sub-hero blurb | `app/page.tsx:88-91` | `a python school for the version of you that lives in cursor. 25 chapters · 624 interactive steps · runs in your browser · free forever.` | `a python school for the version of you that lives in cursor. 25 chapters · 624 steps · 8–15 hours · pyodide-in-browser · MIT.` | Replaces redundant "interactive" with a time estimate (Codecademy and Boot.dev both publish hours; punk version is just the hours). Adds a license. "pyodide-in-browser" reads as substrate-proof, not feature-puff. |
| Chapters eyebrow | `app/page.tsx:155` | `25 chapters · production-ai track included · free forever` | `25 chapters · 624 steps · free forever` | Drops the pseudo-tier "production-ai track included" which sounds like a Coursera upsell. Two numbers and the "forever." Replaces airy with concrete. |

### About hero

| Surface | File:line | Current | Proposed | Why |
|---|---|---|---|---|
| H1 | `app/about/page.tsx:127-129` | `a python school built for the version of you that lives in cursor.` | Keep verbatim. | This is the cleanest sentence on the property. Don't touch. |
| Sub-hero | `app/about/page.tsx:130-135` | `promptdojo teaches you the python you need to direct ai agents, read what they wrote, and catch what they got wrong. it's not a syntax course. it's a school for the new job: editing the model.` | Keep verbatim. | "editing the model" is the sharpest framing on the page. |
| Hero stat strip (NEW) | After `app/about/page.tsx:135` | *(none)* | Add a one-row mono strip immediately under the sub-hero: `25 chapters · 624 steps · 8–15h · MIT · last commit ${date}` | Codecademy designers scan for substance markers in the hero zone. Five receipts in one line. The `last commit` is the cheapest credibility upgrade on the property and trivially shipable from `git log -1 --format=%cd`. |

### About wedge

| Surface | File:line | Current | Proposed | Why |
|---|---|---|---|---|
| WEDGE H2 | `app/about/page.tsx:157-163` | `every other course teaches you what python is. this one teaches you what it isn't.` | `every course teaches you what python is. you need to know what it isn't.` | Same shape, four words shorter, second half lands as a directive ("you need to") not a self-comparison ("this one"). Less "we vs them," more "what you actually need." |
| WEDGE column "the gap" | `app/about/page.tsx:21-23` | `you can vibe-code a hundred features without learning python. then one bug ships and you can't read the traceback.` | Keep verbatim. | This is the second-best line on /about. The "can't read the traceback" is the punch. |

### About FAQ

| Surface | File:line | Current | Proposed | Why |
|---|---|---|---|---|
| Q "do i need python experience?" | `:93-95` | `no. chapter 01 starts at variables. if you've used cursor or claude to write code, you know enough to begin.` | Keep verbatim. | On-voice. |
| Q "is it really free?" | `:96-99` | `yes. no paid tier, no premium content. the only money this site costs me is the domain.` | Keep verbatim. | The "costs me" is the founder voice. Keep. |
| Q "do i have to log in?" | `:100-103` | `no. progress saves to your browser. login only syncs progress across devices. no email-list, no upsell, no nag.` | `no. progress saves to your browser. login syncs across devices — that's the only reason. no email list, no upsell, no nag.` | Tightens "login only syncs progress across devices" → "login syncs across devices" + recasts the "only" as a clause that names the rule. |
| Q "how long does it take?" | `:104-107` | `624 steps. most steps are 30 seconds. realistically: 8–15 hours total spread over a few weeks.` | Keep verbatim. | Tabular numbers + dry "realistically." Senior dev voice. |
| Q "what if i find a bug?" | `:108-111` | `open an issue or a pr at github.com/xernst/promptdojo. or dm me on x.` | Keep verbatim. | Two channels, no PR template gospel. Good. |
| Q "why isn't it on udemy / coursera / boot.dev?" | `:112-115` | `because i wanted it to look how i wanted it to look, ship in browser, and never gate-keep behind a streak.` | `because i wanted it to look how i wanted it to look, ship in the browser, and never gate-keep anything behind a streak.` | Two micro-fixes: "in browser" → "in the browser" reads cleaner aloud; "behind a streak" → "anything behind a streak" because "streak" is the proper noun, not the only thing they gate. |
| Q (NEW) "how often is it updated?" | After `:115` | *(none)* | Q: `how often is it updated?` A: `commits land most weeks. content gets revised when models change shape — the agent-loop chapter looks different in 2026 than it did in 2025. follow the build at @TFisPython.` | This is the missing "this isn't abandoned" signal. Codecademy gets to imply ongoing maintenance because they're a company; a solo founder has to *say it.* |

### Onboarding

| Surface | File:line | Current | Proposed | Why |
|---|---|---|---|---|
| Welcome H1 | `app/onboarding/page.tsx:191-193` | `you're going to learn python.` | Keep verbatim. | Five words. Says the thing. |
| Welcome sub | `:194-197` | `ai is your co-pilot, not your crutch. you'll learn the shapes you need to direct it, read it, and catch when it's wrong.` | Keep verbatim. | On-voice; Phase 1 already fixed this from the prior "we'll teach you" version. |
| Welcome pacing | `:198-200` | `five questions. under a minute. then you write code.` | Keep verbatim. | Three fragments, three beats. Don't touch. |
| Daily-goal "5 min" blurb | `:73` | `a coffee. keep the streak alive.` | `a coffee. one short read.` | "keep the streak alive" gestures at gamification we've explicitly disowned ("missing a day costs an ember, not the streak" at `:367-369`). Saying "streak" in a positive valence here contradicts the ember-not-streak posture. Recasts as time-as-substance. |
| Skip-to-generic CTA | `:336-338` | `skip — generic examples` | `skip — use generic names` | "Generic examples" sounds like a feature flag. "Generic names" tells the user what they actually get (luna → cat). |

### Lesson chrome

| Surface | File:line | Current | Proposed | Why |
|---|---|---|---|---|
| StepFooter primaryLabel default | `components/v2/StepFooter.tsx:33` | `primaryLabel = "Continue"` | `primaryLabel = "continue"` | Lowercase. Phase 1 caught the others; this is the prop default that propagates. |
| StepFooter "Lesson XP" | `:88` | `Lesson XP` | `lesson xp` | Inside the lesson, mid-chrome, currently the only Title-Case label. |
| StepFooter "Hint" / "Skip" | `:122,132` | `Hint` / `Skip` | `hint` / `skip` | Same. |
| LessonStepClient footer micro-copy | `LessonStepClient.tsx:175-177` | `passed ? "locked in. move on when you're ready." : "⌘↵ runs the editor."` | Keep verbatim. | "locked in." is the best two-word voice line on the entire site. |
| Continue button label | `:189` | `next ? "continue →" : "finish"` | `next ? "continue →" : "next chapter →"` | The CEO vision §6 already commits to `Finish → next lesson` routing for non-final lessons. Rename the *last-step-of-final-lesson* label too — `"finish"` is dead-end vocabulary; `"next chapter →"` keeps the user pulling forward. (For the actual final-lesson-of-final-chapter, render `"that's all 624 →"` linking home.) |

### Login modal

| Surface | File:line | Current | Proposed | Why |
|---|---|---|---|---|
| Modal H2 | `LoginToSave.tsx:181-183` | `login to save` | Keep verbatim. | Three words, lowercase, says the thing. |
| Modal body | `:194-198` | `type your email. we'll sync your progress here and on any other device. no password. no spam. type the same email anywhere else and your dojo loads.` | `type your email. we sync your progress across devices. no password. no spam. same email anywhere else, same dojo.` | Five sentences → four. Drops the redundant "type the same email" tail and recasts as a dry equivalence. The `same email anywhere else, same dojo` is the punk-precise version. |
| Disclaimer | `:263-265` | `❯ no account, no auth. anyone with your email can load your progress. don't use a shared mailbox if that bothers you.` | Keep verbatim. | This is the strongest disclaimer on any school site I can name. Senior-dev-at-11pm pure. |
| Submit button copy | `:239-247` | `saving... / loading... / saved / loaded / save` | Keep verbatim, but consider `saved ✓` / `loaded ✓` for the success states. | Tiny status reassurance without adding a noun. |

### X CTA

| Surface | File:line | Current | Proposed | Why |
|---|---|---|---|---|
| FollowOnX pill | `FollowOnXPill.tsx:20` | `[ follow @TFisPython on x ]` | Keep verbatim. | Bracket pill is correct. Don't touch. |
| Layout positioning | `app/layout.tsx:32-35` | LoginToSave + FollowOnXPill side-by-side, both bracket-styled. | Keep both pills, but **demote LoginToSave to ghost** (no border, ember text only) so FollowOnX is the lone bracket on the global header on a fresh user. After login, LoginToSave's border returns. | Two identical-looking pills in the global header reads as "feature row." One pill (FollowOnX) plus a quieter login affordance reads as "primary CTA + secondary." Validation metric is followers; the brackets-volume budget should bias to the pill that grows the metric. |

### Footer

| Surface | File:line | Current | Proposed | Why |
|---|---|---|---|---|
| Home footer | `app/page.tsx:234-242` | `Press ⌘⇧B from anywhere to park a thought without losing your place.` | `press ⌘⇧B anywhere to park a thought without losing your place.` | Lowercase + drop "from" (one word, same meaning). Same line, half a beat tighter. |
| About footer | `app/about/page.tsx:378-381` | `<Wordmark /> · github.com/xernst/promptdojo · x.com/TFisPython` | Add a third item: `· last commit ${date}` rendered server-side. | Mono-tracking footer is the perfect place for the receipt. Three items become four. Codecademy can't do this. |

---

## Section-label naming

| Current | Verdict | Proposed | Reasoning |
|---|---|---|---|
| `the wedge` | Keep | — | Builder vocabulary, on-brand, distinctive. |
| `what's inside` | Replace | `the curriculum` *or* `the 25 chapters` | "What's inside" reads subscription-box. `the curriculum` is the school word and reclaims it from Coursera. `the 25 chapters` is more punk and gives the reader a number in the eyebrow. **Pick `the curriculum`** — it owns the school metaphor instead of dodging it. |
| `how it works` | Replace | `the loop` | "How it works" is on every SaaS landing page in the world. The body literally is "read. run. fix. repeat 624 times." — `the loop` reuses dev vocabulary that already shows up in chapter content (`agent loops`). Builder-class slang per VOICE.md:14. |
| `why this, not codecademy` | Keep + protect | — | Strongest eyebrow on the property. The competitor name is the punch. Do not water it down to "why promptdojo." |
| `who built it` | Keep | — | Direct, no false-modesty. |
| `free forever` | Keep | — | Two words, total commitment, on-brand. |
| `faq` | Keep | — | Lowercase three letters. |
| `start here` (home, new-user card) | Keep | — | At `HomeClient.tsx:73-75`. Two words, lowercase. Clean. |
| `welcome back` (home, returning) | Keep | — | At `HomeClient.tsx:103-105`. Two words. |

---

## Trust signals to add (without selling out)

The job: make the punk voice legible as professional by surrounding it with **operator-grade receipts.** Each item below is shippable in <30 minutes and adds a credibility marker that doesn't require fake numbers, badges, or testimonials.

### 1. Last-commit timestamp — *the single highest-leverage receipt*
- Render server-side from `git log -1 --format=%cd --date=short`.
- Place: about-page footer (next to the github link), home-page footer, OG art footer.
- Format: `last commit · 2026-05-04` (lowercase, mono, ink-500).
- Why it works: A dead repo and an alive repo look identical from the outside until this number appears. This is the single most efficient "this is maintained" signal a solo project can ship.

### 2. GitHub star count + repo link in about hero
- Fetch at build time (Cloudflare Pages build env), inline as a static number. No live badge — badges are noisy. Just `47 ★ on github` rendered in the eyebrow zone.
- Place: under the about-hero stat strip proposed above.
- Why: Stars are imperfect but real. Anything > 0 reads as "other engineers vetted this." Anything > 50 reads as "this is a thing." Anything < 50 just shows up as a number that doesn't claim more than it is.

### 3. Founder bio depth — one line of credentials
- Add to `app/about/page.tsx:277` between "i'm josh." and "i wrote this..."
- Suggested: `i'm josh. i'm an ai consultant; i ship python alongside cursor and claude every day for client work.` (Or whatever the truthful version of that sentence is — I don't have visibility into the latest job-state, so the implementer should write the actual one-liner. The shape is: *one role + one tool stack + one frequency word.* Not "ex-Google." Not "10x engineer." Just what Josh actually does.)
- Why: Codecademy designers do not need to know who Josh is to take Codecademy seriously, *because Codecademy is the brand.* For a one-person school, the founder *is* the brand. One sentence of credentialing converts "weekend hobbyist" to "practitioner who wrote down what works."

### 4. "What you'll know after" outcomes per chapter
- Currently the chapter cards (`app/page.tsx:174-179`) show `title + blurb + lessonCount + stepCount`. The blurb is descriptive ("variables, naming, scope...") but doesn't promise an *outcome.*
- Add per-chapter, in the chapter-overview page (out of audit scope here but flagging for content): `after this chapter, you can: ${one specific verb-led outcome}`. Codecademy and Boot.dev both publish these. The punk version is just one sentence per chapter, lowercase, no bullets.
- Why: Outcomes-per-chapter is what learning-tool buyers (PMs evaluating a course) check first. Their absence reads as "this is a tour, not a curriculum."

### 5. Visible run-time numbers in the IDE
- The Phase 1 audit found this is already on-brand at `route.tsx:431` (`ran in 187ms · pyodide wasm · client side`). This is the gold standard — replicate it more.
- After every Run, persist the last-run line under the editor: `ran in 142ms · python 3.12 · pyodide 0.27`. Right now the OutputPane shows output but not the metadata. The metadata IS the receipt.
- Why: Codecademy hides the runtime; we expose it. That asymmetry is a brand asset.

### 6. The pyodide cold-start moment
- The CEO-vision §6 already commits to softening "Booting Python (one-time, ~5s)…" but the v2 voice question is: replace what with what?
- Suggested: `warming up python in your browser. ~5s. only this once.` (Lowercase, three sentence fragments — exactly the welcome-screen pacing.) This is on the same axis as run-time numbers above: turn what looks like a defect (5s wait) into a receipt (you're loading a real Python interpreter, that's what real takes).
- Why: A boot delay framed as "Loading…" reads broken. Same delay framed as "warming up python in your browser" reads as substance.

### 7. Open-source signals beyond the github link
- Currently the home page does not show this is open source. The about page mentions it ("open source"). Add a `MIT · open source` line into the home sub-hero (now proposed above).
- Add `view source ↗` next to every code block in lessons (out of v1 scope, flagging for v2). Each lesson's source on github = the ultimate receipt.

### Hard NO list

- **Stock testimonials.** "Promptdojo changed my career — Sarah, PM at Acme." Hard NO. We do not have these and inventing them is brand-suicide for a punk-voiced school.
- **"Join 10,000 builders."** We do not have 10,000 builders. We may never have 10,000. Numbers we don't have are worse than no numbers.
- **Fake badges.** "As seen on Hacker News." "Featured by Vercel." HN linkage is welcome organically; fabricated logos are not.
- **Certificate gates.** Already explicit in `audit/CEO-vision.md:171`. Restate: no certificates, no completion badges, no LinkedIn-shareable credentials. The certificate is the working CLI agent in chapter 25. That's it.
- **Streak nag / streak shame.** Onboarding `:367-369` already disowns this ("missing a day costs an ember, not the streak"). Don't add streak-restoration prompts, push notifications, "your streak is at risk" nudges, or any other Duolingo-class manipulation.
- **Email-list growth.** The login modal at `LoginToSave.tsx:194-198` is for sync, not capture. Don't drift into "subscribe for updates." Follow on X is the channel.
- **"As an AI" / "we believe" / "we think."** VOICE.md:21. Restate.
- **Engagement-time / "you've spent N minutes" overlays.** This is Codecademy-Pro language. Hard NO.
- **Leaderboards.** Already explicit on the home page hero descriptor ("no certificate, no leaderboards, no paywall" — Phase 1 §Marketing throat-clearing). Restate as permanent.
- **Pop-up modals on first visit.** No "welcome to promptdojo!" interstitials. The page IS the welcome.

---

## Top 10 voice moves to ship

Ranked by leverage. Each is a single change with a load-bearing effect.

| # | Change | File:line | Expected effect |
|---|---|---|---|
| 1 | Add `last commit · YYYY-MM-DD` to home + about footer (server-rendered from git). | `app/page.tsx:234-242` + `app/about/page.tsx:378-381` | The single highest-leverage credibility marker on a solo project. Punk goes from "weekend repo" to "actively shipped" with one number. |
| 2 | Add a five-receipt mono stat strip under the about hero: `25 chapters · 624 steps · 8–15h · MIT · last commit ${date}`. | `app/about/page.tsx` after `:135` | Codecademy designers scan for substance markers in the hero zone. Five concrete receipts in one row beats any testimonial. |
| 3 | Replace `production-ai track included` with a number-led phrasing on the home chapters eyebrow. | `app/page.tsx:155` | Drops the only line on the homepage that reads as Coursera-tier-upsell. Replaces airy with concrete. |
| 4 | Add one founder-credential sentence between "i'm josh." and the wrote-this paragraph. | `app/about/page.tsx:277-282` | Solo founder = founder is the brand. One specific role + tool + frequency converts "hobbyist" → "practitioner." |
| 5 | Lowercase StepFooter labels (`Lesson XP` / `Hint` / `Skip` / `Continue`) + lowercase `primaryLabel` default. | `components/v2/StepFooter.tsx:33,88,122,132,147` | Holds the lowercase line *inside* the product, not just on marketing pages. Returning users currently lose the spell mid-lesson. |
| 6 | Rename section eyebrow `what's inside` → `the curriculum`. Rename `how it works` → `the loop`. | `app/about/page.tsx:181,211` | Replaces SaaS-generic eyebrows with school + dev vocabulary. Reclaims `curriculum` from Coursera; `the loop` matches the body content. |
| 7 | Tighten the WEDGE H2 from a self-comparison to a directive. | `app/about/page.tsx:158-163` | "every course teaches you what python is. you need to know what it isn't." — same shape, less "us vs them," more "what you actually need." |
| 8 | Add an FAQ entry: `how often is it updated?` with a one-line answer. | `app/about/page.tsx` after `:115` | The missing "this isn't abandoned" signal. Solo founders have to *say it.* |
| 9 | Demote LoginToSave pill on the global header to ghost (no border, ember text only) when logged-out. Keep FollowOnX as the lone bracket-pill. | `components/LoginToSave.tsx:160` | One bracket-pill on the header reads as "primary CTA"; two read as "feature row." Validation metric is followers; the brackets budget should bias to the pill that grows the metric. |
| 10 | Rename last-lesson Continue from `finish` to `next chapter →` (and final-final to `that's all 624 →`). | `components/v2/LessonStepClient.tsx:189` | "Finish" is dead-end vocabulary that contradicts the CEO-vision Finish→next-lesson commitment. Names the next pull instead of acknowledging an end. |

---

## What this audit does not touch

- Visual hierarchy, type scale, color use, motion — UI Designer's territory.
- IA, route shape, navigation patterns, chapter-graph routing — UX Architect's territory.
- Phase 1 voice violations — already cataloged in `audit/03-brand-audit.md`. This audit assumes Phase 1's lowercase + Inter-drop + color-cleanup picks have shipped (they have, per CEO-vision sequencing).
- Lesson markdown content (624 steps' worth of body copy) — out of scope for a 30-min pass; trust signals 4 + 5 above flag this for a separate content-edit sweep.

---

**Audit complete.** The punk voice is the brand and stays. The fix is **adding receipts around it.** A Codecademy designer who lands on `promptdojo.pages.dev` after these ten moves ship sees: lowercase confidence + last-commit-3-days-ago + 47-stars + one-line-founder-credential + a curriculum eyebrow + chapter outcomes. That's a real product with a sharper voice — not a hobbyist's prototype.
