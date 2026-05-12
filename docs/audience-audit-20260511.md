# @TFisPython Follower Composition Audit

**Date**: 2026-05-11
**Auditor**: audience-auditor (promptdojo-launch agent team)
**Premortem failure mode tested**: F5 — "existing followers are senior devs, not the wedge audience"
**Decision rule**: ≥15% wedge-match → green-light 3-week sprint. <15% → pivot to beta-first.

---

## TL;DR — VERDICT: GREEN-LIGHT, with two caveats

- **Wedge-match: 26 / 74 = 35.1%.** Well above the 15% threshold.
- **Engineer/dev: 3 / 74 = 4.1%.** The "they're probably senior devs" premortem fear is **not confirmed**. Dev share is tiny.
- **Other (spam, empty, music, off-topic, self): 45 / 74 = 60.8%.** Big chunk of the base is junk follows, not a poisoned wedge.

**Caveat 1**: Total followers = **74**, not the ~500 the plan assumed. V1→V2 gate of 1,000 by 2026-08-11 = **13.5x growth in 90 days**. Aggressive. Premortem F1 (sprint slips) now leans more likely. Josh should know that the audience-first thesis is starting from a much smaller base than estimated.

**Caveat 2**: The wedge subset is mostly **UGC creators, agency-marketers, indie founders, and growth-hackers** — not enterprise PMs or B2B SaaS product managers. They're still wedge (they ship using AI daily, can't read AI output), but the year-2 corporate L&D pitch will need a different audience cohort to anchor case studies. Plan §9's Maven AI PM alumni outreach still required.

---

## Method

1. Authenticated as @TFisPython via X MCP (`mcp__x__getUsersMe`). Confirmed account stats.
2. Tried `mcp__x__searchPostsRecent` to sample engaged audience by mention — **X API returned HTTP 402 Payment Required (credits depleted)**. Fallback required.
3. Used browser-harness to drive Josh's authenticated Chrome session to `x.com/TFisPython/followers`. Scrolled the full virtualized list and captured every visible cell's text.
4. Got 77 cells. 3 were "Follow suggestions" with no "Follows you" marker (@chetaslua, @gauravsbuilding, @BarackObama) — filtered out. Remaining **74 = total reported follower count**.
5. Classified each bio against the brief's rule:
   - **WEDGE-MATCH**: "PM," "product," "marketing," "marketer," "ops," "growth," "designer," "founder," "biz dev," "operator," or other non-engineer professional title.
   - **NON-MATCH**: "SWE," "engineer," "developer," "dev," "CS student," "10x," or technical/dev bio.
   - **OTHER**: spam, empty, music, religion, finance/trading, off-topic, self (Josh's own accounts).

---

## Account snapshot (@TFisPython)

```
followers_count:        74
following_count:        384
tweet_count:            364
verified_followers:     23
display name:           "building with no code"
bio:                    "founder @crowdtestio"
account id:             1097832515845402624
```

The "@TFisPython" handle reads python-focused but the **display name says "building with no code" and the bio points at CrowdTest**, not PromptDojo. This is itself a finding: Josh's existing profile is positioned for a different wedge than the one PromptDojo is launching into. The handle is python, the surface is no-code, the bio is CrowdTest. Pick a lane before Day 0.

---

## Counts

| Bucket | Count | % of 74 |
|---|---|---|
| **WEDGE-MATCH** (marketer/founder/ops/designer/operator) | 26 | 35.1% |
| **NON-MATCH** (engineer/developer/CS) | 3 | 4.1% |
| **OTHER** (spam/empty/music/off-topic/self) | 45 | 60.8% |

**Decision**: 35.1% > 15% threshold → **green-light the 3-week sprint as-is**.

---

## Wedge-match breakdown (26 followers)

By sub-category, to make the "what kind of wedge" question explicit:

| Sub-category | Count | Examples (anonymized roles) |
|---|---|---|
| **UGC creators / paid-ads operators** | 6 | UGC Creator + Influencer, UGC Creator & Paid Ads Manager, UGC creator AU, lead-gen / cold email |
| **Agency / marketing consultants** | 7 | Go High Level specialist, performance marketing platform, SEO/AI consultant, Reddit marketing, Sales & Marketing Genius (Meta Ads), audience growth for coaches/consultants |
| **Indie founders / builders / operators** | 9 | Founder of an AI tool, founder of crypto-fintech, building social commerce tooling, "currently building 3 AI products," ex-YC/NASA founder, "Ambassador for @GocharlieAI," founder of marketing group |
| **Designers** | 3 | Product designer @ studio, 2D/3D Artist/Animator, ex-Fjord creative |
| **Sales operators** | 1 | $71M revenue ecom sales-ops |

**Reading the breakdown**: the wedge is heaviest in *agency-marketers, UGC creators, and indie founders*. Light on enterprise PMs. Zero corporate marketers from named brands. The "PMs at companies who paste Cursor output" persona that the plan leads with is **not yet in the follower base** — but the broader "non-engineer who ships with AI daily" persona is well-represented.

This matters for the Day 0 thread. The thread copy ("ai writes 70% of the code my PM team ships") is calibrated for an audience that isn't here yet. The audience that IS here would react more to **"ai writes this. your client paid for it. it's broken."** — agency / freelancer / UGC-operator framing.

---

## Non-match breakdown (3 followers)

Only 3 followers are unambiguously engineers/devs:

1. **@TomLevels_** — "App Developer • Building with AI in public Sharing tools, prompts & real workflows" (Pieter Levels' brother per public knowledge; indie dev)
2. **@0xtreysync** — "fullstack dev, part-time artist | Java | C# | Python | React | Nvim"
3. **@_peterferguson** — "Eng @context | author react-native-passkeys | @variantfund founder fellow | Alum @Cambridge_Uni"

**Premortem F5 hypothesis falsified.** The fear was "followers are senior devs." Reality: 4.1% are devs, and even those are indie/community devs, not senior FAANG types.

Two borderline cases not counted as engineers (could push dev share to ~8% if you stretch):
- @Cookiesarefunnn — "Prev @nasa @ycombinator @DeptofWar, 1 exit. Building a way to download your brain" (founder but technical background)
- @mirko_monti6 — "Ai Agents Builder - Techno optimist" (builder, not explicit dev)

Even with the generous count, dev share stays under 10%. Wedge premise is intact.

---

## Other (45 followers) — what's in here

The 60.8% "Other" bucket isn't all bad-news junk, but most of it won't drive the audience-first thesis:

- **~15 spam/bot/empty bios** — FedEx phishing impersonator, account-recovery scam, random handles like @Eekioofar7388, @Mwooieno171018, @Irlomui7557438 (numbered noise handles, no bio). Won't engage. Won't share. Won't show up in `last_successful_post` quote-counts.
- **~6 music/beats accounts** — @HometownRec0rds, @MusikGeneratorz, @PCBeatTeam, @GotInstrumental, @Sandile97127031, @MICKVLO. Off-topic follows from older Josh activity (likely TFisPython-as-music-curator era or hashtag drift).
- **~5 self / org-adjacent** — @CrowdTestio (Josh's own startup), @JoshErnst_ (Josh's personal alt), @ajbirdbackup (backup acct of someone else).
- **~10 personality/lifestyle/empty** — "Goat", "Life is a beautiful journey", "I want a good friend", religious one-liners, etc. Real humans, not wedge buyers.
- **~9 finance/crypto/web3/trading** — "web3 Grinder & Forex", "Geopolitics-Global Affairs- Equity Investments", "Crypto & Tech I trading group". Tangential. Some could convert but they're not the LinkedIn-PM-on-phone audience.

**Implication**: the real *active* base is probably ~50 followers, not 74. The 1K-in-90-days gate becomes 20x growth from active base, not 13.5x from raw base.

---

## Sample bios (anonymized, raw)

A representative slice across all three buckets so future audits can compare apples to apples. Handle-stripped except where the user is a public brand.

### Wedge-match samples
- "Conversion-focused marketer | Ads.. Funnels and Automations | Help coaches & B2B brands scale faster & cut manual work 60%"
- "product designer @ [studio]"
- "Building a business alone almost broke me. Now I'm building an AI that helps founders move forward when they feel stuck or uncertain. Founder of [AI tool]"
- "Building AI agents in public | Automation, workflows, and real experiments | Sharing what works (and what breaks)"
- "We help coaches, consultants and agency owners create a money printing personal brand using our proven framework within 60 days"
- "i scale brands | kickboxer and muslim | scaled 700k+ as a Co-founder, over 1,500+ clients i worked with"
- "I helped 100+ brands generate more conversion results with direct response & impactful content"
- "Are you sending Cold Emails ? I can help you source High Quality Leads according to your target audience"
- "entrepreneur & enthusiast of all things elite viral short form content, audience growth & monetisation for coaches and consultants"
- "Founder/CEO of [marketing group]"

### Non-match samples
- "App Developer • Building with AI in public Sharing tools, prompts & real workflows"
- "fullstack dev, part-time artist | Java | C# | Python | React | Nvim"
- "Eng @[startup] | author react-native-passkeys | @[fund] founder fellow"

### Other samples
- "Quick Rinse 40°c No Crease" (empty)
- "@FedEx Delivery" (impersonation/spam)
- "Hello I'm here to support users who got their account disabled, hacked, restricted" (scam)
- "Only football can save the World, just trust the process"
- "Got Instrumentals is a platform to buy, sell and listen to instrumentals"
- "web3 Grinder & Forex"
- empty/blank (10+)

---

## Recommendation

**Green-light the 3-week sprint as written in `docs/plan/LAUNCH-V2.md`.** The wedge premise survives. Devs are not the dominant cohort.

But layer in three corrections before Week 1 starts:

1. **Lock the starting follower count at 74, not ~500.** Plan §10 target of 5K by month 12 needs the math redone. V1→V2 gate of 1K by 2026-08-11 = 13.5x growth in 90 days, not 2x. Plan §18 D3 "Day 3 gate at <200 new followers → pivot" still works, but Josh should not be surprised when raw growth feels slow at first because the base is tiny.

2. **Recalibrate the Day 0 thread for the wedge subset that ACTUALLY follows.** The plan's headline LinkedIn copy ("ai writes 70% of the code my PM team ships") targets enterprise PMs who aren't in the base yet. The base IS heavy on agency-marketers, UGC operators, and indie founders. Add a second thread variant for Day 0 reposts targeted at this cohort:
   - Hook: "your agency just shipped this for a client. ai wrote it. it's broken. you'd never have seen it."
   - Or: "you paid an agency $5k. they pasted what claude wrote. you're now the QA team. read this."
   - Plan §8's reply-guy strategy (5 pre-arranged quote-tweets) should pull from this cohort, not from generic dev Twitter.

3. **The corporate L&D year-2 pitch still needs an enterprise-PM audience.** That cohort isn't in the base today. Plan §9 Maven AI PM alumni outreach (5 cold DMs/week) is the most credible path to seeding it. Start that in Week 2, not Month 2.

**Do not pivot to beta-first.** The audit clears that bar comfortably.

---

## Data files

- Raw scrape: `/tmp/audience-audit/followers-full.json` (77 cells, 74 real followers after filtering suggestion cards)
- Display-name-only scrape: `/tmp/audience-audit/followers.json`

## Blockers / caveats for next auditor

- **X API credits depleted** — `mcp__x__searchPostsRecent` returned HTTP 402. Engagement-signal cross-check (who actually likes/replies to @TFisPython's posts) couldn't run. Bio audit alone is the source of truth in this report.
- **Bios scraped from logged-in session** — some private-to-network bios may be richer than the public version, but I read what X showed to the authenticated session, which is the most generous view available.
- **Display names sometimes carry the bio** — when bios are empty, the display name (e.g. "Stan Van Eyk | Social Commerce") was used as the classification signal. Documented in the per-row analysis.
- **Three "suggestion" cards filtered** — @chetaslua, @gauravsbuilding, @BarackObama appeared in the cell stream but had no "Follows you" marker (X injects these into the followers list as recommendations). Confirmed by cross-referencing the 74 follower-count from `getUsersMe`.
