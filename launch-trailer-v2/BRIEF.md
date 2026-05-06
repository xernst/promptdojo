# Project: Promptdojo Launch Trailer V2

## Product
- **One-line:** Promptdojo — a free, open-source python school for builders in the AI era.
- **Audience:** Vibe-coders, PMs-turned-builders, indie hackers using Cursor / Claude / agents daily.
- **Primary user action:** click `start the course →`, follow @TFisPython on X.
- **Why V2 trailer:** the V1 trailer shipped on the ember/orange palette before the V3 site refresh. The site is now on crowdtest-aligned green (#2aa06a), the IDE wears `dojoTheme`, `/curriculum` exists as a phase-banded chapter map, and the brand is at 9.2/10 alignment. The trailer needs to reflect the real, shipped product — not the V0 mockup state.

## Video
- **Duration:** ~28–30s
- **Aspect:** 1920×1080 landscape
- **Channel:** X launch post, GitHub README hero, /about page embed
- **Audio:** silent (no voiceover yet — captions baked into visual)

## Story arc — 6 scene beats

| # | Scene | Headline | Visual |
| --- | --- | --- | --- |
| 1 | HOOK | `❯ promptdojo` wordmark + tagline | Brand identity establishment, 1Hz cursor blink |
| 2 | WEDGE | `ai writes this. it's wrong.` | `cursor.py` bug snippet with line 3 highlighted coral |
| 3 | IDE | `no installs. no venv. no setup.` | **REAL screenshot** of `/learn/v2/...` lesson page with dojoTheme IDE running |
| 4 | CURRICULUM | `25 chapters. 5 phases. 624 interactive steps.` (NEW SCENE) | **REAL screenshot** of `/curriculum/` phase-banded chapter map |
| 5 | CAPSTONE | `ship a working cli agent in 12 steps.` | Agent trace (user / tool_use / tool_result / agent) |
| 6 | PRICE | `$0 forever. open source.` | Giant `$0` Fraunces serif + footer |

Total: 6 × ~5s = 30s with 5 transitions × 0.4s.

## Screens needed (real product captures, NOT AIDesigner)

We skip AIDesigner because the product is live. Capture from `https://promptdojo.pages.dev`:

- `assets/curriculum-tree.png` — `/curriculum/` page, phase-banded chapter map, 1920px wide, hero region only.
- `assets/lesson-ide.png` — `/learn/v2/variables/naming-things/0` (or similar), 1920px wide, IDE pane in dojoTheme green, Pyodide loaded.

Two scenes are typographic-only (synthesized in HyperFrames): WEDGE bug snippet, CAPSTONE agent trace.

## Design system

Inherit `~/Developer/code-killa/design-kit/BRAND.md` and the V1 trailer's `DESIGN.md` (already on green).

- **Palette:** `#14140f` bg · `#fafaf7` fg · `#2aa06a` green · `#1f7a51` green-dim · `#e4573c` coral (error, used once) · `#6ee7b7` mint (success, used once) · `#9c9c93` ink-400 secondary
- **Type:** Fraunces variable serif (display, opsz 144 / weight 900) + JetBrains Mono (mono, weights 400 / 800). Tracking -0.04em on display 60px+.
- **Motion:** cursor blink 1.0 Hz steps(1) (the heartbeat). Scene transitions 0.4s `power2.inOut` crossfade. ONE push-cut at WEDGE → IDE for energy. Entrance vocab: slam (expo.out), drift (power2.out), stagger (0.08s offset), pop (back.out 1.6). NO exit animations until scene 6.

## Tool routing per scene

- **Scene 1 — HOOK:** HyperFrames typography only.
- **Scene 2 — WEDGE:** HyperFrames + inline code block (synthesized HTML).
- **Scene 3 — IDE:** HyperFrames + `assets/lesson-ide.png` (real product capture, 3D-card framing).
- **Scene 4 — CURRICULUM:** HyperFrames + `assets/curriculum-tree.png` (real product capture, vertical-scroll-tease framing).
- **Scene 5 — CAPSTONE:** HyperFrames + agent-trace block (synthesized HTML).
- **Scene 6 — PRICE:** HyperFrames typography only. Final scene — exits allowed.

**Remotion is NOT needed.** Every scene is HyperFrames-feasible — no charts, no Lottie, no parametric variants, no voiceover.

## What's different from V1 trailer

- Palette: ember orange → green
- Typography: Geist Mono → JetBrains Mono (matches live site)
- New scene: CURRICULUM (adds a beat)
- Real product captures replace mockups in IDE scene
- Agent trace updated to match the live capstone OG art

## Off-limits in copy

NO mention of XWELL, biosurveillance, HS-class governance. NO emojis. NO exclamations. NO Title Case headlines. Voice stays lowercase, sharp, anti-Coursera.

## Phase outputs expected

- `BRIEF.md` (this file) ✓
- `STORYBOARD.md` — locked scene-by-scene shooting script (Visual Storyteller agent)
- `assets/curriculum-tree.png` + `assets/lesson-ide.png` (Evidence Collector agent)
- `index.html` — root HyperFrames composition (Senior Dev agent)
- `out/trailer-v2.mp4` — final render
- 6 keyframe snapshots in `snapshots/`
