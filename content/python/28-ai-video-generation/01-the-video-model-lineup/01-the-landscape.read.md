---
xp: 1
estSeconds: 200
concept: video-model-landscape
code: |
  # the 2026 lineup, by lane.
  models = [
      ("Sora 2",        "OpenAI",      "physics + character consistency"),
      ("Sora 2 Pro",    "OpenAI",      "premium tier, 1024p, longer clips"),
      ("Veo 3",         "Google",      "cinematic look + NATIVE audio"),
      ("Veo 3.1 Lite",  "Google",      "cheap Veo — $0.05/sec at 720p"),
      ("Higgsfield",    "Higgsfield",  "camera-control layer over 15+ base models"),
      ("Runway Gen-4",  "Runway",      "editing workflow + speed (Gen-4 Turbo)"),
      ("Kling 3.0",     "Kuaishou",    "4K native + multilingual audio, value tier"),
      ("Luma Ray3",     "Luma",        "motion smoothness, image-to-video"),
      ("Pika 2.2",      "Pika Labs",   "Pikaffects + Pikaformance lip-sync"),
      ("Hailuo 02",     "MiniMax",     "cheapest publishable 1080p"),
      ("Vidu Q3",       "ShengShu",    "reference-to-video, $0.07/sec"),
  ]
  for name, vendor, lane in models:
      print(f"{name:<14} ({vendor:<10}) — {lane}")
---

# The 2026 video lineup is not one fight, it's eight

If you read the image-gen chapter you saw a similar shape: a few
heavyweight base models (DALL-E, Midjourney, Imagen, Flux), each
with a slightly different aesthetic. Video is the same idea but
with stronger lane separation. The models do not compete on a
single axis. They compete on **lanes** — distinct strengths that
make one model the obvious pick for one job and the wrong pick
for another.

There are eleven names in the editor above and that list is not
exhaustive (no Wan, no LTX, no the half-dozen Chinese models
behind the Great Firewall). What follows is the working subset
for someone shipping product in 2026.

## The five lanes

1. **Physics + consistency** — Sora 2's strength. A character
   stays the same character across a 12-second shot. Objects
   respect gravity, fluids look like fluids, faces are stable.
   This is what OpenAI optimized for and it shows.
2. **Native audio** — Veo 3 generates speech, music, and ambient
   sound *in the same pass* as the picture. Kling 3.0 joined this
   lane in February 2026. Everyone else makes you composite audio
   in post (which is fine for some products and a dealbreaker for
   others).
3. **Camera control** — Higgsfield's whole pitch. 70+ cinematic
   presets, virtual lens choice, focal length, stacked moves,
   character lock-in across shots. The other models can do a
   camera move if you ask nicely; Higgsfield is built around it.
4. **Speed + workflow** — Runway Gen-4 Turbo generates a 5-second
   clip in under a minute and lives inside an editing UI (timeline,
   masks, audio sync). Lower fidelity than Sora 2 Pro but the
   iteration loop is built for actual production.
5. **Price-performance** — Hailuo 02 at $0.045/sec for 768p,
   Veo 3.1 Lite at $0.05/sec for 720p, Kling 3.0 standard at
   $0.084/sec, Vidu Q3 at $0.07/sec. Different products entirely
   from Sora 2 Pro at $0.50/sec. If the brief is "fifty 6-second
   product clips for a Shopify ad set," you are not buying Sora.

## Why this matters before any code

The single biggest mistake in 2026 video work is **paying for the
wrong lane**. The agency that uses Sora 2 Pro for B-roll filler
spends 10x what it needs to. The studio that uses Hailuo for
hero-product shots gets footage that won't cut into the timeline.
The TikTok creator who hand-prompts Higgsfield's Cinema Studio
for a static talking-head shot wasted the entire reason to be on
Higgsfield.

You pick the model from the job, not from a leaderboard. The
next four steps walk through each lane in detail. Then you'll
write a routing function that takes a brief and returns the
right model for it.

## What this lesson is NOT

- Not a "best video AI 2026" listicle. Those rot in a quarter.
- Not a hands-on prompt tutorial. That's lesson 02.
- Not a generation tutorial. We do not call these APIs from
  Pyodide; the budgets and the latency don't fit a drill. We
  cover the *decisions* around the APIs.

What it IS: the lanes, the lane leaders, and the routing logic
you need to make sane buying decisions inside a team.

## The cynical version

Every six months the leaderboard reshuffles. Sora 2 is the leader
today, Veo 3 was the leader last year, Kling will probably be the
leader next year. **The lanes are stable. The lane leaders
rotate.** Learn the lanes; the leader-of-the-quarter is a thirty-
second WebSearch when you need it.
