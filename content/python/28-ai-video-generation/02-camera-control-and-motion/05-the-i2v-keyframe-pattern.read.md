---
xp: 1
estSeconds: 190
concept: i2v-keyframe-pattern
code: |
  # the image-to-video keyframe pattern. compose the frame cheap,
  # then only pay video money for the motion.
  step_1_frame = {
      "tool": "Nano Banana Pro (Google) or Imagen 4",
      "task": "compose first frame of the shot",
      "cost_per_image": "$0.02-0.05",
      "iterations": 4,  # try 4 frame variants
      "cost": 0.20,     # 4 × $0.05
  }
  step_2_video = {
      "tool": "Sora 2 (image-to-video, 4 sec)",
      "task": "animate the chosen frame with prompted motion",
      "cost_per_sec": 0.10,
      "duration_sec": 4,
      "retake_rate": 2.5,  # generate 2.5x to get one usable
      "cost": 1.00,         # $0.40 base × 2.5 retakes
  }
  total = step_1_frame["cost"] + step_2_video["cost"]
  print(f"Frame iteration:  ${step_1_frame['cost']:.2f}")
  print(f"Video generation: ${step_2_video['cost']:.2f}")
  print(f"One usable shot:  ${total:.2f}")
---

# The image-to-video keyframe pattern

Image-to-video is not just "cheaper than text-to-video." It's a
*different workflow* that puts control where it belongs.

## The two-step pattern

Step 1: **Compose the first frame in a cheap image model.**

Use Nano Banana Pro or Imagen 4 (chapter 27) to generate the
starting frame at $0.02-0.05 per image. Iterate cheaply — try
3-5 variants until you have a frame you actually want. Total
spend: $0.10-0.25 to get a perfect frame.

Step 2: **Animate the chosen frame with a video model in I2V
mode.**

Hand the frame to Sora 2 / Veo 3 / Kling 3.0 / Luma Ray3 / Vidu
Q3 with a *motion-only* prompt. The model already has the
composition. It just has to solve motion. Acceptance rates jump,
retake counts drop, and the video model spends its capacity on
the thing it's good at.

## Why this is the production default

Three reasons it beats text-to-video for most real work:

1. **Brand asset control.** Your client's product can be authored
   into the frame deterministically (image models are better at
   product fidelity than video models). The video model never
   gets to invent the product.
2. **Sequence consistency.** Use the same anchor character /
   product / style across multiple I2V generations and the shots
   cut together. T2V invents fresh every time; sequences fall
   apart.
3. **Predictable budget.** I2V acceptance rates run 2-3x retakes
   to one usable shot. T2V runs 5-10x. The cost gap is more than
   the model price gap.

## The prompt structure changes

In T2V, your prompt has to describe *everything* — composition,
lighting, subject, action, style, mood. The model fills in the
gaps and the gaps are where the failures live.

In I2V, the frame already specifies composition, lighting,
subject, and style. Your prompt only has to specify:

- **The motion** (shot type + camera move from previous reads).
- **The duration.**
- **Any subject animation** (eyes blink, hand moves, water
  pours, etc.).

A clean I2V motion prompt is short:

> "Slow 3-second push-in. Subject's gaze drifts toward the
> window. Background stays static."

That's it. The frame already said everything else.

## When I2V breaks down

I2V is the default but not universal. Three failure modes:

1. **Camera move incompatible with the frame.** If the frame is
   a tight extreme-close-up on a face, you can't ask for a wide
   parallax move — there's no scene depth in the frame to
   parallax against. Match the move to what's in the frame.
2. **Motion the model can't infer.** If the frame is a static
   pose with no implied motion (a person standing perfectly
   still), and you ask for "they wave their hand," the model
   has to invent the hand position over time and may break the
   character's identity. T2V is sometimes better when the action
   is complex.
3. **Long durations.** I2V's first-frame anchor weakens over
   time. By second 8-10, the model has drifted significantly
   from the frame. If you need 25 seconds of a specific
   character, Sora 2 Pro's longer durations + T2V is sometimes
   the better path. (Or generate multiple I2V clips and cut.)

## The arbitrage angle

Different vendors are best at different parts of the I2V
pipeline. You can mix:

- **Frame in Nano Banana Pro** ($0.04) for product fidelity.
- **Animate in Kling 3.0** ($0.084/sec × 5 = $0.42) for the
  best value motion at quality.
- **Total cost per shot, before retakes: $0.46.**

Same shot all-Sora-2 path:

- **Frame implicitly in Sora 2 T2V** (no separate frame
  spend, but the model picks the composition).
- **Total cost per shot, before retakes: 5 sec × $0.10 = $0.50.**

The all-Sora-2 path looks cheaper on paper. But the retake rate
is 4-5x higher in T2V mode, so the *real* cost is $2.00-$2.50
per usable shot. The mixed pipeline at $0.46 with 2.5x retakes
is $1.15 per usable shot — roughly half.

## The mental shift

People coming from image generation prompt video models the same
way: one big sentence with all the keywords. It doesn't work.

People who get good at AI video stop writing "scene
descriptions" and start writing **shot specifications**: a frame
+ a move + a duration, decomposed into the cheapest tool for
each part. That's the working pattern in 2026 and it gets more
true every quarter.
