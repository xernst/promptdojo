# UI Design Audit — promptdojo

**Auditor:** UI Designer (Designer #1 of 2)
**Live target:** https://promptdojo.pages.dev
**Source:** `~/Developer/code-killa/`
**Brand kit version:** post-rebrand v1 (Pyloft → promptdojo)

---

## Snapshot of current visual state

- **Reads as a tasteful indie dev course**, not a punk-rock dev manual. Dark mode is correct, ember pulses in the right places, but the type and component personality are still in "shadcn + Tailwind defaults" territory.
- **The brand kit is loaded but barely used.** Fraunces is wired in `app/layout.tsx:7` but the home hero (`app/page.tsx:68`) and onboarding hero (`app/onboarding/page.tsx:193`) are using `font-display` at *5xl–6xl* (~48–60 px) — half the size the kit calls for, and at weight 600 not 900.
- **Inter is still loaded as a third font** (`app/layout.tsx:6`) — explicitly forbidden by the brand kit (`TYPOGRAPHY.md:79`). It silently wins because `<body>` defaults to `font-sans` (`app/globals.css:34`).
- **Zero dojo / terminal / ensō motif on the live site.** No cursor-blink heartbeat. No `❯` prompt glyph in the wordmark. No tatami pattern. No belt-stripe progress. The brand mark exists in `design-kit/logos/` but never renders in the UI.
- **Coursera-y polish creeps in via gradients and rounded-full pills** — `bg-gradient-to-br from-ember-950 to-ink-950` (`HomeClient.tsx:70,100`) and the `rounded-full bg-ember-600` arrow buttons (`HomeClient.tsx:83,113`). Reads like a SaaS marketing page, not a terminal.

---

## Drift from brand kit (with file:line refs)

### 1. Inter font still loaded as a third family — BANNED
- **Where:** `app/layout.tsx:2,6,21` (imported, instantiated, applied to `<html>`)
- **Brand kit says:** `TYPOGRAPHY.md:79` — *"Inter, Roboto, Open Sans, Lato, Poppins, Outfit, Sora. Any of these → it's not promptdojo. … when V1 rename ships, drop Inter from app/layout.tsx."*
- **Live site does:** Body inherits `font-sans` which resolves to `var(--font-inter)` via `globals.css:34`. Every paragraph, every card body, every nav label is Inter — not Fraunces.
- **Severity:** **HIGH** — this single fix probably moves the site 30% closer to brand on its own.

### 2. Hero size is half what the kit specifies
- **Where:** `app/page.tsx:68` (`text-5xl ... sm:text-6xl` ≈ 48–60 px, weight 600)
- **Brand kit says:** `TYPOGRAPHY.md:31` — Page hero = **84–110 px, weight 900, opsz 144, tracking -0.04em**.
- **Live site does:** ~60 px, weight 600, default tracking, default opsz. It looks like a "Welcome to my project" h1, not a brand statement.
- **Severity:** HIGH

### 3. Hero copy is title case
- **Where:** `app/page.tsx:69` — *"Python for AI-first builders."* / `onboarding/page.tsx:193` — *"You're going to learn Python."*
- **Brand kit says:** `BRAND.md:14` — *"All-lowercase headlines for swagger"*. `TYPOGRAPHY.md:82` — *"Title Case Headlines … smells corporate."*
- **Live site does:** Sentence case with capital P. Should be `python for ai-first builders.` or `the python you direct.`
- **Severity:** HIGH (this is a one-character edit per headline; massive ROI)

### 4. The `cursor` keyframe / heartbeat is missing entirely
- **Where:** `app/globals.css` — no `@keyframes blink` declaration anywhere.
- **Brand kit says:** `MOTION.md:9-13` — *"Ember cursor blinks at 1.0 Hz exactly — the heartbeat of the brand. `steps(1)` is intentional — a hard on/off, never a fade."*
- **Live site does:** Nothing blinks. The wordmark is static. The IDE's `> ` prompt is not present. The brand has no pulse.
- **Severity:** HIGH — this is the single defining motion in the kit

### 5. `--color-signal` (#5BC8AF teal-green) is leaking onto chapter checks and lesson links
- **Where:** `app/globals.css:32` (token defined), `ChapterNav.tsx:78,93,148,151,196` (used as success color)
- **Brand kit says:** `COLORS.md:24` — *"Ember is the only chromatic accent. No purple, cyan, neon … if a third color is tempting, the design is broken."* `COLORS.md:25` — *"`--ok` and `--err` are reserved … used once each in the canonical narrative."*
- **Live site does:** Every completed chapter, every passed step, every progress dot uses signal-teal. There are now **three** brand colors competing: ember, signal-teal, ink. That's the broken case the kit warns about.
- **Severity:** HIGH

### 6. `--color-paper` (#F7F4ED) set as `--color-foreground`
- **Where:** `app/globals.css:5` — `--color-foreground: #F7F4ED;`
- **Brand kit says:** `COLORS.md:16` — Headlines on dark = `#f4f4f5` (`--ink-100`). Never pure white, but also not warm cream.
- **Live site does:** Body text gets a subtle warm tint that fights ember. A cool-neutral ink reads sharper next to the ember orange. Paper is a magazine surface, not a terminal surface.
- **Severity:** MED

### 7. CTA buttons use `rounded-md` and small padding — generic shadcn shape
- **Where:** `app/page.tsx`, `onboarding/page.tsx:207,346,396`, `StepFooter.tsx:140`, `[chapter]/page.tsx:116`
- **Brand kit says:** Implicit from terminal/dojo aesthetic — buttons should feel like keys/tickets, not Material chips. `MOTION.md:25` calls for `back.out(1.6)` overshoot on button entrances.
- **Live site does:** `rounded-md bg-ember-500 px-5 py-2.5` — the same button you'd ship in any Vercel template. No personality.
- **Severity:** MED

### 8. Eyebrow labels use `font-sans` not mono
- **Where:** `app/page.tsx:65` (`text-xs uppercase tracking-[0.2em]`), `onboarding/page.tsx:165`, `[chapter]/page.tsx:87`
- **Brand kit says:** `TYPOGRAPHY.md:33` — Eyebrow / label = **JetBrains Mono, weight 800, +0.4em uppercase**.
- **Live site does:** Default sans (Inter), weight 400, 0.2em tracking. The mono voice never shows up except in code blocks.
- **Severity:** MED

### 9. Code blocks use external `github-dark` highlight theme
- **Where:** `[chapter]/page.tsx:5`, `ReadStepView.tsx:5` — `import "highlight.js/styles/github-dark.css"`
- **Brand kit says:** `COLORS.md` — single-accent system. Github-dark is rainbow-coded (cyan, lime, yellow, magenta).
- **Live site does:** Code blocks become a confetti of colors that fights the monochrome+ember elsewhere. Pulls the eye away from the `--err` and `--ok` reserved tokens.
- **Severity:** HIGH (every lesson page is affected)

### 10. CodeMirror uses `oneDark` (purple/cyan/blue palette)
- **Where:** `PersistentIDE.tsx:3` — `import { oneDark } from "@codemirror/theme-one-dark"`
- **Brand kit says:** Same as above — single accent, no rainbow.
- **Live site does:** The IDE — the most-looked-at surface in the entire product — is themed in someone else's brand colors. Atom's, specifically.
- **Severity:** HIGH

### 11. Streak timer / output `✓ ran in 53ms` uses `text-emerald-400`
- **Where:** `PersistentIDE.tsx:347` — `<span className="text-emerald-400">✓</span>`, also `:355` `text-rose-400` for stderr
- **Brand kit says:** `COLORS.md:19,20` — success is `--ok` (#86efac), error is `--err` (#ef4444), each used **once**.
- **Live site does:** Bypasses the brand tokens entirely and pulls Tailwind defaults. Emerald-400 ≠ ok-green. Rose-400 ≠ err-red.
- **Severity:** MED

### 12. The wordmark/logo never renders
- **Where:** `ChapterNav.tsx:56-60`, `app/page.tsx:65-66`, `onboarding/page.tsx:165` — every "logo" is the literal text `promptdojo` in CSS.
- **Brand kit says:** `LOGO.md`, `BRAND.md:75-86` — six logos exist, with explicit usage rules.
- **Live site does:** Zero of the six SVGs in `design-kit/logos/` are imported. The brand exists in the design kit but never appears in the product.
- **Severity:** HIGH

### 13. No tatami / dojo geometry anywhere
- **Where:** Nowhere. The home page is a plain max-w-6xl container.
- **Brand kit says:** `BRAND.md:80` — `tatami-grid.svg` is meant for "Pattern, repeating background."
- **Live site does:** No background pattern, no mat motif, nothing that signals "dojo."
- **Severity:** MED

---

## Component-level visual upgrades (the meat)

### Hero / Above-the-fold (`app/page.tsx:61-92`)

- **Current:** ~60 px sentence-case headline in Inter-medium, two stacked paragraphs of body, a small streak widget pinned right.
- **Issue:** Looks like a documentation README. No swagger, no cursor, no opinion. The eyebrow ("promptdojo") is the same visual weight as the body.
- **Proposed:**
  ```tsx
  <header className="relative mb-16 pt-8 sm:pt-14">
    {/* faint tatami pattern, 1.5% ember tint */}
    <div className="dojo-mat absolute inset-0 -z-10 opacity-[0.04]" />

    <div className="font-mono text-[11px] uppercase tracking-[0.42em] text-ember-500 font-extrabold">
      ❯ promptdojo<span className="cursor-blink">_</span>
    </div>

    <h1 className="mt-6 font-display text-[clamp(72px,11vw,128px)] font-black leading-[0.9] tracking-[-0.045em] text-ink-100"
        style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 0" }}>
      python for the<br/>
      <em className="italic text-ember-500">ai era</em>.
    </h1>

    <p className="mt-8 max-w-2xl font-display text-xl text-ink-300 leading-snug tracking-[-0.005em]">
      ai writes the code. you make sure it works.
    </p>
  </header>
  ```
  - Eyebrow is **JetBrains Mono 800** with the literal `❯` glyph + `_` blinking cursor — the brand mark, in text.
  - Headline is **Fraunces 900 at 100–128 px** with italic-ember on the punchword.
  - Tagline switches to Fraunces (not body sans), 20 px, ink-300.
  - Background gets a 4%-opacity tatami SVG.
- **Files to edit:** `app/page.tsx:63-83`, `app/globals.css` (add `.cursor-blink` and `.dojo-mat`)

### Resume CTA card (`components/v2/HomeClient.tsx:67-117`)

- **Current:** Gradient ember card with rounded-full play-button on the right. Reads as a Spotify CTA.
- **Issue:** The gradient + filled circle is the most generic "click me" pattern in 2025. There's no terminal energy, no dojo. The `Play` icon-in-a-circle is from every onboarding tutorial ever built.
- **Proposed:**
  - Drop the gradient. Use **flat `bg-ink-900` with a 1px `border-l-2 border-ember-500`** (left rail like a code-fold marker).
  - Replace the rounded play-circle with a **square ember key** that says `↵ continue` in JetBrains Mono — make the keyboard shortcut the visual.
  - Add an `>_` prefix on the eyebrow.
  - Hover: `border-l-4` (4px instead of 2px) + ember-tint on the bg. No transform.
- **Files to edit:** `components/v2/HomeClient.tsx:67-117`

### Chapter card grid (`app/page.tsx:136-181`)

- **Current:** 3-col grid of `bg-ink-950` rounded-lg cards with `Ch 01`, title, blurb, "12 steps · 3 lessons". Hover = ember border + slight bg shift.
- **Issue:** This is the Tailwind "Tasks" component. It's fine. It's not promptdojo. The chapter number is small mono, the title is medium sans — no scale tension. Every card is identical, which makes browsing 25 chapters feel flat.
- **Proposed:**
  - Each card becomes a **dojo mat tile**: square 1:1 aspect, NOT rounded — sharp 90° corners, 1px `border-ink-800`.
  - **Chapter number is huge** — `font-display text-7xl font-black` in `--ink-700` (decorative ghost). Title overlays at top-left at `text-base font-display`. Blurb only on hover (slide-up reveal).
  - The active/last-touched chapter gets the **ember tile** treatment: `bg-ember-950`, ember-500 number, ink-100 title. Becomes the one tile that pulls the eye — like the single ember tile in `tatami-grid.svg`.
  - Step/lesson counts move to JetBrains Mono 10px, bottom-left, `--ink-500`.
- **Files to edit:** `app/page.tsx:136-181`

### Lesson step layout (`components/v2/LessonShell.tsx`)

- **Current:** 3-pane: 240px sidebar (`bg-ink-900`) + 480-520px prompt + flexible IDE. Header strip with daily-goal dial. Footer with hint/skip/continue.
- **Issue:** Bones are right. Personality is missing. The borders are all the same `border-ink-800`. No visual rhythm. The mobile drawer toggle is a generic chevron pill.
- **Proposed:**
  - Add a **1px ember-500 top rule** at the very top of the prompt section, only when the step is graded/passing — visually marks "this step is alive."
  - The vertical divider between prompt and IDE becomes **2px wide on hover** with a 200ms ember tint — feels like a draggable rail (even if it isn't, V2).
  - Header strip: replace plain text lesson title with `❯ <chapter> / <lesson>` breadcrumb in JetBrains Mono 800 11px, ember `❯` only.
  - Mobile toggle becomes a **sharp-cornered button** with mono label `[ ⌃ prompt ]` instead of pill+icon.
- **Files to edit:** `components/v2/LessonShell.tsx:54-113`

### Code / IDE blocks (`PersistentIDE.tsx`, `[chapter]/page.tsx:5`, `ReadStepView.tsx:5`)

- **Current:** CodeMirror running `oneDark` (Atom's purple/cyan/blue). Markdown code blocks running `highlight.js/styles/github-dark.css`.
- **Issue:** **The two most-looked-at surfaces in the product use someone else's color palette.** Every code block is technically pretty and totally off-brand.
- **Proposed:** Build a tiny custom CodeMirror theme — call it `dojoTheme` — that uses ONLY:
  - bg: `--ink-950`
  - default text: `--ink-300`
  - keywords (`def`, `if`, `return`): `--ember-500`
  - strings: `--ink-100` (italic)
  - comments: `--ink-500` (italic)
  - numbers: `--ink-200`
  - operators / punctuation: `--ink-400`
  - line numbers: `--ink-700`
  - active line: `bg-ink-900`
  - selection: `bg-ember-950`
  - cursor: `--ember-500` with the 1Hz blink (`steps(1)`)
  Everything mono, ember as the only chromatic note. Read the brand goal aloud: "the only chromatic accent" — this is where it has to be true.
  Replace `highlight.js/styles/github-dark.css` with custom CSS that maps `.hljs-keyword`, `.hljs-string`, `.hljs-comment` to the same five tokens.
- **Files to edit:** `PersistentIDE.tsx:3,255`; `app/globals.css` (add full code-syntax token block); delete the `github-dark.css` import in `[chapter]/page.tsx:5` and `ReadStepView.tsx:5`.

### Run button + Output panel (`PersistentIDE.tsx:286-311, 314-359`)

- **Current:** Run button is `bg-ink-800 text-ink-100` (mono gray), only ember when running. Output panel says "press Run or use ⌘↵" with a faint dotted Loader2 spinner.
- **Issue:** The most important button on the entire page is GRAY. The brand kit literally says (`COLORS.md:42`) "ink-950 on ember for body and small UI" and (`:44`) "white text on ember … the `RUN` button." The run button should BE ember.
- **Proposed:**
  - **Run button = `bg-ember-500 text-ink-950 font-mono uppercase font-bold tracking-wider`**, sharp corners (`rounded-none` or `rounded-sm` max), with a `┃ RUN ⌘↵` label that includes a vertical-bar prefix to hint at terminal.
  - Hover: `bg-ember-400` with a 1px outset shadow in `--ember-700` (looks like a key being depressed).
  - On run: button text glitches `RUN → R█N → R▓█ → ...` for 200ms then settles. Tiny touch, real personality.
  - Output panel header: replace `<Terminal /> Output` with `❯ stdout` in JetBrains Mono, ember `❯`. The duration counter stays — but use `--ok` token, not `text-emerald-400`.
- **Files to edit:** `PersistentIDE.tsx:286-330, 347, 355`

### Step footer XP bar (`components/v2/StepFooter.tsx:93-105`)

- **Current:** A 1.5px tall bar that fills with `bg-ember-500`.
- **Issue:** It's a Mailchimp progress bar. Promptdojo's whole conceit is martial-arts ranks (`belt-stripes.svg` is in the kit).
- **Proposed:** Replace the linear bar with **3 belt stripes** stacked horizontally — each stripe lights ember as the learner crosses 33%/66%/100%. At 100%, the entire stripe block flashes ember-400 once (back.out(1.6)) and locks in.
- **Files to edit:** `StepFooter.tsx:85-106`

### Chapter sidebar (`components/v2/ChapterNav.tsx`)

- **Current:** Standard tree-view nav. Uses signal-teal for completed chapters (off-brand, see Drift §5). Lock icons for un-started steps. `bg-ink-900`.
- **Issue:** Three colors competing (ember/signal/ink). Every tree-view in 2025 looks like this.
- **Proposed:**
  - Drop signal-teal entirely. Completed chapters get a **left-edge `border-l-2 border-ember-700`** with `--ink-300` text (no green).
  - The active chapter gets `border-l-2 border-ember-500` + `bg-ink-800`.
  - Completed steps: `▰` filled square in `--ember-700` (dim ember). Active: `▰` in `--ember-500`. Untouched: `▱` outlined in `--ink-700`. (No checkmarks. No locks. Pure ASCII glyphs in mono.)
  - Header `promptdojo` becomes the actual SVG wordmark from `design-kit/logos/wordmark.svg`, sized to 18px tall. Use `<Image>` from `next/image`.
- **Files to edit:** `ChapterNav.tsx:54-60, 73-94, 188-201`

### Onboarding flow (`app/onboarding/page.tsx`)

- **Current:** Progress dots are 5 small `h-1 w-8` ember/ink-800 pills. Every screen is a card with 4 button options. Headlines are sentence-case Fraunces ~36–48px.
- **Issue:** Quizlet-quiz energy. Cards are rounded-lg. Headlines should be lowercase. Progress should feel like belt-tying.
- **Proposed:**
  - **Progress = belt stripes**: 5 horizontal stripes that fill ember as you advance. Same component as the lesson XP bar — DRY the brand motif.
  - Lowercase every headline: `you're going to learn python.` → `you're going to learn python.` (already lowercase the contraction; just lowercase the P).
  - Card options: keep the structure but **swap rounded-lg for rounded-none + 1px ink-800 border**. Selected state goes from "ember-500 border" to "**inset 4px ember-500 left rail**" — the exact same code-fold motif as Resume CTA. One pattern, used three times.
  - Welcome screen: add `❯_` cursor prefix above the headline in mono ember.
- **Files to edit:** `app/onboarding/page.tsx:170-180, 193, 207, 225, 261, 301, 365, 396`

### Footer (`app/page.tsx:212-220`)

- **Current:** A `border-t border-ink-800 pt-6 text-xs text-ink-600` strip with a `⌘⇧B` hint and a `<kbd>` element.
- **Issue:** Wasted real estate. Promptdojo is a *terminal*. The footer should look like a status bar.
- **Proposed:** Reframe as a **vim/tmux-style status bar**: `bg-ink-900`, full-width, `font-mono text-[11px]`, with sections separated by `│`.
  ```
  ❯ promptdojo  │  free forever  │  open source  │  ⌘⇧B park a thought  │  v1.0
  ```
  Ember `❯`, ink-500 separators, ink-300 labels. Sticks to the viewport bottom on the home page only.
- **Files to edit:** `app/page.tsx:212-220`

---

## System-level upgrades

### Spacing scale

Current code uses Tailwind defaults (4-8-12-16-24...). Keep it, but **codify three section rhythms**:
- `space-y-3` (12px) — within a card
- `space-y-8` (32px) — between cards
- `space-y-24` (96px) — between page sections

The home page currently mixes `mt-12 / mt-16` indiscriminately (`page.tsx:124, 184, 212`). Pick `mt-24` for major section breaks. Air = swagger.

### Type scale (concrete)

Replace Tailwind's `text-5xl / text-6xl` with hard-coded brand tokens in `globals.css`:

```css
.t-hero    { font: 900 clamp(72px, 11vw, 128px)/0.9 var(--font-display); letter-spacing: -0.045em; font-variation-settings: "opsz" 144; }
.t-section { font: 800 clamp(44px, 5vw, 64px)/1.0 var(--font-display); letter-spacing: -0.025em; }
.t-h2      { font: 700 32px/1.15 var(--font-display); letter-spacing: -0.02em; }
.t-h3      { font: 600 22px/1.3 var(--font-display); letter-spacing: -0.01em; }
.t-body    { font: 400 18px/1.55 var(--font-display); letter-spacing: -0.005em; }
.t-body-sm { font: 400 15px/1.55 var(--font-display); }
.t-eyebrow { font: 800 11px/1 var(--font-mono); letter-spacing: 0.42em; text-transform: uppercase; }
.t-mono-sm { font: 500 12px/1.4 var(--font-mono); }
.t-code    { font: 400 14px/1.55 var(--font-mono); font-variant-ligatures: none; }
```

Then rewrite hero/h1/h2/eyebrow uses to point at these classes. Single source of truth, kit-aligned, no drift possible.

### Motion language

Add to `globals.css`:

```css
@keyframes blink-1hz { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
.cursor-blink { animation: blink-1hz 1s steps(1) infinite; }

@keyframes ember-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(242,104,60,0); } 50% { box-shadow: 0 0 0 6px rgba(242,104,60,0.18); } }
.ember-pulse { animation: ember-pulse 2.4s ease-in-out infinite; }

/* hover transitions — never longer than 180ms, per MOTION.md */
.dojo-hover { transition: border-color 140ms ease-out, background-color 140ms ease-out, color 140ms ease-out; }
```

Rules:
- Cursor blink = `1s steps(1)` always. No exceptions.
- Hover transitions = 120–180ms (`MOTION.md:55`). Audit `transition-[width] duration-300` in `StepFooter.tsx:103` — slow it ONLY because it's a progress bar.
- Button entrances = `back.out(1.6)` overshoot via GSAP, but only on first paint, not on hover.
- Banned: `bounce`, `elastic`, `linear` (except infinite ambient).

### Component personality (what makes a button feel promptdojo)

Promptdojo button = a **terminal key**, not a chip:
- Sharp corners (`rounded-none` or `rounded-sm` only)
- Mono uppercase label with letter-spacing
- 1px outset shadow in `--ember-700` so it looks pressable
- Optional `[⌘↵]` kbd-style suffix in mono
- Hover: shadow shrinks (key depresses)
- Active: shadow disappears + 1px translate-y

A promptdojo card = a **dojo mat tile**:
- Square or strongly rectangular
- 90° corners
- 1px ink-800 border
- Single accent on hover: left-rail ember-500 stripe (the code-fold marker)
- No gradients, no shadows on the card itself

A promptdojo input = a **terminal prompt line**:
- `❯ ` prefix glyph in ember-500
- Bottom border only (no full border box)
- Mono font for the input value (Fraunces for the label)
- Caret = ember, blinking 1Hz

### Empty states / loading states / error states

Currently neglected. Recommendations:

**Pyodide booting** (`PersistentIDE.tsx:84`) — *"Booting Python (one-time, ~5s)…"*: replace with an animated terminal init log:
```
❯ booting pyodide
❯ loading interpreter…
❯ stdlib ✓
❯ ready_
```
Lines stagger in over the 5s boot, last line has the blinking cursor. Currently it's a Loader2 spinner — boring, generic.

**Empty output panel** (`PersistentIDE.tsx:337-340`): currently `Run your code to see output here.` in italic ink-600. Replace with an ASCII prompt:
```
[promptdojo:~]$ _
```
Mono, ink-500, blinking cursor. Reads as terminal idle, not a hint.

**Error states**: when `stderr` is non-empty (`PersistentIDE.tsx:354`), surround the error block with a **left-rail `border-l-2 border-err`** + `bg-err/4` tint, mono. Currently it's just rose-400 text — no visual frame.

**404 / not-found page** (does not exist in source): create `app/not-found.tsx`:
```
404 ─ page not found

❯ try `/` or `/learn`_
```
Hero-sized Fraunces "404", mono prompt below.

### Code-block syntax tokens

Replace github-dark + oneDark with promptdojo-mono palette:

```css
/* prose code blocks (rehype-highlight) */
.hljs                 { background: var(--color-ink-950); color: var(--color-ink-300); }
.hljs-keyword         { color: var(--color-ember-500); font-weight: 600; }
.hljs-string          { color: var(--color-ink-100); font-style: italic; }
.hljs-comment         { color: var(--color-ink-500); font-style: italic; }
.hljs-number          { color: var(--color-ink-200); }
.hljs-built_in,
.hljs-title.function_ { color: var(--color-ember-300); }
.hljs-params,
.hljs-variable        { color: var(--color-ink-300); }
.hljs-operator,
.hljs-punctuation     { color: var(--color-ink-400); }
```

One accent. Italic for strings/comments (the only personality). Mono everywhere.

---

## What I'd cut

- **Inter font import.** `app/layout.tsx:6` — banned by the kit.
- **`--color-foreground: #F7F4ED`** (paper). `app/globals.css:5` — switch to `#f4f4f5` (`--ink-100`).
- **`--color-signal: #5BC8AF`** (teal-green). `app/globals.css:32` — and every reference in `ChapterNav.tsx`. Three colors break the brand.
- **`oneDark` CodeMirror theme.** `PersistentIDE.tsx:3` — replace with custom dojoTheme.
- **`highlight.js/styles/github-dark.css`.** `[chapter]/page.tsx:5`, `ReadStepView.tsx:5` — replace with custom syntax tokens.
- **All `text-emerald-400` and `text-rose-400`.** `PersistentIDE.tsx:347,355`; `MultipleChoiceStepView.tsx:98,134,143`; etc. Use `--ok` and `--err` tokens.
- **The `from-ember-950 to-ink-950` gradients.** `HomeClient.tsx:70,100` — flat ember-950 with a left rail does the same job without the SaaS sheen.
- **Rounded-full play-button circles.** `HomeClient.tsx:83,113` — replace with sharp ember `↵ continue` keys.
- **The `▸` triangle on the legacy course details summary.** `app/page.tsx:187` — replace with `❯` to keep the prompt motif consistent.
- **Lock icons on un-started steps.** `ChapterNav.tsx:200` — they imply paywall. Use `▱` outlined square instead.
- **Generic "Welcome back" copy** in HomeClient — covered by Brand Guardian, but visually replace `welcome back` eyebrow with `❯ resume`.
- **The `fill-white` Play icon.** `HomeClient.tsx:114` — white-on-ember at 20px fails the kit's 24px+ minimum (`COLORS.md:41`). Either size up or switch to ink-950.

---

## Top 8 changes ranked by visual ROI

1. **Drop Inter and route every non-mono surface through Fraunces.** One file (`app/layout.tsx:6`), site-wide impact. Brand goes from 30% to 65% on its own. (DRIFT §1)
2. **Replace oneDark + github-dark with a custom dojoTheme using only ember + ink.** The IDE and every code block become brand-aligned in one stroke. The site is 60% code blocks; this is the highest-leverage single change. (DRIFT §9, §10)
3. **Resize the home hero to 100–128px, weight 900, lowercase, with `❯_` mono eyebrow above.** The hero is the first 1.5 seconds. Right now it whispers. Should slam. (DRIFT §2, §3)
4. **Add the 1Hz blinking cursor to the wordmark, the Resume CTA, and the IDE prompt.** Brand heartbeat = literal heartbeat. Without it the brand has no pulse. (DRIFT §4)
5. **Kill `--color-signal`. Recolor every "completed" affordance with dim-ember (`--ember-700`).** Restores the single-accent rule. Sidebar suddenly looks intentional. (DRIFT §5)
6. **Make the Run button ember + sharp corners + mono.** The most-pressed button in the product currently looks like every other gray button on the internet. Should be the ember statement piece. (Component upgrades §IDE)
7. **Render the actual SVG wordmark in the sidebar header and home eyebrow** instead of typing the word `promptdojo` in CSS. Six logos exist; ship one. (DRIFT §12)
8. **Replace the linear XP progress bar with the 3-stripe belt motif.** Cheap to build, instantly legible as "promptdojo and not Coursera." (Component upgrades §StepFooter)

---

**Auditor notes:** Brand kit alignment goes from ~30% (current) to ~85% if changes 1–4 ship. Changes 5–8 take it to ~95% — at that point the only remaining drift is illustration/photography (V2 territory). Total estimated effort: 1.5 days for changes 1–4, +1 day for 5–8. No backend, no schema, no architecture touched — pure CSS, font config, and component JSX edits.
