---
xp: 2
estSeconds: 220
concept: hyperframes-fundamentals
code: |
  # the HyperFrames CLI surface, in order of how often you'll use each command.

  COMMANDS = [
      ("npx hyperframes init my-video",          "scaffold a new project with templates"),
      ("npx hyperframes lint",                   "static checks on index.html + compositions/"),
      ("npx hyperframes preview",               "dev server with hot reload (default port 3002)"),
      ("npx hyperframes render",                "render to MP4 in renders/"),
      ("npx hyperframes transcribe audio.mp3",  "Whisper transcription for caption sync"),
      ("npx hyperframes tts 'hello' --voice af_nova", "Kokoro TTS for narration"),
      ("npx hyperframes doctor",                "diagnose Chrome, FFmpeg, Node, memory"),
  ]
  for cmd, what in COMMANDS:
      print(f"{cmd:48s} — {what}")
---

# HyperFrames — HTML is the source of truth for video

HyperFrames is what happens when someone notices that web developers already know how to author rich visuals (HTML + CSS + GSAP) and stops trying to invent a new authoring environment for video. You write an HTML file. The CLI renders it to MP4.

## The file you write

A HyperFrames project is an `index.html` file plus optional sub-compositions in `compositions/`. The HTML is plain — no framework, no build step from your side. Elements get `data-*` attributes for timing:

```html
<div id="title"
     data-composition-id="hero"
     data-width="1920"
     data-height="1080"
     data-duration="6">
  <h1 class="headline">Launch day</h1>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <script>
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    tl.from(".headline", { y: 60, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.3);
    window.__timelines["hero"] = tl;
  </script>
</div>
```

Notes that matter:

- **Every clip needs `data-composition-id`** for the renderer to identify it.
- **The timeline is `paused: true`** because the framework drives playback.
- **You register the timeline on `window.__timelines`** so the renderer can find it.
- **Duration comes from `data-duration`**, not from the GSAP timeline length.

## Rules HyperFrames enforces

A few non-negotiable rules from the skill ground truth — these will save you debugging time:

- **Deterministic only.** No `Math.random()`, no `Date.now()`, no `setTimeout` for timing. Use a seeded PRNG (like mulberry32) if you need pseudo-random values. The render must be reproducible.
- **No `repeat: -1`.** Infinite repeats break the capture engine. Calculate a finite repeat count from duration.
- **Synchronous timeline construction.** Build the timeline at page load. The capture engine reads `window.__timelines` synchronously.
- **Animate visual properties only.** `opacity`, `x`, `y`, `scale`, `rotation`, `color`, `borderRadius`, transforms. Do NOT animate `visibility` or `display`. Do NOT call `video.play()` — the framework owns playback.

## The CLI surface

Look at the table in the editor. The workflow is always: `init` once, then a loop of `lint` → `preview` → render small previews, with `render` at the end for the final MP4.

Render flags worth knowing:

- `--quality draft` while iterating, `--quality high` for delivery.
- `--fps 30` is default; `--fps 60` doubles render time.
- `--format webm` if you need a transparent video.
- `--docker` produces byte-identical output across machines (important for CI).
- `--strict` fails the render if lint produces any errors.

## Why this design wins for some teams

HyperFrames is built on three bets:

1. **CSS animations are good enough for most motion design.** With GSAP on top, you have the same toolbox web designers use every day.
2. **HTML is the most reviewable text format for visual work.** Diff-friendly, version-control-friendly, easy to read in a PR.
3. **The browser's compositor is the best frame engine that already exists.** Why reinvent it?

If your team thinks in CSS and GSAP — if "I'd just write a div with `transform: translateX(...)` for that" is your first instinct — HyperFrames matches your mental model. If your team thinks in React state machines, the next section is for you.
