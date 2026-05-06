# UX Research — User Journey Audit

**Auditor:** UX Specialist #1 (research / behavioral)
**Site:** https://promptdojo.pages.dev
**Date:** 2026-05-05
**Personas:** Cursor Charlie · PM Priya · Indie Ian

---

## Methodology

Analyzed the live site (`/`, `/onboarding`, `/learn/v2/variables`, `/learn/v2/variables/naming-things/0`) plus source files for behavioral context: `app/page.tsx`, `app/onboarding/page.tsx`, `components/v2/HomeClient.tsx`, `LessonShell.tsx`, `LessonStepClient.tsx`, `StepRouter.tsx`, `PersistentIDE.tsx`, `ChapterNav.tsx`, and four step views (Read/MC/Fill/Fix/Write). Did **not** browser-test interactively — Evidence Collector owns that. Did **not** evaluate copy quality at the line level (Brand Guardian / Growth) or component-level visual treatment (UI Designer). The lens here is: *what is the user trying to do, what is the site asking them to do, and where does the gap make them quit*. Working assumption: the audience is senior-dev-adjacent and impatient. They will not "give it a chance"; they will close the tab.

---

## Persona walkthroughs

### Cursor Charlie — vibe-coder, 6 months in Cursor, no `for` loops without AI

| Step | What he wants | What the site asks | Friction | Quit risk |
|---|---|---|---|---|
| 1. Land on `/` | "Is this for me, or another Codecademy?" | Read H1 "Python for AI-first builders," then **a 350-word triple-paragraph intro**, then THREE value cards, then a 25-card chapter grid. | **3/5** — Charlie reads "AI-first builders" and is half-in. Then his eye hits the 25-card chapter grid below and his brain reads "long course." | Medium — he scrolls and bounces if the grid feels like work. |
| 2. Find what to do | "Where do I start?" | Two competing CTAs: a big ember "Get started in under a minute" hero card AND a tiny "new here? start the 5-question onboarding →" link. Plus 25 chapter cards that are also clickable. | **3/5** — three doors to the same room. Confident vibe-coder ignores onboarding ("I already code"), clicks chapter 1. Skips the "place me" path because it doesn't exist on home. | Low here — he picked a door. |
| 3. Onboarding (skipped) | n/a | n/a | — | — |
| 4. Land on `/learn/v2/variables` chapter overview | "Just put me in a lesson." | A long overview page with five sections: hook, mental model, lesson preview, pitfalls, outcomes. Then a "Start chapter" link. | **4/5** — Charlie wanted to *do*, gets *read*. This is the boot.dev problem the site is trying to escape, just relocated to the chapter page. | **HIGH** — strong "this is just another tutorial" signal. |
| 5. First step (`/0`) | "Show me code; let me hit Run." | Read step. IDE on right is populated and runnable. Markdown body on left explains "labels stuck on values." | **2/5** — the IDE-on-the-right is the strongest "oh, that's clever" moment in the flow. The 25–35s "felt the loop" promise from UX §9 actually lands. | Low — if he gets here. |
| 6. In-lesson rhythm | "Don't make me think about navigation." | Persistent IDE survives across steps (good). Step indicator says `1/8`. Continue button in footer. Sidebar shows step types like "read," "mc," "fill" as labels. | **2/5** — small win. The "01 read", "02 mc" labels in the sidebar leak the implementation model — a step type isn't user-facing language. | Low. |
| 7. First MC ("Which is a list?") | "Validate I know this." | Click answer, hit Check. Get "Right." or "Not that one." Per-option `explain` shows on submit. | **2/5** — feedback works. "Right." is dry-cool, on-brand. | Low. |
| 8. First `fix` step | "Find the bug, ship the fix, feel smart." | Editor pre-loaded with broken code. "Submit fix" button. After N failures, "Show me the line →" appears. | **1/5** — this is the wedge actually expressed. Charlie's whole life is reading-then-fixing. | Very low — he'll do three of these. |
| 9. Lesson done → next | "Pull me forward." | "Continue →" advances to next step within lesson; on last step, button says "Finish" and routes to `/`. | **4/5** — **`Finish` going to `/` is a serious bug.** It dumps him on the marketing home with no "Lesson 1 done. Next lesson queued: ..." moment. The momentum dies on completion. | **HIGH** — the moment he should be most pulled-forward, he's flushed back to a landing page. |
| 10. Resume | "Get me back to the spot." | `HomeClient` shows a "welcome back · Ch 1 · ..." pill if `lastVisitedV2` is set. | **2/5** — works mechanically. But it's *one* CTA among 25 chapter cards on the same page. The pill should be the page when it exists. | Medium. |

### PM Priya — lets Claude write the prototype, wants enough Python to QA the model

| Step | What she wants | What the site asks | Friction | Quit risk |
|---|---|---|---|---|
| 1. Land on `/` | "Is this for non-engineers?" | H1: "Python for AI-first builders." Subhead: "direct AI agents, read what they wrote." Below subhead: smaller copy *"Built for the marketing managers, PMs, and ops folks who use Cursor daily..."* | **2/5** — Priya is told she's the audience in copy #3, after she's already decided. The "built for marketing managers, PMs..." should be at the TOP of the page or under the H1. | Low if she scrolls; medium if she doesn't. |
| 2. Onboarding click | "Tell me what I'll get." | "You're going to learn Python. With AI as your co-pilot, not your crutch." Single Start button. | **2/5** — the "co-pilot not crutch" line is sharp and lands on a PM ear. Good. | Low. |
| 3. Goal screen | "Tell us what you're building." | "What are you trying to build?" Four options. *"team-tools"* is well-targeted to her. | **1/5** — clean. | Very low. |
| 4. Level screen | "Place me." | Three options. "I've copied code from ChatGPT and edited it" matches her. | **1/5** — clean. | Very low. |
| 5. Personalization | "Customize so it doesn't feel generic." | Four optional fields: name, pet, team, city. With a small Skip link. | **3/5** — Priya pauses. "Why do you need my pet's name?" The framing copy explains it's used in code samples but the friction is cognitive: *do these fields actually change anything?* If she skips, she'll never see the personalization payoff. If she fills it, she's wasted 30s. | Low (she skips). |
| 6. Daily goal | "I'll do whatever." | 5/10/20/40 min cards. Default 10. | **1/5** — clean. The "floor not target" framing is good. | Very low. |
| 7. Hits lesson 1 | "Now we cook." | Drops her on `/learn/v2/variables/naming-things/0` — directly into Step 1, not a chapter overview. | **1/5** — correct. She wanted to do, the system did. | Very low. |
| 8. Pyodide boot | "Why is the editor saying 'Booting Python (one-time, ~5s)…'?" | The IDE shows a status pill *"Booting Python…"* until the worker is ready. | **3/5** — a PM in 2026 expecting "click Run" gets a *"wait a sec"* moment. The copy mitigates this ("one-time"), but on first impression the message reads as *something is broken*. | Medium — her mental model of "interactive course" doesn't include cold-starts. |
| 9. First Run | "I want output now." | Hits Run, sees `pet = "luna"` print. | **1/5** — this is the moment. The wedge actually lands here. | Very low. |
| 10. Reaches `fill` step | "Type the answer." | Inline `<input>` field outside the IDE. Even though UX §1.3 spec said "blanks are inline editable chips inside the editor," `FillBlankStepView.tsx:111` confirms blanks are rendered as standalone inputs in the prompt panel — **NOT inside the IDE**. | **4/5** — the persistent-IDE fiction breaks. She reads about Python, then types into a form, then hits Check. The IDE on the right is just decoration during fill steps. The "I'm coding the whole time" feeling is broken on the highest-frequency step type after `read`. | Medium — she doesn't articulate it but the magic dims. |
| 11. Lesson complete | "What's next?" | "Finish" button → `/`. | **4/5** — same drop-off as Charlie. She had momentum, gets dumped. | **HIGH**. |

### Indie Ian — building agents on weekends, knows AI fails, doesn't know why

| Step | What he wants | What the site asks | Friction | Quit risk |
|---|---|---|---|---|
| 1. Land on `/` | "Show me the agent stuff." | Has to scroll past the value cards to see the chapter grid. Sees chapters 13-22 (LLM APIs, MCP, agent loops, evals). | **3/5** — the most relevant chapters to him are buried below the fold. The site should know "if you're scared of variables, start at 1; if you're here for agents, jump to 13." | Medium — he scrolls; if he doesn't, he's gone. |
| 2. Click "agent loops" (Ch 16) | "Drop me into agent loop content." | Lesson says "1 lesson · ~9 steps." Goes straight in. | **2/5** — works but he's missed the foundation chapters. There's no "you may want X first" warning. He's reading agent-loop content with no scaffolding from the variables/functions chapters. | Medium — depends on whether the chapter assumes priors. |
| 3. Hits an unfamiliar concept | "Can I shortcut to the concept I'm missing?" | Sidebar lets him jump anywhere. But there's no concept index — he has to remember which chapter covers `try/except`. | **3/5** — concept-level navigation is missing. Step labels like "01 read" are useless for finding "the closures lesson." | Medium. |
| 4. Onboarding (he doesn't do it) | n/a | He skipped. So `profile.name` is empty. Personalization tokens like `{{user.name}}` will not render right. | **3/5** — silent degradation. The system shows raw or fallback strings; he won't know he missed something but the experience is mildly worse. | Low (subliminal). |
| 5. Lesson 1 step 1 | "Run code, validate I know this." | Runs example, gets output. | **1/5** — fine. | Very low. |
| 6. Tries to leave and come back tomorrow | "Resume." | Comes back to home page; sees "welcome back · Ch 16 · agent loops" pill. Clicks it. | **2/5** — works. Slight nit: nothing on the lesson page itself indicates "you ran this 8 hours ago" — no time-since-last-touch surface. | Low. |
| 7. Finishes a chapter | "Tell me the next reasonable thing." | "Finish" → `/`. No "you've finished agent loops, the natural next is: evals (Ch 21)." | **4/5** — same pattern. The site has the data (chapter graph) and refuses to recommend the next move. | **HIGH** for retention. |

---

## Pain-point hot map

Top 15 friction points, ranked by `coverage × severity` (3 = all personas hit it severely, 1 = one persona, mild):

| # | Pain point | Where | Severity | Personas hit |
|---|---|---|:-:|---|
| 1 | **"Finish" lesson → marketing home page**. The endorphin moment becomes a marketing page browse. | `LessonStepClient.tsx:131` | **3** | All 3 |
| 2 | **Pyodide ~5s cold-start blocks the "click Run, see output" promise on first impression.** Status copy mitigates but doesn't eliminate. | `PersistentIDE.tsx:84` | **3** | All 3 |
| 3 | **Chapter overview page is a wall of text** before the first lesson — recreates the "another Python tutorial" feel the site is trying to escape. | `/learn/v2/variables` (Wall of Text) | **3** | Charlie (most), Priya, Ian |
| 4 | **`fill` step rendering breaks the persistent-IDE fiction** — blanks render as form inputs in the prompt panel, IDE on right is decoration. | `FillBlankStepView.tsx:111` | **3** | All 3 |
| 5 | **No concept index / no "find a topic" search** — sidebar is chapter-ordered only. | `ChapterNav.tsx` | **2** | Ian (severe), Priya (medium) |
| 6 | **Three competing CTAs on home** (welcome-back card / "new here?" link / 25 chapter cards) dilute action. | `app/page.tsx:84-181` | **2** | Charlie, Ian |
| 7 | **Audience copy ("Built for the marketing managers, PMs, ops folks") is in a tertiary paragraph**, after the H1 and subhead. The line that says "you're the audience" is buried. | `app/page.tsx:75` | **2** | Priya |
| 8 | **Step-type labels in sidebar leak implementation** — "01 read", "02 mc" mean nothing to a learner. | `ChapterNav.tsx:174` | **2** | All (low-grade everywhere) |
| 9 | **No mid-lesson "you can leave any time" affordance.** Closing tab feels like losing place. (Sidebar persists progress but there's no "save & go" button.) | global | **2** | Priya, Ian |
| 10 | **Personalization payoff is invisible if user fills the fields** — UX §3 says it sub's into examples like `pets = ["luna"]` instead of `["cat"]`. From the live page review, hard to tell if this actually fires across all step types or just `read`. The `interpolate()` call only runs when `step.personalize` is true. | `LessonStepClient.tsx:14`, step views | **2** | Priya |
| 11 | **No "skip this step" affordance for known content** despite §3.4 / §10.6 redlines reserving this for ADHD/known-stuff users. The footer button is `Continue →` only when passed; no "I know this, skip." | `LessonStepClient.tsx:179` | **2** | Charlie, Ian |
| 12 | **Daily-goal dial is in lesson header, not on home.** Home has 25 chapter cards but no progress / streak surface beyond the small `StreakWidget`. | `app/page.tsx:82` | **2** | All (mild) |
| 13 | **Sidebar shows full chapter list always**, including not-yet-loaded chapter detail — "Open chapter →" link in collapsed state is clunky. | `ChapterNav.tsx:104` | **1** | Ian |
| 14 | **Wrong-answer copy is consistent ("Not that one.", "Not yet — read the line above the blank.") but has no per-option explanation surfacing for `fill`** — only `mc` shows `option.explain`. Learners get less help on harder step types. | `FillBlankStepView.tsx:155-170` | **1** | All |
| 15 | **No "first wrong answer" softening as promised in master plan §4** — the wrong-answer microcopy doesn't reference the offending line/value the way the brand-moment example does. ("`total` is a string, not a number") | step views | **1** | All |

---

## Cognitive load

**Where the site asks for context the user doesn't have:**
- **Home page presents 25 chapters as parallel choices.** A new user has no basis to pick chapter 13 vs 1. The chapter cards show step counts and blurbs but no "you should probably start here" arrow. The "Get started in under a minute" hero attempts this but competes with the grid.
- **The chapter overview page** asks the user to read 5 sections before deciding to start. A confident builder has no context for "common pitfalls" before they've seen the concept.
- **The "place me, I already code" path that the master plan §9 mentions doesn't exist.** Users can't self-route; they either onboard or guess.
- **Onboarding's "personalization" screen** asks for pet name without proof the field will be used. Cost/value tradeoff is opaque.

**Where the next action is unclear:**
- **End of last step in a lesson:** The "Finish" button is the only signal. Whether this finishes the chapter, the lesson, or the whole course is ambiguous. (Code: it just routes to `/`.)
- **End of chapter:** No surface communicates this happened. `markChapterCompleteIfNew` fires silently and grants a frozen flame; there's no confirmation screen.
- **On a `read` step that has runnable code:** The user might assume they need to hit Run to advance. Actually, just clicking Continue is enough (and the system fakes a `read-ack` attempt). The tutorial value of clicking Run is lost without a nudge.

**Where IA forces backtracking:**
- After "Finish," the user is on `/`. If they want the next chapter, they have to find chapter 2 in the 25-card grid manually. The "welcome back" pill will offer the same chapter 1 lesson 1 they just finished if `lastVisitedV2` was the lesson they just completed. (Need to verify the pointer advances on completion — `setLastVisitedV2` fires on visit, not completion.)

---

## Trust + believability

**Senior-dev-adjacent credibility check:**

**Where the site earns trust:**
- "Free forever, open source. No certificate, no leaderboards, no paywall." — strong, specific, anti-Codecademy.
- The chapters 13-22 list (LLM APIs, MCP, agent loops, evals) is a credibility goldmine. *No other Python school in 2026 ships those chapters.*
- The H1 "Python for AI-first builders" pairs with "Read what AI wrote / Catch what it got wrong / Direct it deliberately" — this triple is the wedge in 12 words. A senior dev nods.
- The IDE on the right is real (CodeMirror 6, Pyodide, runnable). That's a "they built this" signal that survives skepticism.
- Step types like `fix` and `predict` signal "we've thought about pedagogy." A boot.dev veteran sees that and respects it.

**Where they'd roll their eyes:**
- **The chapter overview page's "common pitfalls / outcomes" sections** read like Coursera. The site is *trying* not to be Coursera, then has a Coursera page. Specific reaction: "five sections to walk through before lesson 1 is more course than dojo."
- **The "Get started in under a minute" hero card** with its hover-glow is the most "marketing site" element on the page. Builders trained to skip hero CTAs on landing pages will skip this.
- **"5-question onboarding"** as a sell — onboarding is a tax. Selling it as a feature is suspicious. The line would land better as "tell us what you're building so the examples aren't generic" (the actual value).
- **"production-AI track included"** in the eyebrow above the chapter list reads marketing-y. A builder reads "track" and thinks "marketing-segmented learning path." It's more trustworthy stated as fact: "ch 13–22 are the AI-builder chapters."
- **Pyodide's first-time "Booting Python (one-time, ~5s)…"** — for anyone who's ever loaded a Jupyter notebook, "booting Python" reads as "this is going to be slow." Worth softening the language to mask the cold-start.

---

## Engagement hooks

**Where the site says "oh, that's clever" or "wait, this is for me":**
1. **Chapters 13-22 in the grid** — agent loops, MCP, evals as Python-school content. No-one else has these. The "this is for me" moment for Charlie and Ian.
2. **Persistent IDE that runs even on `read` steps** — the editor never empties. When this works (read, mc, predict, fix, write), it's the strongest single design choice on the site. Cursor users recognize this rhythm.
3. **`fix` step, when the user reads the SyntaxError in the output panel and patches it.** This is the wedge in 90 seconds. No other Python school treats this as a primary step type.
4. **Onboarding's "What are you trying to build?"** with `team-tools` and `startup` as options — a small "this isn't a CS degree" signal.
5. **"⌘↵ runs the editor"** in the lesson footer — keyboard-shortcut hint reads as builder-tier. Coursera doesn't say this.

**Where it could create more:**
1. **Show, don't tell, on home.** A 5-second "type and Run" widget above the H1, like the `/learn/v2/variables/naming-things/0` IDE pasted in. Removes the boot wait by pre-warming Pyodide on `/` (it's already preloaded via `PyodidePreloader`).
2. **End-of-lesson "stats screen"** — UX §1.3 §8 mentions a Duolingo "stats screen" feeder. There isn't one currently — the site jumps straight to next step or `/`. A 3-second "you spotted 2 bugs · ran code 4 times · earned a frozen flame" beat would close the loop.
3. **Concept tags surfaced on hover** — `step.concept` exists (`"variable-assignment"`, etc.). Surfacing this as a tooltip / breadcrumb would let Ian skim the curriculum by *concept*, not chapter.
4. **"This is the fix step" framing once per lesson.** A small affordance on the FIRST `fix` step: "this is the highest-leverage step type. Read, judge, repair." Trains the user to value it.
5. **A "place me" path on home for Ian.** "I already code → jump to LLM APIs (Ch 13)" or a 3-question diagnostic that routes him.

---

## Drop-off risks

Top 5 places users will close the tab:

1. **Home page hero scroll.** Charlie reads "Python for AI-first builders," sees three value cards, sees a 25-card grid — closes. The fold is doing work the page isn't. Single biggest drop-off, every persona, every visit.
2. **Chapter overview wall of text** (`/learn/v2/variables`). 5 sections of read-before-do. Charlie loses. Priya tolerates. Ian skips to the chapter via deep-link if he can.
3. **Pyodide cold-start on first lesson.** "Booting Python (one-time, ~5s)…" with no Run feedback for 5s on a fresh browser. Worst case Priya reloads thinking it's broken.
4. **`fill` step where IDE goes decorative.** The persistent-IDE feeling breaks. The user notices subliminally and the magic dims. Doesn't quit immediately but the "this is special" perception fades.
5. **Lesson 1 "Finish" button → home page.** No celebration, no next-up, no "you did variables; functions is queued." The site treats lesson completion as an end, not a hand-off. Returning user rate dies here.

---

## Quick wins (< 1 hour each, big UX gain)

1. **Replace "Finish" → `/` with "Next lesson →" → next lesson.** Compute `nextLesson` in `LessonStepClient.tsx:130` (it already has the chapter graph). On chapter end, route to next chapter's first lesson. Last-chapter-last-step is the only `Finish → /` case. **`LessonStepClient.tsx:130-134`**
2. **Move audience copy ("Built for the marketing managers, PMs, ops folks…") above the H1 as a small eyebrow**, or fold into the subhead. The line that says "you're the audience" should arrive before the line that asks "are you the audience." **`app/page.tsx:65-81`**
3. **Soften Pyodide boot copy.** "Booting Python…" → "Warming up the editor… (~5s, only this once)" or just a silent spinner with `Run` enabled (already does this). Status copy is the highest-leverage change. **`PersistentIDE.tsx:83-88`**
4. **Cut chapter overview page to one paragraph + "Start chapter."** The current 5-section overview is a re-creation of the "tutorial" feeling. Move pitfalls/outcomes to lesson sidepanel or after first step. **`/learn/v2/[chapter]/page.tsx`**
5. **Fix step-type labels in sidebar.** "01 read" → "01 intro", "02 mc" → "02 quick check", etc. — or just show the step's first 30 chars of prompt. Implementation is one switch in `ChapterNav.tsx:174`.
6. **Show "Next: [chapter title]" in lesson footer when on last step**, instead of the binary `Continue / Finish`. Pre-loads the forward-pulling moment.
7. **Hide the "5-question onboarding" link when the welcome-back card is showing.** Right now `HomeClient` shows the welcome-back card AND the static page below still has "new here? start the 5-question onboarding →." Returning users see two paths competing.
8. **Pre-warm Pyodide on home page** (already does via `PyodidePreloader`) — verify it's actually firing, and add a "Python ready" subtle indicator. Removes the boot wait when the user clicks into lesson 1.

---

## Strategic UX bets (designer + dev sprint)

1. **Replace home page hero with a live, runnable IDE.** The very first thing the user sees is a CodeMirror editor with three lines of Python and a Run button. They click Run, see output, then meet the H1 below. The "felt the loop" promise from UX §9 belongs on `/`, not on lesson 1 step 1. Pyodide is already on the page. This is the highest-impact change available.
2. **Add an "I already code, place me" diagnostic.** 3 MC questions that route the user to either Ch 1 (Charlie/Priya), Ch 6 (intermediate), or Ch 13 (Ian). Onboarding bifurcates: full onboard for new, fast-route for builders. Solves the Ian discovery problem AND makes home less crowded.
3. **Build the end-of-lesson "stats screen."** Spec'd in UX §1.3 §8; doesn't exist. Three lines: what you did (`2 fix steps · 1 write · 8 reads`), what you earned (`+25 XP, ember:1`), what's next (`Lesson 2: identifying types →`). Closes the dopamine loop. Without this, "Finish → /" is the easiest fix but the stats screen is the right fix.
4. **Make `fill` blanks render inside the IDE,** as spec'd in UX §1.3 §3. Currently the spec lies — implementation puts blanks in the prompt panel. Either fix the implementation or update the spec to acknowledge prompt-panel blanks. The persistent-IDE moat breaks here.
5. **Build a concept-level navigator.** Sidebar by concept, not chapter. Use `step.concept` field (already populated). Lets Ian search for "closures" and find the 3 steps that touch it. Strategic for retention because it converts "I'm here for one thing" users into "I'll come back for the next thing."

---

## What the user actually needs the site to do (vs. what it currently does)

**The user wants to:** *Run code, see output, hit a moment of "wait, AI does this wrong all the time," fix one bug, leave smarter.*

**The site currently:** *Sells a 25-chapter course on its home page, gates lesson 1 behind either onboarding or a chapter-overview page, then delivers the runnable code experience the user came for.*

**The gap:** The site has a great Step 1, surrounded by a marketing site that delays it, and an end-of-lesson moment that releases the user instead of pulling them forward. The wedge is real — `fix` steps, the persistent IDE, chapters 13-22 are unique and credible. The wrapper around the wedge is a generic course site that the audience has already pattern-matched to "Codecademy."

**The single change with the most leverage:** Make `/` the IDE. Make "Finish" mean "next." Treat the marketing copy as something users land on *after* they've run code, not before.

---

**Auditor:** UX Specialist #1 (research / behavioral)
**Next steps:** UX Architect (IA) handles sidebar / chapter overview / concept index. UI Designer handles visual treatment of the IDE-as-hero. Growth handles audience-line placement and onboarding sales copy. Implementation team owns "Finish → next" and Pyodide cold-start mitigation.
