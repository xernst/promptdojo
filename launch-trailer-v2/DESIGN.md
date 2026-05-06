# Promptdojo — Launch Trailer V2 Design

## Style Prompt

A 30-second launch trailer for a python school built for the AI-coding era. Terminal-room confidence, dojo-mat geometry, real product receipts. The aesthetic is a punk-rock dev manual on green: warm-ink background, dojo-green accent, sharp serif headlines crashing into mono code. The viewer should feel like they walked into a lit basement at 2 AM where a builder is debugging a model and shipping a curriculum at the same time. All-lowercase swagger. No emoji. No gradient text. No purple glow. The IDE and curriculum scenes use REAL captures of the live product, not mockups.

## Colors

| Hex | Role |
| --- | --- |
| `#14140f` | Background — warm ink, never pure black |
| `#18181b` | Card / code-block fill |
| `#27272a` | Hairline borders, dividers |
| `#3f3f46` | Muted UI, deeper dividers |
| `#9c9c93` | Secondary / supporting text (V2 override of #a1a1aa) |
| `#d4d4d8` | Body text on dark |
| `#fafaf7` | Headline white — V2 override of #f4f4f5 |
| `#2aa06a` | Dojo-green — the only chromatic accent |
| `#1f7a51` | Green-dim, hover/active |
| `#6ee7b7` | Mint, success — used once in IDE meta line |
| `#e4573c` | Coral, error — used once in WEDGE bug line |
| `#a5b4fc` | Indigo, metadata-only — used once on `stop_reason` label in CAPSTONE |

## Typography

Cross-category pairing — serif display + monospace. Never two sans.

- **Display:** `Fraunces` — variable serif, weights 400 / 600 / 800 / 900, opsz axis pinned at `144`. Used for every headline.
- **Mono:** `JetBrains Mono` — matches the live product, weights 400 / 800. Used for code, eyebrow labels, the wordmark, and the closing footer.

Tracking: `-0.04em` on display 60px+, `0` on mono. `font-variant-ligatures: none` on every code surface. `font-variant-numeric: tabular-nums` on numeric columns (`$0`, the curriculum tickers).

## Motion principles

- Cursor blink is 1.0 Hz `steps(1)` infinite — driven by CSS `@keyframes blink`, NOT GSAP. Deterministic, replayable, capture-safe.
- Scene transitions are 0.4s `power2.inOut` crossfades. ONE push-cut at WEDGE → IDE (right-to-left, 0.35s, `power3.inOut`) for energy.
- Entrance vocab: slam (`expo.out`), drift (`power3.out`), stagger (`0.08s` / `0.12s` / `0.18s` per scene rhythm), pop (`back.out(1.6)` for `$0`).
- Persistent `bg-glow` breathes on a 14s `sine.inOut` yoyo and is faded out only in the final 1s of scene 6.
- NO exit animations on individual elements before scene 6. The crossfade IS the exit.

## What NOT to Do

- **No two sans-serifs.** The contrast lives in serif-vs-mono.
- **No gradient text.** Green is solid `#2aa06a`. No `background-clip: text`.
- **No center-stacked everything.** Lead the eye left in scenes 1–5. Only the closing PRICE card is centered.
- **No exit animations on individual elements** before scene 6. Crossfade IS the exit.
- **No purple, cyan, or neon.** Indigo `#a5b4fc` is reserved for the single `stop_reason` label.
- **No `Math.random()` or `Date.now()`.** Composition must render deterministically.
- **No `repeat: -1`.** Use finite repeat counts. Cursor blink is CSS, not GSAP.
- **No async / setTimeout / Promise / await.** Timeline construction is synchronous.
- **No display / visibility mutations.** Only animate visual properties.
