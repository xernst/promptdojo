---
xp: 1
estSeconds: 220
concept: retake-rate-multiplier
code: |
  # the retake multiplier. "raw price × retake rate = real price."
  RETAKE_RATES = {
      # text-to-video (worst — model invents everything)
      "T2V quick draft":             3.0,
      "T2V usable B-roll":           5.0,
      "T2V hero / brand shot":       10.0,

      # image-to-video (better — frame already controlled)
      "I2V quick draft":             1.5,
      "I2V usable B-roll":           2.5,
      "I2V hero / brand shot":       4.0,

      # video-to-video (best motion preservation)
      "V2V style transfer":          2.0,
  }
  print(f"{'workflow':<32}{'×':>5}")
  for workflow, rate in RETAKE_RATES.items():
      print(f"{workflow:<32}{rate:>5.1f}")
---

# The retake rate — why every model is 2-10x more expensive than the table

The cost-per-second table from step 1 is the floor. The ceiling
depends on **retake rate** — how many generations you actually
have to do to land one usable clip.

Nobody talks about this in the marketing material. Everyone who
has shipped real AI video work knows the number.

## What retake rate is

If you generate one 5-second Sora 2 clip and use it as-is, your
retake rate is 1.0. You spent $0.50, you have $0.50 of finished
video.

If you generate ten 5-second clips and pick the best one, your
retake rate is 10.0. You spent $5.00, you have $0.50 of finished
video. The other $4.50 went into "I generated nine that didn't
work."

This number is **almost never 1.0** in real production. Even the
best AI video operators average 2-5x in image-to-video mode and
5-10x in text-to-video mode for premium client work.

## Why retake rate exists

Four reasons every generation might not be usable:

1. **The model misinterpreted the prompt.** You asked for a
   medium close-up; you got a wide. You asked for an orbit; you
   got a pan.
2. **The physics broke.** Fingers melt. Hair phases through a
   shoulder. A glass of water freezes mid-pour.
3. **The character drifted.** In a sequence, the same character
   needs to look like the same character. Sometimes the model
   gives you almost-the-same-person.
4. **The motion was wrong-paced.** You asked for a slow push-in;
   you got a fast one (or the move didn't happen at all).

The heavyweight models (Sora 2, Veo 3) fail less often. The
cheap-tier models (Hailuo, Vidu) fail more often. Higgsfield
lowers retake rate on *camera-control* failures specifically
(its whole product), but doesn't help with content failures.

## Working retake-rate estimates (mid-2026)

These are honest field numbers, not vendor marketing:

| Use | Workflow | Retake rate |
|---|---|---|
| Quick concept draft | T2V | 3.0x |
| Usable B-roll | T2V | 5.0x |
| Hero / brand shot | T2V | 10.0x |
| Quick concept draft | I2V | 1.5x |
| Usable B-roll | I2V | 2.5x |
| Hero / brand shot | I2V | 4.0x |
| Style transfer | V2V | 2.0x |

Three patterns worth internalizing:

- **I2V cuts retake rate roughly in half** vs T2V at every tier.
- **Hero shots cost 4x more than B-roll** in real spend, because
  the bar is higher.
- **Style transfer (V2V) is cheap on retakes** because the source
  video locks in the motion.

## The real cost formula

For a finished minute of video:

```
real_cost_per_minute = price_per_sec × 60 × retake_rate
```

Run the math for "60 seconds of hero brand shots, image-to-video,
on each model":

| Model | $/sec | Retake (I2V hero) | $/finished minute |
|---|---|---|---|
| Hailuo 02 | $0.045 | 4.0 | $10.80 |
| Veo 3.1 Lite (1080p) | $0.08 | 4.0 | $19.20 |
| Kling 3.0 standard | $0.084 | 4.0 | $20.16 |
| Sora 2 (720p) | $0.10 | 4.0 | $24.00 |
| Vidu Q3 | $0.07 | 4.0 | $16.80 |
| Sora 2 Pro (1024p) | $0.50 | 4.0 | $120.00 |
| Veo 3 with audio | $0.40 | 4.0 | $96.00 |

A 60-second hero piece on Veo 3 with audio at I2V retake rate
costs **$96 in raw API spend**. The Sora 2 Pro path is $120. The
Hailuo path is $10.80 — but the frame quality won't survive a
Super Bowl spot.

The retake rate alone is the difference between "viable" and
"not viable" for a lot of project ideas. Step 4 walks through a
60-second promo end-to-end across each model.

## Three honest lessons

1. **Always plan budget against `price × duration × retake`.**
   Never against the headline price alone.
2. **Retake rate is the single biggest variable you control.**
   I2V vs T2V is a 2x reduction. Hand-crafted shot lists
   (lesson 02) reduce retakes by another 30-50% on top of that.
3. **Cheap models look cheaper than they are when the retake
   rate is poor.** A model that fails 8x to deliver a usable
   shot is not cheaper than a model that fails 2x at higher
   per-second pricing. The retake math is what matters.

When somebody pitches you "AI video at $0.05/sec," ask:
**"What's the retake rate?"** If they don't have a number,
they haven't shipped.
