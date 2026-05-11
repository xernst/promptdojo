---
xp: 1
estSeconds: 200
concept: t2v-i2v-v2v
code: |
  # three input modes, three control profiles.
  modes = {
      "text-to-video (T2V)": {
          "input": "prompt string",
          "control": "low — model picks the frame, composition, look",
          "cost": "highest per usable clip (retake rate ~5-10x)",
          "use_when": "exploring style, mood boards, rough concepts",
      },
      "image-to-video (I2V)": {
          "input": "first frame image + motion prompt",
          "control": "high — you authored the frame in a cheap image model",
          "cost": "lower per usable clip (retake rate ~2-3x)",
          "use_when": "product shots, branded scenes, anything where frame matters",
      },
      "video-to-video (V2V)": {
          "input": "source video + transformation prompt",
          "control": "highest — motion, timing, structure all locked in",
          "cost": "depends on source — Runway Aleph, Kling Pro, Pika modify mode",
          "use_when": "restyling existing footage, look transfer, B-roll punch-up",
      },
  }
  for name, m in modes.items():
      print(f"{name:<24} — control: {m['control']}")
---

# The three input modes — and why image-to-video usually wins

Every 2026 video model exposes some combination of three input
modes. Picking the right one matters more than picking the right
model in many cases.

## Text-to-video (T2V)

Type a prompt, get a clip. The original Sora-style demo.

What it's good for:
- **Concept exploration.** Mood boards, "what if" tests.
- **Single-shot social.** Vertical 9s clip for a TikTok where
  the exact frame composition isn't the point.

What it's bad for:
- **Anything with a specific brand asset.** The model invents the
  frame. You can prompt "Coca-Cola can on a wooden table" but
  you get whatever the model thinks that looks like — not your
  client's pack shot.
- **Sequence work.** Each generation invents its own frame. Cut
  three T2V shots together and the continuity is broken.
- **Cost predictability.** Acceptance rate is the worst in T2V
  because you have the least control. Plan for 5-10x retakes.

## Image-to-video (I2V) — the sweet spot

You author the first frame in a cheap image model (Nano Banana
Pro, Imagen 4, Flux) for $0.02-0.05. Then you feed that frame
plus a motion prompt to the video model.

What this buys you:
- **The frame is yours.** Composition, brand assets, character
  identity — all locked in before the video model touches it.
- **Lower acceptance-rate burn.** The video model only has to
  solve motion, not composition. Retake rate drops from
  5-10x to 2-3x.
- **Cross-model arbitrage.** Compose in the cheapest image model
  that does what you need. Animate in the cheapest video model
  that does motion well. You don't have to use the same vendor
  for both.
- **Sequence consistency.** Use the same anchor frame (or a
  consistent style) across multiple clips and the sequence cuts
  together.

Supported by every major model in 2026: Sora 2, Veo 3, Kling 3.0,
Luma Ray3, Runway Gen-4, Hailuo 02, Vidu Q3 (Q3 added an explicit
reference-to-video mode), Pika 2.2.

**The default for product work should be image-to-video.** T2V is
a research demo most of the time.

## Video-to-video (V2V)

Take an existing clip, transform it. This is Runway Aleph's
specialty, Kling Pro's "with video input" mode at $0.168/sec,
and Pika's modify features.

What it's good for:
- **Restyling.** Take a raw screen recording, turn it into a
  stylized animation.
- **Look transfer.** Apply a reference visual style to footage
  you already shot.
- **Motion preservation.** When you need the exact motion of a
  source clip but a different aesthetic.

What it costs: usually 1.5-2x text-to-video pricing on the same
model, because the model is doing more work (parsing the source
*and* generating).

## The decision tree

```
Do you have an existing clip to transform?
  → Yes → video-to-video
  → No  → Do you care about exact frame composition or brand assets?
            → Yes → image-to-video  (this is the right answer most of the time)
            → No  → text-to-video   (concept work only)
```

## Why this matters for your budget

Imagine a 60-second promo, 10 shots of 6 seconds each, on
Sora 2 Pro at 720p ($0.30/sec, so $1.80 per 6s clip).

- **T2V path, 8x retake rate:** 10 shots × $1.80 × 8 = $144
- **I2V path, 2.5x retake rate:** 10 shots × ($1.80 × 2.5 + $0.05
  per anchor frame from Nano Banana) ≈ $46
- The savings is real: ~$100 on a single 60-second piece.

Multiply across a year of work and the input-mode choice is
worth more than the model choice.

## What the prompt looks like in I2V mode

Pseudocode (API shape varies by vendor — exact field names will
change, the structure won't):

```python
response = video_client.create(
    model="sora-2",
    input_image=open("hero_frame.png", "rb"),       # the frame you authored
    motion_prompt="slow push-in, 4 seconds",         # what to do with it
    duration_sec=4,
    resolution="720p",
)
```

The prompt is shorter because half the work is in the image.
The frame says "this is the scene." The motion prompt only says
"do this thing to it." Cleaner contract, fewer hallucinations,
lower retake rate.

## The cynical version

Most "AI video looks bad" critiques are critiques of **T2V output
prompted by people who don't know I2V exists.** When the same
prompt is run through I2V with a hand-authored frame, the output
gets noticeably better. The skill ceiling in AI video right now
is mostly the input-mode discipline, not the model choice.
