# Promptdojo Launch Trailer V2 — STORYBOARD

> Senior Dev: implement `index.html` directly from this. Every timing, easing, word, and pixel position is locked. The V0 trailer at `~/Developer/code-killa/launch-trailer/index.html` is the canonical reference for HyperFrames patterns — this storyboard is a direct evolution: green palette, JetBrains Mono, +1 scene (CURRICULUM), +2 real product captures.

---

## Composition globals

- **Stage:** `data-composition-id="trailer"` · `data-width="1920"` · `data-height="1080"` · `data-duration="30"`.
- **Total runtime:** 30.0s. Final fade-to-black completes by 30.0s.
- **Scene count:** 6. Five inter-scene transitions, each 0.4s.
- **Scene durations (locked):** HOOK 5.0s · WEDGE 6.0s (earns the punchline beat) · IDE 5.0s · CURRICULUM 5.0s · CAPSTONE 5.0s · PRICE 4.0s. Sum: 30.0s.
- **Primary transition:** 0.4s crossfade `power2.inOut`. Used between scenes 1→2, 3→4, 4→5, 5→6.
- **Accent transition:** ONE push-cut at WEDGE → IDE (scene 2 → 3). Right-to-left horizontal push, 0.35s, `power3.inOut`. See "Open creative decision 3" below for the argument.
- **Persistent layers (live across all scenes):** `bg-grid`, `bg-glow`, `bg-noise`, `corner-mark`, `footer-wordmark`. Only the PRICE scene exits them.
- **Cursor heartbeat:** 1.0 Hz `steps(1)` blink in HOOK (full prominence) and CURRICULUM (subtle, on the URL chip in the page-frame chrome). Defined in CSS `@keyframes blink`, applied via class — NOT tweened in GSAP, so it runs deterministically and continues even while a scene is breathing.
- **Determinism:** no `Math.random()`, no `Date.now()`. The number tickers in CURRICULUM use GSAP `to(obj, { value: N, snap: 1 })` driven off the timeline.

### Color tokens (CSS custom properties at `:root`)

```
--ink-950: #14140f   /* primary background */
--ink-900: #18181b   /* card / panel fill */
--ink-800: #27272a   /* hairline borders, dividers */
--ink-700: #3f3f46   /* muted UI, deeper dividers */
--ink-400: #9c9c93   /* secondary text — V2 brief override of #a1a1aa */
--ink-300: #d4d4d8   /* body text on dark */
--ink-100: #fafaf7   /* headlines on dark — V2 brief override of #f4f4f5 */
--green-500: #2aa06a /* primary accent — only chromatic accent on dark */
--green-700: #1f7a51 /* hover/active green-dim */
--mint-300: #6ee7b7  /* success — used once, in the IDE output meta line */
--coral-500: #e4573c /* error — used once, in the WEDGE bug line */
--ink-cursor: #2aa06a /* cursor color */
```

### Typography stack

- **Display:** `'Fraunces', serif` · `font-variation-settings: 'opsz' 144, 'wght' 900, 'SOFT' 0` · tracking `-0.04em` at 60px+.
- **Mono:** `'JetBrains Mono', ui-monospace, monospace` · `font-variant-ligatures: none` on all code surfaces.
- **Numerics:** `font-variant-numeric: tabular-nums` mandatory on `.num` (the `$0`, the CURRICULUM tickers, the lesson-step "1/12" badge).

### Persistent layer ambient motion

```
bg-glow: scale 0.92 → 1.08, opacity 0.7 → 1.0, duration 14, ease sine.inOut, yoyo, repeat 1
         (yoyo ends at t=28 — 2s buffer before final fade at t=29)
         glow color: radial-gradient(circle, rgba(42,160,106,0.20), rgba(42,160,106,0) 60%)
corner-mark: from { opacity: 0, scale: 0.6 }, duration 0.7, ease back.out(1.6), at t=0.4
footer-wordmark: from { opacity: 0, y: 10 }, duration 0.6, ease power2.out, at t=0.6
```

The bg-grid uses the green tint: `rgba(42,160,106,0.04)` 80px × 80px. The bg-noise stays neutral white at 4% opacity.

### Footer wordmark (every scene)

```
right: 56px, bottom: 48px
JetBrains Mono 800, 22px, letter-spacing 0.02em, color #d4d4d8
[caret #2aa06a] [promptdojo] [/ promptdojo.dev #9c9c93 weight 400]
```

### Corner mark (every scene)

`left: 56px, top: 56px, 88×88px`. Same enso-arc + `>_` SVG as V0, stroke `#2aa06a`. The `>_` glyph stays `#fafaf7`.

---

## Scene 1 — HOOK

**Duration:** 5.0s (start: 0.0s → end: 5.0s)
**Energy:** medium (calm with confidence — the brand intro)
**Outgoing transition:** crossfade, 0.4s, `power2.inOut`, fires at t=4.6 → 5.0

### Layout (the hero frame)

```
.s1 .scene-content {
  padding: 200px 160px;       /* lead-the-eye-left, generous top */
  justify-content: center;
  flex-direction: column;
  gap: 36px;
}

.s1 .eyebrow {
  font: JetBrains Mono 800, 24px;
  letter-spacing: 8px; text-transform: uppercase;
  color: var(--green-500);   /* #2aa06a */
}

.s1 .wordmark {
  font: JetBrains Mono 900, 240px;
  letter-spacing: -0.06em; line-height: 0.95;
  color: var(--ink-100);     /* #fafaf7 */
}
.s1 .wordmark .caret { color: var(--green-500); margin-right: 28px; }
.s1 .wordmark .cursor {
  display: inline-block;
  width: 64px; height: 16px;
  background: var(--green-500);
  margin-left: 18px; vertical-align: 32px;
  border-radius: 2px;
  animation: blink 1s steps(1) infinite;   /* CSS, not GSAP */
}

.s1 .tagline {
  font: Fraunces 400, 56px;
  font-variation-settings: 'opsz' 144, 'wght' 400;
  letter-spacing: -0.025em; line-height: 1.15;
  color: var(--ink-300);     /* #d4d4d8 */
  max-width: 1100px;
}
.s1 .tagline em {
  font-style: italic;
  font-variation-settings: 'opsz' 144, 'wght' 600;
  color: var(--ink-100);
}
```

### Choreography (entrances, in timeline order)

- t=0.20: `#s1-eyebrow` — `from { y: 28, opacity: 0 }`, 0.6s, `power3.out`.
- t=0.45: `#s1-wordmark` — slam. `from { y: 80, opacity: 0, scale: 1.04 }`, 0.9s, `expo.out`. (Slowest entrance — establishes weight.)
- t=1.10: `#s1-cursor` — wipe. `from { scaleX: 0, transformOrigin: "left center" }`, 0.4s, `power4.out`. CSS `@keyframes blink` takes over after.
- t=1.10: `#s1-tagline` — drift. `from { y: 36, opacity: 0 }`, 0.7s, `power2.out`. (Intentional overlap with wordmark — tagline arrives as wordmark settles.)

### Copy (locked)

- **Eyebrow:** `shipping summer 2026`
- **Wordmark:** `❯ promptdojo _` (caret + word + cursor block)
- **Tagline:** `a python school for builders <em>whose code is mostly written by ai now.</em>`

### Risks / notes

- Wordmark at 240px: measured ≈1562px wide including cursor; fits in 1920 − 320 padding. Comfortable.
- `❯` is U+276F. If font lacks glyph at 900, fall back to weight 700 inline `<span>` on that glyph only.
- Verify in render: cursor blink is hard on/off (no fade). A fade means CSS got overridden.

---

## Scene 2 — WEDGE

**Duration:** 6.0s (start: 5.0s → end: 11.0s)
**Energy:** high (the punchline, the indictment)
**Outgoing transition:** push-cut, 0.35s, `power3.inOut`, fires at t=10.65 → 11.0. Right-to-left direction (see decision 3).

### Layout (the hero frame)

Two-column split, lead-eye-left on copy, code right. Inherit V0 `.s2` CSS verbatim with V2 overrides:

- `.s2 .scene-content` padding 140px 120px, row, gap 96px, align center.
- `.s2 .eyebrow` JetBrains Mono 800 20px, letter-spacing 6px, uppercase, color `--green-500`.
- `.s2 h2` margin 0, Fraunces 900 132px, `'opsz' 144, 'wght' 900`, tracking -0.045em, line-height 0.92, color `--ink-100`.
- `.s2 h2 .punch` display:block, italic, `'opsz' 144, 'wght' 800`, color `--green-500` (the green italic punchline).
- `.s2 .annotation` margin-top 28px, JetBrains Mono 400 26px, line-height 1.4, color `--ink-400`, max-width 600px. `.err` color `--coral-500` weight 800.
- `.s2 .right` width 760px.
- `.s2 .code-block` bg `--ink-900`, border 1px `--ink-800`, radius 14px, padding 24px 28px, JetBrains Mono 400 28px, line-height 1.55, ligatures none.
- `.s2 .code-block .filename` color `--ink-400`, 16px, letter-spacing 3px, uppercase, weight 800, margin-bottom 14px.
- `.s2 .code-line` color `--ink-300`, white-space pre. `.kw` color `--green-500`.
- `.s2 .code-line.bug` color `--coral-500`, background `rgba(228,87,60,0.14)`, margin 0 -8px, padding 2px 8px, radius 4px.

### Choreography (entrances, in timeline order)

Build 0–2.5s · breathe 2.5–5.0s · resolve 5.0–6.0s (held for push-cut).

- t=5.10: `#s2-eyebrow` — drift left. `from { x: -40, opacity: 0 }`, 0.5s, `power3.out`.
- t=5.30: `#s2-line1` — slam. `from { y: 60, opacity: 0 }`, 0.6s, `expo.out`.
- t=5.40: `#s2-code` — drift from right. `from { x: 100, opacity: 0 }`, 0.7s, `power3.out`.
- t=5.55: `#s2-line2` ("it's wrong.") — slam + scale. `from { y: 60, opacity: 0, scale: 1.08 }`, 0.6s, `expo.out`. (The italic-green punchline overshoots — scale is the visual exclamation the copy refuses to use.)
- t=5.90: `#s2-l1..#s2-l6` — `from { x: 24, opacity: 0 }`, 0.35s, `power2.out`, stagger 0.08.
- t=7.00: `#s2-l3` coral wash. `fromTo({ bg: "rgba(228,87,60,0)" }, { bg: "rgba(228,87,60,0.14)", duration: 0.5, ease: "power2.inOut" })`. Text is already coral via static class — the wash is the delayed verdict.
- t=7.60: `#s2-annotation` — pop. `from { y: 24, opacity: 0 }`, 0.6s, `back.out(1.2)`.

### Copy (locked)

- **Eyebrow:** `chapter 07 · mutation and state`
- **Headline (h2):**
  - Line 1 (white, no italic): `ai writes this.`
  - Line 2 (green italic, `<span class="punch">`): `it's wrong.` (use `&rsquo;` for the apostrophe)
- **Annotation (mono):**
  - First line, coral 800: `mutable default argument.`
  - Break, then ink-400 400: `python evaluates the list once at definition, so every caller mutates the same list.`
- **Code block** (mono 28px, `cursor.py` filename):
  ```
  def collect_errors(
      msg: str,
      bag: list = []          ← line 3, coral wash, .bug class
  ):
      bag.append(msg)
      return bag
  ```
  - `def` and `return` are `.kw` green. The rest of the text on lines 1–2 and 4–6 is `--ink-300`. Line 3 is fully coral with the coral background wash.

### Risks / notes

- Coral-500 appears ONLY in scene 2 (annotation `.err` text + line 3 wash). Don't bleed elsewhere.
- Fraunces 900 italic at 132px needs `'opsz' 144, 'wght' 800` or glyphs feel rounded.
- At t=10.65 push-cut starts: scene must be fully visible (no element exits). Bug wash + annotation static from t=8.2 → t=10.65 = breathe.

---

## Scene 3 — IDE

**Duration:** 5.0s (start: 11.0s → end: 16.0s)
**Energy:** high (the reveal — this is real, this runs)
**Incoming transition:** push-cut from scene 2 (right-to-left, 0.35s, `power3.inOut`)
**Outgoing transition:** crossfade, 0.4s, `power2.inOut`, fires at t=15.6 → 16.0

### Layout (the hero frame)

The screenshot is the hero. Copy is a small overhead band; the IDE dominates.

```
.s3 .scene-content {
  padding: 100px 200px 120px;
  display: grid;
  grid-template-rows: auto auto 1fr;     /* eyebrow / headline / screenshot */
  row-gap: 28px;
  align-content: start;
}

.s3 .eyebrow {
  font: JetBrains Mono 800, 20px;
  letter-spacing: 6px; text-transform: uppercase;
  color: var(--green-500);
}

.s3 h2 {
  margin: 0;
  font: Fraunces 900, 84px;
  font-variation-settings: 'opsz' 144, 'wght' 900;
  letter-spacing: -0.04em; line-height: 0.95;
  color: var(--ink-100);
  max-width: 1200px;
}

.s3 .ide-card {
  position: relative;
  margin: 0 auto;
  width: 1480px;                         /* hero region only, < frame width */
  max-width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: var(--ink-900);
  border: 1px solid var(--ink-800);
  perspective: 2000px;
  /* The 3D tilt is applied to the inner image via transform.
     The drop-shadow lives on the card so it stays sharp. */
  filter: drop-shadow(0 40px 80px rgba(0,0,0,0.55))
          drop-shadow(0 8px 24px rgba(42,160,106,0.18));
}
.s3 .ide-card img {
  display: block;
  width: 100%; height: auto;
  transform-origin: center center;
  /* Default rest pose — GSAP overrides during entrance/breathe */
  transform: perspective(2000px) rotateY(-6deg) rotateX(2deg) scale(1.0);
}

/* Subtle URL-chip cursor blink baked into HyperFrames overlay */
.s3 .url-chip-cursor {
  display: inline-block;
  width: 10px; height: 18px;
  background: var(--green-500);
  vertical-align: -3px; margin-left: 6px;
  animation: blink 1s steps(1) infinite;
}
```

> **Note for Senior Dev:** The chrome (red/yellow/green dots, URL bar, RUN button) is BAKED INTO `assets/lesson-ide.png`. The Evidence Collector captures the live `/learn/v2/...` page including the lesson chrome. The HyperFrames-side overlay only adds the cursor-blink chip on top of the URL portion if the screenshot doesn't already include a blinking cursor — see "Real asset placement" below.

### Choreography (entrances, in timeline order)

Decision 1 (camera): screenshot starts at scale 0.94 with the tilt and scales to 1.0 over the build, then breathes.

- t=11.10: `#s3-eyebrow` — `from { y: 24, opacity: 0 }`, 0.5s, `power2.out`.
- t=11.25: `#s3-headline` — slam. `from { y: 40, opacity: 0 }`, 0.55s, `expo.out`.
- t=11.50: `#s3-ide-card` — slam from below. `from { y: 90, opacity: 0 }`, 0.85s, `expo.out`.
- t=11.50: `#s3-ide-img` (inner) — `fromTo({ scale: 0.94, rotateY: -10, rotateX: 4 }, { scale: 1.0, rotateY: -6, rotateX: 2, duration: 1.1, ease: "power3.out" })`. Tilt rests at -6°/2°, never flat.
- t=12.50 → t=15.5: **breathe.** `rotateY: -6 → -7.5 → -6`, 3.0s, `sine.inOut`, yoyo×1. ~1.5° amplitude.
- t=12.20: `#s3-url-chip-cursor` overlay — wipe. `from { scaleX: 0, transformOrigin: "left center" }`, 0.3s, `power3.out`. CSS blink takes over.

### Copy (locked)

- **Eyebrow:** `chapter 13 · llm apis`
- **Headline:** `no installs. no venv. no setup.`

(No body, no caption. The headline does the work; the screenshot is the proof.)

### Real asset placement

```
File:    assets/lesson-ide.png
Source:  https://promptdojo.pages.dev/learn/v2/.../0  (Pyodide loaded, dojoTheme green)
Capture: 1920px wide, hero region only — IDE pane + lesson title above (no site chrome,
         no nav, no footer). Tight crop: 1920×1080 lesson body.
Placed:  centered, 1480px display width, top-aligned within the 1fr grid row.
Tilt:    perspective(2000px) rotateY(-6deg) rotateX(2deg) at rest. Never flat.
Shadow:  filter: drop-shadow(0 40px 80px rgba(0,0,0,0.55))
                drop-shadow(0 8px 24px rgba(42,160,106,0.18));
         The green-tinted secondary shadow bonds the card to the brand glow without
         turning into a colored glow halo.
Overlay: NONE in HyperFrames text — the screenshot already contains the chapter title,
         the IDE pane with code, the RUN button, and the output area in the live
         dojoTheme. The only HyperFrames-rendered element is the optional URL-chip
         cursor blink (a 10×18 green block at 1.0 Hz steps(1)) positioned over the
         end of the URL bar in the screenshot — coordinates determined per-capture.
```

> **If Evidence Collector's capture already shows a live cursor blink on the URL bar, drop the overlay entirely.** The HyperFrames cursor is a fallback for static captures.

### Risks / notes

- Tilt is left-leaning (`rotateY: -6deg`) — viewer sees the LEFT face, flush with lead-eye-left pattern. Right-tilt would fight the corner-mark.
- Two-stack drop-shadow: if the green tint reads as "leaking" rather than "brand glow," drop the second shadow opacity from 0.18 to 0.10.
- If the screenshot's chapter band is light, verify headline contrast against the band beneath it. Pyodide pane is dark green-on-ink, so this should be fine.

---

## Scene 4 — CURRICULUM (NEW)

**Duration:** 5.0s (start: 16.0s → end: 21.0s)
**Energy:** medium (the proof of scope — this is a real curriculum)
**Outgoing transition:** crossfade, 0.4s, `power2.inOut`, fires at t=20.6 → 21.0

### Layout (the hero frame)

Split frame: tight vertical strip on the left holds the eyebrow + headline + 3-stat ticker row; the curriculum-tree screenshot occupies the right ~58% of the frame in a tall portrait orientation, masked to a viewport that lets the page rise through it.

```
.s4 .scene-content {
  padding: 100px 120px;
  display: grid;
  grid-template-columns: 720px 1fr;
  column-gap: 80px;
  align-items: center;
}

.s4 .left { display: flex; flex-direction: column; gap: 32px; }

.s4 .eyebrow {
  font: JetBrains Mono 800, 20px;
  letter-spacing: 6px; text-transform: uppercase;
  color: var(--green-500);
}

.s4 h2 {
  margin: 0;
  font: Fraunces 900, 92px;
  font-variation-settings: 'opsz' 144, 'wght' 900;
  letter-spacing: -0.04em; line-height: 0.95;
  color: var(--ink-100);
}
.s4 h2 .num-strong {                       /* the "25 / 5 / 624" inside the headline */
  color: var(--green-500);
  font-variant-numeric: tabular-nums;
}

.s4 .stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 8px;
  border-top: 1px solid var(--ink-800);
  padding-top: 28px;
}
.s4 .stat-num {
  font: Fraunces 900, 96px;
  font-variation-settings: 'opsz' 144, 'wght' 900;
  letter-spacing: -0.04em; line-height: 1;
  color: var(--ink-100);
  font-variant-numeric: tabular-nums;
}
.s4 .stat-label {
  margin-top: 8px;
  font: JetBrains Mono 800, 14px;
  letter-spacing: 3px; text-transform: uppercase;
  color: var(--ink-400);
}

.s4 .right {
  position: relative;
  height: 880px;                            /* the viewport */
  border-radius: 16px;
  overflow: hidden;
  background: var(--ink-900);
  border: 1px solid var(--ink-800);
  filter: drop-shadow(0 32px 64px rgba(0,0,0,0.5));
}
.s4 .scroll-rail {
  position: absolute;
  left: 0; right: 0; top: 0;
  /* The image is taller than the viewport on purpose. We translate it upward over time. */
}
.s4 .scroll-rail img {
  display: block;
  width: 100%; height: auto;
}

/* Midline pulse — a thin green hairline that sits across the viewport center.
   When a phase-band crosses it (visually), it pulses. */
.s4 .midline {
  position: absolute;
  left: 0; right: 0; top: 50%;
  height: 1px;
  background: rgba(42,160,106,0.0);
  pointer-events: none;
}

/* Subtle URL-chip cursor blink on the page-frame chrome (top-right of viewport) */
.s4 .url-chip-cursor {
  position: absolute;
  top: 26px; right: 32px;
  width: 8px; height: 14px;
  background: var(--green-500);
  animation: blink 1s steps(1) infinite;
  opacity: 0.7;
}
```

### Choreography (entrances, in timeline order)

Decision 2: page rises during the breathe at 155 px/s. Phase-band borders pulse green at the midline (3 pulses).

- t=16.10: `#s4-eyebrow` — `from { y: 24, opacity: 0 }`, 0.5s, `power2.out`.
- t=16.50: `#s4-headline` — slam. `from { y: 40, opacity: 0 }`, 0.55s, `expo.out`.
- t=16.70: `#s4-right` panel — drift from right. `from { x: 80, opacity: 0 }`, 0.7s, `power3.out`.
- t=17.10: stat-num × 3 — `from { opacity: 0, y: 18 }`, 0.4s, `power2.out`, stagger 0.12.
- t=17.10: stat-label × 3 — same stagger, +0.05s offset.
- t=17.50: **number tick-up.** Three GSAP counter tweens (start t=17.50, end ≤ t=19.10):
  - `to({v:0}, {v:25, duration:1.4, ease:"power2.out", snap:{v:1}, onUpdate})`
  - `to({v:0}, {v:5,  duration:1.0, ease:"power2.out", snap:{v:1}, onUpdate})`
  - `to({v:0}, {v:624,duration:1.6, ease:"power2.out", snap:{v:1}, onUpdate})`
- t=17.10 → t=20.6: **scroll-tease.** `fromTo("#s4-scroll-rail", { y: 0 }, { y: -540, duration: 3.5, ease: "power1.inOut" })`. = ~155 px/s.
- t=17.30, 18.40, 19.50: **midline pulse.** Each: `fromTo("#s4-midline", { backgroundColor: "rgba(42,160,106,0.0)", boxShadow: "none" }, { backgroundColor: "rgba(42,160,106,0.45)", boxShadow: "0 0 12px rgba(42,160,106,0.6)", duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 })`. 0.36s round trip.
- t=18.20: `#s4-url-chip-cursor` — `from { opacity: 0 }` to 0.7, 0.4s, `power2.out`. CSS blink already running (subtle, per brief).

### Copy (locked)

- **Eyebrow:** `the curriculum`
- **Headline:** `25 chapters. 5 phases. 624 interactive steps.` — set as a single h2, all lowercase, Fraunces 900 92px. The numbers `25`, `5`, `624` sit inside `<span class="num-strong">` and are colored `--green-500` with `tabular-nums`.
- **Stat row** (under the hairline border, three columns):
  - Column 1: `25` / `chapters`
  - Column 2: `5` / `phases`
  - Column 3: `624` / `steps`

> **Why both the headline and the stat row carry the numbers:** the headline is the spoken claim. The stat row is the receipt — three giant green digits ticking up from zero, in the same frame, behind the headline that just made the claim. The viewer hears the claim (eye reads headline) and sees the proof (eye snaps to ticker). It's the brief's "tabular-nums tick-up" requirement; without the stat row there's no canvas for it.

### Real asset placement

```
File:    assets/curriculum-tree.png
Source:  https://promptdojo.pages.dev/curriculum/  (phase-banded chapter map)
Capture: 1920px wide × FULL HEIGHT — capture the entire phase-banded chapter map,
         not just the hero region. Evidence Collector should grab the full
         scrollable curriculum page (likely 2400–3200px tall) so we have ~540px
         of vertical travel beyond the viewport.
Placed:  Inside `.s4 .right`, which is 720×880px. The image is set to width:100% so
         it inherits 720px, then becomes whatever height aspect dictates (e.g.
         720 × 3.5 ≈ 2520px tall). Initial offset: y=0 (top of image visible).
         Final offset: y=-540 (panel rises 540px during breathe).
Tilt:    NONE. The page is flat, web-frame style. The motion sells it, not 3D.
Shadow:  drop-shadow(0 32px 64px rgba(0,0,0,0.5)). No green tint here — the
         IDE scene already used the green-tinted shadow as its signature.
Overlay: HyperFrames-side overlays are: the green hairline midline, the URL-chip
         cursor blink at top-right of the panel, the panel border-radius mask.
         Everything else (phase labels, chapter rows, the "phase 1: pythonic
         beginnings" band) is BAKED INTO the screenshot.
```

### Risks / notes

- **The number 624 is load-bearing.** Verify against `/curriculum/` at capture time. If live count differs, update headline AND stat-row col-3. The trailer must not lie.
- Midline hairline is invisible at rest (alpha 0). Pulse is 0.36s — verify it reads as a flash, not a permanent divider.
- If `assets/curriculum-tree.png` not yet captured, build with a placeholder dark panel; choreography is asset-independent.

---

## Scene 5 — CAPSTONE

**Duration:** 5.0s (start: 21.0s → end: 26.0s)
**Energy:** high (the payoff: this is what you'll build)
**Outgoing transition:** crossfade, 0.4s, `power2.inOut`, fires at t=25.6 → 26.0

### Layout (the hero frame)

Same shape as the V0 trailer's CAPSTONE — copy left, agent-trace right.

Inherit V0 `.s4` (capstone) CSS verbatim, renamed to `.s5`. V2 changes:

- `.s5 .scene-content` use grid `1fr 720px`, column-gap 100px, padding 130px 140px (same as V0).
- `.s5 h2` Fraunces 900 110px, color `--ink-100`. `.s5 h2 em` italic, `'opsz' 144, 'wght' 800`, color `--green-500`.
- `.s5 .footnote` JetBrains Mono 400 22px, color `--ink-400`.
- `.s5 .trace` bg `--ink-900`, border `--ink-800`, radius 14px, padding 28px 32px, JetBrains Mono 400 22px, ligatures none, `filter: drop-shadow(0 24px 48px rgba(0,0,0,0.4))`.
- Row labels: `.lbl` JetBrains Mono 800 14px, letter-spacing 1.5px, uppercase, width 160px, padding-top 4px.
- Label colors: `.user` → `--ink-400`, `.tool` → `--green-500`, `.result` → `--mint-300` (#6ee7b7), `.stop` → `#a5b4fc` (indigo, only here), `.agent` → `--ink-100`.
- `.trace .txt` color `--ink-300`. `.row.agent .txt` color `--ink-100`.

### Choreography (entrances, in timeline order)

Decision 4: rows stagger in (one at a time).

- t=21.10: `#s5-eyebrow` — `from { y: 24, opacity: 0 }`, 0.5s, `power2.out`.
- t=21.30: `#s5-h1` — slam. `from { y: 40, opacity: 0 }`, 0.55s, `expo.out`.
- t=21.50: `#s5-h2` ("cli agent" italic green) — slam + scale. `from { y: 40, opacity: 0, scale: 1.05 }`, 0.55s, `expo.out`. (Cross-scene rhyme with WEDGE's "it's wrong.")
- t=21.70: `#s5-h3` — slam. `from { y: 40, opacity: 0 }`, 0.55s, `expo.out`.
- t=22.00: `#s5-footnote` — `from { y: 18, opacity: 0 }`, 0.45s, `power2.out`.
- t=21.60: `#s5-trace` panel — drift from right. `from { x: 60, opacity: 0 }`, 0.6s, `power3.out`.
- t=22.00: `#s5-r1..#s5-r6` — `from { x: 24, opacity: 0 }`, 0.3s, `power2.out`, stagger 0.18. (Ends t=23.2; 2.4s breathe before crossfade.)

### Copy (locked)

- **Eyebrow:** `chapter 25 · capstone`
- **Headline (h2)** — three spans, stacked:
  - `<span id="s5-h1">ship a working</span>`
  - `<span id="s5-h2"><em>cli agent</em></span>` (italic, green via h2 em rule)
  - `<span id="s5-h3">in 12 steps.</span>`
- **Footnote:** `~100 lines of python · no framework`
- **Trace (6 rows in this exact order):**
  1. `user` / `what's in my downloads folder?`
  2. `tool_use` / `list_files(path='~/Downloads')`
  3. `tool_result` / `['invoice-2026.pdf', 'screenshot.png', 'agent-traces.md']`
  4. `tool_use` / `summarize(files=[…3])`
  5. `stop_reason` / `end_turn`
  6. `agent` / `you have an invoice, a screenshot, and a markdown note about agent traces.`

(Apostrophes: use `&rsquo;`. Ellipsis: `&hellip;`.)

### Risks / notes

- `.lbl.stop` indigo `#a5b4fc` is the only indigo in the trailer — reserved because `stop_reason` is metadata, not a turn.
- Headline at 110px × 3 spans ≈ 360px stack. Fits in 700px usable left-column height. Comfortable.
- "cli agent" italic-green is the second/last instance of the italic-green pattern (after WEDGE's "it's wrong."). Don't introduce a third.

---

## Scene 6 — PRICE

**Duration:** 4.0s (start: 26.0s → end: 30.0s)
**Energy:** calm (release, decisive end)
**Outgoing transition:** none — final scene, exits allowed.

### Layout (the hero frame)

Centered. The ONLY centered scene in the trailer (per BRAND.md / DESIGN.md / TYPOGRAPHY.md).

```
.s6 .scene-content {
  padding: 120px 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.s6 .eyebrow {
  font: JetBrains Mono 800, 32px;
  letter-spacing: 14px; text-transform: uppercase;
  color: var(--green-500);
}

.s6 .zero {
  font: Fraunces 900, 480px;
  font-variation-settings: 'opsz' 144, 'wght' 900;
  letter-spacing: -0.08em; line-height: 0.85;
  color: var(--ink-100);
  font-variant-numeric: tabular-nums;
}

.s6 .terms {
  margin-top: 32px;
  font: JetBrains Mono 400, 28px;
  letter-spacing: 0.02em;
  color: var(--ink-400);
}
.s6 .terms .pipe { color: var(--ink-700); margin: 0 18px; }
.s6 .terms .open { color: var(--green-500); }

.s6 .endcard {
  margin-top: 60px;
  font: JetBrains Mono 400, 22px;
  letter-spacing: 0.04em;
  color: var(--ink-400);
}
```

### Choreography (entrances + EXITS — final scene exception)

- t=26.20: `#s6-eyebrow` — `from { y: 30, opacity: 0 }`, 0.6s, `power2.out`.
- t=26.40: `#s6-zero` — POP. `from { scale: 0.6, opacity: 0 }`, 0.9s, `back.out(1.6)`. (Slowest, biggest entrance — `$0` is the punchline.)
- t=27.10: `#s6-terms` — `from { y: 22, opacity: 0 }`, 0.6s, `power2.out`.
- t=27.70: `#s6-endcard` — `from { opacity: 0 }`, 0.6s, `sine.out`.

FINAL fade-to-black (only scene allowed to exit):

- t=29.00: `#bg-glow` — `to { opacity: 0 }`, 0.8s, `sine.in`.
- t=29.20: `#corner-mark`, `#footer-wordmark` — `to { opacity: 0 }`, 0.6s, `sine.in`.
- t=29.20: `#s6` — `to { opacity: 0 }`, 0.8s, `power2.in`.

End frame: pure ink-950 at t=30.00.

### Copy (locked)

- **Eyebrow:** `forever`
- **Zero:** `$0` (Fraunces 900, 480px)
- **Terms (single line):** `no login · no streaks · no upsell · open source`
  - The `·` separators are `<span class="pipe">·</span>`.
  - `open source` is `<span class="open">open source</span>` (green).
- **Endcard:** `github.com/xernst/promptdojo`

### Risks / notes

- `$0` at 480px ≈ 660px wide — fits in 1920 with massive negative space (the point).
- Only scene allowed to exit. Fade-to-black must NOT start before t=29.0 — endcard needs ≥1.0s read time.
- `back.out(1.6)` on `$0` rhymes intentionally with corner-mark's entrance at t=0.4 — small `>_` opens, giant `$0` closes.
- Final frame at t=30.0 must be solid `#14140f`. Any residual opacity shows on the X thumbnail.

---

## Open creative decisions — recap

1. **IDE camera (decision 1):** screenshot enters at scale 0.94 with the rotateY tilt and scales to 1.0 over 1.1s, then breathes (rotateY -6° → -7.5° → -6°, 3.0s sine.inOut yoyo). The IDE is the trailer's first piece of *evidence* — scaling-in reads as "arriving, ready, alive." One big approach motion concentrates attention on the proof; six tiny overlay slides would diffuse it.
2. **CURRICULUM pace (decision 2):** 155 px/s for 3.5s. Phase-band borders DO pulse green at the midline — three pulses at t=17.30, 18.40, 19.50 (0.36s round trip each). 155 px/s is the speed of a deliberate reader's eye. The pulses turn "five phases" from claim into felt rhythm; their ~1.0s cadence lands kindred to the cursor heartbeat without overlapping it.
3. **Push-cut direction (decision 3):** **right-to-left**. WEDGE pushes off-screen LEFT; IDE enters from the RIGHT and lands with its content anchored LEFT. The eye finishes the WEDGE on the left (where the diagnosis sits) and the new IDE eyebrow+headline arrive exactly there — revelation geometry. Forward-progress (left-to-right) would force the eye to back-track 1300px to find the new headline. Wrong.
4. **Trace stagger (decision 4):** rows stagger in at 0.18s. The trace is a narrative of agent reasoning — staggering enacts the loop the trailer describes. 0.18s is the slowest stagger in the trailer because each row is a distinct cognitive step, unlike CURRICULUM's parallel facts (0.12s) or WEDGE's mechanical lines (0.08s). Total = 1.2s, leaving 2.4s breathe to read the agent's reply.

---

## Audit — eases & stagger per scene

| Scene | Eases used | Stagger |
| --- | --- | --- |
| HOOK | `power3.out`, `expo.out`, `power4.out`, `power2.out` (4) | none (sequential overlaps) |
| WEDGE | `power3.out`, `expo.out`, `power2.out`, `back.out(1.2)`, `power2.inOut` (5) | 0.08s code lines |
| IDE | `power2.out`, `expo.out`, `power3.out`, `sine.inOut` (4) | none |
| CURRICULUM | `power2.out`, `expo.out`, `power3.out`, `power1.inOut` (4) | 0.12s stats + 1.0s pulse |
| CAPSTONE | `power2.out`, `expo.out`, `power3.out` (3) | 0.18s rows |
| PRICE | `power2.out`, `back.out(1.6)`, `sine.out`, `sine.in`, `power2.in` (5) | none |

## Final timeline summary (locked)

```
t=0.00 → 5.00     HOOK         (5.0s)
t=4.60 → 5.00     crossfade 0.4s power2.inOut
t=5.00 → 11.00    WEDGE        (6.0s)  ← earns the punchline beat
t=10.65 → 11.00   PUSH-CUT 0.35s power3.inOut, right-to-left  ← only push-cut
t=11.00 → 16.00   IDE          (5.0s)
t=15.60 → 16.00   crossfade 0.4s power2.inOut
t=16.00 → 21.00   CURRICULUM   (5.0s)
t=20.60 → 21.00   crossfade 0.4s power2.inOut
t=21.00 → 26.00   CAPSTONE     (5.0s)
t=25.60 → 26.00   crossfade 0.4s power2.inOut
t=26.00 → 30.00   PRICE        (4.0s)
t=29.00 → 30.00   final fade-to-black (only scene allowed to exit)
```

Total: 30.0s. Five transitions × 0.4s (one is 0.35s push-cut). ✓

---

## Implementation notes for Senior Dev

- **GSAP timeline structure:** one master `gsap.timeline({ paused: true })` named `window.__timelines["trailer"]`. All scenes are positioned absolutely on the timeline using literal time positions (`5.30`, `11.10`, etc.) NOT labels — this matches the V0 trailer's pattern and keeps timing locked.
- **Scene visibility:** every scene starts with `tl.set("#sN", { opacity: 0 }, 0)` and is brought to opacity 1 by its incoming transition. HOOK is the exception — `tl.set("#s1", { opacity: 1 }, 0)` because nothing transitions IN to scene 1 (the persistent layers handle the open).
- **No `Math.random()`, no `Date.now()`, no `setTimeout`.** All motion is timeline-driven.
- **Push-cut implementation:** instead of opacity, use `xPercent`. WEDGE goes `to({ xPercent: -100, duration: 0.35, ease: "power3.inOut" })` while IDE simultaneously animates `fromTo({ xPercent: 100 }, { xPercent: 0, duration: 0.35, ease: "power3.inOut" })`. Both scenes must have `position: absolute; inset: 0` and the parent must `overflow: hidden`. The container `#trailer` already has `overflow: hidden` per V0 reference.
- **Cursor blink:** CSS `@keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }` applied via `animation: blink 1s steps(1) infinite;`. Do NOT reproduce this in GSAP — the deterministic CSS animation is faster and renders identically across replays.
- **Real assets:** if `assets/lesson-ide.png` or `assets/curriculum-tree.png` are not yet captured at implementation time, use placeholder dark panels with text labels — the choreography is independent of the asset pixels.
- **Render verification:** snapshot at t=2.5 (HOOK breathe), t=8.0 (WEDGE bug-wash settled), t=13.5 (IDE breathe), t=18.5 (CURRICULUM mid-scroll, mid-pulse), t=23.0 (CAPSTONE all rows visible), t=27.5 (PRICE fully assembled). Save to `snapshots/`.
