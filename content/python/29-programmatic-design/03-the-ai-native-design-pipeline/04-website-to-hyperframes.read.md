---
xp: 2
estSeconds: 220
concept: website-to-hyperframes-worked-example
code: |
  # the 7-step workflow encoded in the website-to-hyperframes skill.

  STEPS = [
      ("1. capture",     "scrape the site for colors, fonts, copy, key assets"),
      ("2. DESIGN.md",   "write a brand cheat sheet (~90 lines, 6 sections)"),
      ("3. SCRIPT.md",   "write the narration script — story backbone"),
      ("4. STORYBOARD.md","per-beat creative: mood, camera, animations, transitions"),
      ("5. VO + timing", "TTS the script, transcribe for word-level timestamps"),
      ("6. compositions","build each beat in HyperFrames, self-review"),
      ("7. validate",    "lint + validate + snapshot + preview, deliver"),
  ]
  for step, what in STEPS:
      print(f"{step:18s} — {what}")
---

# The `website-to-hyperframes` worked example

The cleanest example of the seven-step pipeline in the wild is the `website-to-hyperframes` skill (Josh's, ground truth in `~/.claude/skills/website-to-hyperframes/SKILL.md`). It takes one input — a URL — and produces a finished MP4 promo. Every canonical step from the previous lesson maps to one of its sub-steps.

## The user prompt

> "Capture https://acme.com and make me a 25-second product launch video."

That's the whole brief. The skill runs seven gated steps to turn it into a finished HyperFrames project. Each step produces an artifact that gates the next.

## Step-by-step

### 1. Capture & Understand
Scrape the site (Puppeteer-style). Extract the brand: top colors, fonts, hero image, key headlines, vibe sentence. The output is a working summary the rest of the pipeline reads.

**Gate:** print a site summary (name, colors, fonts, assets, one-sentence vibe).

### 2. Write `DESIGN.md`
Six sections, ~90 lines. Brand cheat sheet: palette with hex values + roles, typography (1-2 families), motion guidelines, "what NOT to do" anti-patterns. This is the document every later step references. Notably, every HyperFrames composition is required by the SKILL.md "Visual Identity Gate" to trace its palette and typography back to a `DESIGN.md`.

**Gate:** `DESIGN.md` exists in the project directory.

### 3. Write `SCRIPT.md`
The narration script. Story backbone. Scene durations come from the narration — not from guessing. If the script says "Today, Acme is launching..." and that's 3.2 seconds in TTS, the first beat is 3.2 seconds. Audio drives timing.

**Gate:** `SCRIPT.md` exists.

### 4. Write `STORYBOARD.md`
Per-beat creative direction: mood, camera, animations, transitions, assets, depth layers, SFX. This is the creative north star — the document the engineer follows to build each composition.

**Gate:** `STORYBOARD.md` exists with beat-by-beat direction and an asset audit table.

### 5. Generate VO + map timing
Generate TTS audio (HyperFrames `npx hyperframes tts` with a Kokoro voice). Transcribe the TTS output (`npx hyperframes transcribe narration.wav`) to get word-level timestamps. Map timestamps to beats. Update `STORYBOARD.md` with real durations.

**Gate:** `narration.wav` + `transcript.json` exist; beat timings in `STORYBOARD.md` updated.

### 6. Build compositions
Build each composition in HyperFrames following the storyboard. After each one: self-review for layout, asset placement, animation quality. The skill enforces non-negotiable rules: every multi-scene composition uses transitions (no jump cuts), every scene has entrance animations on every element, and no exit animations except on the final scene (the transition IS the exit).

**Gate:** every composition self-reviewed. No overlapping elements, no misplaced assets, no static images without motion.

### 7. Validate & Deliver
Run `npx hyperframes lint` and `npx hyperframes validate`. Validate runs a WCAG contrast audit — every text element gets sampled against its background at 5 timestamps. Deliver the preview to the user first. Only render to MP4 on explicit request.

**Gate:** `lint` and `validate` pass with zero errors.

## What this pattern teaches

Three things to notice:

1. **The gates matter more than the steps.** Each step produces a file that the next step reads. If `DESIGN.md` doesn't exist, step 4 can't start. The pipeline forces sequencing.
2. **Audio drives timing, not the other way around.** Step 5 generates the TTS first, then step 6 builds visuals to match. Building the visuals first and then trying to record narration to fit always produces unnatural pacing.
3. **Lint + validate are non-skippable.** A WCAG-failing video still renders, but it ships with text you can't read on the actual background. The pipeline catches this before render.

## Why this maps to the canonical seven steps

The seven canonical steps from the previous lesson map directly:

| Canonical step | `website-to-hyperframes` step |
|---|---|
| 1. Concept | Sub-steps 1-3 (capture + DESIGN.md + SCRIPT.md) |
| 2. Reference-gen | Sub-step 4 (STORYBOARD references assets from capture) |
| 3. Composition | Sub-step 6 (build compositions) |
| 4. Audio | Sub-step 5 (TTS narration) |
| 5. Captions | Sub-step 5 (transcript for word timing) |
| 6. Render | Sub-step 7 (validate + preview) |
| 7. Review | Sub-step 7 (deliver preview, await notes) |

If your team's pipeline doesn't have an artifact equivalent to each of these — no `DESIGN.md`, no `SCRIPT.md`, no `STORYBOARD.md` — you're skipping a step. The next two screens will give you a way to score that.
