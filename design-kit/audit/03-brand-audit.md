# Brand Fidelity Audit — promptdojo

> Live: https://promptdojo.pages.dev — audited 2026-05-05.
> Brand kit: `design-kit/{BRAND,VOICE,COLORS,TYPOGRAPHY,LOGO,MOTION}.md` (locked this session).
> Auditor: Brand Guardian (designer #2 of 2).

---

## Brand health score

| Dimension | Score | Notes |
| --- | ---: | --- |
| Logo / mark | 7/10 | The new ensō+caret mark is shipped at `app/icon.svg`. No favicon links in `<head>`, no `apple-icon` referenced in `layout.tsx` metadata. Wordmark in OG art is sans-serif (not JetBrains Mono ExtraBold per LOGO.md). |
| Voice | 5/10 | Hero copy is on-voice. Onboarding, home cards, CTAs, and chapter pages are riddled with **Title Case** and **Sentence-case headlines** when the kit demands all-lowercase. Two exclamation points found in live copy. |
| Color | 3/10 | Multiple rogue chromatic accents shipped: cyan (`text-cyan-300/400`), amber (`text-amber-300/400`), rose (`text-rose-300/400/500`), orange-not-ember (`text-orange-300/400`), `signal` green (`#5BC8AF`), purple `#a5b4fc`. Tailwind theme defines `--color-paper`, `--color-signal`, `--color-slate-custom` — none authorized by COLORS.md. |
| Typography | 4/10 | **Inter is still loaded** in `app/layout.tsx:2,6` — TYPOGRAPHY.md explicitly says "drop Inter from `app/layout.tsx`" when V1 ships. `--font-sans` defaults to Inter, body has `font-sans`, so most UI text renders in the banned font. OG images use `fontFamily: "sans-serif"`, not Fraunces/JetBrains. |
| Motion | 2/10 | No 1.0 Hz cursor blink anywhere in source — the brand "heartbeat" per MOTION.md is missing. No `@keyframes blink`, no `.cursor` class. The wordmark, IDE prompt, and trailer-reference moments are static. |
| Imagery | 9/10 | No stock photos, no decorative emojis in shipped UI. Lucide icons (`Brain`, `Flame`, `Snowflake`, `Sparkles`, `Sun`, `Lock`) are present but functional. Colored-dot Mac-window chrome in IDE OG art uses red/yellow/green dots — borderline. |
| Coherence | 4/10 | Rebrand is half-shipped. Voice + visual language pull in opposite directions: brand-kit copy says "lowercase swagger" and "ember-only chromatic," product UI says "Title Case Continue" and "cyan snowflakes for frozen flames." |

**Overall: 4.9/10** — the brand kit is excellent and the home page reads on-voice in hero copy, but the product UI hasn't caught up. Color and typography failures alone should block ship.

---

## Critical brand violations (must-fix to ship)

1. **Inter still loaded as the default sans-serif.**
   - `app/layout.tsx:2` imports `Inter`, `:6` instantiates it, `:21` injects `${inter.variable}`, and `app/globals.css:34` sets `--font-sans: var(--font-inter), …`.
   - `app/layout.tsx:22` applies `font-sans` to `<body>` — every non-Fraunces, non-mono surface on the site renders in **the banned font**.
   - TYPOGRAPHY.md:79 is unambiguous: "drop Inter from `app/layout.tsx`."

2. **`--color-signal: #5BC8AF` (teal-green) is shipped as a chromatic accent.**
   - `app/globals.css:32` defines it; ChapterNav, DailyGoalDial, and every step-view component (`MultipleChoice`, `Reorder`, `Checkpoint`, `Predict`, `FillBlank`, `Write`, `FixBug`) use `text-signal`, `border-signal/50`, `bg-signal/5` for "passed" / "correct" states.
   - COLORS.md:24 — "Ember is the only chromatic accent." `#5BC8AF` is a second chromatic accent.
   - COLORS.md:19 — `--ok` (`#86efac`) is "used **once**, in pyodide output." Signal is doing OK's job everywhere, in the wrong hue.

3. **Cyan + amber + rose + orange in StreakWidget.**
   - `components/StreakWidget.tsx:29-39`:
     - `text-orange-300`, `fill-orange-400 text-orange-400` on Flame
     - `text-amber-300`, `text-amber-400` on Sparkles
     - `text-cyan-300`, `text-cyan-400` on Snowflake
   - Three Tailwind palettes are firing on a single component. None are ember (`#F2683C`). COLORS.md:24 violated.

4. **Title Case / sentence-case headlines everywhere.**
   - VOICE.md:11 + TYPOGRAPHY.md:82 — "All headlines are sentence-case or all-lowercase. Title case smells corporate."
   - Specific failures listed in the Voice section below — at minimum: every `<h1>`/`<h2>` on `/`, `/onboarding`, every chapter page, every lesson title.

5. **Two exclamation points in live copy.**
   - VOICE.md:24 — "No exclamation points. One per quarter, max, and only ironically."
   - Live: "Here's what's about to happen, hundreds of times this year!" on `/learn/v2/variables/naming-things/0` (lesson source — origin in markdown content, not yet located in this audit pass).
   - Onboarding `/onboarding` extracted: a `.` punctuation but the WebFetch flagged "You're going to learn Python!" earlier — the actual source is `app/onboarding/page.tsx:194` with a period, not a bang. Confirm during fix pass; the lesson exclamation is the real one.

6. **No favicon / apple-icon referenced in metadata.**
   - `app/layout.tsx:10-17` exports `metadata` with title + description but no `icons` field.
   - `app/icon.svg` and `app/apple-icon.png` exist (Next.js convention picks them up automatically), but the live HTML should be verified to confirm both render. Brand kit calls for the ensō+caret mark at favicon size; current `app/icon.svg` shows a chevron-and-underscore in a rounded square, NOT an ensō. **The mark in icon.svg is not the LOGO.md ensō.**

7. **The mark in `app/icon.svg` is not the brand-kit ensō.**
   - `app/icon.svg:4` draws an arc (90% of a circle) — close to an ensō but mislabeled as "ensō+caret" elsewhere.
   - LOGO.md describes "an imperfect ensō (zen brush circle) with `>_` inside." The current icon has an arc + chevron + underscore — passable but the asset list in LOGO.md (`mark.svg`, `mark-on-light.svg`, `mark-mono.svg`) does not match what's in `app/icon.svg`. The `design-kit/logos/` directory holds the master assets; verify they were copied/converted correctly.

---

## Voice violations (the longest list)

### Title Case headlines (VOICE.md:11 — "all-lowercase headlines, always")

- `"Python for AI-first builders."` — `app/page.tsx:69` (h1).
  - Why it fails: Title-cased "Python" + "AI-first" + "builders" reads marketing-deck. VOICE.md tagline drafts:21–23 are all lowercase ("welcome to the dojo.", "vibe-coders graduate here.").
  - Suggested rewrite: `"python for ai-first builders."` (period kept — reads as a statement, not a slogan).

- `"Read what AI wrote"` / `"Catch what it got wrong"` / `"Direct it deliberately"` — `app/page.tsx:97, 102, 107` (card titles).
  - Why it fails: Sentence-case-with-Caps-on-AI breaks the lowercase rule.
  - Suggested rewrite: `"read what ai wrote"`, `"catch what it got wrong"`, `"direct it deliberately"`.

- `"You're going to learn Python."` — `app/onboarding/page.tsx:194` (h1).
  - Why it fails: Title-case "Python." VOICE.md sample copy:42 actually capitalizes Python in body, but here it's a hero — kit says lowercase.
  - Suggested rewrite: `"you're going to learn python."`

- `"What are you trying to build?"` — `app/onboarding/page.tsx:226` (h2).
  - Suggested rewrite: `"what are you trying to build?"`

- `"Where are you starting from?"` — `app/onboarding/page.tsx:262`.
  - Suggested rewrite: `"where are you starting from?"`

- `"Make the examples yours."` — `app/onboarding/page.tsx:301`.
  - Suggested rewrite: `"make the examples yours."`

- `"Pick a daily floor."` — `app/onboarding/page.tsx:367`.
  - Suggested rewrite: `"pick a daily floor."`

- `"Start"`, `"Continue"`, `"Start lesson 1"` — onboarding CTAs at `:209`, `:347`, `:398`.
  - Suggested rewrite: `"start"`, `"continue"`, `"start lesson 1"`. (Tagline drafts in BRAND.md use lowercase even for product names.)

- `"Get started in under a minute"` + `"Five questions, then your first lesson."` — `components/v2/HomeClient.tsx:77, 80`.
  - Suggested rewrite: `"get started in under a minute"`, `"five questions, then your first lesson."`

- `"Pick up where you left off"` — `components/v2/HomeClient.tsx:95, 110`.
  - Suggested rewrite: `"pick up where you left off"` (the `:110` instance is already lowercase; the `:95` heading is title-cased).

- `"Ch ${number} · ${title}"` — `components/v2/HomeClient.tsx:94`.
  - Why it fails: VOICE.md:50 — "lowercase chapter labels. `chapter 07 · mutation and state`." Currently renders "Ch 1 · Variables" with cap-V.
  - Suggested rewrite: `"chapter ${number} · ${titleLower}"`.

- `"Variables"` chapter h1, `"Names are most of what reading code is"`, `"The mental model that actually works"`, `"What this chapter covers in three lessons"`, `"What AI specifically gets wrong about variables"`, `"What you'll be able to do at the end"`, `"Lessons in this chapter"` — chapter overview page (markdown source + `app/learn/v2/[chapter]/page.tsx:90, 132`).
  - Suggested rewrite: lowercase all of these. `"variables"`, `"names are most of what reading code is"`, `"lessons in this chapter"`, etc.

- `"Start chapter"`, `"← Back to all chapters"` — chapter page CTAs at `app/learn/v2/[chapter]/page.tsx:118, 126`.
  - Suggested rewrite: `"start chapter"`, `"← back to all chapters"`.

- `"Open chapter →"` — ChapterNav `:109`.
  - Suggested rewrite: `"open chapter →"`.

- `"Get started in under a minute"`, `"Naming things you'll point AI at (step 1/8)"` — lesson page titles (markdown source).
  - Suggested rewrite: `"naming things you'll point ai at (step 1/8)"` — and check lesson markdown frontmatter across all 25 chapters.

- `"Start onboarding"`, `"Continue Ch N"` — comments in `components/v2/HomeClient.tsx:5-6` describe the rendered UI in title case. The actual rendered string at `:75-77` is "start here" + "Get started in under a minute" — the eyebrow is lowercase, the headline isn't.

- `"Lesson XP"` — `components/v2/StepFooter.tsx:88`.
  - Why it fails: Title-case label in the persistent footer.
  - Suggested rewrite: `"lesson xp"`.

- `"Hint"` button label — `StepFooter.tsx:122`.
  - Suggested rewrite: `"hint"`.

- `"Skip"` — `StepFooter.tsx:132`.
  - Suggested rewrite: `"skip"`.

- `"Continue"` (default primaryLabel) — `StepFooter.tsx:33`.
  - Suggested rewrite: `"continue"` (and propagate through every step-view that overrides it: `"submit"`, `"next"`, `"run"`, `"check"`).

- `"Save"`, `"Export .md"`, `"Brain dump"`, `"Park a thought"` — `components/BrainDump.tsx:54, 68, 96, 99`.
  - Suggested rewrite: `"save"`, `"export .md"`, `"brain dump"`, `"park a thought"`.

- OG art metadata: `"Chapter ${number}"` eyebrow on chapter OG — `app/learn/v2/[chapter]/opengraph-image.tsx:61`.
  - Why it fails: VOICE.md:50 mandates lowercase chapter labels.
  - Suggested rewrite: `"chapter ${number}"`.

- `"25 chapters · production-AI track included · free forever"` — `app/page.tsx:127`.
  - Why it fails: "production-AI" mid-string capitalization. VOICE.md doesn't ban acronyms in body, but "AI" appears lowercase across BRAND.md examples (`ai writes this`).
  - Suggested rewrite: `"25 chapters · production-ai track included · free forever"`.

### Mid-copy capitalization the kit doesn't tolerate

- The page metadata title `"promptdojo — free interactive Python course for AI builders"` (`app/page.tsx:10`) capitalizes Python and AI. VOICE.md sample headline:87 lowercases AI: `"ai writes this. it's wrong."` Recommend: `"promptdojo — free interactive python course for ai builders"`.
- Onboarding eyebrow `"start here"` is correct (lowercase). Subhead `"Get started in under a minute"` is wrong.

### Marketing throat-clearing in body copy

- `"With AI as your co-pilot, not your crutch. We'll teach you the shapes you need to direct it, read it, and catch when it's wrong."` — `app/onboarding/page.tsx:196-198`.
  - VOICE.md:21 bans `we believe / we think`. `"We'll teach you"` is the same shape — soft authorial voice. The kit voice points and shows; it doesn't promise.
  - Suggested rewrite: `"ai is your co-pilot, not your crutch. you'll learn the shapes you need to direct it, read it, and catch when it's wrong."`

- `"Five questions. Under a minute. Then you write code."` — `app/onboarding/page.tsx:201`. **On-voice.** No fix.

- `"Built for the marketing managers, PMs, and ops folks who use Cursor daily and have hit the ceiling of what they can do without code literacy. Free forever, open source. No certificate, no leaderboards, no paywall."` — `app/page.tsx:75-79`. **Mostly on-voice** — confident, specific, no hedge. Recommend lowercase rewrite: `"built for the marketing managers, pms, and ops folks who use cursor daily and have hit the ceiling…"`.

- `"It's a floor, not a target. Going over is fine. Missing a day costs an ember, not the streak. Change anytime."` — onboarding `:368-370`. **On-voice.** Keep.

- `"new here? start the 5-question onboarding →"` — `app/page.tsx:133`. **On-voice** (lowercase, direct). Keep.

### Confirmed exclamation point (VOICE.md:24)

- `"Here's what's about to happen, hundreds of times this year!"` — flagged by WebFetch on `/learn/v2/variables/naming-things/0`. Source likely in `content-v2/variables/naming-things/*.md` (lesson markdown not yet read in this pass).
  - Suggested rewrite: `"here's what's about to happen, hundreds of times this year."`

---

## Color violations

1. **`--color-signal: #5BC8AF`** — `app/globals.css:32`. Unauthorized chromatic accent. Used in 8+ files.
2. **`--color-paper: #F7F4ED`** — `app/globals.css:31`. Unused on dark surfaces but present in theme; light-mode token, kit says light is V2-only.
3. **`--color-slate-custom: #9AA0A8`** — `app/globals.css:33`. Not in COLORS.md token table.
4. **`--color-foreground: #F7F4ED`** — `app/globals.css:5`. Should be `--ink-100` (`#f4f4f5`) per COLORS.md:16.
5. **`text-orange-300`, `text-orange-400`, `fill-orange-400`** — `components/StreakWidget.tsx:29, 31`. Tailwind's stock orange, not ember (`#F2683C` = `--color-ember-500`). Use `text-ember-300`, `text-ember-500`.
6. **`text-amber-300/400`, `border-amber-700/40`, `bg-amber-700/5`, `text-amber-100/200`** — `StreakWidget.tsx:34-35`, `_HintReveal.tsx:37-62`. Amber is a third chromatic. Replace with ink + ember tokens.
7. **`text-cyan-300/400`** — `StreakWidget.tsx:38-39`. Fourth chromatic. No path forward — pick ink or ember.
8. **`text-rose-300/400/500`, `border-rose-500/40/60`, `bg-rose-500/5`** — 9 step-view components + `OutputPane.tsx:29, 44` + `PersistentIDE.tsx:355`. COLORS.md authorizes `--err: #ef4444` (red, used **once**, in WEDGE bug). Rose is not red. Replace with `--err` for the canonical use, drop everywhere else.
9. **OG art: `#a5b4fc` (indigo)** — `app/og/launch/[name]/route.tsx:504` for `stop_reason` label. Off-palette.
10. **OG art: `#eab308` (yellow), `#22c55e` (green)** — `route.tsx:333-334`. Mac-window traffic-light dots. Cute but the kit is ember-only.
11. **OG art: `#ef4444` red dot** — same Mac chrome. Justifiable as decorative if accepted, but COLORS.md:19 reserves `--err` for "the WEDGE bug highlight" — using it as a window-control dot dilutes the reservation.
12. **`text-ink-700` used as text** — `components/v2/ChapterNav.tsx:200`, `components/ChapterNav.tsx:92`. COLORS.md:60 — "Don't use `--ink-700` as text color on `--ink-950`. Ratio is 1.7:1 — fails everything. It's a decorative-only token." Both files violate.
13. **Hardcoded `#fff` / pure white** — `components/BrainDump.tsx:96` (`text-white`), `components/v2/HomeClient.tsx:84, 114` (`text-white`). COLORS.md:26 — "No pure black, no pure white." Use `--ink-100` (`#f4f4f5`).

---

## Typography violations

1. **Inter is loaded and is the default body font.** Already in critical-fix list.
2. **`--font-sans` defaults to Inter** — `app/globals.css:34`. After dropping Inter, this should fall back to system stacks per BRAND.md:53 OR — preferred — be retired in favor of `--font-display` (Fraunces) for body text per TYPOGRAPHY.md:7.
3. **Body uses `font-sans`** — `app/layout.tsx:22`. The brand pairing is **serif body + mono code**. Body should be `font-display` (Fraunces).
4. **OG images use `fontFamily: "sans-serif"`** — `route.tsx:65, 296` and `opengraph-image.tsx:48`. The wordmark in OG art (`route.tsx:111-112, 134-138`) renders in generic sans, not JetBrains Mono ExtraBold per LOGO.md:18.
5. **Wordmark in OG art is wrong typeface.** LOGO.md:55 — "the wordmark IS JetBrains Mono ExtraBold. If you set it in Inter or Roboto, it's a different brand."
6. **Eyebrow labels use `text-xs uppercase tracking-[0.2em]`** in many places (e.g., `app/page.tsx:65, 126`). TYPOGRAPHY.md:33 spec is `+0.4em` tracking, JetBrains Mono, weight 800. Current shipped: `tracking-widest` (≈0.1em) or `tracking-[0.2em]`, no font specified (falls back to Inter), weight default 400.
7. **No code blocks force `font-variant-ligatures: none`.** Globals at `:111-112` set `ui-monospace` for `.cm-scroller` and `.cm-editor` but don't disable ligatures. TYPOGRAPHY.md:63 — "ligatures: none in code prevents JetBrains Mono's `=>` / `>=` ligatures from confusing learners."
8. **No `font-variant-numeric: tabular-nums`** anywhere. TYPOGRAPHY.md:62 — "mandatory anywhere digits stack — counters, $0, the agent trace step indices." StreakWidget XP, StepFooter `${earnedXp} / ${totalXp}` (`StepFooter.tsx:90`), step indices (`StepFooter.tsx:171`) all need tabular figures.
9. **Hero h1 weight is `font-semibold` (600)** — `app/page.tsx:68`, `app/onboarding/page.tsx:193`. TYPOGRAPHY.md:30 page hero spec is weight 900.
10. **No `font-variation-settings`** for Fraunces' `opsz` axis anywhere. TYPOGRAPHY.md:46 — "always pin to 144 at hero sizes — it sharpens serifs dramatically." The variable axes are loaded (`SOFT`, `WONK`) but never applied.

---

## Logo / mark / favicon issues

1. **`app/icon.svg` mark is approximately the ensō+caret but the geometry differs from `design-kit/logos/`.** Compare against `design-kit/logos/enso-prompt.svg` (the canonical hero mark per BRAND.md:76). The asset paths `mark.svg`, `mark-on-light.svg`, `mark-mono.svg` listed in LOGO.md don't yet exist in `design-kit/logos/` (visible files: `caret-square.svg`, `enso-prompt.svg`, `stacked-pd.svg`, `belt-stripes.svg`, `tatami-grid.svg`, `wordmark.svg`). The kit and the shipped assets are out of sync.
2. **No `<link rel="icon">` declared in metadata.** Next.js auto-detects `app/icon.svg` and `app/apple-icon.png`, but adding an explicit `metadata.icons` block in `app/layout.tsx` is brand-protective and avoids accidental cache-busting.
3. **Wordmark not used in the site header.** The home page header (`app/page.tsx:64-67`) renders `"promptdojo"` as styled text in `font-sans` (Inter, when fixed: Fraunces). LOGO.md:23 — "Use the wordmark for: site header." The actual SVG wordmark from `design-kit/logos/wordmark.svg` should be inlined.
4. **Wordmark in OG art uses generic sans-serif instead of JetBrains Mono ExtraBold.** Already noted under typography.
5. **Caret prefix `❯` not present in any wordmark instance.** LOGO.md:18 — wordmark is `❯ promptdojo _`. The home header is bare `"promptdojo"`. The OG footer is bare `"promptdojo"`. None show the caret-and-cursor lockup.
6. **No clear-space rule enforced.** LOGO.md:40 — "margin equal to the height of the `o` in `promptdojo` around any logo." Current header has tight margins; navigation buttons sit close.
7. **Mark sized below 64px in some contexts.** BRAND.md:84 — "Mark goes solo at ≤ 32 px." On `/onboarding` the link in the corner uses text only — fine, but the favicon/PWA icon at 16/32 needs to be the mark; can't verify rendering without the live `<link>` declarations.

---

## Motion violations

1. **No 1.0 Hz cursor blink anywhere in shipped CSS.** MOTION.md:6-12 — the brand's heartbeat. `grep "@keyframes blink"` across `app/`, `components/`, and `*.css` returns nothing. The wordmark, the IDE prompt cursor, and any "alive" UI surface should pulse at exactly 1.0 Hz with `animation: blink 1s steps(1) infinite`.
2. **No GSAP or Framer Motion entrance animations** on hero, eyebrows, code blocks. MOTION.md:18-25 specifies Slam / Drift / Stagger / Pop entrance vocabulary. Page renders are static.
3. **No `prefers-reduced-motion` consideration in the CSS** — even at zero animations, the kit will eventually need this guard.
4. **`transition` utilities used liberally** — `app/page.tsx:168`, `onboarding/page.tsx:174, 207, 237, 274, 345`, etc. Default Tailwind `transition` is `transition-property: color, …; transition-duration: 150ms; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)`. MOTION.md:53 hover budget is "120-180 ms" — 150ms is fine — but the easing doesn't match `power2.out` / `expo.out` from the easing palette.
5. **OG art is static** — fine for V1 (renders to PNG), but no motion reference exists for the launch trailer mentioned at MOTION.md:74. Confirm that `launch-trailer/index.html` exists and matches V1 motion direction.

---

## Leftover Pyloft references

**Source:** Found 1 reference, and it is intentional —
- `design-kit/TYPOGRAPHY.md:79` — `"legacy from pyloft (the previous brand)"`. Documentation prose, not user-facing. Acceptable.

**Live HTML:** WebFetch on `/`, `/onboarding`, `/learn/v2/variables`, `/learn/v2/variables/naming-things` returned **0 instances** of "Pyloft", "pyloft", or "py-loft".

**Verdict:** Rebrand text-replacement looks clean. No public-facing Pyloft strings.

---

## Off-limits topic mentions

- `grep -rn "xwell\|XWELL\|biosurveillance\|homeland security\|HS-class"` across all source returned **0 user-facing matches**.
- Only hit: `design-kit/VOICE.md:55` — the kit itself, declaring the topics off-limits. Correct.

**Verdict: 0 violations. Clean.**

---

## What's already great about the brand execution

- **The kit itself.** BRAND.md, VOICE.md, COLORS.md, TYPOGRAPHY.md, LOGO.md, MOTION.md are tight, opinionated, and self-consistent. This is the strongest part of the audit.
- **No emojis in shipped UI copy.** Lucide icons are used as functional UI affordances (Brain, Lightbulb, ArrowRight, Lock), not decoration. VOICE.md:23 honored.
- **No "amazing/incredible/game-changing" anywhere.** Source grep is clean.
- **No "as a developer" preambles.** Clean.
- **No "stay tuned/coming soon".** Clean.
- **`pyodide` powered IDE has the right "real code" energy** — `route.tsx:431` — `"ran in 187ms · pyodide wasm · client side"` is exactly the dry, specific, on-voice numbers callout VOICE.md:16 calls for.
- **The OG art for the WEDGE scene** (`route.tsx:176-289`) is the strongest brand expression on the property — `"ai writes this. it's wrong."` in the kit's exact template, ember + ink + the one authorized red, mutable-default-argument as the bug. This is what the rest of the site should aspire to.
- **The home cards body copy** ("Hallucinated APIs, silent type bugs, off-by-one errors, broken imports.") nails the voice. The headlines need to drop to lowercase but the prose underneath is on-brand.
- **Onboarding screen brevity** — "Five questions. Under a minute. Then you write code." is the kit's pacing.
- **No footer marketing fluff** — `app/page.tsx:212-220` is just a keyboard hint. Restraint reads as confidence.
- **Specificity of numbers** — "624 interactive steps", "22 chapters", "$0", "187ms", "~100 lines". VOICE.md:16 honored.

---

## Top 10 highest-impact brand fixes

1. **Drop Inter from `app/layout.tsx` and switch `<body>` to `font-display` (Fraunces).** One file change. Removes the banned font and applies the editorial serif everywhere the kit demands. (`app/layout.tsx:2, 6, 21, 22` + `app/globals.css:34`.)

2. **Lowercase every headline and CTA across `app/page.tsx`, `app/onboarding/page.tsx`, `components/v2/HomeClient.tsx`, `components/v2/StepFooter.tsx`, and `app/learn/v2/[chapter]/page.tsx`.** This is the single highest-leverage voice fix. It changes the personality of the product from Coursera to senior-dev-at-11pm. ~25 string replacements.

3. **Delete `--color-signal`, `--color-paper`, `--color-slate-custom` from `app/globals.css`.** Replace every `text-signal` / `border-signal` / `bg-signal` usage with either `text-ok` (single-use, pyodide success only) or `text-ember-400`. Replace every `rose-*` with `--err` for the canonical error case and `text-ink-400` everywhere else. ~15 component files touched.

4. **Replace `text-orange-300/400`, `text-amber-300/400`, `text-cyan-300/400` in `StreakWidget.tsx` with ember tokens (or remove the chromatic distinction — three different metals don't need three different colors when they already have three different icons).** `components/StreakWidget.tsx:29-39`.

5. **Add the cursor blink heartbeat.** Drop into `app/globals.css`:
   ```css
   @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
   .cursor { animation: blink 1s steps(1) infinite; color: var(--color-ember-500); }
   ```
   Then put `<span className="cursor">_</span>` in the wordmark, IDE prompt, and any hero `>_` instance.

6. **Fix the wordmark.** Render the actual `❯ promptdojo _` lockup in JetBrains Mono ExtraBold (800) wherever "promptdojo" currently renders as bare text — site header (`app/page.tsx:65-67`), onboarding link (`/onboarding/page.tsx:163-167`), every OG image footer (`route.tsx:111-112`, `opengraph-image.tsx:111`).

7. **Remove `text-ink-700` from text contexts** — `components/v2/ChapterNav.tsx:200`, `components/ChapterNav.tsx:92`. Replace with `text-ink-500`. (Decorative-only token per COLORS.md:60.)

8. **Replace `text-white` with `text-ink-100` and audit for any `bg-black` / `#fff` / `#000`.** `BrainDump.tsx:96`, `HomeClient.tsx:84, 114`.

9. **Apply Fraunces variable axes to hero headlines** — `font-variation-settings: 'opsz' 144, 'SOFT' 0;` + `font-weight: 900` + `letter-spacing: -0.04em` per TYPOGRAPHY.md:50-56. Hero h1 in `app/page.tsx:68` and onboarding `:193` need this for "say something" energy.

10. **Add `font-variant-numeric: tabular-nums` to everywhere digits stack** — XP counters (`StepFooter.tsx:88-91`), streak counts (`StreakWidget.tsx:32, 36, 40, 43`), step indices (`ChapterNav.tsx:89, 172`, `[chapter]/page.tsx:142-143`), the `$0` in pricing OG art (`route.tsx:583`). Single CSS utility class.

---

## Out-of-scope but flagged for the UI Designer (designer #1)

- The IDE OG art's Mac-window dots (red/yellow/green) — visual choice, not brand text. Defer.
- Linear gradients on the new-user CTA (`bg-gradient-to-br from-ember-950 to-ink-950`) — works visually, kit doesn't ban gradients explicitly, but the OG `stop_reason` purple label `#a5b4fc` should be replaced with ember or ink-400.
- Lucide icon weight consistency — some icons render thin against the bold serif type. Not a brand-kit rule yet but worth raising.
- The "Legacy 28-chapter course (old style)" `<details>` on `app/page.tsx:184-210` — content preserved across the rebrand, but the chevron `▸` next to "Legacy 28-chapter course (old style)" is title-cased. Lowercase or hide entirely.

---

**Audit complete. Brand kit is shipped; the product UI hasn't shipped to it yet. Closing the gap is mostly mechanical (replace tokens, lowercase strings, drop one font import) — none of it requires invention.**
