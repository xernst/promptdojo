# Competitive Analysis — what makes a learning platform feel "serious"

**For:** promptdojo competitive audit (audit-v2)
**Author:** Competitive Analysis Lead
**Date:** 2026-05-06
**Reference sites:** Codecademy, Boot.dev, Khan Academy, Frontend Masters
**Subject:** promptdojo (https://promptdojo.pages.dev)

---

## Methodology

Walked each reference site signed-out at 1440x900 desktop with a quick 375x812 mobile spot-check. For each site I captured: homepage, catalog, course landing, lesson page (where reachable signed-out), pricing, and any onboarding / dashboard intermediate. All screenshots live in `design-kit/audit-v2/screenshots/`. I scored every site on the same 12-pattern checklist.

The "serious" question: when does a coding-school site feel like Codecademy/Khan and not a personal blog? The answer is mostly density of trust signals, hierarchy that looks like a curriculum (numbered, time-boxed, gated), and a single dominant CTA per page. None of those require killing punk voice.

---

## Per-site patterns

### Codecademy — the polished textbook

**Quick read:** A grown-up bookstore for code. Cream + navy + one Iowa-blue accent. Every screen says "this is a curriculum, not a YouTube playlist."
*Screenshot: codecademy-home-above-fold.png, codecademy-catalog-fold.png*

- **Curriculum hierarchy:** Numbered chapter accordion with a circled chapter number + title + 1-line description. Click expands to a row-per-lesson list showing **lesson type tag** (Lesson / Quiz / Project / Article) + lock icon for paid content. *codecademy-syllabus.png, codecademy-chapter-expanded2.png*
- **Progress system:** Signed-out shows none; the eyebrow on each lesson row reserves the spot for it. Rating widget acts as the only "progress-shaped" element on the catalog.
- **Time estimates:** Every catalog card has a clock icon + "24 hours" / "7 hours" total in card footer; course landing has a "Time to complete" header chip. Hours, not minutes — Codecademy is selling the *commitment*. *codecademy-catalog-fold.png*
- **Difficulty markers:** "Beginner Friendly" with a 3-bar signal-strength icon on every catalog card. Course landing repeats it as a stat tile labeled "Skill level: Beginner." *codecademy-catalog-fold.png*
- **Prerequisites:** Course landing has a "Prerequisites: None" stat tile. Calling out **None** explicitly is itself a trust signal. *codecademy-course-fold.png*
- **Lesson navigation:** Inside a course it's a numbered TOC accordion + "Show all 13 modules" expander. No tree.
- **Skill tags:** Free-text tags via "Skills you'll gain" section + filterable taxonomy in catalog (Career path / Skill path / Certification path / Course).
- **Trust markers:** 4.6 stars + 12,067 ratings + 3,289,964 learners enrolled — visible above the fold on the course landing. Pricing page has Airbnb / Amazon / Reverb / Dailymotion logo row. *codecademy-course-fold.png, codecademy-pricing.png*
- **Content density:** Catalog cards are large (4-line desc + 2-line footer) but the catalog feels calm because of generous whitespace and only 3 cards per row.
- **Empty / signed-out states:** Promo-bar countdown timer ("01d : 23h : 30m : 34s — FLASH SALE") + sticky purple "Flash Sale" widget that doesn't go away.
- **Course start CTA:** Single "Start" button on the course landing, repeated in two places on the same page. Catalog cards each act as their own CTA.
- **Completion celebration:** Implied via "Certificate of completion available with Plus or Pro" row at the bottom of the syllabus accordion + the certificate appears as an "includes" check on the sidebar.

### Boot.dev — gamified RPG (closest direct competitor)

**Quick read:** "Codecademy meets World of Warcraft." Royal-blue starfield, brass/parchment frames, gold buttons, mascot ("Boots") in chat. The vibe is "boss fight, not class."
*Screenshot: bootdev-home.png, bootdev-courses-zoom.png, bootdev-lesson-zoom.png*

- **Curriculum hierarchy:** Course landing has a **numbered "Chapter List"** with title + 1-line description per chapter — same structural primitive as Codecademy but flatter (no expand). *bootdev-syllabus-zoom2.png*
- **Progress system:** XP/streak/levels on signed-in dashboard; signed-out homepage carries a leaderboard tab. The onboarding flow has a **horizontal progress bar with a glowing dot** at the top (5 questions, 2 answered). *bootdev-onboard-2.png*
- **Time estimates:** Catalog cards show "78 lessons" not hours, but the course landing has a "30 Hours of content / 179 Addicting lessons" stat-tile pair. Adjective in the metric ("addicting") is a deliberate brand tell. *bootdev-course-landing-zoom.png*
- **Difficulty markers:** None visible. Boot.dev sells *one* path-per-goal so they don't need to grade difficulty within it.
- **Prerequisites:** Implicit via the path order — courses are stacked in a single sequence and the demo CTA literally walks you through to find your level.
- **Lesson navigation:** Two-pane lesson UI: left = markdown lesson + ordered "Assignment" steps with checkbox-style icons; right = code editor + Submit / Run / Solution / Reset bar. **Tiny ◀ ▶ chevrons in the top-right** are the entire lesson nav. *bootdev-lesson-zoom.png*
- **Skill tags:** Catalog cards have type tags ("Course" / "Project" / "Guided Project") and update tags ("NEW" / "UPDATED"). *bootdev-courses-zoom.png*
- **Trust markers:** "Join 1,201,282 students from companies like Google / HashiCorp / Stripe / Microsoft" on home. Course landing has author card + photo + role + bio AND a maintainers row of 4 small avatars. Stats lockup: 33.7M / 208K / 7.4B (without labels they don't make sense, but they look like authority). *bootdev-home.png, bootdev-course-landing-zoom.png*
- **Content density:** Catalog cards are *dense*: type tag + lesson count + title + icon + star rating + sample size + enrolled count + "Major update Apr 2024" tag — six lines of context per card. Despite that they don't feel busy because the brass/parchment frame compresses them. *bootdev-courses-zoom.png*
- **Empty / signed-out states:** Single "DEMO THE LEARNING PATH" CTA + the literal "(it takes 2 minutes)" reassurance microcopy. Demo is a chat onboarding that ends in their actual lesson page — incredibly slick conversion path. *bootdev-home.png, bootdev-onboard-2.png*
- **Course start CTA:** Single huge gold-bordered button "SIGN IN AND START COURSE." On the home page it's "DEMO THE LEARNING PATH." Boot.dev only ever wants you to do one thing per page.
- **Completion celebration:** "Earn a certificate of completion" stat tile + leaderboard nav item + "Become a member" framing on pricing. The whole gamified loop *is* the celebration.

### Khan Academy — the public library

**Quick read:** A children's textbook for adults, in the best way. Indigo nav, bright illustrations, friendly mascots, mastery progress as the core UI primitive.
*Screenshot: khan-home2.png, khan-algebra-zoom.png, khan-unit-zoom.png*

- **Curriculum hierarchy:** Subject → Course → Unit → Lesson. The course landing shows **a 16-cell mastery grid** with a row per unit + sub-cells for skills inside the unit. The unit page repeats it for that unit's skills. *khan-algebra-zoom.png, khan-unit-zoom.png*
- **Progress system:** Mastery points are the unit of currency. **5-state legend at the top of every course/unit page:** Mastered / Proficient / Familiar / Attempted / Not started + Quiz + Unit test. Each cell visibly shows the state with color + icon. This is the most differentiated progress system of the four sites. *khan-algebra-zoom.png*
- **Time estimates:** Mostly absent — Khan optimizes for mastery not minutes. But individual videos show duration in player.
- **Difficulty markers:** Implicit via grade level (5th grade math / 6th grade math / Algebra 1 / AP Statistics). Grade level *is* the difficulty taxonomy.
- **Prerequisites:** "Not feeling ready for Algebra 1? Check our Get ready for Algebra 1" microcopy at the top of the course page. Each course offers a **prereq path link** as a sibling. *khan-algebra-zoom.png*
- **Lesson navigation:** Three-pane: left = unit/lesson sidebar with active state + collapse arrow, middle = lesson content (video / article / practice), bottom-right = floating "Up next: video" button. Breadcrumb in the sidebar header ("COURSE: ALGEBRA 1 > UNIT 1"). *khan-lesson.png*
- **Skill tags:** Per-skill named items in mastery grid + activity-type icon (Video play / Article book / Practice star). No free-text tags.
- **Trust markers:** "Khan Academy boosts scores!" + ".5:1 — 100% increase in scores supporting Khan Academy learners" + nonprofit framing ("Free to Use. Not Free to Make." donation modal). *khan-home2.png, khan-home.png*
- **Content density:** Subject hub pages are very dense — each subject card has 8-12 sub-courses. Course pages are **calm**: huge mastery grid + brief "About this unit" prose.
- **Empty / signed-out states:** **Role-tagged signup CTA modal**: "Are you a... Learner / Teacher / Parent / district admin." Different post-signup flows per persona. *khan-home2.png*
- **Course start CTA:** No single CTA — Khan assumes browse-mode. Each unit is its own entry point. The closest is the "Up next for you" practice widget on the unit page (with a **Start** button). *khan-unit-lessons.png*
- **Completion celebration:** Mastery grid filling up *is* the celebration. They've replaced the "course complete" moment with continuous skill-by-skill mastery accrual.

### Frontend Masters — the senior dev's gym

**Quick read:** Premium dark cinema. Big crimson "Join Now," instructor-as-celebrity, every course poster is a close-up of an expert mid-lecture. Authority-by-author.
*Screenshot: fm-home.png, fm-cards-zoom.png, fm-path-tree.png*

- **Curriculum hierarchy:** **Learning paths are a literal zig-zag tree** — course cards connected by lines, alternating sides, with "Up First / Up Next" labels and a description block between cards. Below the main spine: "Elective Coursework / Optional, take in any order." This is the only true tree in the four sites. *fm-path-tree.png, fm-path-tree3.png*
- **Progress system:** Path page has a **circular % indicator** at the top ("48% complete" — appeared dynamic; may have been mocked). Course landing has a numeric rating and a hidden "have I watched this" state for signed-in users. *fm-path-beginner.png, fm-path-tree.png*
- **Time estimates:** Path page header: "Total time: 48 hours, 25 minutes." Course landing: "9 hours, 5 minutes" + CC badge. Per-lesson rows in TOC have **timestamps in red** ("00:00:00 - 00:07:00") — minute-precise. *fm-landing-zoom.png, fm-course-toc.png*
- **Difficulty markers:** Path-level only: Beginner / Professional / Expert / Computer Science with **icons that signal progression** (paper plane → jet → rocket). No per-course difficulty. *fm-paths-grid.png*
- **Prerequisites:** Spelled out as a sentence on the course landing: "Prerequisite: A basic understanding of TypeScript and experience building frontend applications with a framework like React. Our AI Agents Fundamentals courses is also helpful, but not required." Hyperlinked inline. *fm-landing-zoom.png*
- **Lesson navigation:** TOC = scrollable list with thumbnail + title + instructor blurb + timestamps. Section headers ("Introduction / Cloudflare Agent") have "Section Duration: 23 minutes." Most readable TOC of the four. *fm-course-toc.png*
- **Skill tags:** Topic chips with icons across the catalog top: "Artificial Intelligence / Full Stack / JavaScript / React / Frameworks / TypeScript / State Management / CSS." Both icon and text. *fm-courses-zoom.png*
- **Trust markers:** **Author photo + name + employer on every card** ("SCOTT MOSS / Netflix" / "STEVE KINNEY / Temporal" / "EUGENI RAY / Staff UI Engineer"). 5-star rating + "Loved by 500k+ developers" + "200+ in-depth courses / Industry Leading Experts / Live Interactive Workshops" stat tiles on pricing. *fm-cards-zoom.png, fm-pricing3.png*
- **Content density:** Catalog cards are *low* density (image + title + author lockup + 2 small icons). Catalog feels editorial, not academic. Course landing is high density.
- **Empty / signed-out states:** Hero is a portrait video still of an instructor mid-talk + dual CTA ("Browse Our Courses / View Learning Paths") + sticky "Get Started with GitHub" button. The whole site is a permanent signed-out funnel. *fm-home.png*
- **Course start CTA:** "Start Watching for Free" red button on every course landing — even for paid courses, you can see the first lesson. Risk-free entry is the conversion lever. *fm-landing-zoom.png*
- **Completion celebration:** Implied via "Industry Leading Experts" + "Live Interactive Workshops" pricing-tile language. Less gamified than Boot.dev, more "you joined the gym" than "you leveled up."

---

## What every "serious" site has (cross-cutting patterns — table-stakes)

These four show up on **all four** reference sites. If promptdojo is missing any, that's the single biggest "feels indie" gap.

1. **Numbered curriculum hierarchy.** Codecademy, Boot.dev, and FM all show a numbered list of chapters/courses. Khan uses unit numbering. promptdojo already has "CH 01 / CH 02..." — keep this.
2. **Time estimate per unit.** "24 hours" / "30 mins" / "9hrs 5min" — every site quantifies the commitment. promptdojo has "30 MIN" per chapter — keep, but **add a course-level total too** ("25 chapters · ~12 hours total").
3. **Lesson-type taxonomy.** Codecademy uses Lesson/Quiz/Project/Article. Khan uses Video/Article/Practice. Boot.dev uses Course/Project/Guided Project. promptdojo has "26 steps · 3 lessons" but doesn't tell you what *types* of steps. **Add type tags**.
4. **Single dominant CTA per page.** Codecademy = "Start," Boot.dev = "DEMO THE LEARNING PATH," Khan = "Start," FM = "Start Watching for Free." promptdojo has "START CHAPTER 1 →" — keep this; it's already great.
5. **Trust marker above the fold.** Student count / rating / employer logos / nonprofit badge — every site does this. promptdojo currently has none.

---

## What only the best have (differentiators)

These show up on 1-2 of the four. Worth considering, but optional.

- **Mastery grid as primary UI** (Khan only). High-effort, high-reward — replaces "% complete" with skill-level state. Only works if you actually track mastery per skill.
- **Curriculum-as-tree** (FM only). Visual flowchart of course-to-course progression with electives branching off the spine. Only worth it if you have multiple paths.
- **Author photo + employer on every card** (FM only). Powerful for credibility but promptdojo's authoring is "AI-generated, audited by humans" — wrong fit.
- **Conversational onboarding** (Boot.dev only). Chat-style 5-question funnel ending in their actual lesson UI. Highest conversion lever I saw.
- **Lesson type icons in a sidebar** (Codecademy + promptdojo). Lock / video / quiz / project — the iconography becomes the navigation.
- **Inline prerequisite sentence with hyperlinks** (FM only). Reads like a sentence, links go to the prereq course. promptdojo could use this verbatim.

---

## What promptdojo doesn't have (the gap)

| Pattern | Codecademy | Boot.dev | Khan | FrontendMasters | promptdojo |
|---|:---:|:---:|:---:|:---:|:---:|
| Numbered chapters | ✅ | ✅ | ✅ (units) | ✅ (path) | ✅ |
| Per-chapter time estimate | ✅ "24 hours" | ✅ "78 lessons" | ◐ video only | ✅ "9h 5m" | ✅ "30 MIN" |
| **Course-level total time** | ✅ implicit | ✅ "30 hrs" | ◐ | ✅ "48h 25m" | ❌ |
| Lesson type tag (read/quiz/project) | ✅ | ✅ | ✅ | ✅ | ❌ in cards |
| Difficulty marker | ✅ "Beginner Friendly" | ❌ | ◐ grade level | ✅ Beginner→Expert | ❌ |
| Prerequisite shown | ✅ "None" | ❌ | ✅ "Get ready for…" | ✅ inline sentence | ❌ |
| Progress indicator (signed-in placeholder) | ✅ | ✅ XP/streak | ✅ mastery grid | ✅ % circle | ◐ XP top-right |
| Star rating | ✅ 4.6 ★ | ✅ 4.8 ★ | ❌ | ✅ 5 ★ | ❌ |
| Student / enrolled count | ✅ 3.2M | ✅ 1.2M | ✅ "boosts scores" | ✅ "500k+" | ❌ |
| Author / instructor identity | ❌ | ✅ photo + bio | ❌ | ✅ photo + employer | ❌ |
| Single dominant CTA | ✅ Start | ✅ DEMO THE PATH | ◐ | ✅ Start Watching | ✅ START CH 1 |
| Course completion / certificate signal | ✅ | ✅ | ❌ (mastery is it) | ❌ | ❌ |
| Onboarding funnel for signed-out | ◐ AI chat | ✅ 5-Q chat | ◐ role picker | ❌ | ✅ "5 questions" link |
| Empty-state / signed-out trust marker | ✅ FLASH sale + logos | ✅ company logos | ✅ "boosts scores" | ✅ "Loved by 500k+" | ❌ |
| Lesson types in syllabus | ✅ Lesson/Quiz/Project | ✅ Course/Project | ✅ Video/Article/Practice | ✅ video preview | ◐ icons in sidebar |
| TOC with sub-lessons in syllabus | ✅ accordion expand | ✅ chapter list | ✅ unit page | ✅ TOC with timestamps | ❌ "3 lessons" only |

**The honest read:** promptdojo has the *skeleton* of a serious site (numbered chapters, time estimates, single CTA, lesson sidebar). It's missing the **trust signal layer** (no rating, no learner count, no author identity, no testimonial) and the **expandable-syllabus pattern** (catalog card says "3 lessons" but you can't see what they are without committing). Those two changes alone close 70% of the perceived gap.

---

## Top 10 patterns to adopt for promptdojo

Ranked impact-to-effort. Each pattern has a screenshot reference, why it works for promptdojo specifically, and a one-line implementation hint.

### 1. Trust marker above the fold

**Pattern:** A single line of social proof on the home hero.
**Refs:** *bootdev-home.png* "Join 1,201,282 students from companies like Google / Stripe..." | *codecademy-course-fold.png* "3,289,964 learners enrolled" | *fm-pricing3.png* "Loved by 500k+ developers"
**Why it works for promptdojo:** Right now the page reads as "one person's opinionated indie thing." Even a small number ("847 builders started chapter 1 this week") moves it to "real product." Use whatever the founder will *actually* track — X follower count is fine if that's the real validation metric. (Audience-over-completion is already the documented validation strategy in `~/Obsidian/v01/.../feedback_validation_metrics.md`.)
**Implementation hint:** Below the "free forever" line, add a single italic-serif line: "*xxx builders shipped chapter 1 this month*" — keep the punk voice but quantify.

### 2. Course-level total time + chapter-count summary

**Pattern:** "25 chapters · 624 interactive steps · ~12 hours total." (You have the first two.)
**Refs:** *codecademy-course-fold.png* "Time to complete: 24 hours" | *fm-path-beginner.png* "Total time: 48 hours, 25 minutes"
**Why it works for promptdojo:** Codecademy and FM both lead with "this is X hours of work" because it makes the curriculum feel finite. Right now promptdojo's "624 interactive steps" feels infinite/intimidating without a time anchor.
**Implementation hint:** Sum chapter time estimates ("30 MIN" × 25) and surface as "~12 hours total" or "~30 minutes per chapter, ~12 hours total" right under the existing chapters-and-steps line.

### 3. Expandable syllabus on each chapter card

**Pattern:** Click a chapter card → expand to show lesson titles inside.
**Refs:** *codecademy-syllabus.png, codecademy-chapter-expanded2.png* (numbered chapter expands to lesson rows with type tag + lock icon)
**Why it works for promptdojo:** "26 steps · 3 lessons" is a black box. Codecademy's expand-to-reveal lets a skeptical visitor see exactly what they'll learn before they click. **This is the highest-impact single change** for "feels serious."
**Implementation hint:** Each card on the homepage chapter grid gets a chevron — click expands the card in place to show the 3 lesson titles + lesson type ("read" / "fill-the-blank" / "checkpoint" — the same icons you have in the lesson sidebar).

### 4. Lesson-type tag in chapter cards + syllabus

**Pattern:** Tag each step or sub-lesson with a type — "read," "fill-blank," "checkpoint," "project."
**Refs:** *codecademy-syllabus.png* "Lesson / Quiz / Project / Article" with icons | *bootdev-courses-zoom.png* "Course / Project / Guided Project" header tags
**Why it works for promptdojo:** You already have type icons in the lesson sidebar (read / fill-blank / checkpoint). Surface them on the *catalog* so visitors know what they're getting before they commit. Type tags also make the curriculum feel structured-pedagogically rather than blog-posty.
**Implementation hint:** In the expanded chapter (#3 above), each lesson row gets a type-icon prefix matching the existing lesson sidebar iconography.

### 5. Difficulty / prerequisite line per chapter

**Pattern:** A single line of metadata: "Beginner-friendly · No prereqs" or "Prereq: ch 04 loops."
**Refs:** *codecademy-catalog-fold.png* "Beginner Friendly" + bars icon | *fm-landing-zoom.png* inline prereq sentence with hyperlinks
**Why it works for promptdojo:** Promptdojo has a real prereq chain (ch 13 LLM APIs needs ch 12 HTTP/APIs, ch 16 agent loops needs ch 13). Surfacing that *is* the curriculum's intelligence. Calling out "Prereqs: None" on early chapters is itself trust-building.
**Implementation hint:** Add a third metadata line to the chapter card: "Prereqs: none" or "Prereqs: [ch 12 →](/...)". Hyperlink works exactly like FM.

### 6. Stat tiles on chapter / course landing page

**Pattern:** Horizontal row of 3-4 stat tiles below the title — "Skill level / Time / Projects / Prerequisites."
**Refs:** *codecademy-course-fold.png* (4-tile row) | *bootdev-course-landing-zoom.png* "30 Hours of content / 179 Addicting lessons / Earn a certificate / Learn online at your pace"
**Why it works for promptdojo:** When a visitor clicks "ch 12 http and apis" they land on a chapter page. Right now there's no chapter-level intro page (lesson 1 is the chapter intro). A chapter landing with stat tiles would be a place to put: time estimate, prereq chain, # of lessons, # of checkpoints, "what you'll be able to do after."
**Implementation hint:** Optional — only if you build a chapter-landing route. If not, fold the stats into the homepage card expansion (#3).

### 7. Rich TOC view per chapter (timestamps optional)

**Pattern:** A scrollable list of every lesson within a chapter, with title + 1-line description + timestamp range. Visible on the chapter landing.
**Refs:** *fm-course-toc.png* (full TOC with thumbnails, timestamps, instructor descriptions)
**Why it works for promptdojo:** This is what FM does brilliantly — the TOC sells the course because every row reads like a teaser. "Variables — the names AI reaches for first" is already in your lesson body; surface it on the chapter landing as a teaser row.
**Implementation hint:** When a visitor clicks a chapter card, show the 3 lesson titles + 1-sentence pull from the lesson body. Step count per lesson ("8 steps") in place of FM's timestamps.

### 8. Signed-out lesson preview ("the first lesson is free")

**Pattern:** A "Start Watching for Free" or equivalent that lets the user *see the actual lesson* without signing up.
**Refs:** *fm-landing-zoom.png* "Start Watching for Free" red button on every course landing | *bootdev-onboard-4.png* the demo path lands you in the actual lesson UI after 4 questions
**Why it works for promptdojo:** Promptdojo *already* lets you start chapter 1 without signing up — but the homepage doesn't say so loudly enough. The current "[ LOGIN TO SAVE ]" button hints at it but doesn't sell it. **Add a one-liner**: "no signup required to read the first chapter."
**Implementation hint:** Right under the "START CHAPTER 1 →" CTA, in small caps green: "FREE · NO SIGNUP NEEDED." Already true; just say it.

### 9. Mastery / completion icon system in the chapter sidebar

**Pattern:** Per-step state icons in the lesson sidebar showing what you've completed (filled circle / hollow circle / lock).
**Refs:** *promptdojo-lesson1-zoom.png* (you already have this) | *khan-algebra-zoom.png* (5-state legend) | *codecademy-chapter-expanded2.png* (lock icons for paid)
**Why it works for promptdojo:** You already have step icons. **Codify them visibly** on the homepage too — show the 26 step-dots as a thin row under each chapter card, like a progress placeholder. Signed-in users see their progress; signed-out visitors see the structural promise.
**Implementation hint:** A 26-dot row per chapter card. Empty for signed-out. Green-fill for completed once signed in. Khan-style.

### 10. "What you'll be able to do" outcome statement per chapter

**Pattern:** One sentence framed as "After this you can: read X / write Y / spot Z."
**Refs:** *codecademy-syllabus.png* (each chapter has a 1-line outcome description) | *fm-course-toc.png* (instructor bio per lesson reads as "what you'll learn")
**Why it works for promptdojo:** The current chapter cards have great descriptions (clear, voice-y), but they're framed as *what AI does wrong*, not *what you'll be able to do*. Adding an outcome line makes the curriculum feel like a course, not a critique.
**Implementation hint:** Below each card description, in dim italic: "after: you can read X on sight." (You already have this language in the body — surface it.)

---

## What NOT to adopt (anti-patterns)

- **Codecademy's flash-sale countdown timer.** Manipulative. Promptdojo is free forever — using urgency tactics would break the brand's honesty.
- **Boot.dev's gamification stack** (XP / streaks / leaderboard as core UI). Boot.dev sells gamification *as the product*. Promptdojo sells "AI writes Python wrong, here's how to read it." Adding XP/streaks dilutes the punk-utility positioning. **Keep the small XP indicator in the corner; do not make it central.**
- **Khan's mastery grid as the homepage.** Brilliant for K-12 but overkill for a 25-chapter course. Don't replicate the 5-state mastery legend — the cognitive load is too high.
- **FM's instructor-as-celebrity hero.** Promptdojo's content is AI-authored ("ai writes this. it's wrong."). Putting a face on it would be the literal opposite of the brand.
- **Codecademy's role-tagged signup** ("Are you a Learner / Teacher / Parent?"). Promptdojo has one persona (AI-assisted builder). Don't fragment it.
- **Boot.dev's "Traditional University ~$26,000" pricing comparison.** Effective for them, but promptdojo is free. The implicit comparison is to a tutorial blog, not a $26k bootcamp.
- **Promo bars / sticky banners.** Codecademy has both. They make the page feel like marketing, not a learning environment.
- **Interactive demos before the real product.** Boot.dev's 5-question chat onboarding is brilliant *for them* because it sells the gamification. Promptdojo's product is the lesson itself — let visitors land on chapter 1 directly.

---

## What promptdojo does BETTER

Worth protecting in v2:

1. **The hero copy.** "ai writes this. it's wrong." is the sharpest single line of the five sites. Codecademy says "Develop your /potential" (generic), Boot.dev says "Learn to code, but for real" (good but RPG-coded), Khan says "Khan Academy boosts scores!" (vague), FM says "Master the Full Stack" (commodity). promptdojo's headline is the *actual unique insight* of the product.
2. **The code-snippet hero.** Showing real (broken) code on the home is more honest than any of the four reference sites. Codecademy and FM use stock photography; Boot.dev uses fantasy art. The buggy `def collect_errors(msg, bag=[])` snippet *teaches* on first paint — it's the strongest "show don't tell" of any landing in this audit.
3. **Mobile-first density.** The chapter cards on mobile already work — promptdojo doesn't need Codecademy's mobile-only AI chat workaround (which exists because the desktop catalog has 829 results that won't fit on a phone).
4. **Voice in error states.** "[ park a thought ]" floating button is more memorable than Codecademy's silent forms. Keep the voice.
5. **No sales pressure.** No countdown timer, no "FLASH SALE," no "Recommended Pro" upsell, no donation modal. Visitors won't feel sold-to. **This is the single biggest differentiator from Codecademy and Khan** — keep it.
6. **The "26 steps · 3 lessons" granularity.** Codecademy says "Module" (vague), FM says "12 lessons" (vague). Boot.dev says "78 lessons" (vague). promptdojo's "26 *steps*" implies that even a single lesson is interactive sub-units — that's already a more honest description of the product.

---

## Bottom line

promptdojo is missing trust signals (rating, learner count, total hours, prereq metadata) and an expandable syllabus pattern. Adding those — without touching brand voice, color, or hero — closes 70% of the "feels serious" gap. The remaining 30% is: better chapter-level navigation (a chapter landing page or a richer expanded card) and a single line of social proof on the homepage hero.

**Do not add:** countdown timers, instructor-celebrity portraits, mastery grids, role-tagged signups, or pricing comparisons to traditional alternatives. Those are how Codecademy/Boot.dev/FM extract revenue. Promptdojo's job is different — it sells trust through *being trustworthy*, not through manufactured urgency.

Hand-off: UI Designer should focus on patterns #1, #2, #3, #4, #5 (the table-stakes group) — those alone are the v2 promise. Patterns #6-10 are v3 once the founder has built out per-chapter landing pages.
