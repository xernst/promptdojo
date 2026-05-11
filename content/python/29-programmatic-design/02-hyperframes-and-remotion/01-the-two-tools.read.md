---
xp: 1
estSeconds: 180
concept: hyperframes-vs-remotion-at-a-glance
---

# Two tools, same job, different mental models

Programmatic video on the web converged on two open-source frameworks: **HyperFrames** and **Remotion**. They both render an MP4 from web code via a headless browser. They differ in *what you write*.

| Tool | You write | The runtime is | The renderer is |
|---|---|---|---|
| **HyperFrames** | HTML + CSS + a paused GSAP timeline | Headless Chrome bundled by the CLI | `npx hyperframes render` (local FFmpeg pipeline) |
| **Remotion** | React components with a `useCurrentFrame()` hook | Chromium under `@remotion/renderer` | `npx remotion render` locally, or `@remotion/lambda` on AWS |

Both produce the same kind of output: a deterministic MP4 that's reproducible across runs. The pick is about how your team thinks, not what the output looks like.

## What "the same job" actually means

A composition in either tool has:

1. A **timeline** with explicit duration in seconds (or frames).
2. **Layers** — visual elements positioned in space and time.
3. **Media** — images, video, audio, ideally synced to the timeline.
4. A **render** step that walks frame-by-frame, screenshots each frame, and stitches them into an MP4 via FFmpeg.

The big idea is the same in both: **treat video composition as a deterministic function of inputs**. Same inputs → same MP4, byte for byte. That's what makes parametric rendering possible.

## What they're not

- **Not real-time playback engines.** They don't compete with Unity or Unreal. They render offline, then play back.
- **Not video editors.** They don't compete with Premiere or DaVinci. You write code, not click on a timeline.
- **Not AI video models.** They don't generate frames from prompts. They composite frames you give them — and those frames can come from AI gen models, stock libraries, or hand-shot footage.

## Why this lesson exists

The two tools are well-documented separately. What's missing is the *decision*: when do you reach for which? This lesson tours both, lays out the decision tree, and ends with you writing `pick_tool(project)` — a rule-based classifier that takes a project profile and returns `"hyperframes"`, `"remotion"`, `"both"`, or `"ai-gen-only"`.

You'll also see where the Claude Code `design-html` skill fits — it produces Pretext-native HTML for design finalization, which is *not* the same as HyperFrames HTML but lives in the same neighborhood.
