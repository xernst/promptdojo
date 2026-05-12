# PromptDojo Day 3 Pivot Runbook

**Status**: Pre-staged before Day 0. Sits cold until the gate trips.
**Owner**: Josh Ernst
**Last updated**: 2026-05-11
**Path**: green-light (per `docs/audience-audit-20260511.md`). This runbook fires conditionally on Day 3 gate trip, NOT immediately.
**Premortem mode prevented**: F4 (pivot has nowhere to land).
**Time-to-first-DM target**: <24h from gate trip to first beta DM sent.

---

## 0. Calibration notes (read first)

Two facts changed the shape of this runbook after the audit:

1. **Starting follower base is 74, not ~500.** The plan assumed Josh was working from a larger base. He isn't. Active base is ~50 after filtering bots, music accounts, and spam. The V1→V2 gate of 1,000 by 2026-08-11 is 13.5x growth from raw and ~20x from active. The Day 3 sub-gate of "200 new followers in 72h" is genuinely aggressive against that starting point. **Build this runbook assuming the gate WILL fire.** If it doesn't, you're celebrating, not regretting prep.

2. **The wedge already in @TFisPython's network is agency-marketers, UGC creators, indie founders, and growth-hackers.** Not enterprise PMs. Enterprise PMs are the year-2 audience for the corporate L&D pitch but they're not in the base today. So:
   - The first 30-40 beta DMs go to the warm wedge already following Josh (agency, UGC, indie).
   - The last 10-20 DMs go cold to Maven AI PM alumni — a different cohort, harder yield, but they anchor the year-2 enterprise pitch.
   - Day 0 copy and pivot copy both lean agency/UGC/indie, not "PM team at SaaS company."

**Identity-surface contingency**: as of 2026-05-11, the handle is @TFisPython, display name reads "building with no code," bio points at @crowdtestio. Josh hasn't picked a lane. Every piece of copy in this runbook references the **link** (`promptdojo.dev`), not the handle or display name, so it works regardless of which way the surface goes. If Josh renames the account before this fires, search/replace any handle references but leave link references intact.

---

## 1. Trigger conditions

This runbook fires when one of the following is true at 9am ET on Day 3 (Wednesday):

- **Primary trigger**: <200 net new followers in 72h since Day 0 thread shipped.
- **Secondary trigger**: <500 unique site visits in 72h per `/api/health` analytics or Cloudflare dashboard.
- **Secondary trigger**: <30 net new Beehiiv subscribers in 72h.

Any one trips the gate. Don't average them. The single-metric "200 followers" is the headline because it's the V1→V2 gate variable. The two secondaries catch the case where followers grew but nobody actually engaged with the product (the F5 + F3 combined failure mode — wrong audience, dead viral surface).

**Who decides**: Josh. Alone. By Wednesday noon ET at the latest. No "let me see how Thursday plays out" — that's the F8 dopamine sink (more shipping, less deciding). If the number is at 195 vs 200, you still trip. The decision is binary because the underlying problem is binary: either the wedge audience is here, or it isn't.

**What "trip" means**: do steps 2 through 8 in order, starting today.

---

## 2. Pre-flight checklist (first 4 hours after trip)

Before any DM goes out, do these. They're cheap and they protect the existing audience signal you do have.

- [ ] **Pause the auto-tweet bot.** GitHub Actions → workflow `daily-bug-of-the-week.yml` → disable. Leave the queue intact; you'll un-pause it in M2. Confirms in the next cron window (9am ET tomorrow) by checking `last_successful_post` on the morning brief.
- [ ] **Pin a holding post on @TFisPython** (or whatever handle is live): "shifting promptdojo into closed beta this month. if you signed up, mail incoming. if you want in, reply." Don't apologize. Don't explain. The audience that matters will reply or click.
- [ ] **Snapshot the launch metrics for the postmortem.** Screenshot Twitter analytics 72h panel, Cloudflare 7-day visits, Beehiiv subscriber delta, GitHub stars delta. Save to `~/Obsidian/v01/20-Projects/promptdojo/launch-postmortem-{date}/`. You'll want these in 30 days when you re-launch and want to know if it worked better.
- [ ] **Cancel the Week 4-6 podcast pitches** scheduled per plan §19.7. Reschedule them to weeks 8-10. You don't pitch from a paused launch.
- [ ] **Send the "we paused" email to existing Beehiiv signups.** Template in §5 below. Send this BEFORE any DMs go out — your existing list deserves the news first.

That's the first 4 hours. None of it is target-list work. It's stop-the-bleed work so the next 30 days run clean.

---

## 3. The 50-target beta DM list

Goal: 50 names by EOD Day 4. Each row has handle/profile URL, source bucket, one-line context, hook variant to use, status.

Sheet: `~/Obsidian/v01/20-Projects/promptdojo/pivot-beta-targets.csv`. Columns: `name`, `handle`, `source`, `context`, `template_variant`, `dm_sent_date`, `replied`, `joined_beta`, `finished`, `testimonial`.

### Source A — @TFisPython warm wedge (~26 names)

The audit already identified all 26 wedge-match followers. Pull them straight from `/tmp/audience-audit/followers-full.json` (audience-auditor's raw scrape) or re-scan if that file's been cleaned up. Sub-buckets:

- **9 indie founders / builders** — highest yield, will reply fast, fit the curriculum directly
- **7 agency / marketing consultants** — second-highest yield, GHL/Meta-ads/SEO operators
- **6 UGC creators / paid-ads operators** — fast replies, less likely to finish (creator workflow is video not python)
- **3 designers** — slowest to convert but the testimonials read the best ("a designer learned to read AI's code in 4 hours")
- **1 sales operator** — long shot, high signal if they finish

Action: drop all 26 into the sheet today. Pre-fill `template_variant` per sub-bucket (see §4). These are the **first DMs** sent because they're warm. If 10 of these convert in 48 hours, you've validated the wedge and the rest of the list is gravy.

### Source B — Maven AI PM Bootcamp adjacency (~15 names)

Maven doesn't publish alumni rosters. Confirmed both pages (Marily Nika's bootcamp and Product Faculty's cert) have zero public student names. So the strategy is adjacency, not direct roster:

1. **3 named testimonials from Marily Nika's bootcamp page**: Ethan Cole (President PMLA), Kurt Lozier (CEO Somml Health), Tejas Iyer (AI/ML Platform PM, Yahoo). LinkedIn-findable. Cold but plausible — they put their face on the program publicly so they're open to AI PM peers reaching out.
2. **Instructor LinkedIn followers** — Marily Nika, Rohan Varma (ex-Cursor PM, OpenAI Codex), Henry Shi, Constantinos Neophytou (Staff @ Anthropic), Deb Liu (ex-Ancestry CEO). Each has thousands of PM-skewed followers. Scrape 10 from each instructor's public LinkedIn engagement on their own AI-PM posts (commenters, sharers). Higher signal than blind follower lists.
3. **LinkedIn keyword search**: queries like `"Maven AI PM"` OR `"AI Product Management" certification` OR `"Marily Nika cohort"` in profile education/about sections. Manual. Tedious. Yields 5-10 verifiable Maven alumni per hour. Use Sales Navigator if Josh has access; LinkedIn Recruiter Lite is the next tier.
4. **Email maven@aiproduct.com directly** for an alumni-introduction opportunity. Stretch — they may say no — but the ask is "I'm a recent grad building a free Python school targeting your alumni profile, would you connect me with 5 people who'd give 30 minutes of feedback?" Frame as a value-add to their alumni network. Low cost, possible 5-name unlock.

Target: 15 Maven-adjacent names in the sheet by EOD Day 5. These get DM'd second (Day 5-7), after the warm wedge has started replying, so Josh has signal on which template variant lands.

### Source C — LinkedIn Sales Navigator wedge query (~10 names)

If Sales Navigator subscription is live, run this saved search:

```
Title: "Product Manager" OR "Growth Marketer" OR "Marketing Operations" OR "Agency Owner" OR "Creative Director" OR "UGC Producer"
Industry: SaaS, Marketing & Advertising, E-Learning, Internet
Seniority: Manager, Director, VP (skip C-level for now)
Keywords: "AI" OR "Cursor" OR "Claude" OR "vibe coding" OR "no-code"
Geography: United States (Tier 1)
Company size: 11-200 (skip enterprise for now — they don't beta-test indie tools)
```

This pulls people who self-identify as AI-using non-engineers in their LinkedIn. Higher signal than blind follower scrapes. Cap at 10 names because cold-LinkedIn-DM yield is low and Josh's time is the constraint.

If Sales Navigator isn't live, skip Source C entirely and over-index on Source A. The warm wedge is the real lever, not the cold list.

---

## 4. The 3 DM templates

Voice rules: no em dashes, contractions, no consultant-speak, lowercase often, under 280 chars on X (LinkedIn can run a bit longer but stay short).

Each template references the link `promptdojo.dev`, never the handle. If the identity surface changes after this fires, swap the link for the new domain but the body stays.

**Important reframe**: per the audit, the warm wedge isn't enterprise PMs. It's agency-marketers, UGC creators, indie founders. So the original "PM team paste cursor output" framing is the wrong hook for the people most likely to reply. Variants below are rewritten for the cohort that's actually there.

### Template 1: "The Cursor problem" — for indie founders, agency operators, UGC creators

```
saw you build with ai (or pay people who do).

quick one: you ship cursor's output without reading it, right? me too. that's the bug.

i shipped a free python school for this exact thing. 26 chapters, runs in your browser, no signup.

30 min would mean a lot. promptdojo.dev
```

258 chars. Use this for the bulk of Source A (the 22 indie/agency/UGC names). Variant for designers: swap "you ship cursor's output without reading it" for "your designer-to-dev handoff ships with code nobody on the team reads."

### Template 2: "The story" — for the 3 Maven testimonials + LinkedIn Source C cold

```
graduated friday. spent the last year shipping a free python school for people who use ai daily but can't read what it wrote.

26 chapters. browser-based. mit license. it's at promptdojo.dev.

trying to get 10 honest 30-min walkthroughs. you fit. you in?
```

271 chars. Use this for cold contacts where Josh has no prior relationship but a credible "i made this" hook. The "graduated friday" is the truth-anchor. Drop it if the runbook fires later than ~M1.

### Template 3: "The trade" — for Source A power-users who already comment on AI content

```
i'm beta-testing a free python school for non-engineer ai users. agency operators, founders, UGC folks who ship with cursor.

10 builders, 30 min each, in exchange for a tweet about what worked or didn't.

promptdojo.dev. you in?
```

237 chars. Use this for the 5-8 most engaged followers in the warm wedge — the ones who quote-tweet or comment on AI threads. They'll do the trade because the trade is fair.

### Voice-check before each DM goes out

Run every customized DM through this 30-second gate:

- No em dashes (single biggest tell)
- Contractions present (no "I am" — always "i'm")
- No "delve" / "leverage" / "synergize" / "robust" / "navigate"
- Asks once, asks specifically (30 min, not "some time")
- One link, one ask, no PS
- Lowercase first word (signature Josh)

If the DM fails any of these, rewrite. Don't ship a DM that doesn't sound like Josh — the wedge audience reads "AI-sounding" instantly and you've used the slot.

---

## 5. The "we paused" email

For existing Beehiiv subscribers. Assumes <500 signups (realistically <100 given a 74-follower starting base). Send this BEFORE any DMs go out — the existing list deserves the news first.

**Subject**: `i paused promptdojo. here's why.`

**Preview text**: `not a permanent thing. a thirty-day reset.`

**Body**:

```
hey,

if you signed up for promptdojo in the last few weeks, thanks. i owe you straight talk.

i launched promptdojo this month and the launch didn't land the way i wanted. the audience i was writing for (people who ship with cursor and claude but can't read what they wrote) didn't show up at the volume i needed to keep the daily content engine running. so i paused.

here's the plan. i'm spending the next 30 days doing 30-minute walkthroughs with 30 builders. when 10 of them ship me a testimonial about what they actually learned, i re-launch. that's the bar. that's the gate. if it doesn't clear, i'll tell you and i'll send you the curriculum as a final pdf so you have it forever.

if you want to be one of the 30, hit reply. if you just want to wait and see, that's also fine. either way: the site stays up, the chapters stay free, the github repo stays open. promptdojo.dev/learn works today.

more in a month.

josh
```

228 words, 3 paragraphs (counting greeting/signoff). Hits the F4 spec: honest, not apologetic, sets M2 expectation, gives the existing list a path to re-engage.

**Don't add**: a P.S., a referral ask, a "btw also follow me." This email is single-purpose. Anything else dilutes it.

**Send timing**: Wednesday afternoon ET, ~3-4 hours after the holding post on Twitter goes up. So Twitter audience sees the holding post first; email subscribers get the deeper version a few hours later. Don't blast email before Twitter — the inbox carries more weight and should follow, not lead.

---

## 6. Success definition for the 30-day beta

The bar for re-launching:

- **30 builders finish the curriculum** (defined as: completed through ch20 minimum, ideally ch25 capstone). Tracked via PROGRESS_KV.
- **10 of the 30 ship a written testimonial** (1-3 sentences, in their voice, screenshot-able). Doesn't have to be public — private testimonial is fine for the re-launch deck. Public is a bonus.

If both clear: **green-light M2 re-launch**. Use the re-launch playbook in §7.

If only one clears: **extend beta 30 days**. Run another round of 30-50 DMs. Don't re-launch with weak proof.

If neither clears within 60 days total: **kill the project as a public product**. The curriculum stays up at `promptdojo.dev/learn` indefinitely (MIT, hosting is free at <50K uniques/month), but Josh stops the daily content engine, doesn't ship the iOS app, and rolls the audience-first thesis into CrowdTest or whatever's next. **Kill is not failure** — it's protecting Josh's runway and reputation. F8 says: don't let engineering inertia keep a dead project on life support.

**Why these numbers**:
- 30 finishers ≈ 60% completion rate on a 50-person beta cohort. Realistic against the wedge. Lower than the original audience-first thesis target but tracked properly.
- 10 testimonials = enough to lead a re-launch thread with 5 quotes + 5 anonymous-but-real screenshots. Marketing-sufficient.
- 60-day total horizon ends 2026-07-11. Still leaves 30 days to re-launch before the V1→V2 gate window closes on 2026-08-11. Tight but doable.

---

## 7. M2 re-launch playbook (sketch)

This is a sketch. Detail it in week 4 of the beta when you actually have testimonials to work with. Right now the runbook just locks the *shape*.

### What changes between Day 0 launch and M2 re-launch

| Element | Day 0 (paused) | M2 re-launch |
|---|---|---|
| Hook | "ai writes 70% of the code my PM team ships. nobody can read it." | A specific testimonial quote. "[Agency owner], ai wrote this for their client. they shipped it. it had a silent off-by-one. now they can read it." |
| Day 0 thread | 10-12 posts walking through one bug | 10-12 posts, each post is a different beta builder's "before/after" — what they couldn't see, what they catch now |
| Reply-guys | Hopefully arranged Day -1, agnostic to wedge | The 5 testimonial-providers themselves quote-tweet the thread. They're the social proof AND the amplification. |
| LinkedIn post | "i graduated. shipped a school." | "i paused a launch. did 30 walkthroughs. here's what i learned about ai code literacy." Honest-pivot framing reads as credible. |
| Bot un-pause | n/a | un-pause AFTER the testimonial thread has 24 hours to compound, not before. Bot queue ships the next morning. |

### The 5 testimonials that lead

Pick 5 of the 10 to lead the re-launch, with this ranking logic:

1. **Most specific job title** — "Director of Marketing at [named company]" beats "Marketing consultant" beats "agency owner." Specificity = social proof.
2. **Most concrete "before / after"** — "i used to paste claude's output. now i open the diff and read it line by line. caught a SQL injection on tuesday." > "great course, learned a lot."
3. **Public-okay-with-name** — anonymous works for the deck but named is 5x stronger on a launch thread. Filter to people who consented to public use.
4. **Wedge-coverage diversity** — one agency operator, one UGC creator, one indie founder, one designer, one sales-ops. The thread reads as "this audience" not "this one weird friend."
5. **Comes with a screenshot or repo link** — the testimonial they paste in DMs is fine; the testimonial they post alongside a screenshot of code-they-now-understand is 10x stronger.

The other 5 testimonials are the bench — they go in the email re-engagement campaign, the LinkedIn long-form, the about page, and the founding-member page.

### Day 0 thread template (M2 version)

```
Post 1: A single screenshot of broken AI code. No context.
Post 2: "[Name], [role], beta-tested promptdojo for 30 min. they caught this bug their client paid them to ship."
Post 3-9: Walk through what they saw, what they didn't, what changed.
Post 10: "i paused the original launch in may. did 30 of these walkthroughs. here's what worked."
Post 11: "promptdojo.dev. 26 chapters. browser-based. free. mit license."
Post 12: "5 of them tweeted about it. tagged below. ask them anything."
```

The "tagged below" post is the algo-prime. The 5 testimonial-providers reply with their own one-liner the moment post 12 lands. Free amplification, real social proof.

### When to un-pause the bot

Un-pause the GitHub Actions auto-tweet bot **the morning after the M2 thread ships**, not the same day. Reason: you want 24h of pure launch-thread compounding before the bot's daily bug post enters the feed and dilutes attention. Day +1 the bot resumes its 9am ET cadence and runs forever after that.

**Pre-un-pause check**: confirm Telegram Errors topic is receiving test pings (per plumbing-engineer's Task #5 work — F6 fix). If alerting isn't wired, don't un-pause. A silent bot failure during re-launch is the F6 mode in disguise.

### Re-launch HN / Reddit timing

Day +2 of M2 re-launch (not Day 0). Reasoning: HN and Reddit are more credible AFTER you've shown traction on X/LinkedIn. The re-launch story ("i paused, did walkthroughs, here's what i learned") is a fundamentally better Show HN narrative than the original ("i built a thing"). Lead with the pivot, not the product.

---

## 8. Daily ops during the 30-day beta

What Josh does every weekday for the next 30 days. This is the operating cadence — written down so it doesn't drift.

**Each morning (30 min)**:
- 5 DMs sent (or replied to). Track in the sheet.
- 1 walkthrough scheduled if reply rate allows.
- Check Telegram Errors for bot-paused confirmation (should be silent).

**Each walkthrough (30 min + 10 min writeup)**:
- Screen-share, watch them work, take notes in the sheet.
- Ask 3 questions at the end: what surprised you, what did you skip, would you tell one friend.
- If they liked it, ask for a 2-sentence testimonial within 48 hours. If they liked it a lot, ask if you can quote them publicly.

**Each Friday (60 min)**:
- Tally the week: DMs sent, replies, walkthroughs done, finishers, testimonials.
- Write one paragraph in `~/Obsidian/v01/20-Projects/promptdojo/pivot-week-N.md` — what changed in your understanding of the wedge this week.
- No public content this entire month. The Saturday 8am-12pm distribution block goes to walkthroughs and beta-list management instead. Distribution comes back online M2.

**Each Sunday (15 min)**:
- Update the "we paused" email subscribers with a one-paragraph progress note. Not a newsletter — just "here's where the beta is. n testimonials so far. m days left." Builds anticipation for re-launch.

**Hard rule**: no engineering work on promptdojo during the 30-day beta beyond bug fixes. No new chapters, no UI polish, no iOS app prototypes. The F8 mode (engineering polish displaces distribution) is exactly the trap this pivot exists to avoid. If something breaks on the live site and a beta tester can't progress, fix it same-day. Otherwise, pen down.

---

## 9. Identity-surface contingencies

The audit flagged that @TFisPython's handle, display name, and bio are pointing at three different products. This runbook works in three scenarios:

**Scenario A: Josh keeps @TFisPython as the PromptDojo handle**.
- Update display name to "promptdojo" or "josh / promptdojo" before sending DMs.
- Update bio to lead with promptdojo.dev, not crowdtestio.
- The pinned holding post stays.

**Scenario B: Josh moves PromptDojo to a new handle (@promptdojo, @joshernst, etc.)**.
- Set up the new handle today. Auto-forward old handle's DMs to new for 30 days.
- Pinned post on @TFisPython: "promptdojo lives at @[new handle] now."
- Update every DM template's link to whatever domain the new handle points to. Body text stays.

**Scenario C: Josh decides to land PromptDojo as a feature of CrowdTest**.
- The pivot stops being a pivot — it becomes a kill. Run §6's "kill the project as a public product" path. Curriculum stays free, no daily content engine, no re-launch.
- Send the existing Beehiiv list the kill notice version of the email (rewrite §5 for that case).

Whatever scenario lands, **every DM in this runbook references `promptdojo.dev` (the link), not the handle**. So the runbook itself doesn't break on the decision.

---

## 10. What success and failure look like 30 days from now

This section exists so future-Josh has the win/loss conditions written down before the emotional rollercoaster of the beta starts.

**Success state (re-launch greenlit)**:
- 30+ finishers, 10+ testimonials, 5+ public.
- Email list grew 2-5x during the silent beta (the pause email triggers re-engagement).
- Josh has 3-5 specific anecdotes he can tell about agency operators / UGC creators / founders catching real bugs.
- Twitter follower count probably stayed flat or slightly grew (the holding post + the pivot interest).
- M2 re-launch thread ships within 5 days of the success-state being reached.

**Failure state (kill)**:
- <15 finishers OR <5 testimonials at day 60.
- Reply rate on DMs <10% (the wedge isn't who Josh thought).
- Walkthroughs reveal that learners need ch01-12 to feel readable AND the curriculum isn't there yet for non-coders.
- Email list churn rate >20% after the pause email (the audience never wanted this).

**Mid state (extend beta to 60 days total)**:
- 15-29 finishers OR 5-9 testimonials at day 30.
- Reply rate 10-20%.
- Specific blockers identified but fixable in a 2-week build sprint.
- Run a second 30-day round with a tweaked DM angle.

The hardest call is mid-state. Default: extend ONCE, kill if the second 30 days doesn't clear the original bar. Don't run three rounds. Three rounds means the project is on life support and Josh is paying with weekends.

---

## 11. References + adjacent docs

- `docs/plan/LAUNCH-V2.md` §19.4-§19.11 — pre-launch sprint and Day 3 gate spec
- `docs/audience-audit-20260511.md` — the F5 verdict that calibrated this runbook
- `~/Obsidian/v01/20-Projects/promptdojo/premortem-report-20260511-1709.html` — F4 (this runbook's mode), F1, F5, F8
- `~/Obsidian/v01/20-Projects/promptdojo/pivot-beta-targets.csv` — to be created when the runbook fires
- `~/Obsidian/v01/20-Projects/promptdojo/pivot-week-1.md` through `pivot-week-4.md` — to be created weekly during the beta

---

## 12. Pre-Day-0 checklist (this runbook is "ready")

Before Day 0 ships, this runbook is considered "ready to fire" when:

- [ ] Committed to `docs/pivot-runbook.md` in the promptdojo repo (not just in Obsidian).
- [ ] 3 DM templates reviewed by Josh and signed off in his actual voice. If a template doesn't sound like him, rewrite before launch.
- [ ] The "we paused" email tested against Beehiiv's preview render. Subject line shows. Preview text shows. Links work.
- [ ] Josh has the `~/Obsidian/v01/20-Projects/promptdojo/pivot-beta-targets.csv` template scaffolded with column headers (10 minutes — do it now).
- [ ] Josh knows where Beehiiv's "send to all subscribers" button is and has tested with a 1-person internal list once.
- [ ] Decision: which handle does the holding post pin to? Update §9 with the answer before Day 0.

If all six clear, the runbook is fire-ready. Total time to first DM on the day this fires: target <24h. Realistic <8h with the pre-flight done.

---

**End of runbook.**

Read once. Don't re-read until the gate trips. Keep this cold so you'll trust it warm.
